import { Module } from '@nestjs/common';
import { IncidentReadModel } from './incident-read-model';
import { Projector } from './projector';
import { RosterService } from './roster';

/**
 * The read model + projector (ADR-0004). Owns the incident read model, the projector
 * that builds it from the Core log, and the roster used to resolve radio units.
 * Feature modules (incidents, comms) import this to read the projection and to drive
 * projection after they append to the Core.
 */
@Module({
  providers: [IncidentReadModel, Projector, RosterService],
  exports: [IncidentReadModel, Projector, RosterService],
})
export class ProjectionsModule {}
