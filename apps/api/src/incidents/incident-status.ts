/**
 * Submission state machine for an incident record.
 *
 * The department's database is ALWAYS the system of record; NERIS is a sync
 * target. An incident lives its whole life locally and transitions through:
 *
 *   draft ──► validated ──► queued ──► submitted ──► accepted
 *     ▲            │                        │            │
 *     └── (edits)  └── (validation fails)   └──────────► rejected ──► (fix) ──► draft
 */
export enum IncidentStatus {
  Draft = 'draft',
  Validated = 'validated',
  Queued = 'queued',
  Submitted = 'submitted',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

const TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  [IncidentStatus.Draft]: [IncidentStatus.Validated, IncidentStatus.Draft],
  [IncidentStatus.Validated]: [IncidentStatus.Queued, IncidentStatus.Draft],
  [IncidentStatus.Queued]: [IncidentStatus.Submitted, IncidentStatus.Draft],
  [IncidentStatus.Submitted]: [IncidentStatus.Accepted, IncidentStatus.Rejected],
  [IncidentStatus.Accepted]: [IncidentStatus.Draft], // corrections re-open
  [IncidentStatus.Rejected]: [IncidentStatus.Draft],
};

export function canTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: IncidentStatus, to: IncidentStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal incident status transition: ${from} → ${to}`);
  }
}
