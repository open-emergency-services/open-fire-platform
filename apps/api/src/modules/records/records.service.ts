import {
  ConflictException,
  GoneException,
  HttpException,
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
import { PiiVault } from '../../pii/pii-vault';
import { GenericRecord, HistoryEntry, Tombstone } from './records.entity';

// Per-module PII policy (ADR-0007/0009): these fields never enter the event log — they are
// stored in the PII vault and replaced by an opaque token. Extend as PII-bearing modules
// (personnel, patient/ePCR, …) are built.
const PII_FIELDS: Record<string, string[]> = {
  personnel: ['first_name', 'last_name', 'last_4_ssn', 'dob', 'race', 'gender'],
};

/** The PII policy, exposed so the UI can mark which fields are vaulted (ADR-0007/0009). */
export function piiFieldsFor(module: string): string[] {
  return PII_FIELDS[module] ?? [];
}

// A record in this module is a live incident the command board / SSE consumers should see.
const LIVE_INCIDENT_MODULE = 'incident-core';

export interface ParentRef { module: string; id: string; }

// Event type is `record.<module>.<verb>` — the module lives in the type and the correlation,
// so the immutable log stays the single source of truth for every module screen.
const VERBS = ['created', 'updated', 'deleted', 'pii_erased', 'locked', 'reopened'] as const;
function typeFor(module: string, verb: (typeof VERBS)[number]): string {
  return `record.${module}.${verb}`;
}
function parseType(sourceType: string): { module: string; verb: string } | null {
  const m = /^record\.(.+)\.(created|updated|deleted|pii_erased|locked|reopened)$/.exec(sourceType);
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
    // The PII vault (global). Present in production; modules with a PII policy require it.
    @Optional() private readonly pii?: PiiVault,
  ) {}

  /** Split a payload into vault-bound PII and the rest, per the module's PII policy. */
  private splitPii(module: string, data: Data): { pii: Data; rest: Data } {
    const fields = PII_FIELDS[module];
    if (!fields) return { pii: {}, rest: data };
    const pii: Data = {};
    const rest: Data = { ...data };
    for (const f of fields) {
      if (f in rest) { pii[f] = rest[f]; delete rest[f]; }
    }
    return { pii, rest };
  }

  /** Vault a subject's PII and return the log marker (or null when there's nothing/no vault). */
  private async vaultPut(subjectId: string, pii: Data): Promise<{ ref: string; fields: string[] } | null> {
    const fields = Object.keys(pii);
    if (!fields.length) return null;
    if (!this.pii) {
      this.log.warn(`No PII vault configured — refusing to write PII fields [${fields.join(', ')}] to the log`);
      return null; // caller falls back to storing full data only if there was no vault; see create/update
    }
    const ref = await this.pii.put(subjectId, pii);
    return { ref, fields };
  }

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
    // Integrity: a sub-record may only attach to a live parent in the SAME department — no
    // dangling or cross-tenant links.
    if (parent) {
      const p = this.model(parent.module).get(parent.id);
      if (!p || p.deleted || p.departmentId !== departmentId) {
        throw new NotFoundException(`Parent ${parent.module} record not found in this department`);
      }
    }
    const parentMeta = parent ? { parentId: parent.id, parentModule: parent.module } : {};
    // PII split: personal fields go to the vault, only a token enters the log (ADR-0007/0009).
    const { pii, rest } = this.splitPii(module, data);
    const piiMeta = await this.vaultPut(id, pii);
    const logData = piiMeta ? rest : data;
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: typeFor(module, 'created'),
      occurred_at: new Date().toISOString(),
      raw: { id, module, departmentId, data: logData, ...parentMeta, ...(piiMeta ? { pii: piiMeta } : {}) },
      normalized: { id, module, departmentId, data: logData, ...parentMeta, ...(piiMeta ? { pii: piiMeta } : {}) },
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
    this.assertUnlocked(rec);
    this.checkVersion(rec, expectedVersion);
    // PII changes: merge onto the vaulted PII (never into the log) and carry a fresh token.
    const { pii, rest } = this.splitPii(module, changes);
    let piiMeta: { ref: string; fields: string[] } | null = null;
    let logChanges = changes;
    if (Object.keys(pii).length && this.pii) {
      const current = rec.pii && !rec.pii.erased ? (await this.pii.get(rec.pii.ref)) ?? {} : {};
      piiMeta = await this.vaultPut(id, { ...current, ...pii });
      logChanges = rest;
    }
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: typeFor(module, 'updated'),
      occurred_at: new Date().toISOString(),
      raw: { id, module, changes: logChanges, reason, ...(piiMeta ? { pii: piiMeta } : {}) },
      normalized: { id, module, changes: logChanges, ...(reason ? { reason } : {}), ...(piiMeta ? { pii: piiMeta } : {}) },
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
    this.assertUnlocked(rec);
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

  /**
   * Right-to-erasure (ADR-0009): destroy a record's PII in the vault. The record and its
   * token survive in the log (audit intact) but the token now resolves to null. Distinct
   * from soft-delete: the record stays active, only the personal data is erased.
   */
  async erasePii(module: string, id: string, departmentId?: string): Promise<GenericRecord> {
    const rec = this.getOrThrow(module, id, departmentId);
    if (!rec.pii) return rec; // no PII on this record
    if (this.pii) await this.pii.erase(id);
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: typeFor(module, 'pii_erased'),
      occurred_at: new Date().toISOString(),
      raw: { id, module },
      normalized: { id, module },
      correlation: { record_id: id, module, department_id: rec.departmentId },
    });
    this.project(event, module);
    return this.getOrThrow(module, id);
  }

  /**
   * Read one record, optionally re-hydrating vaulted PII (authorized callers only). PII is
   * merged back into `data` for display; the log never held it. Erased/absent PII stays absent.
   */
  async read(module: string, id: string, departmentId?: string, revealPii = false): Promise<GenericRecord | Tombstone> {
    const rec = this.lookup(module, id, departmentId);
    if ('message' in rec) return rec; // tombstone (deleted)
    if (revealPii && rec.pii && !rec.pii.erased && this.pii) {
      const pii = await this.pii.get(rec.pii.ref);
      if (pii) return { ...rec, data: { ...rec.data, ...pii } };
    }
    return rec;
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

  /** Editability lifecycle (ADR-0007): a locked record refuses edits until reopened (423 Locked). */
  private assertUnlocked(rec: GenericRecord): void {
    if (rec.locked) throw new HttpException(`This ${rec.module} record is locked; reopen it before editing`, 423);
  }

  /** Lock (close) or reopen a record. Corrections to a locked record require a reopen first. */
  async setLock(module: string, id: string, locked: boolean, departmentId?: string): Promise<GenericRecord> {
    const rec = this.getOrThrow(module, id, departmentId);
    if (!!rec.locked === locked) return rec; // no-op
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: typeFor(module, locked ? 'locked' : 'reopened'),
      occurred_at: new Date().toISOString(),
      raw: { id, module },
      normalized: { id, module },
      correlation: { record_id: id, module, department_id: rec.departmentId },
    });
    this.project(event, module);
    return this.getOrThrow(module, id);
  }

  private project(e: StoredEvent, module: string): void {
    const n = e.normalized as {
      id: string; departmentId?: string; data?: Data; changes?: Data; reason?: string;
      parentId?: string; parentModule?: string; pii?: { ref: string; fields: string[] };
    };
    const ts = e.occurred_at ?? e.received_at;
    const model = this.model(module);
    if (e.source_type === typeFor(module, 'created')) {
      model.set(n.id, {
        id: n.id, module, departmentId: n.departmentId ?? DEFAULT_DEPT, data: n.data ?? {}, version: 1, deleted: false,
        ...(n.parentId ? { parentId: n.parentId, parentModule: n.parentModule } : {}),
        ...(n.pii ? { pii: n.pii } : {}),
        createdAt: ts, updatedAt: ts,
      });
    } else if (e.source_type === typeFor(module, 'updated')) {
      const rec = model.get(n.id);
      if (rec) {
        rec.data = { ...rec.data, ...(n.changes ?? {}) };
        if (n.pii) rec.pii = n.pii; // new vault token
        rec.version += 1; rec.updatedAt = ts;
      }
    } else if (e.source_type === typeFor(module, 'deleted')) {
      const rec = model.get(n.id);
      if (rec) { rec.deleted = true; rec.deletedAt = ts; rec.deletedReason = n.reason; rec.version += 1; rec.updatedAt = ts; }
    } else if (e.source_type === typeFor(module, 'pii_erased')) {
      const rec = model.get(n.id);
      if (rec && rec.pii) { rec.pii = { ...rec.pii, erased: true }; rec.version += 1; rec.updatedAt = ts; }
    } else if (e.source_type === typeFor(module, 'locked') || e.source_type === typeFor(module, 'reopened')) {
      const rec = model.get(n.id);
      if (rec) { rec.locked = e.source_type === typeFor(module, 'locked'); rec.version += 1; rec.updatedAt = ts; }
    }
  }
}
