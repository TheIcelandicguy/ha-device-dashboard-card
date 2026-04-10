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
  // NOTE: device_tracker intentionally excluded — adds noise and slows discovery
]);


// ─── Device discovery ──────────────────────────────────────────────────────────

/**
 * Returns all Shelly devices, each with all their entities attached.
 */
export function getAllDevices(
  hass: HomeAssistant
): HADevice[] {
  const entityRegistry: Record<string, any> = (hass as any).entities ?? {};
  const deviceRegistry: Record<string, any> = (hass as any).devices ?? {};
  const areaRegistry: Record<string, any>   = (hass as any).areas   ?? {};

  const devices = new Map<string, HADevice>();

  // Iterate entity registry (indexed, fast) instead of hass.states (array, slow)
  for (const [entityId, regEntry] of Object.entries(entityRegistry)) {
    if (!regEntry?.device_id) continue;
    if (regEntry.hidden_by) continue;

    const domain = entityId.split('.')[0];
    if (!DEVICE_DOMAINS.has(domain)) continue;

    const platform: string = (regEntry.platform ?? '').toLowerCase();
    if (platform !== 'shelly') continue;

    const deviceId: string = regEntry.device_id;

    if (!devices.has(deviceId)) {
      const devInfo: any = deviceRegistry[deviceId];
      if (!devInfo) continue;

      const configUrl: string = devInfo.configuration_url ?? '';
      const ipMatch = configUrl.match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/);
      const mfr: string = (devInfo.manufacturer ?? '').toLowerCase();
      const isShelly = mfr.includes('shelly') || platform === 'shelly';

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
    if (!device.isShelly && platform === 'shelly') {
      device.isShelly = true;
      device.integration = 'shelly';
    }

    // Get live state from hass.states (O(1) lookup by key, not iteration)
    const state = hass.states[entityId];
    device.entities.push({
      entity_id:  entityId,
      domain,
      state:      state?.state ?? 'unavailable',
      attributes: (state?.attributes ?? {}) as Record<string, unknown>,
      device_id:  deviceId,
      area_id:    regEntry.area_id,
      platform,
    });
  }

  // Merge sub-devices into their parent when they represent the same physical
  // device (e.g. Shelly 2.5 registers a main device + per-channel sub-devices).
  // We only merge when the sub-device's via_device_id points to a collected device
  // AND they share the same configuration_url host (same IP → same hardware unit),
  // OR the child has no config URL but shares the same integration platform.
  const toMerge = new Set<string>();
  for (const [deviceId, device] of devices) {
    if (toMerge.has(deviceId)) continue;
    const devInfo: any = deviceRegistry[deviceId];
    const parentId: string | undefined = devInfo?.via_device_id;
    if (!parentId || !devices.has(parentId) || toMerge.has(parentId)) continue;

    const parentInfo: any = deviceRegistry[parentId];
    const childUrl: string  = devInfo?.configuration_url  ?? '';
    const parentUrl: string = parentInfo?.configuration_url ?? '';

    const getHost = (url: string) => { const m = url.match(/https?:\/\/([^/]+)/); return m ? m[1] : ''; };
    const sameHost     = childUrl && parentUrl && getHost(childUrl) === getHost(parentUrl);
    const subComponent = !childUrl && parentUrl && device.integration === devices.get(parentId)!.integration;

    if (!sameHost && !subComponent) continue;

    const parent = devices.get(parentId)!;
    parent.entities.push(...device.entities);
    if (!parent.ip    && device.ip)    parent.ip    = device.ip;
    if (!parent.model && device.model) parent.model = device.model;
    toMerge.add(deviceId);
  }
  for (const id of toMerge) devices.delete(id);

  return Array.from(devices.values())
    .filter(d => d.entities.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
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
  dimmer:       'Dimmer',
  rgb:          'RGB',
  climate:      'TRV',
  cover:        'Roller',
  valve:        'Valve',
  energy:       'Energy',
  sensor:       'Sensor',
  input:        'Input',
  uni:          'UNI',
  wall_display: 'Display',
  generic:      '',
};

/**
 * Default tile block order for each device profile.
 * Users can override this per-card, per-area, or per-device.
 */
export const PROFILE_DEFAULT_BLOCKS: Record<DeviceProfile, TileBlockId[]> = {
  relay:        ['name_row', 'relay_channels', 'sensors', 'graph', 'power_bar', 'virtual_controls', 'badges'],
  plug:         ['name_row', 'sensors', 'graph', 'power_bar', 'virtual_controls', 'badges'],
  dimmer:       ['name_row', 'dimmer', 'sensors', 'graph', 'virtual_controls', 'badges'],
  rgb:          ['name_row', 'dimmer', 'sensors', 'graph', 'virtual_controls', 'badges'],
  climate:      ['name_row', 'sensors', 'trv_control', 'virtual_controls', 'badges'],
  cover:        ['name_row', 'cover_controls', 'sensors', 'virtual_controls', 'badges'],
  valve:        ['name_row', 'sensors', 'valve_controls', 'virtual_controls', 'badges'],
  energy:       ['name_row', 'sensors', 'graph', 'virtual_controls', 'badges'],
  sensor:       ['name_row', 'sensors', 'graph', 'virtual_controls', 'badges'],
  input:        ['name_row', 'sensors', 'input_channels', 'virtual_controls', 'badges'],
  uni:          ['name_row', 'input_channels', 'sensors', 'virtual_controls', 'badges'],
  wall_display: ['name_row', 'sensors', 'trv_control', 'virtual_controls', 'badges'],
  generic:      ['name_row', 'sensors', 'virtual_controls', 'badges'],
};

/**
 * Classifies any HA device into a DeviceProfileResult.
 * Type is derived from entity domains (most reliable).
 * Generation is derived from the model string (Shelly only).
 */
export function getDeviceProfile(device: HADevice): DeviceProfileResult {
  const modelLower = (device.model ?? '').toLowerCase();
  const domains = new Set(device.entities.map(e => e.domain));

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
  } else if (domains.has('light')) {
    const hasColorMode = device.entities.some(e => {
      if (e.domain !== 'light') return false;
      const modes: string[] = (e.attributes?.supported_color_modes as string[]) ?? [];
      return modes.some(m => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(m));
    });
    type = hasColorMode ? 'rgb' : 'dimmer';
  } else if (
    device.entities.some(e => e.domain === 'event' && (e.attributes as any)?.device_class === 'button') &&
    !device.entities.some(e => e.domain === 'switch' && /_(switch|relay)_\d/.test(e.entity_id))
  ) {
    type = 'input';
  } else if (domains.has('switch')) {
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
    // No controllable domain — sensor/input/energy device
    const hasPower = device.entities.some(e =>
      e.domain === 'sensor' && (
        (e.attributes as any)?.device_class === 'power' ||
        (e.attributes as any)?.device_class === 'energy' ||
        (e.attributes as any)?.device_class === 'apparent_power'
      )
    );
    const hasInputBS = device.entities.some(e =>
      (e.domain === 'binary_sensor' && (
        e.entity_id.includes('input') || e.entity_id.includes('button') ||
        e.entity_id.includes('channel') ||
        (e.attributes as any)?.device_class == null
      )) ||
      (e.domain === 'event' && (
        (e.attributes as any)?.device_class === 'button' ||
        e.entity_id.includes('channel') || e.entity_id.includes('input')
      ))
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
