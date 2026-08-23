/**
 * Tests for the card's core logic — discovery, device merging, input-channel
 * detection, relevance, layout utilities and config migration.
 *
 * These are the functions every real bug this week lived in: duplicate registry
 * rows rendering twice, an i4's only button never appearing, labels off by one,
 * cascades disagreeing. All were found by eye, after shipping. This is the net.
 *
 * Fixtures mirror shapes seen on a real fleet rather than invented ones — a
 * device_pulse shadow sharing a MAC with its Shelly, a Gen1 i3 whose channels
 * are all `event.`, a Gen3 i4 whose input binary_sensors are device_class
 * `power` and whose event entity has been renamed.
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
      name: 'Ljós hjónaherbergi', manufacturer: 'Shelly', model: 'Shelly Dimmer 2',
      configuration_url: 'http://10.0.0.11', area_id: 'bed',
      connections: [['mac', 'aa:bb:cc:00:00:02']], identifiers: [['shelly', '98CDAC0BF296']],
    },
    dimmerShadow: {
      name: 'Ljós hjónaherbergi', manufacturer: 'Shelly', model: 'Shelly Dimmer 2', area_id: 'bed',
      connections: [['mac', 'aa:bb:cc:00:00:02']], identifiers: [['shelly', '98CDAC0BF296']],
    },
    // A Gen1 i3: channels are event entities only.
    i3: {
      name: 'Rofi bílskúr', manufacturer: 'Shelly', model: 'Shelly i3',
      configuration_url: 'http://10.0.0.12', area_id: 'garage',
      connections: [['mac', 'aa:bb:cc:00:00:03']], identifiers: [['shelly', 'E8DB84D6C996']],
    },
    // A Gen3 i4: binary_sensor inputs tagged `power`, plus a renamed event.
    i4: {
      name: 'Rofi Hjóna', manufacturer: 'Shelly', model: 'Shelly I4 Gen3',
      configuration_url: 'http://10.0.0.13', area_id: 'bed',
      connections: [['mac', 'aa:bb:cc:00:00:01']], identifiers: [['shelly', '8CBFEA978BD0']],
    },
    // A 2.5 parent + per-channel sub-device on the same host.
    relay: {
      name: 'Shelly 2.5', manufacturer: 'Shelly', model: 'Shelly 2.5',
      configuration_url: 'http://10.0.0.14', area_id: 'hall',
      connections: [['mac', 'aa:bb:cc:dd:ee:01']], identifiers: [['shelly', 'AABBCCDDEE01']],
    },
    relayCh2: {
      name: 'Shelly 2.5 Channel 2', manufacturer: 'Shelly', model: 'Shelly 2.5',
      configuration_url: 'http://10.0.0.14', via_device_id: 'relay', area_id: 'hall',
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

    'event.rofi_bilskur_channel_1': ent('i3', 'shelly'),
    'event.rofi_bilskur_channel_2': ent('i3', 'shelly'),
    'event.rofi_bilskur_channel_3': ent('i3', 'shelly'),
    'binary_sensor.rofi_bilskur_cloud': ent('i3', 'shelly'),
    'sensor.rofi_bilskur_rssi': ent('i3', 'shelly'),

    'binary_sensor.rofi_hjona_input_2': ent('i4', 'shelly'),
    'binary_sensor.rofi_hjona_input_3': ent('i4', 'shelly'),
    'event.rofi_hjona_hjon_ljos': ent('i4', 'shelly'),
    'binary_sensor.rofi_hjona_restart_required': ent('i4', 'shelly'),
    'binary_sensor.rofi_hjona_cloud': ent('i4', 'shelly'),
    'sensor.rofi_hjona_uptime': ent('i4', 'shelly'),

    'switch.relay_1': ent('relay', 'shelly'),
    'switch.relay_2': ent('relayCh2', 'shelly'),

    'light.hue': ent('hue', 'hue'),

    'sensor.phone_battery': ent('phone', 'mobile_app'),
    'update.bare_firmware': ent('bare', 'shelly'),
    'sensor.blu_temp': ent('blu', 'bthome'),
    'sensor.dimmer_hidden': ent('dimmer', 'shelly', { hidden_by: 'user' }),
  };

  const states = {
    'light.dimmer': st('on', { friendly_name: 'Ljós hjónaherbergi', brightness: 180 }),
    'sensor.dimmer_power': st('4.2', { device_class: 'power', friendly_name: 'Ljós hjónaherbergi Power' }),
    'sensor.dimmer_energy': st('1.5', { device_class: 'energy' }),
    'binary_sensor.dimmer_ping': st('on', { device_class: 'connectivity' }),
    'sensor.dimmer_failed_pings': st('0'),

    'event.rofi_bilskur_channel_1': st('2026-08-20T10:00:00Z', { device_class: 'button', event_type: 'single', friendly_name: 'Rofi bílskúr Input 1' }),
    'event.rofi_bilskur_channel_2': st('2026-08-20T10:00:00Z', { device_class: 'button', event_type: 'double', friendly_name: 'Rofi bílskúr Input 2' }),
    'event.rofi_bilskur_channel_3': st('2026-08-20T10:00:00Z', { device_class: 'button', friendly_name: 'Rofi bílskúr Input 3' }),
    'binary_sensor.rofi_bilskur_cloud': st('on', { device_class: 'connectivity', friendly_name: 'Rofi bílskúr Cloud' }),
    'sensor.rofi_bilskur_rssi': st('-58', { device_class: 'signal_strength' }),

    'binary_sensor.rofi_hjona_input_2': st('off', { device_class: 'power', friendly_name: 'Rofi Hjóna Input 2' }),
    'binary_sensor.rofi_hjona_input_3': st('off', { device_class: 'power', friendly_name: 'Rofi Hjóna Input 3' }),
    'event.rofi_hjona_hjon_ljos': st('2026-08-15T02:59:44Z', { device_class: 'button', event_type: 'single_push', friendly_name: 'Rofi Hjóna Hjón ljós' }),
    'binary_sensor.rofi_hjona_restart_required': st('off', { device_class: 'problem', friendly_name: 'Rofi Hjóna Restart required' }),
    'binary_sensor.rofi_hjona_cloud': st('on', { device_class: 'connectivity', friendly_name: 'Rofi Hjóna Cloud' }),
    'sensor.rofi_hjona_uptime': st('1200', { friendly_name: 'Rofi Hjóna Uptime' }),

    'switch.relay_1': st('on', { friendly_name: 'Shelly 2.5 Channel 1' }),
    'switch.relay_2': st('off', { friendly_name: 'Shelly 2.5 Channel 2' }),
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
    'src/helpers.ts', 'src/cascade.ts', 'src/attention.ts', '--outDir', OUT,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--moduleResolution', 'node',
  ], { stdio: 'inherit' });
  // The project is "type": "module", which would make these .js files ESM.
  writeFileSync(join(OUT, 'package.json'), '{"type":"commonjs"}');

  const req = createRequire(import.meta.url);
  const h = req(join(process.cwd(), OUT, 'helpers.js'));
  const cas = req(join(process.cwd(), OUT, 'cascade.js'));
  const att = req(join(process.cwd(), OUT, 'attention.js'));
  const hass = fleet();
  const byName = (list, name) => list.find(d => d.name === name);

  console.log('\ngetAllDevices — Shelly mode');
  const shelly = h.getAllDevices(hass);
  ok('drops non-Shelly integrations', !byName(shelly, 'Hue lamp'));
  ok('drops the device_pulse shadow', shelly.filter(d => d.name === 'Ljós hjónaherbergi').length === 1);
  eq('keeps exactly the Shelly devices', shelly.map(d => d.name).sort(),
    ['Bare device', 'Ljós hjónaherbergi', 'Rofi Hjóna', 'Rofi bílskúr', 'Shelly 2.5']);

  console.log('\ngetAllDevices — universal mode');
  const uni = h.getAllDevices(hass, { universal: true, scope: 'all' });
  ok('includes non-Shelly devices', !!byName(uni, 'Hue lamp'));
  const dimmer = byName(uni, 'Ljós hjónaherbergi');
  ok('the MAC-twin shadow is merged away', uni.filter(d => d.name === 'Ljós hjónaherbergi').length === 1);
  eq('merged device keeps every entity', dimmer.entities.length, 5);
  eq('a Shelly entity wins the integration field', dimmer.integration, 'shelly');
  eq('the surviving row keeps the config-URL IP', dimmer.ip, '10.0.0.11');

  console.log('\ngetAllDevices — sub-device merge');
  const relay = byName(uni, 'Shelly 2.5');
  ok('per-channel sub-device folds into its parent', uni.every(d => d.name !== 'Shelly 2.5 Channel 2'));
  eq('parent gained the channel entity', relay.entities.length, 2);

  console.log('\ndetectInputChannels — Gen1 i3 (event-only)');
  const i3 = byName(uni, 'Rofi bílskúr');
  const ch3 = h.detectInputChannels(i3, hass.states);
  eq('finds three channels', ch3.length, 3);
  eq('labels match HA, not shifted by one', ch3.map(c => c.label), ['Input 1', 'Input 2', 'Input 3']);
  eq('channel numbers', ch3.map(c => c.channel), [1, 2, 3]);
  ok('all are button-style', ch3.every(c => c.isButton));
  eq('last event is carried', ch3[0].lastEvent, 'single');
  ok('the cloud binary_sensor is not an input', !ch3.some(c => c.entityId.includes('cloud')));

  console.log('\ndetectInputChannels — Gen3 i4 (binary + renamed event)');
  const i4 = byName(uni, 'Rofi Hjóna');
  const ch4 = h.detectInputChannels(i4, hass.states);
  ok('the renamed event channel is present', ch4.some(c => c.entityId === 'event.rofi_hjona_hjon_ljos'),
    'this is the bug that hid an i4\'s only button');
  eq('finds all three channels', ch4.length, 3);
  ok('a rename survives', ch4.some(c => c.label === 'Hjón ljós'));
  eq('binary input labels are not shifted', ch4.filter(c => c.label.startsWith('Input')).map(c => c.label), ['Input 2', 'Input 3']);
  ok('restart_required is not treated as an input', !ch4.some(c => c.entityId.includes('restart')));

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
  ok('include_domains restricts to those domains', !byName(onlyLights, 'Rofi Hjóna'));
  const both = h.getAllDevices(hass, {
    universal: true, scope: 'all', includeDomains: ['light'], excludeDomains: ['light'],
  });
  ok('excluding beats including for a domain in both lists', !byName(both, 'Hue lamp'));

  console.log('\nhidden entities');
  ok('a hidden entity is not collected',
    !byName(all, 'Ljós hjónaherbergi').entities.some(e => e.entity_id === 'sensor.dimmer_hidden'));

  console.log('\nShelly mode vendor filtering');
  ok('BTHome from another vendor is dropped in Shelly mode', !byName(shelly, 'Tuya BLE'));
  ok('…but kept in universal mode', !!byName(all, 'Tuya BLE'));

  console.log('\ngetDeviceProfile');
  eq('i3 is an input device', h.getDeviceProfile(byName(all, 'Rofi bílskúr')).type, 'input');
  eq('i4 is an input device', h.getDeviceProfile(byName(all, 'Rofi Hjóna')).type, 'input');
  eq('a Dimmer 2 is a dimmer', h.getDeviceProfile(byName(all, 'Ljós hjónaherbergi')).type, 'dimmer');
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
  const blocksOutsideVocab = [...new Set(Object.values(h.PROFILE_DEFAULT_BLOCKS).flat())]
    .filter(b => !(b in h.BLOCK_LABELS));
  ok('no profile references a block with no label', blocksOutsideVocab.length === 0, blocksOutsideVocab.join(', '));

  console.log('\ndeviceChipKeys');
  const keysI4 = [...h.deviceChipKeys(byName(all, 'Rofi Hjóna'))].sort();
  eq('i4 produces exactly its diagnostics', keysI4, ['cloud', 'uptime']);
  const keysDim = [...h.deviceChipKeys(byName(all, 'Ljós hjónaherbergi'))].sort();
  ok('a dimmer produces power and energy', keysDim.includes('power') && keysDim.includes('energy'));

  // ── cascades ───────────────────────────────────────────────────────────────
  // These used to be methods on the card element, untestable without a DOM —
  // which is how the renderer and the Customize panel came to resolve blocks
  // differently without anyone noticing.
  const dev = byName(all, 'Ljós hjónaherbergi');
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
  eq('graphs default on', cas.showGraphs(cin({})), true);
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

} finally {
  rmSync(OUT, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} failure(s)` : '\nOK');
process.exitCode = failures ? 1 : 0;
