# Contributing

Thanks for helping build free, department-owned software for the fire service.

## Ground rules

- **Standards-native.** Anything touching NERIS, NEMSIS, HL7, or NENA formats is
  generated from or validated against the published standard — never hand-rolled
  from assumptions. See `packages/neris-schema`.
- **The department owns its data.** Every feature stores records locally in open
  formats and supports clean export. No lock-in, ever.
- **Life-safety mindset.** This software runs in emergencies. Favor correctness,
  tests, and clear failure modes over cleverness.

## Getting started

```bash
git clone https://github.com/<org>/open-fire-platform
cd open-fire-platform
git clone --depth 1 https://github.com/ulfsri/neris-framework   # for codegen
NERIS_FRAMEWORK_PATH=./neris-framework npm run generate
npm install
npm run dev            # API on :3000 (simulation mode without NERIS creds)
```

Try it:

```bash
# create a draft incident
curl -sX POST localhost:3000/api/v1/incidents \
  -H 'content-type: application/json' \
  -d '{"internalId":"LPOK-0001","data":{"incident_internal_id":"LPOK-0001"}}'
# list / export
curl -s localhost:3000/api/v1/incidents/export
```

## How we work

- Discuss anything non-trivial in an issue first.
- One logical change per PR; include tests.
- Sign your commits (DCO) — `git commit -s`. By contributing, you agree your contributions are licensed under the project's **AGPLv3**.
- Be kind. See `CODE_OF_CONDUCT.md`.

## Documentation conventions

Any doc that explains how to run or deploy something covers **two setups**, in this order:

1. **Local-only** — the simplest possible way to run it, usually a single container /
   `docker compose up`. This is what a developer or a curious firefighter uses first.
2. **Hosting-provider** — how each part is deployed on real infrastructure. Lead with a
   **generic** version ("deploy the service like this, route to it like this") and add
   provider-specific notes (Cloudflare, a cloud ALB, etc.) only where they genuinely
   differ. Don't over-specify one vendor at the expense of the generic path — every
   provider does it a little differently, so the generic path is the contract and the
   provider notes are examples.

Keep both honest about what exists today versus what's target architecture.

## Where help is most needed (Wave 0)

- Postgres-backed incident repository (replace the in-memory Map).
- Schema-driven incident form UI (React/Svelte) generated from `@ofp/neris-schema`.
- Conditional sub-module logic (fire/medical/hazsit) from the framework's
  `possible_if` / `neris_core_if` rules.
- NERIS sandbox integration tests.
