# Tasks — functional vs. deployment

Split by the maintainer's rule: **Functional** = makes the software work / more complete now,
needs no external infrastructure. **Deployment** = needed to run in the field (real IdP, KMS,
HA, external stores), not to be functional. Work the Functional list first.

Grounded in the ADR action items, code notes, and BACKLOG as of this writing.

## Functional — do now

- [ ] **F1. Verify the end-to-end demo runs** — simulator → API → command board / live view in
  permissive dev. Fix any breakage from the records/auth/unification changes. *(the whole "it
  works" story rides on this)*
- [ ] **F2. Editability lifecycle** (ADR-0007 #4) — a submitted/accepted incident is amend-only;
  a closed record is locked. Enforce at the command layer for incidents + a generic record
  lifecycle hook.
- [ ] **F3. Cross-record integrity** — a child record's `parent` must exist and be the same
  department; reject dangling/cross-tenant parents.
- [ ] **F4. Dashboards under auth** (ADR-0010 #3) — command board + live incident view present a
  token when `AUTH_REQUIRED=1` (login redirect + token use), so they work with auth on.
- [ ] **F5. Unmapped-review surface** (ADR-0006 #4) — endpoint + tiny screen listing distinct
  `unmapped` keys per source; the capture-everything payoff (know what the standard didn't model).
- [ ] **F6. Configurable timer standards** (BACKLOG) — server-delivered defaults + per-incident /
  per-department override for the command board, replacing the hardcoded `STANDARDS` table.
- [ ] **F7. Incident-type picker** — use the generated NERIS incident-type hierarchy (128 types)
  in the incident-core screen instead of free text.
- [ ] **F8. OpenAPI contract** (ADR-0001 #2) — generate/serve an OpenAPI spec for the API.
- [ ] **F9. Personnel PII UX** — mark PII fields on the screen, show that the list masks them, add
  an "erase PII" control (backend already supports it).
- [ ] **F10. Essential-writes-only guard** (ADR-0005 #5) — enforce in code that only the Essential
  ingest path writes to the Core (architectural invariant).

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

_New items surfaced while working are appended to the relevant list._
