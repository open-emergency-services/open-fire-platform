# ADR-0005: Tiered APIs — essential / regular / experimental

**Status:** Accepted
**Date:** 2026-08-21
**Deciders:** Maintainer (solo, for now)
**Refines:** ADR-0001 (API-first, headless core)
**Slots into:** ADR-0004 (recording core + read model + split-anywhere topology)

## Context

ADR-0001 made every capability reachable only through a versioned API. But a single
API with a single stability policy forces a bad choice: either you freeze everything
(and can never modernize) or you let everything move fast (and can never promise
integrators — or a department that built against it — that anything will still work next
year). A life-safety records system needs *both*: a tiny set of endpoints that are as
stable and reliable as the Core, and a larger set that's free to evolve.

The maintainer's framing: one API server that's "ultra reliable like the core, but
limited — essential only"; a second that's "richer, updated more often, more modern, but
not experimental"; and room beyond that for "internal experimental builds, or even
individual department customization." That's three tiers with three different promises.

## Decision

Split the API into **three tiers**, each its own deployable service (per ADR-0004), each
with an explicit and different stability guarantee:

### Tier 1 — Essential API (frozen, ultra-reliable)

The smallest possible set of endpoints that **must always work**, even if everything
richer is down. It carries the ADR-0001 "core can be abandoned and still function"
promise. Deliberately minimal and rarely-changing — a sibling to the Core in spirit.

Contents (the bar is high; see governance):
- **Ingest** — the thin, logic-free write endpoint that records an event to the Core
  (ADR-0004). The write path.
- **Read an incident / list incidents** — basic record retrieval.
- **Export** — full data export, always available (data-ownership; ADR-0001).
- **Health / readiness.**
- (The urgent alert *stream* is its own service per ADR-0002/0004; the Essential tier
  references it but does not own it.)

**Stability policy:** frozen contract at `/api/v1`. Additive-only within a version;
a breaking change means a new version with a **years-long** overlap. Changes are rare and
deliberate.

### Tier 2 — Regular API (evolving, modern, production-grade)

Everything a real deployment needs day to day that isn't life-and-death: search and
filtering, dashboards and rollups, scheduling, inspections, hydrants, reporting,
convenience aggregations for the UI. Updated often, modernized freely — but **not
experimental**; it's production-quality and integrators can rely on it within its
versioning promise.

**Stability policy:** versioned (`/api/v2`, `/v3`, …) and allowed to iterate faster than
Tier 1, with real but **shorter** deprecation windows. Breaking changes are managed, not
forbidden.

### Tier 3 — Experimental APIs (unstable, sandboxed, possibly many)

Where new modules are trialed, where AI features or integrations are evaluated, and where
**a department customizes** with its own endpoints — without forking the project or
risking Tiers 1–2. There can be **several** experimental services running at once
(including per-department ones).

**Stability policy:** **no stability guarantee.** Clearly namespaced (e.g.
`/api/experimental/…`) and marked unstable in docs and in responses (a header such as
`X-OFP-Stability: experimental`). May change or disappear without notice; not for
production dependence. Clients opt in knowingly.

### How the tiers relate (data flow)

- **Reads** in all tiers come from the **read model** (the projection, ADR-0004), never
  the Core directly.
- **Writes** happen only through the **Essential tier's ingest** to the Core. Regular and
  Experimental tiers cause change by *calling ingest* (or emitting events), never by
  writing to the Core themselves. This keeps the write path minimal, owned by the one
  frozen tier, and impossible for a fast-moving or experimental tier to corrupt.
- Each tier is a **separate stateless service**: its own failure domain, its own ≥2
  replicas behind the load balancer (ADR-0004), independently deployable and scalable.

### Blast-radius rule

A bug, overload, or bad deploy in the **Experimental** tier cannot affect the **Regular**
tier; a problem in **Regular** cannot affect **Essential**; nothing in any API tier can
affect the **Core** or the **urgent alert** path. Criticality increases inward, and each
inner ring is protected from the churn of the outer ones.

## Options Considered

### Option A — One API, one stability policy
**Pros:** simplest; one thing to build and document. **Cons:** forces the frozen-vs-fast
choice the whole ADR exists to avoid; either essentials can't be promised stable, or the
product can't modernize. **Rejected.**

