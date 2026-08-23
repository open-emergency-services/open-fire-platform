# PII handling — program framework (read this before touching PII again)

**Status:** Framework / direction. The *basic version* described here is what we build now;
the *deferred* section is a standalone workstream to come back to.
**Relates to:** ADR-0007 (known-PII vault + tokens), ADR-0009 (leaked PII in the immutable
log). This document sits above both: it is the honest scoping of the whole problem so we
don't pretend it's solved.

## Why this document exists

Every time we propose a PII "fix," a human doing something dumb defeats it. That is not a
flaw in any one design — it is the nature of the problem, and we should stop treating it as
something a clever mechanism will close. People will put a Social Security number, a date of
birth, a name, an address, "the patient is my neighbor," into whatever field is in front of
them during an emergency, because they are trying to save a life, not curate a database.
Field-level classification does not save us: it doesn't matter whether it's `notes1` or
`notes2`, or whether it's a number or free text — PII can land *anywhere*, in any field, in
any form.

So the guiding decision is a posture, not a mechanism:

> **We cannot prevent PII leakage. We design to CONTAIN the default exposure and to REMEDIATE
> any leak — and we accept that discovery of a leak (audit, complaint, legal order) is a
> normal trigger, not a system failure.**

PII handling may end up more complex than the rest of the platform combined. We therefore
ship a deliberately basic version and revisit it as its own major effort. This document is
the map so that revisit is deliberate, not a rediscovery.

## The false dichotomy, and the third door

The instinctive framing is: *either encrypt every field (and make querying/sorting/indexing
impossible) or post-process the log to scrub PII (and fight false positives/negatives
forever).* Both are real, both are painful. Event sourcing gives a third door that a normal
single-database system does not:

The **log** and the **read model** are two different things.

- The **log** is the durable source of truth, but it is *not* the query surface — it is
  replayed to build projections, rarely read directly. So it can be **encrypted at rest,
  per-record key**, at almost no query cost.
- The **read model** is the query surface — plaintext, indexed, fast — but it is **derived
  and disposable**: rebuildable from the log at any time, holding no independent durability
  obligation.

That split is what makes a coarse strategy viable. We do *not* need to classify every field
correctly, because **anything** that lands in the encrypted log is shreddable — anticipated
or not. Redaction = destroy the relevant key(s), append an audit event, re-project the read
model. The log stays immutable; the leaked value becomes unrecoverable; the record survives.

This bounds the problem. It does not eliminate it (see Deferred, below).

## What the basic version guarantees (build now)

1. **Known PII goes to the vault at capture** (ADR-0007): name/DOB/SSN-type fields resolve
   to a token in the log; the value lives in the externalized (default) or crypto-shred
   store. Best-effort minimization — the easy, high-value cases handled cleanly.
2. **The log is encrypted at rest under per-record keys** (ADR-0009 direction): so a value
   that leaks into *any* field is, in principle, shreddable — we are not betting on perfect
   classification.
3. **Redaction is a real, supported operation, not a hack**: append a `*.redacted` audit
   event (who/when/under what authority) + destroy the key / delete the blob + re-project.
   The record continues to exist; only the leaked content dies.
4. **The read model is treated as purgeable**: after a redaction, it is re-projected so the
   plaintext copy of the redacted value is gone from the query surface too.
5. **An honest boundary is documented, not hidden**: everyone using the system knows that a
   plain "backspace and save" corrects the *view* but does not by itself erase — erasure is
   the redaction operation. (ADR-0009 Decision 7.)

That is a coherent, shippable floor: leaks are remediable, the common cases are minimized,
and the immutable-record guarantee is intact.

## What is explicitly deferred (come back — this is the hard workstream)

These are known-hard and intentionally *not* built in the basic version. Listed so the
revisit is planned:

- **Plaintext fan-out / copy tracking.** Shredding the log does not automatically purge
  every downstream plaintext copy: **backups, replicas, search indices, exports, reports,
  caches, and any data already sent to NERIS or other external systems.** This is the
  genuinely messy core and the main reason full PII handling is its own project.
- **Detection as a net.** Automated PII scanning (SSN/DOB/phone/address regex + name/entity
  recognition) on capture and edit, to flag/route leaks the user never noticed. Imperfect;
  false positives block legit data, false negatives still leak. A net, never the floor.
- **The correction-vs-shred UI fork** (ADR-0009 Decision 7): surfacing the "was that a
  correction or did it contain protected info?" choice at the moment of deletion.
