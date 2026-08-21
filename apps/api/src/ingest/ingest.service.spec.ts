import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventStore } from '../core/event-store';
import { IngestService } from './ingest.service';

describe('IngestService (Essential ingest)', () => {
  let store: InMemoryEventStore;
  let ingest: IngestService;
  beforeEach(() => {
    store = new InMemoryEventStore();
    ingest = new IngestService(store);
  });

  it('appends any well-formed event to the Core and returns its seq', async () => {
    const r = await ingest.ingest({ source: 'cad', source_type: 'incident.update', raw: { foo: 1 } });
    expect(r.seq).toBe(1);
    expect(r.duplicate).toBe(false);
    expect((await store.all())[0].raw).toEqual({ foo: 1 });
  });

  it('is idempotent on event_id', async () => {
    await ingest.ingest({ event_id: 'x', source: 's', source_type: 't', raw: { a: 1 } });
    const again = await ingest.ingest({ event_id: 'x', source: 's', source_type: 't', raw: { a: 2 } });
    expect(again.duplicate).toBe(true);
    expect(again.seq).toBe(1);
  });

  it('captures everything: unmapped fields land in raw and unmapped', async () => {
    await ingest.ingest({ source: 'x', source_type: 'y', raw: { address: '1 Main', lat: 42.1 }, mapped_keys: ['address'] });
    const e = (await store.all())[0];
    expect(e.raw).toEqual({ address: '1 Main', lat: 42.1 });
    expect(e.normalized).toEqual({ address: '1 Main' });
    expect(e.unmapped).toEqual({ lat: 42.1 });
  });

  it('rejects a body missing source or raw', async () => {
    await expect(ingest.ingest({ raw: { a: 1 } } as any)).rejects.toThrow();
    await expect(ingest.ingest({ source: 's', source_type: 't' } as any)).rejects.toThrow();
  });
});
