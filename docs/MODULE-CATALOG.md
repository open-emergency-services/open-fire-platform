# Module Catalog — the menu of screens to build

Every kind of record the system can capture, organized by area. Think of this as the list
of **data-entry screens** we'll build for crews: each entry is a "page" (a form),
the generated NERIS interface that already defines its fields, a few example fields, which
**API tier** it belongs to ([ADR-0005](./adr/ADR-0005-tiered-apis.md)), and its status.

**The point:** the *data models already exist* — all of this is generated from the NERIS
standard (`packages/neris-schema`, see [DATA-CAPTURE-INVENTORY.md](./DATA-CAPTURE-INVENTORY.md)).
So building any of these is "wire a form to an existing typed slot," not "figure out what to
store." When we're ready to add, say, a hydrant-maintenance page, the fields are waiting.

Status legend: **Schema ✓** = fields generated and typed; **UI/API to build** = the screen
and its Regular-tier endpoints aren't written yet. Everything below is Schema ✓.

---

## A. Incident documentation — the run report *(Essential record + Regular guided form)*

The primary workflow: documenting an incident. The base record is Essential (record / read /
export); the rich guided sub-forms are Regular.

| Screen / form | Interface | Captures (examples) |
|---|---|---|
| Incident record (the run) | `NerisIncidentCore` | type, times, location, actions taken, aid, narrative |
| Location & use | `NerisCivicLocation` / `NerisLocationUse` | address, point, how the location was used |
| Fire details | `NerisFire` | fire-type specifics |
| Medical | `NerisMedical` | medical involvement specifics |
| Hazardous situation | `NerisHazard` | hazard specifics |
| Emerging hazard | `NerisEmergingHazard` | emerging-hazard details, suppression |
| Exposures | `NerisExposure` | exposure type/item, damage, displaced |
| Firefighter rescue/casualty | `NerisRescueFf` | FF rescue & casualty module |
| Civilian rescue/casualty | `NerisRescueNonff` | non-FF rescue & casualty |
| Alarms & suppression performance | `NerisRiskReduction` | detection/suppression systems & performance |
| Tactic timestamps | `NerisTacticTimestamps` | timestamps for fire tactics employed |
| Unit response | `NerisUnitResponse` | responding units, times |
| Parcel / weather | `NerisParcel` / `NerisWeather` | usually auto-filled from location |

## B. Incident analysis — deeper post-incident investigation *(Regular)*

Filled after the fact for significant incidents — the investigative depth.

| Screen / form | Interface | Captures (examples) |
|---|---|---|
| Analysis record | `NerisAnalysis` | incident #, human factors, casualties, product involvement |
| Structure fire analysis | `NerisStructureFire` | occupant count, room of origin, structure stability, findings |
| Outdoor / wildland fire | `NerisOutdoorFire` | cause category, general/specific cause, permit, contributing activity |
| Transportation / vehicle fire | `NerisTransportationFire` | make, model, type, VIN, year, powertrain |
| Battery / energy-storage incident | `NerisBatteryIncident` | product type, charging state, indoor/outdoor, safety listing |
| Consumer product involvement | `NerisConsumerProducts` | product type, manufacturer, model, contribution |
| Damage inspection (DINS) | `NerisDinsStructure` | address, vacancy, units, damage assessment |
| Hazsit analysis | `NerisHazsit` | material released, class, physical state, quantity, cause |
| Firefighter casualty analysis | `NerisCasualtyFf` | type, rank, service, classification |
| Civilian casualty analysis | `NerisCasualtyNonff` | type, cause, room |

## C. Community Risk Reduction — proactive / community programs *(Regular)*

The "little pages" for the department's non-incident work — inspections, hydrants, outreach.
This is the group you called out (hydrant maintenance, community events, …).

| Screen / form | Interface | Captures (examples) |
|---|---|---|
| CRR record (rollup) | `NerisCoreCRR` | links home visits, events, hydrant & parcel data |
| **Hydrant inspection / maintenance** ✅ built | `NerisHydrantInspection` | hydrant id, date, lat/long, operable, impediment type, flow |
| Commercial inspection | `NerisCommercialInspection` | location, date, reinspection, code requirements |
| Structure inspection | `NerisStructureInspection` | units, vacancy, year built, findings |
| Outdoor inspection | `NerisOutdoorInspection` | location, distances between structures |
| Home safety visit | `NerisHomeVisit` | location, date, units, arrival/departure, engagement |
| **Community event** | `NerisCommunityEvent` | event id, virtual?, location, start/end, activity category |
| Parcel data collection | `NerisParcelDataCollection` | parcel id, zoning, flood plane, location use |

## D. Personnel health & safety *(Regular)*

| Screen / form | Interface | Captures (examples) |
|---|---|---|
| Health & safety record | `NerisHealthSafety` | links response exposures + injuries |
| Response / exposure event | `NerisIncident` (H&S) | incident type, traumatic event, on-scene duration, exposure |
| Personnel injury | `NerisPersonnelInjury` | datetime, severity, disposition, activity, body part |
| Personnel record | `NerisPersonnelSpec` | name, DOB, demographics, NFR number, entity id |

## E. Department & master data — setup / admin *(Regular)*

| Screen / form | Interface | Captures (examples) |
|---|---|---|
| Fire department / stations / units | `NerisEntityFd` | dept identity, addresses, PSAP/CAD, stations, unit ids, shifts |

---

## How to read this when we build

1. **Pick a screen** from a category above.
2. Its **fields already exist** as a typed interface in `@ofp/neris-schema` — no modeling.
3. Build the **form** (generated from the interface where possible) + the **Regular-tier
   endpoints** to save/read it (writes go through the Essential ingest to the Core per
   ADR-0004/0005; reads come from the read model).
4. The record is captured with the raw+normalized+unmapped guarantee (ADR-0006), so even a
   field a department adds beyond the standard is preserved.

Nothing here is urgent — it's the backlog of "things the system can save," all schema-ready.
We add each as a little page when we get to it.

**Reference implementation:** hydrant inspection is built end-to-end as the template every
other screen copies — `apps/api/src/modules/hydrant-inspections/` (Regular-tier endpoints:
`POST/GET /api/v1/hydrant-inspections`, event-sourced onto the Core, own read model rebuilt
from the log on boot) and `apps/web/hydrant.html` (the data-entry form). A new screen is
that shape with a different generated interface.

## Not-from-NERIS screens (still to model)

A few screens crews will want aren't in the NERIS framework and will be modeled separately
when we build them (they're not lost — just not standard-defined): **scheduling / staffing**
(shifts, time-off), **training records** (certs, ISO credit), and **apparatus/equipment
checks**. Note `NerisEntityFd` already carries shift *counts/durations* and unit ids; a full
scheduling module is its own thing.
