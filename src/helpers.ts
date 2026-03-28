import { HomeAssistant } from 'custom-card-helpers';
import { ShellyHADevice, ShellyHAEntity, ShellyDeviceProfile, ShellyDeviceType, HADeviceGen } from './types';

// ─── Entity / device discovery ────────────────────────────────────────────────

/**
 * Returns all entity states belonging to the 'shelly' integration.
 *
 * Primary: hass.entities registry (always available in HA 2022.4+) — check
 * platform === 'shelly'.  This is the only reliable, zero-false-positive method.
 *
 * Fallback (no registry): check device manufacturer contains 'Shelly'.
 */
export function getShellyEntities(hass: HomeAssistant): ShellyHAEntity[] {
  const entityRegistry: Record<string, any> = (hass as any).entities ?? {};
  const deviceRegistry: Record<string, any> = (hass as any).devices ?? {};
  const hasRegistry = Object.keys(entityRegistry).length > 0;

  return Object.values(hass.states)
    .filter((s) => {
      if (hasRegistry) {
        // Authoritative: entity registry platform field
        const regEntry = entityRegistry[s.entity_id];
        if (!regEntry) return false;
        if (regEntry.platform === 'shelly') return true;
        // Some Shelly entities are registered under the config-entry platform name
        // (e.g. 'shelly') — also check the device manufacturer as a secondary guard
        const devId = regEntry.device_id;
        if (devId) {
          const dev = deviceRegistry[devId];
          if (dev?.manufacturer?.toLowerCase().includes('shelly')) return true;
        }
        return false;
      }
      // No entity registry available — fall back to entity_id heuristic
      return s.entity_id.toLowerCase().includes('shelly');
    })
    .map((s) => ({
      entity_id: s.entity_id,
      domain: s.entity_id.split('.')[0],
      state: s.state,
      attributes: s.attributes as Record<string, any>,
    }));
}

/**
 * Groups discovered Shelly entities by device_id (from hass.entities registry
 * when available, else groups by common name prefix).
 */
