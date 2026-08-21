# ADR-0008: Isolating the critical path from routine writes

**Status:** Accepted
**Date:** 2026-08-21
**Deciders:** Maintainer (solo, for now)
**Refines:** ADR-0004 (recording core + split-anywhere topology), ADR-0002 (alert transport)

## Context

Everything flows through the Core. During an active incident, a radio event — above all a
mayday — must **never** be delayed by routine CRUD (a hydrant edit, a bulk import). The
question raised: should emergency traffic and routine writes have **separate log servers**,
so nothing routine can ever contend with the critical path?

## Analysis

**Scale reality.** An append to the log is a sub-millisecond sequential insert. A single
department's write volume, even during a working fire, is tiny by database standards (tens
of radio events per minute; occasional CRUD). One Core handles both without noticing —
throughput-driven starvation is not a real risk at that scale, and splitting into two
physical logs purely for performance would be premature.

**What's actually worth engineering** is not throughput but the **guarantee**: a structural
promise that a routine write can never delay a mayday, even in a bad moment — a GIS bulk
hydrant sync firing mid-incident, a misbehaving integration hammering ingest, connection-pool
exhaustion. That's a real failure mode, and "load is usually low" is not an acceptable answer
for a life-safety path.

**Priority, not exclusion.** The rule must be *deprioritize routine*, not *block it*. A
regional deployment has many concurrent incidents plus routine work elsewhere; a firefighter
mid-incident may need to save something. Blocking routine during any incident would break
concurrent operations. Critical preempts and has reserved capacity; routine yields under
load; everything keeps working.

## Decision

**1. Critical priority is a guarantee, delivered cheaply on one Core (default).**
- A **reserved connection pool** for the critical / ingest path that routine CRUD physically
  cannot exhaust.
- **Statement timeouts** on routine writes so nothing pathological can hog resources.
- **Admission control**: the critical event is always admitted first; under pressure the
  system **sheds or queues routine writes, never critical ones** (a "critical mode" that
  load-sheds routine first).

**2. Priority travels on the event.** Events already carry a `priority` (ADR-0002); the
ingest edge routes and admits by it. Critical = radio/mayday and incident-affecting events;
routine = CRUD on inspections, admin, reference data.

**3. Physical split is a capability, not the default.** Because critical and routine are
distinct streams (`priority`/`source`), routing them to **separate log servers** for full
physical isolation is a config change at the ingest edge, not a rewrite. Offered for large /
regional / high-assurance deployments; a single department runs **one Core with priority
lanes**. Same philosophy as ADR-0004: design the seam now, deploy collapsed, split when
warranted.

**4. Never block routine during an incident — deprioritize it.** Concurrent incidents and
routine operations must all keep working; the critical path simply always wins for resources.

## Options Considered

| Option | Isolation | Cost | Verdict |
|---|---|---|---|
| A. One Core, no prioritization | none — routine and critical compete | lowest | **Rejected** — no guarantee for life-safety |
| B. One Core + priority lanes (reserved pool, timeouts, admission control) | strong: routine can't starve critical | low | **Chosen default** |
| C. Two physical log servers (critical vs routine) | maximum: separate CPU/disk/connections | real ops weight | **Capability** for scale/high-assurance |
| D. Block routine during incidents | total, but wrong | breaks concurrent ops | **Rejected** |

## Trade-off Analysis

Option B buys the structural guarantee the maintainer wants — "a routine write can never
delay a mayday" — at almost no cost, and without a second source of truth to reconcile.
Option C is the right answer at scale, and it's cheap to *reach* later because the streams
are already distinguishable, so B → C is a deployment change, not a redesign. Starting at C
for one department would add real complexity (two logs, cross-log queries, more ops) for a
performance problem that doesn't exist at that scale. So: guarantee priority now, keep the
physical split available.

## Consequences

**Easier:** a provable "critical always wins" property; routine load spikes can't touch the
mayday path; a clean path to full physical isolation for big deployments.

**Harder:** the ingest edge needs admission control / load-shedding logic and a reserved
critical pool; two-log deployments add cross-log query and ops considerations (deferred).

## Action Items

1. [ ] Reserved critical connection pool + `statement_timeout` on routine writes.
2. [ ] Admission control at ingest: admit `priority: critical` first; shed/queue routine
       under pressure ("critical mode").
3. [ ] Load / soak test: hammer routine ingest and confirm mayday append latency is
       unaffected (the guarantee, measured).
4. [ ] Config option to route critical vs routine to separate log servers (the physical
       split) for large/high-assurance deployments; keep single-Core the default.
