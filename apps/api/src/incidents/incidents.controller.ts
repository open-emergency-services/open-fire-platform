import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CurrentPrincipal, Roles } from '../auth/decorators';
import { Principal } from '../auth/principal';

/**
 * Incident API. The department is taken from the authenticated Principal (ADR-0010) — not a
 * client-supplied header — so a caller only ever sees and writes their own department's
 * incidents. `entityId` for NERIS submission comes from the principal when present.
 */
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}

  @Get()
  list(@CurrentPrincipal() p: Principal) {
    return this.incidents.list(p.departmentId);
  }

  @Get('export')
  export(@CurrentPrincipal() p: Principal) {
    return this.incidents.export(p.departmentId);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentPrincipal() p: Principal) {
    return this.incidents.get(p.departmentId, id);
  }

  @Roles('responder')
  @Post()
  create(@Body() body: { internalId: string; data: Record<string, unknown> }, @CurrentPrincipal() p: Principal) {
    return this.incidents.create(p.departmentId, body.internalId, body.data ?? {});
  }

  @Roles('officer')
  @Post(':id/validate')
  validate(@Param('id') id: string, @Body() body: { entityId?: string }, @CurrentPrincipal() p: Principal) {
    return this.incidents.validate(p.departmentId, id, body.entityId ?? p.entityId ?? p.departmentId);
  }

  @Roles('officer')
  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() body: { entityId?: string }, @CurrentPrincipal() p: Principal) {
    return this.incidents.submit(p.departmentId, id, body.entityId ?? p.entityId ?? p.departmentId);
  }
}
