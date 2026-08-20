# Run the virtual system

Spin up the whole chain in Docker and watch a fire play out live — synthetic radio
traffic flows into the API, gets correlated onto an incident, and streams out to a live
interface, mayday and all. No credentials, no real radios, no NERIS account needed.

```bash
docker compose up --build
```

Then open the interface: **http://localhost:8080**

You'll see incidents appear as they're dispatched, radio traffic (open-mic / close-mic)
light up in real time, and — in the default scenario — a **MAYDAY** banner fire with an
audible alert when an interior firefighter declares an emergency.

## What's running

Four services, mirroring the architecture (ADR-0001 API-first; ADR-0002 SSE alerts):

| Service | Role | Port |
|---|---|---|
| `api` | The headless core — ingests events, correlates, stores, streams (SSE) | 3000 |
| `web` | The interface (V1): a live incident view, snapshot + SSE, no build step | 8080 |
| `simulator` | The event source — plays scenarios in as the console + CAD would | — |
| `db` | Postgres (Wave-0 storage is in-memory; db is here for the next step) | 5432 |

```
 simulator ──POST /comms/radio-events──►  api  ──SSE /alerts/stream──►  web
 (console + CAD inbound)                (core)                      (interface)
```

The simulator talks only HTTP against the frozen v1.0 envelope — no platform code — so
it doubles as a faithful front-to-back integration test.

## Pick a scenario

Set env vars before `up` (or edit them in `docker-compose.yml`):

```bash
OFP_SCENARIO=ems-call OFP_SPEED=2 docker compose up --build
```

| `OFP_SCENARIO` | What it exercises |
|---|---|
| `structure-fire` *(default)* | Full run with a mayday; also leaves one transmission open (a dropped radio) to show the drop-tolerant timeline |
| `ems-call` | Routine traffic, no mayday — the "normal" baseline |
| `stress` | Rapid-fire keyups across many units — pushes ordering, dedupe, the timeline |

- `OFP_SPEED` — time compression (e.g. `12` = 12× faster). Default `1` (near real time).
- `OFP_LOOP` — `1` (default) replays forever; `0` runs once.

## Run pieces without Docker

The API and the simulator run standalone too:

```bash
# terminal 1 — the core
npm --prefix apps/api run start        # http://localhost:3000/api/v1

# terminal 2 — inject a scenario
node apps/simulator/run.mjs --scenario structure-fire --speed 4

# watch the raw stream
curl -N http://localhost:3000/api/v1/alerts/stream
```

Open `apps/web/index.html` directly in a browser and point it at the API with
`?api=` if it's not on the default: `apps/web/index.html?api=http://localhost:3000/api/v1`
(the API sends permissive CORS in Wave-0).

## What this proves (and what it doesn't)

**Proven, end-to-end:** dispatch → roster resolution → talkgroup↔incident correlation →
comms-facet timeline (including a dropped-radio transmission left open then closed on
timeout) → at-least-once ingest with dedupe → live SSE out → reconnect replay via
`Last-Event-ID` so a mayday is never lost.

**Not yet (deliberately, Wave-0):** storage is in-memory (restart = clean slate; the
`db` service is staged for the Postgres step), there's no auth on the stream yet
(ADR-0002 action item), and the transport is HTTP/SSE only — the durable-stream binding
(NATS/Redis) comes with multi-node. None of that blocks the demo.
