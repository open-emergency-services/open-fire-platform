import { Module } from '@nestjs/common';
import { CommsController } from './comms.controller';
import { CommsService } from './comms.service';
import { RosterService } from './roster';
import { CorrelationService } from './correlation';
import { IncidentsModule } from '../incidents/incidents.module';

/**
 * The comms facet / radio-events seam. Depends on IncidentsModule so it can fold
 * radio traffic onto the correct incident record. Correlation and roster are
 * providers here; a full build backs the roster with personnel/apparatus tables
 * and drives correlation from the CAD feed.
 */
@Module({
  imports: [IncidentsModule],
  controllers: [CommsController],
  providers: [CommsService, RosterService, CorrelationService],
  exports: [CommsService, RosterService, CorrelationService],
})
export class CommsModule {}
