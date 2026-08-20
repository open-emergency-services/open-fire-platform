import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { DomainEvent, DomainEventInput } from './domain-event';

/**
 * EventPublisher — the outbound seam. Producers (CommsService's mayday, the incident
 * state machine, …) publish domain events here; the SSE endpoint fans them out to
 * connected interfaces. See ADR-0002.
 *
 * Two responsibilities:
 *  - LIVE: a hot stream of events for currently-connected clients.
 *  - CATCH-UP: a bounded replay buffer so a client that reconnects (with a
 *    Last-Event-ID) gets exactly the events it missed — the outbound analogue of the
 *    never-drop guarantee we hold on the radio inbound side.
 *
 * Wave-0 is in-process (single node). To scale across nodes, back `subject` and the
 * buffer with Redis or NATS pub/sub — the SSE endpoint and every client stay
 * unchanged, because that's an internal detail behind the same API (ADR-0001).
 */
@Injectable()
export class EventPublisher {
  private seq = 0;
  private readonly subject = new Subject<DomainEvent>();

  /** Bounded ring buffer for reconnect replay. Older events age out (see `since`). */
  private readonly buffer: DomainEvent[] = [];
  private static readonly BUFFER_MAX = 1000;

  publish(input: DomainEventInput): DomainEvent {
    const evt: DomainEvent = {
      ...input,
      id: ++this.seq,
      at: input.at ?? new Date().toISOString(),
    };
    this.buffer.push(evt);
    if (this.buffer.length > EventPublisher.BUFFER_MAX) this.buffer.shift();
    this.subject.next(evt);
    return evt;
  }

  /** Hot stream of live events. Consumers filter by tenant/incident. */
  live(): Observable<DomainEvent> {
    return this.subject.asObservable();
  }

  /**
   * Buffered events with id > sinceId, for SSE reconnect replay. If the client was
   * gone long enough that its cursor aged out of the buffer, it receives the buffer's
   * remaining tail — the client should treat a gap as "re-fetch the snapshot via the
   * normal API," which is always correct because the event is also a stored resource.
   */
  since(sinceId: number): DomainEvent[] {
    return this.buffer.filter((e) => e.id > sinceId);
  }

  /** True if the client's cursor is older than anything still buffered (a real gap). */
  hasGap(sinceId: number): boolean {
    return sinceId > 0 && this.buffer.length > 0 && this.buffer[0].id > sinceId + 1;
  }
}
