import { LitElement, html, svg, css, unsafeCSS, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { HADeviceDashboardConfig, HADevice, TileBlockId, DeviceProfileResult, EntityAnimationType, TileStyle, PowerMonitorVariant, HassAttrs, ViewConfig, CustomStyleDef, TileLayout, EnergyPeriod, DetailHistoryRange, InputActionConfig, InputHoldConfig, AreaStyle } from './types';
import type { LovelaceCardConfig } from 'custom-card-helpers';
import { BUNDLED_FONT_CSS } from './fonts';
import { THEME_KEYS, paletteFor } from './themes';
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
import { renderInputControlTile } from './tiles/input-control';
import { renderEffectPicker } from './tiles/tile-parts';
import * as cascade from './cascade';
import {
  attentionItems, firmwareGroups, lightCounts, deviceFaults, environmentAlarms, hasUpdate,
  isOnline as deviceIsOnline, isBetaUpdate, type AttentionItem, type AttentionKind,
} from './attention';
import { renderSensorCardTile } from './tiles/sensor-card';
import { renderPowerMonitorTile } from './tiles/power-monitor';
import { renderLightControlTile } from './tiles/light-control';
import { renderBlockTile } from './tiles/block-tile';
import { renderDetailSheet } from './detail/detail-sheet';
import {
  getAllDevices, getDeviceProfile, migrateConfig, factoryLook, delegatableEntities,
  normalizeTileLayout, DEFAULT_GRAPH_SENSORS, profileDefaultTileStyle, PROFILE_LABELS, GRAPH_DC_LABELS, GRAPH_SENSOR_DEFS,
  HEADER_CHIP_DEFS, DEFAULT_HEADER_CHIPS, AREA_CHIP_DEFS, DEFAULT_AREA_HEADER_CHIPS, downsamplePoints, normalizeGraphKey,
  formatPower, formatEnergy, formatVoltage, formatCurrent, formatTemp,
  formatUptime, formatApparentPower, formatReactivePower,
  formatFrequency, formatHumidity, formatIlluminance, formatPpm, formatPercent,
  detectInputChannels,
} from './helpers';
import { renderAnimSvg } from './anim-icons';

/** Floor for hold-to-dim: 0 would turn the light off mid-ramp. */
const MIN_DIM = 3;

/** How long a single tap waits to see if a second one follows. Only applied to
 *  channels that actually have a double_tap_action to disambiguate against. */
const DOUBLE_TAP_MS = 250;

/** An input action's target(s), normalised — one entity or a list, always a list. */
const entityList = (e: string | string[] | undefined): string[] =>
  e == null ? [] : Array.isArray(e) ? e.filter(Boolean) : [e];

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
  /** Which room-header chip's per-device drill-down is open, as `area|key`. */
  @state() private _areaChipOpen: string | null = null;
  @state() private _graphData = new Map<string, Array<{ t: number; v: number }>>();
  /** Period-energy consumption (kWh) from recorder statistics, keyed `${entityId}|${period}`. */
  @state() private _periodEnergy = new Map<string, number>();
  private _periodEnergyFetching = new Set<string>();
  private _periodEnergyAt = new Map<string, number>();
  // Concurrency-capped fetch queue + a coalesced commit buffer, so a fleet with a
  // period set doesn't fire N concurrent WS calls and re-render once per resolution.
  private _periodEnergyQueue: string[] = [];
  private _periodEnergyInFlight = 0;
  private readonly _maxPeriodEnergyFetch = 4;
  private _periodEnergyPending = new Map<string, number>();
  private _periodEnergyCommitTimer: number | null = null;
  /** When the last `statistics_during_period` call for a key failed. Gates retries
   *  so a persistently failing entity doesn't re-fire on every render. */
  @state() private _periodEnergyErrAt = new Map<string, number>();
  @state() private _valveDragPos: number | null = null;
  @state() private _trvDragTemp: number | null = null;
  private _trvBtnTimer: ReturnType<typeof setTimeout> | null = null;
  /** Which header drill-down is open: 'on'/'off'/'unavailable' (cloud chips) or 'm:<metric>' (stat chips). */
  @state() private _cloudDetailOpen: string | null = null;
  @state() private _detailDevice: string | null = null;
  @state() private _detailHistoryRange: DetailHistoryRange = 24;
  @state() private _activeViewId: string | null = null;
  /** One-time notice: delegatable devices exist but native controls are off. */
  @state() private _delegateNoticeDismissed = false;
  /** Needs-attention summary expanded. Collapsed by default: the count is the
   *  signal, the list is the follow-up. */
  @state() private _attentionOpen = false;
  /** Set once when this card is HA's edit-dialog live preview (data-edit-preview
   *  on the host), so we can cap its height on mobile — see static styles. */
  private _editPreviewChecked = false;

  // Tap-gesture tracking (not @state — no re-render needed)
  private _lpStart: { x: number; y: number } | null = null;

  private readonly _graphFetching = new Set<string>();
  private readonly _graphFetchedAt = new Map<string, number>();

  // Device list cache — only recompute when entity/device registries or config change
  private _cachedDevices: HADevice[] | null = null;
  private _cacheEntitiesRef: unknown = null;
  private _cacheDevicesRef: unknown = null;
  private _cacheConfigRef: HADeviceDashboardConfig | null = null;
  /** Device profile is static per device; cache it, cleared whenever the
   *  device list is rebuilt (registry/config change). */
  private _profileCache = new Map<string, DeviceProfileResult>();

  // Card-level CSS var map — recomputed only when config changes.
  // Rebuilding this every render would re-stringify embedded data URLs
  // (card_bg_image / tile_bg_image), which can be ~500 KB each.
  // Both caches key on the active VIEW as well as the config: a view can carry
  // its own `theme`, so switching tabs changes the palette without the config
  // object ever changing identity.
  private _cachedCardStyles: Record<string, string> | null = null;
  private _cardStylesConfigRef: HADeviceDashboardConfig | null = null;
  private _cardStylesViewRef: string | null = null;
  private _cachedStyleTokens: NonNullable<HADeviceDashboardConfig['style']> | null = null;
  private _styleTokensConfigRef: HADeviceDashboardConfig | null = null;
  private _styleTokensViewRef: string | null = null;

  private static readonly BRIGHTNESS_MAX = 255;

  // ── Lovelace hooks ────────────────────────────────────────────────────────

  static getConfigElement() {
    return document.createElement('ha-device-dashboard-editor');
  }

  static getStubConfig(): HADeviceDashboardConfig {
    // Materialise the factory default look so a fresh card has an explicit,
    // revertible baseline (visually identical to the implicit runtime defaults).
    return { type: 'custom:ha-device-dashboard', ...factoryLook() };
  }

  /** Sections-view sizing. `columns: 'full'` makes the card span the whole
   *  section width — both in the live grid and in the card-editor preview, which
   *  sizes the preview pane from this. These MUST be instance methods: HA calls
   *  them on the card element, so a `static` one is never seen (which is why the
   *  editor preview only filled part of the pane). getGridOptions is the current
   *  API; getLayoutOptions is kept for older HA that predates it. */
  getGridOptions() {
    return { columns: 'full', rows: 'auto', min_columns: 6, min_rows: 4 };
  }

  getLayoutOptions() {
    return { grid_columns: 'full', grid_rows: 'auto', grid_min_columns: 6, grid_min_rows: 3 };
  }

  setConfig(config: HADeviceDashboardConfig) {
    this._config = migrateConfig(config);
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
      changed.has('_graphData') ||
      changed.has('_periodEnergy') ||
      changed.has('_periodEnergyErrAt') ||
      changed.has('_valveDragPos') ||
      changed.has('_trvDragTemp') ||
      changed.has('_detailDevice') ||
      changed.has('_detailHistoryRange') ||
      changed.has('_activeViewId') ||
      changed.has('_cloudDetailOpen') ||
      changed.has('_areaChipOpen') ||
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

    // Input-action targets first: a keypad key's lit state reads an entity that
    // usually belongs to ANOTHER device — or to none the card discovered — so the
    // per-device loop below would never see it change and the key would go stale.
    for (const id of this._inputTargets()) {
      if (oldHass.states[id] !== this.hass.states[id]) return true;
    }

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

  /** Every entity an input action points at — toggle/service targets, dim targets
   *  and select chips. Cached per config object, like the CSS-var map, because
   *  shouldUpdate runs on every hass push. */
  private _inputTargetsRef: HADeviceDashboardConfig | null = null;
  private _cachedInputTargets = new Set<string>();
  private _inputTargets(): Set<string> {
    if (this._inputTargetsRef === this._config) return this._cachedInputTargets;
    const out = new Set<string>();
    for (const ds of Object.values(this._config?.device_styles ?? {})) {
      for (const act of Object.values(ds.input_actions ?? {})) {
        for (const id of entityList(act.entity)) out.add(id);
        for (const id of entityList(act.hold_action?.entity)) out.add(id);
        for (const id of entityList(act.double_tap_action?.entity)) out.add(id);
        if (act.select_chip?.entity) out.add(act.select_chip.entity);
      }
    }
    this._inputTargetsRef = this._config;
    this._cachedInputTargets = out;
    return out;
  }

  getCardSize() { return 6; }

  connectedCallback() {
    super.connectedCallback();
    this._loadActiveView();
    this._loadCustomizations();
  }

  protected willUpdate(): void {
    // Detect HA's edit-dialog live PREVIEW PANE once (ancestors are stable) and
    // flag the host with data-edit-preview. HA's mobile edit dialog stacks the
    // config form over this pane, and the pane sizes to our content (height:
    // max-content) — so we cap our height there (see static styles) to keep the
    // preview from dominating, instead of pushing the whole (tall) dashboard.
    if (this._editPreviewChecked || !this._config) return;
    this._editPreviewChecked = true;
    let inPrev = false;
    try {
      let node: Node | null = this;
      const seen = new Set<Node>();
      for (let i = 0; node && !seen.has(node) && i < 60; i++) {
        seen.add(node);
        const el = node instanceof Element ? node : null;
        const ln = el?.localName ?? '';
        if (ln === 'hui-card-preview' || /element-preview/.test(String(el?.className || ''))) {
          inPrev = true; break;
        }
        node = node.parentNode ?? (node.getRootNode() as ShadowRoot).host ?? null;
      }
    } catch { /* ignore */ }
    this.toggleAttribute('data-edit-preview', inPrev);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // A hold in progress when the card is torn down would keep ramping, and a
    // pending single tap would fire into a dead element.
    this._endInputHold();
    this._clearTapTimers();
    this._graphFetching.clear();
    this._graphFetchedAt.clear();
    this._graphData = new Map();
    if (this._graphCommitTimer != null) {
      clearTimeout(this._graphCommitTimer);
      this._graphCommitTimer = null;
    }
    this._graphCommitPending = null;
    this._periodEnergyFetching.clear();
    this._periodEnergyQueue = [];
    this._periodEnergyInFlight = 0;
    this._periodEnergyPending.clear();
    if (this._periodEnergyCommitTimer != null) {
      clearTimeout(this._periodEnergyCommitTimer);
      this._periodEnergyCommitTimer = null;
    }
    if (this._sensorRenderTimer != null) {
      clearTimeout(this._sensorRenderTimer);
      this._sensorRenderTimer = null;
    }
    if (this._trvBtnTimer != null) {
      clearTimeout(this._trvBtnTimer);
      this._trvBtnTimer = null;
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
    this._profileCache.clear();

    let devices = getAllDevices(this.hass, {
      universal:           this._config.mode === 'universal',
      scope:               this._config.universal_scope,
      includeIntegrations: this._config.include_integrations,
      excludeIntegrations: this._config.exclude_integrations,
      includeDomains:      this._config.include_domains,
      excludeDomains:      this._config.exclude_domains,
    });

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

  /** Memoized device profile — avoids recomputing the domain-set/entity scan
   *  for every tile on every render. Cache is cleared with the device list. */
  private _profile(device: HADevice): DeviceProfileResult {
    let p = this._profileCache.get(device.device_id);
    if (!p) {
      p = getDeviceProfile(device);
      // Per-device profile override (editor "Type" dropdown) wins over detection.
      const override = this._config.device_styles?.[device.device_id]?.profile;
      if (override && override !== p.type) p = { ...p, type: override, label: PROFILE_LABELS[override] };
      this._profileCache.set(device.device_id, p);
    }
    return p;
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
      out = out.filter(d => allow.has(this._profile(d).type));
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

  /** Hydrate per-viewer UI state from localStorage on mount. */
  private _loadCustomizations(): void {
    try { this._delegateNoticeDismissed = localStorage.getItem('hdd:delegateNoticeDismissed') === '1'; } catch { /* ignore */ }
  }

  private _dismissDelegateNotice(): void {
    this._delegateNoticeDismissed = true;
    try { localStorage.setItem('hdd:delegateNoticeDismissed', '1'); } catch { /* ignore */ }
  }


  /**
   * The style tokens the card actually renders with: a named `theme` supplies the
   * base palette and `style` overrides it key-by-key, so `theme: nordic_warm` gets
   * the whole palette without listing 20 colours.
   *
   * `theme` is authoritative and the editor takes the same route as YAML — picking
   * one CLEARS the palette keys from `style`, leaving only colours the user
   * deliberately changed. It used to write the palette in instead, which shadowed
   * the theme on every key and made editing `theme:` by hand do nothing; configs
   * written that way are folded back by `migrateConfig`. 'custom' means "these
   * colours are the theme" and applies no base.
   */
  /** Cache key for anything derived from the active view's look: its theme plus
   *  its card-chrome overrides. Both style caches use this, so they cannot
   *  disagree about which view is in force. */
  private _viewLookKey(): string {
    const view = this._getActiveView();
    return `${cascade.overrideTheme(view ?? undefined) ?? ''}|${view?.style ? JSON.stringify(view.style) : ''}`;
  }

  private _styleTokens(): NonNullable<HADeviceDashboardConfig['style']> {
    const view = this._getActiveView();
    const viewTheme = cascade.overrideTheme(view ?? undefined);
    // Keyed on the view's whole look, not just its theme: two views with no
    // theme but different header colours must not share an entry.
    const viewKey = this._viewLookKey();
    if (this._styleTokensConfigRef === this._config
        && this._styleTokensViewRef === viewKey
        && this._cachedStyleTokens) {
      return this._cachedStyleTokens;
    }
    const explicit = this._config.style ?? {};
    let tokens: NonNullable<HADeviceDashboardConfig['style']>;
    if (viewTheme) {
      // A view theme RE-BASES the palette rather than sitting under `style`:
      // the view is the more specific layer, so it wins on the palette keys, the
      // same way picking a theme in the editor clears them out of `style`. Every
      // non-palette key — radius, gap, fonts, sizes, header geometry — survives,
      // because those are not colours and the view is not claiming them.
      const kept = { ...explicit } as Record<string, unknown>;
      for (const k of THEME_KEYS) delete kept[k];
      tokens = { ...paletteFor(viewTheme), ...kept } as NonNullable<HADeviceDashboardConfig['style']>;
    } else {
      const preset = paletteFor(this._config.theme);
      tokens = preset ? { ...preset, ...explicit } : explicit;
    }
    if (view?.style) tokens = { ...tokens, ...view.style };
    this._styleTokensConfigRef = this._config;
    this._styleTokensViewRef = viewKey;
    this._cachedStyleTokens = tokens;
    return tokens;
  }

  /**
   * Build the card-level CSS variable map from `this._config`.
   * Memoized against config identity — recomputed only when config changes.
   */
  private _buildCardStyles(): Record<string, string> {
    const viewKey = this._viewLookKey();
    if (this._cardStylesConfigRef === this._config
        && this._cardStylesViewRef === viewKey
        && this._cachedCardStyles) {
      return this._cachedCardStyles;
    }
    const st = this._styleTokens();
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
    this._cardStylesViewRef = this._viewLookKey();
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
    // Precompute the sort key once per device (Schwartzian transform) so the
    // comparator doesn't rescan the device's entities on every comparison.
    let comparator: (a: HADevice, b: HADevice) => number;
    if (sortBy === 'power') {
      const powerOf = new Map(devices.map(d => [d.device_id, this._getPower(d) ?? -1]));
      comparator = (a, b) => (powerOf.get(b.device_id)! - powerOf.get(a.device_id)!);
    } else if (sortBy === 'area') {
      // Room name A→Z, then device name inside the room. Devices with no area
      // sort last rather than under an empty-string room.
      const areaOf = new Map(devices.map(d => [d.device_id, d.area || '￿']));
      comparator = (a, b) => areaOf.get(a.device_id)!.localeCompare(areaOf.get(b.device_id)!)
        || a.name.localeCompare(b.name);
    } else if (sortBy === 'online') {
      const onlineOf = new Map(devices.map(d => [d.device_id, this._isOnline(d) ? 1 : 0]));
      comparator = (a, b) => (onlineOf.get(b.device_id)! - onlineOf.get(a.device_id)!) || a.name.localeCompare(b.name);
    } else {
      comparator = (a, b) => a.name.localeCompare(b.name);
    }
    return new Map(
      [...map.entries()]
        .sort(([a], [b]) => {
          if (!a) return 1;
          if (!b) return -1;
          return a.localeCompare(b);
        })
        .map(([area, devs]) => [area, devs.sort(comparator)])
    );
  }

  private _isOnline(device: HADevice): boolean {
    return deviceIsOnline(device, this.hass.states as never);
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

  /** A switch entity that is a device config toggle, not the load relay — e.g.
   *  the Shelly Bluetooth-gateway enable (`aioshelly_ble_integration`). These
   *  must never be treated as the tile's primary on/off. */
  private static _isConfigSwitch(entityId: string): boolean {
    return /aioshelly_ble|ble_integration|bluetooth_gateway/i.test(entityId);
  }

  private _getPrimarySwitch(device: HADevice): {
    entityId: string; isOn: boolean; brightness?: number;
    colorModes?: string[]; rgbColor?: [number, number, number]; whiteValue?: number;
  } | null {
    // Rank candidates so the load relay wins over a config toggle: a light, or a
    // relay-shaped switch id, ranks above a plain switch, which ranks above a
    // config toggle (BLE gateway etc.). Fixes 1PMs that expose both a relay
    // (`_switch_0`, on) and a BLE toggle (`_aioshelly_ble_integration`, off).
    const rank = (e: { domain: string; entity_id: string }): number => {
      if (e.domain === 'light') return 0;
      if (HADeviceDashboard._isConfigSwitch(e.entity_id)) return 3;
      if (/_switch_\d|_relay|_output/i.test(e.entity_id)) return 1;
      return 2;
    };
    const candidates = device.entities
      .filter(e => (e.domain === 'switch' || e.domain === 'light') && this.hass.states[e.entity_id])
      .sort((a, b) => rank(a) - rank(b));
    for (const e of candidates) {
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

  /** Device faults for the tile badge and the detail sheet — the device
   *  complaining about itself. Environmental alarms are a separate list; see
   *  `deviceFaults` / `environmentAlarms` in attention.ts. */
  private _getAlerts(device: HADevice): DeviceAlert[] {
    return deviceFaults(device, this.hass.states as never) as DeviceAlert[];
  }

  private _getFirmware(device: HADevice): FirmwareInfo | null {
    const includeBeta = this._config.include_beta_updates === true;
    for (const e of device.entities) {
      if (e.domain !== 'update') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state !== 'on') continue;
      const attrs = s.attributes as HassAttrs;
      // A Shelly always has a beta on offer; counting it as an update buries the
      // handful of real ones.
      if (!includeBeta && isBetaUpdate(e.entity_id, attrs)) continue;
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
    return cascade.sensorSelection(this._cascade(device));
  }

  private _getSensors(device: HADevice, ignoreSelection = false): SensorChip[] {
    // Selection semantics: undefined = "show all" (no restriction); an empty
    // array = "no chips" (explicit Deselect-all); a list = whitelist.
    const sel = this._sensorSelection(device);
    const allowed = ignoreSelection
      ? null
      : (sel === undefined ? null : new Set(sel));
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

    // A per-device energy_entity override (typically a Utility Meter helper, which
    // is NOT one of the device's own entities) replaces the device's energy chips
    // entirely — otherwise the override would sit alongside the raw sensors it was
    // configured to stand in for.
    const energyOverride = this._config.device_styles?.[device.device_id]?.energy_entity;

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
        else if (dc === 'energy'          && show('energy') && !energyOverride) {
          const c = this._energyChip(device, id, v);
          if (c) push('energy', c.label, c.value, false, id);
        }
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

    // The override's own chip, pushed here because the entity is usually external
    // to the device and so never appears in the loop above.
    if (energyOverride && show('energy')) {
      const os = this.hass.states[energyOverride];
      if (os && os.state !== 'unavailable' && os.state !== 'unknown') {
        const ov = parseFloat(os.state);
        const c = this._energyChip(device, energyOverride, isNaN(ov) ? null : ov);
        // No entityId: it stands for the whole device, so it must not pick up a
        // per-channel label from the multi-channel pre-scan.
        if (c) push('energy', c.label, c.value);
      }
    }
    return result;
  }

  private _getInputChannels(device: HADevice): InputChannel[] {
    return detectInputChannels(device, this.hass.states as any);
  }

  /** The action bound to an input channel, if any. Keyed by entity_id (what the
   *  editor writes); a channel number is accepted for hand-written YAML. */
  private _inputAction(device: HADevice, ch: InputChannel): InputActionConfig | null {
    const map = this._config.device_styles?.[device.device_id]?.input_actions;
    if (!map) return null;
    const cfg = map[ch.entityId] ?? map[String(ch.channel)];
    return cfg && cfg.action !== 'none' ? cfg : null;
  }

  /** Label for the channel's action button — the target's friendly name where we
   *  can resolve one, so a row reads "Hall lights" rather than "script.turn_on". */
  private _inputActionLabel(cfg: InputActionConfig): string {
    if (cfg.label) return cfg.label;
    const entities = entityList(cfg.entity);
    const target = cfg.action === 'perform-action' && cfg.perform_action?.split('.').length === 2
      && !cfg.perform_action.endsWith('.turn_on') && !cfg.perform_action.endsWith('.turn_off')
      ? cfg.perform_action
      : entities[0];
    const friendly = target ? (this.hass.states[target]?.attributes as HassAttrs)?.friendly_name : undefined;
    const base = (friendly as string) ?? target ?? cfg.perform_action ?? 'Run';
    // Several targets on one channel: name the first, count the rest.
    return entities.length > 1 ? `${base} +${entities.length - 1}` : base;
  }

  /** The select-entity dropdown chip on a channel row, if configured. */
  private _inputSelectChip(device: HADevice, ch: InputChannel): {
    entity: string; label?: string; options: string[]; current: string;
  } | null {
    const cfg = this._inputAction(device, ch)?.select_chip;
    if (!cfg?.entity) return null;
    const st = this.hass.states[cfg.entity];
    if (!st) return null;
    const options = ((st.attributes as HassAttrs)?.options as string[] | undefined) ?? [];
    if (!options.length) return null;
    return { entity: cfg.entity, label: cfg.label, options, current: st.state };
  }

  /** Hold-to-dim state. Brightness is tracked locally rather than re-read from
   *  `hass.states` each tick: the state round-trip lags well behind a 200ms ramp,
   *  so reading it back would stutter or reverse the ramp mid-hold. */
  private _holdTimer: number | null = null;
  private _dimTimer: number | null = null;
  /** Key for the direction map — the joined target list, so a channel driving two
   *  lights alternates as one unit. */
  private _dimEntity: string | null = null;
  private _dimTargets: string[] = [];
  private _dimLevel = 0;
  /** Direction the NEXT hold ramps, per light — alternates on release. */
  private _dimDirs = new Map<string, 1 | -1>();
  /** Set once a hold has acted, so the click that follows it is swallowed. */
  private _holdFired = false;

  private _startInputHold(device: HADevice, ch: InputChannel, _e: Event): void {
    const cfg = this._inputAction(device, ch);
    const hold = cfg?.hold_action;
    if (!cfg || !hold || hold.action === 'none') return;
    this._holdFired = false;
    if (this._holdTimer) clearTimeout(this._holdTimer);
    this._holdTimer = window.setTimeout(() => this._beginInputHold(ch, cfg, hold), 400);
  }

  private _beginInputHold(ch: InputChannel, cfg: InputActionConfig, hold: InputHoldConfig): void {
    this._holdTimer = null;
    this._holdFired = true;

    if (hold.action !== 'dim') {
      this._performAction({
        action: hold.action,
        entity: hold.entity ?? cfg.entity,
        perform_action: hold.perform_action,
        data: hold.data,
      }, ch);
      return;
    }

    const targets = entityList(hold.entity ?? cfg.entity);
    if (!targets.length) return;
    // Direction and seed brightness both key off the first target: with several
    // lights on one channel they converge to a common level rather than each
    // ramping from its own.
    const key = targets.join(',');
    const dir = this._dimDirs.get(key) ?? 1;
    const lit = Number((this.hass.states[targets[0]]?.attributes as HassAttrs)?.brightness ?? 0);
    // Ramping up from an off/unknown light starts at the bottom, down starts at full.
    this._dimEntity = key;
    this._dimTargets = targets;
    this._dimLevel = lit > 0 ? lit : (dir > 0 ? MIN_DIM : 255);
    const step = Math.max(1, Math.round((hold.step ?? 5) * 2.55));

    const tick = () => {
      if (!this._dimEntity) return;
      this._dimLevel = Math.max(MIN_DIM, Math.min(255, this._dimLevel + dir * step));
      this.hass.callService('light', 'turn_on', { entity_id: this._dimTargets, brightness: this._dimLevel });
      // Hitting an end stops the ramp; the release still flips direction, so the
      // next hold walks back the other way.
      if (this._dimLevel >= 255 || this._dimLevel <= MIN_DIM) this._stopDim();
    };
    tick();
    this._dimTimer = window.setInterval(tick, hold.interval ?? 200);
  }

  private _stopDim(): void {
    if (this._dimTimer) { clearInterval(this._dimTimer); this._dimTimer = null; }
  }

  private _endInputHold(): void {
    if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }
    if (this._dimEntity) {
      const dir = this._dimDirs.get(this._dimEntity) ?? 1;
      this._dimDirs.set(this._dimEntity, dir > 0 ? -1 : 1);
      this._dimEntity = null;
      this._dimTargets = [];
    }
    this._stopDim();
  }

  /** Live state of a channel's toggle target, for the keypad's lit/off styling.
   *  `null` means "unknowable": only a toggle has a state the card can read, so a
   *  script- or more-info-backed key stays neutral rather than claiming one. */
  private _inputActionState(device: HADevice, ch: InputChannel): 'on' | 'off' | 'unavailable' | null {
    const cfg = this._inputAction(device, ch);
    if (!cfg || cfg.action !== 'toggle') return null;
    const targets = entityList(cfg.entity);
    if (!targets.length) return null;
    let anyKnown = false;
    for (const t of targets) {
      const st = this.hass.states[t];
      if (!st || st.state === 'unavailable' || st.state === 'unknown') continue;
      anyKnown = true;
      // Any target on lights the key — a two-light channel reads as on when
      // either half is lit, which is what the next tap will act on.
      if (st.state === 'on') return 'on';
    }
    return anyKnown ? 'off' : 'unavailable';
  }

  /** Single taps held pending a possible second one, keyed by channel entity id. */
  private _tapTimers = new Map<string, number>();

  private _runInputAction(device: HADevice, ch: InputChannel, e: Event): void {
    e.stopPropagation();
    // A hold already acted — don't also fire the tap action on release.
    if (this._holdFired) { this._holdFired = false; return; }
    const cfg = this._inputAction(device, ch);
    if (!cfg) return;

    const dbl = cfg.double_tap_action;
    // No double action to disambiguate against: fire now, no added latency.
    if (!dbl || dbl.action === 'none') { this._performAction(cfg, ch); return; }

    const pending = this._tapTimers.get(ch.entityId);
    if (pending != null) {
      clearTimeout(pending);
      this._tapTimers.delete(ch.entityId);
      this._performAction({
        action: dbl.action,
        entity: dbl.entity ?? cfg.entity,
        perform_action: dbl.perform_action,
        data: dbl.data,
      }, ch);
      return;
    }
    this._tapTimers.set(ch.entityId, window.setTimeout(() => {
      this._tapTimers.delete(ch.entityId);
      this._performAction(cfg, ch);
    }, DOUBLE_TAP_MS));
  }

  private _clearTapTimers(): void {
    for (const t of this._tapTimers.values()) clearTimeout(t);
    this._tapTimers.clear();
  }

  private _performAction(cfg: InputActionConfig | InputHoldConfig, ch: InputChannel): void {

    if (cfg.action === 'more-info') {
      fireEvent(this as any, 'hass-more-info' as any,
        { entityId: entityList(cfg.entity)[0] ?? ch.entityId } as any);
      return;
    }
    if (cfg.action === 'toggle') {
      const targets = entityList(cfg.entity);
      if (!targets.length) return;
      this.hass.callService('homeassistant', 'toggle', { entity_id: targets });
      return;
    }
    if (cfg.action === 'perform-action' && cfg.perform_action) {
      const [domain, service] = cfg.perform_action.split('.');
      if (!domain || !service) return;
      const data: Record<string, unknown> = { ...(cfg.data ?? {}) };
      const targets = entityList(cfg.entity);
      if (targets.length) data.entity_id = targets;
      this.hass.callService(domain, service, data);
    }
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

  /** Whether tile sparkline graphs are shown for this device — the single gate
   *  every graph path flows through. device → area → global → default (off). */
  private _showGraphs(device: HADevice): boolean {
    return cascade.showGraphs(this._cascade(device));
  }

  private _getGraphEntities(device: HADevice): GraphEntity[] {
    if (!this._showGraphs(device)) return [];
    // Normalize to device_class keys so legacy 'co2'/'rssi' configs still match.
    // Unset (never configured) falls back to a sensible default set; an explicit
    // empty list ([]) is honoured as "no graphs".
    const dcList = (this._config.graph_sensors ?? DEFAULT_GRAPH_SENSORS).map(normalizeGraphKey);
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
  private _fetchInFlight = 0;
  /** Fetch several history series at once. A graph-heavy view (e.g. a
   *  dedicated Graphs view with 100+ sparklines) would otherwise trickle in
   *  one request at a time and take tens of seconds to fully populate. */
  private readonly _maxConcurrentFetch = 6;

  /** Compound key for graph data cache: entityId::hours */
  private _gk(entityId: string, hours: number): string { return `${entityId}::${hours}`; }

  /** Derived live-appended series, memoised per (entityId, hours). Keyed on
   *  the cached history array's identity plus the state's last_updated, so a
   *  render where nothing changed returns the SAME array — array identity and
   *  byte-identical SVG attribute strings are what let Lit skip rewriting
   *  every sparkline on the fleet each throttled render. */
  private _liveSeriesCache = new Map<string, {
    src: Array<{ t: number; v: number }>; lu: string; out: Array<{ t: number; v: number; live?: boolean }>;
  }>();

  /** History series with the live state appended as a final "now" point.
   *  The 24h series is statistics rows — 5-minute MEANS — and the cache holds
   *  them for up to 5 minutes, so a graph's end always sits slightly behind
   *  (and smoothed away from) the live reading the sensor chips show: the same
   *  device read 64.4 °C on its chip and 64.2 °C at the end of its graph.
   *  Pinning the line's end to the live state makes the graph's value label
   *  agree with the rest of the tile.
   *
   *  The point is stamped with the state's last_updated (stable between state
   *  changes, unlike Date.now(), which shifted every x coordinate on every
   *  render) and marked `live: true` so scaling code can exclude an
   *  instantaneous reading from a mean-based series' min/max. The history
   *  cache is never mutated. */
  private _seriesWithLive(
    entityId: string,
    hours: number,
  ): Array<{ t: number; v: number; live?: boolean }> | undefined {
    const points = this._graphData.get(this._gk(entityId, hours));
    if (!points?.length) return points;
    const st = this.hass.states[entityId];
    const v = parseFloat(st?.state ?? '');
    if (isNaN(v)) return points;
    const t = Date.parse(st.last_updated ?? '') || 0;
    if (!(t > points[points.length - 1].t)) return points;
    const key = this._gk(entityId, hours);
    const hit = this._liveSeriesCache.get(key);
    if (hit && hit.src === points && hit.lu === st.last_updated) return hit.out;
    const out = [...points, { t, v, live: true }];
    this._liveSeriesCache.set(key, { src: points, lu: st.last_updated, out });
    return out;
  }

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
    while (this._fetchInFlight < this._maxConcurrentFetch && this._fetchQueue.length > 0) {
      const next = this._fetchQueue.shift()!;
      this._fetchInFlight++;
      void this._fetchGraphData(next).finally(() => {
        this._fetchInFlight--;
        this._drainFetchQueue();
      });
    }
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

  // ── Period energy (today/week/month consumption from recorder statistics) ──

  /** Resolve the energy window for a device: device → area → global → 'total'. */
  /** device → type → room → view → global → lifetime total. Carries the same
   *  layers as every other per-device setting; it used to skip type and view. */
  private _energyPeriod(device: HADevice): EnergyPeriod {
    return cascade.energyPeriod(this._cascade(device));
  }

  /** The entities whose energy values make up this device's consumption — the
   *  per-device override (e.g. a Utility Meter) if set, otherwise **every** energy
   *  sensor on the device. All of them: a Shelly Pro 4PM exposes one per channel,
   *  and taking only the first under-counts the device fourfold. */
  private _energyEntitiesFor(device: HADevice): string[] {
    const override = this._config.device_styles?.[device.device_id]?.energy_entity;
    if (override) return [override];
    return device.entities
      .filter(e => e.domain === 'sensor' &&
        (this.hass.states[e.entity_id]?.attributes as HassAttrs)?.device_class === 'energy')
      .map(e => e.entity_id);
  }

  /** How long a fetched period value stays fresh, and how long a failed fetch is
   *  left alone before we try again. Without the error backoff a broken entity
   *  re-fires the WS call on every render (~every 2s, forever). */
  private static readonly PERIOD_ENERGY_TTL = 5 * 60_000;
  private static readonly PERIOD_ENERGY_RETRY = 60_000;

  /** The timezone the recorder buckets statistics in — HA's, not the browser's. */
  private _statsTimeZone(): string {
    return (this.hass as any)?.config?.time_zone
      || Intl.DateTimeFormat().resolvedOptions().timeZone
      || 'UTC';
  }

  /** Offset (ms) of `tz` from UTC at instant `at`: format the instant as wall-clock
   *  in `tz`, then read those digits back as if they were UTC. */
  private _tzOffsetMs(tz: string, at: Date): number {
    const parts: Record<string, string> = {};
    for (const p of new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(at)) parts[p.type] = p.value;
    const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day,
      +parts.hour % 24, +parts.minute, +parts.second);
    return asUTC - at.getTime() + (at.getTime() % 1000);
  }

  /** The instant at which midnight of `y-m-d` occurs in `tz`. Resolved twice: the
   *  offset that applies *at* the boundary can differ from the one now (DST). */
  private _zonedMidnight(tz: string, y: number, m: number, d: number): Date {
    const wall = Date.UTC(y, m, d);
    let ts = wall - this._tzOffsetMs(tz, new Date(wall));
    ts = wall - this._tzOffsetMs(tz, new Date(ts));
    return new Date(ts);
  }

  /** Start of the current day/week(Mon)/month **in HA's timezone**. Recorder
   *  buckets align to that zone, and `statistics_during_period` drops any bucket
   *  starting before `start_time` — so a browser-local boundary east of HA's
   *  would silently exclude the current bucket (Today stuck at 0.000 kWh). */
  private _periodStart(period: EnergyPeriod): { start: Date; stat: 'day' | 'week' | 'month' } | null {
    if (period === 'total') return null;
    const tz = this._statsTimeZone();
    // "Now" as wall-clock in HA's zone, so day/month arithmetic happens there.
    const nowWall = new Date(Date.now() + this._tzOffsetMs(tz, new Date()));
    const y = nowWall.getUTCFullYear(), m = nowWall.getUTCMonth(), d = nowWall.getUTCDate();
    if (period === 'today') return { start: this._zonedMidnight(tz, y, m, d), stat: 'day' };
    if (period === 'month') return { start: this._zonedMidnight(tz, y, m, 1), stat: 'month' };
    if (period === 'week') {
      const dow = (nowWall.getUTCDay() + 6) % 7; // 0 = Monday
      return { start: this._zonedMidnight(tz, y, m, d - dow), stat: 'week' };
    }
    return null;
  }

  /** Display label for an energy window. */
  private _energyPeriodLabel(period: EnergyPeriod): string {
    return period === 'today' ? 'Today' : period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'Energy';
  }

  /** Label + value for one energy chip, resolved through the device's energy
   *  window. The single place that decides period-vs-total presentation, so tiles,
   *  room headers, card headers and the detail sheet can't drift apart: a failed
   *  statistics call degrades to `liveKwh` under the plain "Energy" label, and a
   *  pending one shows '…' rather than a wrong number.
   *  `liveKwh` is the entity's lifetime total (null if it has no usable state). */
  private _energyChip(device: HADevice, entityId: string, liveKwh: number | null): { label: string; value: string } | null {
    const period = this._energyPeriod(device);
    const total = liveKwh == null ? null : { label: 'Energy', value: formatEnergy(liveKwh) };
    if (period === 'total') return total;
    const pe = this._periodEnergyValue(entityId, period);
    if (pe.failed) return total;
    if (pe.kwh == null) return { label: this._energyPeriodLabel(period), value: '…' };
    return { label: this._energyPeriodLabel(period), value: formatEnergy(pe.kwh) };
  }

  /** Cached period-energy for an entity. `kwh` is null until the first fetch
   *  lands; `failed` means the statistics call errored and the caller should fall
   *  back to the live lifetime total rather than showing a permanent '…'.
   *  `total` is handled by the caller (uses the live state). */
  private _periodEnergyValue(entityId: string, period: EnergyPeriod): { kwh: number | null; failed: boolean } {
    if (period === 'total') return { kwh: null, failed: false };
    const key = `${entityId}|${period}`;
    const cached = this._periodEnergy.get(key) ?? null;
    if (cached != null && Date.now() - (this._periodEnergyAt.get(key) ?? 0) < HADeviceDashboard.PERIOD_ENERGY_TTL) {
      return { kwh: cached, failed: false };
    }
    const errAge = Date.now() - (this._periodEnergyErrAt.get(key) ?? 0);
    if (this._periodEnergyErrAt.has(key) && errAge < HADeviceDashboard.PERIOD_ENERGY_RETRY) {
      // Backing off. Show the last good value if we have one, else tell the
      // caller to fall back to the live total.
      return { kwh: cached, failed: cached == null };
    }
    this._requestPeriodEnergy(entityId, period);
    return { kwh: cached, failed: false };
  }

  /** Enqueue a period-energy fetch (deduped); drains under a concurrency cap. */
  private _requestPeriodEnergy(entityId: string, period: EnergyPeriod): void {
    const key = `${entityId}|${period}`;
    if (this._periodEnergyFetching.has(key) || this._periodEnergyQueue.includes(key)) return;
    this._periodEnergyQueue.push(key);
    this._drainPeriodEnergyQueue();
  }

  private _drainPeriodEnergyQueue(): void {
    while (this._periodEnergyInFlight < this._maxPeriodEnergyFetch && this._periodEnergyQueue.length > 0) {
      const key = this._periodEnergyQueue.shift()!;
      this._periodEnergyInFlight++;
      void this._fetchPeriodEnergy(key).finally(() => {
        this._periodEnergyInFlight--;
        this._drainPeriodEnergyQueue();
      });
    }
  }

  /** Buffer a resolved value and schedule ONE reactive commit for the batch, so a
   *  burst of resolutions is a single render, not one per fetch. */
  private _commitPeriodEnergy(key: string, kwh: number): void {
    this._periodEnergyAt.set(key, Date.now());
    this._periodEnergyPending.set(key, kwh);
    if (this._periodEnergyCommitTimer != null) return;
    this._periodEnergyCommitTimer = window.setTimeout(() => {
      this._periodEnergyCommitTimer = null;
      if (!this._periodEnergyPending.size) return;
      const next = new Map(this._periodEnergy);
      for (const [k, v] of this._periodEnergyPending) next.set(k, v);
      this._periodEnergyPending.clear();
      this._periodEnergy = next; // single reassignment → one render for the burst
    }, 120);
  }

  private async _fetchPeriodEnergy(key: string): Promise<void> {
    if (this._periodEnergyFetching.has(key)) return;
    const sep = key.lastIndexOf('|');
    const entityId = key.slice(0, sep);
    const period = key.slice(sep + 1) as EnergyPeriod;
    const age = Date.now() - (this._periodEnergyAt.get(key) ?? 0);
    if (age < HADeviceDashboard.PERIOD_ENERGY_TTL && this._periodEnergy.has(key)) return;
    const errAge = Date.now() - (this._periodEnergyErrAt.get(key) ?? 0);
    if (this._periodEnergyErrAt.has(key) && errAge < HADeviceDashboard.PERIOD_ENERGY_RETRY) return;
    const ps = this._periodStart(period);
    if (!ps) return;
    this._periodEnergyFetching.add(key);
    try {
      const rows = await (this.hass as any).callWS({
        type: 'recorder/statistics_during_period',
        start_time: ps.start.toISOString(),
        statistic_ids: [entityId],
        period: ps.stat,
        types: ['change'],
      }) as Record<string, Array<{ change?: number | null }>>;
      const change = (rows?.[entityId] ?? []).reduce((a, r) => a + (r.change ?? 0), 0);
      if (this._periodEnergyErrAt.delete(key)) this._periodEnergyErrAt = new Map(this._periodEnergyErrAt);
      this._commitPeriodEnergy(key, change);
    } catch {
      // Stamp the failure so we back off instead of re-firing every render; the
      // caller falls back to the live total meanwhile.
      const next = new Map(this._periodEnergyErrAt);
      next.set(key, Date.now());
      this._periodEnergyErrAt = next;
    } finally {
      this._periodEnergyFetching.delete(key);
    }
  }

  /** Upper bound on cached series (entities × ranges). Opening the detail
   *  sheet on many devices across 24h/7d/30d would otherwise retain every
   *  series for the whole session.
   *
   *  MUST stay comfortably above the number of series a single view can show at
   *  once. When the cap was 160 and the "All" view demanded ~168 sparklines, the
   *  cache thrashed: every render evicted a *visible* series (its graph vanished,
   *  shrinking that tile) to fetch another, then re-demanded the evicted one next
   *  render — a perpetual appear/disappear that resized tiles and made the whole
   *  view jump. 512 covers a large Shelly fleet on one screen with headroom. */
  private readonly _graphDataCap = 512;

  /** Evict least-recently-fetched series until under the cap. Never evicts
   *  the key just written or one currently in flight. */
  private _capGraphMap(map: Map<string, Array<{ t: number; v: number }>>, protectKey: string) {
    while (map.size > this._graphDataCap) {
      let oldestKey: string | null = null;
      let oldestAt = Infinity;
      for (const k of map.keys()) {
        if (k === protectKey || this._graphFetching.has(k)) continue;
        const at = this._graphFetchedAt.get(k) ?? 0;
        if (at < oldestAt) { oldestAt = at; oldestKey = k; }
      }
      if (!oldestKey) break;
      map.delete(oldestKey);
      this._graphFetchedAt.delete(oldestKey);
    }
  }

  // Coalesce graph-data writes. Each finished series used to reassign
  // `_graphData` immediately, and since shouldUpdate() re-renders on any
  // _graphData change, a view with ~160 sparklines produced ~160 full card
  // re-renders as fetches trickled in — a visible top-to-bottom render sweep.
  // Instead we stage completed series into a pending map and commit once per
  // window, collapsing a fetch burst into one render.
  private _graphCommitPending: Map<string, Array<{ t: number; v: number }>> | null = null;
  private _graphCommitTimer: number | null = null;
  private readonly _graphCommitWindowMs = 150;

  private _commitGraphPoints(key: string, points: Array<{ t: number; v: number }>) {
    const work = this._graphCommitPending ?? new Map(this._graphData);
    work.set(key, points);
    this._capGraphMap(work, key);
    this._graphCommitPending = work;
    if (this._graphCommitTimer == null) {
      this._graphCommitTimer = window.setTimeout(() => {
        this._graphCommitTimer = null;
        const w = this._graphCommitPending;
        this._graphCommitPending = null;
        if (w) this._graphData = w; // single reassignment → one render for the burst
      }, this._graphCommitWindowMs);
    }
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
      this._commitGraphPoints(key, points);
    } catch (err) {
      console.warn('[ha-device-dashboard] history fetch failed', entityId, err);
      this._commitGraphPoints(key, []);
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
    const barRadius = gs.bar_radius ?? 1.5;
    // 'area' type always fills; 'line' type never fills; 'bar' type is separate
    const fill = graphType === 'area';
    const graphHours = hours ?? this._config.graph_hours ?? 24;
    const tickMs = graphHours <= 1 ? 60_000 : graphHours <= 5 ? 120_000 : 300_000;
    const sensorColors = this._config.graph_sensor_colors ?? {};
    const globalColor = this._config.graph_line_color;
    const pad = 4;

    const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Key each row by entityId so Lit tracks row identity across renders as
    // history arrives (loading → data).
    const rowData = entities.map((e) => {
      const points = this._seriesWithLive(e.entityId, graphHours);
      this._requestGraphData(e.entityId, graphHours);  // no-op if already fetched/fetching
      return { e, points };
    });
    const rows = repeat(rowData, (r) => r.e.entityId, ({ e, points }) => {
      const { entityId, label, unit, dc } = e;
      const lineColor = sensorColors[dc] ?? globalColor ?? GRAPH_SENSOR_DEFS.find(s => s.key === dc)?.defaultColor ?? '#f4601e';

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
      // Scale off the history only: the appended live point is an instantaneous
      // reading against 5-minute means, and letting it set the range would
      // flatten the whole series exactly when a load spikes. It still draws
      // (clipped at the edge if it exceeds the range) and still sets the label.
      const histVals = points.filter(p => !(p as { live?: boolean }).live).map(p => p.v);
      const srng = (this._config.graph_style?.sensor_ranges ?? {})[dc] ?? {};
      const min = srng.min ?? Math.min(...histVals);
      const max = srng.max ?? Math.max(...histVals);
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

      // Peak/min dots mark the actual data extremes — NOT the configured
      // y-axis range (srng.min/max), which usually isn't a literal data value,
      // so vals.indexOf(range bound) would be -1 and points[-1] would throw.
      const dataMax = Math.max(...histVals), dataMin = Math.min(...histVals);
      let maxIdx = vals.indexOf(dataMax), minIdx = vals.indexOf(dataMin);
      if (maxIdx < 0) maxIdx = 0;
      if (minIdx < 0) minIdx = 0;
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
                      return svg`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, bh).toFixed(1)}" rx="${barRadius}" fill="${lineColor}" opacity="0.75"/>`;
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
  /** Blocks a tile is built from, in force for this device. THE cascade — one
   *  place so the layout can't drift.
   *
   *  Specific wins: device → device-type → the saved custom style → that style's
   *  preset → global → the profile's built-in blocks. Areas have no tile_layout. */
  private _blockLayout(device: HADevice, profile: DeviceProfileResult): TileLayout {
    return cascade.blockLayout(this._cascade(device, profile));
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
    const tSpan = (maxTemp - minTemp) || 1;  // guard against a TRV reporting min === max
    const displayRatio = Math.max(0, Math.min(1, (display - minTemp) / tSpan));
    const toAngle = (v: number) => 210 + ((v - minTemp) / tSpan) * 300;
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
      const detach = () => {
        svgEl.removeEventListener('pointermove', onMove);
        svgEl.removeEventListener('pointerup', onUp);
        svgEl.removeEventListener('pointercancel', onCancel);
      };
      const onUp = (ev: PointerEvent) => {
        const t = this._trvTempFromEvent(ev, svgEl, minTemp, maxTemp, step) ?? this._trvDragTemp;
        this._trvDragTemp = null;
        if (t != null) this._setTemp(entityId, t);
        detach();
      };
      // A cancelled gesture (mobile scroll, OS interruption) must clear the drag
      // preview and detach — otherwise the dial sticks on a stale target.
      const onCancel = () => { this._trvDragTemp = null; detach(); };
      svgEl.addEventListener('pointermove', onMove);
      svgEl.addEventListener('pointerup', onUp);
      svgEl.addEventListener('pointercancel', onCancel);
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
    if (!rect.width || !rect.height) return null;  // hidden/zero-size element
    const cx = 80, cy = 70;
    const x = (e.clientX - rect.left) * (160 / rect.width);
    const y = (e.clientY - rect.top)  * (132 / rect.height);
    let deg = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    const arcDeg = (deg - 210 + 360) % 360;
    if (arcDeg > 300) return null; // in the gap at the bottom
    const raw = min + (arcDeg / 300) * (max - min);
    const s = step || 0.5;  // guard against a device reporting step 0
    return Math.max(min, Math.min(max, Math.round(raw / s) * s));
  }

  private _valvePosFromEvent(e: PointerEvent, svg: SVGSVGElement): number | null {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;  // hidden/zero-size element
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
      const detach = () => {
        svgEl.removeEventListener('pointermove', onMove);
        svgEl.removeEventListener('pointerup', onUp);
        svgEl.removeEventListener('pointercancel', onCancel);
      };
      const onUp = (ev: PointerEvent) => {
        const pct = this._valvePosFromEvent(ev, svgEl) ?? this._valveDragPos;
        this._valveDragPos = null;
        if (pct != null) this._setValvePosition(vc.entityId, pct, vc.numEntityId);
        detach();
      };
      const onCancel = () => { this._valveDragPos = null; detach(); };
      svgEl.addEventListener('pointermove', onMove);
      svgEl.addEventListener('pointerup', onUp);
      svgEl.addEventListener('pointercancel', onCancel);
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
    profile: DeviceProfileResult,
    ctx?: TileCtx,
  ): TemplateResult {
    const c = ctx ?? this._buildTileCtx(device, profile, this._tileAccent(device, device.area ?? ''));
    return renderBlockTile(c, blockId);
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
    temp: number | null; energy: number | null; energyLabel: string;
    rssi: number | null; uptime: number | null;
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

    // Energy honours the device's window and entity override, same as the chips —
    // otherwise a power-monitor tile shows a lifetime total next to a "Today" chip.
    let energyLabel = 'Energy';
    const eOverride = this._config.device_styles?.[device.device_id]?.energy_entity;
    if (eOverride) {
      const os = this.hass.states[eOverride];
      const ov = os && os.state !== 'unavailable' && os.state !== 'unknown' ? parseFloat(os.state) : NaN;
      energy = isNaN(ov) ? null : ov;
    }
    const ePeriod = this._energyPeriod(device);
    if (ePeriod !== 'total') {
      const eid = eOverride ?? this._energyEntitiesFor(device)[0];
      if (eid) {
        const pe = this._periodEnergyValue(eid, ePeriod);
        // Failure keeps the lifetime total under the plain label; a pending fetch
        // hides the value rather than showing a total labelled "Today".
        if (!pe.failed) {
          energy = pe.kwh;
          energyLabel = this._energyPeriodLabel(ePeriod);
        }
      }
    }
    return { power, voltage, current, temp, energy, energyLabel, rssi, uptime };
  }

  // ── Header stat chips ───────────────────────────────────────────────────────

  /** Everything worth raising on a device: its own faults plus environmental
   *  alarms. Used by the header chip and its detail list. */
  private _deviceAlertLabels(device: HADevice): string[] {
    const st = this.hass.states as never;
    return [...deviceFaults(device, st), ...environmentAlarms(device, st)];
  }

  /** What the Lights chip counts beyond `light` entities. */
  private _lightOpts() {
    return { labels: this._config.light_labels, entities: this._config.light_entities };
  }

  /** Per-device value for a header chip metric. null = device doesn't report it. */
  private _deviceMetric(device: HADevice, key: string): number | null {
    if (key === 'power') return this._getPower(device);
    if (key === 'energy') return this._deviceEnergy(device).value;
    const DC_KEYS: Record<string, string> = {
      temperature: 'temperature', humidity: 'humidity', illuminance: 'illuminance',
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

  /** A device's total energy: every energy sensor summed (or the override alone),
   *  in the device's own window. `period` is what the value actually represents,
   *  which is 'total' whenever statistics aren't usable — callers aggregating
   *  across devices need that to know whether the numbers are commensurable. */
  private _deviceEnergy(device: HADevice): { value: number | null; period: EnergyPeriod } {
    const ids = this._energyEntitiesFor(device);
    if (!ids.length) return { value: null, period: 'total' };
    const period = this._energyPeriod(device);
    if (period === 'total') return { value: this._deviceEnergyLifetime(device), period: 'total' };
    let sum = 0, got = false;
    for (const id of ids) {
      const pe = this._periodEnergyValue(id, period);
      if (pe.failed) return { value: this._deviceEnergyLifetime(device), period: 'total' };
      if (pe.kwh != null) { sum += pe.kwh; got = true; }
    }
    return got ? { value: sum, period } : { value: null, period };
  }

  /** A device's lifetime energy total — every energy sensor's live state summed. */
  private _deviceEnergyLifetime(device: HADevice): number | null {
    let sum = 0, got = false;
    for (const id of this._energyEntitiesFor(device)) {
      const s = this.hass.states[id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
      const v = parseFloat(s.state);
      if (!isNaN(v)) { sum += v; got = true; }
    }
    return got ? sum : null;
  }

  /** Card-header Energy across the fleet. Devices can land on different windows —
   *  per-device or per-area overrides, or a failed statistics call dropping one
   *  back to its lifetime total. Adding "Today" kWh to lifetime kWh would be a
   *  meaningless number, so a mixed fleet drops every device to its lifetime
   *  total and says so with the plain "Energy" label. */
  private _headerEnergyAgg(devices: HADevice[]): { value: number; label: string } | null {
    const per = devices.map(d => ({ d, e: this._deviceEnergy(d) })).filter(x => x.e.value != null);
    if (!per.length) return null;
    const periods = new Set(per.map(x => x.e.period));
    if (periods.size === 1) {
      const p = [...periods][0];
      return { value: per.reduce((a, x) => a + x.e.value!, 0), label: this._energyPeriodLabel(p) };
    }
    let sum = 0, got = false;
    for (const { d } of per) {
      const lt = this._deviceEnergyLifetime(d);
      if (lt != null) { sum += lt; got = true; }
    }
    return got ? { value: sum, label: 'Energy' } : null;
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
      .filter(d => hasUpdate(d, this.hass.states as never, { includeBeta: this._config.include_beta_updates }))
      .map(d => ({ device: d, fw: this._getFirmware(d)! }))
      .filter((x): x is { device: HADevice; fw: FirmwareInfo } => !!x.fw);
  }

  /** Aggregate all selected numeric-metric chips in ONE pass over devices —
   *  each device's entities are scanned once, not once per metric chip. */
  private _headerMetricAggs(devices: HADevice[], keys: string[]): Map<string, { sum: number; count: number }> {
    const DC: Record<string, string> = { temperature: 'temperature', humidity: 'humidity', illuminance: 'illuminance' };
    const dcKeys = keys.filter(k => DC[k]);
    const wantPower = keys.includes('power');
    const wantRssi = keys.includes('rssi');
    // Energy is aggregated by _headerEnergyAgg instead: it sums every sensor on a
    // device (not the first match this loop uses) and each device carries its own
    // window, so it can't share this pass.
    const agg = new Map<string, { sum: number; count: number }>();
    const add = (k: string, v: number) => {
      const a = agg.get(k) ?? { sum: 0, count: 0 };
      a.sum += v; a.count++; agg.set(k, a);
    };
    for (const d of devices) {
      if (wantPower) { const p = this._getPower(d); if (p != null) add('power', p); }
      if (!dcKeys.length && !wantRssi) continue;
      const seen = new Set<string>();  // first match per device, matching _deviceMetric semantics
      for (const e of d.entities) {
        if (e.domain !== 'sensor') continue;
        const s = this.hass.states[e.entity_id];
        if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
        const v = parseFloat(s.state); if (isNaN(v)) continue;
        const dc = (s.attributes as HassAttrs).device_class as string ?? '';
        if (wantRssi && !seen.has('rssi') && (dc === 'signal_strength' || e.entity_id.includes('rssi'))) { seen.add('rssi'); add('rssi', v); }
        for (const k of dcKeys) { if (!seen.has(k) && dc === DC[k]) { seen.add(k); add(k, v); } }
      }
    }
    return agg;
  }

  /** Header stat chips — each clickable, opening a high→low device list for its metric. */
  private _renderHeaderChips(devices: HADevice[]): TemplateResult {
    const selected = this._config.header_chips ?? DEFAULT_HEADER_CHIPS;
    const online = devices.filter(d => this._isOnline(d)).length;
    const metricAggs = this._headerMetricAggs(devices, selected);
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
            // Faults AND alarms: a smoke detector going off not raising the
            // alert count was indefensible once both were being computed.
            const n = devices.filter(d => this._deviceAlertLabels(d).length > 0).length;
            if (!n) return nothing;
            text = `⚠ ${n}`; cls = 'alerts-count';
          } else if (key === 'updates') {
            const n = this._devicesWithUpdates(devices).length;
            if (!n) return nothing;
            text = `⬆ ${n} update${n > 1 ? 's' : ''}`; cls = 'updates-count';
          } else if (key === 'lights') {
            const { on, total } = lightCounts(devices, this.hass.states as never, this._lightOpts());
            if (!total) return nothing;
            text = `${on}/${total} lights on`;
            cls = on ? 'lights-on' : 'metric';
          } else if (key === 'energy') {
            const e = this._headerEnergyAgg(devices);
            if (!e) return nothing;
            text = `${e.label} ${this._formatHeaderMetric('energy', e.value)}`;
          } else {
            const a = metricAggs.get(key);
            if (!a || !a.count) return nothing;
            const v = def.agg === 'sum' ? a.sum : a.sum / a.count;
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
        .map(d => ({ d, a: this._deviceAlertLabels(d) }))
        .filter(x => x.a.length)
        .sort((a, b) => b.a.length - a.a.length)
        .map(x => ({ name: x.d.name, value: x.a.join(', ') }));
      hdrCls = 'cloud-off';
    } else if (key === 'updates') {
      rows = this._devicesWithUpdates(devices)
        .map(x => ({ name: x.device.name, value: `${x.fw.current} → ${x.fw.newVersion}` }));
    } else if (key === 'lights') {
      // Which ones are on — the useful follow-up to the count.
      rows = lightCounts(devices, this.hass.states as never, this._lightOpts())
        .onNames.map(n => ({ name: n, value: 'on' }));
    } else {
      rows = devices
        .map(d => ({ d, v: this._deviceMetric(d, key) }))
        .filter((x): x is { d: HADevice; v: number } => x.v != null)
        .sort((a, b) => b.v - a.v)
        .map(x => ({ name: x.d.name, value: this._formatHeaderMetric(key, x.v) }));
    }
    if (!rows.length) return html``;
    // The energy rows carry whatever window each device resolved to, so the
    // heading has to name it too rather than always saying "Energy".
    const hdrLabel = key === 'energy' ? (this._headerEnergyAgg(devices)?.label ?? def.label) : def.label;
    return html`
      <div class="cloud-detail" @click=${(e: Event) => e.stopPropagation()}>
        <div class="cloud-detail-hdr ${hdrCls}">● ${hdrLabel} — ${rows.length} device${rows.length > 1 ? 's' : ''}</div>
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
    const profClr = this._profileStyle(device)?.color;
    if (profClr) return profClr;
    const areaStyle = this._config.area_styles?.[areaLabel];
    if (areaStyle?.accentColor) return areaStyle.accentColor;
    return this._styleTokens().accent_color ?? 'var(--sc-accent)';
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
    // Build ONE shared ctx for the sub-blocks below (lazily — only if one is
    // shown) instead of rebuilding it inside every _renderBlock call.
    let _lctx: TileCtx | null = null;
    const lctx = () => (_lctx ??= this._buildTileCtx(device, profile, this._tileAccent(device, device.area ?? '')));

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
        ${renderEffectPicker(effectList, currentEffect,
          fx => this.hass.callService('light', 'turn_on', { entity_id: sw!.entityId, effect: fx }))}
      </div>
    ` : nothing;

    // ── TRV dial ─────────────────────────────────────────────────
    const trvBlock = trv ? html`
      <div class="ts-lower-section ts-lower-trv" @click=${(e: Event) => e.stopPropagation()}>
        ${this._renderBlock('trv_control', device, profile, lctx())}
      </div>
    ` : nothing;

    // ── Valve controls ───────────────────────────────────────────
    const valveBlock = valve ? html`
      <div class="ts-lower-section ts-lower-valve" @click=${(e: Event) => e.stopPropagation()}>
        ${this._renderBlock('valve_controls', device, profile, lctx())}
      </div>
    ` : nothing;

    // ── Cover controls ───────────────────────────────────────────
    const coverBlock = cover ? html`
      <div class="ts-lower-section ts-lower-cover" @click=${(e: Event) => e.stopPropagation()}>
        ${this._renderBlock('cover_controls', device, profile, lctx())}
      </div>
    ` : nothing;

    // ── Relay channels (multi-channel devices) ───────────────────
    const relayEnts = device.entities.filter(e =>
      e.domain === 'switch' && /_(switch|relay|channel)_\d/.test(e.entity_id)
    );
    const relayBlock = relayEnts.length > 1 ? html`
      <div class="ts-lower-section ts-lower-relay" @click=${(e: Event) => e.stopPropagation()}>
        ${this._renderBlock('relay_channels', device, profile, lctx())}
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
    return this._seriesWithLive(powerEnt.entity_id, this._config.graph_hours ?? 24) ?? [];
  }
  // ── Style resolution helpers ─────────────────────────────────────────────

  /** Remap legacy style names to new purposeful names */
  private _resolveStyle(raw: TileStyle | undefined, _profile: DeviceProfileResult): { style: TileStyle; variant: PowerMonitorVariant } {
    return cascade.resolveStyle(raw);
  }

  /** Per-device-TYPE style overrides for this device's profile (the "all relays"
   *  layer). Sits one rung below device_styles in every cascade. */
  private _profileStyle(device: HADevice) {
    return this._config.profile_styles?.[this._profile(device).type];
  }

  /** Inputs for the pure cascade resolvers in `cascade.ts`. The viewer's own
   *  localStorage tweaks are applied by the callers, not there. */
  private _cascade(device: HADevice, profile?: DeviceProfileResult): cascade.CascadeInput {
    return {
      config: this._config,
      device,
      profile: (profile ?? this._profile(device)).type,
      view: this._getActiveView() ?? undefined,
    };
  }

  /** Resolve a raw style to its base built-in style + the custom def if it was a
   *  `custom:<key>`. */
  private _resolveCustomStyle(raw: TileStyle | undefined): { base: TileStyle | undefined; custom?: CustomStyleDef } {
    return cascade.resolveCustomStyle(this._config, raw);
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
    // Per-ctx memo: a fresh ctx is built once per tile per render, so caching
    // here collapses the repeated getX(device) calls each block/renderer makes
    // (renderBlockTile re-derives all of these at the top of every block).
    const memo = <T,>(fn: (d: HADevice) => T): ((d: HADevice) => T) => {
      const cache = new Map<string, T>();
      return (d: HADevice) => {
        if (cache.has(d.device_id)) return cache.get(d.device_id)!;
        const v = fn(d); cache.set(d.device_id, v); return v;
      };
    };
    const getPrimarySwitch = memo((d: HADevice) => this._getPrimarySwitch(d));
    const online = this._isOnline(device);
    const sw = getPrimarySwitch(device);
    const isOn = sw?.isOn ?? false;
    // Per-element visibility for this tile's style: device → area → style preset →
    // the element's default from STYLE_ELEMENTS (opt-in elements declare
    // `def: false` there — the one table owns the default, not the call sites).
    const _cin = this._cascade(device, profile);
    const showEl = (id: string): boolean => cascade.elementVisible(_cin, id);
    return {
      showEl,
      hass: this.hass,
      config: this._config,
      device,
      profile,
      accent,
      online,
      isOn,
      getPrimarySwitch,
      getTrv: memo((d) => this._getTrv(d)),
      getCover: memo((d) => this._getCover(d)),
      getValve: memo((d) => this._getValve(d)),
      getPower: memo((d) => this._getPower(d)),
      tileSensors: memo((d) => this._tileSensors(d)),
      getGraphEntities: memo((d) => this._getGraphEntities(d)),
      getPowerSparks: memo((d) => this._getPowerSparks(d)),
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
      getInputChannels: memo((d) => this._getInputChannels(d)),
      getInputActionLabel: (d, ch) => {
        const cfg = this._inputAction(d, ch);
        return cfg ? this._inputActionLabel(cfg) : null;
      },
      inputHasHold: (d, ch) => {
        const hold = this._inputAction(d, ch)?.hold_action;
        return !!hold && hold.action !== 'none';
      },
      getInputActionState: (d, ch) => this._inputActionState(d, ch),
      getInputSelectChip: (d, ch) => this._inputSelectChip(d, ch),
      setInputSelectOption: (entityId, option) =>
        this.hass.callService('select', 'select_option', { entity_id: entityId, option }),
      runInputAction: (d, ch, e) => this._runInputAction(d, ch, e),
      startInputHold: (d, ch, e) => this._startInputHold(d, ch, e),
      endInputHold: () => this._endInputHold(),
      handleScenePress: (d) => this._handleScenePress(d),
      adjustTrvTemp: (trv, dir) => this._adjustTrvTemp(trv, dir),
      requestGraphData: (id, h) => this._requestGraphData(id, h),
      getGraphPoints: (id, h) => this._seriesWithLive(id, h) ?? [],
      rgbToHex: (r, g, b) => this._rgbToHex(r, g, b),
      setBrightness: (id, pct) => this._setBrightness(id, pct),
      setColor: (id, hex, w, rgbw) => this._setColor(id, hex, w, rgbw),
      getAlerts: memo((d) => this._getAlerts(d)),
      getFirmware: memo((d) => this._getFirmware(d)),
      getSensors: memo((d) => this._getSensors(d)),
      getVirtualControls: memo((d) => this._getVirtualControls(d)),
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
    const profile = this._profile(device);
    const profStyle = this._profileStyle(device);   // per-device-TYPE overrides ("all relays")
    const activeView = this._getActiveView();
    const tileSize = cascade.tileSizeFor(
      this._config, activeView ?? undefined,
      device.area ? this._config.area_styles?.[device.area] : undefined);

    // Accent / border override
    const accentColor = this._config.device_styles?.[device.device_id]?.color ?? profStyle?.color;
    const tileStyleObj: Record<string, string> = {};
    // A per-device (or per-type) theme paints the tile's own variables. Runs
    // FIRST so the accent override below still wins, and so a device that sets
    // no theme costs nothing — it just inherits the room/view/card variables
    // already in scope.
    this._applyTileTheme(tileStyleObj, this._cascade(device, profile));
    if (accentColor) {
      tileStyleObj['borderColor'] = accentColor;
      tileStyleObj['boxShadow']   = `0 0 12px ${accentColor}50`;
    }
    // Per-tile background photo — overrides the global/area tile image for this
    // device only (the tile already renders var(--sc-tile-bg-image)).
    const devBgImage = this._config.device_styles?.[device.device_id]?.bg_image;
    if (devBgImage) {
      const sz = this._config.device_styles?.[device.device_id]?.bg_image_size;
      tileStyleObj['--sc-tile-bg-image']    = `url("${devBgImage}")`;
      tileStyleObj['--sc-tile-bg-image-sz'] = sz === 'stretch' ? '100% 100%' : (sz ?? 'cover');
    }

    // Priority: device tile_style → type → area tile_style → active view → global
    // default → per-profile default (only when smart_tile_styles is enabled).
    const devStyle = this._config.device_styles?.[device.device_id];
    const rawStyle = devStyle?.tile_style ?? profStyle?.tile_style ?? areaTileStyle ?? activeView?.tile_style ?? this._config.tile_style
      ?? (this._config.smart_tile_styles ? profileDefaultTileStyle(profile.type, device) : undefined);
    // Saved custom style → its base built-in style + config layer.
    const { base: baseStyle } = this._resolveCustomStyle(rawStyle);

    // Resolve variant — device → type → area → view → global → custom → preset → legacy
    const { style, variant: legacyVariant } = this._resolveStyle(baseStyle, profile);
    const variant: PowerMonitorVariant =
      cascade.powerMonitorVariant(this._cascade(device, profile), legacyVariant);

    if (style === 'default' || !style) {
      const blockLayout: TileLayout = this._blockLayout(device, profile);
      const blockRows = normalizeTileLayout(blockLayout)!;
      const areaAccent = this._tileAccent(device, device.area ?? '');
      const blockCtx = this._buildTileCtx(device, profile, areaAccent);
      return html`
        <div class="tile tile--clickable ${!online ? 'offline' : ''} tile-${tileSize}" style=${styleMap(tileStyleObj)}
          @pointerdown=${(e: PointerEvent) => this._onTilePointerDown(device, e)}
          @pointerup=${(e: PointerEvent) => this._onTilePointerUp(device, e)}
          @pointercancel=${() => this._onTilePointerCancel()}
          @pointermove=${(e: PointerEvent) => this._onTilePointerMove(e)}>
          ${repeat(blockRows, (r) => r.join('+'), (r) => r.length === 1
            ? renderBlockTile(blockCtx, r[0])
            : html`<div class="tile-row">${r.map((b) => renderBlockTile(blockCtx, b))}</div>`)}
        </div>`;
    }

    // Alt styles — shared setup
    const areaLabel = device.area ?? '';
    const accent    = this._tileAccent(device, areaLabel);
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
      : style === 'input-control'   ? renderInputControlTile(this._buildTileCtx(device, profile, accent))
      : style === 'scene-button'    ? renderSceneButtonTile(this._buildTileCtx(device, profile, accent))
      : nothing}
    </div>`;
  }

  // ── Tile click / long-press ────────────────────────────────────────────────

  /** Interactive controls that handle their own tap — a tap on any of these does
   *  NOT open the detail sheet. Everything else on the tile does (like HA's own
   *  tile card). */
  private static readonly _TILE_CONTROL_SEL =
    'button, a, input, select, textarea, hdd-delegated, ' +
    '.ts-light-wheel, .trv-dial-svg, .valve-interactive, .tile-trv-dial';

  private _tileTapIsControl(e: Event): boolean {
    const t = e.target as Element | null;
    return !!t?.closest?.(HADeviceDashboard._TILE_CONTROL_SEL);
  }

  private _onTilePointerDown(_device: HADevice, e: PointerEvent): void {
    if (this._tileTapIsControl(e)) return;
    this._lpStart = { x: e.clientX, y: e.clientY };
  }

  private _onTilePointerUp(device: HADevice, e: PointerEvent): void {
    if (this._tileTapIsControl(e)) return;
    const start = this._lpStart;
    this._lpStart = null;
    if (!start) return; // cancelled by move, pointercancel, or a down on a control
    // In HA's edit-dialog preview a tap jumps to this device in the editor
    // (Design tab, device scope) instead of opening the detail sheet: the sheet
    // barely fits the preview pane, and a tap there means "edit this one".
    // Controls on the tile are exempt above, so toggles stay testable.
    // The event is cancelable and the editor preventDefault()s when it acts —
    // if nothing is listening (YAML mode unmounts the GUI editor; the card
    // picker renders previews with no editor at all) the tap falls through to
    // the detail sheet rather than being silently swallowed.
    if (this.preview || this.hasAttribute('data-edit-preview')) {
      const unhandled = window.dispatchEvent(new CustomEvent('hdd-editor-goto', {
        detail: { device: device.device_id }, cancelable: true,
      }));
      if (!unhandled) return;
    }
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
    // Favourites spans rooms, so there is no area layer.
    const cols        = cascade.columnsFor(this._config, this._getActiveView() ?? undefined);
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
          ${repeat(favDevices, (d) => d.device_id, (d) => html`
            <div class="fav-tile-wrap">
              ${d.area ? html`<span class="tile-room-badge">${d.area}</span>` : nothing}
              ${this._renderTile(d, tileStyle)}
            </div>
          `)}
        </div>
      </div>`;
  }

  // ── Area section ──────────────────────────────────────────────────────────

  private _getAreaChips(devices: HADevice[], areaName?: string): Array<{ key: string; label: string; value: string }> {
    // Precedence: per-room header_chips → global area_header_chips → the built-in
    // default set (all explicit, empty = none). Env/status metrics by default;
    // NOT energy or per-sensor power — live power is the always-on number in the
    // room meta row.
    const roomChips = areaName ? this._config.area_styles?.[areaName]?.header_chips : undefined;
    const allowed: Set<string> =
      roomChips !== undefined ? new Set(roomChips)
      : this._config.area_header_chips !== undefined ? new Set(this._config.area_header_chips)
      : new Set(DEFAULT_AREA_HEADER_CHIPS);
    const show = (k: string) => allowed.has(k);
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
        const def = AREA_CHIP_DEFS.find(d =>
          d.dc === dc || (d.key === 'rssi' && (dc === 'signal_strength' || e.entity_id.includes('_rssi'))));
        if (def && show(def.key)) add(def.key, v);
      }
    }
    // Room energy window (area → global → total). When not total, the Energy chip
    // shows the summed period consumption from statistics instead of raw totals.
    const areaPeriod: EnergyPeriod =
      (areaName ? this._config.area_styles?.[areaName]?.energy_period : undefined)
      ?? this._config.energy_period ?? 'total';

    const chips: Array<{ key: string; label: string; value: string }> = [];
    for (const def of AREA_CHIP_DEFS) {
      if (def.key === 'energy' && show('energy') && areaPeriod !== 'total') {
        let sum = 0, got = false, failed = false;
        for (const d of devices) {
          for (const eid of this._energyEntitiesFor(d)) {
            const pv = this._periodEnergyValue(eid, areaPeriod);
            if (pv.failed) { failed = true; continue; }
            if (pv.kwh != null) { sum += pv.kwh; got = true; }
          }
        }
        // A partial sum is worse than no sum — if any entity's statistics call
        // failed, show the room's raw lifetime total instead of a short number
        // wearing a "Today" label.
        if (failed) {
          if (acc['energy']) chips.push({ key: 'energy', label: def.label, value: this._formatAreaChip('energy', acc['energy'].sum) });
          continue;
        }
        if (got || acc['energy']) {
          const lbl = areaPeriod === 'today' ? 'Today' : areaPeriod === 'week' ? 'Week' : 'Month';
          chips.push({ key: 'energy', label: lbl, value: got ? formatEnergy(sum) : '…' });
        }
        continue;
      }
      const a = acc[def.key];
      if (!a) continue;
      const val = def.agg === 'sum' ? a.sum : a.sum / a.count;
      chips.push({ key: def.key, label: def.label, value: this._formatAreaChip(def.key, val) });
    }
    return chips;
  }

  /** Per-device values behind a room-header chip, highest first — the drill-down
   *  answer to "which device is this reading coming from". Aggregated per device
   *  the same way the chip is: sum metrics add a device's channels, avg metrics
   *  take the device's mean. */
  private _areaChipDeviceValues(devices: HADevice[], key: string, areaName?: string): Array<{ name: string; value: number }> {
    const def = AREA_CHIP_DEFS.find(d => d.key === key);
    if (!def) return [];
    // Energy in a windowed period (Today/Week/Month): each device's period
    // consumption, so the drill-down matches the chip instead of showing raw
    // lifetime totals. 'total' falls through to the generic lifetime sum below.
    if (key === 'energy') {
      const period = (areaName ? this._config.area_styles?.[areaName]?.energy_period : undefined)
        ?? this._config.energy_period ?? 'total';
      if (period !== 'total') {
        const rows: Array<{ name: string; value: number }> = [];
        for (const device of devices) {
          let sum = 0, got = false;
          for (const eid of this._energyEntitiesFor(device)) {
            const pv = this._periodEnergyValue(eid, period);
            if (pv.kwh != null) { sum += pv.kwh; got = true; }
          }
          if (got) rows.push({ name: device.name, value: sum });
        }
        // If period stats aren't usable yet (warming up or failed), the chip
        // falls back to raw lifetime totals — mirror that here (fall through to
        // the generic branch) instead of a silent empty panel on a live chip.
        if (rows.length) return rows.sort((a, b) => b.value - a.value);
      }
    }
    const out: Array<{ name: string; value: number }> = [];
    for (const device of devices) {
      let sum = 0, count = 0;
      for (const e of device.entities) {
        if (e.domain !== 'sensor') continue;
        const s = this.hass.states[e.entity_id];
        if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
        const v = parseFloat(s.state); if (isNaN(v)) continue;
        const dc = ((s.attributes as Record<string, unknown>).device_class as string) ?? '';
        if (def.dc === dc || (def.key === 'rssi' && (dc === 'signal_strength' || e.entity_id.includes('_rssi')))) {
          sum += v; count++;
        }
      }
      if (count) out.push({ name: device.name, value: def.agg === 'sum' ? sum : sum / count });
    }
    return out.sort((a, b) => b.value - a.value);
  }

  /** Format a room-header chip value by key. Mirrors the tile formatters. */
  private _formatAreaChip(key: string, v: number): string {
    switch (key) {
      case 'power':       return formatPower(v);
      case 'energy':      return formatEnergy(v);
      case 'voltage':     return formatVoltage(v);
      case 'current':     return formatCurrent(v);
      case 'temperature': return formatTemp(v);
      case 'humidity':    return formatHumidity(v);
      case 'co2':         return formatPpm(v);
      case 'illuminance': return formatIlluminance(v);
      case 'battery':     return formatPercent(v);
      case 'rssi':        return `${Math.round(v)} dBm`;
      default:            return String(Math.round(v));
    }
  }

  /**
   * Header control that collapses every room at once, or reopens them.
   *
   * One button rather than two: with all rooms already shut, "collapse all" has
   * nothing to do, so the button reads the current state and offers the move
   * that is actually available. Mixed (some open, some shut) counts as open —
   * the useful action there is to shut the rest.
   *
   * `areas` are the RAW area keys, matching what `_closedAreas` stores; the
   * empty-string key ("No Area") is one of them, so it collapses like the rest.
   */
  private _renderCollapseAll(areas: string[]): TemplateResult {
    const allClosed = areas.every(a => this._closedAreas.has(a));
    return html`
      <button class="collapse-all" title=${allClosed ? 'Expand every room' : 'Collapse every room'}
        aria-label=${allClosed ? 'Expand every room' : 'Collapse every room'}
        @click=${(e: Event) => {
          e.stopPropagation();
          if (allClosed) {
            this._closedAreas = new Set();
          } else {
            this._closedAreas = new Set(areas);
            // Collapsing hides the grid a chip drill-down hangs under, so it would
            // otherwise orphan below a shut header — same reason the per-room
            // toggle clears it.
            this._areaChipOpen = null;
          }
        }}>
        <span class="ca-chev ${allClosed ? '' : 'open'}">▼</span>
        <span class="ca-lbl">${allClosed ? 'Expand all' : 'Collapse all'}</span>
      </button>`;
  }

  /**
   * Expand a room's `theme` into the room container's scoped CSS variables.
   *
   * Only what the container encloses can be themed. The four `header_*` keys
   * describe the CARD's header, which sits outside every room, so they are
   * skipped rather than emitted where they would do nothing (or worse, leak onto
   * a child that happens to read the variable). A *view* theme has no such limit;
   * it re-bases the whole card.
   *
   * `card_bg` does apply, as the room block's own background: the block is the
   * surface this room's tiles sit on, so it is the room's equivalent of the card
   * surface. Without it a themed room left its block transparent and a dark room
   * theme read as dark tiles floating on the card's light background. An explicit
   * `bgColor` on the room still overrides it — this runs first by design.
   *
   * Mirrors the same key → variable mapping as `_buildCardStyles`, including
   * accent's two derived variables, so a room theme and a card theme render
   * identically.
   */
  private _applyAreaTheme(styleObj: Record<string, string>, areaStyle: AreaStyle | undefined): void {
    const theme = cascade.overrideTheme(undefined, areaStyle);
    if (!theme) return;
    const p = paletteFor(theme);
    if (!p) return;
    if (p.card_bg) styleObj['backgroundColor'] = p.card_bg;
    if (p.accent_color) {
      styleObj['--sc-accent']      = p.accent_color;
      styleObj['--sc-graph-line']  = p.accent_color;
      styleObj['--sc-accent-glow'] = `${p.accent_color}59`;
    }
    if (p.tile_bg)           styleObj['--sc-tile-bg']           = p.tile_bg;
    if (p.tile_border)       styleObj['--sc-tile-border']       = p.tile_border;
    if (p.tile_hover_bg)     styleObj['--sc-tile-hover-bg']     = p.tile_hover_bg;
    if (p.tile_hover_shadow) styleObj['--sc-tile-hover-shad']   = p.tile_hover_shadow;
    if (p.tile_sensor_bg)    styleObj['--sc-sensor-bg']         = p.tile_sensor_bg;
    if (p.tile_exp_bg)       styleObj['--sc-tile-exp-bg']       = p.tile_exp_bg;
    if (p.text_primary)      styleObj['--sc-text-primary']      = p.text_primary;
    if (p.text_secondary)    styleObj['--sc-text-secondary']    = p.text_secondary;
    if (p.text_muted)        styleObj['--sc-text-muted']        = p.text_muted;
    if (p.online_color)      styleObj['--sc-online-color']      = p.online_color;
    if (p.offline_color)     styleObj['--sc-offline-dot']       = p.offline_color;
    if (p.power_color)       styleObj['--sc-power-color']       = p.power_color;
    if (p.area_header_color) styleObj['--sc-area-header-color'] = p.area_header_color;
  }

  /**
   * Expand a per-device or per-type `theme` into the tile's own CSS variables.
   *
   * The tile-scope subset: 13 of the 19 palette keys. `card_bg`, the four
   * `header_*` and `area_header_color` describe the card's surfaces and its
   * header, none of which a tile contains — emitting them here would either do
   * nothing or leak onto a child that reads the variable.
   *
   * Mirrors `_applyAreaTheme` deliberately, including accent's two derived
   * variables, so the same preset renders identically whether it was set on the
   * card, the room, or this one tile.
   */
  private _applyTileTheme(styleObj: Record<string, string>, i: cascade.CascadeInput): void {
    const theme = cascade.tileTheme(i);
    if (!theme) return;
    const p = paletteFor(theme);
    if (!p) return;
    if (p.accent_color) {
      styleObj['--sc-accent']      = p.accent_color;
      styleObj['--sc-graph-line']  = p.accent_color;
      styleObj['--sc-accent-glow'] = `${p.accent_color}59`;
    }
    if (p.tile_bg)           styleObj['--sc-tile-bg']         = p.tile_bg;
    if (p.tile_border)       styleObj['--sc-tile-border']     = p.tile_border;
    if (p.tile_hover_bg)     styleObj['--sc-tile-hover-bg']   = p.tile_hover_bg;
    if (p.tile_hover_shadow) styleObj['--sc-tile-hover-shad'] = p.tile_hover_shadow;
    if (p.tile_sensor_bg)    styleObj['--sc-sensor-bg']       = p.tile_sensor_bg;
    if (p.tile_exp_bg)       styleObj['--sc-tile-exp-bg']     = p.tile_exp_bg;
    if (p.text_primary)      styleObj['--sc-text-primary']    = p.text_primary;
    if (p.text_secondary)    styleObj['--sc-text-secondary']  = p.text_secondary;
    if (p.text_muted)        styleObj['--sc-text-muted']      = p.text_muted;
    if (p.online_color)      styleObj['--sc-online-color']    = p.online_color;
    if (p.offline_color)     styleObj['--sc-offline-dot']     = p.offline_color;
    if (p.power_color)       styleObj['--sc-power-color']     = p.power_color;
  }

  private _renderAreaSection(area: string, devices: HADevice[]): TemplateResult {
    if (!devices.length) return html``;
    const label = area || 'No Area';
    const isClosed = this._closedAreas.has(area);
    const onlineCount = devices.filter(d => this._isOnline(d)).length;
    const areaStyle = this._config.area_styles?.[label];
    const cols = cascade.columnsFor(this._config, this._getActiveView() ?? undefined, areaStyle);

    const styleObj: Record<string, string> = {};
    // A room theme goes in FIRST so the individual colour fields below still win
    // key by key — a room can take a preset and bend one colour out of it.
    this._applyAreaTheme(styleObj, areaStyle);
    if (areaStyle) {
      // The room block's own background. Painted on the element, so it sits UNDER
      // the ::before photo layer rather than competing with it — the old code made
      // them exclusive (`bgImage ? … : bgColor`), which is why a colour plus a
      // photo used to be an either/or. Dropped entirely in the 40cc8a4 refactor
      // when that branch was rewritten for the new bg_image vars, and dead since:
      // still typed, still documented in README and card-reference, rendering
      // nothing. This restores it.
      if (areaStyle.bgColor) styleObj['backgroundColor'] = areaStyle.bgColor;
      if (areaStyle.borderColor || areaStyle.borderWidth) {
        styleObj['border'] = `${areaStyle.borderWidth ?? 1}px ${areaStyle.borderStyle ?? 'solid'} ${areaStyle.borderColor ?? 'var(--divider-color)'}`;
      }
      if (areaStyle.borderRadius) { styleObj['borderRadius'] = `${areaStyle.borderRadius}px`; styleObj['overflow'] = 'hidden'; }
      if (areaStyle.bg_image) {
        styleObj['--area-bg-image']    = `url("${areaStyle.bg_image}")`;
        // Ambient mode always fills (cover); fit only applies to sharp.
        styleObj['--area-bg-image-sz'] = areaStyle.bg_image_mode === 'ambient'
          ? 'cover'
          : (areaStyle.bg_image_size === 'stretch' ? '100% 100%' : (areaStyle.bg_image_size ?? 'cover'));
        const pos = areaStyle.bg_image_pos;
        styleObj['--area-bg-pos'] = pos === 'top' ? 'center top' : pos === 'bottom' ? 'center bottom' : 'center';
      }
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
    const areaChips = this._getAreaChips(devices, label);

    return html`
      <div class="area-section ${isClosed ? 'closed' : ''} ${areaStyle?.bg_image && areaStyle.bg_image_mode === 'ambient' ? 'area-bg-ambient' : ''}" style=${styleMap(styleObj)}>
        <div class="area-header" @click=${() => {
          const next = new Set(this._closedAreas);
          if (next.has(area)) { next.delete(area); }
          else {
            next.add(area);
            // Collapsing hides the device grid; close any open chip drill-down for
            // this room too, so it doesn't orphan below the collapsed header.
            if (this._areaChipOpen?.startsWith(`${area}::`)) this._areaChipOpen = null;
          }
          this._closedAreas = next;
        }}>
          <span class="area-name">${label}</span>
          ${areaChips.length ? html`
            <div class="area-chips">
              ${areaChips.map(c => {
                const id = `${area}::${c.key}`;
                return html`
                <div class="area-chip ${this._areaChipOpen === id ? 'active' : ''}"
                  title="Tap to see which device"
                  @click=${(e: Event) => { e.stopPropagation(); this._areaChipOpen = this._areaChipOpen === id ? null : id; }}>
                  <span class="tsc-lbl">${c.label}</span>
                  <span class="tsc-val">${c.value}</span>
                </div>`;
              })}
            </div>` : nothing}
          <div class="area-meta">
            <span class="area-count">${onlineCount}/${devices.length}</span>
            <span class="chevron ${isClosed ? '' : 'open'}">▼</span>
          </div>
        </div>
        ${(() => {
          const open = this._areaChipOpen;
          if (!open || !open.startsWith(`${area}::`)) return nothing;
          const key = open.slice(area.length + 2);
          const rows = this._areaChipDeviceValues(devices, key, label);
          if (!rows.length) return nothing;
          const def = AREA_CHIP_DEFS.find(d => d.key === key);
          return html`
            <div class="area-chip-detail" @click=${(e: Event) => e.stopPropagation()}>
              <div class="acd-hdr">${def?.label ?? key} · ${rows.length} device${rows.length > 1 ? 's' : ''}</div>
              <div class="acd-list">
                ${rows.map(r => html`
                  <div class="acd-row">
                    <span class="acd-name">${r.name}</span>
                    <span class="acd-val">${this._formatAreaChip(key, r.value)}</span>
                  </div>`)}
              </div>
            </div>`;
        })()}
        ${isClosed ? nothing : html`
          ${this._renderExtraCards(this._config.area_cards?.[label])}
          <div class="device-grid" style="--cols:${cols}">
            ${repeat(devices, (d) => d.device_id, (d) => this._renderTile(d, areaTileStyle))}
          </div>
        `}
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

    // Cloud connectivity stats from binary_sensor.*_cloud entities — only
    // scanned when the cloud chips are enabled (opt-in). The Object.values
    // scan is over ALL hass states (thousands), so skip it otherwise.
    const cloudMatches = this._config.header_show_cloud === true
      ? Object.values(this.hass.states).filter(s => s.entity_id.startsWith('binary_sensor.') && s.entity_id.endsWith('_cloud'))
      : [];
    const cloudOnline    = cloudMatches.filter(s => s.state === 'on');
    const cloudOffline   = cloudMatches.filter(s => s.state === 'off');
    const cloudUnavail   = cloudMatches.filter(s => s.state === 'unavailable');
    const cloudName = (s: (typeof cloudMatches)[number]) =>
      ((s.attributes.friendly_name as string) ?? s.entity_id).replace(/\s*[Cc]loud$/, '').trim();

    const cardInlineStyles = this._buildCardStyles();

    const detailDev = this._detailDevice
      ? this._getDevices().find(d => d.device_id === this._detailDevice) ?? null
      : null;
    const detailSheet = detailDev
      ? renderDetailSheet(this._buildTileCtx(detailDev, this._profile(detailDev), this._tileAccent(detailDev, detailDev.area ?? '')))
      : nothing;

    const dashboard = html`
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
        ${this._renderDelegateNotice(devices)}
        ${this._renderExtraCards(this._config.header_cards)}
        <div class="dash-body">
          ${this._renderAttention(viewDevices)}
          ${showFavourites ? this._renderFavoritesSection(devices) : nothing}
          ${showRooms && grouped.size > 0 && this._config.show_collapse_all !== false
            ? html`<div class="rooms-toolbar">${this._renderCollapseAll([...grouped.keys()])}</div>`
            : nothing}
          ${showRooms
            ? repeat([...grouped.entries()], ([area]) => area, ([area, areaDevices]) => this._renderAreaSection(area, areaDevices))
            : html`<div class="device-grid" style="--cols:${activeView?.columns ?? this._config.columns ?? 3}">
                ${repeat(viewDevices, (d) => d.device_id, (d) => this._renderTile(d, this._config.area_styles?.[d.area ?? '']?.tile_style))}
              </div>`}
        </div>
        ${this._renderExtraCards(this._config.footer_cards)}
      </ha-card>
    `;

    return dashboard;
  }

  /**
   * "Needs attention" — the fleet-level answer to a question a wall of tiles
   * cannot answer: which devices, out of all of them. Silent when everything is
   * healthy, so it costs nothing on a good day.
   */
  private _renderAttention(devices: HADevice[]): TemplateResult {
    if (this._config.show_attention === false) return html``;
    const items = attentionItems(devices, this.hass.states as never, {
      batteryBelow: this._config.attention_battery,
      includeBeta: this._config.include_beta_updates,
    });
    const fw = this._config.show_firmware_summary === false ? [] : firmwareGroups(devices);
    const drifting = fw.length > 1;
    if (!items.length && !drifting) return html``;

    const ICON: Record<AttentionKind, string> = { offline: '○', alert: '▲', battery: '▮', update: '↑' };
    const worst = (i: AttentionItem): AttentionKind =>
      (['offline', 'alert', 'battery', 'update'] as AttentionKind[]).find(k => i.kinds.includes(k))!;

    return html`
      <div class="attention">
        <div class="att-hdr" @click=${() => { this._attentionOpen = !this._attentionOpen; }}>
          <span class="att-caret">${this._attentionOpen ? '▾' : '▸'}</span>
          <span class="att-title">Needs attention</span>
          ${items.length ? html`<span class="att-count">${items.length}</span>` : nothing}
          ${drifting ? html`<span class="att-fw-chip">${fw.length} firmware versions</span>` : nothing}
        </div>
        ${this._attentionOpen ? html`
          <div class="att-body">
            ${items.map(i => html`
              <button class="att-row att-${worst(i)}" @click=${() => { this._detailDevice = i.device.device_id; }}>
                <span class="att-icon">${ICON[worst(i)]}</span>
                <span class="att-name">${i.device.name}</span>
                <span class="att-why">${i.detail.join(' · ')}</span>
                ${i.device.area ? html`<span class="att-area">${i.device.area}</span>` : nothing}
              </button>`)}
            ${drifting ? html`
              <div class="att-fw">
                <div class="att-fw-title">Firmware</div>
                ${fw.map(g => html`
                  <div class="att-fw-row ${g.current ? 'current' : ''}">
                    <span class="att-fw-ver">${g.version}</span>
                    <span class="att-fw-bar"><i style="width:${Math.round((g.devices.length / devices.length) * 100)}%"></i></span>
                    <span class="att-fw-n">${g.devices.length}</span>
                    ${g.current ? html`<span class="att-fw-tag">newest</span>` : nothing}
                  </div>`)}
              </div>` : nothing}
          </div>` : nothing}
      </div>`;
  }

  /** Embed the user's own Lovelace cards (built-in or HACS) across the dashboard. */
  private _renderExtraCards(cards?: LovelaceCardConfig[]): TemplateResult {
    if (!cards?.length) return html``;
    return html`
      <div class="extra-cards">
        ${cards.map(c => html`<hdd-card .hass=${this.hass} .config=${c}></hdd-card>`)}
      </div>`;
  }

  /** One-time dismissible banner: some devices have native controls (media, fan,
   *  vacuum …) that are off by default to avoid the render cost of embedding a
   *  native tile per device. Points the user at the editor toggle. */
  private _renderDelegateNotice(devices: HADevice[]): TemplateResult {
    if (this._config.delegate_controls || this._delegateNoticeDismissed) return html``;
    const n = devices.filter(d => delegatableEntities(d).length > 0).length;
    if (!n) return html``;
    // Only the edit-dialog preview can act on this: a card on a dashboard has no
    // way to open its own editor, so there the setting name stays plain text
    // rather than a link that goes nowhere.
    const inEditor = this.preview || this.hasAttribute('data-edit-preview');
    const setting = inEditor
      ? html`<button class="dn-link" @click=${(e: Event) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('hdd-editor-goto', {
            detail: { tab: 'design', section: 'design-tiles', flash: 'delegate_controls' },
          }));
        }}>Native controls</button>`
      : html`<b>Native controls</b>`;
    return html`
      <div class="delegate-notice">
        <span class="dn-icon">◈</span>
        <span class="dn-text">${n} ${n === 1 ? 'device has' : 'devices have'} extra controls
          (media, fan, vacuum…). Turn on ${setting} ${inEditor ? 'to show them.' : 'in the editor to show them.'}</span>
        <button class="dn-dismiss" title="Dismiss"
          @click=${(e: Event) => { e.stopPropagation(); this._dismissDelegateNotice(); }}>×</button>
      </div>`;
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
    // In HA's edit dialog, its preview pane sizes to our content (height:
    // max-content). On mobile the dialog stacks the form over the preview, so cap
    // our height there and scroll internally — the live preview stays a bounded
    // strip under the form instead of pushing the full-height dashboard. Desktop
    // (side-by-side) is untouched.
    // Below 1000px HA stacks its edit dialog into a column and sizes the preview
    // pane to our content (height:max-content), so this cap alone bounds it into a
    // nested strip under the form. 999px matches HA's own column<->row breakpoint
    // (>=1000px is side-by-side, where we must NOT cap).
    css`
      @media (max-width: 999px) {
        :host([data-edit-preview]) {
          display: block;
          max-height: 50vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-device-dashboard': HADeviceDashboard;
  }
}
