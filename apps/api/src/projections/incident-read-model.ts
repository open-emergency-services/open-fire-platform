import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentRecord } from '../incidents/incident.entity';

/**
 * The incident read model — a projection derived from the Core event log (ADR-0004).
 *
 * This is NOT the source of truth; the event log is. The projector rebuilds this from
 * the log, so it can be cleared and reconstructed at any time. Wave-0 keeps it in
 * memory; a real deployment backs it with the read-model database (Postgres replica).
 */
@Injectable()
export class IncidentReadModel {
  private readonly repo = new Map<string, IncidentRecord>();

  get(id: string): IncidentRecord | undefined {
    return this.repo.get(id);
  }

  getOrThrow(departmentId: string, id: string): IncidentRecord {
    const rec = this.repo.get(id);
    if (!rec || rec.departmentId !== departmentId) throw new NotFoundException('Incident not found');
    return rec;
  }

  list(departmentId: string): IncidentRecord[] {
    return [...this.repo.values()].filter((i) => i.departmentId === departmentId);
  }

  put(rec: IncidentRecord): void {
    this.repo.set(rec.id, rec);
  }

  clear(): void {
    this.repo.clear();
  }
}
