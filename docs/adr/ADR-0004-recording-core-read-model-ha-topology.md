# ADR-0004: Append-only recording Core, derived read model, HA, and split-anywhere topology

**Status:** Accepted *(specifics below confirmed)*
**Date:** 2026-08-21
**Deciders:** Maintainer (solo, for now)
**Refines:** ADR-0001 (API-first, headless core), ADR-0002 (SSE alert transport)
**Companion:** [ADR-0005](./ADR-0005-tiered-apis.md) (tiered APIs: essential / regular / experimental)

## Context

Robustness requirements gathered in design discussion, in the maintainer's own framing:

- The **write path must always keep going**, regardless of anything else failing.
- The concern is **process / failure-domain isolation**, *not* lock contention. Postgres
  MVCC already means a read never blocks a write, and the Core is append-only (writes
  only) — so the risk to protect against is a read-side *process* crashing, starving, or
  being redeployed and taking the write path down with it because they share an instance.
- **Life-safety (mayday) must not depend on the read side.**
- **Longevity / abandonment:** the Core must be able to keep recording and alerting even
  if the richer parts are neglected (ADR-0001).

These lead to a log-centric design (event sourcing + CQRS) on boring, proven storage
(**append-only on Postgres**, approved), with hard isolation and availability rules.

## Decision

**1. Append-only recording Core (source of truth).** An immutable, append-only event log
on Postgres. It does one thing: accept a well-formed event and durably append it. No
updates, no deletes, no business logic beyond minimal envelope validation. This is the
"very reliable, rarely changes" island.

**2. Derived read model ("Replica").** A separate database the APIs query for reads,
built by a **projector** service that consumes the Core log and materializes views
(incidents, comms facets, dashboards). It is *derived* — always reconstructable from the
Core — and is never the source of truth.

**3. The alert path taps the Core, never the read model.** The urgent/critical live
stream (mayday, ADR-0002) derives from the Core's committed log. Therefore **life-safety
is independent of the read model**: a dead Replica degrades dashboards and rich queries,
not the mayday reaching a screen. Delivery of that stream is its own service — see (10).

**4. Writes are the single commit point; everything else derives.** On ingest: append to
the Core (that commit is the truth), *then* fan out — urgent push to the alert stream, and
notification to the projector. No dual-write to two systems in parallel (that drifts);
one log, many consumers. (Corrects the naive "duplicate the write" instinct.)

**5. Topology is configuration; every component is independently deployable.**
Components: **Core**, **read Replica(s)**, **projector**, **stable API**, **regular API**,
**experimental API(s) (multiple)**, **notifier/fan-out**, and anything added later. Each
is its own deployable with a clean network boundary (HTTP, or the Postgres protocol) and
**no shared in-process state across seams**. The same build runs collapsed on one box or
spread across separate hardware — no code change, only configuration (endpoints / DSNs).

**6. Isolation ladder — Level 1 is the floor; Level 2 is always available.**
- **Level 0 (one instance, Core + read tables together): REJECTED for real use.** Dev/demo
  only, and explicitly labeled non-production. The Core and read side must not share a
  process in any deployment that matters.
- **Level 1 (baseline): Core and Replica are independent instances.** The minimum topology
  anyone runs for real. A read-side crash/starve/redeploy cannot touch the write path.
- **Level 2 (built in from day one): every component splittable logically and/or
  physically**, across separate hosts. Not required for small deployments, but the
  architecture must always permit it with no code change.

**7. Core High Availability (must-have).** The Core runs as a primary plus standby(s)
with **automatic failover** and **quorum-synchronous commit**: a write is acknowledged
only once at least one standby also holds it (**RPO = 0** — a committed mayday is never
lost on failover), with **≥ 2 standbys / quorum** so losing one standby does not stall
writes. This is what makes "the write always keeps going" survive a node loss.

**8. Read model very-fast recovery (must-have).** If a Replica dies during an emergency it
must return fast: primary strategy is **promote a hot standby** that is already streaming
and caught up (seconds, not a rebuild); run **multiple read replicas** so one failing does
not interrupt reads at all; backstop is **periodic snapshots** so a cold rebuild-from-log
is bounded to "since last snapshot," never all of history. Because the read model is
derived, total loss is always *recoverable* from the Core.

**9. Boundaries mandated in code from day one.** Writer code path → Core; reader code
paths → read model; each API tier and service its own module/deployable with a **versioned
network contract**. This is what makes moving up the isolation ladder (L1 → L2, add a
standby, add a read replica) a configuration/ops change, never an application rewrite.

