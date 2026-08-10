import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { IncidentsModule } from './incidents/incidents.module';
import { NerisModule } from './neris/neris.module';

/**
 * Wave-0 API. As modules are added (scheduling, responder, ePCR…), each becomes
 * its own feature module imported here, rendered behind the single UI shell.
 */
@Module({
  imports: [NerisModule, IncidentsModule],
  controllers: [HealthController],
})
export class AppModule {}
