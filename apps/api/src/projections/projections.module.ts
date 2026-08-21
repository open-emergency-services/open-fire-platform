import { Module } from '@nestjs/common';
import { IncidentReadModel } from './incident-read-model';
import { Projector } from './projector';
import { RosterService } from './roster';
import { ProjectionBootstrap } from './projection-bootstrap';

/**
 * The read model + projector (ADR-0004). Owns the incident read model, the projector
 * that builds it from the Core log, the roster used to resolve radio units, and the
 * boot-time rebuild that reconstructs the read model from the (durable) log on startup.
 */
@Module({
  providers: [IncidentReadModel, Projector, RosterService, ProjectionBootstrap],
  exports: [IncidentReadModel, Projector, RosterService],
})
export class ProjectionsModule {}
