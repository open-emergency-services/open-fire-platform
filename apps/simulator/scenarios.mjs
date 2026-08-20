/**
 * Scenario library for the virtual system.
 *
 * A scenario is a scripted, front-to-back run: it dispatches an incident (the CAD
 * inbound), seeds a roster, binds a talkgroup, then plays a timeline of radio events
 * (the console inbound) — open-mic / close-mic traffic, unit affiliations, and, in
 * some scenarios, a mayday. The emitter feeds these into the real API exactly as the
 * open-p25-console would, so the whole chain (ingest → correlate → comms facet →
 * SSE → interface) exercises with realistic data.
 *
 * `at` is seconds from the start of the radio timeline; the emitter scales it by the
 * speed factor. Times are illustrative, not a real fireground timeline.
 */

const RADIO = { wacn: 'BEE00', system_id: 'ABC', rfss_id: '01' };
const TG_FIREGROUND = { id: '101', alias: 'FIREGROUND-1' };

/** A residential structure fire that escalates to a mayday. The headline demo. */
const structureFire = {
  id: 'structure-fire',
  name: 'Residential structure fire → mayday',
  description:
    'Working fire at a single-family home. Multiple units arrive and key up on ' +
    'fireground; an interior firefighter declares a mayday. Exercises the full chain ' +
    'including the critical alert path.',
  radioSystem: RADIO,
  departmentId: 'DEMO_DEPT',
  incident: {
    internalId: 'INC-2026-000481',
    data: { incident_type: '111 - Building fire', address: '482 Maple St' },
  },
  talkgroup: TG_FIREGROUND,
  units: [
    { id: '1201', alias: 'E12', displayName: 'Engine 12', apparatusId: 'E12' },
    { id: '1701', alias: 'L7', displayName: 'Ladder 7', apparatusId: 'L7' },
    { id: '1001', alias: 'BC1', displayName: 'Battalion 1', apparatusId: 'BC1' },
    { id: '1202', alias: 'E12-A', displayName: 'FF J. Rivera (E12)', personId: 'p-rivera' },
  ],
  timeline: [
    { at: 0, type: 'unit_registration', unit: '1001' },
    { at: 1, type: 'talkgroup_affiliation', unit: '1001' },
    { at: 2, type: 'ptt_start', unit: '1001', callId: 'c1' },
    { at: 6, type: 'ptt_end', unit: '1001', callId: 'c1' }, // BC1 on scene, command
    { at: 9, type: 'unit_registration', unit: '1201' },
    { at: 10, type: 'ptt_start', unit: '1201', callId: 'c2' },
    { at: 14, type: 'ptt_end', unit: '1201', callId: 'c2' }, // E12 stretching a line
    { at: 18, type: 'unit_registration', unit: '1701' },
    { at: 20, type: 'ptt_start', unit: '1701', callId: 'c3' },
    { at: 23, type: 'ptt_end', unit: '1701', callId: 'c3' }, // L7 to the roof
    { at: 30, type: 'ptt_start', unit: '1202', callId: 'c4' },
    // NOTE: no ptt_end for c4 — interior FF drops mid-transmission (drop-tolerant test)
    { at: 42, type: 'emergency', unit: '1202', emergency: true }, // MAYDAY
    { at: 48, type: 'ptt_start', unit: '1001', callId: 'c5', emergency: true },
    { at: 55, type: 'ptt_end', unit: '1001', callId: 'c5', emergency: true }, // command acks mayday
  ],
};

/** A routine EMS call — steady traffic, no mayday. Baseline "normal" flow. */
const emsCall = {
  id: 'ems-call',
  name: 'Routine EMS call',
  description: 'A medical response with a couple of units and light radio traffic. No mayday.',
  radioSystem: RADIO,
  departmentId: 'DEMO_DEPT',
  incident: {
    internalId: 'INC-2026-000482',
    data: { incident_type: '321 - EMS call', address: '19 Birch Ln' },
  },
  talkgroup: { id: '205', alias: 'EMS-2' },
  units: [
    { id: '3101', alias: 'M31', displayName: 'Medic 31', apparatusId: 'M31' },
    { id: '1201', alias: 'E12', displayName: 'Engine 12', apparatusId: 'E12' },
  ],
  timeline: [
    { at: 0, type: 'unit_registration', unit: '3101' },
    { at: 1, type: 'talkgroup_affiliation', unit: '3101', talkgroup: '205' },
    { at: 3, type: 'ptt_start', unit: '3101', callId: 'm1', talkgroup: '205' },
    { at: 7, type: 'ptt_end', unit: '3101', callId: 'm1', talkgroup: '205' },
    { at: 12, type: 'ptt_start', unit: '1201', callId: 'm2', talkgroup: '205' },
    { at: 15, type: 'ptt_end', unit: '1201', callId: 'm2', talkgroup: '205' },
    { at: 22, type: 'ptt_start', unit: '3101', callId: 'm3', talkgroup: '205' },
    { at: 27, type: 'ptt_end', unit: '3101', callId: 'm3', talkgroup: '205' }, // transporting
  ],
};

/** Rapid-fire traffic to stress the timeline / ordering. */
const stress = {
  id: 'stress',
  name: 'High-traffic stress run',
  description: 'Many quick keyups across units — meant to push ordering, dedupe, and the timeline.',
  radioSystem: RADIO,
  departmentId: 'DEMO_DEPT',
  incident: {
    internalId: 'INC-2026-000483',
    data: { incident_type: '113 - Cooking fire', address: '77 Cedar Ct' },
  },
  talkgroup: TG_FIREGROUND,
  units: Array.from({ length: 6 }, (_, i) => ({
    id: String(1400 + i),
    alias: `U${i}`,
    displayName: `Unit ${1400 + i}`,
  })),
  timeline: Array.from({ length: 40 }, (_, i) => {
    const unit = String(1400 + (i % 6));
    const phase = i % 2 === 0 ? 'ptt_start' : 'ptt_end';
    return { at: i * 0.75, type: phase, unit, callId: `s${Math.floor(i / 2)}` };
  }),
};

export const scenarios = { structureFire, emsCall, stress };
export const byId = (id) =>
  Object.values(scenarios).find((s) => s.id === id) ?? scenarios.structureFire;
