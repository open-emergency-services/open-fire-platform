import { Injectable } from '@nestjs/common';
import { RadioEvent, talkgroupKey, unitKey } from './radio-event';

/**
 * Correlation: decide WHICH incident a radio event belongs to.
 *
 * This is the platform's job (the console has no concept of an "incident"). The
 * model, in priority order:
 *
 *   1. talkgroup ↔ incident binding established at DISPATCH (primary). When CAD
 *      dispatches an incident it knows the assigned talkgroup(s); an event on that
 *      talkgroup maps to the bound incident.
 *   2. the emitting unit's current CAD assignment (unit → incident).
 *   3. time-window + site (not implemented in Wave-0; stub returns null).
 *   4. otherwise UNRESOLVED — the caller stores it as an unassigned radio event,
 *      queryable and reconcilable later. NEVER dropped.
 *
 * Bindings are keyed by the natural P25 keys (opaque strings), so nothing here
 * parses or re-bases an id.
 */

export interface IncidentRef {
  incidentId: string;
  departmentId: string;
}

interface Binding extends IncidentRef {
  boundAt: string;
}

export type CorrelationMethod = 'talkgroup' | 'unit-assignment' | 'time-site' | 'unresolved';

export interface CorrelationResult {
  incident: IncidentRef | null;
  method: CorrelationMethod;
}

@Injectable()
export class CorrelationService {
  /** talkgroupKey → binding. Set at dispatch, cleared when the incident closes. */
  private readonly talkgroupBindings = new Map<string, Binding>();
  /** unitKey → incident. The unit's current CAD assignment. */
  private readonly unitAssignments = new Map<string, Binding>();

  /** CAD calls this at dispatch: bind a talkgroup to an incident. */
  bindTalkgroup(key: string, ref: IncidentRef, at: string): void {
    this.talkgroupBindings.set(key, { ...ref, boundAt: at });
  }

  unbindTalkgroup(key: string): void {
    this.talkgroupBindings.delete(key);
  }

  /** CAD calls this when a unit is assigned to / cleared from an incident. */
  assignUnit(key: string, ref: IncidentRef, at: string): void {
    this.unitAssignments.set(key, { ...ref, boundAt: at });
  }

  clearUnit(key: string): void {
    this.unitAssignments.delete(key);
  }

  correlate(e: RadioEvent): CorrelationResult {
    // 1. talkgroup binding (primary)
    const tgHit = this.talkgroupBindings.get(talkgroupKey(e.radio_system, e.talkgroup));
    if (tgHit) return { incident: strip(tgHit), method: 'talkgroup' };

    // 2. the emitting unit's current assignment
    const unitHit = this.unitAssignments.get(unitKey(e.radio_system, e.unit));
    if (unitHit) return { incident: strip(unitHit), method: 'unit-assignment' };

    // 3. time-window + site — not implemented in Wave-0.
    //    (Would look at recently-active incidents at the unit's site within a window.)

    // 4. unresolved — store as unassigned; never drop.
    return { incident: null, method: 'unresolved' };
  }
}

function strip(b: Binding): IncidentRef {
  return { incidentId: b.incidentId, departmentId: b.departmentId };
}
