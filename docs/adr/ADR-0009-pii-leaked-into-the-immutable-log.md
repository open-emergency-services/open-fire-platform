# ADR-0009: PII that leaks into the immutable log (unclassified / emergency capture)

**Status:** Proposed — direction accepted; scoped as *basic version now, full handling is a
deferred workstream*. See [PII-FRAMEWORK.md](../PII-FRAMEWORK.md) for the program-level
scoping (what ships now vs. what we come back to, and the honest residual).
**Date:** 2026-08-21
**Deciders:** Maintainer (solo, for now)
**Refines:** ADR-0004 (recording core), ADR-0006 (capture-everything), ADR-0007 (edits/deletes, PII strategies)

## Context

ADR-0007 solves **known** PII: when a field is PII *by definition* — a patient name, a
DOB, an SSN entered into a name/DOB/SSN field — the module routes it to a vault at capture
time and keeps only an opaque token in the log. Structured, anticipated, clean.

That is not the whole problem. In emergency work, **PII leaks into places we did not
classify as PII**, precisely because it is an emergency and nobody is curating the data:

- An EMS crew types into a free-text `notes` field: "pt is my neighbor Bob Jones, DOB
  4/2/51, lives at 123 Maple."
- A 911 call or radio transmission is recorded and transcribed verbatim; the caller says a
  name, an address, a condition. The transcript now contains PII.
- A photo/attachment captures a face, a license plate, a document.

We **must keep the record** — the call happened, it is legally and operationally required,
and the Core is append-only precisely so it cannot be quietly altered. But we may be
**legally required to erase the leaked PII** (HIPAA, CJIS, a court order, a
right-to-erasure request). Append-only vs. lawful erasure, again — but this time the PII is
*unstructured and unanticipated*, so the "route it to the vault at capture" trick doesn't
fire, because nothing knew it was PII.

The naïve resolutions both fail:
- **Edit/delete the offending event** → breaks append-only and the tamper-evidence that is
  the entire reason the Core exists.
- **Drop the record** → we lose a call we are required to retain.

So: how do we keep the immutable record *and* be able to erase PII that was never
classified as PII when it went in?

## Decision

The resolution is to **design so that the immutable log never physically holds
plaintext free-form content in the first place** — it holds an encrypted, externalized,
per-record-keyed *reference* to that content. Then erasure is a key-destroy or blob-delete
that never touches the log, and the log's immutability is preserved. Concretely:

**1. Classify capture surfaces into three PII-risk tiers, not two.**
- **Structured-known PII** (name/DOB/SSN/etc. fields): vault at capture, token in log
  (ADR-0007, unchanged).
- **Free-form / verbatim content** (notes, narratives, transcripts, recordings,
  attachments): treat as **may-contain-PII by default**, whether or not it actually does.
  This is the leak surface, and it is handled by Decisions 2–4 below.
- **Non-PII structured data** (times, units, incident type, hydrant readings): stays inline
  in the log as normal.

**2. Free-form content lives *outside* the immutable log, referenced by `content_ref`.**
The event envelope already carries a `content_ref` blob pointer (ADR-0006). Any free-form /
verbatim body is stored in a separate **content store** and the log keeps only:
the event skeleton (who/when/unit/incident linkage/timestamps) + `content_ref` + metadata.
The plaintext narrative/transcript/recording is **never inlined into `raw`/`normalized`.**
This is the pivotal move: it converts "unclassified PII sitting in the immutable log" into
"PII sitting in an erasable, referenced blob," which we already know how to erase.

