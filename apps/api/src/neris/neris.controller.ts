import { Controller, Get } from '@nestjs/common';
import { NERIS_INCIDENT_TYPES } from '@ofp/neris-schema';
import { Public } from '../auth/decorators';

/**
 * NERIS reference data served from the generated schema (single source of truth —
 * the same hierarchy the validator uses). Public: the NERIS framework is published
 * reference data, and the incident-type picker must load before a user has a token.
 *
 *   GET /api/v1/neris/incident-types — the value_1 → value_2 → value_3 hierarchy.
 */
@Public()
@Controller('neris')
export class NerisController {
  @Get('incident-types')
  incidentTypes() {
    const types = NERIS_INCIDENT_TYPES.filter((t) => t.active);
    return { count: types.length, types };
  }
}
