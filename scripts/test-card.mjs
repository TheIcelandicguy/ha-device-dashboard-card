/**
 * Tests for the card's core logic — discovery, device merging, input-channel
 * detection, relevance, layout utilities and config migration.
 *
 * These are the functions every real bug this week lived in: duplicate registry
 * rows rendering twice, an i4's only button never appearing, labels off by one,
 * cascades disagreeing. All were found by eye, after shipping. This is the net.
 *
 * Fixtures use anonymous devices but real-world *shapes*, which is where the
 * bugs live: two registry rows sharing one MAC (an integration shadowing another
 * integration's device), a Gen1 switch whose channels are all `event.` entities,
 * a Gen3 switch whose inputs are tagged `device_class: power` and whose event
 * entity has been renamed by its owner.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const OUT = '.tmp-cardtest';
let failures = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) console.log('  ✓ ' + name);
  else { failures++; console.log(`  ✗ ${name}\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`); }
};
const ok = (name, cond, detail = '') => {
  if (cond) console.log('  ✓ ' + name);
  else { failures++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
};

// ── fixtures ──────────────────────────────────────────────────────────────────

const st = (state, attributes = {}) => ({ state, attributes, last_changed: '2026-08-22T10:00:00Z' });

/** entity registry entry */
const ent = (device_id, platform, extra = {}) => ({ device_id, platform, ...extra });

function fleet() {
  const devices = {
    // A Shelly Dimmer 2 and the device_pulse shadow that shares its MAC.
    dimmer: {
      name: 'Bedroom dimmer', manufacturer: 'Shelly', model: 'Shelly Dimmer 2',
      configuration_url: 'http://10.0.0.11', area_id: 'bed',
      connections: [['mac', 'aa:bb:cc:00:00:01']], identifiers: [['shelly', 'AABBCC000001']],
    },
    dimmerShadow: {
      name: 'Bedroom dimmer', manufacturer: 'Shelly', model: 'Shelly Dimmer 2', area_id: 'bed',
      connections: [['mac', 'aa:bb:cc:00:00:01']], identifiers: [['shelly', 'AABBCC000001']],
    },
    // A Gen1 i3: channels are event entities only.
    i3: {
      name: 'Garage switch', manufacturer: 'Shelly', model: 'Shelly i3',
      configuration_url: 'http://10.0.0.12', area_id: 'garage',
      connections: [['mac', 'aa:bb:cc:00:00:02']], identifiers: [['shelly', 'AABBCC000002']],
    },
    // A Gen3 i4: binary_sensor inputs tagged `power`, plus a renamed event.
    i4: {
      name: 'Bedroom switch', manufacturer: 'Shelly', model: 'Shelly I4 Gen3',
      configuration_url: 'http://10.0.0.13', area_id: 'bed',
      connections: [['mac', 'aa:bb:cc:00:00:03']], identifiers: [['shelly', 'AABBCC000003']],
    },
    // A 2.5 parent + per-channel sub-device on the same host.
    relay: {
      name: 'Shelly 2.5', manufacturer: 'Shelly', model: 'Shelly 2.5',
      configuration_url: 'http://10.0.0.14', area_id: 'hall',
      connections: [['mac', 'aa:bb:cc:00:00:04']], identifiers: [['shelly', 'AABBCC000004']],
    },
    relayCh2: {
      name: 'Shelly 2.5 Channel 2', manufacturer: 'Shelly', model: 'Shelly 2.5',
      configuration_url: 'http://10.0.0.14', via_device_id: 'relay', area_id: 'hall',
    },
    // A Plus 1PM: one switch-kind input wired to its relay (input_0 ↔ switch_0).
    pm1: {
      name: 'Oven relay', manufacturer: 'Shelly', model: 'Shelly Plus 1PM',
      configuration_url: 'http://10.0.0.15', area_id: 'kitchen',
      connections: [['mac', 'aa:bb:cc:00:00:05']], identifiers: [['shelly', 'AABBCC000005']],
    },
    // Something that is not Shelly at all.
    hue: { name: 'Hue lamp', manufacturer: 'Signify', model: 'LCT001', area_id: 'hall' },
    phone: { name: 'Pixel', manufacturer: 'Google', model: 'Pixel 8', area_id: 'hall' },
    // Nothing controllable and no recognised sensor — only an update entity.
    bare: { name: 'Bare device', manufacturer: 'Shelly', model: 'Shelly Plus 1', area_id: 'hall' },
    // BTHome from a non-Shelly vendor.
    blu: { name: 'Tuya BLE', manufacturer: 'Tuya', model: 'T100', area_id: 'hall' },
  };

  const entities = {
    'light.dimmer': ent('dimmer', 'shelly'),
    'sensor.dimmer_power': ent('dimmer', 'shelly'),
    'sensor.dimmer_energy': ent('dimmer', 'shelly'),
    'binary_sensor.dimmer_ping': ent('dimmerShadow', 'device_pulse'),
    'sensor.dimmer_failed_pings': ent('dimmerShadow', 'device_pulse'),

    'event.garage_switch_channel_1': ent('i3', 'shelly'),
    'event.garage_switch_channel_2': ent('i3', 'shelly'),
    'event.garage_switch_channel_3': ent('i3', 'shelly'),
    'binary_sensor.garage_switch_cloud': ent('i3', 'shelly'),
    'sensor.garage_switch_rssi': ent('i3', 'shelly'),

    'binary_sensor.bedroom_switch_input_2': ent('i4', 'shelly'),
    'binary_sensor.bedroom_switch_input_3': ent('i4', 'shelly'),
    'event.bedroom_switch_bedside_lamp': ent('i4', 'shelly'),
    'binary_sensor.bedroom_switch_restart_required': ent('i4', 'shelly'),
    'binary_sensor.bedroom_switch_cloud': ent('i4', 'shelly'),
    'sensor.bedroom_switch_uptime': ent('i4', 'shelly'),

    'switch.relay_1': ent('relay', 'shelly'),
    'switch.relay_2': ent('relayCh2', 'shelly'),

    'binary_sensor.oven_relay_input_0_input': ent('pm1', 'shelly'),
    'switch.oven_relay_switch_0': ent('pm1', 'shelly'),
    'button.oven_relay_reboot': ent('pm1', 'shelly', { entity_category: 'config' }),
    'sensor.oven_relay_switch_0_power': ent('pm1', 'shelly'),

    'light.hue': ent('hue', 'hue'),

    'sensor.phone_battery': ent('phone', 'mobile_app'),
    'update.bare_firmware': ent('bare', 'shelly'),
    'sensor.blu_temp': ent('blu', 'bthome'),
    'sensor.dimmer_hidden': ent('dimmer', 'shelly', { hidden_by: 'user' }),
  };

  const states = {
    'light.dimmer': st('on', { friendly_name: 'Bedroom dimmer', brightness: 180 }),
    'sensor.dimmer_power': st('4.2', { device_class: 'power', friendly_name: 'Bedroom dimmer Power' }),
    'sensor.dimmer_energy': st('1.5', { device_class: 'energy' }),
    'binary_sensor.dimmer_ping': st('on', { device_class: 'connectivity' }),
    'sensor.dimmer_failed_pings': st('0'),

    'event.garage_switch_channel_1': st('2026-08-20T10:00:00Z', { device_class: 'button', event_type: 'single', friendly_name: 'Garage switch Input 1' }),
    'event.garage_switch_channel_2': st('2026-08-20T10:00:00Z', { device_class: 'button', event_type: 'double', friendly_name: 'Garage switch Input 2' }),
    'event.garage_switch_channel_3': st('2026-08-20T10:00:00Z', { device_class: 'button', friendly_name: 'Garage switch Input 3' }),
    'binary_sensor.garage_switch_cloud': st('on', { device_class: 'connectivity', friendly_name: 'Garage switch Cloud' }),
    'sensor.garage_switch_rssi': st('-58', { device_class: 'signal_strength' }),

    'binary_sensor.bedroom_switch_input_2': st('off', { device_class: 'power', friendly_name: 'Bedroom switch Input 2' }),
    'binary_sensor.bedroom_switch_input_3': st('off', { device_class: 'power', friendly_name: 'Bedroom switch Input 3' }),
    'event.bedroom_switch_bedside_lamp': st('2026-08-15T02:59:44Z', { device_class: 'button', event_type: 'single_push', friendly_name: 'Bedroom switch Bedside lamp' }),
    'binary_sensor.bedroom_switch_restart_required': st('off', { device_class: 'problem', friendly_name: 'Bedroom switch Restart required' }),
    'binary_sensor.bedroom_switch_cloud': st('on', { device_class: 'connectivity', friendly_name: 'Bedroom switch Cloud' }),
    'sensor.bedroom_switch_uptime': st('1200', { friendly_name: 'Bedroom switch Uptime' }),

    'switch.relay_1': st('on', { friendly_name: 'Shelly 2.5 Channel 1' }),
    'switch.relay_2': st('off', { friendly_name: 'Shelly 2.5 Channel 2' }),

    'binary_sensor.oven_relay_input_0_input': st('off', { friendly_name: 'Oven relay Input 0' }),
    'switch.oven_relay_switch_0': st('on', { friendly_name: 'Oven relay' }),
    'button.oven_relay_reboot': st('unknown', { device_class: 'restart', friendly_name: 'Oven relay Restart' }),
    'sensor.oven_relay_switch_0_power': st('12.5', { device_class: 'power', unit_of_measurement: 'W', friendly_name: 'Oven relay power' }),
    'light.hue': st('off', { friendly_name: 'Hue lamp' }),
    'sensor.phone_battery': st('72', { device_class: 'battery', friendly_name: 'Pixel Battery' }),
    'update.bare_firmware': st('off', { friendly_name: 'Bare device Firmware' }),
    'sensor.blu_temp': st('19.5', { device_class: 'temperature', friendly_name: 'Tuya BLE Temperature' }),
    'sensor.dimmer_hidden': st('1', { device_class: 'power' }),
  };

  return { states, entities, devices, areas: { bed: { name: 'Bedroom' }, garage: { name: 'Garage' }, hall: { name: 'Hall' } } };
}

