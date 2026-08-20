import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommsService } from './comms.service';
import { CorrelationService, IncidentRef } from './correlation';
import { RadioSystemId, talkgroupKey, unitKey } from './radio-event';

/**
 * The radio seam, HTTP binding.
 *
 * `POST /comms/radio-events` is the ingestion endpoint an adapter posts frozen v1.0
 * envelopes to (the webhook-with-retry transport). The preferred transport is a
 * durable stream (NATS JetStream / Redis stream) subscribed by the same CommsService;
 * this HTTP route is the fallback for small deployments and the easy path for tests.
 *
 * The binding routes are how CAD/dispatch tells correlation which talkgroup or unit
 * belongs to which incident. In a full build these are driven by the CAD feed, not
 * called by hand.
 */
@Controller('comms')
export class CommsController {
  constructor(
    private readonly comms: CommsService,
    private readonly correlation: CorrelationService,
  ) {}

  /** Ingest one radio event. Idempotent on event_id; always returns an ack result. */
  @Post('radio-events')
  ingest(@Body() body: unknown) {
    return this.comms.ingest(body);
  }

  /** Bind a talkgroup to an incident (set at dispatch). */
  @Post('bindings/talkgroup')
  bindTalkgroup(
    @Body() body: { radio_system: RadioSystemId; talkgroupId: string } & IncidentRef,
  ) {
    const key = talkgroupKey(body.radio_system, { id: body.talkgroupId });
    this.correlation.bindTalkgroup(key, { incidentId: body.incidentId, departmentId: body.departmentId }, new Date().toISOString());
    return { ok: true, key };
  }

  /** Assign a unit to an incident (unit → incident fallback correlation). */
  @Post('assignments/unit')
  assignUnit(
    @Body() body: { radio_system: RadioSystemId; unitId: string } & IncidentRef,
  ) {
    const key = unitKey(body.radio_system, { id: body.unitId });
    this.correlation.assignUnit(key, { incidentId: body.incidentId, departmentId: body.departmentId }, new Date().toISOString());
    return { ok: true, key };
  }

  /** Radio events that couldn't be correlated to an incident (never dropped). */
  @Get('unassigned')
  unassigned() {
    return this.comms.listUnassigned();
  }
}
