import { Global, Module } from '@nestjs/common';
import { EventStore, InMemoryEventStore } from './event-store';

/**
 * The Core (ADR-0004) — the append-only event store. Global so every module can
 * append/read without re-importing. Bound to the in-memory store by default; a real
 * deployment rebinds `EventStore` to `PgEventStore` (Postgres) with no other changes.
 */
@Global()
@Module({
  providers: [{ provide: EventStore, useClass: InMemoryEventStore }],
  exports: [EventStore],
})
export class CoreModule {}
