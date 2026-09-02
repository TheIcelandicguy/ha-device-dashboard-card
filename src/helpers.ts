import { HomeAssistant } from 'custom-card-helpers';
import {
  HADevice, HAEntity, DeviceProfileResult, DeviceProfile, DeviceGen,
  TileBlockId, TileStyle, TileLayout, TileRow, HADeviceDashboardConfig,
} from './types';
import type { InputChannel } from './tiles/tile-context';
import { THEME_KEYS, detectTheme } from './themes';

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
  hass: HomeAssistant,
  opts: {
    universal?: boolean;
    scope?: 'all' | 'devices' | 'controllable';
    includeIntegrations?: string[];
    excludeIntegrations?: string[];
    includeDomains?: string[];
    excludeDomains?: string[];
  } = {},
): HADevice[] {
  const universal = opts.universal === true;
  // Scoping filters apply only in universal mode (shelly mode is already scoped).
  // Force-include: platforms the user wants back despite being in the deny list.
  const forceInt = universal ? new Set((opts.includeIntegrations ?? []).map(s => s.toLowerCase())) : null;
  // Deny list = built-in noise integrations + user additions.
  const excInt   = universal
    ? new Set([...DEFAULT_EXCLUDE_INTEGRATIONS, ...(opts.excludeIntegrations ?? [])].map(s => s.toLowerCase()))
    : null;
  const incDom  = universal && opts.includeDomains?.length ? new Set(opts.includeDomains) : null;
  const excDom  = universal ? new Set(opts.excludeDomains ?? []) : null;
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
    // Universal-mode domain allow/deny (no-op in shelly mode: sets are null).
    if (excDom?.has(domain)) continue;
    if (incDom && !incDom.has(domain)) continue;

    const platform: string = (regEntry.platform ?? '').toLowerCase();
    // Shelly mode: keep only Shelly + BTHome (Shelly BLU sensors report through
    // HA's BTHome integration, not the Shelly one). Universal mode: keep all.
    if (!universal && platform !== 'shelly' && platform !== 'bthome') continue;
    // Universal-mode integration deny (built-in + user), unless force-included.
    if (excInt?.has(platform) && !forceInt?.has(platform)) continue;

    const deviceId: string = regEntry.device_id;

    if (!devices.has(deviceId)) {
      const devInfo: any = deviceRegistry[deviceId];
      if (!devInfo) continue;

      const configUrl: string = devInfo.configuration_url ?? '';
      const ipMatch = configUrl.match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/);
      const mfr: string = (devInfo.manufacturer ?? '').toLowerCase();
      const isShelly = mfr.includes('shelly') || platform === 'shelly';
      // In Shelly mode, BTHome devices from other vendors (Tuya, generic BLE)
      // aren't ours — skip. In universal mode they're legitimate devices.
      if (!universal && platform === 'bthome' && !isShelly) continue;

      const areaId = devInfo.area_id ?? regEntry.area_id;
      const area = areaId ? (areaRegistry[areaId]?.name as string | undefined) : undefined;

      devices.set(deviceId, {
        device_id:   deviceId,
        name:        devInfo.name_by_user ?? devInfo.name ?? deviceId,
        area,
        // Coerce to string: the type says `string`, but some integrations report
        // a numeric model or sw_version (e.g. a Yamaha receiver's sw_version 2.87),
        // and every downstream consumer does `.toLowerCase()` / `.match()` on these.
        model:       devInfo.model == null ? undefined : String(devInfo.model),
        sw_version:  devInfo.sw_version == null ? undefined : String(devInfo.sw_version),
        ip:          ipMatch ? ipMatch[1] : undefined,
        isShelly,
        integration: platform,
        labels:      Array.isArray(devInfo.labels) ? [...devInfo.labels] : undefined,
        entities:    [],
      });
    }

    const device = devices.get(deviceId)!;
    // A Shelly entity always makes this a Shelly device, and Shelly is the
    // authoritative integration even when routers / device_pulse also attach
    // entities to the same HA device (common for multi-integration devices in
    // universal mode — e.g. a Wi-Fi Wall Display the routers also track). Without
    // this, `integration` would keep whichever platform was seen first.
    if (platform === 'shelly') {
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
      entity_category: regEntry.entity_category ?? undefined,
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
    // Restricted to Shelly: the "child has no config URL, parent does, same
    // integration" shape also describes hub-and-spoke ecosystems (Hue/deCONZ/ZHA
    // bulbs linked to a bridge) — merging those in universal mode would collapse
    // every device on the hub into the bridge. Shelly sub-devices are the intended target.
    const subComponent = !childUrl && parentUrl && device.isShelly
      && device.integration === devices.get(parentId)!.integration;

    if (!sameHost && !subComponent) continue;

    const parent = devices.get(parentId)!;
    parent.entities.push(...device.entities);
    if (!parent.ip    && device.ip)    parent.ip    = device.ip;
    if (!parent.model && device.model) parent.model = device.model;
    toMerge.add(deviceId);
  }
  for (const id of toMerge) devices.delete(id);

  // Some integrations register a SECOND registry row for hardware that is already
  // known — device_pulse, for one, shadows every Shelly with a device carrying only
  // its ping entities, using identical `identifiers` and the same MAC. Those rows are
  // siblings (same via_device_id), so the parent/child merge above never sees them,
  // and universal mode renders a tile for each. Collapse rows that describe the same
  // physical unit: same MAC connection, or an identical registry identifier.
  const hwKeys = (info: any): string[] => {
    const keys: string[] = [];
    for (const [type, value] of (info?.connections ?? []) as Array<[string, string]>) {
      if (type === 'mac' && value) keys.push(`mac:${value.toLowerCase()}`);
    }
    for (const [domain, ident] of (info?.identifiers ?? []) as Array<[string, string]>) {
      if (domain && ident) keys.push(`id:${domain}:${String(ident).toLowerCase()}`);
    }
    return keys;
  };
  const byHardware = new Map<string, string[]>();
  for (const deviceId of devices.keys()) {
    for (const key of hwKeys(deviceRegistry[deviceId])) {
      if (!byHardware.has(key)) byHardware.set(key, []);
      byHardware.get(key)!.push(deviceId);
    }
  }
  // A device can match on both its MAC and its identifier, so a row merged by one
  // key may still show up under another — follow the chain to the current survivor.
  const hwMerged = new Map<string, string>();
  const survivorOf = (id: string): string => {
    let cur = id;
    for (let hops = 0; hwMerged.has(cur) && hops < 8; hops++) cur = hwMerged.get(cur)!;
    return cur;
  };
  // Which row wins: the one with a configuration URL (real integrations set it,
  // sidecars don't), then a Shelly row over a non-Shelly one — same precedent as
  // the `integration` rule above — then whichever carries more entities.
  const rowScore = (d: HADevice) => (d.ip ? 4 : 0) + (d.integration === 'shelly' ? 2 : 0);
  for (const group of byHardware.values()) {
    if (group.length < 2) continue;
    const rows = [...new Set(group.map(survivorOf))].filter(id => devices.has(id));
    if (rows.length < 2) continue;
    const survivor = rows.reduce((best, id) => {
      const a = devices.get(id)!, b = devices.get(best)!;
      if (rowScore(a) !== rowScore(b)) return rowScore(a) > rowScore(b) ? id : best;
      return a.entities.length > b.entities.length ? id : best;
    });
    const keep = devices.get(survivor)!;
    for (const id of rows) {
      if (id === survivor) continue;
      const dup = devices.get(id)!;
      keep.entities.push(...dup.entities);
      if (!keep.ip    && dup.ip)    keep.ip    = dup.ip;
      if (!keep.model && dup.model) keep.model = dup.model;
      if (!keep.area  && dup.area)  keep.area  = dup.area;
      if (dup.isShelly) keep.isShelly = true;
      if (dup.labels?.length) keep.labels = [...new Set([...(keep.labels ?? []), ...dup.labels])];
      hwMerged.set(id, survivor);
      devices.delete(id);
    }
  }

  let out = Array.from(devices.values()).filter(d => d.entities.length > 0);
  // Universal-mode scope: tame the firehose (default 'devices').
  if (universal) {
    out = out.filter(d => deviceInUniversalScope(d, opts.scope ?? 'devices'));
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Entity tiering ────────────────────────────────────────────────────────────

/** Entity importance tier derived from the HA registry entity_category. This is
 *  the universal "show only the basics" signal: `primary` entities are the ones a
 *  card should surface by default; `config` and `diagnostic` belong in the expanded
 *  detail view. Unlike the Shelly-tuned sensor-chip tiering (device_class based),
 *  this works for any integration. */
export type EntityTier = 'primary' | 'config' | 'diagnostic';

export function entityTier(entity: HAEntity): EntityTier {
  const c = entity.entity_category;
  return c === 'diagnostic' ? 'diagnostic' : c === 'config' ? 'config' : 'primary';
}

/** Integrations excluded by default in universal mode: network / system /
 *  companion platforms that expose entities but aren't smart-home devices (phones,
 *  browsers, routers, the supervisor). Battery-powered *devices* are unaffected —
 *  filtering is by integration, not by having a battery. Users re-add any of these
 *  via `include_integrations` (force-include) or extend the list via
 *  `exclude_integrations`. */
export const DEFAULT_EXCLUDE_INTEGRATIONS = new Set([
  'mobile_app', 'browser_mod', 'hassio', 'systemmonitor', 'backup', 'sun', 'nws',
  'netgear', 'tplink_router', 'huawei_lte', 'huawei_ont', 'asuswrt', 'fritzbox_tools', 'fritz',
]);

/** Domains you can actuate — the signal for "this is a controllable device" used
 *  by universal-mode scoping. */
export const CONTROLLABLE_DOMAINS = new Set([
  'switch', 'light', 'cover', 'climate', 'lock', 'media_player', 'fan', 'valve',
  'vacuum', 'siren', 'humidifier', 'water_heater', 'lawn_mower', 'alarm_control_panel',
]);

/** device_class values that mark a sensor/binary_sensor as a "real" smart-home
 *  reading (environmental / energy / alert). Used by universal 'devices' scope to
 *  keep genuine sensor devices while dropping routers/PCs whose only sensors are
 *  data-rate / diagnostic. */
const RECOGNIZED_SENSOR_DCS = new Set([
  'temperature', 'humidity', 'illuminance', 'carbon_dioxide', 'gas', 'battery',
  'power', 'energy', 'voltage', 'current', 'apparent_power', 'reactive_power',
  'power_factor', 'pressure', 'moisture', 'motion', 'door', 'window', 'opening',
  'smoke', 'vibration', 'occupancy',
]);

/** Controllable domains this card renders with its own tiles — never delegated. */
export const NATIVE_CONTROL_DOMAINS = new Set(['switch', 'light', 'cover', 'climate', 'valve']);

/** Native HA tile `features` per delegated domain (Phase 3 fallback rendering). */
export const DELEGATE_FEATURES: Record<string, Array<Record<string, unknown>>> = {
  media_player:        [{ type: 'media-player-playback' }, { type: 'media-player-volume-slider' }],
  lock:                [{ type: 'lock-commands' }],
  fan:                 [{ type: 'fan-speed' }],
  vacuum:              [{ type: 'vacuum-commands' }],
  humidifier:          [{ type: 'humidifier-toggle' }, { type: 'humidifier-modes' }],
  water_heater:        [{ type: 'water-heater-operation-modes' }],
  lawn_mower:          [{ type: 'lawn-mower-commands' }],
  siren:               [{ type: 'toggle' }],
  alarm_control_panel: [{ type: 'alarm-modes' }],
};

/** Primary entities whose domain this card doesn't render natively — handed to a
 *  native HA element by the `delegated_controls` block (see hdd-delegated). Returns
 *  [] for devices whose controls we already render (the common case). */
export function delegatableEntities(device: HADevice): HAEntity[] {
  return device.entities.filter(e =>
    entityTier(e) === 'primary' &&
    !NATIVE_CONTROL_DOMAINS.has(e.domain) &&
    e.domain in DELEGATE_FEATURES);
}

const deviceHasControllable = (d: HADevice): boolean =>
  d.entities.some(e => entityTier(e) === 'primary' && CONTROLLABLE_DOMAINS.has(e.domain));

const deviceHasRecognizedSensor = (d: HADevice): boolean =>
  d.entities.some(e => entityTier(e) === 'primary'
    && (e.domain === 'sensor' || e.domain === 'binary_sensor')
    && RECOGNIZED_SENSOR_DCS.has((e.attributes as any)?.device_class ?? ''));

/** Universal-mode scope test. 'devices' (default) keeps actuators + real-sensor
 *  devices; 'controllable' keeps actuators only; 'all' keeps everything. */
export function deviceInUniversalScope(d: HADevice, scope: 'all' | 'devices' | 'controllable'): boolean {
  if (scope === 'all') return true;
  if (deviceHasControllable(d)) return true;
  return scope === 'devices' && deviceHasRecognizedSensor(d);
}

// ─── Profile engine ────────────────────────────────────────────────────────────

/** Label shown on tile badge for each profile type */
export const PROFILE_LABELS: Record<DeviceProfile, string> = {
  relay:        'Relay',
  plug:         'Plug',
  dimmer:       'Dimmer',
  rgb:          'RGB',
  climate:      'TRV',
  cover:        'Roller',
  valve:        'Valve',
  lock:         'Lock',
  media:        'Media',
  energy:       'Energy',
  sensor:       'Sensor',
  input:        'Input',
  uni:          'UNI',
  wall_display: 'Display',
  generic:      '',
};

/**
 * Per-profile default tile *style*, used only when `smart_tile_styles` is on and
 * no closer scope sets a style. Profiles absent here fall to 'default'.
 */
export const PROFILE_DEFAULT_TILE_STYLE: Partial<Record<DeviceProfile, TileStyle>> = {
  relay:        'power-monitor',
  plug:         'power-monitor',
  energy:       'power-monitor',
  dimmer:       'light-control',
  rgb:          'light-control',
  climate:      'climate-control',
  wall_display: 'climate-control',
  cover:        'cover-control',
  sensor:       'sensor-card',
  input:        'input-control',
  // wall_display is intentionally NOT here — its default is entity-aware, see
  // profileDefaultTileStyle. valve, uni, generic → 'default'.
};

/**
 * Per-profile default tile style, resolved against a specific device.
 *
 * Same as PROFILE_DEFAULT_TILE_STYLE for every profile except `wall_display`:
 * a Shelly Wall Display is tagged by model name alone, but in the HA Shelly
 * integration it only exposes a `climate.` entity when a thermostat is actually
 * configured on it. Without one, the climate-control style has nothing to render
 * ("No climate entity"). So a Display defaults to climate-control only when it
 * has a climate entity, otherwise to the adaptive 'default' (which shows its
 * temp/humidity/illuminance sensors and relay). Returns undefined = 'default'.
 */
export function profileDefaultTileStyle(
  profile: DeviceProfile,
  device: HADevice,
): TileStyle | undefined {
  if (profile === 'wall_display') {
    return device.entities.some(e => e.domain === 'climate') ? 'climate-control' : undefined;
  }
  return PROFILE_DEFAULT_TILE_STYLE[profile];
}

/**
 * Toggleable elements per tile style — the shared vocabulary for the Style
 * Presets system. Renderers guard each element with `ctx.showEl(id)`; the editor
 * / offline designer reads this to build the toggle grid. Ids must match the
 * literal strings the renderers pass to `showEl`. ('default' style toggles its
 * content via blocks / `tile_layout`, so it's not listed here.)
 *
 * `def: false` marks an opt-in element — off until a layer turns it on. Used
 * for placement choices (header_chips moves the secondary chips into the name
 * row) where "shown by default" would change every existing tile.
 */
export const STYLE_ELEMENTS: Partial<Record<TileStyle, Array<{ id: string; label: string; def?: boolean }>>> = {
  'power-monitor': [
    { id: 'toggle',       label: 'On/off button' },
    { id: 'graph',        label: 'Sparkline graph' },
    { id: 'secondary',    label: 'Secondary readings (V/A/kWh)' },
    { id: 'header_chips', label: 'Chips in the name row', def: false },
    { id: 'uptime',       label: 'Uptime badge' },
    { id: 'lower_body',   label: 'Lower body (blocks)' },
  ],
  'light-control': [
    { id: 'color_wheel', label: 'Colour wheel' },
    { id: 'brightness',  label: 'Brightness slider' },
    { id: 'color_temp',  label: 'Colour temperature' },
    { id: 'white',       label: 'White channel' },
    { id: 'effects',     label: 'Effects' },
    { id: 'power',       label: 'Power reading' },
  ],
  'climate-control': [
    { id: 'heating_badge',  label: 'Heating badge' },
    { id: 'dial',           label: 'Temperature dial' },
    { id: 'adjust_buttons', label: '+/− buttons' },
    { id: 'stats',          label: 'Stats row' },
    { id: 'presets',        label: 'Preset buttons' },
  ],
  'cover-control': [
    { id: 'position_pct',    label: 'Position %' },
    { id: 'shutter_graphic', label: 'Shutter graphic' },
    { id: 'moving_label',    label: 'Moving label' },
    { id: 'buttons',         label: 'Open / stop / close' },
  ],
  'sensor-card': [
    { id: 'primary_value', label: 'Primary value' },
    { id: 'trend',         label: 'Trend arrow' },
    { id: 'graph',         label: 'Sparkline graph' },
    { id: 'secondary',     label: 'Secondary chips' },
    { id: 'header_chips',  label: 'Chips in the name row', def: false },
  ],
  'input-control': [
    { id: 'name',         label: 'Name' },
    { id: 'keypad',       label: 'Channel keys' },
    { id: 'input_rows',   label: 'Unassigned channel rows' },
    { id: 'target_state', label: 'Channel name under the key' },
    { id: 'last_event',   label: 'Last-pressed time' },
  ],
  'scene-button': [
    { id: 'icon',       label: 'Icon' },
    { id: 'name',       label: 'Name' },
    { id: 'timestamp',  label: 'Last-triggered time' },
    { id: 'input_rows', label: 'Input channel rows' },
  ],
};

/**
 * Fold a tile layout into rows. The flat form `['a','b']` means one block per
 * row; the row form `[['a'],['b','c']]` puts b and c side by side.
 */
export function normalizeTileLayout(layout: TileLayout | undefined): TileRow[] | undefined {
  if (!layout) return undefined;
  return (layout as Array<TileBlockId | TileRow>).map(r => (Array.isArray(r) ? r : [r]));
}

/** Every block in a layout, row structure discarded — for the flat editor UIs. */
export function flattenTileLayout(layout: TileLayout | undefined): TileBlockId[] | undefined {
  const rows = normalizeTileLayout(layout);
  return rows && rows.flat();
}

/** Deep copy a layout — rows are arrays, so a spread alone would share them. */
export function cloneTileLayout(layout: TileLayout): TileLayout {
  return (layout as Array<TileBlockId | TileRow>).map(r => (Array.isArray(r) ? [...r] : r)) as TileLayout;
}

/**
 * Show or hide one block, keeping the rest of the row structure intact. Hiding
 * drops the block from its row (and the row, if it was the last one there);
 * showing inserts it as its own row at its canonical position. A flat layout
 * stays flat, since every row it produces holds a single block.
 */
export function setBlockInLayout(
  layout: TileLayout,
  blockId: TileBlockId,
  visible: boolean,
  canonicalOrder: TileBlockId[],
): TileRow[] {
  const rows = normalizeTileLayout(layout)!.map(r => [...r]);
  if (!visible) return rows.map(r => r.filter(b => b !== blockId)).filter(r => r.length > 0);
  if (rows.some(r => r.includes(blockId))) return rows;
  const rank = (b: TileBlockId) => {
    const i = canonicalOrder.indexOf(b);
    return i < 0 ? canonicalOrder.length : i;
  };
  const at = rows.findIndex(r => rank(r[0]) > rank(blockId));
  rows.splice(at < 0 ? rows.length : at, 0, [blockId]);
  return rows;
}

/**
 * Default tile block order for each device profile.
 * Users can override this per-card, per-area, or per-device.
 */
export const PROFILE_DEFAULT_BLOCKS: Record<DeviceProfile, TileBlockId[]> = {
  relay:        ['name_row', 'relay_channels', 'sensors', 'graph', 'power_bar', 'virtual_controls', 'delegated_controls', 'badges'],
  plug:         ['name_row', 'sensors', 'graph', 'power_bar', 'virtual_controls', 'delegated_controls', 'badges'],
  dimmer:       ['name_row', 'dimmer', 'sensors', 'graph', 'virtual_controls', 'delegated_controls', 'badges'],
  rgb:          ['name_row', 'dimmer', 'sensors', 'graph', 'virtual_controls', 'delegated_controls', 'badges'],
  climate:      ['name_row', 'sensors', 'trv_control', 'virtual_controls', 'delegated_controls', 'badges'],
  cover:        ['name_row', 'cover_controls', 'sensors', 'virtual_controls', 'delegated_controls', 'badges'],
  valve:        ['name_row', 'sensors', 'valve_controls', 'virtual_controls', 'delegated_controls', 'badges'],
  lock:         ['name_row', 'sensors', 'virtual_controls', 'delegated_controls', 'badges'],
  media:        ['name_row', 'sensors', 'virtual_controls', 'delegated_controls', 'badges'],
  energy:       ['name_row', 'sensors', 'graph', 'virtual_controls', 'delegated_controls', 'badges'],
  sensor:       ['name_row', 'sensors', 'graph', 'virtual_controls', 'delegated_controls', 'badges'],
  input:        ['name_row', 'sensors', 'input_channels', 'virtual_controls', 'delegated_controls', 'badges'],
  uni:          ['name_row', 'input_channels', 'sensors', 'virtual_controls', 'delegated_controls', 'badges'],
  wall_display: ['name_row', 'sensors', 'graph', 'trv_control', 'virtual_controls', 'delegated_controls', 'badges'],
  generic:      ['name_row', 'sensors', 'virtual_controls', 'delegated_controls', 'badges'],
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
  lock:         ['battery'],
  climate:      ['temperature', 'humidity', 'battery'],
  wall_display: ['temperature', 'humidity', 'illuminance'],
  valve:        ['temperature'],
  sensor:       ['temperature', 'humidity', 'illuminance', 'co2', 'gas', 'battery',
                 'motion', 'door', 'flood', 'smoke', 'vibration'],
  input:        ['battery'],
  uni:          ['temperature', 'battery'],
  // 'generic' omitted → show all
};

/**
 * Sensor device-classes graphed when a config has never set `graph_sensors`.
 * Covers the common Shelly signals so a fresh install (and sensor-only devices
 * like a Wall Display or BLU H&T) plot something without hand-configuring the
 * list. An explicit empty `graph_sensors: []` still means "no graphs".
 */
export const DEFAULT_GRAPH_SENSORS: string[] = ['power', 'temperature', 'humidity', 'battery'];

/**
 * Domain-based device type detection — the universal, integration-agnostic core.
 * Returns the profile implied purely by the device's entity domains + attributes,
 * before any provider-specific refinement (e.g. Shelly model reclassification).
 */
export function detectTypeByDomain(device: HADevice): DeviceProfile {
  const modelLower = (device.model ?? '').toLowerCase();
  const domains = new Set(device.entities.map(e => e.domain));

  // ── Type detection (domain-based) ───────────────────────────────────────────

  let type: DeviceProfile;

  if (domains.has('climate') && domains.has('switch') && device.isShelly) {
    // Wall Display is a Shelly-specific pairing. A non-Shelly climate+switch combo
    // (DIY thermostat + relay in universal mode) is a climate device, not a Display.
    type = 'wall_display';
  } else if (domains.has('climate')) {
    type = 'climate';
  } else if (domains.has('cover')) {
    type = 'cover';
  } else if (domains.has('valve')) {
    type = 'valve';
  } else if (domains.has('lock')) {
    type = 'lock';
  } else if (domains.has('media_player')) {
    type = 'media';
  } else if (domains.has('light')) {
    const hasColorMode = device.entities.some(e => {
      if (e.domain !== 'light') return false;
      const modes: string[] = (e.attributes?.supported_color_modes as string[]) ?? [];
      return modes.some(m => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(m));
    });
    type = hasColorMode ? 'rgb' : 'dimmer';
  } else if (
    device.entities.some(e => e.domain === 'event' && (e.attributes as any)?.device_class === 'button') &&
    !device.entities.some(e => e.domain === 'switch' && /_(switch|relay)_\d/.test(e.entity_id)) &&
    // A device with environmental sensors (e.g. Shelly BLU H&T — which also exposes
    // a button) is a sensor, not an input remote. (Battery excluded on purpose —
    // input remotes have batteries; temperature/humidity/etc. are the real signal.)
    !device.entities.some(e => e.domain === 'sensor' &&
      ['temperature', 'humidity', 'carbon_dioxide', 'illuminance', 'pressure', 'moisture'].includes((e.attributes as any)?.device_class ?? ''))
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

  return type;
}

/**
 * Entity-signature clusters whose type is "weak" enough that an unambiguous model
 * string should be allowed to reclassify them. Strong signals (cover/climate/valve/
 * dimmer/rgb/wall_display) reflect the device's actual config and are left alone.
 *
 * `media` and `lock` are weak for Shelly specifically: a Shelly Wall Display
 * exposes a `media_player` (its speaker), which would otherwise type the whole
 * device as `media` — the model string ("Shelly Wall Display") corrects it back to
 * `wall_display`. Non-Shelly media/lock devices go through GenericProvider, which
 * never runs this refinement, so they keep their `media`/`lock` type.
 */
const WEAK_TYPES = new Set<DeviceProfile>(['relay', 'plug', 'energy', 'sensor', 'input', 'uni', 'generic', 'media', 'lock']);

/**
 * A ProfileProvider owns device classification for a family of devices. The
 * registry (`PROFILE_PROVIDERS`) is consulted most-specific-first; the first
 * provider whose `matches()` returns true classifies the device. `GenericProvider`
 * is the catch-all and matches everything.
 *
 * This is the Phase 0 seam from docs/universal-engine-plan.md: it lets Shelly
 * devices keep full-fidelity detection (model reclassification + hardware
 * generation) while non-Shelly devices route to the generic path (and, in later
 * phases, ecosystem-specific providers). The mode flag gates discovery breadth,
 * NOT provider routing — a Shelly is always handled by ShellyProvider.
 */
export interface ProfileProvider {
  id: string;
  /** True when this provider owns the given device. */
  matches(device: HADevice): boolean;
  /** Classify the device into a DeviceProfileResult. */
  detect(device: HADevice): DeviceProfileResult;
}

/**
 * Shelly / Shelly BLU. Refines the domain type via the (unambiguous) model string
 * and derives the hardware generation — the full-fidelity path preserved verbatim
 * from the original engine.
 */
export const ShellyProvider: ProfileProvider = {
  id: 'shelly',
  matches: (device) => device.isShelly,
  detect: (device) => {
    let type = detectTypeByDomain(device);
    if (WEAK_TYPES.has(type)) {
      const modelType = matchShellyModel(device.model);
      if (modelType) type = modelType;
    }
    return {
      type,
      gen: detectShellyGen(device.model ?? ''),
      label: PROFILE_LABELS[type],
      integration: device.integration,
    };
  },
};

/**
 * Catch-all fallback — pure domain classification, no model refinement, generation
 * 'other'. Registered last; matches every device.
 */
export const GenericProvider: ProfileProvider = {
  id: 'generic',
  matches: () => true,
  detect: (device) => {
    const type = detectTypeByDomain(device);
    return {
      type,
      gen: 'other',
      // 'TRV'/'Relay' are Shelly framings; use neutral labels for other vendors.
      label: type === 'climate' ? 'Climate' : type === 'relay' ? 'Switch' : PROFILE_LABELS[type],
      integration: device.integration,
    };
  },
};

/** Ordered most-specific-first. GenericProvider must remain last (catch-all). */
export const PROFILE_PROVIDERS: ProfileProvider[] = [ShellyProvider, GenericProvider];

/**
 * Classifies any HA device into a DeviceProfileResult by dispatching to the first
 * matching ProfileProvider. Output for Shelly devices is identical to the pre-seam
 * engine; non-Shelly devices (universal mode) fall to GenericProvider.
 */
export function getDeviceProfile(device: HADevice): DeviceProfileResult {
  for (const p of PROFILE_PROVIDERS) {
    if (p.matches(device)) return p.detect(device);
  }
  return GenericProvider.detect(device);
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
  bthome:         'BTHome',
  zha:            'Zigbee',
  zwave_js:       'Z-Wave',
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
  music_assistant:  'Music',
  spotify:          'Spotify',
  spotifyplus:      'Spotify',
  cast:             'Cast',
  yamaha_musiccast: 'Yamaha',
  androidtv_remote: 'Android',
  philips_js:       'Philips',
  roborock:         'Roborock',
  reolink:          'Reolink',
  gecko:            'Gecko',
  upnp:             'UPnP',
  ipp:              'Printer',
  bermuda:          'Bermuda',
  template:         'Template',
  device_pulse:     'Pulse',
};

export function getIntegrationLabel(platform: string): string {
  return INTEGRATION_LABELS[platform.toLowerCase()] ?? platform.toUpperCase().slice(0, 6);
}

/**
 * Distinct integrations (entity-registry platforms) and entity domains present
 * in this HA, for the editor's Discovery hide-checkbox lists. Walks the entity
 * registry once — the same source `getAllDevices` reads — so what's offered
 * matches what's discoverable. Both lists are sorted; integrations exclude the
 * empty platform.
 */
export function getDiscoverySources(hass: HomeAssistant): { integrations: string[]; domains: string[] } {
  const entityRegistry: Record<string, any> = (hass as any).entities ?? {};
  const integrations = new Set<string>();
  const domains = new Set<string>();
  for (const [entityId, regEntry] of Object.entries(entityRegistry)) {
    if (!regEntry?.device_id || regEntry.hidden_by) continue;
    const domain = entityId.split('.')[0];
    if (!DEVICE_DOMAINS.has(domain)) continue;
    domains.add(domain);
    const platform = (regEntry.platform ?? '').toLowerCase();
    if (platform) integrations.add(platform);
  }
  return {
    integrations: [...integrations].sort((a, b) => getIntegrationLabel(a).localeCompare(getIntegrationLabel(b))),
    domains: [...domains].sort(),
  };
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
export function migrateConfig<T extends {
  graph_sensors?: string[];
  graph_sensor_colors?: Record<string, string>;
  theme?: string;
  style?: Record<string, unknown>;
}>(config: T): T {
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

  // The editor used to write a theme's whole palette into `style`, which then
  // shadowed `theme` on every key — so the theme label was decorative and editing
  // it by hand did nothing. Where `style` still matches a preset exactly, drop the
  // palette and let `theme` carry it. Renders identically; `style` is left holding
  // only genuine overrides, so switching theme now works.
  let style = config.style;
  let theme = config.theme;
  if (style && typeof style === 'object') {
    const matched = detectTheme(style as never);
    if (matched !== 'custom' && (theme === undefined || theme === matched)) {
      const stripped: Record<string, unknown> = { ...style };
      for (const k of THEME_KEYS) delete stripped[k];
      if (Object.keys(stripped).length !== Object.keys(style).length) {
        style = Object.keys(stripped).length ? stripped : undefined;
        theme = matched;
        changed = true;
      }
    }
  }

  // The Design panel's Global scope used to write element toggles to a
  // top-level `elements` key that nothing reads — the cascade's card-wide rung
  // for elements is style_presets[<style>].elements. Relocate the stray key to
  // the preset of the style the card renders globally (values already set in
  // the preset win), so those saved toggles finally take effect; if the global
  // style is adaptive or unknown the key has no meaning and is dropped.
  const cfgEls = config as unknown as {
    elements?: Record<string, boolean>;
    tile_style?: TileStyle;
    custom_styles?: Record<string, { base?: TileStyle }>;
    style_presets?: Record<string, { elements?: Record<string, boolean> }>;
  };
  let relocatedPresets: typeof cfgEls.style_presets;
  let dropElements = false;
  if (cfgEls.elements && typeof cfgEls.elements === 'object') {
    let base = cfgEls.tile_style;
    if (typeof base === 'string' && base.startsWith('custom:')) {
      base = cfgEls.custom_styles?.[base.slice(7)]?.base ?? 'default';
    }
    // Legacy aliases, mirroring cascade's LEGACY_VARIANT (helpers cannot
    // import cascade — cascade imports helpers).
    const LEGACY: Record<string, TileStyle> = {
      hero: 'power-monitor', ring: 'power-monitor', spark: 'power-monitor',
      hbar: 'power-monitor', list: 'power-monitor', command: 'scene-button',
    };
    const styleKey = (base && LEGACY[base]) || base;
    if (styleKey && STYLE_ELEMENTS[styleKey]) {
      const entry = { ...(cfgEls.style_presets?.[styleKey] ?? {}) };
      entry.elements = { ...cfgEls.elements, ...(entry.elements ?? {}) };
      relocatedPresets = { ...(cfgEls.style_presets ?? {}), [styleKey]: entry };
    }
    dropElements = true;
    changed = true;
  }

  if (!changed) return config;
  const out: T = { ...config };
  if (style !== config.style) {
    if (style === undefined) delete (out as { style?: unknown }).style;
    else (out as { style?: unknown }).style = style;
  }
  if (theme !== config.theme) (out as { theme?: unknown }).theme = theme;
  if (graphSensors) out.graph_sensors = graphSensors;
  if (graphColors)  out.graph_sensor_colors = graphColors;
  if (dropElements) {
    delete (out as { elements?: unknown }).elements;
    if (relocatedPresets) (out as { style_presets?: unknown }).style_presets = relocatedPresets;
  }
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
  // 'Light' read as "how many lights are on"; it is an average of lux. Renamed
  // for what it is, with the count people expected added alongside.
  { key: 'illuminance', label: 'Lux',         agg: 'avg' },
  { key: 'lights',      label: 'Lights',      agg: 'count' },
  { key: 'rssi',        label: 'Wi-Fi',       agg: 'avg' },
  { key: 'alerts',      label: 'Alerts',      agg: 'count' },
  { key: 'updates',     label: 'Updates',     agg: 'count' },
];

/** Chips shown when `header_chips` is not configured. */
export const DEFAULT_HEADER_CHIPS = ['online', 'offline', 'power', 'alerts'];

/**
 * Room (area) header chip catalogue. Each entry maps a chip key to the sensor
 * device_class it aggregates, a short label, and how per-sensor values combine.
 * Shared by the room-header renderer (`_getAreaChips`), the in-card ⚙ cog popup
 * (`_areaHeaderCandidates`), and the editor's per-room chip picker.
 *  - sum: total across the room (power, current, energy)
 *  - avg: mean across the room (temperature, humidity, …)
 * `rssi` has no clean device_class — it's matched by `signal_strength` or a
 * `_rssi` entity id at the call site.
 */
export const AREA_CHIP_DEFS: Array<{
  key: string;
  label: string;
  dc: string;
  agg: 'sum' | 'avg';
}> = [
  { key: 'power',       label: 'Power',   dc: 'power',          agg: 'sum' },
  { key: 'energy',      label: 'Energy',  dc: 'energy',         agg: 'sum' },
  { key: 'voltage',     label: 'Volt',    dc: 'voltage',        agg: 'avg' },
  { key: 'current',     label: 'Amp',     dc: 'current',        agg: 'sum' },
  { key: 'temperature', label: 'Temp',    dc: 'temperature',    agg: 'avg' },
  { key: 'humidity',    label: 'Hum',     dc: 'humidity',       agg: 'avg' },
  { key: 'co2',         label: 'CO₂',     dc: 'carbon_dioxide', agg: 'avg' },
  { key: 'illuminance', label: 'Lux',     dc: 'illuminance',    agg: 'avg' },
  { key: 'battery',     label: 'Batt',    dc: 'battery',        agg: 'avg' },
  { key: 'rssi',        label: 'Wi-Fi',   dc: 'signal_strength', agg: 'avg' },
];

/**
 * Room-header chips shown when a room sets no `header_chips`. A consistent set
 * across rooms — live Power, Energy, Voltage, Current, Temperature. Only chips
 * whose sensor is actually present in the room are rendered, so an env-only room
 * just shows Temp. (Power moved from the meta row into the chip set so every
 * room reads the same way.)
 */
export const DEFAULT_AREA_HEADER_CHIPS = ['power', 'energy', 'voltage', 'current', 'temperature'];

/**
 * The hard-coded factory default look — the single source of truth for the
 * first-run appearance and the target of the editor's "Reset look" / "Reset
 * everything" actions (docs/universal-engine-plan.md).
 *
 * These mirror the card's implicit runtime defaults exactly, so seeding a fresh
 * card from them is visually identical to today. It is a FROZEN, independent
 * snapshot on purpose: it is applied by value only at first-run and explicit
 * reset — never live-merged on load — so a user's later changes are preserved and
 * a future version can ship a new default look without mutating existing configs.
 */
export const FACTORY_DEFAULTS: Readonly<Partial<HADeviceDashboardConfig>> = Object.freeze({
  theme:             'warm_dusk',   // mirrors DEFAULT_THEME in themes.ts
  tile_style:        'default',
  tile_size:         'md',
  columns:           3,
  sort_by:           'name',
  smart_tile_styles: false,
  graph_hours:       24,
  header_chips:      DEFAULT_HEADER_CHIPS,
});

/**
 * A fresh, deeply-independent copy of {@link FACTORY_DEFAULTS}, safe to spread into
 * or mutate on a live config (the frozen source's nested array is never shared).
 * Used by first-run seeding and the reset actions.
 */
export function factoryLook(): Partial<HADeviceDashboardConfig> {
  return { ...FACTORY_DEFAULTS, header_chips: [...(FACTORY_DEFAULTS.header_chips ?? [])] };
}


/** Every key `HADeviceDashboardConfig` accepts, at runtime.
 *  A TypeScript interface vanishes at compile time, so the editor cannot reflect
 *  over it to spot a typo'd or obsolete key — hence this list. It is not allowed
 *  to drift: `npm run check:docs` compares it against the interface. */
export const CONFIG_KEYS: readonly string[] = [
  'type', 'views', 'default_view', 'mode', 'universal_scope', 'include_integrations',
  'exclude_integrations', 'include_domains', 'exclude_domains', 'delegate_controls',
  'header_cards', 'footer_cards', 'area_cards', 'areas', 'hidden_devices', 'favorites',
  'hidden_entities', 'show_offline', 'title', 'columns', 'tile_size', 'sort_by', 'tile_style',
  'smart_tile_styles', 'power_monitor_variant', 'show_graphs', 'tile_layout', 'tile_opacity',
  'card_opacity', 'header_opacity', 'header_show_title', 'header_show_stats',
  'header_show_cloud', 'header_show_orbs', 'effects', 'header_chips', 'area_header_chips', 'show_collapse_all', 'card_bg_image',
  'card_bg_image_size', 'show_power_bar', 'power_bar_max', 'show_entity_list', 'theme',
  'light_labels', 'light_entities',
  'show_attention', 'attention_battery', 'show_firmware_summary', 'include_beta_updates',
  'style', 'area_styles', 'device_styles', 'profile_styles', 'style_presets', 'custom_styles',
  'energy_period', 'graph_sensors', 'graph_hours', 'graph_style', 'graph_line_color',
  'graph_sensor_colors', 'sensors'
];

/** Keys Home Assistant itself writes onto a card config — not ours, not typos. */
export const LOVELACE_KEYS: readonly string[] = [
  'grid_options', 'view_layout', 'layout_options', 'visibility', 'card_mod',
];

// ─── Input channels ────────────────────────────────────────────────────────────

/** Binary sensors that report an input's steady state. Gen2+ Shelly tags these
 *  `power`; Gen1 leaves the device class unset. `external_power` on a battery
 *  device is also `power` but is not an input, hence the exclusion. */
function isInputBinarySensor(e: HAEntity): boolean {
  if (e.domain !== 'binary_sensor') return false;
  if (/external_power|power_supply|charging/.test(e.entity_id)) return false;
  if (/(?:input|channel|button)/i.test(e.entity_id)) return true;
  const dc = (e.attributes as Record<string, unknown>)?.device_class;
  return dc == null || dc === 'power';
}

/** Event entities that fire on a press. */
function isInputEvent(e: HAEntity): boolean {
  if (e.domain !== 'event') return false;
  return (e.attributes as Record<string, unknown>)?.device_class === 'button'
    || /(?:input|channel|button)/i.test(e.entity_id);
}

/** Channel number as the integration names it — `channel_1` → 1, `input_2` → 2.
 *  HA's own friendly name uses the same number, so it is NOT shifted by one. */
function channelNumber(entityId: string): number | null {
  const m = entityId.match(/(?:input|channel|button)[_\s]*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

/** Row label: whatever HA calls the entity, minus the device-name prefix, so a
 *  renamed input ("Bedroom light") keeps its name instead of being relabelled. */
function channelLabel(friendly: string, deviceName: string, num: number | null, entityId: string): string {
  let label = friendly.trim();
  const prefix = deviceName.trim();
  if (prefix && label.toLowerCase().startsWith(prefix.toLowerCase())) {
    label = label.slice(prefix.length).trim();
  }
  if (label) return label;
  return num != null ? `Input ${num}` : entityId.split('.')[1] ?? entityId;
}

/** Input channels for a device — the i3/i4/UNI button rows.
 *
 *  A Gen2+ input reports its steady state on a `binary_sensor` AND its presses on
 *  a separate `event` entity; either can exist alone, and Gen1 devices only have
 *  the event. Pair them by object-id base or channel number and keep whatever is
 *  left over as its own row, so a renamed event entity — which no longer shares
 *  its binary sensor's object id — still shows up instead of vanishing.
 */
export function detectInputChannels(
  device: HADevice,
  states: Record<string, { state?: string; attributes?: Record<string, unknown>; last_changed?: string }>,
): InputChannel[] {
  const bsInputs = device.entities.filter(isInputBinarySensor);
  const evInputs = device.entities.filter(isInputEvent);
  const usedEvents = new Set<string>();
  const rows: Array<InputChannel & { _sort: number }> = [];

  const eventFor = (bs: HAEntity, num: number | null): HAEntity | undefined => {
    const base = bs.entity_id.replace(/^binary_sensor\./, '');
    const byId = evInputs.find(ev => !usedEvents.has(ev.entity_id) && ev.entity_id.replace(/^event\./, '') === base);
    if (byId) return byId;
    if (num == null) return undefined;
    return evInputs.find(ev => !usedEvents.has(ev.entity_id) && channelNumber(ev.entity_id) === num);
  };

  bsInputs.forEach((e, i) => {
    const st = states[e.entity_id];
    const num = channelNumber(e.entity_id);
    const ev = eventFor(e, num);
    if (ev) usedEvents.add(ev.entity_id);
    const evSt = ev ? states[ev.entity_id] : null;
    const evType = evSt?.attributes?.event_type as string | undefined;
    rows.push({
      entityId: e.entity_id,
      label: channelLabel((st?.attributes?.friendly_name as string) ?? '', device.name, num, e.entity_id),
      isOn: st?.state === 'on',
      isButton: !!ev,
      channel: num ?? 0,
      lastEvent: evType ?? null,
      lastChanged: st?.last_changed ?? null,
      _sort: num ?? 50 + i,
    });
  });

  evInputs.filter(e => !usedEvents.has(e.entity_id)).forEach((e, i) => {
    const st = states[e.entity_id];
    const num = channelNumber(e.entity_id);
    const live = st?.state && st.state !== 'unknown' && st.state !== 'unavailable' ? st.state : null;
    rows.push({
      entityId: e.entity_id,
      label: channelLabel((st?.attributes?.friendly_name as string) ?? '', device.name, num, e.entity_id),
      isOn: false,
      isButton: true,
      channel: num ?? 0,
      lastEvent: (st?.attributes?.event_type as string | undefined) ?? null,
      // An event entity's state IS the timestamp of the last press.
      lastChanged: st?.last_changed ?? live,
      _sort: num ?? 50 + i,
    });
  });

  return rows
    .sort((a, b) => a._sort - b._sort)
    .map(({ _sort, ...row }) => row);
}


// ─── Device relevance (editor scoping) ─────────────────────────────────────────

/** Which controls actually do something for one device. The device-styling panel
 *  uses this to offer that device's own options instead of every option the card
 *  has — an i4 has no energy window, a smoke sensor has no dimmer block. */
export interface DeviceRelevance {
  /** Sensor-chip keys this device can produce. */
  chips: Set<string>;
  /** Tile blocks that can render something for this device. */
  blocks: Set<TileBlockId>;
  /** Has an energy or power sensor, so the energy window / meter override apply. */
  hasEnergy: boolean;
  /** Has at least one graphable sensor. */
  hasGraphs: boolean;
  /** Has an entity with an on/off state, so ON vs OFF styling is meaningful. */
  hasOnOff: boolean;
}

/** Chip keys that can be drawn as a sparkline. */
const GRAPHABLE_CHIPS = new Set([
  'power', 'voltage', 'current', 'energy', 'apparent_power', 'reactive_power',
  'frequency', 'power_factor', 'temperature', 'humidity', 'illuminance', 'co2',
  'battery', 'rssi',
]);

/** Shelly virtual components — `_enum_1`, `_number_2`, … — as matched by the
 *  card's `_getVirtualControls`. */
const VIRTUAL_SUFFIX: Record<string, RegExp> = {
  select: /_enum_\d+$/i,
  number: /_number_\d+$/i,
  button: /_button_\d+$/i,
  text:   /_text_\d+$/i,
  switch: /_boolean_\d+$/i,
};

/** Sensor-chip keys a device can produce. Mirrors the device_class → chip-key
 *  mapping in the card's `_getSensors`; keep the two in step when adding a chip. */
export function deviceChipKeys(device: HADevice): Set<string> {
  const keys = new Set<string>();
  for (const e of device.entities) {
    const dc = ((e.attributes as Record<string, unknown>)?.device_class as string) ?? '';
    const id = e.entity_id;
    if (e.domain === 'sensor') {
      if (!dc && (id.endsWith('_ip') || id.endsWith('_ip_address'))) { keys.add('ip'); continue; }
      if (!dc && id.endsWith('_ssid'))                               { keys.add('ssid'); continue; }
      if (!dc && (id.endsWith('_firmware') || id.endsWith('_fw')))   { keys.add('fw_version'); continue; }
      if (!dc && id.endsWith('_mac'))                                { keys.add('mac'); continue; }
      if (dc === 'carbon_dioxide') keys.add('co2');
      else if (dc === 'signal_strength' || id.includes('rssi')) keys.add('rssi');
      else if (id.includes('uptime')) keys.add('uptime');
      else if ([
        'power', 'apparent_power', 'reactive_power', 'power_factor', 'frequency',
        'energy', 'voltage', 'current', 'temperature', 'humidity', 'illuminance',
        'gas', 'battery',
      ].includes(dc)) keys.add(dc);
    } else if (e.domain === 'binary_sensor') {
      if (dc === 'door' || dc === 'window' || dc === 'opening') keys.add('door');
      else if (dc === 'moisture') keys.add('flood');
      else if (dc === 'heat' || id.includes('overtemp')) keys.add('overtemp');
      else if (dc === 'safety' || id.includes('overpower')) keys.add('overpower');
      else if (dc === 'connectivity') {
        if (id.includes('cloud')) keys.add('cloud');
        else if (id.includes('mqtt')) keys.add('mqtt');
        else if (id.includes('eth')) keys.add('eth');
      }
      else if (['motion', 'smoke', 'gas', 'vibration'].includes(dc)) keys.add(dc);
    }
  }
  return keys;
}

export function deviceRelevance(
  device: HADevice,
  states: Record<string, { state?: string; attributes?: Record<string, unknown>; last_changed?: string }>,
): DeviceRelevance {
  const chips = deviceChipKeys(device);
  const has = (domain: string) => device.entities.some(e => e.domain === domain);
  const countOf = (domain: string) => device.entities.filter(e => e.domain === domain).length;

  const blocks = new Set<TileBlockId>(['name_row', 'badges']);
  if (chips.size) blocks.add('sensors');
  const hasGraphs = [...chips].some(k => GRAPHABLE_CHIPS.has(k));
  if (hasGraphs) blocks.add('graph');
  if (has('light')) blocks.add('dimmer');
  if (has('cover')) blocks.add('cover_controls');
  if (has('climate')) blocks.add('trv_control');
  if (has('valve')) blocks.add('valve_controls');
  if (detectInputChannels(device, states).length) blocks.add('input_channels');
  // A single relay is the tile's own toggle; per-channel rows only earn their
  // space once there is more than one.
  if (countOf('switch') + countOf('light') > 1) blocks.add('relay_channels');
  if (chips.has('power')) blocks.add('power_bar');
  if (device.entities.some(e => VIRTUAL_SUFFIX[e.domain]?.test(e.entity_id))) blocks.add('virtual_controls');
  if (['lock', 'media_player', 'fan', 'vacuum'].some(has)) blocks.add('delegated_controls');

  return {
    chips,
    blocks,
    hasEnergy: chips.has('energy') || chips.has('power'),
    hasGraphs,
    hasOnOff: ['switch', 'light', 'cover', 'valve', 'fan', 'lock', 'climate', 'binary_sensor']
      .some(has),
  };
}
