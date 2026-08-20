import { Module } from '@nestjs/common';
import { EventPublisher } from './event-publisher';
import { EventsController } from './events.controller';

/**
 * Real-time delivery (ADR-0002). Owns the outbound event publisher and the SSE
 * endpoint. Other modules import this and inject EventPublisher to publish events
 * (e.g. CommsModule publishes a mayday).
 */
@Module({
  providers: [EventPublisher],
  controllers: [EventsController],
  exports: [EventPublisher],
})
export class EventsModule {}
