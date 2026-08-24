import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RecordsService } from './records.service';
import { CurrentPrincipal, Roles } from '../../auth/decorators';
import { hasRole, Principal } from '../../auth/principal';

/**
 * Generic Regular-tier records endpoints — one controller serves every module screen.
 * Records are tenant-scoped to the caller's department (ADR-0010): a list only returns
 * your department's records, and a record in another department reads as 404. Writes
 * require the `responder` role; deletes require `officer`.
 *
 *   POST   /api/v1/records/:module                create
 *   GET    /api/v1/records/:module                list (?includeDeleted=1, ?parentId=…)
 *   GET    /api/v1/records/:module/:id            read one — record, tombstone, or 404
 *   GET    /api/v1/records/:module/:id/history    full audit trail
 *   PATCH  /api/v1/records/:module/:id?expectedVersion=N   edit (appends `updated`)
 *   DELETE /api/v1/records/:module/:id?expectedVersion=N   soft delete (tombstone)
 */
@Controller('records/:module')
export class RecordsController {
  constructor(private readonly svc: RecordsService) {}

  @Roles('responder')
  @Post()
  create(
    @Param('module') module: string,
    @Body() body: Record<string, unknown>,
    @CurrentPrincipal() p: Principal,
    @Query('parentModule') parentModule?: string,
    @Query('parentId') parentId?: string,
  ) {
    const parent = parentModule && parentId ? { module: parentModule, id: parentId } : undefined;
    return this.svc.create(module, body ?? {}, { parent, departmentId: p.departmentId });
  }

  @Get()
  list(
    @Param('module') module: string,
    @CurrentPrincipal() p: Principal,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.svc.list(module, includeDeleted === '1' || includeDeleted === 'true', parentId || undefined, p.departmentId);
  }

  @Get(':id/history')
  history(@Param('module') module: string, @Param('id') id: string, @CurrentPrincipal() p: Principal) {
    this.svc.getOrThrow(module, id, p.departmentId); // 404 for another department's record
    return this.svc.history(module, id);
  }

  @Get(':id')
  get(@Param('module') module: string, @Param('id') id: string, @CurrentPrincipal() p: Principal) {
    // Vaulted PII is re-hydrated only for officers+; responders see the record without it.
    return this.svc.read(module, id, p.departmentId, hasRole(p, 'officer'));
  }

  /** Right-to-erasure: destroy this record's vaulted PII. The record + audit trail survive. */
  @Roles('officer')
  @Post(':id/erase-pii')
  erasePii(@Param('module') module: string, @Param('id') id: string, @CurrentPrincipal() p: Principal) {
    return this.svc.erasePii(module, id, p.departmentId);
  }

  /** Lock (close) a record so it refuses edits until reopened (ADR-0007). */
  @Roles('officer')
  @Post(':id/lock')
  lock(@Param('module') module: string, @Param('id') id: string, @CurrentPrincipal() p: Principal) {
    return this.svc.setLock(module, id, true, p.departmentId);
  }

  /** Reopen a locked record for corrections. */
  @Roles('officer')
  @Post(':id/reopen')
  reopen(@Param('module') module: string, @Param('id') id: string, @CurrentPrincipal() p: Principal) {
    return this.svc.setLock(module, id, false, p.departmentId);
  }

  @Roles('responder')
  @Patch(':id')
  update(
    @Param('module') module: string,
    @Param('id') id: string,
    @Body() changes: Record<string, unknown>,
    @CurrentPrincipal() p: Principal,
    @Query('expectedVersion') expectedVersion?: string,
    @Query('reason') reason?: string,
  ) {
    return this.svc.update(module, id, changes ?? {}, expectedVersion != null ? Number(expectedVersion) : undefined, reason, p.departmentId);
  }

  @Roles('officer')
  @Delete(':id')
  async remove(
    @Param('module') module: string,
    @Param('id') id: string,
    @CurrentPrincipal() p: Principal,
    @Query('expectedVersion') expectedVersion?: string,
    @Query('reason') reason?: string,
  ) {
    await this.svc.remove(module, id, expectedVersion != null ? Number(expectedVersion) : undefined, reason, p.departmentId);
    return { deleted: true };
  }
}
