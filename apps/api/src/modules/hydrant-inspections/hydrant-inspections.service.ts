import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NerisHydrantInspection } from '@ofp/neris-schema';
import { EventStore } from '../../core/event-store';
import { StoredEvent } from '../../core/stored-event';
import { HydrantInspectionRecord } from './hydrant-inspection.entity';

const SOURCE_TYPE = 'hydrant.inspection.created';

/**
 * Hydrant inspections — a Regular-tier module (ADR-0005) and the TEMPLATE every future
 * data-entry screen follows.
 *
 * The pattern: writes append to the Core (the source of truth); the module keeps its own
 * read model, projected from the committed events; on boot it rebuilds that read model
 * from the durable log. Self-contained — adding a new screen is copying this shape,
 * not editing anything central. Fields come straight from the generated
 * `NerisHydrantInspection` interface, so there's no data modeling to do.
 */
@Injectable()
export class HydrantInspectionsService implements OnApplicationBootstrap {
  private readonly log = new Logger('HydrantInspections');
  private readonly readModel = new Map<string, HydrantInspectionRecord>();

  constructor(private readonly store: EventStore) {}

  async onApplicationBootstrap(): Promise<void> {
    const events = await this.store.all();
    this.readModel.clear();
    for (const e of events) if (e.source_type === SOURCE_TYPE) this.project(e);
    if (this.readModel.size) this.log.log(`Rebuilt ${this.readModel.size} hydrant inspections from the log.`);
  }

  async create(data: Partial<NerisHydrantInspection>): Promise<HydrantInspectionRecord> {
    const id = randomUUID();
    const ts = new Date().toISOString();
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: SOURCE_TYPE,
      occurred_at: ts,
      raw: { id, data },
      normalized: { id, data },
      correlation: data.hydrant_id ? { hydrant_id: data.hydrant_id } : undefined,
    });
    this.project(event);
    return this.getOrThrow(id);
  }

  list(): HydrantInspectionRecord[] {
    return [...this.readModel.values()];
  }

  getOrThrow(id: string): HydrantInspectionRecord {
    const rec = this.readModel.get(id);
    if (!rec) throw new NotFoundException('Hydrant inspection not found');
    return rec;
  }

  private project(e: StoredEvent): void {
    const n = e.normalized as { id: string; data?: Partial<NerisHydrantInspection> };
    this.readModel.set(n.id, { id: n.id, data: n.data ?? {}, createdAt: e.occurred_at ?? e.received_at });
  }
}
