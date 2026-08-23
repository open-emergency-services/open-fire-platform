import {
  ConflictException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventStore } from '../../core/event-store';
import { StoredEvent } from '../../core/stored-event';
import { EventPublisher } from '../../events/event-publisher';
import { Projector } from '../../projections/projector';
import { GenericRecord, HistoryEntry, Tombstone } from './records.entity';

// A record in this module is a live incident the command board / SSE consumers should see.
const LIVE_INCIDENT_MODULE = 'incident-core';

export interface ParentRef { module: string; id: string; }

// Event type is `record.<module>.<verb>` — the module lives in the type and the correlation,
// so the immutable log stays the single source of truth for every module screen.
const VERBS = ['created', 'updated', 'deleted'] as const;
function typeFor(module: string, verb: (typeof VERBS)[number]): string {
  return `record.${module}.${verb}`;
}
function parseType(sourceType: string): { module: string; verb: string } | null {
  const m = /^record\.(.+)\.(created|updated|deleted)$/.exec(sourceType);
  return m ? { module: m[1], verb: m[2] } : null;
}

type Data = Record<string, unknown>;

const DEFAULT_DEPT = 'DEMO_DEPT';
export interface CreateOpts { parent?: ParentRef; departmentId?: string; }

/**
 * Generic Regular-tier CRUD-on-event-sourcing engine shared by every module screen.
 * Same guarantees as the hydrant reference module (ADR-0007): edit = appended event,
 * delete = tombstone (voided but discoverable), full history, optimistic concurrency,
 * read model rebuilt from the durable log on boot. `module` scopes each record set.
 */
@Injectable()
export class RecordsService implements OnApplicationBootstrap {
  private readonly log = new Logger('Records');
  // module -> (id -> record)
  private readonly models = new Map<string, Map<string, GenericRecord>>();

  constructor(
    private readonly store: EventStore,
    private readonly events: EventPublisher,
    // Optional so unit tests can construct the service standalone; wired in production so an
    // incident-core record lands in the one canonical incident read model (/api/v1/incidents).
    @Optional() private readonly projector?: Projector,
  ) {}

  /** Feed an incident-core event into the incident read model live (parity with boot rebuild). */
  private projectIncident(module: string, event: StoredEvent): void {
    if (module === LIVE_INCIDENT_MODULE) this.projector?.project(event);
  }

  private model(module: string): Map<string, GenericRecord> {
    let m = this.models.get(module);
    if (!m) {
      m = new Map();
      this.models.set(module, m);
    }
    return m;
  }

  async onApplicationBootstrap(): Promise<void> {
    this.models.clear();
    for (const e of await this.store.all()) {
      const p = parseType(e.source_type);
      if (p) this.project(e, p.module);
    }
    let n = 0;
    this.models.forEach((m) => (n += m.size));
    if (n) this.log.log(`Rebuilt ${n} records across ${this.models.size} modules from the log.`);
  }

