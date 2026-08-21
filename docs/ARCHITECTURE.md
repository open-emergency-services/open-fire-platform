# Architecture (Wave 0)

This scaffold implements the beachhead described in the platform blueprint: free
**NERIS fire incident reporting** for small and volunteer departments, built so
the department always owns its data.

## Shape

```
packages/neris-schema     ← generates TS types from the NERIS framework (codegen)
apps/api                  ← NestJS API
  health/                 ← liveness
  neris/                  ← NerisGateway: OAuth2 + validate/create/list
  incidents/              ← local system-of-record + submission state machine
```

## See it run

`docker compose up --build`, then open http://localhost:8080 — a virtual system plays
synthetic radio traffic (including a mayday) through the whole chain to a live interface.
Run it: [DEMO.md](./DEMO.md). How it fits together (diagrams): [VIRTUAL-SYSTEM.md](./VIRTUAL-SYSTEM.md).
Making the rig swap fake parts for real ones (incl. a real radio):
[ADR-0003](./adr/ADR-0003-swappable-component-rig.md).

## Design decisions (ADRs)

- [ADR-0001: API-first, headless core](./adr/ADR-0001-api-first-headless-core.md) —
  every capability is exposed only through a versioned API; the interface is a client
  with no privileged access and no logic. The core can be frozen/abandoned and still
  function while interfaces evolve independently. **Binding rule, not a preference.**
- [ADR-0002: Real-time transport — SSE](./adr/ADR-0002-realtime-transport-sse.md) —
  alerts (a mayday) are delivered live over Server-Sent Events, an open web standard, with
  the event separated from its transport so nothing proprietary sits on the alert path.
  Scaffolded in `apps/api/src/events/`; the radio-seam mayday publishes to it.
- [ADR-0003: Swappable-component rig](./adr/ADR-0003-swappable-component-rig.md)
  *(proposed)* — make the compose demo a rig of HTTP-boundary "slots" so any fake part
  (radio source, storage, interface) can be replaced by a real one — including plugging in
  a real radio via open-p25-console or an SDR bridge — with no core changes.
- [ADR-0004: Recording Core + read model + HA + topology](./adr/ADR-0004-recording-core-read-model-ha-topology.md)
  — append-only Core (source of truth) on Postgres, a derived read model built by a
  projector, the alert path tapping the Core so life-safety is independent of the read
  side; Core is HA (RPO 0), the read model recovers fast (hot-standby promote); every
  component splittable logically/physically from day one (Level 1 floor, Level 2 built in);
  urgent delivery is its own stateless service; everything stateless runs ≥2 behind an
  LB-agnostic load balancer.
- [ADR-0005: Tiered APIs](./adr/ADR-0005-tiered-apis.md) — split the API into three tiers
  with three stability promises: **Essential** (frozen, life-safety + data-ownership only),
  **Regular** (evolving, production-grade), **Experimental** (unstable, sandboxed, possibly
  per-department). Criticality increases inward; only the Essential ingest writes to the Core.
- [ADR-0006: Capture-everything ingestion](./adr/ADR-0006-capture-everything-ingestion.md)
  — every inbound event stored as **raw** (complete, verbatim, lossless) + **normalized**
  (typed slots) + **unmapped** (raw keys not yet mapped). Nothing is ever dropped, even data
  with no slot; adding a field later is a reprocess, not a re-collection. The map of known
  slots is [DATA-CAPTURE-INVENTORY.md](./DATA-CAPTURE-INVENTORY.md).

## Module catalog (screens to build)

Every kind of record the system can capture — incident documentation, incident analysis,
community risk reduction (hydrant maintenance, community events, inspections), personnel
health & safety, and department/master data — organized as the menu of future data-entry
screens, each mapped to its generated NERIS interface: [MODULE-CATALOG.md](./MODULE-CATALOG.md).
All schema-ready; screens/endpoints are the backlog.

## The two load-bearing ideas

1. **Generate from the standard.** `packages/neris-schema/scripts/generate.mjs`
   reads the published NERIS framework and emits the incident field interface,
   the minimal-record (`neris_core`) field list, and the incident-type hierarchy.
   When FSRI revises the schema, re-run — don't hand-edit. This turns "keep pace
   with a moving federal target" into a pipeline.

2. **Local DB is the system of record; NERIS is a sync target.** Incidents live
   their whole life locally (`IncidentStatus`: draft → validated → queued →
   submitted → accepted/rejected). Full export is always available. NERIS
   outages never block authoring, and departments can never be locked in.

## What to build next (Wave 0 → 1)

- ~~Replace the in-memory incident repo with Postgres.~~ **Done** — the Core event log is
  Postgres-backed when `DATABASE_URL` is set (in-memory otherwise); migrations run on boot,
  and the read model is **rebuilt from the persisted log on startup** (a restart loses
  nothing). Verified: events survive a full process restart and the read model reconstructs
  from them; the log is append-only (UPDATE/DELETE blocked by trigger). Reference data (the
  roster) is loaded separately, not from the event log.
- Add Keycloak (OIDC) and resolve `departmentId` from the session, not a header.
- Schema-driven incident form UI generated from `@ofp/neris-schema`.
- The unified UI shell (§2.6 of the blueprint) that later modules render inside.
- CAD-feed ingestion adapters to pre-fill incidents.
- AGPLv3 §13: any hosted deployment must offer users a link to the running (modified) source — add a visible "Source" link in the UI before offering managed hosting.

## Integration: radio events (comms facet) — scaffolded

`open-p25-console` (the sibling radio project) feeds radio events — push-to-talk, unit
affiliation, and the emergency/"mayday" button — one way into the incident record,
landing on the incident's **`comms` facet**. The envelope is frozen at schema_version
1.0; full spec in [`INTEGRATION-RADIO-SEAM.md`](./INTEGRATION-RADIO-SEAM.md).

The platform side is scaffolded in `apps/api/src/comms/`:

```
comms/
  radio-event.ts     ← the frozen v1.0 envelope type + structural validator
  comms-facet.ts     ← the incident's comms facet (transmissions, maydays, presence)
  correlation.ts     ← talkgroup↔incident binding (set at dispatch) + unit fallback
  roster.ts          ← platform-owned unit-id → person/apparatus resolver
  comms.service.ts   ← ingest: validate → dedupe(event_id) → correlate → resolve → apply
  comms.controller.ts← POST /comms/radio-events (webhook binding of the seam)
```

Guarantees enforced and tested (`comms.service.spec.ts`): at-least-once with dedupe on
`event_id`; a mayday is never lost (stored unassigned if it can't be correlated); the
timeline tolerates an unmatched `ptt_start` and auto-closes it on a silence timeout.
Wave-0 storage is in-memory and the durable-stream transport is not wired yet — the
HTTP endpoint is the working path today.

## Standards references

- NERIS framework: https://github.com/ulfsri/neris-framework
- NERIS API docs: https://api.neris.fsri.org/v1/docs
- Official NERIS clients: https://github.com/ulfsri/neris-api-client (Python) ·
  https://github.com/ulfsri/neris-nodejs-client (Node/TS)
