import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { ref } from 'lit/directives/ref.js';
import { keyed } from 'lit/directives/keyed.js';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent, LovelaceCardConfig } from 'custom-card-helpers';
import { HADeviceDashboardConfig, AreaStyle, DeviceStyle, TileBlockId, EntityAnimationType, TileStyle, PowerMonitorVariant, ViewConfig, DeviceProfile, ThemePreset, CustomStyleDef, TileLayout, EnergyPeriod, InputActionConfig } from './types';
import { getAllDevices, GRAPH_SENSOR_DEFS, getDeviceProfile, HEADER_CHIP_DEFS, DEFAULT_HEADER_CHIPS, AREA_CHIP_DEFS, DEFAULT_AREA_HEADER_CHIPS, normalizeGraphKey, migrateConfig, STYLE_ELEMENTS, PROFILE_DEFAULT_TILE_STYLE, profileDefaultTileStyle, normalizeTileLayout, flattenTileLayout, cloneTileLayout, PROFILE_DEFAULT_BLOCKS, DEFAULT_GRAPH_SENSORS, factoryLook, getDiscoverySources, getIntegrationLabel, detectInputChannels,
  CONFIG_KEYS, LOVELACE_KEYS } from './helpers';
import { THEME_ORDER, THEME_PRESETS, THEME_LABELS, THEME_KEYS, detectTheme, paletteFor, type ThemePalette } from './themes';
import {
  GLOBAL_SCOPE, scopeCanSet, whyUnavailable, scopeKey, parseScopeKey, groupDevices,
  scopeLabel, overrideCount, collectOverrides, ALL_DESIGN_KEYS,
  type DesignScope, type GroupBy, type DesignFamily, type DesignOverride,
} from './design-scope';
import {
  normalizeCloudServer as sciNormalizeServer, fetchCloudLists as sciFetchLists,
  matchCloudRooms as sciMatchRooms, matchCloudDevices as sciMatchDevices,
  resolveCloudImage as sciResolveImage, isStockRoomImage as sciIsStockImage,
  cloudMac as sciMac, type RegistryDeviceLike as SciRegistryDevice,
} from './shelly-cloud-import';
import { resolveStyle } from './cascade';
import { renderAnimSvg, ANIM_OPTIONS, ANIM_COLORS, ANIM_CSS } from './anim-icons';
import { EDITOR_LAYOUT } from './editor-layout';
import { HELP_CONCEPTS, HELP_RECIPES, HELP_INTRO, type HelpTopic } from './help';
import { randomPalette, randomTheme } from './palette';

/** The global `style` sub-object — typed so key access catches typos. */
type StyleCfg = NonNullable<HADeviceDashboardConfig['style']>;

/** A collapsible editor section, ready to hand to `_sec()`. Built per-tab, then
 *  ordered/gated by EDITOR_LAYOUT so the editor's structure is data-driven. */
interface SectionDesc {
  icon: string;
  bg: string;
  fg: string;
  label: string;
  badge: TemplateResult | typeof nothing;
  body: TemplateResult;
}

// ─── Constants ────────────────────────────────────────────────────────────────

interface FontOption { label: string; value: string | undefined; group: string; cdn?: string }
const FONT_OPTIONS: FontOption[] = [
  { label: 'Default',              value: undefined,                              group: 'System' },
  { label: 'Inter',                value: 'Inter, sans-serif',                    group: 'System' },
  { label: 'Roboto',               value: 'Roboto, sans-serif',                   group: 'System' },
  { label: 'Mono',                 value: "'IBM Plex Mono', monospace",           group: 'System' },
  { label: 'System UI',            value: 'system-ui, sans-serif',                group: 'System' },
  // ── Bundled (offline) ───────────────────────────────────────
  { label: 'Abril Fatface',        value: "'Abril Fatface', cursive",             group: 'Bundled' },
  { label: 'Bangers',              value: "'Bangers', cursive",                   group: 'Bundled' },
  { label: 'Graduate',             value: "'Graduate', cursive",                  group: 'Bundled' },
  { label: 'Limelight',            value: "'Limelight', cursive",                 group: 'Bundled' },
  { label: 'Lobster',              value: "'Lobster', cursive",                   group: 'Bundled' },
  { label: 'Pacifico',             value: "'Pacifico', cursive",                  group: 'Bundled' },
  { label: 'Righteous',            value: "'Righteous', cursive",                 group: 'Bundled' },
  { label: 'Special Elite',        value: "'Special Elite', cursive",             group: 'Bundled' },
  // ── Display fonts (Google Fonts CDN) ────────────────────────
  { label: 'Alfa Slab One',        value: "'Alfa Slab One', cursive",             group: 'Display', cdn: 'Alfa+Slab+One' },
  { label: 'Bebas Neue',           value: "'Bebas Neue', sans-serif",             group: 'Display', cdn: 'Bebas+Neue' },
  { label: 'Black Ops One',        value: "'Black Ops One', cursive",             group: 'Display', cdn: 'Black+Ops+One' },
  { label: 'Bungee',               value: "'Bungee', cursive",                    group: 'Display', cdn: 'Bungee' },
  { label: 'Bungee Shade',         value: "'Bungee Shade', cursive",              group: 'Display', cdn: 'Bungee+Shade' },
  { label: 'Cinzel',               value: "'Cinzel', serif",                      group: 'Display', cdn: 'Cinzel' },
  { label: 'Dancing Script',       value: "'Dancing Script', cursive",            group: 'Display', cdn: 'Dancing+Script' },
  { label: 'Fredericka the Great', value: "'Fredericka the Great', cursive",      group: 'Display', cdn: 'Fredericka+the+Great' },
  { label: 'Great Vibes',          value: "'Great Vibes', cursive",               group: 'Display', cdn: 'Great+Vibes' },
  { label: 'Monoton',              value: "'Monoton', cursive",                   group: 'Display', cdn: 'Monoton' },
  { label: 'Permanent Marker',     value: "'Permanent Marker', cursive",          group: 'Display', cdn: 'Permanent+Marker' },
  { label: 'Shrikhand',            value: "'Shrikhand', cursive",                 group: 'Display', cdn: 'Shrikhand' },
  { label: 'Ultra',                value: "'Ultra', serif",                       group: 'Display', cdn: 'Ultra' },
];

/** Inject a single <link> once that loads every Google-Fonts-CDN family. */
let _cdnFontsInjected = false;
function ensureCdnFontsLoaded(): void {
  if (_cdnFontsInjected || typeof document === 'undefined') return;
  const families = FONT_OPTIONS.filter(f => f.cdn).map(f => `family=${f.cdn}`).join('&');
  if (!families) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);
  _cdnFontsInjected = true;
}

const SENSOR_GROUPS: Array<{ group: string; icon: string; iconColor: string; iconBg: string; items: Array<{ key: string; label: string; unit: string; defaultColor: string }> }> = [
  { group: 'Electrical', icon: '⊕', iconColor: '#4a9eff', iconBg: 'rgba(74,158,255,0.1)',
    items: [
      { key: 'power',          label: 'Power',        unit: 'W',   defaultColor: '#f4601e' },
      { key: 'voltage',        label: 'Voltage',      unit: 'V',   defaultColor: '#a78bfa' },
      { key: 'current',        label: 'Current',      unit: 'A',   defaultColor: '#fbbf24' },
      { key: 'energy',         label: 'Energy (kWh)', unit: 'kWh', defaultColor: '#4ade80' },
      { key: 'frequency',      label: 'Frequency',    unit: 'Hz',  defaultColor: '#34d399' },
      { key: 'apparent_power', label: 'App. Power',   unit: 'VA',  defaultColor: '#f472b6' },
      { key: 'reactive_power', label: 'React. Power', unit: 'VAr', defaultColor: '#818cf8' },
      { key: 'power_factor',   label: 'Power Factor', unit: '%',   defaultColor: '#fb923c' },
    ] },
  { group: 'Environmental', icon: '◌', iconColor: '#4ade80', iconBg: 'rgba(74,222,128,0.1)',
    items: [
      { key: 'temperature',    label: 'Temperature',  unit: '°C',  defaultColor: '#4fc3f7' },
      { key: 'humidity',       label: 'Humidity',     unit: '%',   defaultColor: '#2dd4bf' },
      { key: 'illuminance',    label: 'Illuminance',  unit: 'lx',  defaultColor: '#fde047' },
      { key: 'co2',            label: 'CO₂',          unit: 'ppm', defaultColor: '#a3e635' },
      { key: 'gas',            label: 'Gas',          unit: '%',   defaultColor: '#fb923c' },
    ] },
  { group: 'Device Info', icon: '◎', iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.1)',
    items: [
      { key: 'cloud',      label: 'Cloud status', unit: '', defaultColor: '#7dd3fc' },
      { key: 'rssi',       label: 'Wi-Fi RSSI',   unit: 'dBm', defaultColor: '#7dd3fc' },
      { key: 'uptime',     label: 'Uptime',       unit: '',  defaultColor: '#86efac' },
      { key: 'ip',         label: 'IP Address',   unit: '',  defaultColor: '#94a3b8' },
      { key: 'ssid',       label: 'SSID',         unit: '',  defaultColor: '#94a3b8' },
      { key: 'battery',    label: 'Battery',      unit: '%', defaultColor: '#86efac' },
      { key: 'fw_version', label: 'Firmware',     unit: '',  defaultColor: '#94a3b8' },
      { key: 'mac',        label: 'MAC Address',  unit: '',  defaultColor: '#94a3b8' },
    ] },
  { group: 'Alerts', icon: '⚠', iconColor: '#f87171', iconBg: 'rgba(239,68,68,0.15)',
    items: [
      { key: 'overtemp',  label: 'Overtemp',     unit: '', defaultColor: '#f87171' },
      { key: 'overpower', label: 'Overpower',    unit: '', defaultColor: '#f87171' },
      { key: 'motion',    label: 'Motion',       unit: '', defaultColor: '#f87171' },
      { key: 'door',      label: 'Door / Window',unit: '', defaultColor: '#f87171' },
      { key: 'flood',     label: 'Flood',        unit: '', defaultColor: '#f87171' },
      { key: 'smoke',     label: 'Smoke',        unit: '', defaultColor: '#f87171' },
      { key: 'vibration', label: 'Vibration',    unit: '', defaultColor: '#f87171' },
    ] },
];

const TILE_BLOCKS: Array<{ id: TileBlockId; label: string; sub: string }> = [
  { id: 'name_row',        label: 'Name row',          sub: 'Device name + status dot + primary control' },
  { id: 'sensors',         label: 'Sensor chips',       sub: 'Power, temp, voltage, RSSI…' },
  { id: 'graph',           label: 'Sparkline graph',    sub: 'History sparklines per selected sensor' },
  { id: 'dimmer',          label: 'Dimmer / color',     sub: 'Brightness + color picker for lights' },
  { id: 'cover_controls',  label: 'Cover controls',     sub: 'Open / stop / close + position' },
  { id: 'trv_control',     label: 'TRV control',        sub: 'Thermostat display + ± buttons' },
  { id: 'valve_controls',  label: 'Valve controls',     sub: 'Open / stop / close for valves' },
  { id: 'input_channels',  label: 'Input channels',     sub: 'Binary input state chips (i3/i4)' },
  { id: 'relay_channels',  label: 'Relay channels',     sub: 'Per-channel toggles for multi-relay devices' },
  { id: 'power_bar',       label: 'Power bar',          sub: 'Mini usage bar at tile bottom' },
  { id: 'virtual_controls',label: 'Virtual controls',   sub: 'Script-defined switches, selectors & actions' },
  { id: 'delegated_controls', label: 'Native controls', sub: 'HA’s own controls for locks, media, fans, vacuums — needs Native controls on' },
  { id: 'badges',          label: 'Type & gen badges',  sub: 'Dimmer · G3 · Relay labels' },
];

/** Tile-layout style options — shared by the per-device and per-room style
 *  panels (identical set; the two panels differ only in config scope). */
const TILE_STYLE_OPTIONS: Array<{ v: TileStyle; label: string; icon: string; desc: string }> = [
  { v: 'default',         label: 'Default',   icon: '⊟', desc: 'Adaptive blocks' },
  { v: 'power-monitor',   label: 'Power',     icon: '⚡', desc: 'Watts + sensors' },
  { v: 'light-control',   label: 'Light',     icon: '💡', desc: 'Wheel + sliders' },
  { v: 'climate-control', label: 'Climate',   icon: '🌡', desc: 'Thermostat dial' },
  { v: 'cover-control',   label: 'Cover',     icon: '▤',  desc: 'Blind + buttons' },
  { v: 'sensor-card',     label: 'Sensor',    icon: '◎',  desc: 'Big value + trend' },
  { v: 'input-control',   label: 'Inputs',    icon: '⌨',  desc: 'Channel keypad' },
  { v: 'scene-button',    label: 'Scene',     icon: '▶',  desc: 'Tappable icon' },
];

/** Power-monitor sub-variants — shown when the tile style is power-monitor. */
const PM_VARIANT_OPTIONS: Array<{ v: PowerMonitorVariant; label: string; icon: string }> = [
  { v: 'big-number', label: 'Number',  icon: '▲' },
  { v: 'gauge',      label: 'Gauge',   icon: '◉' },
  { v: 'graph',      label: 'Graph',   icon: '∿' },
  { v: 'compact',    label: 'Compact', icon: '⊟' },
  { v: 'table',      label: 'Table',   icon: '≡' },
];




// ─── Editor component ─────────────────────────────────────────────────────────

@customElement('ha-device-dashboard-editor')
export class HADeviceDashboardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: HADeviceDashboardConfig;
  @state() private _tab: string = 'devices';   // matches an EDITOR_LAYOUT tab id
  @state() private _newStyleName: string = '';                    // Design tab: "Save as style" name input
  @state() private _renamingStyle: string | null = null;          // Saved-styles row: slug being renamed inline
  /** Editor-only preference (persisted in localStorage, never written to config):
   *  when false, power-user controls are hidden to keep the common path simple. */
  @state() private _advanced = false;
  /** Whether the "Defaults" quick-setup panel is open. */
  @state() private _defaultsOpen = false;
  /** Two-click arming for the destructive "Reset everything" button. */
  @state() private _resetArmed = false;
  /** Two-click arming for a view's delete button, by view id (in-card confirm,
   *  not a browser popup). Auto-disarms after a few seconds. */
  @state() private _viewDeleteArmed: string | null = null;
  private _viewDeleteTimer?: ReturnType<typeof setTimeout>;
  /** Extra-cards manager state. */
  @state() private _xcPlacement: 'header' | 'footer' | 'room' = 'header';
  @state() private _xcRoom = '';
  @state() private _xcAdding = false;
  @state() private _xcEditIndex: number | null = null;
  /** Initial config handed to ha-yaml-editor as defaultValue (stable while editing). */
  @state() private _xcDraft: Record<string, unknown> | null = null;
  /** Latest value from the embedded card editor — NOT reactive, so keystrokes don't reset it. */
  private _xcLatest: Record<string, unknown> | null = null;
  /** Bumped whenever the draft is replaced, to force the YAML editor to remount
   *  (ha-yaml-editor only reads defaultValue on first mount). */
  private _xcDraftKey = 0;
  /** Replace the draft config and remount the YAML editor. */
  private _setXcDraft(cfg: Record<string, unknown> | null): void {
    this._xcDraft = cfg;
    this._xcLatest = null;
    this._xcDraftKey++;
  }
  /** "Copy from a dashboard" import state. */
  @state() private _xcDashboards: Array<{ url_path: string; title: string }> | null = null;
  @state() private _xcImportCards: Array<{ config: LovelaceCardConfig; label: string }> | null = null;
  @state() private _xcImportLoading = false;
  /** Theme awaiting a "replace custom colours?" confirmation, and the last
   *  saved custom palette (a restorable swatch). */
  /** Named colour palettes saved in this browser, for this card. */
  @state() private _palettes: Record<string, ThemePalette> = {};
  @state() private _paletteNaming = false;
  @state() private _paletteName = '';
  /** Views open in the editor. A Set rather than one id: 'expand all' needs it,
   *  and comparing two views' filters side by side was awkward without it. */
  @state() private _expandedViewIds: Set<string> = new Set();
  @state() private _openSections: Record<string, boolean> = {
    rooms: true,
    theme: true,
    header: true, tiles: true, card: false, colors: false, typography: false,
    graphtype: true, graphcolors: false, graphranges: false,
    electrical: true, environmental: true, deviceinfo: false, alerts: false,
    // The Design tab IS these two — landing on two collapsed bars read as empty.
    'design-scope': true, 'design-panel': true,
  };
  /** HA's entity picker is lazy-loaded; true once _ensureHaPickers got it. */
  @state() private _haPickersReady = false;
  /** Input actions: search every entity, or only this device's. null = auto
   *  (a device with its own controllable entities starts narrow; input-only
   *  hardware, whose targets live on OTHER devices, starts wide). */
  @state() private _iaAllEntities: boolean | null = null;
  /** Key of the Favourites row in `_expandedRooms`, shared with the toolbar's
   *  expand/collapse-all so both agree on what a room row is. */
  private static readonly FAV_ROW_KEY = '★ Favourites';
  @state() private _expandedRooms: Set<string> = new Set();
  /** Design tab: which layer is being edited. Persisted per card — being
   *  dropped back on Global every time you reopen the editor mid-way through
   *  styling one room is the kind of small friction that stops people using a
   *  scope-first UI at all. */
  @state() private _designScope: DesignScope = GLOBAL_SCOPE;
  @state() private _designGroupBy: GroupBy = 'room';
  @state() private _designOpenGroups: Set<string> = new Set();
  private _designScopeLoaded = false;
  /** The ◆ n changes panel: what the config sets away from the default look. */
  @state() private _changesOpen = false;
  /** Reset-all is armed by the first click and fires on the second — it drops
   *  every override in every scope, which is not something to do by mislanding a
   *  click. Same pattern as "Reset everything" in the Defaults panel. */
  @state() private _changesResetArmed = false;
  @state() private _expandedRoomStyle: Set<string> = new Set();
  @state() private _selectedDeviceId: string | null = null;
  /** Device-styling panel: false = only this device's own options, true = every
   *  option the card has. Viewer-local, never written to the config. */
  @state() private _devPanelAll = false;
  /** Conflict panel expanded — collapsed by default so it stays a hint, not a wall. */
  @state() private _conflictsOpen = false;
  /** Control id to highlight after a jump, cleared on a timer. */
  @state() private _flashControl: string | null = null;
  private _flashTimer: number | null = null;
  /** Saved whole-card snapshots for this card, from this browser. */
  @state() private _snapshots: Record<string, { saved: string; config: HADeviceDashboardConfig }> = {};
  @state() private _snapMenu: 'save' | 'load' | null = null;
  @state() private _snapName = '';
  @state() private _snapMsg: string | null = null;
  /** ? Help overlay — open flag, free-text filter, and which topic is expanded. */
  @state() private _helpOpen = false;
  @state() private _helpFilter = '';
  @state() private _helpTopic: string | null = null;
  /** Set after a colour roll, so the picker can say what it landed on. */
  @state() private _rolled: string | null = null;
  @state() private _deviceSearch = '';
  @state() private _styleClipFeedback = '';   // transient feedback for image-upload errors
  @state() private _openDiscDropdown: string | null = null;  // Discovery: which hide-checklist dropdown is expanded
  // ── Shelly Cloud import (all transient; the auth key never reaches the config) ──
  @state() private _sciServer = '';
  @state() private _sciKey = '';
  @state() private _sciBusy = false;
  @state() private _sciError = '';
  @state() private _sciDone = '';
  @state() private _sciData: import('./shelly-cloud-import').CloudLists | null = null;
  @state() private _sciRoomMap: Record<number, string> = {};   // cloud room id → area name ('' = skip)
  @state() private _sciOptRooms = true;
  @state() private _sciOptDevices = true;
  @state() private _sciOptStock = false;   // include Shelly's generic stock room images
  @state() private _sciOptFull = true;     // full-size photos instead of thumbnails
  @state() private _iconPickerState: {
    currentValue: string | undefined;
    isOn: boolean;
    onSelect: (v: string | undefined) => void;
  } | null = null;
  private _styleClipTimer?: number;

  setConfig(config: HADeviceDashboardConfig) {
    this._config = migrateConfig(config);
    this._loadAdvanced();
    this._loadPalettes();
  }

  /** Move one tab left/right and scroll it into view. The tab strip is a
   *  horizontal scroller with a hidden scrollbar: fine to drag on a touchscreen,
   *  but with a mouse there is nothing to grab, so off-screen tabs were simply
   *  unreachable. */
  private _stepTab(delta: number): void {
    const ids = EDITOR_LAYOUT.map(t => t.id);
    const i = ids.indexOf(this._tab);
    const next = ids[Math.min(ids.length - 1, Math.max(0, (i < 0 ? 0 : i) + delta))];
    if (!next || next === this._tab) return;
    this._tab = next;
    this.updateComplete.then(() => this._scrollTabIntoView(next));
  }

  private _scrollTabIntoView(id: string): void {
    const el = this.renderRoot?.querySelector(`.tab[data-tab="${id}"]`);
    el?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  }

  /** Jump to a control anywhere in the editor and flash it. Used by the card's
   *  delegate notice, which names a setting it cannot itself reach. */
  private _gotoControl(tab: string, section: string, ctl: string): void {
    this._tab = tab;
    this._defaultsOpen = false;
    const open: Record<string, boolean> = { [section]: true };
    // The registry sections (design-tiles, design-header, …) render inside the
    // design-panel accordion and only at Global scope, so jumping to one must
    // open that ancestor too — a section under a closed parent has no layout
    // box, and the scroll and flash land on nothing — and re-base the scope.
    // Membership in the registry decides it, not a name pattern: a prefix test
    // silently breaks the first time a structural design-* section is added.
    // The re-base is deliberately transient (no _setDesignScope): navigation
    // has no business overwriting the user's persisted working scope.
    if (tab === 'design' && section.startsWith('design-')
        && this._globalSectionDescriptors()[section.slice(7)]) {
      this._designScope = GLOBAL_SCOPE;
      open['design-panel'] = true;
    }
    this._openSections = { ...this._openSections, ...open };
    this._flashControl = ctl;
    if (this._flashTimer) clearTimeout(this._flashTimer);
    this._flashTimer = window.setTimeout(() => { this._flashControl = null; this._flashTimer = null; }, 2400);
    this.updateComplete.then(() => {
      this._scrollTabIntoView(tab);
      this.renderRoot?.querySelector(`[data-ctl="${ctl}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }

  private _onEditorGoto = (e: Event): void => {
    const d = (e as CustomEvent).detail as
      { tab?: string; section?: string; flash?: string; device?: string } | undefined;
    // preventDefault tells the dispatching card its tap was handled — with no
    // editor mounted (YAML mode, card picker) the card falls back to its
    // detail sheet instead of a tap that does nothing.
    if (d?.device) { e.preventDefault(); this._gotoDevice(d.device); return; }
    if (!d?.tab || !d.section || !d.flash) return;
    e.preventDefault();
    this._gotoControl(d.tab, d.section, d.flash);
  };

  /** Jump to one device's Design scope. Dispatched by the card's edit-dialog
   *  preview when a tile is tapped there — same landing as the ✎ shortcut in
   *  Rooms & devices. */
  private _gotoDevice(deviceId: string): void {
    this._selectedDeviceId = deviceId;
    this._setDesignScope({ kind: 'device', id: deviceId });
    this._gotoControl('design', 'design-panel', 'design-scope');
  }

  // ── Card snapshots ──────────────────────────────────────────────
  // A named copy of the whole card config, so a look can be restored after an
  // experiment or a reset. Browser-local like the saved theme; the file export is
  // what carries one between devices.

  private _snapshotKey(): string {
    return `shelly-dashboard:cardSnapshots:${this._config?.title ?? 'default'}`;
  }

  private _loadSnapshots(): void {
    try {
      const raw = localStorage.getItem(this._snapshotKey());
      this._snapshots = raw ? JSON.parse(raw) as typeof this._snapshots : {};
    } catch { this._snapshots = {}; }
  }

  private _writeSnapshots(next: typeof this._snapshots): void {
    this._snapshots = next;
    try {
      localStorage.setItem(this._snapshotKey(), JSON.stringify(next));
    } catch {
      // Quota — a config carrying bg_image data URLs can be megabytes.
      this._snapMsg = 'Too large for browser storage — use Export instead.';
    }
  }

  private _saveSnapshot(): void {
    const name = this._snapName.trim();
    if (!name) return;
    const config = JSON.parse(JSON.stringify(this._config)) as HADeviceDashboardConfig;
    const size = JSON.stringify(config).length;
    this._writeSnapshots({ ...this._snapshots, [name]: { saved: new Date().toISOString(), config } });
    this._snapName = '';
    this._snapMenu = null;
    this._snapMsg = size > 1_000_000
      ? `Saved "${name}" — it is large (${Math.round(size / 1024)} KB); export it to a file to be safe.`
      : `Saved "${name}".`;
    this._clearSnapMsgSoon();
  }

  private _applySnapshot(config: HADeviceDashboardConfig): void {
    // Same path as Reset — one atomic config swap, so a restore can't half-apply.
    this._emitNow(migrateConfig(config) as HADeviceDashboardConfig);
    this._snapMenu = null;
  }

  private _deleteSnapshot(name: string): void {
    const next = { ...this._snapshots };
    delete next[name];
    this._writeSnapshots(next);
  }

  private _exportSnapshot(name?: string): void {
    const config = name ? this._snapshots[name]?.config : this._config;
    if (!config) return;
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name ?? this._config?.title ?? 'ha-device-dashboard').replace(/[^\w.-]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this._snapMenu = null;
  }

  private async _importSnapshot(file: File): Promise<void> {
    try {
      const parsed = JSON.parse(await file.text()) as Record<string, unknown>;
      // Files exported from here are the card config; the manual backups written
      // during the reset wrap it in { card: … }. Accept both.
      const config = (parsed.type === 'custom:ha-device-dashboard' ? parsed
        : (parsed.card as Record<string, unknown> | undefined)) as HADeviceDashboardConfig | undefined;
      if (config?.type !== 'custom:ha-device-dashboard') {
        this._snapMsg = 'That file is not a config for this card.';
        this._clearSnapMsgSoon();
        return;
      }
      this._applySnapshot(config);
      this._snapMsg = `Loaded ${file.name}.`;
      this._clearSnapMsgSoon();
    } catch {
      this._snapMsg = 'Could not read that file.';
      this._clearSnapMsgSoon();
    }
  }

  private _clearSnapMsgSoon(): void {
    window.setTimeout(() => { this._snapMsg = null; }, 4000);
  }

  private _renderSnapshotControls(): TemplateResult {
    const names = Object.keys(this._snapshots).sort((a, b) => a.localeCompare(b));
    return html`
      <div class="snap-wrap">
        <button class="sec-toolbar-btn ${this._snapMenu === 'save' ? 'active' : ''}"
          title="Save this card's whole configuration"
          @click=${() => { this._snapMenu = this._snapMenu === 'save' ? null : 'save'; }}>💾 Save</button>
        <button class="sec-toolbar-btn ${this._snapMenu === 'load' ? 'active' : ''}"
          title="Restore a saved configuration"
          @click=${() => { this._loadSnapshots(); this._snapMenu = this._snapMenu === 'load' ? null : 'load'; }}>📂 Load ▾</button>

        ${this._snapMenu === 'save' ? html`
          <div class="snap-menu">
            <div class="snap-row">
              <input type="text" class="inline-text" style="flex:1" placeholder="Name this setup…"
                .value=${this._snapName}
                @input=${(e: Event) => { this._snapName = (e.target as HTMLInputElement).value; }}
                @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._saveSnapshot(); }}/>
              <button class="sec-toolbar-btn" @click=${() => this._saveSnapshot()}>Save</button>
            </div>
            <button class="snap-item" @click=${() => this._exportSnapshot()}>⭳ Export current to file…</button>
          </div>` : nothing}

        ${this._snapMenu === 'load' ? html`
          <div class="snap-menu">
            ${names.length ? names.map(n => html`
              <div class="snap-row">
                <button class="snap-item" style="flex:1" @click=${() => this._applySnapshot(this._snapshots[n].config)}>
                  <span class="snap-name">${n}</span>
                  <span class="snap-date">${new Date(this._snapshots[n].saved).toLocaleDateString()}</span>
                </button>
                <button class="snap-x" title="Export" @click=${() => this._exportSnapshot(n)}>⭳</button>
                <button class="snap-x" title="Delete" @click=${() => this._deleteSnapshot(n)}>✕</button>
              </div>`)
              : html`<div class="snap-empty">No saved setups on this browser yet.</div>`}
            <label class="snap-item">⭱ Load from file…
              <input type="file" accept="application/json" style="display:none"
                @change=${(e: Event) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) this._importSnapshot(f);
                }}/>
            </label>
          </div>` : nothing}
      </div>`;
  }

  /** Inline `code` spans and **bold** in help prose, kept to those two so the
   *  same source renders as markdown in docs/GUIDE.md without a parser. */
  private _helpText(line: string): TemplateResult {
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return html`${parts.map(t =>
      t.startsWith('`') && t.endsWith('`') ? html`<code class="help-code">${t.slice(1, -1)}</code>`
      : t.startsWith('**') && t.endsWith('**') ? html`<b>${t.slice(2, -2)}</b>`
      : t)}`;
  }

  private _renderHelpTopic(t: HelpTopic): TemplateResult {
    const open = this._helpTopic === t.id;
    return html`
      <div class="help-topic ${open ? 'open' : ''}">
        <button class="help-topic-hdr" @click=${() => { this._helpTopic = open ? null : t.id; }}>
          <span class="help-caret">${open ? '▾' : '▸'}</span>${t.title}
        </button>
        ${open ? html`
          <div class="help-topic-body">
            ${t.body.map(pgh => html`<p>${this._helpText(pgh)}</p>`)}
            ${t.steps ? html`<ol>${t.steps.map(st => html`<li>${this._helpText(st)}</li>`)}</ol>` : nothing}
          </div>` : nothing}
      </div>`;
  }

  private _renderHelpPanel(): TemplateResult {
    const q = this._helpFilter.trim().toLowerCase();
    const match = (t: HelpTopic) => !q
      || t.title.toLowerCase().includes(q)
      || t.body.some(b => b.toLowerCase().includes(q))
      || (t.steps ?? []).some(b => b.toLowerCase().includes(q));
    const concepts = HELP_CONCEPTS.filter(match);
    const recipes = HELP_RECIPES.filter(match);
    return html`
      <div class="help-panel">
        <div class="help-hdr">
          <span class="help-title">Help</span>
          <input type="text" class="inline-text help-search" placeholder="Search help…"
            .value=${this._helpFilter}
            @input=${(e: Event) => { this._helpFilter = (e.target as HTMLInputElement).value; }}/>
          <button class="snap-x" title="Close" @click=${() => { this._helpOpen = false; }}>✕</button>
        </div>
        <div class="help-intro">${HELP_INTRO}</div>
        ${concepts.length ? html`
          <div class="help-group">How it works</div>
          ${concepts.map(t => this._renderHelpTopic(t))}` : nothing}
        ${recipes.length ? html`
          <div class="help-group">Recipes</div>
          ${recipes.map(t => this._renderHelpTopic(t))}` : nothing}
        ${!concepts.length && !recipes.length
          ? html`<div class="snap-empty">Nothing matches “${this._helpFilter}”.</div>` : nothing}
      </div>`;
  }

  // ── Colour rolls ────────────────────────────────────────────────
  // Two buttons in the theme picker: one lands on a preset, one generates a
  // palette from a random hue. Both stash the current colours in the ★ Saved
  // slot first, so a roll you dislike is one click from being undone.

  /** Keep the colours about to be replaced, under a reserved name so repeats
   *  overwrite one entry instead of burying the list. */
  private _stashColours(slot: string = HADeviceDashboardEditor.ROLL_SLOT): void {
    this._writePalettes({ ...this._palettes, [slot]: this._effectivePalette() });
  }

  private _rollTheme(): void {
    this._stashColours();
    const name = randomTheme(this._config.theme);
    this._applyTheme(name);
    this._rolled = `🎲 ${THEME_LABELS[name] ?? name}`;
    this._clearRolledSoon();
  }

  private _rollPalette(): void {
    this._stashColours();
    const pal = randomPalette();
    // 'custom' means "these colours ARE the theme" — a generated palette has no
    // preset behind it, so it is written to `style` rather than cleared from it.
    this._set('style', { ...(this._config.style ?? {}), ...pal });
    this._set('theme', 'custom');
    this._rolled = `✨ Generated palette — accent ${pal.accent_color}`;
    this._clearRolledSoon();
  }

  private _clearRolledSoon(): void {
    window.setTimeout(() => { this._rolled = null; }, 5000);
  }

  private _palettesKey(): string {
    return `shelly-dashboard:palettes:${this._config?.title ?? 'default'}`;
  }

  /** Name the roll-stash slot uses, so repeated rolls overwrite one entry
   *  instead of burying the list. */
  private static readonly ROLL_SLOT = 'Before roll';

  private _loadPalettes(): void {
    try {
      const raw = localStorage.getItem(this._palettesKey());
      if (raw) { this._palettes = JSON.parse(raw) as Record<string, ThemePalette>; return; }
      // Migrate the single "★ Saved" slot this replaced, then drop it so a
      // deleted palette cannot come back on the next load.
      const legacyKey = `shelly-dashboard:savedTheme:${this._config?.title ?? 'default'}`;
      const legacy = localStorage.getItem(legacyKey);
      if (legacy) {
        this._palettes = { Saved: JSON.parse(legacy) as ThemePalette };
        localStorage.setItem(this._palettesKey(), JSON.stringify(this._palettes));
        localStorage.removeItem(legacyKey);
      }
    } catch { /* privacy mode / bad JSON */ }
  }

  private _writePalettes(next: Record<string, ThemePalette>): void {
    this._palettes = next;
    try { localStorage.setItem(this._palettesKey(), JSON.stringify(next)); } catch { /* ignore */ }
  }

  /** The colours the card is actually rendering — the preset behind `theme`
   *  with any `style` overrides on top. Saving while on a plain preset should
   *  capture that preset, not an empty object. */
  private _effectivePalette(): ThemePalette {
    const sty = (this._config.style ?? {}) as Record<string, unknown>;
    const pal: Record<string, unknown> = { ...(paletteFor(this._config.theme) ?? {}) };
    for (const k of THEME_KEYS) if (sty[k] !== undefined) pal[k] = sty[k];
    return pal as ThemePalette;
  }

  private _savePalette(name: string): void {
    const clean = name.trim();
    if (!clean) return;
    this._writePalettes({ ...this._palettes, [clean]: this._effectivePalette() });
    this._paletteNaming = false;
    this._paletteName = '';
    this._rolled = `Saved “${clean}”.`;
    this._clearRolledSoon();
  }

  private _deletePalette(name: string): void {
    const next = { ...this._palettes };
    delete next[name];
    this._writePalettes(next);
  }

  /** Advanced-mode is an editor UI preference keyed per card, kept out of config. */
  private _advKey(): string {
    return `shelly-dashboard:editorAdvanced:${this._config?.title ?? 'default'}`;
  }
  private _loadAdvanced(): void {
    try { this._advanced = localStorage.getItem(this._advKey()) === '1'; } catch { /* privacy mode */ }
  }
  private _setAdvanced(on: boolean): void {
    this._advanced = on;
    try { localStorage.setItem(this._advKey(), on ? '1' : '0'); } catch { /* privacy mode */ }
  }
  /** Wrap advanced-only content — renders it only when advanced mode is on.
   *  Works for both individual rows and whole `_sec(...)` accordions. */
  private _adv<T>(body: T): T | typeof nothing {
    return this._advanced ? body : nothing;
  }

  // Editor dialog-sizing plumbing — tracked so we can tear it all down.
  private _editorResizeHandler?: () => void;
  private _editorRO?: ResizeObserver;
  private _editorLayoutTimers: number[] = [];
  private _editorRAF?: number;

  connectedCallback() {
    super.connectedCallback();
    ensureCdnFontsLoaded();
    window.addEventListener('mousedown', this._onIconPickerOutsideClick, true);
    // The card can't reach the editor directly — in HA's edit dialog the two are
    // siblings — so a window event is the channel. Fired by the delegate notice.
    window.addEventListener('hdd-editor-goto', this._onEditorGoto);
    this._loadSnapshots();
    void this._ensureHaPickers();
    this._editorRAF = requestAnimationFrame(() => {
      const root1 = this.getRootNode() as ShadowRoot;
      const cardElementEditor = root1?.host as HTMLElement | null;
      if (!cardElementEditor) return;
      const root2 = cardElementEditor.getRootNode() as ShadowRoot;
      const dialogEditCard = root2?.host as HTMLElement | null;
      if (!dialogEditCard) return;
      const dialogShadow = dialogEditCard.shadowRoot;
      if (!dialogShadow) return;

      // Auto-widen the edit dialog on large displays — the same "enlarge" the user
      // would otherwise click on the header, giving a bigger form + preview. Done
      // once on open (fresh editor instance per dialog), so a later manual toggle
      // sticks. Guarded against HA renaming the internals.
      try {
        if (window.matchMedia('(min-width: 1600px)').matches) {
          const dlg = dialogEditCard as unknown as { large?: boolean; _enlarge?: () => void };
          if (dlg.large === false && typeof dlg._enlarge === 'function') dlg._enlarge();
        }
      } catch { /* dialog internals changed — ignore */ }

      // Inject structural styles (only the parts that don't depend on window size)
      const STYLE_ID = 'ha-device-dashboard-editor-fix';
      if (!dialogShadow.getElementById(STYLE_ID)) {
        const s = document.createElement('style');
        s.id = STYLE_ID;
        // DESKTOP ONLY. HA lays the edit dialog out side-by-side at >=1000px; the
        // full-height fill below only makes sense there. Below 1000px HA stacks
        // the dialog into a column and sizes the preview pane to `height:max-content`
        // (per HA's own hui-dialog-edit-card CSS), so our card's max-height cap is
        // enough — we must NOT force pane heights there or we fight HA's layout.
        s.textContent = `
          @media (min-width: 1000px) {
            div.element-editor { overflow:hidden !important; min-height:0 !important; box-sizing:border-box !important; }
            hui-card-element-editor { display:block !important; height:100% !important; overflow:hidden !important; min-height:0 !important; box-sizing:border-box !important; }
            div.element-preview { overflow-x:hidden !important; box-sizing:border-box !important; }
          }
        `;
        dialogShadow.appendChild(s);
      }

      // Measure and apply all pixel heights from actual DOM positions.
      // Uses window.innerHeight (actual visible viewport, not 100vh which
      // can differ in windowed mode on some browsers/OSes).
      const setImp = (el: HTMLElement | null, props: Record<string, string>) => {
        if (!el) return;
        for (const [k, v] of Object.entries(props)) el.style.setProperty(k, v, 'important');
      };

      const clearInline = (el: HTMLElement | null, keys: string[]) => {
        if (!el) return;
        for (const k of keys) el.style.removeProperty(k);
      };

      const apply = () => {
        const contentDiv = dialogShadow.querySelector<HTMLElement>('div.content');
        const shell      = this.shadowRoot?.querySelector<HTMLElement>('.shell');
        const footer     = dialogShadow.querySelector<HTMLElement>('ha-dialog-footer');
        if (!contentDiv || !shell) return;

        const editorDiv  = dialogShadow.querySelector<HTMLElement>('div.element-editor');
        const previewDiv = dialogShadow.querySelector<HTMLElement>('div.element-preview');

        // Only touch the dialog on desktop, where HA lays editor + preview out
        // side-by-side (>=1000px). Below that HA stacks them into a column and
        // sizes the preview to `height:max-content`, so it shrinks to fit our card
        // — the card's own max-height cap handles the "nested strip" there. If we
        // forced pane heights on mobile we'd re-introduce the 50/50 split. Clear
        // any styles left over from a wider layout so nothing leaks across resize.
        if (!window.matchMedia('(min-width: 1000px)').matches) {
          const props = ['height', 'max-height', 'overflow', 'overflow-y', 'align-items', 'flex', 'min-height', 'box-sizing'];
          clearInline(contentDiv, props);
          clearInline(editorDiv, props);
          clearInline(previewDiv, props);
          clearInline(shell, ['height', 'max-height']);
          return;
        }

        // Desktop, side-by-side: make the config form fill the dialog height so the
        // long form scrolls inside our shell instead of the whole dialog.
        const vh       = window.innerHeight;
        const footerH  = footer?.offsetHeight ?? 0;
        const cTop     = contentDiv.getBoundingClientRect().top;
        const contentH = Math.max(300, vh - cTop - footerH);

        setImp(contentDiv, {
          height: `${contentH}px`, 'max-height': `${contentH}px`,
          overflow: 'hidden', 'align-items': 'stretch', 'box-sizing': 'border-box',
        });
        setImp(editorDiv,  { height: `${contentH}px`, 'max-height': `${contentH}px`, overflow: 'hidden' });
        setImp(previewDiv, { height: `${contentH}px`, 'max-height': `${contentH}px`, 'overflow-y': 'auto' });

        // Shell height = from shell's top to the bottom of element-editor (not viewport bottom)
        // This avoids overflowing past the element-editor's overflow:hidden boundary
        const shellTop   = shell.getBoundingClientRect().top;
        const editorBottom = editorDiv ? editorDiv.getBoundingClientRect().bottom : vh;
        const shellH = Math.max(400, editorBottom - shellTop);
        shell.style.height    = `${shellH}px`;
        shell.style.maxHeight = `${shellH}px`;
      };

      apply();
      this._editorLayoutTimers.push(
        window.setTimeout(apply, 50),
        window.setTimeout(apply, 250),
        window.setTimeout(apply, 700),
      );
      this._editorResizeHandler = apply;
      window.addEventListener('resize', apply);

      if (typeof ResizeObserver !== 'undefined') {
        this._editorRO = new ResizeObserver(apply);
        const editorDiv = dialogShadow.querySelector<HTMLElement>('div.element-editor');
        if (editorDiv) this._editorRO.observe(editorDiv);
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mousedown', this._onIconPickerOutsideClick, true);
    window.removeEventListener('hdd-editor-goto', this._onEditorGoto);
    if (this._flashTimer) { clearTimeout(this._flashTimer); this._flashTimer = null; }
    clearTimeout(this._styleClipTimer);
    clearTimeout(this._viewDeleteTimer);
    // The cloud auth key is a credential — never let it outlive the editor.
    this._sciKey = '';
    this._sciData = null;
    // Tear down the dialog-sizing plumbing so it doesn't leak across editor opens.
    if (this._editorRAF != null) { cancelAnimationFrame(this._editorRAF); this._editorRAF = undefined; }
    this._editorLayoutTimers.forEach(t => clearTimeout(t));
    this._editorLayoutTimers = [];
    if (this._editorResizeHandler) {
      window.removeEventListener('resize', this._editorResizeHandler);
      this._editorResizeHandler = undefined;
    }
    this._editorRO?.disconnect();
    this._editorRO = undefined;
    this._flushConfig();   // don't lose a pending debounced change when the editor closes
  }

  /** Single shared popover rendered at the editor root; opened on demand. */
  private _renderIconGridPopover(): TemplateResult {
    const st = this._iconPickerState;
    const accent = '#f4601e';
    return html`
      <div popover="manual" class="icon-grid-popover" id="ha-dd-icon-grid-popover"
        @click=${(e: Event) => e.stopPropagation()}>
        ${st ? ANIM_OPTIONS.map(opt => {
          const isSel = (st.currentValue ?? 'none') === opt.value;
          const cellCol = opt.value !== 'none' ? (ANIM_COLORS[opt.value as EntityAnimationType]?.[st.isOn ? 'on' : 'off'] ?? accent) : accent;
          return html`
            <button class="icon-grid-cell ${isSel ? 'sel' : ''}"
              style="color:${cellCol}${isSel ? `;background:${accent}30;border-color:${accent}` : ''}"
              title=${opt.label}
              @click=${() => {
                st.onSelect(opt.value === 'none' ? undefined : opt.value);
                this._closeIconPicker();
              }}>
              ${opt.value === 'none'
                ? html`<span class="icon-grid-none">—</span>`
                : renderAnimSvg(opt.value as EntityAnimationType, st.isOn, `--ent-spd:1;color:${cellCol};width:20px;height:20px`, 'icon-preview')}
              <span class="icon-grid-lbl">${opt.label}</span>
            </button>`;
        }) : nothing}
      </div>`;
  }

  private _closeIconPicker = () => {
    const pop = this.renderRoot.querySelector<HTMLElement>('#ha-dd-icon-grid-popover');
    if (pop && 'hidePopover' in pop && (pop as any).matches?.(':popover-open')) {
      (pop as any).hidePopover();
    }
    this._iconPickerState = null;
  };

  private _onIconPickerOutsideClick = (e: MouseEvent) => {
    if (!this._iconPickerState) return;
    const path = e.composedPath();
    const hit = path.some(n =>
      n instanceof HTMLElement &&
      (n.id === 'ha-dd-icon-grid-popover' || n.classList?.contains('icon-picker-btn'))
    );
    if (!hit) this._closeIconPicker();
  };

  /** Render an icon picker button. Opens the shared popover positioned below the button. */
  private _iconPicker(
    _key: string,
    currentValue: string | undefined,
    isOn: boolean,
    onSelect: (val: string | undefined) => void
  ): TemplateResult {
    const accent = '#f4601e';
    const col = currentValue ? (ANIM_COLORS[currentValue as EntityAnimationType]?.[isOn ? 'on' : 'off'] ?? accent) : accent;
    const isOpen = this._iconPickerState?.onSelect === onSelect;
    return html`
      <div class="icon-picker-wrap">
        <button class="icon-picker-btn compact"
          @click=${(e: Event) => {
            e.stopPropagation();
            if (isOpen) {
              this._closeIconPicker();
              return;
            }
            this._iconPickerState = { currentValue, isOn, onSelect };
            // Wait for Lit to render the updated popover contents, then show.
            // Centered via CSS (inset:0; margin:auto); no positioning math.
            this.updateComplete.then(() => {
              const pop = this.renderRoot.querySelector<HTMLElement>('#ha-dd-icon-grid-popover');
              if (!pop) return;
              const anyPop = pop as any;
              if (typeof anyPop.showPopover === 'function') {
                try {
                  if (!anyPop.matches?.(':popover-open')) anyPop.showPopover();
                } catch { /* already open or unsupported */ }
              } else {
                // Fallback for browsers without popover API
                pop.style.display = 'grid';
                pop.style.position = 'fixed';
                pop.style.top = '50%';
                pop.style.left = '50%';
                pop.style.transform = 'translate(-50%, -50%)';
                pop.style.zIndex = '99999';
              }
            });
          }}>
          ${currentValue
            ? renderAnimSvg(currentValue as EntityAnimationType, isOn,
                `--ent-spd:1;color:${col}`, 'icon-preview-sm')
            : html`<span class="icon-cell-none">—</span>`}
        </button>
      </div>`;
  }

  private _emitTimer: number | null = null;
  private _pendingConfig: HADeviceDashboardConfig | null = null;

  private _set(key: string, value: unknown) {
    if (!this._config) return;
    const updated: Record<string, unknown> = { ...this._config, [key]: value };
    // '[]' is a valid "none" sentinel for these keys (rooms shown / sensor chips /
    // graph sensors) — never delete it, so "Deselect all" persists as an explicit
    // empty set. For graph_sensors that matters doubly: unset now means "use the
    // default graph set", so a deleted [] would spring the defaults back.
    const keepEmptyArray = key === 'areas' || key === 'sensors' || key === 'graph_sensors';
    if (value === '' || value === undefined || (Array.isArray(value) && value.length === 0 && !keepEmptyArray)) {
      delete updated[key];
    }
    this._emitConfig(updated as HADeviceDashboardConfig);
  }

  /**
   * Coalesce config changes before telling HA. `@input` on colour pickers,
   * range sliders and the view-name field fires per pixel / per keystroke;
   * emitting `config-changed` each time makes HA tear down and rebuild the
   * preview card every event (full device rediscovery + history refetch),
   * which halts the editor and can crash the tab. We update the editor's own
   * `_config` immediately so its UI stays live, and debounce the outbound
   * event so the preview rebuilds once the value settles.
   */
  private _emitConfig(config: HADeviceDashboardConfig) {
    this._config = config;            // optimistic — keeps inputs & counts live
    this._pendingConfig = config;
    if (this._emitTimer != null) clearTimeout(this._emitTimer);
    this._emitTimer = window.setTimeout(() => this._flushConfig(), 300);
  }

  /** Fire any pending debounced config change immediately. */
  private _flushConfig() {
    if (this._emitTimer != null) { clearTimeout(this._emitTimer); this._emitTimer = null; }
    const cfg = this._pendingConfig;
    this._pendingConfig = null;
    if (cfg) fireEvent(this, 'config-changed', { config: cfg });
  }

  /** Emit a config change immediately (deliberate one-shot actions: reset,
   *  paste, add/delete view). Supersedes any pending debounced change. */
  private _emitNow(config: HADeviceDashboardConfig) {
    this._config = config;
    this._pendingConfig = config;
    this._flushConfig();
  }

  private _toggleSec(id: string) {
    this._openSections = { ...this._openSections, [id]: !this._openSections[id] };
  }

  /** Small inline reset (↺) button. Renders only when `set` is truthy. */
  private _resetBtn(set: boolean, onClear: () => void): TemplateResult | typeof nothing {
    return set
      ? html`<button class="field-reset" title="Reset to default"
          @click=${(e:Event) => { e.stopPropagation(); onClear(); }}>↺</button>`
      : nothing;
  }

  /** Clear a top-level config key. */
  private _clearCfg(key: string): void {
    const next = { ...(this._config as any) } as Record<string, unknown>;
    delete next[key];
    const { type, ...rest } = next as any;
    this._emitNow({ type, ...rest } as HADeviceDashboardConfig);
  }

  /** Clear a style sub-key. */
  private _clearStyle(key: string): void {
    const sty = { ...(this._config.style ?? {}) } as Record<string, unknown>;
    delete sty[key];
    this._set('style', Object.keys(sty).length ? sty as any : undefined);
  }

  /** Clear a graph_style sub-key. */
  private _clearGraphStyle(key: string): void {
    const gs = { ...(this._config.graph_style ?? {}) } as Record<string, unknown>;
    delete gs[key];
    this._set('graph_style', Object.keys(gs).length ? gs as any : undefined);
  }

  /** Render a 32×32 thumbnail for a background image URL (data-URL or remote). */
  private _renderBgThumb(url: string): TemplateResult {
    return html`<div class="bg-thumb" style="background-image:url(${url})" title="Preview"></div>`;
  }

  /** Estimate file size from a data-URL base64 payload. */
  private _estimateImageSize(url: string): string {
    if (!url.startsWith('data:')) return '';
    const idx = url.indexOf(',');
    if (idx < 0) return '';
    const bytes = Math.floor((url.length - idx - 1) * 0.75);
    if (bytes >= 1024 * 1024) return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024)        return `~${Math.round(bytes / 1024)} KB`;
    return `~${bytes} B`;
  }

  private _showStyleFeedback(msg: string) {
    this._styleClipFeedback = msg;
    clearTimeout(this._styleClipTimer);
    this._styleClipTimer = window.setTimeout(() => { this._styleClipFeedback = ''; }, 1500);
  }

  private _getAreas(): Array<{ id: string; name: string }> {
    if (!this.hass) return [];
    // Only areas that actually contain a fetched Shelly/BTHome device. HA areas
    // full of non-Shelly kit (routers, TVs, price trackers) are noise in every
    // room picker. Keep any area already named in the include list, so a
    // configured selection never becomes impossible to toggle off.
    const withDevices = new Set(
      this._allDevices().map(d => (d.area ?? '').toLowerCase()).filter(Boolean));
    const configured = new Set((this._config.areas ?? []).map(a => a.toLowerCase()));
    return Object.values((this.hass as any).areas ?? {})
      .map((a: any) => ({ id: a.area_id, name: a.name as string }))
      .filter(a => withDevices.has(a.name.toLowerCase()) || configured.has(a.name.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // getAllDevices scans the full HA entity/device registry (thousands of
  // entries) — never call it in a loop. Cached per hass reference.
  private _devCacheHass?: HomeAssistant;
  private _devCacheKey = '';
  private _devCache: ReturnType<typeof getAllDevices> = [];
  private _allDevices(): ReturnType<typeof getAllDevices> {
    if (!this.hass) return [];
    const c = this._config;
    // Editor device list must match what the card discovers, so mirror the
    // universal-mode discovery opts. Re-run when hass or those opts change.
    const key = JSON.stringify([c?.mode, c?.universal_scope, c?.include_integrations,
      c?.exclude_integrations, c?.include_domains, c?.exclude_domains]);
    if (this._devCacheHass !== this.hass || this._devCacheKey !== key) {
      this._devCache = getAllDevices(this.hass, {
        universal:           c?.mode === 'universal',
        scope:               c?.universal_scope,
        includeIntegrations: c?.include_integrations,
        excludeIntegrations: c?.exclude_integrations,
        includeDomains:      c?.include_domains,
        excludeDomains:      c?.exclude_domains,
      });
      this._devCacheHass = this.hass;
      this._devCacheKey = key;
    }
    return this._devCache;
  }

  private _getDiscoveredDevices(): Array<{ device_id: string; name: string; area?: string }> {
    if (!this.hass) return [];
    const areas = this._config.areas;
    let raw = this._allDevices();
    if (areas !== undefined) {
      const norm = new Set(areas.map(a => a.toLowerCase()));
      raw = raw.filter(d => norm.has((d.area ?? '').toLowerCase()));
    }
    return raw.map(d => ({ device_id: d.device_id, name: d.name, area: d.area }))
              .sort((a,b)=>a.name.localeCompare(b.name));
  }

  // ── Area style helpers ──────────────────────────────────────────────────────
  private _setAreaStyle(n: string, key: keyof AreaStyle, value: string|number|boolean|string[]|undefined) {
    const cur: AreaStyle = { ...(this._config.area_styles?.[n] ?? {}) };
    if (value === undefined || value === '') delete cur[key];
    else (cur as any)[key] = value;
    const all = { ...(this._config.area_styles ?? {}) };
    if (Object.keys(cur).length) all[n] = cur; else delete all[n];
    this._set('area_styles', Object.keys(all).length ? all : undefined);
  }

  private _clearAreaStyle(n: string) {
    const all = { ...(this._config.area_styles ?? {}) };
    delete all[n];
    this._set('area_styles', Object.keys(all).length ? all : undefined);
  }

  /** Compact sensor-chip whitelist picker with inherit semantics.
   *  selected = undefined → inheriting (shows the inherited set greyed);
   *  onChange(undefined) clears the override; empty selections normalize to undefined. */
  /** Compact "All · None" control for a multi-select group. */
  private _selAllNone(onAll: () => void, onNone: () => void): TemplateResult {
    return html`
      <span class="sel-allnone">
        <button type="button" class="sel-mini" title="Select all"
          @click=${(e: Event) => { e.stopPropagation(); onAll(); }}>All</button>
        <button type="button" class="sel-mini" title="Deselect all"
          @click=${(e: Event) => { e.stopPropagation(); onNone(); }}>None</button>
      </span>`;
  }

  private _chipPicker(
    selected: string[] | undefined,
    inheritedSel: string[] | undefined,
    inheritedFrom: string,
    onChange: (next: string[] | undefined) => void,
    /** When set, only offer these chip keys — the ones the device can actually
     *  produce. Keys already selected stay visible so nothing becomes unreachable. */
    only?: Set<string>,
  ): TemplateResult {
    const inherited = inheritedSel ?? [];
    const isOverride = selected !== undefined;
    const offered = (key: string) => !only || only.has(key) || (selected ?? []).includes(key);
    const groups = SENSOR_GROUPS
      .map(g => ({ ...g, items: g.items.filter(i => offered(i.key)) }))
      .filter(g => g.items.length);
    // Effective set shown: override, else inherited global (empty = all keys on)
    const allKeys = SENSOR_GROUPS.flatMap(g => g.items.map(i => i.key)).filter(offered);
    const effective = new Set(isOverride ? selected : (inherited.length ? inherited : allKeys));
    const toggle = (key: string) => {
      const base = isOverride ? [...selected] : [...effective];
      const next = base.includes(key) ? base.filter(k => k !== key) : [...base, key];
      // Persist the selection verbatim — including [] ("show none"). Only the
      // explicit ↺ Inherit button clears the override; unchecking the last chip
      // must NOT silently revert to the full inherited set.
      onChange(next);
    };
    return html`
      <div class="chip-picker">
        <div class="chip-picker-hdr">
          <span class="chip-picker-state">${isOverride ? 'Custom selection' : `Inheriting from ${inheritedFrom}`}</span>
          ${this._selAllNone(() => onChange([...allKeys]), () => onChange([]))}
          ${isOverride
            ? html`<button class="color-reset" @click=${() => onChange(undefined)}>↺ Inherit</button>`
            : html`<button class="color-reset" @click=${() => onChange([...effective])}>Customize</button>`}
        </div>
        ${groups.map(grp => html`
          <div class="chip-picker-grp">
            <span class="chip-picker-grp-lbl" style="color:${grp.iconColor}">${grp.icon} ${grp.group}</span>
            <div class="pill-grp">
              ${grp.items.map(item => html`
                <span class="pill ${effective.has(item.key) ? 'on' : ''} ${isOverride ? '' : 'dim'}"
                  @click=${() => toggle(item.key)}>${item.label}</span>`)}
            </div>
          </div>`)}
      </div>`;
  }

  private _clearDeviceStyle(deviceId: string) {
    const all = { ...(this._config.device_styles ?? {}) };
    delete all[deviceId];
    this._set('device_styles', Object.keys(all).length ? all : undefined);
  }

  /**
   * Downscale a user-provided image and return a JPEG data URL compact enough
   * to embed in Lovelace config. EXIF orientation is respected.
   */
  private async _prepareImageForEmbed(
    file: File,
    opts: { maxDim?: number; targetBytes?: number } = {},
  ): Promise<string> {
    const maxDim      = opts.maxDim      ?? 1920;
    const targetBytes = opts.targetBytes ?? 400 * 1024;

    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width  * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close(); throw new Error('canvas 2d context unavailable'); }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    // base64 inflates bytes by ~4/3, so decode-size ≈ dataUrl.length * 0.75
    let quality = 0.85;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (dataUrl.length * 0.75 > targetBytes && quality > 0.4) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }
    // Release backing store immediately rather than waiting for GC (~8 MB for 1920×1080 RGBA)
    canvas.width = 0; canvas.height = 0;
    return dataUrl;
  }

  private async _handleBgUpload(
    e: Event,
    apply: (url: string) => void,
    opts?: { maxDim?: number; targetBytes?: number },
  ) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      apply(await this._prepareImageForEmbed(file, opts));
    } catch (err) {
      console.warn('[editor] failed to process image', file.name, err);
      this._showStyleFeedback(`Couldn't process "${file.name}" — try a /local/… URL instead`);
    }
    input.value = '';
  }

  /** Reusable background-image picker (upload / URL / thumbnail / fit) — shared by
   *  the card, per-room and per-tile background controls. `apply(undefined)` clears
   *  the image; `clear()` also drops the fit. */
  private _renderBgImagePicker(
    label: string,
    uploadId: string,
    current: string | undefined,
    size: 'cover' | 'contain' | 'stretch' | undefined,
    apply: (url: string | undefined) => void,
    setSize: (v: 'cover' | 'contain' | 'stretch') => void,
    clear: () => void,
    opts?: { maxDim?: number; showFit?: boolean; extra?: TemplateResult | typeof nothing },
  ): TemplateResult {
    const maxDim = opts?.maxDim ?? 720;
    const showFit = opts?.showFit ?? true;
    return html`
      <div class="tiles-divider">${label}</div>
      <div class="field">
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload=${uploadId}
            @change=${(e: Event) => this._handleBgUpload(e, url => apply(url), { maxDim })}/>
          <button class="upload-btn" @click=${() => {
            (this.renderRoot.querySelector(`input[data-upload="${uploadId}"]`) as HTMLInputElement | null)?.click();
          }}>↑ Local</button>
          ${current ? this._renderBgThumb(current) : nothing}
          ${current?.startsWith('data:')
            ? html`<span class="bg-embedded-note">Embedded · ${this._estimateImageSize(current)}</span>`
            : html`<input type="text" class="inline-text" placeholder="/local/image.png or https://…"
                .value=${current ?? ''}
                @change=${(e: Event) => { const v = (e.target as HTMLInputElement).value.trim(); apply(v || undefined); }}/>`}
          ${current ? html`<button class="color-reset" @click=${clear}>↺</button>` : nothing}
          ${this._styleClipFeedback ? html`<span class="clip-feedback">${this._styleClipFeedback}</span>` : nothing}
        </div>
        ${current && showFit ? html`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${(['cover', 'contain', 'stretch'] as const).map(v => html`
              <span class="pill ${(size ?? 'cover') === v ? 'on' : ''}"
                @click=${() => setSize(v)}>${v[0].toUpperCase() + v.slice(1)}</span>`)}
          </div>` : nothing}
        ${current ? (opts?.extra ?? nothing) : nothing}
      </div>`;
  }

  private _handleCardBgUpload(e: Event) {
    return this._handleBgUpload(e, url => this._set('card_bg_image', url));
  }

  private _handleTileBgUpload(e: Event) {
    return this._handleBgUpload(
      e,
      url => this._set('style', { ...(this._config.style ?? {}), tile_bg_image: url }),
      { maxDim: 720 },
    );
  }

  // ── Section accordion ───────────────────────────────────────────────────────
  private _sec(id: string, icon: string, iconBg: string, iconColor: string, title: string, badge: TemplateResult|typeof nothing, body: TemplateResult): TemplateResult {
    const open = this._openSections[id];
    return html`
      <div class="sec ${open ? 'open' : ''}">
        <div class="sec-hdr" @click=${()=>this._toggleSec(id)}>
          <div class="sec-hdr-l">
            <div class="sec-ico" style="background:${iconBg};color:${iconColor}">${icon}</div>
            <span class="sec-title">${title}</span>
          </div>
          <div class="sec-hdr-r">${badge}<span class="chev">▼</span></div>
        </div>
        <div class="sec-body">${body}</div>
      </div>`;
  }

  private _badge(text: string, color: string, bg: string): TemplateResult {
    return html`<span class="sec-badge" style="color:${color};background:${bg}">${text}</span>`;
  }


  // ══════════════════════════════════════════════════════════════
  //  TAB: DEVICES
  // ══════════════════════════════════════════════════════════════

  private _renderDevicesTab(): TemplateResult {
    const c = this._config;
    // undefined = all rooms on; explicit array = include list
    const allAreas = this._getAreas();
    const allAreaKeys = allAreas.map(a => a.name);
    const selectedAreas = c.areas; // undefined means all
    const toggleArea = (areaKey: string) => {
      const currentlyOn = selectedAreas === undefined
        ? new Set(allAreaKeys)
        : new Set(selectedAreas);
      if (currentlyOn.has(areaKey)) {
        currentlyOn.delete(areaKey);
      } else {
        currentlyOn.add(areaKey);
      }
      const next = currentlyOn.size === allAreaKeys.length ? undefined : [...currentlyOn];
      this._set('areas', next);
    };
    const isAreaOn = (areaKey: string) => selectedAreas === undefined || selectedAreas.includes(areaKey);
    const allDiscovered = this._getDiscoveredDevices();
    const hiddenDevices = c.hidden_devices ?? [];

    // Build device tree by area
    const byArea = new Map<string, Array<{device_id:string;name:string}>>();
    for (const dev of allDiscovered) {
      const key = dev.area ?? '';
      if (!byArea.has(key)) byArea.set(key, []);
      byArea.get(key)!.push(dev);
    }
    const areaKeys = [...allAreas.map(a => a.name)];
    if (byArea.has('')) areaKeys.push('');

    const onCount = selectedAreas === undefined ? allAreas.length : selectedAreas.length;
    const roomsBadge = this._badge(`${onCount} / ${allAreas.length}`, '#4ade80', 'rgba(74,222,128,0.1)');

    // Devices with no HA area still render, grouped under a "No Area" section.
    const unassigned = byArea.get('')?.length ?? 0;

    // Room rows
    const roomBody = html`
      <div class="rooms-toolbar">
        ${unassigned > 0 ? html`
          <div class="rooms-note">
            <span class="rooms-note-ico">⌂</span>
            <span>${unassigned} device${unassigned !== 1 ? 's' : ''}
              ${unassigned !== 1 ? 'are' : 'is'} not assigned to a room, so
              ${unassigned !== 1 ? 'they' : 'it'} appear under a <b>No Area</b> group on
              the card. Assign areas in Home Assistant — the
              <b>Entity Manager</b> custom component has a bulk area/room tool for
              doing this across many devices at once.</span>
          </div>` : nothing}
        <div class="toolbar-group">
          <span class="toolbar-lbl">Sort</span>
          <div class="pill-grp">
            ${([['name','Name'],['power','Power'],['online','Online'],['area','Room']] as const).map(([v,lbl]) => html`
              <span class="pill ${(c.sort_by ?? 'name') === v ? 'on' : ''}"
                @click=${()=>this._set('sort_by',v)}>${lbl}</span>`)}
          </div>
        </div>
        <div class="toolbar-group">
          <span class="toolbar-lbl">Rooms</span>
          ${this._selAllNone(() => this._set('areas', undefined), () => this._set('areas', []))}
        </div>
        <div class="tog-row" style="border:none;padding:4px 0 0">
          <div class="tog-lbl">Show offline devices</div>
          <label class="sw"><input type="checkbox" .checked=${c.show_offline !== false}
            @change=${(e:Event)=>this._set('show_offline',(e.target as HTMLInputElement).checked)}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>
      </div>
      ${(c.favorites?.length) ? (() => {
        const FAV_KEY = HADeviceDashboardEditor.FAV_ROW_KEY;
        const favDevices = (c.favorites ?? [])
          .map(id => allDiscovered.find(d => d.device_id === id))
          .filter(Boolean) as Array<{device_id:string;name:string;area?:string}>;
        const isFavExpanded  = this._expandedRooms.has(FAV_KEY);
        const hasFavStyle    = !!(c.area_styles?.['Favourites'] && Object.keys(c.area_styles['Favourites']).length);
        return html`
          <div class="room-row fav-room-row">
            <span class="fav-room-star">★</span>
            <span class="room-name" style="color:var(--amber)">Favourites</span>
            <span class="room-count" style="color:var(--amber)">${favDevices.length}</span>
            <button class="room-style-btn" title="Style Favourites →" @click=${(e:Event)=>{
              e.stopPropagation();
              this._setDesignScope({ kind: 'room', name: 'Favourites' }); this._tab = 'design';
            }}>✎</button>
            ${hasFavStyle ? html`<button class="room-reset-btn" title="Set Favourites style to default"
              @click=${(e:Event)=>{e.stopPropagation();this._clearAreaStyle('Favourites');}}>↺</button>` : nothing}
            <button class="room-expand-btn ${isFavExpanded ? 'open' : ''}"
              style="color:${isFavExpanded ? 'var(--amber)' : ''}"
              @click=${(e:Event)=>{
                e.stopPropagation();
                const next = new Set(this._expandedRooms);
                next.has(FAV_KEY) ? next.delete(FAV_KEY) : next.add(FAV_KEY);
                this._expandedRooms = next;
              }}>▼</button>
          </div>
          ${isFavExpanded ? html`
            <div class="room-expanded">
              <div class="room-devices">
                ${favDevices.map(dev => {
                  const isHidden    = hiddenDevices.includes(dev.device_id);
                  const hasDevStyle = !!(c.device_styles?.[dev.device_id]);
                  const isDevExp    = this._selectedDeviceId === dev.device_id;
                  const areaLabel   = dev.area
                    ? html`<span class="fav-dev-area">${dev.area}</span>` : nothing;
                  return html`
                    <div class="room-device-row ${isDevExp ? 'selected' : ''}">
                      ${areaLabel}
                      <span class="room-device-name" style="color:${isHidden ? 'var(--t3)' : 'var(--t2)'};flex:1">${dev.name}</span>
                      ${hasDevStyle ? html`<span class="dev-style-dot"></span>` : nothing}
                      <label class="sw">
                        <input type="checkbox" .checked=${!isHidden} @change=${() => {
                          const next = isHidden
                            ? hiddenDevices.filter(x => x !== dev.device_id)
                            : [...hiddenDevices, dev.device_id];
                          this._set('hidden_devices', next.length ? next : undefined);
                        }}>
                        <span class="sw-t"></span><span class="sw-b"></span>
                      </label>
                      <button class="fav-btn on" title="Remove from Favourites"
                        @click=${(e:Event) => {
                          e.stopPropagation();
                          const next = (c.favorites ?? []).filter(id => id !== dev.device_id);
                          this._set('favorites', next.length ? next : undefined);
                        }}>★</button>
                      ${hasDevStyle ? html`<button class="room-reset-btn" title="Set device style to default"
                        @click=${(e:Event)=>{e.stopPropagation();this._clearDeviceStyle(dev.device_id);}}>↺</button>` : nothing}
                      <button class="room-style-btn" title="Style this device →" @click=${(e:Event) => {
                        e.stopPropagation();
                        this._gotoDevice(dev.device_id);
                      }}>✎</button>
                    </div>`;
                })}
              </div>
            </div>` : nothing}`;
      })() : nothing}
      ${areaKeys.map(areaKey => {
        const label = areaKey || 'No Room';
        const devicesInArea = byArea.get(areaKey) ?? [];
        const isIncluded = isAreaOn(areaKey);
        const isExpanded = this._expandedRooms.has(areaKey);
        const hasAreaStyle = !!(c.area_styles?.[areaKey] && Object.keys(c.area_styles[areaKey]).length);
        return html`
          <div class="room-row">
            <div class="room-dot" style="background:${isIncluded ? '#4ade80' : 'var(--t3)'}"></div>
            <span class="room-name" style="color:${isIncluded ? 'var(--text)' : 'var(--t2)'}">${label}</span>
            ${devicesInArea.length ? html`<span class="room-count">${devicesInArea.length}</span>` : nothing}
            <label class="sw"><input type="checkbox" .checked=${isIncluded}
              @change=${()=>toggleArea(areaKey)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
            ${hasAreaStyle ? html`<button class="room-reset-btn" title="Set room style to default"
              @click=${(e:Event)=>{e.stopPropagation();this._clearAreaStyle(areaKey);}}>↺</button>` : nothing}
            <button class="room-style-btn" title="Style this room →" @click=${(e:Event)=>{
              e.stopPropagation();
              this._setDesignScope({ kind: 'room', name: areaKey }); this._tab = 'design';
            }}>✎</button>
            <button class="room-expand-btn ${isExpanded ? 'open' : ''}" @click=${(e:Event)=>{
              e.stopPropagation();
              const next = new Set(this._expandedRooms);
              next.has(areaKey) ? next.delete(areaKey) : next.add(areaKey);
              this._expandedRooms = next;
            }}>▼</button>
          </div>
          ${isExpanded ? html`
            <div class="room-expanded">
              <!-- Device list. ✎ jumps to Design with that device as the scope. -->
              <div class="room-devices">
                ${devicesInArea.length ? devicesInArea.map(dev => {
                  const isHidden = hiddenDevices.includes(dev.device_id);
                  const hasDevStyle = !!(c.device_styles?.[dev.device_id]);
                  const isDevExpanded = this._selectedDeviceId === dev.device_id;
                  return html`
                    <div class="room-device-row ${isDevExpanded ? 'selected' : ''}">
                      <span class="room-device-name" style="color:${isHidden ? 'var(--t3)' : 'var(--t2)'}">${dev.name}</span>
                      ${hasDevStyle ? html`<span class="dev-style-dot"></span>` : nothing}
                      <label class="sw">
                        <input type="checkbox" .checked=${!isHidden} @change=${() => {
                          const next = isHidden
                            ? hiddenDevices.filter(x => x !== dev.device_id)
                            : [...hiddenDevices, dev.device_id];
                          this._set('hidden_devices', next.length ? next : undefined);
                        }}>
                        <span class="sw-t"></span><span class="sw-b"></span>
                      </label>
                      <button class="fav-btn ${(c.favorites ?? []).includes(dev.device_id) ? 'on' : ''}"
                        title="${(c.favorites ?? []).includes(dev.device_id) ? 'Remove from Favourites' : 'Add to Favourites'}"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          const cur = c.favorites ?? [];
                          const next = cur.includes(dev.device_id)
                            ? cur.filter(id => id !== dev.device_id)
                            : [...cur, dev.device_id];
                          this._set('favorites', next.length ? next : undefined);
                        }}>★</button>
                      ${hasDevStyle ? html`<button class="room-reset-btn" title="Set device style to default"
                        @click=${(e:Event)=>{e.stopPropagation();this._clearDeviceStyle(dev.device_id);}}>↺</button>` : nothing}
                      <button class="room-style-btn" title="Style this device →" @click=${(e: Event) => {
                        e.stopPropagation();
                        this._gotoDevice(dev.device_id);
                      }}>✎</button>
                    </div>`;
                }) : html`<div class="room-device-empty">No devices in this room</div>`}
              </div>
            </div>` : nothing}`;
      })}`;

    // Per-device styling lives in the Design tab; the ✎ shortcuts jump there
    // with that device already selected as the scope.
    const sidePanel = nothing;

    // "What counts as a light" came from the retired Header tab. It is not
    // styling — it decides which entities ARE lights — so it belongs with
    // discovery. This body is bespoke, so the section has to be rendered
    // explicitly; listing it in EDITOR_LAYOUT alone renders nothing.
    const lights = this._globalSectionDescriptors()['lights'];

    return html`
      ${this._renderDiscoverySection()}
      ${lights ? this._sec('lights', lights.icon, lights.bg, lights.fg, lights.label, lights.badge, lights.body) : nothing}
      ${this._renderCloudImportSection()}
      ${this._renderExtraCardsSection()}
      ${this._sec('rooms','⌂','rgba(74,222,128,0.1)','#4ade80','Rooms & devices', roomsBadge, roomBody)}
      ${sidePanel}`;
  }

  // ── Extra cards manager ──────────────────────────────────────────
  private _xcArray(): LovelaceCardConfig[] {
    const c = this._config;
    if (this._xcPlacement === 'header') return c.header_cards ?? [];
    if (this._xcPlacement === 'footer') return c.footer_cards ?? [];
    return (c.area_cards?.[this._xcRoom]) ?? [];
  }

  private _xcSetArray(arr: LovelaceCardConfig[]): void {
    if (this._xcPlacement === 'header') this._set('header_cards', arr.length ? arr : undefined);
    else if (this._xcPlacement === 'footer') this._set('footer_cards', arr.length ? arr : undefined);
    else {
      const map: Record<string, LovelaceCardConfig[]> = { ...(this._config.area_cards ?? {}) };
      if (arr.length) map[this._xcRoom] = arr; else delete map[this._xcRoom];
      this._set('area_cards', Object.keys(map).length ? map : undefined);
    }
  }

  private _xcCancel(): void {
    this._xcAdding = false; this._xcEditIndex = null; this._xcDraft = null; this._xcLatest = null;
    this._xcImportCards = null; this._xcImportLoading = false;
  }

  /** Load the list of storage dashboards the user can copy cards from. */
  private async _xcLoadDashboards(): Promise<void> {
    if (this._xcDashboards) return;
    try {
      const list = await this.hass.callWS<Array<{ url_path: string; title: string; mode: string }>>({ type: 'lovelace/dashboards/list' });
      this._xcDashboards = (list ?? []).filter(d => d.mode === 'storage').map(d => ({ url_path: d.url_path, title: d.title }));
    } catch { this._xcDashboards = []; }
  }

  /** Fetch a dashboard's config and flatten its cards into a pickable list. */
  private async _xcLoadCardsFrom(urlPath: string): Promise<void> {
    if (urlPath === '__none__') { this._xcImportCards = null; return; }
    this._xcImportLoading = true; this._xcImportCards = null;
    try {
      const cfg = await this.hass.callWS<{ views?: Array<Record<string, unknown>> }>(
        urlPath ? { type: 'lovelace/config', url_path: urlPath } : { type: 'lovelace/config' });
      this._xcImportCards = this._collectCards(cfg);
    } catch { this._xcImportCards = []; }
    this._xcImportLoading = false;
  }

  /** Recursively collect every card (including nested stack/grid children). */
  private _collectCards(cfg: { views?: Array<Record<string, unknown>> }): Array<{ config: LovelaceCardConfig; label: string }> {
    const out: Array<{ config: LovelaceCardConfig; label: string }> = [];
    const hintOf = (c: Record<string, unknown>): string => {
      const first = Array.isArray(c.entities) ? c.entities[0] : undefined;
      const cands = [c.name, c.title, c.entity, c.camera_entity, first, c.content];
      for (const v of cands) {
        if (typeof v === 'string' && v.trim()) return ` · ${v.replace(/\s+/g, ' ').slice(0, 34)}`;
        if (v && typeof v === 'object' && typeof (v as { entity?: string }).entity === 'string') return ` · ${(v as { entity: string }).entity.slice(0, 34)}`;
      }
      return '';
    };
    const visit = (c: unknown): void => {
      if (!c || typeof c !== 'object') return;
      const card = c as Record<string, unknown>;
      if (typeof card.type === 'string') out.push({ config: card as LovelaceCardConfig, label: `${card.type}${hintOf(card)}` });
      for (const k of ['cards', 'card']) {
        const v = card[k];
        if (Array.isArray(v)) v.forEach(visit); else if (v && typeof v === 'object') visit(v);
      }
    };
    for (const view of cfg.views ?? []) {
      for (const c of (view.cards as unknown[] ?? [])) visit(c);
      for (const s of (view.sections as Array<Record<string, unknown>> ?? [])) for (const c of (s.cards as unknown[] ?? [])) visit(c);
    }
    return out;
  }

  private _xcCommit(): void {
    const cfg = this._xcLatest ?? this._xcDraft;
    if (!cfg || !cfg.type) return;
    const arr = this._xcArray().slice();
    if (this._xcEditIndex !== null) arr[this._xcEditIndex] = cfg as LovelaceCardConfig;
    else arr.push(cfg as LovelaceCardConfig);
    this._xcSetArray(arr);
    this._xcCancel();
  }

  /** Built-in card types + any custom cards the user has installed. */
  private _cardTypeOptions(): Array<{ value: string; label: string }> {
    const builtin = ['markdown','entities','tile','button','glance','weather-forecast','history-graph',
      'statistics-graph','gauge','sensor','thermostat','light','media-control','picture-entity',
      'picture-glance','area','map','calendar','iframe','vertical-stack','horizontal-stack','grid','conditional'];
    const title = (t: string) => t.replace(/(?:^|-)(\w)/g, (_m, ch, i) => (i ? ' ' : '') + ch.toUpperCase());
    const opts = builtin.map(t => ({ value: t, label: title(t) }));
    const custom = ((window as unknown as { customCards?: Array<{ type: string; name?: string }> }).customCards) ?? [];
    for (const c of custom) opts.push({ value: `custom:${c.type}`, label: `${c.name || c.type} (custom)` });
    return opts;
  }

  // ── Import from Shelly Cloud ─────────────────────────────────────
  // Pulls the user's control.shelly.cloud setup (room photos + official
  // per-model product images) into area_styles / device_styles. The auth key
  // is used for one fetch and cleared — it is never written into the config.

  private async _sciFetch() {
    const server = sciNormalizeServer(this._sciServer);
    if (!server) { this._sciError = 'That does not look like a server address — e.g. shelly-59-eu.shelly.cloud'; return; }
    if (!this._sciKey.trim()) { this._sciError = 'Paste your authorization cloud key first.'; return; }
    this._sciBusy = true; this._sciError = ''; this._sciDone = ''; this._sciData = null;
    try {
      const data = await sciFetchLists(server, this._sciKey.trim());
      // The key's job ends here — the image URLs need no auth. Drop the
      // credential the moment the fetch succeeds so it never lingers in
      // memory while the user works through the mapping.
      this._sciKey = '';
      this._sciData = data;
      const auto = sciMatchRooms(data.rooms, this._getAreas().map(a => a.name));
      const map: Record<number, string> = {};
      for (const r of data.rooms) map[r.id] = auto.get(r.id) ?? '';
      this._sciRoomMap = map;
    } catch (e) {
      this._sciError = e instanceof Error ? e.message : String(e);
    } finally {
      this._sciBusy = false;
    }
  }

  private _sciApply() {
    const data = this._sciData;
    const server = sciNormalizeServer(this._sciServer);
    if (!data || !server || !this._config) return;
    let rooms = 0, devices = 0;
    const updated: Record<string, unknown> = { ...this._config };

    if (this._sciOptRooms) {
      const areaStyles = { ...(this._config.area_styles ?? {}) } as Record<string, Record<string, unknown>>;
      for (const room of data.rooms) {
        const area = this._sciRoomMap[room.id];
        if (!area || !room.image) continue;
        if (!this._sciOptStock && sciIsStockImage(room.image)) continue;
        const url = sciResolveImage(room.image, server, this._sciOptFull);
        if (!url) continue;
        areaStyles[area] = { ...(areaStyles[area] ?? {}), bg_image: url,
          bg_image_mode: (areaStyles[area] as { bg_image_mode?: string } | undefined)?.bg_image_mode ?? 'ambient' };
        rooms++;
      }
      if (Object.keys(areaStyles).length) updated['area_styles'] = areaStyles;
    }

    if (this._sciOptDevices) {
      const registry = Object.values(((this.hass as unknown as { devices?: Record<string, SciRegistryDevice> })?.devices) ?? {});
      const matches = sciMatchDevices(data.devices, registry);
      const deviceStyles = { ...(this._config.device_styles ?? {}) } as Record<string, Record<string, unknown>>;
      for (const dev of data.devices) {
        const mac = sciMac(dev.id);
        if (!mac || !dev.image) continue;
        const url = sciResolveImage(dev.image, server);
        const ids = matches.get(mac);
        if (!url || !ids) continue;
        for (const id of ids) {
          deviceStyles[id] = { ...(deviceStyles[id] ?? {}), bg_image: url,
            bg_image_size: (deviceStyles[id] as { bg_image_size?: string } | undefined)?.bg_image_size ?? 'contain' };
        }
        devices++;
      }
      if (Object.keys(deviceStyles).length) updated['device_styles'] = deviceStyles;
    }

    this._emitConfig(updated as HADeviceDashboardConfig);
    this._sciDone = `Imported ${rooms} room photo${rooms === 1 ? '' : 's'} and product images for ${devices} device${devices === 1 ? '' : 's'}.`;
    this._sciKey = '';        // credential is transient — drop it as soon as it has served
    this._sciData = null;
  }

  private _renderCloudImportSection(): TemplateResult {
    const data = this._sciData;
    const areaNames = this._getAreas().map(a => a.name);
    const registry = Object.values(((this.hass as unknown as { devices?: Record<string, SciRegistryDevice> })?.devices) ?? {});
    const matchCount = data ? sciMatchDevices(data.devices, registry).size : 0;
    const customRooms = data ? data.rooms.filter(r => r.image && !sciIsStockImage(r.image)).length : 0;

    const body = html`
      <div class="dp-hint-inline">Pull your Shelly app setup into this card: each room's photo and the official
        product image for every device. Find both fields at <b>control.shelly.cloud → user settings →
        Authorization cloud key</b>. The key is sent once, directly to Shelly over HTTPS, then wiped —
        it is never saved to the config or anywhere else.</div>
      <div class="field">
        <div class="field-lbl">Cloud server</div>
        <input type="text" class="inline-text" placeholder="shelly-59-eu.shelly.cloud"
          .value=${this._sciServer} @input=${(e: Event) => { this._sciServer = (e.target as HTMLInputElement).value; }}>
      </div>
      <div class="field">
        <div class="field-lbl">Authorization cloud key</div>
        <input type="password" class="inline-text" placeholder="Paste the key…" autocomplete="new-password"
          .value=${this._sciKey} @input=${(e: Event) => { this._sciKey = (e.target as HTMLInputElement).value; }}>
      </div>
      <button class="btn-copy" ?disabled=${this._sciBusy} @click=${() => this._sciFetch()}>
        ${this._sciBusy ? 'Fetching…' : '☁ Fetch my Shelly setup'}</button>
      ${this._sciError ? html`<div class="input-err">${this._sciError}</div>` : nothing}
      ${this._sciDone ? html`<div class="dp-hint-inline">✓ ${this._sciDone}</div>` : nothing}

      ${data ? html`
        <div class="dp-hint-inline" style="margin-top:8px">Found <b>${data.rooms.length}</b> rooms
          (${customRooms} with a custom photo) and <b>${data.devices.length}</b> devices,
          <b>${matchCount}</b> of them matched to Home Assistant devices. Pair each cloud room
          with a room here — unmatched ones are skipped.</div>
        ${data.rooms.map(room => html`
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <span style="flex:1;min-width:0">${room.name}
              ${room.image && !sciIsStockImage(room.image) ? ' 📷' : ''}</span>
            <select class="inline-text" style="flex:1"
              .value=${this._sciRoomMap[room.id] ?? ''}
              @change=${(e: Event) => { this._sciRoomMap = { ...this._sciRoomMap, [room.id]: (e.target as HTMLSelectElement).value }; }}>
              <option value="">— skip —</option>
              ${areaNames.map(n => html`<option value=${n} ?selected=${this._sciRoomMap[room.id] === n}>${n}</option>`)}
            </select>
          </div>`)}
        ${([
          ['Room photos', this._sciOptRooms, (v: boolean) => { this._sciOptRooms = v; }],
          ["Include Shelly's generic stock room images", this._sciOptStock, (v: boolean) => { this._sciOptStock = v; }],
          ['Official product image on every device tile', this._sciOptDevices, (v: boolean) => { this._sciOptDevices = v; }],
          ['Full-size photos (thumbnails when off)', this._sciOptFull, (v: boolean) => { this._sciOptFull = v; }],
        ] as Array<[string, boolean, (v: boolean) => void]>).map(([lbl, val, set]) => html`
          <div class="tog-row" style="border:none;padding:4px 0 0">
            <div class="tog-lbl">${lbl}</div>
            <label class="sw"><input type="checkbox" .checked=${val}
              @change=${(e: Event) => set((e.target as HTMLInputElement).checked)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
          </div>`)}
        <div class="dp-hint-inline">Images stay hosted on Shelly's cloud — nothing is copied into the config.
          A custom room photo's URL is unlisted but not private: anyone with the exact link can view it.</div>
        <button class="btn-copy" @click=${() => this._sciApply()}>⤵ Apply to this card</button>
      ` : nothing}`;

    return this._sec('cloud-import', '☁', 'rgba(62,161,245,0.12)', '#3ea1f5', 'Import from Shelly Cloud',
      this._sciDone ? this._badge('imported', '#3ea1f5', 'rgba(62,161,245,0.12)') : nothing, body);
  }

  private _renderExtraCardsSection(): TemplateResult {
    const arr = this._xcArray();
    const rooms = this._getAreas().map(a => a.name);
    // NB: we deliberately do NOT embed hui-card-element-editor (the visual/form
    // editor). Nested inside our own card editor its events bubble to HA's
    // edit-card dialog, which hijacks and replaces our editor. HA's native YAML
    // editor has no such conflict.
    const yamlAvail = !!customElements.get('ha-yaml-editor');
    const body = html`
      <div class="field">
        <div class="field-lbl">Placement</div>
        <div class="pill-grp">
          ${(['header','footer','room'] as const).map(p => html`
            <span class="pill ${this._xcPlacement === p ? 'on' : ''}"
              @click=${() => { this._xcPlacement = p; this._xcCancel(); if (p === 'room' && !this._xcRoom && rooms.length) this._xcRoom = rooms[0]; }}>
              ${p === 'header' ? 'Header (top)' : p === 'footer' ? 'Footer (bottom)' : 'Room'}</span>`)}
        </div>
        <div class="dp-hint-inline">Header/footer cards frame the whole dashboard; room cards sit inside one room, above its tiles.</div>
      </div>
      ${this._xcPlacement === 'room' ? html`
        <div class="field">
          <div class="field-lbl">Room</div>
          <select @change=${(e: Event) => { this._xcRoom = (e.target as HTMLSelectElement).value; this._xcCancel(); }}>
            ${rooms.map(r => html`<option value=${r} ?selected=${r === this._xcRoom}>${r}</option>`)}
          </select>
        </div>` : nothing}
      <div class="xc-list">
        ${arr.length ? arr.map((card, i) => html`
          <div class="xc-row">
            <span class="xc-type">${(card as { type?: string }).type ?? '?'}</span>
            <button class="xc-btn" @click=${() => { this._xcEditIndex = i; this._xcAdding = false; this._setXcDraft({ ...card }); }}>Edit</button>
            <button class="xc-btn xc-del" @click=${() => { const next = arr.slice(); next.splice(i, 1); this._xcSetArray(next); }}>✕</button>
          </div>`) : html`<div class="dp-hint-inline">No cards here yet.</div>`}
      </div>
      ${!this._xcAdding && this._xcEditIndex === null ? html`
        <button class="sec-toolbar-btn" @click=${() => { this._xcAdding = true; this._xcLoadDashboards(); this._setXcDraft({}); }}>+ Add card</button>` : nothing}
      ${this._xcAdding ? html`
        <div class="field">
          <div class="field-lbl">Copy from a dashboard</div>
          <select @change=${(e: Event) => this._xcLoadCardsFrom((e.target as HTMLSelectElement).value)}>
            <option value="__none__">— choose a dashboard —</option>
            ${(this._xcDashboards ?? []).map(d => html`<option value=${d.url_path}>${d.title}</option>`)}
          </select>
          ${this._xcImportLoading ? html`<div class="dp-hint-inline">Loading cards…</div>` : nothing}
          ${this._xcImportCards ? (this._xcImportCards.length ? html`
            <div class="xc-import-list">
              ${this._xcImportCards.map(c => html`
                <button class="xc-import-row" title="Use this card" @click=${() => this._setXcDraft({ ...c.config })}>${c.label}</button>`)}
            </div>` : html`<div class="dp-hint-inline">No cards found on that dashboard.</div>`) : nothing}
        </div>
        <div class="field">
          <div class="field-lbl">Or start from a card type</div>
          <select @change=${(e: Event) => { const t = (e.target as HTMLSelectElement).value; this._setXcDraft(t ? { type: t } : {}); }}>
            <option value="">— none, paste YAML below —</option>
            ${this._cardTypeOptions().map(o => html`<option value=${o.value}>${o.label}</option>`)}
          </select>
          <div class="dp-hint-inline">Copy a card from another dashboard above, pick a type, or paste a card's full YAML below (with its own <code>type:</code>).</div>
        </div>` : nothing}
      ${this._xcDraft ? html`
        <div class="field">
          <div class="field-lbl">Card configuration (YAML)</div>
          ${keyed(this._xcDraftKey, yamlAvail ? html`
            <ha-yaml-editor .hass=${this.hass} .defaultValue=${this._xcDraft}
              @value-changed=${(e: CustomEvent) => { e.stopPropagation(); if (e.detail?.isValid !== false) this._xcLatest = e.detail.value; }}></ha-yaml-editor>`
          : html`
            <textarea class="xc-yaml" .value=${JSON.stringify(this._xcDraft, null, 2)}
              @input=${(e: Event) => { try { this._xcLatest = JSON.parse((e.target as HTMLTextAreaElement).value); } catch { /* keep last valid */ } }}></textarea>`)}
          <div class="xc-actions">
            <button class="sec-toolbar-btn" @click=${() => this._xcCommit()}>${this._xcEditIndex !== null ? 'Save' : 'Add'}</button>
            <button class="sec-toolbar-btn" @click=${() => this._xcCancel()}>Cancel</button>
          </div>
        </div>` : nothing}`;
    const badge = arr.length ? this._badge(String(arr.length), '#8aa0ff', 'rgba(120,140,255,0.12)') : nothing;
    return this._sec('extra-cards', '▤', 'rgba(120,140,255,0.12)', '#8aa0ff', 'Extra cards', badge, body);
  }

  /** A collapsible checkbox list. `options` = {value,label}; `hidden` = the set
   *  of values currently checked (hidden). Toggling writes back the new array. */
  private _renderCheckDropdown(
    id: string,
    label: string,
    options: Array<{ value: string; label: string }>,
    hidden: string[],
    onChange: (next: string[] | undefined) => void,
    hint: string,
  ): TemplateResult {
    const open = this._openDiscDropdown === id;
    const hidSet = new Set(hidden);
    const n = hidSet.size;
    const toggle = (value: string) => {
      const next = hidSet.has(value) ? hidden.filter(v => v !== value) : [...hidden, value];
      onChange(next.length ? next : undefined);
    };
    return html`
      <div class="field">
        <div class="field-lbl">${label}</div>
        <button class="check-dd-btn ${open ? 'open' : ''}"
          @click=${() => { this._openDiscDropdown = open ? null : id; }}>
          <span>${n ? `${n} hidden` : 'None hidden'}</span><span class="check-dd-caret">▾</span>
        </button>
        ${open ? html`
          <div class="check-dd-panel">
            ${options.length ? html`
              <div class="check-dd-head">
                <span class="check-dd-count">${n} of ${options.length} hidden</span>
                <span class="sel-allnone">
                  <button type="button" class="sel-mini" title="Hide every one of these"
                    @click=${() => onChange(options.map(o => o.value))}>Hide all</button>
                  <button type="button" class="sel-mini" title="Hide none of these"
                    @click=${() => onChange(undefined)}>Clear</button>
                </span>
              </div>` : nothing}
            ${options.length ? options.map(o => html`
              <label class="check-dd-row">
                <input type="checkbox" .checked=${hidSet.has(o.value)}
                  @change=${() => toggle(o.value)}>
                <span>${o.label}</span>
              </label>`)
              : html`<div class="check-dd-empty">Nothing discovered.</div>`}
          </div>` : nothing}
        <div class="dp-hint-inline">${hint}</div>
      </div>`;
  }

  /** Energy-window pills (Total/Today/Week/Month). `includeInherit` adds an
   *  Inherit option (undefined) for per-room / per-device overrides. */
  private _renderEnergyPeriodPicker(
    current: EnergyPeriod | undefined,
    onChange: (v: EnergyPeriod | undefined) => void,
    includeInherit = false,
  ): TemplateResult {
    const opts: Array<[string, EnergyPeriod | undefined]> = includeInherit
      ? [['Inherit', undefined], ['Total', 'total'], ['Today', 'today'], ['Week', 'week'], ['Month', 'month']]
      : [['Total', 'total'], ['Today', 'today'], ['Week', 'week'], ['Month', 'month']];
    const cur = current ?? (includeInherit ? undefined : 'total');
    return html`
      <div class="pill-grp">
        ${opts.map(([lbl, v]) => html`
          <span class="pill ${cur === v ? 'on' : ''}" @click=${() => onChange(v)}>${lbl}</span>`)}
      </div>`;
  }

  /** Discovery section — Shelly vs Universal mode, scope, and hide-checklists. */
  private _renderDiscoverySection(): TemplateResult {
    const c = this._config;
    const universal = c.mode === 'universal';
    const scope = c.universal_scope ?? 'devices';
    const sources = this.hass ? getDiscoverySources(this.hass) : { integrations: [], domains: [] };
    const body = html`
      <div class="field">
        <div class="field-lbl">Discovery mode</div>
        <div class="pill-grp">
          <span class="pill ${!universal ? 'on' : ''}" @click=${() => this._set('mode', undefined)}>Shelly only</span>
          <span class="pill ${universal ? 'on' : ''}" @click=${() => this._set('mode', 'universal')}>Universal</span>
        </div>
        <div class="dp-hint-inline">Shelly only discovers Shelly + BTHome devices (the original behaviour). Universal discovers every device in Home Assistant — Shelly devices keep their full-fidelity detection.</div>
      </div>
      ${universal ? html`
        <div class="field">
          <div class="field-lbl">Scope</div>
          <div class="pill-grp">
            ${(['devices', 'controllable', 'all'] as const).map((v, i) => html`
              <span class="pill ${scope === v ? 'on' : ''}"
                @click=${() => this._set('universal_scope', v === 'devices' ? undefined : v)}>
                ${['Real devices', 'Controllable', 'Everything'][i]}</span>`)}
          </div>
          <div class="dp-hint-inline">Real devices = things you can control plus real sensors (drops routers, PCs, phones). Controllable = only devices with controls. Everything = every discovered device.</div>
        </div>
        ${this._renderCheckDropdown('disc-int', 'Hide integrations',
          sources.integrations.map(p => ({ value: p, label: getIntegrationLabel(p) })),
          c.exclude_integrations ?? [],
          (next) => this._set('exclude_integrations', next),
          'Tick the integrations to drop. The built-in list (phones, browsers, routers…) is always hidden on top of these.')}
        ${this._renderCheckDropdown('disc-dom', 'Hide entity types',
          sources.domains.map(d => ({ value: d, label: d })),
          c.exclude_domains ?? [],
          (next) => this._set('exclude_domains', next),
          'Tick the entity domains to drop entirely (e.g. update, camera).')}
      ` : nothing}`;
    const badge = this._badge(universal ? 'Universal' : 'Shelly',
      universal ? '#c98a63' : '#4ade80',
      universal ? 'rgba(201,138,99,0.12)' : 'rgba(74,222,128,0.1)');
    return this._sec('discovery', '◎', 'rgba(201,138,99,0.12)', '#c98a63', 'Discovery', badge, body);
  }

  private _setDeviceStyle(deviceId: string, patch: Partial<{
    theme: ThemePreset | undefined;
    color: string | undefined;
    tile_layout: TileLayout | undefined;
    profile: DeviceProfile | undefined;
    tile_style: TileStyle | undefined;
    power_monitor_variant: PowerMonitorVariant | undefined;
    tile_icon: string | undefined;
    tile_icon_off: string | undefined;
    tile_icon_speed: number | undefined;
    entity_animations: Record<string, { on?: string; off?: string; speed?: number }> | undefined;
    sensors: string[] | undefined;
    show_graphs: boolean | undefined;
    elements: Record<string, boolean> | undefined;
    bg_image: string | undefined;
    bg_image_size: 'cover' | 'contain' | 'stretch' | undefined;
    energy_period: EnergyPeriod | undefined;
    energy_entity: string | undefined;
    input_actions: Record<string, InputActionConfig> | undefined;
  }>) {
    const current = this._config.device_styles?.[deviceId] ?? {};
    const next: Record<string, unknown> = { ...current, ...patch };
    if (next['energy_period'] === undefined) delete next['energy_period'];
    if (next['energy_entity'] === undefined) delete next['energy_entity'];
    if (next['bg_image'] === undefined) delete next['bg_image'];
    if (next['bg_image_size'] === undefined) delete next['bg_image_size'];
    if (next['color'] === undefined) delete next['color'];
    if (next['tile_layout'] === undefined) delete next['tile_layout'];
    if (next['profile'] === undefined) delete next['profile'];
    if (next['tile_style'] === undefined) delete next['tile_style'];
    if (next['power_monitor_variant'] === undefined) delete next['power_monitor_variant'];
    if (next['tile_icon'] === undefined) delete next['tile_icon'];
    if (next['tile_icon_off'] === undefined) delete next['tile_icon_off'];
    if (next['tile_icon_speed'] === undefined) delete next['tile_icon_speed'];
    if (next['entity_animations'] === undefined) delete next['entity_animations'];
    if (next['input_actions'] === undefined) delete next['input_actions'];
    if (next['sensors'] === undefined) delete next['sensors'];
    if (next['show_graphs'] === undefined) delete next['show_graphs'];
    if (next['elements'] === undefined) delete next['elements'];
    const allStyles = { ...(this._config.device_styles ?? {}), [deviceId]: next };
    if (!Object.keys(next).length) delete allStyles[deviceId];
    this._set('device_styles', Object.keys(allStyles).length ? allStyles : undefined);
  }

  /** Per-device-TYPE style writer ("All relays") — mirrors _setDeviceStyle but on
   *  profile_styles[type]. A subset of DeviceStyle (no per-entity animations). */
  private _setProfileStyle(profileType: DeviceProfile, patch: Partial<{
    theme: ThemePreset | undefined;
    energy_period: EnergyPeriod | undefined;
    color: string | undefined;
    tile_layout: TileLayout | undefined;
    tile_style: TileStyle | undefined;
    power_monitor_variant: PowerMonitorVariant | undefined;
    sensors: string[] | undefined;
    show_graphs: boolean | undefined;
    elements: Record<string, boolean> | undefined;
  }>) {
    const current = this._config.profile_styles?.[profileType] ?? {};
    const next: Record<string, unknown> = { ...current, ...patch };
    for (const k of ['color', 'tile_layout', 'tile_style', 'power_monitor_variant', 'sensors', 'show_graphs', 'elements']) {
      if (next[k] === undefined) delete next[k];
    }
    const all: Record<string, unknown> = { ...(this._config.profile_styles ?? {}), [profileType]: next };
    if (!Object.keys(next).length) delete all[profileType];
    this._set('profile_styles', Object.keys(all).length ? all : undefined);
  }

  /** Config key for a new style name. The key is the style's identity — every
   *  assignment is `custom:<slug>` — so it must never collide with an existing
   *  one, and renaming later changes only the label. */
  private _styleSlug(name: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'style';
    const taken = this._config.custom_styles ?? {};
    if (!taken[base]) return base;
    let n = 2;
    while (taken[`${base}-${n}`]) n++;
    return `${base}-${n}`;
  }

  /** Snapshot a style scope's current look into a reusable named style, then point
   *  that scope at it. `fallbackBase` is what the scope renders as when it has no
   *  tile_style of its own (profile recommendation, or 'default'). */
  private _saveAsStyle(src: DeviceStyle, fallbackBase: TileStyle, assign: (v: TileStyle) => void): void {
    const name = this._newStyleName.trim();
    if (!name) return;
    const slug = this._styleSlug(name);
    const raw = src.tile_style;
    // Saving a scope that already uses a custom style inherits that style's base,
    // not the fallback — otherwise the snapshot silently changes how it renders.
    const base: TileStyle = typeof raw === 'string' && raw.startsWith('custom:')
      ? (this._config.custom_styles?.[raw.slice(7)]?.base ?? fallbackBase)
      : (raw ?? fallbackBase);
    const def: CustomStyleDef = { label: name, base };
    if (src.power_monitor_variant) def.variant = src.power_monitor_variant;
    if (src.elements) def.elements = { ...src.elements };
    if (src.sensors) def.sensors = [...src.sensors];
    if (src.tile_layout) def.tile_layout = cloneTileLayout(src.tile_layout);
    this._set('custom_styles', { ...(this._config.custom_styles ?? {}), [slug]: def });
    assign(`custom:${slug}` as TileStyle);
    this._newStyleName = '';
  }

  /** Save the selected device's current look as a reusable named style. */
  private _saveDeviceAsStyle(deviceId: string): void {
    const dev = this._allDevices().find(d => d.device_id === deviceId);
    const profile = dev ? getDeviceProfile(dev) : null;
    const fallback = (this._config.smart_tile_styles && profile && dev
      ? profileDefaultTileStyle(profile.type, dev) : undefined) ?? 'default';
    this._saveAsStyle(this._config.device_styles?.[deviceId] ?? {}, fallback,
      v => this._setDeviceStyle(deviceId, { tile_style: v }));
  }

  /** Save a whole device type's look ("All relays") as a reusable named style. */
  private _saveProfileAsStyle(profileType: DeviceProfile): void {
    const fallback = PROFILE_DEFAULT_TILE_STYLE[profileType] ?? 'default';
    this._saveAsStyle(this._config.profile_styles?.[profileType] ?? {}, fallback,
      v => this._setProfileStyle(profileType, { tile_style: v }));
  }

  /** Rename = relabel. The slug stays put, so every `custom:<slug>` assignment
   *  keeps resolving. */
  private _renameCustomStyle(key: string, label: string): void {
    const name = label.trim();
    const def = this._config.custom_styles?.[key];
    this._renamingStyle = null;
    if (!def || !name || name === def.label) return;
    this._set('custom_styles', { ...(this._config.custom_styles ?? {}), [key]: { ...def, label: name } });
  }

  private _deleteCustomStyle(key: string): void {
    const val = `custom:${key}` as TileStyle;
    const cs = { ...(this._config.custom_styles ?? {}) };
    delete cs[key];
    this._set('custom_styles', Object.keys(cs).length ? cs : undefined);

    // Strip every assignment that pointed at it. A dangling `custom:<key>` still
    // resolves — to 'default' — so leaving one behind silently restyles the tile
    // instead of falling back to the profile recommendation.
    const clean = <T extends { tile_style?: TileStyle }>(m: Record<string, T> | undefined) => {
      if (!m || !Object.values(m).some(v => v.tile_style === val)) return null;
      const out: Record<string, T> = {};
      for (const [k, v] of Object.entries(m)) {
        const n = { ...v };
        if (n.tile_style === val) delete n.tile_style;
        if (Object.keys(n).length) out[k] = n;
      }
      return Object.keys(out).length ? out : undefined;
    };
    const ds = clean(this._config.device_styles);
    if (ds !== null) this._set('device_styles', ds);
    const ps = clean(this._config.profile_styles as Record<string, DeviceStyle> | undefined);
    if (ps !== null) this._set('profile_styles', ps);
    const as = clean(this._config.area_styles);
    if (as !== null) this._set('area_styles', as);

    if (this._config.views?.some(v => v.tile_style === val)) {
      this._set('views', this._config.views.map(v => {
        if (v.tile_style !== val) return v;
        const n = { ...v };
        delete n.tile_style;
        return n;
      }));
    }
    if (this._config.tile_style === val) this._set('tile_style', undefined);
    this._flushConfig();
  }

  /** Shared tile-style grid + power-monitor variant pills for the per-device and
   *  per-room style panels. Same options everywhere; callers wire the config scope
   *  via the onStyle/onVariant setters. `recommended` (device profile) only drives
   *  whether the variant row shows before an explicit style is picked. */
  private _renderTileStylePicker(
    current: TileStyle | undefined,
    variant: PowerMonitorVariant,
    recommended: TileStyle | undefined,
    onStyle: (v: TileStyle | undefined) => void,
    onVariant: (v: PowerMonitorVariant | undefined) => void,
    graphs?: boolean | undefined,
    onGraphs?: (v: boolean | undefined) => void,
  ): TemplateResult {
    const cur = current ?? 'default';
    const showVariant = cur === 'power-monitor' || (!current && recommended === 'power-monitor');
    // The Gauge (arcs) and Graph (sparklines) variants are really one choice with
    // three faces — arcs, sparklines, or both — because the gauge's companion
    // graphs are the show_graphs-gated lower body. When the caller wires a graphs
    // setter we surface that as a single "Display" control and demote the other
    // layouts (Number/Compact/Table) to a secondary row.
    const threeWay = showVariant && !!onGraphs;
    // Graphs default OFF (cascade.showGraphs), so an unset value reads as Circles.
    const DISPLAY_MODES = [
      { k: 'circles', label: '◉ Circles', on: variant === 'gauge' && graphs !== true },
      { k: 'graphs',  label: '∿ Graphs',  on: variant === 'graph' },
      { k: 'both',    label: '◉∿ Both',   on: variant === 'gauge' && graphs === true },
    ] as const;
    const pickDisplay = (k: string) => {
      if (k === 'circles')      { onVariant('gauge'); onGraphs!(false); }
      else if (k === 'graphs')  { onVariant('graph'); onGraphs!(undefined); }
      else                      { onVariant('gauge'); onGraphs!(true); }
    };
    const moreLayouts = threeWay
      ? PM_VARIANT_OPTIONS.filter(o => o.v !== 'gauge' && o.v !== 'graph')
      : PM_VARIANT_OPTIONS;
    return html`
      <div class="ts-style-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">
        ${TILE_STYLE_OPTIONS.map(opt => html`
          <button class="ts-style-btn ${cur === opt.v ? 'on' : ''}"
            @click=${() => onStyle(opt.v === 'default' ? undefined : opt.v)}>
            <span class="ts-style-icon">${opt.icon}</span>
            <span class="ts-style-label">${opt.label}</span>
            <span class="ts-style-desc">${opt.desc}</span>
          </button>`)}
      </div>
      ${(() => {
        const customs = Object.entries(this._config.custom_styles ?? {});
        if (!customs.length) return nothing;
        return html`
          <div class="field-lbl" style="margin-top:8px">Saved styles</div>
          <div class="pill-grp">
            ${customs.map(([key, def]) => {
              const val = `custom:${key}` as TileStyle;
              if (this._renamingStyle === key) {
                return html`<input type="text" class="inline-text" style="width:9em"
                  .value=${def.label || key}
                  @click=${(e: Event) => e.stopPropagation()}
                  @blur=${(e: Event) => this._renameCustomStyle(key, (e.target as HTMLInputElement).value)}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === 'Enter') this._renameCustomStyle(key, (e.target as HTMLInputElement).value);
                    if (e.key === 'Escape') {
                      // Reset the field first so the blur that fires when this input
                      // is removed is a no-op (rename bails on an unchanged label).
                      (e.target as HTMLInputElement).value = def.label || key;
                      this._renamingStyle = null;
                    }
                  }}
                  @focus=${(e: Event) => (e.target as HTMLInputElement).select()}
                  ${ref((el?: Element) => (el as HTMLInputElement | undefined)?.focus())}/>`;
              }
              return html`<span class="pill ${current === val ? 'on' : ''}" @click=${() => onStyle(val)}>
                ${def.label || key}
                <span title="Rename style" style="margin-left:6px;cursor:pointer;opacity:.7"
                  @click=${(e: Event) => { e.stopPropagation(); this._renamingStyle = key; }}>✎</span>
                <span title="Delete style" style="margin-left:4px;cursor:pointer;opacity:.7"
                  @click=${(e: Event) => { e.stopPropagation(); this._deleteCustomStyle(key); }}>×</span>
              </span>`;
            })}
          </div>`;
      })()}
      ${threeWay ? html`
        <div class="field-lbl" style="margin-top:8px">Display</div>
        <div class="pill-grp">
          ${DISPLAY_MODES.map(m => html`
            <span class="pill ${m.on ? 'on' : ''}" @click=${() => pickDisplay(m.k)}>${m.label}</span>`)}
        </div>
        <div class="hint" style="margin-top:2px">Circles = arc gauges · Graphs = sparklines · Both = arcs with sparklines below</div>` : nothing}
      ${showVariant ? html`
        <div class="field-lbl" style="margin-top:8px">${threeWay ? 'More layouts' : 'Power monitor variant'}</div>
        <div class="pill-grp">
          ${moreLayouts.map(opt => html`
            <span class="pill ${variant === opt.v ? 'on' : ''}"
              @click=${() => onVariant(opt.v === 'big-number' ? undefined : opt.v)}>
              ${opt.icon} ${opt.label}
            </span>`)}
        </div>` : nothing}`;
  }


  /** Max blocks that can share one row before it gets too cramped to read. */
  private static readonly ROW_MAX = 3;
  /** Pointer travel before a press becomes a drag, so a tap isn't a move. */
  private static readonly DRAG_SLOP = 6;

  /** Schematic mock of one block for the layout canvas's live preview. */
  private _blockPreview(id: TileBlockId, accent: string): TemplateResult | typeof nothing {
    switch (id) {
      case 'name_row': return html`<div class="tp-row tp-name-row"><div class="tp-dot" style="background:#4ade80"></div><span class="tp-tog" style="background:${accent}">ON</span><span class="tp-name">Ceiling light</span></div>`;
      case 'sensors':  return html`<div class="tp-row tp-chips"><span class="tp-chip">4.1 W</span><span class="tp-chip">235 V</span><span class="tp-chip">44.6 °C</span><span class="tp-chip">−54 dBm</span></div>`;
      case 'graph':    return html`<div class="tp-row"><svg viewBox="0 0 200 28" preserveAspectRatio="none" style="width:100%;height:28px;display:block"><polygon points="0,24 25,20 50,22 75,15 100,17 125,11 150,13 175,7 200,5 200,28 0,28" fill="${accent}" fill-opacity="0.15"/><polyline points="0,24 25,20 50,22 75,15 100,17 125,11 150,13 175,7 200,5" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/></svg></div>`;
      case 'dimmer':   return html`<div class="tp-row" style="gap:8px"><span class="tp-lbl">Brightness</span><div class="tp-strack"><div class="tp-sfill" style="width:68%;background:${accent}"></div></div><span class="tp-val">68%</span></div>`;
      case 'cover_controls':  return html`<div class="tp-row" style="gap:4px"><button class="tp-btn">▲</button><button class="tp-btn">■</button><button class="tp-btn">▼</button></div>`;
      case 'trv_control':     return html`<div class="tp-row" style="gap:8px"><svg viewBox="0 0 80 44" style="width:60px;height:34px;flex-shrink:0"><path d="M 8 40 A 32 32 0 1 1 72 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6" stroke-linecap="round"/><path d="M 8 40 A 32 32 0 0 1 52 10" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/><text x="40" y="34" text-anchor="middle" font-size="11" font-weight="700" fill="white">21°</text></svg><span class="tp-val">Now 20°</span></div>`;
      case 'valve_controls':  return html`<div class="tp-row" style="gap:4px"><button class="tp-btn">Open</button><button class="tp-btn">Close</button></div>`;
      case 'input_channels':  return html`<div class="tp-row tp-chips"><span class="tp-chip" style="color:${accent}">● CH1</span><span class="tp-chip">○ CH2</span></div>`;
      case 'relay_channels':  return html`<div class="tp-row tp-chips"><span class="tp-chip" style="background:${accent}20;color:${accent}">CH1 ON</span><span class="tp-chip">CH2 OFF</span></div>`;
      case 'power_bar':       return html`<div class="tp-row" style="gap:8px"><div class="tp-strack" style="flex:1"><div class="tp-sfill" style="width:22%;background:${accent}"></div></div><span class="tp-val">4.1 W</span></div>`;
      case 'virtual_controls':return html`<div class="tp-row tp-chips"><span class="tp-chip">Mode ▾</span><span class="tp-chip" style="background:${accent}20;color:${accent}">Script</span></div>`;
      case 'delegated_controls': return html`<div class="tp-row" style="gap:6px"><span class="tp-lbl">🔒 Front door</span><div class="tp-strack" style="flex:1"><div class="tp-sfill" style="width:100%;background:${accent}20"></div></div><span class="tp-val">Locked</span></div>`;
      case 'badges':          return html`<div class="tp-row tp-chips"><span class="tp-chip" style="background:rgba(234,179,8,.18);color:#fde047">Dimmer</span><span class="tp-chip" style="background:rgba(34,197,94,.18);color:#86efac">G3</span></div>`;
      default: return nothing;
    }
  }

  /**
   * In-flight layout drag. Deliberately NOT @state: mutating reactive state
   * mid-drag re-renders the canvas, replacing the chip element and silently
   * dropping its pointer capture. Hover feedback is applied straight to the DOM
   * for the same reason.
   */
  private _layDrag: {
    from: { r: number; i: number };
    chip: HTMLElement;
    x: number; y: number;
    pointerId: number;
    active: boolean;
    over: HTMLElement | null;
  } | null = null;

  /** Set on every canvas render — the current scope's move-and-commit closure. */
  private _layMove: ((from: { r: number; i: number }, to: { r: number } | 'new' | 'hide') => void) | null = null;

  private _layPointerDown(e: PointerEvent, r: number, i: number): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const chip = e.currentTarget as HTMLElement;
    // Capture keeps pointermove/up on the chip once the finger leaves it. Throws
    // if the pointer is already gone — harmless, the drag just won't track.
    try { chip.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    this._layDrag = { from: { r, i }, chip, x: e.clientX, y: e.clientY, pointerId: e.pointerId, active: false, over: null };
  }

  /** The drop target under the pointer, or null. */
  private _layTargetAt(x: number, y: number): HTMLElement | null {
    const el = this.shadowRoot?.elementFromPoint(x, y) as HTMLElement | null;
    return el?.closest('.lay-row, .lay-palette') ?? null;
  }

  private _layPointerMove(e: PointerEvent): void {
    const d = this._layDrag;
    if (!d || e.pointerId !== d.pointerId) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < HADeviceDashboardEditor.DRAG_SLOP) return;
      d.active = true;
      d.chip.classList.add('lay-dragging');
      // Take the chip out of hit-testing so elementFromPoint sees the row beneath.
      d.chip.style.pointerEvents = 'none';
    }
    e.preventDefault();
    const over = this._layTargetAt(e.clientX, e.clientY);
    if (over !== d.over) {
      d.over?.classList.remove('lay-over');
      over?.classList.add('lay-over');
      d.over = over;
    }
  }

  private _layPointerUp(e: PointerEvent): void {
    const d = this._layDrag;
    if (!d || e.pointerId !== d.pointerId) return;
    const over = d.active ? this._layTargetAt(e.clientX, e.clientY) : null;
    const from = d.from;
    this._layDragEnd();
    if (!over || !this._layMove) return;   // released outside any target — no change
    if (over.classList.contains('lay-palette')) this._layMove(from, 'hide');
    else if (over.classList.contains('lay-new')) this._layMove(from, 'new');
    else {
      const rows = [...(this.shadowRoot?.querySelectorAll('.lay-canvas .lay-row:not(.lay-new)') ?? [])];
      const r = rows.indexOf(over);
      if (r >= 0) this._layMove(from, { r });
    }
  }

  private _layDragEnd(): void {
    const d = this._layDrag;
    if (!d) return;
    d.chip.classList.remove('lay-dragging');
    d.chip.style.removeProperty('pointer-events');
    d.over?.classList.remove('lay-over');
    try { d.chip.releasePointerCapture(d.pointerId); } catch { /* already gone */ }
    this._layDrag = null;
  }

  /** The built-in style a raw tile_style renders as, unwrapping `custom:<key>`.
   *  Only the 'default' base is composed from blocks — the rest are monolithic
   *  renderers shaped by element toggles, so the layout canvas doesn't apply. */
  private _baseStyleOf(raw: TileStyle | undefined): TileStyle | undefined {
    if (typeof raw === 'string' && raw.startsWith('custom:')) {
      return this._config.custom_styles?.[raw.slice(7)]?.base ?? 'default';
    }
    return raw;
  }

  /**
   * Drag-and-drop tile layout canvas. Blocks live in rows; a row holds up to
   * ROW_MAX blocks side by side. Dragging a block onto another row moves it, onto
   * "new row" gives it its own line, and into the palette hides it.
   *
   * `inherited` is what the scope renders when it sets no layout of its own — the
   * canvas starts from it, and Reset returns to it by clearing the override.
   */
  private _renderLayoutCanvas(
    current: TileLayout | undefined,
    inherited: TileLayout,
    apply: (layout: TileLayout | undefined) => void,
    /** When set, the palette only offers blocks that can render for this device.
     *  Blocks already placed on the tile always stay draggable. */
    only?: Set<TileBlockId>,
  ): TemplateResult {
    const rows = normalizeTileLayout(current ?? inherited)!;
    const used = new Set(rows.flat());
    const hidden = TILE_BLOCKS.map(b => b.id)
      .filter(id => !used.has(id) && (!only || only.has(id)));
    const label = (id: TileBlockId) => TILE_BLOCKS.find(b => b.id === id)?.label ?? id;

    const move = (from: { r: number; i: number }, to: { r: number } | 'new' | 'hide') => {
      const next = rows.map(r => [...r]);
      let blockId: TileBlockId;
      if (from.r < 0) {
        blockId = hidden[from.i];                       // dragged out of the palette
      } else {
        blockId = next[from.r][from.i];
        next[from.r].splice(from.i, 1);                 // lift it out of its old row
      }
      if (to === 'new') {
        next.push([blockId]);
      } else if (to !== 'hide') {
        const target = next[to.r];
        // A full row pushes the block onto a fresh row just below it, rather than
        // silently refusing the drop.
        if (!target) next.push([blockId]);
        else if (target.length < HADeviceDashboardEditor.ROW_MAX) target.push(blockId);
        else next.splice(to.r + 1, 0, [blockId]);
      }
      const cleaned = next.filter(r => r.length > 0);
      apply(cleaned.length ? cleaned : undefined);
    };

    // Pointer events, not the HTML5 drag-and-drop API: dragstart/drop never fire
    // from touch input, so a DnD canvas is dead on a phone. Pointer events cover
    // mouse, touch and pen through one path.
    this._layMove = move;

    const chip = (id: TileBlockId, r: number, i: number) => html`
      <span class="lay-chip ${r < 0 ? 'off' : ''}"
        @pointerdown=${(e: PointerEvent) => this._layPointerDown(e, r, i)}
        @pointermove=${(e: PointerEvent) => this._layPointerMove(e)}
        @pointerup=${(e: PointerEvent) => this._layPointerUp(e)}
        @pointercancel=${() => this._layDragEnd()}>${label(id)}</span>`;

    const accent = this._config.style?.accent_color ?? '#f4601e';

    return html`
      <div class="field" style="margin-top:10px">
        <div class="field-lbl" style="display:flex;align-items:center;gap:6px">
          Tile layout
          ${current ? this._resetBtn(true, () => apply(undefined)) : nothing}
        </div>
        <div class="tile-preview-live" style="--accent:${accent}">
          ${rows.length
            ? rows.map(r => html`<div class="tp-prow">${r.map(b => this._blockPreview(b, accent))}</div>`)
            : html`<div style="color:var(--t3);font-size:11px;padding:8px;text-align:center">All blocks hidden</div>`}
        </div>
        <div class="lay-canvas">
          ${rows.map((r, ri) => html`
            <div class="lay-row">
              ${r.map((b, bi) => chip(b, ri, bi))}
              ${r.length < HADeviceDashboardEditor.ROW_MAX
                ? html`<span class="lay-slot">drop here</span>` : nothing}
            </div>`)}
          <div class="lay-row lay-new">＋ new row</div>
        </div>
        <div class="field-lbl" style="margin-top:6px">Hidden blocks</div>
        <div class="lay-palette">
          ${hidden.length
            ? hidden.map((b, i) => chip(b, -1, i))
            : html`<span class="dev-style-hint">drag a block here to hide it</span>`}
        </div>
        <div class="hint" style="margin-top:6px">
          Blocks on the same row sit side by side. A block that doesn't apply to the
          device renders nothing, and a row of only those collapses. The graph block
          also needs Show graphs on.
        </div>
      </div>`;
  }

  /** Per-style element visibility toggles. `cur` is the current elements map for
   *  the active scope; `apply` persists the next map (device or profile). Only
   *  shown for alt styles that expose elements ('default' uses blocks). */
  private _renderStyleElementToggles(
    style: TileStyle,
    cur: Record<string, boolean>,
    apply: (elements: Record<string, boolean> | undefined) => void,
  ): TemplateResult {
    const els = STYLE_ELEMENTS[style];
    if (!els) return html``;
    // Each switch is seeded from what the element resolves to when THIS scope
    // says nothing — the rungs above it, not the table default. Comparing the
    // click against that inherited value (not the default) is what makes an
    // inherited `true` switchable OFF at a narrower scope: matching the
    // inherited value drops the override, differing writes it, in either
    // direction.
    const inh = (el: { id: string; def?: boolean }) =>
      this._inheritedElementValue(style, el.id, el.def ?? true);
    const setEl = (el: { id: string; def?: boolean }, visible: boolean) => {
      const next = { ...cur };
      if (visible === inh(el)) delete next[el.id]; else next[el.id] = visible;
      apply(Object.keys(next).length ? next : undefined);
    };
    return html`
      <div class="field" style="margin-top:10px">
        <div class="field-lbl" style="display:flex;align-items:center;gap:6px">
          Show elements <span class="dev-style-hint">${style}</span>
        </div>
        ${els.map(el => html`
          <div class="tog-row" style="border:none;padding:3px 0">
            <div class="tog-lbl">${el.label}</div>
            <label class="sw"><input type="checkbox" .checked=${cur[el.id] ?? inh(el)}
              @change=${(e: Event) => setEl(el, (e.target as HTMLInputElement).checked)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
          </div>`)}
      </div>`;
  }

  /** Per-room header-chip picker. Offers only metrics whose sensor is present in
   *  the room; Power is one of the chips (on by default), not a fixed meta-row value. */
  private _renderRoomHeaderChips(name: string, st: AreaStyle): TemplateResult {
    const roomDevices = this._allDevices().filter(d => (d.area ?? '') === name);
    const present = new Set<string>();
    for (const d of roomDevices) for (const e of d.entities) {
      if (e.domain !== 'sensor') continue;
      const dc = ((e.attributes as any)?.device_class as string) ?? '';
      const def = AREA_CHIP_DEFS.find(x =>
        x.dc === dc || (x.key === 'rssi' && (dc === 'signal_strength' || e.entity_id.includes('_rssi'))));
      if (def) present.add(def.key);
    }
    const defs = AREA_CHIP_DEFS.filter(d => present.has(d.key));
    if (!defs.length) return html`<div class="hint" style="margin:2px 2px 6px">No summary sensors in this room.</div>`;
    // Inherited baseline: the global area_header_chips, or the built-in default.
    const inherited = this._config.area_header_chips ?? DEFAULT_AREA_HEADER_CHIPS;
    const sel = st.header_chips ?? inherited;
    const isDefault = (arr: string[]) =>
      arr.length === inherited.length && inherited.every(k => arr.includes(k));
    return html`
      <div class="field" style="margin-bottom:4px">
        ${st.header_chips !== undefined
          ? html`<button class="color-reset" style="margin-bottom:4px" @click=${() => this._setAreaStyle(name, 'header_chips', undefined)}>↺ Default</button>`
          : nothing}
        <div class="pill-grp">
          ${defs.map(def => {
            const on = sel.includes(def.key);
            return html`<span class="pill ${on ? 'on' : ''}" @click=${() => {
              const next = on ? sel.filter(k => k !== def.key) : [...sel, def.key];
              this._setAreaStyle(name, 'header_chips', isDefault(next) ? undefined : next);
            }}>${def.label}</span>`;
          })}
        </div>
        <div class="hint" style="margin-top:4px">Which summary chips this room's header shows. Power is on by default — toggle it off if you don't want it.</div>
      </div>`;
  }

  /** Global default for every room header's summary chips (config.area_header_chips).
   *  A per-room `header_chips` overrides it; the built-in default backs it. */
  private _renderGlobalRoomHeaderChips(): TemplateResult {
    const present = new Set<string>();
    for (const d of this._allDevices()) for (const e of d.entities) {
      if (e.domain !== 'sensor') continue;
      const dc = ((e.attributes as any)?.device_class as string) ?? '';
      const def = AREA_CHIP_DEFS.find(x =>
        x.dc === dc || (x.key === 'rssi' && (dc === 'signal_strength' || e.entity_id.includes('_rssi'))));
      if (def) present.add(def.key);
    }
    const defs = AREA_CHIP_DEFS.filter(d => present.has(d.key));
    if (!defs.length) return html`<div class="hint" style="margin:2px 2px 6px">No summary sensors discovered yet.</div>`;
    const cur = this._config.area_header_chips ?? DEFAULT_AREA_HEADER_CHIPS;
    const isDefault = (arr: string[]) =>
      arr.length === DEFAULT_AREA_HEADER_CHIPS.length && DEFAULT_AREA_HEADER_CHIPS.every(k => arr.includes(k));
    return html`
      <div class="field" style="margin-bottom:4px">
        ${this._config.area_header_chips !== undefined
          ? html`<button class="color-reset" style="margin-bottom:4px" @click=${() => this._set('area_header_chips', undefined)}>↺ Default</button>`
          : nothing}
        <div class="pill-grp">
          ${defs.map(def => {
            const on = cur.includes(def.key);
            return html`<span class="pill ${on ? 'on' : ''}" @click=${() => {
              const next = on ? cur.filter(k => k !== def.key) : [...cur, def.key];
              this._set('area_header_chips', isDefault(next) ? undefined : next);
            }}>${def.label}</span>`;
          })}
        </div>
        <div class="hint" style="margin-top:4px">Default summary chips for every room header. Power is on by default — toggle it off to drop it. A room can override this in Per-room styling below.</div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  //  TAB: DESIGN  (Redesign Phase 2 — scope-first)
  // ══════════════════════════════════════════════════════════════

  /** Everything that currently exists, so a persisted scope naming something
   *  since deleted falls back instead of writing into nothing. */
  private _designKnown() {
    const devs = this._allDevices();
    return {
      views: (this._config.views ?? []).map(v => v.id),
      rooms: [...new Set(devs.map(d => d.area ?? ''))],
      types: [...new Set(devs.map(d => this._deviceProfile(d)))],
      devices: devs.map(d => d.device_id),
    };
  }

  private _designScopeStorageKey(): string {
    return `hdd:designScope:${this._config?.title ?? 'default'}`;
  }

  /** Hydrate the persisted scope once devices are known — parseScopeKey needs the
   *  current lists to decide whether the stored scope still refers to anything. */
  private _hydrateDesignScope(): void {
    if (this._designScopeLoaded || !this.hass || !this._config) return;
    this._designScopeLoaded = true;
    try {
      this._designScope = parseScopeKey(
        localStorage.getItem(this._designScopeStorageKey()), this._designKnown());
    } catch { /* privacy mode — Global is a fine default */ }
  }

  private _setDesignScope(scope: DesignScope): void {
    this._designScope = scope;
    try { localStorage.setItem(this._designScopeStorageKey(), scopeKey(scope)); } catch { /* ignore */ }
  }

  private _deviceProfile(d: ReturnType<typeof getAllDevices>[number]): DeviceProfile {
    return this._config.device_styles?.[d.device_id]?.profile ?? getDeviceProfile(d).type;
  }

  /** Everything the config changes away from the default look. Compared against
   *  the palette the card's own theme resolves to, so a themed card does not
   *  report a permanent "change" simply for having a theme. */
  private _designOverrides(): DesignOverride[] {
    if (!this._config) return [];
    return collectOverrides(
      this._config,
      paletteFor(this._config.theme) as Record<string, unknown> | undefined,
    );
  }

  /** Drop one override, wherever it lives. */
  private _clearOverride(o: DesignOverride): void {
    const c = this._config;
    switch (o.scope.kind) {
      case 'global':
        // A palette key lives inside `style`, not beside it.
        if (o.palette || (c.style as Record<string, unknown> | undefined)?.[o.key] !== undefined) {
          const next = { ...(c.style ?? {}) } as Record<string, unknown>;
          delete next[o.key];
          this._set('style', Object.keys(next).length ? next : undefined);
        } else {
          this._set(o.key, undefined);
        }
        return;
      case 'view':   this._updateView(o.scope.id, { [o.key]: undefined } as Partial<ViewConfig>); return;
      case 'room':   this._setAreaStyle(o.scope.name, o.key as keyof AreaStyle, undefined); return;
      case 'type':   this._setProfileStyle(o.scope.profile, { [o.key]: undefined } as never); return;
      case 'device': this._setDeviceStyle(o.scope.id, { [o.key]: undefined } as never); return;
    }
  }

  /**
   * "What have I actually customised?" — the same question a new user asks when
   * they cannot tell what stays and what is overridden, answered in one list
   * instead of by opening every scope.
   */
  private _renderChangesPanel(): TemplateResult {
    const overrides = this._designOverrides();
    const devs = this._allDevices();
    const label = (o: DesignOverride) => scopeLabel(o.scope, {
      viewName: (id) => (this._config.views ?? []).find(x => x.id === id)?.name || id,
      deviceName: (id) => devs.find(d => d.device_id === id)?.name ?? id,
    });
    const groups = new Map<string, DesignOverride[]>();
    for (const o of overrides) {
      const k = label(o);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(o);
    }
    const short = (v: unknown) => {
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return s.length > 42 ? `${s.slice(0, 42)}…` : s;
    };

    return html`
      <div class="changes-panel">
        ${overrides.length === 0
          ? html`<div class="hint">Nothing is customised. Every tile, room and view is
                 rendering the theme exactly as it ships.</div>`
          : html`
            <div class="changes-hdr">
              <span>${overrides.length} setting${overrides.length > 1 ? 's' : ''} differ from the default look</span>
              <span class="sec-toolbar-spacer"></span>
              <button class="sec-toolbar-btn"
                style=${this._changesResetArmed ? 'color:#f4601e;border-color:#f4601e' : ''}
                title="Drop every one of these and return to the theme"
                @click=${() => {
                  if (!this._changesResetArmed) { this._changesResetArmed = true; return; }
                  this._changesResetArmed = false;
                  for (const o of overrides) this._clearOverride(o);
                }}>${this._changesResetArmed
                  ? `Click again to reset all ${overrides.length}`
                  : '↺ Reset all'}</button>
            </div>
            ${[...groups.entries()].map(([scope, list]) => html`
              <div class="changes-group">
                <div class="changes-scope">${scope}<span class="dsn-count">${list.length}</span></div>
                ${list.map(o => html`
                  <div class="changes-row">
                    <span class="changes-key">${o.key}${o.palette ? html`<span class="changes-pal">palette</span>` : nothing}</span>
                    <span class="changes-val">${short(o.value)}</span>
                    <button class="dsn-reset" title="Drop this one"
                      @click=${() => this._clearOverride(o)}>↺</button>
                  </div>`)}
              </div>`)}`}
      </div>`;
  }

  /** The base style the card renders at its own (global) layer — no scope
   *  involved, so safe to call from _scopeValues without recursion. */
  private _globalEffectiveStyle(): TileStyle {
    return resolveStyle(this._baseStyleOf(this._config.tile_style)).style;
  }

  /**
   * The base style the selected scope's tiles actually render as: this scope's
   * own tile_style or the inherited one, the smart-styles profile default where
   * the scope names a device or type, `custom:<key>` unwrapped to its base, and
   * legacy aliases (hero, ring, …) remapped exactly as the renderer does.
   * The Blocks and Elements rows key off this — under-resolving it is how the
   * editor offered a drag canvas that the tile then ignored.
   */
  private _effectiveScopeStyle(): TileStyle {
    const sc = this._designScope;
    let raw = (this._scopeValues()['tile_style'] as TileStyle | undefined)
      ?? (this._inheritedFrom('tile_style')?.value as TileStyle | undefined);
    if (!raw && this._config.smart_tile_styles) {
      if (sc.kind === 'device') {
        const dev = this._allDevices().find(d => d.device_id === sc.id);
        if (dev) raw = profileDefaultTileStyle(this._deviceProfile(dev), dev);
      } else if (sc.kind === 'type') {
        raw = PROFILE_DEFAULT_TILE_STYLE[sc.profile];
      }
    }
    return resolveStyle(this._baseStyleOf(raw)).style;
  }

  /** Global element toggles land in style_presets[<style>].elements — the
   *  cascade's card-wide rung for elements. There is no top-level `elements`
   *  key: writing one looked saved in the editor and did nothing on the card. */
  private _setGlobalElements(els: Record<string, boolean> | undefined): void {
    const style = this._globalEffectiveStyle();
    const presets = { ...(this._config.style_presets ?? {}) };
    const entry = { ...(presets[style] ?? {}) };
    if (els && Object.keys(els).length) entry.elements = els; else delete entry.elements;
    if (Object.keys(entry).length) presets[style] = entry; else delete presets[style];
    this._set('style_presets', Object.keys(presets).length ? presets : undefined);
  }

  /** What one element resolves to when the current scope sets nothing: the
   *  rungs above it in cascade.elementVisible's order that the editor can know
   *  (which view a dashboard has active is unknowable here, so the view rung is
   *  skipped), ending at the style's preset and the STYLE_ELEMENTS default. */
  private _inheritedElementValue(style: TileStyle, id: string, def: boolean): boolean {
    const c = this._config;
    const sc = this._designScope;
    const rungs: Array<Record<string, boolean> | undefined> = [];
    if (sc.kind === 'device') {
      const dev = this._allDevices().find(d => d.device_id === sc.id);
      if (dev) {
        rungs.push(c.profile_styles?.[this._deviceProfile(dev)]?.elements);
        if (dev.area) rungs.push(c.area_styles?.[dev.area]?.elements);
      }
    }
    // At Global the preset IS this scope's own value, not an inherited one.
    if (sc.kind !== 'global') rungs.push(c.style_presets?.[style]?.elements);
    for (const r of rungs) { const val = r?.[id]; if (val !== undefined) return val; }
    return def;
  }

  /** Write a patch into whichever config block the current scope owns. One place,
   *  so a control never needs to know which layer it is being rendered at. */
  private _patchScope(patch: Record<string, unknown>): void {
    const sc = this._designScope;
    switch (sc.kind) {
      case 'global':
        for (const [k, v] of Object.entries(patch)) {
          if (k === 'elements') {
            this._setGlobalElements(v as Record<string, boolean> | undefined);
            continue;
          }
          this._set(k, v);
        }
        return;
      case 'view': this._updateView(sc.id, patch as Partial<ViewConfig>); return;
      case 'room':
        for (const [k, v] of Object.entries(patch)) {
          this._setAreaStyle(sc.name, k as keyof AreaStyle,
            v as string | number | boolean | string[] | undefined);
        }
        return;
      case 'type': this._setProfileStyle(sc.profile, patch as never); return;
      case 'device': this._setDeviceStyle(sc.id, patch as never); return;
    }
  }

  /** What this scope currently sets. Reads only. */
  private _scopeValues(): Record<string, unknown> {
    const sc = this._designScope;
    const c = this._config;
    switch (sc.kind) {
      case 'global': {
        // Elements live in style_presets at this layer (see _setGlobalElements);
        // surface them under the same key so _designRow's badge and reset see
        // the value the card actually reads.
        const els = c.style_presets?.[this._globalEffectiveStyle()]?.elements;
        return (els !== undefined
          ? { ...(c as unknown as Record<string, unknown>), elements: els }
          : c) as unknown as Record<string, unknown>;
      }
      case 'view': return ((c.views ?? []).find(v => v.id === sc.id) ?? {}) as unknown as Record<string, unknown>;
      case 'room': return (c.area_styles?.[sc.name] ?? {}) as unknown as Record<string, unknown>;
      case 'type': return (c.profile_styles?.[sc.profile] ?? {}) as unknown as Record<string, unknown>;
      case 'device': return (c.device_styles?.[sc.id] ?? {}) as unknown as Record<string, unknown>;
    }
  }

  /**
   * Where a key's value comes from when this scope does not set it — the layers
   * ABOVE this one, most specific first. This is the whole point of the tab: a
   * control saying "inherit" without saying from what is why the old editor was
   * hard to reason about.
   */
  private _inheritedFrom(key: string): { label: string; value: unknown } | undefined {
    const c = this._config;
    const sc = this._designScope;
    const chain: Array<{ label: string; block: Record<string, unknown> | undefined }> = [];
    const dev = sc.kind === 'device' ? this._allDevices().find(d => d.device_id === sc.id) : undefined;
    if (sc.kind === 'device' && dev) {
      const prof = this._deviceProfile(dev);
      chain.push({ label: `Type · ${prof}`, block: c.profile_styles?.[prof] as unknown as Record<string, unknown> });
      chain.push({ label: `Room · ${dev.area || 'No room'}`, block: c.area_styles?.[dev.area ?? ''] as unknown as Record<string, unknown> });
    }
    if (sc.kind !== 'global' && sc.kind !== 'view') {
      const av = (c.views ?? []).find(v => v.id === (c.default_view ?? c.views?.[0]?.id));
      if (av) chain.push({ label: `View · ${av.name || av.id}`, block: av as unknown as Record<string, unknown> });
    }
    if (sc.kind !== 'global') chain.push({ label: 'Card', block: c as unknown as Record<string, unknown> });
    for (const step of chain) {
      const val = step.block?.[key];
      if (val !== undefined) return { label: step.label, value: val };
    }
    return undefined;
  }

  /** One row: the control, where its value comes from, and how to drop it. */
  private _designRow(label: string, key: string, control: TemplateResult, hint?: string): TemplateResult {
    const setHere = this._scopeValues()[key] !== undefined;
    const inherited = setHere ? undefined : this._inheritedFrom(key);
    return html`
      <div class="dsn-row ${setHere ? 'set' : ''}">
        <div class="dsn-row-hdr">
          <span class="dsn-row-lbl">${label}</span>
          ${setHere
            ? html`<span class="dsn-badge on">set here</span>
                   <button class="dsn-reset" title="Drop this override and inherit again"
                     @click=${() => this._patchScope({ [key]: undefined })}>↺</button>`
            : html`<span class="dsn-badge">${inherited ? `from ${inherited.label}` : 'default'}</span>`}
        </div>
        ${control}
        ${hint ? html`<div class="hint" style="margin-top:2px">${hint}</div>` : nothing}
      </div>`;
  }

  /** A family block, or the reason this scope cannot set it. */
  private _designFamily(family: DesignFamily, title: string, body: () => TemplateResult): TemplateResult {
    if (!scopeCanSet(this._designScope, family)) {
      return html`
        <div class="dsn-family off">
          <div class="dsn-family-hdr">${title}</div>
          <div class="hint">${whyUnavailable(this._designScope, family)}</div>
        </div>`;
    }
    return html`
      <div class="dsn-family">
        <div class="dsn-family-hdr">${title}</div>
        ${body()}
      </div>`;
  }

  /**
   * The scope map: pick where you are editing by pointing at it. Grouped before
   * expanded, because a flat list of a real fleet is unusable — and the groups
   * double as layers, so a room heading selects the room itself.
   */
  private _renderDesignScopePicker(): TemplateResult {
    const c = this._config;
    const cur = scopeKey(this._designScope);
    const groups = groupDevices(this._allDevices(), this._designGroupBy, (d) => this._deviceProfile(d));
    const badge = (scope: DesignScope) => {
      const n = overrideCount(c, scope, ALL_DESIGN_KEYS);
      return n ? html`<span class="dsn-count">${n}</span>` : nothing;
    };
    const chip = (scope: DesignScope, label: string, extra = '') => html`
      <button class="dsn-chip ${cur === scopeKey(scope) ? 'on' : ''} ${extra}"
        @click=${() => this._setDesignScope(scope)}>${label}${badge(scope)}</button>`;

    return html`
      <div class="dsn-picker">
        <div class="dsn-pick-row">${chip(GLOBAL_SCOPE, 'Global')}</div>

        ${(c.views ?? []).length ? html`
          <div class="dsn-pick-lbl">Views</div>
          <div class="dsn-pick-row">
            ${(c.views ?? []).map(v => chip({ kind: 'view', id: v.id }, v.name || v.id))}
          </div>` : nothing}

        <div class="dsn-pick-lbl">
          Devices, grouped by
          ${(['room', 'type', 'integration'] as GroupBy[]).map(g => html`
            <button class="dsn-groupby ${this._designGroupBy === g ? 'on' : ''}"
              @click=${() => { this._designGroupBy = g; }}>${g}</button>`)}
        </div>
        <div class="dsn-tree">
          ${groups.map(g => {
            const open = this._designOpenGroups.has(g.label);
            return html`
              <div class="dsn-group">
                <div class="dsn-group-hdr">
                  <button class="dsn-twisty" @click=${() => {
                    const next = new Set(this._designOpenGroups);
                    if (open) next.delete(g.label); else next.add(g.label);
                    this._designOpenGroups = next;
                  }}>${open ? '▾' : '▸'}</button>
                  ${g.scope
                    ? chip(g.scope, g.label, 'grp')
                    : html`<span class="dsn-chip grp browse"
                        title="An integration is not a styling layer — expand it to reach its devices">${g.label}</span>`}
                  <span class="dsn-group-n">${g.devices.length}</span>
                </div>
                ${open ? html`
                  <div class="dsn-group-body">
                    ${g.devices.map(d => chip({ kind: 'device', id: d.id }, d.name, 'dev'))}
                  </div>` : nothing}
              </div>`;
          })}
        </div>
      </div>`;
  }

  /**
   * Render registry sections inside the Design panel. These are the bodies the
   * retired Card & Theme / Header tabs owned: the registry still owns them, so
   * there is exactly one editor per key and nothing to drift — only the tab that
   * displayed them changed. Advanced-gated ids stay gated.
   */
  private _designGlobalSections(ids: string[]): TemplateResult {
    const reg = this._globalSectionDescriptors();
    const advanced = new Set(
      EDITOR_LAYOUT.flatMap(t => t.sections.filter(s => s.advanced).map(s => s.id)),
    );
    return html`${ids.map(id => {
      const d = reg[id];
      if (!d) return nothing;
      const sec = this._sec(`design-${id}`, d.icon, d.bg, d.fg, d.label, d.badge, d.body);
      return advanced.has(id) ? this._adv(sec) : sec;
    })}`;
  }

  /** The controls for whichever scope is selected. */
  private _renderDesignPanel(): TemplateResult {
    const sc = this._designScope;
    const v = this._scopeValues();
    const devs = this._allDevices();
    const label = scopeLabel(sc, {
      viewName: (id) => (this._config.views ?? []).find(x => x.id === id)?.name || id,
      deviceName: (id) => devs.find(d => d.device_id === id)?.name ?? id,
    });
    const setCount = ALL_DESIGN_KEYS.filter(k => v[k] !== undefined).length;

    const tileBody = () => {
      // The style in force at this layer decides which arranging surface is
      // live: blocks shape only the adaptive tile, every other style is a
      // monolithic renderer whose parts are toggled with Elements. Resolve it
      // once, the same way for the Blocks and Elements rows, so the two can
      // never disagree about which one applies.
      const effStyle = this._effectiveScopeStyle();
      const effLabel = TILE_STYLE_OPTIONS.find(o => o.v === effStyle)?.label ?? effStyle;
      // A lower layer can override tile_style back to 'default', and those
      // tiles still read config.tile_layout — so at Global the canvas must
      // stay reachable even when the card-wide style is something else, or
      // the layout they render becomes un-arrangeable from anywhere.
      const adaptiveBelow = sc.kind === 'global' && effStyle !== 'default' && (() => {
        const isDefault = (t?: TileStyle) =>
          t !== undefined && resolveStyle(this._baseStyleOf(t)).style === 'default';
        return Object.values(this._config.device_styles ?? {}).some(d => isDefault(d.tile_style))
          || Object.values(this._config.profile_styles ?? {}).some(p => isDefault(p.tile_style))
          || Object.values(this._config.area_styles ?? {}).some(a => isDefault(a.tile_style))
          || (this._config.views ?? []).some(vw => isDefault(vw.tile_style));
      })();
      const showCanvas = effStyle === 'default' || adaptiveBelow;
      return html`
      ${this._designRow('Colour theme', 'theme',
        sc.kind === 'global'
          ? this._designGlobalSections(['theme'])
          : this._themeOverrideSelect(v['theme'] as ThemePreset | undefined,
            (t) => this._patchScope({ theme: t }),
            sc.kind === 'device' || sc.kind === 'type'
              ? 'Repaints this tile only — 13 of the 19 palette keys. The card surface and header are not inside a tile.'
              : 'Repaints everything this layer contains.'))}

      ${this._designRow('Tile style', 'tile_style',
        this._renderTileStylePicker(
          v['tile_style'] as TileStyle | undefined,
          (v['power_monitor_variant'] as PowerMonitorVariant) ?? 'big-number',
          undefined,
          (val) => this._patchScope({ tile_style: val }),
          (val) => this._patchScope({ power_monitor_variant: val }),
          v['show_graphs'] as boolean | undefined,
          (val) => this._patchScope({ show_graphs: val }),
        ))}

      ${this._designRow('Blocks', 'tile_layout',
        showCanvas
          ? html`
            ${adaptiveBelow ? html`<div class="hint" style="margin-bottom:4px">
                These tiles render as <b>${effLabel}</b>, but some rooms, types or
                devices switch back to the adaptive style — this layout is what
                those tiles use.
              </div>` : nothing}
            ${this._renderLayoutCanvas(
              v['tile_layout'] as TileLayout | undefined,
              // The canvas needs something concrete to draw when this layer sets
              // nothing, so hand it whatever is inherited — the layout the tiles
              // actually have right now.
              normalizeTileLayout(
                (this._inheritedFrom('tile_layout')?.value as TileLayout | undefined)
                ?? PROFILE_DEFAULT_BLOCKS.generic!)!,
              (layout) => this._patchScope({ tile_layout: layout }),
            )}`
          // Offering the drag canvas anyway would be a lie — the user arranges
          // blocks, the tile ignores them. Say which style is in force instead.
          : html`<div class="hint">
              These tiles render as <b>${effLabel}</b>, which draws its own fixed
              layout — blocks only shape the <b>Default</b> (adaptive) tile style.
              Use Elements below to show or hide this style's parts, or switch
              Tile style to Default to arrange blocks.
            </div>`,
        showCanvas
          ? 'Drag to reorder or drop into a row. Blocks only apply to the adaptive tile style.'
          : undefined)}

      ${(() => {
        // Elements are per tile STYLE, so they only mean anything once a style
        // that exposes them is in force at or above this layer. `effStyle` has
        // custom:<key> already unwrapped to the base style it renders as.
        if (!STYLE_ELEMENTS[effStyle]) return nothing;
        return this._designRow('Elements', 'elements', this._renderStyleElementToggles(
          effStyle,
          (v['elements'] as Record<string, boolean> | undefined) ?? {},
          (els) => this._patchScope({ elements: els })));
      })()}

      ${this._designRow('Sensor chips', 'sensors',
        this._chipPicker(
          v['sensors'] as string[] | undefined,
          this._inheritedFrom('sensors')?.value as string[] | undefined,
          this._inheritedFrom('sensors')?.label ?? 'the default (all shown)',
          (next) => this._patchScope({ sensors: next }),
        ))}

      ${this._designRow('Energy window', 'energy_period',
        this._renderEnergyPeriodPicker(
          v['energy_period'] as EnergyPeriod | undefined,
          (val) => this._patchScope({ energy_period: val }),
        ))}`;
    };

    const containerBody = () => html`
      ${this._designRow('Columns', 'columns', html`
        <div class="sl-row">
          <input type="range" min="1" max="6" step="1" style="flex:1;accent-color:#f4601e"
            .value=${String((v['columns'] as number) ?? (this._inheritedFrom('columns')?.value as number) ?? 3)}
            @input=${(e: Event) => this._patchScope({ columns: parseInt((e.target as HTMLInputElement).value, 10) })}/>
          <span class="sl-val">${(v['columns'] as number) ?? (this._inheritedFrom('columns')?.value as number) ?? 3}</span>
        </div>`)}

      ${this._designRow('Tile size', 'tile_size', html`
        <div class="pill-grp">
          ${(['sm', 'md', 'lg'] as const).map((sz, i) => html`
            <span class="pill ${v['tile_size'] === sz ? 'on' : ''}"
              @click=${() => this._patchScope({ tile_size: sz })}>${['Small', 'Medium', 'Large'][i]}</span>`)}
        </div>`)}`;

    /**
     * Card chrome. At Global these are the card's own `style` keys, so the
     * existing section bodies are reused verbatim — one editor per key, no
     * second front-end to drift. At a view they write into `ViewConfig.style`,
     * which is a deliberately small subset: the colours a view most often wants
     * to change when it re-skins the card, not all seventeen.
     */
    const chromeBody = () => {
      if (sc.kind === 'global') {
        return html`
          <div class="hint" style="margin-bottom:6px">
            The card's own header, surface and type. Every layer below inherits these.
          </div>
          ${this._designGlobalSections(['header', 'card', 'colors', 'typography'])}`;
      }
      const vs = (v['style'] ?? {}) as Record<string, string | number | undefined>;
      const patchChrome = (key: string, val: string | number | undefined) => {
        const next = { ...vs };
        if (val === undefined) delete next[key]; else next[key] = val;
        this._patchScope({ style: Object.keys(next).length ? next : undefined });
      };
      const chromeColor = (lbl: string, key: string, def: string) => html`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${(vs[key] as string) ?? def}"></div>
          <span class="color-key">${lbl}</span>
          <input type="color" .value=${(vs[key] as string) ?? def}
            @input=${(e: Event) => patchChrome(key, (e.target as HTMLInputElement).value)}/>
          ${vs[key] !== undefined
            ? html`<button class="color-reset" @click=${() => patchChrome(key, undefined)}>↺</button>`
            : nothing}
        </div>`;
      const setKeys = Object.keys(vs).length;
      return html`
        <div class="dsn-row ${setKeys ? 'set' : ''}">
          <div class="dsn-row-hdr">
            <span class="dsn-row-lbl">Header &amp; card surface</span>
            ${setKeys
              ? html`<span class="dsn-badge on">${setKeys} set here</span>
                     <button class="dsn-reset" title="Drop this view's chrome overrides"
                       @click=${() => this._patchScope({ style: undefined })}>↺</button>`
              : html`<span class="dsn-badge">from Card</span>`}
          </div>
          ${chromeColor('Header gradient start', 'header_bg', '#1a1a2e')}
          ${chromeColor('Header gradient end', 'header_bg2', '#0f3460')}
          ${chromeColor('Header text', 'header_text_color', '#ffffff')}
          ${chromeColor('Card background', 'card_bg', '#1c1c1e')}
          <div class="field" style="margin-top:6px">
            <div class="field-lbl">Header icon</div>
            <input type="text" class="inline-text" maxlength="4" style="width:60px;text-align:center"
              .value=${(vs['header_icon'] as string) ?? ''}
              @change=${(e: Event) => patchChrome('header_icon', (e.target as HTMLInputElement).value.trim() || undefined)}/>
          </div>
          <div class="hint" style="margin-top:4px">
            A view's theme already re-bases these; set one here only to bend a single
            colour out of that theme.
          </div>
        </div>`;
    };

    return html`
      <div class="dsn-panel">
        <div class="dsn-scope-hdr ${this._flashControl === 'design-scope' ? 'ctl-flash' : ''}" data-ctl="design-scope">
          <span class="dsn-scope-name">${label}</span>
          ${setCount
            ? html`<span class="dsn-badge on">${setCount} set here</span>`
            : html`<span class="dsn-badge">nothing set — all inherited</span>`}
        </div>
        ${this._designFamily('tile', 'Tile — device → type → room → view → card', tileBody)}
        ${this._designFamily('container', 'Container — room → view → card', containerBody)}
        ${this._designFamily('chrome', 'Card chrome — view → card', chromeBody)}
        ${sc.kind === 'device' ? this._renderInputActionsBlock(sc.id) : nothing}
        ${sc.kind === 'room' ? html`
          <div class="dsn-family">
            <div class="dsn-family-hdr">Room chrome — this room only</div>
            <div class="hint" style="margin-bottom:6px">
              The room block's own dressing — backdrop photo, header colours,
              borders, header chips, button shapes. These exist once per room,
              so there is no ladder under them.
            </div>
            ${this._renderRoomChromeBody(sc.name)}
          </div>` : nothing}
        ${sc.kind === 'global' ? this._renderSavedLooks() : nothing}
        ${sc.kind === 'global' ? html`
          <div class="dsn-family">
            <div class="dsn-family-hdr">Card-wide — no layers under these</div>
            <div class="hint" style="margin-bottom:6px">
              Settings that exist once for the whole card. There is nothing to
              override them with, which is why they only appear at Global.
            </div>
            ${this._designGlobalSections(['content', 'tiles', 'electrical', 'environmental', 'deviceinfo', 'alerts'])}
          </div>` : nothing}
      </div>`;
  }

  /**
   * Saved looks — a shelf, not a rung.
   *
   * `custom_styles`, `style_presets` and the ★ palettes are things you made and
   * can point a layer at; they are not scopes and have no place on the ladder.
   * They had no home of their own once Device styling retired, which is how a
   * saved style became something you could create but never find again.
   *
   * Palettes are browser-local (localStorage, keyed on the card title) while the
   * other two are config — the panel says so, because "why is my saved style on
   * my phone but my palette isn't" is otherwise a mystery.
   */
  private _renderSavedLooks(): TemplateResult {
    const c = this._config;
    const styles = Object.entries(c.custom_styles ?? {});
    const presets = Object.entries(c.style_presets ?? {});
    const palettes = Object.entries(this._palettes);
    if (!styles.length && !presets.length && !palettes.length) {
      return html`
        <div class="dsn-family off">
          <div class="dsn-family-hdr">Saved looks</div>
          <div class="hint">
            Nothing saved yet. 💾 in the theme picker keeps the colours you are looking
            at; "Save as style" on a device keeps its whole tile setup for reuse.
          </div>
        </div>`;
    }
    return html`
      <div class="dsn-family">
        <div class="dsn-family-hdr">Saved looks — point any layer at one</div>
        ${styles.length ? html`
          <div class="dsn-row">
            <div class="dsn-row-hdr"><span class="dsn-row-lbl">Tile styles</span>
              <span class="dsn-badge">in the config</span></div>
            <div class="dsn-pick-row">
              ${styles.map(([key, def]) => html`
                <span class="dsn-chip">${def.label ?? key}
                  <button class="saved-x" title="Forget this style and clear every tile using it"
                    @click=${() => this._deleteCustomStyle(key)}>✕</button>
                </span>`)}
            </div>
            <div class="hint" style="margin-top:4px">Assigned as the Tile style of any scope.</div>
          </div>` : nothing}
        ${presets.length ? html`
          <div class="dsn-row">
            <div class="dsn-row-hdr"><span class="dsn-row-lbl">Style presets</span>
              <span class="dsn-badge">in the config</span></div>
            <div class="dsn-pick-row">
              ${presets.map(([style]) => html`<span class="dsn-chip">${style}</span>`)}
            </div>
            <div class="hint" style="margin-top:4px">
              Defaults for one built-in tile style, applied wherever that style resolves —
              between the view and the card.
            </div>
          </div>` : nothing}
        ${palettes.length ? html`
          <div class="dsn-row">
            <div class="dsn-row-hdr"><span class="dsn-row-lbl">★ Palettes</span>
              <span class="dsn-badge">this browser only</span></div>
            <div class="dsn-pick-row">
              ${palettes.map(([name]) => html`
                <span class="dsn-chip">
                  <button class="dsn-chip-apply" title="Apply these colours to the card"
                    @click=${() => this._applyPalette(name)}>★ ${name}</button>
                  <button class="saved-x" title="Forget this palette"
                    @click=${() => this._deletePalette(name)}>✕</button>
                </span>`)}
            </div>
            <div class="hint" style="margin-top:4px">
              Kept in this browser, not in the config — they do not follow the dashboard
              to another device, and are keyed to the card's title.
            </div>
          </div>` : nothing}
      </div>`;
  }

  private _renderDesignTab(): TemplateResult {
    this._hydrateDesignScope();
    return html`
      ${this._sec('design-scope', '◈', 'rgba(129,140,248,0.1)', '#818cf8',
        'Scope — what am I editing?', nothing, this._renderDesignScopePicker())}
      ${this._sec('design-panel', '◉', 'rgba(244,96,30,0.1)', '#f4601e',
        'Controls', nothing, this._renderDesignPanel())}`;
  }

  /** Palette override picker for a layer that has no `style` object of its own —
   *  a view or a room. Presets plus "Inherit", and no 'custom': custom means "the
   *  colours in the card's `style` ARE the palette", and neither layer has one to
   *  hold, so the renderer ignores it there (see cascade.overrideTheme). */
  private _themeOverrideSelect(
    current: ThemePreset | undefined,
    onPick: (v: ThemePreset | undefined) => void,
    hint: string,
  ): TemplateResult {
    return html`
      <div class="field">
        <div class="field-lbl">Colour theme</div>
        <select class="inline-text" style="width:100%"
          @change=${(e: Event) => {
            const val = (e.target as HTMLSelectElement).value;
            onPick(val ? (val as ThemePreset) : undefined);
          }}>
          <option value="" ?selected=${!current || current === 'custom'}>Inherit</option>
          <option value="ha" ?selected=${current === 'ha'}>${THEME_LABELS.ha}</option>
          ${THEME_ORDER.map(n => html`
            <option value=${n} ?selected=${current === n}>${THEME_LABELS[n]}</option>`)}
        </select>
        <div class="hint" style="margin-top:4px">${hint}</div>
      </div>`;
  }

  /** HA lazy-loads its pickers with the first editor that needs them. Opening
   *  the entities card's own config element pulls ha-entity-picker in — the
   *  same trick other custom cards use — so Input actions can offer a
   *  searchable picker instead of a bare text field. */
  private async _ensureHaPickers(): Promise<void> {
    if (customElements.get('ha-entity-picker')) { this._haPickersReady = true; return; }
    try {
      const loader = (window as unknown as { loadCardHelpers?: () => Promise<any> }).loadCardHelpers;
      const helpers = loader ? await loader() : undefined;
      const el = helpers?.createCardElement({ type: 'entities', entities: [] });
      await el?.constructor?.getConfigElement?.();
    } catch { /* fall back to text inputs */ }
    this._haPickersReady = !!customElements.get('ha-entity-picker');
  }

  private _entityName(id: string): string {
    return (this.hass?.states[id]?.attributes as { friendly_name?: string })?.friendly_name ?? id;
  }

  /**
   * Entity field for Input actions. A `multi` field shows the chosen entities
   * as removable chips above ONE picker that adds another; a single field is
   * just the picker holding its value. HA's picker brings fuzzy search and is
   * scoped to this device's entities unless "all entities" is on; if it never
   * loaded, a text input with the device's entities as suggestions. Stores a
   * bare string for one entity so simple configs stay simple.
   */
  private _entityField(
    value: string | string[] | undefined,
    onChange: (next: string | string[] | undefined) => void,
    opts: { deviceEntities: string[]; scopeAll: boolean; placeholder: string; multi?: boolean; note?: string },
  ): TemplateResult {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    const commit = (next: string[]) => {
      const clean = [...new Set(next.map(x => x.trim()).filter(Boolean))];
      onChange(clean.length > 1 ? clean : (clean[0] || undefined));
    };
    if (!this._haPickersReady) {
      const listId = `hdd-ents-${(opts.deviceEntities[0] ?? 'x').replace(/\W/g, '')}`;
      return html`
        <input type="text" class="inline-text" style="width:100%" list=${listId}
          placeholder=${opts.placeholder} .value=${list.join(', ')}
          @change=${(e: Event) => commit((e.target as HTMLInputElement).value.split(','))}/>
        <datalist id=${listId}>${opts.deviceEntities.map(id => html`<option value=${id}></option>`)}</datalist>`;
    }
    const include = opts.scopeAll ? undefined : opts.deviceEntities;
    // No `.label`: HA renders it as a loose line above the field, which broke
    // the grid's alignment. The grid's label column says what the field is;
    // a default or caveat goes in a small note beneath instead.
    const picker = (val: string, onPick: (v: string) => void) => html`
      <ha-entity-picker class="ia-picker" .hass=${this.hass} .value=${val}
        .includeEntities=${include} allow-custom-entity
        @value-changed=${(e: CustomEvent) => { e.stopPropagation(); onPick(String(e.detail?.value ?? '').trim()); }}
      ></ha-entity-picker>`;
    const note = opts.note ? html`<div class="ia-note">${opts.note}</div>` : nothing;
    if (!opts.multi) return html`${picker(list[0] ?? '', v => commit(v ? [v] : []))}${note}`;
    // The "add" picker is re-keyed on the list so it comes back empty after a
    // pick — re-rendering with the same '' value would leave the choice showing.
    return html`
      ${list.length ? html`
        <div class="ia-chips">
          ${list.map(id => html`
            <span class="ia-chip" title=${id}>${this._entityName(id)}
              <button class="ia-chip-x" title="Remove" @click=${() => commit(list.filter(x => x !== id))}>×</button>
            </span>`)}
        </div>` : nothing}
      ${keyed(list.join('|'), picker('', v => { if (v) commit([...list, v]); }))}
      ${note}`;
  }

  /**
   * Input actions — what tapping an input channel's row or key does. Rendered
   * by the Design tab at device scope: `input_actions` is a device-only key with
   * no ladder, and this form lost its editor surface when the Device styling
   * panel was retired (binding a channel had become YAML-only, which is why the
   * i3/i4 tile read as useless).
   *
   * One card per channel: the action picker on the header line, then a fixed-
   * label grid for that action's settings. A channel wired to an output on its
   * own device already toggles that output by default (see the card's
   * _inputAction), so the picker names that default rather than pretending
   * "none" is the resting state.
   */
  private _renderInputActionsBlock(deviceId: string): TemplateResult {
    const dev = this._allDevices().find(d => d.device_id === deviceId);
    const chans = dev ? detectInputChannels(dev, this.hass.states as any) : [];
    if (!chans.length) return html``;
    const devStyle: DeviceStyle = this._config.device_styles?.[deviceId] ?? {};
    const acts: Record<string, InputActionConfig> = devStyle.input_actions ?? {};
    const entText = (e?: string | string[]) => Array.isArray(e) ? e.join(', ') : (e ?? '');
    const setAct = (key: string, patch: Partial<InputActionConfig> | null) => {
      const next: Record<string, InputActionConfig> = { ...acts };
      if (!patch) delete next[key];
      else next[key] = { ...(next[key] ?? { action: 'none' }), ...patch } as InputActionConfig;
      this._setDeviceStyle(deviceId, { input_actions: Object.keys(next).length ? next : undefined });
    };
    const devEnts = dev ? dev.entities.map(e => e.entity_id) : [];
    // Input-only hardware's targets live on other devices, so it starts wide.
    // Config/diagnostic entities (an i4's "dimmer control" switch) are not
    // controls in this sense.
    const hasOwnControls = (dev?.entities ?? []).some(e => !e.entity_category
      && /^(switch|light|cover|climate|fan|valve|lock|media_player)\./.test(e.entity_id));
    const scopeAll = this._iaAllEntities ?? !hasOwnControls;
    const field = (value: string | string[] | undefined, apply: (v: string | string[] | undefined) => void,
      placeholder: string, multi = true, note?: string) =>
      this._entityField(value, apply, { deviceEntities: devEnts, scopeAll, placeholder, multi, note });
    const one = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v;

    return html`
      <div class="dsn-family">
        <div class="dsn-family-hdr">Input actions — this device only</div>
        <div class="hint" style="margin-bottom:6px">
          What a tap on each input's row or key does. A <b>button</b> input reports
          presses; a <b>switch</b> input reports its position. An input wired to a
          relay on this device toggles that relay by default — input-only hardware
          (i3/i4, UNI) has no output, so give its channels the action the physical
          button is wired to and the rows become keys.
        </div>
        <div class="field" style="margin-bottom:8px">
          <div class="field-lbl">Entity search covers</div>
          <div class="pill-grp">
            <span class="pill ${!scopeAll ? 'on' : ''}" @click=${() => { this._iaAllEntities = false; }}>This device's entities</span>
            <span class="pill ${scopeAll ? 'on' : ''}" @click=${() => { this._iaAllEntities = true; }}>All entities</span>
          </div>
          <div class="dp-hint-inline">${this._haPickersReady
            ? 'Type to search — names, rooms and entity ids all match.'
            : 'Home Assistant\'s picker has not loaded; type entity ids, comma-separated for several.'}</div>
        </div>
        ${chans.map(ch => {
          // Cast, not annotate: an annotated const is narrowed to its initializer's
          // type, and the index type has no `undefined`, which made 'default'
          // unreachable to the checker.
          const cur = (acts[ch.entityId] ?? acts[String(ch.channel)]) as InputActionConfig | undefined;
          const kind = (cur?.action ?? 'default') as InputActionConfig['action'] | 'default';
          const configured = kind !== 'default' && kind !== 'none';
          const dbl = cur?.double_tap_action;
          // Only a Shelly button has a `shelly.click` to replay; a steady switch
          // input never fires one, and other vendors' inputs use other events.
          const canPress = ch.kind === 'button' && !!dev?.isShelly;
          const defaultLabel = ch.output
            ? `— default: toggles ${this._entityName(ch.output)} —`
            : '— none: row shows the press history —';
          return html`
            <div class="ia-ch ${configured ? 'set' : ''}">
              <div class="ia-ch-hdr">
                <span class="ia-ch-name" title="${ch.entityId} · ${ch.kind}">${ch.label}
                  <span class="dev-style-hint">${ch.kind}</span></span>
                <select class="inline-text" style="flex:1"
                  @change=${(e: Event) => {
                    const v = (e.target as HTMLSelectElement).value;
                    if (v === 'default') setAct(ch.entityId, null);
                    else setAct(ch.entityId, { action: v as InputActionConfig['action'] });
                  }}>
                  <option value="default" ?selected=${kind === 'default'}>${defaultLabel}</option>
                  ${ch.output ? html`<option value="none" ?selected=${kind === 'none'}>— status only, no tap action —</option>` : nothing}
                  ${canPress ? html`<option value="press" ?selected=${kind === 'press'}>Replay the press — runs your automations</option>` : nothing}
                  <option value="perform-action" ?selected=${kind === 'perform-action'}>Run script / service</option>
                  <option value="toggle" ?selected=${kind === 'toggle'}>Toggle entity</option>
                  <option value="more-info" ?selected=${kind === 'more-info'}>Show more-info</option>
                </select>
              </div>
              ${configured ? html`
                <div class="ia-grid">
                  ${kind === 'perform-action' ? html`
                    <span class="ia-lbl">Service</span>
                    <input type="text" class="inline-text" placeholder="script.hall_lights — or light.turn_on"
                      .value=${cur?.perform_action ?? ''}
                      @change=${(e: Event) => setAct(ch.entityId, { perform_action: (e.target as HTMLInputElement).value.trim() || undefined })}/>
                    <span class="ia-lbl">Target</span>
                    <div>${field(cur?.entity, v => setAct(ch.entityId, { entity: v }), 'Target entity — optional')}</div>` : nothing}
                  ${kind === 'toggle' ? html`
                    <span class="ia-lbl">Toggles</span>
                    <div>${field(cur?.entity, v => setAct(ch.entityId, { entity: v }), 'Entity to toggle')}</div>` : nothing}
                  ${kind === 'more-info' ? html`
                    <span class="ia-lbl">Shows</span>
                    <div>${field(cur?.entity, v => setAct(ch.entityId, { entity: v }), 'Entity to show', false,
                      `Empty = this channel (${ch.entityId})`)}</div>` : nothing}
                  ${kind === 'press' ? html`
                    <div class="ia-hint">Fires the same <code>shelly.click</code> event as the wall button — device_id,
                      button number, click type — so every automation with a Shelly device trigger on this button runs
                      as-is, nothing configured twice. Automations that trigger on the event entity itself do not see
                      it, and firing events needs an admin login.</div>
                    ${this._advanced ? html`
                      <span class="ia-lbl">Button</span>
                      <input type="number" class="inline-text" min="1" max="8" style="max-width:90px"
                        placeholder="auto" .value=${cur?.channel != null ? String(cur.channel) : ''}
                        title="Button number as the automation editor counts it. Empty = read from the entity registry."
                        @change=${(e: Event) => {
                          const n = parseInt((e.target as HTMLInputElement).value, 10);
                          setAct(ch.entityId, { channel: Number.isFinite(n) && n > 0 ? n : undefined });
                        }}/>` : nothing}` : nothing}

                  <span class="ia-lbl">On hold</span>
                  <select class="inline-text"
                    @change=${(e: Event) => {
                      const v = (e.target as HTMLSelectElement).value as 'none' | 'press' | 'dim';
                      setAct(ch.entityId, { hold_action: v === 'none' ? undefined : { action: v } });
                    }}>
                    <option value="none" ?selected=${(cur?.hold_action?.action ?? 'none') === 'none'}>— nothing —</option>
                    ${canPress ? html`<option value="press" ?selected=${cur?.hold_action?.action === 'press'}>Replay a long push</option>` : nothing}
                    <option value="dim" ?selected=${cur?.hold_action?.action === 'dim'}>Dim the light while held</option>
                  </select>
                  ${cur?.hold_action?.action === 'dim' ? html`
                    <span class="ia-lbl">Dims</span>
                    <div>${field(cur.hold_action.entity,
                      v => setAct(ch.entityId, { hold_action: { ...(cur.hold_action ?? { action: 'dim' }), entity: v } }),
                      'Light to dim', false,
                      entText(cur.entity) ? `Empty = the tap target (${entText(cur.entity)})` : undefined)}</div>
                    <div class="ia-hint">Hold brightens; release and hold again darkens — it alternates each hold.</div>` : nothing}

                  <span class="ia-lbl">Double tap</span>
                  <select class="inline-text"
                    @change=${(e: Event) => {
                      const v = (e.target as HTMLSelectElement).value as InputActionConfig['action'];
                      setAct(ch.entityId, { double_tap_action: v === 'none' ? undefined : { action: v } });
                    }}>
                    <option value="none" ?selected=${(dbl?.action ?? 'none') === 'none'}>— nothing —</option>
                    ${canPress ? html`<option value="press" ?selected=${dbl?.action === 'press'}>Replay a double push</option>` : nothing}
                    <option value="perform-action" ?selected=${dbl?.action === 'perform-action'}>Run script / service</option>
                    <option value="toggle" ?selected=${dbl?.action === 'toggle'}>Toggle entity</option>
                  </select>
                  ${dbl?.action === 'perform-action' ? html`
                    <span class="ia-lbl">Service</span>
                    <input type="text" class="inline-text" placeholder="light.turn_on"
                      .value=${dbl.perform_action ?? ''}
                      @change=${(e: Event) => setAct(ch.entityId, { double_tap_action: {
                        ...dbl, perform_action: (e.target as HTMLInputElement).value.trim() || undefined } })}/>`
                  : dbl?.action === 'toggle' ? html`
                    <span class="ia-lbl">Toggles</span>
                    <div>${field(dbl.entity,
                      v => setAct(ch.entityId, { double_tap_action: { ...dbl, entity: v } }),
                      'Entity to toggle', true,
                      entText(cur?.entity) ? `Empty = the tap target (${entText(cur?.entity)})` : undefined)}</div>`
                  : nothing}
                  ${dbl && dbl.action !== 'none' ? html`
                    <div class="ia-hint">A double tap delays the single tap by ~250ms on this channel so the two can be told apart.</div>` : nothing}

                  ${this._advanced ? html`
                    <span class="ia-lbl">Dropdown</span>
                    <div>${field(cur?.select_chip?.entity,
                      v => { const id = one(v); setAct(ch.entityId, { select_chip: id ? { entity: id } : undefined }); },
                      'A select entity — WLED presets, say (optional)', false)}</div>` : nothing}
                </div>` : nothing}
            </div>`;
        })}
      </div>`;
  }

  /** The room block's own dressing — backdrop photo, chrome colours, header
   *  chips, button shapes. Rendered by the Design tab at room scope: these are
   *  AreaStyle keys that exist only per room (no ladder under them), and they
   *  lost their editor surface when the Rooms styling panel was retired —
   *  "importable but not editable" (Shelly Cloud writes bg_image) was a trap.
   *  Settings the Design panel already owns at room scope — theme, columns,
   *  graphs, sensor chips, energy window — are deliberately absent here: one
   *  editor per key. */
  private _renderRoomChromeBody(name: string): TemplateResult {
    const st: AreaStyle = this._config.area_styles?.[name] ?? {};

    const colorRow = (label: string, key: keyof AreaStyle, def: string) => {
      const cur = (st as any)[key] ?? def;
      return html`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${cur}"></div>
          <span class="color-key">${label}</span>
          <input type="color" .value=${cur}
            @input=${(e:Event) => this._setAreaStyle(name, key, (e.target as HTMLInputElement).value)}/>
          ${(st as any)[key] ? html`<button class="color-reset" @click=${()=>this._setAreaStyle(name,key,undefined)}>↺</button>` : nothing}
        </div>`;
    };

    const slRow = (label: string, key: keyof AreaStyle, min: number, max: number, step: number, def: number, unit: string) => {
      const cur = (st as any)[key] ?? def;
      return html`
        <div class="sl-row">
          <span class="color-key">${label}</span>
          <input type="range" min="${min}" max="${max}" step="${step}" style="flex:1;accent-color:#f4601e"
            .value=${String(cur)}
            @input=${(e:Event) => this._setAreaStyle(name, key, parseInt((e.target as HTMLInputElement).value, 10))}/>
          <span class="sl-val">${cur}${unit}</span>
        </div>`;
    };

    const sectionLbl = (txt: string) => html`<div class="rsp-section-lbl">${txt}</div>`;

    return html`
      <div class="rsp-panel">
        ${sectionLbl('Layout')}
        ${slRow('Tile gap', 'tileGap', 4, 24, 2, 10, 'px')}

        ${this._renderBgImagePicker(
          'Room background photo', `room-bg-${name}`, st.bg_image, st.bg_image_size,
          (url) => this._setAreaStyle(name, 'bg_image', url),
          (v) => this._setAreaStyle(name, 'bg_image_size', v),
          () => ['bg_image', 'bg_image_size', 'bg_image_mode', 'bg_image_pos']
            .forEach(k => this._setAreaStyle(name, k as keyof AreaStyle, undefined)),
          {
            maxDim: 1600,          // a room backdrop spans the full width — 720 was too soft
            showFit: (st.bg_image_mode ?? 'sharp') === 'sharp',
            extra: html`
              <div class="field-lbl" style="margin-top:8px">Backdrop mode
                <span class="dev-style-hint">a room section is a wide strip</span></div>
              <div class="pill-grp">
                ${([['Sharp', 'sharp'], ['Ambient', 'ambient']] as const).map(([lbl, v]) => html`
                  <span class="pill ${(st.bg_image_mode ?? 'sharp') === v ? 'on' : ''}"
                    @click=${() => this._setAreaStyle(name, 'bg_image_mode', v === 'sharp' ? undefined : v)}>${lbl}</span>`)}
              </div>
              ${(st.bg_image_mode ?? 'sharp') === 'sharp' ? html`
                <div class="field-lbl" style="margin-top:6px">Show which part</div>
                <div class="pill-grp">
                  ${([['Top', 'top'], ['Center', 'center'], ['Bottom', 'bottom']] as const).map(([lbl, v]) => html`
                    <span class="pill ${(st.bg_image_pos ?? 'center') === v ? 'on' : ''}"
                      @click=${() => this._setAreaStyle(name, 'bg_image_pos', v === 'center' ? undefined : v)}>${lbl}</span>`)}
                </div>` : nothing}`,
          })}

        ${sectionLbl('Tile appearance')}
        ${colorRow('Tile background', 'tileBgColor', '#1c1c1e')}
        ${this._adv(html`
        ${colorRow('Room block background', 'bgColor', 'transparent')}
        ${colorRow('Tile border', 'tileBorderColor', 'rgba(255,255,255,0.07)')}
        ${slRow('Tile corner radius', 'tileBorderRadius', 0, 20, 1, 12, 'px')}
        ${slRow('Tile opacity', 'tileOpacity', 0, 100, 1, 100, '%')}
        ${slRow('Room block border', 'borderWidth', 0, 8, 1, 1, 'px')}
        ${slRow('Room block radius', 'borderRadius', 0, 32, 2, 10, 'px')}

        ${sectionLbl('Room header')}
        ${colorRow('Gradient start', 'headerBgColor', '#1a1a2e')}
        ${colorRow('Gradient end', 'headerBgColor2', '#0f3460')}
        ${colorRow('Header text', 'textColor', '#f4601e')}
        ${slRow('Font size', 'fontSize', 8, 32, 1, 12, 'px')}
        `)}

        ${sectionLbl('Room header chips')}
        ${this._renderRoomHeaderChips(name, st)}

        ${this._adv(html`
        ${sectionLbl('ON / OFF buttons')}
        ${(() => {
          const shape   = st.buttonShape   ?? 'pill';
          const variant = st.buttonVariant ?? 'fill';
          const size    = st.buttonSize    ?? 'md';
          const isSquarish = shape === 'square' || shape === 'circle';
          const previewRadius = shape === 'pill' ? '20px' : shape === 'rect' ? '6px' : shape === 'square' ? '6px' : '50%';
          const previewPad    = isSquarish
            ? (size === 'sm' ? '3px 5px' : size === 'lg' ? '6px 12px' : '4px 8px')
            : (size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 16px' : '4px 12px');
          const previewFsize  = size === 'sm' ? '10px' : size === 'lg' ? '13px' : '11px';
          const previewAspect = isSquarish ? '1' : 'auto';
          const accent = st.accentColor ?? 'var(--accent)';
          const previewOnStyle = variant === 'outline'
            ? `background:transparent;color:${accent};border:1px solid ${accent};box-shadow:none`
            : variant === 'ghost'
            ? `background:transparent;color:${accent};border:none;box-shadow:none`
            : `background:${accent};color:white;border:none`;
          const shared = `border-radius:${previewRadius};padding:${previewPad};font-size:${previewFsize};aspect-ratio:${previewAspect};display:inline-flex;align-items:center;justify-content:center;cursor:default;`;
          const hasOverride = st.buttonShape || st.buttonVariant || st.buttonSize;
          return html`
            <div class="btn-preview">
              <span class="preview-btn on" style="${shared}${previewOnStyle}">ON</span>
              <span class="preview-btn off" style="${shared}background:rgba(255,255,255,.08);color:var(--t2);border:none">OFF</span>
              ${hasOverride ? html`<button class="color-reset" style="margin-left:auto" @click=${()=>{
                this._setAreaStyle(name,'buttonShape',undefined);
                this._setAreaStyle(name,'buttonVariant',undefined);
                this._setAreaStyle(name,'buttonSize',undefined);
              }}>↺ Reset</button>` : nothing}
            </div>
            <div class="field">
              <div class="field-lbl">Shape</div>
              <div class="pill-grp">
                ${(['pill','rect','square','circle'] as const).map(v => html`
                  <span class="pill ${shape === v ? 'on' : ''}"
                    @click=${()=>this._setAreaStyle(name,'buttonShape',v)}>
                    ${v[0].toUpperCase()+v.slice(1)}</span>`)}
              </div>
            </div>
            <div class="field">
              <div class="field-lbl">Variant</div>
              <div class="pill-grp">
                ${(['fill','outline','ghost'] as const).map(v => html`
                  <span class="pill ${variant === v ? 'on' : ''}"
                    @click=${()=>this._setAreaStyle(name,'buttonVariant',v)}>
                    ${v[0].toUpperCase()+v.slice(1)}</span>`)}
              </div>
            </div>
            <div class="field">
              <div class="field-lbl">Size</div>
              <div class="pill-grp">
                ${(['sm','md','lg'] as const).map((v,i) => html`
                  <span class="pill ${size === v ? 'on' : ''}"
                    @click=${()=>this._setAreaStyle(name,'buttonSize',v)}>
                    ${['Small','Medium','Large'][i]}</span>`)}
              </div>
            </div>`;
        })()}
        `)}
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  //  TAB: VIEWS
  // ══════════════════════════════════════════════════════════════

  private _updateView(id: string, patch: Partial<ViewConfig>): void {
    const views = (this._config.views ?? []).map(v => v.id === id ? { ...v, ...patch } : v);
    this._set('views', views);
  }

  private _updateViewFilter(id: string, patch: Partial<NonNullable<ViewConfig['filter']>>): void {
    const views = (this._config.views ?? []).map(v => {
      if (v.id !== id) return v;
      const filter = { ...(v.filter ?? {}), ...patch };
      // Drop empty-array / empty-string fields so filter stays minimal
      for (const k of Object.keys(filter) as Array<keyof typeof filter>) {
        const val = filter[k];
        if (val == null) delete filter[k];
        else if (Array.isArray(val) && val.length === 0) delete filter[k];
        else if (typeof val === 'string' && val === '') delete filter[k];
      }
      return { ...v, filter: Object.keys(filter).length ? filter : undefined };
    });
    this._set('views', views);
  }

  private _toggleViewFilterValue(
    id: string, key: 'profiles' | 'domains' | 'areas' | 'devices' | 'exclude_devices', value: string,
  ): void {
    const v = (this._config.views ?? []).find(x => x.id === id);
    const cur = (v?.filter?.[key] as string[] | undefined) ?? [];
    const next = cur.includes(value) ? cur.filter(x => x !== value) : [...cur, value];
    this._updateViewFilter(id, { [key]: next } as any);
  }

  private _addView(): void {
    const existing = this._config.views ?? [];
    // Generate a unique id
    let n = existing.length + 1;
    while (existing.some(v => v.id === `view_${n}`)) n++;
    const newView: ViewConfig = { id: `view_${n}`, name: `View ${n}` };
    this._set('views', [...existing, newView]);
    this._flushConfig();   // structural change — apply immediately
    this._expandedViewIds = new Set([...this._expandedViewIds, newView.id]);
  }

  /** Returns an error message if the pattern is set but not a valid RegExp, else null. */
  private _regexError(pattern?: string): string | null {
    if (!pattern) return null;
    try { new RegExp(pattern); return null; } catch (e) { return (e as Error).message; }
  }

  private _deleteView(id: string): void {
    const next = (this._config.views ?? []).filter(v => v.id !== id);
    this._set('views', next.length ? next : undefined);
    if (this._config.default_view === id) this._set('default_view', undefined);
    this._flushConfig();   // structural change — apply immediately
  }

  /** In-card two-click delete confirm (no browser popup): first click arms the
   *  button, second deletes; it auto-disarms after a few seconds. */
  private _armDeleteView(id: string): void {
    clearTimeout(this._viewDeleteTimer);
    if (this._viewDeleteArmed === id) {
      this._viewDeleteArmed = null;
      this._deleteView(id);
      return;
    }
    this._viewDeleteArmed = id;
    this._viewDeleteTimer = setTimeout(() => { this._viewDeleteArmed = null; }, 3500);
  }


  private _moveView(id: string, dir: -1 | 1): void {
    const views = [...(this._config.views ?? [])];
    const idx = views.findIndex(v => v.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= views.length) return;
    [views[idx], views[target]] = [views[target], views[idx]];
    this._set('views', views);
    this._flushConfig();   // structural change — apply immediately
  }

  /** Editor-side mirror of the runtime filter — returns how many discovered devices a view matches.
   *  `discovered` (sorted list) and `byId` (device_id → full device) are built ONCE by the caller
   *  and shared across all view cards, so we don't re-scan/sort per view on every re-render. */
  private _countViewMatches(
    v: ViewConfig,
    discovered: Array<{ device_id: string; name: string; area?: string }>,
    byId: Map<string, ReturnType<typeof getAllDevices>[number]>,
  ): number {
    const f = v.filter;
    let pool = discovered;
    if (!f) return pool.length;
    if (f.profiles?.length) {
      const allow = new Set(f.profiles);
      pool = pool.filter(d => {
        const full = byId.get(d.device_id);
        return full && allow.has(getDeviceProfile(full).type);
      });
    }
    if (f.domains?.length) {
      const allow = new Set(f.domains);
      pool = pool.filter(d => byId.get(d.device_id)?.entities.some(e => allow.has(e.domain)));
    }
    if (f.areas?.length) {
      const allow = new Set(f.areas.map(a => a.toLowerCase()));
      pool = pool.filter(d => allow.has((d.area ?? '').toLowerCase()));
    }
    if (f.devices?.length) {
      const allow = new Set(f.devices);
      pool = pool.filter(d => allow.has(d.device_id));
    }
    if (f.exclude_devices?.length) {
      const block = new Set(f.exclude_devices);
      pool = pool.filter(d => !block.has(d.device_id));
    }
    if (f.entity_id_pattern) {
      try {
        const re = new RegExp(f.entity_id_pattern);
        pool = pool.filter(d => byId.get(d.device_id)?.entities.some(e => re.test(e.entity_id)));
      } catch { /* invalid regex → no filtering */ }
    }
    return pool.length;
  }

  private _renderViewsTab(): TemplateResult {
    const views = this._config.views ?? [];
    const PROFILE_OPTS: DeviceProfile[] = [
      'relay', 'plug', 'dimmer', 'rgb', 'climate', 'wall_display',
      'cover', 'valve', 'energy', 'sensor', 'input', 'uni',
    ];
    const DOMAIN_OPTS = ['light', 'switch', 'sensor', 'binary_sensor', 'climate', 'cover', 'valve', 'button', 'select', 'number'];
    const allAreas = this._getAreas();
    const allDiscovered = this._getDiscoveredDevices();
    // Build the id→device map once and share it across all view cards.
    const byId = new Map(this._allDevices().map(d => [d.device_id, d]));

    return html`
      <div class="views-header">
        <div style="color:var(--t2);font-size:12px">
          Views let you swap between filtered dashboards — e.g. Overview, Energy, Lights. Favourites are shown only on views with <b>Show favourites</b> enabled.
        </div>
        <button class="btn-copy" @click=${() => this._addView()}>+ Add view</button>
      </div>

      ${views.length === 0 ? html`
        <div class="empty-views">
          <div>No views configured.</div>
          <div style="font-size:11px;margin-top:4px;color:var(--t3)">Without views, the card renders all devices in a single layout. Add a view to enable the tab bar.</div>
        </div>
      ` : html`
        <div class="field" style="padding:6px 0">
          <div class="field-lbl">Default view (selected on first load)</div>
          <div class="pill-grp">
            ${views.map(v => html`
              <span class="pill ${(this._config.default_view ?? views[0].id) === v.id ? 'on' : ''}"
                @click=${() => this._set('default_view', v.id === views[0].id ? undefined : v.id)}>${v.name || v.id}</span>`)}
          </div>
        </div>
      `}

      ${views.map((v, i) => this._renderViewCard(v, i, views.length, PROFILE_OPTS, DOMAIN_OPTS, allAreas, allDiscovered, byId))}
    `;
  }

  private _renderViewCard(
    v: ViewConfig, idx: number, total: number,
    profiles: DeviceProfile[], domains: string[],
    areas: Array<{ id: string; name: string }>,
    allDevices: Array<{ device_id: string; name: string; area?: string }>,
    byId: Map<string, ReturnType<typeof getAllDevices>[number]>,
  ): TemplateResult {
    const expanded = this._expandedViewIds.has(v.id);
    const filter = v.filter ?? {};
    const selectedDevices = new Set(filter.devices ?? []);
    const excludedDevices = new Set(filter.exclude_devices ?? []);
    const matchCount = this._countViewMatches(v, allDevices, byId);
    const totalCount = allDevices.length;
    const setViewField = <K extends keyof ViewConfig>(key: K, val: ViewConfig[K]) =>
      this._updateView(v.id, { [key]: val } as Partial<ViewConfig>);

    return html`
      <div class="view-card ${expanded ? 'expanded' : ''}">
        <div class="view-card-hdr" @click=${() => {
          const next = new Set(this._expandedViewIds);
          if (expanded) next.delete(v.id); else next.add(v.id);
          this._expandedViewIds = next;
        }}>
          <span class="view-card-icon">${v.icon ? html`<ha-icon .icon=${v.icon}></ha-icon>` : '☰'}</span>
          <span class="view-card-name">${v.name || v.id}</span>
          <span class="view-card-id">#${v.id}</span>
          <span class="view-card-count" title="Devices matching this view's filter">${matchCount}/${totalCount}</span>
          <div class="view-card-actions" @click=${(e: Event) => e.stopPropagation()}>
            <button class="vc-btn" ?disabled=${idx === 0}           title="Move up"   @click=${() => this._moveView(v.id, -1)}>▲</button>
            <button class="vc-btn" ?disabled=${idx === total - 1}   title="Move down" @click=${() => this._moveView(v.id, 1)}>▼</button>
            <button class="vc-btn danger ${this._viewDeleteArmed === v.id ? 'armed' : ''}"
              title=${this._viewDeleteArmed === v.id ? `Delete "${v.name}"?` : 'Delete view'}
              @click=${() => this._armDeleteView(v.id)}>${this._viewDeleteArmed === v.id ? 'Delete?' : '🗑'}</button>
          </div>
          <span class="view-card-chev">${expanded ? '▲' : '▼'}</span>
        </div>

        ${expanded ? html`
          <div class="view-card-body">
            <!-- Identity -->
            ${this._adv(html`
            <div class="field">
              <div class="field-lbl">ID (used in URL / localStorage)</div>
              <input type="text" class="inline-text" .value=${v.id}
                @change=${(e: Event) => {
                  const newId = (e.target as HTMLInputElement).value.trim();
                  if (!newId || newId === v.id) return;
                  if ((this._config.views ?? []).some(x => x.id === newId)) { alert('ID already in use'); return; }
                  this._updateView(v.id, { id: newId });
                  if (this._config.default_view === v.id) this._set('default_view', newId);
                  { const next = new Set(this._expandedViewIds); next.delete(v.id); next.add(newId); this._expandedViewIds = next; }
                }}/>
            </div>`)}
            <div class="field">
              <div class="field-lbl">Name (tab label)</div>
              <input type="text" class="inline-text" .value=${v.name}
                @input=${(e: Event) => setViewField('name', (e.target as HTMLInputElement).value)}/>
            </div>
            <div class="field">
              <div class="field-lbl">Icon (mdi:*)</div>
              <input type="text" class="inline-text" placeholder="mdi:home" .value=${v.icon ?? ''}
                @change=${(e: Event) => { const val = (e.target as HTMLInputElement).value.trim(); setViewField('icon', val || undefined); }}/>
            </div>

            <!-- Gating -->
            <div class="tog-row" style="border:none;padding:4px 0 0">
              <div class="tog-lbl">Show Favourites section</div>
              <label class="sw"><input type="checkbox" .checked=${v.show_favourites === true}
                @change=${(e: Event) => setViewField('show_favourites', (e.target as HTMLInputElement).checked ? true : undefined)}>
                <span class="sw-t"></span><span class="sw-b"></span></label>
            </div>
            <div class="tog-row" style="border:none;padding:4px 0 0">
              <div class="tog-lbl">Group by room</div>
              <label class="sw"><input type="checkbox" .checked=${v.show_rooms !== false}
                @change=${(e: Event) => setViewField('show_rooms', (e.target as HTMLInputElement).checked ? undefined : false)}>
                <span class="sw-t"></span><span class="sw-b"></span></label>
            </div>

            <!-- Filter -->
            <div class="subgroup-lbl" style="margin-top:10px">Filter (empty = all devices)</div>

            <div class="field">
              <div class="field-lbl">Profiles
                ${this._selAllNone(
                  () => this._updateViewFilter(v.id, { profiles: [...profiles] }),
                  () => this._updateViewFilter(v.id, { profiles: [] }))}</div>
              <div class="pill-grp">
                ${profiles.map(p => html`
                  <span class="pill ${(filter.profiles ?? []).includes(p) ? 'on' : ''}"
                    @click=${() => this._toggleViewFilterValue(v.id, 'profiles', p)}>${p}</span>`)}
              </div>
            </div>

            ${this._adv(html`
            <div class="field">
              <div class="field-lbl">Entity domains
                ${this._selAllNone(
                  () => this._updateViewFilter(v.id, { domains: [...domains] }),
                  () => this._updateViewFilter(v.id, { domains: [] }))}</div>
              <div class="pill-grp">
                ${domains.map(d => html`
                  <span class="pill ${(filter.domains ?? []).includes(d) ? 'on' : ''}"
                    @click=${() => this._toggleViewFilterValue(v.id, 'domains', d)}>${d}</span>`)}
              </div>
            </div>`)}

            ${areas.length ? html`
              <div class="field">
                <div class="field-lbl">Areas
                  ${this._selAllNone(
                    () => this._updateViewFilter(v.id, { areas: areas.map(a => a.name) }),
                    () => this._updateViewFilter(v.id, { areas: [] }))}</div>
                <div class="pill-grp">
                  ${areas.map(a => html`
                    <span class="pill ${(filter.areas ?? []).includes(a.name) ? 'on' : ''}"
                      @click=${() => this._toggleViewFilterValue(v.id, 'areas', a.name)}>${a.name}</span>`)}
                </div>
              </div>` : nothing}

            <div class="field">
              <div class="field-lbl">Include specific devices (overrides profiles/domains filter — AND with other gates)</div>
              <div class="view-dev-list">
                ${repeat(allDevices, d => d.device_id, d => html`
                  <label class="view-dev-row">
                    <input type="checkbox" .checked=${selectedDevices.has(d.device_id)}
                      @change=${() => this._toggleViewFilterValue(v.id, 'devices', d.device_id)}>
                    <span class="view-dev-name">${d.name}</span>
                    ${d.area ? html`<span class="view-dev-area">${d.area}</span>` : nothing}
                  </label>`)}
              </div>
            </div>

            <div class="field">
              <div class="field-lbl">Exclude devices</div>
              <div class="view-dev-list">
                ${repeat(allDevices, d => d.device_id, d => html`
                  <label class="view-dev-row">
                    <input type="checkbox" .checked=${excludedDevices.has(d.device_id)}
                      @change=${() => this._toggleViewFilterValue(v.id, 'exclude_devices', d.device_id)}>
                    <span class="view-dev-name">${d.name}</span>
                    ${d.area ? html`<span class="view-dev-area">${d.area}</span>` : nothing}
                  </label>`)}
              </div>
            </div>

            ${this._themeOverrideSelect(
              v.theme,
              (t) => setViewField('theme', t),
              `Repaints the whole card — header included — while this view is showing.
               Overrides the card theme and any colour set in Design → Colours.`)}

            ${this._adv(html`
            <div class="field">
              <div class="field-lbl">Entity-ID regex (optional)</div>
              <input type="text" class="inline-text ${this._regexError(filter.entity_id_pattern) ? 'input-invalid' : ''}" placeholder="e.g. ^light\\..*"
                .value=${filter.entity_id_pattern ?? ''}
                @change=${(e: Event) => this._updateViewFilter(v.id, { entity_id_pattern: (e.target as HTMLInputElement).value || undefined })}/>
              ${this._regexError(filter.entity_id_pattern)
                ? html`<div class="input-err">Invalid regex: ${this._regexError(filter.entity_id_pattern)}</div>`
                : nothing}
            </div>`)}

            ${this._adv(html`
            <!-- Layout overrides -->
            <div class="subgroup-lbl" style="margin-top:10px">Layout &amp; style overrides (optional)</div>

            <div class="field">
              <div class="field-lbl">Tile style</div>
              <div class="pill-grp">
                ${(['default','power-monitor','light-control','climate-control','cover-control','sensor-card','scene-button'] as const).map(s => html`
                  <span class="pill ${(v.tile_style ?? 'default') === s ? 'on' : ''}"
                    @click=${() => setViewField('tile_style', s === 'default' ? undefined : s)}>${s}</span>`)}
              </div>
            </div>
            ${v.tile_style === 'power-monitor' ? html`
              <div class="field">
                <div class="field-lbl">Power-monitor variant</div>
                <div class="pill-grp">
                  ${(['big-number','gauge','graph','compact','table'] as PowerMonitorVariant[]).map(pv => html`
                    <span class="pill ${(v.power_monitor_variant ?? 'big-number') === pv ? 'on' : ''}"
                      @click=${() => setViewField('power_monitor_variant', pv === 'big-number' ? undefined : pv)}>${pv}</span>`)}
                </div>
              </div>` : nothing}

            <div class="field">
              <div class="field-lbl">Columns — <span style="color:#f4601e">${v.columns ?? 'inherit'}</span></div>
              <input type="range" min="1" max="6" step="1" .value=${String(v.columns ?? this._config.columns ?? 3)}
                @input=${(e: Event) => setViewField('columns', parseInt((e.target as HTMLInputElement).value, 10))}/>
              ${v.columns !== undefined ? html`<button class="color-reset" @click=${() => setViewField('columns', undefined)}>↺</button>` : nothing}
            </div>

            <div class="field">
              <div class="field-lbl">Tile size</div>
              <div class="pill-grp">
                ${(['sm','md','lg'] as const).map(sz => html`
                  <span class="pill ${(v.tile_size ?? 'inherit') === sz ? 'on' : ''}"
                    @click=${() => setViewField('tile_size', sz)}>${sz}</span>`)}
                <span class="pill ${v.tile_size === undefined ? 'on' : ''}"
                  @click=${() => setViewField('tile_size', undefined)}>inherit</span>
              </div>
            </div>`)}
          </div>` : nothing}
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  //  TAB: LAYOUT
  // ══════════════════════════════════════════════════════════════

  /** Columns stepper — lives inside the consolidated Tiles section. */
  private _gridBody(): TemplateResult {
    const c = this._config;
    return html`
      <div class="field">
        <div class="field-lbl">Columns <span class="field-note">overridden per-room / per-view</span></div>
        <div class="step-row">
          <button class="step-btn" @click=${()=>this._set('columns',Math.max(1,(c.columns??1)-1))}>−</button>
          <span class="step-val">${c.columns ?? 1}</span>
          <button class="step-btn" @click=${()=>this._set('columns',Math.min(6,(c.columns??1)+1))}>+</button>
          <input type="range" min="1" max="6" step="1" style="flex:1;margin-left:8px"
            .value=${String(c.columns ?? 1)}
            @input=${(e:Event)=>this._set('columns',parseInt((e.target as HTMLInputElement).value,10))}/>
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  //  TAB: STYLE
  // ══════════════════════════════════════════════════════════════

  /** Style section bodies, keyed by id — consumed by the Design tab and
   *  by _renderCustomTab (so these sections can be moved into other/custom tabs). */
  private _layoutSectionDescriptors(): Record<string, SectionDesc> {
    const c = this._config;
    const sty: StyleCfg = c.style ?? {};

    const hStyleSet = (key: keyof StyleCfg, val: unknown) => this._set('style', { ...sty, [key]: val });
    const hStyleDel = (key: keyof StyleCfg) => { const s = { ...sty }; delete s[key]; this._set('style', s); };
    const hColorRow = (label: string, key: keyof StyleCfg, def: string) => {
      const cur = sty[key] ?? def;
      return html`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${cur}"></div>
          <span class="color-key">${label}</span>
          <input type="color" .value=${cur}
            @input=${(e:Event) => hStyleSet(key, (e.target as HTMLInputElement).value)}/>
          ${sty[key] ? html`<button class="color-reset" @click=${() => hStyleDel(key)}>↺</button>` : nothing}
        </div>`;
    };

    // Labels actually present on discovered devices, with HA's display name when
    // the label registry is available. No point offering labels nobody uses.
    const deviceLabels = (() => {
      const counts = new Map<string, number>();
      for (const d of this._allDevices()) {
        for (const l of d.labels ?? []) counts.set(l, (counts.get(l) ?? 0) + 1);
      }
      const reg = (this.hass as unknown as { labels?: Record<string, { name?: string }> })?.labels;
      return [...counts.entries()]
        .map(([id, n]) => ({ id, n, name: reg?.[id]?.name ?? id.replace(/_/g, ' ') }))
        .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
    })();
    const lightLabels = new Set(c.light_labels ?? []);

    const headerBody = html`
      <!-- Title -->
      <div class="field">
        <div class="field-lbl">Card title</div>
        <div style="display:flex;gap:6px">
          <input type="text" class="inline-text" placeholder="Shelly"
            .value=${c.title ?? ''}
            @change=${(e:Event) => { const v=(e.target as HTMLInputElement).value.trim(); this._set('title', v||undefined); }}
            style="flex:1"/>
          <input type="text" class="inline-text" placeholder="⚡" maxlength="4"
            title="Icon / emoji before title"
            .value=${sty.header_icon ?? ''}
            @change=${(e:Event) => { const v=(e.target as HTMLInputElement).value.trim(); hStyleSet('header_icon', v||undefined); }}
            style="width:48px;text-align:center;font-size:16px"/>
        </div>
      </div>
      ${this._adv(html`
      <!-- Appearance sliders -->
      <div class="field">
        <div class="field-lbl">Title size — <span style="color:#f4601e">${(sty.header_title_size ?? 1.1).toFixed(1)}em</span>${this._resetBtn(sty.header_title_size !== undefined, () => this._clearStyle('header_title_size'))}</div>
        <input type="range" min="0.7" max="1.8" step="0.1" .value=${String(sty.header_title_size ?? 1.1)}
          @input=${(e:Event) => { const v=parseFloat((e.target as HTMLInputElement).value); hStyleSet('header_title_size', v===1.1?undefined:v); }}/>
      </div>
      <div class="field">
        <div class="field-lbl">Header height — <span style="color:#f4601e">${sty.header_padding ?? 16}px</span>${this._resetBtn(sty.header_padding !== undefined, () => this._clearStyle('header_padding'))}</div>
        <input type="range" min="6" max="40" step="2" .value=${String(sty.header_padding ?? 16)}
          @input=${(e:Event) => { const v=parseInt((e.target as HTMLInputElement).value); hStyleSet('header_padding', v===16?undefined:v); }}/>
      </div>
      <div class="field">
        <div class="field-lbl">Corner radius — <span style="color:#f4601e">${sty.header_radius ?? 0}px</span>${this._resetBtn(sty.header_radius !== undefined, () => this._clearStyle('header_radius'))}</div>
        <input type="range" min="0" max="24" step="2" .value=${String(sty.header_radius ?? 0)}
          @input=${(e:Event) => { const v=parseInt((e.target as HTMLInputElement).value); hStyleSet('header_radius', v===0?undefined:v); }}/>
      </div>
      <!-- Bottom border/separator -->
      <div class="field">
        <div class="field-lbl">Bottom border — <span style="color:#f4601e">${sty.header_border_width ?? 0}px</span>${this._resetBtn(sty.header_border_width !== undefined, () => this._clearStyle('header_border_width'))}</div>
        <input type="range" min="0" max="6" step="1" .value=${String(sty.header_border_width ?? 0)}
          @input=${(e:Event) => { const v=parseInt((e.target as HTMLInputElement).value); hStyleSet('header_border_width', v===0?undefined:v); }}/>
      </div>
      ${(sty.header_border_width ?? 0) > 0 ? hColorRow('Border color', 'header_border_color', '#4ade80') : nothing}
      `)}
      <!-- Visibility toggles -->
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show title</div>
        <label class="sw"><input type="checkbox" .checked=${c.header_show_title !== false}
          @change=${(e:Event) => this._set('header_show_title', (e.target as HTMLInputElement).checked ? undefined : false)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show stats (online / power)</div>
        <label class="sw"><input type="checkbox" .checked=${c.header_show_stats !== false}
          @change=${(e:Event) => this._set('header_show_stats', (e.target as HTMLInputElement).checked ? undefined : false)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      ${c.header_show_stats !== false ? html`
        <div class="field" style="margin:6px 0 2px">
          <div class="field-lbl" style="display:flex;align-items:center;gap:8px">
            Header chips
            ${c.header_chips ? html`<button class="color-reset" @click=${() => this._set('header_chips', undefined)}>↺ Default</button>` : nothing}
          </div>
          <div class="pill-grp">
            ${HEADER_CHIP_DEFS.map(def => {
              const sel = c.header_chips ?? DEFAULT_HEADER_CHIPS;
              const on = sel.includes(def.key);
              return html`
                <span class="pill ${on ? 'on' : ''}"
                  @click=${() => {
                    const next = on ? sel.filter(k => k !== def.key) : [...sel, def.key];
                    const isDefault = next.length === DEFAULT_HEADER_CHIPS.length && DEFAULT_HEADER_CHIPS.every(k => next.includes(k));
                    this._set('header_chips', isDefault ? undefined : next);
                  }}>${def.label}</span>`;
            })}
          </div>
          <div class="hint" style="margin-top:4px">Each chip is clickable on the card and lists devices high → low.</div>
        </div>` : nothing}
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show cloud chips (extra status row)</div>
        <label class="sw"><input type="checkbox" .checked=${c.header_show_cloud === true}
          @change=${(e:Event) => this._set('header_show_cloud', (e.target as HTMLInputElement).checked ? true : undefined)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      ${this._adv(html`
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show glow orbs</div>
        <label class="sw"><input type="checkbox" .checked=${(c.header_show_orbs ?? c.effects ?? false) === true}
          @change=${(e:Event) => this._set('header_show_orbs', (e.target as HTMLInputElement).checked ? true : undefined)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Ambient effects (pulse, glow, blur)</div>
        <label class="sw"><input type="checkbox" .checked=${c.effects === true}
          @change=${(e:Event) => this._set('effects', (e.target as HTMLInputElement).checked ? true : undefined)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <!-- Background colors -->
      ${hColorRow('Background gradient start', 'header_bg',         '#1a1a2e')}
      ${hColorRow('Background gradient end',   'header_bg2',        '#0f3460')}
      ${hColorRow('Text color',                'header_text_color', '#ffffff')}
      ${hColorRow('Orb / glow color',          'header_orb_color',  '#3b82f6')}
      <!-- Stat chip colors -->
      ${hColorRow('Online chip color',  'header_stat_online',  '#4ade80')}
      ${hColorRow('Power chip color',   'header_stat_power',   '#fb923c')}
      ${hColorRow('Offline chip color', 'header_stat_offline', '#9ca3af')}
      <!-- Opacity -->
      <div class="field">
        <div class="field-lbl">Background opacity — <span style="color:#f4601e">${c.header_opacity ?? 100}%</span>${this._resetBtn(c.header_opacity !== undefined, () => this._clearCfg('header_opacity'))}</div>
        <input type="range" min="0" max="100" step="5" .value=${String(c.header_opacity ?? 100)}
          @input=${(e:Event) => { const v=parseInt((e.target as HTMLInputElement).value); this._set('header_opacity', v===100?undefined:v); }}/>
      </div>`)}`;

    const colorRow = (label: string, key: keyof StyleCfg, def: string) => {
      const cur = sty[key] ?? def;
      return html`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${cur}"></div>
          <span class="color-key">${label}</span>
          <input type="color" .value=${cur}
            @input=${(e:Event)=>this._set('style',{...sty,[key]:(e.target as HTMLInputElement).value})}/>
          ${sty[key] ? html`<button class="color-reset" @click=${()=>{const s={...sty};delete s[key];this._set('style',s)}}>↺</button>` : nothing}
        </div>`;
    };
    // Tile colours live inside the Tiles section; brand/text/status in Colours.
    const tileColorRows = html`
      ${colorRow('Tile background',    'tile_bg',           'rgba(255,244,232,0.035)')}
      ${colorRow('Tile border',        'tile_border',       'rgba(255,244,232,0.08)')}
      ${colorRow('Tile hover BG',      'tile_hover_bg',     'rgba(255,244,232,0.06)')}
      ${colorRow('Tile hover shadow',  'tile_hover_shadow', 'rgba(0,0,0,0.35)')}
      ${colorRow('Sensor chip BG',     'tile_sensor_bg',    'rgba(255,244,232,0.045)')}
      ${colorRow('Expanded panel BG',  'tile_exp_bg',       'rgba(255,244,232,0.05)')}`;
    const colorsBody = html`
      <div class="subgroup-lbl">Brand</div>
      ${colorRow('Accent / brand',     'accent_color',      '#c98a63')}
      ${colorRow('Room header label',  'area_header_color', '#c98a63')}

      <div class="subgroup-lbl">Text &amp; status</div>
      ${colorRow('Text primary',       'text_primary',      '#ece5dc')}
      ${colorRow('Text secondary',     'text_secondary',    '#b3a596')}
      ${colorRow('Text muted',         'text_muted',        '#7e7265')}
      ${colorRow('Online dot',         'online_color',      '#93b384')}
      ${colorRow('Offline dot',        'offline_color',     '#d47f62')}
      ${colorRow('Power reading',      'power_color',       '#dba25c')}`;

    const currentFont = sty.font_family ?? '';
    const fontGroups = ['System', 'Bundled', 'Display'];
    const typogBody = html`
      <div class="field">
        <div class="field-lbl">Font family</div>
        <select class="font-select" style=${currentFont ? `font-family:${currentFont}` : ''}
          @change=${(e:Event) => {
            const v = (e.target as HTMLSelectElement).value;
            if (!v) {
              const { font_family: _ff, ...rest } = sty as any;
              this._set('style', Object.keys(rest).length ? rest : undefined);
            } else {
              this._set('style', { ...sty, font_family: v });
            }
          }}>
          ${fontGroups.map(g => html`
            <optgroup label="${g}">
              ${FONT_OPTIONS.filter(f => f.group === g).map(f => html`
                <option .value=${f.value ?? ''} ?selected=${(sty.font_family ?? '') === (f.value ?? '')}
                  style="${f.value ? `font-family:${f.value}` : ''}">${f.label}</option>`)}
            </optgroup>`)}
        </select>
      </div>
      <div class="field">
        <div class="field-lbl">Text scale — <span style="color:#f4601e">${(sty.text_size_scale ?? 1).toFixed(2)}×</span>${this._resetBtn(sty.text_size_scale !== undefined, () => this._clearStyle('text_size_scale'))}</div>
        <input type="range" min="0.8" max="1.3" step="0.05" .value=${String(sty.text_size_scale ?? 1)}
          @input=${(e:Event) => this._set('style', { ...sty, text_size_scale: parseFloat((e.target as HTMLInputElement).value) })}/>
      </div>
      </div>`;

    const cardTranspPct  = c.card_opacity  ?? 100;
    const tileTranspPct  = c.tile_opacity  ?? 100;
    const tilesBody = html`
      ${this._gridBody()}
      <div class="tog-row" data-ctl="smart_tile_styles">
        <div class="tog-lbl">Smart tile styles
          <div class="hint">Auto-pick a layout per device type where you haven't set one — relay→power monitor, light→colour wheel, sensor→card.</div>
        </div>
        <label class="sw"><input type="checkbox" .checked=${c.smart_tile_styles === true}
          @change=${(e: Event) => this._set('smart_tile_styles', (e.target as HTMLInputElement).checked || undefined)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row ${this._flashControl === 'delegate_controls' ? 'ctl-flash' : ''}" data-ctl="delegate_controls">
        <div class="tog-lbl">Native controls
          <div class="hint">Show controls for media players, fans, vacuums, locks and other devices this card doesn't draw itself, using Home Assistant's own tiles. Off by default — each one embeds a native element, so it costs a little render time on big media fleets.</div>
        </div>
        <label class="sw"><input type="checkbox" .checked=${c.delegate_controls === true}
          @change=${(e: Event) => this._set('delegate_controls', (e.target as HTMLInputElement).checked || undefined)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="field">
        <div class="field-lbl">Tile size</div>
        <div class="pill-grp">
          ${(['sm','md','lg'] as const).map((v,i) => html`
            <span class="pill ${(c.tile_size ?? 'md') === v ? 'on' : ''}" @click=${()=>this._set('tile_size',v)}>${['Small','Medium','Large'][i]}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Tile gap — <span style="color:#f4601e">${sty.tile_gap ?? 10}px</span>${this._resetBtn(sty.tile_gap !== undefined, () => this._clearStyle('tile_gap'))}</div>
        <input type="range" min="4" max="24" step="2" .value=${String(sty.tile_gap ?? 10)}
          @input=${(e:Event)=>this._set('style',{...sty,tile_gap:parseInt((e.target as HTMLInputElement).value,10)})}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile radius — <span style="color:#f4601e">${sty.tile_radius ?? 12}px</span>${this._resetBtn(sty.tile_radius !== undefined, () => this._clearStyle('tile_radius'))}</div>
        <input type="range" min="0" max="24" .value=${String(sty.tile_radius ?? 12)}
          @input=${(e:Event)=>this._set('style',{...sty,tile_radius:parseInt((e.target as HTMLInputElement).value,10)})}/>
      </div>
      ${this._adv(html`
      <div class="field">
        <div class="field-lbl">Tile border width — <span style="color:#f4601e">${sty.tile_border_width ?? 1}px</span>${this._resetBtn(sty.tile_border_width !== undefined, () => this._clearStyle('tile_border_width'))}</div>
        <input type="range" min="0" max="4" step="1" .value=${String(sty.tile_border_width ?? 1)}
          @input=${(e:Event)=>{ const v=parseInt((e.target as HTMLInputElement).value); this._set('style',{...sty,tile_border_width:v===1?undefined:v}); }}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile shadow</div>
        <div class="pill-grp">
          ${(['none','soft','medium','strong'] as const).map(v => html`
            <span class="pill ${(sty.tile_box_shadow ?? 'none') === v ? 'on' : ''}"
              @click=${()=>this._set('style',{...sty,tile_box_shadow:v==='none'?undefined:v})}>
              ${v[0].toUpperCase()+v.slice(1)}</span>`)}
        </div>
      </div>
      <div class="tiles-divider">Tile background image</div>
      <div class="field">
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="tile-bg"
            @change=${(e:Event) => this._handleTileBgUpload(e)}/>
          <button class="upload-btn" @click=${() => {
            (this.renderRoot.querySelector('input[data-upload="tile-bg"]') as HTMLInputElement|null)?.click();
          }}>↑ Local</button>
          ${sty.tile_bg_image ? this._renderBgThumb(sty.tile_bg_image) : nothing}
          ${sty.tile_bg_image?.startsWith('data:')
            ? html`<span class="bg-embedded-note">Embedded · ${this._estimateImageSize(sty.tile_bg_image)}</span>`
            : html`<input type="text" class="inline-text" placeholder="/local/image.png or https://…"
                .value=${sty.tile_bg_image ?? ''}
                @change=${(e:Event) => {
                  const v = (e.target as HTMLInputElement).value.trim();
                  const next = { ...sty };
                  if (v) next.tile_bg_image = v; else delete (next as any).tile_bg_image;
                  this._set('style', Object.keys(next).length ? next : undefined);
                }}/>`}
          ${sty.tile_bg_image ? html`<button class="color-reset" @click=${() => {
            const next = { ...sty }; delete (next as any).tile_bg_image; delete (next as any).tile_bg_image_size;
            this._set('style', Object.keys(next).length ? next : undefined);
          }}>↺</button>` : nothing}
        </div>
        ${sty.tile_bg_image ? html`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${(['cover','contain','stretch'] as const).map(v => html`
              <span class="pill ${(sty.tile_bg_image_size ?? 'cover') === v ? 'on' : ''}"
                @click=${()=>this._set('style',{...sty,tile_bg_image_size:v})}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
          </div>
        ` : nothing}
      </div>
      <div class="tiles-divider">Tile colours</div>
      ${tileColorRows}
      `)}
    `;

    const cardBody = html`
      <div class="tog-row">
        <div class="tog-lbl">Needs attention
          <div class="hint">A summary above the rooms listing offline devices, firing alerts, flat batteries and pending updates. It only appears when something qualifies.</div>
        </div>
        <label class="sw"><input type="checkbox" .checked=${c.show_attention !== false}
          @change=${(e: Event) => this._set('show_attention', (e.target as HTMLInputElement).checked ? undefined : false)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      ${c.show_attention !== false ? html`
        <div class="field">
          <div class="field-lbl">Flag a battery at or below — <span style="color:#f4601e">${c.attention_battery ?? 20}%</span>${this._resetBtn(c.attention_battery !== undefined, () => this._clearCfg('attention_battery'))}</div>
          <input type="range" min="5" max="50" step="5" .value=${String(c.attention_battery ?? 20)}
            @input=${(e: Event) => { const v = parseInt((e.target as HTMLInputElement).value, 10); this._set('attention_battery', v === 20 ? undefined : v); }}/>
        </div>
        <div class="tog-row">
          <div class="tog-lbl">Count beta firmware
            <div class="hint">Shelly devices offer a beta build almost permanently. Off by default, so “needs update” means a release you would actually install.</div>
          </div>
          <label class="sw"><input type="checkbox" .checked=${c.include_beta_updates === true}
            @change=${(e: Event) => this._set('include_beta_updates', (e.target as HTMLInputElement).checked || undefined)}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>
        <div class="tog-row">
          <div class="tog-lbl">Firmware spread
            <div class="hint">Inside that summary, group the fleet by firmware version so you can see what is lagging. Hidden when everything is on one version.</div>
          </div>
          <label class="sw"><input type="checkbox" .checked=${c.show_firmware_summary !== false}
            @change=${(e: Event) => this._set('show_firmware_summary', (e.target as HTMLInputElement).checked ? undefined : false)}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>` : nothing}
      ${colorRow('Dashboard background', 'card_bg', '#1e1a17')}
      <div class="field">
        <div class="field-lbl">Card corner radius — <span style="color:#f4601e">${sty.card_radius ?? 12}px</span>${this._resetBtn(sty.card_radius !== undefined, () => this._clearStyle('card_radius'))}</div>
        <input type="range" min="0" max="32" step="2" .value=${String(sty.card_radius ?? 12)}
          @input=${(e:Event)=>{ const v=parseInt((e.target as HTMLInputElement).value); this._set('style',{...sty,card_radius:v===12?undefined:v}); }}/>
      </div>
      <div class="tiles-divider">Transparency</div>
      <div class="field">
        <div class="field-lbl">Card — <span style="color:#f4601e">${100 - cardTranspPct}%</span>${this._resetBtn(c.card_opacity !== undefined, () => this._clearCfg('card_opacity'))}</div>
        <input type="range" min="0" max="100" .value=${String(100 - cardTranspPct)}
          @input=${(e:Event)=>this._set('card_opacity', 100 - parseInt((e.target as HTMLInputElement).value,10))}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tiles — <span style="color:#f4601e">${100 - tileTranspPct}%</span>${this._resetBtn(c.tile_opacity !== undefined, () => this._clearCfg('tile_opacity'))}</div>
        <input type="range" min="0" max="100" .value=${String(100 - tileTranspPct)}
          @input=${(e:Event)=>this._set('tile_opacity', 100 - parseInt((e.target as HTMLInputElement).value,10))}/>
      </div>
      <div class="tiles-divider">Card background image</div>
      <div class="field">
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="card-bg"
            @change=${(e:Event) => this._handleCardBgUpload(e)}/>
          <button class="upload-btn" @click=${() => {
            (this.renderRoot.querySelector('input[data-upload="card-bg"]') as HTMLInputElement|null)?.click();
          }}>↑ Local</button>
          ${c.card_bg_image ? this._renderBgThumb(c.card_bg_image) : nothing}
          ${c.card_bg_image?.startsWith('data:')
            ? html`<span class="bg-embedded-note">Embedded · ${this._estimateImageSize(c.card_bg_image)}</span>`
            : html`<input type="text" class="inline-text" placeholder="/local/image.png or https://…"
                .value=${c.card_bg_image ?? ''}
                @change=${(e:Event) => {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) this._set('card_bg_image', v); else this._set('card_bg_image', undefined);
                }}/>`}
          ${c.card_bg_image ? html`<button class="color-reset" @click=${() => {
            const updated = { ...this._config };
            delete (updated as any).card_bg_image;
            delete (updated as any).card_bg_image_size;
            this._emitNow(updated as HADeviceDashboardConfig);
          }}>↺</button>` : nothing}
        </div>
        ${c.card_bg_image ? html`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${(['cover','contain','stretch'] as const).map(v => html`
              <span class="pill ${(c.card_bg_image_size ?? 'cover') === v ? 'on' : ''}"
                @click=${()=>this._set('card_bg_image_size',v)}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
          </div>
        ` : nothing}
      </div>`;

    const lightsBody = html`
      <div class="hint" style="margin-bottom:8px">
        The <b>Lights</b> chip counts <code>light</code> entities. Home Assistant has no
        idea a relay or plug is wired to a lamp — tick the labels you use for those, or
        name the entities directly.
      </div>
      ${deviceLabels.length ? html`
        <div class="field-lbl">Labels that mean “this drives a light”</div>
        <div class="pill-grp" style="margin-bottom:10px">
          ${deviceLabels.map(l => html`
            <span class="pill ${lightLabels.has(l.id) ? 'on' : ''}"
              title=${`${l.n} device${l.n > 1 ? 's' : ''} carry this label`}
              @click=${() => {
                const next = new Set(lightLabels);
                if (next.has(l.id)) next.delete(l.id); else next.add(l.id);
                this._set('light_labels', next.size ? [...next] : undefined);
              }}>${l.name} <span style="opacity:.55">${l.n}</span></span>`)}
        </div>`
        : html`<div class="hint" style="margin-bottom:10px">No device labels found — add them in Home Assistant under Settings → Areas &amp; labels, then tick them here.</div>`}
      <div class="field">
        <div class="field-lbl">Extra entities to count</div>
        <input type="text" class="inline-text" style="width:100%"
          placeholder="switch.hall_relay, switch.lamp — comma separated"
          .value=${(c.light_entities ?? []).join(', ')}
          @change=${(e: Event) => {
            const v = (e.target as HTMLInputElement).value.split(',').map(x => x.trim()).filter(Boolean);
            this._set('light_entities', v.length ? v : undefined);
          }}/>
        <div class="hint" style="margin-top:2px">For anything a label does not cover.</div>
      </div>`;

    // Card-wide "what to show" defaults — the first thing to set, at Global scope.
    const collapseAllRow = html`
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Collapse / expand all rooms
          <span class="dev-style-hint">a button above the first room; only when rooms are grouped</span></div>
        <label class="sw"><input type="checkbox" .checked=${c.show_collapse_all !== false}
          @change=${(e:Event) => this._set('show_collapse_all', (e.target as HTMLInputElement).checked ? undefined : false)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>`;

    const contentBody = html`
      ${collapseAllRow}
      <div class="field-lbl">Room header chips</div>
      ${this._renderGlobalRoomHeaderChips()}
      <div class="field" style="margin-top:8px">
        <div class="field-lbl">Energy shows</div>
        ${this._renderEnergyPeriodPicker(c.energy_period, (v) => this._set('energy_period', v === 'total' ? undefined : v))}
      </div>
      <div class="field-lbl" style="margin-top:8px">Sensor chips</div>
      ${this._chipPicker(c.sensors, undefined, 'the default (all shown)', (next) => this._set('sensors', next))}`;

    // The theme picker's home. It also still sits in the ◆ Defaults panel, but
    // that is a collapsed toolbar popover. Rendered by Design at Global scope.
    const themeBody = html`
      <div class="snap-row" style="justify-content:flex-end;margin-bottom:6px">
        ${this._themeActions()}
      </div>
      ${this._renderThemeGrid()}
      <div class="hint" style="margin-top:8px">
        The card's palette. A view or a room can carry a theme of its own on top
        — Views tab, and Per-room styling below — and rooms and devices can
        override individual colours; Colours does that for the whole card.
      </div>`;

    return {
      theme:      { icon: '🎨', bg: 'rgba(244,96,30,0.1)',   fg: '#f4601e', label: 'Colour theme', badge: nothing, body: themeBody },
      header:     { icon: '◈', bg: 'rgba(99,102,241,0.1)',  fg: '#818cf8', label: 'Header',     badge: nothing, body: headerBody },
      lights:     { icon: '💡', bg: 'rgba(251,191,36,0.1)', fg: '#fbbf24', label: 'What counts as a light', badge: nothing, body: lightsBody },
      content:    { icon: '◫', bg: 'rgba(244,96,30,0.1)',   fg: '#f4601e', label: 'Chips & metrics', badge: nothing, body: contentBody },
      tiles:      { icon: '⊡', bg: 'rgba(45,212,191,0.1)',  fg: '#2dd4bf', label: 'Tiles',      badge: nothing, body: tilesBody },
      card:       { icon: '▢', bg: 'rgba(129,140,248,0.1)', fg: '#818cf8', label: 'Card',       badge: nothing, body: cardBody },
      colors:     { icon: '◐', bg: 'rgba(244,96,30,0.12)',  fg: '#f4601e', label: 'Colours',    badge: nothing, body: colorsBody },
      typography: { icon: 'T', bg: 'rgba(251,191,36,0.1)',  fg: '#fbbf24', label: 'Typography', badge: nothing, body: typogBody },
    };
  }


  /** Every movable global section, keyed by id — used to render custom tabs. */
  private _globalSectionDescriptors(): Record<string, SectionDesc> {
    return {
      ...this._layoutSectionDescriptors(),
      ...this._graphSectionDescriptors(),
      ...this._sensorSectionDescriptors(),
    };
  }

  /** Body for a tab that has no bespoke renderer — renders whatever global
   *  sections EDITOR_LAYOUT assigned to it, so custom tabs work end-to-end. */
  private _renderCustomTab(tabId: string): TemplateResult {
    const SENSOR_IDS = new Set(['electrical','environmental','deviceinfo','alerts']);
    return this._renderTabSections(tabId, this._globalSectionDescriptors(), (id, shown) => {
      const priorSensor = [...shown].some(x => SENSOR_IDS.has(x));
      return (SENSOR_IDS.has(id) && !priorSensor)
        ? html`<div class="hint" style="margin:4px 2px 8px">Global default — override per room (Layout & Style → room) or per device (Rooms & devices).</div>`
        : nothing;
    });
  }


  // ══════════════════════════════════════════════════════════════
  //  TAB: GRAPHS
  // ══════════════════════════════════════════════════════════════

  private _graphSectionDescriptors(): Record<string, SectionDesc> {
    const c = this._config;
    const gs = c.graph_style ?? {};
    const graphType = gs.type ?? 'line';
    const sensorColors = c.graph_sensor_colors ?? {};
    const getColor = (key: string) => sensorColors[key] ?? GRAPH_SENSOR_DEFS.find(s=>s.key===key)?.defaultColor ?? '#f4601e';

    const gtBody = html`
      <div class="tog-row" style="border:none;padding:0 0 6px">
        <div class="tog-lbl">Show graphs on tiles
          <span class="field-note">master switch — “Which sensors” below is the palette</span></div>
        <label class="sw"><input type="checkbox" .checked=${c.show_graphs === true}
          @change=${(e:Event)=>this._set('show_graphs', (e.target as HTMLInputElement).checked ? true : undefined)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="field">
        <div class="field-lbl">Type</div>
        <div class="pill-grp">
          ${(['line','area','bar'] as const).map(t => html`
            <span class="pill ${graphType === t ? 'on' : ''}" @click=${()=>this._set('graph_style',{...gs,type:t})}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
        </div>
      </div>
      ${this._adv(html`
      <div class="field" style="opacity:${graphType==='bar'?0.4:1}">
        <div class="field-lbl">Line thickness — <span style="color:#f4601e">${gs.line_width ?? 1.5}px</span>${this._resetBtn(gs.line_width !== undefined, () => this._clearGraphStyle('line_width'))}</div>
        <input type="range" min="0.5" max="4" step="0.5" ?disabled=${graphType==='bar'} .value=${String(gs.line_width ?? 1.5)}
          @input=${(e:Event)=>this._set('graph_style',{...gs,line_width:parseFloat((e.target as HTMLInputElement).value)})}/>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Fill area under line</div>
        <label class="sw"><input type="checkbox" .checked=${gs.fill !== false} @change=${(e:Event)=>this._set('graph_style',{...gs,fill:(e.target as HTMLInputElement).checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="field">
        <div class="field-lbl">Graph height — <span style="color:#f4601e">${gs.height ?? 32}px</span>${this._resetBtn(gs.height !== undefined, () => this._clearGraphStyle('height'))}</div>
        <input type="range" min="20" max="80" step="4" .value=${String(gs.height ?? 32)}
          @input=${(e:Event)=>this._set('graph_style',{...gs,height:parseInt((e.target as HTMLInputElement).value,10)})}/>
      </div>`)}
      <div class="field">
        <div class="field-lbl">History window — <span style="color:#f4601e">${c.graph_hours ?? 24}h</span>${this._resetBtn(c.graph_hours !== undefined, () => this._clearCfg('graph_hours'))}</div>
        <input type="range" min="1" max="168" step="1" .value=${String(c.graph_hours ?? 24)}
          @input=${(e:Event)=>this._set('graph_hours',parseInt((e.target as HTMLInputElement).value,10))}/>
      </div>
      <div class="field">
        <div class="field-lbl">Energy shows${this._resetBtn(c.energy_period !== undefined, () => this._clearCfg('energy_period'))}</div>
        ${this._renderEnergyPeriodPicker(c.energy_period, (v) => this._set('energy_period', v === 'total' ? undefined : v))}
        <div class="hint" style="margin-top:4px">Total = lifetime meter reading. Today/Week/Month = consumption this period (from HA statistics). Applies to every Energy chip; override per room or device.</div>
      </div>
      ${this._adv(html`
      <div class="tog-row">
        <div class="tog-lbl">Show time axis labels</div>
        <label class="sw"><input type="checkbox" .checked=${gs.time_labels !== false} @change=${(e:Event)=>this._set('graph_style',{...gs,time_labels:(e.target as HTMLInputElement).checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Show peak / min dots</div>
        <label class="sw"><input type="checkbox" .checked=${gs.show_dots !== false} @change=${(e:Event)=>this._set('graph_style',{...gs,show_dots:(e.target as HTMLInputElement).checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Tick grid lines</div>
        <label class="sw"><input type="checkbox" .checked=${gs.tick_lines !== false} @change=${(e:Event)=>this._set('graph_style',{...gs,tick_lines:(e.target as HTMLInputElement).checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>`)}`;

    // Unset = the card graphs a default set, so show that here too (ticked), not
    // an empty picker. An explicit [] stays empty. First toggle materialises it.
    const selectedGraphs = c.graph_sensors ?? DEFAULT_GRAPH_SENSORS;

    // Gauge ring sensors — always shown with their defaults
    const GAUGE_SENSORS = [
      { key: 'power',       label: 'Power (W)',       default: '#f4601e' },
      { key: 'voltage',     label: 'Voltage (V)',     default: '#a78bfa' },
      { key: 'current',     label: 'Current (A)',     default: '#fbbf24' },
      { key: 'temperature', label: 'Temperature (°C)', default: '#4fc3f7' },
    ];

    const colorRow = (key: string, label: string, defaultColor: string) => {
      const color    = sensorColors[key] ?? defaultColor;
      const isCustom = !!sensorColors[key];
      return html`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${color}"></div>
          <span class="color-key">${label}</span>
          <input type="color" .value=${color}
            @input=${(e:Event) => {
              const v = (e.target as HTMLInputElement).value;
              this._set('graph_sensor_colors', { ...sensorColors, [key]: v });
            }}/>
          ${isCustom ? html`<button class="color-reset" @click=${() => {
            const next = { ...sensorColors }; delete next[key];
            this._set('graph_sensor_colors', Object.keys(next).length ? next : undefined);
          }}>↺</button>` : nothing}
        </div>`;
    };

    const colorBody = html`
      <div class="field-lbl" style="margin-bottom:6px">Gauge ring colours</div>
      ${GAUGE_SENSORS.map(s => colorRow(s.key, s.label, s.default))}
      ${selectedGraphs.filter(k => !GAUGE_SENSORS.find(g => g.key === k)).length ? html`
        <div class="field-lbl" style="margin:10px 0 6px">Sparkline colours</div>
        ${selectedGraphs.filter(k => !GAUGE_SENSORS.find(g => g.key === k)).map(key => {
          const meta = GRAPH_SENSOR_DEFS.find(s => s.key === key);
          return colorRow(key, meta?.label ?? key, getColor(key));
        })}` : nothing}
      <div class="field" style="margin-top:10px">
        <div class="field-lbl">Which sensors to graph
          ${this._selAllNone(
            () => this._set('graph_sensors', GRAPH_SENSOR_DEFS.map(s => s.key)),
            () => this._set('graph_sensors', []))}</div>
        <div class="pill-grp">
          ${GRAPH_SENSOR_DEFS.map(s => {
            const on = selectedGraphs.some(k => normalizeGraphKey(k) === s.key);
            return html`
            <span class="pill ${on ? 'on' : ''}" @click=${() => {
              const next = on
                ? selectedGraphs.filter(k => normalizeGraphKey(k) !== s.key)
                : [...selectedGraphs, s.key];
              this._set('graph_sensors', next);
            }}>${s.label}</span>`;
          })}
        </div>
      </div>`;

    const ranges = gs.sensor_ranges ?? {};

    // Sensors relevant to ranges: all GRAPH_SENSOR_DEFS plus gauge-specific ones
    const RANGE_SENSORS = [
      { key: 'power',          label: 'Power',        unit: 'W',   def: { min: 0, max: 3000 } },
      { key: 'voltage',        label: 'Voltage',       unit: 'V',   def: { min: 0, max: 250  } },
      { key: 'current',        label: 'Current',       unit: 'A',   def: { min: 0, max: 16   } },
      { key: 'temperature',    label: 'Temperature',   unit: '°C',  def: { min: 0, max: 100  } },
      { key: 'humidity',       label: 'Humidity',      unit: '%',   def: { min: 0, max: 100  } },
      { key: 'carbon_dioxide', label: 'CO₂',           unit: 'ppm', def: { min: 400, max: 2000 } },
      { key: 'illuminance',    label: 'Illuminance',   unit: 'lx',  def: { min: 0, max: 1000 } },
      { key: 'battery',        label: 'Battery',       unit: '%',   def: { min: 0, max: 100  } },
      { key: 'energy',         label: 'Energy',        unit: 'kWh', def: { min: 0, max: 100  } },
      { key: 'signal_strength',label: 'WiFi RSSI',     unit: 'dBm', def: { min: -100, max: -30 } },
    ];

    const setRange = (key: string, field: 'min' | 'max', raw: string) => {
      const val = raw.trim() === '' ? undefined : parseFloat(raw);
      const cur = { ...(ranges[key] ?? {}) };
      if (val === undefined || isNaN(val)) delete cur[field]; else cur[field] = val;
      const next = { ...ranges, [key]: cur };
      if (!cur.min && cur.min !== 0 && !cur.max && cur.max !== 0) delete next[key];
      this._set('graph_style', { ...gs, sensor_ranges: Object.keys(next).length ? next : undefined });
    };

    const rangeBody = html`
      <div style="font-size:10px;color:var(--t3);margin-bottom:8px">
        Controls y-axis in sparklines and needle positions in the gauge. Leave empty to auto-scale.
      </div>
      <div class="range-table">
        <div class="range-hdr"><span>Sensor</span><span>Min</span><span>Max</span><span></span></div>
        ${RANGE_SENSORS.map(s => {
          const cur = ranges[s.key] ?? {};
          const isSet = cur.min !== undefined || cur.max !== undefined;
          return html`
            <div class="range-row ${isSet ? 'set' : ''}">
              <span class="range-lbl">${s.label} <span class="range-unit">${s.unit}</span></span>
              <input type="number" class="range-inp" placeholder="${s.def.min}"
                .value=${cur.min !== undefined ? String(cur.min) : ''}
                @change=${(e: Event) => setRange(s.key, 'min', (e.target as HTMLInputElement).value)}/>
              <input type="number" class="range-inp" placeholder="${s.def.max}"
                .value=${cur.max !== undefined ? String(cur.max) : ''}
                @change=${(e: Event) => setRange(s.key, 'max', (e.target as HTMLInputElement).value)}/>
              ${isSet ? html`<button class="color-reset" @click=${() => {
                const next = { ...ranges }; delete next[s.key];
                this._set('graph_style', { ...gs, sensor_ranges: Object.keys(next).length ? next : undefined });
              }}>↺</button>` : html`<span></span>`}
            </div>`;
        })}
      </div>`;

    return {
      graphtype:   { icon: '∿', bg: 'rgba(45,212,191,0.1)', fg: '#2dd4bf', label: 'Graph Type', badge: nothing, body: gtBody },
      graphcolors: { icon: '◐', bg: 'rgba(244,96,30,0.12)', fg: '#f4601e', label: 'Per-sensor Colors', badge: nothing, body: colorBody },
      graphranges: { icon: '⇕', bg: 'rgba(251,191,36,0.1)', fg: '#fbbf24', label: 'Sensor Min / Max',
        badge: Object.keys(ranges).length ? this._badge(`${Object.keys(ranges).length} set`, '#fbbf24', 'rgba(251,191,36,0.1)') : nothing,
        body: rangeBody },
    };
  }

  // ══════════════════════════════════════════════════════════════
  //  TAB: SENSORS
  // ══════════════════════════════════════════════════════════════

  private _sensorSectionDescriptors(): Record<string, SectionDesc> {
    const c = this._config;
    const selected = c.sensors ?? [];

    const out: Record<string, SectionDesc> = {};
    SENSOR_GROUPS.forEach(grp => {
        const grpKeys = grp.items.map(i => i.key);
        const selectedCount = grpKeys.filter(k => selected.includes(k)).length;
        const grpAllOn = grpKeys.every(k => selected.includes(k));
        const badge = this._badge(`${selectedCount || 'All'} / ${grp.items.length}`, grp.iconColor, grp.iconBg);
        const body = html`
          <div class="sensors-hdr">
            <span class="sensors-hdr-lbl">${selectedCount === 0 ? 'All shown (default)' : `${selectedCount} of ${grp.items.length} shown`}</span>
            <button class="sensors-all-btn" @click=${(e:Event) => {
              e.stopPropagation();
              const next = grpAllOn
                ? selected.filter(k => !grpKeys.includes(k))
                : [...new Set([...selected, ...grpKeys])];
              this._set('sensors', next);
            }}>${grpAllOn ? '− Deselect all' : '+ Select all'}</button>
          </div>
          <div class="sensor-grid">
            ${grp.items.map(s => {
              const on = selected.includes(s.key);
              // graph_sensors is keyed by device_class; map the chip key (e.g. 'co2').
              const graphKey = normalizeGraphKey(s.key);
              const isGraphable = !!GRAPH_SENSOR_DEFS.find(g => g.key === graphKey);
              const graphSensors = c.graph_sensors ?? DEFAULT_GRAPH_SENSORS;
              const graphOn = graphSensors.some(k => normalizeGraphKey(k) === graphKey);
              return html`
                <div class="sensor-item ${on ? 'active' : ''}" @click=${()=>{
                  const next = on ? selected.filter(k=>k!==s.key) : [...selected,s.key];
                  this._set('sensors', next);
                }}>
                  <div class="sensor-dot" style="background:${on ? s.defaultColor : 'var(--t3)'}"></div>
                  <div class="sensor-item-body">
                    <span class="sensor-name">${s.label}</span>
                    ${s.unit ? html`<span class="sensor-unit">${s.unit}</span>` : nothing}
                  </div>
                  ${isGraphable ? html`<button class="sensor-graph-btn ${graphOn ? 'on' : ''}"
                    title="${graphOn ? 'Remove from graphs' : 'Add to graphs'}"
                    @click=${(e:Event) => {
                      e.stopPropagation();
                      const next = graphOn ? graphSensors.filter(k=>normalizeGraphKey(k)!==graphKey) : [...graphSensors, graphKey];
                      this._set('graph_sensors', next);
                    }}>∿</button>` : nothing}
                </div>`;
            })}
          </div>`;
        const secId = grp.group.toLowerCase().replace(' ','');
        out[secId] = { icon: grp.icon, bg: grp.iconBg, fg: grp.iconColor, label: grp.group, badge, body };
      });
    return out;
  }

  /** Render a tab's sections from EDITOR_LAYOUT via a per-section registry, so
   *  order + advanced-gating + labels are data-driven. `prefix` may inject content
   *  before a section (given the set of ids already rendered) — used for one-off
   *  hints that should sit above the first section of a kind. */
  private _renderTabSections(
    tabId: string,
    reg: Record<string, SectionDesc>,
    prefix?: (id: string, shown: Set<string>) => TemplateResult | typeof nothing,
  ): TemplateResult {
    const tab = EDITOR_LAYOUT.find(t => t.id === tabId);
    if (!tab) return html``;
    const shown = new Set<string>();
    return html`${tab.sections.map(s => {
      const d = reg[s.id];
      if (!d) return nothing;
      const pre = prefix ? prefix(s.id, shown) : nothing;
      shown.add(s.id);
      const rendered = html`${pre}${this._sec(s.id, d.icon, d.bg, d.fg, s.label ?? d.label, d.badge, d.body)}`;
      return s.advanced ? this._adv(rendered) : rendered;
    })}`;
  }

  /** Graphs & Sensors tab — sections from EDITOR_LAYOUT; the sensor-chip hint
   *  renders once above the first sensor group wherever it lands. */
  private _renderGraphsSensorsTab(): TemplateResult {
    const reg = this._globalSectionDescriptors();
    const SENSOR_IDS = new Set(['electrical','environmental','deviceinfo','alerts']);
    return this._renderTabSections('graphs', reg, (id, shown) => {
      const priorSensor = [...shown].some(x => SENSOR_IDS.has(x));
      return (SENSOR_IDS.has(id) && !priorSensor)
        ? html`<div class="hint" style="margin:4px 2px 8px">Global default — override per room (Layout & Style → room) or per device (Rooms & devices).</div>`
        : nothing;
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  TAB: YAML
  // ══════════════════════════════════════════════════════════════

  private _renderYamlTab(): TemplateResult {
    const c = this._config;
    const toYaml = (obj: any, indent = 0): string => {
      const pad = '  '.repeat(indent);
      return Object.entries(obj).map(([k,v]) => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'object' && !Array.isArray(v)) {
          return `${pad}${k}:\n${toYaml(v, indent+1)}`;
        }
        if (Array.isArray(v)) {
          return `${pad}${k}:\n${v.map(item => typeof item === 'object' ? `${pad}  -\n${toYaml(item,indent+2)}` : `${pad}  - ${item}`).join('\n')}`;
        }
        return `${pad}${k}: ${v}`;
      }).filter(Boolean).join('\n');
    };
    const yaml = toYaml(c);
    return html`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:11px;color:#50505c;font-family:monospace">Generated config</div>
        <button class="btn-copy" @click=${async ()=>{
          await navigator.clipboard.writeText(yaml).catch((err) => { console.warn('[editor] clipboard write failed', err); });
        }}>Copy</button>
      </div>
      <pre class="yaml-out">${yaml}</pre>`;
  }



  // ══════════════════════════════════════════════════════════════
  //  CONFIG CONFLICTS
  // ══════════════════════════════════════════════════════════════

  /** Settings that contradict each other, or that this config sets but nothing
   *  reads. The card resolves every option through a specificity cascade, so a
   *  key can be perfectly valid and still never apply — the failure is silent,
   *  which is exactly what this surfaces. */
  private _configConflicts(): Array<{ title: string; detail: string }> {
    const c = this._config;
    const out: Array<{ title: string; detail: string }> = [];
    if (!c) return out;

    // A palette written into `style` shadows the theme on every key it sets, so
    // `theme` only still describes the card while the two agree.
    //
    // Only PALETTE keys count. `style` also carries radius, gap, fonts and header
    // geometry, which coexist with a theme perfectly happily — counting those
    // raised this conflict against any themed card whose owner had ever touched a
    // slider, because detectTheme() saw a non-empty style with no palette in it
    // and reported 'custom'. Compare the EFFECTIVE palette for the same reason.
    const styleKeys = (c.style ?? {}) as Record<string, unknown>;
    const paletteOverrides = (THEME_KEYS as string[]).filter(k => styleKeys[k] !== undefined);
    if (c.theme && c.theme !== 'custom' && c.theme !== 'ha' && paletteOverrides.length) {
      const actual = detectTheme(this._effectivePalette() as NonNullable<HADeviceDashboardConfig['style']>);
      if (actual !== c.theme) {
        out.push({
          title: `Theme is set to "${THEME_LABELS[c.theme] ?? c.theme}" but the colours do not match it`,
          detail: `style: overrides the theme on every palette key it sets, so the card renders ${
            actual === 'custom' ? 'your custom colours' : `"${THEME_LABELS[actual] ?? actual}"`
          } instead. Re-pick a theme here to bring the two back in step.`,
        });
      }
    }

    // A view theme re-bases the palette below the card, so card-level colour work
    // silently does not apply while that view is showing. That is the cascade
    // working, but it is exactly the "another setting overrides this" surprise the
    // panel exists to name.
    const themedViews = (c.views ?? []).filter(v => v.theme && v.theme !== 'custom');
    if (themedViews.length && paletteOverrides.length) {
      out.push({
        title: `${themedViews.length === 1 ? 'A view replaces' : `${themedViews.length} views replace`} the card's colours`,
        detail: `${themedViews.map(v => v.name || v.id).join(', ')} carry their own theme, which outranks the ${
          paletteOverrides.length} colour${paletteOverrides.length > 1 ? 's' : ''} set in Design → Colours (${
          paletteOverrides.join(', ')}). Those apply only in views with no theme of their own.`,
      });
    }

    if (c.smart_tile_styles && c.tile_style) {
      out.push({
        title: 'Smart tile styles never apply',
        detail: `A global tile style (${c.tile_style}) outranks the per-profile defaults that smart tile styles turns on. Clear the global style, or set styles per device type instead.`,
      });
    }

    if ((c.mode ?? 'shelly') !== 'universal') {
      const universalOnly = ['universal_scope', 'include_integrations', 'exclude_integrations', 'include_domains', 'exclude_domains']
        .filter(k => (c as unknown as Record<string, unknown>)[k] != null);
      if (universalOnly.length) {
        out.push({
          title: 'Discovery filters are set but do nothing in Shelly mode',
          detail: `${universalOnly.join(', ')} only apply when mode is universal. Shelly mode already keeps just Shelly and BTHome devices.`,
        });
      }
    }

    // "Hide all" makes it easy to hide everything there is, which renders an
    // empty card with no clue why. Only priced when something is actually hidden.
    if ((c.mode ?? 'shelly') === 'universal' && this.hass
        && ((c.exclude_integrations?.length ?? 0) || (c.exclude_domains?.length ?? 0))) {
      const src = getDiscoverySources(this.hass);
      const allHidden = (found: string[], hidden?: string[]) =>
        found.length > 0 && found.every(v => (hidden ?? []).includes(v));
      if (allHidden(src.integrations, c.exclude_integrations) && !(c.include_integrations ?? []).length) {
        out.push({
          title: 'Every discovered integration is hidden',
          detail: 'Nothing is left to discover, so the card renders empty. Clear some in Discovery, or force one back with include_integrations.',
        });
      }
      if (allHidden(src.domains, c.exclude_domains)) {
        out.push({
          title: 'Every entity type is hidden',
          detail: 'No entity domain is left, so no device has anything to show. Clear some in Discovery.',
        });
      }
    }

    const overlap = (a?: string[], b?: string[]) => (a ?? []).filter(x => (b ?? []).includes(x));
    const domClash = overlap(c.include_domains, c.exclude_domains);
    if (domClash.length) {
      out.push({
        title: `Domain both included and excluded: ${domClash.join(', ')}`,
        detail: 'Excluded wins for domains — those entities are dropped.',
      });
    }
    const intClash = overlap(c.include_integrations, c.exclude_integrations);
    if (intClash.length) {
      out.push({
        title: `Integration both included and excluded: ${intClash.join(', ')}`,
        detail: 'Included wins for integrations — the opposite of how domains resolve, so this is worth a second look.',
      });
    }

    // A layout can name the block, but the feature gate decides whether it draws.
    if (!c.delegate_controls) {
      const layouts: Array<TileLayout | undefined> = [
        c.tile_layout,
        ...Object.values(c.device_styles ?? {}).map(d => d.tile_layout),
        ...Object.values(c.profile_styles ?? {}).map(d => d.tile_layout),
        ...Object.values(c.custom_styles ?? {}).map(d => d.tile_layout),
      ];
      if (layouts.some(l => (flattenTileLayout(l) ?? []).includes('delegated_controls'))) {
        out.push({
          title: 'The Native controls block is in a layout but the feature is off',
          detail: 'delegate_controls is off, so that block renders nothing. Turn it on under Rooms & devices, or drop the block.',
        });
      }
    }

    // Dangling references — a saved style that was deleted, or config keyed to a
    // device/area that no longer exists (device ids change when a device is re-added).
    const customKeys = new Set(Object.keys(c.custom_styles ?? {}));
    const styleRefs = [c.tile_style, ...Object.values(c.device_styles ?? {}).map(d => d.tile_style),
      ...Object.values(c.profile_styles ?? {}).map(d => d.tile_style),
      ...Object.values(c.area_styles ?? {}).map(a => a.tile_style)];
    const missingStyles = [...new Set(styleRefs.filter(
      (v): v is `custom:${string}` =>
        typeof v === 'string' && v.startsWith('custom:') && !customKeys.has(v.slice(7))))];
    if (missingStyles.length) {
      out.push({
        title: `Saved style not found: ${missingStyles.join(', ')}`,
        detail: 'Whatever points at it falls back to the default tile style.',
      });
    }

    const devices = this._allDevices();
    const known = new Set(devices.map(d => d.device_id));
    const staleDevs = Object.keys(c.device_styles ?? {}).filter(id => !known.has(id));
    if (staleDevs.length) {
      out.push({
        title: `${staleDevs.length} device styling block${staleDevs.length > 1 ? 's' : ''} for a device that is not here`,
        detail: 'The device was removed, re-added with a new id, or is filtered out by discovery. Harmless, but it will never apply.',
      });
    }
    const areas = new Set(devices.map(d => d.area ?? '').filter(Boolean));
    const staleAreas = Object.keys(c.area_styles ?? {}).filter(a => a !== 'Favourites' && !areas.has(a));
    if (staleAreas.length) {
      out.push({
        title: `Room styling for rooms with no devices: ${staleAreas.join(', ')}`,
        detail: 'Usually a renamed area — room styles are keyed by name, so a rename orphans them.',
      });
    }

    // Keys the card does not read. This is how the README's fictional options
    // (include_all, hide_shelly, view_mode…) went unnoticed for months: a card
    // silently ignores anything it does not understand.
    const unknown = Object.keys(c).filter(k =>
      !CONFIG_KEYS.includes(k) && !LOVELACE_KEYS.includes(k) && !k.startsWith('_'));
    if (unknown.length) {
      out.push({
        title: `The card does not read: ${unknown.join(', ')}`,
        detail: 'Unknown keys are ignored in silence — usually a typo, an option from another card, or one this card has dropped.',
      });
    }

    // input_actions are keyed by the channel's entity_id, so renaming that
    // entity orphans the action: the key stops matching a channel and quietly
    // disappears from the tile.
    const orphaned: string[] = [];
    for (const [devId, ds] of Object.entries(c.device_styles ?? {})) {
      const keys = Object.keys(ds.input_actions ?? {});
      if (!keys.length || !this.hass) continue;
      const dev = devices.find(d => d.device_id === devId);
      if (!dev) continue;   // a missing device is already reported above
      const channels = detectInputChannels(dev, this.hass.states as never);
      for (const k of keys) {
        // A bare number is the hand-written form, matched by channel number.
        const matched = /^\d+$/.test(k)
          ? channels.some(ch => String(ch.channel) === k)
          : channels.some(ch => ch.entityId === k);
        if (!matched) orphaned.push(`${dev.name} → ${k}`);
      }
    }
    if (orphaned.length) {
      out.push({
        title: `Input action for a channel that is not there: ${orphaned.join('; ')}`,
        detail: 'That channel entity was renamed or removed, so the key never renders. Re-add the action against the current channel.',
      });
    }

    // Input actions pointing at entities HA does not have.
    const missingTargets = new Set<string>();
    for (const ds of Object.values(c.device_styles ?? {})) {
      for (const act of Object.values(ds.input_actions ?? {})) {
        const ids = [act.entity, act.hold_action?.entity, act.double_tap_action?.entity, act.select_chip?.entity]
          .flatMap(e => (Array.isArray(e) ? e : e ? [e] : []));
        for (const id of ids) if (this.hass && !this.hass.states[id]) missingTargets.add(id);
      }
    }
    if (missingTargets.size) {
      out.push({
        title: `Input action target does not exist: ${[...missingTargets].join(', ')}`,
        detail: 'The key still renders, but pressing it does nothing.',
      });
    }

    return out;
  }

  private _renderConflicts(): TemplateResult | typeof nothing {
    const found = this._configConflicts();
    if (!found.length) return nothing;
    return html`
      <div class="conflict-panel">
        <div class="conflict-hdr" @click=${() => { this._conflictsOpen = !this._conflictsOpen; }}>
          <span class="conflict-badge">${found.length}</span>
          <span class="conflict-title">${found.length === 1 ? 'setting is overridden or ignored' : 'settings are overridden or ignored'}</span>
          <span class="conflict-caret">${this._conflictsOpen ? '▾' : '▸'}</span>
        </div>
        ${this._conflictsOpen ? html`
          <div class="conflict-list">
            ${found.map(f => html`
              <div class="conflict-item">
                <div class="conflict-item-title">${f.title}</div>
                <div class="conflict-item-detail">${f.detail}</div>
              </div>`)}
          </div>` : nothing}
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ══════════════════════════════════════════════════════════════

  /** Apply a colour-theme preset. `theme` is authoritative: the card reads the
   *  preset, and `style` is cleared of palette keys so it holds only colours the
   *  user deliberately overrode. Writing the palette into `style` (what this used
   *  to do) shadowed the theme on every key, which made the theme label decorative
   *  and editing it by hand a no-op. Non-colour style keys — radius, fonts, sizes
   *  — are untouched. */
  private _applyTheme(name: Exclude<ThemePreset, 'custom'>) {
    const style: Record<string, unknown> = { ...(this._config.style ?? {}) };
    for (const k of THEME_KEYS) delete style[k];
    this._set('style', Object.keys(style).length ? style as NonNullable<HADeviceDashboardConfig['style']> : undefined);
    this._set('theme', name);
  }

  /** Pick a theme — offer to save the current colours first, because applying one
   *  now clears every palette key from `style`. Any colour set there is a
   *  deliberate override, so there is always something to lose; with none set,
   *  switching is lossless and applies immediately. */
  private _onPickTheme(name: Exclude<ThemePreset, 'custom'>) {
    const sty = this._config.style ?? {};
    // Applying a preset clears palette overrides, so keep what is being replaced
    // — same stash a roll does. This used to interrupt with a three-button
    // "save / apply anyway / cancel" prompt; the ★ swatch answers it better.
    if (THEME_KEYS.some(k => sty[k] !== undefined)) this._stashColours('Before theme change');
    this._applyTheme(name);
    this._rolled = `${THEME_LABELS[name] ?? name} — previous colours are under ★ Before theme change`;
    this._clearRolledSoon();
  }

  /** Restore a saved palette. It becomes the theme: 'custom' means "these
   *  colours ARE the theme", so nothing underneath shows through. */
  private _applyPalette(name: string) {
    const pal = this._palettes[name];
    if (!pal) return;
    this._set('style', { ...(this._config.style ?? {}), ...pal });
    this._set('theme', 'custom');
  }

  /** Config keys that describe *content* (what's shown), preserved by "Reset look". */
  private static readonly _CONTENT_KEYS = [
    'type', 'title', 'mode', 'universal_scope', 'include_integrations', 'exclude_integrations',
    'include_domains', 'exclude_domains', 'areas', 'hidden_devices', 'favorites',
    'hidden_entities', 'show_offline', 'views', 'default_view', 'delegate_controls',
    // "What to show" content (the Chips & metrics section + Header/Graphs picks):
    // these describe content, not the visual look, so "Reset look" keeps them.
    'sensors', 'graph_sensors', 'energy_period', 'header_chips', 'area_header_chips',
  ];

  /** Reset the look to factory defaults, keeping content (rooms/devices/views/favourites/mode). */
  private _resetLook(): void {
    const c = this._config as unknown as Record<string, unknown>;
    const kept: Record<string, unknown> = {};
    for (const k of HADeviceDashboardEditor._CONTENT_KEYS) if (c[k] !== undefined) kept[k] = c[k];
    this._emitNow({ type: 'custom:ha-device-dashboard', ...factoryLook(), ...kept } as HADeviceDashboardConfig);
  }

  /** Two-click: first arms, second wipes the whole card back to the factory look. */
  private _onResetEverything(): void {
    if (!this._resetArmed) { this._resetArmed = true; return; }
    this._resetArmed = false;
    this._emitNow({ type: 'custom:ha-device-dashboard', ...factoryLook() } as HADeviceDashboardConfig);
  }

  /** The 🎲 / ✨ / 💾 buttons that sit above the theme grid. Shared by the
   *  ◆ Defaults panel (in its title row) and the Design tab's Colour theme
   *  section, which puts them at the top of the body instead — a button in a
   *  `_sec` header would bubble its click and toggle the section shut. */
  private _themeActions(): TemplateResult {
    return html`
      <button class="sec-toolbar-btn" title="Land on a random preset"
        @click=${() => this._rollTheme()}>🎲 Random</button>
      <button class="sec-toolbar-btn" title="Generate a palette from a random hue, contrast-checked"
        @click=${() => this._rollPalette()}>✨ Surprise me</button>
      <button class="sec-toolbar-btn" title="Save the colours you are looking at"
        @click=${() => { this._paletteNaming = !this._paletteNaming; }}>💾 Save</button>`;
  }

  /** Saved palettes + the preset swatches, with the active one lit.
   *
   *  What is "active" is detected from the EFFECTIVE palette — the preset behind
   *  `theme` with `style` overrides on top — never from `style` alone. `style`
   *  alone is what this used to read, and it disagreed with `_applyTheme` by
   *  construction: applying a theme *clears* the palette keys out of `style` and
   *  records the name in `theme`, so detecting on `style` reported `warm_dusk`
   *  (the empty-style default) when style was bare, and 'custom' as soon as any
   *  non-palette key like `tile_radius` was present. Either way the swatch you
   *  just clicked did not light up. */
  private _renderThemeGrid(): TemplateResult {
    const effective = this._effectivePalette() as Record<string, unknown>;
    // 'ha' resolves to var() references, not colours, so detectTheme could never
    // recognise it — it is read from the config rather than inferred.
    const activeTheme: ThemePreset = this._config.theme === 'ha'
      ? 'ha'
      : detectTheme(effective as NonNullable<HADeviceDashboardConfig['style']>);
    const paletteActive = (pal: ThemePalette) =>
      Object.entries(pal).every(([k, v]) => effective[k] === v);
    return html`
      ${this._paletteNaming ? html`
        <div class="snap-row" style="margin-bottom:6px">
          <input type="text" class="inline-text" style="flex:1" placeholder="Name these colours…"
            .value=${this._paletteName}
            @input=${(e: Event) => { this._paletteName = (e.target as HTMLInputElement).value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._savePalette(this._paletteName); }}/>
          <button class="sec-toolbar-btn" @click=${() => this._savePalette(this._paletteName)}>Save</button>
        </div>` : nothing}
      ${this._rolled ? html`<div class="cr-rolled">${this._rolled} — previous colours are under ★ Saved</div>` : nothing}
      <div class="theme-grid">
        ${Object.entries(this._palettes).map(([name, pal]) => html`
          <div class="saved-wrap">
            <button class="theme-swatch saved ${paletteActive(pal) ? 'on' : ''}"
              title="Restore “${name}”" @click=${() => this._applyPalette(name)}>
              <span class="ts-preview" style="background:${pal.card_bg ?? '#1e1a17'}">
                <span class="ts-tile" style="background:${pal.tile_bg ?? 'rgba(255,255,255,.04)'};border:1px solid ${pal.tile_border ?? 'rgba(255,255,255,.08)'}"></span>
                <span class="ts-accent" style="background:${pal.accent_color ?? '#c98a63'}"></span>
              </span>
              <span class="ts-name">★ ${name}</span>
            </button>
            <button class="saved-x" title="Forget “${name}”"
              @click=${(e: Event) => { e.stopPropagation(); this._deletePalette(name); }}>✕</button>
          </div>`)}
        <button class="theme-swatch ${activeTheme === 'ha' ? 'on' : ''}"
          title="Take every colour from the Home Assistant theme that is active"
          @click=${() => this._onPickTheme('ha')}>
          <span class="ts-preview" style="background:var(--primary-background-color,#fafafa)">
            <span class="ts-tile" style="background:var(--ha-card-background,var(--card-background-color,#fff));border:1px solid var(--divider-color,rgba(0,0,0,.12))"></span>
            <span class="ts-accent" style="background:var(--primary-color,#03a9f4)"></span>
          </span>
          <span class="ts-name">${THEME_LABELS.ha}</span>
        </button>
        ${THEME_ORDER.map(name => {
          const pal = THEME_PRESETS[name];
          return html`
            <button class="theme-swatch ${activeTheme === name ? 'on' : ''}" title=${THEME_LABELS[name]}
              @click=${() => this._onPickTheme(name)}>
              <span class="ts-preview" style="background:${pal.card_bg}">
                <span class="ts-tile" style="background:${pal.tile_bg};border:1px solid ${pal.tile_border}"></span>
                <span class="ts-accent" style="background:${pal.accent_color}"></span>
              </span>
              <span class="ts-name">${THEME_LABELS[name]}</span>
            </button>`;
        })}
      </div>
      ${activeTheme === 'custom'
        ? html`<div class="hint">Custom — your colours don't match a preset. 💾 Save keeps them; picking a preset stashes them under ★ first.</div>`
        : nothing}`;
  }

  /** "Defaults" quick-setup panel: the four global defaults in one place. */
  private _renderDefaultsPanel(): TemplateResult {
    const c = this._config;
    const views = c.views ?? [];
    return html`
      <div class="defaults-panel">
        <div class="dp-grid">
          <div class="dp-group">
            <div class="dp-title">Default view</div>
            ${views.length ? html`
              <div class="pill-grp">
                ${views.map((v, i) => html`
                  <span class="pill ${(c.default_view ?? views[0].id) === v.id ? 'on' : ''}"
                    @click=${() => this._set('default_view', i === 0 ? undefined : v.id)}>${v.name || v.id}</span>`)}
              </div>` : html`<div class="hint">No views yet — add them in the Views tab.</div>`}
          </div>

          <div class="dp-group">
            <div class="dp-title" style="display:flex;align-items:center;gap:6px">
              <span>Colour theme</span>
              <span class="sec-toolbar-spacer"></span>
              ${this._themeActions()}
            </div>
            ${this._renderThemeGrid()}
          </div>

          <div class="dp-group">
            <div class="dp-title">Default tile style
              ${c.tile_style
                ? html`<button class="color-reset" @click=${() => { this._set('tile_style', undefined); this._set('power_monitor_variant', undefined); }}>↺ reset</button>`
                : html`<span class="dp-hint-inline">adaptive</span>`}
            </div>
            ${this._renderTileStylePicker(
              c.tile_style, c.power_monitor_variant ?? 'big-number', undefined,
              (v) => this._set('tile_style', v),
              (v) => this._set('power_monitor_variant', v),
              c.show_graphs,
              (v) => this._set('show_graphs', v),
            )}
          </div>

          <div class="dp-group">
            <div class="dp-title">Tile behaviour</div>
            <div class="dp-hint-inline">Smart tile styles and Native controls live in Design → Tiles, next to the rest of the tile settings.</div>
            <button class="sec-toolbar-btn" style="align-self:flex-start"
              @click=${() => { this._gotoControl('design', 'design-tiles', 'delegate_controls'); this._defaultsOpen = false; }}>Open Tiles →</button>
          </div>

          <div class="dp-group">
            <div class="dp-title">Default tile layout</div>
            <div class="field">
              <div class="field-lbl">Columns — <span style="color:#f4601e">${c.columns ?? 3}</span></div>
              <input type="range" min="1" max="6" step="1" .value=${String(c.columns ?? 3)}
                @input=${(e: Event) => this._set('columns', parseInt((e.target as HTMLInputElement).value, 10))}/>
            </div>
            <div class="field">
              <div class="field-lbl">Tile size</div>
              <div class="pill-grp">
                ${(['sm','md','lg'] as const).map((v, i) => html`
                  <span class="pill ${(c.tile_size ?? 'md') === v ? 'on' : ''}" @click=${() => this._set('tile_size', v)}>${['Small','Medium','Large'][i]}</span>`)}
              </div>
            </div>
            <button class="sec-toolbar-btn" style="align-self:flex-start"
              @click=${() => { this._tab = 'design'; this._defaultsOpen = false; }}>More tile settings →</button>
          </div>

          <div class="dp-group">
            <div class="dp-title">Reset</div>
            <div class="dp-hint-inline">Restore the built-in default look. “Reset look” keeps your rooms, devices, views, favourites and discovery settings; “Reset everything” clears the whole card back to factory.</div>
            <div class="pill-grp" style="gap:8px">
              <button class="sec-toolbar-btn" @click=${() => { this._resetArmed = false; this._resetLook(); }}>Reset look</button>
              <button class="sec-toolbar-btn" style=${this._resetArmed ? 'color:#f4601e;border-color:#f4601e' : ''}
                @click=${() => this._onResetEverything()}>
                ${this._resetArmed ? 'Click again to wipe everything' : 'Reset everything'}</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  protected render(): TemplateResult {
    if (!this._config) return html``;
    type TabId = 'devices'|'views'|'layout'|'graphs'|'yaml';
    // Tabs (order / label / icon) derive from EDITOR_LAYOUT — single source of truth.
    const tabs = EDITOR_LAYOUT.map(t => ({ id: t.id as TabId, label: t.label, icon: t.icon }));
    // Section ids that only exist / matter in advanced mode — dropped from the
    // expand/collapse-all set (and their sections aren't rendered) when off.
    // Derived from the spec's per-section `advanced` flags.
    const ADV_SECTIONS = new Set<string>(
      EDITOR_LAYOUT.flatMap(t => t.sections.filter(s => s.advanced).map(s => s.id)),
    );
    // Collapsible-section keys per tab, derived from EDITOR_LAYOUT (so custom tabs
    // are covered). Bespoke tabs render their own bodies, so override with their
    // real section keys.
    const allTabSectionKeys: Record<string, string[]> = {};
    EDITOR_LAYOUT.forEach(t => { allTabSectionKeys[t.id] = t.sections.map(s => s.id); });
    allTabSectionKeys['devices'] = ['rooms', 'lights'];
    allTabSectionKeys['views']   = [];
    allTabSectionKeys['yaml']    = [];
    const tabSectionKeys: Record<string, string[]> = Object.fromEntries(
      Object.entries(allTabSectionKeys).map(
        ([t, keys]) => [t, this._advanced ? keys : keys.filter(k => !ADV_SECTIONS.has(k))],
      ),
    );
    const curKeys = tabSectionKeys[this._tab] ?? [];
    const setAllSections = (open: boolean) => {
      if (!curKeys.length) return;
      const next = { ...this._openSections };
      for (const k of curKeys) next[k] = open;
      this._openSections = next;
    };
    // What "expand all" means depends on the tab: most tabs are collapsible
    // SECTIONS, but Views is a list of view cards and Rooms & devices a list of
    // room rows, each with their own open-state. Gating on sections alone left
    // the two longest lists in the editor — 27 views here — without the control.
    const roomRowKeys = () => [
      HADeviceDashboardEditor.FAV_ROW_KEY,
      ...new Set(this._allDevices().map(d => d.area ?? '')),
    ];
    const expandable: { keys: string[]; isOpen: (k: string) => boolean; setAll: (open: boolean) => void } =
      this._tab === 'views'
        ? {
          keys: (this._config.views ?? []).map(v => v.id),
          isOpen: (k) => this._expandedViewIds.has(k),
          setAll: (open) => { this._expandedViewIds = open ? new Set((this._config.views ?? []).map(v => v.id)) : new Set(); },
        }
        : this._tab === 'devices'
          ? {
            keys: roomRowKeys(),
            isOpen: (k) => this._expandedRooms.has(k),
            setAll: (open) => { this._expandedRooms = open ? new Set(roomRowKeys()) : new Set(); },
          }
          : { keys: curKeys, isOpen: (k) => !!this._openSections[k], setAll: setAllSections };

    // One state-aware button rather than a pair, matching the card's own
    // collapse/expand control: with everything already open, "expand all" is a
    // no-op, so the button offers the move that is actually available. Mixed
    // counts as not-all-open, so the first click finishes opening the tab.
    const allSectionsOpen = expandable.keys.length > 0 && expandable.keys.every(expandable.isOpen);
    const showSectionToggle = expandable.keys.length > 1;
    const tabIdx = tabs.findIndex(t => t.id === this._tab);
    return html`
      <div class="shell">
        <div class="tab-nav-wrap">
          <button class="tab-arrow" title="Previous tab" ?disabled=${tabIdx <= 0}
            @click=${() => this._stepTab(-1)}>‹</button>
          <div class="tab-nav">
            ${tabs.map(t => html`
              <div class="tab ${this._tab===t.id?'active':''}" data-tab=${t.id} @click=${()=>{this._tab=t.id;}}>
                <span class="tab-icon">${t.icon}</span>${t.label}
              </div>`)}
          </div>
          <button class="tab-arrow" title="Next tab" ?disabled=${tabIdx >= tabs.length - 1}
            @click=${() => this._stepTab(1)}>›</button>
        </div>
        <div class="sec-toolbar">
          <label class="adv-toggle" title="Show advanced, power-user controls">
            <span class="sw">
              <input type="checkbox" .checked=${this._advanced}
                @change=${(e:Event)=>this._setAdvanced((e.target as HTMLInputElement).checked)}>
              <span class="sw-t"></span><span class="sw-b"></span>
            </span>
            <span class="adv-lbl">Advanced</span>
          </label>
          <button class="sec-toolbar-btn defaults-btn ${this._defaultsOpen ? 'active' : ''}"
            title="Set the card's default look — view, theme, tile style & layout"
            @click=${() => { this._defaultsOpen = !this._defaultsOpen; }}>◆ Defaults</button>
          <button class="sec-toolbar-btn ${this._helpOpen ? 'active' : ''}"
            title="How the card fits together"
            @click=${() => { this._helpOpen = !this._helpOpen; }}>? Help</button>
          ${(() => {
            const n = this._designOverrides().length;
            return html`
              <button class="sec-toolbar-btn changes-btn ${this._changesOpen ? 'active' : ''} ${n ? 'lit' : ''}"
                title=${n ? 'Everything this card changes from the default look' : 'Nothing is customised - the card is on its theme'}
                @click=${() => { this._changesOpen = !this._changesOpen; this._changesResetArmed = false; }}>
                ◆ ${n ? `${n} change${n > 1 ? 's' : ''}` : 'No changes'}</button>`;
          })()}
          ${showSectionToggle ? html`
            <button class="sec-toolbar-btn"
              title=${allSectionsOpen ? 'Collapse everything on this tab' : 'Expand everything on this tab'}
              @click=${() => expandable.setAll(!allSectionsOpen)}>
              ${allSectionsOpen ? '▸ Collapse all' : '▾ Expand all'}</button>
          ` : nothing}

          <span class="sec-toolbar-spacer"></span>
          ${this._renderSnapshotControls()}
        </div>
        ${this._snapMsg ? html`<div class="snap-msg">${this._snapMsg}</div>` : nothing}
        ${this._defaultsOpen ? this._renderDefaultsPanel() : nothing}
        ${this._changesOpen ? this._renderChangesPanel() : nothing}
        ${this._helpOpen ? this._renderHelpPanel() : nothing}
        ${this._renderConflicts()}
        <div class="tab-body">
          ${(() => {
            // Tab bodies resolve by id; unknown ids (custom tabs from the designer)
            // render their assigned global sections.
            const bodyFor: Record<string, () => TemplateResult> = {
              devices: () => this._renderDevicesTab(),
              views:   () => this._renderViewsTab(),
              design: () => this._renderDesignTab(),
              graphs:  () => this._renderGraphsSensorsTab(),
              yaml:    () => this._renderYamlTab(),
            };
            return (bodyFor[this._tab] ?? (() => this._renderCustomTab(this._tab)))();
          })()}
        </div>
        ${this._renderIconGridPopover()}
      </div>`;
  }


  static styles = [ANIM_CSS, css`
    :host {
      display:block;
      font-family:'DM Sans',sans-serif;
    }
    * { box-sizing:border-box; }

    /* ── CSS vars ── */
    .shell {
      --bg:#0f0f12; --s1:#17171c; --s2:#1e1e26; --s3:#25252f;
      --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
      --text:#e2e2e8; --t2:#888896; --t3:#555560;
      --accent:#f4601e; --accentbg:rgba(244,96,30,0.12); --accentbdr:rgba(244,96,30,0.3);
      --blue:#4a9eff; --green:#4ade80; --purple:#a78bfa; --teal:#2dd4bf; --amber:#fbbf24;
      background:var(--bg); color:var(--text); border-radius:8px;
      overflow-x:hidden; overflow-y:visible;
      display:flex; flex-direction:column;
      min-height:400px;
    }
    /* Arrows flank the strip: it scrolls, but its scrollbar is hidden and a mouse
       has nothing to drag, so off-screen tabs were unreachable on a tablet. */
    .tab-nav-wrap { display:flex; align-items:stretch; background:var(--s1);
      border-bottom:1px solid var(--border); flex-shrink:0; }
    .tab-arrow { flex:0 0 auto; padding:10px 8px 0; background:none; border:none; cursor:pointer;
      color:var(--t2); font-size:18px; line-height:1; font-family:inherit; }
    .tab-arrow:hover:not(:disabled) { color:var(--accent); }
    .tab-arrow:disabled { opacity:.25; cursor:default; }
    .tab-nav { display:flex; gap:2px; padding:10px 4px 0; background:var(--s1); overflow-x:auto; flex:1; min-width:0; scroll-behavior:smooth; }
    .tab-nav::-webkit-scrollbar { height:0; }
    .tab { font-size:11px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; padding:8px 14px; color:var(--t3); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .15s; border-radius:5px 5px 0 0; user-select:none; display:flex; align-items:center; }
    .tab:hover { color:var(--t2); }
    .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
    .tab-icon { margin-right:5px; font-size:10px; opacity:0.7; }
    .sec-toolbar { display:flex; align-items:center; gap:6px; padding:8px 16px 0; background:var(--s1); flex-shrink:0; }
    /* Brief pulse on a control someone was sent to, so the jump lands visibly. */
    @keyframes ctl-flash { 0%,100% { background:transparent; } 30% { background:var(--accentbg); } }
    .ctl-flash { animation:ctl-flash 1.1s ease-in-out 2; border-radius:8px; }
    .sec-toolbar-spacer { flex:1; }
    .snap-wrap { position:relative; display:flex; gap:6px; }
    .snap-menu { position:absolute; top:calc(100% + 6px); right:0; z-index:30; min-width:250px;
      display:flex; flex-direction:column; gap:4px; padding:8px;
      background:var(--s2,var(--s1)); border:1px solid var(--border); border-radius:10px;
      box-shadow:0 8px 24px rgba(0,0,0,.35); }
    .snap-row { display:flex; align-items:center; gap:4px; }
    .snap-item { display:flex; align-items:center; justify-content:space-between; gap:8px;
      padding:6px 8px; border-radius:7px; border:1px solid transparent; background:none;
      color:var(--text); font:inherit; font-size:12px; cursor:pointer; text-align:left; }
    .snap-item:hover { background:var(--s1); border-color:var(--border); }
    .snap-name { font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .snap-date { font-size:10.5px; color:var(--t3); white-space:nowrap; }
    .snap-x { background:none; border:none; color:var(--t3); cursor:pointer; font-size:12px; padding:4px; }
    .snap-x:hover { color:var(--accent); }
    .snap-empty { font-size:11.5px; color:var(--t3); padding:4px 8px; }
    .snap-msg { margin:6px 16px 0; font-size:11.5px; color:var(--accent); }

    /* ? Help — concepts then recipes, one topic open at a time. */
    .help-panel { margin:8px 16px 0; padding:10px; border:1px solid var(--border); border-radius:10px;
      background:var(--s2,var(--s1)); max-height:52vh; overflow-y:auto; }
    .help-hdr { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .help-title { font-size:12.5px; font-weight:700; color:var(--accent); }
    .help-search { flex:1; }
    .help-intro { font-size:11.5px; color:var(--t2); line-height:1.5; margin-bottom:8px; }
    .help-group { font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
      color:var(--t3); margin:10px 0 4px; }
    .help-topic { border-top:1px solid var(--border); }
    .help-topic-hdr { display:flex; align-items:center; gap:6px; width:100%; padding:7px 2px;
      background:none; border:none; color:var(--text); font:inherit; font-size:12px; font-weight:600;
      text-align:left; cursor:pointer; }
    .help-topic-hdr:hover { color:var(--accent); }
    .help-caret { color:var(--t3); font-size:10px; }
    .help-topic-body { padding:0 2px 8px 16px; font-size:11.5px; color:var(--t2); line-height:1.6; }
    .help-topic-body p { margin:0 0 7px; }
    .help-topic-body ol { margin:6px 0 0; padding-left:18px; }
    .help-topic-body li { margin-bottom:5px; }
    .help-topic-body b { color:var(--text); }
    .cr-rolled { margin:2px 0 6px; font-size:11.5px; color:var(--accent); }
    .saved-wrap { position:relative; display:inline-flex; }
    .saved-x { position:absolute; top:-4px; right:-4px; width:16px; height:16px; border-radius:50%;
      display:grid; place-items:center; cursor:pointer; font-size:9px; line-height:1;
      color:var(--t2); background:var(--s1); border:1px solid var(--border); }
    .saved-wrap:hover .saved-x { color:var(--accent); border-color:var(--accent); }
    .help-code { font-family:ui-monospace,Menlo,Consolas,monospace; font-size:10.5px;
      background:var(--s1); border:1px solid var(--border); border-radius:4px; padding:1px 4px; }
    .adv-toggle { display:inline-flex; align-items:center; gap:7px; cursor:pointer; user-select:none; }
    .adv-lbl { font-size:11px; font-weight:600; letter-spacing:.02em; color:var(--t2); }
    .adv-toggle:hover .adv-lbl { color:var(--text); }
    .defaults-btn.active { background:var(--accentbg); color:var(--accent); border-color:var(--accentbdr); }
    /* Defaults quick-setup panel */
    .defaults-panel { padding:12px 16px; background:var(--s1); border-bottom:1px solid var(--border); flex-shrink:0; max-height:52vh; overflow-y:auto; }
    .dp-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px; }
    .dp-group { display:flex; flex-direction:column; gap:8px; background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:10px; }
    .dp-title { font-size:11px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; color:var(--t2); display:flex; align-items:center; gap:8px; }
    .dp-hint-inline { font-size:12px; line-height:1.4; font-weight:400; text-transform:none; letter-spacing:0; color:var(--t2); }
    .check-dd-btn { display:flex; align-items:center; justify-content:space-between; width:100%; gap:8px;
      font-size:12px; color:var(--text); background:var(--s2); border:1px solid var(--border); border-radius:6px;
      padding:7px 10px; cursor:pointer; text-align:left; }
    .check-dd-btn:hover { border-color:var(--border2); }
    .check-dd-caret { transition:transform .15s; color:var(--t3); }
    .check-dd-btn.open .check-dd-caret { transform:rotate(180deg); }
    .check-dd-panel { margin-top:4px; max-height:220px; overflow-y:auto; border:1px solid var(--border);
      border-radius:6px; background:var(--s2); padding:4px; display:flex; flex-direction:column; gap:1px; }
    .check-dd-row { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text);
      padding:5px 7px; border-radius:4px; cursor:pointer; }
    .check-dd-row:hover { background:var(--s3); }
    .check-dd-empty { font-size:11px; color:var(--t3); padding:6px 7px; }
    /* Sticky so Hide all / Clear stay reachable in a long list. */
    .check-dd-head { position:sticky; top:0; z-index:1; display:flex; align-items:center;
      justify-content:space-between; gap:8px; padding:5px 7px; background:var(--s2,var(--s1));
      border-bottom:1px solid var(--border); }
    .check-dd-count { font-size:10.5px; font-weight:600; color:var(--t3); }
    /* ── ◆ n changes ── lit only when something differs from the theme, so a
       card on its defaults says so plainly instead of showing a zero. */
    .changes-btn.lit { color:var(--accent); border-color:var(--accent); }
    .changes-panel { border:1px solid var(--border2); border-radius:10px; padding:10px 12px; margin:6px 0 2px;
      display:flex; flex-direction:column; gap:8px; }
    .changes-hdr { display:flex; align-items:center; gap:8px; font-size:.8em; font-weight:700; }
    .changes-group { display:flex; flex-direction:column; gap:2px; }
    .changes-scope { display:flex; align-items:center; gap:6px; font-size:.72em; text-transform:uppercase;
      letter-spacing:.05em; color:var(--t3); margin-top:4px; }
    .changes-row { display:flex; align-items:center; gap:8px; padding:2px 0 2px 12px; font-size:.8em; }
    .changes-key { font-weight:600; min-width:150px; display:flex; align-items:center; gap:5px; }
    .changes-pal { font-size:.75em; font-weight:400; padding:0 5px; border-radius:8px;
      background:var(--accentbg); color:var(--accent); }
    .changes-val { flex:1; color:var(--t3); font-family:ui-monospace,Menlo,Consolas,monospace; font-size:.9em;
      overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* ── Design tab (scope-first) ── */
    .dsn-picker { display:flex; flex-direction:column; gap:6px; }
    .dsn-pick-lbl { font-size:.82em; text-transform:uppercase; letter-spacing:.05em; color:var(--t3); margin-top:4px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .dsn-pick-row { display:flex; flex-wrap:wrap; gap:4px; }
    .dsn-chip { display:inline-flex; align-items:center; gap:5px; font-family:inherit; font-size:.86em; font-weight:600;
      padding:3px 9px; border-radius:20px; cursor:pointer; color:var(--text);
      background:var(--bg2); border:1px solid var(--border2); transition:all .15s; }
    .dsn-chip:hover { border-color:var(--accent); }
    .dsn-chip.on { border-color:var(--accent); background:var(--accentbg); color:var(--accent); }
    .dsn-chip.grp { font-weight:700; }
    .dsn-chip.browse { cursor:default; opacity:.7; }
    .dsn-chip.browse:hover { border-color:var(--border2); }
    .dsn-chip.dev { font-weight:400; }
    .dsn-chip-apply { font-family:inherit; font-size:1em; font-weight:inherit; padding:0;
      background:transparent; border:none; color:inherit; cursor:pointer; }
    /* How many keys this rung overrides — makes the tree show where
       customisation actually lives, without opening every scope to find out. */
    .dsn-count { font-size:.85em; font-weight:700; padding:0 5px; border-radius:8px;
      background:var(--accent); color:#fff; }
    .dsn-groupby { font-family:inherit; font-size:.9em; text-transform:none; letter-spacing:0;
      padding:1px 7px; border-radius:10px; cursor:pointer; color:var(--t3);
      background:transparent; border:1px solid var(--border2); }
    .dsn-groupby.on { color:var(--accent); border-color:var(--accent); }
    .dsn-tree { display:flex; flex-direction:column; gap:2px; max-height:280px; overflow-y:auto; }
    .dsn-group-hdr { display:flex; align-items:center; gap:6px; }
    .dsn-twisty { font-family:inherit; font-size:.8em; width:18px; padding:0; cursor:pointer;
      background:transparent; border:none; color:var(--t3); }
    .dsn-group-n { font-size:.8em; color:var(--t3); }
    .dsn-group-body { display:flex; flex-wrap:wrap; gap:4px; padding:4px 0 6px 24px; }
    .dsn-panel { display:flex; flex-direction:column; gap:10px; }
    .dsn-scope-hdr { display:flex; align-items:center; gap:8px; padding-bottom:6px; border-bottom:1px solid var(--border2); }
    .dsn-scope-name { font-weight:800; font-size:1.05em; }
    .dsn-badge { font-size:.78em; padding:2px 7px; border-radius:10px; background:var(--bg2); color:var(--t3); }
    .dsn-badge.on { background:var(--accentbg); color:var(--accent); font-weight:700; }
    .dsn-family { border:1px solid var(--border2); border-radius:8px; padding:8px 10px; }
    .dsn-family.off { opacity:.65; }
    .dsn-family-hdr { font-size:.72em; text-transform:uppercase; letter-spacing:.05em; color:var(--t3); margin-bottom:6px; }
    .dsn-row { padding:6px 0; border-top:1px solid var(--border2); }
    .dsn-row:first-of-type { border-top:none; }
    .dsn-row-hdr { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
    .dsn-row-lbl { font-size:.85em; font-weight:600; flex:1; }
    .dsn-reset { font-family:inherit; font-size:.8em; padding:0 5px; cursor:pointer;
      background:transparent; border:1px solid var(--border2); border-radius:6px; color:var(--t3); }
    .dsn-reset:hover { color:var(--accent); border-color:var(--accent); }

    .theme-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
    .theme-swatch { display:flex; flex-direction:column; align-items:center; gap:4px; padding:5px 3px; border:1px solid var(--border2); border-radius:6px; background:transparent; cursor:pointer; transition:all .15s; }
    .theme-swatch:hover { border-color:var(--accent); }
    .theme-swatch.on { border-color:var(--accent); background:var(--accentbg); }
    .ts-preview { position:relative; width:100%; height:30px; border-radius:4px; overflow:hidden; display:block; border:1px solid rgba(0,0,0,.3); }
    .ts-tile { position:absolute; left:5px; top:6px; width:22px; height:18px; border-radius:3px; }
    .ts-accent { position:absolute; right:5px; top:9px; width:12px; height:12px; border-radius:50%; }
    .ts-name { font-size:9px; font-weight:600; color:var(--t2); text-align:center; line-height:1.1; }
    .theme-swatch.on .ts-name { color:var(--text); }
    .theme-swatch.saved .ts-name { color:var(--accent); }
    .sec-toolbar-btn { font-size:10px; padding:4px 9px; border-radius:4px; border:1px solid var(--border2); background:transparent; color:var(--t2); cursor:pointer; transition:all .15s; }
    .sec-toolbar-btn:hover { background:var(--s3); color:var(--text); border-color:var(--accent); }

    /* Extra-cards manager */
    .xc-list { display:flex; flex-direction:column; gap:4px; margin:6px 0; }
    .xc-row { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; background:var(--s2); border:1px solid var(--border); }
    .xc-type { flex:1; font-size:12px; font-family:monospace; color:var(--t2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .xc-btn { font-size:10px; padding:2px 8px; border-radius:4px; border:1px solid var(--border2); background:transparent; color:var(--t2); cursor:pointer; }
    .xc-btn:hover { background:var(--s3); color:var(--text); }
    .xc-del { color:#e5837a; }
    .xc-del:hover { border-color:#e5837a; color:#fff; background:#e5837a; }
    .xc-actions { display:flex; gap:6px; margin-top:6px; }
    .xc-import-list { display:flex; flex-direction:column; gap:3px; margin-top:6px; max-height:220px; overflow-y:auto; }
    .xc-import-row { flex:0 0 auto; min-height:26px; text-align:left; font-size:11px; font-family:monospace; padding:5px 8px; border-radius:5px; border:1px solid var(--border); background:var(--s2); color:var(--t2); cursor:pointer; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .xc-import-row:hover { background:var(--s3); color:var(--text); border-color:var(--accent); }
    .xc-yaml { width:100%; min-height:120px; font-family:monospace; font-size:12px; background:var(--s2); color:var(--t2); border:1px solid var(--border); border-radius:6px; padding:8px; resize:vertical; }
    ha-yaml-editor { display:block; margin-top:4px; }
    .tab-body { padding:16px; background:var(--bg); overflow-y:auto; flex:1; min-height:0; }

    /* Conflict panel — settings that another setting overrides or ignores. */
    .conflict-panel { margin:0 16px; border:1px solid rgba(219,162,92,.35);
      border-radius:10px; background:rgba(219,162,92,.08); overflow:hidden; }
    .conflict-hdr { display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer;
      user-select:none; }
    .conflict-hdr:hover { background:rgba(219,162,92,.10); }
    .conflict-badge { min-width:20px; height:20px; padding:0 6px; border-radius:10px;
      display:inline-flex; align-items:center; justify-content:center;
      background:#dba25c; color:#1e1a17; font-size:11px; font-weight:800; }
    .conflict-title { flex:1; font-size:12.5px; font-weight:600; color:#dba25c; }
    .conflict-caret { color:#dba25c; font-size:12px; }
    .conflict-list { padding:2px 10px 10px; display:flex; flex-direction:column; gap:8px; }
    .conflict-item { border-left:2px solid rgba(219,162,92,.5); padding-left:8px; }
    .conflict-item-title { font-size:12px; font-weight:650; color:var(--text); }
    .conflict-item-detail { font-size:11.5px; color:var(--t2); margin-top:2px; line-height:1.45; }
    .tab-body::-webkit-scrollbar { width:5px; }
    .tab-body::-webkit-scrollbar-track { background:var(--s2); }
    .tab-body::-webkit-scrollbar-thumb { background:var(--s3); border-radius:3px; }
    .tab-body::-webkit-scrollbar-thumb:hover { background:var(--t3); }

    /* ── Section accordion ── */
    .sec { border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-bottom:6px; }
    .sec-hdr { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; cursor:pointer; user-select:none; background:var(--s2); transition:background .12s; }
    .sec-hdr:hover { background:var(--s3); }
    .sec-hdr-l { display:flex; align-items:center; gap:9px; }
    .sec-ico { width:22px; height:22px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
    .sec-title { font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:var(--text); }
    .sec-hdr-r { display:flex; align-items:center; gap:8px; }
    .sec-badge { font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px; }
    .chev { font-size:10px; color:var(--t3); transition:transform .2s; }
    .sec.open .chev { transform:rotate(180deg); }
    .sec-body { display:none; padding:16px; border-top:1px solid var(--border); background:var(--bg); }
    .sec.open .sec-body { display:block; }

    /* ── Field labels ── */
    .field { margin-bottom:12px; }
    .field:last-child { margin-bottom:0; }
    .field-lbl { font-size:12px; font-weight:600; letter-spacing:0.04em; color:var(--t2); text-transform:uppercase; margin-bottom:7px; }
    .field-note { font-size:9px; font-weight:400; color:var(--t3); text-transform:none; letter-spacing:0; float:right; }
    .field-hint { font-size:10px; color:var(--t3); margin-top:4px; }
    .empty-hint { font-size:11px; color:var(--t3); font-style:italic; }
    .divider { height:1px; background:var(--border); margin:10px 0; }
    .preview-label { font-size:10px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--t3); margin-bottom:6px; }

    /* ── Range inputs ── */
    input[type="range"] { width:100%; accent-color:var(--accent); cursor:pointer; }
    input[type="text"] { background:var(--s2); border:1px solid var(--border2); border-radius:8px; padding:8px 12px; font-size:12px; color:var(--text); outline:none; width:100%; }
    input[type="text"]:focus { border-color:var(--accent); }
    input[type="checkbox"] { accent-color:var(--accent); cursor:pointer; }

    /* ── Toggle switch ── */
    .sw { position:relative; width:36px; height:20px; flex-shrink:0; display:inline-block; cursor:pointer; }
    .sw input { opacity:0; width:0; height:0; }
    .sw-t { position:absolute; inset:0; background:var(--s3); border-radius:10px; border:1px solid var(--border2); transition:background .2s,border-color .2s; cursor:pointer; }
    .sw-b { position:absolute; top:2px; left:2px; width:14px; height:14px; background:var(--t3); border-radius:50%; transition:transform .2s,background .2s; pointer-events:none; }
    .sw input:checked ~ .sw-t { background:var(--accentbg); border-color:var(--accentbdr); }
    .sw input:checked ~ .sw-b { transform:translateX(16px); background:var(--accent); }

    /* ── Toggle row ── */
    .tog-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); }
    .tog-row:last-child { border-bottom:none; }
    .tog-lbl { font-size:13px; color:var(--text); }
    .tog-sub { font-size:11px; color:var(--t3); margin-top:2px; }

    /* ── Pill group ── */
    .pill-grp { display:flex; flex-wrap:wrap; gap:6px; }
    .pill { font-size:11px; font-weight:500; padding:4px 11px; border-radius:20px; border:1px solid var(--border2); color:var(--t2); cursor:pointer; transition:all .15s; user-select:none; background:var(--s2); }
    .pill:hover { border-color:var(--accent); color:var(--accent); }
    .pill.on { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }
    .pill.dim { opacity:.55; }
    .pill.dim:hover { opacity:1; }

    /* ── Sensor-chip picker (per-device / per-area overrides) ── */
    .chip-picker { display:flex; flex-direction:column; gap:8px; padding:8px 10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; }
    .chip-picker-hdr { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .chip-picker-state { font-size:11px; color:var(--t3); font-style:italic; }
    .chip-picker-grp { display:flex; flex-direction:column; gap:4px; }
    .chip-picker-grp-lbl { font-size:10px; font-weight:600; letter-spacing:.04em; }

    /* ── Hint line ── */
    /* Helper text sits next to HA's 14px chrome; 11px italic muted was the
       single most common "I can't read the editor" complaint. */
    .hint { font-size:12.5px; line-height:1.45; color:var(--t2); font-style:normal; }
    .rooms-note { display:flex; gap:8px; align-items:flex-start; font-size:11px; line-height:1.5;
      color:var(--t2); background:var(--s3); border:1px solid var(--border); border-left:3px solid var(--amber, #f0a020);
      border-radius:6px; padding:8px 10px; margin-bottom:8px; }
    .rooms-note b { color:var(--text); font-weight:600; }
    .rooms-note-ico { flex-shrink:0; opacity:.8; }

    /* ── Subgroup label (inside sections) ── */
    .subgroup-lbl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--t3); opacity:0.8; margin:10px 0 4px; padding-top:6px; border-top:1px solid var(--border); }
    .subgroup-lbl:first-child { margin-top:0; padding-top:0; border-top:none; }

    /* ── Color row ── */
    .color-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border); }
    .color-row:last-child { border-bottom:none; }
    .color-key { font-size:12px; color:var(--t2); flex:1; min-width:0; }
    .color-val { font-family:monospace; font-size:10px; color:var(--t3); min-width:60px; text-align:right; }
    .color-reset { font-size:11px; color:var(--t3); background:none; border:none; cursor:pointer; padding:2px 4px; border-radius:3px; transition:color .15s; }
    .sel-allnone { display:inline-flex; gap:4px; margin-left:6px; vertical-align:middle; }
    .sel-mini { font:inherit; font-size:10px; font-weight:600; letter-spacing:.02em; cursor:pointer; padding:2px 8px; border-radius:6px; color:var(--t2); background:var(--s2); border:1px solid var(--border); transition:all .15s; }
    .sel-mini:hover { color:var(--t1); border-color:var(--t3); }
    .color-reset:hover { color:var(--accent); }
    .field-reset { font-size:10px; color:var(--t3); background:none; border:none; cursor:pointer; padding:0 4px; margin-left:4px; border-radius:3px; transition:color .15s; vertical-align:middle; }
    .field-reset:hover { color:var(--accent); }
    input[type="color"] { width:36px; height:28px; border:1px solid var(--border2); border-radius:5px; padding:2px 3px; background:var(--s2); cursor:pointer; flex-shrink:0; }
    .color-preview-swatch { width:20px; height:20px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); flex-shrink:0; }
    .sl-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border); }
    .sl-row:last-child { border-bottom:none; }
    .sl-val { font-family:monospace; font-size:11px; color:var(--accent); min-width:36px; text-align:right; }
    .inline-text { flex:1; background:var(--s2); border:1px solid var(--border2); border-radius:6px; padding:4px 8px; font-size:11px; color:var(--text); outline:none; min-width:0; }
    .inline-text.input-invalid { border-color:#f87171; }
    .input-err { color:#f87171; font-size:10px; margin-top:3px; }
    .font-select { width:100%; background:var(--s2); border:1px solid var(--border2); border-radius:6px; padding:8px 10px; font-size:13px; color:var(--text); outline:none; cursor:pointer; }
    .font-select:focus { border-color:var(--accent); }
    .font-select option { background:var(--s2); color:var(--text); padding:4px 8px; }
    .font-select optgroup { font-weight:600; color:var(--t2); }
    .bg-img-row { display:flex; align-items:center; gap:6px; }
    .bg-thumb { width:32px; height:32px; border-radius:5px; border:1px solid var(--border2); background-size:cover; background-position:center; flex-shrink:0; background-color:var(--s3); }
    .bg-embedded-note { flex:1; font-size:11px; color:var(--t2); font-style:italic; padding:4px 8px; background:var(--s2); border:1px dashed var(--border); border-radius:6px; }
    .transp-preview { border-radius:10px; overflow:hidden; margin-bottom:12px; }
    .transp-card-layer { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:12px; min-height:140px; }
    .transp-tile { display:flex; flex-direction:column; gap:6px; padding:8px; }
    .transp-tile-name { height:10px; border-radius:4px; background:rgba(255,255,255,0.18); width:70%; }
    .transp-tile-chips { display:flex; gap:4px; }
    .transp-chip { height:8px; border-radius:3px; background:rgba(255,255,255,0.10); flex:1; }
    .tiles-divider { font-size:10px; font-weight:600; color:var(--t2); letter-spacing:.06em; text-transform:uppercase; margin:12px 0 6px; padding-top:10px; border-top:1px solid var(--border); }
    .upload-btn { font-size:10px; background:var(--s2); border:1px solid var(--border2); border-radius:5px; color:var(--text); padding:3px 8px; cursor:pointer; white-space:nowrap; }

    /* ── Rooms toolbar ── */
    .rooms-toolbar { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--border); }
    .toolbar-group { display:flex; align-items:center; gap:8px; }
    .toolbar-lbl { font-size:11px; color:var(--t3); min-width:34px; }

    /* ── Room rows ── */
    .room-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); }
    .room-row:last-of-type { border-bottom:none; }
    .room-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .room-name { font-size:13px; flex:1; }
    .room-count { font-size:10px; color:var(--t3); background:var(--s3); padding:2px 7px; border-radius:10px; }
    .room-style-btn { background:none; border:1px solid var(--border); color:var(--t3); border-radius:5px; font-size:10px; padding:3px 8px; cursor:pointer; transition:all .12s; flex-shrink:0; }
    .room-style-btn:hover { border-color:var(--accent); color:var(--accent); }
    .room-reset-btn { background:none; border:1px solid var(--border); color:var(--t3); border-radius:5px; font-size:11px; line-height:1; padding:3px 7px; cursor:pointer; transition:all .12s; flex-shrink:0; }
    .room-reset-btn:hover { border-color:var(--accent); color:var(--accent); }
    .room-style-row { border-bottom:1px solid var(--border); }
    .room-style-row:last-child { border-bottom:none; }
    .room-style-hdr { display:flex; align-items:center; gap:8px; padding:8px 4px; cursor:pointer; user-select:none; }
    .room-style-hdr:hover { background:rgba(255,255,255,0.03); border-radius:6px; }
    .room-style-name { flex:1; font-size:12px; color:var(--text); font-weight:500; }
    .room-styled-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); flex-shrink:0; }
    .room-swatch-strip { display:flex; gap:3px; align-items:center; }
    .room-swatch { width:12px; height:12px; border-radius:3px; border:1px solid rgba(255,255,255,0.15); flex-shrink:0; }
    .room-style-chev { font-size:9px; color:var(--t3); }
    .room-devices { padding:4px 0 4px 12px; border-bottom:1px solid var(--border); }
    .room-device-row { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.04); transition:background .15s; border-radius:4px; }
    .room-device-row.selected { background:rgba(244,96,30,0.08); border-color:var(--accent); padding-left:6px; padding-right:6px; }
    .room-device-row:last-child { border-bottom:none; }
    .room-style-btn.active { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }

    /* ── Device style side-panel ── */
    .dev-panel-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:99; animation:fadein 0.18s ease; }
    .dev-panel { position:fixed; top:0; right:0; bottom:0; width:min(460px, 94vw); background:var(--s1, #141418); border-left:1px solid var(--border); box-shadow:-8px 0 24px rgba(0,0,0,0.5); z-index:100; display:flex; flex-direction:column; animation:slidein 0.22s cubic-bezier(0.2,0.8,0.2,1); }
    .dev-panel-hdr { display:flex; align-items:center; gap:10px; padding:16px; border-bottom:1px solid var(--border); background:var(--s2); flex-shrink:0; }
    .dev-panel-title { font-size:14px; font-weight:600; color:var(--text); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .dev-panel-close { background:none; border:none; color:var(--t2); font-size:18px; cursor:pointer; padding:4px 8px; border-radius:5px; line-height:1; }
    .dev-panel-close:hover { background:var(--s3); color:var(--text); }
    .dev-panel-body { flex:1; overflow-y:auto; padding:16px; }
    @keyframes slidein { from { transform:translateX(100%); } to { transform:translateX(0); } }
    @keyframes fadein { from { opacity:0; } to { opacity:1; } }
    .room-device-name { flex:1; font-size:11px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .room-device-empty { font-size:11px; color:var(--t3); padding:6px 0; }
    .dev-style-dot { width:5px; height:5px; border-radius:50%; background:var(--accent); flex-shrink:0; }

    /* Room expand button */
    .room-expand-btn { background:none; border:none; color:var(--t3); cursor:pointer; font-size:10px; padding:2px 4px; transition:transform .2s,color .15s; flex-shrink:0; }
    .room-expand-btn:hover { color:var(--t2); }
    .room-expand-btn.open { transform:rotate(180deg); color:var(--accent); }

    /* Favourites room row */
    .fav-room-row { border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:rgba(251,191,36,0.04); margin-bottom:2px; }
    .fav-room-star { font-size:13px; color:var(--amber); flex-shrink:0; }
    .fav-dev-area { font-size:9px; color:var(--t3); background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:3px; padding:1px 5px; flex-shrink:0; white-space:nowrap; }

    /* Room expanded container */
    .room-expanded { border:1px solid var(--border); border-radius:0 0 8px 8px; margin:-1px 0 4px; overflow:hidden; }

    /* Room style sub-section */
    .room-style-subsec { border-bottom:1px solid var(--border); }
    .room-style-subsec-hdr { display:flex; align-items:center; gap:7px; padding:8px 12px; cursor:pointer; user-select:none; background:var(--s2); transition:background .12s; }
    .room-style-subsec-hdr:hover { background:var(--s3); }
    .room-style-subsec-icon { font-size:11px; color:var(--accent); flex-shrink:0; }
    .room-style-subsec-title { font-size:11px; font-weight:600; color:var(--text); flex:1; }

    /* Flat room style panel */
    .rsp-panel { padding:10px 12px; display:flex; flex-direction:column; gap:4px; background:var(--bg); }
    /* Input actions: one card per channel — name + action picker on the header
       line, then a two-column grid (fixed label column) for its settings, so
       the sub-rows line up instead of floating. Chosen entities are chips above
       ONE picker that adds another; HA's picker brings its own field chrome. */
    .ia-ch { border:1px solid var(--border); border-radius:8px; padding:8px 10px; margin-bottom:8px; background:var(--s1); }
    .ia-ch.set { border-color:color-mix(in srgb, var(--accent) 45%, var(--border)); }
    .ia-ch-hdr { display:flex; align-items:center; gap:10px; }
    .ia-ch-name { flex:0 0 34%; font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ia-grid { display:grid; grid-template-columns:84px minmax(0,1fr); gap:6px 10px; align-items:center; margin-top:8px; }
    .ia-lbl { font-size:11.5px; color:var(--t2); }
    .ia-hint { grid-column:1 / -1; font-size:11.5px; color:var(--t2); margin:-2px 0 2px; }
    .ia-note { font-size:11px; color:var(--t3); margin-top:3px; }
    .ia-chips { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:4px; }
    .ia-chip { display:inline-flex; align-items:center; gap:6px; font-size:12px; padding:2px 6px 2px 9px; border-radius:999px; background:var(--s2); border:1px solid var(--border); }
    .ia-chip-x { border:none; background:transparent; color:var(--t3); cursor:pointer; font-size:14px; line-height:1; padding:0 2px; }
    .ia-chip-x:hover { color:var(--text); }
    .ia-picker { display:block; width:100%; }
    .rsp-section-lbl { font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); margin:8px 0 4px; padding-bottom:4px; border-bottom:1px solid var(--border); }
    .rsp-section-lbl:first-child { margin-top:0; }
    .fav-btn { background:none; border:none; cursor:pointer; font-size:13px; color:var(--t3); padding:0 2px; line-height:1; transition:color .15s,transform .15s; flex-shrink:0; }
    .fav-btn:hover { color:var(--amber); transform:scale(1.2); }
    .fav-btn.on { color:var(--amber); }
    .dev-style-hint { font-size:11px; color:var(--t3); font-weight:400; letter-spacing:.04em; text-transform:none; }

    /* Sensor range table */
    .range-table { display:flex; flex-direction:column; gap:2px; }
    .range-hdr { display:grid; grid-template-columns:1fr 60px 60px 24px; gap:4px; padding:0 2px 4px; font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--t3); border-bottom:1px solid var(--border); }
    .range-row { display:grid; grid-template-columns:1fr 60px 60px 24px; gap:4px; align-items:center; padding:3px 2px; border-radius:4px; }
    .range-row.set { background:rgba(251,191,36,0.06); }
    .range-lbl { font-size:11px; color:var(--t2); }
    .range-unit { font-size:9px; color:var(--t3); }
    .range-inp { width:100%; background:var(--s2); border:1px solid var(--border); border-radius:4px; padding:3px 5px; font-size:11px; color:var(--text); text-align:right; -moz-appearance:textfield; }
    .range-inp::-webkit-outer-spin-button, .range-inp::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
    .range-inp:focus { outline:none; border-color:var(--accent); }
    .range-inp::placeholder { color:var(--t3); }
    .dev-style-panel { background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:10px 12px; margin:2px 0 6px 18px; display:flex; flex-direction:column; gap:8px; }
    .lay-canvas { display:flex; flex-direction:column; gap:4px; }
    .lay-row { display:flex; flex-wrap:wrap; align-items:center; gap:4px; min-height:28px; padding:4px 6px;
      border:1px dashed var(--border); border-radius:6px; background:var(--s3); }
    .lay-row.lay-new { justify-content:center; font-size:10px; color:var(--t3); border-style:dotted; }
    /* touch-action:none — without it the browser claims the gesture for scrolling
       and pointermove never reaches us. Padding is a touch-sized target. */
    .lay-chip { font-size:10px; color:var(--text); background:var(--s2); border:1px solid var(--border2);
      border-radius:4px; padding:5px 9px; cursor:grab; user-select:none; touch-action:none; }
    .lay-chip:active { cursor:grabbing; }
    .lay-chip.off { color:var(--t3); border-color:var(--border); }
    .lay-chip.lay-dragging { opacity:.45; }
    .lay-row.lay-over, .lay-palette.lay-over { border-style:solid; border-color:var(--accent, #03a9f4); }
    .lay-slot { font-size:9px; color:var(--t3); opacity:.6; padding:0 4px; }
    .lay-palette { display:flex; flex-wrap:wrap; gap:4px; min-height:28px; padding:4px 6px;
      border:1px dashed var(--border); border-radius:6px; }
    .block-toggles { display:flex; flex-wrap:wrap; gap:5px; }
    .block-tog { display:flex; align-items:center; gap:3px; font-size:10px; color:var(--t3); cursor:pointer; padding:2px 7px; border-radius:4px; border:1px solid var(--border); background:var(--s3); user-select:none; transition:color .12s,border-color .12s; }
    .block-tog.on { color:var(--text); border-color:var(--border2); }
    .tile-icon-row { display:flex; align-items:center; gap:6px; }
    .tile-icon-pickers { display:flex; align-items:center; gap:4px; flex:1; }
    .tile-icon-state-lbl { font-size:9px; font-weight:600; color:var(--t3); letter-spacing:.04em; text-transform:uppercase; flex-shrink:0; }
    .ent-anim-header { display:grid; grid-template-columns:1fr 1fr 1fr 0.8fr; gap:4px; padding:0 2px 2px; }
    .ent-anim-hcol { font-size:9px; font-weight:600; color:var(--t3); letter-spacing:.04em; text-transform:uppercase; }
    .ent-anim-hcol.name { /* first col */ }
    .ent-anim-row { display:grid; grid-template-columns:1fr 1fr 1fr 0.8fr; gap:4px; align-items:center; }
    .ent-anim-name { font-size:10px; color:var(--text); font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .anim-select { width:100%; font-size:10px; padding:3px 5px; border-radius:5px; border:1px solid var(--border); background:var(--s3); color:var(--text); cursor:pointer; outline:none; transition:border-color .12s; }
    .anim-select:focus { border-color:var(--acc,#f4601e); }
    .icon-select { min-width:70px; }
    .icon-picker-wrap { position:relative; display:inline-block; flex:1; }
    .icon-picker-btn { cursor:pointer; display:flex; align-items:center; gap:5px; padding:4px 8px; border-radius:6px; background:var(--s3,#1e1e1e); border:1px solid var(--border,#333); color:var(--text); min-height:26px; }
    .icon-picker-btn:hover { border-color:var(--acc,#f4601e); }
    .icon-grid-popover { margin:auto; inset:0; width:min(420px, 92vw); max-height:92vh; padding:12px; background:var(--s1,#17171c); border:1px solid rgba(255,255,255,0.15); border-radius:10px; box-shadow:0 12px 40px rgba(0,0,0,0.85); color:var(--text); }
    .icon-grid-popover:popover-open { display:grid; grid-template-columns:repeat(8,1fr); gap:4px; }
    .icon-grid-popover::backdrop { background:rgba(0,0,0,0.3); }
    .icon-grid-cell { display:flex; flex-direction:column; align-items:center; gap:2px; padding:5px 3px; border:1px solid transparent; border-radius:5px; background:transparent; cursor:pointer; transition:background .1s,border-color .1s; }
    .icon-grid-cell:hover { background:rgba(255,255,255,0.07); }
    .icon-grid-lbl { font-size:8px; color:rgba(255,255,255,0.45); max-width:34px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; }
    .icon-grid-none { font-size:13px; color:rgba(255,255,255,0.3); }
    .icon-cell { display:flex; flex-direction:column; align-items:center; gap:2px; padding:5px 3px; border:1px solid transparent; border-radius:5px; background:none; cursor:pointer; color:var(--acc,#f4601e); transition:background .1s,border-color .1s; }
    .icon-cell:hover { background:rgba(255,255,255,0.07); border-color:rgba(244,96,30,0.4); }
    .icon-cell.selected { background:rgba(244,96,30,0.18); border-color:var(--acc,#f4601e); }
    .icon-cell-label { font-size:0.58rem; color:var(--t3); max-width:34px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; }
    .icon-cell-none { font-size:1rem; color:var(--t3); }
    .icon-preview { width:20px; height:20px; display:block; }
    .icon-picker-btn.compact { padding:3px 5px; min-height:22px; justify-content:center; width:100%; }
    .icon-preview-sm { width:16px; height:16px; display:block; }
    .ent-icon-bulb.off .bulb-body,.ent-icon-bulb2.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }
    .ent-icon-bulb.off .bulb-base1,.ent-icon-bulb.off .bulb-base2,
    .ent-icon-bulb2.off .bulb-base1,.ent-icon-bulb2.off .bulb-base2 { opacity:0.3; }
    .ent-icon-bulb2.off .bulb-filament { display:none; }
    .ent-icon-bulb3.off .bulb-chip { fill:none; stroke:currentColor; stroke-width:1; opacity:0.5; }
    .room-style-panel { margin:8px 0 12px; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
    .style-panel-hdr { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--s2); font-size:12px; font-weight:600; }
    .clear-btn { font-size:10px; background:none; border:1px solid rgba(239,68,68,0.4); border-radius:4px; color:#ef4444; padding:3px 8px; cursor:pointer; }
    .style-tabs { display:flex; gap:4px; padding:6px 10px; background:var(--bg); border-bottom:1px solid var(--border); }
    .stab { flex:1; padding:5px 4px; border-radius:5px; font-size:10px; font-weight:600; text-align:center; cursor:pointer; border:1px solid var(--border); background:var(--s2); color:var(--t2); transition:all .12s; }
    .stab.on { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }
    .style-body { padding:10px 12px; }


    /* ── Step buttons ── */
    .step-row { display:flex; align-items:center; gap:6px; }
    .step-btn { width:28px; height:28px; border:1px solid var(--border2); border-radius:5px; background:var(--s2); color:var(--t2); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; line-height:1; }
    .step-btn:hover { background:var(--s3); border-color:var(--accent); color:var(--text); }
    .step-val { font-family:monospace; font-size:13px; color:var(--text); min-width:28px; text-align:center; font-weight:500; }

    /* ── Drag list ── */
    .drag-list { display:flex; flex-direction:column; gap:4px; }
    .drag-item { display:flex; align-items:center; gap:10px; padding:9px 12px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:grab; transition:background .12s,border-color .12s; user-select:none; }
    .drag-item:hover { background:var(--s3); border-color:var(--border2); }
    .drag-item.drag-over { border-color:var(--accent); background:var(--accentbg); }
    .drag-item.hidden-item .drag-label { color:var(--t3); text-decoration:line-through; }
    .drag-handle { color:var(--t3); display:flex; flex-direction:column; gap:2px; cursor:grab; }
    .drag-handle span { display:block; width:14px; height:1.5px; background:currentColor; border-radius:1px; }
    .drag-label { font-size:12px; font-weight:500; color:var(--text); }
    .drag-sub { font-size:10px; color:var(--t3); }
    .drag-eye { background:none; border:none; color:var(--t3); cursor:pointer; font-size:13px; padding:2px 4px; border-radius:3px; transition:color .12s; }
    .drag-eye:hover { color:var(--text); }
    .tag-new { font-size:9px; font-weight:700; letter-spacing:0.06em; padding:2px 6px; border-radius:3px; text-transform:uppercase; background:var(--accentbg); color:var(--accent); border:1px solid var(--accentbdr); }

    /* ── Tile live preview ── */
    /* ── Tile block order preview ── */
    .tile-preview-live { background:#141418; border:1px solid var(--border); border-radius:10px; padding:8px 10px; margin-bottom:10px; display:flex; flex-direction:column; gap:0; position:relative; overflow:hidden; }
    .tile-preview-live::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,var(--accent),transparent); }
    /* A layout row in the preview. Multiple blocks on one row sit side by side,
       each an equal share, mirroring the .tile-row runtime rule. Separator sits
       on the row wrapper so it draws once per layout row, not per block. */
    .tp-prow { display:flex; align-items:stretch; gap:8px; border-bottom:1px solid rgba(255,255,255,0.04); }
    .tp-prow:last-child { border-bottom:none; }
    .tp-prow > * { flex:1 1 0; min-width:0; }
    .tp-row { display:flex; align-items:center; gap:6px; padding:3px 0; }
    .tp-name-row { justify-content:flex-start; }
    .tp-name { font-size:11px; font-weight:600; color:rgba(255,255,255,0.85); flex:1; }
    .tp-dot  { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .tp-tog  { font-size:9px; font-weight:700; padding:2px 8px; border-radius:10px; color:white; letter-spacing:0.06em; flex-shrink:0; }
    .tp-chips { flex-wrap:wrap; gap:4px; }
    .tp-chip { font-size:9px; padding:2px 6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:4px; color:rgba(255,255,255,0.55); }
    .tp-lbl  { font-size:9px; color:rgba(255,255,255,0.4); width:56px; flex-shrink:0; }
    .tp-val  { font-size:9px; color:rgba(255,255,255,0.5); width:32px; text-align:right; flex-shrink:0; }
    .tp-strack { flex:1; height:4px; background:rgba(255,255,255,0.08); border-radius:2px; overflow:hidden; }
    .tp-sfill  { height:100%; border-radius:2px; }
    .tp-btn  { font-size:9px; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.6); cursor:default; flex:1; text-align:center; }

    /* ── Graph preview ── */
    .graph-preview { height:56px; background:var(--s2); border:1px solid var(--border); border-radius:8px; overflow:hidden; margin-bottom:10px; }

    /* ── Button preview ── */
    .btn-preview { display:flex; gap:8px; align-items:center; padding:10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; margin-bottom:10px; }
    .preview-btn { font-size:11px; font-weight:700; letter-spacing:0.08em; padding:4px 12px; border-radius:20px; cursor:default; }
    .preview-btn.on { background:var(--accent); color:white; border:none; }
    .preview-btn.off { background:var(--s3); color:var(--t2); border:1px solid var(--border2); }

    /* ── Sensor grid ── */
    .sensors-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .sensors-hdr-lbl { font-size:11px; color:var(--t2); }
    .sensors-all-btn { background:rgba(244,96,30,0.12); color:#f4601e; border:1px solid rgba(244,96,30,0.3); border-radius:6px; padding:3px 10px; font-size:11px; cursor:pointer; }
    .sensors-all-btn:hover { background:rgba(244,96,30,0.22); }
    .sensor-graph-btn { margin-left:auto; flex-shrink:0; background:transparent; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:var(--t2); font-size:13px; padding:1px 6px; cursor:pointer; line-height:1.4; transition:all .12s; }
    .sensor-graph-btn.on { background:rgba(74,158,255,0.18); border-color:#4a9eff; color:#4a9eff; }
    .sensor-graph-btn:hover { border-color:rgba(255,255,255,0.3); color:var(--text); }
    .sensor-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; }
    .sensor-item { display:flex; align-items:center; gap:8px; padding:8px 10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:pointer; transition:all .12s; user-select:none; }
    .sensor-item:hover { border-color:var(--border2); background:var(--s3); }
    .sensor-item.active { border-color:var(--accentbdr); background:var(--accentbg); }
    .sensor-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; transition:background .2s; }
    .sensor-item-body { display:flex; flex-direction:column; gap:1px; flex:1; min-width:0; }
    .sensor-unit { font-size:9px; color:var(--t3); letter-spacing:0.03em; }
    .sensor-name { font-size:11px; color:var(--t2); }
    .sensor-item.active .sensor-name { color:var(--text); }

    /* ── YAML ── */
    .yaml-out { font-family:monospace; font-size:11px; line-height:1.7; color:var(--t2); background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:12px 14px; overflow-x:auto; white-space:pre; }
    .yaml-out::-webkit-scrollbar { height:4px; }
    .yaml-out::-webkit-scrollbar-thumb { background:var(--s3); border-radius:2px; }
    .btn-copy { font-size:11px; padding:4px 10px; border-radius:20px; border:1px solid var(--border2); background:transparent; color:var(--t2); cursor:pointer; transition:all .15s; }
    .btn-copy:hover { background:var(--s3); color:var(--text); }
    .clip-feedback { font-size:11px; color:var(--t2); animation:fadeout 1.5s forwards; }
    @keyframes fadeout { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }

    /* ── Views tab ── */
    .views-header { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 0 10px; }
    .empty-views { text-align:center; padding:24px 12px; color:var(--t2); font-size:13px; border:1px dashed var(--border); border-radius:8px; }
    .view-card { border:1px solid var(--border); border-radius:8px; margin-bottom:8px; background:var(--s2); overflow:hidden; }
    .view-card.expanded { border-color:var(--accentbdr); }
    .view-card-hdr { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; user-select:none; }
    .view-card-hdr:hover { background:var(--s3); }
    .view-card-icon { font-size:16px; width:20px; text-align:center; color:var(--accent); flex-shrink:0; display:flex; align-items:center; justify-content:center; }
    .view-card-name { flex:1; font-size:13px; font-weight:600; color:var(--text); }
    .view-card-id { font-size:10px; color:var(--t3); font-family:monospace; }
    .view-card-count { font-size:10px; color:var(--t2); background:var(--s3); border:1px solid var(--border); border-radius:10px; padding:1px 7px; font-variant-numeric:tabular-nums; }
    .view-card-actions { display:flex; gap:3px; }
    .view-card-actions .vc-btn { background:transparent; border:1px solid var(--border2); color:var(--t2); border-radius:4px; padding:2px 6px; font-size:11px; cursor:pointer; transition:all .12s; }
    .view-card-actions .vc-btn:hover:not(:disabled) { border-color:var(--accent); color:var(--accent); }
    .view-card-actions .vc-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .view-card-actions .vc-btn.danger:hover { border-color:#ef4444; color:#ef4444; }
    .view-card-actions .vc-btn.danger.armed { border-color:#ef4444; color:#fff; background:#ef4444; font-weight:600; }
    .view-card-chev { font-size:10px; color:var(--t3); }
    .view-card-body { padding:10px 14px 14px; border-top:1px solid var(--border); background:var(--s1); }
    .view-dev-list { max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; padding:6px; background:var(--s2); border:1px solid var(--border); border-radius:6px; }
    .view-dev-row { display:flex; align-items:center; gap:8px; padding:4px 6px; border-radius:4px; cursor:pointer; font-size:12px; }
    .view-dev-row:hover { background:var(--s3); }
    .view-dev-name { flex:1; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .view-dev-area { font-size:10px; color:var(--t3); }

    /* ── Live style preview (Style tab top) ── */
    .sp-hint { font-size:10px; color:var(--t3); text-align:center; opacity:0.8; }

    /* ── Tile style picker (per-room) ── */
    .ts-style-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:5px; margin-top:6px; }
    .ts-style-btn { display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 4px 7px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:pointer; transition:all .15s; text-align:center; }
    .ts-style-btn:hover { background:var(--s3); border-color:var(--border2); }
    .ts-style-btn.on { background:var(--accentbg); border-color:var(--accent); }
    .ts-style-icon  { font-size:14px; line-height:1; margin-bottom:1px; }
    .ts-style-label { font-size:10px; font-weight:600; color:var(--text); letter-spacing:0.03em; }
    .ts-style-desc  { font-size:9px; color:var(--t3); line-height:1.3; }
    .ts-style-btn.on .ts-style-label { color:var(--accent); }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-device-dashboard-editor': HADeviceDashboardEditor;
  }
}
