/**
 * The "comms" facet of an incident — where radio traffic lands so a department's
 * records and its radio finally live on the same incident.
 *
 * Populated by CommsService from the frozen radio-event stream. Everything here is
 * derived from event metadata only: no audio, no keys, never anything the console
 * shouldn't send. Raw P25 unit IDs are resolved to people/apparatus via the roster;
 * the raw id is always retained so the record is faithful even if the roster changes.
 */

/** Roster resolution of a raw P25 unit id. `resolved` is false until the roster knows it. */
export interface ResolvedUnit {
  /** Raw P25 unit id (decimal string) — always retained, always authoritative input. */
  radioUnitId: string;
  resolved: boolean;
  /** Roster identity, when known. */
  personId?: string;
  apparatusId?: string;
  displayName?: string; // e.g. "Engine 12" or "FF J. Rivera" — roster-owned
}

/** One radio transmission on the incident's channel (a keyup, ideally start→end). */
export interface Transmission {
  /** call_id from the envelope when present; else a synthesized local id. */
  callId: string;
  unit: ResolvedUnit;
  talkgroupId: string; // decimal string
  startedAt: string; // from ptt_start / call_grant timestamp
  endedAt?: string; // from ptt_end / call_end timestamp
  /**
   * How the transmission closed:
   *  - 'event'   — a matching ptt_end/call_end arrived
   *  - 'timeout' — no end arrived; auto-closed by the platform's silence heuristic
   *  - undefined — still open
   */
  closedBy?: 'event' | 'timeout';
  emergency: boolean; // emergency-mode traffic flag on this transmission
  encrypted: boolean;
}

/** A mayday / emergency-alarm record — the highest-value, legally-significant entry. */
export interface MaydayEvent {
  eventId: string; // envelope event_id
  unit: ResolvedUnit;
  talkgroupId: string;
  /** Console-authoritative time the mayday happened. */
  occurredAt: string;
  /** Platform receipt time (may differ; both retained). */
  receivedAt: string;
  /** Whether the emitting console clock was NTP-disciplined, if known. */
  clockSynced?: boolean | null;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

/** Presence: which units are currently on the system / affiliated to the channel. */
export interface UnitPresence {
  unit: ResolvedUnit;
  registered: boolean;
  affiliatedTalkgroupId?: string;
  updatedAt: string;
}

export interface IncidentCommsFacet {
  /** Talkgroup(s) bound to this incident (usually set at dispatch). Decimal strings. */
  boundTalkgroupIds: string[];
  /** Ordered radio-traffic timeline. Newest appended last. */
  transmissions: Transmission[];
  /** Mayday events on this incident. Non-empty ⇒ a mayday was declared. */
  maydays: MaydayEvent[];
  /** Live-ish presence, keyed by raw unit id. */
  presence: Record<string, UnitPresence>;
  /** True while any mayday is unacknowledged. Drives the notification/alert. */
  hasActiveMayday: boolean;
  /** Last radio event applied, for observability. */
  lastEventAt?: string;
}

export function emptyCommsFacet(): IncidentCommsFacet {
  return {
    boundTalkgroupIds: [],
    transmissions: [],
    maydays: [],
    presence: {},
    hasActiveMayday: false,
  };
}
