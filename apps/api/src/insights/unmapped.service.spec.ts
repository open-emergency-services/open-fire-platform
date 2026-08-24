import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventStore } from '../core/event-store';
import { IngestService } from '../ingest/ingest.service';
import { UnmappedService } from './unmapped.service';

describe('UnmappedService (ADR-0006 unmapped-review surface)', () => {
  let store: InMemoryEventStore;
  let ingest: IngestService;
  let svc: UnmappedService;
  beforeEach(() => {
    store = new InMemoryEventStore();
    ingest = new IngestService(store);
    svc = new UnmappedService(store);
  });

  it('rolls up distinct unmapped keys per source, most-frequent first, with counts and shape', async () => {
    // cad sends lat/long every time — no slot for them yet
    await ingest.ingest({ source: 'cad', source_type: 'inc', raw: { address: 'A', lat: 1, long: 2 }, mapped_keys: ['address'] });
    await ingest.ingest({ source: 'cad', source_type: 'inc', raw: { address: 'B', lat: 3 }, mapped_keys: ['address'] });
    // a different source with a different unknown
    await ingest.ingest({ source: 'p25', source_type: 'radio', raw: { unit: '7', vendor_blob: { x: 1 } }, mapped_keys: ['unit'] });

    const rep = await svc.report();
    expect(rep.totalEvents).toBe(3);

    const cad = rep.sources.find((s) => s.source === 'cad')!;
    expect(cad.events).toBe(2);
    // lat seen twice, long once → lat first
    expect(cad.keys.map((k) => k.key)).toEqual(['lat', 'long']);
    expect(cad.keys[0]).toMatchObject({ key: 'lat', count: 2, sampleType: 'number' });
    expect(cad.keys[1]).toMatchObject({ key: 'long', count: 1 });

    const p25 = rep.sources.find((s) => s.source === 'p25')!;
    expect(p25.keys[0]).toMatchObject({ key: 'vendor_blob', count: 1, sampleType: 'object' });
    expect(rep.distinctKeys).toBe(3); // lat, long, vendor_blob
  });

  it('never echoes the unmapped values — only key, count, and JS type', async () => {
    await ingest.ingest({
      source: 'cad',
      source_type: 'inc',
      raw: { unit: '7', patient_name: 'Jane Doe' }, // unmapped free-text could be PII
      mapped_keys: ['unit'],
    });
    const rep = await svc.report();
    expect(JSON.stringify(rep)).not.toContain('Jane Doe');
    const cad = rep.sources.find((s) => s.source === 'cad')!;
    expect(cad.keys[0]).toMatchObject({ key: 'patient_name', sampleType: 'string' });
  });

  it('a fully-mapped source contributes no unmapped keys', async () => {
    await ingest.ingest({ source: 'clean', source_type: 't', raw: { a: 1 }, mapped_keys: ['a'] });
    const rep = await svc.report();
    expect(rep.sources.find((s) => s.source === 'clean')).toBeUndefined();
    expect(rep.distinctKeys).toBe(0);
  });
});
