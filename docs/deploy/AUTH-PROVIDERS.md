# Auth providers — built-in login and single sign-on (SSO)

How a department signs in. Two paths, both behind the same `Principal` seam (ADR-0010), so
the rest of the platform never changes:

1. **Built-in username/password** — the zero-config fallback. Works out of the box.
2. **External SSO (OIDC)** — plug in the department's own identity provider (Authentik,
   Keycloak, Zitadel, …). We validate its tokens; we do **not** run or maintain the IdP.

Nothing here is required to *run* the platform — with `AUTH_REQUIRED` off it stays permissive
for development.

## 1. Local-only / single-container (built-in login)

No identity provider needed. The platform ships a small user directory and a login page.

- Sign-in page: `apps/web/login.html` → `POST /api/v1/auth/login` returns a signed bearer
  token the screens store and send.
- Dev seed users (insecure defaults, logged with a warning): `chief/chief123` (admin),
  `officer/officer123` (officer), `ff/ff123` (responder).
- Seed your own without SSO:
  ```
  AUTH_SEED_USERS="jsmith:s3cret:LFD:officer;rjones:pw:LFD:responder"
  AUTH_SECRET=<long-random-string>      # signs the tokens — set a real one
  AUTH_REQUIRED=1                        # enforce (401 without a valid token)
  ```
  (The in-memory user store is the seam; a real deployment backs it with a database. Roles
  are hierarchical: admin ⊇ officer ⊇ responder.)

## 2. Hosting-provider / production — plug in SSO (recommended)

For any department running SSO, point the platform at the IdP and it accepts that IdP's
tokens. Generic OIDC first; a specific example after.

**Generic (any OIDC-compliant provider):**
```
OIDC_ISSUER=https://<your-idp>/…            # the `iss` your IdP puts in tokens
OIDC_JWKS_URI=https://<your-idp>/…/jwks     # from the IdP's .well-known/openid-configuration
OIDC_AUDIENCE=open-fire-platform            # your client id (optional but recommended)
OIDC_DEPT_CLAIM=department                  # which claim carries the department id
OIDC_ROLES_CLAIM=roles                      # which claim carries roles/groups
AUTH_REQUIRED=1
```
The platform fetches the IdP's public keys (JWKS, cached), validates each token's RS256
signature + issuer + audience + expiry, and maps the configured claims to
`{ departmentId, roles }`. Built-in tokens still work alongside SSO, so you can migrate
gradually.

**Example — Authentik** (open-source, self-hosted, the one most people mean by "an SSO
project"): create an OAuth2/OIDC provider + application for Open Fire Platform, add the
department id and role/group as claims (a scope mapping), then read its
`.well-known/openid-configuration` for `issuer` and `jwks_uri` and set the vars above. Map
Authentik groups → our `responder`/`officer`/`admin` via the roles claim. Keycloak and
Zitadel wire in identically (different console, same OIDC values).

## What we deliberately do NOT build

The identity provider itself — user lifecycle, MFA, password policy, SAML, social login,
directory sync. That is a large, security-critical, ever-changing surface, and mature
open-source projects already own it. We stay a standards-compliant **relying party**: give us
an OIDC issuer + JWKS and a claim mapping, and the department's SSO plugs straight in.

## Roles (kept intentionally small)

`responder` (create/edit records, create incidents) ⊂ `officer` (delete records,
validate/submit to NERIS) ⊂ `admin` (everything). A finer, CJIS-grade authorization model
(per-record sensitivity, purpose-of-use) is future work; this is a deliberate floor.
