# Backlog — framed ideas not yet built

Design ideas captured for later, so they aren't lost. Not committed work; each graduates to
an ADR + module when picked up.

## Recordings, transcription & real-time translation into the log

**Intent (maintainer):** capture actual audio/voice from calls and radio, transcribe it,
and land the transcript into the event log — including **real-time translation** so a
non-English transmission is logged in a usable form as it happens. This is a genuinely
wanted feature, not a maybe.

**Why it's noted now (before building):** it is the single largest source of *unclassified*
PII in the system — people say names, addresses, and medical details on the air constantly.
So it must be built on **ADR-0009** from day one: audio + transcript are free-form content,
encrypted under a per-record content key and stored in the content store, with only a
`content_ref` in the immutable log. That makes the inevitable leaked PII lawfully erasable
without ever mutating the log.

**Rough shape when picked up:**
- Ingest seam for audio (parallels the radio seam, ADR-0003) — swappable: fake recorder in
  the demo, real capture in the field.
- Transcription as a swappable component (local/offline model vs. hosted) — offline matters
  for CJIS and for departments that can't send audio off-site.
- Real-time translation as a further component in the same pipeline; log both the original
  and the translated transcript (capture-everything, ADR-0006).
- Each utterance/segment → an event referencing the encrypted media/transcript blob; never
  inline plaintext.
- Retention & redaction runbook per ADR-0009 (destroy the call's content key to erase).

## Configurable timer standards (command-board obligations)

**Intent (maintainer):** the command board’s timed obligations (PAR cadence, interior
air/time-in-IDLH thresholds, the primary-search / survivability window, replacement-RIT
window, minimum rehab, and future ones — CAN/division reports, secondary search, utilities,
EMS transport clocks) run on **standard default times today**, hardcoded in one `STANDARDS`
table in `apps/web/command.html`. Long-term these should be **configurable**: the platform
ships sensible national/standard defaults, and a department (or an individual incident, or an
incident type) can **override** them.

**Why noted now:** the current implementation already centralizes every threshold in one
`STANDARDS` object and supports **live per-incident adjustment** (the −/+ on each timer, which
nudges that timer’s standard mid-incident). That is the seam. When picked up, promote it to:
- **Config precedence:** platform default → department policy → incident-type profile →
  live incident override. Each layer only overrides what it sets.
- **Server-owned defaults** delivered via the API (not hardcoded in the web client), so the
  dashboard is a pure client of a configured standard — consistent with the API-first core.
- **Auditability:** because overrides are safety-relevant, changing a standard (who/when/what
  from→to) should itself be an event in the log (ties to ADR-0007 audit trail).
- **Timer catalog as data:** each obligation (label, mode, default thresholds, what resolves
  it, escalation tiers) becomes a config record, so adding a new standard timer is
  configuration, not code.

Ships-now vs. deferred: defaults + live adjust are built; the config/override hierarchy,
server delivery, and audit-of-changes are the deferred workstream.

## (add future framed ideas below)
