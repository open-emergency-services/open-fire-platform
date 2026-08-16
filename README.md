<div align="center">

# 🔥 The Open Fire Platform

**Free, open-source, department-owned software for the fire service.**

*Own your data. One interface. No lock-in — ever.*

</div>

---

## Why this exists

The software fire departments depend on — to dispatch calls, file federal reports, chart patient care, schedule crews — has been bought up by private-equity firms and repriced. The cheap options get retired; departments get moved onto pricier products. Every figure below links to its primary source, because a project that asks you to trust it with your data has to show its work.

- A bipartisan **January 2026 letter** from U.S. Senators Amy Klobuchar and Roger Marshall to the DOJ and FTC reports price jumps **from $795 to more than $5,000 a year**, and that a single private-equity-backed vendor — **ESO Solutions** — provides software to **roughly 20,000 of the nation's ~30,000 fire departments**. *(Sources: [Klobuchar press release](https://www.klobuchar.senate.gov/public/index.cfm/news-releases?ID=A7A7B80E-5E02-496A-ACEA-C98546B66908) · [Marshall press release](https://www.marshall.senate.gov/?p=81473))*
- A **February 2026** [WGME/CBS13 I-Team investigation](https://wgme.com/news/i-team/maine-fire-departments-say-software-costs-surged-after-industry-buyouts) documented Bridgton, Maine's department facing a rise **from ~$2,500/year to a projected $15,000 over five years**, under what its chief called high-pressure sales "to get you to lock into a four- or five-year contract." Rockport's chief described **"13 years of all of our training records, all of our incident reporting"** tied to one vendor's system — and a **110% cost increase** in two years.

That last part — your own records trapped in a system you're being priced out of — isn't a bug. It's the business model. And it's fixable.

*In fairness to the other side: ESO's CEO has publicly argued the products they acquired were on an unsustainable financial footing and needed reinvestment and pricing changes to survive (New York Times, Dec. 2025, [as reported by WGME](https://wgme.com/news/i-team/maine-fire-departments-say-software-costs-surged-after-industry-buyouts)). We take that seriously — and still believe departments deserve a free, open, un-lockable option they control themselves.*

**We're building the alternative:** an open platform where the software is free, the code is public, your data is always yours to export, and the cost of keeping it alive goes *down* as more departments join — the exact opposite of the private-equity playbook. The fire service already runs on this idea. It's called mutual aid.

## What it is

Not another point product — **one platform** with a shared core and modules a department turns on as it needs them, all behind **a single interface**. Open an incident and see its dispatch times, federal report, patient care records, and investigation together. The commercial roll-ups structurally can't do that, because their "suites" are separate companies bolted together. Ours is one system by design.

The plan spans the whole department — reporting, EMS, scheduling, training, prevention, apparatus, dispatch — built in five waves over years. But it starts with the piece every U.S. department now legally needs and shouldn't have to pay a fortune for:

> **Wave 0 — free NERIS incident reporting.** The old federal reporting system, [NFIRS, was retired in early 2026](https://www.usfa.fema.gov/nfirs/sunset/): as of **January 1, 2026** all incident data goes exclusively to its replacement, [**NERIS**](https://www.usfa.fema.gov/nfirs/neris/) (run by the U.S. Fire Administration with FSRI / UL Research Institutes), and legacy NFIRS went offline that February. Every department must now report to NERIS. This repo is a working start on a free, open, standards-native way to do exactly that.

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

## Who runs this & how it stays alive

Straight answer: **one maintainer and an LLC — no VC, no board, no nonprofit (yet).** The software is free and open forever; money, when it comes, comes from **optional managed hosting** (for departments that don't want to self-host) and **sponsorship** — never from paywalling features or holding data hostage. Structure grows only when revenue justifies it (a foundation comes later, if the project earns it).

The founder would like to make a fair living from hosting/support, and is upfront that this isn't a nonprofit. What separates it from the private-equity playbook is a short list of binding promises — open code, always-exportable data, service-not-features pricing, public prices, and a wind-down guarantee so nobody gets stranded. Read the honest, blunt version — including the real risks of depending on a young solo project — in **[GOVERNANCE.md](GOVERNANCE.md)**. The hosting cost/compliance basis (and how prices are set) is laid out openly in **[docs/HOSTING-COSTS-AND-PRICING.md](docs/HOSTING-COSTS-AND-PRICING.md)**.

## Get involved

- **Fire departments** — be a design partner. Run it alongside what you have now (zero risk), tell us what's wrong, help shape it. Free forever; founding partners get a permanent voice in the roadmap.
- **Developers** — start with Wave 0. TypeScript · PostgreSQL · standards-generated schemas · reuse-heavy (Traccar, Timefold, Moodle, Keycloak). See [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Funders & partners** — help underwrite open public-safety infrastructure at the moment it's most needed.

📬 **[your-email] · [project link] · [chat/community link]**

## Sources

Every factual and numeric claim in this README links to a primary source. That transparency isn't decoration — it's the same principle as the software: no hidden anything, everything checkable.

**The pricing & consolidation claims**
- Price increase "$795 → more than $5,000/yr" and ESO's "~20,000 of ~30,000 fire departments" footprint — U.S. Senate: [Sen. Klobuchar release, Jan 21 2026](https://www.klobuchar.senate.gov/public/index.cfm/news-releases?ID=A7A7B80E-5E02-496A-ACEA-C98546B66908) · [Sen. Marshall release, Jan 2026](https://www.marshall.senate.gov/?p=81473)
- Bridgton ~$2,500 → $15,000/5yr, "four- or five-year contract" pressure, Rockport's "13 years of… records" and 110% increase, and the ESO / Emergency Reporting vendor detail — [WGME/CBS13 I-Team, Feb 12 2026](https://wgme.com/news/i-team/maine-fire-departments-say-software-costs-surged-after-industry-buyouts)

**The federal reporting transition**
- NFIRS retirement dates (Jan 1 2026 exclusive to NERIS; offline Feb 2026) — [USFA NFIRS Sunset](https://www.usfa.fema.gov/nfirs/sunset/)
- What NERIS is and who runs it (USFA + FSRI/UL Research Institutes + DHS S&T) — [USFA NERIS](https://www.usfa.fema.gov/nfirs/neris/)

**The standards & tools this project builds on**
- NERIS open data framework (the schema we generate types from) — [github.com/ulfsri/neris-framework](https://github.com/ulfsri/neris-framework)
- NERIS API documentation — [api.neris.fsri.org/v1/docs](https://api.neris.fsri.org/v1/docs)
- Official NERIS clients — [Python](https://github.com/ulfsri/neris-api-client) · [Node/TS](https://github.com/ulfsri/neris-nodejs-client)
- Reused open-source building blocks — [Traccar](https://github.com/traccar/traccar) (AVL) · [Timefold](https://github.com/TimefoldAI/timefold-solver) (scheduling) · [Moodle](https://moodle.org) (LMS) · [Keycloak](https://www.keycloak.org) (identity)

**Archived against link rot.** Every source above is also preserved two ways so the evidence survives even if a page disappears: a **Wayback Machine** snapshot and a **local PDF capture** committed to this repo under [`docs/sources/`](docs/sources/) (plus a combined [evidence dossier](docs/sources/00_source-evidence-dossier.pdf)). The full claim-by-claim ledger — exact quote, source, Wayback link, PDF, and verification date — is in [`docs/SOURCES.md`](docs/SOURCES.md).

*Verified August 16, 2026. Found an error or a dead link? Open an issue — correcting the record quickly is part of the trust this project runs on.*

## License

[Apache-2.0](LICENSE). Fork it, run it, build on it. *"Open Fire Platform" is a working name.*

---

<div align="center"><sub>Built by and for the fire service. Nobody should have to pay a private-equity firm to file a report about a fire.</sub></div>
