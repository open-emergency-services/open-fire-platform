import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { NerisModule } from '../neris/neris.module';
import { ProjectionsModule } from '../projections/projections.module';
import { RecordsModule } from '../modules/records/records.module';

/**
 * Incidents. Reads come from the one incident read model (ProjectionsModule); creation
 * is delegated to the generic records engine (RecordsModule) so an incident is a single
 * canonical `incident-core` record. NERIS gateway for validate/submit.
 */
@Module({
  imports: [NerisModule, ProjectionsModule, RecordsModule],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
