# Runbook — D11 container image verification

**Task:** D11 (container runtime module resolution) — final Docker-host confirmation.
**Where to run:** a host with a Docker daemon (target: the `.200` homelab server).
**Time:** ~5 minutes. **Prereq commit:** `4991ea2` or later on `main`.

---

## Why this runbook exists

D11 fixed a bug where the API image *built* but crashed on boot with
`MODULE_NOT_FOUND`. The cause: pnpm's isolated linker keeps the API's
dependencies (`@nestjs/core`, …) under `apps/api/node_modules` as symlinks into
the `.pnpm` store — never in the repo-root `node_modules` — but the old runtime
stage copied only the root `node_modules`. The fix makes the build produce a
self-contained bundle via `pnpm --filter @ofp/api deploy --prod` and ships that.

The fix was already proven **natively** (booting the deploy bundle with plain
`node`). This runbook is the one remaining check that couldn't run in the build
sandbox: that the actual **Docker image** builds and boots the same way. It is
pass/fail — no code changes should be needed.

---

## What this verifies

1. **Part 1 (authoritative):** the API image builds, and a container boots with
   the in-memory store and answers HTTP — proving dependency resolution works in
   the real image. This alone confirms D11.
2. **Part 2 (integration smoke):** the full `docker compose` stack (Postgres +
   API + web + simulator) comes up and talks to itself over the network.

---

## Prerequisites

```bash
docker version          # daemon reachable
docker compose version  # compose v2 plugin present
```

The host also needs outbound internet: the image build fetches `pnpm` (via
corepack) and the npm packages.

> Run the commands **on the `.200` server** so `localhost` resolves to it. If you
> curl from another machine, replace `localhost` with the server's `.200`
> address.

---

## Get the merged code

```bash
git clone https://github.com/open-emergency-services/open-fire-platform.git
cd open-fire-platform
git log --oneline -1    # expect: 4991ea2 D11: ship a self-contained pnpm deploy bundle...
```

(If you already have a clone, `git checkout main && git pull` instead.)

---

## Part 1 — The D11 proof (build + boot the API image alone)

Boots the API with **no** `DATABASE_URL`, so it uses the in-memory store — this
isolates dependency resolution (the D11 concern) from any database setup.

```bash
docker build -f apps/api/Dockerfile -t ofp-api:d11 .

docker run --rm -d --name ofp-d11 -p 3000:3000 ofp-api:d11
sleep 8

echo "--- liveness (expect HTTP 200) ---"
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/v1/health/live

echo "--- schema-derived data (expect a JSON count near 128) ---"
curl -fsS http://localhost:3000/api/v1/neris/incident-types | head -c 120; echo

echo "--- the failure we are ruling out (expect NO output) ---"
docker logs ofp-d11 2>&1 | grep -i "module_not_found\|cannot find module"

docker stop ofp-d11
```

**PASS** when all three hold:

- liveness prints `200`
- the incident-types call returns JSON containing a count (≈128)
- the `grep` prints **nothing**

**FAIL** looks like: the container exits right after start, and
`docker logs ofp-d11` shows `Error: Cannot find module '@nestjs/core'` (or a
similar package). That would mean the runtime bundle regressed.

> During `docker build` you will see harmless
> `WARN Failed to create bin … webpack/vite/terser` lines. Those are dev-tool CLI
> shims that the `--prod` deploy intentionally omits; they do not affect runtime.
> Ignore them.

---

## Part 2 — Full-stack smoke (compose, over Postgres)

```bash
docker compose up -d --build
sleep 12

docker compose ps    # db: "healthy"; api / web / simulator: "running"

curl -fsS -o /dev/null -w "api /health: %{http_code}\n" http://localhost:3000/api/v1/health
curl -fsS -o /dev/null -w "web ui:      %{http_code}\n" http://localhost:8080/

docker compose logs --tail=15 simulator   # should show events being fed to the API
docker compose logs api 2>&1 | grep -i "module_not_found\|cannot find module"   # expect empty
```

Expected: `db` healthy, the API and web return `200`, the simulator log shows it
posting events, and the module grep is empty. (Part 1 is the definitive D11
check; Part 2 additionally exercises the Postgres path and the whole chain.)

---

## Cleanup

```bash
docker compose down        # add -v to also drop the Postgres data volume
docker image rm ofp-api:d11
```

---

## After a pass

- Tick D11 in `docs/TASKS.md` from "still to confirm on a Docker host" to done.
- Nothing else is required; no code change should come out of this run.

## If it fails

Capture and send back:

```bash
docker logs ofp-d11 2>&1 | tail -40
# and, for Part 2:
docker compose logs api 2>&1 | tail -60
```

The most likely (and only expected) failure mode is a missing module at boot,
which points at the deploy bundle in `apps/api/Dockerfile`.