- **Searchable/queryable-yet-protected fields.** If a protected field must also be
  searched/sorted (blind indexes, deterministic/searchable encryption), that is real
  cryptographic engineering with its own leakage trade-offs.
- **Key management at scale.** Per-record vs per-subject vs per-field key granularity, a
  real KMS/HSM, key rotation, and the operational runbook for erasure orders.
- **External-system reconciliation.** Right-to-erasure that must propagate to NERIS, a state
  repository, or a partner CAD — you can't shred someone else's copy by destroying your key.
- **Retention & legal-hold interplay.** Erasure vs. records-retention law vs. active
  litigation hold can directly conflict; needs policy, not just code.

## The residual we accept for now

With the basic version shipped, the accepted residual is: **a leak is remediable in our own
store, but downstream plaintext copies (backups/indices/exports/external systems) are not yet
automatically purged.** That is a real, documented limitation for early deployments — not a
silent gap. Departments handling live PHI at scale should know this boundary before relying
on the platform for erasure compliance.

## Forward-compatibility guardrails (honor NOW; cost ~zero, violating them is expensive later)

We are deferring the PII *work*, not the PII *constraints*. These are the design invariants
that keep every deferred solution (log encryption, crypto-shred, externalization,
re-projection) possible. They cost nothing to hold now and are painful-to-impossible to
retrofit if we break them. This is the "don't put up our own barriers" list — check every new
module against it.

1. **Synthetic keys only — never key or join on a PII value.** Records, correlations, and
   foreign references use opaque UUIDs (`record_id`, `event_id`), never an SSN/DOB/name as a
   primary key, join key, or natural identifier. Reason: you must be able to shred a value
   without breaking referential integrity. *Status: already satisfied — `randomUUID()`
   everywhere; correlation is by synthetic `record_id`.*
2. **All persistence goes through the storage adapter — no domain code reaches raw storage.**
   The `EventStore` interface (and the `PgLike` seam) is the only path to the log. Reason:
   encryption-at-rest / envelope encryption gets slipped in *underneath* the adapter later
   without touching a single module. *Status: already satisfied — `EventStore` abstraction,
   swappable in-memory vs. Postgres.*
3. **Keep the `content_ref` indirection alive even while content is inline.** The blob-pointer
   seam stays in the event envelope so free-form content can be externalized later even if we
   store it inline for now. Reason: don't hardcode the assumption that content lives in
   `raw`/`normalized`. *Status: already satisfied — `content_ref` present in `StoredEvent`.*
4. **The read model must be 100% derivable from the log — never the sole home of any datum.**
   No state that exists only in the projection. Reason: redaction works by shred-then-
   re-project; if the read model holds unrecoverable data, re-projection would lose it. *Status:
   already satisfied — projections rebuild from the log on boot; verified.*
5. **Leave room for a per-record/per-subject key.** Don't design anything that would force one
   key to cover many subjects (e.g. one giant blob mixing many people's data with no
   sub-addressing). Keep records/segments individually addressable so shredding stays
   surgical. *Status: satisfied by design — one record = one id; revisit when recordings/
   transcripts add multi-party segments (tie a key per segment).*
6. **Don't create untracked plaintext fan-out now.** No dumping raw events into logs,
   telemetry, debug traces, or ad-hoc exports where PII could ride along into a place we don't
   track and can't shred. Reason: every untracked plaintext copy is a future erasure gap.
   *Status: hold this consciously — cheap discipline now, no cleanup later.*
7. **No plaintext-requiring constraints on free-form fields.** Don't put unique constraints,
   indexes, or validation that would require the plaintext of a free-form field to stay
   readable forever (which would block encrypting/shredding it). *Status: hold going forward.*
8. **Timestamps and operational metadata stay separate from PII.** Keep who/when/unit/incident
   linkage independent of any PII payload, so the record's skeleton survives redaction intact.
   *Status: already satisfied — envelope separates metadata from `raw`/`normalized`.*

Net: five of eight are already true by construction; the other three (6, 7, and the
multi-party part of 5) are just disciplines to hold as modules get built. Nothing here
requires work now — it requires *not* doing the wrong thing.

## The one rule that carries all the weight

Keep the **inline-structured, plaintext, permanently-queryable** field set as small as
possible and genuinely non-PII (times, unit ids, incident type, equipment readings).
Everything a human types free-form defaults to the encrypted/shreddable path. We will never
classify perfectly — the point is that the *default* is safe, so imperfect classification
degrades gracefully instead of baking plaintext PII into an immutable record.
