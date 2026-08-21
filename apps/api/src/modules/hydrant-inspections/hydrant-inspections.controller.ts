import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NerisHydrantInspection } from '@ofp/neris-schema';
import { HydrantInspectionsService } from './hydrant-inspections.service';

/**
 * Regular-tier endpoints (ADR-0005) for hydrant inspections:
 *
 *   POST /api/v1/hydrant-inspections   { hydrant_id, inspection_date, ... }
 *   GET  /api/v1/hydrant-inspections
 *   GET  /api/v1/hydrant-inspections/:id
 *
 * Writes go through the Core (append) then project; reads come from the module's
 * read model. The body is the NERIS-shaped hydrant record (generated fields).
 */
@Controller('hydrant-inspections')
export class HydrantInspectionsController {
  constructor(private readonly svc: HydrantInspectionsService) {}

  @Post()
  create(@Body() body: Partial<NerisHydrantInspection>) {
    return this.svc.create(body ?? {});
  }

  @Get()
  list() {
    return this.svc.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.getOrThrow(id);
  }
}
