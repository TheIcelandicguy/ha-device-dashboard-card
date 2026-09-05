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
 * One entity-registry row plus its live state, as an `HAEntity`.
 *
 * Discovery and `attachExtraSensors` both build these. They were two copies of
 * the same eight-field mapping, which is one edit away from a field that an
 * owned entity carries and a borrowed one silently does not. `over` is for the
 * few fields the borrowed path adds (`borrowed_from`) rather than derives.
 */
function toEntity(
  entityId: string,
  reg: { device_id?: string; area_id?: string; platform?: string; entity_category?: string } | undefined,
  state: { state?: string; attributes?: unknown } | undefined,
  over?: Partial<HAEntity>,
): HAEntity {
  return {
    entity_id:  entityId,
    domain:     entityId.split('.')[0],
    state:      state?.state ?? 'unavailable',
    attributes: (state?.attributes ?? {}) as Record<string, unknown>,
    device_id:  reg?.device_id,
    area_id:    reg?.area_id,
    platform:   reg?.platform ? String(reg.platform).toLowerCase() : undefined,
    entity_category: reg?.entity_category ?? undefined,
    ...over,
  };
}

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
    device.entities.push(toEntity(entityId, regEntry, hass.states[entityId]));
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
export const NATIVE_CONTROL_DOMAINS = new Set(['switch', 'light', 'cover', 'climate', 'valve', 'media_player']);

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

/** Does the device have a primary control of its own? One definition, so the
 *  universal-scope filter and the editor's entity-picker default cannot drift
 *  apart on which domains count. */
