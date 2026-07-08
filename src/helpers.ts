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
 * Shelly model → profile registry. HA gives us the model string (unambiguous),
 * so this fixes the cases entity-signature detection gets wrong (1PM/2PM read as
 * "plug", i4-with-relay, sensor-only devices). First match wins; order matters
 * (specific before generic). Only applied to Shelly devices, and only to refine
 * the "weak" entity-signature cluster — strong signals (cover/climate/valve/
 * light/wall_display) always win, since they reflect the device's actual config.
 */
export const SHELLY_MODELS: Array<{ match: RegExp; profile: DeviceProfile }> = [
  { match: /wall\s*display/i,                              profile: 'wall_display' },
  { match: /\btrv\b/i,                                     profile: 'climate' },
  { match: /smoke|flood|motion|door.?\/?\s?window|\bh\s?&\s?t\b/i, profile: 'sensor' },
  { match: /button/i,                                      profile: 'input' },
  { match: /\bi[34]\b/i,                                   profile: 'input' },
  { match: /valve/i,                                       profile: 'valve' },
  { match: /rgbw/i,                                        profile: 'rgb' },
  { match: /dimmer/i,                                      profile: 'dimmer' },
  { match: /plug/i,                                        profile: 'plug' },
  { match: /\b3?em\b/i,                                    profile: 'energy' },
  { match: /\buni\b/i,                                     profile: 'uni' },
  { match: /\b[12]pm\b|\bpro\b|\bshelly\s*(plus\s*)?[12](\.5|l)?\b|\b[12]l\b/i, profile: 'relay' },
];

/** Match a Shelly model string to a profile, or undefined if unknown. */
export function matchShellyModel(model: string | undefined): DeviceProfile | undefined {
  if (!model) return undefined;
  for (const m of SHELLY_MODELS) if (m.match.test(model)) return m.profile;
  return undefined;
}

/**
 * Curated default sensor chips per profile — the lowest-priority layer under the
 * user's device/area/global `sensors`. With no override, a tile shows only these
 * (if present) instead of every detected chip, so relays show power/energy, a
 * smoke sensor shows smoke+battery, etc. Diagnostics (rssi/ip/fw/uptime/cloud)
 * are hidden by default. A profile absent here = "show all" (no opinion).
 */
export const PROFILE_DEFAULT_SENSORS: Partial<Record<DeviceProfile, string[]>> = {
  relay:        ['power', 'energy', 'voltage', 'current', 'temperature', 'overtemp', 'overpower'],
  plug:         ['power', 'energy', 'voltage', 'current', 'overtemp', 'overpower'],
  energy:       ['power', 'energy', 'voltage', 'current', 'apparent_power', 'power_factor', 'frequency'],
  dimmer:       ['power', 'energy', 'temperature', 'overtemp'],
  rgb:          ['power', 'energy'],
  cover:        ['power', 'energy', 'temperature'],
  climate:      ['temperature', 'humidity', 'battery'],
  wall_display: ['temperature', 'humidity', 'illuminance'],
  valve:        ['temperature'],
  sensor:       ['temperature', 'humidity', 'illuminance', 'co2', 'gas', 'battery',
                 'motion', 'door', 'flood', 'smoke', 'vibration'],
  input:        ['battery'],
  uni:          ['temperature', 'battery'],
  // 'generic' omitted → show all
};

