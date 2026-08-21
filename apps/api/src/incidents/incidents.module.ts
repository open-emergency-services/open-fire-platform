import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { NerisModule } from '../neris/neris.module';
import { ProjectionsModule } from '../projections/projections.module';

/**
 * Incidents. Writes append to the Core (global CoreModule); reads come from the
 * read model (ProjectionsModule). NERIS gateway for validate/submit.
 */
@Module({
  imports: [NerisModule, ProjectionsModule],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
