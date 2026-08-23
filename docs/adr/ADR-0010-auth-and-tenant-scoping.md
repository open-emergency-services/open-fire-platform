# ADR-0010: Authentication, roles, and tenant scoping

**Status:** Accepted
**Date:** 2026-08-23
**Deciders:** Maintainer (solo, for now)
**Refines:** ADR-0001 (API-first, swappable), ADR-0002 (SSE), ADR-0004 (read model)

## Context

Until now every request ran as an implicit `DEMO_DEPT` with full rights: no identity, no
per-department isolation, no role checks. The incident, records, and SSE surfaces all
trusted a client-supplied header (or a default). For a records system holding regulated,
possibly-PII data across many departments, that is the missing floor: a caller must be
authenticated, act as *their* department only, and be limited by role — enforced at the API
edge, not the UI.

The constraint (ADR-0001): the platform is headless and swappable. Auth must be a **seam**,
not a hardcoded dependency on any one identity provider — and the scaffold must still run
out of the box without standing up Keycloak.

## Decision

**1. A `Principal` is resolved at the edge and everything downstream depends only on it.**
`{ userId, departmentId, roles, entityId? }`. How it's obtained (dev token today, OIDC/JWT
from the department's IdP tomorrow) is behind `AuthService.verify()` — callers never see the
mechanism (ADR-0001).

**2. Tokens are real, signed, and dependency-light.** HS256 JWTs signed with a shared secret
using node's built-in `crypto` — no external IdP or library needed to run the scaffold.
Production swaps in RS256 + a JWKS fetched from the OIDC provider; the verifier seam and every
caller stay unchanged. A `/auth/dev-token` endpoint mints tokens for local use (disabled once
auth is required, unless explicitly force-enabled).

**3. Two global guards.** `AuthGuard` extracts the bearer token (`Authorization: Bearer …`,
or `?access_token=` for EventSource, which can't set headers), verifies it, and attaches the
`Principal` to the request. `RolesGuard` enforces `@Roles(...)`. `@Public()` exempts a route
(health, token minting).

**4. Permissive by default in dev, strict when required.** When `AUTH_REQUIRED` is off (dev
default), a request with **no** token gets a permissive `DEMO_DEPT`/admin fallback principal —
so the 42 screens and the dashboards run without tokens. When `AUTH_REQUIRED=1`, the *same
code path* returns `401`. A token that is **present but invalid/expired is always rejected**,
even in dev — permissiveness only covers "no token," never "bad token."

**5. Tenant scoping is enforced in the services, not the UI.** The department comes from the
Principal, never a client header. Incidents list/read/write are scoped to
`principal.departmentId`. Generic records carry a `departmentId`; lists return only the
caller's department, and a record in another department reads as **404** (indistinguishable
from never-existed — no cross-tenant enumeration). The SSE stream delivers a client its own
department's events plus ops-level events (empty `departmentId`, e.g. an uncorrelated mayday
visible to all for mutual aid).

**6. Roles gate mutating operations.** `responder` may create/edit records and create
incidents; `officer` may delete records and validate/submit incidents to NERIS; `admin`
satisfies any requirement. Reads require only authentication. (This is a starting policy, not
the final RBAC — CJIS-grade authorization will refine it.)

## Options Considered

- **Bake in Keycloak/OIDC now.** Correct end state, but it forces external infra to run the
  scaffold and couples the code to one IdP. **Deferred** — kept as the swap-in behind the
  verifier seam.
- **Header-based dev identity (`x-department`).** Trivial, but a client-asserted identity is
  no identity — trivially spoofable and no signature/expiry. **Rejected** as the mechanism
  (a signed token is barely more code and is actually auth).
- **Signed dev JWT + permissive fallback + OIDC seam (chosen).** Real auth semantics
  (signature, expiry, roles), runs with zero external infra, and upgrades to production OIDC
  without touching callers.

## Consequences

**Easier:** real per-department isolation and role enforcement at the edge today; a single
`Principal` seam the whole codebase reads; enforcement toggled by one env var; dashboards and
screens keep working in dev without tokens.

**Harder:** every write path now threads `departmentId`; the frontend must present a token
once enforcement is on (the module index has a dev-token bar that stores one in
`localStorage`, and screens send it when present). Cross-tenant admin/reporting and true CJIS
authorization are future work, as is real OIDC/JWKS validation and key rotation.

## Verification (this slice)

- Permissive dev: no token → `DEMO_DEPT`/admin; all screens work unchanged.
- Enforced (`AUTH_REQUIRED=1`): no token → `401` on `/records` and `/incidents`; `/health`
  stays public; a minted token → `200`; SSE authenticates via `?access_token=`.
- Tenant isolation: DEPT_B cannot list or read DEPT_A's records (list excludes them; direct
  id → `404`) and cannot edit them.
- Roles: a `responder`-only token is `403` on delete; an `officer` token succeeds.
- An invalid/expired token is `401` even in permissive dev.
- 10 automated tests (`src/auth/auth.spec.ts` + records tenant test); 59 backend tests pass.

## Update — login + SSO seam added

Two things now sit on top of the token machinery (see
[docs/deploy/AUTH-PROVIDERS.md](../deploy/AUTH-PROVIDERS.md)):

- **Built-in username/password login** — the zero-config fallback. `POST /auth/login`
  verifies against a seeded user store (scrypt-hashed passwords, node `crypto`) and issues a
  signed token; `apps/web/login.html` is the sign-in page. Roles are now **hierarchical**
  (admin ⊇ officer ⊇ responder).
- **External SSO (OIDC) — the plug.** When `OIDC_ISSUER`/`OIDC_JWKS_URI` are set, tokens
  issued by the department's own IdP (Authentik/Keycloak/Zitadel/any OIDC provider) are
  validated (RS256 against the IdP's JWKS, + issuer/audience/expiry) and mapped to a
  Principal via configurable claim names — accepted alongside built-in tokens. We validate;
  we do not run the IdP. Verified with a unit test (local RSA keypair, no network).

## Action Items

1. [x] Working OIDC/JWKS verifier seam so a department's SSO plugs in (`OidcVerifier`).
       *Remaining:* key rotation edge cases + SAML-only IdPs (OIDC covers the common case).
2. [ ] Refine RBAC toward CJIS-grade authorization (per-record sensitivity, purpose-of-use).
3. [ ] Wire the command board / live incident view to present a token when enforcement is on
       (screens already do via the module-index token bar).
4. [ ] Machine identity for the P25 console → ingest (service token / mTLS) instead of the
       dev fallback.
