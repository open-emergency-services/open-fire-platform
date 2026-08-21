import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';

/** Essential-tier ingest — the thin write path to the Core (global CoreModule). */
@Module({
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}
