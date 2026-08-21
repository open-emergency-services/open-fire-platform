/**
 * The append-only Core event — the source of truth (ADR-0004) with the
 * capture-everything envelope (ADR-0006).
 *
 * `raw` holds the COMPLETE verbatim inbound, so nothing is ever lost — even a
 * field with no modeled slot. `normalized` is what we've mapped into our model
 * (projections read this). `unmapped` is the raw keys we did NOT map — the
 * "known unknowns" ledger, so adding a slot later is deliberate, not a discovery.
 */

/** A committed event in the Core log. `seq` is store-assigned and monotonic. */
export interface StoredEvent {
  /** Store-assigned monotonic sequence — the ordering key and projection cursor. */
  seq: number;
  /** Global idempotency key (unique). */
  event_id: string;
  /** Where it came from, e.g. 'open-p25-console', 'cad', 'ui', 'neris-sync'. */
  source: string;
  /** The source's own event/record type. */
  source_type: string;
  /** The source contract version, when it has one. */
  schema_version?: string;
  /** Per-emitter run id, for stream sources (nullable). */
  session_id?: string;
  /** The source's own sequence (e.g. radio `seq`), distinct from the store `seq`. */
  source_seq?: number;
  /** Source-authoritative time the event happened. */
  occurred_at?: string;
  /** Platform receipt time. */
  received_at: string;
  /** COMPLETE verbatim inbound — the lossless guarantee. */
  raw: Record<string, unknown>;
  /** Fields mapped into our model. */
  normalized: Record<string, unknown>;
  /** Raw keys not mapped into normalized (visibility of the unknowns). */
  unmapped: Record<string, unknown>;
  /** Blob pointer for binary/oversized payloads (nullable). */
  content_ref?: string;
  /** Platform-assigned links (e.g. { incident_id }), nullable. */
  correlation?: Record<string, unknown>;
}

/** What a producer supplies to append; `seq` and `received_at` are filled if absent. */
export type AppendInput = Omit<StoredEvent, 'seq' | 'received_at' | 'normalized' | 'unmapped'> & {
  received_at?: string;
  normalized?: Record<string, unknown>;
  unmapped?: Record<string, unknown>;
};

/** Result of a normalize step: the mapped fields + which raw keys were consumed. */
export interface NormalizeResult {
  normalized: Record<string, unknown>;
  /** Top-level raw keys this normalization consumed (used to compute `unmapped`). */
  mappedKeys: string[];
}

/**
 * Build an AppendInput from a raw payload, computing `unmapped` losslessly:
 * every top-level raw key not claimed by the normalizer is preserved in `unmapped`
 * (and, of course, the whole thing stays in `raw`). This is the ADR-0006 mechanism.
 */
export function losslessEvent(
  meta: Omit<AppendInput, 'normalized' | 'unmapped'>,
  normalize?: (raw: Record<string, unknown>) => NormalizeResult,
): AppendInput {
  const result = normalize ? normalize(meta.raw) : { normalized: {}, mappedKeys: [] };
  const claimed = new Set(result.mappedKeys);
  const unmapped: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta.raw)) {
    if (!claimed.has(k)) unmapped[k] = v;
  }
  return { ...meta, normalized: result.normalized, unmapped };
}