// ── run ───────────────────────────────────────────────────────────────────────

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
try {
  execFileSync(process.execPath, [
    join('node_modules', 'typescript', 'bin', 'tsc'),
    'src/helpers.ts', 'src/cascade.ts', 'src/attention.ts', 'src/shelly-cloud-import.ts',
    'src/design-scope.ts', 'src/localize.ts', 'src/update-policy.ts', 'src/font-options.ts',
    'src/sensor-pick.ts', 'src/sensor-keys.ts', 'src/room-filter.ts', '--outDir', OUT,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--moduleResolution', 'node',
  ], { stdio: 'inherit' });
  // The project is "type": "module", which would make these .js files ESM.
  writeFileSync(join(OUT, 'package.json'), '{"type":"commonjs"}');

  const req = createRequire(import.meta.url);
  const h = req(join(process.cwd(), OUT, 'helpers.js'));
  const cas = req(join(process.cwd(), OUT, 'cascade.js'));
  const ds  = req(join(process.cwd(), OUT, 'design-scope.js'));
  const att = req(join(process.cwd(), OUT, 'attention.js'));
  const loc = req(join(process.cwd(), OUT, 'localize.js'));
  const up  = req(join(process.cwd(), OUT, 'update-policy.js'));
  const fo  = req(join(process.cwd(), OUT, 'font-options.js'));
  const sp  = req(join(process.cwd(), OUT, 'sensor-pick.js'));
  const sk  = req(join(process.cwd(), OUT, 'sensor-keys.js'));
  const rf  = req(join(process.cwd(), OUT, 'room-filter.js'));
  const hass = fleet();
  const byName = (list, name) => list.find(d => d.name === name);

  console.log('\ngetAllDevices — Shelly mode');
  const shelly = h.getAllDevices(hass);
  ok('drops non-Shelly integrations', !byName(shelly, 'Hue lamp'));
  ok('drops the device_pulse shadow', shelly.filter(d => d.name === 'Bedroom dimmer').length === 1);
  eq('keeps exactly the Shelly devices', shelly.map(d => d.name).sort(),
    ['Bare device', 'Bedroom dimmer', 'Bedroom switch', 'Garage switch', 'Oven relay', 'Shelly 2.5']);

  console.log('\ngetAllDevices — universal mode');
  const uni = h.getAllDevices(hass, { universal: true, scope: 'all' });
  ok('includes non-Shelly devices', !!byName(uni, 'Hue lamp'));
  const dimmer = byName(uni, 'Bedroom dimmer');
  ok('the MAC-twin shadow is merged away', uni.filter(d => d.name === 'Bedroom dimmer').length === 1);
  eq('merged device keeps every entity', dimmer.entities.length, 5);
  eq('a Shelly entity wins the integration field', dimmer.integration, 'shelly');
  eq('the surviving row keeps the config-URL IP', dimmer.ip, '10.0.0.11');

  console.log('\ngetAllDevices — sub-device merge');
  const relay = byName(uni, 'Shelly 2.5');
  ok('per-channel sub-device folds into its parent', uni.every(d => d.name !== 'Shelly 2.5 Channel 2'));
  eq('parent gained the channel entity', relay.entities.length, 2);

  console.log('\ndetectInputChannels — Gen1 i3 (event-only)');
  const i3 = byName(uni, 'Garage switch');
  const ch3 = h.detectInputChannels(i3, hass.states);
  eq('finds three channels', ch3.length, 3);
  eq('labels match HA, not shifted by one', ch3.map(c => c.label), ['Input 1', 'Input 2', 'Input 3']);
  eq('channel numbers', ch3.map(c => c.channel), [1, 2, 3]);
  ok('all are button-style', ch3.every(c => c.kind === 'button'));
  eq('last event is carried', ch3[0].lastEvent, 'single');
  ok('the cloud binary_sensor is not an input', !ch3.some(c => c.entityId.includes('cloud')));

  console.log('\ndetectInputChannels — Gen3 i4 (binary + renamed event)');
  const i4 = byName(uni, 'Bedroom switch');
  const ch4 = h.detectInputChannels(i4, hass.states);
  ok('the renamed event channel is present', ch4.some(c => c.entityId === 'event.bedroom_switch_bedside_lamp'),
    'this is the bug that hid an i4\'s only button');
  eq('finds all three channels', ch4.length, 3);
  ok('a rename survives', ch4.some(c => c.label === 'Bedside lamp'));
  eq('binary input labels are not shifted', ch4.filter(c => c.label.startsWith('Input')).map(c => c.label), ['Input 2', 'Input 3']);
  ok('restart_required is not treated as an input', !ch4.some(c => c.entityId.includes('restart')));
  eq('an event-only channel is a button', ch3[0].kind, 'button');
  eq('a binary-only channel is a switch', ch4.find(c => c.label === 'Input 2').kind, 'switch');
  ok('input-only hardware pairs no output', ch4.every(c => c.output === undefined));

  console.log('\ndetectInputChannels — Plus 1PM (input wired to its relay)');
  const pm1 = byName(uni, 'Oven relay');
  const chPm = h.detectInputChannels(pm1, hass.states);
  eq('one channel', chPm.length, 1);
  eq('it is a switch-kind input', chPm[0].kind, 'switch');
  eq('paired with switch_0 by channel number', chPm[0].output, 'switch.oven_relay_switch_0');
  ok('the reboot button is never mistaken for an output', chPm[0].output !== 'button.oven_relay_reboot');

  console.log('\npress replay — shelly.click event pieces');
  const gen2Types = ['double_push', 'btn_up', 'triple_push', 'single_push', 'btn_down', 'long_push'];
  eq('Gen2 click types', h.shellyClickTypes(gen2Types), { single: 'single_push', double: 'double_push', long: 'long_push' });
  eq('Gen1 click types', h.shellyClickTypes(['single', 'double', 'long', 'single_long', 'long_single', 'triple']),
    { single: 'single', double: 'double', long: 'long' });
  eq('edges are never a press', h.shellyClickTypes(['btn_down', 'btn_up']), { single: undefined, double: undefined, long: undefined });
  eq('Gen2 unique_id is 0-based → Button N+1', h.shellyInputChannel('event.rofi_i_stofu_bordstofuljos', 2, '083AF2009EC0-input:1'), 2);
  eq('Gen1 unique_id already ends in the 1-based channel', h.shellyInputChannel('event.garage_switch_input_2', 1, 'AABBCC-sensor_1-2'), 2);
  eq('Gen2 entity id is 0-based', h.shellyInputChannel('event.shellyplusi4_083af2009ec0_input_3', 2), 4);
  eq('Gen1 entity id is 1-based', h.shellyInputChannel('event.shellyix3_aabbcc_input_3', 1), 3);
  eq('an unnumbered input is a single-input device', h.shellyInputChannel('event.shellyplus1_abcdef123456_input', 2), 1);
  eq('hostname from an un-renamed entity id',
    h.shellyHostname({ entities: [{ entity_id: 'event.rofi_i_stofu_ljos_stofa' }, { entity_id: 'sensor.shellyplusi4_083af2009ec0_rssi' }] }),
    'shellyplusi4-083af2009ec0');
  eq('Gen1 hostnames carry a 6-hex id', h.shellyHostname({ entities: [{ entity_id: 'sensor.shellyix3_a4cf12_rssi' }] }), 'shellyix3-a4cf12');
  eq('no hostname when every entity is renamed', h.shellyHostname({ entities: [{ entity_id: 'event.hall_switch_input_1' }] }), undefined);

  console.log('\nattachExtraSensors — readings lent by another device');
  const lend = Object.keys(hass.states).find(id => id.startsWith('sensor.') && hass.states[id].attributes?.device_class === 'temperature');
  ok('fixture has a temperature sensor to lend', !!lend);
  const lent = h.attachExtraSensors(uni, { [i4.device_id]: { extra_sensors: [lend, 'sensor.does_not_exist', lend] } }, hass);
  const i4b = lent.find(d => d.device_id === i4.device_id);
  eq('borrower gains exactly one entity (missing skipped, repeat not doubled)', i4b.entities.length, i4.entities.length + 1);
  const bor = i4b.entities.find(e => e.entity_id === lend);
  ok('borrowed entity is flagged with the lender\'s name', typeof bor.borrowed_from === 'string' && bor.borrowed_from.length > 0);
  eq('borrowed entity carries the live state', bor.state, hass.states[lend].state);
  ok('the original device object is untouched', !i4.entities.some(e => e.entity_id === lend));
  ok('devices that borrow nothing keep their reference', lent.find(d => d.device_id === i3.device_id) === i3);
  eq('no device_styles → same array back', h.attachExtraSensors(uni, undefined, hass), uni);
  ok('a borrowed reading reaches the gauge values', h.deviceSensorValues(i4b, hass.states).temperature != null);

  console.log('\ngauge rings follow the device');
  // Readings carry where they came from: a relay's only temperature is its own
  // board (diagnostic) at 45–65 °C, which must not share a room-temperature range.
  const prim = (v) => ({ value: v, diagnostic: false });
  const diag = (v) => ({ value: v, diagnostic: true });
  const wdVals = { temperature: prim(25.9), humidity: prim(37.6), illuminance: prim(5), signal_strength: prim(-60) };
  const wdRings = h.gaugeRings(wdVals, { accent: '#f00' });
  eq('one ring per reported class, in ring order', wdRings.map(r => r.key), ['temperature', 'humidity', 'illuminance']);
  eq('humidity range defaults to 0–100', [wdRings[1].min, wdRings[1].max], [0, 100]);
  eq('a configured range wins', h.gaugeRings(wdVals, { accent: '#f00', ranges: { temperature: { min: 15, max: 30 } } })[0].max, 30);
  eq('power takes the accent (flat), humidity its default gradient',
    h.gaugeRings({ power: prim(5), humidity: prim(1) }, { accent: '#f00' }).map(r => r.stops), [['#f00'], ['#fde68a', '#2dd4bf', '#0ea5e9']]);
  eq('a room sensor keeps the −10…40 °C range', [wdRings[0].min, wdRings[0].max], [-10, 40]);
  eq("a relay's board temperature gets the 0–100 range instead",
    (r => [r.min, r.max, +r.pct.toFixed(2)])(h.gaugeRings({ temperature: diag(52) }, { accent: '#f00' })[0]), [0, 100, 0.52]);
  eq('a configured range still wins over both',
    h.gaugeRings({ temperature: diag(52) }, { accent: '#f00', ranges: { temperature: { min: 40, max: 80 } } })[0].max, 80);
  eq('temperature runs blue → yellow → red by default', wdRings[0].stops, ['#38bdf8', '#fde047', '#f87171']);
  eq('a flat graph_sensor_colors entry overrides the gradient',
    h.gaugeRings(wdVals, { accent: '#f00', colors: { temperature: '#123456' } })[0].stops, ['#123456']);
  eq('gauge_gradients wins over everything',
    h.gaugeRings(wdVals, { accent: '#f00', colors: { temperature: '#123456' }, gradients: { temperature: ['#000000', '#ffffff'] } })[0].stops, ['#000000', '#ffffff']);
  eq('colorAt blends between stops', h.colorAt(['#000000', '#ffffff'], 0.5), '#808080');
  eq('hex ↔ hsv round-trips', h.hsvToHex(h.hexToHsv('#f4601e').h, h.hexToHsv('#f4601e').s, h.hexToHsv('#f4601e').v), '#f4601e');
  eq('pure red is hue 0, full sat and value', h.hexToHsv('#ff0000'), { h: 0, s: 1, v: 1 });
  eq('hsv → hex for cyan', h.hsvToHex(180, 1, 1), '#00ffff');
  eq('grey has no saturation', h.hexToHsv('#808080').s, 0);
  eq('colorAt at the ends', [h.colorAt(['#000000', '#ffffff'], 0), h.colorAt(['#000000', '#ffffff'], 1)], ['#000000', '#ffffff']);
  eq('colorAt with three stops picks the middle at 0.5', h.colorAt(['#38bdf8', '#fde047', '#f87171'], 0.5), '#fde047');
  ok('the label colour is the gradient at the reading', wdRings[0].color === h.colorAt(wdRings[0].stops, wdRings[0].pct));
  eq('capped at four rings', h.gaugeRings({ power: prim(1), voltage: prim(2), current: prim(3), temperature: prim(4), humidity: prim(5) }, { accent: '#f00' }).length, 4);
  // Hand-written YAML puts scalars where lists belong; a throw here would take
  // the whole card's render down.
  eq('a scalar gauge_gradients entry is ignored, not thrown on',
    h.gaugeRings(wdVals, { accent: '#f00', gradients: { temperature: '#38bdf8' } })[0].stops, ['#38bdf8', '#fde047', '#f87171']);
  eq('a one-stop gradient is not a gradient', h.gaugeStops('temperature', { accent: '#f00', gradients: { temperature: ['#123456'] } }), ['#38bdf8', '#fde047', '#f87171']);
  eq('gaugeStops is what the editor and the tile share', h.gaugeStops('power', { accent: '#f00' }), ['#f00']);
  const wd = { entities: [
    { entity_id: 'sensor.d_temp', domain: 'sensor' },
    { entity_id: 'sensor.d_hum', domain: 'sensor' },
    { entity_id: 'sensor.d_devtemp', domain: 'sensor', entity_category: 'diagnostic' },
  ] };
  const wdSt = {
    'sensor.d_temp':    { state: '25.9', attributes: { device_class: 'temperature' } },
    'sensor.d_hum':     { state: '37.6', attributes: { device_class: 'humidity' } },
    'sensor.d_devtemp': { state: '48',   attributes: { device_class: 'temperature' } },
  };
  eq('first non-diagnostic reading per class', h.deviceSensorValues(wd, wdSt),
    { temperature: { value: 25.9, diagnostic: false }, humidity: { value: 37.6, diagnostic: false } });
  eq('a diagnostic reading stands in only when nothing else reports the class, and says so',
    h.deviceSensorValues({ entities: [wd.entities[2]] }, wdSt), { temperature: { value: 48, diagnostic: true } });

  console.log('\ncolour parsing — the wheel must not eat an alpha');
  eq('rgba keeps its alpha', h.parseCssColor('rgba(255, 244, 232, 0.035)'), { hex: '#fff4e8', alpha: 0.035 });
  eq('plain hex is opaque', h.parseCssColor('#f4601e'), { hex: '#f4601e', alpha: 1 });
  eq('short hex expands', h.parseCssColor('#abc'), { hex: '#aabbcc', alpha: 1 });
  eq('8-digit hex carries alpha', h.parseCssColor('#ff000080').alpha > 0.49, true);
  eq('transparent is not a colour', h.parseCssColor('transparent'), null);
  eq('a CSS var is not a colour', h.parseCssColor('var(--accent)'), null);
  eq('an alpha survives a round trip', h.withAlpha(h.parseCssColor('rgba(255, 244, 232, 0.035)').hex, 0.035), 'rgba(255, 244, 232, 0.035)');
  eq('full alpha stays a plain hex', h.withAlpha('#f4601e', 1), '#f4601e');

  console.log('\nmigrateConfig — a pinned layout keeps its media controls');
  const pinned = h.migrateConfig({ tile_layout: ['name_row', 'delegated_controls', 'badges'] });
  eq('media_controls is inserted before the old block', pinned.tile_layout, ['name_row', 'media_controls', 'delegated_controls', 'badges']);
  eq('a layout that already has it is untouched',
    h.migrateConfig({ tile_layout: ['media_controls', 'delegated_controls'] }).tile_layout, ['media_controls', 'delegated_controls']);
  eq('row-form layouts are repaired too',
    h.migrateConfig({ tile_layout: [['name_row'], ['delegated_controls', 'badges']] }).tile_layout,
    [['name_row'], ['media_controls', 'delegated_controls', 'badges']]);
  eq('a device style layout is repaired',
    h.migrateConfig({ device_styles: { abc: { tile_layout: ['delegated_controls'] } } }).device_styles.abc.tile_layout,
    ['media_controls', 'delegated_controls']);
  ok('a config with no layouts is returned unchanged',
    (c => h.migrateConfig(c) === c)({ tile_layout: ['name_row', 'sensors'] }));

  console.log('\ndeviceRelevance — media player');
  const radio = { entities: [{ entity_id: 'media_player.display', domain: 'media_player', attributes: {} }, { entity_id: 'switch.display', domain: 'switch', attributes: {} }] };
  const relM = h.deviceRelevance(radio, {});
  ok('a media player offers the card\'s own media block', relM.blocks.has('media_controls'));
  ok('and is no longer a delegated (native) control', !relM.blocks.has('delegated_controls'));
  eq('delegatableEntities skips media players', h.delegatableEntities(radio).length, 0);

  console.log('\ndeviceRelevance');
  const rel4 = h.deviceRelevance(i4, hass.states);
  ok('no energy controls for a switch that meters nothing', !rel4.hasEnergy);
  ok('offers the input_channels block', rel4.blocks.has('input_channels'));
  ok('does not offer power_bar', !rel4.blocks.has('power_bar'));
  ok('does not offer dimmer', !rel4.blocks.has('dimmer'));
  const relD = h.deviceRelevance(dimmer, hass.states);
  ok('a dimmer does offer energy', relD.hasEnergy);
  ok('a dimmer offers the dimmer block', relD.blocks.has('dimmer'));

  console.log('\ntile layout utilities');
  const flat = ['name_row', 'sensors', 'graph'];
  eq('flat → rows → flat round-trips', h.flattenTileLayout(h.normalizeTileLayout(flat)), flat);
  const rows = [['name_row', 'sensors'], ['graph']];
  eq('side-by-side rows survive normalise', h.normalizeTileLayout(rows), rows);
  const hidden = h.setBlockInLayout(rows, 'graph', false, flat);
  ok('hiding a block keeps the paired row intact',
    JSON.stringify(hidden).includes('["name_row","sensors"]'), JSON.stringify(hidden));

  console.log('\nmigrateConfig');
  const preset = { ...h.PROFILE_LABELS && {} };
  void preset;
  const themes = createRequire(import.meta.url)(join(process.cwd(), OUT, 'themes.js'));
  const full = { theme: 'frosted_light', style: { ...themes.THEME_PRESETS.frosted_light } };
  const migrated = h.migrateConfig(full);
  ok('a materialised palette collapses to the theme name',
    !migrated.style || Object.keys(migrated.style).length === 0, JSON.stringify(migrated.style));
  eq('the theme name survives', migrated.theme, 'frosted_light');
  const partial = { theme: 'frosted_light', style: { accent_color: '#ff0000' } };
  eq('a genuine override is left alone', h.migrateConfig(partial).style, { accent_color: '#ff0000' });
  eq('legacy graph keys normalise', h.migrateConfig({ graph_sensors: ['co2', 'rssi'] }).graph_sensors,
    ['carbon_dioxide', 'signal_strength']);
  console.log('\ndiscovery scoping');
  const all = h.getAllDevices(hass, { universal: true, scope: 'all' });
  const real = h.getAllDevices(hass, { universal: true, scope: 'devices' });
  const ctrl = h.getAllDevices(hass, { universal: true, scope: 'controllable' });
  ok('scope=all keeps a device with only an update entity', !!byName(all, 'Bare device'));
  ok('scope=devices drops it', !byName(real, 'Bare device'));
  ok('scope=controllable keeps the Hue lamp', !!byName(ctrl, 'Hue lamp'));
  ok('scope=controllable drops a sensor-only device', !byName(ctrl, 'Tuya BLE'));

  console.log('\nintegration deny-list');
  ok('a phone is dropped by the built-in deny-list', !byName(all, 'Pixel'));
  const forced = h.getAllDevices(hass, { universal: true, scope: 'all', includeIntegrations: ['mobile_app'] });
  ok('include_integrations forces it back', !!byName(forced, 'Pixel'));
  const banned = h.getAllDevices(hass, { universal: true, scope: 'all', excludeIntegrations: ['hue'] });
  ok('exclude_integrations drops an allowed one', !byName(banned, 'Hue lamp'));

  console.log('\ndomain filters');
  const noLights = h.getAllDevices(hass, { universal: true, scope: 'all', excludeDomains: ['light'] });
  ok('exclude_domains removes the entities', !byName(noLights, 'Hue lamp'));
  const onlyLights = h.getAllDevices(hass, { universal: true, scope: 'all', includeDomains: ['light'] });
  ok('include_domains restricts to those domains', !byName(onlyLights, 'Bedroom switch'));
  const both = h.getAllDevices(hass, {
    universal: true, scope: 'all', includeDomains: ['light'], excludeDomains: ['light'],
  });
  ok('excluding beats including for a domain in both lists', !byName(both, 'Hue lamp'));

  console.log('\nhidden entities');
  ok('a hidden entity is not collected',
    !byName(all, 'Bedroom dimmer').entities.some(e => e.entity_id === 'sensor.dimmer_hidden'));

  console.log('\nShelly mode vendor filtering');
  ok('BTHome from another vendor is dropped in Shelly mode', !byName(shelly, 'Tuya BLE'));
  ok('…but kept in universal mode', !!byName(all, 'Tuya BLE'));

  console.log('\ngetDeviceProfile');
  eq('i3 is an input device', h.getDeviceProfile(byName(all, 'Garage switch')).type, 'input');
  eq('i4 is an input device', h.getDeviceProfile(byName(all, 'Bedroom switch')).type, 'input');
  eq('a Dimmer 2 is a dimmer', h.getDeviceProfile(byName(all, 'Bedroom dimmer')).type, 'dimmer');
  eq('a Hue lamp is a dimmer-ish light', h.getDeviceProfile(byName(all, 'Hue lamp')).type, 'dimmer');

  console.log('\nper-profile tables are complete');
  const profiles = Object.keys(h.PROFILE_LABELS);
  const noBlocks = profiles.filter(p => !h.PROFILE_DEFAULT_BLOCKS[p]);
  ok('every profile has a default block order', noBlocks.length === 0, noBlocks.join(', '));
  // An absent entry is the documented "show all chips" signal, so absence is
  // fine — what matters is that every listed set uses real chip keys.
  const chipVocab = new Set(['power', 'voltage', 'current', 'energy', 'frequency', 'apparent_power',
    'reactive_power', 'power_factor', 'temperature', 'humidity', 'illuminance', 'co2', 'gas',
    'battery', 'cloud', 'mqtt', 'eth', 'rssi', 'uptime', 'ip', 'ssid', 'fw_version', 'mac',
    'overtemp', 'overpower', 'motion', 'door', 'flood', 'smoke', 'vibration']);
  const strayChips = [...new Set(Object.values(h.PROFILE_DEFAULT_SENSORS).flat())].filter(c => !chipVocab.has(c));
  ok('profile chip defaults use real chip keys', strayChips.length === 0, strayChips.join(', '));
  ok('the show-all profiles have no entry',
    !('generic' in h.PROFILE_DEFAULT_SENSORS) && !('media' in h.PROFILE_DEFAULT_SENSORS));

  console.log('\ndeviceChipKeys');
  const keysI4 = [...h.deviceChipKeys(byName(all, 'Bedroom switch'))].sort();
  eq('i4 produces exactly its diagnostics', keysI4, ['cloud', 'uptime']);
  const keysDim = [...h.deviceChipKeys(byName(all, 'Bedroom dimmer'))].sort();
  ok('a dimmer produces power and energy', keysDim.includes('power') && keysDim.includes('energy'));

  // ── cascades ───────────────────────────────────────────────────────────────
  // These used to be methods on the card element, untestable without a DOM —
  // which is how the renderer and the Customize panel came to resolve blocks
  // differently without anyone noticing.
  const dev = byName(all, 'Bedroom dimmer');
  const cin = (config, view) => ({ config, device: dev, profile: 'dimmer', view });

  console.log('\ncascade — tile style precedence');
  eq('card-wide is the floor', cas.rawTileStyle(cin({ tile_style: 'sensor-card' })), 'sensor-card');
  eq('a view beats the card', cas.rawTileStyle(cin(
    { tile_style: 'sensor-card' }, { id: 'v', name: 'V', tile_style: 'cover-control' })), 'cover-control');
  eq('a room beats a view', cas.rawTileStyle(cin(
    { tile_style: 'sensor-card', area_styles: { Bedroom: { tile_style: 'power-monitor' } } },
    { id: 'v', name: 'V', tile_style: 'cover-control' })), 'power-monitor');
  eq('a device type beats a room', cas.rawTileStyle(cin(
    { area_styles: { Bedroom: { tile_style: 'power-monitor' } }, profile_styles: { dimmer: { tile_style: 'light-control' } } })),
    'light-control');
  eq('the device itself wins', cas.rawTileStyle(cin({
    profile_styles: { dimmer: { tile_style: 'light-control' } },
    device_styles: { dimmer: { tile_style: 'scene-button' } },
  })), 'scene-button');
  eq('smart styles apply when nothing is set',
    cas.rawTileStyle(cin({ smart_tile_styles: true })), 'light-control');
  eq('but a card-wide style masks them (documented, and the trap people hit)',
    cas.rawTileStyle(cin({ smart_tile_styles: true, tile_style: 'default' })), 'default');

  console.log('\ncascade — blocks');
  const blocksOf = (config) => JSON.stringify(cas.blockLayout(cin(config)));
  ok('falls back to the profile default',
    blocksOf({}) === JSON.stringify(h.PROFILE_DEFAULT_BLOCKS.dimmer));
  eq('a card-wide layout applies', cas.blockLayout(cin({ tile_layout: ['name_row'] })), ['name_row']);
  eq('a saved style outranks the card-wide layout — the bug that made custom styles do nothing',
    cas.blockLayout(cin({
      tile_layout: ['name_row'],
      tile_style: 'custom:mine',
      custom_styles: { mine: { base: 'default', tile_layout: ['sensors'] } },
    })), ['sensors']);
  eq('a style preset outranks it too', cas.blockLayout(cin({
    tile_layout: ['name_row'], style_presets: { default: { tile_layout: ['graph'] } },
  })), ['graph']);
  eq('the device still wins', cas.blockLayout(cin({
    tile_layout: ['name_row'], device_styles: { dimmer: { tile_layout: ['badges'] } },
  })), ['badges']);

  console.log('\ncascade — chips, graphs, energy, columns');
  eq('an explicit [] means no chips and stops the cascade',
    cas.sensorSelection(cin({ sensors: ['power'], device_styles: { dimmer: { sensors: [] } } })), []);
  eq('unset falls through to the profile default',
    cas.sensorSelection(cin({})), h.PROFILE_DEFAULT_SENSORS.dimmer);
  eq('graphs default off (opt-in)', cas.showGraphs(cin({})), false);
  eq('a room can turn graphs off', cas.showGraphs(cin({ area_styles: { Bedroom: { show_graphs: false } } })), false);
  eq('a device overrides its room', cas.showGraphs(cin({
    area_styles: { Bedroom: { show_graphs: false } }, device_styles: { dimmer: { show_graphs: true } },
  })), true);
  eq('energy defaults to lifetime total', cas.energyPeriod(cin({})), 'total');
  eq('a view sets the energy window',
    cas.energyPeriod(cin({}, { id: 'v', name: 'V', energy_period: 'week' })), 'week');
  eq('a device type sets it too',
    cas.energyPeriod(cin({ profile_styles: { dimmer: { energy_period: 'today' } } })), 'today');
  eq('columns: room beats view beats card',
    [cas.columnsFor({ columns: 3 }, undefined, undefined),
      cas.columnsFor({ columns: 3 }, { columns: 4 }, undefined),
      cas.columnsFor({ columns: 3 }, { columns: 4 }, { columns: 5 })], [3, 4, 5]);

  console.log('\ncascade — theme');
  eq('nothing set: the card theme stands',
    cas.themeFor({ theme: 'warm_dusk' }, undefined, undefined), 'warm_dusk');
  eq('a view re-bases the palette',
    cas.themeFor({ theme: 'warm_dusk' }, { theme: 'midnight_purple' }, undefined), 'midnight_purple');
  eq('a room beats the view',
    cas.themeFor({ theme: 'warm_dusk' }, { theme: 'midnight_purple' }, { theme: 'nordic_warm' }), 'nordic_warm');
  eq('a room theme alone beats the card',
    cas.themeFor({ theme: 'warm_dusk' }, undefined, { theme: 'nordic_warm' }), 'nordic_warm');
  eq('no theme anywhere is undefined, not a default',
    cas.themeFor({}, undefined, undefined), undefined);
  // 'custom' means "the colours in the card's `style` ARE the palette" — a card-level
  // idea. A view/room carries no `style`, so it must fall through, not blank out.
  eq("a view's 'custom' falls through to the card",
    cas.themeFor({ theme: 'warm_dusk' }, { theme: 'custom' }, undefined), 'warm_dusk');
  eq("a room's 'custom' falls through to the view",
    cas.themeFor({ theme: 'warm_dusk' }, { theme: 'midnight_purple' }, { theme: 'custom' }), 'midnight_purple');
  eq('the card may still be custom itself',
    cas.themeFor({ theme: 'custom' }, undefined, undefined), 'custom');
  eq('overrideTheme reports only what is BELOW the card',
    [cas.overrideTheme(undefined, undefined),
      cas.overrideTheme({ theme: 'midnight_purple' }, undefined),
      cas.overrideTheme(undefined, { theme: 'nordic_warm' }),
      cas.overrideTheme({ theme: 'custom' }, undefined)],
    [undefined, 'midnight_purple', 'nordic_warm', undefined]);

  console.log('\ncascade - family ladders (uniform within a family)');
  // Tile family: device -> type -> room -> view -> card, for every option in it.
  eq('blocks: a room now has a layer (it had none)',
    cas.blockLayout(cin({ tile_layout: ['name_row'], area_styles: { Bedroom: { tile_layout: ['sensors'] } } })), ['sensors']);
  eq('blocks: a view now has a layer too',
    cas.blockLayout(cin({ tile_layout: ['name_row'] }, { id: 'v', name: 'V', tile_layout: ['graph'] })), ['graph']);
  eq('blocks: the room still beats the view',
    cas.blockLayout(cin({ area_styles: { Bedroom: { tile_layout: ['sensors'] } } },
      { id: 'v', name: 'V', tile_layout: ['graph'] })), ['sensors']);
  eq('blocks: the device beats them both',
    cas.blockLayout(cin({ area_styles: { Bedroom: { tile_layout: ['sensors'] } },
      device_styles: { dimmer: { tile_layout: ['badges'] } } }, { id: 'v', name: 'V', tile_layout: ['graph'] })), ['badges']);
  eq('chips: a view now has a layer',
    cas.sensorSelection(cin({ sensors: ['power'] }, { id: 'v', name: 'V', sensors: ['voltage'] })), ['voltage']);
  eq('chips: the room still beats the view',
    cas.sensorSelection(cin({ area_styles: { Bedroom: { sensors: ['current'] } } },
      { id: 'v', name: 'V', sensors: ['voltage'] })), ['current']);
  eq("chips: a view's explicit [] stops the cascade like any other layer",
    cas.sensorSelection(cin({ sensors: ['power'] }, { id: 'v', name: 'V', sensors: [] })), []);
  eq('graphs: a view now has a layer',
    cas.showGraphs(cin({ show_graphs: false }, { id: 'v', name: 'V', show_graphs: true })), true);
  eq('graphs: the room still beats the view',
    cas.showGraphs(cin({ area_styles: { Bedroom: { show_graphs: false } } },
      { id: 'v', name: 'V', show_graphs: true })), false);

  // A tile paints its own palette only when the device or its TYPE sets one.
  eq('tile theme: nothing set means no work for the renderer',
    cas.tileTheme(cin({ theme: 'nordic_warm', area_styles: { Bedroom: { theme: 'brutalist' } } })), undefined);
  eq('tile theme: a device sets one',
    cas.tileTheme(cin({ device_styles: { dimmer: { theme: 'brutalist' } } })), 'brutalist');
  eq('tile theme: a device TYPE sets one',
    cas.tileTheme(cin({ profile_styles: { dimmer: { theme: 'teal_terminal' } } })), 'teal_terminal');
  eq('tile theme: the device beats its type',
    cas.tileTheme(cin({ device_styles: { dimmer: { theme: 'brutalist' } }, profile_styles: { dimmer: { theme: 'teal_terminal' } } })), 'brutalist');
  eq("tile theme: 'custom' is not an override here either",
    cas.tileTheme(cin({ device_styles: { dimmer: { theme: 'custom' } }, profile_styles: { dimmer: { theme: 'teal_terminal' } } })), 'teal_terminal');

  // Container family: room -> view -> card. No device layer, by design.
  eq('tile size: room beats view beats card',
    [cas.tileSizeFor({ tile_size: 'sm' }, undefined, undefined),
      cas.tileSizeFor({ tile_size: 'sm' }, { id: 'v', name: 'V', tile_size: 'md' }, undefined),
      cas.tileSizeFor({ tile_size: 'sm' }, { id: 'v', name: 'V', tile_size: 'md' }, { tile_size: 'lg' })],
    ['sm', 'md', 'lg']);
  eq('tile size: unset anywhere is md', cas.tileSizeFor({}, undefined, undefined), 'md');
  eq('tile gap: room beats view beats card',
    [cas.tileGapFor({ style: { tile_gap: 4 } }, undefined, undefined),
      cas.tileGapFor({ style: { tile_gap: 4 } }, { id: 'v', name: 'V', tile_gap: 8 }, undefined),
      cas.tileGapFor({ style: { tile_gap: 4 } }, { id: 'v', name: 'V', tile_gap: 8 }, { tileGap: 12 })],
    [4, 8, 12]);
  eq('tile gap: unset anywhere is undefined, not a number',
    cas.tileGapFor({}, undefined, undefined), undefined);

  console.log('\ndesign scope - what each rung may set');
  const sG = { kind: 'global' }, sV = { kind: 'view', id: 'v' }, sR = { kind: 'room', name: 'Bedroom' },
        sT = { kind: 'type', profile: 'dimmer' }, sD = { kind: 'device', id: 'dimmer' };
  eq('tile family reaches every rung',
    [sG, sV, sR, sT, sD].map(s => ds.scopeCanSet(s, 'tile')), [true, true, true, true, true]);
  eq('container stops at the room - a device has no grid',
    [sG, sV, sR, sT, sD].map(s => ds.scopeCanSet(s, 'container')), [true, true, true, false, false]);
  eq('chrome stops at the view - a room has no card header',
    [sG, sV, sR, sT, sD].map(s => ds.scopeCanSet(s, 'chrome')), [true, true, false, false, false]);
  ok('an unavailable family explains itself', !!ds.whyUnavailable(sD, 'container'));
  eq('an available one has nothing to explain', ds.whyUnavailable(sR, 'container'), undefined);

  console.log('\ndesign scope - keys survive a round trip');
  eq('every kind round-trips', [sG, sV, sR, sT, sD].map(s => ds.scopeKey(s)),
    ['global', 'view:v', 'room:Bedroom', 'type:dimmer', 'device:dimmer']);
  const known = { views: ['v'], rooms: ['Bedroom'], types: ['dimmer'], devices: ['dimmer'] };
  eq('a known key parses back', ds.parseScopeKey('room:Bedroom', known), sR);
  // A persisted scope outlives what it names; reopening onto a deleted device
  // would show controls writing into nothing.
  eq('a room that no longer exists falls back to global',
    ds.parseScopeKey('room:Attic', known), sG);
  eq('a device that no longer exists falls back to global',
    ds.parseScopeKey('device:gone', known), sG);
  eq('junk falls back to global', ds.parseScopeKey('nonsense', known), sG);
  eq('nothing stored falls back to global', ds.parseScopeKey(null, known), sG);

  console.log('\ndesign scope - grouping the picker');
  const devs = [
    { device_id: 'a', name: 'Zeta lamp', area: 'Bedroom', integration: 'shelly' },
    { device_id: 'b', name: 'Alpha lamp', area: 'Bedroom', integration: 'hue' },
    { device_id: 'c', name: 'Hall relay', area: '', integration: 'shelly' },
  ];
  const prof = (d) => (d.device_id === 'c' ? 'relay' : 'dimmer');
  const byRoom = ds.groupDevices(devs, 'room', prof);
  eq('rooms group and sort, devices sorted inside',
    byRoom.map(g => [g.label, g.devices.map(d => d.name)]),
    [['Bedroom', ['Alpha lamp', 'Zeta lamp']], ['No room', ['Hall relay']]]);
  eq('the empty area keeps its real key, not its label',
    byRoom.find(g => g.label === 'No room').scope, { kind: 'room', name: '' });
  eq('a room heading selects the room scope',
    byRoom[0].scope, { kind: 'room', name: 'Bedroom' });
  eq('a type heading selects the type scope',
    ds.groupDevices(devs, 'type', prof).map(g => g.scope),
    [{ kind: 'type', profile: 'dimmer' }, { kind: 'type', profile: 'relay' }]);
  // Integration is a real property but not a rung, so its heading selects nothing.
  eq('integration grouping is browse-only',
    ds.groupDevices(devs, 'integration', prof).map(g => g.scope), [undefined, undefined]);

  console.log('\ndesign scope - where a scope writes');
  const cfg = { theme: 'nordic_warm', area_styles: { Bedroom: { theme: 'brutalist', columns: 2 } },
                device_styles: { a: { color: '#fff' } }, views: [{ id: 'v', name: 'V', theme: 'ha' }] };
  eq('a room block is found', ds.scopeBlock(cfg, sR).theme, 'brutalist');
  eq('a view block is found', ds.scopeBlock(cfg, sV).theme, 'ha');
  eq('an untouched scope has no block', ds.scopeBlock(cfg, sT), undefined);
  eq('override counts drive the "n set here" badge',
    ds.overrideCount(cfg, sR, ['theme', 'columns', 'sensors']), 2);
  eq('a scope with nothing set counts zero',
    ds.overrideCount(cfg, sT, ['theme', 'columns']), 0);

  console.log('\ndesign scope - what have I customised?');
  const pal = { accent_color: '#c98a63', card_bg: '#1e1a17', text_primary: '#ece5dc' };
  eq('a bare card has changed nothing', ds.collectOverrides({}, pal).length, 0);
  // A themed card must not report a permanent "change" just for having a theme.
  eq('palette keys equal to the theme are not changes',
    ds.collectOverrides({ theme: 'warm_dusk', style: { accent_color: '#c98a63' } }, pal).length, 0);
  eq('a palette key that differs IS a change',
    ds.collectOverrides({ theme: 'warm_dusk', style: { accent_color: '#ff0000' } }, pal)
      .map(o => [o.key, o.palette]), [['accent_color', true]]);
  // Radius/fonts/header geometry are in `style` but no theme sets them, so they
  // are always a deliberate change rather than a palette override.
  eq('a non-palette style key is a change, and not a palette one',
    ds.collectOverrides({ style: { tile_radius: 14 } }, pal).map(o => [o.key, !!o.palette]),
    [['tile_radius', false]]);
  eq('every scope is walked', ds.collectOverrides({
    columns: 4,
    views: [{ id: 'v', name: 'V', theme: 'ha' }],
    area_styles: { Bedroom: { columns: 2, theme: 'brutalist' } },
    profile_styles: { dimmer: { tile_style: 'light-control' } },
    device_styles: { a: { color: '#fff' } },
  }, pal).map(o => ds.scopeKey(o.scope) + '/' + o.key).sort(),
    ['device:a/color', 'global/columns', 'room:Bedroom/columns', 'room:Bedroom/theme',
      'type:dimmer/tile_style', 'view:v/theme']);
  eq('the card theme itself is not counted as an override',
    ds.collectOverrides({ theme: 'nordic_warm' }, pal).length, 0);
  ok('the key list is shared, not copied',
    ds.ALL_DESIGN_KEYS.includes('theme') && ds.ALL_DESIGN_KEYS.includes('columns')
    && ds.ALL_DESIGN_KEYS.includes('style'));

  // confirm_off is device-only: it must count towards the device badge, the
  // Changes panel and Reset all, and must NOT be offered at any other scope.
  ok('confirm_off is a device-only key', ds.DEVICE_ONLY_KEYS.includes('confirm_off'));
  ok('a device scope can hold confirm_off',
    ds.keysForScope({ kind: 'device', id: 'a' }).includes('confirm_off'));
  ok('a room scope cannot',
    !ds.keysForScope({ kind: 'room', name: 'Bedroom' }).includes('confirm_off'));
  eq('confirm_off shows up in the Changes panel',
    ds.collectOverrides({ device_styles: { a: { confirm_off: true } } }, pal)
      .map(o => ds.scopeKey(o.scope) + '/' + o.key),
    ['device:a/confirm_off']);
  eq('and in the "n set here" badge',
    ds.overrideCount({ device_styles: { a: { confirm_off: true } } },
      { kind: 'device', id: 'a' }, ds.keysForScope({ kind: 'device', id: 'a' })), 1);

  console.log('\ncascade — embedded chrome cards (view → card)');
  const A = [{ type: 'markdown', content: 'a' }];
  const B = [{ type: 'markdown', content: 'b' }];
  const view = (extra) => ({ id: 'v', name: 'V', ...extra });
  eq('unset anywhere is undefined', cas.chromeCards({}, undefined, 'header_cards'), undefined);
  eq('the card-wide list is the fallback',
    cas.chromeCards({ header_cards: A }, view({}), 'header_cards'), A);
  eq('a view replaces it, it does not append',
    cas.chromeCards({ header_cards: A }, view({ header_cards: B }), 'header_cards'), B);
  // The reason replace beats append: it is the only way a view can say "none".
  eq('an empty list on a view means none here',
    cas.chromeCards({ header_cards: A }, view({ header_cards: [] }), 'header_cards'), []);
  eq('header and footer do not cross',
    cas.chromeCards({ header_cards: A, footer_cards: B }, view({ header_cards: B }), 'footer_cards'), B);
  eq('with no active view the card-wide list stands',
    cas.chromeCards({ footer_cards: A }, undefined, 'footer_cards'), A);
  // They cascade like chrome but they are not a *look*: they hold cards the user
  // authored. As design keys, the Changes panel's "Reset all" deleted them.
  ok('the card lists are not design keys',
    !ds.DESIGN_KEYS.chrome.includes('header_cards') && !ds.DESIGN_KEYS.chrome.includes('footer_cards'));

  eq('embedded cards use HA\'s theme by default', cas.extraCardStyle({}, undefined), 'ha');
  eq('the card can ask them to match it',
    cas.extraCardStyle({ extra_card_style: 'match' }, undefined), 'match');
  eq('a view overrides the card',
    cas.extraCardStyle({ extra_card_style: 'match' }, view({ extra_card_style: 'ha' })), 'ha');
  eq('and can opt in on its own',
    cas.extraCardStyle({}, view({ extra_card_style: 'match' })), 'match');
  ok('it is a chrome-family design key', ds.DESIGN_KEYS.chrome.includes('extra_card_style'));

  eq('room cards sit above the tiles by default', cas.areaCardPlacement({}, undefined), 'above');
  eq('the card can move them into the grid',
    cas.areaCardPlacement({ area_card_placement: 'grid' }, undefined), 'grid');
  eq('a view overrides the card',
    cas.areaCardPlacement({ area_card_placement: 'grid' }, view({ area_card_placement: 'above' })), 'above');
  ok('placement is a chrome-family design key',
    ds.DESIGN_KEYS.chrome.includes('area_card_placement'));
  eq('how they are painted shows up in the Changes panel',
    ds.collectOverrides({ views: [view({ extra_card_style: 'match' })] }, pal)
      .map(o => ds.scopeKey(o.scope) + '/' + o.key),
    ['view:v/extra_card_style']);
  // "Reset all" walks collectOverrides and clears every key it returns, so a
  // list appearing here is a list about to be deleted.
  eq('the cards themselves never do', ds.collectOverrides({
    header_cards: A, views: [view({ header_cards: B, footer_cards: A })],
  }, pal).length, 0);

  console.log('\ncascade — elements');
  eq('unset elements are shown', cas.elementVisible(cin({}), 'toggle'), true);
  eq('a preset can hide one', cas.elementVisible(cin({
    tile_style: 'power-monitor', style_presets: { 'power-monitor': { elements: { toggle: false } } },
  }), 'toggle'), false);
  eq('a view overrides the preset', cas.elementVisible(cin({
    tile_style: 'power-monitor', style_presets: { 'power-monitor': { elements: { toggle: false } } },
  }, { id: 'v', name: 'V', elements: { toggle: true } }), 'toggle'), true);
  eq('the device overrides everything', cas.elementVisible(cin({
    tile_style: 'power-monitor',
    style_presets: { 'power-monitor': { elements: { toggle: true } } },
    device_styles: { dimmer: { elements: { toggle: false } } },
  }, { id: 'v', name: 'V', elements: { toggle: true } }), 'toggle'), false);
  // Opt-in defaults come from STYLE_ELEMENTS (def: false), not from call sites —
  // a renderer that forgets a literal cannot flip the default for everyone.
  eq('header_chips defaults OFF via STYLE_ELEMENTS',
    cas.elementVisible(cin({ tile_style: 'power-monitor' }), 'header_chips'), false);
  eq('elementDefault reads the table', cas.elementDefault('power-monitor', 'header_chips'), false);
  eq('elementDefault falls back to shown', cas.elementDefault('power-monitor', 'toggle'), true);
  // Every style that draws a primary on/off button must offer the element that
  // hides it, or the button is the one control the editor cannot reach.
  for (const style of ['default', 'power-monitor', 'light-control']) {
    ok(`${style} can hide its on/off button`,
      (h.STYLE_ELEMENTS[style] ?? []).some(e => e.id === 'toggle'));
    eq(`${style}'s on/off button is shown by default`,
      cas.elementDefault(style, 'toggle'), true);
  }
  eq('and it can be hidden per device', cas.elementVisible(cin({
    tile_style: 'light-control', device_styles: { dimmer: { elements: { toggle: false } } },
  }), 'toggle'), false);
  eq('a layer can still opt in', cas.elementVisible(cin({
    tile_style: 'power-monitor',
    device_styles: { dimmer: { elements: { header_chips: true } } },
  }), 'header_chips'), true);

  console.log('\ncascade — legacy aliases');
  eq('hero remaps to a power-monitor variant', cas.resolveStyle('hero'), { style: 'power-monitor', variant: 'big-number' });
  eq('ring remaps to the gauge', cas.resolveStyle('ring'), { style: 'power-monitor', variant: 'gauge' });
  eq('command remaps to the scene button', cas.resolveStyle('command'), { style: 'scene-button', variant: 'big-number' });
  eq('a missing custom style falls back to default',
    cas.resolveCustomStyle({}, 'custom:gone').base, 'default');

  // ── needs attention ────────────────────────────────────────────────────────
  console.log('\nattention — what gets flagged');
  const D = (name, entities, sw) => ({ device_id: name, name, area: 'Hall', sw_version: sw, entities });
  const E = (entity_id, domain) => ({ entity_id, domain });
  const S = {
    'sensor.a_batt': { state: '9', attributes: { device_class: 'battery' } },
    'sensor.b_batt': { state: '80', attributes: { device_class: 'battery' } },
    'binary_sensor.c_overtemp': { state: 'on', attributes: { device_class: 'heat' } },
    'sensor.c_power': { state: '5', attributes: { device_class: 'power' } },
    'update.d_fw': { state: 'on', attributes: { installed_version: '1.7.5', latest_version: '2.0.0' } },
    'sensor.d_power': { state: '1', attributes: {} },
    'sensor.e_power': { state: 'unavailable', attributes: {} },
    // an offline device that also has a stale alert reading
    'binary_sensor.e_overtemp': { state: 'on', attributes: { device_class: 'heat' } },
  };
  S['binary_sensor.e_overtemp'].state = 'unavailable';

  const lowBatt = D('Flat battery', [E('sensor.a_batt', 'sensor')], '1.7.5');
  const fine = D('Healthy', [E('sensor.b_batt', 'sensor')], '1.7.5');
  const hot = D('Overheating', [E('binary_sensor.c_overtemp', 'binary_sensor'), E('sensor.c_power', 'sensor')], '2.0.0');
  const old_fw = D('Needs update', [E('update.d_fw', 'update'), E('sensor.d_power', 'sensor')], '1.7.5');
  const gone = D('Offline', [E('sensor.e_power', 'sensor'), E('binary_sensor.e_overtemp', 'binary_sensor')], '1.6.0');
  const fleetD = [fine, lowBatt, hot, old_fw, gone];

  const items = att.attentionItems(fleetD, S);
  eq('a healthy device is not listed', items.some(i => i.device.name === 'Healthy'), false);
  eq('flags the right devices', items.map(i => i.device.name),
    ['Offline', 'Overheating', 'Flat battery', 'Needs update']);
  eq('worst first: offline, alert, battery, update', items.map(i => i.kinds[0]),
    ['offline', 'alert', 'battery', 'update']);
  ok('an offline device is not also reported for its stale alert',
    items.find(i => i.device.name === 'Offline').kinds.join() === 'offline');
  ok('the update detail names the version', items.find(i => i.device.name === 'Needs update').detail.join().includes('2.0.0'));
  eq('the battery threshold is configurable',
    att.attentionItems([lowBatt], S, { batteryBelow: 5 }).length, 0);

  console.log('\nattention — lights on');
  const LS = {
    'light.a': { state: 'on', attributes: { friendly_name: 'Hall lamp' } },
    'light.b': { state: 'off', attributes: {} },
    'light.c': { state: 'unavailable', attributes: {} },
    'switch.d': { state: 'on', attributes: {} },
  };
  const lightDev = D('Lights', [E('light.a', 'light'), E('light.b', 'light'),
    E('light.c', 'light'), E('switch.d', 'switch')], '1.0.0');
  const lc = att.lightCounts([lightDev], LS);
  eq('counts lights that are on', lc.on, 1);
  eq('an unavailable light is not counted at all', lc.total, 2);
  eq('a switch is not a light', lc.onNames.length, 1);
  eq('names the ones that are on', lc.onNames, ['Hall lamp']);
  eq('no lights means nothing to show', att.lightCounts([D('X', [], '1')], LS).total, 0);

  console.log('\nattention — labelled lights');
  const LL = {
    'switch.relay_lamp': { state: 'on', attributes: { friendly_name: 'Hall relay' } },
    'switch.relay_pump': { state: 'on', attributes: { friendly_name: 'Pump' } },
    'switch.plug_lamp': { state: 'off', attributes: {} },
    'light.real': { state: 'on', attributes: { friendly_name: 'Real light' } },
  };
  const lampRelay = { device_id: 'r', name: 'Relay', labels: ['dimming_lights'],
    entities: [E('switch.relay_lamp', 'switch')] };
  const pumpRelay = { device_id: 'p', name: 'Pump relay', labels: [],
    entities: [E('switch.relay_pump', 'switch')] };
  const plug = { device_id: 'g', name: 'Plug', entities: [E('switch.plug_lamp', 'switch')] };
  const realLight = { device_id: 'l', name: 'Lamp', entities: [E('light.real', 'light')] };
  const mixed = [lampRelay, pumpRelay, plug, realLight];

  eq('without labels, only real lights count', att.lightCounts(mixed, LL).total, 1);
  const labelled = att.lightCounts(mixed, LL, { labels: ['dimming_lights'] });
  eq('a labelled relay counts as a light', labelled.total, 2);
  eq('and is included when on', labelled.on, 2);
  ok('an unlabelled relay is left alone', !labelled.onNames.includes('Pump'));
  const withExtra = att.lightCounts(mixed, LL, { entities: ['switch.plug_lamp'] });
  eq('an explicitly named entity counts', withExtra.total, 2);
  eq('and its off state is respected', withExtra.on, 1);
  const viaBoth = att.lightCounts(mixed, LL, { labels: ['dimming_lights'], entities: ['switch.relay_lamp'] });
  eq('a device counted by both routes is only counted once', viaBoth.total, 2);

  console.log('\nattention — faults vs alarms');
  const AS = {
    'binary_sensor.hot': { state: 'on', attributes: { device_class: 'heat' } },
    'binary_sensor.smoke': { state: 'on', attributes: { device_class: 'smoke' } },
    'binary_sensor.wet': { state: 'on', attributes: { device_class: 'moisture' } },
    'sensor.alive': { state: '1', attributes: {} },
  };
  const faulty = D('Hot relay', [E('binary_sensor.hot', 'binary_sensor'), E('sensor.alive', 'sensor')], '1');
  const alarming = D('Smoke alarm', [E('binary_sensor.smoke', 'binary_sensor'), E('sensor.alive', 'sensor')], '1');
  const leaking = D('Leak', [E('binary_sensor.wet', 'binary_sensor'), E('sensor.alive', 'sensor')], '1');
  eq('a fault is the device complaining about itself', att.deviceFaults(faulty, AS), ['overtemp']);
  eq('an alarm is the world being wrong', att.environmentAlarms(alarming, AS), ['smoke']);
  eq('a fault is not an alarm', att.environmentAlarms(faulty, AS), []);
  eq('an alarm is not a fault', att.deviceFaults(alarming, AS), []);
  eq('both surface together', att.firingAlerts(leaking, AS), ['water']);
  eq('and a firing alarm reaches the attention list',
    att.attentionItems([alarming], AS).map(i => i.detail.join()), ['smoke']);

  console.log('\nattention — beta firmware');
  const BS = {
    // What a real Shelly looks like: a beta on offer permanently, and sometimes
    // a real release alongside it.
    'update.dev_beta_firmware': { state: 'on', attributes: { friendly_name: 'Dev Beta firmware', installed_version: '1.7.5', latest_version: '1.8.0-beta1' } },
    'update.dev_firmware': { state: 'on', attributes: { friendly_name: 'Dev Firmware', installed_version: '1.7.5', latest_version: '2.0.0' } },
    'update.betaonly_beta_firmware': { state: 'on', attributes: { friendly_name: 'Beta only Beta firmware', installed_version: '1.7.5', latest_version: '1.8.0-beta1' } },
    'sensor.dev_alive': { state: '1', attributes: {} },
    'sensor.betaonly_alive': { state: '1', attributes: {} },
  };
  const both2 = D('Real and beta', [E('update.dev_beta_firmware', 'update'), E('update.dev_firmware', 'update'), E('sensor.dev_alive', 'sensor')], '1.7.5');
  const betaOnly = D('Beta only', [E('update.betaonly_beta_firmware', 'update'), E('sensor.betaonly_alive', 'sensor')], '1.7.5');

  eq('a beta-only offer is not an update', att.hasUpdate(betaOnly, BS), false);
  eq('a real release still is', att.hasUpdate(both2, BS), true);
  eq('and the real one is the version reported', att.pendingUpdate(both2, BS).next, '2.0.0');
  eq('betas can be opted into', att.hasUpdate(betaOnly, BS, { includeBeta: true }), true);
  eq('a beta-only device stays out of the attention list',
    att.attentionItems([betaOnly], BS).length, 0);
  eq('but appears when betas are wanted',
    att.attentionItems([betaOnly], BS, { includeBeta: true }).length, 1);
  eq('detection covers the id and the name',
    [att.isBetaUpdate('update.x_beta_firmware'), att.isBetaUpdate('update.x', { friendly_name: 'X Beta firmware' }),
      att.isBetaUpdate('update.x_firmware', { friendly_name: 'X Firmware' })],
    [true, true, false]);

  console.log('\nattention — update predicate');
  const US = {
    'update.real': { state: 'on', attributes: { installed_version: '1.0', latest_version: '2.0' } },
    'update.same': { state: 'on', attributes: { installed_version: '2.0', latest_version: '2.0' } },
    'sensor.up': { state: '1', attributes: {} },
  };
  const realUpd = D('Has update', [E('update.real', 'update'), E('sensor.up', 'sensor')], '1');
  const fakeUpd = D('No real update', [E('update.same', 'update'), E('sensor.up', 'sensor')], '1');
  eq('an update to a different version counts', att.hasUpdate(realUpd, US), true);
  eq('an "update" to the same version does not', att.hasUpdate(fakeUpd, US), false);
  eq('the attention list uses the same rule',
    att.attentionItems([fakeUpd], US).length, 0);

  console.log('\nattention — firmware spread');
  const groups = att.firmwareGroups(fleetD);
  eq('groups by semantic version', groups.map(g => g.version), ['2.0.0', '1.7.5', '1.6.0']);
  eq('counts each', groups.map(g => g.devices.length), [1, 3, 1]);
  ok('the highest version is marked current', groups[0].current && !groups[1].current);
  eq('a Shelly build string reduces to its version',
    att.shortVersion('20260311-095847/1.7.5-g9979d16'), '1.7.5');
  eq('1.10 sorts above 1.9, not below', att.compareVersions('1.10.0', '1.9.9') > 0, true);
  eq('devices with no version are skipped',
    att.firmwareGroups([D('No version', [], undefined)]).length, 0);

  console.log('\nshelly-cloud-import — server + image URL resolution');
  const sci = req(join(process.cwd(), OUT, 'shelly-cloud-import.js'));
  eq('bare host normalizes', sci.normalizeCloudServer('shelly-59-eu.shelly.cloud'), 'https://shelly-59-eu.shelly.cloud');
  eq('device cloud-config paste (port + /jrpc) normalizes',
    sci.normalizeCloudServer('shelly-59-eu.shelly.cloud:6022/jrpc'), 'https://shelly-59-eu.shelly.cloud');
  eq('full URL paste normalizes', sci.normalizeCloudServer('https://shelly-1-eu.shelly.cloud/'), 'https://shelly-1-eu.shelly.cloud');
  eq('garbage is rejected', sci.normalizeCloudServer('not a server'), undefined);
  const SRV = 'https://shelly-59-eu.shelly.cloud';
  eq('stock room image goes to the public CDN',
    sci.resolveCloudImage('images/room_def/living_room_img_def_m.jpg', SRV),
    'https://control.shelly.cloud/images/room_def/living_room_img_def_m.jpg');
  eq('fullSize swaps _m for _l on stock images',
    sci.resolveCloudImage('images/room_def/living_room_img_def_m.jpg', SRV, true),
    'https://control.shelly.cloud/images/room_def/living_room_img_def_l.jpg');
  eq('product image resolves (no size variants)',
    sci.resolveCloudImage('images/device_images/SNSW-001P16EU.png', SRV, true),
    'https://control.shelly.cloud/images/device_images/SNSW-001P16EU.png');
  eq('custom upload goes to the user shard under /shelly_files/',
    sci.resolveCloudImage('assets/user_images/hash/room/thumb_abc.jpg', SRV),
    'https://shelly-59-eu.shelly.cloud/shelly_files/assets/user_images/hash/room/thumb_abc.jpg');
  eq('fullSize drops the thumb_ prefix on custom uploads',
    sci.resolveCloudImage('assets/user_images/hash/room/thumb_abc.jpg', SRV, true),
    'https://shelly-59-eu.shelly.cloud/shelly_files/assets/user_images/hash/room/abc.jpg');
  eq('unknown path shapes resolve to nothing', sci.resolveCloudImage('weird/thing.png', SRV), undefined);
  ok('stock detector', sci.isStockRoomImage('images/room_def/x.jpg') && !sci.isStockRoomImage('assets/user_images/h/room/t.jpg'));

  console.log('\nshelly-cloud-import — room + device matching');
  const rooms = [
    { id: 1, name: 'Stofa' }, { id: 2, name: 'Bílskúr' }, { id: 3, name: 'Hol' }, { id: 4, name: 'Wc' },
  ];
  const areas = ['Living Room', 'Bilskur', 'Hol'];
  const rm = sci.matchCloudRooms(rooms, areas);
  eq('exact name pairs', rm.get(3), 'Hol');
  eq('accents are ignored (Bílskúr ↔ Bilskur)', rm.get(2), 'Bilskur');
  eq('no match maps to undefined', rm.get(1), undefined);
  eq('cloud MAC of a channel id strips the suffix', sci.cloudMac('d48afc7d9a2c_1'), 'd48afc7d9a2c');
  eq('virtual-group ids are not MACs', sci.cloudMac('group-3'), undefined);
  const registry = [
    { id: 'ha1', connections: [['mac', 'AA:BB:CC:00:00:01']] },
    { id: 'ha1shadow', identifiers: [['shelly', 'AABBCC000001']] },
    { id: 'ha2', connections: [['mac', 'aa:bb:cc:00:00:02']] },
    { id: 'other', identifiers: [['hue', 'abc']] },
  ];
  const dm = sci.matchCloudDevices(
    [{ id: 'aabbcc000001' }, { id: 'aabbcc000002_1' }, { id: 'ffffff000000' }], registry);
  eq('MAC matches every registry row that carries it (connection AND identifier)',
    dm.get('aabbcc000001').sort(), ['ha1', 'ha1shadow']);
  eq('channel-suffixed cloud id still matches', dm.get('aabbcc000002'), ['ha2']);
  eq('unknown MACs are absent', dm.has('ffffff000000'), false);



  console.log('\nupdate policy - when the card re-renders');
  {
    const dev = (id, domain) => ({ device_id: 'd', entities: [{ entity_id: id, domain }] });
    // Every call needs a baseline; these are the "nothing interesting happened"
    // defaults that each case then varies one thing from.
    const base = {
      changedKeys: ['hass'],
      oldStates: { 'sensor.a': 1, 'switch.b': 'off' },
      newStates: { 'sensor.a': 1, 'switch.b': 'off' },
      devices: [dev('sensor.a', 'sensor'), dev('switch.b', 'switch')],
      inputTargets: [],
      now: 10_000,
      lastSensorRender: 0,
    };
    const run = (over) => up.computeUpdateReason({ ...base, ...over });

    eq('nothing of ours changed - skip', run({}).render, false);
    eq('and says so', run({}).reason, 'none');

    eq('a config change always renders', run({ changedKeys: ['_config'] }).reason, 'local-state');
    eq('so does UI state', run({ changedKeys: ['_detailDevice'] }).reason, 'local-state');
    eq('a non-hass property renders rather than guessing',
      run({ changedKeys: ['somethingNew'] }).reason, 'non-hass');

    // The guard that matters most: every key in LOCAL_RENDER_KEYS must force a
    // render. A new piece of UI state forgotten from that list is the failure
    // this whole extraction exists to make visible.
    eq('every local key forces a render',
      up.LOCAL_RENDER_KEYS.filter((k) => !run({ changedKeys: [k] }).render), []);

    eq('no old hass yet', run({ oldStates: undefined }).reason, 'no-baseline');
    eq('no device cache yet', run({ devices: null }).reason, 'no-baseline');

    eq('a switch changing renders at once', run({
      newStates: { 'sensor.a': 1, 'switch.b': 'on' },
    }).reason, 'interactive');

    // An input target usually belongs to another device entirely, so the
    // per-device scan would never see it.
    eq('an input target on no discovered device still renders', run({
      inputTargets: ['light.elsewhere'],
      oldStates: { 'light.elsewhere': 'off' },
      newStates: { 'light.elsewhere': 'on' },
    }).reason, 'input-target');

    // Sensor churn: render once, then coalesce until the window elapses.
    const churn = { newStates: { 'sensor.a': 2, 'switch.b': 'off' } };
    const due = run({ ...churn, now: 10_000, lastSensorRender: 0 });
    eq('a sensor change past the window renders', due.reason, 'sensor-due');
    ok('and asks the caller to stamp the clock', due.stampSensorRender === true);

    const soon = run({ ...churn, now: 10_500, lastSensorRender: 10_000 });
    eq('a sensor change inside the window defers', soon.reason, 'sensor-throttled');
    eq('and does not render', soon.render, false);
    eq('scheduling the remainder of the window', soon.scheduleIn, 1500);
    ok('a deferred render never stamps the clock', soon.stampSensorRender === false);

    // A switch and a sensor changing together must not be throttled.
    eq('interactive beats sensor throttling', run({
      newStates: { 'sensor.a': 2, 'switch.b': 'on' },
      now: 10_100, lastSensorRender: 10_000,
    }).reason, 'interactive');
  }

  console.log('\nfont catalogue - one list');
  {
    // The card's <link> and the editor's picker read the same array, so a font
    // offered in the editor is always one the stylesheet actually loads.
    const cdn = fo.FONT_OPTIONS.filter((f) => f.cdn).map((f) => f.cdn);
    eq('CDN list is derived from the catalogue', fo.CDN_FONT_FAMILIES, cdn);
    ok('there are display fonts to load', fo.CDN_FONT_FAMILIES.length > 0);
    ok('every CDN family is in Google Fonts + form',
      fo.CDN_FONT_FAMILIES.every((f) => !f.includes(' ')));
    ok('the href names every family',
      fo.CDN_FONT_FAMILIES.every((f) => fo.cdnFontHref().includes(`family=${f}`)));
    // usesCdnFont drives whether the stylesheet is fetched at all.
    ok('a CDN font is recognised from a css font-family value',
      fo.usesCdnFont("'Bebas Neue', sans-serif"));
    ok('a bundled font does not trigger the CDN fetch',
      !fo.usesCdnFont("'Pacifico', cursive"));
    ok('nor does a system font', !fo.usesCdnFont('Inter, sans-serif'));
    // Bundled fonts must not also be fetched from the CDN.
    eq('bundled and CDN groups do not overlap',
      fo.FONT_OPTIONS.filter((f) => f.group === 'Bundled' && f.cdn), []);
  }

  console.log('\nsensor tile - what it leads with');
  {
    const ent = (id, domain, category) => ({ entity_id: id, domain, entity_category: category });
    const st = (state, unit, dc) => ({ state, attributes: { unit_of_measurement: unit, device_class: dc } });

    // A room sensor: a priority class present and live.
    const room = { device_id: 'r', entities: [
      ent('sensor.rssi', 'sensor'), ent('sensor.temp', 'sensor'), ent('sensor.hum', 'sensor'),
    ]};
    const roomStates = {
      'sensor.rssi': st('-60', 'dBm', 'signal_strength'),
      'sensor.temp': st('21.5', '°C', 'temperature'),
      'sensor.hum':  st('44', '%', 'humidity'),
    };
    eq('a priority class wins over other readings',
      sp.pickPrimarySensor(room, roomStates).entity_id, 'sensor.temp');

    // The regression that prompted this: a machine whose only recognised class
    // is a dead battery, and whose real readings carry no device_class at all.
    const pc = { device_id: 'pc', entities: [
      ent('sensor.batt', 'sensor'), ent('sensor.cpu', 'sensor'), ent('sensor.mem', 'sensor'),
      ent('sensor.disk', 'sensor'), ent('sensor.fw', 'sensor'),
    ]};
    const pcStates = {
      'sensor.batt': st('unavailable', '%', 'battery'),
      'sensor.cpu':  st('24', '%', undefined),
      'sensor.mem':  st('49.2', '%', undefined),
      'sensor.disk': st('476.4', 'GB', 'data_size'),
      'sensor.fw':   { state: '20260311-095847/1.7.5', attributes: {} },
    };
    eq('an unavailable priority class is skipped, not preferred',
      sp.pickPrimarySensor(pc, pcStates).entity_id, 'sensor.cpu');
    ok('a classless reading is usable', sp.isMeasurement(ent('sensor.cpu', 'sensor'), pcStates));
    ok('an unavailable one is not', !sp.isMeasurement(ent('sensor.batt', 'sensor'), pcStates));
    // The unit test is load-bearing: without it this parses to a "2026.0" chip.
    ok('a firmware string is not a measurement',
      !sp.isMeasurement(ent('sensor.fw', 'sensor'), pcStates));

    eq('the rest become chips, primary excluded',
      sp.pickSecondarySensors(pc, pcStates, 'sensor.cpu').map(e => e.entity_id),
      ['sensor.mem', 'sensor.disk']);

    // Diagnostic readings are a last resort, not a chip. A door sensor or a
    // phone reports nothing BUT its battery, and HA files battery as
    // diagnostic - excluding it outright blanked nine real devices.
    const doorSensor = { device_id: 'ds', entities: [
      ent('sensor.rssi', 'sensor', 'diagnostic'), ent('sensor.batt', 'sensor', 'diagnostic'),
    ]};
    const doorStates = {
      'sensor.rssi': st('-71', 'dBm', 'signal_strength'),
      'sensor.batt': st('50', '%', 'battery'),
    };
    eq('a battery-only device leads with its battery',
      sp.pickPrimarySensor(doorSensor, doorStates).entity_id, 'sensor.batt');
    eq('but a diagnostic reading never becomes a chip',
      sp.pickSecondarySensors(doorSensor, doorStates, 'sensor.batt'), []);
    // Only a priority class earns the last resort, or every device would lead
    // with its signal strength.
    const rssiOnly = { device_id: 'ro', entities: [ent('sensor.rssi', 'sensor', 'diagnostic')] };
    eq('an off-list diagnostic is still not a headline',
      sp.pickPrimarySensor(rssiOnly, { 'sensor.rssi': st('-71', 'dBm', 'signal_strength') }), undefined);
    // A real reading always outranks the diagnostic fallback.
    const relay = { device_id: 'rl', entities: [
      ent('sensor.devtemp', 'sensor', 'diagnostic'), ent('sensor.power', 'sensor'),
    ]};
    eq('a live power reading beats a diagnostic temperature',
      sp.pickPrimarySensor(relay, {
        'sensor.devtemp': st('63.5', '°C', 'temperature'),
        'sensor.power': st('2.8', 'W', 'power'),
      }).entity_id, 'sensor.power');

    // Nothing numeric at all: fall through to the binary sensor.
    const motion = { device_id: 'm', entities: [
      ent('binary_sensor.motion', 'binary_sensor'), ent('sensor.batt', 'sensor'),
    ]};
    const motionStates = {
      'binary_sensor.motion': st('on', undefined, 'motion'),
      'sensor.batt': st('unavailable', '%', 'battery'),
    };
    eq('no usable number means no primary',
      sp.pickPrimarySensor(motion, motionStates), undefined);
    eq('and the binary sensor carries the tile',
      sp.pickPrimaryBinary(motion, motionStates).entity_id, 'binary_sensor.motion');

    // A device reporting nothing usable renders "No sensor" — still correct.
    const dead = { device_id: 'x', entities: [ent('sensor.a', 'sensor')] };
    eq('a device with nothing live has no primary',
      sp.pickPrimarySensor(dead, { 'sensor.a': st('unknown', '%', undefined) }), undefined);
  }

  console.log('\nsensor keys - one list, classes and entity ids');
  {
    const ent = (id, domain, category) => ({ entity_id: id, domain, entity_category: category });
    const st = (state, unit, dc) => ({ state, attributes: { unit_of_measurement: unit, device_class: dc } });

    ok('an entity id is recognised by its dot', sk.isEntityKey('sensor.davidpc_cpuload'));
    ok('a device_class is not', !sk.isEntityKey('temperature'));
    // The keys the card already ships must never be mistaken for entity ids.
    eq('no existing chip key contains a dot',
      ['power','energy','temperature','humidity','co2','rssi','fw_version','power_factor']
        .filter(sk.isEntityKey), []);

    const mixed = ['temperature', 'sensor.pc_cpu', 'power', 'sensor.pc_mem'];
    eq('classes split out in order', sk.classKeys(mixed), ['temperature', 'power']);
    eq('entity ids split out in order', sk.entityKeys(mixed), ['sensor.pc_cpu', 'sensor.pc_mem']);

    // The list reaches every tile, so a named entity must apply only to the
    // device that owns it - otherwise one CPU sensor draws a chip on all of them.
    const pc = { device_id: 'pc', entities: [ent('sensor.pc_cpu', 'sensor'), ent('sensor.pc_mem', 'sensor')] };
    const lamp = { device_id: 'l', entities: [ent('sensor.lamp_power', 'sensor')] };
    eq('a device gets the ids it owns',
      sk.namedEntitiesOn(pc, mixed).map(e => e.entity_id), ['sensor.pc_cpu', 'sensor.pc_mem']);
    eq('and another device gets none of them', sk.namedEntitiesOn(lamp, mixed), []);
    eq('config order wins over registry order',
      sk.namedEntitiesOn(pc, ['sensor.pc_mem', 'sensor.pc_cpu']).map(e => e.entity_id),
      ['sensor.pc_mem', 'sensor.pc_cpu']);
    eq('an id naming nothing on this device is skipped',
      sk.namedEntitiesOn(pc, ['sensor.nope', 'sensor.pc_cpu']).map(e => e.entity_id), ['sensor.pc_cpu']);
    eq('no list at all is no named entities', sk.namedEntitiesOn(pc, undefined), []);

    // "Select all" is about the class pills. No pill stands for a named entity,
    // so wiping them there deletes a choice the user cannot see on screen.
    eq('select-all keeps the entity ids',
      sk.selectAllKeys(['sensor.pc_cpu', 'temperature'], ['temperature', 'humidity']),
      ['sensor.pc_cpu', 'temperature', 'humidity']);
    eq('select-all from nothing is just the classes',
      sk.selectAllKeys(undefined, ['temperature']), ['temperature']);

    // Naming entities is how you build a tile the class vocabulary cannot reach.
    const pcStates = {
      'sensor.pc_cpu': st('24', '%', undefined),
      'sensor.pc_mem': st('49.48', '%', undefined),
    };
    eq('a named entity leads the tile',
      sp.pickPrimarySensor(pc, pcStates, ['sensor.pc_mem']).entity_id, 'sensor.pc_mem');
    eq('and the rest follow in the order named',
      sp.pickSecondarySensors(pc, pcStates, 'sensor.pc_mem', 4, ['sensor.pc_mem', 'sensor.pc_cpu'])
        .map(e => e.entity_id), ['sensor.pc_cpu']);

    // An explicit choice outranks the class preference - that is the point.
    const room = { device_id: 'r', entities: [ent('sensor.temp', 'sensor'), ent('sensor.co', 'sensor')] };
    const roomStates = {
      'sensor.temp': st('21.5', '°C', 'temperature'),
      'sensor.co': st('412', 'ppm', 'carbon_dioxide'),
    };
    eq('a named entity beats a priority class',
      sp.pickPrimarySensor(room, roomStates, ['sensor.co']).entity_id, 'sensor.co');
    eq('with no name given the class preference still decides',
      sp.pickPrimarySensor(room, roomStates).entity_id, 'sensor.temp');
    eq('a class-only list does not count as naming anything',
      sp.pickPrimarySensor(room, roomStates, ['carbon_dioxide']).entity_id, 'sensor.temp');

    // A named diagnostic is honoured: asking for it by id says you meant it.
    const dev = { device_id: 'd', entities: [ent('sensor.rssi', 'sensor', 'diagnostic'), ent('sensor.w', 'sensor')] };
    const devStates = { 'sensor.rssi': st('-71', 'dBm', 'signal_strength'), 'sensor.w': st('4.1', 'W', 'power') };
    eq('a named diagnostic leads when asked for by id',
      sp.pickPrimarySensor(dev, devStates, ['sensor.rssi']).entity_id, 'sensor.rssi');
    eq('but is still not chosen on its own',
      sp.pickPrimarySensor(dev, devStates).entity_id, 'sensor.w');
    // A dead named entity must not blank the tile.
    eq('an unavailable named entity falls through to the heuristic',
      sp.pickPrimarySensor(dev, { ...devStates, 'sensor.rssi': st('unavailable', 'dBm', 'signal_strength') },
        ['sensor.rssi']).entity_id, 'sensor.w');
  }

  console.log('\nformatReading - a value someone chose');
  {
    eq('two decimals at most', h.formatReading(49.480000000000004, '%'), '49.48 %');
    eq('trailing zeros trimmed', h.formatReading(2.10, 'W'), '2.1 W');
    eq('an integer stays whole', h.formatReading(24, '%'), '24 %');
    eq('big numbers lose the noise', h.formatReading(1123826285.4, 'B'), '1123826285 B');
    eq('no unit, no trailing space', h.formatReading(7, ''), '7');
    eq('nonsense is the placeholder', h.formatReading(NaN, '%'), '—');
  }

  console.log('\nroom filter - the unassigned bucket is a room too');
  {
    const ROOMS = ['Kitchen', 'Stofa', 'Bilskur'];
    const uni = rf.areaKeyUniverse(ROOMS, true);
    eq('the universe carries the No Room key', uni, ['Kitchen', 'Stofa', 'Bilskur', '']);
    eq('and omits it when nothing is unassigned',
      rf.areaKeyUniverse(ROOMS, false), ROOMS);

    ok('everything is on when there is no filter', rf.isAreaOn(undefined, ''));
    ok('an explicit list decides', rf.isAreaOn(['Kitchen'], 'Kitchen'));
    ok('and excludes what it omits', !rf.isAreaOn(['Kitchen'], ''));

    // THE BUG: switching one room off wrote a list built from the real areas
    // only, so '' could never be in it and every unassigned device vanished
    // from the card at the same time. The user reported it as "turning it off
    // hides the devices".
    const afterKitchenOff = rf.toggleAreaSelection(uni, undefined, 'Kitchen');
    ok('switching a room off leaves No Room on', afterKitchenOff.includes(''));
    eq('and keeps every other room', afterKitchenOff, ['Stofa', 'Bilskur', '']);

    // With the old universe (no ''), this is what used to be written - kept as
    // the shape that caused it.
    eq('the old universe is what dropped it',
      rf.toggleAreaSelection(ROOMS, undefined, 'Kitchen'), ['Stofa', 'Bilskur']);

    // No Room must be switchable in its own right. It never was: the toggle
    // read as on, and clicking it added '' to a set that lacked it, so the row
    // stayed on however many times you pressed it.
    const afterNoRoomOff = rf.toggleAreaSelection(uni, undefined, '');
    ok('No Room can actually be switched off', !afterNoRoomOff.includes(''));
    eq('leaving the real rooms alone', afterNoRoomOff, ROOMS);

    // Turning the last one back on returns to "no filter" rather than freezing
    // a list that would silently exclude a room added later.
    eq('switching everything back on clears the filter',
      rf.toggleAreaSelection(uni, ['Stofa', 'Bilskur', ''], 'Kitchen'), undefined);
    eq('and restoring No Room does the same',
      rf.toggleAreaSelection(uni, ROOMS, ''), undefined);

    // A stale key from a deleted room must not make an incomplete selection
    // look complete - counting by size alone would have said "all on" here.
    eq('a stale key does not fake a full selection',
      rf.toggleAreaSelection(uni, ['Kitchen', 'Stofa', 'Ghost'], ''),
      ['Kitchen', 'Stofa', 'Ghost', '']);

    // Show/hide a whole room at once. hidden_devices is card-wide, so the one
    // thing this must never do is disturb another room's hidden devices.
    const KITCHEN = ['d1', 'd2'];
    eq('hiding a room hides exactly its devices',
      rf.setDevicesHidden([], KITCHEN, true), ['d1', 'd2']);
    eq('and leaves another room alone',
      rf.setDevicesHidden(['other'], KITCHEN, true), ['other', 'd1', 'd2']);
    eq('showing a room clears only its own',
      rf.setDevicesHidden(['other', 'd1', 'd2'], KITCHEN, false), ['other']);
    eq('an empty result is undefined, not []',
      rf.setDevicesHidden(['d1'], KITCHEN, false), undefined);
    eq('hiding twice does not duplicate',
      rf.setDevicesHidden(['d1'], KITCHEN, true), ['d1', 'd2']);
    eq('showing an already-shown room is a no-op',
      rf.setDevicesHidden(['other'], KITCHEN, false), ['other']);
    eq('a room with nothing in it changes nothing',
      rf.setDevicesHidden(['other'], [], true), ['other']);

    // Round trip: off then on again is where you started.
    eq('off then on is a no-op',
      rf.toggleAreaSelection(uni, rf.toggleAreaSelection(uni, undefined, 'Stofa'), 'Stofa'),
      undefined);
  }

  console.log('\nshelly generation - integration first, then guesswork');
  {
    // Fixtures are real registry values from a live instance, not invented.
    const gen = h.detectShellyGen;
    eq('hw_version wins outright', gen('Shelly Plus 1PM', 'gen2', 'SNSW-001P16EU'), 2);
    eq('gen1 from the integration', gen('Shelly Plug S', 'gen1', 'SHPLG-S'), 1);
    eq('gen3 from the integration', gen('Shelly 1PM Gen3', 'gen3', 'S3SW-001P16EU'), 3);
    eq('the Wall Display is gen2', gen('Shelly Wall Display', 'gen2', 'SAWD-0A1XX10EU1'), 2);

    // The integration's answer beats a model name that disagrees: a device
    // renamed in HA must not change its hardware generation.
    eq('hw_version beats a misleading name', gen('Renamed by the user', 'gen3'), 3);

    // model_id prefixes, for a Shelly whose hw_version is missing.
    eq('SN prefix is gen2', gen('', undefined, 'SNSW-001P16EU'), 2);
    eq('S3 prefix is gen3', gen('', undefined, 'S3DM-0A101WWL'), 3);
    eq('SH prefix is gen1', gen('', undefined, 'SHDM-2'), 1);
    // Constructed, not observed: there is no Gen4 hardware on the instance these
    // fixtures came from. The S4 rule is extrapolated from Shelly's own scheme
    // (SH/SN/S3 by generation), so treat this one as a guard on the rule rather
    // than evidence about a real device.
    eq('S4 prefix is gen4 (synthetic fixture)', gen('', undefined, 'S4SW-001X16EU'), 4);

    // BLU, and the trap in it. Real BLU hardware carries no hw_version, so it
    // reaches the SB prefix or the name and reports 'ble'. The BLU *Gateway* is
    // a mains-powered Gen3 WiFi bridge whose name merely contains "BLU" —
    // testing the name first reported it as 'ble' and discarded a good gen3.
    eq('BLU H&T falls to the name', gen('BLU H&T', undefined, undefined), 'ble');
    eq('the BLU TRV is ble by its SB prefix', gen('Shelly BLU TRV', undefined, 'SBTR-001AEU'), 'ble');
    eq('the BLU Gateway is gen3, not ble',
      gen('Shelly BLU Gateway Gen3', 'gen3', 'S3GW-1DBT001'), 3);
    eq('and still gen3 on model_id alone',
      gen('Shelly BLU Gateway Gen3', undefined, 'S3GW-1DBT001'), 3);
    // Both Shelly gateways are mains WiFi units whose names say Bluetooth. The
    // Bluetooth Gateway is SN — Gen2 hardware — despite being the first of its
    // product line. On name alone a gateway must never resolve to 'ble': with
    // nothing else to go on, 'gen3' in the name still wins, and a name carrying
    // no generation at all is honestly unknown rather than wrongly Bluetooth.
    eq('the Bluetooth Gateway is gen2 by its SN prefix',
      gen('Shelly Bluetooth Gateway', undefined, 'SNGW-BT01'), 2);
    eq('a gateway is never ble on the name alone',
      gen('Shelly Bluetooth Gateway'), 'other');
    eq('BLU Gateway falls back to the gen in its name',
      gen('Shelly BLU Gateway Gen3'), 3);
    // SB and SH are a transposition apart and mean opposite things. Both codes
    // below are real, read off the devices in the Shelly app: SBHT-003C is the
    // BLU H&T, SHBTN-2 the Shelly Button 2 (Gen1, firmware v1.14). Pinned as a
    // pair so neither rule can be loosened without this failing.
    eq('SBHT is a BLU sensor', gen('Shelly BLU HT', undefined, 'SBHT-003C'), 'ble');
    eq('SHBTN is gen1, not ble', gen('Shelly Button 2', undefined, 'SHBTN-2'), 1);

    // Name heuristics still stand when nothing better is available.
    eq('plus in the name is gen2', gen('Shelly Plus I4'), 2);
    eq('gen3 in the name', gen('Shelly Dimmer Gen3'), 3);

    // The point of the change: an unrecognised device says so rather than
    // asserting Gen 1 - which was both wrong and, through the click-replay
    // path, the wrong button numbering.
    eq('an unknown device is not silently gen1', gen('Shelly Something 2029'), 'other');
    eq('nothing at all is other', gen(''), 'other');
    // A non-Shelly hw_version string must not be mistaken for a generation.
    eq('arbitrary hw_version is ignored', gen('Some Router', 'RAX50'), 'other');
    eq('esp32 is not a generation', gen('Node', 'esp32'), 'other');
  }

  console.log('\nlocalize - catalogues and lookup');
  {
    const keys = loc.knownKeys();
    ok('English defines the key set', keys.length > 100);

    // The gate that stops a locale rotting: adding a string to English without
    // translating it, or leaving a key behind after English drops it, fails
    // here rather than rendering blank on someone's dashboard.
    for (const [code, cat] of Object.entries(loc.LOCALES)) {
      if (code === 'en') continue;
      eq(code + ' translates every English key', keys.filter(k => !(k in cat)), []);
      eq(code + ' carries no key English lacks',
        Object.keys(cat).filter(k => !keys.includes(k)), []);
      // A placeholder dropped in translation silently loses the value it
      // carried, and nothing else would catch it. Reported as one line naming
      // the offending keys: one assertion per key drowned the whole run.
      const ph = (v) => (v.match(/\{\w+\}/g) ?? []).sort().join(',');
      eq(code + ' keeps every placeholder',
        keys.filter(k => ph(cat[k] ?? '') !== ph(loc.LOCALES.en[k])), []);
    }

    eq('an exact language matches', loc.resolveLanguage('is'), 'is');
    eq('a region falls back to its base language', loc.resolveLanguage('is-IS'), 'is');
    eq('case is ignored', loc.resolveLanguage('IS'), 'is');
    eq('an unknown language falls back to English', loc.resolveLanguage('sv-SE'), 'en');
    eq('no language at all is English', loc.resolveLanguage(undefined), 'en');

    ok('a translated key really differs from English',
      loc.translate('is', 'action.cancel') !== loc.translate('en', 'action.cancel'));
    eq('an unknown key returns the key itself',
      loc.translate('is', 'nope.missing'), 'nope.missing');
    eq('placeholders are substituted',
      loc.translate('en', 'confirm.title', { name: 'Lamp' }), 'Turn off Lamp?');
    eq('a placeholder with no var is left as written',
      loc.translate('en', 'confirm.title', {}), 'Turn off {name}?');

    // 'No Area' is the area_styles config key for the unassigned bucket as well
    // as a label. The English value is what the card looks that block up by, so
    // it is not free to drift.
    eq('the No Area label still matches its config key',
      loc.translate('en', 'header.no_area'), 'No Area');

    // The ambient wrapper the render path uses: this checks the plumbing, that
    // t() routes through the language setLanguage was given.
    loc.setLanguage('is-IS');
    eq('t() answers in the set language', loc.t('state.open'), loc.LOCALES.is['state.open']);
    eq('and resolves the region to its base', loc.getLanguage(), 'is');
    loc.setLanguage('en');
    eq('t() switches back', loc.t('state.open'), 'Open');

    // tOr backs the open-ended tables (device profiles, graph device_classes),
    // where HA can hand us a class the catalogue has no key for.
    eq('tOr prefers the catalogue', loc.tOr('graph.power', 'Watts'), 'Power');
    eq('tOr falls back on an unknown key', loc.tOr('graph.nonsense', 'Nonsense'), 'Nonsense');
  }

} finally {
  rmSync(OUT, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} failure(s)` : '\nOK');
process.exitCode = failures ? 1 : 0;
