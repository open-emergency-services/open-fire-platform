import { Injectable } from '@nestjs/common';
import { AppendInput, StoredEvent } from './stored-event';

/** Outcome of an append. `duplicate` is true if the event_id was already stored. */
export interface AppendResult {
  event: StoredEvent;
  duplicate: boolean;
}

/**
 * The Core event store — append-only source of truth (ADR-0004).
 *
 * Writes only ever append; there is no update or delete (that's the reliability
 * property). Two consumers read from it: the projector (builds the read model) and
 * the urgent-delivery service (fans out maydays). Reads are by `seq` cursor so a
 * consumer can resume exactly where it left off.
 *
 * Two implementations behind this interface (ADR-0004 storage ladder):
 *   - InMemoryEventStore — dev/test/demo, no infra.
 *   - PgEventStore       — the durable append-only Postgres log (drop-in).
 */
export abstract class EventStore {
  /** Append an event. Idempotent on event_id: a repeat returns the stored one. */
  abstract append(input: AppendInput): Promise<AppendResult>;
  /** Events with seq > cursor, oldest first — the projection/catch-up read. */
  abstract since(cursor: number, limit?: number): Promise<StoredEvent[]>;
  /** All events, oldest first (small/dev use). */
  abstract all(): Promise<StoredEvent[]>;
  /** Events whose correlation[key] === value (e.g. all events for an incident). */
  abstract byCorrelation(key: string, value: string): Promise<StoredEvent[]>;
  /** The latest assigned seq (0 if empty). */
  abstract head(): Promise<number>;
}

/**
 * In-memory append-only store. The array IS the log; a Set enforces idempotency.
 * Swap for PgEventStore in real deployments — same interface, so nothing else changes.
 */
@Injectable()
export class InMemoryEventStore extends EventStore {
  private readonly log: StoredEvent[] = [];
  private readonly seen = new Map<string, StoredEvent>();
  private seq = 0;

  async append(input: AppendInput): Promise<AppendResult> {
    const existing = this.seen.get(input.event_id);
    if (existing) return { event: existing, duplicate: true };

    const event: StoredEvent = {
      ...input,
      seq: ++this.seq,
      received_at: input.received_at ?? new Date().toISOString(),
      normalized: input.normalized ?? {},
      unmapped: input.unmapped ?? {},
    };
    this.log.push(event);
    this.seen.set(event.event_id, event);
    return { event, duplicate: false };
  }

  async since(cursor: number, limit = 1000): Promise<StoredEvent[]> {
    const out: StoredEvent[] = [];
    for (const e of this.log) {
      if (e.seq > cursor) out.push(e);
      if (out.length >= limit) break;
    }
    return out;
  }

  async all(): Promise<StoredEvent[]> {
    return [...this.log];
  }

  async byCorrelation(key: string, value: string): Promise<StoredEvent[]> {
    return this.log.filter((e) => e.correlation && e.correlation[key] === value);
  }

  async head(): Promise<number> {
    return this.seq;
  }
}