**10. Urgent delivery is its own stateless service — the second-most-protected thing.**
The delivery of the urgent/critical stream (holding the live SSE connections and fanning
out maydays) is a **separate service** from the Core, for a hard reason, not just
preference: its workload (thousands of long-lived connections, slow clients, backpressure,
connection-count memory) is hostile to the Core's (fast sequential durable writes), so
co-locating them would let connection-handling trouble threaten the write path. It is a
**consumer of the Core's committed log** (post-commit, never in the write transaction), so
the Core commits durably first and this service delivers after — if it is slow, crashes,
or restarts, the Core never notices and the event is never lost; on recovery it catches up
from the log. Because its truth lives in the Core, it is **stateless**, which makes its HA
*cheap*: run ≥ 2 replicas, and a dropped client reconnects to any replica and replays via
`Last-Event-ID` (already built). Keep this service **deliberately minimal and rarely-
changing** — a small sibling to the Core in spirit. The richer *general* live-stream (the
`info` firehose to dashboards, which will grow features) is a **separate** service again,
so churn never touches the critical path.

> Corollary — cheap vs expensive HA: only the **Core** is stateful and pays for expensive,
> consensus-based HA (quorum + Patroni). Every other component (urgent delivery, projector,
> APIs, general stream) is **stateless** and gets HA for free by running more replicas.

**11. Everything stateless runs ≥ 2 behind a load balancer, and the LB is swappable.**
Mirroring the Core's "primary + ≥ 2 standbys," every stateless service runs **≥ 2 replicas
behind a load balancer** by default. The system is **load-balancer-agnostic**: it depends
on no specific LB and instead satisfies a generic **LB contract** so a local HAProxy, a
cloud ALB, Cloudflare, or a `cloudflared` tunnel all work unchanged. The LB contract:

- **Stateless + no session affinity** — any replica serves any request; a dropped client
  reconnects to any replica and replays (`Last-Event-ID`). No sticky sessions needed.
- **Health/readiness endpoints** the LB can probe (split liveness vs readiness).
- **Graceful draining** — a shutting-down replica flips to not-ready (LB stops new
  connections) then closes open SSE streams cleanly so clients reconnect elsewhere.
- **Honor forwarded headers** (`X-Forwarded-For`/`-Proto`) so the app sees the real client
  behind any proxy.
