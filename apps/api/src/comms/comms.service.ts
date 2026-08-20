import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IncidentsService } from '../incidents/incidents.service';
import { EventPublisher } from '../events/event-publisher';
import { RosterService } from './roster';
import { CorrelationService } from './correlation';
import {
  RadioEvent,
  validateRadioEvent,
  CALL_SCOPED_EVENTS,
} from './radio-event';
import {
  IncidentCommsFacet,
  emptyCommsFacet,
  Transmission,
  MaydayEvent,
  UnitPresence,
} from './comms-facet';

/** Outcome of ingesting one radio event — enough for the adapter to ack/observe. */
export interface IngestResult {
  accepted: boolean;
  duplicate: boolean;
  problems: string[];
  correlation: 'talkgroup' | 'unit-assignment' | 'time-site' | 'unresolved';
  incidentId?: string;
  /** true if this event opened/updated a mayday. */
  mayday: boolean;
}

/** An event we couldn't tie to an incident — stored, never dropped. */
interface UnassignedEvent {
  event: RadioEvent;
  receivedAt: string;
}

/** How long an open transmission may sit with no matching end before auto-close. */
const TRANSMISSION_SILENCE_TIMEOUT_MS = 30_000;

/**
 * CommsService — the platform side of the radio seam.
 *
 * It ingests frozen v1.0 radio events (from `open-p25-console` via an adapter on the
 * integration gateway), and folds them onto the correct incident's comms facet:
 *
 *   ingest → validate → dedupe(event_id) → gap-track(session_id,seq)
 *          → correlate(→incident) → roster.resolve(unit) → apply to facet
 *
 * Guarantees held here:
 *  - At-least-once + dedupe on event_id (idempotent): a replayed event is a no-op.
 *  - A mayday is never lost and never silently dropped; if it can't be correlated it
 *    is still stored (unassigned) and surfaced.
 *  - The timeline tolerates a ptt_start with no matching ptt_end: it auto-closes on a
 *    silence timeout, marked closed-by-timeout, so a dropped radio never leaves a
 *    channel "open" forever.
 */
@Injectable()
export class CommsService {
  private readonly log = new Logger(CommsService.name);

  /** Global idempotency: event_ids already applied. (Bounded/TTL'd in real code.) */
  private readonly seenEventIds = new Set<string>();
  /** Gap detection: `${source}:${session_id}` → last seq seen. */
  private readonly lastSeq = new Map<string, number>();
  /** Events with no incident — queryable, reconcilable, never dropped. */
  private readonly unassigned: UnassignedEvent[] = [];

  constructor(
    private readonly incidents: IncidentsService,
    private readonly roster: RosterService,
    private readonly correlation: CorrelationService,
    private readonly events: EventPublisher,
  ) {}

  private now(): string {
    return new Date().toISOString();
  }

