import { Body, Controller, Get, Put } from '@nestjs/common';
import { StandardsService } from './standards.service';
import { Roles, CurrentPrincipal } from '../auth/decorators';
import { Principal } from '../auth/principal';

/**
 * Server-delivered timer standards for the command board (replaces its hardcoded table).
 *
 *   GET /api/v1/standards/timers            — defaults + this department's override + effective
 *   PUT /api/v1/standards/timers  { override } — officer sets the department's override
 *
 * Read is any authenticated member; the write is officer-gated. Always scoped to the
 * caller's own department — a department can only see and set its own standards.
 */
@Controller('standards')
export class StandardsController {
  constructor(private readonly svc: StandardsService) {}

  @Get('timers')
  get(@CurrentPrincipal() p: Principal) {
    return this.svc.get(p.departmentId);
  }

  @Roles('officer')
  @Put('timers')
  set(@CurrentPrincipal() p: Principal, @Body() body: { override?: Record<string, unknown> }) {
    return this.svc.setDept(p.departmentId, body?.override ?? {}, p.userId);
  }
}
