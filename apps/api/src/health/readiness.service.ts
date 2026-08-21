import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';

/**
 * Readiness state for the load balancer (ADR-0004 LB contract).
 *
 * Liveness = "the process is up." Readiness = "ready to serve." On shutdown we flip
 * readiness to false *before* the process exits, so the LB stops sending new
 * connections (graceful drain) while in-flight work — including open SSE streams —
 * finishes. Requires `app.enableShutdownHooks()` in main.ts.
 */
@Injectable()
export class ReadinessService implements BeforeApplicationShutdown {
  private ready = true;

  isReady(): boolean {
    return this.ready;
  }

  /** Flip to not-ready (drain). Called on shutdown; can also be called manually. */
  setDraining(): void {
    this.ready = false;
  }

  beforeApplicationShutdown(): void {
    this.ready = false;
  }
}
