import {
  ConflictException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NerisHydrantInspection } from '@ofp/neris-schema';
import { EventStore } from '../../core/event-store';
import { StoredEvent } from '../../core/stored-event';
import { HistoryEntry, HydrantInspectionRecord, Tombstone } from './hydrant-inspection.entity';

const CREATED = 'hydrant.inspection.created';
const UPDATED = 'hydrant.inspection.updated';
const DELETED = 'hydrant.inspection.deleted';
const TYPES = new Set([CREATED, UPDATED, DELETED]);

/**
 * Hydrant inspections — the Regular-tier reference module (ADR-0005) and the CRUD-on-
 * event-sourcing template (ADR-0007). Create/update/delete each append an event; the
 * log is never mutated. An edit is an `updated` event merged onto the read model; a
 * delete is a `deleted` tombstone. `history()` returns the full audit trail. Optimistic
 * concurrency via `version`. On boot the read model rebuilds from the durable log.
 */
@Injectable()
export class HydrantInspectionsService implements OnApplicationBootstrap {
  private readonly log = new Logger('HydrantInspections');
  private readonly readModel = new Map<string, HydrantInspectionRecord>();

  constructor(private readonly store: EventStore) {}

  async onApplicationBootstrap(): Promise<void> {
    this.readModel.clear();
    for (const e of await this.store.all()) if (TYPES.has(e.source_type)) this.project(e);
    if (this.readModel.size) this.log.log(`Rebuilt ${this.readModel.size} hydrant inspections from the log.`);
  }

  async create(data: Partial<NerisHydrantInspection>): Promise<HydrantInspectionRecord> {
    const id = randomUUID();
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: CREATED,
      occurred_at: new Date().toISOString(),
      raw: { id, data },
      normalized: { id, data },
      correlation: { record_id: id, ...(data.hydrant_id ? { hydrant_id: data.hydrant_id } : {}) },
    });
    this.project(event);
    return this.getOrThrow(id);
  }

  /** Edit = append an `updated` event with the changed fields (ADR-0007). */
  async update(
    id: string,
    changes: Partial<NerisHydrantInspection>,
    expectedVersion?: number,
    reason?: string,
  ): Promise<HydrantInspectionRecord> {
    const rec = this.getOrThrow(id);
    this.checkVersion(rec, expectedVersion);
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: UPDATED,
      occurred_at: new Date().toISOString(),
      raw: { id, changes, reason },
      normalized: { id, changes, ...(reason ? { reason } : {}) },
      correlation: { record_id: id },
    });
    this.project(event);
    return this.getOrThrow(id);
  }

  /** Delete = append a tombstone (soft delete); history stays in the log (ADR-0007). */
  async remove(id: string, expectedVersion?: number, reason?: string): Promise<void> {
    const rec = this.getOrThrow(id);
    this.checkVersion(rec, expectedVersion);
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: DELETED,
      occurred_at: new Date().toISOString(),
      raw: { id, reason },
      normalized: { id, ...(reason ? { reason } : {}) },
      correlation: { record_id: id },
    });
    this.project(event);
  }

  /** Full ordered audit trail for a record — including deleted ones (ADR-0007). */
  async history(id: string): Promise<HistoryEntry[]> {
    const events = await this.store.byCorrelation('record_id', id);
    return events.map((e) => ({
      seq: e.seq,
      type: e.source_type.replace('hydrant.inspection.', ''),
      at: e.occurred_at ?? e.received_at,
      by: e.source,
      changes: (e.normalized as Record<string, unknown>) ?? {},
    }));
  }

  list(includeDeleted = false): HydrantInspectionRecord[] {
    const all = [...this.readModel.values()];
    return includeDeleted ? all : all.filter((r) => !r.deleted);
  }

  /**
   * Read one record for display. Three distinct outcomes (ADR-0007) — the whole point is
   * that a caller can tell them apart:
   *   - active record  → the live record
   *   - deleted record → a {@link Tombstone}: "this existed and was voided," + history pointer
   *   - never existed  → 404
   * An event-id / record-id lookup therefore always resolves to *something* if the id was
   * ever real, instead of a bare 404 that can't distinguish voided from never-reported.
   */
  lookup(id: string): HydrantInspectionRecord | Tombstone {
    const rec = this.readModel.get(id);
    if (!rec) throw new NotFoundException('No hydrant inspection has ever existed with this id');
    return rec.deleted ? this.tombstone(rec) : rec;
  }

  private tombstone(rec: HydrantInspectionRecord): Tombstone {
    return {
      id: rec.id,
      deleted: true,
      deletedAt: rec.deletedAt,
      reason: rec.deletedReason,
      version: rec.version,
      createdAt: rec.createdAt,
      message: 'This record was deleted. It existed and was voided; its full history is retained in the log.',
      history: `/api/v1/hydrant-inspections/${rec.id}/history`,
    };
  }

  /**
   * Strict fetch of a *live* record, for the write path. A deleted record is `410 Gone`
   * (it existed, you can't edit it) — deliberately not `404`, which would wrongly imply it
   * never existed. A genuinely unknown id is `404`.
   */
  getOrThrow(id: string): HydrantInspectionRecord {
    const rec = this.readModel.get(id);
    if (!rec) throw new NotFoundException('Hydrant inspection not found');
    if (rec.deleted) throw new GoneException('This hydrant inspection was deleted and can no longer be edited');
    return rec;
  }

  private checkVersion(rec: HydrantInspectionRecord, expected?: number): void {
    if (expected != null && rec.version !== expected) {
      throw new ConflictException(`Version conflict: expected ${expected}, current ${rec.version}`);
    }
  }

  /** Apply one committed event to the read model. */
  private project(e: StoredEvent): void {
    const n = e.normalized as {
      id: string;
      data?: Partial<NerisHydrantInspection>;
      changes?: Partial<NerisHydrantInspection>;
      reason?: string;
    };
    const ts = e.occurred_at ?? e.received_at;
    if (e.source_type === CREATED) {
      this.readModel.set(n.id, { id: n.id, data: n.data ?? {}, version: 1, deleted: false, createdAt: ts, updatedAt: ts });
    } else if (e.source_type === UPDATED) {
      const rec = this.readModel.get(n.id);
      if (rec) { rec.data = { ...rec.data, ...(n.changes ?? {}) }; rec.version += 1; rec.updatedAt = ts; }
    } else if (e.source_type === DELETED) {
      const rec = this.readModel.get(n.id);
      // Void, don't erase: keep the row so a lookup can still report it existed (ADR-0007).
      if (rec) { rec.deleted = true; rec.deletedAt = ts; rec.deletedReason = n.reason; rec.version += 1; rec.updatedAt = ts; }
    }
  }
}
