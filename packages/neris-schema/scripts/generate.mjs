#!/usr/bin/env node
/**
 * NERIS schema code generator (full-framework).
 *
 * The single highest-leverage idea in the platform: the NERIS data framework
 * (github.com/ulfsri/neris-framework) is published as CSV/YAML. We GENERATE
 * TypeScript for EVERY module it defines — incident + sub-modules, the dispatch
 * (CAD) schema, the fire-department entity (stations/units/PSAP), the shared
 * sub-modules, augmentation, and the secondary schemas — plus every value set.
 * When FSRI revises the federal standard, re-run this instead of hand-editing.
 *
 * This is what makes "capture every field the standard defines" (ADR-0006 +
 * DATA-CAPTURE-INVENTORY) true by construction rather than by hand.
 *
 * Usage:
 *   NERIS_FRAMEWORK_PATH=/path/to/neris-framework node scripts/generate.mjs
 *
 * Writes into src/generated/:
 *   modules.generated.ts        every module → a typed interface
 *   value-sets.generated.ts     every value set → an `as const` array + union
 *   incident-types.generated.ts the incident-type hierarchy
 *   neris-core-fields.generated.ts  the incident minimal-record field list
 *   index.ts
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'generated');
const FRAMEWORK =
  process.env.NERIS_FRAMEWORK_PATH ||
  join(__dirname, '..', '..', '..', '..', 'neris', 'neris-framework');

/** Minimal RFC-4180-ish CSV parser (quoted fields w/ commas + escaped quotes). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', i = 0, inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { inQuotes = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function toObjects(csvText) {
  const rows = parseCsv(csvText).filter((r) => r.length > 1);
  const header = rows.shift();
  return rows.map((r) => Object.fromEntries(header.map((h, idx) => [h.trim(), (r[idx] ?? '').trim()])));
}

const truthy = (v) => String(v).trim().toUpperCase() === 'TRUE';
const pascal = (s) =>
  String(s).replace(/\.csv$/, '').replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

/** Recursively find *.csv under a dir. */
function findCsvs(root) {
  const out = [];
  if (!existsSync(root)) return out;
  for (const name of readdirSync(root, { recursive: true })) {
    if (String(name).endsWith('.csv')) out.push(join(root, String(name)));
  }
  return out;
}

const banner = (extra = '') =>
  `// AUTO-GENERATED from the NERIS data framework. DO NOT EDIT BY HAND.\n` +
  `// Re-run: NERIS_FRAMEWORK_PATH=... node scripts/generate.mjs\n` +
  `// Source: github.com/ulfsri/neris-framework\n${extra}\n`;

function ifaceNameFor(path) {
  const base = basename(path);
  if (base === 'core_mod_incident.csv') return 'NerisIncidentCore'; // backward-compatible
  const core = base.replace(/^core_mod_/, '').replace(/^mod_/, '');
  return 'Neris' + pascal(core);
}

