<div align="center">

# 🔥 The Open Fire Platform

**Free, open-source, department-owned software for the fire service.**

*Own your data. One interface. No lock-in — ever.*

</div>

---

## Why this exists

The software fire departments depend on — to dispatch calls, file federal reports, chart patient care, schedule crews — has been bought up by private-equity firms and repriced. The cheap options were retired. One department's bill went from **$795 to over $5,000 a year**. Another was pushed from **$2,500 toward $15,000 over five years** with *no new features*, locked into a multi-year contract, and told that leaving would mean **losing all their records**. In January 2026, two U.S. senators asked the DOJ and FTC to investigate.

That last part — *lose your records if you leave* — isn't a bug. It's the business model. And it's fixable.

**We're building the alternative:** an open platform where the software is free, the code is public, your data is always yours to export, and the cost of keeping it alive goes *down* as more departments join — the exact opposite of the private-equity playbook. The fire service already runs on this idea. It's called mutual aid.

## What it is

Not another point product — **one platform** with a shared core and modules a department turns on as it needs them, all behind **a single interface**. Open an incident and see its dispatch times, federal report, patient care records, and investigation together. The commercial roll-ups structurally can't do that, because their "suites" are separate companies bolted together. Ours is one system by design.

The plan spans the whole department — reporting, EMS, scheduling, training, prevention, apparatus, dispatch — built in five waves over years. But it starts with the piece every U.S. department now legally needs and shouldn't have to pay a fortune for:

> **Wave 0 — free NERIS incident reporting.** The old federal reporting system (NFIRS) was retired in early 2026; every department must now report to its replacement, **NERIS**. This repo is a working start on a free, open, standards-native way to do exactly that.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the technical shape, and the project blueprint for the full ecosystem, roadmap, and cooperative funding model.

## What's in this repo right now

```
packages/neris-schema   TypeScript types generated FROM the federal NERIS framework
apps/api                NestJS API — NERIS gateway + incident records with a
                        submission state machine (your DB is the system of record)
docker-compose.yml      The whole Wave-0 footprint: one API + one Postgres
```

Two principles are already load-bearing in the code:

1. **Generate from the standard.** We don't hand-code NERIS fields — we generate them from the [published federal framework](https://github.com/ulfsri/neris-framework). When the standard changes, we re-run the generator. Keeping pace becomes a pipeline, not a treadmill.
2. **The department owns its data.** Every incident lives its full life in *your* database and is always exportable. NERIS is a place we *send* records — never the only place they live. No one can hold your data hostage.

## Quick start

```bash
git clone https://github.com/<org>/open-fire-platform
cd open-fire-platform

# generate NERIS types from the federal framework
git clone --depth 1 https://github.com/ulfsri/neris-framework
NERIS_FRAMEWORK_PATH=./neris-framework npm run generate

npm install
npm run dev        # API on http://localhost:3000/api/v1  (simulation mode, no creds needed)
```

```bash
# create → validate → (submit) an incident
curl -sX POST localhost:3000/api/v1/incidents \
  -H 'content-type: application/json' \
  -d '{"internalId":"LPOK-0001","data":{"incident_internal_id":"LPOK-0001"}}'
```

## The promise

**The software is free forever. The code and the data are yours to keep. And the price of keeping it alive goes down as more of us join — not up.**

## How it stays alive

A nonprofit **cooperative**, not a vendor. The software is always free; departments that can, chip in what they can to fund a small maintaining team and the federal certifications — and as membership grows, everyone's share shrinks. Grants (the NERIS transition is a federal priority) and optional paid hosting bootstrap the early years. Full model in the funding one-pager.

## Get involved

- **Fire departments** — be a design partner. Run it alongside what you have now (zero risk), tell us what's wrong, help shape it. Free forever; founding partners get a permanent voice in the roadmap.
- **Developers** — start with Wave 0. TypeScript · PostgreSQL · standards-generated schemas · reuse-heavy (Traccar, Timefold, Moodle, Keycloak). See [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Funders & partners** — help underwrite open public-safety infrastructure at the moment it's most needed.

📬 **[your-email] · [project link] · [chat/community link]**

## License

[Apache-2.0](LICENSE). Fork it, run it, build on it. *"Open Fire Platform" is a working name.*

---

<div align="center"><sub>Built by and for the fire service. Nobody should have to pay a private-equity firm to file a report about a fire.</sub></div>
