/**
 * English — the source catalogue. Every other locale is checked against this
 * one by `npm run test:card`, so a key added here without a translation
 * elsewhere fails the build rather than rendering blank in someone's language.
 *
 * Rules for adding a key:
 *
 * - **One key per use site, not per word.** "Current" is electrical current in
 *   the sensor grid and the *current temperature* in the climate block; they
 *   share a word in English and almost nowhere else. Keys that merge them
 *   cannot be translated correctly and the mistake is invisible until a native
 *   speaker sees it.
 * - **Chip labels are abbreviations on purpose.** They sit in a tile chip a few
 *   characters wide. A translation that spells the word out will wrap or clip;
 *   translate the abbreviation, not the term.
 * - **Placeholders are `{name}`**, substituted by `translate()`. Keep them in
 *   the translated string; word order is exactly what a locale gets to change.
 * - Product names, units and protocol names (Shelly, Wi-Fi, MQTT, dBm, CO₂,
 *   SSID, MAC, IP) are not translated and have no keys.
 */

import type { Translations } from '../localize';

export const EN: Translations = {
  // ── Sensor chips (abbreviated: these render inside a narrow tile chip) ──
  'chip.power': 'Power',
  'chip.apparent_power': 'App.P',
  'chip.reactive_power': 'Re.P',
  'chip.power_factor': 'PF',
  'chip.frequency': 'Freq',
  'chip.voltage': 'Volt',
  'chip.current': 'Curr',
  'chip.temperature': 'Temp',
  'chip.humidity': 'Hum',
  'chip.illuminance': 'Light',
  'chip.gas': 'Gas',
  'chip.battery': 'Batt',
  'chip.rssi': 'Wi-Fi',
  'chip.uptime': 'Up',
  'chip.motion': 'Motion',
  'chip.door': 'Door',
  'chip.flood': 'Flood',
  'chip.smoke': 'Smoke',
  'chip.vibration': 'Vibr',
  'chip.overtemp': 'Overtemp',
  'chip.overpower': 'Overpower',
  'chip.cloud': 'Cloud',
  'chip.ethernet': 'Ethernet',
  'chip.valve': 'Valve',
  'chip.battery_short': 'Batt',

  // ── Binary states shown as a chip value ──
  'state.clear': 'Clear',
  'state.ok': 'OK',
  'state.open': 'Open',
  'state.closed': 'Closed',
  'state.dry': 'Dry',
  'state.motion': 'Motion',
  'state.flooded': 'Flooded',
  'state.smoke': 'Smoke!',
  'state.gas': 'Gas!',
  'state.vibrating': 'Vibrating',
  'state.overtemp': 'Overtemp!',
  'state.overpower': 'Overpower!',
  'state.connected': 'Connected',
  'state.offline': 'Offline',

  // ── Cover / valve motion ──
  'state.opening': 'Opening…',
  'state.closing': 'Closing…',
  'state.partial': 'Partial',

  // ── Media player ──
  'media.playing': 'Playing',
  'media.paused': 'Paused',
  'media.idle': 'Idle',
  'media.unavailable': 'Unavailable',
  'media.off': 'Off',
  'media.default_group': 'Media',
  'media.station': 'Station…',
  'media.loading': 'Loading…',

  // ── Energy windows ──
  'energy.total': 'Energy',
  'energy.today': 'Today',
  'energy.week': 'Week',
  'energy.month': 'Month',

  // ── Relative time ──
  'time.never': 'Never',
  'time.just_now': 'Just now',
  'time.minutes_ago': '{n}m ago',
  'time.hours_ago': '{n}h ago',
  'time.days_ago': '{n}d ago',

  // ── Header, rooms, fleet summary ──
  'header.favourites': 'Favourites',
  'header.no_area': 'No Area',
  'header.needs_attention': 'Needs attention',
  'header.expand_all': 'Expand all',
  'header.collapse_all': 'Collapse all',
  'header.expand_every_room': 'Expand every room',
  'header.collapse_every_room': 'Collapse every room',
  'header.firmware': 'Firmware',
  'header.firmware_versions': '{n} firmware versions',
  'header.firmware_mixed': '{n} integrations on mixed versions',
  'view.empty': 'Nothing matches the “{name}” view.',
  'view.empty_gate': 'The {gate} filter removed the last {n} devices.',
  'view.empty_no_room': '{n} devices have no room, and a list of rooms does not include them — tick No Room as well.',
  'view.empty_and': 'A view’s filters all have to pass, so naming devices narrows the result rather than adding to it.',
  'header.newest': 'newest',

  // ── Actions ──
  'action.turn_on': 'Turn on',
  'action.turn_off': 'Turn off',
  'action.cancel': 'Cancel',
  'action.open': 'Open',
  'action.close': 'Close',
  'action.play': 'Play',
  'action.pause': 'Pause',
  'action.mute': 'Mute',
  'action.unmute': 'Unmute',
  'action.install': 'Install',
  'action.show_history': 'Show history',
  'action.dismiss': 'Dismiss',
  'action.heat': 'HEAT',
  'action.off': 'OFF',

  // ── Confirm-before-off ──
  'confirm.aria': 'Confirm turn off',
  'confirm.title': 'Turn off {name}?',
  'confirm.body': 'This device is set to ask before switching off.',

  // ── Tile labels ──
  'tile.brightness': 'Brightness',
  'tile.color_temp': 'Temp',
  'tile.white': 'White',
  'tile.valve': 'Valve',
  'tile.press': 'Press',
  'tile.idle': 'Idle',

  // ── Power-monitor row and gauge-arc labels (full words, there is room) ──
  'pm.power': 'Power',
  'pm.voltage': 'Voltage',
  'pm.current': 'Current',
  'pm.temperature': 'Temp',
  'pm.rssi': 'WiFi',
  'pm.uptime': 'Uptime',
  'pm.energy': 'Energy',

  // ── Media transport + misc tile labels ──
  'action.previous': 'Previous',
  'action.stop': 'Stop',
  'action.next': 'Next',
  'media.no_favourites': 'No favourites — star stations on the display',
  'media.volume': 'Volume {n}%',
  'state.on_short': 'ON',
  'state.off_short': 'OFF',
  'tile.now': 'Now',
  'tile.set': 'Set',
  'tile.heating': 'Heating',

  'pm.watts': 'watts',
  'state.active': 'active',
  'state.idle_low': 'idle',
  'detail.valve_pos': 'Valve: {n}%',
  'detail.signal': 'Wi-Fi: {quality} ({dbm} dBm)',
  'detail.uptime_inline': 'Up {value}',

  // Device-profile badge on the tile. Keys match DeviceProfile in types.ts;
  // 'generic' has no badge and so no key.
  'profile.relay': 'Relay',
  'profile.plug': 'Plug',
  'profile.dimmer': 'Dimmer',
  'profile.rgb': 'RGB',
  'profile.climate': 'TRV',
  'profile.cover': 'Roller',
  'profile.valve': 'Valve',
  'profile.lock': 'Lock',
  'profile.media': 'Media',
  'profile.energy': 'Energy',
  'profile.sensor': 'Sensor',
  'profile.input': 'Input',
  'profile.uni': 'UNI',
  'profile.wall_display': 'Display',

  // Sparkline row headers. Keys match HA device_class, and the English values
  // match what GRAPH_DC_LABELS produced before — the first word of each
  // GRAPH_SENSOR_DEFS label — so an untranslated locale renders exactly as the
  // card always has.
  'graph.power': 'Power',
  'graph.voltage': 'Voltage',
  'graph.current': 'Current',
  'graph.energy': 'Energy',
  'graph.apparent_power': 'App.',
  'graph.reactive_power': 'React.',
  'graph.frequency': 'Frequency',
  'graph.power_factor': 'Power',
  'graph.temperature': 'Temperature',
  'graph.humidity': 'Humidity',
  'graph.illuminance': 'Illuminance',
  'graph.carbon_dioxide': 'CO₂',
  'graph.gas': 'Gas',
  'graph.battery': 'Battery',
  'graph.signal_strength': 'RSSI',

  // ── Empty states ──
  'empty.no_climate': 'No climate entity',
  'empty.no_cover': 'No cover entity',
  'empty.no_valve': 'No valve entity',
  'empty.no_light': 'No light entity',
  'empty.no_sensor': 'No sensor',
  'empty.no_inputs': 'No input channels',
  'empty.no_gauge_readings': 'No readings to gauge',

  // ── Detail sheet ──
  'detail.all_entities': 'All Entities',
  'detail.configuration': 'Configuration',
  'detail.diagnostic': 'Diagnostic',
  'detail.diagnostics': 'Diagnostics',
  'detail.sensors': 'Sensors',
  'detail.alerts': 'Alerts',
  'detail.rssi': 'RSSI',
  'detail.uptime': 'Uptime',
  'detail.firmware': 'Firmware',
  'detail.relay_channels': 'Relay Channels',
  'detail.light_controls': 'Light Controls',
  'detail.input_channels': 'Input Channels',
  'detail.adc_inputs': 'ADC Inputs',
  'detail.outputs': 'Outputs',
  'detail.controls': 'Controls',
  'detail.climate': 'Climate',
  'detail.cover': 'Cover',
  'detail.valve': 'Valve',
  'detail.brightness': 'Brightness',
  /** Electrical current, in the sensor grid. */
  'detail.sensor_current': 'Current',
  'detail.sensor_power': 'Power',
  'detail.sensor_voltage': 'Voltage',
  'detail.sensor_temp': 'Temp',
  /** The *current temperature*, in the climate block. Not the same word twice. */
  'detail.climate_current': 'Current',
  'detail.fw_update': 'FW update: {from} → {to}',
  'detail.install_now': 'Install {version} now',

  // ── Card picker preview ──
  'picker.title': 'HA Device Dashboard',
  'picker.subtitle': 'Add the card to configure rooms and devices',

  // ── Delegated-controls notice ──
  'notice.native_controls': 'Native controls',
  'notice.delegate_one': '{n} device has extra controls (fan, vacuum, lock…). Turn on',
  'notice.delegate_many': '{n} devices have extra controls (fan, vacuum, lock…). Turn on',
  'notice.delegate_here': 'to show them.',
  'notice.delegate_editor': 'in the editor to show them.',
  'notice.discovery_shelly': '{n} more devices are in Home Assistant but not on this card — it is in Shelly mode.',
  'notice.discovery_hidden': '{n} devices are not shown:',
  'notice.hidden_integration': '{n} by integration',
  'notice.hidden_scope': '{n} by scope',
  'notice.hidden_domain': '{n} by domain',
  'notice.discovery_link': 'Discovery',
  'notice.discovery_here': 'has the settings.',
  'notice.discovery_editor': 'in the editor has the settings.',
  'attention.mute': 'Stop counting this integration',
  'attention.unmute': 'Count this integration again',
  'attention.muted': 'Not counted',

  // ── Errors ──
  'error.replay_needs_admin':
    'Replaying a press needs an admin login — Home Assistant refused the event',
};
