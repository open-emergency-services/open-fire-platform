# Runbook — D11 container image verification

**Task:** D11 (container runtime module resolution) — final Docker-host confirmation.
**Where to run:** **your Mac**, driving the `.200` homelab Docker daemon through the
`remote-windows` docker context. Nothing is cloned onto or typed into the server.
**Time:** ~3 min after a warm build; ~6–8 min on the first build.
**Prereq:** a clean working tree containing commit `4991ea2` or later.

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

## The `.200` server, and what it changes

`.200` is **192.168.1.200** — a Windows box running Docker Desktop with the
**Linux** engine (`linux/amd64`, engine 29.6.1). You reach it from the Mac with
the pre-configured docker context `remote-windows`
(`ssh://mikey@192.168.1.200`). Three consequences shape every command below:

- **Every `docker` command carries `--context remote-windows`.** Without it you
  build and run on the Mac's own Docker Desktop and prove nothing.
- **No `git clone` on the server.** The build context is streamed from *this*
  working tree, so what gets built is whatever you have checked out — see
  Preflight.
- **`localhost` means your Mac.** Every HTTP check targets `192.168.1.200`.
  (Docker Desktop publishes container ports to the LAN; verified reachable.)

The server's shell is PowerShell, so none of the Unix pipelines here would run
there anyway. Driving it by context keeps the whole runbook in your Mac's zsh.

### Ports on `.200` (checked 2026-09-08)

| Port | State on `.200` | Used here for |
| --- | --- | --- |
| 3000 | free | API (Part 1 and Part 2) |
| 5432 | free — nocobase's Postgres only *exposes* 5432, it doesn't publish it | Postgres (Part 2) |
| 8080 | **taken by Jenkins** | — must not be used |
| 8081 | free | web UI (Part 2), via `OFP_WEB_PORT` |

---

## Preflight

```bash
docker context ls                                        # expect a "remote-windows" row → ssh://mikey@192.168.1.200
docker --context remote-windows version --format '{{.Server.Os}}/{{.Server.Arch}} {{.Server.Version}}'
docker --context remote-windows compose version          # compose v2+ plugin present

git merge-base --is-ancestor 4991ea2 HEAD && echo "has the D11 commit"

# nothing uncommitted in what the image is actually built from (docs/ and .vscode/ don't matter):
git status --porcelain -- apps packages package.json pnpm-lock.yaml pnpm-workspace.yaml .dockerignore docker-compose.yml

grep -q 'OFP_WEB_PORT' docker-compose.yml && echo "compose has the OFP_WEB_PORT override"
```

**Part 2 needs the `OFP_WEB_PORT` line in `docker-compose.yml`** (`"${OFP_WEB_PORT:-8080}:80"`
on the `web` service). It went in alongside this runbook and is uncommitted as of
2026-09-08 — the two are one unit. Without it, `web` hard-binds 8080 and collides
with Jenkins. That is also why the cleanliness check above may legitimately list
`docker-compose.yml` until the pair is committed.

`.200` needs outbound internet: the build fetches `pnpm` (via corepack) and the
npm packages.

---

## Part 1 — The D11 proof (build + boot the API image alone)

Boots the API with **no** `DATABASE_URL`, so it uses the in-memory store — this
isolates dependency resolution (the D11 concern) from any database setup.

```bash
docker --context remote-windows build -f apps/api/Dockerfile -t ofp-api:d11 .

docker --context remote-windows run --rm -d --name ofp-d11 -p 3000:3000 ofp-api:d11

# wait for boot instead of guessing (gives up after ~60s)
for i in $(seq 1 30); do
  curl -fsS -o /dev/null -m 3 http://192.168.1.200:3000/api/v1/health/live && { echo "up after ~$((i*2))s"; break; }
  sleep 2
done

echo "--- liveness (expect HTTP 200) ---"
curl -fsS -o /dev/null -w "%{http_code}\n" http://192.168.1.200:3000/api/v1/health/live

echo "--- schema-derived data (expect a JSON count near 128) ---"
curl -fsS http://192.168.1.200:3000/api/v1/neris/incident-types | head -c 120; echo

echo "--- the failure we are ruling out (expect NO output) ---"
docker --context remote-windows logs ofp-d11 2>&1 | grep -i "module_not_found\|cannot find module"

docker --context remote-windows stop ofp-d11
```

