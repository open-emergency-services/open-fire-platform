import { Module } from '@nestjs/common';
import { EventsModule } from '../../events/events.module';
import { ProjectionsModule } from '../../projections/projections.module';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

/**
 * The generic records module — backs every generated NERIS module screen
 * (apps/web/modules/*) through one event-sourced engine keyed by module slug.
 * Imports EventsModule so an `incident-core` record can publish onto the live SSE
 * stream (ADR-0002), and ProjectionsModule so an incident-core record feeds the one
 * canonical incident read model (/api/v1/incidents) — the unification.
 */
@Module({
  imports: [EventsModule, ProjectionsModule],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
