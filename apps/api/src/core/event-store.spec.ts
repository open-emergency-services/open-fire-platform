import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventStore } from './event-store';
import { losslessEvent } from './stored-event';

/**
 * Core event-store behavior + the ADR-0006 capture-everything guarantee.
 */
describe('EventStore (Core append-only log)', () => {
  let store: InMemoryEventStore;
  beforeEach(() => {
    store = new InMemoryEventStore();
  });

  const base = (over: Record<string, unknown> = {}) => ({
    event_id: 'e1',
    source: 'cad',
    source_type: 'incident.created',
    raw: { a: 1 },
    ...over,
  });

  it('appends and assigns a monotonic seq; reads by cursor', async () => {
    const r1 = await store.append(base({ event_id: 'a', raw: { x: 1 } }));
    const r2 = await store.append(base({ event_id: 'b', raw: { x: 2 } }));
    expect(r1.event.seq).toBe(1);
    expect(r2.event.seq).toBe(2);
    const sinceZero = await store.since(0);
    expect(sinceZero.map((e) => e.event_id)).toEqual(['a', 'b']);
    const sinceOne = await store.since(1);
    expect(sinceOne.map((e) => e.event_id)).toEqual(['b']);
    expect(await store.head()).toBe(2);
  });

  it('is idempotent on event_id: a repeat returns the stored event, no new seq', async () => {
    const first = await store.append(base({ event_id: 'dupe', raw: { v: 1 } }));
    const again = await store.append(base({ event_id: 'dupe', raw: { v: 999 } }));
    expect(again.duplicate).toBe(true);
    expect(again.event.seq).toBe(first.event.seq);
    expect(again.event.raw).toEqual({ v: 1 }); // original wins; no overwrite
    expect(await store.head()).toBe(1);
  });

  it('CAPTURE-EVERYTHING: an unmapped field is preserved in raw AND surfaced in unmapped', async () => {
    // A source sends a field we never modeled (latitude) plus one we do (address).
    const raw = { address: '482 Maple St', latitude: 42.1, vendor_weirdness: { foo: 'bar' } };
    const input = losslessEvent(
      { event_id: 'cap1', source: 'cad', source_type: 'incident.created', raw },
      (r) => ({ normalized: { address: r.address }, mappedKeys: ['address'] }),
    );
    const { event } = await store.append(input);

    // Nothing dropped: the whole payload is in raw.
    expect(event.raw).toEqual(raw);
    // What we mapped is in normalized.
    expect(event.normalized).toEqual({ address: '482 Maple St' });
    // What we did NOT map is visible in unmapped — including the lat/long with no slot.
    expect(event.unmapped).toEqual({ latitude: 42.1, vendor_weirdness: { foo: 'bar' } });
  });

  it('with no normalizer, everything is unmapped (still nothing lost)', async () => {
    const raw = { anything: 1, else: 2 };
    const { event } = await store.append(losslessEvent({ event_id: 'x', source: 's', source_type: 't', raw }));
    expect(event.raw).toEqual(raw);
    expect(event.unmapped).toEqual(raw);
    expect(event.normalized).toEqual({});
  });

  it('finds an incident\'s events by correlation', async () => {
    await store.append(base({ event_id: 'i1', correlation: { incident_id: 'INC-1' } }));
    await store.append(base({ event_id: 'i2', correlation: { incident_id: 'INC-2' } }));
    await store.append(base({ event_id: 'i3', correlation: { incident_id: 'INC-1' } }));
    const forInc1 = await store.byCorrelation('incident_id', 'INC-1');
    expect(forInc1.map((e) => e.event_id)).toEqual(['i1', 'i3']);
  });
});