**PASS** when all three hold:

- liveness prints `200`
- the incident-types call returns JSON containing a count (≈128)
- the `grep` prints **nothing**

**FAIL** looks like: the container exits right after start, and
`docker --context remote-windows logs ofp-d11` shows
`Error: Cannot find module '@nestjs/core'` (or a similar package). That would
mean the runtime bundle regressed.

> If the curls time out but the container is running, check the app from inside
> the container — that separates a D11 failure from a networking one:
> `docker --context remote-windows exec ofp-d11 wget -qO- http://127.0.0.1:3000/api/v1/health/live`
> (expect `{"status":"ok"}`; busybox `wget` ships in the alpine base image).

> During `docker build` you will see harmless
> `WARN Failed to create bin … webpack/vite/terser` lines. Those are dev-tool CLI
> shims that the `--prod` deploy intentionally omits; they do not affect runtime.
> Ignore them.

---

## Part 2 — Full-stack smoke (compose, over Postgres)

`OFP_WEB_PORT` exists so the web container can dodge Jenkins on `.200`:8080.
Compose runs on your Mac and reads that variable locally; the containers land on
`.200`.

```bash
export OFP_WEB_PORT=8081

docker --context remote-windows compose up -d --build

for i in $(seq 1 30); do
  curl -fsS -o /dev/null -m 3 http://192.168.1.200:3000/api/v1/health && break
  sleep 2
done

docker --context remote-windows compose ps    # db: "healthy"; api / web / simulator: "running"

curl -fsS -o /dev/null -w "api /health: %{http_code}\n" http://192.168.1.200:3000/api/v1/health
curl -fsS -o /dev/null -w "web ui:      %{http_code}\n" http://192.168.1.200:8081/

docker --context remote-windows compose logs --tail=15 simulator   # should show events being fed to the API
docker --context remote-windows compose logs api 2>&1 | grep -i "module_not_found\|cannot find module"   # expect empty
```

Expected: `db` healthy, the API and web return `200`, the simulator log shows it
posting events, and the module grep is empty. (Part 1 is the definitive D11
check; Part 2 additionally exercises the Postgres path and the whole chain.)

To eyeball the UI from the Mac, pass the API base explicitly — the page defaults
to `http://localhost:3000`, which is your laptop, not `.200`:

```
http://192.168.1.200:8081/?api=http://192.168.1.200:3000/api/v1
```

---

## Failures that are NOT D11 failures

- `Bind for 0.0.0.0:8080 failed: port is already allocated` — Jenkins owns 8080
  on `.200`. Set `OFP_WEB_PORT` (Part 2 above). Same class of error for 3000 or
  5432 if something new has claimed them: run
  `docker --context remote-windows ps` and pick free ports.
- The build dies mid-`pnpm install` with a connection/EOF error — the `ssh://`
  context dropped, or `.200` lost outbound internet. Re-run the build.
- Everything hits the Mac's own daemon and behaves oddly — you dropped
  `--context remote-windows` from a command.

None of these touch dependency resolution. Only a missing module at boot does.

---

## Cleanup

```bash
docker --context remote-windows compose down -v      # -v also drops the Postgres volume; .200 is shared, so drop it
docker --context remote-windows image rm ofp-api:d11
```

`-v` is safe **here** because this run created that volume. Never pass `-v` on a
host where the stack is a real deployment — it deletes the department's Postgres
data.

---

## After a pass

- Tick D11 in `docs/TASKS.md` from "still to confirm on a Docker host" to done.
- Nothing else is required; no code change should come out of this run.

## If it fails

Capture and send back:

```bash
docker --context remote-windows logs ofp-d11 2>&1 | tail -40
# and, for Part 2:
docker --context remote-windows compose logs api 2>&1 | tail -60
```

The most likely (and only expected) failure mode is a missing module at boot,
which points at the deploy bundle in `apps/api/Dockerfile`.
