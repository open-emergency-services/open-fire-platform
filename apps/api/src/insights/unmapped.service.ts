import { Injectable } from '@nestjs/common';
import { EventStore } from '../core/event-store';

/** One unmapped key seen on a source: how often, what shape, and when. */
export interface UnmappedKey {
  key: string;
  count: number;
  /** JS type of the last value seen (number/string/object/…). We deliberately do NOT
   *  echo the value itself — an unmapped payload can carry PII the standard didn't model. */
  sampleType: string;
  firstSeen: string;
  lastSeen: string;
}

/** Distinct unmapped keys for one source, most-frequent first. */
export interface UnmappedSource {
  source: string;
  events: number;
  keys: UnmappedKey[];
}

export interface UnmappedReport {
  sources: UnmappedSource[];
  totalEvents: number;
  distinctKeys: number;
  generatedAt: string;
}

/**
 * The ADR-0006 "unmapped review" surface. Capture-everything means a field with no
 * modeled slot is preserved in `unmapped` rather than dropped — but only if someone
 * looks. This rolls the log up into "what is each source sending that we don't map yet",
 * so adding a slot is a deliberate decision, not a discovery after the data's gone.
 *
 * Keys and shapes only — never the raw values (they may be PII). Officer-gated.
 */
@Injectable()
export class UnmappedService {
  constructor(private readonly store: EventStore) {}

  async report(): Promise<UnmappedReport> {
    const events = await this.store.all();
    // source -> event count, and source -> key -> aggregate
    const eventCount = new Map<string, number>();
    const bySource = new Map<string, Map<string, UnmappedKey>>();

    for (const e of events) {
      eventCount.set(e.source, (eventCount.get(e.source) ?? 0) + 1);
      const unmapped = e.unmapped ?? {};
      const keys = Object.keys(unmapped);
      if (keys.length === 0) continue;
      let keyMap = bySource.get(e.source);
      if (!keyMap) {
        keyMap = new Map();
        bySource.set(e.source, keyMap);
      }
      const ts = e.occurred_at ?? e.received_at;
      for (const key of keys) {
        const existing = keyMap.get(key);
        if (existing) {
          existing.count += 1;
          existing.sampleType = typeOf(unmapped[key]);
          if (ts < existing.firstSeen) existing.firstSeen = ts;
          if (ts > existing.lastSeen) existing.lastSeen = ts;
        } else {
          keyMap.set(key, {
            key,
            count: 1,
            sampleType: typeOf(unmapped[key]),
            firstSeen: ts,
            lastSeen: ts,
          });
        }
      }
    }

    const sources: UnmappedSource[] = [];
    let distinctKeys = 0;
    for (const [source, keyMap] of bySource) {
      const keys = [...keyMap.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
      distinctKeys += keys.length;
      sources.push({ source, events: eventCount.get(source) ?? 0, keys });
    }
    sources.sort((a, b) => a.source.localeCompare(b.source));

    return {
      sources,
      totalEvents: events.length,
      distinctKeys,
      generatedAt: new Date().toISOString(),
    };
  }
}

function typeOf(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}
