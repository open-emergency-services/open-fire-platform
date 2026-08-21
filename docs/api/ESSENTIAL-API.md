# Essential API (frozen) — `/api/v1`

The **Essential tier** (ADR-0005): the smallest set of endpoints that must always work,
even when everything richer is down. This is the frozen contract — additive-only within
`v1`, breaking changes only on a new version with a years-long overlap. If it isn't here,
a client can't assume it's stable.

## The frozen surface

| Method & path | Purpose | Notes |
|---|---|---|
| `POST /api/v1/ingest` | Universal write to the Core | Thin, logic-free; commits any well-formed event to the log (ADR-0006). Idempotent on `event_id`. |
| `GET /api/v1/incidents` | List incidents | Read model (projection). |
| `GET /api/v1/incidents/:id` | Read one incident | Includes the comms facet. |
| `GET /api/v1/incidents/export` | Full export | Data-ownership guarantee — always available. |
| `GET /api/v1/alerts/stream` | Real-time alert stream (SSE) | Delivered by its own stateless service (ADR-0002); referenced here as essential. |
| `GET /api/v1/health` | Overall status | Human/monitoring. |
| `GET /api/v1/health/live` | Liveness | Process up (restart if it fails). |
| `GET /api/v1/health/ready` | Readiness | 200 ready, **503 while draining** — the LB probe (ADR-0004). |

## `POST /api/v1/ingest`

The always-works write path. Body:

```json
{
  "source": "cad",
  "source_type": "incident.update",
  "event_id": "optional-uuid (generated if absent)",
  "schema_version": "optional",
  "occurred_at": "optional ISO8601",
  "raw": { "...": "the COMPLETE payload — stored verbatim, lossless" },
  "mapped_keys": ["optional list of raw keys to promote into normalized"],
  "correlation": { "incident_id": "optional platform link" }
}
```

Returns `{ seq, event_id, duplicate }`. Everything in `raw` is preserved; any key not in
`mapped_keys` is also recorded in `unmapped` (ADR-0006) — so a field with no slot is never
lost. No business logic runs here; typed adapters (radio, incident) do their own richer
ingest, but this generic path guarantees capture for any source.

## What is NOT Essential (yet)

Currently present but **Regular-tier / typed-adapter** endpoints, not part of the frozen
set (they'll be formally grouped under the Regular tier, ADR-0005):

- `POST /api/v1/incidents`, `/incidents/:id/validate`, `/incidents/:id/submit` — the
  guided incident workflow (Regular).
- `POST /api/v1/comms/radio-events` and the comms binding/roster endpoints — the radio
  seam's typed adapter (writes to the Core, richer than generic ingest).

## Freeze policy

- **Additive-only** within `/api/v1`: new optional fields and new endpoints are fine; no
  field is removed or repurposed, no response shape narrowed.
- **Breaking change → `/api/v2`** with a long overlap; `/api/v1` keeps working.
- Changes here are rare and deliberate; the Essential tier is meant to be boring and
  permanent (governance bar in CONTRIBUTING).
