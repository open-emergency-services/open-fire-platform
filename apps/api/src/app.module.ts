import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { IncidentsModule } from './incidents/incidents.module';
import { NerisModule } from './neris/neris.module';
import { CommsModule } from './comms/comms.module';
import { EventsModule } from './events/events.module';
import { CoreModule } from './core/core.module';
import { PiiModule } from './pii/pii.module';
import { IngestModule } from './ingest/ingest.module';
import { HydrantInspectionsModule } from './modules/hydrant-inspections/hydrant-inspections.module';
import { RecordsModule } from './modules/records/records.module';
import { InsightsModule } from './insights/insights.module';

/**
 * Wave-0 API. As modules are added (scheduling, responder, ePCR…), each becomes
 * its own feature module imported here, rendered behind the single UI shell.
 */
@Module({
  imports: [
    AuthModule,
    CoreModule,
    PiiModule,
    HealthModule,
    IngestModule,
    NerisModule,
    IncidentsModule,
    CommsModule,
    EventsModule,
    HydrantInspectionsModule,
    RecordsModule,
    InsightsModule,
  ],
})
export class AppModule {}
