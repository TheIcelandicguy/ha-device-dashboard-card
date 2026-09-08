#!/usr/bin/env node
/**
 * Device detection against real registry rows.
 *
 * `test-card.mjs` exercises detection with a handful of hand-written fixtures —
 * enough to pin the rules someone thought to write down, which is exactly the
 * set that does not contain the bugs. Both detection bugs found so far came from
 * looking at real device data: a `/^sh/i` rule that matched every device named
 * "Shelly…", and the BLU Gateway (a mains WiFi Gen3 unit whose name says
 * Bluetooth) resolving to `ble`.
 *
 * So this runs `getDeviceProfile` and `detectShellyGen` over
 * `fixtures/detection-devices.json` — 200+ scrubbed rows harvested from a live
 * instance across 30-odd integrations — and compares against
 * `fixtures/detection-expected.json`.
 *
 * ── What a failure here means ────────────────────────────────────────────────
 *
 * The expected file is a record of what the code does **today**, not a claim
 * that today's answer is right. A diff means detection changed: read it and
 * decide. If the change is an improvement, re-bless with:
 *
 *   node scripts/test-detection.mjs --bless
 *
 * Rows carrying a `why` note are different: those are cases someone checked by
 * hand against the real hardware, and a change to one is a regression until
 * argued otherwise. They are listed separately in the output.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const FIXTURES = join('scripts', 'fixtures', 'detection-devices.json');
const EXPECTED = join('scripts', 'fixtures', 'detection-expected.json');
const BLESS = process.argv.includes('--bless');
const OUT = '.tmp-detectiontest';

if (!existsSync(FIXTURES)) {
  console.error(`No ${FIXTURES}. Harvest one with: node scripts/harvest-fixtures.mjs`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
let failures = 0;
try {
  execFileSync(process.execPath, [
    join('node_modules', 'typescript', 'bin', 'tsc'), 'src/helpers.ts',
    '--outDir', OUT, '--module', 'commonjs', '--target', 'es2020',
    '--skipLibCheck', '--moduleResolution', 'node',
  ], { stdio: 'inherit' });
  writeFileSync(join(OUT, 'package.json'), '{"type":"commonjs"}');
  const h = createRequire(import.meta.url)(join(process.cwd(), OUT, 'helpers.js'));

  const { devices } = JSON.parse(readFileSync(FIXTURES, 'utf8'));
  const prior = existsSync(EXPECTED) ? JSON.parse(readFileSync(EXPECTED, 'utf8')) : { devices: {} };
  const priorRows = prior.devices ?? {};

  /** The fixture row as the card's own HADevice shape. */
  const toDevice = (row, i) => ({
    device_id: `fixture-${i}`,
    name: row.name,
    integration: row.integration,
    manufacturer: row.manufacturer,
    model: row.model,
    model_id: row.model_id,
    hw_version: row.hw_version,
    sw_version: row.sw_version,
    entities: row.entities.map(e => ({
      entity_id: e.entity_id,
      domain: e.domain,
      entity_category: e.entity_category,
      attributes: e.attributes ?? {},
    })),
  });

  const now = {};
  for (const [i, row] of devices.entries()) {
    const dev = toDevice(row, i);
    // DeviceProfileResult is { type, gen, label, integration }. `gen` is the
    // profile's own view; detectShellyGen is asked separately because it is the
    // function both known bugs lived in.
    const p = h.getDeviceProfile(dev);
    const key = `${row.integration}/${row.name}`;
    now[key] = {
      profile: p.type,
      label: p.label,
      gen: p.gen,
      // Exactly how the card calls it — `device.model ?? ''`, never the display
      // name. Worth being literal about: the function's own comments talk about
      // "the name", but the only string it is ever handed is the model, so
      // passing a name here would test a path production cannot reach.
      ...(row.integration === 'shelly' || row.integration === 'bthome'
        ? { shellyGen: h.detectShellyGen(row.model ?? '', row.hw_version, row.model_id) }
        : {}),
    };
  }

  if (BLESS) {
    // Keep the hand-checked notes: they are the part a machine cannot regenerate.
    const merged = {};
    for (const [k, v] of Object.entries(now)) {
      merged[k] = priorRows[k]?.why ? { ...v, why: priorRows[k].why } : v;
    }
    writeFileSync(EXPECTED, JSON.stringify({
      note: 'What detection produces today. Not a claim that it is correct — except '
          + 'for rows with a "why", which were checked against real hardware and '
          + 'must not change silently. Re-bless with: npm run test:detection -- --bless',
      devices: merged,
    }, null, 1) + '\n');
    console.log(`blessed ${Object.keys(merged).length} rows → ${EXPECTED}`);
  } else {
    const checked = [];
    const drifted = [];
    let missing = 0;
    for (const [key, got] of Object.entries(now)) {
      const want = priorRows[key];
      if (!want) { missing++; continue; }
      const same = want.profile === got.profile && want.gen === got.gen
        && want.label === got.label && want.shellyGen === got.shellyGen;
      if (same) continue;
      const show = (v) => `profile=${v.profile} label=${v.label} gen=${v.gen}`
        + (v.shellyGen ? ` shellyGen=${v.shellyGen}` : '');
      (want.why ? checked : drifted).push(
        `  ${key}\n      was ${show(want)}\n      now ${show(got)}`
        + (want.why ? `\n      checked: ${want.why}` : ''));
    }
    const gone = Object.keys(priorRows).filter(k => !(k in now));

    console.log(`detection over ${devices.length} real device shapes`);
    if (checked.length) {
      failures += checked.length;
      console.log(`\n  ${checked.length} HAND-CHECKED case(s) changed — these are regressions:`);
      console.log(checked.join('\n'));
    }
    if (drifted.length) {
      failures += drifted.length;
      console.log(`\n  ${drifted.length} row(s) changed:`);
      console.log(drifted.join('\n'));
      console.log('\n  If these are improvements: npm run test:detection -- --bless');
    }
    if (missing) console.log(`  ${missing} new row(s) with no recorded expectation — re-bless to record them.`);
    if (gone.length) console.log(`  ${gone.length} recorded row(s) no longer in the fixtures.`);
    if (!failures) console.log(`  ✓ every device detects as recorded`);

    // A coverage line, because the point of this file is breadth.
    const byProfile = Object.values(now).reduce((m, v) => m.set(v.profile, (m.get(v.profile) ?? 0) + 1), new Map());
    console.log('\n  profiles: ' + [...byProfile.entries()].sort((a, b) => b[1] - a[1])
      .map(([p, n]) => `${p}=${n}`).join(' '));
    const gens = Object.values(now).filter(v => v.shellyGen)
      .reduce((m, v) => m.set(v.shellyGen, (m.get(v.shellyGen) ?? 0) + 1), new Map());
    if (gens.size) console.log('  shelly gens: ' + [...gens.entries()].map(([g, n]) => `${g}=${n}`).join(' '));
  }
} finally {
  rmSync(OUT, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} failure(s)` : '\nOK');
process.exit(failures ? 1 : 0);