  ingest(raw: unknown): IngestResult {
    const problems = validateRadioEvent(raw);
    if (problems.length > 0) {
      this.log.warn(`Rejected radio event: ${problems.join('; ')}`);
      return { accepted: false, duplicate: false, problems, correlation: 'unresolved', mayday: false };
    }
    const e = raw as RadioEvent;

    // Idempotency: at-least-once delivery means duplicates are expected and fine.
    if (this.seenEventIds.has(e.event_id)) {
      return { accepted: true, duplicate: true, problems: [], correlation: 'unresolved', mayday: false };
    }
    this.seenEventIds.add(e.event_id);

    this.trackGaps(e);

    const receivedAt = this.now();
    const { incident, method } = this.correlation.correlate(e);

    if (!incident) {
      // Never drop — especially a mayday.
      this.unassigned.push({ event: e, receivedAt });
      if (e.event_type === 'emergency') {
        this.log.error(
          `MAYDAY from unit ${e.unit.id} on talkgroup ${e.talkgroup.id} could not be correlated — stored UNASSIGNED and surfaced.`,
        );
        // Publish as an ops-level (unattributed) event so a global subscriber still alerts.
        this.events.publish({
          type: 'mayday.unassigned',
          departmentId: '',
          priority: 'critical',
          payload: {
            eventId: e.event_id,
            radioUnitId: e.unit.id,
            talkgroupId: e.talkgroup.id,
            occurredAt: e.timestamp,
            clockSynced: e.clock_synced ?? null,
          },
        });
      }
      return {
        accepted: true,
        duplicate: false,
        problems: [],
        correlation: 'unresolved',
        mayday: e.event_type === 'emergency',
      };
    }

    const rec = this.incidents.get(incident.departmentId, incident.incidentId);
    const facet: IncidentCommsFacet = rec.comms ?? emptyCommsFacet();

    // Opportunistic timeout sweep, using this event's time as "now".
    this.sweepTimeouts(facet, e.timestamp);

    const isMayday = this.apply(facet, e, receivedAt);

    facet.lastEventAt = e.timestamp;
    rec.comms = facet;
    this.incidents.touch(rec.id, rec.departmentId);

    if (isMayday) {
      // Publish to the real-time stream (ADR-0002) so connected interfaces alert now.
      const m = facet.maydays[facet.maydays.length - 1];
      this.events.publish({
        type: 'mayday.declared',
        departmentId: rec.departmentId,
        incidentId: rec.id,
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
    } else {
      // Publish non-mayday radio traffic at 'info' so an interface can render the
      // live open-mic / close-mic timeline over the same SSE stream (ADR-0002).
      const u = this.roster.resolve(e.radio_system, e.unit);
      this.events.publish({
        type: 'radio.event',
        departmentId: rec.departmentId,
        incidentId: rec.id,
        priority: 'info',
        payload: {
          eventType: e.event_type,
          radioUnitId: e.unit.id,
          unitDisplayName: u.displayName ?? null,
          talkgroupId: e.talkgroup.id,
          callId: e.call_id ?? null,
          emergency: e.emergency,
          encrypted: e.encrypted,
          at: e.timestamp,
        },
      });
    }

    return {
      accepted: true,
      duplicate: false,
      problems: [],
      correlation: method,
      incidentId: rec.id,
      mayday: isMayday,
    };
  }

  /** Apply one correlated event to the facet. Returns true if it was a mayday. */
  private apply(facet: IncidentCommsFacet, e: RadioEvent, receivedAt: string): boolean {
    const unit = this.roster.resolve(e.radio_system, e.unit);

    switch (e.event_type) {
      case 'emergency': {
        const mayday: MaydayEvent = {
          eventId: e.event_id,
          unit,
          talkgroupId: e.talkgroup.id,
          occurredAt: e.timestamp,
          receivedAt,
          clockSynced: e.clock_synced ?? null,
        };
        facet.maydays.push(mayday);
        facet.hasActiveMayday = true;
        this.notifyMayday(facet, mayday);
        return true;
      }

      case 'ptt_start': {
        const tx: Transmission = {
          callId: e.call_id ?? randomUUID(),
          unit,
          talkgroupId: e.talkgroup.id,
          startedAt: e.timestamp,
          emergency: e.emergency,
          encrypted: e.encrypted,
        };
        facet.transmissions.push(tx);
        return false;
      }

      case 'ptt_end': {
        const open = this.findOpenTransmission(facet, e);
        if (open) {
          open.endedAt = e.timestamp;
          open.closedBy = 'event';
        }
        // No matching open transmission is normal (start may have been missed) — ignore.
        return false;
      }

      case 'unit_registration':
      case 'unit_deregistration': {
        this.upsertPresence(facet, unit.radioUnitId, {
          unit,
          registered: e.event_type === 'unit_registration',
          updatedAt: e.timestamp,
        });
        return false;
      }

      case 'talkgroup_affiliation': {
        const existing = facet.presence[unit.radioUnitId];
        this.upsertPresence(facet, unit.radioUnitId, {
          unit,
          registered: existing?.registered ?? true,
          affiliatedTalkgroupId: e.talkgroup.id,
          updatedAt: e.timestamp,
        });
        return false;
      }

      case 'call_grant':
      case 'call_end':
        // Channel-level metadata. Same drop-tolerance principle applies; Wave-0 keeps
        // the timeline at ptt granularity and does not model a separate call timeline.
        return false;

      default:
        return false;
    }
  }

  /** Find the newest still-open transmission matching this end event. */
  private findOpenTransmission(facet: IncidentCommsFacet, e: RadioEvent): Transmission | undefined {
    for (let i = facet.transmissions.length - 1; i >= 0; i--) {
      const t = facet.transmissions[i];
      if (t.closedBy) continue;
      const sameCall = e.call_id != null && t.callId === e.call_id;
      const sameUnit = t.unit.radioUnitId === e.unit.id && t.talkgroupId === e.talkgroup.id;
      if (sameCall || sameUnit) return t;
    }
    return undefined;
  }

  /** Auto-close transmissions left open past the silence timeout. */
  private sweepTimeouts(facet: IncidentCommsFacet, nowIso: string): void {
    const now = Date.parse(nowIso);
    if (Number.isNaN(now)) return;
    for (const t of facet.transmissions) {
      if (t.closedBy) continue;
      const started = Date.parse(t.startedAt);
      if (!Number.isNaN(started) && now - started > TRANSMISSION_SILENCE_TIMEOUT_MS) {
        t.endedAt = new Date(started + TRANSMISSION_SILENCE_TIMEOUT_MS).toISOString();
        t.closedBy = 'timeout';
      }
    }
  }

  private upsertPresence(facet: IncidentCommsFacet, unitId: string, p: UnitPresence): void {
    facet.presence[unitId] = p;
  }

  private trackGaps(e: RadioEvent): void {
    const key = `${e.source}:${e.session_id}`;
    const last = this.lastSeq.get(key);
    if (last === undefined) {
      // New session_id — an explicit restart signal, not a false gap.
      this.lastSeq.set(key, e.seq);
      return;
    }
    if (e.seq > last + 1) {
      this.log.warn(`Gap on ${key}: expected seq ${last + 1}, got ${e.seq} (${e.seq - last - 1} missing).`);
    }
    if (e.seq > last) this.lastSeq.set(key, e.seq);
  }

  private notifyMayday(facet: IncidentCommsFacet, m: MaydayEvent): void {
    // Wave-0: log. Real deployment fans out to the notification service / dispatch UI.
    this.log.error(
      `MAYDAY on incident — unit ${m.unit.radioUnitId} (${m.unit.displayName ?? 'unresolved'}), ` +
        `talkgroup ${m.talkgroupId}, at ${m.occurredAt} (clock_synced=${String(m.clockSynced)}).`,
    );
    void facet;
  }

  /** Ops/read: events we couldn't correlate (includes any unassigned mayday). */
  listUnassigned(): UnassignedEvent[] {
    return [...this.unassigned];
  }
}