- **SSE requirements (where LBs bite):** no response buffering; LB idle timeout **>** our
  heartbeat (15s, already shorter than Cloudflare's ~100s and typical 30–60s LB timeouts);
  prefer **least-connections** over round-robin for long-lived streams.

Distinguish two kinds of balancing, do not conflate them: **stateless services** use
round-robin/least-connections with no affinity; the **Core** uses *primary-aware* routing
(writes → current primary via Patroni health, reads → standbys). HAProxy is the default
because it does both (it is also the standard Patroni front).

## Options Considered

### Option A — Collapsed single instance (Level 0)
One Postgres instance, Core + read tables together, guardrails (reserved writer pool,
`statement_timeout` on reads).
**Pros:** simplest; near-zero ops; fine on a $10 VPS. **Cons:** no process/failure-domain
isolation — a read-side crash, OOM, disk-full, or bad deploy takes the write path with it.
**Rejected** for real use (the maintainer's core requirement is exactly this isolation);
retained only as a dev/demo convenience, labeled non-production.

### Option B — Independent Core and Replica (Level 1) — **chosen baseline**
Core and read model as separate instances; APIs read the Replica, write the Core; alert
path taps the Core.
**Pros:** the read side cannot bleed into critical writes; life-safety independent of the
Replica; read model reconstructable from the Core. **Cons:** two instances to run; a
projector to maintain; more moving parts than A.

### Option C — Full split + HA everywhere (Level 2) — **capability, built in from day one**
Every component on its own host; Core HA (primary + quorum standbys + auto-failover); hot
standby read replicas.
**Pros:** maximum isolation and availability; scales to real production; life-safety
survives any single node loss. **Cons:** real infrastructure weight (Patroni/etcd, ≥3
nodes, multiple services) — not a $10 VPS; needs packaging (Helm / compose profiles) and
attention to cross-boundary concerns (auth between services, retries, partial failure,
contract versioning). Adopted as a *required capability*, run in full by production
deployments, reducible for small ones.

## Trade-off Analysis

The decision is process isolation and availability vs operational simplicity. For a normal
app, Option A's simplicity would win. For a life-safety records system whose write path
must never stop and whose maydays are legally significant, the isolation of B (floor) and
the availability of C (capability) are worth their cost — and the cost is contained by
deferring the heavy topology to production while small deployments run a reduced shape. The
one non-negotiable that falls out cleanly: because the alert path taps the Core and the
Core is HA, **life-safety survives any single failure**, and the read model's health is a
situational-awareness concern, never a mayday concern.

## Consequences

**Easier:** write path insulated from read-side failure; life-safety independent of the
read model; read model cheaply reconstructable and hot-swappable; components scale and
deploy independently; a neglected deployment still records and alerts.

**Harder:** HA Postgres is real ops (Patroni/consensus store, ≥3 nodes); more services to
run, secure, and monitor; cross-boundary concerns (inter-service auth, retries, partial
failure, versioned contracts); more deployment surface — must be tamed by packaging
(Helm chart / compose profiles: `full-ha` vs `single-node-dev`). Honest: the full HA
reference topology outgrows a single cheap VPS by design.

**To revisit:** whether the projector uses logical decoding, `LISTEN/NOTIFY`, or
cursor-polling; concrete RPO/RTO targets; where ingest terminates (stable API vs a
dedicated ingest service); snapshot cadence for read-model rebuild.

## Confirmed specifics

1. **Core commit mode:** quorum-synchronous (`synchronous_standby_names = 'ANY 1 (s1,s2)'`),
   RPO 0 with ≥ 2 standbys. **Confirmed.**
2. **Failover tooling:** **Patroni is the default everywhere, including dev** (so the real
   HA path is exercised in development, not just production). A **single-node** profile is
   offered as an easy opt-in for the smallest deployments / quick local spin-ups.
   **Confirmed.**
3. **Projector mechanism:** Postgres **logical replication / logical decoding** off the
   Core log, monotonic cursor as fallback. **Confirmed.**
4. **Targets:** Core **RPO = 0**; read-model **RTO = seconds** via hot-standby promotion.
   **Confirmed.**
5. **Ingest termination:** a thin, logic-free ingest endpoint on the **stable API** writes
   to the Core, keeping the essential surface minimal. **Confirmed.**
6. **Load balancer default:** **HAProxy** in front of **≥ 2 replicas** of each stateless
   service (and as the Patroni primary-router); LB-agnostic via the contract in Decision
   (11); documented swaps include Cloudflare LB and `cloudflared` tunnel. **Confirmed.**

## Action Items

1. [~] Define the Core event-log schema (append-only, monotonic id, `schema_version`) and
       the writer interface. *(Done: `EventStore` interface + in-memory + Postgres impls +
       DDL in `apps/api/src/core/`. Remaining: make `EventPublisher` durable on top of it.)*
2. [x] Build the projector: consume the Core log → materialize the incident/comms read
       model. *(Done: `apps/api/src/projections/` — `Projector` applies `incident.created`
       + radio events to `IncidentReadModel`; `rebuild()` replays the log; a test proves
       the read model is identical after a full rebuild. Remaining: drive it from Postgres
       logical decoding for out-of-process/multi-node.)*
3. [ ] Extract **urgent delivery** into its own stateless service consuming the Core's
       committed log; keep it minimal. Split the richer `info` firehose into its own service.
4. [ ] Point the alert stream at the Core's committed log (not the read model).
5. [ ] Mandate the writer/read-model boundary + per-service network contracts in code so
       L1 → L2 is config-only.
6. [ ] Add **health/readiness** endpoints (split liveness vs readiness) and **graceful
       drain** (flip not-ready → close SSE streams) to every stateless service, for the LB.
7. [ ] Ship the default **HAProxy + ≥ 2 replicas** front; verify SSE settings (no
       buffering, idle timeout > 15s heartbeat, least-connections).
8. [ ] Package topologies: compose profiles / Helm values for `single-node-dev`,
       `level-1`, and `full-ha` (Core primary + 2 standbys + Patroni; hot-standby replicas;
       ≥ 2 stateless replicas behind the LB). Patroni is the default; single-node opt-in.
9. [ ] **Write the Cloudflare-specific LB setup doc** — cover both `cloudflared` tunnel
       (HA, multi-replica) and a separate Cloudflare Load Balancer, following the
       local-only + hosting-provider doc convention. *(Started: `docs/deploy/LOAD-BALANCING.md`.)*
10. [ ] Write ADR-0005 (tiered APIs) as the companion that defines the stable / regular /
       experimental split these components slot into.
