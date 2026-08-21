# Data Sources & Capture Inventory

The map of every inbound data point the platform captures, and where it goes. Its job is
to make sure that when we build the API, **everything we might want to pull out has already
been captured.** Pair it with [ADR-0006](./adr/ADR-0006-capture-everything-ingestion.md),
which is the safety net for anything *not* on this map.

## The guarantee (read this first)

**No data point is ever dropped — even one with no designated slot.** Every inbound event
is stored three ways (ADR-0006):

- **`raw`** — the complete verbatim inbound, lossless. *This is where anything unmodeled
  lands.* A latitude/longitude, a vendor-specific CAD field, a brand-new radio attribute
  we never planned for — if it arrived, it's in `raw`, intact.
- **`normalized`** — the fields we've mapped into typed slots (what the API serves today).
- **`unmapped`** — the keys that were in `raw` but not mapped, so we can *see* what we're
  receiving-but-not-yet-using and add a slot later, deliberately.

So the answer to "what happens to data that doesn't fit a slot?" is: **it's captured in
`raw`, flagged in `unmapped`, and we add a slot for it whenever we decide to — no data is
ever re-collected because it was never lost.** This inventory defines the *known* slots;
the raw+unmapped mechanism covers the rest.

## Sources at a glance

| Source | Authority for its fields | Capture status | Primary slot |
|---|---|---|---|
| Radio events | Frozen envelope v1.0 (ours) | **Complete** | Incident `comms` facet + raw |
| CAD / dispatch feed | The department's CAD (varies); NENA/APCO norms | **Contract to define** (biggest gap) | Incident + `unit_response` + times + raw |
| NERIS incident record | NERIS framework (generated) | **Incident entity complete**; other NERIS entities not yet generated | Incident `data` (NERIS-shaped) + raw |
| EMS / patient care | NEMSIS v3.5 | **Out of scope here** (sibling `open-nemsis-epcr`); `medical` module captured opaque | Incident `medical` + raw; future ePCR |
| Roster / master data | Department records | **Stub only** | Dedicated entities (personnel, apparatus, station) |
| Manual / UI entry | NERIS + local | Via API → incident | Incident fields + narrative |
| Future modules | Per module | Not started | Own entities as they mature |

---

## 1. Radio events — COMPLETE

Frozen envelope v1.0 (ADR-0004 / INTEGRATION-RADIO-SEAM). Every field captured:

`schema_version, event_type` (emergency, ptt_start, ptt_end, unit_registration,
unit_deregistration, talkgroup_affiliation, call_grant, call_end), `event_id, session_id,
seq, timestamp, source, clock_synced, radio_system{wacn, system_id, rfss_id},
unit{id, alias}, talkgroup{id, alias}, encrypted, emergency, call_id`.

→ Normalized onto the incident **comms facet** (transmissions, maydays, presence); full
envelope in `raw`. Nothing outstanding.

## 2. CAD / dispatch feed — CONTRACT TO DEFINE (the big gap)

We only stubbed create-incident + talkgroup binding. A real CAD feed carries far more, and
this is the richest single source. The contract we need to define should capture at least:

- **Identifiers:** CAD incident number, agency/jurisdiction, run number, update sequence.
- **Classification:** call type / nature code, problem/complaint, priority, EMD
  determinant, alarm level.
- **Location:** full civic address (number, prefix, street, type, suffix, apt/unit, city,
  state, ZIP), latitude/longitude, cross streets, common place name, response
  zone / battalion / district / beat, map-grid page, geocode-validated flag.
- **Times (each a distinct point):** call received, call created/entered, first dispatch,
  per-unit dispatched / enroute / staged / on-scene(arrival) / (EMS: patient contact,
  transport, at-hospital) / clear / available, cancelled, closed.
- **Caller / reporting party:** name, phone, callback, method (911 / phone / alarm /
  walk-in), ANI/ALI where present.
- **Units / resources:** unit id, apparatus type, staffing count/roster, primary vs
  assisting, and each unit's own status timeline.
- **Disposition:** disposition code, cancel reason.
- **Narrative:** timestamped dispatcher log entries / comments, with updates over time.
- **Cross-references:** linked/merged incidents, mutual-aid partners.
- **Source metadata:** CAD vendor/system id, message id.

→ Normalized onto the incident (identity, location, times → `unit_response` and NERIS
location/timestamp slots); the full CAD message always in `raw` so any vendor-specific or
unmapped field survives.

