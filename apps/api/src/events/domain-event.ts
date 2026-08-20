/**
 * A domain event — the canonical, durable fact that something happened (a mayday
 * declared, an incident status changed). This is deliberately SEPARATE from how it
 * is delivered live (see ADR-0002): the event is the record; the transport (SSE
 * today) is swappable. Every event gets a monotonic `id` that doubles as the SSE
 * Last-Event-ID cursor, so a reconnecting client can replay exactly what it missed.
 */

export type EventPriority =
  | 'critical' // life-safety; a mayday. Interfaces must alert unmistakably.
  | 'info';

export interface DomainEvent {
  /** Monotonic, server-assigned. The SSE cursor (Last-Event-ID). */
  id: number;
  /** Dotted event name, e.g. "mayday.declared", "incident.status.changed". */
  type: string;
  /** Tenant scope. Empty string = not attributable to one department (ops-level). */
  departmentId: string;
  incidentId?: string;
  priority: EventPriority;
  /** ISO time the event was published. */
  at: string;
  /** Event-specific body. Small and JSON-safe — never audio, never keys. */
  payload: Record<string, unknown>;
}

/** What a producer supplies; `id` and `at` are filled in by the publisher. */
export type DomainEventInput = Omit<DomainEvent, 'id' | 'at'> & { at?: string };
