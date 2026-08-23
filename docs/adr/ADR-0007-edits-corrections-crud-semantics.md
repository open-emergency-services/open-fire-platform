# ADR-0007: Edits, corrections, and deletes on the event-sourced record

**Status:** Accepted
**Date:** 2026-08-21
**Deciders:** Maintainer (solo, for now)
**Refines:** ADR-0004 (recording core + read model), ADR-0006 (capture-everything)

## Context

The Core is an append-only log — it cannot be mutated, which is exactly what makes it
tamper-evident and auditable. But records still need normal CRUD: a firefighter fixes a
value they entered wrong on a hydrant inspection; a submitted report is amended; a record
created in error is removed. How do edits and deletes work when the source of truth can
only be appended to? And what related structures does CRUD in an event-sourced system
need?

## Decision

**1. Never mutate the log. An edit is a new event.** An update appends a `*.updated` (or
`*.corrected`) event carrying the change; the projector folds it onto the read model; a
`GET` returns the current (corrected) state. From the API/UI it looks and feels like normal
CRUD; underneath, the history is preserved — the original event never goes away, and current
state is the *fold* of all events for the record.

**2. Delete is a tombstone, never a physical delete — and the voided row stays
discoverable.** A delete appends a `*.deleted` / `*.voided` event; the projector marks the
read-model row inactive (`deleted: true`, with `deletedAt`/`reason`) but **keeps the row** —
it does not remove it. The record's history stays in the log, so you can always see it
existed and was voided, by whom and when. This is the anti-tampering property: the only
physical operation the log permits is *append*.

Critically, a **lookup of a deleted record must not look the same as a lookup of one that
never existed.** If a delete just made the record disappear, `GET /:id` would return a bare
`404` — and a `404` cannot tell "this was reported and later voided" apart from "this was
never a thing." For a records system that is the wrong answer, especially when someone is
resolving a real id or event-id. So reads resolve to one of three distinct outcomes:

- **active** → the live record;
- **deleted** → a **tombstone** (HTTP `200`): `{ id, deleted: true, deletedAt, reason,
  version, message, history }` — it confirms the record existed and was voided, and points
  to the retained audit trail. The voided field data is not surfaced on the tombstone; it
  stays recoverable through history for authorized audit;
- **never existed** → a genuine `404`.

The write path is stricter: editing or re-deleting a voided record is `410 Gone` (it
existed, but you can't mutate it), deliberately *not* `404`. `list` excludes deleted rows by
default; `?includeDeleted=1` surfaces them (voided, shown, not vanished).

**3. Two stores, two roles.** The **immutable log** (Core) is the history and source of
truth; the **read model** (projection) is a normal, mutable, query-optimized store holding
current state. CRUD reads hit the read model directly (fast, indexed lookup — the log is
never replayed on a read). Replay happens only on rebuild (startup / reprojection) and is
bounded by **snapshots** so it never means "replay all of history."

**4. Attribution is automatic.** Every event carries the actor (the authenticated user) and
a timestamp, so "who created / changed / voided this, when, and what it was before" is an
inherent property, not a bolted-on audit table. (Today `source` is `'ui'` generically; it
becomes the user id once auth is in.)

**5. Editability is a lifecycle enforced at the command layer.** Whether a record *can* be
edited is a business rule checked *before* the append: a **draft** is freely editable; a
**submitted** regulatory record (e.g. a NERIS incident report) is **amend-only** — the
correction is a new event, the as-submitted original is preserved, and a resubmission to
NERIS is triggered; a **closed** record is locked. The log faithfully records whatever
edits are allowed; the gatekeeping is upstream.

**6. Optimistic concurrency.** To stop two people's edits from clobbering each other, an
append can carry an expected record version; if the record changed since it was loaded, the
append is rejected and the client re-reads. Prevents silent lost updates.

**7. Lawful erasure vs. immutability (PII).** An append-only log conflicts with a legal
right-to-erasure (a patient name entered in error, a deletion order; CJIS/HIPAA/GDPR). PII
never goes into an event's `raw`/`normalized`; the module stores it in a **PII vault** and
keeps only an opaque **token** in the log. **Both** resolutions are implemented as
interchangeable strategies (`apps/api/src/pii/`, config-driven via `PII_STRATEGY`):
- **Externalized (default):** PII lives in a separate (HIPAA-compliant) store/host; erase
  deletes it. The token in the log then resolves to null.
- **Crypto-shredding:** PII stored encrypted per-subject (AES-256-GCM); erase destroys the
  key, making the ciphertext permanently unrecoverable.
Either way the log stays immutable and the audit structure intact, while personal data is
lawfully erasable. Default is externalized (operator preference); switch with one env var.

**8. Not everything is event-sourced.** Event-source the records that need an audit trail
(incidents, inspections, maydays, anything regulated). Purely operational or reference data
with no history requirement — the roster, UI preferences, unsubmitted scratch — can be plain
mutable CRUD tables. Use the right tool per data class.

## The edit flow, concretely (hydrant inspection)

1. User opens an existing inspection, changes a field, saves.
2. UI → `PATCH /api/v1/hydrant-inspections/:id` with the changed fields (+ optional reason).
3. Service appends `hydrant.inspection.updated` { id, changes, actor, reason }.
4. Projector merges the change onto the read-model record (upsert).
5. `GET` now returns the corrected record; the log holds `created` + `updated` (+ any more).
6. A `GET /:id/history` returns the full ordered audit trail for the record.

## Options Considered

- **Mutable records (plain UPDATE/DELETE).** Simple and familiar, but destroys the audit
  trail and the tamper-evidence — the whole reason the Core exists. **Rejected** for
  event-sourced records (fine for non-historical operational data, per Decision 8).
- **Event-sourced with corrections + tombstones (chosen).** Preserves history and audit;
  CRUD feel retained at the read model; cost is a slightly richer write path and the
  PII-erasure reconciliation. Worth it for a records system.

## Consequences

**Easier:** complete, defensible audit trail; corrections are transparent amendments, not
silent overwrites; time-travel ("as originally entered" vs "as it stands"); reprojection
when the model changes.

**Harder:** edits/deletes are events with lifecycle rules, not raw UPDATE/DELETE; concurrency
needs version checks; PII needs crypto-shredding or externalization to stay lawfully
erasable. All manageable, none exotic.

## Action Items

1. [x] Add `*.updated` + `*.deleted` event handling to the projection (per module). *(Done in
       the hydrant reference module.)*
2. [x] Implement the reference edit flow on hydrant inspections (`PATCH`, soft-delete,
       `GET /:id/history`) as the template for every module. *(Done —
       `apps/api/src/modules/hydrant-inspections/` + `apps/web/hydrant.html`.)*
2a.[x] Make a deleted-record lookup **discoverable**: `GET /:id` returns a tombstone (200)
       for a voided record, `410 Gone` on the write path, `404` only when the id never
       existed; `?includeDeleted=1` on list; UI shows voided rows. *(Done — `lookup()`/
       `Tombstone`; tests cover tombstone vs. genuine-404.)*
3. [x] Add optimistic-concurrency (expected version) to the edit path. *(Done — `expectedVersion`
       → 409 on conflict.)*
4. [ ] Define the editability lifecycle (draft/submitted/closed) and enforce at the command layer.
5. [x] PII strategy — **both** implemented and interchangeable (`apps/api/src/pii/`): externalized
       (default) and crypto-shred, config-driven via `PII_STRATEGY`. *(Wire the first real consumer
       — the personnel/roster module — when built; pairs with CJIS/HIPAA compliance.)*
