import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { NerisGateway } from '../neris/neris.gateway';
import { IncidentsService } from '../incidents/incidents.service';
import { RosterService } from './roster';
import { CorrelationService } from './correlation';
import { CommsService } from './comms.service';
import { RadioSystemId, talkgroupKey } from './radio-event';
import { IncidentCommsFacet } from './comms-facet';
import { EventPublisher } from '../events/event-publisher';
import { DomainEvent } from '../events/domain-event';
import { firstValueFrom } from 'rxjs';

const sys: RadioSystemId = { wacn: 'BEE00', system_id: 'ABC', rfss_id: '01' };
const t0 = Date.parse('2026-08-20T20:00:00.000Z');
const iso = (ms: number) => new Date(ms).toISOString();

/**
 * End-to-end tests for the radio → incident seam: correlation, idempotent
 * at-least-once delivery, the drop-tolerant transmission timeline, mayday
 * recording, and never-drop of uncorrelated events.
 */
describe('CommsService (radio seam)', () => {
  let incidents: IncidentsService;
  let roster: RosterService;
  let correlation: CorrelationService;
  let events: EventPublisher;
  let comms: CommsService;
  let incidentId: string;
  let seq = 0;

  const facet = (): IncidentCommsFacet => incidents.get('DEMO_DEPT', incidentId).comms!;

  const event = (t: string, over: Record<string, unknown>) => ({
    schema_version: '1.0',
    event_id: `evt-${++seq}`,
    session_id: 'sess-1',
    seq,
    timestamp: t,
    source: 'open-p25-console',
    radio_system: sys,
    unit: { id: '1234567', alias: null },
    talkgroup: { id: '101', alias: null },
    encrypted: false,
    emergency: false,
    ...over,
  });

  beforeEach(() => {
    seq = 0;
    incidents = new IncidentsService(new NerisGateway());
    roster = new RosterService();
    correlation = new CorrelationService();
    events = new EventPublisher();
    comms = new CommsService(incidents, roster, correlation, events);

    const inc = incidents.create('DEMO_DEPT', 'INT-1', {});
    incidentId = inc.id;
    roster.upsert(sys, '1234567', { apparatusId: 'E12', displayName: 'Engine 12' });
    correlation.bindTalkgroup(
      talkgroupKey(sys, { id: '101' }),
      { incidentId: inc.id, departmentId: 'DEMO_DEPT' },
      iso(t0),
    );
  });

  it('correlates a ptt_start to the bound incident and resolves the unit', () => {
    const r = comms.ingest(event(iso(t0 + 1000), { event_type: 'ptt_start', call_id: 'c1' }));
    expect(r.accepted).toBe(true);
    expect(r.correlation).toBe('talkgroup');
    expect(r.incidentId).toBe(incidentId);
    const tx = facet().transmissions[0];
    expect(tx.unit.resolved).toBe(true);
    expect(tx.unit.displayName).toBe('Engine 12');
    expect(tx.unit.radioUnitId).toBe('1234567'); // raw id always retained
  });

  it('is idempotent: re-delivering the same event_id does not double-append', () => {
    const e = event(iso(t0 + 1000), { event_type: 'ptt_start', call_id: 'c1' });
    comms.ingest(e);
    const again = comms.ingest(e);
    expect(again.duplicate).toBe(true);
    expect(facet().transmissions.filter((t) => t.callId === 'c1')).toHaveLength(1);
  });

  it('closes a transmission by event when a matching ptt_end arrives', () => {
    comms.ingest(event(iso(t0 + 1000), { event_type: 'ptt_start', call_id: 'c1' }));
    comms.ingest(event(iso(t0 + 5000), { event_type: 'ptt_end', call_id: 'c1' }));
    const tx = facet().transmissions.find((t) => t.callId === 'c1')!;
    expect(tx.closedBy).toBe('event');
    expect(tx.endedAt).toBe(iso(t0 + 5000));
  });

  it('auto-closes an unmatched ptt_start on the silence timeout (dropped radio)', () => {
    comms.ingest(event(iso(t0 + 6000), { event_type: 'ptt_start', call_id: 'c2' }));
    // A later event >30s after the start triggers the opportunistic sweep.
    comms.ingest(event(iso(t0 + 40000), { event_type: 'talkgroup_affiliation' }));
    const tx = facet().transmissions.find((t) => t.callId === 'c2')!;
    expect(tx.closedBy).toBe('timeout');
  });

  it('records a mayday and raises the active flag', () => {
    const r = comms.ingest(event(iso(t0 + 41000), { event_type: 'emergency', emergency: true }));
    expect(r.mayday).toBe(true);
    expect(facet().hasActiveMayday).toBe(true);
    expect(facet().maydays).toHaveLength(1);
    expect(facet().maydays[0].unit.displayName).toBe('Engine 12');
  });

  it('publishes a critical mayday.declared event to the real-time stream', async () => {
    const next = firstValueFrom(events.live()); // subscribe before publishing
    comms.ingest(event(iso(t0 + 41000), { event_type: 'emergency', emergency: true }));
    const evt: DomainEvent = await next;
    expect(evt.type).toBe('mayday.declared');
    expect(evt.priority).toBe('critical');
    expect(evt.departmentId).toBe('DEMO_DEPT');
    expect(evt.incidentId).toBe(incidentId);
    expect(evt.id).toBeGreaterThan(0); // monotonic id = SSE Last-Event-ID cursor
    expect(events.since(0).some((e) => e.type === 'mayday.declared')).toBe(true); // buffered for replay
  });

  it('never drops an uncorrelated event; an unbound mayday is stored unassigned', () => {
    const r = comms.ingest(
      event(iso(t0 + 42000), {
        event_type: 'emergency',
        emergency: true,
        talkgroup: { id: '999', alias: null },
      }),
    );
    expect(r.correlation).toBe('unresolved');
    expect(r.mayday).toBe(true);
    expect(comms.listUnassigned()).toHaveLength(1);
  });

  it('rejects a malformed envelope with problems and no crash', () => {
    const r = comms.ingest({ schema_version: '0.9', event_type: 'nope' });
    expect(r.accepted).toBe(false);
    expect(r.problems.length).toBeGreaterThan(0);
  });

  it('falls back to unit-assignment correlation when no talkgroup is bound', () => {
    const inc2 = incidents.create('DEMO_DEPT', 'INT-2', {});
    correlation.assignUnit(
      `${sys.wacn}:${sys.system_id}:${sys.rfss_id}:1234567`,
      { incidentId: inc2.id, departmentId: 'DEMO_DEPT' },
      iso(t0),
    );
    // Use a talkgroup that is NOT bound, so correlation must fall through to the unit.
    const r = comms.ingest(
      event(iso(t0 + 1000), { event_type: 'ptt_start', call_id: 'cX', talkgroup: { id: '555', alias: null } }),
    );
    expect(r.correlation).toBe('unit-assignment');
    expect(r.incidentId).toBe(inc2.id);
  });
});
