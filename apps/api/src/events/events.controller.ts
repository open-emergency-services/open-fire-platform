import { Controller, Sse, Headers, Query, MessageEvent } from '@nestjs/common';
import { Observable, merge, of, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { EventPublisher } from './event-publisher';
import { DomainEvent } from './domain-event';

/** Heartbeat cadence — keeps proxies/mobile connections from silently dying. */
const HEARTBEAT_MS = 15_000;

/**
 * The real-time delivery surface (ADR-0002). This is Server-Sent Events — an open
 * web standard (`text/event-stream`), no proprietary dependency, reachable like any
 * other API endpoint. One-directional (server → interface), which is all an alert
 * needs. Acknowledgements and other writes go back through normal POST endpoints.
 *
 *   GET /api/v1/alerts/stream?departmentId=...&incidentId=...
 *
 * The browser's built-in EventSource auto-reconnects and re-sends the Last-Event-ID;
 * we replay missed events from the publisher's buffer so a dropped connection never
 * loses a mayday. Heartbeats detect dead connections fast.
 *
 * NOTE (auth): EventSource can't set headers, so a real deployment authenticates this
 * route via cookie/session or a short-lived token query param, enforced at the API
 * boundary like every other route.
 */
@Controller('alerts')
export class EventsController {
  constructor(private readonly events: EventPublisher) {}

  @Sse('stream')
  stream(
    @Query('departmentId') departmentId?: string,
    @Query('incidentId') incidentId?: string,
    @Headers('last-event-id') lastEventId?: string,
  ): Observable<MessageEvent> {
    const since = Number.parseInt(lastEventId ?? '', 10) || 0;

    const matches = (e: DomainEvent) =>
      (!departmentId || e.departmentId === departmentId) &&
      (!incidentId || e.incidentId === incidentId);

    // 1. Replay anything missed since the client's cursor (reconnect catch-up).
    const catchup = of(...this.events.since(since).filter(matches));

    // 2. Live events from here on.
    const liveEvents = this.events.live().pipe(filter(matches));

    // 3. Heartbeat so a silently-dead stream is detected and reconnected quickly.
    const heartbeat = interval(HEARTBEAT_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: 'keep-alive' })),
    );

    return merge(catchup.pipe(map(toMessage)), liveEvents.pipe(map(toMessage)), heartbeat);
  }
}

/** Format a domain event as an SSE message; `id` becomes the client's Last-Event-ID. */
function toMessage(e: DomainEvent): MessageEvent {
  return { id: String(e.id), type: e.type, data: e };
}
