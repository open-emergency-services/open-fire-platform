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
- A **`comms` facet on the incident model** (talkgroup ids, radio-event references,
  mayday events) — the landing spot for the planned radio seam. Cheap to bake in now.
- AGPLv3 §13: any hosted deployment must offer users a link to the running (modified) source — add a visible "Source" link in the UI before offering managed hosting.

## Planned integration: radio events

`open-p25-console` (the sibling radio project) will feed radio events — push-to-talk,
unit affiliation, and the emergency/"mayday" button — one way into the incident record,
landing on the `comms` facet. It's a single adapter on the integration gateway, agreed
pre-code so both projects design toward the same interface. Full spec:
[`INTEGRATION-RADIO-SEAM.md`](./INTEGRATION-RADIO-SEAM.md).

## Standards references

- NERIS framework: https://github.com/ulfsri/neris-framework
- NERIS API docs: https://api.neris.fsri.org/v1/docs
- Official NERIS clients: https://github.com/ulfsri/neris-api-client (Python) ·
  https://github.com/ulfsri/neris-nodejs-client (Node/TS)
