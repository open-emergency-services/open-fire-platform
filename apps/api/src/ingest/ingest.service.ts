import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventStore } from '../core/event-store';
import { losslessEvent } from '../core/stored-event';

/** The generic ingest body — the universal write shape. `raw` is required and kept whole. */
export interface IngestBody {
  source?: string;
  source_type?: string;
  event_id?: string;
  schema_version?: string;
  occurred_at?: string;
  raw?: Record<string, unknown>;
  /** Optional: fields (top-level raw keys) to promote into `normalized`. */
  mapped_keys?: string[];
  /** Optional platform links, e.g. { incident_id }. */
  correlation?: Record<string, unknown>;
}

export interface IngestResult {
  seq: number;
  event_id: string;
  duplicate: boolean;
}

/**
 * The Essential-tier ingest (ADR-0005) — the thin, logic-free write path to the Core.
 *
 * It does the minimum: validate the envelope is well-formed, then append the COMPLETE
 * payload to the log (ADR-0006). No business logic, no projection — this is the
 * always-works front door that captures everything. Typed adapters (radio, incident)
 * do their own richer ingest; this is the universal fallback and the raw-capture path.
 */
@Injectable()
export class IngestService {
  constructor(private readonly store: EventStore) {}

  async ingest(body: IngestBody): Promise<IngestResult> {
    if (!body || typeof body !== 'object') throw new BadRequestException('body required');
    if (!body.source || !body.source_type) throw new BadRequestException('source and source_type are required');
    if (!body.raw || typeof body.raw !== 'object') throw new BadRequestException('raw must be an object');

    const mapped = body.mapped_keys;
    const input = losslessEvent(
      {
        event_id: body.event_id ?? randomUUID(),
        source: body.source,
        source_type: body.source_type,
        schema_version: body.schema_version,
        occurred_at: body.occurred_at,
        raw: body.raw,
        correlation: body.correlation,
      },
      mapped
        ? (raw) => ({
            normalized: Object.fromEntries(mapped.filter((k) => k in raw).map((k) => [k, raw[k]])),
            mappedKeys: mapped,
          })
        : undefined,
    );

    const { event, duplicate } = await this.store.append(input);
    return { seq: event.seq, event_id: event.event_id, duplicate };
  }
}
