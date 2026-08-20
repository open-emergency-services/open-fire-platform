import { Injectable } from '@nestjs/common';
import { RadioSystemId, RadioUnitRef, unitKey } from './radio-event';
import { ResolvedUnit } from './comms-facet';

/**
 * Roster: the platform-owned mapping from a raw P25 unit id → a person / apparatus.
 *
 * This is authoritative identity. The console only ever sends raw numeric ids (plus
 * an optional, non-authoritative `alias` hint); resolving them is OUR job because
 * WE hold the roster. Wave-0 keeps it in memory; a real deployment backs it with the
 * department's personnel/apparatus tables and honors CJIS access rules.
 *
 * Key design point: resolution NEVER throws and NEVER blocks ingestion. An unknown
 * unit resolves to `{ resolved: false, radioUnitId }` — we keep the faithful raw id
 * and reconcile identity later. A lost mayday because the roster didn't know a unit
 * would be unacceptable.
 */
@Injectable()
export class RosterService {
  /** unitKey(sys, unit) → roster identity. Empty in the scaffold. */
  private readonly map = new Map<string, { personId?: string; apparatusId?: string; displayName?: string }>();

  /** Seed / update a mapping (a real roster syncs these from personnel + apparatus). */
  upsert(
    sys: RadioSystemId,
    unitId: string,
    identity: { personId?: string; apparatusId?: string; displayName?: string },
  ): void {
    this.map.set(unitKey(sys, { id: unitId }), identity);
  }

  resolve(sys: RadioSystemId, unit: RadioUnitRef): ResolvedUnit {
    const hit = this.map.get(unitKey(sys, unit));
    if (!hit) {
      return {
        radioUnitId: unit.id,
        resolved: false,
        // Surface the console's alias hint as a provisional display name only.
        displayName: unit.alias ?? undefined,
      };
    }
    return {
      radioUnitId: unit.id,
      resolved: true,
      personId: hit.personId,
      apparatusId: hit.apparatusId,
      displayName: hit.displayName ?? unit.alias ?? undefined,
    };
  }
}