### Option B — Two tiers (stable + everything else)
**Pros:** simpler than three; captures most of the benefit (a frozen essential set + an
evolving rest). **Cons:** no sandbox — experiments and per-department customization would
live in the same tier real deployments depend on, so a half-baked trial or a department's
custom endpoint shares a failure domain and a stability promise with production features.
**Rejected** in favor of C, which adds the isolated experimental ring cheaply.

### Option C — Three tiers: essential / regular / experimental (chosen)
**Pros:** each promise is honest and separate; experiments and customization are isolated
from production; matches the maintainer's intent and the ADR-0004 topology exactly.
**Cons:** more services to run and route; versioning discipline across tiers; a standing
temptation to let the Essential tier grow (mitigated by governance below).

## Trade-off Analysis

The cost is more surface and more discipline; the benefit is that each audience gets a
truthful promise — integrators and departments can build on Tier 1 for a decade, use
Tier 2 with normal versioning care, and play in Tier 3 knowing it's sand. The failure
that matters most (something taking down the essentials or the Core) is structurally
prevented by making the tiers separate services with criticality increasing inward. The
main risk is **Essential-tier scope creep** — every feature will want to be "essential."
That's a governance problem, addressed head-on below, not a reason to avoid tiering.

## Consequences

**Easier:** honest stability promises per audience; safe experimentation and
per-department customization; blast-radius isolation; independent scaling/deploy of each
tier; the Essential tier stays small enough to be truly reliable.

**Harder:** more services to deploy, route, and monitor; per-tier versioning/deprecation
policy to maintain; routing/namespacing scheme to design; the discipline to keep Tier 1
minimal.

**To revisit:** the exact routing scheme (path prefix vs subdomain per tier); whether the
Regular tier is one service or several feature-services; how per-department Experimental
deployments are provisioned; shared libraries vs duplicated contracts across tiers.

## Governance — keeping the Essential tier small

Adding an endpoint to the **Essential** tier requires a high bar, applied deliberately:

1. **Life-safety or data-ownership** — it must be something that has to work when
   everything richer is down (recording, basic read, export, health). If a department can
   survive it being briefly unavailable, it's **Regular**, not Essential.
2. **Freeze commitment** — adding it means committing to freeze it (years-long stability).
   If you're not ready to freeze it, it isn't Essential yet.
3. **Default to Regular.** New capability lands in Regular (or Experimental) by default;
   promotion to Essential is a rare, explicit decision.

## Action Items

1. [x] Define the exact Essential endpoint set and freeze it at `/api/v1` (ingest, read
       incident/list, export, health/readiness). *(Done: generic `POST /api/v1/ingest`
       (`apps/api/src/ingest/`), incident reads/export, and the liveness/readiness split
       (`apps/api/src/health/`) with graceful drain. Frozen surface: [ESSENTIAL-API.md](../api/ESSENTIAL-API.md).)*
2. [ ] Choose the routing/namespacing scheme (path prefix per tier is the likely default:
       `/api/v1` essential, `/api/v2…` regular, `/api/experimental/…` experimental).
3. [ ] Set per-tier versioning + deprecation policy (Essential: years; Regular: shorter;
       Experimental: none) and document it for integrators.
4. [ ] Mark Experimental responses unstable (`X-OFP-Stability: experimental`) and keep it
       out of the published stable contract / OpenAPI for Tiers 1–2.
5. [x] Enforce the write rule in code: only the Essential ingest writes to the Core;
       Regular/Experimental cause change via ingest or events. *(In-process teeth done:
       `core/core-write-invariant.spec.ts` fails CI if any module outside the sanctioned
       allowlist calls `store.append`, or if the store gains an UPDATE/DELETE path — the
       Core stays append-only and Core-writes stay confined. The physical tier split
       (Regular reaching the Core only via the ingest network call) is deployment, D-series.)*
6. [ ] Deploy each tier as its own stateless service (≥2 replicas behind the LB, ADR-0004);
       add a per-department Experimental deployment pattern.
7. [ ] Add the governance bar (above) to CONTRIBUTING so "make it Essential" has a gate.
