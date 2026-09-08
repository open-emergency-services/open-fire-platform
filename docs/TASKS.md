# Tasks — functional vs. deployment

Split by the maintainer's rule: **Functional** = makes the software work / more complete now,
needs no external infrastructure. **Deployment** = needed to run in the field (real IdP, KMS,
HA, external stores), not to be functional. Work the Functional list first.

Grounded in the ADR action items, code notes, and BACKLOG as of this writing.

## Functional — do now

- [x] **F1. Verify the end-to-end demo runs** — simulator → API → command board / live view in
  permissive dev. Fix any breakage from the records/auth/unification changes. *(the whole "it
  works" story rides on this)* — verified: INC-2026-000481, mayday folded into the unified model.
- [x] **F2. Editability lifecycle** (ADR-0007 #4) — a submitted/accepted incident is amend-only;
  a closed record is locked. Enforce at the command layer for incidents + a generic record
  lifecycle hook. — lock/reopen verbs, accept auto-locks, edits on a locked record → 423; tested.
- [x] **F3. Cross-record integrity** — a child record's `parent` must exist and be the same
  department; reject dangling/cross-tenant parents. — dangling/cross-tenant parent → 404; tested.
- [x] **F4. Dashboards under auth** (ADR-0010 #3) — command board + live incident view present a
  token when `AUTH_REQUIRED=1` (login redirect + token use), so they work with auth on. —
  verified: no token → 401, token → 200, SSE via `?access_token`; `login.html` stores `ofp_token`.
- [x] **F5. Unmapped-review surface** (ADR-0006 #4) — endpoint + tiny screen listing distinct
  `unmapped` keys per source; the capture-everything payoff (know what the standard didn't model).
  — `GET /api/v1/insights/unmapped` (officer-gated) rolls the log up per source into key + count +
  shape + first/last-seen, deliberately never echoing values (PII-safe); `unmapped.html` renders it.
  Verified: officer 200, responder 403, anon 401, no value leak; 3 unit tests.
- [x] **F6. Configurable timer standards** (BACKLOG) — server-delivered defaults + per-incident /
  per-department override for the command board, replacing the hardcoded `STANDARDS` table.
  — `GET /api/v1/standards/timers` (any member) returns defaults + dept override + effective merge;
  `PUT` (officer) sets the dept override, event-sourced + rebuilt on boot. Command board fetches
  and merges before creating timers, shows platform-vs-customized. Verified + 5 unit tests.
- [x] **F7. Incident-type picker** — use the generated NERIS incident-type hierarchy (128 types)
  in the incident-core screen instead of free text. — `GET /api/v1/neris/incident-types` (public
  reference data) serves the l1/l2/l3 hierarchy from the schema; incident-core.html cascades
  category→subtype→specific, writes composite codes into `incident_final_type`, chips with a ★ set
  the one `incident_final_type_primary`. Verified headlessly (Playwright) + 1 contract test.
- [x] **F8. OpenAPI contract** (ADR-0001 #2) — generate/serve an OpenAPI spec for the API.
  — `@nestjs/swagger` introspects the live routes; `GET /api/v1/openapi.json` (30 paths, OpenAPI
  3.0) + interactive `GET /api/v1/docs` (assets bundled locally, offline-capable). Verified.
- [x] **F9. Personnel PII UX** — mark PII fields on the screen, show that the list masks them, add
  an "erase PII" control (backend already supports it). — new `GET /records/:module/pii-policy`
  drives it (no drift): personnel.html badges each vaulted field 🔒, shows the masking note, renders
  🔒-masked cells, and adds officer reveal + erase-PII per row. Also **added `last_4_ssn` to the
  personnel PII policy** (was unvaulted). Verified headlessly + over HTTP; +1 unit test.
- [x] **F10. Essential-writes-only guard** (ADR-0005 #5) — enforce in code that only the Essential
  ingest path writes to the Core (architectural invariant). — `core-write-invariant.spec.ts`
  (ArchUnit-style, runs in CI) confines `store.append` to a sanctioned allowlist and asserts the
  store stays append-only (no UPDATE/DELETE/TRUNCATE). Proven with a negative test (a rogue writer
  fails). Physical tier split (Regular → ingest over the network) stays D-series.

## Deployment / field — later (not needed to be functional)

- [ ] D1. Crypto-shred exercised through the PII path (interface done; externalized verified).
- [ ] D2. Real OIDC/JWKS validation + key rotation; machine identity (mTLS / service token) for the
  P25 console → ingest.
- [ ] D3. Postgres-backed read model; HA (Patroni); fast read-model recovery.
- [ ] D4. Durable radio transport (NATS/Redis stream); Redis/NATS pub-sub for multi-node SSE.
- [ ] D5. Critical-path isolation: reserved connection pool, admission control, load/soak test.
- [ ] D6. Content store + per-record content keys for free-text/transcript PII (ADR-0009).
- [ ] D7. LB/topology: HAProxy + ≥2 replicas, Cloudflare doc, compose profiles / Helm, per-tier
  services.
- [ ] D8. Real NERIS submission credentials + flow (gateway currently simulates).
- [ ] D9. DB-backed user store; auth-event auditing; rate limiting / admission control.
- [ ] D10. Recordings / transcription / real-time translation (BACKLOG) — biggest leaked-PII source;
  build on ADR-0009.
- [x] D11. **Container runtime module resolution** *(surfaced → fixed)* — the repo installs with
  pnpm's isolated linker (`@nestjs/core` etc. live in `apps/api/node_modules` as symlinks into the
  `.pnpm` store, not the repo root), but the API Dockerfile's runtime stage copied only the root
  `node_modules`, so the image couldn't resolve its deps at boot (`MODULE_NOT_FOUND`). It *built*
  fine (CI only builds, never boots it), so this stayed invisible. **Fixed:** the build stage now
  runs `pnpm --filter @ofp/api deploy --prod /bundle` to produce a self-contained, prod-only bundle
  (workspace `@ofp/neris-schema` injected with its built `dist`; symlinks kept internal to the
  bundle) and the runtime stage ships that bundle instead of the root `node_modules` + `packages`.
  Also added an `apps/api` `files` allowlist (`dist` + `migrations`) and a root `.dockerignore` so
  the runtime image is minimal and reproducible, and dropped the broken `|| npm install` fallback
  (npm can't parse `workspace:*`). Verified **natively, no Docker**: `node dist/main.js` from the
  bundle in `NODE_ENV=production` starts every module, maps all routes, and answers health 200 +
  the 128 NERIS types with 0 errors. **Still to confirm on a Docker host:** `docker build` +
  `docker compose up` end-to-end — this sandbox has no Docker daemon, so that last mile is the one
  step left, ideally on the homelab container.

## Surfaced while working (fixed in place)

- [x] **Reproducible schema build** — `@ofp/neris-schema` had no pinned `typescript`, so `npm run
  build` (and CI/Docker) grabbed whatever `npx` resolved — a newer TS that errors on
  `moduleResolution: "node"`. Pinned `typescript ^5.5.0` as a devDependency and committed
  `pnpm-lock.yaml` so installs and the schema build are deterministic.

_New items surfaced while working are appended to the relevant list._