  async create(module: string, data: Data, opts?: CreateOpts): Promise<GenericRecord> {
    const id = randomUUID();
    const parent = opts?.parent;
    const departmentId = opts?.departmentId ?? DEFAULT_DEPT;
    const parentMeta = parent ? { parentId: parent.id, parentModule: parent.module } : {};
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: typeFor(module, 'created'),
      occurred_at: new Date().toISOString(),
      raw: { id, module, departmentId, data, ...parentMeta },
      normalized: { id, module, departmentId, data, ...parentMeta },
      correlation: { record_id: id, module, department_id: departmentId, ...(parent ? { parent_id: parent.id } : {}) },
    });
    this.project(event, module);
    this.projectIncident(module, event);
    const rec = this.getOrThrow(module, id);
    this.publishLive('incident.declared', rec);
    return rec;
  }

  /** Bridge the incident-record screen into the live pipeline the command board reads (ADR-0002). */
  private publishLive(type: string, rec: GenericRecord): void {
    if (rec.module !== LIVE_INCIDENT_MODULE) return;
    const d = rec.data as Record<string, unknown>;
    const ft = d.incident_final_type;
    const incidentType = Array.isArray(ft) ? ft.flat().filter(Boolean).join(' / ') : (d.incident_type as string) || 'Incident';
    this.events.publish({
      type,
      departmentId: rec.departmentId, // dept-scoped so only that department's clients see it
      incidentId: rec.id,
      priority: 'info',
      payload: {
        id: rec.id,
        incidentType,
        address: (d.address as string) || (d.incident_internal_id as string) || rec.id,
      },
    });
  }

  async update(module: string, id: string, changes: Data, expectedVersion?: number, reason?: string, departmentId?: string): Promise<GenericRecord> {
    const rec = this.getOrThrow(module, id, departmentId);
    this.checkVersion(rec, expectedVersion);
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: typeFor(module, 'updated'),
      occurred_at: new Date().toISOString(),
      raw: { id, module, changes, reason },
      normalized: { id, module, changes, ...(reason ? { reason } : {}) },
      correlation: { record_id: id, module },
    });
    this.project(event, module);
    this.projectIncident(module, event);
    const saved = this.getOrThrow(module, id);
    this.publishLive('incident.updated', saved);
    return saved;
  }

  async remove(module: string, id: string, expectedVersion?: number, reason?: string, departmentId?: string): Promise<void> {
    const rec = this.getOrThrow(module, id, departmentId);
    this.checkVersion(rec, expectedVersion);
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: typeFor(module, 'deleted'),
      occurred_at: new Date().toISOString(),
      raw: { id, module, reason },
      normalized: { id, module, ...(reason ? { reason } : {}) },
      correlation: { record_id: id, module },
    });
    this.project(event, module);
    this.projectIncident(module, event);
  }

  async history(module: string, id: string): Promise<HistoryEntry[]> {
    const events = await this.store.byCorrelation('record_id', id);
    const prefix = `record.${module}.`;
    return events.map((e) => ({
      seq: e.seq,
      type: e.source_type.startsWith(prefix) ? e.source_type.slice(prefix.length) : e.source_type,
      at: e.occurred_at ?? e.received_at,
      by: e.source,
      changes: (e.normalized as Record<string, unknown>) ?? {},
    }));
  }

  list(module: string, includeDeleted = false, parentId?: string, departmentId?: string): GenericRecord[] {
    let all = [...this.model(module).values()];
    if (departmentId) all = all.filter((r) => r.departmentId === departmentId); // tenant isolation
    if (parentId) all = all.filter((r) => r.parentId === parentId);
    return includeDeleted ? all : all.filter((r) => !r.deleted);
  }

  lookup(module: string, id: string, departmentId?: string): GenericRecord | Tombstone {
    const rec = this.model(module).get(id);
    // A record in another department is indistinguishable from one that never existed.
    if (!rec || (departmentId && rec.departmentId !== departmentId)) {
      throw new NotFoundException(`No ${module} record has ever existed with this id`);
    }
    return rec.deleted ? this.tombstone(rec) : rec;
  }

  private tombstone(rec: GenericRecord): Tombstone {
    return {
      id: rec.id,
      module: rec.module,
      deleted: true,
      deletedAt: rec.deletedAt,
      reason: rec.deletedReason,
      version: rec.version,
      createdAt: rec.createdAt,
      message: 'This record was deleted. It existed and was voided; its full history is retained in the log.',
      history: `/api/v1/records/${rec.module}/${rec.id}/history`,
    };
  }

  getOrThrow(module: string, id: string, departmentId?: string): GenericRecord {
    const rec = this.model(module).get(id);
    if (!rec || (departmentId && rec.departmentId !== departmentId)) {
      throw new NotFoundException(`${module} record not found`);
    }
    if (rec.deleted) throw new GoneException(`This ${module} record was deleted and can no longer be edited`);
    return rec;
  }

  private checkVersion(rec: GenericRecord, expected?: number): void {
    if (expected != null && rec.version !== expected) {
      throw new ConflictException(`Version conflict: expected ${expected}, current ${rec.version}`);
    }
  }

  private project(e: StoredEvent, module: string): void {
    const n = e.normalized as { id: string; departmentId?: string; data?: Data; changes?: Data; reason?: string; parentId?: string; parentModule?: string };
    const ts = e.occurred_at ?? e.received_at;
    const model = this.model(module);
    if (e.source_type === typeFor(module, 'created')) {
      model.set(n.id, {
        id: n.id, module, departmentId: n.departmentId ?? DEFAULT_DEPT, data: n.data ?? {}, version: 1, deleted: false,
        ...(n.parentId ? { parentId: n.parentId, parentModule: n.parentModule } : {}),
        createdAt: ts, updatedAt: ts,
      });
    } else if (e.source_type === typeFor(module, 'updated')) {
      const rec = model.get(n.id);
      if (rec) { rec.data = { ...rec.data, ...(n.changes ?? {}) }; rec.version += 1; rec.updatedAt = ts; }
    } else if (e.source_type === typeFor(module, 'deleted')) {
      const rec = model.get(n.id);
      if (rec) { rec.deleted = true; rec.deletedAt = ts; rec.deletedReason = n.reason; rec.version += 1; rec.updatedAt = ts; }
    }
  }
}
