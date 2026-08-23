/**
 * A generic event-sourced record, keyed by `module` (e.g. 'fire', 'community-event').
 * One code path serves every NERIS module screen: the module is just part of the event
 * type and correlation, so all ~40 forms share the same CRUD-on-event-sourcing engine
 * (ADR-0005 Regular tier, ADR-0007 semantics) instead of a hand-written backend each.
 */
export interface GenericRecord {
  id: string;
  module: string;
  /** Tenant discriminator — the department that owns this record (ADR-0010). */
  departmentId: string;
  data: Record<string, unknown>;
  version: number;
  deleted: boolean;
  deletedAt?: string;
  deletedReason?: string;
  /** Cross-link: the record this one is attached to (e.g. a `fire` sub-record → its `incident-core`). */
  parentId?: string;
  parentModule?: string;
  createdAt: string;
  updatedAt: string;
}

/** Lookup of a deleted record — discoverable tombstone, not a bare 404 (ADR-0007). */
export interface Tombstone {
  id: string;
  module: string;
  deleted: true;
  deletedAt?: string;
  reason?: string;
  version: number;
  createdAt: string;
  message: string;
  history: string;
}

/** One entry in a record's audit trail. */
export interface HistoryEntry {
  seq: number;
  type: string; // created | updated | deleted
  at: string;
  by: string;
  changes: Record<string, unknown>;
}
