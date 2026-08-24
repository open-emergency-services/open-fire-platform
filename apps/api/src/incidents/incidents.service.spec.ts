import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { NERIS_CORE_FIELDS } from '@ofp/neris-schema';
import { InMemoryEventStore } from '../core/event-store';
import { EventPublisher } from '../events/event-publisher';
import { IncidentReadModel } from '../projections/incident-read-model';
import { Projector } from '../projections/projector';
import { RosterService } from '../projections/roster';
import { RecordsService } from '../modules/records/records.service';
import { NerisGateway } from '../neris/neris.gateway';
import { IncidentsService } from './incidents.service';

// A record with every neris_core field filled, so validation finds no gaps.
const FULL = Object.fromEntries(NERIS_CORE_FIELDS.map((f) => [f, 'x'])) as Record<string, unknown>;

describe('IncidentsService (event-sourced create + validate + submit)', () => {
  let store: InMemoryEventStore;
  let readModel: IncidentReadModel;
  let projector: Projector;
  let records: RecordsService;
  let svc: IncidentsService;

  beforeEach(() => {
    store = new InMemoryEventStore();
    readModel = new IncidentReadModel();
    projector = new Projector(readModel, new RosterService());
    records = new RecordsService(store, new EventPublisher(), projector);
    svc = new IncidentsService(new NerisGateway(), store, readModel, projector, records);
  });

  // Replay the whole log into a fresh read model — proves state is derived, not stored.
  async function rebuilt(): Promise<IncidentReadModel> {
    const rm = new IncidentReadModel();
    new Projector(rm, new RosterService()).rebuild(await store.all());
    return rm;
  }

  it('create yields a draft incident in the unified read model', async () => {
    const inc = await svc.create('DEMO_DEPT', 'RUN-1', FULL);
    expect(inc.status).toBe('draft');
    expect(inc.internalId).toBe('RUN-1');
    expect(svc.list('DEMO_DEPT')).toHaveLength(1);
  });

  it('validate → validated (no gaps), event-sourced and durable across rebuild', async () => {
    const inc = await svc.create('DEMO_DEPT', 'RUN-2', FULL);
    const v = await svc.validate('DEMO_DEPT', inc.id, 'ENT-1');
    expect(v.validationGaps).toHaveLength(0);
    expect(v.status).toBe('validated');
    expect((await rebuilt()).getOrThrow('DEMO_DEPT', inc.id).status).toBe('validated'); // derived from the log
  });

  it('validate with missing core fields stays draft and records the gaps', async () => {
    const inc = await svc.create('DEMO_DEPT', 'RUN-3', {});
    const v = await svc.validate('DEMO_DEPT', inc.id, 'ENT-1');
    expect(v.status).toBe('draft');
    expect(v.validationGaps.length).toBeGreaterThan(0);
  });

  it('submit after validate → accepted, and the lifecycle is in the record audit trail', async () => {
    const inc = await svc.create('DEMO_DEPT', 'RUN-4', FULL);
    await svc.validate('DEMO_DEPT', inc.id, 'ENT-1');
    const s = await svc.submit('DEMO_DEPT', inc.id, 'ENT-1');
    expect(s.status).toBe('accepted');
    const hist = await records.history('incident-core', inc.id);
    // acceptance also locks the record — that lock is part of the audit trail
    expect(hist.map((h) => h.type)).toEqual(['created', 'incident.validated', 'incident.submitted', 'locked']);
    expect((await rebuilt()).getOrThrow('DEMO_DEPT', inc.id).status).toBe('accepted');
  });

  it('locks the incident record once accepted — edits are then refused', async () => {
    const inc = await svc.create('DEMO_DEPT', 'RUN-6', FULL);
    await svc.validate('DEMO_DEPT', inc.id, 'ENT-1');
    const s = await svc.submit('DEMO_DEPT', inc.id, 'ENT-1');
    expect(s.status).toBe('accepted');
    expect(records.getOrThrow('incident-core', inc.id).locked).toBe(true);
    await expect(records.update('incident-core', inc.id, { note: 'tweak' })).rejects.toThrow(/locked/i);
  });

  it('submitting before validating is rejected', async () => {
    const inc = await svc.create('DEMO_DEPT', 'RUN-5', FULL);
    await expect(svc.submit('DEMO_DEPT', inc.id, 'ENT-1')).rejects.toThrow(/validate/i);
  });
});
