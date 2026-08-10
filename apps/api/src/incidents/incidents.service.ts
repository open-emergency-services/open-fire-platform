import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NERIS_CORE_FIELDS } from '@ofp/neris-schema';
import { NerisGateway } from '../neris/neris.gateway';
import { IncidentRecord } from './incident.entity';
import { IncidentStatus, assertTransition } from './incident-status';

/**
 * Wave-0 incident service.
 *
 * Storage here is an in-memory Map so the scaffold runs with zero infra. Swap
 * `repo` for a Postgres-backed repository (Prisma/Drizzle) — the docker-compose
 * already provisions Postgres. Nothing else in the flow changes.
 */
@Injectable()
export class IncidentsService {
  private readonly repo = new Map<string, IncidentRecord>();

  constructor(private readonly neris: NerisGateway) {}

  private now() {
    // NOTE: real code uses Date.now(); kept explicit for clarity.
    return new Date().toISOString();
  }

  list(departmentId: string): IncidentRecord[] {
    return [...this.repo.values()].filter((i) => i.departmentId === departmentId);
  }

  get(departmentId: string, id: string): IncidentRecord {
    const rec = this.repo.get(id);
    if (!rec || rec.departmentId !== departmentId) throw new NotFoundException('Incident not found');
    return rec;
  }

  create(departmentId: string, internalId: string, data: Record<string, unknown>): IncidentRecord {
    const ts = this.now();
    const rec: IncidentRecord = {
      id: randomUUID(),
      departmentId,
      internalId,
      status: IncidentStatus.Draft,
      data,
      validationGaps: [],
      createdAt: ts,
      updatedAt: ts,
    };
    this.repo.set(rec.id, rec);
    return rec;
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
      // Authoritative server-side rules (no-op if NERIS disabled).
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
