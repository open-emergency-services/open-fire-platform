# ADR-0006: Capture-everything ingestion — raw + normalized + unmapped

**Status:** Accepted
**Date:** 2026-08-21
**Deciders:** Maintainer (solo, for now)
**Refines:** ADR-0004 (recording core + read model)

## Context

The requirement, in the maintainer's words: capture **everything** that comes in from
every source — "anything that could possibly be a data point" — and, critically, if
incoming data **doesn't fit a designated slot** (say a latitude/longitude field we never
modeled), it must **still be captured, not dropped.** We can always reprocess later, but
only if the data was stored in the first place.

This must be true even as sources evolve: NERIS gets revised, a CAD vendor adds a custom
field, the radio console emits a new event type, a department sends something bespoke.
The system must never be in a position where a field arrived and was silently discarded
because we hadn't written a column for it yet.

## Decision

**Every inbound event is stored in the Core in three parts, and the raw part is always
lossless.**

1. **`raw`** — the *complete, verbatim* inbound payload, exactly as received, stored
   losslessly (JSONB for structured data; a blob reference for binary). This is the
   guarantee: **nothing that arrives is ever dropped**, whether or not we understand it,
   whether or not it has a modeled slot. A lat/long we never mapped is still sitting in
   `raw`.
2. **`normalized`** — the subset we *have* mapped into our typed model (the fields the
   projections and the API expose today). This is what read models are built from.
3. **`unmapped`** — the keys that were present in `raw` but which no adapter mapped into
   `normalized`. This is the **"known unknowns" ledger**: it makes visible exactly what
   we're receiving but not yet using, so adding a slot later is a deliberate, easy step
   instead of a discovery.

**Rules that make this hold:**

- **Adapters must be lossless.** An adapter maps what it recognizes into `normalized` and
  **must pass the entire `raw` through untouched.** Dropping an unrecognized field at the
  adapter is forbidden — that's the one way to violate the guarantee.
- **Extra/unknown fields never cause rejection.** An event with fields we don't recognize
  is captured normally; the unknowns land in `raw`/`unmapped`. (Validation of *required*
  fields is a separate, non-blocking concern — a missing required field is recorded as a
  gap per the incident state machine, and never causes the raw event to be discarded.)
- **Schema-on-read.** Interpretation happens in projections, not at capture. Surfacing a
  new field later = add it to the normalized mapping and **reprocess the log** — no data
  is re-collected, because it was captured the first time.
- **Binary / oversized payloads** are stored by reference (a pointer into a blob store)
  with metadata in `raw`; per existing boundaries we never inline audio or keys.

### The stored event shape (Core append-only row)

```
event_id        uuid    -- global idempotency key
source          text    -- 'open-p25-console' | 'cad' | 'ui' | 'neris-sync' | ...
source_type     text    -- source's own event/record type
schema_version  text    -- the source contract version, when it has one
session_id      text    -- per-emitter run, for stream sources (nullable)
seq             bigint  -- monotonic within session_id (nullable)
occurred_at     timestamptz  -- source-authoritative time
received_at     timestamptz  -- platform receipt time
raw             jsonb   -- COMPLETE verbatim inbound (lossless)   ← the guarantee
normalized      jsonb   -- fields mapped into our model (typed at the edges)
unmapped        jsonb   -- raw keys not mapped into normalized (visibility)
content_ref     text    -- blob pointer for binary/oversized payloads (nullable)
correlation     jsonb   -- platform-assigned links (incident_id, …), nullable
```

`raw` is the seatbelt; `normalized` is what you drive with day to day; `unmapped` is the
dashboard light telling you there's cargo you haven't unpacked.

## Options Considered

### Option A — Store only normalized (typed columns)
**Pros:** clean, fully typed, smallest storage. **Cons:** anything not modeled is dropped
at ingest — *exactly* the failure this ADR exists to prevent. **Rejected.**

### Option B — Store only raw
**Pros:** trivially lossless. **Cons:** everything becomes schema-on-read at query time;
no typed structure for the API to build on efficiently; no visibility into what's present.
**Rejected.**

### Option C — raw + normalized + unmapped (chosen)
**Pros:** lossless capture (raw), fast typed reads (normalized), and visible gaps
(unmapped). New fields are cheap and never require re-collection. **Cons:** `raw`
duplicates data that's also in `normalized` (storage cost), and adapters carry the
discipline of passing raw through. Both are acceptable — append-only JSONB compresses
well, and for legally-significant records keeping the raw is a feature, not a cost.

## Consequences

**Easier:** nothing is ever lost, known or unknown; adding a data point later is a
reprocess, not a migration-plus-recollection; the `unmapped` ledger turns "did we capture
X?" into a query; the raw record is defensible for legal/audit.

**Harder:** more storage (raw + normalized); adapter discipline (must pass raw through and
compute the unmapped diff); a periodic "review the unmapped" habit so useful fields don't
sit unnoticed forever.

**To revisit:** retention policy for `raw` (default: keep, given legal records); whether
`unmapped` review should raise an alert when a *high-value* source starts sending
something new.

## Action Items

1. [ ] Implement the stored-event shape above in the Core schema.
2. [ ] Make every adapter lossless: map → `normalized`, pass through → `raw`, diff →
       `unmapped`. Add a test that asserts an event with an unknown extra field is stored
       with that field intact in `raw`.
3. [ ] Build projections from `normalized`, with `raw` queryable for anything not yet
       projected.
4. [ ] Add an "unmapped review" surface (a simple report of distinct unmapped keys per
       source) so promoting a new field to a slot is routine.
5. [ ] Pair this with the Data Sources & Capture Inventory
       ([DATA-CAPTURE-INVENTORY.md](../DATA-CAPTURE-INVENTORY.md)) — the map of every
       known slot; this ADR is the safety net for everything not yet on that map.
