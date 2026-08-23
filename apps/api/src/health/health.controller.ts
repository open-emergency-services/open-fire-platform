import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ReadinessService } from './readiness.service';
import { Public } from '../auth/decorators';

/**
 * Health endpoints (ADR-0004 LB contract). Liveness and readiness are distinct:
 *   GET /api/v1/health        — overall status (human/monitoring)
 *   GET /api/v1/health/live   — liveness: the process is up (restart if this fails)
 *   GET /api/v1/health/ready  — readiness: ready to serve; 503 while draining (LB probe)
 */
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly readiness: ReadinessService) {}

  @Get()
  health() {
    return { status: 'ok', service: 'ofp-api', ready: this.readiness.isReady(), ts: new Date().toISOString() };
  }

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  ready() {
    if (!this.readiness.isReady()) {
      throw new ServiceUnavailableException({ status: 'draining' });
    }
    return { status: 'ready' };
  }
}
