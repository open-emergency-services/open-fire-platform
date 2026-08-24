import { Module } from '@nestjs/common';
import { UnmappedController } from './unmapped.controller';
import { UnmappedService } from './unmapped.service';

/** Operational insight over the Core log (ADR-0006 unmapped review). */
@Module({
  controllers: [UnmappedController],
  providers: [UnmappedService],
})
export class InsightsModule {}
