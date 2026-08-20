/**
 * Virtual-system driver. Waits for the API, then plays a scenario (optionally on a
 * loop). Configurable by flags or env so it works both on the command line and as a
 * docker-compose service.
 *
 *   node run.mjs --api http://localhost:3000/api/v1 --scenario structure-fire --speed 1 --loop
 *
 * Env equivalents: OFP_API, OFP_SCENARIO, OFP_SPEED, OFP_LOOP, OFP_LOOP_GAP.
 */

import { byId, scenarios } from './scenarios.mjs';
import { runScenario } from './emitter.mjs';

function flag(name) {
  return process.argv.includes(`--${name}`);
}
function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  return def;
}

const API = arg('api', process.env.OFP_API ?? 'http://localhost:3000/api/v1');
const SCENARIO = arg('scenario', process.env.OFP_SCENARIO ?? 'structure-fire');
const SPEED = Number(arg('speed', process.env.OFP_SPEED ?? '1')) || 1;
const LOOP = flag('loop') || process.env.OFP_LOOP === '1';
const LOOP_GAP = Number(process.env.OFP_LOOP_GAP ?? '8') || 8;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForApi(base, tries = 60) {
  const health = base.replace(/\/api\/v1$/, '/api/v1/health');
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(health);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await sleep(1000);
  }
  throw new Error(`API never became healthy at ${health}`);
}

async function main() {
  console.log(`Simulator → ${API}  scenario=${SCENARIO} speed=${SPEED} loop=${!!LOOP}`);
  if (SCENARIO === 'list') {
    for (const s of Object.values(scenarios)) console.log(`  ${s.id.padEnd(16)} ${s.name}`);
    return;
  }
  await waitForApi(API);
  console.log('API is healthy — starting.');

  const scenario = byId(SCENARIO);
  do {
    try {
      await runScenario(API, scenario, { speed: SPEED });
    } catch (err) {
      console.error(`Scenario error: ${err.message}`);
    }
    if (LOOP) {
      console.log(`… looping again in ${LOOP_GAP}s (Ctrl-C to stop)\n`);
      await sleep(LOOP_GAP * 1000);
    }
  } while (LOOP);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
