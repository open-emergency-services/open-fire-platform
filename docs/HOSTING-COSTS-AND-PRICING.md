# Hosting: Compliance, Costs, and How We Price It

*The money-and-compliance reality behind the optional managed-hosting offering. Written to be published — departments and sponsors should be able to see exactly what drives the price. Figures are planning estimates (sourced below), not quotes.*

Self-hosting is always free. This document is only about the **optional** hosted service — for departments that would rather pay us to run it than run it themselves — and what it actually costs to do responsibly.

## 1. The one decision that drives everything: keep CJI out of scope

The biggest cost lever in the entire model is whether the software touches **CJI (Criminal Justice Information)** — data from FBI/state criminal-justice systems (NCIC lookups, criminal history, warrants). CJI triggers the FBI's **CJIS Security Policy**, which in practice pushes you into government cloud (AWS GovCloud / Azure Government, ~10–25% more expensive), fingerprint background checks for every engineer, FIPS-validated crypto, and triennial audits.

**Fire incident reporting (NERIS) and EMS patient-care records (NEMSIS) do not contain CJI.** So if we architect the fire/EMS core to never ingest criminal-justice data, that whole regime doesn't apply to it, and we can host it in ordinary commercial cloud. CJIS only enters if/when we host CAD/RMS that queries law-enforcement systems — a later, opt-in, separately-priced environment.

**Design rule:** the fire/EMS core stays CJI-free and commercial-cloud. CJI-bearing CAD is a separate, GovCloud, CJIS-scoped tier that most departments will never need from us.

## 2. Which compliance regime applies to which module

| Module / data | Regime that applies | Where it can be hosted |
|---|---|---|
| Fire incident reporting (NERIS) | None beyond general security + SOC 2 (no PHI, no CJI) | Commercial cloud |
| Records, scheduling, training, assets, LOSAP | General security + SOC 2 | Commercial cloud |
| **EMS patient care (ePCR / NEMSIS)** | **HIPAA** — it's PHI. Requires BAAs (you↔department and you↔cloud provider), encryption, audit, breach process | Commercial cloud (HIPAA-eligible services) |
| **CAD/RMS touching law-enforcement data (CJI)** | **CJIS** — MFA, FIPS-validated crypto, background checks, GovCloud in practice | GovCloud / Azure Government |
| Selling hosted software to some states | **StateRAMP/GovRAMP** (or **TX-RAMP** in Texas) — increasingly required, six-figure | Authorized environment |

Two things to internalize: **there is no "HIPAA certification"** — it's self-attested, which is why customers ask for **SOC 2 Type II** (an independent audit) as proof; and **StateRAMP/FedRAMP are contract-triggered six-figure tiers**, not day-one costs.

## 3. What it costs before a single customer (annual fixed base)

Because compliance is mostly a *fixed* cost, the economics are **fixed-cost-heavy, marginal-cost-light**. Here's the annual base, from cited industry figures:

| Component | Low (no-CJI, lean) | Medium | High (full CJIS/GovCloud) |
|---|---|---|---|
| SOC 2 Type II (audit + tooling, ongoing) | $25,000 | $40,000 | $70,000 |
| Cyber + Tech E&O insurance | $5,000 | $12,000 | $25,000 |
| Annual penetration test | $8,000 | $15,000 | $25,000 |
| Baseline infra (HA/idle, pre-customer) | $6,000 | $18,000 | $40,000 |
| CJIS personnel/program (only if CJI in scope) | $3,000 | $10,000 | $25,000 |
| **Annual fixed base** | **~$47,000** | **~$95,000** | **~$185,000** |

Plus a **first-year one-time** ~$15k–$40k for initial SOC 2 readiness/remediation. **StateRAMP**, only if a contract forces it, adds **~$180k–$260k year one / ~$160k–$200k ongoing** — treated as a separate tier, not part of the base.

## 4. What each additional department costs (marginal)

In a shared multi-tenant design, per-department cost is small — mostly storage, backups, a little compute and egress:

