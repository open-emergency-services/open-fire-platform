import { Injectable } from '@nestjs/common';
import { StoredEvent } from '../core/stored-event';
import { IncidentReadModel } from './incident-read-model';
import { RosterService } from './roster';
import { IncidentRecord } from '../incidents/incident.entity';
import { IncidentStatus } from '../incidents/incident-status';
import { RadioEvent } from '../comms/radio-event';
import {
  IncidentCommsFacet,
  emptyCommsFacet,
  Transmission,
  MaydayEvent,
  UnitPresence,
} from '../comms/comms-facet';

/** How long an open transmission may sit with no matching end before auto-close. */
const TRANSMISSION_SILENCE_TIMEOUT_MS = 30_000;

/** What applying a radio event produced — enough for the caller to publish SSE. */
export interface RadioProjectionResult {
  applied: boolean; // true if it landed on an incident's facet
  incidentId?: string;
  isMayday: boolean;
  mayday?: MaydayEvent;
  unitDisplayName?: string | null;
}

/**
 * The Projector — turns Core events into the incident read model (ADR-0004).
 *
 * It is the ONLY writer of the read model, and it is pure with respect to the log:
 * `project()` applies one committed event; `rebuild()` replays the whole log to
 * reconstruct the read model from scratch. It performs no side effects (no SSE) — the
 * ingest path publishes to the stream after committing, so a rebuild never re-fires
 * alerts. This is what makes the read model disposable and reconstructable.
 */
@Injectable()
export class Projector {
  constructor(
    private readonly readModel: IncidentReadModel,
    private readonly roster: RosterService,
  ) {}

  /** Apply one committed event to the read model (dispatch by type). */
  project(e: StoredEvent): void {
    if (e.source_type === 'incident.created') {
      this.applyIncidentCreated(e); // legacy write path (kept so old logs still replay)
    } else if (e.source_type === 'record.incident-core.created') {
      this.applyIncidentCoreCreated(e); // canonical: an incident IS an incident-core record
    } else if (e.source_type === 'record.incident-core.updated') {
      this.applyIncidentCoreUpdated(e);
    } else if (e.source_type === 'record.incident-core.deleted') {
      this.applyIncidentCoreDeleted(e);
    } else if (e.source_type === 'incident.validated') {
      this.applyIncidentValidated(e);
    } else if (e.source_type === 'incident.submitted') {
      this.applyIncidentSubmitted(e);
    } else if (e.source === 'open-p25-console') {
      this.applyRadioEvent(e);
    }
  }

  /** Fold a validation result onto the incident (status + which core fields are missing). */
  private applyIncidentValidated(e: StoredEvent): void {
    const n = e.normalized as { id: string; status: IncidentStatus; validationGaps?: string[] };
    const rec = this.readModel.get(n.id);
    if (rec) {
      rec.status = n.status;
      rec.validationGaps = n.validationGaps ?? [];
      rec.updatedAt = e.occurred_at ?? e.received_at;
    }
  }

  /** Fold a submission outcome onto the incident (accepted/rejected + NERIS response). */
  private applyIncidentSubmitted(e: StoredEvent): void {
    const n = e.normalized as { id: string; status: IncidentStatus; nerisId?: string; nerisResponse?: unknown };
    const rec = this.readModel.get(n.id);
    if (rec) {
      rec.status = n.status;
      if (n.nerisId) rec.nerisId = n.nerisId;
      rec.nerisResponse = n.nerisResponse;
      rec.updatedAt = e.occurred_at ?? e.received_at;
    }
  }

  /**
   * Project an `incident-core` record into the incident read model — the unification:
   * the incident-record screen (records/incident-core) is now the canonical source of
   * incidents, and radio traffic correlates onto these same ids via the comms facet.
   */
  private applyIncidentCoreCreated(e: StoredEvent): void {
    const n = e.normalized as { id: string; departmentId?: string; data?: Record<string, unknown> };
    const data = n.data ?? {};
    const ts = e.occurred_at ?? e.received_at;
    const departmentId = n.departmentId || (data._departmentId as string) || 'DEMO_DEPT';
    const internalId = (data.incident_internal_id as string) || n.id;
    this.readModel.put({
      id: n.id,
      departmentId,
      internalId,
      status: IncidentStatus.Draft,
      data,
      validationGaps: [],
      createdAt: ts,
      updatedAt: ts,
    });
  }