/** Human labels for tile blocks — used by the detail-dialog Customize panel. */
export const BLOCK_LABELS: Record<TileBlockId, string> = {
  name_row:         'Name & toggle',
  sensors:          'Sensor chips',
  graph:            'Graph',
  dimmer:           'Brightness / colour',
  cover_controls:   'Cover controls',
  trv_control:      'Temperature control',
  valve_controls:   'Valve controls',
  input_channels:   'Input channels',
  relay_channels:   'Relay channels',
  power_bar:        'Power bar',
  virtual_controls: 'Virtual controls',
  badges:           'Type & gen badges',
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

  // ── Model refinement (Shelly) ────────────────────────────────────────────────
  // The model string is unambiguous, so use it to reclassify the "weak"
  // entity-signature cluster (fixes 1PM/2PM read as plug, i4 as sensor, etc.).
  // Strong entity signals (cover/climate/valve/dimmer/rgb/wall_display) reflect
  // the device's actual configuration and are left untouched.
  const WEAK_TYPES = new Set<DeviceProfile>(['relay', 'plug', 'energy', 'sensor', 'input', 'uni', 'generic']);
  if (device.isShelly && WEAK_TYPES.has(type)) {
    const modelType = matchShellyModel(device.model);
    if (modelType) type = modelType;
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

/** Placeholder shown when a value is missing / non-numeric. */
export const NA = '—';

export function formatPower(w: number): string {
  if (!Number.isFinite(w)) return NA;
  if (w >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${w.toFixed(1)} W`;
}

export function formatEnergy(kwh: number): string {
  if (!Number.isFinite(kwh)) return NA;
  return `${kwh.toFixed(3)} kWh`;
}

export function formatVoltage(v: number): string {
  if (!Number.isFinite(v)) return NA;
  return `${v.toFixed(1)} V`;
}

export function formatCurrent(a: number): string {
  if (!Number.isFinite(a)) return NA;
  return `${a.toFixed(3)} A`;
}

export function formatTemp(c: number): string {
  if (!Number.isFinite(c)) return NA;
  return `${c.toFixed(1)} °C`;
}

export function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return NA;
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function rssiToQuality(rssi: number): string {
  if (!Number.isFinite(rssi)) return NA;
  if (rssi >= -50) return 'Excellent';
  if (rssi >= -60) return 'Good';
  if (rssi >= -70) return 'Fair';
  return 'Poor';
}

export function formatApparentPower(va: number): string {
  if (!Number.isFinite(va)) return NA;
  return `${va.toFixed(1)} VA`;
}

export function formatReactivePower(var_: number): string {
  if (!Number.isFinite(var_)) return NA;
  return `${var_.toFixed(1)} VAr`;
}

export function formatFrequency(hz: number): string {
  if (!Number.isFinite(hz)) return NA;
  return `${hz.toFixed(2)} Hz`;
}

export function formatHumidity(pct: number): string {
  if (!Number.isFinite(pct)) return NA;
  return `${pct.toFixed(1)} %`;
}

export function formatIlluminance(lx: number): string {
  if (!Number.isFinite(lx)) return NA;
  if (lx >= 10000) return `${(lx / 1000).toFixed(1)} klx`;
  return `${Math.round(lx)} lx`;
}

export function formatPpm(ppm: number): string {
  if (!Number.isFinite(ppm)) return NA;
  return `${Math.round(ppm)} ppm`;
}

export function formatPercent(v: number): string {
  if (!Number.isFinite(v)) return NA;
  return `${Math.round(v)} %`;
}

// ─── Graph data helpers ────────────────────────────────────────────────────────

/**
 * Downsample a time series to ≤ 2×target points while preserving peaks:
 * points are bucketed by time and each bucket keeps its min and max sample.
 * Raw Shelly power sensors can produce tens of thousands of points per day —
 * rendering those into SVG polylines is what melts the tab.
 */
export function downsamplePoints(
  points: Array<{ t: number; v: number }>,
  target = 240,
): Array<{ t: number; v: number }> {
  if (points.length <= target * 2) return points;
  const t0 = points[0].t;
  const span = (points[points.length - 1].t - t0) || 1;
  const out: Array<{ t: number; v: number }> = [];
  let bucket = 0;
  let bMin = points[0], bMax = points[0];
  const flush = () => {
    if (bMin === bMax) out.push(bMin);
    else if (bMin.t <= bMax.t) out.push(bMin, bMax);
    else out.push(bMax, bMin);
  };
  for (const p of points) {
    const idx = Math.min(target - 1, Math.floor(((p.t - t0) / span) * target));
    if (idx !== bucket) {
      flush();
      bucket = idx; bMin = p; bMax = p;
    } else {
      if (p.v < bMin.v) bMin = p;
      if (p.v > bMax.v) bMax = p;
    }
  }
  flush();
  return out;
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

/**
 * graph_sensors / graph_sensor_colors are keyed by HA device_class, but the
 * sensor-chip UI uses the shorter chip keys 'co2' and 'rssi'. Older configs
 * (and the per-sensor "add to graph" button) may store those. Normalize any
 * graph key to its device_class so selection, colours and matching line up.
 */
export const GRAPH_KEY_ALIASES: Record<string, string> = {
  co2: 'carbon_dioxide',
  rssi: 'signal_strength',
};
export function normalizeGraphKey(key: string): string {
  return GRAPH_KEY_ALIASES[key] ?? key;
}

/**
 * Normalize a saved config so persisted keys match what the runtime expects,
 * so an older dashboard keeps working and its stored YAML is cleaned up on the
 * next save. Currently rewrites `graph_sensors` / `graph_sensor_colors` chip-key
 * aliases ('co2' → 'carbon_dioxide', 'rssi' → 'signal_strength') to device_class
 * form (mirrors {@link normalizeGraphKey}, which the runtime already applies on
 * read).
 *
 * Contract:
 *  - Returns the SAME reference when nothing changed, so the card's
 *    config-identity memoization (`_cardStylesConfigRef === this._config`) is not
 *    busted on every load.
 *  - Spreads rather than reconstructs, so unknown / future keys are preserved.
 *
 * NOTE: legacy `tile_style` aliases (hero/ring/hbar/spark/list/command) are
 * intentionally NOT migrated here. `_resolveStyle()` already remaps them
 * losslessly at render time, and each alias also carries a variant that sits at
 * the *lowest* priority of the variant cascade (device → area → view → legacy);
 * rewriting the stored value in place would risk promoting that variant above an
 * explicit one and changing the rendered output. Leave them to the runtime.
 */
export function migrateConfig<T extends { graph_sensors?: string[]; graph_sensor_colors?: Record<string, string> }>(config: T): T {
  if (!config) return config;
  let changed = false;

  let graphSensors = config.graph_sensors;
  if (Array.isArray(graphSensors)) {
    const seen = new Set<string>();
    const next = graphSensors
      .map(normalizeGraphKey)
      .filter(k => (seen.has(k) ? false : (seen.add(k), true)));
    if (next.length !== graphSensors.length || next.some((k, i) => k !== graphSensors![i])) {
      graphSensors = next;
      changed = true;
    }
  }

  let graphColors = config.graph_sensor_colors;
  if (graphColors && typeof graphColors === 'object') {
    let colorsChanged = false;
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(graphColors)) {
      const nk = normalizeGraphKey(k);
      if (nk !== k) colorsChanged = true;
      // device_class key wins if both an alias and its canonical form are present
      if (!(nk in next)) next[nk] = v;
    }
    if (colorsChanged) { graphColors = next; changed = true; }
  }

  if (!changed) return config;
  const out: T = { ...config };
  if (graphSensors) out.graph_sensors = graphSensors;
  if (graphColors)  out.graph_sensor_colors = graphColors;
  return out;
}

// ─── Header stat chips ─────────────────────────────────────────────────────────

/** Header chip catalogue: which fleet-level stats the card header can show.
 *  `agg` describes how per-device values combine into the chip value;
 *  clicking a chip lists devices high→low by the same metric. */
export const HEADER_CHIP_DEFS: Array<{
  key: string;
  label: string;
  agg: 'count' | 'sum' | 'avg';
}> = [
  { key: 'online',      label: 'Online',      agg: 'count' },
  { key: 'offline',     label: 'Offline',     agg: 'count' },
  { key: 'power',       label: 'Power',       agg: 'sum' },
  { key: 'energy',      label: 'Energy',      agg: 'sum' },
  { key: 'temperature', label: 'Temperature', agg: 'avg' },
  { key: 'humidity',    label: 'Humidity',    agg: 'avg' },
  { key: 'illuminance', label: 'Light',       agg: 'avg' },
  { key: 'rssi',        label: 'Wi-Fi',       agg: 'avg' },
  { key: 'alerts',      label: 'Alerts',      agg: 'count' },
  { key: 'updates',     label: 'Updates',     agg: 'count' },
];

/** Chips shown when `header_chips` is not configured. */
export const DEFAULT_HEADER_CHIPS = ['online', 'offline', 'power', 'alerts'];
