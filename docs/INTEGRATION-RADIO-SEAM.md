# Planned seam: radio events → incident record

*Status: **envelope frozen at schema_version 1.0**; agreed to design toward, pre-code.
Not built yet. This records the one integration seam between `open-fire-platform`
(records) and `open-p25-console` (radio), so both projects hold the same contract
instead of retrofitting one later. Source: the console's "Radio → Platform integration
brief" and the two-round reply exchange that froze the envelope. The console repo's
`docs/integration.md` holds the identical contract.*

## The seam, in one sentence

**Radio events flow one way, console → platform, and become part of the incident
the platform is already tracking.** Push-to-talk, unit affiliation, and especially
the emergency/"mayday" button land on the incident's **comms facet**, so a
department's radio traffic and its records finally live on the same incident.

The console publishes raw radio events; the platform decides which incident they
belong to and stores them. One direction, one owner on each side. Neither project
imports the other.

## Ownership split (accepted)

| Concern | Owner |
|---|---|
| Detecting radio events and emitting them | console |
| The event schema (wire format) | shared — agreed once, both design to it |
| Which incident an event belongs to (correlation) | **platform** |
| Mapping a radio unit ID → person / apparatus (roster) | **platform** |
| Storing / displaying events on the incident | **platform** |
| Transport (bus / queue / webhook) | platform proposes, console conforms |

The console stays discipline-agnostic and makes no assumptions about incidents,
people, or apparatus. All context-dependent resolution happens here, where the
context lives.

## How it maps onto our architecture (no changes required)

The seam is a **single adapter** on the existing integration gateway — the console
is just another source, like the CAD feed and the NERIS sync:

```
open-p25-console
      │  (durable stream or webhook — see Transport)
      ▼
integration gateway ──► radio-events adapter ──► event bus
                                                     │
                                          ┌──────────┴───────────┐
                                          ▼                      ▼
                                     correlation             roster resolve
                              (event → incident, see below)  (unit id → person/apparatus)
                                          │                      │
                                          └──────────┬───────────┘
                                                     ▼
                                    incident.comms facet  (talkgroup, event refs, mayday)
                                                     │
                                                     ▼
                                   unified incident view · mayday → notification fan-out
```

## Boundaries we will hold on the ingestion side

These are the console's boundaries; we accept them and design *not* to violate them:

- **No audio required.** Ingestion never requires audio. If an agency knowingly
  enables recording, that's a separate opt-in path carrying a *pointer/reference*
  at most — never inline content, never required. Keeps CJIS scope minimal.
- **No keys, ever.** We consume the `encrypted` boolean (metadata) and nothing more.
- **Correlation is ours.** We never expect the console to tag events with incident IDs.
- **Raw unit IDs are authoritative input.** The roster resolves them; `alias` is a
  non-authoritative hint we don't rely on.

## Correlation model (platform-owned)

Primary key: **talkgroup ↔ incident binding established at dispatch.** When CAD
dispatches an incident it knows the assigned talkgroup(s); an event on talkgroup T
at time t maps to the incident currently bound to T. Fallbacks, in order:

1. the emitting unit's current CAD assignment (unit → incident);
2. time-window + site;
3. otherwise store as an **unassigned radio event** — queryable and reconcilable
   later, **never dropped**.

## Delivery

**At-least-once with dedupe on `event_id`.** Non-negotiable for `emergency`/mayday:
retry until acked; we are idempotent on `event_id`, so duplicates are a non-event and
a lost mayday is unacceptable. Preferred transport is a durable stream (NATS JetStream
or a Redis stream) with an HTTP-webhook-with-retry fallback for small deployments.
**Order and detect gaps by `(session_id, seq)` — never by `timestamp`** (millisecond
ties are possible and a clock can step). A new `session_id` means the console
restarted; the gap detector resets its expectation on it rather than alarming.

## Event envelope — FROZEN at schema_version 1.0

