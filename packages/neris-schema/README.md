# @ofp/neris-schema

Generates the platform's NERIS types **from the published federal framework** —
so keeping pace with a moving standard is a pipeline, not manual toil.

## Regenerate

```bash
git clone --depth 1 https://github.com/ulfsri/neris-framework
NERIS_FRAMEWORK_PATH=./neris-framework npm run generate
```

Produces in `src/generated/` — **the whole framework, not just incidents**:

| File | Contents |
|---|---|
| `modules.generated.ts` | A typed interface for **every** NERIS module — incident + sub-modules, dispatch (CAD), the fire-dept entity (stations/units/PSAP), shared sub-modules, augmentation, and the secondary schemas (inspections, hydrants, CRR, health & safety, incident analysis). ~39 interfaces. Includes `NerisIncidentCore`. |
| `value-sets.generated.ts` | Every value set as an `as const` array (`VS_TYPE_…`) + a union type. ~157 sets. |
| `neris-core-fields.generated.ts` | `NERIS_CORE_FIELDS` — the incident minimal-record required fields |
| `incident-types.generated.ts` | `NERIS_INCIDENT_TYPES` — the 128-entry incident-type hierarchy |

This is what makes "capture every field the standard defines" (see
`docs/DATA-CAPTURE-INVENTORY.md` + ADR-0006) true by construction.

The generated files **are** checked in (so the repo builds without the framework
present), but they are derived artifacts — never hand-edit them; re-run the
generator when FSRI publishes a schema revision.

> Production note: for the live wire format (cardinality, nesting, nullability),
> the authoritative source is the NERIS OpenAPI spec at
> `https://api.neris.fsri.org/v1/docs`. The official
> [`@ulfsri/neris-nodejs-client`](https://github.com/ulfsri/neris-nodejs-client)
> code-generates request/response types from it; this package covers the
> human-facing form/model layer.