function main() {
  if (!existsSync(FRAMEWORK)) {
    console.error(`NERIS framework not found at ${FRAMEWORK}. Set NERIS_FRAMEWORK_PATH.`);
    process.exit(1);
  }
  const moduleRoots = [
    join(FRAMEWORK, 'core_schemas', 'modules', 'csv'),
    join(FRAMEWORK, 'secondary_schemas', 'modules', 'csv'),
  ];
  const moduleFiles = moduleRoots.flatMap(findCsvs).sort();

  // First pass: assign interface names (resolve collisions by prefixing parent dir).
  const used = new Set();
  const modules = moduleFiles.map((path) => {
    let name = ifaceNameFor(path);
    if (used.has(name)) name = 'Neris' + pascal(basename(dirname(path))) + name.replace(/^Neris/, '');
    used.add(name);
    return { path, name, base: basename(path), fields: toObjects(readFileSync(path, 'utf8')) };
  });

  // Registry for sub-module resolution: many keys → interface name.
  const registry = new Map();
  for (const m of modules) {
    const b = m.base.replace(/\.csv$/, '');
    registry.set(b, m.name);                              // e.g. mod_exposure / core_mod_incident
    registry.set(b.replace(/^core_mod_/, '').replace(/^mod_/, ''), m.name); // e.g. exposure
  }
  const resolveModule = (field) => {
    const hay = `${field.definition || ''} ${field.format || ''}`;
    const ref = hay.match(/mod_([a-z0-9_]+)/i);
    if (ref && (registry.get('mod_' + ref[1].toLowerCase()) || registry.get(ref[1].toLowerCase())))
      return registry.get('mod_' + ref[1].toLowerCase()) || registry.get(ref[1].toLowerCase());
    if (registry.get('mod_' + field.name) || registry.get(field.name))
      return registry.get('mod_' + field.name) || registry.get(field.name);
    return 'Record<string, unknown>';
  };

  const tsType = (field) => {
    const t = (field.type || '').trim();
    const scalar = (x) => {
      if (x === 'Text') return 'string';
      if (['Integer', 'Numeric', 'Float'].includes(x)) return 'number';
      if (x === 'Boolean') return 'boolean';
      if (x === 'Point') return 'GeoJsonPoint';
      if (x === 'Multipolygon') return 'GeoJsonMultiPolygon';
      if (x === 'Module') return resolveModule(field);
      if (x === 'JSONB') return 'Record<string, unknown>';
      if (['Date', 'Time Delta'].includes(x) || x.startsWith('Datetime')) return 'string'; // ISO
      return 'unknown';
    };
    if (t === 'Array[Array[Text]]' || t === 'Array[Array[Text') return 'string[][]';
    let base;
    if (t.startsWith('Array[')) {
      const inner = t.slice('Array['.length, t.lastIndexOf(']') >= 0 ? t.lastIndexOf(']') : undefined);
      base = `${scalar(inner === 'Module' ? 'Module' : inner)}[]`;
    } else {
      base = scalar(t);
    }
    // Honor Multi cardinality even when the type wasn't declared as an array.
    if ((field.cardinality || '').trim().toLowerCase() === 'multi' && !base.endsWith('[]')) base += '[]';
    return base;
  };

  const prop = (field) => {
    const name = /^[A-Za-z_][A-Za-z0-9_]*$/.test(field.name) ? field.name : JSON.stringify(field.name);
    const required = truthy(field.db_required) || truthy(field.neris_core);
    const doc = (field.definition || '').trim();
    const core = truthy(field.neris_core) ? ' [neris_core]' : '';
    const jsdoc = doc || core ? `  /** ${doc}${core} */\n` : '';
    return `${jsdoc}  ${name}${required ? '' : '?'}: ${tsType(field)};`;
  };

  // ---- modules.generated.ts ----
  const geo =
    `export interface GeoJsonPoint { type: 'Point'; coordinates: [number, number]; }\n` +
    `export interface GeoJsonMultiPolygon { type: 'MultiPolygon'; coordinates: number[][][][]; }\n`;
  const interfaces = modules
    .map((m) => {
      const src = m.base.replace(/\.csv$/, '');
      const seen = new Set();
      const fields = m.fields.filter((f) => f.name && !seen.has(f.name) && seen.add(f.name));
      const body = fields.map(prop).join('\n');
      return `/** NERIS module \`${src}\` (${fields.length} fields). */\nexport interface ${m.name} {\n${body}\n}`;
    })
    .join('\n\n');
  writeFileSync(join(OUT, 'modules.generated.ts'), banner() + geo + '\n' + interfaces + '\n');

  // ---- value-sets.generated.ts ----
  const vsFiles = [
    ...findCsvs(join(FRAMEWORK, 'core_schemas', 'value_sets', 'csv')),
    ...findCsvs(join(FRAMEWORK, 'secondary_schemas', 'value_sets', 'csv')),
  ].filter((p) => basename(p) !== 'type_incident.csv'); // hierarchy handled separately
  const vsBlocks = [];
  const emittedVs = new Set();
  for (const p of vsFiles.sort()) {
    const rows = toObjects(readFileSync(p, 'utf8'));
    const vals = rows.filter((r) => r.value && (!('active' in r) || truthy(r.active))).map((r) => r.value);
    if (!vals.length) continue;
    const cname = 'VS_' + basename(p).replace(/\.csv$/, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    const tname = pascal(basename(p).replace(/\.csv$/, ''));
    if (emittedVs.has(cname)) continue; // same value set in core + secondary — keep first
    emittedVs.add(cname);
    vsBlocks.push(
      `/** Value set \`${basename(p)}\` (${vals.length} choices). */\n` +
        `export const ${cname} = [\n${vals.map((v) => '  ' + JSON.stringify(v)).join(',\n')}\n] as const;\n` +
        `export type ${tname} = typeof ${cname}[number];`
    );
  }
  writeFileSync(join(OUT, 'value-sets.generated.ts'), banner() + vsBlocks.join('\n\n') + '\n');

  // ---- neris-core-fields.generated.ts (incident minimal record) ----
  const incident = modules.find((m) => m.name === 'NerisIncidentCore');
  const coreFields = incident.fields.filter((f) => truthy(f.neris_core)).map((f) => f.name);
  writeFileSync(
    join(OUT, 'neris-core-fields.generated.ts'),
    banner("\n/** Fields NERIS marks 'neris_core' — required for a minimally-complete incident. */") +
      `export const NERIS_CORE_FIELDS = [\n${coreFields.map((f) => '  ' + JSON.stringify(f)).join(',\n')}\n] as const;\n`
  );

  // ---- incident-types.generated.ts (hierarchy) ----
  const typePath = join(FRAMEWORK, 'core_schemas', 'value_sets', 'csv', 'type_incident.csv');
  const typeRows = existsSync(typePath) ? toObjects(readFileSync(typePath, 'utf8')) : [];
  const types = typeRows
    .filter((r) => (r.value_1 || r.value1) && (!('active' in r) || truthy(r.active)))
    .map((r) => {
      const l1 = r.value_1 || r.value1 || '', l2 = r.value_2 || r.value2 || '', l3 = r.value_3 || r.value3 || '';
      const label = [l1, l2, l3].filter(Boolean).map((s) => s.replace(/_/g, ' ')).map((s) =>
        s.split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')).join(' / ');
      return { l1, l2, l3, label, active: true };
    });
  writeFileSync(
    join(OUT, 'incident-types.generated.ts'),
    banner('\n/** NERIS incident-type hierarchy (value_1 → value_2 → value_3). */') +
      `export interface NerisIncidentType { l1: string; l2: string; l3: string; label: string; active: boolean; }\n\n` +
      `export const NERIS_INCIDENT_TYPES: NerisIncidentType[] = ${JSON.stringify(types, null, 2)};\n`
  );

  // ---- index.ts ----
  // Remove the old single-incident file if present (folded into modules.generated.ts).
  const oldIncident = join(OUT, 'incident-core.generated.ts');
  if (existsSync(oldIncident)) rmSync(oldIncident);
  writeFileSync(
    join(OUT, 'index.ts'),
    banner() +
      `export * from './modules.generated';\n` +
      `export * from './value-sets.generated';\n` +
      `export * from './neris-core-fields.generated';\n` +
      `export * from './incident-types.generated';\n`
  );

  console.log(
    `Generated ${modules.length} module interfaces, ${vsBlocks.length} value sets, ` +
      `${types.length} incident types, ${coreFields.length} neris_core fields.`
  );
}

main();
