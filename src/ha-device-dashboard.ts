import { LitElement, html, svg, unsafeCSS, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { HADeviceDashboardConfig, HADevice, HAEntity, TileBlockId, DeviceProfileResult, EntityAnimationType, TileStyle, PowerMonitorVariant, SensorRange, HassAttrs, ViewConfig } from './types';
import { BUNDLED_FONT_CSS } from './fonts';
import { mainCss } from './styles/main';
import { tilesCss } from './styles/tiles';
import { detailCss } from './styles/detail';
import type {
  TileCtx, TrvInfo, CoverInfo, ValveInfo, GraphEntity,
  FirmwareInfo, SensorChip, SensorChipTier, VirtualControl, InputChannel, DeviceAlert,
} from './tiles/tile-context';
import { renderClimateControlTile } from './tiles/climate-control';
import { renderCoverControlTile } from './tiles/cover-control';
import { renderSceneButtonTile } from './tiles/scene-button';
import { renderSensorCardTile } from './tiles/sensor-card';
import { renderPowerMonitorTile } from './tiles/power-monitor';
import { renderLightControlTile } from './tiles/light-control';
import { renderBlockTile } from './tiles/block-tile';
import { renderDetailSheet } from './detail/detail-sheet';
import {
  getAllDevices, getDeviceProfile,
  getIntegrationLabel, isPrivateIp, PROFILE_DEFAULT_BLOCKS, GRAPH_DC_LABELS, GRAPH_SENSOR_DEFS,
  HEADER_CHIP_DEFS, DEFAULT_HEADER_CHIPS, downsamplePoints,
  formatPower, formatEnergy, formatVoltage, formatCurrent, formatTemp,
  formatUptime, formatApparentPower, formatReactivePower,
  formatFrequency, formatHumidity, formatIlluminance, formatPpm, formatPercent,
} from './helpers';
import { renderAnimSvg } from './anim-icons';

// ─── Google Fonts CDN loader (for display fonts selected in editor) ──────────
// Keep in sync with FONT_OPTIONS.cdn in editor.ts
const CDN_FONT_FAMILIES = [
  'Alfa+Slab+One','Bebas+Neue','Black+Ops+One','Bungee','Bungee+Shade','Cinzel',
  'Dancing+Script','Fredericka+the+Great','Great+Vibes','Monoton','Permanent+Marker',
  'Shrikhand','Ultra',
];
let _cdnFontsInjected = false;
function ensureCdnFontsLoaded(): void {
  if (_cdnFontsInjected || typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${CDN_FONT_FAMILIES.map(f => `family=${f}`).join('&')}&display=swap`;
  document.head.appendChild(link);
  _cdnFontsInjected = true;
}

// ─── Ha Device Dashboard Card ──────────────────────────────────────────────────

@customElement('ha-device-dashboard')
export class HADeviceDashboard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public preview = false;
  @state() private _config!: HADeviceDashboardConfig;
  @state() private _closedAreas = new Set<string>();
  @state() private _entityListOpen = new Set<string>();
  @state() private _graphData = new Map<string, Array<{ t: number; v: number }>>();
  @state() private _valveDragPos: number | null = null;
  @state() private _trvDragTemp: number | null = null;
  private _trvBtnTimer: ReturnType<typeof setTimeout> | null = null;
  /** Which header drill-down is open: 'on'/'off'/'unavailable' (cloud chips) or 'm:<metric>' (stat chips). */
  @state() private _cloudDetailOpen: string | null = null;
  @state() private _detailDevice: string | null = null;
  @state() private _detailHistoryRange: 24 | 168 | 720 = 24;
  @state() private _activeViewId: string | null = null;

  // Tap-gesture tracking (not @state — no re-render needed)
  private _lpStart: { x: number; y: number } | null = null;

  private readonly _graphFetching = new Set<string>();
  private readonly _graphFetchedAt = new Map<string, number>();

  // Device list cache — only recompute when entity/device registries or config change
  private _cachedDevices: HADevice[] | null = null;
  private _cacheEntitiesRef: unknown = null;
  private _cacheDevicesRef: unknown = null;
  private _cacheConfigRef: HADeviceDashboardConfig | null = null;

  // Card-level CSS var map — recomputed only when config changes.
  // Rebuilding this every render would re-stringify embedded data URLs
  // (card_bg_image / tile_bg_image), which can be ~500 KB each.
  private _cachedCardStyles: Record<string, string> | null = null;
  private _cardStylesConfigRef: HADeviceDashboardConfig | null = null;

  private static readonly BRIGHTNESS_MAX = 255;

  // ── Lovelace hooks ────────────────────────────────────────────────────────

  static getConfigElement() {
    return document.createElement('ha-device-dashboard-editor');
  }

  static getStubConfig(): HADeviceDashboardConfig {
    return { type: 'custom:ha-device-dashboard' };
  }

  static getLayoutOptions() {
    return { grid_columns: 10, grid_min_columns: 4, grid_min_rows: 3 };
  }

  setConfig(config: HADeviceDashboardConfig) {
    this._config = config;
    // Only fetch the CDN stylesheet if the user selected a CDN-only display font
    const ff = config.style?.font_family ?? '';
    if (CDN_FONT_FAMILIES.some(f => ff.includes(f.replace(/\+/g, ' ')))) ensureCdnFontsLoaded();
  }

  /**
   * Skip re-rendering when only unrelated entities changed in `hass`.
   * On large HA instances (2k+ entities) Lit otherwise re-renders the whole
   * card on every state push, which is expensive when tiles carry large
   * background images.
   */
  protected shouldUpdate(changed: Map<string, unknown>): boolean {
    // Always re-render on config or local UI state changes
    if (
      changed.has('_config') ||
      changed.has('_closedAreas') ||
      changed.has('_entityListOpen') ||
      changed.has('_graphData') ||
      changed.has('_valveDragPos') ||
      changed.has('_trvDragTemp') ||
      changed.has('_detailDevice') ||
      changed.has('_detailHistoryRange') ||
      changed.has('_activeViewId') ||
      changed.has('_cloudDetailOpen') ||
      changed.has('preview')
    ) {
      return true;
    }
    if (!changed.has('hass')) return true;

    const oldHass = changed.get('hass') as HomeAssistant | undefined;
    if (!oldHass || !this.hass) return true;

    // If we don't have a device cache yet, fall back to default behaviour
    const devices = this._cachedDevices;
    if (!devices) return true;

    // Re-render only if a state for one of OUR entities actually changed.
    // Interactive domains (switch/light/cover/…) render immediately; pure
    // sensor churn (Shelly power sensors push every second or two) is
    // coalesced to at most one render per THROTTLE_MS — otherwise a large
    // fleet re-renders the whole card near-continuously.
    const THROTTLE_MS = 2000;
    let sensorChanged = false;
    for (const dev of devices) {
      const ents = dev.entities;
      if (!ents) continue;
      for (const e of ents) {
        const id = e.entity_id;
        if (!id) continue;
        if (oldHass.states[id] !== this.hass.states[id]) {
          if (e.domain !== 'sensor') return true;
          sensorChanged = true;
        }
      }
    }
    if (!sensorChanged) return false;
    const now = Date.now();
    if (now - this._lastSensorRender >= THROTTLE_MS) {
      this._lastSensorRender = now;
      return true;
    }
    if (this._sensorRenderTimer == null) {
      this._sensorRenderTimer = window.setTimeout(() => {
        this._sensorRenderTimer = null;
        this._lastSensorRender = Date.now();
        this.requestUpdate();
      }, THROTTLE_MS - (now - this._lastSensorRender));
    }
    return false;
  }

  private _lastSensorRender = 0;
  private _sensorRenderTimer: number | null = null;

  getCardSize() { return 6; }

  connectedCallback() {
    super.connectedCallback();
    this._loadActiveView();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._graphFetching.clear();
    this._graphFetchedAt.clear();
    this._graphData = new Map();
    if (this._sensorRenderTimer != null) {
      clearTimeout(this._sensorRenderTimer);
      this._sensorRenderTimer = null;
    }
  }

  // ── Device data ───────────────────────────────────────────────────────────

  private _getDevices(): HADevice[] {
    if (!this.hass) return [];

    const entitiesRef = (this.hass as any).entities;
    const devicesRef  = (this.hass as any).devices;
    if (
      this._cachedDevices &&
      entitiesRef === this._cacheEntitiesRef &&
      devicesRef  === this._cacheDevicesRef  &&
      this._config === this._cacheConfigRef
    ) {
      return this._cachedDevices;
    }
    this._cacheEntitiesRef = entitiesRef;
    this._cacheDevicesRef  = devicesRef;
    this._cacheConfigRef   = this._config;

    let devices = getAllDevices(this.hass);

    // Area filter — undefined = show ALL rooms, [] = show nothing, [...] = show listed
    const areaFilter = this._config.areas;
    if (areaFilter !== undefined) {
      const normalized = new Set(areaFilter.map(a => a.toLowerCase()));
      devices = devices.filter(d => normalized.has((d.area ?? '').toLowerCase()));
    }

    // Offline filter
    if (this._config.show_offline === false) {
      devices = devices.filter(d => this._isOnline(d));
    }

    // hidden_devices
    if (this._config.hidden_devices?.length) {
      const hidden = new Set(this._config.hidden_devices);
      devices = devices.filter(d => !hidden.has(d.device_id));
    }

    this._cachedDevices = devices;
    return devices;
  }

  /** Returns the currently-active view, or null if the card has no `views` configured. */
  private _getActiveView(): ViewConfig | null {
    const views = this._config.views;
    if (!views?.length) return null;
    const targetId =
      this._activeViewId
      ?? this._config.default_view
      ?? views[0].id;
    return views.find(v => v.id === targetId) ?? views[0];
  }

  /** Apply a view's filter on top of the baseline device list. No-op if no filter present. */
  private _applyViewFilter(devices: HADevice[], view: ViewConfig): HADevice[] {
    const f = view.filter;
    if (!f) return devices;
    let out = devices;

    if (f.profiles?.length) {
      const allow = new Set(f.profiles);
      out = out.filter(d => allow.has(getDeviceProfile(d).type));
    }
    if (f.domains?.length) {
      const allow = new Set(f.domains);
      out = out.filter(d => d.entities.some(e => allow.has(e.domain)));
    }
    if (f.areas?.length) {
      const allow = new Set(f.areas.map(a => a.toLowerCase()));
      out = out.filter(d => allow.has((d.area ?? '').toLowerCase()));
    }
    if (f.devices?.length) {
      const allow = new Set(f.devices);
      out = out.filter(d => allow.has(d.device_id));
    }
    if (f.exclude_devices?.length) {
      const block = new Set(f.exclude_devices);
      out = out.filter(d => !block.has(d.device_id));
    }
    if (f.entity_id_pattern) {
      let re: RegExp | null = null;
      try { re = new RegExp(f.entity_id_pattern); }
      catch { console.warn(`[ha-device-dashboard] invalid entity_id_pattern in view "${view.id}": ${f.entity_id_pattern}`); }
      if (re) out = out.filter(d => d.entities.some(e => re!.test(e.entity_id)));
    }
    return out;
  }

  private _viewStorageKey(): string {
    return `shelly-dashboard:activeView:${this._config.title ?? 'default'}`;
  }

  private _persistActiveView(): void {
    try {
      if (this._activeViewId) localStorage.setItem(this._viewStorageKey(), this._activeViewId);
    } catch { /* localStorage unavailable (privacy mode, SSR) — silent */ }
  }

  private _loadActiveView(): void {
    try {
      const stored = localStorage.getItem(this._viewStorageKey());
      if (stored) this._activeViewId = stored;
    } catch { /* ignore */ }
  }

  private _setActiveView(id: string): void {
    this._activeViewId = id;
    this._persistActiveView();
  }

  /**
   * Build the card-level CSS variable map from `this._config`.
   * Memoized against config identity — recomputed only when config changes.
   */
  private _buildCardStyles(): Record<string, string> {
    if (this._cardStylesConfigRef === this._config && this._cachedCardStyles) {
      return this._cachedCardStyles;
    }
    const st = this._config.style ?? {};
    const s: Record<string, string> = {};

    if (st.accent_color)  s['--sc-accent']       = st.accent_color;
    if (st.tile_radius)   s['--tile-radius']     = `${st.tile_radius}px`;
    if (st.tile_gap)      s['--tile-gap']        = `${st.tile_gap}px`;
    if (st.font_family)   s['--sc-font-family']  = st.font_family;
    if (st.text_size_scale)  s['--sc-text-scale']     = String(st.text_size_scale);
    if (st.tile_bg)            s['--sc-tile-bg']         = st.tile_bg;
    if (st.tile_bg_image)      s['--sc-tile-bg-image']   = `url("${st.tile_bg_image}")`;
    if (st.tile_bg_image_size) s['--sc-tile-bg-image-sz']= st.tile_bg_image_size === 'stretch' ? '100% 100%' : st.tile_bg_image_size;
    if (this._config.card_bg_image)      s['--sc-card-bg-image']   = `url("${this._config.card_bg_image}")`;
    if (this._config.card_bg_image_size) s['--sc-card-bg-image-sz']= this._config.card_bg_image_size === 'stretch' ? '100% 100%' : this._config.card_bg_image_size;
    if (st.tile_border)        s['--sc-tile-border']      = st.tile_border;
    if (st.tile_border_width != null) s['--sc-tile-border-width'] = `${st.tile_border_width}px`;
    if (st.tile_hover_bg)      s['--sc-tile-hover-bg']    = st.tile_hover_bg;
    if (st.tile_hover_shadow)  s['--sc-tile-hover-shad']  = st.tile_hover_shadow;
    if (st.tile_sensor_bg)     s['--sc-sensor-bg']        = st.tile_sensor_bg;
    if (st.tile_exp_bg)        s['--sc-tile-exp-bg']      = st.tile_exp_bg;
    if (st.card_radius != null) s['--sc-card-radius']     = `${st.card_radius}px`;
    if (st.text_primary)       s['--sc-text-primary']     = st.text_primary;
    if (st.text_secondary)     s['--sc-text-secondary']   = st.text_secondary;
    if (st.text_muted)         s['--sc-text-muted']       = st.text_muted;
    if (st.offline_color)      s['--sc-offline-dot']      = st.offline_color;
    if (st.online_color)       s['--sc-online-color']     = st.online_color;
    if (st.power_color)        s['--sc-power-color']      = st.power_color;
    if (st.area_header_color)  s['--sc-area-header-color']= st.area_header_color;
    if (this._config.graph_line_color) s['--sc-graph-line'] = this._config.graph_line_color;

    const shadowMap: Record<string, string> = {
      soft:   '0 2px 8px rgba(0,0,0,0.25)',
      medium: '0 4px 16px rgba(0,0,0,0.40)',
      strong: '0 8px 28px rgba(0,0,0,0.60)',
    };
    if (st.tile_box_shadow && st.tile_box_shadow !== 'none')
      s['--sc-tile-shadow'] = shadowMap[st.tile_box_shadow] ?? 'none';
    else if (st.tile_box_shadow === 'none')
      s['--sc-tile-shadow'] = 'none';

    const btnShape   = st.button_shape   ?? 'pill';
    const btnVariant = st.button_variant ?? 'fill';
    const btnSize    = st.button_size    ?? 'md';
    const togPadMap: Record<string,string>   = { sm: '2px 8px', md: '4px 11px', lg: '6px 16px' };
    const togPadSqMap: Record<string,string> = { sm: '3px 5px', md: '4px 8px',  lg: '6px 12px' };
    const isSquarish = btnShape === 'square' || btnShape === 'circle';
    s['--tog-radius'] = btnShape === 'pill' ? '20px' : btnShape === 'rect' ? '6px' : btnShape === 'square' ? '6px' : '50%';
    s['--tog-pad']    = isSquarish ? togPadSqMap[btnSize] ?? togPadSqMap.md : togPadMap[btnSize] ?? togPadMap.md;
    s['--tog-fsize']  = btnSize === 'sm' ? '.65em' : btnSize === 'lg' ? '.8em' : '.72em';
    s['--tog-aspect'] = isSquarish ? '1' : 'auto';
    if (btnVariant === 'outline') {
      s['--tog-on-bg']     = 'transparent';
      s['--tog-on-border'] = '1px solid var(--sc-accent)';
      s['--tog-on-color']  = 'var(--sc-accent)';
      s['--tog-on-shadow'] = 'none';
    } else if (btnVariant === 'ghost') {
      s['--tog-on-bg']     = 'transparent';
      s['--tog-on-border'] = 'none';
      s['--tog-on-color']  = 'var(--sc-accent)';
      s['--tog-on-shadow'] = 'none';
    }

    if (st.header_bg && st.header_bg2) {
      s['--sc-header-bg'] = `linear-gradient(135deg, ${st.header_bg} 0%, ${st.header_bg2} 100%)`;
    } else if (st.header_bg) {
      s['--sc-header-bg'] = st.header_bg;
    }
    if (st.header_text_color)            s['--sc-header-text']         = st.header_text_color;
    if (st.header_orb_color)             s['--sc-header-orb2']         = st.header_orb_color;
    if (st.header_icon !== undefined)    s['--sc-header-icon']         = `'${st.header_icon}'`;
    if (st.header_title_size)            s['--sc-header-title-size']   = `${st.header_title_size}em`;
    if (st.header_radius != null)        s['--sc-header-radius']       = `${st.header_radius}px`;
    if (st.header_padding != null)       s['--sc-header-padding']      = `${st.header_padding}px`;
    if (st.header_border_color)          s['--sc-header-border-color'] = st.header_border_color;
    if (st.header_border_width != null)  s['--sc-header-border-width'] = `${st.header_border_width}px`;
    if (st.header_stat_online)           s['--sc-hstat-online']        = st.header_stat_online;
    if (st.header_stat_power)            s['--sc-hstat-power']         = st.header_stat_power;
    if (st.header_stat_offline)          s['--sc-hstat-offline']       = st.header_stat_offline;
    // Orbs are opt-in: shown only when explicitly enabled or ambient effects are on.
    if (!(this._config.header_show_orbs ?? this._config.effects ?? false)) s['--sc-header-orb-opacity'] = '0';
    const headerTransparency = this._config.header_opacity ?? 100;
    if (headerTransparency < 100) s['--sc-header-opacity'] = String(headerTransparency / 100);

    const cardBgBase = st.card_bg ?? 'var(--ha-card-background, #1c1c1e)';
    if (st.card_bg) s['--sc-card-bg'] = st.card_bg;
    const cardTransparency = this._config.card_opacity ?? 100;
    if (cardTransparency < 100) {
      s['--sc-card-bg'] = `color-mix(in srgb, ${cardBgBase} ${cardTransparency}%, transparent)`;
    }
    const tileTransparency = this._config.tile_opacity ?? 100;
    if (tileTransparency < 100) {
      s['--sc-tile-bg-opacity'] = String(tileTransparency / 100);
    }

    this._cardStylesConfigRef = this._config;
    this._cachedCardStyles = s;
    return s;
  }

  private _groupByArea(devices: HADevice[]): Map<string, HADevice[]> {
    const map = new Map<string, HADevice[]>();
    for (const d of devices) {
      const key = d.area ?? '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }

    const sortBy = this._config.sort_by ?? 'name';
    return new Map(
      [...map.entries()]
        .sort(([a], [b]) => {
          if (!a) return 1;
          if (!b) return -1;
          return a.localeCompare(b);
        })
        .map(([area, devs]) => [
          area,
          devs.sort(
            sortBy === 'power'
              ? (a, b) => (this._getPower(b) ?? -1) - (this._getPower(a) ?? -1)
              : sortBy === 'online'
              ? (a, b) => (Number(this._isOnline(b)) - Number(this._isOnline(a))) || a.name.localeCompare(b.name)
              : (a, b) => a.name.localeCompare(b.name)
          ),
        ])
    );
  }

  private _isOnline(device: HADevice): boolean {
    return device.entities.some(e => {
      const s = this.hass.states[e.entity_id];
      return s && s.state !== 'unavailable' && s.state !== 'unknown';
    });
  }

  private _getPower(device: HADevice): number | null {
    let total = 0, found = false;
    for (const e of device.entities) {
      const s = this.hass.states[e.entity_id];
      if (!s) continue;
      const attrs = s.attributes as Record<string, unknown>;
      if (attrs.current_power_w != null) {
        const p = Number(attrs.current_power_w);
        if (!isNaN(p)) { total += p; found = true; }
        continue;
      }
      if (e.domain === 'sensor' && (attrs.device_class as string) === 'power') {
        const v = parseFloat(s.state);
        if (!isNaN(v)) { total += v; found = true; }
      }
    }
    return found ? total : null;
  }

  private _getPrimarySwitch(device: HADevice): {
    entityId: string; isOn: boolean; brightness?: number;
    colorModes?: string[]; rgbColor?: [number, number, number]; whiteValue?: number;
  } | null {
    for (const e of device.entities) {
      if (e.domain !== 'switch' && e.domain !== 'light') continue;
      const s = this.hass.states[e.entity_id];
      if (!s) continue;
      const attrs = s.attributes as Record<string, unknown>;
      let brightness: number | undefined;
      let colorModes: string[] | undefined;
      let rgbColor: [number, number, number] | undefined;
      let whiteValue: number | undefined;

      if (e.domain === 'light') {
        brightness = s.state === 'on' && attrs.brightness != null
          ? Math.round(((attrs.brightness as number) / HADeviceDashboard.BRIGHTNESS_MAX) * 100)
          : 0;
        const modes = (attrs.supported_color_modes as string[]) ?? [];
        if (modes.some(m => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(m))) colorModes = modes;
        if (attrs.rgbw_color) {
          const [r, g, b, w] = attrs.rgbw_color as number[];
          rgbColor = [r, g, b]; whiteValue = w;
        } else if (attrs.rgb_color) {
          rgbColor = attrs.rgb_color as [number, number, number];
        }
      }
      return { entityId: e.entity_id, isOn: s.state === 'on', brightness, colorModes, rgbColor, whiteValue };
    }
    return null;
  }

  private _getTrv(device: HADevice): TrvInfo | null {
    const ent = device.entities.find(e => e.domain === 'climate');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;
    const attrs = s.attributes as Record<string, unknown>;
    let valvePosition: number | undefined = (attrs.current_valve_position ?? attrs.valve_position) as number | undefined;
    if (valvePosition == null) {
      const ve = device.entities.find(e => e.domain === 'sensor' && e.entity_id.includes('valve'));
      if (ve) { const v = parseFloat(this.hass.states[ve.entity_id]?.state ?? ''); if (!isNaN(v)) valvePosition = v; }
    }
    return {
      entityId: ent.entity_id,
      currentTemp: attrs.current_temperature as number | undefined,
      targetTemp: attrs.temperature as number | undefined,
      minTemp: (attrs.min_temp as number) ?? 4,
      maxTemp: (attrs.max_temp as number) ?? 30,
      step: (attrs.target_temp_step as number) ?? 0.5,
      hvacMode: s.state,
      hvacAction: (attrs.hvac_action as string) ?? s.state,
      presetMode: attrs.preset_mode as string | undefined,
      presetModes: ((attrs.preset_modes as string[]) ?? []).filter(p => p !== 'none'),
      valvePosition,
    };
  }

  private _getCover(device: HADevice): CoverInfo | null {
    const ent = device.entities.find(e => e.domain === 'cover');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;
    return { entityId: ent.entity_id, state: s.state, position: (s.attributes as HassAttrs)?.current_position as number | undefined };
  }

  private _getValve(device: HADevice): ValveInfo | null {
    const ent = device.entities.find(e => e.domain === 'valve');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;
    // feature bit 4 = SET_POSITION support
    const supportsPosition = !!(((s.attributes as HassAttrs)?.supported_features ?? 0) & 4);
    let position: number | undefined = (s.attributes as HassAttrs)?.current_position;
    if (position == null) {
      const pe = device.entities.find(e => e.domain === 'sensor' && e.entity_id.includes('position'));
      if (pe) { const v = parseFloat(this.hass.states[pe.entity_id]?.state ?? ''); if (!isNaN(v)) position = v; }
    }
    // prefer a number entity (0–100) over valve.set_valve_position — Shelly devices
    // report SET_POSITION support but the underlying RPC can fail; the number entity is more reliable
    const numEnt = device.entities.find(e => {
      if (e.domain !== 'number') return false;
      const ns = this.hass.states[e.entity_id];
      if (!ns) return false;
      const a = ns.attributes as HassAttrs;
      return (a.min === 0 && a.max === 100) || e.entity_id.includes('position');
    });
    let temperature: number | undefined;
    const te = device.entities.find(e => e.domain === 'sensor' && (this.hass.states[e.entity_id]?.attributes as HassAttrs)?.device_class === 'temperature');
    if (te) { const v = parseFloat(this.hass.states[te.entity_id]?.state ?? ''); if (!isNaN(v)) temperature = v; }
    return { entityId: ent.entity_id, state: s.state, position, supportsPosition, numEntityId: numEnt?.entity_id, temperature };
  }

  private async _setValvePosition(entityId: string, pos: number, numEntityId?: string) {
    const clamped = Math.round(Math.max(0, Math.min(100, pos)));
    // Prefer number entity — valve.set_valve_position can fail on Shelly devices
    // even when supported_features reports SET_POSITION support
    if (numEntityId) {
      await this.hass.callService('number', 'set_value', { entity_id: numEntityId, value: clamped });
    } else {
      await this.hass.callService('valve', 'set_valve_position', { entity_id: entityId, position: clamped });
    }
  }

  private _getAlerts(device: HADevice): DeviceAlert[] {
    const alerts: Array<'overtemp' | 'overpower'> = [];
    for (const e of device.entities) {
      if (e.domain !== 'binary_sensor') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state !== 'on') continue;
      const dc = (s.attributes as HassAttrs).device_class ?? '';
      if (dc === 'heat' || e.entity_id.includes('overtemp')) alerts.push('overtemp');
      else if (dc === 'safety' || e.entity_id.includes('overpower')) alerts.push('overpower');
    }
    return alerts;
  }

  private _getFirmware(device: HADevice): FirmwareInfo | null {
    for (const e of device.entities) {
      if (e.domain !== 'update') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state !== 'on') continue;
      const attrs = s.attributes as HassAttrs;
      return { entityId: e.entity_id, current: attrs.installed_version ?? '', newVersion: attrs.latest_version };
    }
    return null;
  }

  /** Extracts a short channel label from an entity_id, e.g. "Ch 1" / "Ch 2" / "A" / "B" / "C".
   *  Handles switch-prefixed names (switch_0_power), dc-suffixed names (power_0),
   *  and 3-phase EM phase letters (_a_act_power, _b_voltage, _c_current). */
  private _chLabel(entityId: string): string {
    // 3-phase EM phase letter: _a_act_power, _b_voltage, _c_current, etc.
    const ph = entityId.match(/[_-]([abc])[_-](?:act_power|aprt_power|ret_power|voltage|current|pf|freq)/i);
    if (ph) return ph[1].toUpperCase();
    const m = entityId.match(/[_-](?:switch|channel|ch|output)_?(\d+)[_-]/i)          // switch_0_power
           ?? entityId.match(/[_-](\d+)[_-](?:power|energy|voltage|current|apparent|reactive|factor|freq)/i)  // 0_power
           ?? entityId.match(/(?:power|energy|voltage|current|freq|apparent|reactive)[_-](\d+)$/i);            // energy_0
    return m ? `Ch ${+m[1] + 1}` : '';
  }

  private _timeAgo(isoString: string | null | undefined): string {
    if (!isoString) return 'Never';
    const ms = Date.now() - new Date(isoString).getTime();
    if (isNaN(ms) || ms < 0) return 'Never';
    if (ms < 60_000)     return 'Just now';
    if (ms < 3_600_000)  return `${Math.floor(ms / 60_000)}m ago`;
    if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
    return `${Math.floor(ms / 86_400_000)}d ago`;
  }

  /** Chip visibility cascade: device override → area override → global filter. */
  private _sensorSelection(device: HADevice): string[] | undefined {
    const devSel = this._config.device_styles?.[device.device_id]?.sensors;
    if (devSel?.length) return devSel;
    const areaSel = device.area ? this._config.area_styles?.[device.area]?.sensors : undefined;
    if (areaSel?.length) return areaSel;
    return this._config.sensors;
  }

  private _getSensors(device: HADevice): SensorChip[] {
    const sel = this._sensorSelection(device);
    const allowed = sel?.length ? new Set(sel) : null;
    const show = (k: string) => !allowed || allowed.has(k);
    const result: SensorChip[] = [];
    const seen = new Set<string>();
    // Rendering tier per sensor key; alert keys are decided at push time by state.
    const ELEC_TIER = new Set(['voltage', 'current', 'frequency', 'power_factor', 'apparent_power', 'reactive_power']);
    const DIAG_TIER = new Set(['ip', 'ssid', 'fw_version', 'mac', 'rssi', 'uptime', 'cloud', 'mqtt', 'eth']);
    const tierOf = (k: string): SensorChipTier =>
      ELEC_TIER.has(k) ? 'electrical' : DIAG_TIER.has(k) ? 'diag' : 'primary';

    // Pre-scan: find which electrical device_classes appear on more than one entity
    // so we can show per-channel labels for multi-channel devices (e.g. Shelly 2.5)
    const ELECTRICAL_DCS = new Set(['power','energy','current','voltage','apparent_power','reactive_power','power_factor','frequency']);
    const dcIds = new Map<string, string[]>();
    for (const e of device.entities) {
      const s = this.hass.states[e.entity_id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
      const dc = (s.attributes as HassAttrs)?.device_class as string ?? '';
      if (ELECTRICAL_DCS.has(dc)) {
        if (!dcIds.has(dc)) dcIds.set(dc, []);
        dcIds.get(dc)!.push(e.entity_id);
      }
    }
    const multiDcs = new Set([...dcIds.entries()].filter(([, ids]) => ids.length > 1).map(([dc]) => dc));

    const push = (k: string, label: string, value: string, warn = false, entityId?: string, tier?: SensorChipTier) => {
      // For multi-channel sensors, key by (device_class + channel label) so that two entities
      // mapping to the same channel slot (e.g. energy_0 and switch_0_energy) only show once,
      // while different channels (Ch 1, Ch 2) and unlabelled totals each get their own slot.
      const ch = (entityId && multiDcs.has(k)) ? this._chLabel(entityId) : '';
      const key = ch ? `${k}_${ch}` : k;
      if (!seen.has(key)) { seen.add(key); result.push({ label, value, warn, key: k, tier: tier ?? tierOf(k), ch }); }
    };

    for (const e of device.entities) {
      const s = this.hass.states[e.entity_id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
      const attrs = s.attributes as Record<string, unknown>;
      const dc = (attrs.device_class as string) ?? '';
      const id = e.entity_id;

      if (e.domain === 'sensor') {
        if (!dc && (id.endsWith('_ip') || id.endsWith('_ip_address')) && show('ip'))         { push('ip',         'IP',       s.state); continue; }
        if (!dc && id.endsWith('_ssid')                                 && show('ssid'))       { push('ssid',       'SSID',     s.state); continue; }
        if (!dc && (id.endsWith('_firmware') || id.endsWith('_fw'))     && show('fw_version')) { push('fw_version', 'FW',       s.state); continue; }
        if (!dc && id.endsWith('_mac')                                  && show('mac'))        { push('mac',        'MAC',      s.state); continue; }
        const v = parseFloat(s.state); if (isNaN(v)) continue;
        if      (dc === 'power'           && show('power'))          push('power',          'Power',  formatPower(v),         false, id);
        else if (dc === 'apparent_power'  && show('apparent_power')) push('apparent_power', 'App.P',  formatApparentPower(v), false, id);
        else if (dc === 'reactive_power'  && show('reactive_power')) push('reactive_power', 'Re.P',   formatReactivePower(v), false, id);
        else if (dc === 'power_factor'    && show('power_factor'))   push('power_factor',   'PF',     formatPercent(v),       false, id);
        else if (dc === 'frequency'       && show('frequency'))      push('frequency',      'Freq',   formatFrequency(v),     false, id);
        else if (dc === 'energy'          && show('energy'))         push('energy',         'Energy', formatEnergy(v),        false, id);
        else if (dc === 'voltage'         && show('voltage'))        push('voltage',        'Volt',   formatVoltage(v),       false, id);
        else if (dc === 'current'         && show('current'))        push('current',        'Curr',   formatCurrent(v),       false, id);
        else if (dc === 'temperature'     && show('temperature'))    push('temperature',    'Temp',   formatTemp(v));
        else if (dc === 'humidity'        && show('humidity'))       push('humidity',       'Hum',    formatHumidity(v));
        else if (dc === 'illuminance'     && show('illuminance'))    push('illuminance',    'Light',  formatIlluminance(v));
        else if (dc === 'carbon_dioxide'  && show('co2'))            push('co2',            'CO₂',    formatPpm(v));
        else if (dc === 'gas'             && show('gas'))            push('gas',            'Gas',    `${v.toFixed(1)} %`);
        else if (dc === 'battery'         && show('battery'))        push('battery',        'Batt',   formatPercent(v));
        else if ((dc === 'signal_strength' || id.includes('rssi'))   && show('rssi'))
          push('rssi', 'Wi-Fi', `${v} dBm`);
        else if (id.includes('uptime')    && show('uptime'))         push('uptime',         'Up',     formatUptime(v));
      } else if (e.domain === 'binary_sensor') {
        // Alerts surface as primary chips while triggered, sink to the diag footer when clear.
        const on = s.state === 'on';
        const alertTier = (w: boolean): SensorChipTier => (w ? 'primary' : 'diag');
        if      (dc === 'motion'   && show('motion'))    push('motion',    'Motion',    on ? 'Motion'    : 'Clear',  on, undefined, alertTier(on));
        else if ((dc === 'door' || dc === 'window' || dc === 'opening') && show('door'))
          push('door', 'Door', on ? 'Open' : 'Closed', false, undefined, alertTier(on));
        else if (dc === 'moisture' && show('flood'))     push('flood',     'Flood',     on ? 'Flooded'   : 'Dry',    on, undefined, alertTier(on));
        else if (dc === 'smoke'    && show('smoke'))     push('smoke',     'Smoke',     on ? 'Smoke!'    : 'Clear',  on, undefined, alertTier(on));
        else if (dc === 'gas'      && show('gas'))       push('gas',       'Gas',       on ? 'Gas!'      : 'Clear',  on, undefined, alertTier(on));
        else if (dc === 'vibration' && show('vibration')) push('vibration', 'Vibr',     on ? 'Vibrating' : 'Clear',  on, undefined, alertTier(on));
        else if ((dc === 'heat' || id.includes('overtemp')) && show('overtemp'))
          push('overtemp', 'Overtemp', on ? 'Overtemp!' : 'OK', on, undefined, alertTier(on));
        else if ((dc === 'safety' || id.includes('overpower')) && show('overpower'))
          push('overpower', 'Overpower', on ? 'Overpower!' : 'OK', on, undefined, alertTier(on));
        else if (dc === 'connectivity' && id.includes('cloud') && show('cloud'))
          push('cloud', 'Cloud', on ? 'Connected' : 'Offline', !on, undefined, alertTier(!on));
        else if (dc === 'connectivity' && id.includes('mqtt') && show('mqtt'))
          push('mqtt', 'MQTT', on ? 'Connected' : 'Offline', !on, undefined, alertTier(!on));
        else if (dc === 'connectivity' && id.includes('eth') && show('eth'))
          push('eth', 'Ethernet', on ? 'Connected' : 'Offline', !on, undefined, alertTier(!on));
      }
    }
    return result;
  }

  private _getInputChannels(device: HADevice): InputChannel[] {
    const bsInputs = device.entities.filter(e =>
      e.domain === 'binary_sensor' && (
        e.entity_id.includes('input') || e.entity_id.includes('button') ||
        e.entity_id.includes('channel') ||
        (e.attributes as HassAttrs)?.device_class == null
      )
    );
    const eventInputs = device.entities.filter(e =>
      e.domain === 'event' && (
        (e.attributes as HassAttrs)?.device_class === 'button' ||
        e.entity_id.includes('channel') || e.entity_id.includes('input')
      )
    );

    if (bsInputs.length > 0) {
      return bsInputs.map(e => {
        const s = this.hass.states[e.entity_id];
        const friendly = (s?.attributes as HassAttrs)?.friendly_name ?? '';
        const m = e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i) ?? friendly.match(/(\d+)\s*$/);
        const ch = m ? parseInt(m[1]) : 0;
        const base = e.entity_id.replace(/^binary_sensor\./, '');
        const evEnt = device.entities.find(ev =>
          ev.domain === 'event' && ev.entity_id.replace(/^event\./, '') === base
        );
        const evState = evEnt ? this.hass.states[evEnt.entity_id] : null;
        const lastEvent: string | null =
          (evState?.attributes as HassAttrs)?.event_type ??
          (evState?.state && evState.state !== 'unknown' && evState.state !== 'unavailable' ? evState.state : null);
        return {
          entityId: e.entity_id,
          label: m ? `Input ${+m[1] + 1}` : friendly || e.entity_id,
          isOn: s?.state === 'on',
          isButton: !!evEnt,
          channel: ch,
          lastEvent,
          lastChanged: s?.last_changed ?? null,
        };
      }).sort((a, b) => a.channel - b.channel);
    }

    // Event-only input device (e.g. Shelly i3 Gen1)
    return eventInputs.map(e => {
      const s = this.hass.states[e.entity_id];
      const friendly = (s?.attributes as HassAttrs)?.friendly_name ?? '';
      const m = e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i) ?? friendly.match(/(\d+)\s*$/);
      const ch = m ? parseInt(m[1]) : 0;
      const lastEvent: string | null =
        (s?.attributes as HassAttrs)?.event_type ??
        (s?.state && s.state !== 'unknown' && s.state !== 'unavailable' ? s.state : null);
      // For event entities, the state IS the last-triggered timestamp
      const lastChanged: string | null =
        s?.last_changed ??
        (s?.state && s.state !== 'unknown' && s.state !== 'unavailable' ? s.state : null);
      return {
        entityId: e.entity_id,
        label: m ? `Input ${+m[1] + 1}` : friendly || e.entity_id,
        isOn: false,
        isButton: true,
        channel: ch,
        lastEvent,
        lastChanged,
      };
    }).sort((a, b) => a.channel - b.channel);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  private async _toggle(entityId: string, isOn: boolean, e: Event) {
    e.stopPropagation();
    const domain = entityId.split('.')[0];
    await this.hass.callService(domain, isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
  }

  private async _setBrightness(entityId: string, pct: number) {
    await this.hass.callService('light', 'turn_on', { entity_id: entityId, brightness_pct: Math.max(1, Math.min(100, pct)) });
  }

  private _rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  private _hexToRgb(hex: string): [number, number, number] {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }

  private async _setColor(entityId: string, hex: string, whiteValue?: number, isRgbw = false) {
    const rgb = this._hexToRgb(hex);
    if (isRgbw && whiteValue !== undefined) {
      await this.hass.callService('light', 'turn_on', { entity_id: entityId, rgbw_color: [...rgb, whiteValue] });
    } else {
      await this.hass.callService('light', 'turn_on', { entity_id: entityId, rgb_color: rgb });
    }
  }

  private async _coverAction(entityId: string, action: 'open' | 'close' | 'stop', e: Event) {
    e.stopPropagation();
    const svc = { open: 'open_cover', close: 'close_cover', stop: 'stop_cover' } as const;
    await this.hass.callService('cover', svc[action], { entity_id: entityId });
  }

  private async _setCoverPosition(entityId: string, pos: number) {
    await this.hass.callService('cover', 'set_cover_position', { entity_id: entityId, position: Math.round(Math.max(0, Math.min(100, pos))) });
  }

  private async _valveAction(entityId: string, action: 'open' | 'close' | 'stop', e: Event) {
    e.stopPropagation();
    const svc = { open: 'open_valve', close: 'close_valve', stop: 'stop_valve' } as const;
    await this.hass.callService('valve', svc[action], { entity_id: entityId });
  }

  private async _setTemp(entityId: string, temp: number) {
    await this.hass.callService('climate', 'set_temperature', { entity_id: entityId, temperature: Math.round(temp * 2) / 2 });
  }

  private async _setHvacMode(entityId: string, mode: string, e: Event) {
    e.stopPropagation();
    await this.hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: mode });
  }

  private _setPresetMode(entityId: string, preset: string) {
    this.hass.callService('climate', 'set_preset_mode', { entity_id: entityId, preset_mode: preset });
  }

  private async _installUpdate(entityId: string, e: Event) {
    e.stopPropagation();
    await this.hass.callService('update', 'install', { entity_id: entityId });
  }

  private async _selectOption(entityId: string, option: string) {
    await this.hass.callService('select', 'select_option', { entity_id: entityId, option });
  }

  private async _setNumberValue(entityId: string, value: number) {
    await this.hass.callService('number', 'set_value', { entity_id: entityId, value: String(value) });
  }

  private async _pressButton(entityId: string, e: Event) {
    e.stopPropagation();
    await this.hass.callService('button', 'press', { entity_id: entityId });
  }


  // ── Sparkline system ──────────────────────────────────────────────────────

  private _getGraphEntities(device: HADevice): GraphEntity[] {
    const dcList = this._config.graph_sensors ?? [];
    if (!dcList.length) return [];
    const results: Array<{ entityId: string; label: string; dc: string; unit: string }> = [];
    for (const dc of dcList) {
      const ents = device.entities.filter(e => {
        if (e.domain !== 'sensor') return false;
        const st = this.hass.states[e.entity_id];
        if (!st || st.state === 'unavailable' || st.state === 'unknown') return false;
        const attrDc = (st.attributes as HassAttrs)?.device_class ?? (e.attributes as HassAttrs)?.device_class;
        return attrDc === dc || (dc === 'signal_strength' && e.entity_id.includes('rssi'));
      });
      const seenLabels = new Set<string>();
      for (const ent of ents) {
        const unit = (this.hass.states[ent.entity_id]?.attributes as HassAttrs)?.unit_of_measurement ?? '';
        // Use compact channel number (e.g. " 1"/" 2") in graph labels to keep them short
        const chNum = ents.length > 1 ? this._chLabel(ent.entity_id).replace('Ch ', '') : '';
        const label = (GRAPH_DC_LABELS[dc] ?? dc) + (chNum ? ` ${chNum}` : '');
        if (seenLabels.has(label)) continue; // skip duplicate channel slots
        seenLabels.add(label);
        results.push({ entityId: ent.entity_id, label, dc, unit });
      }
    }
    return results;
  }

  private _fetchQueue: string[] = [];
  private _fetchQueueRunning = false;

  /** Compound key for graph data cache: entityId::hours */
  private _gk(entityId: string, hours: number): string { return `${entityId}::${hours}`; }

  private _requestGraphData(entityId: string, hours?: number) {
    const h = hours ?? this._config.graph_hours ?? 24;
    const key = this._gk(entityId, h);
    if (this._graphFetching.has(key)) return;
    const age = Date.now() - (this._graphFetchedAt.get(key) ?? 0);
    // Long ranges change slowly — no point refetching a 7d/30d series every 5 minutes.
    const ttl = h >= 168 ? 30 * 60_000 : 5 * 60_000;
    if (age < ttl && this._graphData.has(key)) return;
    if (!this._fetchQueue.includes(key)) {
      this._fetchQueue.push(key);
    }
    this._drainFetchQueue();
  }

  private _drainFetchQueue() {
    if (this._fetchQueueRunning || this._fetchQueue.length === 0) return;
    this._fetchQueueRunning = true;
    const next = this._fetchQueue.shift()!;
    Promise.resolve().then(async () => {
      await this._fetchGraphData(next);
      this._fetchQueueRunning = false;
      this._drainFetchQueue();
    });
  }

  private _retryGraphData(entityId: string, hours?: number) {
    const h = hours ?? this._config.graph_hours ?? 24;
    const key = this._gk(entityId, h);
    if (this._graphFetching.has(key)) return;
    this._graphFetchedAt.delete(key);
    const next = new Map(this._graphData); next.delete(key);
    this._graphData = next;
    this._fetchQueue = this._fetchQueue.filter(id => id !== key);
    this._requestGraphData(entityId, h);
  }

  private _refreshAllGraphs(device: HADevice) {
    const h = this._config.graph_hours ?? 24;
    const keys = this._getGraphEntities(device).map(e => this._gk(e.entityId, h)).filter(k => !this._graphFetching.has(k));
    keys.forEach(k => this._graphFetchedAt.delete(k));
    const next = new Map(this._graphData); keys.forEach(k => next.delete(k));
    this._graphData = next;
    keys.forEach(k => this._fetchGraphData(k));
  }

  /** Long-range series from the recorder statistics API — 288 five-minute rows
   *  for 24h (or hourly rows beyond 48h) instead of tens of thousands of raw
   *  state changes. Returns null when the entity has no statistics (no
   *  state_class) so the caller can fall back to raw history. */
  private async _fetchStatistics(entityId: string, hours: number): Promise<Array<{ t: number; v: number }> | null> {
    try {
      const period = hours > 48 ? 'hour' : '5minute';
      const rows = await (this.hass as any).callWS({
        type: 'recorder/statistics_during_period',
        start_time: new Date(Date.now() - hours * 3600_000).toISOString(),
        statistic_ids: [entityId],
        period,
        types: ['mean', 'state', 'min', 'max'],
      }) as Record<string, Array<{ start: number | string; mean?: number | null; state?: number | null; max?: number | null }>>;
      const series = rows?.[entityId];
      if (!series?.length) return null;
      const points = series
        .map(r => ({
          t: typeof r.start === 'number' ? r.start : new Date(r.start).getTime(),
          v: (r.mean ?? r.state ?? r.max) as number,
        }))
        .filter(p => p.v != null && !isNaN(p.v));
      return points.length >= 2 ? points : null;
    } catch {
      return null;
    }
  }

  /** Raw state-change history via REST — only for short ranges or as a
   *  fallback when an entity has no recorder statistics. */
  private async _fetchRawHistory(entityId: string, hours: number): Promise<Array<{ t: number; v: number }>> {
    const start = new Date(Date.now() - hours * 3600_000);
    const path = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&minimal_response=true&no_attributes=true`;
    const raw = await (this.hass as any).callApi('GET', path) as Array<Array<{ state: string; last_changed: string }>>;
    const series = raw?.[0] ?? [];
    const points = series.map(p => ({ t: new Date(p.last_changed).getTime(), v: parseFloat(p.state) })).filter(p => !isNaN(p.v));
    if (points.length === 1) {
      const live = parseFloat(this.hass.states[entityId]?.state ?? '');
      points.push({ t: Date.now(), v: isNaN(live) ? points[0].v : live });
    }
    return points;
  }

  /** Fetch history data. Key is compound "entityId::hours". */
  private async _fetchGraphData(key: string) {
    this._graphFetching.add(key);
    const [entityId, hoursStr] = key.split('::');
    const hours = parseInt(hoursStr, 10) || 24;
    try {
      // Statistics first for 24h+ ranges (tiny payload); raw history otherwise.
      let points = hours >= 24 ? await this._fetchStatistics(entityId, hours) : null;
      if (!points) points = await this._fetchRawHistory(entityId, hours);
      points = downsamplePoints(points);
      const next = new Map(this._graphData); next.set(key, points);
      this._graphData = next;
    } catch (err) {
      console.warn('[ha-device-dashboard] history fetch failed', entityId, err);
      const next = new Map(this._graphData); next.set(key, []);
      this._graphData = next;
    } finally {
      this._graphFetchedAt.set(key, Date.now());
      this._graphFetching.delete(key);
    }
  }

  private _renderSparklines(device: HADevice, expanded = false, hours?: number): TemplateResult {
    return this._renderSparklinesFiltered(device, this._getGraphEntities(device), expanded, hours);
  }

  private _renderSparklinesFiltered(
    device: HADevice,
    entities: Array<{ entityId: string; label: string; unit: string; dc: string }>,
    expanded = false,
    hours?: number,
  ): TemplateResult {
    if (!entities.length) return html``;

    const gs = this._config.graph_style ?? {};
    const W = 200;
    const H = expanded ? 120 : (gs.height ?? 32);
    const customH = expanded || gs.height != null;  // only override CSS height when explicitly set
    const lw = gs.line_width ?? 1.5;
    const showDots = gs.show_dots !== false;
    const showTicks = gs.tick_lines !== false;
    const showTimeLabels = gs.time_labels !== false;
    const graphType = gs.type ?? 'line';
    // 'area' type always fills; 'line' type never fills; 'bar' type is separate
    const fill = graphType === 'area';
    const graphHours = hours ?? this._config.graph_hours ?? 24;
    const tickMs = graphHours <= 1 ? 60_000 : graphHours <= 5 ? 120_000 : 300_000;
    const sensorColors = this._config.graph_sensor_colors ?? {};
    const globalColor = this._config.graph_line_color;
    const pad = 4;

    const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const rows = entities.map(({ entityId, label, unit, dc }) => {
      const lineColor = sensorColors[dc] ?? globalColor ?? GRAPH_SENSOR_DEFS.find(s => s.key === dc)?.defaultColor ?? '#f4601e';
      const gk = this._gk(entityId, graphHours);
      const points = this._graphData.get(gk);
      this._requestGraphData(entityId, graphHours);  // no-op if already fetched/fetching

      if (!points) {
        return html`
          <div class="spark-row">
            <span class="spark-lbl">${label}</span>
            <div class="sparkline-loading" style="height:${customH ? H : 32}px"></div>
            <span class="spark-val">—</span>
          </div>`;
      }
      if (points.length < 2) {
        return html`
          <div class="spark-row">
            <span class="spark-lbl">${label}</span>
            <span class="spark-no-data">no history</span>
            <button class="spark-retry" @click=${(e: Event) => { e.stopPropagation(); this._retryGraphData(entityId, graphHours); }}>↺</button>
          </div>`;
      }

      const vals = points.map(p => p.v);
      const srng = (this._config.graph_style?.sensor_ranges ?? {})[dc] ?? {};
      const min = srng.min ?? Math.min(...vals);
      const max = srng.max ?? Math.max(...vals);
      const range = max - min || 1;
      const tMin = points[0].t, tMax = points[points.length - 1].t;
      const tRange = (tMax - tMin) || 1;

      const ptX = (p: { t: number }) => ((p.t - tMin) / tRange) * W;
      const ptY = (p: { t: number; v: number }) => H - pad - ((p.v - min) / range) * (H - pad * 2);

      const coords = points.map(p => `${ptX(p).toFixed(1)},${ptY(p).toFixed(1)}`).join(' ');
      const firstX = ptX(points[0]).toFixed(1);
      const gId = `sg-${entityId.replace(/[^a-z0-9]/gi, '')}`;
      const lastVal = vals[vals.length - 1];
      const disp = lastVal % 1 === 0 ? `${lastVal}` : lastVal.toFixed(1);

      const maxIdx = vals.indexOf(max), minIdx = vals.indexOf(min);
      const maxCx = ptX(points[maxIdx]).toFixed(1), maxCy = ptY(points[maxIdx]).toFixed(1);
      const minCx = ptX(points[minIdx]).toFixed(1), minCy = ptY(points[minIdx]).toFixed(1);
      const tStart = fmtTime(points[0].t);
      const tMid = fmtTime((points[0].t + tMax) / 2);
      const dashUnit = (tickMs / tRange) * W;
      const dashOn = Math.max(0.3, dashUnit * 0.7).toFixed(2);
      const dashOff = Math.max(0.3, dashUnit * 0.3).toFixed(2);
      const timeDash = `${dashOn} ${dashOff}`;
      const showPeakDots = showDots && (max - min) > 0;

      const handleMove = (e: MouseEvent) => {
        const svg = e.currentTarget as SVGElement;
        const rect = svg.getBoundingClientRect();
        const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const tAt = tMin + xPct * tRange;
        let nearest = points[0];
        for (const p of points) { if (Math.abs(p.t - tAt) < Math.abs(nearest.t - tAt)) nearest = p; }
        const cx = ptX(nearest), cy = ptY(nearest);
        const ch = svg.querySelector('.spark-crosshair') as SVGLineElement | null;
        if (ch) { ch.setAttribute('x1', String(cx)); ch.setAttribute('x2', String(cx)); ch.style.display = ''; }
        const hd = svg.querySelector('.spark-hover-dot') as SVGCircleElement | null;
        if (hd) { hd.setAttribute('cx', String(cx)); hd.setAttribute('cy', String(cy)); hd.style.display = ''; }
        const wrap = svg.parentElement;
        const tip = wrap?.querySelector('.spark-tooltip') as HTMLElement | null;
        if (tip) {
          const tv = tip.querySelector('.spark-tooltip-val') as HTMLElement | null;
          const tt = tip.querySelector('.spark-tooltip-time') as HTMLElement | null;
          if (tv) tv.textContent = `${nearest.v % 1 === 0 ? String(nearest.v) : nearest.v.toFixed(1)} ${unit}`;
          if (tt) tt.textContent = fmtTime(nearest.t);
          tip.style.left = `${((cx / W) * 100).toFixed(1)}%`;
          tip.style.display = '';
        }
      };

      const handleLeave = (e: MouseEvent) => {
        const svg = e.currentTarget as SVGElement;
        (svg.querySelector('.spark-crosshair') as SVGLineElement | null)?.style && ((svg.querySelector('.spark-crosshair') as SVGLineElement).style.display = 'none');
        (svg.querySelector('.spark-hover-dot') as SVGCircleElement | null)?.style && ((svg.querySelector('.spark-hover-dot') as SVGCircleElement).style.display = 'none');
        const tip = svg.parentElement?.querySelector('.spark-tooltip') as HTMLElement | null;
        if (tip) tip.style.display = 'none';
      };

      const openDialog = (e: Event) => { e.stopPropagation(); this._detailDevice = device.device_id; };
      return html`
        <div class="spark-group">
          <div class="spark-row ${expanded ? '' : 'spark-row-clickable'}" @click=${expanded ? nothing : openDialog}>
            <span class="spark-lbl">${label}</span>
            <div class="spark-svg-wrap">
              <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
                class="sparkline-svg"
                style="height:${customH ? H : 32}px"
                @mousemove=${handleMove} @mouseleave=${handleLeave}>
                <defs>
                  <linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                ${showTicks ? svg`
                  <line x1="0"        x2="0"        y1="0" y2="${H}" class="spark-tick"/>
                  <line x1="${W / 2}" x2="${W / 2}" y1="0" y2="${H}" class="spark-tick"/>
                  <line x1="${W}"     x2="${W}"     y1="0" y2="${H}" class="spark-tick"/>
                ` : nothing}
                ${graphType !== 'bar' && fill ? svg`
                  <polygon points="${coords} ${W},${H - pad} ${firstX},${H - pad}" fill="url(#${gId})"/>
                ` : nothing}
                ${graphType === 'bar'
                  ? points.map(p => {
                      const bw = Math.max(2, (W / points.length) - 2);
                      const bx = ptX(p) - bw / 2;
                      const by = ptY(p);
                      const bh = H - pad - by;
                      return svg`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, bh).toFixed(1)}" rx="1.5" fill="${lineColor}" opacity="0.75"/>`;
                    })
                  : svg`
                    <polyline points="${coords}" fill="none"
                      stroke="${lineColor}" stroke-width="${lw}"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  `}
                <line x1="0" y1="${H}" x2="${W}" y2="${H}"
                  stroke="rgba(255,255,255,0.5)" stroke-width="0.8"
                  stroke-dasharray="${timeDash}" pointer-events="none"
                  vector-effect="non-scaling-stroke"/>
                ${showPeakDots ? svg`
                  <circle cx="${maxCx}" cy="${maxCy}" r="3"
                    fill="${lineColor}" stroke="#1e1e2e" stroke-width="1.2"/>
                  <circle cx="${minCx}" cy="${minCy}" r="2.5"
                    fill="#6b7280" stroke="#1e1e2e" stroke-width="1.2"/>
                ` : nothing}
                <line class="spark-crosshair" x1="0" x2="0" y1="0" y2="${H}" style="display:none"/>
                <circle class="spark-hover-dot" cx="0" cy="0" r="3.5" style="display:none"/>
              </svg>
              <div class="spark-tooltip" style="display:none">
                <span class="spark-tooltip-val"></span>
                <span class="spark-tooltip-time"></span>
              </div>
            </div>
            <span class="spark-val">${disp} ${unit}</span>
          </div>
          ${showTimeLabels ? html`
            <div class="spark-time-row">
              <div class="spark-time-spacer"></div>
              <div class="spark-time-labels">
                <span>${tStart}</span><span>${tMid}</span><span>now</span>
              </div>
              <div class="spark-time-end"></div>
            </div>
          ` : nothing}
        </div>`;
    });

    return html`
      <div class="sparklines-block ${expanded ? 'exp' : ''}">
        ${rows}
      </div>`;
  }

  private _closeDetailSheet(): void { this._detailDevice = null; }

  // ── Tile block renderer ───────────────────────────────────────────────────

  /**
   * Resolves the ordered block list for a device.
   * Priority: device_styles > config.tile_layout > profile default
   */
  private _getBlockOrder(device: HADevice, profile: DeviceProfileResult): TileBlockId[] {
    const deviceOverride = this._config.device_styles?.[device.device_id]?.tile_layout;
    if (deviceOverride) return deviceOverride;
    if (this._config.tile_layout) return this._config.tile_layout;
    return PROFILE_DEFAULT_BLOCKS[profile.type] ?? PROFILE_DEFAULT_BLOCKS.generic;
  }

  private _trvColor(ratio: number): string {
    // blue (#4a90d9) → orange (#e67e22) → red (#e53935)
    const clamp = Math.max(0, Math.min(1, ratio));
    let r: number, g: number, b: number;
    if (clamp < 0.5) {
      const t = clamp * 2;
      r = Math.round(74  + t * (230 - 74));
      g = Math.round(144 + t * (126 - 144));
      b = Math.round(217 + t * (34  - 217));
    } else {
      const t = (clamp - 0.5) * 2;
      r = Math.round(230 + t * (229 - 230));
      g = Math.round(126 + t * (57  - 126));
      b = Math.round(34  + t * (53  - 34));
    }
    return `rgb(${r},${g},${b})`;
  }

  private _renderTrvDial(trv: TrvInfo) {
    const { minTemp, maxTemp, targetTemp, currentTemp, step, entityId } = trv;
    const cx = 80, cy = 70, r = 54;
    const display = this._trvDragTemp ?? targetTemp ?? minTemp;
    const displayRatio = Math.max(0, Math.min(1, (display - minTemp) / (maxTemp - minTemp)));
    const toAngle = (v: number) => 210 + ((v - minTemp) / (maxTemp - minTemp)) * 300;
    const toXY = (deg: number, radius: number): [number, number] => [
      cx + radius * Math.cos((deg - 90) * Math.PI / 180),
      cy + radius * Math.sin((deg - 90) * Math.PI / 180),
    ];
    const arcPath = (startDeg: number, endDeg: number, radius: number) => {
      const [x1, y1] = toXY(startDeg, radius);
      const [x2, y2] = toXY(endDeg, radius);
      const large = (endDeg - startDeg) > 180 ? 1 : 0;
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
    };
    const fillColor = this._trvColor(displayRatio);
    const targetAngle = toAngle(display);
    const [tx, ty] = toXY(targetAngle, r);
    const curRatio = currentTemp != null ? (currentTemp - minTemp) / (maxTemp - minTemp) : null;
    const curXY = currentTemp != null ? toXY(toAngle(currentTemp), r) : null;
    const curColor = curRatio != null ? this._trvColor(curRatio) : fillColor;
    const gid = `trv-grad-${entityId.replace(/\W/g, '_')}`;

    const onPointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      const svgEl = e.currentTarget as SVGSVGElement;
      svgEl.setPointerCapture(e.pointerId);
      const onMove = (ev: PointerEvent) => {
        const t = this._trvTempFromEvent(ev, svgEl, minTemp, maxTemp, step);
        if (t != null) this._trvDragTemp = t;
      };
      const onUp = (ev: PointerEvent) => {
        const t = this._trvTempFromEvent(ev, svgEl, minTemp, maxTemp, step) ?? this._trvDragTemp;
        this._trvDragTemp = null;
        if (t != null) this._setTemp(entityId, t);
        svgEl.removeEventListener('pointermove', onMove);
        svgEl.removeEventListener('pointerup', onUp);
      };
      svgEl.addEventListener('pointermove', onMove);
      svgEl.addEventListener('pointerup', onUp);
    };

    return svg`
      <svg viewBox="0 0 160 132" class="trv-dial-svg valve-interactive" @pointerdown=${onPointerDown}>
        <defs>
          <linearGradient id="${gid}" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${this._trvColor(0)}"/>
            <stop offset="50%"  stop-color="${this._trvColor(0.5)}"/>
            <stop offset="100%" stop-color="${this._trvColor(1)}"/>
          </linearGradient>
        </defs>
        <path d="${arcPath(210, 510, r)}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/>
        <path d="${arcPath(210, 510, r)}" fill="none" stroke="url(#${gid})" stroke-width="8" stroke-linecap="round" opacity="0.25"/>
        ${targetAngle > 210 ? svg`<path d="${arcPath(210, targetAngle, r)}" fill="none" stroke="url(#${gid})" stroke-width="8" stroke-linecap="round"/>` : nothing}
        ${curXY ? svg`<circle cx="${curXY[0]}" cy="${curXY[1]}" r="5" fill="white" stroke="${curColor}" stroke-width="2"/>` : nothing}
        <circle cx="${tx}" cy="${ty}" r="9" fill="${fillColor}" stroke="white" stroke-width="2" style="cursor:grab"/>
        <text x="${cx}" y="${cy - 10}" text-anchor="middle" class="dial-target-text">${display.toFixed(1)}°</text>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" class="dial-sub-text">target</text>
        <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="dial-current-text">${currentTemp != null ? `now ${currentTemp}°` : ''}</text>
        <text x="18" y="128" text-anchor="middle" class="dial-range-text">${minTemp}°</text>
        <text x="142" y="128" text-anchor="middle" class="dial-range-text">${maxTemp}°</text>
      </svg>
    `;
  }

  private _trvTempFromEvent(e: PointerEvent, svgEl: SVGSVGElement, min: number, max: number, step: number): number | null {
    const rect = svgEl.getBoundingClientRect();
    const cx = 80, cy = 70;
    const x = (e.clientX - rect.left) * (160 / rect.width);
    const y = (e.clientY - rect.top)  * (132 / rect.height);
    let deg = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    const arcDeg = (deg - 210 + 360) % 360;
    if (arcDeg > 300) return null; // in the gap at the bottom
    const raw = min + (arcDeg / 300) * (max - min);
    return Math.max(min, Math.min(max, Math.round(raw / step) * step));
  }

  private _valvePosFromEvent(e: PointerEvent, svg: SVGSVGElement): number | null {
    const rect = svg.getBoundingClientRect();
    const cx = 80, cy = 68;
    const x = (e.clientX - rect.left) * (160 / rect.width);
    const y = (e.clientY - rect.top)  * (128 / rect.height);
    let deg = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    const arcDeg = (deg - 210 + 360) % 360;
    if (arcDeg > 300) return null; // in the gap
    return Math.round((arcDeg / 300) * 100);
  }

  private _renderValveDial(vc: ValveInfo) {
    const pos = vc.position ?? (vc.state === 'open' ? 100 : 0);
    const cx = 80, cy = 68, r = 54;
    const toAngle = (v: number) => 210 + (v / 100) * 300;
    const toXY = (deg: number, radius: number): [number, number] => [
      cx + radius * Math.cos((deg - 90) * Math.PI / 180),
      cy + radius * Math.sin((deg - 90) * Math.PI / 180),
    ];
    const arcPath = (startDeg: number, endDeg: number, radius: number) => {
      const [x1, y1] = toXY(startDeg, radius);
      const [x2, y2] = toXY(endDeg, radius);
      const large = (endDeg - startDeg) > 180 ? 1 : 0;
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
    };
    const canSetPos = vc.supportsPosition || !!vc.numEntityId;
    const displayPos = this._valveDragPos ?? pos;
    const posAngle = toAngle(displayPos);
    const [hx, hy] = toXY(posAngle, r);
    const handleColor = `hsl(${200 + displayPos * 0.2}, ${40 + displayPos * 0.55}%, ${38 + displayPos * 0.18}%)`;
    const stateLabel = this._valveDragPos != null ? `${Math.round(this._valveDragPos)}%`
      : vc.state === 'opening' ? 'Opening…' : vc.state === 'closing' ? 'Closing…'
      : pos === 100 ? 'Open' : pos === 0 ? 'Closed' : 'Partial';

    const onPointerDown = !canSetPos ? undefined : (e: PointerEvent) => {
      e.stopPropagation();
      const svgEl = (e.currentTarget as SVGSVGElement);
      svgEl.setPointerCapture(e.pointerId);
      const onMove = (ev: PointerEvent) => {
        const pct = this._valvePosFromEvent(ev, svgEl);
        if (pct != null) this._valveDragPos = pct; // visual preview only
      };
      const onUp = (ev: PointerEvent) => {
        const pct = this._valvePosFromEvent(ev, svgEl) ?? this._valveDragPos;
        this._valveDragPos = null;
        if (pct != null) this._setValvePosition(vc.entityId, pct, vc.numEntityId);
        svgEl.removeEventListener('pointermove', onMove);
        svgEl.removeEventListener('pointerup', onUp);
      };
      svgEl.addEventListener('pointermove', onMove);
      svgEl.addEventListener('pointerup', onUp);
    };

    return svg`
      <svg viewBox="0 0 160 128" class="trv-dial-svg ${canSetPos ? 'valve-interactive' : ''}"
        @pointerdown=${onPointerDown}>
        <defs>
          <linearGradient id="valve-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#6b7280"/>
            <stop offset="100%" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        ${canSetPos ? svg`<path d="${arcPath(210, 510, r)}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/>` : nothing}
        <path d="${arcPath(210, 510, r)}" fill="none" stroke="url(#valve-grad)" stroke-width="8" stroke-linecap="round" opacity="0.25"/>
        ${pos > 0 ? svg`<path d="${arcPath(210, posAngle, r)}" fill="none" stroke="url(#valve-grad)" stroke-width="8" stroke-linecap="round"/>` : nothing}
        <circle cx="${hx}" cy="${hy}" r="9" fill="${handleColor}" stroke="white" stroke-width="2" style="${canSetPos ? 'cursor:grab' : ''}"/>
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" class="dial-target-text">${Math.round(displayPos)}%</text>
        <text x="${cx}" y="${cy + 7}" text-anchor="middle" class="dial-sub-text">${stateLabel}</text>
        <text x="16" y="124" text-anchor="middle" class="dial-range-text">Closed</text>
        <text x="144" y="124" text-anchor="middle" class="dial-range-text">Open</text>
      </svg>
    `;
  }

  private _getVirtualControls(device: HADevice): VirtualControl[] {
    return device.entities
      .filter(e => {
        if (e.domain === 'select' && /_enum_\d+$/i.test(e.entity_id))    return true;
        if (e.domain === 'number' && /_number_\d+$/i.test(e.entity_id))  return true;
        if (e.domain === 'button' && /_button_\d+$/i.test(e.entity_id))  return true;
        if (e.domain === 'text'   && /_text_\d+$/i.test(e.entity_id))    return true;
        if (e.domain === 'switch' && /_boolean_\d+$/i.test(e.entity_id)) return true;
        return false;
      })
      .map(e => {
        const s = this.hass.states[e.entity_id];
        const attrs = (s?.attributes ?? {}) as Record<string, unknown>;
        return {
          entityId: e.entity_id,
          domain: e.domain as 'select' | 'number' | 'button' | 'text' | 'switch',
          label: (attrs.friendly_name as string) ?? e.entity_id.split('.').pop()!.replace(/_/g, ' '),
          value: s?.state ?? 'unavailable',
          options: attrs.options as string[] | undefined,
          min: attrs.min as number | undefined,
          max: attrs.max as number | undefined,
          step: attrs.step as number | undefined,
          isOn: s?.state === 'on',
        };
      });
  }

  private _renderTileIcon(profile: DeviceProfileResult, isOn: boolean, extra: {
    coverPos?: number; coverState?: string;
    isHeating?: boolean; valveOpen?: boolean;
    hasFan?: boolean;
  } = {}): TemplateResult {
    const { coverPos, coverState, isHeating, valveOpen, hasFan } = extra;
    const t = profile.type;

    // relay / plug — lightning bolt, pulse glow when on
    if (t === 'relay' || t === 'plug') {
      // Special case: if device has a fan entity, show spinning fan
      if (hasFan) {
        return svg`<svg class="tile-icon tile-icon-fan ${isOn ? 'on' : ''}" viewBox="0 0 20 20">
          <g class="fan-blades">
            <path d="M10 10 C10 6,13 4,13 8 A3 3 0 0 1 10 10Z" fill="currentColor" opacity=".9"/>
            <path d="M10 10 C14 10,16 13,12 13 A3 3 0 0 1 10 10Z" fill="currentColor" opacity=".9"/>
            <path d="M10 10 C10 14,7 16,7 12 A3 3 0 0 1 10 10Z" fill="currentColor" opacity=".9"/>
            <path d="M10 10 C6 10,4 7,8 7 A3 3 0 0 1 10 10Z" fill="currentColor" opacity=".9"/>
          </g>
          <circle cx="10" cy="10" r="2" fill="currentColor"/>
        </svg>`;
      }
      return svg`<svg class="tile-icon tile-icon-relay ${isOn ? 'on' : ''}" viewBox="0 0 20 20">
        <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" fill="currentColor"/>
      </svg>`;
    }

    // dimmer / rgb — sun, rotate when on
    if (t === 'dimmer' || t === 'rgb') {
      return svg`<svg class="tile-icon tile-icon-sun ${isOn ? 'on' : ''}" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="3.5" fill="currentColor"/>
        <g class="sun-rays" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="10" y1="1.5" x2="10" y2="3.5"/>
          <line x1="10" y1="16.5" x2="10" y2="18.5"/>
          <line x1="1.5" y1="10" x2="3.5" y2="10"/>
          <line x1="16.5" y1="10" x2="18.5" y2="10"/>
          <line x1="4.1" y1="4.1" x2="5.5" y2="5.5"/>
          <line x1="14.5" y1="14.5" x2="15.9" y2="15.9"/>
          <line x1="4.1" y1="15.9" x2="5.5" y2="14.5"/>
          <line x1="14.5" y1="5.5" x2="15.9" y2="4.1"/>
        </g>
      </svg>`;
    }

    // cover — blinds, slats slide based on position
    if (t === 'cover') {
      const pos = coverPos ?? (coverState === 'open' ? 100 : coverState === 'closed' ? 0 : 50);
      const moving = coverState === 'opening' || coverState === 'closing';
      const slats = [2, 5.5, 9, 12.5, 16];
      const visibleSlats = Math.ceil((pos / 100) * slats.length);
      return svg`<svg class="tile-icon tile-icon-cover ${moving ? 'moving' : ''}" viewBox="0 0 20 20">
        <rect x="2" y="1" width="16" height="1.5" rx="0.75" fill="currentColor" opacity=".7"/>
        <line x1="10" y1="2.5" x2="10" y2="18.5" stroke="currentColor" stroke-width="1" opacity=".4"/>
        ${slats.map((y, i) => svg`<rect x="3" y="${y}" width="14" height="1.8" rx="0.5"
          fill="currentColor" opacity="${i < visibleSlats ? '0.85' : '0.2'}"/>`)}
      </svg>`;
    }

    // climate / wall_display — flame, flicker when heating
    if (t === 'climate' || t === 'wall_display') {
      return svg`<svg class="tile-icon tile-icon-flame ${isHeating ? 'on' : ''}" viewBox="0 0 20 20">
        <path class="flame-main" d="M10 18 C5 18 3 14 5 10 C6 8 7 9 7 9 C7 6 9 3 10 2 C10 5 12 6 12 9 C12 9 13 7 14 8 C16 11 15 18 10 18Z" fill="currentColor"/>
        <path class="flame-inner" d="M10 16 C8 16 7 14 8 12 C8.5 11 9 11.5 9 11.5 C9 10 10 9 10 9 C10 10.5 11 11 11 12.5 C12 11 12 14 10 16Z" fill="currentColor" opacity=".5"/>
      </svg>`;
    }

    // valve — droplet, animate when open
    if (t === 'valve') {
      return svg`<svg class="tile-icon tile-icon-valve ${valveOpen ? 'on' : ''}" viewBox="0 0 20 20">
        <path class="drop-body" d="M10 3 C10 3 4 10 4 13.5 A6 6 0 0 0 16 13.5 C16 10 10 3 10 3Z" fill="currentColor"/>
        <path class="drop-shine" d="M7.5 12 C7 10.5 8 9 8 9" stroke="white" stroke-width="1" stroke-linecap="round" fill="none" opacity=".5"/>
      </svg>`;
    }

    // energy — waveform, animate always
    if (t === 'energy') {
      return svg`<svg class="tile-icon tile-icon-energy" viewBox="0 0 20 20">
        <polyline class="energy-wave" points="1,10 4,6 7,14 10,4 13,14 16,6 19,10"
          fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }

    // sensor — thermometer, static
    if (t === 'sensor') {
      return svg`<svg class="tile-icon tile-icon-sensor" viewBox="0 0 20 20">
        <rect x="8.5" y="2" width="3" height="11" rx="1.5" fill="currentColor" opacity=".5"/>
        <circle cx="10" cy="14.5" r="3" fill="currentColor"/>
        <rect x="9.2" y="7" width="1.6" height="7" rx="0.8" fill="currentColor"/>
      </svg>`;
    }

    // input — touch finger, ripple on active
    if (t === 'input' || t === 'uni') {
      return svg`<svg class="tile-icon tile-icon-input ${isOn ? 'on' : ''}" viewBox="0 0 20 20">
        <path d="M8 4 C8 3 9 2 10 2 C11 2 12 3 12 4 L12 10.5 C13 9.8 15 10 15 11.5 L15 14 C15 16.5 13 18 10 18 C7 18 5 16.5 5 14 L5 4Z" fill="currentColor" opacity=".7"/>
        <circle class="input-ripple" cx="10" cy="4" r="0" fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>`;
    }

    // generic fallback — small circle
    return svg`<svg class="tile-icon tile-icon-generic" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="1.8" opacity=".6"/>
      <circle cx="10" cy="10" r="2" fill="currentColor" opacity=".6"/>
    </svg>`;
  }

  private _renderEntityAnim(entityId: string, isOn: boolean, deviceId: string): TemplateResult {
    const anims = this._config.device_styles?.[deviceId]?.entity_animations?.[entityId];
    if (!anims) return html``;
    const animType: EntityAnimationType = (isOn ? anims.on : anims.off) ?? 'none';
    if (animType === 'none') return html``;
    return renderAnimSvg(animType, isOn, `--ent-spd:${anims.speed ?? 1}`, 'ent-icon');
  }

  private _renderBlock(
    blockId: TileBlockId,
    device: HADevice,
    profile: DeviceProfileResult
  ): TemplateResult {
    const accent = this._tileAccent(device, device.area ?? '');
    return renderBlockTile(this._buildTileCtx(device, profile, accent), blockId);
  }

  private _renderPowerBar(device: HADevice): TemplateResult {
    if (!this._config.show_power_bar) return html``;
    const power = this._getPower(device) ?? 0;
    const maxW = this._config.power_bar_max ?? 2000;
    return html`
      <div class="power-bar" title="${power.toFixed(0)} W">
        <div class="power-bar-fill" style="width:${Math.min(100, (power / maxW) * 100)}%"></div>
      </div>`;
  }

  // ── Tile render ───────────────────────────────────────────────────────────

  /** Quick sensor snapshot used by alternative tile styles */
  private _tileSensors(device: HADevice): {
    power: number | null; voltage: number | null; current: number | null;
    temp: number | null; energy: number | null; rssi: number | null;
    uptime: number | null;
  } {
    let power: number | null = null, voltage: number | null = null,
        current: number | null = null, temp: number | null = null,
        energy: number | null = null, rssi: number | null = null,
        uptime: number | null = null;
    for (const e of device.entities) {
      if (e.domain !== 'sensor') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
      const dc = (s.attributes as HassAttrs).device_class as string ?? '';
      const v = parseFloat(s.state);
      if (dc === 'power'       && power   == null) power   = isNaN(v) ? null : v;
      if (dc === 'voltage'     && voltage == null) voltage = isNaN(v) ? null : v;
      if (dc === 'current'     && current == null) current = isNaN(v) ? null : v;
      if (dc === 'temperature' && temp    == null) temp    = isNaN(v) ? null : v;
      if (dc === 'energy'      && energy  == null) energy  = isNaN(v) ? null : v;
      const uid = e.entity_id;
      if (uid.includes('rssi') || uid.includes('signal')) rssi = isNaN(v) ? null : v;
      if (uid.includes('uptime')) uptime = isNaN(v) ? null : v;
    }
    return { power, voltage, current, temp, energy, rssi, uptime };
  }

  // ── Header stat chips ───────────────────────────────────────────────────────

  /** Per-device value for a header chip metric. null = device doesn't report it. */
  private _deviceMetric(device: HADevice, key: string): number | null {
    if (key === 'power') return this._getPower(device);
    const DC_KEYS: Record<string, string> = {
      energy: 'energy', temperature: 'temperature', humidity: 'humidity', illuminance: 'illuminance',
    };
    for (const e of device.entities) {
      if (e.domain !== 'sensor') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
      const v = parseFloat(s.state);
      if (isNaN(v)) continue;
      const dc = ((s.attributes as HassAttrs).device_class as string) ?? '';
      if (key === 'rssi') {
        if (dc === 'signal_strength' || e.entity_id.includes('rssi')) return v;
      } else if (dc === DC_KEYS[key]) return v;
    }
    return null;
  }

  private _formatHeaderMetric(key: string, v: number): string {
    switch (key) {
      case 'power':       return formatPower(v);
      case 'energy':      return formatEnergy(v);
      case 'temperature': return formatTemp(v);
      case 'humidity':    return formatHumidity(v);
      case 'illuminance': return formatIlluminance(v);
      case 'rssi':        return `${Math.round(v)} dBm`;
      default:            return String(v);
    }
  }

  private _devicesWithUpdates(devices: HADevice[]): Array<{ device: HADevice; fw: FirmwareInfo }> {
    return devices
      .map(d => ({ device: d, fw: this._getFirmware(d) }))
      .filter((x): x is { device: HADevice; fw: FirmwareInfo } =>
        !!x.fw?.newVersion && x.fw.newVersion !== x.fw.current);
  }

  /** Header stat chips — each clickable, opening a high→low device list for its metric. */
  private _renderHeaderChips(devices: HADevice[]): TemplateResult {
    const selected = this._config.header_chips ?? DEFAULT_HEADER_CHIPS;
    const online = devices.filter(d => this._isOnline(d)).length;
    const toggle = (key: string) => (e: Event) => {
      e.stopPropagation();
      this._cloudDetailOpen = this._cloudDetailOpen === `m:${key}` ? null : `m:${key}`;
    };
    return html`
      <div class="dash-stats">
        ${selected.map(key => {
          const def = HEADER_CHIP_DEFS.find(d => d.key === key);
          if (!def) return nothing;
          let text = '';
          let cls = 'metric';
          if (key === 'online') { text = `${online}/${devices.length} online`; cls = 'online'; }
          else if (key === 'offline') {
            const off = devices.length - online;
            if (!off) return nothing;
            text = `${off} offline`; cls = 'offline-count';
          } else if (key === 'alerts') {
            const n = devices.filter(d => this._getAlerts(d).length > 0).length;
            if (!n) return nothing;
            text = `⚠ ${n}`; cls = 'alerts-count';
          } else if (key === 'updates') {
            const n = this._devicesWithUpdates(devices).length;
            if (!n) return nothing;
            text = `⬆ ${n} update${n > 1 ? 's' : ''}`; cls = 'updates-count';
          } else {
            const vals = devices.map(d => this._deviceMetric(d, key)).filter((v): v is number => v != null);
            if (!vals.length) return nothing;
            const sum = vals.reduce((a, b) => a + b, 0);
            const v = def.agg === 'sum' ? sum : sum / vals.length;
            text = key === 'power' ? this._formatHeaderMetric(key, v) : `${def.label} ${this._formatHeaderMetric(key, v)}`;
            if (key === 'power') cls = 'power';
          }
          const open = this._cloudDetailOpen === `m:${key}`;
          return html`<span class="stat ${cls} ${open ? 'active' : ''}" @click=${toggle(key)}>${text}</span>`;
        })}
      </div>`;
  }

  /** Drill-down panel for the open header chip: devices sorted high→low by the metric. */
  private _renderHeaderDetail(devices: HADevice[]): TemplateResult {
    const openKey = this._cloudDetailOpen;
    if (!openKey?.startsWith('m:')) return html``;
    const key = openKey.slice(2);
    const def = HEADER_CHIP_DEFS.find(d => d.key === key);
    if (!def) return html``;
    let rows: Array<{ name: string; value: string }> = [];
    let hdrCls = 'cloud-on';
    if (key === 'online') {
      rows = devices.filter(d => this._isOnline(d)).map(d => ({ name: d.name, value: '' }));
    } else if (key === 'offline') {
      rows = devices.filter(d => !this._isOnline(d)).map(d => ({ name: d.name, value: '' }));
      hdrCls = 'cloud-off';
    } else if (key === 'alerts') {
      rows = devices
        .map(d => ({ d, a: this._getAlerts(d) }))
        .filter(x => x.a.length)
        .sort((a, b) => b.a.length - a.a.length)
        .map(x => ({ name: x.d.name, value: x.a.join(', ') }));
      hdrCls = 'cloud-off';
    } else if (key === 'updates') {
      rows = this._devicesWithUpdates(devices)
        .map(x => ({ name: x.device.name, value: `${x.fw.current} → ${x.fw.newVersion}` }));
    } else {
      rows = devices
        .map(d => ({ d, v: this._deviceMetric(d, key) }))
        .filter((x): x is { d: HADevice; v: number } => x.v != null)
        .sort((a, b) => b.v - a.v)
        .map(x => ({ name: x.d.name, value: this._formatHeaderMetric(key, x.v) }));
    }
    if (!rows.length) return html``;
    return html`
      <div class="cloud-detail" @click=${(e: Event) => e.stopPropagation()}>
        <div class="cloud-detail-hdr ${hdrCls}">● ${def.label} — ${rows.length} device${rows.length > 1 ? 's' : ''}</div>
        <div class="metric-list">
          ${rows.map(r => html`
            <div class="metric-row">
              <span class="metric-name">${r.name}</span>
              ${r.value ? html`<span class="metric-val">${r.value}</span>` : nothing}
            </div>`)}
        </div>
      </div>`;
  }

  /** Accent colour: device override → area accent → global accent → orange fallback */
  private _tileAccent(device: HADevice, areaLabel: string): string {
    const devClr = this._config.device_styles?.[device.device_id]?.color;
    if (devClr) return devClr;
    const areaStyle = this._config.area_styles?.[areaLabel];
    if (areaStyle?.accentColor) return areaStyle.accentColor;
    return this._config.style?.accent_color ?? 'var(--sc-accent)';
  }

  // ── Alternative tile style renderers ─────────────────────────────────────

  /**
   * Shared lower body for all alternative tile styles.
   * Renders whatever functional blocks the device actually needs, in order:
   *   graphs → dimmer/colour → TRV dial → valve controls → cover controls → relay channels
   * Skips any block that doesn't apply to this device.
   * Pass skipPowerSpark=true for the spark style (already shows power as its centrepiece).
   */
  private _renderTileLowerBody(
    device: HADevice,
    profile: DeviceProfileResult,
    opts: { skipGraphs?: boolean; skipPowerGraph?: boolean } = {}
  ): TemplateResult {
    const sw     = this._getPrimarySwitch(device);
    const trv    = this._getTrv(device);
    const valve  = this._getValve(device);
    const cover  = this._getCover(device);
    const isOn   = sw?.isOn ?? false;

    // ── Graphs ──────────────────────────────────────────────────
    const graphEntities = this._getGraphEntities(device);
    const visibleEntities = opts.skipGraphs
      ? []
      : opts.skipPowerGraph
        ? graphEntities.filter(e => e.dc !== 'power')
        : graphEntities;
    const graphBlock = visibleEntities.length
      ? html`<div class="ts-lower-section ts-lower-graphs">
          ${this._renderSparklinesFiltered(device, visibleEntities)}
        </div>`
      : nothing;

    // ── Dimmer / colour slider ───────────────────────────────────
    const isDimmable  = sw?.brightness !== undefined;
    const hasColor    = !!(sw?.colorModes?.length);
    const hexColor    = hasColor && sw!.rgbColor ? this._rgbToHex(...sw!.rgbColor) : '#ffffff';
    const isRgbw      = hasColor && (sw!.colorModes?.some(m => m === 'rgbw' || m === 'rgbww') ?? false);
    const bPct        = isDimmable && isOn ? Math.max(1, sw!.brightness ?? 1) : 0;
    const whiteVal    = sw?.whiteValue ?? 0;
    const swState     = sw ? this.hass.states[sw.entityId] : null;
    const effectList: string[] = (swState?.attributes as HassAttrs)?.effect_list ?? [];
    const currentEffect: string | null = (swState?.attributes as HassAttrs)?.effect ?? null;

    const dimmerBlock = isDimmable ? html`
      <div class="ts-lower-section ts-lower-dimmer" @click=${(e: Event) => e.stopPropagation()}>
        <div class="tile-dim-row">
          ${hasColor ? html`
            <input type="color" class="color-swatch tile-color-swatch" .value=${hexColor}
              ?disabled=${!isOn}
              @change=${(e: Event) => { e.stopPropagation(); this._setColor(sw!.entityId, (e.target as HTMLInputElement).value, whiteVal, isRgbw); }}/>
          ` : nothing}
          <input type="range" class="dim-slider" min="1" max="100"
            .value=${String(isOn ? bPct : 1)}
            ?disabled=${!isOn}
            @input=${(e: Event) => {
              const pct = (e.target as HTMLInputElement).closest('.tile-dim-row')?.querySelector('.dim-pct');
              if (pct) pct.textContent = `${(e.target as HTMLInputElement).value}%`;
            }}
            @change=${(e: Event) => { this._setBrightness(sw!.entityId, parseInt((e.target as HTMLInputElement).value, 10)); }}/>
          <span class="dim-pct">${bPct}%</span>
        </div>
        ${isRgbw ? html`
          <div class="tile-dim-row tile-white-row">
            <span class="dim-white-lbl">W</span>
            <input type="range" class="dim-slider white-slider" min="0" max="255"
              .value=${String(whiteVal)}
              @input=${(e: Event) => {
                const el = (e.target as HTMLInputElement).closest('.tile-white-row')?.querySelector('.white-pct');
                if (el) el.textContent = (e.target as HTMLInputElement).value;
              }}
              @change=${(e: Event) => { this._setColor(sw!.entityId, hexColor, parseInt((e.target as HTMLInputElement).value, 10), true); }}/>
            <span class="white-pct dim-pct">${whiteVal}</span>
          </div>
        ` : nothing}
        ${effectList.length > 1 ? html`
          <div class="tile-effects">
            ${effectList.filter(fx => fx !== 'Off').map(fx => html`
              <button class="effect-btn ${currentEffect === fx ? 'active' : ''}"
                @click=${(e: Event) => { e.stopPropagation(); this.hass.callService('light', 'turn_on', { entity_id: sw!.entityId, effect: currentEffect === fx ? 'Off' : fx }); }}>
                ${fx}
              </button>`)}
          </div>
        ` : nothing}
      </div>
    ` : nothing;

    // ── TRV dial ─────────────────────────────────────────────────
    const trvBlock = trv ? html`
      <div class="ts-lower-section ts-lower-trv" @click=${(e: Event) => e.stopPropagation()}>
        ${this._renderBlock('trv_control', device, profile)}
      </div>
    ` : nothing;

    // ── Valve controls ───────────────────────────────────────────
    const valveBlock = valve ? html`
      <div class="ts-lower-section ts-lower-valve" @click=${(e: Event) => e.stopPropagation()}>
        ${this._renderBlock('valve_controls', device, profile)}
      </div>
    ` : nothing;

    // ── Cover controls ───────────────────────────────────────────
    const coverBlock = cover ? html`
      <div class="ts-lower-section ts-lower-cover" @click=${(e: Event) => e.stopPropagation()}>
        ${this._renderBlock('cover_controls', device, profile)}
      </div>
    ` : nothing;

    // ── Relay channels (multi-channel devices) ───────────────────
    const relayEnts = device.entities.filter(e =>
      e.domain === 'switch' && /_(switch|relay|channel)_\d/.test(e.entity_id)
    );
    const relayBlock = relayEnts.length > 1 ? html`
      <div class="ts-lower-section ts-lower-relay" @click=${(e: Event) => e.stopPropagation()}>
        ${this._renderBlock('relay_channels', device, profile)}
      </div>
    ` : nothing;

    // Only render the wrapper if there's actually something to show
    const hasContent = visibleEntities.length || isDimmable || trv || valve || cover || relayEnts.length > 1;
    if (!hasContent) return html``;

    return html`
      <div class="ts-lower-body">
        ${graphBlock}
        ${dimmerBlock}
        ${trvBlock}
        ${valveBlock}
        ${coverBlock}
        ${relayBlock}
      </div>`;
  }

  /** Ensures power graph data is being fetched for a device (used by alt tile styles) */
  private _ensureGraphData(device: HADevice): void {
    const powerEnt = device.entities.find(e => {
      if (e.domain !== 'sensor') return false;
      const s = this.hass.states[e.entity_id];
      return s && (s.attributes as HassAttrs)?.device_class === 'power';
    });
    if (!powerEnt) return;
    this._requestGraphData(powerEnt.entity_id);
  }

  /** Get the first available power sparkline data for a device */
  private _getPowerSparks(device: HADevice): Array<{ t: number; v: number }> {
    const powerEnt = device.entities.find(e => {
      if (e.domain !== 'sensor') return false;
      const s = this.hass.states[e.entity_id];
      return s && (s.attributes as HassAttrs)?.device_class === 'power';
    });
    if (!powerEnt) return [];
    return this._graphData.get(this._gk(powerEnt.entity_id, this._config.graph_hours ?? 24)) ?? [];
  }
  // ── Style resolution helpers ─────────────────────────────────────────────

  /** Auto-detect the best style for a device profile */
  private _autoStyle(profile: DeviceProfileResult): TileStyle {
    switch (profile.type) {
      case 'relay': case 'plug': case 'energy': case 'uni': return 'power-monitor';
      case 'dimmer': case 'rgb':                             return 'light-control';
      case 'climate': case 'wall_display':                   return 'climate-control';
      case 'cover':                                          return 'cover-control';
      case 'sensor':                                         return 'sensor-card';
      case 'input':                                          return 'scene-button';
      default:                                               return 'default';
    }
  }

  /** Remap legacy style names to new purposeful names */
  private _resolveStyle(raw: TileStyle | undefined, profile: DeviceProfileResult): { style: TileStyle; variant: PowerMonitorVariant } {
    const legacyVariantMap: Partial<Record<TileStyle, PowerMonitorVariant>> = {
      hero: 'big-number', ring: 'gauge', spark: 'graph', hbar: 'compact', list: 'table',
    };
    if (raw && raw in legacyVariantMap) {
      return { style: 'power-monitor', variant: legacyVariantMap[raw]! };
    }
    if (raw === 'command') return { style: 'scene-button', variant: 'big-number' };
    return { style: raw ?? 'default', variant: 'big-number' };
  }

  private _handleScenePress(device: HADevice): void {
    const buttonEnts = device.entities.filter(e => e.domain === 'button');
    for (const e of buttonEnts) {
      this.hass.callService('button', 'press', { entity_id: e.entity_id });
    }
    const el = this.renderRoot?.querySelector(`.ts-scene[data-dev="${device.device_id}"] .ts-scene-ripple`) as HTMLElement | null;
    if (el) { el.classList.add('active'); setTimeout(() => el.classList.remove('active'), 600); }
  }

  private _adjustTrvTemp(trv: TrvInfo, direction: -1 | 1): void {
    const cur = this._trvDragTemp ?? trv.targetTemp;
    if (cur == null) return;
    const raw = cur + direction * trv.step;
    const next = direction > 0
      ? Math.min(trv.maxTemp, Math.round(raw * 100) / 100)
      : Math.max(trv.minTemp, Math.round(raw * 100) / 100);
    this._trvDragTemp = next;
    if (this._trvBtnTimer) clearTimeout(this._trvBtnTimer);
    this._trvBtnTimer = setTimeout(() => {
      this._setTemp(trv.entityId, this._trvDragTemp ?? next);
      this._trvDragTemp = null;
    }, 600);
  }

  private _buildTileCtx(device: HADevice, profile: DeviceProfileResult, accent: string): TileCtx {
    const online = this._isOnline(device);
    const sw = this._getPrimarySwitch(device);
    const isOn = sw?.isOn ?? false;
    return {
      hass: this.hass,
      config: this._config,
      device,
      profile,
      accent,
      online,
      isOn,
      getPrimarySwitch: (d) => this._getPrimarySwitch(d),
      getTrv: (d) => this._getTrv(d),
      getCover: (d) => this._getCover(d),
      getValve: (d) => this._getValve(d),
      getPower: (d) => this._getPower(d),
      tileSensors: (d) => this._tileSensors(d),
      getGraphEntities: (d) => this._getGraphEntities(d),
      getPowerSparks: (d) => this._getPowerSparks(d),
      ensureGraphData: (d) => this._ensureGraphData(d),
      renderEntityAnim: (id, on, devId) => this._renderEntityAnim(id, on, devId),
      renderSparklinesFiltered: (d, ents) => this._renderSparklinesFiltered(d, ents),
      renderTileLowerBody: (d, p, opts) => this._renderTileLowerBody(d, p, opts),
      renderTrvDial: (trv) => this._renderTrvDial(trv),
      renderValveDial: (vc) => this._renderValveDial(vc),
      setTemp: (id, t) => this._setTemp(id, t),
      setHvacMode: (id, m, e) => this._setHvacMode(id, m, e),
      setPresetMode: (id, p) => this._setPresetMode(id, p),
      coverAction: (id, a, e) => this._coverAction(id, a, e),
      valveAction: (id, a, e) => this._valveAction(id, a, e),
      toggle: (id, on, e) => this._toggle(id, on, e),
      pressButton: (id, e) => this._pressButton(id, e),
      setNumberValue: (id, v) => this._setNumberValue(id, v),
      selectOption: (id, opt) => this._selectOption(id, opt),
      timeAgo: (ts) => this._timeAgo(ts),
      getInputChannels: (d) => this._getInputChannels(d),
      handleScenePress: (d) => this._handleScenePress(d),
      adjustTrvTemp: (trv, dir) => this._adjustTrvTemp(trv, dir),
      requestGraphData: (id, h) => this._requestGraphData(id, h),
      getGraphPoints: (id, h) => this._graphData.get(this._gk(id, h)) ?? [],
      rgbToHex: (r, g, b) => this._rgbToHex(r, g, b),
      setBrightness: (id, pct) => this._setBrightness(id, pct),
      setColor: (id, hex, w, rgbw) => this._setColor(id, hex, w, rgbw),
      getAlerts: (d) => this._getAlerts(d),
      getFirmware: (d) => this._getFirmware(d),
      getSensors: (d) => this._getSensors(d),
      getVirtualControls: (d) => this._getVirtualControls(d),
      renderSparklines: (d) => this._renderSparklines(d),
      renderSparklinesExpanded: (d, h) => this._renderSparklines(d, true, h),
      renderPowerBar: (d) => this._renderPowerBar(d),
      closeDetailSheet: () => this._closeDetailSheet(),
      getDetailHistoryRange: () => this._detailHistoryRange,
      setDetailHistoryRange: (r) => { this._detailHistoryRange = r; },
      fireMoreInfo: (id) => { fireEvent(this as any, 'hass-more-info' as any, { entityId: id } as any); },
    };
  }

  private _renderTile(device: HADevice, areaTileStyle?: TileStyle): TemplateResult {
    const online  = this._isOnline(device);
    const profile = getDeviceProfile(device);
    const activeView = this._getActiveView();
    const tileSize = activeView?.tile_size ?? this._config.tile_size ?? 'md';

    // Accent / border override
    const accentColor = this._config.device_styles?.[device.device_id]?.color;
    const tileStyleObj: Record<string, string> = {};
    if (accentColor) {
      tileStyleObj['borderColor'] = accentColor;
      tileStyleObj['boxShadow']   = `0 0 12px ${accentColor}50`;
    }

    // Priority: device tile_style → area tile_style → active view → default
    const devStyle = this._config.device_styles?.[device.device_id];
    const rawStyle = devStyle?.tile_style ?? areaTileStyle ?? activeView?.tile_style;

    // Resolve variant — device → area → view → default
    const areaVariant = this._config.area_styles?.[device.area ?? '']?.power_monitor_variant;
    const { style, variant: legacyVariant } = this._resolveStyle(rawStyle, profile);
    const variant: PowerMonitorVariant =
      devStyle?.power_monitor_variant
      ?? areaVariant
      ?? activeView?.power_monitor_variant
      ?? legacyVariant;

    if (style === 'default' || !style) {
      // Original block-based layout
      const _defaultBlocks: TileBlockId[] = ['name_row', 'sensors', 'graph', 'dimmer', 'cover_controls', 'trv_control', 'valve_controls', 'input_channels', 'relay_channels', 'power_bar', 'badges'];
      const blockOrder: TileBlockId[] =
        devStyle?.tile_layout ?? this._config.tile_layout ??
        PROFILE_DEFAULT_BLOCKS[profile.type] ?? _defaultBlocks;
      const areaAccent = this._tileAccent(device, device.area ?? '');
      const blockCtx = this._buildTileCtx(device, profile, areaAccent);
      return html`
        <div class="tile tile--clickable ${!online ? 'offline' : ''} tile-${tileSize}" style=${styleMap(tileStyleObj)}
          @pointerdown=${(e: PointerEvent) => this._onTilePointerDown(device, e)}
          @pointerup=${(e: PointerEvent) => this._onTilePointerUp(device, e)}
          @pointercancel=${() => this._onTilePointerCancel()}
          @pointermove=${(e: PointerEvent) => this._onTilePointerMove(e)}>
          ${blockOrder.map(b => renderBlockTile(blockCtx, b))}
        </div>`;
    }

    // Alt styles — shared setup
    const areaLabel = device.area ?? '';
    const accent    = this._tileAccent(device, areaLabel);
    const sw        = this._getPrimarySwitch(device);
    const isOn      = sw?.isOn ?? false;
    const base      = `tile tile-${tileSize} ${!online ? 'offline' : ''} tile--clickable`;

    return html`<div class="${base}" style=${styleMap(tileStyleObj)}
      @pointerdown=${(e: PointerEvent) => this._onTilePointerDown(device, e)}
      @pointerup=${(e: PointerEvent) => this._onTilePointerUp(device, e)}
      @pointercancel=${() => this._onTilePointerCancel()}
      @pointermove=${(e: PointerEvent) => this._onTilePointerMove(e)}>
      ${style === 'power-monitor'   ? renderPowerMonitorTile(this._buildTileCtx(device, profile, accent), variant)
      : style === 'light-control'   ? renderLightControlTile(this._buildTileCtx(device, profile, accent))
      : style === 'climate-control' ? renderClimateControlTile(this._buildTileCtx(device, profile, accent))
      : style === 'cover-control'   ? renderCoverControlTile(this._buildTileCtx(device, profile, accent))
      : style === 'sensor-card'     ? renderSensorCardTile(this._buildTileCtx(device, profile, accent))
      : style === 'scene-button'    ? renderSceneButtonTile(this._buildTileCtx(device, profile, accent))
      : nothing}
    </div>`;
  }

  // ── Tile click / long-press ────────────────────────────────────────────────

  private _onTilePointerDown(_device: HADevice, e: PointerEvent): void {
    if (!(e.target as Element | null)?.closest?.('.tile-trigger')) return;
    this._lpStart = { x: e.clientX, y: e.clientY };
  }

  private _onTilePointerUp(device: HADevice, e: PointerEvent): void {
    if (!(e.target as Element | null)?.closest?.('.tile-trigger')) return;
    const start = this._lpStart;
    this._lpStart = null;
    if (!start) return; // cancelled by move or pointercancel
    this._detailDevice = device.device_id;
    this._detailHistoryRange = 24;
  }

  private _onTilePointerCancel(): void {
    this._lpStart = null;
  }

  private _onTilePointerMove(e: PointerEvent): void {
    if (!this._lpStart) return;
    const dx = e.clientX - this._lpStart.x;
    const dy = e.clientY - this._lpStart.y;
    if (dx * dx + dy * dy > 100) this._lpStart = null; // 10px threshold squared → cancel tap on drag
  }

  // ── Favourites section ───────────────────────────────────────────────────

  private _renderFavoritesSection(allDevices: HADevice[]): TemplateResult {
    const ids = this._config.favorites;
    if (!ids?.length) return html``;

    // Preserve the user-defined pin order
    const idOrder = new Map(ids.map((id, i) => [id, i]));
    const favDevices = allDevices
      .filter(d => idOrder.has(d.device_id))
      .sort((a, b) => (idOrder.get(a.device_id) ?? 0) - (idOrder.get(b.device_id) ?? 0));

    if (!favDevices.length) return html``;

    const totalPower  = favDevices.reduce((s, d) => s + (this._getPower(d) ?? 0), 0);
    const onlineCount = favDevices.filter(d => this._isOnline(d)).length;
    const cols        = this._config.columns ?? 3;
    const tileStyle   = this._config.area_styles?.['Favourites']?.tile_style;

    return html`
      <div class="fav-section">
        <div class="fav-header">
          <span class="fav-star">★</span>
          <span class="fav-label">Favourites</span>
          <div class="fav-chips">
            <span class="fav-chip fav-chip-count">${onlineCount}/${favDevices.length}</span>
            ${totalPower > 0 ? html`<span class="fav-chip fav-chip-power">${formatPower(totalPower)}</span>` : nothing}
          </div>
        </div>
        <div class="device-grid fav-grid" style="--cols:${cols}">
          ${favDevices.map(d => html`
            <div class="fav-tile-wrap">
              ${d.area ? html`<span class="tile-room-badge">${d.area}</span>` : nothing}
              ${this._renderTile(d, tileStyle)}
            </div>
          `)}
        </div>
      </div>`;
  }

  // ── Area section ──────────────────────────────────────────────────────────

  private _getAreaChips(devices: HADevice[], areaName?: string): Array<{ label: string; value: string }> {
    const areaSel = areaName ? this._config.area_styles?.[areaName]?.sensors : undefined;
    const sel = areaSel?.length ? areaSel : this._config.sensors;
    const allowed = sel?.length ? new Set(sel) : null;
    const show = (k: string) => !allowed || allowed.has(k);
    const acc: Record<string, { sum: number; count: number }> = {};
    const add = (k: string, v: number) => {
      if (!acc[k]) acc[k] = { sum: 0, count: 0 };
      acc[k].sum += v; acc[k].count++;
    };
    for (const device of devices) {
      for (const e of device.entities) {
        if (e.domain !== 'sensor') continue;
        const s = this.hass.states[e.entity_id];
        if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
        const v = parseFloat(s.state);
        if (isNaN(v)) continue;
        const dc = ((s.attributes as Record<string, unknown>).device_class as string) ?? '';
        if      (dc === 'power'          && show('power'))       add('power', v);
        else if (dc === 'energy'         && show('energy'))      add('energy', v);
        else if (dc === 'temperature'    && show('temperature')) add('temperature', v);
        else if (dc === 'humidity'       && show('humidity'))    add('humidity', v);
        else if (dc === 'carbon_dioxide' && show('co2'))         add('co2', v);
        else if (dc === 'illuminance'    && show('illuminance')) add('illuminance', v);
      }
    }
    const chips: Array<{ label: string; value: string }> = [];
    if (acc['power'])       chips.push({ label: 'Power',  value: formatPower(acc['power'].sum) });
    if (acc['energy'])      chips.push({ label: 'Energy', value: formatEnergy(acc['energy'].sum) });
    if (acc['temperature']) chips.push({ label: 'Temp',   value: formatTemp(acc['temperature'].sum / acc['temperature'].count) });
    if (acc['humidity'])    chips.push({ label: 'Hum',    value: formatHumidity(acc['humidity'].sum / acc['humidity'].count) });
    if (acc['co2'])         chips.push({ label: 'CO₂',   value: formatPpm(acc['co2'].sum / acc['co2'].count) });
    if (acc['illuminance']) chips.push({ label: 'Light',  value: formatIlluminance(acc['illuminance'].sum / acc['illuminance'].count) });
    return chips;
  }

  private _renderAreaSection(area: string, devices: HADevice[]): TemplateResult {
    if (!devices.length) return html``;
    const label = area || 'No Area';
    const isClosed = this._closedAreas.has(area);
    const onlineCount = devices.filter(d => this._isOnline(d)).length;
    const areaPower = devices.reduce((s, d) => s + (this._getPower(d) ?? 0), 0);
    const areaStyle = this._config.area_styles?.[label];
    const cols = areaStyle?.columns ?? this._config.columns ?? 3;
    const st = this._config.style ?? {};

    const styleObj: Record<string, string> = {};
    if (areaStyle) {
      if (areaStyle.borderColor || areaStyle.borderWidth) {
        styleObj['border'] = `${areaStyle.borderWidth ?? 1}px ${areaStyle.borderStyle ?? 'solid'} ${areaStyle.borderColor ?? 'var(--divider-color)'}`;
      }
      if (areaStyle.borderRadius) { styleObj['borderRadius'] = `${areaStyle.borderRadius}px`; styleObj['overflow'] = 'hidden'; }
      if (areaStyle.headerBgColor) {
        styleObj['--area-header-bg'] = areaStyle.headerBgColor2
          ? `linear-gradient(${areaStyle.headerBgDir ?? 'to right'}, ${areaStyle.headerBgColor}, ${areaStyle.headerBgColor2})`
          : areaStyle.headerBgColor;
      }
      if (areaStyle.textColor)       styleObj['--area-header-color'] = areaStyle.textColor;
      if (areaStyle.fontSize)        styleObj['--area-name-size']    = `${areaStyle.fontSize}px`;
      if (areaStyle.fontWeight)      styleObj['--area-name-weight']  = areaStyle.fontWeight;
      if (areaStyle.tileBgColor)     styleObj['--sc-tile-bg']           = areaStyle.tileBgColor;
      if (areaStyle.tileBorderColor) styleObj['--sc-tile-border']    = areaStyle.tileBorderColor;
      if (areaStyle.tileBorderRadius != null) styleObj['--tile-radius'] = `${areaStyle.tileBorderRadius}px`;
      if (areaStyle.tileGap != null) styleObj['--tile-gap']          = `${areaStyle.tileGap}px`;
      if (areaStyle.tileTextColor)   styleObj['--sc-text-primary']   = areaStyle.tileTextColor;
      if (areaStyle.accentColor) {
        styleObj['--sc-accent']      = areaStyle.accentColor;
        styleObj['--sc-graph-line']  = areaStyle.accentColor;
        styleObj['--sc-accent-glow'] = `${areaStyle.accentColor}59`;
      }
      // Per-room button style overrides
      if (areaStyle.buttonShape || areaStyle.buttonVariant || areaStyle.buttonSize) {
        const shape   = areaStyle.buttonShape   ?? 'pill';
        const variant = areaStyle.buttonVariant ?? 'fill';
        const size    = areaStyle.buttonSize    ?? 'md';
        const isSquarish = shape === 'square' || shape === 'circle';
        const padMap: Record<string,string>   = { sm:'2px 8px',   md:'4px 11px',  lg:'6px 16px' };
        const padSqMap: Record<string,string> = { sm:'3px 5px',   md:'4px 8px',   lg:'6px 12px' };
        styleObj['--tog-radius'] = shape === 'pill' ? '20px' : shape === 'rect' ? '6px' : shape === 'square' ? '6px' : '50%';
        styleObj['--tog-pad']    = isSquarish ? (padSqMap[size] ?? padSqMap.md) : (padMap[size] ?? padMap.md);
        styleObj['--tog-fsize']  = size === 'sm' ? '.65em' : size === 'lg' ? '.8em' : '.72em';
        styleObj['--tog-aspect'] = isSquarish ? '1' : 'auto';
        if (variant === 'outline') {
          styleObj['--tog-on-bg']     = 'transparent';
          styleObj['--tog-on-border'] = '1px solid var(--sc-accent)';
          styleObj['--tog-on-color']  = 'var(--sc-accent)';
          styleObj['--tog-on-shadow'] = 'none';
        } else if (variant === 'ghost') {
          styleObj['--tog-on-bg']     = 'transparent';
          styleObj['--tog-on-border'] = 'none';
          styleObj['--tog-on-color']  = 'var(--sc-accent)';
          styleObj['--tog-on-shadow'] = 'none';
        }
      }
    }

    // Flat grid — no expanded panel
    const areaTileStyle: TileStyle | undefined = areaStyle?.tile_style;
    const gridItems = devices.map(d => this._renderTile(d, areaTileStyle));
    const areaChips = this._getAreaChips(devices, label);

    return html`
      <div class="area-section ${isClosed ? 'closed' : ''}" style=${styleMap(styleObj)}>
        <div class="area-header" @click=${() => {
          const next = new Set(this._closedAreas);
          next.has(area) ? next.delete(area) : next.add(area);
          this._closedAreas = next;
        }}>
          <span class="area-name">${label}</span>
          ${areaChips.length ? html`
            <div class="area-chips">
              ${areaChips.map(c => html`
                <div class="area-chip">
                  <span class="tsc-lbl">${c.label}</span>
                  <span class="tsc-val">${c.value}</span>
                </div>`)}
            </div>` : nothing}
          <div class="area-meta">
            <span class="area-count">${onlineCount}/${devices.length}</span>
            ${areaPower > 0 ? html`<span class="area-power">${formatPower(areaPower)}</span>` : nothing}
            <span class="chevron ${isClosed ? '' : 'open'}">▼</span>
          </div>
        </div>
        ${isClosed ? nothing : html`
          <div class="device-grid" style="--cols:${cols}">
            ${gridItems}
          </div>
        `}
      </div>
    `;
  }

  // ── Expanded tile panel ───────────────────────────────────────────────────

  private _renderExpanded(device: HADevice): TemplateResult {
    const sensors = this._getSensors(device);
    const fw = this._getFirmware(device);
    const trv = this._getTrv(device);
    const cover = this._getCover(device);
    const valve = this._getValve(device);

    const showEntityList = this._config.show_entity_list !== false;
    const isOpen = this._entityListOpen.has(device.device_id);

    return html`
      <div class="expanded" @click=${(e: Event) => e.stopPropagation()}>

        ${cover ? html`
          <div class="exp-section exp-section--cover">
            <div class="exp-label">Cover</div>
            <div class="trv-mode-row">
              <button class="tog sm ${cover.state === 'open' ? 'on' : 'off'}" @click=${(e: Event) => this._coverAction(cover.entityId, 'open', e)}>Open</button>
              <button class="tog sm off" @click=${(e: Event) => this._coverAction(cover.entityId, 'stop', e)}>Stop</button>
              <button class="tog sm ${cover.state === 'closed' ? 'on' : 'off'}" @click=${(e: Event) => this._coverAction(cover.entityId, 'close', e)}>Close</button>
            </div>
            ${cover.position != null ? html`
              <div class="dim-wrap" style="margin-top:8px">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider" min="0" max="100" step="5"
                  style="accent-color:var(--sc-accent)"
                  .value=${String(cover.position)}
                  @change=${(e: Event) => { e.stopPropagation(); this._setCoverPosition(cover.entityId, parseFloat((e.target as HTMLInputElement).value)); }}/>
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center;font-size:12px;color:var(--sc-text-secondary);margin-top:2px">Position: ${Math.round(cover.position)}%</div>
            ` : nothing}
          </div>
        ` : nothing}

        ${trv ? html`
          <div class="exp-section exp-section--trv">
            <div class="exp-label">Thermostat</div>
            <div class="trv-ctrl-row">
              <button class="trv-big-btn" @click=${(e: Event) => { e.stopPropagation(); if (trv.targetTemp != null) this._setTemp(trv.entityId, Math.max(trv.minTemp, trv.targetTemp - trv.step)); }}>−</button>
              <div class="trv-display">
                <span class="trv-target-big">${trv.targetTemp != null ? trv.targetTemp.toFixed(1) : '—'}°</span>
                ${trv.currentTemp != null ? html`<span class="trv-current-sub">now ${trv.currentTemp}°</span>` : nothing}
                ${trv.hvacAction === 'heating' ? html`<span class="trv-action-badge heating">Heating</span>` : nothing}
              </div>
              <button class="trv-big-btn" @click=${(e: Event) => { e.stopPropagation(); if (trv.targetTemp != null) this._setTemp(trv.entityId, Math.min(trv.maxTemp, trv.targetTemp + trv.step)); }}>+</button>
            </div>
            <div class="dim-wrap" style="margin:4px 0 8px">
              <span class="trv-range-lbl">${trv.minTemp}°</span>
              <input type="range" class="dim-slider" .min=${String(trv.minTemp)} .max=${String(trv.maxTemp)} .step=${String(trv.step)}
                style="accent-color:var(--sc-accent)" .value=${String(trv.targetTemp ?? trv.minTemp)}
                @change=${(e: Event) => { e.stopPropagation(); this._setTemp(trv.entityId, parseFloat((e.target as HTMLInputElement).value)); }}/>
              <span class="trv-range-lbl">${trv.maxTemp}°</span>
            </div>
            <div class="trv-mode-row">
              <button class="tog sm ${trv.hvacMode === 'heat' ? 'on' : 'off'}" @click=${(e: Event) => this._setHvacMode(trv.entityId, 'heat', e)}>Heat</button>
              <button class="tog sm ${trv.hvacMode === 'off' ? 'on' : 'off'}" @click=${(e: Event) => this._setHvacMode(trv.entityId, 'off', e)}>Off</button>
            </div>
          </div>
        ` : nothing}

        ${valve ? html`
          <div class="exp-section">
            <div class="exp-label">Valve</div>
            <div class="trv-mode-row">
              <button class="tog sm ${valve.state === 'open' ? 'on' : 'off'}" @click=${(e: Event) => this._valveAction(valve.entityId, 'open', e)}>Open</button>
              <button class="tog sm off" @click=${(e: Event) => this._valveAction(valve.entityId, 'stop', e)}>Stop</button>
              <button class="tog sm ${valve.state === 'closed' ? 'on' : 'off'}" @click=${(e: Event) => this._valveAction(valve.entityId, 'close', e)}>Close</button>
            </div>
            ${valve.position != null ? html`
              <div class="dim-wrap" style="margin-top:8px">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider" min="0" max="100" step="5"
                  style="accent-color:var(--sc-accent)"
                  .value=${String(valve.position)}
                  @change=${(e: Event) => { e.stopPropagation(); this._setValvePosition(valve.entityId, parseFloat((e.target as HTMLInputElement).value)); }}/>
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center;font-size:12px;color:var(--sc-text-secondary);margin-top:2px">Position: ${Math.round(valve.position)}%</div>
            ` : nothing}
          </div>
        ` : nothing}

        ${sensors.length ? html`
          <div class="exp-section">
            <div class="exp-label">Sensors</div>
            <div class="sensor-row">
              ${sensors.map(s => html`
                <div class="sensor-chip">
                  <span class="sensor-label">${s.label}</span>
                  <span class="sensor-value ${s.warn ? 'warn' : ''}">${s.value}</span>
                </div>
              `)}
            </div>
          </div>
        ` : nothing}

        ${fw ? html`
          <div class="exp-section">
            <div class="exp-label">Firmware update available</div>
            <div class="exp-row">
              <span class="exp-name">${fw.newVersion ?? 'New version'}</span>
              <button class="tog sm update" @click=${(e: Event) => this._installUpdate(fw.entityId, e)}>Install</button>
            </div>
          </div>
        ` : nothing}

        ${showEntityList ? html`
          <div class="exp-section exp-section--full">
            <div class="ent-list-header" @click=${(e: Event) => {
              e.stopPropagation();
              const next = new Set(this._entityListOpen);
              isOpen ? next.delete(device.device_id) : next.add(device.device_id);
              this._entityListOpen = next;
            }}>
              <span class="exp-label" style="margin:0">All Entities (${device.entities.length})</span>
              <span class="ent-caret ${isOpen ? 'open' : ''}">▼</span>
            </div>
            ${isOpen ? html`
              <div class="ent-list">
                ${device.entities
                  .filter(e => !(this._config.hidden_entities ?? []).includes(e.entity_id))
                  .map(e => {
                    const s = this.hass.states[e.entity_id];
                    const rawState = s?.state ?? 'unavailable';
                    const unit = (s?.attributes as HassAttrs)?.unit_of_measurement ?? '';
                    const name = (s?.attributes as HassAttrs)?.friendly_name ?? e.entity_id.split('.')[1].replace(/_/g, ' ');
                    const isToggleable = ['switch', 'light', 'input_boolean', 'fan'].includes(e.domain);
                    return html`
                      <div class="ent-row">
                        <span class="ent-domain">${e.domain}</span>
                        <span class="ent-name">${name}</span>
                        <span class="ent-state">${unit ? `${rawState} ${unit}` : rawState}</span>
                        ${isToggleable ? html`
                          <button class="tog sm ${rawState === 'on' ? 'on' : 'off'}"
                            @click=${(ev: Event) => this._toggle(e.entity_id, rawState === 'on', ev)}>
                            ${rawState === 'on' ? 'ON' : 'OFF'}
                          </button>
                        ` : nothing}
                      </div>
                    `;
                  })}
              </div>
            ` : nothing}
          </div>
        ` : nothing}

      </div>
    `;
  }

  // ── Main render ───────────────────────────────────────────────────────────

  protected render(): TemplateResult {
    if (!this._config || !this.hass) return html``;

    const pickerTags = new Set(['hui-card-picker','hui-cards-used-card-picker']);
    let _node: Node = this;
    let inPicker = false;
    while (_node) {
      if (_node instanceof Element && pickerTags.has(_node.tagName.toLowerCase())) { inPicker = true; break; }
      const root = _node.getRootNode();
      if (root === _node || root === document) break;
      _node = (root as ShadowRoot).host;
    }
    if (inPicker) {
      return html`
        <ha-card>
          <div style="padding:20px;text-align:center;color:var(--secondary-text-color,#9ca3af);">
            <div style="font-size:2em;margin-bottom:8px">📡</div>
            <div style="font-weight:600;margin-bottom:4px">HA Device Dashboard</div>
            <div style="font-size:.85em">Add the card to configure rooms and devices</div>
          </div>
        </ha-card>`;
    }

    const devices = this._getDevices();

    if (!devices.length) {
      return html`
        <ha-card>
          <div class="empty">
            <p>No devices found.</p>
            <p class="hint">No devices found matching your filters.</p>
          </div>
        </ha-card>`;
    }

    const activeView = this._getActiveView();
    const viewDevices = activeView ? this._applyViewFilter(devices, activeView) : devices;
    const grouped = this._groupByArea(viewDevices);
    const showFavourites = !activeView || activeView.show_favourites === true;
    const showRooms = !activeView || activeView.show_rooms !== false;

    // Cloud connectivity stats from binary_sensor.*_cloud entities
    const cloudSensors = Object.values(this.hass.states)
      .filter(s => s.entity_id.startsWith('binary_sensor.') && s.entity_id.endsWith('_cloud'));
    const cloudOnline    = cloudSensors.filter(s => s.state === 'on');
    const cloudOffline   = cloudSensors.filter(s => s.state === 'off');
    const cloudUnavail   = cloudSensors.filter(s => s.state === 'unavailable');
    const cloudName = (s: (typeof cloudSensors)[0]) =>
      ((s.attributes.friendly_name as string) ?? s.entity_id).replace(/\s*[Cc]loud$/, '').trim();

    const cardInlineStyles = this._buildCardStyles();

    const detailDev = this._detailDevice
      ? this._getDevices().find(d => d.device_id === this._detailDevice) ?? null
      : null;
    const detailSheet = detailDev
      ? renderDetailSheet(this._buildTileCtx(detailDev, getDeviceProfile(detailDev), this._tileAccent(detailDev, detailDev.area ?? '')))
      : nothing;

    return html`
      <ha-card class=${(this._config.effects ?? false) ? '' : 'no-fx'} style=${styleMap(cardInlineStyles)} @click=${() => { if (this._cloudDetailOpen) this._cloudDetailOpen = null; }}>
        ${detailSheet}
        <div class="dash-header">
          <div class="dash-header-bg"></div>
          ${this._config.header_show_title !== false ? html`
            <span class="dash-title">${this._config.title ?? 'Shelly'}</span>` : nothing}
          ${this._config.header_show_stats !== false ? this._renderHeaderChips(devices) : nothing}
          ${this._config.header_show_cloud === true ? html`
            <div class="cloud-chips">
              <span class="cloud-chip cloud-on ${this._cloudDetailOpen === 'on' ? 'active' : ''}"
                @click=${(e: Event) => { e.stopPropagation(); this._cloudDetailOpen = this._cloudDetailOpen === 'on' ? null : 'on'; }}>
                ● ${cloudOnline.length} online</span>
              <span class="cloud-chip cloud-off ${this._cloudDetailOpen === 'off' ? 'active' : ''}"
                @click=${(e: Event) => { e.stopPropagation(); this._cloudDetailOpen = this._cloudDetailOpen === 'off' ? null : 'off'; }}>
                ● ${cloudOffline.length} offline</span>
              ${cloudUnavail.length > 0 ? html`
                <span class="cloud-chip cloud-unavail ${this._cloudDetailOpen === 'unavailable' ? 'active' : ''}"
                  @click=${(e: Event) => { e.stopPropagation(); this._cloudDetailOpen = this._cloudDetailOpen === 'unavailable' ? null : 'unavailable'; }}>
                  ● ${cloudUnavail.length} unavailable</span>` : nothing}
            </div>` : nothing}
        </div>
        ${this._cloudDetailOpen === 'on' ? html`
          <div class="cloud-detail" @click=${(e: Event) => e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-on">● Online — ${cloudOnline.length} devices</div>
            <div class="cloud-grid">
              ${cloudOnline.map(s => html`<div class="cloud-item">${cloudName(s)}</div>`)}
            </div>
          </div>` : nothing}
        ${this._cloudDetailOpen === 'off' ? html`
          <div class="cloud-detail" @click=${(e: Event) => e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-off">● Offline — ${cloudOffline.length} devices</div>
            <div class="cloud-grid">
              ${cloudOffline.map(s => html`<div class="cloud-item">${cloudName(s)}</div>`)}
            </div>
          </div>` : nothing}
        ${this._cloudDetailOpen === 'unavailable' ? html`
          <div class="cloud-detail" @click=${(e: Event) => e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-unavail">● Unavailable — ${cloudUnavail.length} devices</div>
            <div class="cloud-grid">
              ${cloudUnavail.map(s => html`<div class="cloud-item">${cloudName(s)}</div>`)}
            </div>
          </div>` : nothing}
        ${this._renderHeaderDetail(devices)}
        ${this._renderViewTabs()}
        <div class="dash-body">
          ${showFavourites ? this._renderFavoritesSection(devices) : nothing}
          ${showRooms
            ? [...grouped.entries()].map(([area, areaDevices]) => this._renderAreaSection(area, areaDevices))
            : html`<div class="device-grid" style="--cols:${activeView?.columns ?? this._config.columns ?? 3}">
                ${viewDevices.map(d => this._renderTile(d))}
              </div>`}
        </div>
      </ha-card>
    `;
  }

  /** Horizontal tab bar — rendered only when the card has ≥2 views. */
  private _renderViewTabs(): TemplateResult {
    const views = this._config.views;
    if (!views?.length || views.length < 2) return html``;
    const activeId = this._getActiveView()?.id;
    return html`
      <div class="view-tabs">
        ${views.map(v => html`
          <button class="view-tab ${v.id === activeId ? 'active' : ''}"
            @click=${() => this._setActiveView(v.id)}>
            ${v.icon ? html`<ha-icon class="view-tab-icon" .icon=${v.icon}></ha-icon>` : nothing}
            <span>${v.name}</span>
          </button>`)}
      </div>`;
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  static styles = [
    unsafeCSS(BUNDLED_FONT_CSS),
    mainCss,
    tilesCss,
    detailCss,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-device-dashboard': HADeviceDashboard;
  }
}
