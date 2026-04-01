import { HomeAssistant } from 'custom-card-helpers';
import {
  HADevice, HAEntity, DeviceProfileResult, DeviceProfile, DeviceGen,
  TileBlockId,
} from './types';

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Entity domains treated as "device-like" for grouping purposes */
const DEVICE_DOMAINS = new Set([
  'switch', 'light', 'cover', 'valve', 'climate', 'sensor', 'binary_sensor',
  'fan', 'lock', 'media_player', 'vacuum', 'alarm_control_panel', 'humidifier',
  'water_heater', 'update', 'button', 'number', 'select', 'text', 'camera',
  'event',
]);

/** Domains that can appear as standalone "virtual" tiles */
const VIRTUAL_DOMAINS = new Set([
  'script', 'scene', 'automation',
  'input_boolean', 'input_number', 'input_text', 'input_select',
  'input_datetime', 'input_button', 'timer', 'counter',
]);

// ─── Device discovery ──────────────────────────────────────────────────────────

/**
 * Returns all HA devices, each with all their entities attached.
 * Filtered by integrations when provided (e.g. ['shelly','zha','hue']).
 * When integrations is undefined/empty, ALL platforms are included.
 */
export function getAllDevices(
  hass: HomeAssistant,
  integrations?: string[]
): HADevice[] {
  const entityRegistry: Record<string, any> = (hass as any).entities ?? {};
  const deviceRegistry: Record<string, any> = (hass as any).devices ?? {};
  const areaRegistry: Record<string, any>   = (hass as any).areas   ?? {};

  const filterPlatforms = integrations && integrations.length > 0
    ? new Set(integrations.map(s => s.toLowerCase()))
    : null;

  const devices = new Map<string, HADevice>();

  for (const state of Object.values(hass.states)) {
    const domain = state.entity_id.split('.')[0];
    if (!DEVICE_DOMAINS.has(domain)) continue;

    const regEntry: any = entityRegistry[state.entity_id];
    if (!regEntry?.device_id) continue;
    if (regEntry.hidden_by) continue;

    // Integration filter
    const platform: string = (regEntry.platform ?? '').toLowerCase();
    if (filterPlatforms && !filterPlatforms.has(platform)) continue;

    const deviceId: string = regEntry.device_id;

    if (!devices.has(deviceId)) {
      const devInfo: any = deviceRegistry[deviceId];
      if (!devInfo) continue;

      const configUrl: string = devInfo.configuration_url ?? '';
      const ipMatch = configUrl.match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/);
      const mfr: string = (devInfo.manufacturer ?? '').toLowerCase();
      const isShelly = mfr.includes('shelly') || platform === 'shelly';

      // Resolve area: device area > entity area
      const areaId = devInfo.area_id ?? regEntry.area_id;
      const area = areaId ? (areaRegistry[areaId]?.name as string | undefined) : undefined;

      devices.set(deviceId, {
        device_id:   deviceId,
        name:        devInfo.name_by_user ?? devInfo.name ?? deviceId,
        area,
        model:       devInfo.model,
        sw_version:  devInfo.sw_version,
        ip:          ipMatch ? ipMatch[1] : undefined,
        isShelly,
        integration: platform,
        entities:    [],
      });
    }

    const device = devices.get(deviceId)!;

    // Mark Shelly if any entity's platform says so
    if (!device.isShelly && platform === 'shelly') {
      device.isShelly = true;
      device.integration = 'shelly';
    }

    device.entities.push({
      entity_id:  state.entity_id,
      domain,
      state:      state.state,
      attributes: state.attributes as Record<string, unknown>,
      device_id:  deviceId,
      area_id:    regEntry.area_id,
      platform,
    });
  }

  return Array.from(devices.values())
    .filter(d => d.entities.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns virtual entity tiles: scripts, scenes, automations, helpers.
 * These are not backed by a device registry entry.
 */
export function getVirtualDevices(
  hass: HomeAssistant,
  entityDomains?: string[]
): HADevice[] {
  const entityRegistry: Record<string, any> = (hass as any).entities ?? {};
  const areaRegistry: Record<string, any>   = (hass as any).areas   ?? {};

  const allowedDomains = entityDomains && entityDomains.length > 0
    ? new Set(entityDomains.map(d => d.replace('.*', '')))
    : VIRTUAL_DOMAINS;

  const result: HADevice[] = [];

  for (const state of Object.values(hass.states)) {
    const domain = state.entity_id.split('.')[0];
    if (!allowedDomains.has(domain)) continue;

    const regEntry: any = entityRegistry[state.entity_id];
    // Virtual entities should NOT have a device_id
    if (regEntry?.device_id) continue;
    if (regEntry?.hidden_by) continue;

    const areaId = regEntry?.area_id;
    const area = areaId ? (areaRegistry[areaId]?.name as string | undefined) : undefined;
    const name = (state.attributes as any)?.friendly_name
      ?? state.entity_id.split('.')[1].replace(/_/g, ' ');

    result.push({
      device_id:   state.entity_id,  // entity_id serves as device_id for virtual tiles
      name,
      area,
      isShelly:    false,
      integration: domain,
      isVirtual:   true,
      entities: [{
        entity_id:  state.entity_id,
        domain,
        state:      state.state,
        attributes: state.attributes as Record<string, unknown>,
        platform:   domain,
      }],
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Builds a HADevice for a specific device_id.
 * Used for extra_devices entries not auto-discovered.
 */
export function getDeviceById(hass: HomeAssistant, deviceId: string): HADevice | null {
  const deviceRegistry: Record<string, any> = (hass as any).devices ?? {};
  const entityRegistry: Record<string, any> = (hass as any).entities ?? {};
  const areaRegistry: Record<string, any>   = (hass as any).areas   ?? {};

  const devInfo: any = deviceRegistry[deviceId];
  if (!devInfo) return null;

  const configUrl: string = devInfo.configuration_url ?? '';
  const ipMatch = configUrl.match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/);
  const mfr: string = (devInfo.manufacturer ?? '').toLowerCase();
  const areaId = devInfo.area_id;
  const area = areaId ? (areaRegistry[areaId]?.name as string | undefined) : undefined;

  const device: HADevice = {
    device_id:   deviceId,
    name:        devInfo.name_by_user ?? devInfo.name ?? deviceId,
    area,
    model:       devInfo.model,
    sw_version:  devInfo.sw_version,
    ip:          ipMatch ? ipMatch[1] : undefined,
    isShelly:    mfr.includes('shelly'),
    integration: '',
    entities:    [],
  };

  for (const state of Object.values(hass.states)) {
    const regEntry: any = entityRegistry[state.entity_id];
    if (regEntry?.device_id !== deviceId) continue;
    if (regEntry?.hidden_by) continue;
    const domain = state.entity_id.split('.')[0];
    const platform: string = (regEntry.platform ?? '').toLowerCase();
    if (!device.isShelly && platform === 'shelly') {
      device.isShelly = true;
      device.integration = 'shelly';
    }
    device.entities.push({
      entity_id: state.entity_id,
      domain,
      state:     state.state,
      attributes: state.attributes as Record<string, unknown>,
      device_id: deviceId,
      platform,
    });
  }

  if (device.entities.length === 0) return null;
  if (!device.integration && device.entities[0]) {
    device.integration = device.entities[0].platform ?? '';
  }
  return device;
}

/** Returns the HA area name for an area_id */
export function getAreaName(hass: HomeAssistant, areaId?: string): string | undefined {
  if (!areaId) return undefined;
  return (hass as any).areas?.[areaId]?.name;
}

// ─── Profile engine ────────────────────────────────────────────────────────────

/** Label shown on tile badge for each profile type */
const PROFILE_LABELS: Record<DeviceProfile, string> = {
  relay:        'Relay',
  plug:         'Plug',
  switch:       'Switch',
  dimmer:       'Dimmer',
  rgb:          'RGB',
  light:        'Light',
  climate:      'TRV',
  cover:        'Roller',
  fan:          'Fan',
  lock:         'Lock',
  vacuum:       'Vacuum',
  media_player: 'Media',
  alarm:        'Alarm',
  humidifier:   'Humid.',
  valve:        'Valve',
  energy:       'Energy',
  sensor:       'Sensor',
  input:        'Input',
  camera:       'Camera',
  uni:          'UNI',
  wall_display: 'Display',
  script:       'Script',
  scene:        'Scene',
  automation:   'Auto',
  helper:       'Helper',
  weather:      'Weather',
  person:       'Person',
  generic:      '',
};

/**
 * Default tile block order for each device profile.
 * Users can override this per-card, per-area, or per-device.
 */
export const PROFILE_DEFAULT_BLOCKS: Record<DeviceProfile, TileBlockId[]> = {
  relay:        ['name_row', 'sensors', 'graph', 'power_bar', 'badges'],
  plug:         ['name_row', 'sensors', 'graph', 'power_bar', 'badges'],
  switch:       ['name_row', 'sensors', 'badges'],
  dimmer:       ['name_row', 'dimmer', 'sensors', 'graph', 'badges'],
  rgb:          ['name_row', 'dimmer', 'sensors', 'graph', 'badges'],
  light:        ['name_row', 'dimmer', 'sensors', 'badges'],
  climate:      ['name_row', 'trv_control', 'sensors', 'badges'],
  cover:        ['name_row', 'cover_controls', 'sensors', 'badges'],
  fan:          ['name_row', 'fan_controls', 'sensors', 'badges'],
  lock:         ['name_row', 'sensors', 'badges'],
  vacuum:       ['name_row', 'sensors', 'badges'],
  media_player: ['name_row', 'media_controls', 'badges'],
  alarm:        ['name_row', 'sensors', 'badges'],
  humidifier:   ['name_row', 'sensors', 'badges'],
  valve:        ['name_row', 'valve_controls', 'sensors', 'badges'],
  energy:       ['name_row', 'sensors', 'graph', 'badges'],
  sensor:       ['name_row', 'sensors', 'graph', 'badges'],
  input:        ['name_row', 'input_channels', 'badges'],
  camera:       ['name_row', 'badges'],
  uni:          ['name_row', 'input_channels', 'sensors', 'badges'],
  wall_display: ['name_row', 'trv_control', 'sensors', 'badges'],
  script:       ['name_row'],
  scene:        ['name_row'],
  automation:   ['name_row', 'sensors'],
  helper:       ['name_row'],
  weather:      ['name_row', 'sensors'],
  person:       ['name_row', 'sensors'],
  generic:      ['name_row', 'sensors', 'badges'],
};

/**
 * Classifies any HA device into a DeviceProfileResult.
 * Type is derived from entity domains (most reliable).
 * Generation is derived from the model string (Shelly only).
 */
export function getDeviceProfile(device: HADevice): DeviceProfileResult {
  const modelLower = (device.model ?? '').toLowerCase();
  const domains = new Set(device.entities.map(e => e.domain));

  // Virtual device types
  if (device.isVirtual) {
    const vDomain = device.entities[0]?.domain ?? 'generic';
    const vType: DeviceProfile =
      vDomain === 'script'     ? 'script'     :
      vDomain === 'scene'      ? 'scene'       :
      vDomain === 'automation' ? 'automation'  :
      vDomain === 'weather'    ? 'weather'     :
      vDomain === 'person'     ? 'person'      :
      VIRTUAL_DOMAINS.has(vDomain) ? 'helper' : 'generic';
    return { type: vType, gen: 'other', label: PROFILE_LABELS[vType], integration: device.integration };
  }

  // ── Type detection (domain-based) ───────────────────────────────────────────

  let type: DeviceProfile;

  if (domains.has('climate') && domains.has('switch')) {
    type = 'wall_display';
  } else if (domains.has('climate')) {
    type = 'climate';
  } else if (domains.has('cover')) {
    type = 'cover';
  } else if (domains.has('valve')) {
    type = 'valve';
  } else if (domains.has('vacuum')) {
    type = 'vacuum';
  } else if (domains.has('fan')) {
    type = 'fan';
  } else if (domains.has('lock')) {
    type = 'lock';
  } else if (domains.has('alarm_control_panel')) {
    type = 'alarm';
  } else if (domains.has('humidifier')) {
    type = 'humidifier';
  } else if (domains.has('media_player')) {
    type = 'media_player';
  } else if (domains.has('camera')) {
    type = 'camera';
  } else if (domains.has('light')) {
    const hasColorMode = device.entities.some(e => {
      if (e.domain !== 'light') return false;
      const modes: string[] = (e.attributes?.supported_color_modes as string[]) ?? [];
      return modes.some(m => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(m));
    });
    type = hasColorMode ? 'rgb' : 'dimmer';
  } else if (domains.has('switch')) {
    if (device.isShelly) {
      if (modelLower.includes('uni')) {
        type = 'uni';
      } else if (
        modelLower.includes('plug') ||
        (!device.entities.some(e => e.domain === 'binary_sensor' && e.entity_id.includes('input')) &&
          !modelLower.includes('1pm') && !modelLower.includes('2pm') && !modelLower.includes('pro '))
      ) {
        type = 'plug';
      } else {
        type = 'relay';
      }
    } else {
      type = modelLower.includes('plug') || modelLower.includes('outlet') ? 'plug' : 'switch';
    }
  } else {
    // No controllable domain — sensor/input/energy device
    const hasPower = device.entities.some(e =>
      e.domain === 'sensor' && (
        (e.attributes as any)?.device_class === 'power' ||
        (e.attributes as any)?.device_class === 'energy' ||
        (e.attributes as any)?.device_class === 'apparent_power'
      )
    );
    const hasInputBS = device.entities.some(e =>
      e.domain === 'binary_sensor' && (
        e.entity_id.includes('input') || e.entity_id.includes('button') ||
        (e.attributes as any)?.device_class == null
      )
    );
    const hasEnvSensor = device.entities.some(e =>
      e.domain === 'sensor' && ['temperature', 'humidity', 'illuminance', 'moisture', 'battery', 'gas']
        .includes((e.attributes as any)?.device_class ?? '')
    );
    const hasAlertBS = device.entities.some(e =>
      e.domain === 'binary_sensor' && ['motion', 'door', 'window', 'moisture', 'smoke', 'gas', 'vibration', 'opening']
        .includes((e.attributes as any)?.device_class ?? '')
    );

    if (hasPower) type = 'energy';
    else if (hasInputBS && !hasEnvSensor && !hasAlertBS) type = 'input';
    else type = 'sensor';
  }

  // ── Generation (Shelly only) ─────────────────────────────────────────────────

  const gen = device.isShelly ? detectShellyGen(device.model ?? '') : 'other';

  return {
    type,
    gen,
    label: PROFILE_LABELS[type],
    integration: device.integration,
  };
}

/**
 * Detects Shelly hardware generation from the HA device model string.
 */
export function detectShellyGen(model: string): DeviceGen {
  const m = model.toLowerCase();
  if (m.includes('blu') || m.includes('bluetooth')) return 'ble';
  if (m.includes('g4') || m.includes('gen4') || m.includes('gen 4')) return 4;
  if (m.includes('g3') || m.includes('gen3') || m.includes('gen 3')) return 3;
  if (/^s3/i.test(model)) return 3;
  if (m.includes('plus') || m.includes('pro')) return 2;
  if (/^sn/i.test(model)) return 2;
  return 1;
}

// ─── Integration badge helpers ─────────────────────────────────────────────────

/** Display label for known integration platforms */
export const INTEGRATION_LABELS: Record<string, string> = {
  shelly:         'Shelly',
  zha:            'ZHA',
  mqtt:           'MQTT',
  z2m:            'Z2M',
  zigbee2mqtt:    'Z2M',
  hue:            'Hue',
  deconz:         'deCONZ',
  matter:         'Matter',
  homekit:        'HomeKit',
  tuya:           'Tuya',
  tplink:         'Kasa',
  esphome:        'ESPHome',
  wled:           'WLED',
  tasmota:        'Tasmota',
  konnected:      'Konnected',
  nest:           'Nest',
  ring:           'Ring',
  lifx:           'LIFX',
  nanoleaf:       'Nanoleaf',
  sonos:          'Sonos',
};

export function getIntegrationLabel(platform: string): string {
  return INTEGRATION_LABELS[platform.toLowerCase()] ?? platform.toUpperCase().slice(0, 6);
}

// ─── Entity helpers ────────────────────────────────────────────────────────────

export function getEntityByDomain(entities: HAEntity[], domain: string): HAEntity | undefined {
  return entities.find(e => e.domain === domain);
}

export function getEntitiesByDomain(entities: HAEntity[], domain: string): HAEntity[] {
  return entities.filter(e => e.domain === domain);
}

// ─── Format functions ──────────────────────────────────────────────────────────

export function formatPower(w: number): string {
  if (w >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${w.toFixed(1)} W`;
}

export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(3)} kWh`;
}

export function formatVoltage(v: number): string {
  return `${v.toFixed(1)} V`;
}

export function formatCurrent(a: number): string {
  return `${a.toFixed(3)} A`;
}

export function formatTemp(c: number): string {
  return `${c.toFixed(1)} °C`;
}

export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function rssiToQuality(rssi: number): string {
  if (rssi >= -50) return 'Excellent';
  if (rssi >= -60) return 'Good';
  if (rssi >= -70) return 'Fair';
  return 'Poor';
}

export function formatApparentPower(va: number): string {
  return `${va.toFixed(1)} VA`;
}

export function formatReactivePower(var_: number): string {
  return `${var_.toFixed(1)} VAr`;
}

export function formatFrequency(hz: number): string {
  return `${hz.toFixed(2)} Hz`;
}

export function formatHumidity(pct: number): string {
  return `${pct.toFixed(1)} %`;
}

export function formatIlluminance(lx: number): string {
  if (lx >= 10000) return `${(lx / 1000).toFixed(1)} klx`;
  return `${Math.round(lx)} lx`;
}

export function formatPpm(ppm: number): string {
  return `${Math.round(ppm)} ppm`;
}

export function formatPercent(v: number): string {
  return `${Math.round(v)} %`;
}

// ─── Network helpers ───────────────────────────────────────────────────────────

/** Returns true only for RFC-1918 / link-local addresses */
export function isPrivateIp(ip: string): boolean {
  return (
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^169\.254\./.test(ip)
  );
}

// ─── Graphable sensor device classes ──────────────────────────────────────────

export const GRAPH_SENSOR_DEFS: Array<{
  key: string;
  label: string;
  unit: string;
  group: 'Electrical' | 'Environmental' | 'Device';
  defaultColor: string;
}> = [
  // Electrical
  { key: 'power',          label: 'Power',        unit: 'W',   group: 'Electrical',   defaultColor: '#f4601e' },
  { key: 'voltage',        label: 'Voltage',       unit: 'V',   group: 'Electrical',   defaultColor: '#a78bfa' },
  { key: 'current',        label: 'Current',       unit: 'A',   group: 'Electrical',   defaultColor: '#fbbf24' },
  { key: 'energy',         label: 'Energy',        unit: 'kWh', group: 'Electrical',   defaultColor: '#4ade80' },
  { key: 'apparent_power', label: 'App. Power',    unit: 'VA',  group: 'Electrical',   defaultColor: '#f472b6' },
  { key: 'reactive_power', label: 'React. Power',  unit: 'VAr', group: 'Electrical',   defaultColor: '#818cf8' },
  { key: 'frequency',      label: 'Frequency',     unit: 'Hz',  group: 'Electrical',   defaultColor: '#34d399' },
  { key: 'power_factor',   label: 'Power Factor',  unit: '%',   group: 'Electrical',   defaultColor: '#fb923c' },
  // Environmental
  { key: 'temperature',    label: 'Temperature',   unit: '°C',  group: 'Environmental', defaultColor: '#4fc3f7' },
  { key: 'humidity',       label: 'Humidity',      unit: '%',   group: 'Environmental', defaultColor: '#2dd4bf' },
  { key: 'illuminance',    label: 'Illuminance',   unit: 'lx',  group: 'Environmental', defaultColor: '#fde047' },
  { key: 'carbon_dioxide', label: 'CO₂',           unit: 'ppm', group: 'Environmental', defaultColor: '#a3e635' },
  { key: 'gas',            label: 'Gas',           unit: '%',   group: 'Environmental', defaultColor: '#fb923c' },
  // Device
  { key: 'battery',        label: 'Battery',       unit: '%',   group: 'Device',       defaultColor: '#86efac' },
  { key: 'signal_strength', label: 'RSSI',         unit: 'dBm', group: 'Device',       defaultColor: '#7dd3fc' },
];

/** Human-readable labels for sparkline row headers */
export const GRAPH_DC_LABELS: Record<string, string> = Object.fromEntries(
  GRAPH_SENSOR_DEFS.map(d => [d.key, d.label.split(' ')[0]])
);
