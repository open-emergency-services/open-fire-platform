import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { PgLike } from './pg-event-store';

/** DI token for the Postgres pool (or null when running in-memory). */
export const PG_POOL = 'PG_POOL';

const log = new Logger('Core');

/**
 * Create the Core's Postgres pool from `DATABASE_URL` and run pending migrations.
 * Returns null when `DATABASE_URL` is unset — the app then runs on the in-memory
 * store (ADR-0004 storage ladder: single-node-dev vs durable Postgres). `pg` is
 * imported dynamically so the in-memory path needs no driver.
 */
export async function createPool(): Promise<PgLike | null> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    log.log('No DATABASE_URL — using the in-memory event store (non-durable).');
    return null;
  }
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: url });
  await runMigrations(pool);
  log.log('Core event store: Postgres (durable).');
  return pool as unknown as PgLike;
}

/** Apply any *.sql in the migrations dir that hasn't run yet, tracked in `_migrations`. */
async function runMigrations(pool: { query: (t: string, p?: unknown[]) => Promise<{ rows: any[] }> }): Promise<void> {
  const dir = process.env.MIGRATIONS_DIR || join(process.cwd(), 'migrations');
  if (!existsSync(dir)) {
    log.warn(`Migrations dir not found at ${dir} — skipping.`);
    return;
  }
  await pool.query(
    `CREATE TABLE IF NOT EXISTS _migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  );
  const applied = new Set((await pool.query(`SELECT filename FROM _migrations`)).rows.map((r) => r.filename));
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    if (applied.has(f)) continue;
    await pool.query(readFileSync(join(dir, f), 'utf8'));
    await pool.query(`INSERT INTO _migrations(filename) VALUES ($1)`, [f]);
    log.log(`Applied migration ${f}.`);
  }
}
