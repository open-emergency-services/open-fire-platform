import { NerisHydrantInspection } from '@ofp/neris-schema';

/**
 * A hydrant inspection read-model record. `data` is the NERIS-shaped payload (typed
 * against the generated `NerisHydrantInspection`; `Partial` because a form may not fill
 * every field, and capture-everything (ADR-0006) keeps the rest in `raw`).
 *
 * `version` counts applied events (optimistic concurrency, ADR-0007); `deleted` is the
 * tombstone flag — a soft delete that drops the record from active views while its full
 * history stays in the log.
 */
export interface HydrantInspectionRecord {
  id: string;
  data: Partial<NerisHydrantInspection>;
  version: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** One entry in a record's audit trail (ADR-0007). */
export interface HistoryEntry {
  seq: number;
  type: string; // created | updated | deleted
  at: string;
  by: string; // actor/source
  changes: Record<string, unknown>;
}