export function groupShellyByDevice(
  hass: HomeAssistant,
  entities: ShellyHAEntity[]
): ShellyHADevice[] {
  const devices = new Map<string, ShellyHADevice>();

  for (const entity of entities) {
    // Try to get device_id from hass.entities (HA 2022.4+)
    const regEntry = (hass as any).entities?.[entity.entity_id];
    const deviceId: string = regEntry?.device_id ?? derivePseudoDeviceId(entity.entity_id);

    if (!devices.has(deviceId)) {
      const devInfo = (hass as any).devices?.[deviceId];
      const configUrl: string = devInfo?.configuration_url ?? '';
      const ipMatch = configUrl.match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/);

      devices.set(deviceId, {
        device_id: deviceId,
        name: devInfo?.name_by_user ?? devInfo?.name ?? deriveName(entity.entity_id),
        area: getAreaName(hass, devInfo?.area_id ?? regEntry?.area_id),
        model: devInfo?.model,
        sw_version: devInfo?.sw_version,
        ip: ipMatch ? ipMatch[1] : undefined,
        isShelly: true,
        entities: [],
      });
    }

    const dev = devices.get(deviceId);
    if (dev) dev.entities.push(entity);
  }

  return Array.from(devices.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns ALL entity-backed HA devices, regardless of integration.
 * Used when `include_all` is enabled in the dashboard config.
 *
 * Only includes entities whose domain makes sense in a device overview.
 * Devices are flagged `isShelly` when any entity's platform is 'shelly'
 * or the device manufacturer contains 'shelly'.
 */
const ALL_DOMAINS = new Set([
  'switch', 'light', 'cover', 'valve', 'climate', 'sensor', 'binary_sensor',
  'fan', 'lock', 'media_player', 'vacuum', 'alarm_control_panel',
  'update', 'button', 'number', 'select',
]);

export function getAllDevices(hass: HomeAssistant): ShellyHADevice[] {
  const entityRegistry: Record<string, any> = (hass as any).entities ?? {};
  const deviceRegistry: Record<string, any> = (hass as any).devices ?? {};
  const devices = new Map<string, ShellyHADevice>();

  for (const state of Object.values(hass.states)) {
    const domain = state.entity_id.split('.')[0];
    if (!ALL_DOMAINS.has(domain)) continue;

    const regEntry = entityRegistry[state.entity_id];
    if (!regEntry?.device_id) continue;       // skip entities not linked to a device
    if (regEntry.hidden_by) continue;         // skip hidden entities

    const deviceId: string = regEntry.device_id;

    if (!devices.has(deviceId)) {
      const devInfo = deviceRegistry[deviceId];
      if (!devInfo) continue;                 // skip if device info unavailable
      const configUrl: string = devInfo.configuration_url ?? '';
      const ipMatch = configUrl.match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/);
      const mfr: string = (devInfo.manufacturer ?? '').toLowerCase();
      const isShellyDevice = mfr.includes('shelly');

      devices.set(deviceId, {
        device_id: deviceId,
        name: devInfo.name_by_user ?? devInfo.name ?? deviceId,
        area: getAreaName(hass, devInfo.area_id ?? regEntry.area_id),
        model: devInfo.model,
        sw_version: devInfo.sw_version,
        ip: ipMatch ? ipMatch[1] : undefined,
        isShelly: isShellyDevice,
        entities: [],
      });
    }

    const device = devices.get(deviceId);
    if (!device) continue;

    // Mark Shelly if any entity's platform says so
    if (!device.isShelly && regEntry.platform === 'shelly') {
      device.isShelly = true;
    }

    device.entities.push({
      entity_id: state.entity_id,
      domain,
      state: state.state,
      attributes: state.attributes as Record<string, any>,
    });
  }

  return Array.from(devices.values())
    .filter((d) => d.entities.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Derive a pseudo device-id from entity_id by stripping domain and last _suffix */
function derivePseudoDeviceId(entityId: string): string {
  const objectId = entityId.split('.')[1] ?? entityId;
  // e.g. shelly1pm_abc123_relay_0 -> shelly1pm_abc123
  const parts = objectId.split('_');
  return parts.slice(0, -1).join('_') || objectId;
}

/** Derive a human-readable device name from entity_id */
function deriveName(entityId: string): string {
  const objectId = entityId.split('.')[1] ?? entityId;
  const parts = objectId.split('_');
  return parts
    .slice(0, -1)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ') || objectId;
}

/** Look up area name from hass.areas registry */
export function getAreaName(hass: HomeAssistant, areaId?: string): string | undefined {
  if (!areaId) return undefined;
  const area = (hass as any).areas?.[areaId];
  return area?.name;
}

// ─── Device profile ───────────────────────────────────────────────────────────

/**
 * Infers the functional type and hardware generation of a Shelly HA device.
 *
 * Type is derived from which HA entity domains are present (most reliable).
 * Generation is derived from the HA device model string (keyword matching).
 *
 * Reference: shelly_device_entity_reference.md
 */
export function getDeviceProfile(device: ShellyHADevice): ShellyDeviceProfile {
  const modelLower = (device.model ?? '').toLowerCase();
  const domains = new Set(device.entities.map((e) => e.domain));

  // ── Type detection (entity-domain-based) ──────────────────────────────────

  let type: ShellyDeviceType;

  if (domains.has('climate') && domains.has('switch')) {
    // Wall Display: has both relay switch AND climate entity
    type = 'wall_display';
  } else if (domains.has('climate')) {
    // TRV: climate only (Shelly TRV)
    type = 'trv';
  } else if (domains.has('cover')) {
    // Roller/shutter mode: cover entity present
    type = 'cover';
  } else if (domains.has('valve')) {
    // Water/heating valve
    type = 'valve';
  } else if (domains.has('light')) {
    // Check if any light entity supports color modes → RGB device
    const hasColorMode = device.entities.some((e) => {
      if (e.domain !== 'light') return false;
      const modes: string[] = e.attributes?.supported_color_modes ?? [];
      return modes.some((m) => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(m));
    });
    type = hasColorMode ? 'rgb' : 'dimmer';
  } else if (domains.has('switch')) {
    // Plug vs relay vs UNI:
    // Plugs: model name contains "plug", or no input binary sensors
    // UNI: model name contains "uni"
    if (modelLower.includes('uni')) {
      type = 'uni';
    } else if (
      modelLower.includes('plug') ||
      // Heuristic: no input binary sensors AND no relay-like wording → plug
      (!device.entities.some(
        (e) => e.domain === 'binary_sensor' && e.entity_id.includes('input')
      ) &&
        !modelLower.includes('1pm') &&
        !modelLower.includes('2pm') &&
        !modelLower.includes('pro '))
    ) {
      type = 'plug';
    } else {
      type = 'relay';
    }
  } else {
    // No controllable domain — pure sensor/input/energy-monitor device
    const hasPowerEnergy = device.entities.some(
      (e) =>
        e.domain === 'sensor' &&
        (e.attributes?.device_class === 'power' ||
          e.attributes?.device_class === 'energy' ||
          e.attributes?.device_class === 'apparent_power')
    );
    const hasInputBS = device.entities.some(
      (e) =>
        e.domain === 'binary_sensor' &&
        (e.entity_id.includes('input') ||
          e.attributes?.device_class == null ||   // unclassified binary sensor = input
          e.entity_id.includes('button'))
    );
    const hasAlertOrEnvSensor = device.entities.some(
      (e) =>
        e.domain === 'sensor' &&
        ['temperature', 'humidity', 'illuminance', 'moisture', 'battery', 'gas'].includes(
          e.attributes?.device_class ?? ''
        )
    );
    const hasAlertBS = device.entities.some(
      (e) =>
        e.domain === 'binary_sensor' &&
        ['motion', 'door', 'window', 'moisture', 'smoke', 'gas', 'vibration', 'opening'].includes(
          e.attributes?.device_class ?? ''
        )
    );

    if (hasPowerEnergy) {
      type = 'energy';
    } else if (hasInputBS && !hasAlertOrEnvSensor && !hasAlertBS) {
      type = 'input';
    } else {
      type = 'sensor';
    }
  }

  // ── Generation detection (model string keyword matching) ─────────────────

  const gen = detectHAGen(device.model ?? '');

  // ── Label map ─────────────────────────────────────────────────────────────

  const TYPE_LABELS: Record<ShellyDeviceType, string> = {
    relay:       'Relay',
    dimmer:      'Dimmer',
    rgb:         'RGB',
    plug:        'Plug',
    cover:       'Roller',
    valve:       'Valve',
    energy:      'Energy',
    sensor:      'Sensor',
    input:       'Input',
    trv:         'TRV',
    wall_display:'Display',
    uni:         'UNI',
    unknown:     '',
  };

  return { type, gen, label: TYPE_LABELS[type] };
}

/**
 * Infers the Shelly hardware generation from the HA device model string.
 *
 * Gen1: Original ESP8266 firmware (model codes SH*; no "Plus"/"Pro"/"G3"/"G4"/"BLU")
 * Gen2: RPC firmware, ESP32 (model codes SN*; "Plus" / "Pro" in name)
 * Gen3: Gen3 hardware (model name contains "G3" / "Gen3")
 * Gen4: Gen4 hardware (model name contains "G4" / "Gen4")
 * BLE:  Bluetooth-only devices ("BLU" in name)
 */
export function detectHAGen(model: string): HADeviceGen {
  const m = model.toLowerCase();
  if (m.includes('blu') || m.includes('bluetooth')) return 'ble';
  if (m.includes('g4') || m.includes('gen4') || m.includes('gen 4')) return 4;
  if (m.includes('g3') || m.includes('gen3') || m.includes('gen 3')) return 3;
  // "Plus" and "Pro" cover all Gen2 RPC devices
  if (m.includes('plus') || m.includes('pro')) return 2;
  // Model code prefixes: SN = Gen2 RPC, S3 = Gen3
  if (/^sn/i.test(model)) return 2;
  if (/^s3/i.test(model)) return 3;
  // SH* = Gen1; default to Gen1 if unrecognised
  return 1;
}

// ─── Entity helpers ───────────────────────────────────────────────────────────

/** Returns the first entity matching a domain from a device's entity list */
export function getEntityByDomain(
  entities: ShellyHAEntity[],
  domain: string
): ShellyHAEntity | undefined {
  return entities.find((e) => e.domain === domain);
}

/** Returns all entities matching a domain */
export function getEntitiesByDomain(
  entities: ShellyHAEntity[],
  domain: string
): ShellyHAEntity[] {
  return entities.filter((e) => e.domain === domain);
}

// ─── Formatting ───────────────────────────────────────────────────────────────

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
