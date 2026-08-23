import { NerisHydrantInspection } from '@ofp/neris-schema';

/**
 * A hydrant inspection read-model record. `data` is the NERIS-shaped payload (typed
 * against the generated `NerisHydrantInspection`; `Partial` because a form may not fill
 * every field, and capture-everything (ADR-0006) keeps the rest in `raw`).
 *
 * `version` counts applied events (optimistic concurrency, ADR-0007); `deleted` is the
 * tombstone flag — a soft delete that drops the record from active views while its full
 * history stays in the log. When deleted, `deletedAt`/`deletedReason` are retained so a
 * lookup can report *that it was deleted* (and when/why) rather than returning nothing.
 */
export interface HydrantInspectionRecord {
  id: string;
  data: Partial<NerisHydrantInspection>;
  version: number;
  deleted: boolean;
  deletedAt?: string;
  deletedReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * What a lookup of a *deleted* record returns (ADR-0007). The row was voided, not erased:
 * the id is real, so we confirm the record existed and was deleted — with a pointer to the
 * retained history — instead of a bare 404. This is the difference between "was reported and
 * later voided" and "never existed," which a caller (or an event-id lookup) must be able to
 * tell apart. The voided `data` is not surfaced here; it stays recoverable via the audit trail.
 */
export interface Tombstone {
  id: string;
  deleted: true;
  deletedAt?: string;
  reason?: string;
  version: number;
  createdAt: string;
  message: string;
  history: string;
}

/** One entry in a record's audit trail (ADR-0007). */
export interface HistoryEntry {
  seq: number;
  type: string; // created | updated | deleted
  at: string;
  by: string; // actor/source
  changes: Record<string, unknown>;
}