export const deviceHasControllable = (d: HADevice): boolean =>
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
  // The adaptive tile is composed of blocks (tile_layout), so its parts are
  // edited there — except the on/off button, which leads the name row and is
  // not a block. Without this entry it was the one control on the tile that
  // could not be hidden.
  default: [
    { id: 'toggle',       label: 'On/off button' },
  ],
  'power-monitor': [
    { id: 'toggle',       label: 'On/off button' },
    // 'graph' is every graph on the tile: the variant's own power spark AND the
    // Show-graphs companion rows in the lower body, so it is never a dead
    // toggle on the variants (Gauge, Compact) that have no spark of their own.
    { id: 'graph',        label: 'Graphs (spark + sensor rows)' },
    { id: 'secondary',    label: 'Secondary readings (V/A/kWh)' },
    { id: 'header_chips', label: 'Chips in the name row', def: false },
    { id: 'uptime',       label: 'Uptime badge' },
    { id: 'lower_body',   label: 'Lower body (blocks)' },
  ],
  // The three control styles carry a 'graphs' element so Show graphs applies to
  // them the way it does to the block tile — a dimmer on Light control gets the
  // same power/temperature rows it would get on the default tile.
  'light-control': [
    { id: 'toggle',      label: 'On/off button' },
    { id: 'color_wheel', label: 'Colour wheel' },
    { id: 'brightness',  label: 'Brightness slider' },
    { id: 'color_temp',  label: 'Colour temperature' },
    { id: 'white',       label: 'White channel' },
    { id: 'effects',     label: 'Effects' },
    { id: 'power',       label: 'Power reading' },
    { id: 'graphs',      label: 'Sensor graphs (with Show graphs)' },
  ],
  'climate-control': [
    { id: 'heating_badge',  label: 'Heating badge' },
    { id: 'dial',           label: 'Temperature dial' },
    { id: 'adjust_buttons', label: '+/− buttons' },
    { id: 'stats',          label: 'Stats row' },
    { id: 'presets',        label: 'Preset buttons' },
    { id: 'graphs',         label: 'Sensor graphs (with Show graphs)' },
  ],
  'cover-control': [
    { id: 'position_pct',    label: 'Position %' },
    { id: 'shutter_graphic', label: 'Shutter graphic' },
    { id: 'moving_label',    label: 'Moving label' },
    { id: 'buttons',         label: 'Open / stop / close' },
    { id: 'position_slider', label: 'Position slider (covers that report one)' },
    { id: 'graphs',          label: 'Sensor graphs (with Show graphs)' },
  ],
  'sensor-card': [
    { id: 'primary_value', label: 'Primary value' },
    { id: 'trend',         label: 'Trend arrow' },
    // Its own switch: a sensor card exists to show history, so it does not also
    // wait on Show graphs (which defaults off and left the card blank).
    { id: 'graph',         label: 'Sparkline graphs' },
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
  media:        ['name_row', 'media_controls', 'sensors', 'virtual_controls', 'delegated_controls', 'badges'],
  energy:       ['name_row', 'sensors', 'graph', 'virtual_controls', 'delegated_controls', 'badges'],
  sensor:       ['name_row', 'sensors', 'graph', 'virtual_controls', 'delegated_controls', 'badges'],
  input:        ['name_row', 'sensors', 'input_channels', 'virtual_controls', 'delegated_controls', 'badges'],
  uni:          ['name_row', 'input_channels', 'sensors', 'virtual_controls', 'delegated_controls', 'badges'],
  wall_display: ['name_row', 'sensors', 'graph', 'trv_control', 'media_controls', 'virtual_controls', 'delegated_controls', 'badges'],
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

/** First live numeric reading per device_class on a device. Primary entities
 *  win; a diagnostic one (a relay's own temperature) only stands in for a class
 *  nothing else reports, so a Wall Display's room temperature is never shadowed
 *  by its board temperature. */
export function deviceSensorValues(
  device: HADevice,
  states: Record<string, { state?: string; attributes?: Record<string, unknown> } | undefined>,
): Record<string, SensorReading> {
  const out: Record<string, SensorReading> = {};
  const read = (diagnostics: boolean) => {
    for (const e of device.entities) {
      if (e.domain !== 'sensor' || !!e.entity_category !== diagnostics) continue;
      const s = states[e.entity_id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
      const dc = (s.attributes?.device_class as string | undefined)
        ?? ((e.attributes as Record<string, unknown> | undefined)?.device_class as string | undefined);
      if (!dc || dc in out) continue;
      const v = parseFloat(s.state ?? '');
      if (!isNaN(v)) out[dc] = { value: v, diagnostic: diagnostics };
    }
  };
  read(false);
  read(true);
  return out;
}

/** A reading and where it came from. Which pass found it matters downstream: a
 *  relay's only temperature is its own board (a diagnostic entity) and runs
 *  45–65 °C, while a room sensor's runs 15–25 °C — one range cannot serve both. */
export interface SensorReading { value: number; diagnostic: boolean }

/** Lend a device readings that live on another device. `extra_sensors` on a
 *  device style lists entity ids to show on that tile as if the device reported
 *  them — a BLU H&T's temperature on a Wall Display XL, which has no sensor of
 *  its own. Done once at discovery so every surface (chips, graphs, gauge rings,
 *  sensor card, detail sheet) sees them with no special case; the entity is
 *  flagged `borrowed_from` so device-health readers can leave it out. Devices
 *  that borrow nothing are returned as-is (same reference); a borrower gets a
 *  fresh entity array. Unknown ids are skipped, an id the device already owns is
 *  not doubled. */
export function attachExtraSensors(
  devices: HADevice[],
  deviceStyles: Record<string, { extra_sensors?: string[] }> | undefined,
  hass: HomeAssistant,
): HADevice[] {
  if (!deviceStyles) return devices;
  // Most configs borrow nothing; don't map the whole fleet for them.
  if (!Object.values(deviceStyles).some(s => s?.extra_sensors?.length)) return devices;
  const byId = new Map(devices.map(d => [d.device_id, d]));
  const entityRegistry: Record<string, any> = (hass as any).entities ?? {};
  const deviceRegistry: Record<string, any> = (hass as any).devices ?? {};
  return devices.map(d => {
    const ids = deviceStyles[d.device_id]?.extra_sensors;
    if (!ids?.length) return d;
    const seen = new Set(d.entities.map(e => e.entity_id));
    const extra: HAEntity[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      const st = hass.states[id];
      if (!st) continue;
      seen.add(id);
      const reg = entityRegistry[id];
      const lenderId: string | undefined = reg?.device_id;
      const lender = lenderId
        ? (byId.get(lenderId)?.name ?? deviceRegistry[lenderId]?.name_by_user ?? deviceRegistry[lenderId]?.name)
        : undefined;
      extra.push(toEntity(id, reg, st, { borrowed_from: lender ?? 'another device' }));
    }
    return extra.length ? { ...d, entities: [...d.entities, ...extra] } : d;
  });
}

/** What a gauge ring knows per device class: default range and how the value
 *  reads. Array order is ring order — electrical first so a relay keeps
 *  W/V/A/°C, then the environment a Wall Display or BLU H&T reports. */
export const GAUGE_RING_DEFS: Array<{
  key: string; label: string; min: number; max: number; digits: number;
  /** Default gradient along the arc, empty end → full end. Absent = one flat colour. */
  stops?: string[];
  /** Range to use when the reading came from a diagnostic entity — a relay's
   *  board temperature sits at 45–65 °C, which would peg a room-temperature
   *  ring at full red on every relay in the fleet. */
  diag?: { min: number; max: number };
}> = [
  { key: 'power',          label: 'W',   min: 0,   max: 3000, digits: 0 },
  { key: 'voltage',        label: 'V',   min: 0,   max: 250,  digits: 0 },
  { key: 'current',        label: 'A',   min: 0,   max: 16,   digits: 2 },
  { key: 'temperature',    label: '°C',  min: -10, max: 40,   digits: 1, stops: ['#38bdf8', '#fde047', '#f87171'], diag: { min: 0, max: 100 } },
  { key: 'humidity',       label: '%',   min: 0,   max: 100,  digits: 0, stops: ['#fde68a', '#2dd4bf', '#0ea5e9'] },
  { key: 'illuminance',    label: 'lx',  min: 0,   max: 2000, digits: 0, stops: ['#94a3b8', '#fde047', '#fffbeb'] },
  { key: 'carbon_dioxide', label: 'ppm', min: 400, max: 2000, digits: 0, stops: ['#4ade80', '#fde047', '#f87171'] },
  { key: 'battery',        label: '%',   min: 0,   max: 100,  digits: 0, stops: ['#f87171', '#fde047', '#4ade80'] },
];
/** The gauge SVG has room for four concentric arcs before they crowd. */
export const GAUGE_MAX_RINGS = 4;

export interface GaugeRing {
  key: string; label: string; val: number; min: number; max: number; digits: number;
  /** Colour stops along the arc, empty end → full end. One entry = flat. */
  stops: string[];
  /** The stop colour at the reading — what the value label wears. */
  color: string;
  /** Where the reading sits in the range, 0–1. */
  pct: number;
}

/** Read a CSS colour the card actually stores — `#rgb`, `#rrggbb`, `#rrggbbaa`,
 *  `rgb()`/`rgba()` — into an opaque hex plus its alpha. Returns null for
 *  anything else ('transparent', `var(--x)`, a named colour), so a caller can
 *  say "this is not a plain colour" instead of silently treating it as black.
 *  Tile and room backgrounds are stored as rgba with a 3.5% alpha, so a picker
 *  that dropped the alpha turned a tint into a solid slab. */
export function parseCssColor(value: string | undefined): { hex: string; alpha: number } | null {
  const v = (value ?? '').trim();
  if (!v) return null;
  const hex = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (hex) {
    const h = hex[1];
    const dup = (s: string) => s + s;
    if (h.length === 3 || h.length === 4) {
      return { hex: '#' + [...h.slice(0, 3)].map(dup).join(''), alpha: h.length === 4 ? parseInt(dup(h[3]), 16) / 255 : 1 };
    }
    if (h.length === 6 || h.length === 8) {
      return { hex: '#' + h.slice(0, 6).toLowerCase(), alpha: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
    }
    return null;
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(v);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const ch = parts.slice(0, 3).map(p => {
      const n = p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p);
      return Math.max(0, Math.min(255, Math.round(n)));
    });
    if (ch.some(isNaN)) return null;
    const aRaw = parts[3];
    const alpha = aRaw === undefined ? 1
      : aRaw.endsWith('%') ? parseFloat(aRaw) / 100 : parseFloat(aRaw);
    return { hex: '#' + ch.map(c => c.toString(16).padStart(2, '0')).join(''), alpha: isNaN(alpha) ? 1 : alpha };
  }
  return null;
}

/** Re-attach an alpha to an opaque hex, as the `rgba()` the card's styles use.
 *  alpha >= 1 keeps the plain hex, which is what most keys hold. */
export function withAlpha(hex: string, alpha: number): string {
  if (alpha >= 1) return hex;
  const p = parseCssColor(hex);
  if (!p) return hex;
  const [r, g, b] = [1, 3, 5].map(i => parseInt(p.hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.round(alpha * 1000) / 1000)})`;
}

/** `#rrggbb` → HSV (h 0–360, s 0–1, v 0–1). Non-hex input reads as black. */
export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { h: 0, s: 0, v: 0 };
  const r = parseInt(m[1].slice(0, 2), 16) / 255, g = parseInt(m[1].slice(2, 4), 16) / 255, b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** HSV (h 0–360, s 0–1, v 0–1) → `#rrggbb`. */
export function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [r, g, b].map(ch => Math.round((ch + m) * 255).toString(16).padStart(2, '0')).join('');
}

/** Linear blend between gradient stops at position t (0–1). Hex stops only —
 *  the gauge palette is hex throughout; anything else returns the last stop. */
export function colorAt(stops: string[], t: number): string {
  if (stops.length === 1) return stops[0];
  const hex = (s: string) => /^#[0-9a-f]{6}$/i.test(s) ? [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)) : null;
  const rgb = stops.map(hex);
  if (rgb.some(c => !c)) return stops[stops.length - 1];
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  const f = x - i;
  const a = rgb[i]!, b = rgb[i + 1]!;
  const mix = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return '#' + mix.map(v => v.toString(16).padStart(2, '0')).join('');
}

/** The rings a gauge draws for a device: every GAUGE_RING_DEFS class the device
 *  reports, in ring order, capped at GAUGE_MAX_RINGS. The gauge used to
 *  hard-code W/V/A/°C, so a sensor device got one arc and no humidity. Ranges
 *  come from `graph_style.sensor_ranges`; colours in order of precedence:
 *  `graph_style.gauge_gradients[key]` (2–3 stops), `graph_sensor_colors[key]`
 *  (flat), the def's default gradient, the graph palette colour; power takes
 *  the accent. The label colour is the gradient sampled at the reading. */
export function gaugeRings(
  values: Record<string, SensorReading>,
  opts: {
    ranges?: Record<string, { min?: number; max?: number }>;
    colors?: Record<string, string>;
    gradients?: Record<string, string[]>;
    accent: string;
  },
): GaugeRing[] {
  const rings: GaugeRing[] = [];
  for (const d of GAUGE_RING_DEFS) {
    const reading = values[d.key];
    if (reading == null) continue;
    const val = reading.value;
    const r = opts.ranges?.[d.key] ?? {};
    // A configured range always wins; otherwise the source picks the default.
    const def = reading.diagnostic && d.diag ? d.diag : d;
    const min = r.min ?? def.min, max = r.max ?? def.max;
    const stops = gaugeStops(d.key, opts);
    const pct = Math.min(1, Math.max(0, (val - min) / (max - min || 1)));
    rings.push({ key: d.key, label: d.label, val, digits: d.digits, min, max, stops, pct, color: colorAt(stops, pct) });
    if (rings.length >= GAUGE_MAX_RINGS) break;
  }
  return rings;
}

/** The colours one gauge ring wears, in precedence order: a configured gradient
 *  (2+ stops), a configured flat colour, the class's default gradient, the graph
 *  palette, the accent. Exported so the editor's gradient rows and the tile
 *  cannot drift — they had, on power's flat colour. Tolerant of hand-written
 *  YAML: a scalar or a short list where a gradient belongs is ignored rather
 *  than thrown on, since a render error takes the whole card down. */
export function gaugeStops(
  key: string,
  opts: { colors?: Record<string, string>; gradients?: Record<string, string[]>; accent: string },
): string[] {
  const def = GAUGE_RING_DEFS.find(d => d.key === key);
  const raw = opts.gradients?.[key];
  const grad = Array.isArray(raw) ? raw.filter(c => typeof c === 'string' && c) : undefined;
  if (grad && grad.length >= 2) return grad;
  const flat = opts.colors?.[key];
  if (typeof flat === 'string' && flat) return [flat];
  if (def?.stops) return def.stops;
  const graphColor = GRAPH_SENSOR_DEFS.find(g => g.key === key)?.defaultColor;
  return [key === 'power' ? opts.accent : graphColor ?? opts.accent];
}

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

  // A media player used to be drawn by `delegated_controls` (a native HA tile);
  // it now has the card's own `media_controls` block. A layout pinned before
  // that change lists the old block and not the new one, and a pinned layout is
  // taken verbatim — the device would silently lose its controls. Add the new
  // block wherever the old one is named, keeping its position.
  const layoutHolders = config as unknown as {
    tile_layout?: unknown;
    device_styles?: Record<string, { tile_layout?: unknown }>;
    profile_styles?: Record<string, { tile_layout?: unknown }>;
    area_styles?: Record<string, { tile_layout?: unknown }>;
    views?: Array<{ tile_layout?: unknown }>;
    custom_styles?: Record<string, { tile_layout?: unknown }>;
    style_presets?: Record<string, { tile_layout?: unknown }>;
  };
  let layoutsChanged = false;
  const withMedia = (layout: unknown): unknown => {
    if (!Array.isArray(layout)) return layout;
    // Rows form: recurse one level. Flat form: a list of block ids.
    if (layout.some(r => Array.isArray(r))) {
      let hit = false;
      const rows = layout.map(r => {
        if (!Array.isArray(r) || !r.includes('delegated_controls') || r.includes('media_controls')) return r;
        hit = true;
        return r.flatMap(b => (b === 'delegated_controls' ? ['media_controls', b] : [b]));
      });
      if (hit) { layoutsChanged = true; return rows; }
      return layout;
    }
    if (!layout.includes('delegated_controls') || layout.includes('media_controls')) return layout;
    layoutsChanged = true;
    return layout.flatMap(b => (b === 'delegated_controls' ? ['media_controls', b] : [b]));
  };
  const mapHolder = <H extends Record<string, { tile_layout?: unknown }>>(holder: H | undefined): H | undefined => {
    if (!holder) return holder;
    let hit = false;
    const next: Record<string, { tile_layout?: unknown }> = {};
    for (const [k, v] of Object.entries(holder)) {
      const l = withMedia(v?.tile_layout);
      if (v && l !== v.tile_layout) { next[k] = { ...v, tile_layout: l }; hit = true; } else next[k] = v;
    }
    return hit ? (next as H) : holder;
  };
  const nextTileLayout = withMedia(layoutHolders.tile_layout);
  const nextDeviceStyles = mapHolder(layoutHolders.device_styles);
  const nextProfileStyles = mapHolder(layoutHolders.profile_styles);
  const nextAreaStyles = mapHolder(layoutHolders.area_styles);
  const nextCustomStyles = mapHolder(layoutHolders.custom_styles);
  const nextStylePresets = mapHolder(layoutHolders.style_presets);
  let nextViews = layoutHolders.views;
  if (Array.isArray(nextViews)) {
    let hit = false;
    const mapped = nextViews.map(v => {
      const l = withMedia(v?.tile_layout);
      if (v && l !== v.tile_layout) { hit = true; return { ...v, tile_layout: l }; }
      return v;
    });
    if (hit) nextViews = mapped;
  }
  if (layoutsChanged) changed = true;

  if (!changed) return config;
  const out: T = { ...config };
  if (layoutsChanged) {
    const o = out as unknown as typeof layoutHolders;
    if (nextTileLayout !== layoutHolders.tile_layout) o.tile_layout = nextTileLayout;
    if (nextDeviceStyles !== layoutHolders.device_styles) o.device_styles = nextDeviceStyles;
    if (nextProfileStyles !== layoutHolders.profile_styles) o.profile_styles = nextProfileStyles;
    if (nextAreaStyles !== layoutHolders.area_styles) o.area_styles = nextAreaStyles;
    if (nextCustomStyles !== layoutHolders.custom_styles) o.custom_styles = nextCustomStyles;
    if (nextStylePresets !== layoutHolders.style_presets) o.style_presets = nextStylePresets;
    if (nextViews !== layoutHolders.views) o.views = nextViews;
  }
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
  'energy_period', 'graph_sensors', 'graph_hours', 'graph_style', 'graph_line_color', 'radio_stations',
  'extra_card_style', 'area_card_placement', 'devices', 'show_header',
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

/** Which of an input event entity's `event_types` stand for a tap, a double tap
 *  and a hold. Gen2+ reports `single_push` / `double_push` / `long_push`; Gen1
 *  reports `single` / `double` / `long`. `btn_down` / `btn_up` are edges, not
 *  presses, and are never picked. */
export function shellyClickTypes(
  eventTypes: readonly string[] | undefined,
): { single?: string; double?: string; long?: string } {
  const pick = (re: RegExp) => (eventTypes ?? []).find(t => re.test(t));
  return {
    single: pick(/^single(_push)?$/),
    double: pick(/^double(_push)?$/),
    long: pick(/^long(_push)?$/),
  };
}

/** The input number as Shelly's device triggers count it — "Button 1" is 1.
 *  The registry unique_id is authoritative when known: Gen2+ `MAC-input:2` is
 *  the 0-based component id (→ 3), Gen1 `MAC-sensor_1-2` already ends in the
 *  1-based channel. Without it the entity id has to do, and HA names inputs
 *  0-based on Gen2+ (`input_3` is the fourth) but 1-based on Gen1. An input
 *  with no number at all is a single-input device: channel 1. */
export function shellyInputChannel(entityId: string, gen: DeviceGen, uniqueId?: string | null): number {
  if (uniqueId) {
    const rpc = uniqueId.match(/-input:(\d+)$/);
    if (rpc) return parseInt(rpc[1], 10) + 1;
    const blk = uniqueId.match(/-(\d+)$/);
    if (blk) return parseInt(blk[1], 10);
  }
  const n = channelNumber(entityId);
  if (n == null) return 1;
  return gen === 1 ? n : n + 1;
}

/** The device's Shelly hostname (`shellyplusi4-083af2009ec0`), which the
 *  integration puts in a click event's `device` field, read off any un-renamed
 *  entity id on the device. Best effort — device triggers match on device_id;
 *  this only serves hand-written event triggers keyed on the hostname. */
export function shellyHostname(device: HADevice): string | undefined {
  for (const e of device.entities) {
    const m = e.entity_id.match(/^[a-z_]+\.(shelly[a-z0-9]*_[0-9a-f]{6,12})_/);
    if (m) return m[1].replace('_', '-');
  }
  return undefined;
}

/** Channel number of an OUTPUT entity — `switch_0`, `relay_1`, `light_0`,
 *  `channel_2` (Gen1 names its relays by channel too). */
function outputChannelNumber(entityId: string): number | null {
  const m = entityId.match(/(?:switch|relay|light|channel)[_\s]*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

/** The relay/light on the same device that an input is wired to. A device with
 *  ONE output (a 1PM, a Dimmer 2 with its up/down pair) wires every input to it;
 *  a multi-output device (2PM, 2.5) pairs by channel number — `input_0` drives
 *  `switch_0`. Config switches (the i4's "dimmer_control") carry an entity
 *  category and never count as outputs, so input-only hardware pairs nothing. */
function pairedOutput(device: HADevice, inputNum: number | null, profile: DeviceProfile): string | undefined {
  // Input-only hardware wires its inputs to nothing — a script-made virtual
  // switch on an i4 must not be mistaken for "the" output. The profile is
  // passed in: detecting it per row meant a full re-detection per input per
  // tile per render, bypassing the card's profile cache.
  if (profile === 'input' || profile === 'uni') return undefined;
  const outputs = device.entities.filter(e => (e.domain === 'switch' || e.domain === 'light')
    && !e.entity_category);
  if (!outputs.length) return undefined;
  if (outputs.length === 1) return outputs[0].entity_id;
  if (inputNum != null) {
    const byNum = outputs.find(e => outputChannelNumber(e.entity_id) === inputNum);
    if (byNum) return byNum.entity_id;
  }
  return undefined;
}

/** HA's friendly name is "<device> <entity>", so on the device's own tile the
 *  device half is noise ("Oven relay Oven relay"). Strip it. One definition —
 *  the tile label, the chip, the editor's rows and the channel row had five
 *  near-copies that could disagree. Returns '' when nothing is left, so each
 *  caller picks its own fallback. */
export function stripDevicePrefix(friendly: string, deviceName: string | undefined): string {
  const label = (friendly ?? '').trim();
  const prefix = (deviceName ?? '').trim();
  if (prefix && label.toLowerCase().startsWith(prefix.toLowerCase())) {
    return label.slice(prefix.length).trim();
  }
  return label;
}

/** Row label: whatever HA calls the entity, minus the device-name prefix, so a
 *  renamed input ("Bedroom light") keeps its name instead of being relabelled. */
function channelLabel(friendly: string, deviceName: string, num: number | null, entityId: string): string {
  const label = stripDevicePrefix(friendly, deviceName);
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
  // Detected once for the whole device, not once per input row.
  const profile = bsInputs.length || evInputs.length ? getDeviceProfile(device).type : 'generic';

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
      kind: ev ? 'button' : 'switch',
      channel: num ?? 0,
      lastEvent: evType ?? null,
      lastChanged: st?.last_changed ?? null,
      output: pairedOutput(device, num, profile),
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
      kind: 'button',
      channel: num ?? 0,
      lastEvent: (st?.attributes?.event_type as string | undefined) ?? null,
      // An event entity's state IS the timestamp of the last press.
      lastChanged: st?.last_changed ?? live,
      output: pairedOutput(device, num, profile),
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
  if (has('media_player')) blocks.add('media_controls');
  if (['lock', 'fan', 'vacuum'].some(has)) blocks.add('delegated_controls');

  return {
    chips,
    blocks,
    hasEnergy: chips.has('energy') || chips.has('power'),
    hasGraphs,
    hasOnOff: ['switch', 'light', 'cover', 'valve', 'fan', 'lock', 'climate', 'binary_sensor']
      .some(has),
  };
}
