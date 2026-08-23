/**
 * Measure the card's hot paths against a synthetic fleet.
 *
 * Written because a performance worry turned out to be unfounded: the fleet
 * summaries were suspected of needing memoisation and measured at 0.2 ms for 56
 * devices, which is a fortieth of a frame. Guessing at performance produces
 * complexity nobody needs — measure first.
 *
 * `npm run bench`. Numbers are per call, averaged; run it before and after any
 * change that claims to make something faster.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const OUT = '.tmp-bench';
const FRAME_MS = 16.7;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
try {
  execFileSync(process.execPath, [
    join('node_modules', 'typescript', 'bin', 'tsc'),
    'src/attention.ts', 'src/helpers.ts', 'src/cascade.ts', '--outDir', OUT,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--moduleResolution', 'node',
  ], { stdio: 'inherit' });
  writeFileSync(join(OUT, 'package.json'), '{"type":"commonjs"}');
  const req = createRequire(import.meta.url);
  const att = req(join(process.cwd(), OUT, 'attention.js'));
  const h = req(join(process.cwd(), OUT, 'helpers.js'));
  const cas = req(join(process.cwd(), OUT, 'cascade.js'));

  /** A fleet shaped like a real one: ~15 entities per device, Shelly-ish mix. */
  const build = (n) => {
    const devices = [], states = {}, entities = {}, registry = {};
    for (let i = 0; i < n; i++) {
      const devId = `d${i}`;
      const ents = [];
      const add = (id, domain, attrs, state = '1') => {
        ents.push({ entity_id: id, domain });
        states[id] = { state, attributes: attrs };
        entities[id] = { device_id: devId, platform: 'shelly' };
      };
      for (let j = 0; j < 12; j++) {
        add(`sensor.${devId}_s${j}`, 'sensor',
          { device_class: j === 0 ? 'power' : j === 1 ? 'battery' : 'temperature' }, String(j));
      }
      add(`light.${devId}`, 'light', {}, i % 3 ? 'off' : 'on');
      add(`update.${devId}_beta_firmware`, 'update',
        { friendly_name: 'Beta firmware', installed_version: '1.7.5', latest_version: '1.8.0b' }, 'on');
      add(`binary_sensor.${devId}_overtemp`, 'binary_sensor', { device_class: 'heat' }, i % 20 ? 'off' : 'on');
      registry[devId] = {
        name: `Device ${i}`, manufacturer: 'Shelly', model: 'Shelly Plus 1PM',
        sw_version: `20260311-095847/1.${i % 4}.0-g99`, area_id: `a${i % 8}`,
        configuration_url: `http://10.0.0.${i % 250}`,
        connections: [['mac', `aa:bb:cc:dd:${String(i).padStart(2, '0')}:01`]],
      };
      devices.push({ device_id: devId, name: `Device ${i}`, area: `Area ${i % 8}`,
        sw_version: `20260311-095847/1.${i % 4}.0-g99`, isShelly: true, integration: 'shelly', entities: ents });
    }
    const areas = {};
    for (let a = 0; a < 8; a++) areas[`a${a}`] = { name: `Area ${a}` };
    return { devices, hass: { states, entities, devices: registry, areas } };
  };

  const time = (label, runs, fn) => {
    fn(); // warm
    const t0 = performance.now();
    for (let i = 0; i < runs; i++) fn();
    const per = (performance.now() - t0) / runs;
    const pct = ((per / FRAME_MS) * 100).toFixed(1);
    console.log(`  ${label.padEnd(42)} ${per.toFixed(3)} ms   (${pct}% of a frame)`);
  };

  for (const n of [56, 224]) {
    const { devices, hass } = build(n);
    console.log(`\n${n} devices, ${Object.keys(hass.states).length} entities`);
    time('discovery (uncached: getAllDevices)', 50, () => h.getAllDevices(hass, { universal: true, scope: 'all' }));
    time('attentionItems + firmware + lights', 200, () => {
      att.attentionItems(devices, hass.states, {});
      att.firmwareGroups(devices);
      att.lightCounts(devices, hass.states, {});
    });
    time('cascade resolve, once per device', 200, () => {
      for (const d of devices) {
        const i = { config: {}, device: d, profile: 'relay' };
        cas.rawTileStyle(i); cas.blockLayout(i); cas.sensorSelection(i); cas.showGraphs(i);
      }
    });
  }
  console.log('\nDiscovery is cached against registry + config identity, so it runs on');
  console.log('config or registry changes, not on every state push.');
} finally {
  rmSync(OUT, { recursive: true, force: true });
}
