import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';

/**
 * Wave-0 incident API. Auth is stubbed: departmentId comes from a header for
 * the scaffold. Real deployment resolves it from the OAuth/OIDC session
 * (Keycloak) and enforces CJIS-grade access control.
 */
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}

  private dept(header?: string) {
    return header ?? 'DEMO_DEPT';
  }

  @Get()
  list(@Query('departmentId') dept?: string) {
    return this.incidents.list(this.dept(dept));
  }

  @Get('export')
  export(@Query('departmentId') dept?: string) {
    return this.incidents.export(this.dept(dept));
  }

  @Get(':id')
  get(@Param('id') id: string, @Query('departmentId') dept?: string) {
    return this.incidents.get(this.dept(dept), id);
  }

  @Post()
  create(
    @Body() body: { internalId: string; data: Record<string, unknown>; departmentId?: string },
  ) {
    return this.incidents.create(this.dept(body.departmentId), body.internalId, body.data ?? {});
  }

  @Post(':id/validate')
  validate(@Param('id') id: string, @Body() body: { entityId: string; departmentId?: string }) {
    return this.incidents.validate(this.dept(body.departmentId), id, body.entityId);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() body: { entityId: string; departmentId?: string }) {
    return this.incidents.submit(this.dept(body.departmentId), id, body.entityId);
  }
}