## 3. NERIS incident record — INCIDENT ENTITY COMPLETE

Generated from the federal framework (`packages/neris-schema`), which is the **authority**
— regenerate to stay current. Captured incident fields (28 `neris_core` required + optional
+ type hierarchy):

`incident_neris_id, incident_internal_id, incident_final_type(+_primary),
incident_special_modifier, fire, medical, hazsit, emerging_hazard, tactic_timestamps,
incident_point, incident_polygon, incident_location, incident_location_use,
incident_people_present, incident_displaced_cause, exposure, rescue_ff, rescue_nonff,
incident_rescue_animal, incident_actions_taken, incident_noaction, unit_response,
risk_reduction, incident_aid_direction/type/department_name/nonfd,
incident_narrative_impediment, incident_narrative_outcome, parcel, weather` + the 128-entry
`incident_type` hierarchy.

**Two follow-ups (not lost data, just not yet typed/queryable):**
- Several sub-modules are captured as **whole opaque objects** today (`mod_civic_location`,
  `mod_location_use`, `mod_rescue_ff`, `mod_rescue_civ`, `mod_emerging_hazard`,
  `unit_response`, `mod_parcel`, `mod_weather`, and the `fire`/`medical`/`hazsit`
  type-specific groups). They're fully stored; expand them into typed fields when the API
  needs to query *inside* them.
- NERIS also defines **non-incident entities** (department, fire station, apparatus,
  personnel registration) that our generator does **not** yet emit. Add them to the codegen
  so those records have typed slots too.

## 4. EMS / patient care (NEMSIS) — OUT OF SCOPE HERE (captured opaque)

Full patient care reporting is the sibling project (`open-nemsis-epcr`, NEMSIS v3.5). On
the fire platform, an incident's **medical involvement** is captured via NERIS's `medical`
module (opaque today) + `raw`. If/when EMS comes in-scope, the ePCR element set is large
and NEMSIS is its authority; the raw+unmapped rule means nothing is lost in the meantime.

## 5. Roster / master (reference) data — STUB ONLY

Today just a unit-id→name resolver. Needs real entities so the API can resolve and report:

- **Personnel:** id, name, rank/role, certifications/qualifications (FF I/II, EMT,
  paramedic, driver/operator, officer), contact, employment/volunteer status, assigned
  station/shift, associated radio unit id(s).
- **Apparatus:** id, type (engine, ladder/truck, medic, rescue, tanker, brush, command),
  home station, capabilities, staffing pattern, in-service/out-of-service status, radio id.
- **Stations:** id, name, address, apparatus assigned, response area.
- **Radio ↔ identity mapping:** P25 unit id → person/apparatus (the roster resolver).
- **Talkgroups:** id, alias, purpose/discipline.

## 6. Manual / UI entry — via API to the incident

What crews add that isn't machine-fed: narrative, on-scene personnel accountability, times
not captured by CAD, and the NERIS report-completion fields. Maps to incident slots +
narrative; corrections re-open the incident per the state machine.

## 7. Future modules — own entities as they mature

Scheduling (shifts, time-off, staffing), inspections (occupancy, violations, schedules),
hydrants (location, flow, static/residual, status, inspection history), pre-plans /
occupancy (building data, hazards, contacts), training (records, certs, ISO credit),
hazmat. Each gets its own entity + the same raw+normalized+unmapped capture when built.

---

## Gaps to close before / during API work

1. **Define the CAD inbound contract** (§2) — the largest missing slot set. Do this first.
2. **Generate the non-incident NERIS entities** (§3) — department, station, apparatus,
   personnel.
3. **Model roster / master data** (§5) — real personnel/apparatus/station entities.
4. **Expand NERIS opaque sub-modules** (§3) into typed fields where the API must query
   inside them.
5. **Decide EMS scope** (§4) — reference `open-nemsis-epcr` or defer; either way `medical`
   + raw already capture involvement.

## The one rule that makes the map non-critical

Even if this inventory is *incomplete*, the platform still loses nothing — because every
adapter stores the full `raw` and records `unmapped` (ADR-0006). This map tells us what's
already in a typed slot; the raw+unmapped mechanism guarantees that everything else is
still on disk, waiting for a slot whenever we want one. **Adapters must never drop an
unrecognized field.**
