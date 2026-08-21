import { Global, Module } from '@nestjs/common';
import { EventStore, InMemoryEventStore } from './event-store';
import { PgEventStore, PgLike } from './pg-event-store';
import { PG_POOL, createPool } from './pg-pool';

/**
 * The Core (ADR-0004) — the append-only event store. Global so every module can
 * append/read. Config-driven binding (the storage ladder): with `DATABASE_URL` set
 * it runs on the durable Postgres log (`PgEventStore`), otherwise the in-memory store.
 * Moving from dev to durable is an env var, not a code change.
 */
@Global()
@Module({
  providers: [
    { provide: PG_POOL, useFactory: createPool },
    {
      provide: EventStore,
      inject: [PG_POOL],
      useFactory: (pool: PgLike | null) => (pool ? new PgEventStore(pool) : new InMemoryEventStore()),
    },
  ],
  exports: [EventStore, PG_POOL],
})
export class CoreModule {}
