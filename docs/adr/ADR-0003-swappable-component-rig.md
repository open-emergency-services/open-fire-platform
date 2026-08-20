# ADR-0003: Swappable-component rig — fake and real parts in the same harness

**Status:** Proposed
**Date:** 2026-08-20
**Deciders:** Maintainer (solo, for now)
**Related:** ADR-0001 (API-first, headless core), ADR-0002 (SSE alert transport)

## Context

The `docker compose` demo runs the whole chain with fake parts: a simulator stands in for
the radio console and CAD, storage is in-memory, the interface is a static viewer. The
idea here: make the harness **configurable so any one fake part can be replaced by a real
one** — plug in a real radio, point at a real CAD feed, switch to Postgres, drop in the
real UI — and test either the whole loop or a single part in isolation.

This is cheap to do because of decisions already made. Every boundary is HTTP plus a
frozen contract (the v1.0 radio envelope, the incident API). A component is defined by the
contract it speaks, not by what's behind it — so "fake" and "real" implementations are
interchangeable at the seam. The rig just formalizes that each box is a *slot*.

## Decision (proposed)

Treat the compose file as a **rig of slots**, each fillable by a fake or a real
implementation that speaks the same HTTP contract. Selection is by Compose **profiles**
plus optional **override files**, so the default stays the zero-config demo and a real
part is opted in explicitly.

### The slots

| Slot | Fake (demo default) | Real drop-in | Contract at the seam |
|---|---|---|---|
| Radio events | `simulator` container | **open-p25-console** against a real P25 core, or a bridge (SDR + decoder) → adapter | `POST /comms/radio-events` (frozen v1.0 envelope) |
| Dispatch / CAD | simulator's dispatch step | real CAD feed adapter | `POST /incidents` + `/comms/bindings/talkgroup` |
| Storage | in-memory | `db` (Postgres, already staged) | internal repository interface |
| Interface | static `web` viewer | the real UI client, a mobile app, a station-alerting box | `GET /incidents` + SSE `/alerts/stream` |
| NERIS | simulation mode (no creds) | real NERIS test/prod creds | the NERIS gateway (already env-gated) |
| Alert sink | the viewer's EventSource | any SSE consumer (pager bridge, house-lights, PA) | SSE `/alerts/stream` |

Because each slot is an HTTP boundary, the core (`api`) never changes as slots are
swapped — that's the ADR-0001 property paying off.

### Plugging in a real radio (the headline case)

A real radio doesn't speak our envelope; something has to translate. That translator is
exactly the sibling **open-p25-console** project (radio-facing), or, short of a full CSSI
console, a small bridge: an SDR / trunked-radio decoder producing call events, adapted to
the frozen envelope and POSTed to `/comms/radio-events`. Either way, from the core's point
of view it is just "the radio-events source," identical to the simulator. So the path to
hardware-in-the-loop is: **run the console/bridge container in the `radio` slot instead of
the simulator, pointed at the real gear.** No core code moves.

### Testing individual parts in isolation

The same rig runs partial systems:

- **Core only:** bring up `api` and hit it with `curl` (or the simulator once), inspect
  `/incidents`, watch `/alerts/stream`. No UI, no radio.
- **Radio source only:** run a real console/bridge against `api` with the viewer open —
  see whether real traffic correlates and renders, nothing else in play.
- **Interface only:** point the viewer at a running `api` seeded by one simulator run, and
  iterate on the UI with no live source.
- **Storage swap:** flip the storage slot to Postgres and re-run the same scenario to
  confirm behavior is identical to in-memory.

Each is `docker compose up <subset>` or a profile — the boundaries make the parts
independently testable.

## Options Considered

### Option A: Compose profiles + override files (proposed)

Slots are chosen with `--profile` (e.g. `demo`, `live-radio`, `postgres`) and/or
`-f docker-compose.yml -f docker-compose.live.yml`. Default `up` stays the fake demo.

**Pros:** native to Docker Compose; no new tooling; default stays zero-config; a slot is
opted into explicitly; real and fake can even run side by side for comparison.
**Cons:** a bit of compose sprawl; profiles are a learning curve for newcomers (mitigate
with DEMO/rig docs and a short `make` target per configuration).

### Option B: One monolithic compose with everything wired, toggled by env only

**Pros:** one file. **Cons:** every optional real service (radio bridge, Postgres wiring)
is always present and must be defensively disabled; the default demo gets heavier and more
fragile. Rejected in favor of profiles.

### Option C: Separate compose files per configuration (demo / lab / prod-ish)

**Pros:** each file is self-describing. **Cons:** duplication drifts out of sync; the
shared core definition gets copied. Partially adopted — the *base* is shared and only the
*differences* live in override files (which is Option A).

## Trade-off Analysis

The real question is where the fake-vs-real choice lives. Putting it in **profiles/overrides
(A)** keeps the default demo pristine while making a real part a deliberate, documented
opt-in — which matches how this will actually be used (mostly demo; occasionally "let me
wire my radio in"). It leans entirely on boundaries that already exist, so it adds
configuration, not architecture. The cost is some compose files to keep tidy; cheap next to
the benefit of a rig where hardware and software parts drop into a known-good loop.

## Consequences

**Easier:**
- Hardware-in-the-loop: a real radio/console tests against the exact same core the demo uses.
- Isolated testing of any one part, against fakes for everything else.
- A believable path from "demo in a box" to "pilot at a real department" — swap slots one at
  a time, de-risking each.

**Harder:**
- More compose surface (base + overrides + profiles) to document and maintain.
- Real slots bring real concerns the fakes hide: auth on the stream (ADR-0002 item), CJIS
  scope once real unit/person data flows, and **safety** — a real mayday path must be
  tested deliberately and never in a way that could be mistaken for a live emergency.

**To revisit:**
- Whether the storage slot needs a defined repository interface before the Postgres swap
  (likely yes — do that with the Postgres step).
- Whether a thin "radio bridge" reference (SDR/decoder → envelope) belongs in this repo or
  in `open-p25-console`.

## Action Items

1. [ ] Put the `simulator` in a `demo` profile and define a `radio` slot the real console
       can fill; keep default `up` = demo.
2. [ ] Add a `docker-compose.live.example.yml` showing the radio slot pointed at a real
       console/bridge, and a `postgres` profile that wires storage to the `db` service.
3. [ ] Define the storage repository interface so in-memory and Postgres are true drop-ins.
4. [ ] Document each configuration (a short `make demo` / `make live-radio` per rig) and the
       safety note for exercising a real mayday path.
5. [ ] Decide where the SDR/decoder → envelope bridge reference lives (here vs open-p25-console).