**3. That content is encrypted with a per-record (envelope-encryption) key.** Each call /
record gets its own content key (managed by a KMS / envelope scheme). Crypto-shredding then
becomes **surgical**: destroy *one* call's key and only that call's leaked content becomes
unrecoverable — every other record survives. (A single global key would force "erase one =
destroy all," which is useless. Per-record keys are what make shredding targeted.)

**4. Erasure is a two-part append + destroy, and the audit of the erasure is itself
immutable.**
- **What (the PII body):** destroy the per-record content key (crypto-shred) or delete the
  referenced blob (externalized). The `content_ref` in the log now resolves to nothing.
- **Why/who/when (the erasure act):** append a `*.redacted` event — order/authority,
  scope, actor, timestamp. We *want* this part immutable: "the record existed, a redaction
  was performed under order X on date Y, scope Z." That is an audit gain, not a loss.
- The **event skeleton stays**: the call, its time, unit, and incident linkage remain, so
  the record still exists and is provable. We lose only the leaked-PII *content*, never the
  fact of the record.

**5. Residual tail — PII that lands inline in a *structured* field it was never expected
in** (someone pastes an SSN into `hydrant.notes`). Two available answers, applied together:
- **Minimize the surface:** default any meaningful free-text string field to the Decision-2
  path (encrypted, externalized, referenced) rather than inline — so most "typed-anywhere"
  leaks are already erasable.
- **Escape hatch for the truly unanticipated:** a **quarantine + crypto-shred** operation —
  append a `*.redacted` tombstone for the field and, because normalized text is itself
  stored under a per-record key, destroy that key to render the inline ciphertext inert.
  For any residue that genuinely cannot be shredded (e.g. legacy plaintext), fall back to
  **compliance-by-access-control**: the read model serves the redacted view, and raw log
  access is restricted and audited. Some regulators accept access-restriction for
  append-only audit logs; we do not rely on it as the primary mechanism, only as the last
  layer under aggressive minimization.

**6. Default remains externalized (operator preference), with crypto-shred available.** For
the content store, externalized-delete and crypto-shred are the same two interchangeable
strategies as ADR-0007 (`PII_STRATEGY`), now also governing free-form content — not just
structured vault fields.

**7. Correction and redaction are two different acts — and the gap between them is a
human-factor problem, not a crypto problem.** This is the case that actually bites: a
responder types an SSN into a `notes` field where it doesn't belong, notices, and does the
natural thing — backspaces the digits and hits save. In a plain database that erases it. In
our append-only log it does **not**: "save" appends a corrected value, and the *original*
event still physically holds the SSN. The screen looks clean, the user believes it's fixed,
and the PII is now permanently in the immutable record. An honest mistake becomes a silent,
permanent leak — and the system *rewarded* the wrong action by making the number disappear
from view. So we must distinguish, and design around, two operations that look almost
identical to the user:

- **Ordinary correction** — append a new value; the prior value is *retained* in history.
  This is what we want for almost everything (it's the audit trail, ADR-0007). The field
  lives on; the old entry is preserved.
- **Redaction / shred** — the prior entry must be *destroyed*, not retained, because it
  contained PII that never should have been captured. The field still exists and still takes
  new content; only that specific prior value is shredded.

We cannot rely on the user to know which one they're performing. Three layers close the gap,
weakest-to-strongest reliance inverted — i.e. **the floor does the real work, the prompt is
the ideal, detection is the net:**

- **Floor (storage default): free-form fields are always encrypted, per-record-keyed, and
  externalized (Decisions 2–3), never inline plaintext in the log.** This is what makes the
  backspace-and-save user *safe by default*: their discarded original isn't permanent
  plaintext in the immutable log — it's erasable ciphertext. A later shred (by order, audit,
  or detector) can still destroy it. The naive path leaves something recoverable, not
  something baked in. This is the most important layer precisely because it doesn't depend on
  anyone noticing.
- **Ideal (surface the fork at the moment of deletion):** when an edit *removes* content from
  a sensitive-eligible field, don't silently append a correction — present the choice right
  there: *"You removed information from this field. Was it a normal correction, or did it
  contain protected information that must be shredded?"* This turns an invisible decision into
  an explicit fork at save time, so a user who *does* realize doesn't have to hunt for a
  separate "shred" button.
- **Net (automated detection):** run a PII detector (SSN/DOB/name patterns, etc.) over
  free-form content on capture and on edit. A hit routes the value to the shreddable path
  and/or raises it for review — catching leaks the user never noticed. Imperfect by nature,
  so it is a net under the floor, never the primary control.

Residual: a field we deliberately keep **structured and inline** for queryability (not
free-form) has no ciphertext floor, so a backspace-and-save there *does* bake the value in,
and only a deliberate shred/quarantine escape hatch removes it. The lever is therefore
**classification** — how aggressively we treat fields as free-form/shreddable-by-default.
Classify generously; keep the inline-structured set small and genuinely non-PII.

## The EMS-leak flow, concretely

1. EMS call is recorded / transcribed; narrative captured.
2. The narrative/transcript/audio is encrypted under this call's content key and written to
   the content store; the Core log gets the event skeleton + `content_ref` (no plaintext).
3. Months later a HIPAA erasure order names this call.
4. Append `ems.call.redacted` { call_id, order_ref, scope: 'narrative+audio', actor, at }.
5. Destroy this call's content key (or delete its blob). `content_ref` now resolves to null.
6. Result: the call **still exists** — time, unit, incident, disposition, and the immutable
   proof that a lawful redaction occurred. The leaked PII body is **gone**. The append-only
   log was never mutated.

## Options Considered

- **Inline everything, then try to erase from the log.** Requires mutating an append-only
  store — breaks tamper-evidence. **Rejected.**
- **Never keep free-form content at all.** Erasure trivially solved, but we lose the
  narrative/transcript that has real operational and clinical value. **Rejected** — throws
  out the record to protect it.
- **Externalize + per-record-key + redaction-append (chosen).** Keeps the immutable record
  and the audit of the erasure, while making even *unclassified* leaked content erasable,
  because the log holds a reference, not the plaintext. Cost: a content store, key
  management, and disciplined classification of capture surfaces. Worth it.

## Consequences

**Easier:** leaked PII in narratives/transcripts/recordings becomes lawfully erasable
without ever mutating the log; erasures are themselves auditable; the record survives its
own redaction.

**Harder:** introduces a content store + KMS/envelope-encryption and per-record key
lifecycle; requires classifying every capture surface (free-form vs. structured) and
defaulting free-form to the referenced path; the residual inline-leak tail needs
minimization + access control. None exotic; all standard regulated-data plumbing.

## Action Items

1. [ ] Add a **content store** abstraction (put/get/delete of referenced blobs) paralleling
       the PII vault, with the same externalized/crypto-shred strategy switch.
2. [ ] Per-record **content-key** lifecycle (envelope encryption / KMS seam) so shredding is
       surgical.
3. [ ] Route module free-form fields (notes/narrative/transcript) through `content_ref`
       instead of inlining into `raw`/`normalized`; default long text fields to it.
4. [ ] Add a `*.redacted` event type + read-model handling (parallels `*.deleted` tombstone
       from ADR-0007) — records the erasure act immutably.
5. [ ] Document the operator runbook: responding to a HIPAA/CJIS/right-to-erasure order end
       to end (find the call, append the redaction, destroy the key, verify `content_ref`
       resolves null).
6. [ ] Pairs with the recordings/transcription/real-time-translation work (see BACKLOG) —
       that feature is the biggest source of leaked PII and must be built on this from day one.
7. [ ] Human-factor gap (Decision 7): (a) make free-form fields shreddable-by-default so
       backspace-and-save leaves erasable ciphertext, not permanent plaintext; (b) at the
       command/UI layer, when an edit removes content from a sensitive-eligible field, surface
       the correction-vs-shred fork instead of silently appending; (c) add a PII detector on
       capture/edit as the net. Coarse first; refine the classification of which fields are
       free-form/shreddable.
