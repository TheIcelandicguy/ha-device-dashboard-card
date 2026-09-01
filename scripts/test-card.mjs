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
    'src/design-scope.ts', '--outDir', OUT,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--moduleResolution', 'node',
  ], { stdio: 'inherit' });
  // The project is "type": "module", which would make these .js files ESM.
  writeFileSync(join(OUT, 'package.json'), '{"type":"commonjs"}');

  const req = createRequire(import.meta.url);
  const h = req(join(process.cwd(), OUT, 'helpers.js'));
  const cas = req(join(process.cwd(), OUT, 'cascade.js'));
  const ds  = req(join(process.cwd(), OUT, 'design-scope.js'));
  const att = req(join(process.cwd(), OUT, 'attention.js'));
  const hass = fleet();
  const byName = (list, name) => list.find(d => d.name === name);

  console.log('\ngetAllDevices — Shelly mode');
  const shelly = h.getAllDevices(hass);
  ok('drops non-Shelly integrations', !byName(shelly, 'Hue lamp'));
  ok('drops the device_pulse shadow', shelly.filter(d => d.name === 'Bedroom dimmer').length === 1);
  eq('keeps exactly the Shelly devices', shelly.map(d => d.name).sort(),
    ['Bare device', 'Bedroom dimmer', 'Bedroom switch', 'Garage switch', 'Shelly 2.5']);

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
  ok('all are button-style', ch3.every(c => c.isButton));
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

} finally {
  rmSync(OUT, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} failure(s)` : '\nOK');
process.exitCode = failures ? 1 : 0;
