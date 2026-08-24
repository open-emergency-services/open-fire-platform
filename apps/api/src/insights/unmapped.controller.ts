import { Controller, Get } from '@nestjs/common';
import { UnmappedService } from './unmapped.service';
import { Roles } from '../auth/decorators';

/**
 * Unmapped-review surface (ADR-0006 #4). A periodic "what didn't the standard model"
 * report so useful fields don't sit unmapped forever. Officer-gated: it enumerates
 * what every source is sending, which is operational insight, not general read data.
 *
 *   GET /api/v1/insights/unmapped — distinct unmapped keys per source (keys + shapes only).
 */
@Controller('insights')
export class UnmappedController {
  constructor(private readonly svc: UnmappedService) {}

  @Roles('officer')
  @Get('unmapped')
  unmapped() {
    return this.svc.report();
  }
}
