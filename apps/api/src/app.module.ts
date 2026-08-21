import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { IncidentsModule } from './incidents/incidents.module';
import { NerisModule } from './neris/neris.module';
import { CommsModule } from './comms/comms.module';
import { EventsModule } from './events/events.module';
import { CoreModule } from './core/core.module';
import { IngestModule } from './ingest/ingest.module';

/**
 * Wave-0 API. As modules are added (scheduling, responder, ePCR…), each becomes
 * its own feature module imported here, rendered behind the single UI shell.
 */
@Module({
  imports: [CoreModule, HealthModule, IngestModule, NerisModule, IncidentsModule, CommsModule, EventsModule],
})
export class AppModule {}
