import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventStore } from '../../core/event-store';
import { HydrantInspectionsService } from './hydrant-inspections.service';

describe('HydrantInspectionsService (Regular-tier module)', () => {
  let store: InMemoryEventStore;
  let svc: HydrantInspectionsService;
  beforeEach(() => {
    store = new InMemoryEventStore();
    svc = new HydrantInspectionsService(store);
  });

  it('creates an inspection: appends to the Core and reads it back', async () => {
    const rec = await svc.create({ hydrant_id: 'H-12', operable: true, inspection_date: '2026-08-21' });
    expect(rec.id).toBeTruthy();
    expect(rec.data.hydrant_id).toBe('H-12');
    expect(svc.list()).toHaveLength(1);
    const all = await store.all();
    expect(all[0].source_type).toBe('hydrant.inspection.created');
    expect(all[0].correlation).toEqual({ hydrant_id: 'H-12' });
  });

  it('rebuilds its read model from the log on boot (durable across restart)', async () => {
    await svc.create({ hydrant_id: 'H-1' });
    await svc.create({ hydrant_id: 'H-2' });
    // Simulate a restart: a brand-new service instance sharing the same durable store.
    const svc2 = new HydrantInspectionsService(store);
    expect(svc2.list()).toHaveLength(0); // empty until bootstrap
    await svc2.onApplicationBootstrap();
    expect(svc2.list()).toHaveLength(2);
    expect(svc2.list().map((r) => r.data.hydrant_id).sort()).toEqual(['H-1', 'H-2']);
  });

  it('throws for an unknown id', () => {
    expect(() => svc.getOrThrow('nope')).toThrow();
  });
});
