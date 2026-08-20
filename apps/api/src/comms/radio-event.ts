/**
 * Radio event envelope — FROZEN contract, schema_version "1.0".
 *
 * This is the wire format agreed with the sibling `open-p25-console` project
 * (see /docs/INTEGRATION-RADIO-SEAM.md). The console EMITS these; the platform
 * INGESTS them. Neither project imports the other — this file is the platform's
 * own copy of the shared shape. The console repo holds an identical definition.
 *
 * Design rules baked into the types below:
 *  - All P25 identifiers are OPAQUE STRINGS. We never parse, do arithmetic on, or
 *    re-base them. `wacn`/`system_id`/`rfss_id` are uppercase hex; `unit.id` and
 *    `talkgroup.id` are decimal — but to us they are just strings that must match
 *    exactly. This sidesteps the classic hex-as-decimal P25 footgun.
 *  - Ordering / gap detection is by (session_id, seq), NEVER by timestamp.
 *  - `event_id` is the global idempotency key.
 */

export type RadioEventType =
  | 'emergency' // mayday / emergency alarm from a unit — highest record value
  | 'ptt_start'
  | 'ptt_end'
  | 'unit_registration'
  | 'unit_deregistration'
  | 'talkgroup_affiliation'
  | 'call_grant'
  | 'call_end';

/** Call-scoped events carry a call_id; registration/presence events do not. */
export const CALL_SCOPED_EVENTS: ReadonlySet<RadioEventType> = new Set<RadioEventType>([
  'ptt_start',
  'ptt_end',
  'call_grant',
  'call_end',
]);

export interface RadioSystemId {
  /** WACN, 20-bit — uppercase hex string (e.g. "BEE00"). Opaque to us. */
  wacn: string;
  /** System ID, 12-bit — uppercase hex string (e.g. "ABC"). Opaque to us. */
  system_id: string;
  /** RFSS ID, 8-bit — uppercase hex string (e.g. "01"). Opaque to us. */
  rfss_id: string;
}

export interface RadioUnitRef {
  /** P25 unit ID — decimal string. Authoritative input; roster resolves identity. */
  id: string;
  /** Non-authoritative hint, present only if the console was configured with one. */
  alias?: string | null;
}

export interface RadioTalkgroupRef {
  /** P25 talkgroup ID — decimal string. */
  id: string;
  alias?: string | null;
}

/** The frozen v1.0 envelope. */
export interface RadioEvent {
  schema_version: '1.0';
  event_type: RadioEventType;
  /** uuid-v4 — global idempotency key. */
  event_id: string;
  /** uuid-v4 — one per console emitter run. `seq` is monotonic within it. */
  session_id: string;
  /** Monotonic within session_id, starts at 1. Ordering/gap key with session_id. */
  seq: number;
  /** UTC, RFC3339, ms precision — authoritative for WHEN the event happened. */
  timestamp: string;
  source: string; // e.g. "open-p25-console"
  /** true/false when the console knows its clock was NTP-disciplined; null/absent if not. */
  clock_synced?: boolean | null;
  radio_system: RadioSystemId;
  unit: RadioUnitRef;
  talkgroup: RadioTalkgroupRef;
  /** true = call was in protected/secure mode. Pure metadata; says nothing about keys. */
  encrypted: boolean;
  /** Marks emergency-mode traffic on ptt and call events. */
  emergency: boolean;
  /** Present on ptt/call events (correlates within one call); null/absent otherwise. */
  call_id?: string | null;
}

/**
 * Structural guard for an inbound envelope. Deliberately strict on the frozen
 * fields and forgiving on the optional hints (alias/call_id/clock_synced absent
 * is normal, never an error). Returns the list of problems ([] = valid).
 */
export function validateRadioEvent(e: unknown): string[] {
  const problems: string[] = [];
  const ev = e as Partial<RadioEvent> | null;
  if (!ev || typeof ev !== 'object') return ['event is not an object'];

  if (ev.schema_version !== '1.0') problems.push(`unsupported schema_version: ${String(ev.schema_version)}`);
  if (!isNonEmptyString(ev.event_id)) problems.push('event_id must be a non-empty string');
  if (!isNonEmptyString(ev.session_id)) problems.push('session_id must be a non-empty string');
  if (typeof ev.seq !== 'number' || !Number.isInteger(ev.seq) || ev.seq < 1) {
    problems.push('seq must be a positive integer');
  }
  if (!isNonEmptyString(ev.timestamp)) problems.push('timestamp must be a non-empty string');
  if (!isNonEmptyString(ev.source)) problems.push('source must be a non-empty string');
  if (!isRadioEventType(ev.event_type)) problems.push(`unknown event_type: ${String(ev.event_type)}`);
  if (typeof ev.encrypted !== 'boolean') problems.push('encrypted must be a boolean');
  if (typeof ev.emergency !== 'boolean') problems.push('emergency must be a boolean');

  // IDs are opaque strings — enforce string-ness, nothing about their content.
  if (!ev.radio_system || !isNonEmptyString(ev.radio_system.wacn) ||
      !isNonEmptyString(ev.radio_system.system_id) || !isNonEmptyString(ev.radio_system.rfss_id)) {
    problems.push('radio_system.{wacn,system_id,rfss_id} must be non-empty strings');
  }
  if (!ev.unit || !isNonEmptyString(ev.unit.id)) problems.push('unit.id must be a non-empty string');
  if (!ev.talkgroup || !isNonEmptyString(ev.talkgroup.id)) problems.push('talkgroup.id must be a non-empty string');

  // call_id required exactly on call-scoped events.
  if (isRadioEventType(ev.event_type) && CALL_SCOPED_EVENTS.has(ev.event_type)) {
    if (!isNonEmptyString(ev.call_id)) problems.push(`${ev.event_type} requires a call_id`);
  }

  return problems;
}

/** Stable natural key for a talkgroup within a radio system — used for binding. */
export function talkgroupKey(sys: RadioSystemId, tg: RadioTalkgroupRef): string {
  return `${sys.wacn}:${sys.system_id}:${sys.rfss_id}:${tg.id}`;
}

/** Stable natural key for a unit within a radio system. */
export function unitKey(sys: RadioSystemId, unit: RadioUnitRef): string {
  return `${sys.wacn}:${sys.system_id}:${sys.rfss_id}:${unit.id}`;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function isRadioEventType(v: unknown): v is RadioEventType {
  return (
    v === 'emergency' || v === 'ptt_start' || v === 'ptt_end' ||
    v === 'unit_registration' || v === 'unit_deregistration' ||
    v === 'talkgroup_affiliation' || v === 'call_grant' || v === 'call_end'
  );
}
