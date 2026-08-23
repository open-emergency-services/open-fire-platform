import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NERIS_CORE_FIELDS } from '@ofp/neris-schema';
import { NerisGateway } from '../neris/neris.gateway';
import { EventStore } from '../core/event-store';
import { IncidentReadModel } from '../projections/incident-read-model';
import { Projector } from '../projections/projector';
import { RecordsService } from '../modules/records/records.service';
import { IncidentRecord } from './incident.entity';
import { IncidentStatus, assertTransition } from './incident-status';

/**
 * Incident service — fully event-sourced (ADR-0004/0006/0007).
 *
 * Every write appends to the Core event log (the source of truth); reads come from the
 * one incident read model the projector builds from the log. `create` delegates to the
 * generic records engine (an incident IS an `incident-core` record); `validate` and
 * `submit` append `incident.validated` / `incident.submitted` events that the projector
 * folds in. Nothing mutates the read model directly, so the entire incident lifecycle —
 * created → validated → submitted (accepted/rejected) — is derivable from the log and
 * shows up in the record's audit trail.
 */
@Injectable()
export class IncidentsService {
  constructor(
    private readonly neris: NerisGateway,
    private readonly store: EventStore,
    private readonly readModel: IncidentReadModel,
    private readonly projector: Projector,
    private readonly records: RecordsService,
  ) {}

  private now() {
    return new Date().toISOString();
  }

  list(departmentId: string): IncidentRecord[] {
    return this.readModel.list(departmentId);
  }

  get(departmentId: string, id: string): IncidentRecord {
    return this.readModel.getOrThrow(departmentId, id);
  }

  /**
   * Create an incident through the single canonical write path: an incident IS an
   * `incident-core` record (ADR-0004/0007). This appends `record.incident-core.created`,
   * which the projector folds into the one incident read model — the same record the
   * incident-record screen and radio correlation use. No separate `incident.created`.
   */
  async create(departmentId: string, internalId: string, data: Record<string, unknown>): Promise<IncidentRecord> {
    const rec = await this.records.create(
      'incident-core',
      { ...data, incident_internal_id: internalId },
      { departmentId },
    );
    return this.readModel.getOrThrow(departmentId, rec.id);
  }

  /** Local structural check: which minimal-record fields are still missing. */
  private computeGaps(data: Record<string, unknown>): string[] {
    return NERIS_CORE_FIELDS.filter((f) => {
      const v = (data as any)[f];
      return v === undefined || v === null || v === '';
    });
  }

  /**
   * Local validation → optional server-side validation against NERIS. Event-sourced:
   * appends `incident.validated` (gaps + resulting status); the projector applies it.
   * The read model is never mutated directly — the log is the source of truth (ADR-0004/0007).
   */
  async validate(departmentId: string, id: string, entityId: string): Promise<IncidentRecord> {
    const rec = this.get(departmentId, id);
    const validationGaps = this.computeGaps(rec.data);
    let status = rec.status;
    if (validationGaps.length === 0) {
      await this.neris.validateIncident(entityId, rec.data);
      assertTransition(rec.status, IncidentStatus.Validated);
      status = IncidentStatus.Validated;
    }
    await this.appendIncidentEvent('incident.validated', id, departmentId, { status, validationGaps });
    return this.readModel.getOrThrow(departmentId, id);
  }

  /**
   * Submit to NERIS, then event-source the outcome as a single `incident.submitted`
   * event carrying the resulting status (accepted/rejected) + the NERIS response. The
   * state-machine transitions are asserted here before the event is persisted; the
   * projector reflects the committed outcome. Idempotent on internalId at the NERIS edge.
   */
  async submit(departmentId: string, id: string, entityId: string): Promise<IncidentRecord> {
    const rec = this.get(departmentId, id);
    if (rec.status === IncidentStatus.Draft) {
      throw new Error('Validate the incident before submitting.');
    }
    assertTransition(rec.status, IncidentStatus.Queued); // must be Validated to queue
    let status: IncidentStatus;
    let nerisId: string | undefined;
    let nerisResponse: unknown;
    try {
      const response = await this.neris.createIncident(entityId, rec.data);
      status = IncidentStatus.Accepted;
      nerisId = (response as any)?.incident_neris_id ?? undefined;
      nerisResponse = response;
    } catch (err: any) {
      status = IncidentStatus.Rejected;
      nerisResponse = { error: err.message, payload: err.payload };
    }
    await this.appendIncidentEvent('incident.submitted', id, departmentId, { status, nerisId, nerisResponse });
    return this.readModel.getOrThrow(departmentId, id);
  }

  /** Append an incident lifecycle event to the Core and project it (shared by validate/submit). */
  private async appendIncidentEvent(
    type: 'incident.validated' | 'incident.submitted',
    id: string,
    departmentId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: type,
      occurred_at: this.now(),
      raw: { id, departmentId, ...payload },
      normalized: { id, ...payload },
      // both keys: incident_id (radio/read-model correlation) + record_id (so the event
      // shows up in the incident-core record's own audit trail).
      correlation: { incident_id: id, record_id: id },
    });
    this.projector.project(event);
  }

  /** Data ownership: full export of the department's records, always available. */
  export(departmentId: string): IncidentRecord[] {
    return this.list(departmentId);
  }
}
