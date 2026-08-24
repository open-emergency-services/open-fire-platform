import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Architectural guard for the ADR-0005 #5 write rule and the ADR-0004 append-only Core.
 *
 * The Core is the one thing that must never be corrupted, so writing to it is a
 * privilege, not a convenience. Two invariants are enforced here in code (they fail CI
 * if a future change breaks them):
 *
 *   1. The Core is APPEND-ONLY. The event store exposes exactly one write method,
 *      `append`; neither implementation issues an UPDATE/DELETE/TRUNCATE against the log.
 *   2. Writing to the Core is CONFINED. Only an explicit allowlist of modules calls
 *      `store.append(...)`. A new (or experimental) module cannot silently gain a write
 *      path to the Core — adding one is a deliberate edit to this list, i.e. a governance
 *      decision, exactly as ADR-0005 requires.
 *
 * (The *physical* tier split — the Regular tier reaching the Core only by calling the
 * Essential ingest over the network — is deployment-tier, D-series. This guard is the
 * in-process teeth that hold the invariant true today, before the services are split.)
 */

const SRC = join(process.cwd(), 'src');

// The sanctioned Core writers. Each is a domain write path that appends to the log
// through the single append seam. Adding a file here is the deliberate decision the
// ADR-0005 governance section calls for — do not add one to make a test pass.
const ALLOWED_WRITERS = new Set([
  'ingest/ingest.service.ts', // the Essential-tier ingest — the canonical write path
  'incidents/incidents.service.ts',
  'comms/comms.service.ts',
  'modules/records/records.service.ts',
  'modules/hydrant-inspections/hydrant-inspections.service.ts',
  'standards/standards.service.ts',
  // the store implementations themselves *define* append:
  'core/event-store.ts',
  'core/pg-event-store.ts',
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

describe('Core write invariant (ADR-0005 #5, ADR-0004 append-only)', () => {
  const files = walk(SRC).map((f) => ({ rel: f.slice(SRC.length + 1).replace(/\\/g, '/'), text: readFileSync(f, 'utf8') }));

  it('confines Core writes to the allowlisted write paths', () => {
    const writers = files.filter((f) => /\bstore\.append\s*\(/.test(f.text)).map((f) => f.rel).sort();
    // every actual writer must be sanctioned…
    for (const w of writers) expect(ALLOWED_WRITERS.has(w), `${w} writes to the Core but is not an allowlisted writer`).toBe(true);
    // …and the allowlist must not rot (every named writer still exists and still writes)
    for (const w of ALLOWED_WRITERS) {
      if (w.startsWith('core/')) continue; // the store defs are checked separately below
      expect(writers.includes(w), `${w} is allowlisted but no longer writes to the Core — prune the list`).toBe(true);
    }
  });

  it('keeps the event store append-only — the only write method is append()', () => {
    const storeDef = files.find((f) => f.rel === 'core/event-store.ts')!.text;
    // No mutation methods declared on the store contract other than append.
    expect(/\babstract\s+(update|delete|remove|patch|set|truncate)\b/i.test(storeDef)).toBe(false);
    expect(/\babstract\s+append\b/.test(storeDef)).toBe(true);
  });

  it('never issues an UPDATE/DELETE/TRUNCATE against the Postgres event log', () => {
    const pg = files.find((f) => f.rel === 'core/pg-event-store.ts')!.text;
    expect(/\b(update|delete\s+from|truncate)\b/i.test(pg)).toBe(false);
    expect(/insert\s+into\s+event_log/i.test(pg)).toBe(true);
  });
});