Transport-agnostic JSON. This is the frozen contract; the console repo holds the
identical one. Envelope changes require bumping `schema_version` (that's what it's for).

```json
{
  "schema_version": "1.0",
  "event_type": "ptt_start | ptt_end | emergency | unit_registration | unit_deregistration | talkgroup_affiliation | call_grant | call_end",
  "event_id": "uuid-v4 — global idempotency key",
  "session_id": "uuid-v4 — one per console emitter run",
  "seq": 42,
  "timestamp": "2026-08-20T20:31:04.512Z",
  "source": "open-p25-console",
  "clock_synced": true,
  "radio_system": { "wacn": "BEE00", "system_id": "ABC", "rfss_id": "01" },
  "unit":       { "id": "1234567", "alias": null },
  "talkgroup":  { "id": "101", "alias": null },
  "emergency":  false,
  "encrypted":  true,
  "call_id":    "uuid — present on ptt_*/call_* events, null otherwise"
}
```

**Representation locks (agreed — the platform holds these):**

- **IDs are opaque strings; never JSON numbers.** `wacn` / `system_id` / `rfss_id` are
  uppercase **hex** strings; `unit.id` / `talkgroup.id` are **decimal** strings. The
  platform **stores and matches them as opaque strings** — it never parses, does
  arithmetic on, or re-bases any ID, so the hex/decimal split can't cause a mismatch.
- **`schema_version`** — lets either side evolve the envelope without breaking the other.
- **`session_id` + `seq`** — `seq` is monotonic within a `session_id` (starts at 1);
  `event_id` stays the global idempotency key. Order/gap-detect by `(session_id, seq)`.
- **`clock_synced`** — nullable: `true`/`false` when the console knows whether its clock
  was NTP-disciplined, `null`/absent when it doesn't. Never required; stored with a
  mayday record for evidentiary weight. Console `timestamp` is authoritative for *when*;
  the platform also records receipt time.
- **`encrypted`** — pure traffic metadata: "the call was in protected/secure mode."
  Says nothing about keys; implies no decryption. Surfaced as a badge, nothing more.
- **`emergency`** — a distinct `event_type: "emergency"` carries the mayday *event*; the
  `emergency` boolean on `ptt_*` / `call_*` flags emergency-mode traffic. Alert on the
  event, flag the surrounding traffic.
- **Field presence** — `unit.alias` / `talkgroup.alias` are nullable optional hints
  (roster wins, always); `call_id` present on `ptt_*` / `call_*`, absent/null on
  registration events; everything else always present. Alias-absent and call_id-absent
  are normal, never a parse error.

Event types the console can produce, by incident-record value: `emergency` (highest;
mayday), `ptt_start`/`ptt_end` (traffic timeline), `unit_registration`/
`unit_deregistration` (presence), `talkgroup_affiliation`, `call_grant`/`call_end`.

## Timeline is drop-tolerant (best-effort ends)

A radio can drop mid-transmission (out of range, dead battery, RF loss), so a `ptt_end`
(or `call_end`) may never arrive. The comms-facet timeline **tolerates a `ptt_start` /
`call_grant` with no matching end**: each open transmission carries the platform's own
silence/timeout heuristic and **auto-closes, marked *closed-by-timeout* rather than
*closed-by-event*** — so a dropped radio never leaves a channel "open" forever and the
record shows why it closed. The console emits a synthesized end on silence where it can;
when that arrives it simply supersedes the heuristic close.

## What this means for platform work now

Nothing to build yet — but two data-model choices are cheap to bake in early:

1. **Give the incident model a `comms` facet** — talkgroup id(s), an ordered list of
   radio-event references, and mayday events — so radio traffic has a home the moment
   the console can emit it.
2. **Treat the roster as the resolver** for radio unit IDs, alongside its existing
   person/apparatus duties.

When the console is ready, integration is a small adapter on each side, not a rewrite.
