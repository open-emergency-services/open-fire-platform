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

- Replace the in-memory incident repo with Postgres (docker-compose provisions it).
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
