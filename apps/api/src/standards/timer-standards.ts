/**
 * Fireground timing standards, in minutes. These drive the command board's obligation
 * timers (PAR cadence, interior air time, search/rehab windows, EMS scene time…).
 *
 * The values here are the platform defaults — reasonable, widely-referenced starting
 * points. They are NOT medical or legal advice and no department should adopt them
 * unread: SOG/SOP thresholds vary by jurisdiction, staffing, and mutual-aid posture.
 * Every field is overridable per department (ADR/BACKLOG: configurable standards), which
 * is the point — the software must bend to the department's SOGs, not the other way round.
 */
export interface TimerStandards {
  /** PAR (personnel accountability report) cadence. */
  par: number;
  /** Interior time-in-IDLH: warn / critical / severe thresholds. */
  airWarn: number;
  airCrit: number;
  airSevere: number;
  /** Life-safety: confirm primary all-clear within N min of dispatch. */
  primarySearch: number;
  /** Stage a replacement RIT after one deploys. */
  replacementRit: number;
  /** Minimum rehab before reassignment. */
  rehab: number;
  /** Conditions/Actions/Needs report cadence from divisions. */
  canReport: number;
  /** Complete a thorough secondary search (after primary). */
  secondarySearch: number;
  /** Secure utilities (gas/electric). */
  utilities: number;
  /** EMS scene-time goal — packaged & transporting ("platinum ten"). */
  transportScene: number;
  /** Minutes past due before a countdown escalates to "severe" (louder). */
  severeOver: number;
}

export const DEFAULT_TIMER_STANDARDS: TimerStandards = {
  par: 10,
  airWarn: 15,
  airCrit: 20,
  airSevere: 25,
  primarySearch: 8,
  replacementRit: 2,
  rehab: 20,
  canReport: 10,
  secondarySearch: 20,
  utilities: 15,
  transportScene: 10,
  severeOver: 3,
};

export const TIMER_STANDARD_KEYS = Object.keys(DEFAULT_TIMER_STANDARDS) as (keyof TimerStandards)[];
