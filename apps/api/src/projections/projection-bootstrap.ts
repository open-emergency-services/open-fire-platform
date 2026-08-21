import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventStore } from '../core/event-store';
import { Projector } from './projector';

/**
 * On startup, rebuild the read model from the Core log (ADR-0004/0006).
 *
 * This is the durability payoff: with the Postgres store, events survive a restart,
 * so the incident + comms read model is reconstructed by replaying the log — no state
 * is lost, and the projection is proven derivable from the source of truth every boot.
 * (With the in-memory store the log is empty on boot, so this is a no-op.)
 */
@Injectable()
export class ProjectionBootstrap implements OnApplicationBootstrap {
  private readonly log = new Logger('ProjectionBootstrap');

  constructor(
    private readonly store: EventStore,
    private readonly projector: Projector,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const events = await this.store.all();
    this.projector.rebuild(events);
    if (events.length) {
      this.log.log(`Rebuilt the read model from ${events.length} events in the Core log.`);
    }
  }
}
