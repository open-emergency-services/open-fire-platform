/**
 * Emitter — plays a scenario into the real API, exactly as the open-p25-console and
 * the CAD feed would. No platform code is imported; it talks HTTP only, so it doubles
 * as a faithful integration test of the frozen v1.0 envelope and the inbound endpoints.
 */

import { randomUUID } from 'node:crypto';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postJSON(base, path, body) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${path} → ${res.status} ${res.statusText} ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

/** CAD inbound: create the incident, seed the roster, bind the talkgroup. */
export async function dispatch(base, s, log = console.log) {
  const incident = await postJSON(base, '/incidents', {
    internalId: s.incident.internalId,
    data: s.incident.data,
    departmentId: s.departmentId,
  });
  log(`  dispatched incident ${s.incident.internalId} → ${incident.id} (${s.incident.data.address})`);

  for (const u of s.units) {
    await postJSON(base, '/comms/roster', {
      radio_system: s.radioSystem,
      unitId: u.id,
      displayName: u.displayName,
      apparatusId: u.apparatusId,
      personId: u.personId,
    });
  }
  log(`  seeded roster (${s.units.length} units)`);

  await postJSON(base, '/comms/bindings/talkgroup', {
    radio_system: s.radioSystem,
    talkgroupId: s.talkgroup.id,
    incidentId: incident.id,
    departmentId: s.departmentId,
  });
  log(`  bound talkgroup ${s.talkgroup.id} (${s.talkgroup.alias}) → incident`);

  return incident;
}

/** Console inbound: play the radio timeline as frozen v1.0 envelopes. */
export async function emit(base, s, { speed = 1, log = console.log } = {}) {
  const sessionId = randomUUID();
  let seq = 0;
  const unitAlias = new Map(s.units.map((u) => [u.id, u.alias]));
  const timeline = [...s.timeline].sort((a, b) => a.at - b.at);
  const startWall = Date.now();

  for (const step of timeline) {
    const targetMs = (step.at / speed) * 1000;
    const waitMs = targetMs - (Date.now() - startWall);
    if (waitMs > 0) await sleep(waitMs);

    const tgId = step.talkgroup ?? s.talkgroup.id;
    const envelope = {
      schema_version: '1.0',
      event_type: step.type,
      event_id: randomUUID(),
      session_id: sessionId,
      seq: ++seq,
      timestamp: new Date().toISOString(),
      source: 'open-p25-console-sim',
      clock_synced: true,
      radio_system: s.radioSystem,
      unit: { id: step.unit, alias: unitAlias.get(step.unit) ?? null },
      talkgroup: { id: tgId, alias: s.talkgroup.alias ?? null },
      encrypted: false,
      emergency: step.emergency ?? step.type === 'emergency',
      call_id: step.callId ?? null,
    };

    const r = await postJSON(base, '/comms/radio-events', envelope);
    const tag = step.type === 'emergency' ? '  ‼ MAYDAY' : `  · ${step.type}`;
    log(`${tag} unit ${step.unit} tg ${tgId} → ${r?.correlation ?? '?'}${r?.mayday ? ' [MAYDAY]' : ''}`);
  }
}

export async function runScenario(base, s, opts = {}) {
  const log = opts.log ?? console.log;
  log(`▶ ${s.name}`);
  await dispatch(base, s, log);
  await emit(base, s, opts);
  log(`✓ ${s.name} complete`);
}