| Department profile | Marginal cost / department / year |
|---|---|
| Small / volunteer, commercial cloud, fire reporting | ~$150–$600 |
| Typical, more records/attachments (± some GovCloud) | ~$600–$2,000 |
| Large / metro, heavy ePCR volume, long retention, HA/DR | ~$2,000–$6,000 |

## 5. How we turn cost into price (the transparent formula)

Price per department ≈ **(fixed base ÷ number of hosted departments) + that department's marginal cost + a modest margin** (the margin is what pays maintainers — the sustainability engine).

The important consequence, and it's the honest version of "cheaper as we grow": the **fixed base dominates at low customer counts**. At 20 departments the lean base alone is ~$2,350 each; at 200 it's ~$235 each. So early-adopter hosting is either (a) priced higher, (b) founder/sponsor-subsidized, or (c) a mix — and the fair price genuinely **falls as the platform grows**, the opposite of the private-equity direction. We publish the base, the count, and the math, so the price is never a mystery.

## 6. Phasing compliance to match the roadmap (so early hosting is affordable)

Compliance cost ramps with the modules — which means hosting can start lean and add layers only as riskier data arrives:

- **Phase 2a — Fire reporting hosting (no PHI, no CJI).** Commercial cloud, general security, working toward SOC 2. Lowest compliance base. This is where hosting starts, alongside the Wave-0 wedge.
- **Phase 2b — EMS/ePCR hosting.** Adds **HIPAA**: BAAs, HIPAA-eligible services, formal risk analysis, SOC 2 Type II now effectively required. Only turn this on when EMS modules ship and the revenue supports it.
- **Phase 3 — CAD/CJI hosting (optional).** Adds the **CJIS/GovCloud** environment for the minority of departments that want us to host CJI-bearing dispatch. Separately priced to cover its own premium.
- **StateRAMP/TX-RAMP** — pursued only when a specific state/contract requires it.

This sequencing keeps the founder from carrying a $185k compliance base on day one to host a $600/year fire-reporting tenant.

## 7. Open questions to confirm before quoting real prices

- **NERIS vendor security bar** — whether submitting to the federal NERIS system imposes specific hosting/auth/FedRAMP requirements is **not yet publicly documented**; confirm with the USFA/UL NERIS help desk before building the integration.
- **State-by-state CJIS cloud acceptance** and **NEMSIS state data-use agreements** vary; verify per state you operate in.
- Get **real quotes** for SOC 2, insurance, and pen testing — they swing widely with scope and underwriting.

## Sources

Figures synthesized from: CJIS Security Policy MFA/FIPS updates ([Mark43](https://mark43.com/resources/blog/the-cjis-security-policy-was-just-updated-what-you-should-know/), [Entrust](https://www.entrust.com/blog/2024/08/understanding-the-new-cjis-mfa-mandate-and-its-importance-for-your-agency)); AWS/Azure CJIS positions ([AWS](https://aws.amazon.com/compliance/cjis/), [Azure](https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-cjis)); HHS HIPAA & Cloud Computing guidance ([HHS](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)); SOC 2 cost ([Secureframe](https://secureframe.com/hub/soc-2/audit-cost)); StateRAMP/TX-RAMP cost ([Paramify](https://www.paramify.com/blog/tx-ramp-vs-stateramp)); NEMSIS DUAs ([NEMSIS](https://nemsis.org/using-ems-data/state-data-use-agreements/)); NERIS ([USFA](https://www.usfa.fema.gov/nfirs/neris/about-neris/)); insurance ([Insureon](https://www.insureon.com/technology-business-insurance/saas-companies/cost), [TechInsurance](https://www.techinsurance.com/cyber-liability-insurance/cost)); GovCloud premium ([Atonement](https://atonementlicensing.com/blog/aws-govcloud-pricing/)); pen testing ([Astra](https://www.getastra.com/blog/security-audit/penetration-testing-cost/)). All figures are planning estimates as of August 2026.