  private applyIncidentCoreUpdated(e: StoredEvent): void {
    const n = e.normalized as { id: string; changes?: Record<string, unknown> };
    const rec = this.readModel.get(n.id);
    if (rec) {
      rec.data = { ...rec.data, ...(n.changes ?? {}) };
      rec.updatedAt = e.occurred_at ?? e.received_at; // comms facet + status preserved
    }
  }

  private applyIncidentCoreDeleted(e: StoredEvent): void {
    const n = e.normalized as { id: string };
    this.readModel.remove(n.id); // drops from the active incident list; history stays in the log
  }

  /** Clear the read model and replay the log — the event-sourcing superpower. */
  rebuild(events: StoredEvent[]): void {
    this.readModel.clear();
    for (const e of events) this.project(e);
  }

  private applyIncidentCreated(e: StoredEvent): void {
    const n = e.normalized as {
      id: string; departmentId: string; internalId: string; data?: Record<string, unknown>;
    };
    const ts = e.occurred_at ?? e.received_at;
    const rec: IncidentRecord = {
      id: n.id,
      departmentId: n.departmentId,
      internalId: n.internalId,
      status: IncidentStatus.Draft,
      data: n.data ?? {},
      validationGaps: [],
      createdAt: ts,
      updatedAt: ts,
    };
    this.readModel.put(rec);
  }

  /**
   * Apply a radio event to the correlated incident's comms facet. Returns what the
   * caller needs to publish. Idempotency and correlation are handled upstream (the
   * event was already committed with `correlation.incident_id` when known).
   */
  applyRadioEvent(e: StoredEvent): RadioProjectionResult {
    const ev = e.raw as unknown as RadioEvent;
    const isMayday = ev.event_type === 'emergency';
    const incidentId = (e.correlation?.incident_id as string | undefined) ?? undefined;
    if (!incidentId) return { applied: false, isMayday };

    const rec = this.readModel.get(incidentId);
    if (!rec) return { applied: false, isMayday, incidentId };

    const facet: IncidentCommsFacet = rec.comms ?? emptyCommsFacet();
    this.sweepTimeouts(facet, ev.timestamp);
    const unit = this.roster.resolve(ev.radio_system, ev.unit);
    let mayday: MaydayEvent | undefined;

    switch (ev.event_type) {
      case 'emergency': {
        mayday = {
          eventId: ev.event_id,
          unit,
          talkgroupId: ev.talkgroup.id,
          occurredAt: ev.timestamp,
          receivedAt: e.received_at,
          clockSynced: ev.clock_synced ?? null,
        };
        facet.maydays.push(mayday);
        facet.hasActiveMayday = true;
        break;
      }
      case 'ptt_start': {
        const tx: Transmission = {
          callId: ev.call_id ?? `${ev.event_id}`,
          unit,
          talkgroupId: ev.talkgroup.id,
          startedAt: ev.timestamp,
          emergency: ev.emergency,
          encrypted: ev.encrypted,
        };
        facet.transmissions.push(tx);
        break;
      }
      case 'ptt_end': {
        const open = this.findOpenTransmission(facet, ev);
        if (open) { open.endedAt = ev.timestamp; open.closedBy = 'event'; }
        break;
      }
      case 'unit_registration':
      case 'unit_deregistration':
        this.upsertPresence(facet, unit.radioUnitId, {
          unit, registered: ev.event_type === 'unit_registration', updatedAt: ev.timestamp,
        });
        break;
      case 'talkgroup_affiliation': {
        const existing = facet.presence[unit.radioUnitId];
        this.upsertPresence(facet, unit.radioUnitId, {
          unit,
          registered: existing?.registered ?? true,
          affiliatedTalkgroupId: ev.talkgroup.id,
          updatedAt: ev.timestamp,
        });
        break;
      }
      case 'call_grant':
      case 'call_end':
      default:
        break;
    }

    facet.lastEventAt = ev.timestamp;
    rec.comms = facet;
    rec.updatedAt = e.received_at;
    return { applied: true, incidentId, isMayday, mayday, unitDisplayName: unit.displayName ?? null };
  }

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
}
