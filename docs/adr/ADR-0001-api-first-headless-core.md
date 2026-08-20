# ADR-0001: API-first, headless core

**Status:** Accepted
**Date:** 2026-08-20
**Deciders:** Maintainer (solo, for now)

## Context

The platform's whole reason to exist is anti-lock-in: a department owns its data and
its tools, and no vendor can take the software, close it, and resell it. Two forces
follow from that mission and shape this decision.

1. **Longevity under a solo/small maintainer.** This is built by one person for now.
   Interfaces (web UI, mobile, integrations) move fast and rot fast; the core data and
   compliance logic (NERIS reporting, the incident system-of-record, the comms facet)
   changes slowly and must keep working for years — even if development stalls. The
   architecture has to let the *core* be frozen or abandoned and still function, while
   the *interface* is replaced or modernized on its own clock.

2. **A single, unified interface over many modules** (the stated product goal), plus
   sibling projects (`open-p25-console`) and third parties that need to integrate. That
   only works if there is one well-defined contract everything talks to, rather than
   each surface reaching into the core its own way.

The existing scaffold already leans this way: the NestJS app exposes incidents and the
comms facet through thin REST controllers, with all logic in services (proven by the
comms tests, which drive the services directly). This ADR makes that an explicit,
binding rule rather than an accident of the scaffold.

## Decision

**Every platform capability is exposed exclusively through a versioned HTTP API. The
interface — any interface — is a client of that API and holds no privileged access and
no business logic. The API contract is the product's stable surface.**

Concretely:

- **One contract, versioned.** The public surface is namespaced (`/v1/…`) and treated as
  a compatibility contract: additive changes within a version, breaking changes only on a
  new version, with an explicit deprecation window.
- **No backdoors.** The UI (and every other client) reaches data and actions *only*
  through the API. No client talks directly to the database; no logic that matters lives
  in a client. If a capability isn't in the API, it doesn't exist.
- **Auth/authz at the API boundary.** CJIS-grade access control is enforced at the API,
  not in the UI. A different or hostile client changes nothing about what's permitted.
- **The local DB stays system-of-record** (per ARCHITECTURE.md); the API is the way in
  and out, and full export is always an API call away.
- **Streaming is part of the API, not an exception.** Real-time needs (mayday, live
  radio traffic, incident updates) are served by a streaming surface on the same
  contract (SSE / WebSocket / durable stream), not by a side channel that bypasses it.

## Options Considered

### Option A: API-first, headless core (chosen)

The core is a headless service exposing a versioned API; every UI/integration is a client.

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium — a real contract to design, version, and document |
| Cost | Upfront: versioning + OpenAPI discipline. Ongoing: honor the contract |
| Scalability | High — clients, integrations, and modules scale independently |
| Team familiarity | High — standard REST/NestJS; already the scaffold's shape |
| Mission fit | Strong — durability, data ownership, integration all fall out of it |

**Pros:**
- Core can be **frozen/abandoned and still function**; interfaces evolve independently.
- One contract serves the unified UI, mobile, `open-p25-console`, and third parties alike.
- Data ownership and export are structural, not bolted on.
- Headless = testable headlessly (the API *is* the acceptance surface).
- Auth centralized at one boundary — the right place for CJIS.

**Cons:**
- Versioning/compatibility is now a **hard, permanent commitment** — the main cost.
- Slightly more moving parts than a coupled app (a separate client, an HTTP hop).
- Real-time UX needs a deliberate streaming surface, not just request/response.

### Option B: Coupled application (server-rendered or UI-with-privileged-access)

UI and core ship as one unit; the UI may render server-side and/or read the database
directly; logic is split between UI and server.

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low to start, high later |
| Cost | Cheap upfront, expensive to decouple once entangled |
| Scalability | Low — every new surface re-implements access to the core |
| Team familiarity | High |
| Mission fit | Weak — the interface *is* the product; abandonment kills the whole thing |

**Pros:** Fastest to a first screen; fewer parts; no contract to maintain early.
**Cons:** The interface and core rot together — exactly the failure mode this mission
can't afford. Integrations and a second client (mobile, the radio console) each become a
special case. Directly contradicts "core survives the interface."

### Option C: API-first with a GraphQL/BFF gateway instead of REST

Same headless principle, different contract shape (a GraphQL gateway or a per-client
backend-for-frontend).

**Pros:** Flexible client-driven queries; can reduce over-fetching for a rich UI.
**Cons:** More machinery and a steeper contract to keep stable for a solo maintainer;
weaker fit with the already-REST NERIS/console seams. Deferred, not rejected — a
read-optimized gateway can sit *in front of* the v1 REST API later without violating
this ADR.

## Trade-off Analysis

The decision trades **upfront and ongoing contract discipline** (Option A's real cost)
for **independent evolution and survivability** (Option A's whole point). For a normal
VC-backed product, Option B's speed might win. For *this* product the calculus inverts:
the interface is the most disposable part and the core must outlive it, so coupling them
(Option B) sacrifices the one property the mission depends on. Option C keeps the same
principle but adds machinery a solo maintainer doesn't need yet; REST first, a gateway
later if a client demands it — and it layers on top without breaking the contract.

The one genuine sharp edge is that "everything through the API" now includes real-time:
a mayday can't wait for a poll. That doesn't weaken the rule; it means the API contract
must include a streaming surface from the start, so real-time stays *inside* the
contract rather than becoming the first backdoor.

## Consequences

**Easier:**
- Swapping, rewriting, or adding interfaces (web, mobile, kiosk) with zero core changes.
- Onboarding integrations (`open-p25-console`, CAD feeds, third parties) — all just clients.
- Running an old, unmaintained deployment that still works and still exports.
- Testing: the API is the contract and the acceptance surface.

**Harder:**
- Every feature is now "design the endpoint(s) first, then the UI" — no UI shortcuts.
- API versioning and deprecation become a standing responsibility.
- Real-time features require a deliberate streaming design, not ad-hoc pushes.

**To revisit:**
- When/whether to introduce a GraphQL or BFF gateway (Option C) in front of v1.
- The exact streaming transport (SSE vs WebSocket vs durable stream) per use case.
- API auth model specifics (OIDC/Keycloak) as CJIS requirements firm up.

## Action Items

1. [ ] Introduce a `/v1` prefix and treat it as the compatibility boundary.
2. [ ] Generate and publish an OpenAPI spec from the NestJS app; keep it in CI.
3. [ ] Build the UI as a **separate client app** that talks only HTTP — no DB access,
       no privileged path. Establish this before the first screen exists.
4. [ ] Add a streaming surface to the contract for mayday / live incident updates
       (SSE or WebSocket), so real-time stays inside the API.
5. [ ] Keep auth/authz enforcement at the API boundary (OIDC/Keycloak), never in a client.
6. [ ] Add a "public API contract" note to CONTRIBUTING so the rule is visible to anyone
       who shows up: if it isn't in the versioned API, a client can't rely on it.
