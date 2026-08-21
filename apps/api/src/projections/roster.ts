import { Injectable } from '@nestjs/common';
import { RadioSystemId, RadioUnitRef, unitKey } from '../comms/radio-event';
import { ResolvedUnit } from '../comms/comms-facet';

/**
 * Roster: the platform-owned mapping from a raw P25 unit id → a person / apparatus.
 * Used by the projector to resolve radio units when building the comms facet, and
 * seeded via the comms controller. Resolution never throws and never blocks: an
 * unknown unit resolves to `{ resolved: false, radioUnitId }`, keeping the faithful
 * raw id for later reconciliation. Wave-0 in memory; a real roster is backed by the
 * department's personnel + apparatus tables under CJIS access rules.
 */
@Injectable()
export class RosterService {
  private readonly map = new Map<string, { personId?: string; apparatusId?: string; displayName?: string }>();

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
      return { radioUnitId: unit.id, resolved: false, displayName: unit.alias ?? undefined };
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
