import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ReadinessService } from './readiness.service';

/** Health + readiness (LB contract, ADR-0004). */
@Module({
  controllers: [HealthController],
  providers: [ReadinessService],
  exports: [ReadinessService],
})
export class HealthModule {}
