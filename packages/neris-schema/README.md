# @ofp/neris-schema

Generates the platform's NERIS types **from the published federal framework** —
so keeping pace with a moving standard is a pipeline, not manual toil.

## Regenerate

```bash
git clone --depth 1 https://github.com/ulfsri/neris-framework
NERIS_FRAMEWORK_PATH=./neris-framework npm run generate
```

Produces in `src/generated/`:

| File | Contents |
|---|---|
| `incident-core.generated.ts` | `NerisIncidentCore` interface (non-computed fields, typed, with docs) |
| `neris-core-fields.generated.ts` | `NERIS_CORE_FIELDS` — the minimal-record required fields |
| `incident-types.generated.ts` | `NERIS_INCIDENT_TYPES` hierarchy + `NerisIncidentLeafType` union |

The generated files **are** checked in (so the repo builds without the framework
present), but they are derived artifacts — never hand-edit them; re-run the
generator when FSRI publishes a schema revision.

> Production note: for the live wire format (cardinality, nesting, nullability),
> the authoritative source is the NERIS OpenAPI spec at
> `https://api.neris.fsri.org/v1/docs`. The official
> [`@ulfsri/neris-nodejs-client`](https://github.com/ulfsri/neris-nodejs-client)
> code-generates request/response types from it; this package covers the
> human-facing form/model layer.
