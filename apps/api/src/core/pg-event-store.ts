import { AppendInput, StoredEvent } from './stored-event';
import { AppendResult, EventStore } from './event-store';

/**
 * Minimal shape of a Postgres client (node-postgres `Pool`/`Client` satisfy it
 * structurally). Declared here so this file typechecks without the `pg` package
 * installed; a real deployment passes an actual pool.
 */
export interface PgLike {
  query(text: string, params?: unknown[]): Promise<{ rows: any[] }>;
}

/**
 * The durable append-only Postgres event log (ADR-0004). Same EventStore contract
 * as the in-memory store, so swapping is a wiring change, not a code change.
 *
 * Schema: apps/api/migrations/0001_event_log.sql. `seq` is BIGSERIAL (the store
 * cursor); `event_id` is UNIQUE (idempotency via ON CONFLICT DO NOTHING).
 */
export class PgEventStore extends EventStore {
  constructor(private readonly db: PgLike) {
    super();
  }

  async append(input: AppendInput): Promise<AppendResult> {
    const receivedAt = input.received_at ?? new Date().toISOString();
    const insert = await this.db.query(
      `INSERT INTO event_log
         (event_id, source, source_type, schema_version, session_id, source_seq,
          occurred_at, received_at, raw, normalized, unmapped, content_ref, correlation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING *`,
      [
        input.event_id, input.source, input.source_type, input.schema_version ?? null,
        input.session_id ?? null, input.source_seq ?? null, input.occurred_at ?? null,
        receivedAt, JSON.stringify(input.raw), JSON.stringify(input.normalized ?? {}),
        JSON.stringify(input.unmapped ?? {}), input.content_ref ?? null,
        input.correlation ? JSON.stringify(input.correlation) : null,
      ],
    );
    if (insert.rows.length) return { event: rowToEvent(insert.rows[0]), duplicate: false };

    // Conflict → already stored; return the existing row.
    const existing = await this.db.query(`SELECT * FROM event_log WHERE event_id = $1`, [input.event_id]);
    return { event: rowToEvent(existing.rows[0]), duplicate: true };
  }

  async since(cursor: number, limit = 1000): Promise<StoredEvent[]> {
    const res = await this.db.query(
      `SELECT * FROM event_log WHERE seq > $1 ORDER BY seq ASC LIMIT $2`,
      [cursor, limit],
    );
    return res.rows.map(rowToEvent);
  }

  async all(): Promise<StoredEvent[]> {
    const res = await this.db.query(`SELECT * FROM event_log ORDER BY seq ASC`);
    return res.rows.map(rowToEvent);
  }

  async byCorrelation(key: string, value: string): Promise<StoredEvent[]> {
    const res = await this.db.query(
      `SELECT * FROM event_log WHERE correlation ->> $1 = $2 ORDER BY seq ASC`,
      [key, value],
    );
    return res.rows.map(rowToEvent);
  }

  async head(): Promise<number> {
    const res = await this.db.query(`SELECT COALESCE(MAX(seq), 0) AS head FROM event_log`);
    return Number(res.rows[0]?.head ?? 0);
  }
}

/** Postgres returns JSONB already parsed; timestamps as Date or string. */
function rowToEvent(r: any): StoredEvent {
  const iso = (v: any) => (v instanceof Date ? v.toISOString() : v ?? undefined);
  return {
    seq: Number(r.seq),
    event_id: r.event_id,
    source: r.source,
    source_type: r.source_type,
    schema_version: r.schema_version ?? undefined,
    session_id: r.session_id ?? undefined,
    source_seq: r.source_seq != null ? Number(r.source_seq) : undefined,
    occurred_at: iso(r.occurred_at),
    received_at: iso(r.received_at),
    raw: r.raw ?? {},
    normalized: r.normalized ?? {},
    unmapped: r.unmapped ?? {},
    content_ref: r.content_ref ?? undefined,
    correlation: r.correlation ?? undefined,
  };
}
