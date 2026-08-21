import { Injectable, Logger } from '@nestjs/common';
import { EventStore } from '../core/event-store';
import { EventPublisher } from '../events/event-publisher';
import { Projector } from '../projections/projector';
import { CorrelationService } from './correlation';
import { RadioEvent, validateRadioEvent } from './radio-event';

/** Outcome of ingesting one radio event — enough for the adapter to ack/observe. */
export interface IngestResult {
  accepted: boolean;
  duplicate: boolean;
  problems: string[];
  correlation: 'talkgroup' | 'unit-assignment' | 'time-site' | 'unresolved';
  incidentId?: string;
  mayday: boolean;
}

/** An event we couldn't tie to an incident — read from the log, never dropped. */
interface UnassignedEvent {
  event: RadioEvent;
  receivedAt: string;
}

/**
 * CommsService — the platform side of the radio seam, now event-sourced (ADR-0004/0006).
 *
 *   validate → gap-track(session_id, seq) → correlate → APPEND to the Core (commit)
 *            → project onto the incident's comms facet → publish to the SSE stream
 *
 * The Core is the single commit point (idempotent on event_id); the read model is
 * derived by the projector; the alert stream is published after commit. A lost or
 * duplicate delivery is safe: dedupe is the store's job, and a mayday is never dropped
 * — if it can't be correlated it's still committed (queryable as unassigned) and surfaced.
 */
@Injectable()
export class CommsService {
  private readonly log = new Logger(CommsService.name);
  /** Gap detection: `${source}:${session_id}` → last seq seen. */
  private readonly lastSeq = new Map<string, number>();

  constructor(
    private readonly store: EventStore,
    private readonly correlation: CorrelationService,
    private readonly events: EventPublisher,
    private readonly projector: Projector,
  ) {}

  async ingest(raw: unknown): Promise<IngestResult> {
    const problems = validateRadioEvent(raw);
    if (problems.length > 0) {
      this.log.warn(`Rejected radio event: ${problems.join('; ')}`);
      return { accepted: false, duplicate: false, problems, correlation: 'unresolved', mayday: false };
    }
    const ev = raw as RadioEvent;
    this.trackGaps(ev);

    const { incident, method } = this.correlation.correlate(ev);
    const correlation = incident
      ? { incident_id: incident.incidentId, department_id: incident.departmentId }
      : undefined;

    // Commit to the Core (idempotent on event_id). raw = the full envelope, lossless.
    const { event, duplicate } = await this.store.append({
      event_id: ev.event_id,
      source: 'open-p25-console',
      source_type: ev.event_type,
      schema_version: ev.schema_version,
      session_id: ev.session_id,
      source_seq: ev.seq,
      occurred_at: ev.timestamp,
      raw: ev as unknown as Record<string, unknown>,
      normalized: {
        event_type: ev.event_type,
        unit_id: ev.unit.id,
        talkgroup_id: ev.talkgroup.id,
        emergency: ev.emergency,
        call_id: ev.call_id ?? null,
      },
      correlation,
    });

    if (duplicate) {
      return { accepted: true, duplicate: true, problems: [], correlation: method, incidentId: incident?.incidentId, mayday: false };
    }

    // Derive the read model from the committed event.
    const res = this.projector.applyRadioEvent(event);

    // Publish to the real-time stream AFTER commit (ADR-0002). Rebuilds never reach here.
    if (res.applied && res.isMayday && res.mayday) {
      const m = res.mayday;
      this.events.publish({
        type: 'mayday.declared',
        departmentId: incident!.departmentId,
        incidentId: res.incidentId,
        priority: 'critical',
        payload: {
          eventId: m.eventId,
          radioUnitId: m.unit.radioUnitId,
          unitDisplayName: m.unit.displayName ?? null,
          unitResolved: m.unit.resolved,
          talkgroupId: m.talkgroupId,
          occurredAt: m.occurredAt,
          clockSynced: m.clockSynced ?? null,
        },
      });
    } else if (res.applied) {
      this.events.publish({
        type: 'radio.event',
        departmentId: incident!.departmentId,
        incidentId: res.incidentId,
        priority: 'info',
        payload: {
          eventType: ev.event_type,
          radioUnitId: ev.unit.id,
          unitDisplayName: res.unitDisplayName ?? null,
          talkgroupId: ev.talkgroup.id,
          callId: ev.call_id ?? null,
          emergency: ev.emergency,
          encrypted: ev.encrypted,
          at: ev.timestamp,
        },
      });
    } else if (res.isMayday) {
      // Uncorrelated mayday — committed anyway, surfaced at ops level.
      this.log.error(
        `MAYDAY from unit ${ev.unit.id} on talkgroup ${ev.talkgroup.id} could not be correlated — stored UNASSIGNED and surfaced.`,
      );
      this.events.publish({
        type: 'mayday.unassigned',
        departmentId: '',
        priority: 'critical',
        payload: {
          eventId: ev.event_id,
          radioUnitId: ev.unit.id,
          talkgroupId: ev.talkgroup.id,
          occurredAt: ev.timestamp,
          clockSynced: ev.clock_synced ?? null,
        },
      });
    }

    return { accepted: true, duplicate: false, problems: [], correlation: method, incidentId: res.incidentId, mayday: res.isMayday };
  }

  private trackGaps(e: RadioEvent): void {
    const key = `${e.source}:${e.session_id}`;
    const last = this.lastSeq.get(key);
    if (last === undefined) {
      this.lastSeq.set(key, e.seq);
      return;
    }
    if (e.seq > last + 1) {
      this.log.warn(`Gap on ${key}: expected seq ${last + 1}, got ${e.seq} (${e.seq - last - 1} missing).`);
    }
    if (e.seq > last) this.lastSeq.set(key, e.seq);
  }

  /** Radio events in the log that couldn't be correlated to an incident (never dropped). */
  async listUnassigned(): Promise<UnassignedEvent[]> {
    const all = await this.store.all();
    return all
      .filter((e) => e.source === 'open-p25-console' && !(e.correlation && e.correlation.incident_id))
      .map((e) => ({ event: e.raw as unknown as RadioEvent, receivedAt: e.received_at }));
  }
}
