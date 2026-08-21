import { Module } from '@nestjs/common';
import { CommsController } from './comms.controller';
import { CommsService } from './comms.service';
import { CorrelationService } from './correlation';
import { EventsModule } from '../events/events.module';
import { ProjectionsModule } from '../projections/projections.module';

/**
 * The radio seam. Appends radio events to the Core (global CoreModule), correlates
 * them (CorrelationService), drives the projector to fold them onto the incident's
 * comms facet (ProjectionsModule), and publishes to the SSE stream (EventsModule).
 * Roster lives in ProjectionsModule now (the projector resolves units).
 */
@Module({
  imports: [EventsModule, ProjectionsModule],
  controllers: [CommsController],
  providers: [CommsService, CorrelationService],
  exports: [CommsService, CorrelationService],
})
export class CommsModule {}
