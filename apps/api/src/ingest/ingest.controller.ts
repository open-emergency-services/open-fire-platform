import { Body, Controller, Post } from '@nestjs/common';
import { IngestBody, IngestService } from './ingest.service';

/**
 * Essential-tier ingest endpoint (ADR-0005). The universal write path to the Core:
 *
 *   POST /api/v1/ingest   { source, source_type, raw, ... }  →  { seq, event_id, duplicate }
 *
 * Frozen surface — this must keep working when everything richer is down. Idempotent
 * on event_id; the full payload is stored in the log (ADR-0006), lossless.
 */
@Controller('ingest')
export class IngestController {
  constructor(private readonly ingest: IngestService) {}

  @Post()
  post(@Body() body: IngestBody) {
    return this.ingest.ingest(body);
  }
}
