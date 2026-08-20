# ADR-0002: Real-time alert transport — Server-Sent Events, event/transport separation

**Status:** Accepted
**Date:** 2026-08-20
**Deciders:** Maintainer (solo, for now)
**Related:** ADR-0001 (API-first, headless core)

## Context

ADR-0001 says every capability is reached through the versioned API and the interface
is an unprivileged client. That raises one hard case: **life-safety alerts, above all a
mayday.** An interface that only *polls* the API can't meet it — polling's best-case
latency is the poll interval, and it wastes connections. A mayday must reach the screen
the instant it happens.

Two constraints shape the choice:

- **No proprietary dependency in the alert path.** The maintainer's explicit
  requirement: the immediate-alert mechanism must not be a thing that can be bought,
  paywalled, or deprecated out from under a running deployment. It has to be built on an
  open standard so an abandoned-but-working system keeps alerting for years.
- **It must fit ADR-0001.** The real-time surface is part of the API, not a side channel
  that bypasses it, and it must not become the first backdoor into the core.

## Decision

**1. Separate the event from its transport.** Every alert is first a **domain event**:
a durable, stored fact with a monotonic `id`, retrievable through the normal API. Live
delivery is a separate concern layered on top. The event is canonical and permanent; the
transport is swappable. (This mirrors the inbound radio seam, where the event is
canonical and the transport is "durable stream or webhook.")

**2. Deliver live over Server-Sent Events (SSE).** The interface gets real-time updates
from an SSE endpoint on the API (`GET /api/v1/alerts/stream`). SSE is a web standard
(`text/event-stream`): the server side is a plain long-lived HTTP response; the client
side is the browser-native `EventSource`. No library, no vendor, nothing to become
obsolete. One-directional (server→client), which is exactly what an alert needs; writes
(e.g. acknowledgements) go back through ordinary POST endpoints.

**3. Snapshot + stream for immediate display.** On load, the interface renders current
state from a normal API GET (immediate), then holds the SSE stream open for live deltas.
Immediate display depends on the snapshot; freshness depends on the stream; neither
depends on the other being perfect.

**4. Never rely solely on the live push.** Because each event is also a stored resource
with a monotonic id, a client that misses events replays them on reconnect (SSE's
built-in `Last-Event-ID`), and can always fall back to fetching the snapshot or polling
the catch-up endpoint. Live push is for immediacy; the stored event is for correctness.

**5. Quarantine unavoidable proprietary push to the last mile.** OS-level push for a
*fully-closed* mobile app (Apple APNs, Google FCM) has no open substitute. It is allowed
only as an optional "doorbell" that wakes the app, which then pulls the real alert from
the open API. It is never the source of truth and never on the critical path; disable it
and the open API + SSE path is untouched.

## Options Considered

### Option A: SSE with event/transport separation (chosen)

| Dimension | Assessment |
|-----------|------------|
| Openness | Highest — a web standard, zero dependencies, nothing to deprecate |
| Complexity | Low–medium — a long-lived HTTP response + a publisher |
| Fit with ADR-0001 | Perfect — it's just another endpoint on the versioned API |
| Directionality | Server→client (all an alert needs); writes via normal POST |
| Reconnect/replay | Built in (`Last-Event-ID`), backed by the event buffer |

**Pros:** open and durable; native browser support; auto-reconnect + replay; trivial
server side; degrades to polling. **Cons:** one-directional (fine here); a header-auth
quirk (`EventSource` can't set headers → use cookie/short-lived token); long-lived
connections need heartbeats.

### Option B: WebSocket

Full-duplex over one connection; a standard (RFC 6455), browser-native.

**Pros:** two-way, low latency; right choice for genuinely bidirectional real-time (live
audio signaling, collaborative editing). **Cons:** more moving parts (connection state,
heartbeats, backpressure, reconnect/replay you build yourself) for no benefit on a
one-way alert. **Reserved** for a later feature that truly needs two-way; it does not
replace SSE for alerts.

### Option C: Managed push / realtime SaaS (Firebase, Pusher, Ably, AppSync)

**Pros:** turnkey, scales without effort. **Cons:** exactly the proprietary,
obsolescence-prone dependency the maintainer ruled out for the alert path. **Rejected**
for the core path; permitted only as the quarantined last-mile doorbell (Decision 5).

## Trade-off Analysis

The real decision is openness/longevity vs. turnkey convenience. Option C is easiest and
worst for this mission — it puts a vendor on the mayday path. Between the two open
standards, SSE beats WebSocket *for alerts specifically*: a mayday is server→client, and
SSE hands you reconnect-with-replay for free, over standard HTTP infrastructure. The
event/transport split is what makes the whole thing future-proof: if SSE is ever
superseded, you swap the streaming endpoint and nothing about the stored alerts or the
API contract changes.

## Consequences

**Easier:**
- Immediate, dependency-free alerting that a frozen deployment keeps doing for years.
- Reconnect never loses a mayday (replay from the buffer; snapshot re-fetch as backstop).
- Adding new real-time event types = publish a new domain event; the stream carries it.

**Harder:**
- Long-lived connections need heartbeats and sane proxy/load-balancer timeouts.
- Stream auth needs the cookie/short-lived-token approach (no custom headers on EventSource).
- Multi-node scaling needs a shared pub/sub (Redis/NATS) behind the publisher — but
  behind the same endpoint, so no client changes.

**To revisit:**
- The catch-up buffer is in-memory and bounded (Wave-0). Back it with a shared store when
  scaling past one node; until then a client whose cursor has aged out re-fetches the
  snapshot.
- Introduce WebSocket only when a feature genuinely needs two-way real-time.

## Action Items

1. [x] Domain-event model with a monotonic id (the SSE cursor) — `events/domain-event.ts`.
2. [x] `EventPublisher` with a live stream + bounded replay buffer — `events/event-publisher.ts`.
3. [x] SSE endpoint `GET /api/v1/alerts/stream` with filter, `Last-Event-ID` replay, and
       heartbeats — `events/events.controller.ts`.
4. [x] Publish `mayday.declared` (and ops-level `mayday.unassigned`) from CommsService.
5. [ ] Stream authentication (cookie / short-lived token) enforced at the API boundary.
6. [ ] Back the publisher with Redis/NATS pub/sub for multi-node deployments.
7. [ ] Client reference: snapshot GET + `EventSource`, audible/visual mayday alert, and an
       acknowledge POST — to live with the (not-yet-built) UI client.
