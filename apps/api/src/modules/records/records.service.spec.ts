import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventStore } from '../../core/event-store';
import { EventPublisher } from '../../events/event-publisher';
import { ExternalizedPiiVault } from '../../pii/externalized-pii-vault';
import { RecordsService } from './records.service';
import { GenericRecord } from './records.entity';

describe('RecordsService (generic module engine)', () => {
  let store: InMemoryEventStore;
  let events: EventPublisher;
  let svc: RecordsService;
  beforeEach(() => {
    store = new InMemoryEventStore();
    events = new EventPublisher();
    svc = new RecordsService(store, events);
  });

  it('creates/edits/soft-deletes a record with full history, per module', async () => {
    const rec = await svc.create('fire', { fire_cause: 'electrical', sqft: 1200 });
    expect(rec.version).toBe(1);
    const upd = await svc.update('fire', rec.id, { sqft: 1500 });
    expect(upd.data.sqft).toBe(1500);
    expect(upd.data.fire_cause).toBe('electrical'); // unchanged field preserved
    expect(upd.version).toBe(2);
    await svc.remove('fire', rec.id, undefined, 'entered in error');
    expect(svc.list('fire')).toHaveLength(0);
    const t = svc.lookup('fire', rec.id) as { deleted: boolean; reason?: string };
    expect(t.deleted).toBe(true); // discoverable tombstone, not a 404
    expect(t.reason).toBe('entered in error');
    const hist = await svc.history('fire', rec.id);
    expect(hist.map((h) => h.type)).toEqual(['created', 'updated', 'deleted']);
  });

  it('keeps modules isolated (a record in one module is invisible to another)', async () => {
    await svc.create('fire', { a: 1 });
    await svc.create('community-event', { b: 2 });
    expect(svc.list('fire')).toHaveLength(1);
    expect(svc.list('community-event')).toHaveLength(1);
    expect(svc.list('medical')).toHaveLength(0);
  });

  it('is tenant-scoped: a department cannot see or read another department\'s records', async () => {
    const a = await svc.create('fire', { x: 1 }, { departmentId: 'DEPT_A' });
    await svc.create('fire', { x: 2 }, { departmentId: 'DEPT_B' });
    expect(a.departmentId).toBe('DEPT_A');
    expect(svc.list('fire', false, undefined, 'DEPT_A')).toHaveLength(1);
    expect(svc.list('fire', false, undefined, 'DEPT_B')).toHaveLength(1);
    // DEPT_B looking up DEPT_A's record: indistinguishable from never-existed
    expect(() => svc.lookup('fire', a.id, 'DEPT_B')).toThrow(/ever existed/i);
    expect(svc.lookup('fire', a.id, 'DEPT_A')).toBeTruthy();
    // and cannot edit it
    await expect(svc.update('fire', a.id, { x: 9 }, undefined, undefined, 'DEPT_B')).rejects.toThrow(/not found/i);
  });

  it('vaults PII for personnel: no plaintext in the log, re-hydrate on read, erase destroys it', async () => {
    const vault = new ExternalizedPiiVault();
    const svc2 = new RecordsService(store, events, undefined, vault);
    const rec = await svc2.create('personnel', {
      first_name: 'Jane', last_name: 'Doe', dob: '1990-01-01', station_assignment: 'Station 1',
    });
    // read model holds no PII — only a token + the non-PII fields
    expect(rec.data.first_name).toBeUndefined();
    expect(rec.data.station_assignment).toBe('Station 1');
    expect(rec.pii?.fields).toContain('first_name');
    // the immutable log contains NO plaintext PII
    const created = (await store.all()).find((e) => e.source_type === 'record.personnel.created')!;
    expect(JSON.stringify(created.raw)).not.toContain('Jane');
    expect(JSON.stringify(created.normalized)).not.toContain('Doe');
    // officer read re-hydrates; non-officer read omits PII
    const revealed = (await svc2.read('personnel', rec.id, undefined, true)) as GenericRecord;
    expect(revealed.data.first_name).toBe('Jane');
    const masked = (await svc2.read('personnel', rec.id, undefined, false)) as GenericRecord;
    expect(masked.data.first_name).toBeUndefined();
    // right-to-erasure: PII destroyed, record + token survive, token resolves to null
    await svc2.erasePii('personnel', rec.id);
    const after = (await svc2.read('personnel', rec.id, undefined, true)) as GenericRecord;
    expect(after.pii?.erased).toBe(true);
    expect(after.data.first_name).toBeUndefined();
    expect(svc2.getOrThrow('personnel', rec.id)).toBeTruthy(); // the record itself still exists
    expect(await vault.get(rec.pii!.ref)).toBeNull();
  });

  it('treats last_4_ssn as vaulted PII for personnel (never in the log)', async () => {
    const vault = new ExternalizedPiiVault();
    const svc2 = new RecordsService(store, events, undefined, vault);
    const rec = await svc2.create('personnel', { first_name: 'Sam', last_4_ssn: 6789, station_assignment: 'S3' });
    expect(rec.data.last_4_ssn).toBeUndefined();
    expect(rec.pii?.fields).toContain('last_4_ssn');
    const created = (await store.all()).find((e) => e.source_type === 'record.personnel.created')!;
    expect(JSON.stringify(created.raw)).not.toContain('6789');
    const revealed = (await svc2.read('personnel', rec.id, undefined, true)) as GenericRecord;
    expect(revealed.data.last_4_ssn).toBe(6789);
  });

  it('rebuilds vaulted personnel from the log — the token survives replay', async () => {
    const vault = new ExternalizedPiiVault();
    const a = new RecordsService(store, events, undefined, vault);
    const rec = await a.create('personnel', { first_name: 'Ann', last_name: 'Lee' });
    const b = new RecordsService(store, events, undefined, vault);
    await b.onApplicationBootstrap();
    const r2 = (await b.read('personnel', rec.id, undefined, true)) as GenericRecord;
    expect(r2.pii?.ref).toBe(rec.pii?.ref);
    expect(r2.data.first_name).toBe('Ann');
  });

  it('locks a record: edits/deletes refused until reopened (editability lifecycle)', async () => {
    const rec = await svc.create('fire', { fire_cause: 'electrical' });
    await svc.setLock('fire', rec.id, true);
    await expect(svc.update('fire', rec.id, { fire_cause: 'other' })).rejects.toThrow(/locked/i);
    await expect(svc.remove('fire', rec.id)).rejects.toThrow(/locked/i);
    await svc.setLock('fire', rec.id, false); // reopen
    const upd = await svc.update('fire', rec.id, { fire_cause: 'other' });
    expect(upd.data.fire_cause).toBe('other');
    // lock state survives replay
    const svc2 = new RecordsService(store, events, undefined);
    await svc2.onApplicationBootstrap();
    await svc2.setLock('fire', rec.id, true);
    const svc3 = new RecordsService(store, events, undefined);
    await svc3.onApplicationBootstrap();
    expect(svc3.getOrThrow('fire', rec.id).locked).toBe(true);
  });

  it('rejects a sub-record whose parent is missing or in another department', async () => {
    const inc = await svc.create('incident-core', { incident_internal_id: 'X' }, { departmentId: 'DEPT_A' });
    // dangling parent
    await expect(
      svc.create('fire', { a: 1 }, { departmentId: 'DEPT_A', parent: { module: 'incident-core', id: 'nope' } }),
    ).rejects.toThrow(/not found/i);
    // cross-tenant parent
    await expect(
      svc.create('fire', { a: 1 }, { departmentId: 'DEPT_B', parent: { module: 'incident-core', id: inc.id } }),
    ).rejects.toThrow(/not found/i);
    // valid parent, same dept
    const ok = await svc.create('fire', { a: 1 }, { departmentId: 'DEPT_A', parent: { module: 'incident-core', id: inc.id } });
    expect(ok.parentId).toBe(inc.id);
  });

  it('rejects a stale edit (optimistic concurrency)', async () => {
    const rec = await svc.create('medical', { x: 1 });
    await svc.update('medical', rec.id, { x: 2 }); // now v2
    await expect(svc.update('medical', rec.id, { x: 3 }, 1)).rejects.toThrow(/version/i);
  });

  it('links a sub-record to its parent and filters by it, surviving rebuild', async () => {
    const incident = await svc.create('incident-core', { incident_internal_id: 'RUN-1' });
    const fireA = await svc.create('fire', { fire_cause: 'electrical' }, { parent: { module: 'incident-core', id: incident.id } });
    await svc.create('fire', { fire_cause: 'other' }); // unrelated, no parent
    expect(fireA.parentId).toBe(incident.id);
    expect(svc.list('fire', false, incident.id)).toHaveLength(1);
    // rebuild keeps the linkage
    const svc2 = new RecordsService(store, events);
    await svc2.onApplicationBootstrap();
    expect(svc2.list('fire', false, incident.id)).toHaveLength(1);
    expect(svc2.getOrThrow('fire', fireA.id).parentModule).toBe('incident-core');
  });

  it('publishes a live event when an incident-core record is created', async () => {
    const seen: string[] = [];
    events.live().subscribe((e) => seen.push(e.type));
    await svc.create('incident-core', { incident_internal_id: 'RUN-9' });
    await svc.create('fire', { fire_cause: 'x' }); // non-incident: no live event
    expect(seen).toContain('incident.declared');
    expect(seen.filter((t) => t === 'incident.declared')).toHaveLength(1);
  });

  it('rebuilds every module read model from the log on boot', async () => {
    const a = await svc.create('fire', { n: 1 });
    await svc.create('weather', { temp: 70 });
    await svc.update('fire', a.id, { n: 2 });
    const svc2 = new RecordsService(store, events);
    await svc2.onApplicationBootstrap();
    expect(svc2.list('fire')).toHaveLength(1);
    expect(svc2.list('weather')).toHaveLength(1);
    expect(svc2.getOrThrow('fire', a.id).data.n).toBe(2);
    expect(svc2.getOrThrow('fire', a.id).version).toBe(2);
  });
});
