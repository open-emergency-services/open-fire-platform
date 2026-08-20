import { IncidentStatus } from './incident-status';
import { IncidentCommsFacet } from '../comms/comms-facet';

/**
 * Local incident record. `data` holds the NERIS-shaped payload (typed against
 * @ofp/neris-schema's NerisIncidentCore at the edges). Everything here is stored
 * in the department's own database and is fully exportable at any time.
 */
export interface IncidentRecord {
  id: string;                     // local UUID
  departmentId: string;           // tenant discriminator
  internalId: string;             // maps to NERIS incident_internal_id (idempotency key)
  nerisId?: string;               // assigned once submitted
  status: IncidentStatus;
  data: Record<string, unknown>;  // NERIS-shaped incident payload
  validationGaps: string[];       // missing neris_core fields, if any
  nerisResponse?: unknown;        // last response from NERIS (accepted/rejected detail)
  /**
   * Radio traffic folded onto this incident from the open-p25-console seam:
   * transmissions, mayday events, and presence. Populated by CommsService; absent
   * until the first radio event correlates here. Event metadata only — no audio,
   * no keys. See /docs/INTEGRATION-RADIO-SEAM.md.
   */
  comms?: IncidentCommsFacet;
  createdAt: string;
  updatedAt: string;
}
