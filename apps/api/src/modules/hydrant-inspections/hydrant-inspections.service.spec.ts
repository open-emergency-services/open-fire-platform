import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventStore } from '../../core/event-store';
import { HydrantInspectionsService } from './hydrant-inspections.service';

describe('HydrantInspectionsService (Regular-tier module, event-sourced CRUD)', () => {
  let store: InMemoryEventStore;
  let svc: HydrantInspectionsService;
  beforeEach(() => {
    store = new InMemoryEventStore();
    svc = new HydrantInspectionsService(store);
  });

  it('creates an inspection: appends to the Core and reads it back', async () => {
    const rec = await svc.create({ hydrant_id: 'H-12', operable: true, inspection_date: '2026-08-21' });
    expect(rec.id).toBeTruthy();
    expect(rec.version).toBe(1);
    expect(rec.data.hydrant_id).toBe('H-12');
    expect(svc.list()).toHaveLength(1);
    const all = await store.all();
    expect(all[0].source_type).toBe('hydrant.inspection.created');
  });

  it('edits via an appended event — the log is not mutated', async () => {
    const rec = await svc.create({ hydrant_id: 'H-12', operable: true });
    const upd = await svc.update(rec.id, { operable: false, notes: 'valve seized' });
    expect(upd.data.operable).toBe(false);
    expect(upd.data.notes).toBe('valve seized');
    expect(upd.data.hydrant_id).toBe('H-12'); // unchanged field preserved
    expect(upd.version).toBe(2);
    const all = await store.all();
    expect(all.map((e) => e.source_type)).toEqual(['hydrant.inspection.created', 'hydrant.inspection.updated']);
  });

  it('rejects an edit with a stale expected version (optimistic concurrency)', async () => {
    const rec = await svc.create({ hydrant_id: 'H-12' });
    await svc.update(rec.id, { notes: 'first' }); // now version 2
    await expect(svc.update(rec.id, { notes: 'second' }, 1)).rejects.toThrow(/version/i);
  });

  it('soft-deletes (tombstone): gone from the list, but history is preserved', async () => {
    const rec = await svc.create({ hydrant_id: 'H-99' });
    await svc.update(rec.id, { notes: 'checked' });
    await svc.remove(rec.id, undefined, 'created in error');
    expect(svc.list()).toHaveLength(0);
    expect(() => svc.getOrThrow(rec.id)).toThrow();
    const hist = await svc.history(rec.id);
    expect(hist.map((h) => h.type)).toEqual(['created', 'updated', 'deleted']);
  });

  it('rebuilds its read model from the log on boot (durable across restart)', async () => {
    const a = await svc.create({ hydrant_id: 'H-1' });
    await svc.create({ hydrant_id: 'H-2' });
    await svc.update(a.id, { operable: false });
    // Simulate a restart: a new instance over the same durable store.
    const svc2 = new HydrantInspectionsService(store);
    await svc2.onApplicationBootstrap();
    expect(svc2.list()).toHaveLength(2);
    expect(svc2.getOrThrow(a.id).data.operable).toBe(false);
    expect(svc2.getOrThrow(a.id).version).toBe(2);
  });

  it('throws for an unknown id', () => {
    expect(() => svc.getOrThrow('nope')).toThrow();
  });
});
