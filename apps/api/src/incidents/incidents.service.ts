import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NERIS_CORE_FIELDS } from '@ofp/neris-schema';
import { NerisGateway } from '../neris/neris.gateway';
import { EventStore } from '../core/event-store';
import { IncidentReadModel } from '../projections/incident-read-model';
import { Projector } from '../projections/projector';
import { IncidentRecord } from './incident.entity';
import { IncidentStatus, assertTransition } from './incident-status';

/**
 * Incident service — now event-sourced (ADR-0004/0006).
 *
 * Writes append to the Core event log (the source of truth); reads come from the
 * incident read model (a projection the projector builds from the log). `create`
 * is fully event-sourced. `validate`/`submit` still mutate the projected record
 * directly for Wave-0 — they'll append `incident.validated` / `incident.submitted`
 * events in a later slice; the important write paths (create + radio) go through
 * the log today.
 */
@Injectable()
export class IncidentsService {
  constructor(
    private readonly neris: NerisGateway,
    private readonly store: EventStore,
    private readonly readModel: IncidentReadModel,
    private readonly projector: Projector,
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

  /** Create an incident: append `incident.created` to the Core, then project it. */
  async create(departmentId: string, internalId: string, data: Record<string, unknown>): Promise<IncidentRecord> {
    const id = randomUUID();
    const ts = this.now();
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: 'incident.created',
      occurred_at: ts,
      raw: { id, departmentId, internalId, data },
      normalized: { id, departmentId, internalId, data },
      correlation: { incident_id: id },
    });
    this.projector.project(event);
    return this.readModel.getOrThrow(departmentId, id);
  }

  /** Local structural check: which minimal-record fields are still missing. */
  private computeGaps(data: Record<string, unknown>): string[] {
    return NERIS_CORE_FIELDS.filter((f) => {
      const v = (data as any)[f];
      return v === undefined || v === null || v === '';
    });
  }

  /** Local validation → optional server-side validation against NERIS. */
  async validate(departmentId: string, id: string, entityId: string): Promise<IncidentRecord> {
    const rec = this.get(departmentId, id);
    rec.validationGaps = this.computeGaps(rec.data);
    if (rec.validationGaps.length === 0) {
      await this.neris.validateIncident(entityId, rec.data);
      assertTransition(rec.status, IncidentStatus.Validated);
      rec.status = IncidentStatus.Validated;
    }
    rec.updatedAt = this.now();
    return rec;
  }

  /** Submit to NERIS. Idempotent on internalId; NERIS response is stored. */
  async submit(departmentId: string, id: string, entityId: string): Promise<IncidentRecord> {
    const rec = this.get(departmentId, id);
    if (rec.status === IncidentStatus.Draft) {
      throw new Error('Validate the incident before submitting.');
    }
    assertTransition(rec.status, IncidentStatus.Queued);
    rec.status = IncidentStatus.Queued;
    try {
      const response = await this.neris.createIncident(entityId, rec.data);
      assertTransition(rec.status, IncidentStatus.Submitted);
      rec.status = IncidentStatus.Submitted;
      rec.nerisResponse = response;
      rec.nerisId = (response as any)?.incident_neris_id ?? rec.nerisId;
      assertTransition(rec.status, IncidentStatus.Accepted);
      rec.status = IncidentStatus.Accepted;
    } catch (err: any) {
      rec.status = IncidentStatus.Submitted;
      assertTransition(rec.status, IncidentStatus.Rejected);
      rec.status = IncidentStatus.Rejected;
      rec.nerisResponse = { error: err.message, payload: err.payload };
    }
    rec.updatedAt = this.now();
    return rec;
  }

  /** Data ownership: full export of the department's records, always available. */
  export(departmentId: string): IncidentRecord[] {
    return this.list(departmentId);
  }
}
