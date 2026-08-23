import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { NerisHydrantInspection } from '@ofp/neris-schema';
import { HydrantInspectionsService } from './hydrant-inspections.service';

/**
 * Regular-tier CRUD-on-event-sourcing endpoints (ADR-0005/0007):
 *
 *   POST   /api/v1/hydrant-inspections            create
 *   GET    /api/v1/hydrant-inspections            list (excludes deleted; ?includeDeleted=1 to include)
 *   GET    /api/v1/hydrant-inspections/:id        read one — active record, or a tombstone
 *                                                 if deleted, or 404 only if it never existed
 *   GET    /api/v1/hydrant-inspections/:id/history  full audit trail (incl. deleted)
 *   PATCH  /api/v1/hydrant-inspections/:id?expectedVersion=N   edit (appends `updated`)
 *   DELETE /api/v1/hydrant-inspections/:id?expectedVersion=N   soft delete (tombstone)
 *
 * Nothing mutates the log — edits and deletes are events; history is derived from them.
 */
@Controller('hydrant-inspections')
export class HydrantInspectionsController {
  constructor(private readonly svc: HydrantInspectionsService) {}

  @Post()
  create(@Body() body: Partial<NerisHydrantInspection>) {
    return this.svc.create(body ?? {});
  }

  @Get()
  list(@Query('includeDeleted') includeDeleted?: string) {
    return this.svc.list(includeDeleted === '1' || includeDeleted === 'true');
  }

  @Get(':id')
  get(@Param('id') id: string) {
    // Deleted → a discoverable tombstone (200), not a bare 404 (ADR-0007).
    return this.svc.lookup(id);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.svc.history(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() changes: Partial<NerisHydrantInspection>,
    @Query('expectedVersion') expectedVersion?: string,
    @Query('reason') reason?: string,
  ) {
    return this.svc.update(id, changes ?? {}, expectedVersion != null ? Number(expectedVersion) : undefined, reason);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('expectedVersion') expectedVersion?: string,
    @Query('reason') reason?: string,
  ) {
    await this.svc.remove(id, expectedVersion != null ? Number(expectedVersion) : undefined, reason);
    return { deleted: true };
  }
}
