#!/usr/bin/env node
/**
 * NERIS schema code generator.
 *
 * The single highest-leverage idea in the whole platform: the NERIS data
 * framework (github.com/ulfsri/neris-framework) is published as CSV/YAML.
 * We GENERATE our TypeScript types, our "minimal record" required-field list,
 * and the incident-type hierarchy from it — so when FSRI revises the federal
 * standard, we re-run this script instead of hand-editing forms and models.
 *
 * Usage:
 *   NERIS_FRAMEWORK_PATH=/path/to/neris-framework node scripts/generate.mjs
 *
 * Reads:
 *   <framework>/core_schemas/modules/csv/incident/core_mod_incident.csv
 *   <framework>/core_schemas/value_sets/csv/type_incident.csv
 * Writes:
 *   src/generated/incident-core.generated.ts   (field interface)
 *   src/generated/neris-core-fields.generated.ts (minimal-record field list)
 *   src/generated/incident-types.generated.ts   (type hierarchy + union)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'generated');
const FRAMEWORK =
  process.env.NERIS_FRAMEWORK_PATH ||
  join(__dirname, '..', '..', '..', '..', 'neris', 'neris-framework');

/** Minimal RFC-4180-ish CSV parser (handles quoted fields w/ commas + escaped quotes). */
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
  const rows = parseCsv(csvText).filter(r => r.length > 1);
  const header = rows.shift();
  return rows.map(r => Object.fromEntries(header.map((h, idx) => [h.trim(), (r[idx] ?? '').trim()])));
}

/** Map a NERIS framework `type` to a TypeScript type. */
function tsType(nerisType) {
  const t = (nerisType || '').trim();
  if (t === 'Text') return 'string';
  if (t === 'Integer' || t === 'Numeric' || t === 'Float') return 'number';
  if (t === 'Boolean') return 'boolean';
  if (t === 'Point') return 'GeoJsonPoint';
  if (t === 'Multipolygon') return 'GeoJsonMultiPolygon';
  if (t === 'Module') return 'Record<string, unknown>'; // nested sub-module
  if (t.startsWith('Array[Array[')) return 'string[][]';
  if (t.startsWith('Array[Module]')) return 'Record<string, unknown>[]';
  if (t.startsWith('Array[')) {
    const inner = t.slice('Array['.length, -1);
    return `${tsType(inner)}[]`;
  }
  return 'unknown';
}

const truthy = v => String(v).trim().toUpperCase() === 'TRUE';
const banner = `// AUTO-GENERATED from the NERIS data framework. DO NOT EDIT BY HAND.\n// Re-run: node scripts/generate.mjs\n// Source: github.com/ulfsri/neris-framework\n\n`;

function main() {
  if (!existsSync(FRAMEWORK)) {
    console.error(`\nNERIS framework not found at:\n  ${FRAMEWORK}\n`);
    console.error('Set NERIS_FRAMEWORK_PATH, or clone it:');
    console.error('  git clone --depth 1 https://github.com/ulfsri/neris-framework\n');
    process.exit(1);
  }

  // ---- 1. Incident core fields ----
  const incPath = join(FRAMEWORK, 'core_schemas/modules/csv/incident/core_mod_incident.csv');
  const fields = toObjects(readFileSync(incPath, 'utf8')).filter(f => f.name);

  const lines = [];
  const coreFields = [];
  for (const f of fields) {
    if (truthy(f.computed)) continue; // computed server-side; we never submit these
    const required = truthy(f.db_required) || truthy(f.neris_core);
    const optional = required ? '' : '?';
    const jsdoc = f.definition ? `  /** ${f.definition.replace(/\*\//g, '')} */\n` : '';
    lines.push(`${jsdoc}  ${f.name}${optional}: ${tsType(f.type)};`);
    if (truthy(f.neris_core)) coreFields.push(f.name);
  }

  writeFileSync(join(OUT, 'incident-core.generated.ts'),
    banner +
    `export interface GeoJsonPoint { type: 'Point'; coordinates: [number, number]; }\n` +
    `export interface GeoJsonMultiPolygon { type: 'MultiPolygon'; coordinates: number[][][][]; }\n\n` +
    `/** Core NERIS incident record (non-computed fields). */\n` +
    `export interface NerisIncidentCore {\n${lines.join('\n')}\n}\n`);

  // ---- 2. Minimal-record required fields ----
  writeFileSync(join(OUT, 'neris-core-fields.generated.ts'),
    banner +
    `/** Fields NERIS marks 'neris_core' — required for a minimally-complete record. */\n` +
    `export const NERIS_CORE_FIELDS = ${JSON.stringify(coreFields, null, 2)} as const;\n`);

  // ---- 3. Incident type hierarchy ----
  const typePath = join(FRAMEWORK, 'core_schemas/value_sets/csv/type_incident.csv');
  const types = toObjects(readFileSync(typePath, 'utf8')).filter(t => t.value_1);
  const entries = types.map(t => ({
    l1: t.value_1, l2: t.value_2, l3: t.value_3,
    label: [t.description_1, t.description_2, t.description_3].filter(Boolean).join(' / '),
    active: truthy(t.active),
  }));
  const leafUnion = [...new Set(entries.map(e => e.l3).filter(Boolean))]
    .map(v => `  | '${v}'`).join('\n');

  writeFileSync(join(OUT, 'incident-types.generated.ts'),
    banner +
    `/** NERIS incident-type hierarchy (value_1 → value_2 → value_3). */\n` +
    `export interface NerisIncidentType { l1: string; l2: string; l3: string; label: string; active: boolean; }\n\n` +
    `export const NERIS_INCIDENT_TYPES: NerisIncidentType[] = ${JSON.stringify(entries, null, 2)};\n\n` +
    `export type NerisIncidentLeafType =\n${leafUnion};\n`);

  writeFileSync(join(OUT, 'index.ts'),
    banner +
    `export * from './incident-core.generated';\n` +
    `export * from './neris-core-fields.generated';\n` +
    `export * from './incident-types.generated';\n`);

  console.log(`Generated from NERIS framework:`);
  console.log(`  • ${fields.length} incident fields  (${coreFields.length} are neris_core / minimal-record)`);
  console.log(`  • ${entries.length} incident types  (${leafUnion.split('\n').length} leaf codes)`);
  console.log(`  → ${OUT}`);
}

main();
