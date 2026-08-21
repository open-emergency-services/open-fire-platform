import { Module } from '@nestjs/common';
import { HydrantInspectionsController } from './hydrant-inspections.controller';
import { HydrantInspectionsService } from './hydrant-inspections.service';

/**
 * Hydrant inspections (Regular tier). Self-contained: appends to the global Core and
 * keeps its own read model. The reference module — new screens copy this shape.
 */
@Module({
  controllers: [HydrantInspectionsController],
  providers: [HydrantInspectionsService],
})
export class HydrantInspectionsModule {}
