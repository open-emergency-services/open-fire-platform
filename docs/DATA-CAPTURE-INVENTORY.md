# Data Sources & Capture Inventory

The map of every inbound data point the platform captures, and where it goes. Its job is
to make sure that when we build the API, **everything we might want to pull out has already
been captured.** Pair it with [ADR-0006](./adr/ADR-0006-capture-everything-ingestion.md),
which is the safety net for anything *not* on this map.

## The guarantee (read this first)

**No data point is ever dropped — even one with no designated slot.** Every inbound event
is stored three ways (ADR-0006):

- **`raw`** — the complete verbatim inbound, lossless. *This is where anything unmodeled
  lands.* A vendor-specific CAD field, a brand-new radio attribute — if it arrived, it's in
  `raw`, intact.
- **`normalized`** — the fields mapped into typed slots (what the API serves today).
- **`unmapped`** — keys present in `raw` but not yet mapped, so we can *see* what we're
  receiving-but-not-using and add a slot deliberately.

So "what happens to data that doesn't fit a slot?" → **it's captured in `raw`, flagged in
`unmapped`, and gets a slot whenever we decide — never re-collected because it was never
lost.** This map defines the *known, typed* slots; raw+unmapped covers the rest.

## What changed: the standard defines almost everything

The NERIS framework turned out to define far more than incidents. It also publishes the
**Dispatch (CAD) schema**, the **fire-department Entity spec** (stations, units, PSAP,
shifts), the **shared sub-modules**, and **secondary schemas** (inspections, hydrants,
community risk reduction, health & safety, incident analysis). So instead of hand-typing
those, we **generate** them — `packages/neris-schema` now emits **39 typed module
interfaces**, **157 value sets**, and the **128-entry incident-type hierarchy** straight
from the standard (`node scripts/generate.mjs`). That closed most of the gaps this
inventory used to list, the standards-native way — regenerate to stay current.

## Sources at a glance

| Source | Authority | Capture status | Slot |
|---|---|---|---|
| Radio events | Frozen envelope v1.0 (ours) | **Complete** | Incident `comms` facet + raw |
| Incident + sub-modules | NERIS (generated) | **Complete** (typed) | `NerisIncidentCore` + sub-module interfaces + raw |
| Dispatch / CAD | NERIS dispatch schema (generated) | **NERIS fields typed**; vendor extras via raw | `NerisDispatch` + raw |
| Fire dept / stations / units | NERIS entity spec (generated) | **Typed** | `NerisEntityFd` + raw |
| Personnel | NERIS health & safety (generated) | **Typed** (spec, injury) | `NerisPersonnelSpec` / `NerisPersonnelInjury` + raw |
| Inspections / hydrants / CRR | NERIS secondary (generated) | **Typed** | inspection / hydrant / CRR interfaces + raw |
| Incident analysis (fire cause, casualty…) | NERIS secondary (generated) | **Typed** | analysis interfaces + raw |
| EMS patient care (full ePCR) | NEMSIS v3.5 | **Sibling scope** (`open-nemsis-epcr`); medical involvement typed | `NerisMedical` + raw; future ePCR |
| Manual / UI entry | NERIS + local | Via API → incident | Incident fields + narrative |

## The 39 generated NERIS interfaces

- **Incident + sub-modules:** `NerisIncidentCore`, `NerisFire`, `NerisMedical`, `NerisHazard`,
  `NerisEmergingHazard`, `NerisExposure`, `NerisRescueFf`, `NerisRescueNonff`,
  `NerisRiskReduction`.
- **Dispatch (CAD):** `NerisDispatch`.
- **Entity (dept / station / unit / PSAP / shifts):** `NerisEntityFd`.
- **Shared sub-modules:** `NerisCivicLocation`, `NerisLocationUse`, `NerisTacticTimestamps`,
  `NerisUnitResponse`.
- **Augmentation:** `NerisParcel`, `NerisWeather`.
- **Community risk reduction:** `NerisCommercialInspection`, `NerisStructureInspection`,
  `NerisOutdoorInspection`, `NerisHydrantInspection`, `NerisHomeVisit`, `NerisCommunityEvent`,
  `NerisParcelDataCollection`, `NerisCoreCRR`.
- **Health & safety:** `NerisHealthSafety`, `NerisPersonnelSpec`, `NerisPersonnelInjury`,
  `NerisIncident` (H&S).
- **Incident analysis:** `NerisAnalysis`, `NerisStructureFire`, `NerisOutdoorFire`,
  `NerisTransportationFire`, `NerisBatteryIncident`, `NerisConsumerProducts`,
  `NerisDinsStructure`, `NerisHazsit`, `NerisCasualtyFf`, `NerisCasualtyNonff`.

Plus **157 value sets** (`VS_TYPE_…` `as const` arrays + union types) for every dropdown the
standard defines, and the incident-type hierarchy.

## Source detail

### Radio events — complete
Frozen envelope v1.0 (INTEGRATION-RADIO-SEAM). All fields normalized onto the incident
**comms facet**; full envelope in `raw`.

### NERIS (incident, dispatch, entity, secondary) — generated
`packages/neris-schema` is the authority — regenerate when FSRI revises the standard. Every
field the framework defines now has a typed slot (see the 39 interfaces above).

Remaining refinement (not lost data — depth, not breadth): a handful of `Module`-typed
fields still resolve to `Record<string, unknown>` where the generator couldn't auto-link
the sub-module by name; their data is fully stored, and linking them to the named sub-module
interface is a generator tweak, not new capture.

### Dispatch / CAD — NERIS fields typed, vendor extras via raw
`NerisDispatch` covers what NERIS standardizes for dispatch. A *specific vendor's* CAD often
emits more (granular per-unit status times, a full narrative log, caller ANI/ALI). Those
land losslessly in `raw` and show in `unmapped`; if a deployment wants them typed, we add a
richer internal CAD model on top — but nothing is lost in the meantime.

### EMS / patient care — sibling scope, involvement typed
Full patient-care reporting is `open-nemsis-epcr` (NEMSIS v3.5, its own authority). On the
fire platform, medical involvement is typed via `NerisMedical` + `NerisCasualtyNonff` etc.,
with `raw` capturing anything else.

### Roster / master data — largely covered
`NerisEntityFd` (department, stations, units, PSAP, shifts) + `NerisPersonnelSpec` /
`NerisPersonnelInjury`. The radio-unit→person/apparatus resolver (roster) maps P25 ids onto
these records.

### Manual / UI entry
Narrative, on-scene accountability, times not machine-fed, and report-completion fields —
all map to the generated incident slots; corrections re-open the incident per the state
machine.

## Gaps remaining (small, and none lose data)

1. **Vendor-CAD superset** — beyond NERIS's dispatch fields; `raw` captures it now, add a
   richer typed model only if a deployment needs those fields queryable.
2. **Full NEMSIS ePCR** — sibling project scope; `NerisMedical` + raw cover involvement here.
3. **Sub-module auto-linking** — a few `Module` fields still typed `Record<string,unknown>`;
   a generator refinement, not missing capture.

## The one rule that makes the map non-critical

Even if this inventory is *incomplete*, the platform loses nothing — every adapter stores
the full `raw` and records `unmapped` (ADR-0006). This map tells us what's already in a
typed slot; raw+unmapped guarantees everything else is on disk, waiting for a slot whenever
we want one. **Adapters must never drop an unrecognized field.**
