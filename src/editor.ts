import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { ref } from 'lit/directives/ref.js';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent, LovelaceCardConfig } from 'custom-card-helpers';
import { HADeviceDashboardConfig, AreaStyle, DeviceStyle, TileBlockId, EntityAnimationType, TileStyle, PowerMonitorVariant, ViewConfig, DeviceProfile, ThemePreset, CustomStyleDef, TileLayout } from './types';
import { getAllDevices, GRAPH_SENSOR_DEFS, getDeviceProfile, HEADER_CHIP_DEFS, DEFAULT_HEADER_CHIPS, normalizeGraphKey, migrateConfig, PROFILE_LABELS, STYLE_ELEMENTS, PROFILE_DEFAULT_TILE_STYLE, profileDefaultTileStyle, normalizeTileLayout, flattenTileLayout, cloneTileLayout, setBlockInLayout, PROFILE_DEFAULT_BLOCKS, DEFAULT_GRAPH_SENSORS, factoryLook } from './helpers';
import { THEME_ORDER, THEME_PRESETS, THEME_LABELS, THEME_KEYS, applyThemePalette, detectTheme, type ThemePalette } from './themes';
import { renderAnimSvg, ANIM_OPTIONS, ANIM_COLORS, ANIM_CSS } from './anim-icons';
import { EDITOR_LAYOUT } from './editor-layout';

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

/** Config keys that belong to style/layout — copied by "Copy style", excluded: device/room keys */
const STYLE_KEYS: ReadonlyArray<string> = [
  'style', 'tile_size', 'tile_opacity', 'card_opacity',
  'card_bg_image', 'card_bg_image_size',
  'tile_layout', 'graph_style', 'graph_sensors',
  'graph_hours', 'graph_line_color', 'graph_sensor_colors',
  'sensors', 'sort_by', 'columns',
  'show_power_bar', 'power_bar_max',
  'area_styles', 'device_styles',
  'views', 'default_view',
];



// ─── Editor component ─────────────────────────────────────────────────────────

@customElement('ha-device-dashboard-editor')
export class HADeviceDashboardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: HADeviceDashboardConfig;
  @state() private _tab: string = 'devices';   // matches an EDITOR_LAYOUT tab id
  @state() private _styleScope: 'device' | 'profile' = 'device';  // Device styling tab: this device vs all of type
  @state() private _cardThemeRoom: string = '';                   // Card & Theme tab: selected room for per-room styling
  @state() private _newStyleName: string = '';                    // Device styling tab: "Save as style" name input
  @state() private _renamingStyle: string | null = null;          // Saved-styles row: slug being renamed inline
  /** Editor-only preference (persisted in localStorage, never written to config):
   *  when false, power-user controls are hidden to keep the common path simple. */
  @state() private _advanced = false;
  /** Whether the "Defaults" quick-setup panel is open. */
  @state() private _defaultsOpen = false;
  /** Two-click arming for the destructive "Reset everything" button. */
  @state() private _resetArmed = false;
  /** Extra-cards manager state. */
  @state() private _xcPlacement: 'header' | 'footer' | 'room' = 'header';
  @state() private _xcRoom = '';
  @state() private _xcAdding = false;
  @state() private _xcEditIndex: number | null = null;
  /** Initial config handed to ha-yaml-editor as defaultValue (stable while editing). */
  @state() private _xcDraft: Record<string, unknown> | null = null;
  /** Latest value from the embedded card editor — NOT reactive, so keystrokes don't reset it. */
  private _xcLatest: Record<string, unknown> | null = null;
  /** Theme awaiting a "replace custom colours?" confirmation, and the last
   *  saved custom palette (a restorable swatch). */
  @state() private _pendingTheme: Exclude<ThemePreset, 'custom'> | null = null;
  @state() private _savedTheme: ThemePalette | null = null;
  @state() private _expandedViewId: string | null = null;
  @state() private _openSections: Record<string, boolean> = {
    rooms: true,
    header: true, tiles: true, card: false, colors: false, typography: false,
    graphtype: true, graphcolors: false, graphranges: false,
    electrical: true, environmental: true, deviceinfo: false, alerts: false,
  };
  @state() private _expandedRooms: Set<string> = new Set();
  @state() private _expandedRoomStyle: Set<string> = new Set();
  @state() private _selectedDeviceId: string | null = null;
  @state() private _deviceSearch = '';
  @state() private _styleClipFeedback = '';
  @state() private _copyAreaOpen = false;
  @state() private _copyJson = '';
  @state() private _pasteOpen = false;
  @state() private _pasteText = '';
  @state() private _iconPickerState: {
    currentValue: string | undefined;
    isOn: boolean;
    onSelect: (v: string | undefined) => void;
  } | null = null;
  private _styleClipTimer?: number;

  setConfig(config: HADeviceDashboardConfig) {
    this._config = migrateConfig(config);
    this._loadAdvanced();
    this._loadSavedTheme();
  }

  private _savedThemeKey(): string {
    return `shelly-dashboard:savedTheme:${this._config?.title ?? 'default'}`;
  }
  private _loadSavedTheme(): void {
    try {
      const raw = localStorage.getItem(this._savedThemeKey());
      this._savedTheme = raw ? JSON.parse(raw) as ThemePalette : null;
    } catch { /* privacy mode / bad JSON */ }
  }
  /** Snapshot the current style colours as a restorable "Saved" theme. */
  private _saveCurrentTheme(): void {
    const sty = this._config.style ?? {};
    const pal: ThemePalette = {};
    for (const k of THEME_KEYS) if (sty[k] !== undefined) (pal as Record<string, unknown>)[k] = sty[k];
    this._savedTheme = pal;
    try { localStorage.setItem(this._savedThemeKey(), JSON.stringify(pal)); } catch { /* ignore */ }
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

  private _copyStyle() {
    const snapshot: Record<string, unknown> = {};
    for (const k of STYLE_KEYS) {
      const v = (this._config as Record<string, unknown>)[k];
      if (v !== undefined) snapshot[k] = v;
    }
    this._copyJson = JSON.stringify(snapshot);
    this._copyAreaOpen = true;
    this._pasteOpen = false;
    navigator.clipboard.writeText(this._copyJson)
      .then(() => this._showStyleFeedback('Copied to clipboard'))
      .catch((err) => {
        console.warn('[editor] clipboard write failed', err);
        this._showStyleFeedback('Copy failed — select the text below and copy manually');
      });
  }

  private _applyPastedStyle() {
    try {
      const parsed = JSON.parse(this._pasteText) as Record<string, unknown>;
      const hasKnownKey = STYLE_KEYS.some(k => k in parsed);
      if (!hasKnownKey) { this._showStyleFeedback('Invalid style data'); return; }
      const updated = { ...this._config } as Record<string, unknown>;
      for (const k of STYLE_KEYS) {
        if (k in parsed) updated[k] = parsed[k];
      }
      this._emitNow(updated as HADeviceDashboardConfig);
      this._showStyleFeedback('Applied!');
      this._pasteOpen = false;
      this._pasteText = '';
    } catch {
      this._showStyleFeedback('Invalid style data');
    }
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
  ): TemplateResult {
    const inherited = inheritedSel ?? [];
    const isOverride = selected !== undefined;
    // Effective set shown: override, else inherited global (empty = all keys on)
    const allKeys = SENSOR_GROUPS.flatMap(g => g.items.map(i => i.key));
    const effective = new Set(isOverride ? selected : (inherited.length ? inherited : allKeys));
    const toggle = (key: string) => {
      const base = isOverride ? [...selected] : [...effective];
      const next = base.includes(key) ? base.filter(k => k !== key) : [...base, key];
      // If the result matches "everything on", store undefined-equivalent full list only when overriding;
      // an emptied selection clears the override entirely.
      onChange(next.length ? next : undefined);
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
        ${SENSOR_GROUPS.map(grp => html`
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
            ${(['name','power','online'] as const).map(v => html`
              <span class="pill ${(c.sort_by ?? 'name') === v ? 'on' : ''}"
                @click=${()=>this._set('sort_by',v)}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
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
        <div class="tog-row" style="border:none;padding:6px 0 0;align-items:center">
          <div class="tog-lbl" title="Devices whose name starts with one of these ALSO appear under a section of that name, in addition to their room. Comma-separated.">Name-based groups</div>
          <input type="text" class="inline-text" style="max-width:190px" placeholder="e.g. Gólfhiti"
            .value=${(c.name_groups ?? []).join(', ')}
            @change=${(e:Event)=>{
              const list=(e.target as HTMLInputElement).value.split(',').map(s=>s.trim()).filter(Boolean);
              this._set('name_groups', list.length ? list : undefined);
            }}>
        </div>
      </div>
      ${(c.favorites?.length) ? (() => {
        const FAV_KEY = '★ Favourites';
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
              this._cardThemeRoom = 'Favourites'; this._tab = 'card-theme';
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
                        this._selectedDeviceId = dev.device_id; this._styleScope = 'device'; this._tab = 'device-styling';
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
              this._cardThemeRoom = areaKey; this._tab = 'card-theme';
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
              <!-- Device list (room styling now lives in Card & Theme → Per-room styling) -->
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
                        this._selectedDeviceId = dev.device_id; this._styleScope = 'device'; this._tab = 'device-styling';
                      }}>✎</button>
                    </div>`;
                }) : html`<div class="room-device-empty">No devices in this room</div>`}
              </div>
            </div>` : nothing}`;
      })}`;

    // Per-device styling now lives in the Device styling tab; the ✎ shortcuts jump there.
    const sidePanel = nothing;

    return html`
      ${this._renderDiscoverySection()}
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

  private _xcCancel(): void { this._xcAdding = false; this._xcEditIndex = null; this._xcDraft = null; this._xcLatest = null; }

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
            <button class="xc-btn" @click=${() => { this._xcEditIndex = i; this._xcDraft = { ...card }; this._xcLatest = null; this._xcAdding = false; }}>Edit</button>
            <button class="xc-btn xc-del" @click=${() => { const next = arr.slice(); next.splice(i, 1); this._xcSetArray(next); }}>✕</button>
          </div>`) : html`<div class="dp-hint-inline">No cards here yet.</div>`}
      </div>
      ${!this._xcAdding && this._xcEditIndex === null ? html`
        <button class="sec-toolbar-btn" @click=${() => { this._xcAdding = true; this._xcDraft = null; this._xcLatest = null; }}>+ Add card</button>` : nothing}
      ${this._xcAdding ? html`
        <div class="field">
          <div class="field-lbl">Card type</div>
          <select @change=${(e: Event) => { const t = (e.target as HTMLSelectElement).value; this._xcDraft = t ? { type: t } : null; this._xcLatest = null; }}>
            <option value="">— pick a card —</option>
            ${this._cardTypeOptions().map(o => html`<option value=${o.value}>${o.label}</option>`)}
          </select>
        </div>` : nothing}
      ${this._xcDraft ? html`
        <div class="field">
          <div class="field-lbl">Card configuration (YAML)</div>
          ${yamlAvail ? html`
            <ha-yaml-editor .hass=${this.hass} .defaultValue=${this._xcDraft}
              @value-changed=${(e: CustomEvent) => { e.stopPropagation(); if (e.detail?.isValid !== false) this._xcLatest = e.detail.value; }}></ha-yaml-editor>`
          : html`
            <textarea class="xc-yaml" .value=${JSON.stringify(this._xcDraft, null, 2)}
              @input=${(e: Event) => { try { this._xcLatest = JSON.parse((e.target as HTMLTextAreaElement).value); } catch { /* keep last valid */ } }}></textarea>`}
          <div class="xc-actions">
            <button class="sec-toolbar-btn" @click=${() => this._xcCommit()}>${this._xcEditIndex !== null ? 'Save' : 'Add'}</button>
            <button class="sec-toolbar-btn" @click=${() => this._xcCancel()}>Cancel</button>
          </div>
        </div>` : nothing}`;
    const badge = arr.length ? this._badge(String(arr.length), '#8aa0ff', 'rgba(120,140,255,0.12)') : nothing;
    return this._sec('extra-cards', '▤', 'rgba(120,140,255,0.12)', '#8aa0ff', 'Extra cards', badge, body);
  }

  /** Discovery section — Shelly vs Universal mode and the universal scope filters. */
  private _renderDiscoverySection(): TemplateResult {
    const c = this._config;
    const universal = c.mode === 'universal';
    const scope = c.universal_scope ?? 'devices';
    const listField = (label: string, key: string, val: string[] | undefined, placeholder: string, hint: string) => html`
      <div class="field">
        <div class="field-lbl">${label}</div>
        <input type="text" .value=${(val ?? []).join(', ')} placeholder=${placeholder}
          @change=${(e: Event) => {
            const v = ((e.target as HTMLInputElement).value || '').split(',').map(s => s.trim()).filter(Boolean);
            this._set(key, v.length ? v : undefined);
          }}>
        <div class="dp-hint-inline">${hint}</div>
      </div>`;
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
        ${listField('Hide integrations', 'exclude_integrations', c.exclude_integrations, 'e.g. music_assistant, cast', 'Comma-separated. Added to the built-in list (phones, browsers, routers…) that is already hidden.')}
        ${listField('Show integrations anyway', 'include_integrations', c.include_integrations, 'e.g. mobile_app', 'Comma-separated. Re-adds integrations that would otherwise be hidden by the list above or the built-in defaults.')}
        ${listField('Hide entity types', 'exclude_domains', c.exclude_domains, 'e.g. update, camera', 'Comma-separated domains to drop entirely (e.g. update, camera).')}
        ${listField('Only entity types', 'include_domains', c.include_domains, 'e.g. light, switch, climate', 'Comma-separated. When set, ONLY these domains are discovered.')}
      ` : nothing}`;
    const badge = this._badge(universal ? 'Universal' : 'Shelly',
      universal ? '#c98a63' : '#4ade80',
      universal ? 'rgba(201,138,99,0.12)' : 'rgba(74,222,128,0.1)');
    return this._sec('discovery', '◎', 'rgba(201,138,99,0.12)', '#c98a63', 'Discovery', badge, body);
  }

  private _setDeviceStyle(deviceId: string, patch: Partial<{
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
  }>) {
    const current = this._config.device_styles?.[deviceId] ?? {};
    const next: Record<string, unknown> = { ...current, ...patch };
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
  ): TemplateResult {
    const cur = current ?? 'default';
    const showVariant = cur === 'power-monitor' || (!current && recommended === 'power-monitor');
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
                    if (e.key === 'Escape') this._renamingStyle = null;
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
      ${showVariant ? html`
        <div class="field-lbl" style="margin-top:8px">Power monitor variant</div>
        <div class="pill-grp">
          ${PM_VARIANT_OPTIONS.map(opt => html`
            <span class="pill ${variant === opt.v ? 'on' : ''}"
              @click=${() => onVariant(opt.v === 'big-number' ? undefined : opt.v)}>
              ${opt.icon} ${opt.label}
            </span>`)}
        </div>` : nothing}`;
  }

  /** Device styling tab — pick a device (grouped by room), then style it via the
   *  shared device panel + per-style element toggles. (Redesign Phase 3.) */
  private _renderDeviceStylingTab(): TemplateResult {
    const devices = this._allDevices();
    const byArea = new Map<string, typeof devices>();
    for (const d of devices) { const a = d.area || '—'; if (!byArea.has(a)) byArea.set(a, []); byArea.get(a)!.push(d); }
    const areas = [...byArea.keys()].sort((a, b) => a.localeCompare(b));
    const sel = this._selectedDeviceId;
    const selDev = sel ? devices.find(d => d.device_id === sel) : null;
    const profile = selDev ? getDeviceProfile(selDev) : null;
    const scope = this._styleScope;
    const typeCount = profile ? devices.filter(d => getDeviceProfile(d).type === profile.type).length : 0;
    const profLabel = profile ? (PROFILE_LABELS[profile.type] || profile.type) : '';

    /** "Save this look as a named style" — same row for either scope. */
    const saveStyleRow = (save: () => void): TemplateResult => html`
      <div class="field" style="margin-top:12px;display:flex;gap:6px;align-items:center">
        <input type="text" class="inline-text" placeholder="Save this look as a named style…" style="flex:1"
          .value=${this._newStyleName}
          @input=${(e: Event) => { this._newStyleName = (e.target as HTMLInputElement).value; }}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') save(); }}/>
        <button class="btn-copy" title="Save as reusable style" @click=${save}>💾 Save style</button>
      </div>`;

    const deviceScopeBody = (): TemplateResult => {
      const ds = this._config.device_styles?.[sel!] ?? {};
      const style = (ds.tile_style ?? (this._config.smart_tile_styles && selDev ? profileDefaultTileStyle(profile!.type, selDev) : undefined) ?? 'default') as TileStyle;
      return html`
        ${this._renderDeviceStylePanel(sel!)}
        ${this._renderStyleElementToggles(style, ds.elements ?? {}, e => this._setDeviceStyle(sel!, { elements: e }))}
        ${saveStyleRow(() => this._saveDeviceAsStyle(sel!))}`;
    };
    const profileScopeBody = (): TemplateResult => {
      const ps = this._config.profile_styles?.[profile!.type] ?? {};
      // Mirror the render cascade: the per-profile recommendation only takes
      // effect when smart_tile_styles is on. Assuming it unconditionally would
      // show power-monitor element toggles for a relay that actually renders as
      // a block tile.
      const rawProfStyle = ps.tile_style
        ?? (this._config.smart_tile_styles ? PROFILE_DEFAULT_TILE_STYLE[profile!.type] : undefined)
        ?? this._config.tile_style;
      const style = (this._baseStyleOf(rawProfStyle) ?? 'default') as TileStyle;
      return html`
        <div class="hint" style="margin:2px 2px 10px">Applies to all ${typeCount} ${profLabel} device${typeCount !== 1 ? 's' : ''}. A per-device setting still overrides.</div>
        <div class="dev-style-panel">
          <div class="field" style="margin-bottom:4px">
            <div class="field-lbl">Tile layout style</div>
            ${this._renderTileStylePicker(
              ps.tile_style, ps.power_monitor_variant ?? 'big-number', PROFILE_DEFAULT_TILE_STYLE[profile!.type],
              v => this._setProfileStyle(profile!.type, { tile_style: v }),
              v => this._setProfileStyle(profile!.type, { power_monitor_variant: v }))}
          </div>
          <div class="tog-row" style="border:none;padding:6px 0 0">
            <div class="tog-lbl">Sparkline graphs</div>
            <div class="pill-grp">
              ${([['inherit', undefined], ['on', true], ['off', false]] as const).map(([lbl, val]) => html`
                <span class="pill ${(ps.show_graphs ?? 'x') === (val ?? 'x') ? 'on' : ''}"
                  @click=${() => this._setProfileStyle(profile!.type, { show_graphs: val })}>${lbl}</span>`)}
            </div>
          </div>
          ${this._renderStyleElementToggles(style, ps.elements ?? {}, e => this._setProfileStyle(profile!.type, { elements: e }))}
          ${style === 'default'
            ? this._renderLayoutCanvas(
                ps.tile_layout,
                this._config.tile_layout ?? PROFILE_DEFAULT_BLOCKS[profile!.type],
                (l) => this._setProfileStyle(profile!.type, { tile_layout: l }))
            : nothing}
          ${saveStyleRow(() => this._saveProfileAsStyle(profile!.type))}
        </div>`;
    };

    return html`
      <div class="dev-styling-tab">
        <div class="field" style="margin-bottom:8px">
          <div class="field-lbl">Device to style</div>
          <select class="inline-text" style="width:100%"
            @change=${(e: Event) => { this._selectedDeviceId = (e.target as HTMLSelectElement).value || null; }}>
            <option value="">— select a device —</option>
            ${areas.map(a => html`<optgroup label=${a}>
              ${byArea.get(a)!.map(d => html`<option value=${d.device_id} ?selected=${d.device_id === sel}>${d.name}</option>`)}
            </optgroup>`)}
          </select>
        </div>
        ${selDev && profile ? html`
          <div class="pill-grp" style="margin-bottom:10px">
            <span class="pill ${scope === 'device' ? 'on' : ''}" @click=${() => { this._styleScope = 'device'; }}>This device</span>
            <span class="pill ${scope === 'profile' ? 'on' : ''}" @click=${() => { this._styleScope = 'profile'; }}>All ${profLabel}${typeCount !== 1 ? 's' : ''} (${typeCount})</span>
          </div>
          ${scope === 'device' ? deviceScopeBody() : profileScopeBody()}
        ` : html`<div class="hint" style="margin:12px 2px">Pick a device above to style it.</div>`}
      </div>`;
  }

  /** Max blocks that can share one row before it gets too cramped to read. */
  private static readonly ROW_MAX = 3;
  /** Pointer travel before a press becomes a drag, so a tap isn't a move. */
  private static readonly DRAG_SLOP = 6;

  /** Schematic mock of one block for the layout canvas's live preview. */
  private _blockPreview(id: TileBlockId, accent: string): TemplateResult | typeof nothing {
    switch (id) {
      case 'name_row': return html`<div class="tp-row tp-name-row"><div class="tp-dot" style="background:#4ade80"></div><span class="tp-name">Ljós yfir vaska</span><span class="tp-tog" style="background:${accent}">ON</span></div>`;
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
  ): TemplateResult {
    const rows = normalizeTileLayout(current ?? inherited)!;
    const used = new Set(rows.flat());
    const hidden = TILE_BLOCKS.map(b => b.id).filter(id => !used.has(id));
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
    const setEl = (id: string, visible: boolean) => {
      const next = { ...cur };
      if (visible) delete next[id]; else next[id] = false;
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
            <label class="sw"><input type="checkbox" .checked=${cur[el.id] !== false}
              @change=${(e: Event) => setEl(el.id, (e.target as HTMLInputElement).checked)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
          </div>`)}
      </div>`;
  }

  private _renderDeviceStylePanel(deviceId: string): TemplateResult {
    const devStyle: DeviceStyle = this._config.device_styles?.[deviceId] ?? {};
    const canonical = TILE_BLOCKS.map(b => b.id);
    const globalRaw: TileLayout = this._config.tile_layout ?? canonical;
    const globalLayout: TileBlockId[] = flattenTileLayout(globalRaw)!;
    const devLayout: TileBlockId[] | null = flattenTileLayout(devStyle.tile_layout) ?? null;
    const entityAnims: Record<string, { on?: string; off?: string; speed?: number }> = devStyle.entity_animations ?? {};

    const toggleBlock = (blockId: TileBlockId) => {
      const isVisible = (devLayout ?? globalLayout).includes(blockId);
      // Toggle within whichever layout is in force, so a device that has been
      // given side-by-side rows keeps them when a block is shown or hidden.
      const next = setBlockInLayout(devStyle.tile_layout ?? globalRaw, blockId, !isVisible, canonical);
      // Structural compare, not a set compare: a device whose blocks match global
      // but are arranged into rows must keep its own layout, not fall back to it.
      const sameAsGlobal = JSON.stringify(next) === JSON.stringify(normalizeTileLayout(globalRaw));
      this._setDeviceStyle(deviceId, { tile_layout: sameAsGlobal ? undefined : next });
    };

    const setEntityAnim = (entityId: string, field: 'on' | 'off' | 'speed', value: string | number) => {
      const cur: Record<string, unknown> = { ...(entityAnims[entityId] ?? {}) };
      if (field === 'speed') {
        const spd = Number(value);
        if (spd === 1) delete cur['speed']; else cur['speed'] = spd;
      } else {
        if (value === 'none') delete cur[field]; else cur[field] = value;
      }
      const next = { ...entityAnims, [entityId]: cur as any };
      if (!cur['on'] && !cur['off'] && !cur['speed']) delete next[entityId];
      this._setDeviceStyle(deviceId, { entity_animations: Object.keys(next).length ? next : undefined });
    };

    // Find this device for profile detection
    const allDevices = this._allDevices();
    const dev = allDevices.find(d => d.device_id === deviceId);
    const profile = dev ? getDeviceProfile(dev) : null;

    // Auto-recommended style for this device profile
    const profileStyleMap: Record<string, TileStyle> = {
      relay: 'power-monitor', plug: 'power-monitor', energy: 'power-monitor', uni: 'power-monitor',
      dimmer: 'light-control', rgb: 'light-control',
      climate: 'climate-control', wall_display: 'climate-control',
      cover: 'cover-control',
      sensor: 'sensor-card',
      input: 'scene-button', generic: 'scene-button',
    };
    const recommended: TileStyle | undefined = profile ? profileStyleMap[profile.type] : undefined;
    const curDevStyle: TileStyle | undefined = devStyle.tile_style;
    const curVariant: PowerMonitorVariant = devStyle.power_monitor_variant ?? 'big-number';

    const stylePickerHtml = html`
      <div class="field" style="margin-bottom:4px">
        <div class="field-lbl" style="display:flex;align-items:center;gap:6px">
          Tile layout style
          ${recommended && !curDevStyle ? html`<span class="dev-style-hint">Recommended: ${recommended}</span>` : nothing}
          ${curDevStyle ? html`<button class="color-reset" @click=${() => this._setDeviceStyle(deviceId, { tile_style: undefined })}>↺ reset</button>` : nothing}
        </div>
        ${this._renderTileStylePicker(
          curDevStyle, curVariant, recommended,
          (v) => this._setDeviceStyle(deviceId, { tile_style: v }),
          (v) => this._setDeviceStyle(deviceId, { power_monitor_variant: v }),
        )}
      </div>`;

    const switchEnts = dev ? dev.entities.filter(e => e.domain === 'switch' || e.domain === 'light') : [];

    return html`
      <div class="dev-style-panel">
        <div class="field" style="margin-bottom:6px">
          <div class="field-lbl" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            Type
            ${dev?.model ? html`<span class="dev-style-hint">${dev.model}</span>` : nothing}
            ${devStyle.profile ? html`<button class="color-reset"
              @click=${() => this._setDeviceStyle(deviceId, { profile: undefined })}>↺ auto</button>` : nothing}
          </div>
          <select class="inline-text" style="width:100%"
            @change=${(e: Event) => { const v = (e.target as HTMLSelectElement).value;
              this._setDeviceStyle(deviceId, { profile: v ? (v as DeviceProfile) : undefined }); }}>
            <option value="" ?selected=${!devStyle.profile}>Auto${profile ? ` — detected: ${PROFILE_LABELS[profile.type] || profile.type || 'generic'}` : ''}</option>
            ${(['relay','plug','dimmer','rgb','climate','cover','valve','energy','sensor','input','uni','wall_display','generic'] as DeviceProfile[]).map(p => html`
              <option value=${p} ?selected=${devStyle.profile === p}>${PROFILE_LABELS[p] || p}</option>`)}
          </select>
        </div>
        ${stylePickerHtml}
        <div class="color-row">
          <span class="color-key">Accent colour</span>
          <span class="color-val">${devStyle.color ?? '#f4601e'}</span>
          <input type="color" .value=${devStyle.color ?? '#f4601e'}
            @input=${(e: Event) => this._setDeviceStyle(deviceId, { color: (e.target as HTMLInputElement).value })}/>
          ${devStyle.color ? html`<button class="color-reset"
            @click=${() => this._setDeviceStyle(deviceId, { color: undefined })}>↺</button>` : nothing}
        </div>
        ${this._renderBgImagePicker(
          'Tile background photo', `tile-bg-${deviceId}`, devStyle.bg_image, devStyle.bg_image_size,
          (url) => this._setDeviceStyle(deviceId, { bg_image: url }),
          (v) => this._setDeviceStyle(deviceId, { bg_image_size: v }),
          () => this._setDeviceStyle(deviceId, { bg_image: undefined, bg_image_size: undefined }))}
        ${this._adv(html`
        <div class="tile-icon-row">
          <span class="color-key">Tile icon</span>
          <div class="tile-icon-pickers">
            <span class="tile-icon-state-lbl">ON</span>
            ${this._iconPicker(
              `tile-on-${deviceId}`,
              devStyle.tile_icon,
              true,
              (val) => this._setDeviceStyle(deviceId, { tile_icon: val as EntityAnimationType | undefined })
            )}
            <span class="tile-icon-state-lbl">OFF</span>
            ${this._iconPicker(
              `tile-off-${deviceId}`,
              devStyle.tile_icon_off,
              false,
              (val) => this._setDeviceStyle(deviceId, { tile_icon_off: val as EntityAnimationType | undefined })
            )}
          </div>
          <select class="anim-select" style="width:90px" .value=${String(devStyle.tile_icon_speed ?? 1)}
            @change=${(ev: Event) => {
              const v = Number((ev.target as HTMLSelectElement).value);
              this._setDeviceStyle(deviceId, { tile_icon_speed: v === 1 ? undefined : v });
            }}>
            <option value="0.25" ?selected=${(devStyle.tile_icon_speed ?? 1) === 0.25}>0.25× Slow</option>
            <option value="0.5"  ?selected=${(devStyle.tile_icon_speed ?? 1) === 0.5}>0.5× Slow</option>
            <option value="1"    ?selected=${(devStyle.tile_icon_speed ?? 1) === 1}>1× Normal</option>
            <option value="1.5"  ?selected=${(devStyle.tile_icon_speed ?? 1) === 1.5}>1.5× Fast</option>
            <option value="2"    ?selected=${(devStyle.tile_icon_speed ?? 1) === 2}>2× Fast</option>
            <option value="3"    ?selected=${(devStyle.tile_icon_speed ?? 1) === 3}>3× Rapid</option>
            <option value="5"    ?selected=${(devStyle.tile_icon_speed ?? 1) === 5}>5× Frantic</option>
          </select>
        </div>`)}
        <div class="field-lbl" style="margin-bottom:4px">Show graphs</div>
        <div class="pill-grp" style="margin-bottom:8px">
          ${([['Inherit', undefined], ['On', true], ['Off', false]] as Array<[string, boolean | undefined]>).map(([lbl, val]) => html`
            <span class="pill ${devStyle.show_graphs === val ? 'on' : ''}"
              @click=${() => this._setDeviceStyle(deviceId, { show_graphs: val })}>${lbl}</span>`)}
        </div>
        ${(() => {
          // Blocks compose the 'default' style only. Showing this grid on a
          // power-monitor tile would offer toggles that change nothing.
          const profile = dev ? getDeviceProfile(dev) : null;
          const raw = devStyle.tile_style
            ?? (this._config.smart_tile_styles && profile && dev ? profileDefaultTileStyle(profile.type, dev) : undefined)
            ?? this._config.tile_style;
          const base = this._baseStyleOf(raw);
          if (base && base !== 'default') return nothing;
          return html`
            ${this._renderLayoutCanvas(devStyle.tile_layout, globalRaw,
              (l) => this._setDeviceStyle(deviceId, { tile_layout: l }))}
            ${/* The canvas supersedes this flat grid — it hides a block by dragging
                  it to the palette. Kept behind Advanced as a no-drag fallback
                  (touch, accessibility) and in case the canvas doesn't stick. It is
                  row-preserving via setBlockInLayout, so the two agree. */
              this._adv(html`
                <div class="field-lbl" style="margin:6px 0 4px">Visible blocks</div>
                <div class="block-toggles">
                  ${TILE_BLOCKS.filter(b => b.id !== 'graph').map(b => {
                    const on = devLayout === null ? globalLayout.includes(b.id) : devLayout.includes(b.id);
                    return html`<span class="block-tog ${on ? 'on' : ''}" @click=${() => toggleBlock(b.id)}>
                      ${on ? '👁' : '○'} ${b.label}
                    </span>`;
                  })}
                </div>`)}`;
        })()}
        <div class="field-lbl" style="margin:6px 0 4px">Sensor chips</div>
        ${(() => {
          const areaSel = dev?.area ? this._config.area_styles?.[dev.area]?.sensors : undefined;
          return this._chipPicker(
            devStyle.sensors,
            areaSel?.length ? areaSel : this._config.sensors,
            areaSel?.length ? `area (${dev?.area})` : 'global',
            (next) => this._setDeviceStyle(deviceId, { sensors: next }),
          );
        })()}
        ${this._adv(switchEnts.length ? html`
          <div class="field-lbl" style="margin:6px 0 4px">Entity animations</div>
          <div class="ent-anim-header">
            <span class="ent-anim-hcol name">Entity</span>
            <span class="ent-anim-hcol">When ON</span>
            <span class="ent-anim-hcol">When OFF</span>
            <span class="ent-anim-hcol">Speed</span>
          </div>
          ${switchEnts.map(e => {
            const state = this.hass?.states[e.entity_id];
            const name = (state?.attributes as any)?.friendly_name ?? e.entity_id.split('.').pop() ?? e.entity_id;
            const curOn  = (entityAnims[e.entity_id]?.on  ?? 'none') as EntityAnimationType;
            const curOff = (entityAnims[e.entity_id]?.off ?? 'none') as EntityAnimationType;
            const curSpd = entityAnims[e.entity_id]?.speed ?? 1;
            return html`
              <div class="ent-anim-row">
                <span class="ent-anim-name">${name}</span>
                ${this._iconPicker(
                  `ent-on-${deviceId}-${e.entity_id}`,
                  curOn === 'none' ? undefined : curOn,
                  true,
                  (val) => setEntityAnim(e.entity_id, 'on', val ?? 'none')
                )}
                ${this._iconPicker(
                  `ent-off-${deviceId}-${e.entity_id}`,
                  curOff === 'none' ? undefined : curOff,
                  false,
                  (val) => setEntityAnim(e.entity_id, 'off', val ?? 'none')
                )}
                <select class="anim-select" .value=${String(curSpd)}
                  @change=${(ev: Event) => setEntityAnim(e.entity_id, 'speed', (ev.target as HTMLSelectElement).value)}>
                  <option value="0.25" ?selected=${curSpd === 0.25}>0.25× Slowest</option>
                  <option value="0.5"  ?selected=${curSpd === 0.5}>0.5× Slow</option>
                  <option value="1"    ?selected=${curSpd === 1}>1× Normal</option>
                  <option value="1.5"  ?selected=${curSpd === 1.5}>1.5× Fast</option>
                  <option value="2"    ?selected=${curSpd === 2}>2× Faster</option>
                  <option value="3"    ?selected=${curSpd === 3}>3× Rapid</option>
                  <option value="5"    ?selected=${curSpd === 5}>5× Frantic</option>
                </select>
              </div>`;
          })}
        ` : nothing)}
        ${this._adv(dev?.entities.length ? html`
          <div class="field-lbl" style="margin:6px 0 4px">Hidden entities
            <span style="font-weight:400;color:var(--t3)">— removed from the detail sheet's entity list</span></div>
          <div class="block-toggles">
            ${dev.entities.map(e => {
              const hiddenList = this._config.hidden_entities ?? [];
              const hidden = hiddenList.includes(e.entity_id);
              const nm = (this.hass?.states[e.entity_id]?.attributes as any)?.friendly_name
                ?? e.entity_id.split('.').pop() ?? e.entity_id;
              return html`<span class="block-tog ${hidden ? '' : 'on'}"
                @click=${() => this._set('hidden_entities',
                  hidden ? hiddenList.filter(x => x !== e.entity_id) : [...hiddenList, e.entity_id])}>
                ${hidden ? '🚫' : '👁'} ${nm}</span>`;
            })}
          </div>
        ` : nothing)}
        <button class="room-style-btn" style="align-self:flex-end;margin-top:2px" @click=${() => {
          const updated = { ...(this._config.device_styles ?? {}) };
          delete updated[deviceId];
          this._set('device_styles', Object.keys(updated).length ? updated : undefined);
        }}>Clear device style</button>
      </div>`;
  }

  private _renderRoomStylePanel(name: string): TemplateResult {
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
        ${slRow('Columns', 'columns', 1, 6, 1, 3, '')}
        ${slRow('Tile gap', 'tileGap', 4, 24, 2, 10, 'px')}

        ${sectionLbl('Graphs')}
        <div class="field">
          <div class="field-lbl">Show graphs</div>
          <div class="pill-grp">
            ${([['Inherit', undefined], ['On', true], ['Off', false]] as Array<[string, boolean | undefined]>).map(([lbl, val]) => html`
              <span class="pill ${st.show_graphs === val ? 'on' : ''}"
                @click=${() => this._setAreaStyle(name, 'show_graphs', val)}>${lbl}</span>`)}
          </div>
        </div>

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

        ${sectionLbl('Sensor chips')}
        ${this._chipPicker(
          st.sensors,
          this._config.sensors,
          'global',
          (next) => this._setAreaStyle(name, 'sensors', next),
        )}

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
    this._expandedViewId = newView.id;
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
    const expanded = this._expandedViewId === v.id;
    const filter = v.filter ?? {};
    const selectedDevices = new Set(filter.devices ?? []);
    const excludedDevices = new Set(filter.exclude_devices ?? []);
    const matchCount = this._countViewMatches(v, allDevices, byId);
    const totalCount = allDevices.length;
    const setViewField = <K extends keyof ViewConfig>(key: K, val: ViewConfig[K]) =>
      this._updateView(v.id, { [key]: val } as Partial<ViewConfig>);

    return html`
      <div class="view-card ${expanded ? 'expanded' : ''}">
        <div class="view-card-hdr" @click=${() => this._expandedViewId = expanded ? null : v.id}>
          <span class="view-card-icon">${v.icon ? html`<ha-icon .icon=${v.icon}></ha-icon>` : '☰'}</span>
          <span class="view-card-name">${v.name || v.id}</span>
          <span class="view-card-id">#${v.id}</span>
          <span class="view-card-count" title="Devices matching this view's filter">${matchCount}/${totalCount}</span>
          <div class="view-card-actions" @click=${(e: Event) => e.stopPropagation()}>
            <button class="vc-btn" ?disabled=${idx === 0}           title="Move up"   @click=${() => this._moveView(v.id, -1)}>▲</button>
            <button class="vc-btn" ?disabled=${idx === total - 1}   title="Move down" @click=${() => this._moveView(v.id, 1)}>▼</button>
            <button class="vc-btn danger" title="Delete" @click=${() => { if (confirm(`Delete view "${v.name}"?`)) this._deleteView(v.id); }}>🗑</button>
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
                  this._expandedViewId = newId;
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

  /** Layout & Style section bodies, keyed by id — consumed by _renderStyleTab and
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

    return {
      header:     { icon: '◈', bg: 'rgba(99,102,241,0.1)',  fg: '#818cf8', label: 'Header',     badge: nothing, body: headerBody },
      tiles:      { icon: '⊡', bg: 'rgba(45,212,191,0.1)',  fg: '#2dd4bf', label: 'Tiles',      badge: nothing, body: tilesBody },
      card:       { icon: '▢', bg: 'rgba(129,140,248,0.1)', fg: '#818cf8', label: 'Card',       badge: nothing, body: cardBody },
      colors:     { icon: '◐', bg: 'rgba(244,96,30,0.12)',  fg: '#f4601e', label: 'Colours',    badge: nothing, body: colorsBody },
      typography: { icon: 'T', bg: 'rgba(251,191,36,0.1)',  fg: '#fbbf24', label: 'Typography', badge: nothing, body: typogBody },
    };
  }

  /** Layout & Style tab — copy/paste chrome + live preview, then its sections
   *  (from EDITOR_LAYOUT via the shared loop). */
  private _renderStyleTab(): TemplateResult {
    const c = this._config;
    const sty: StyleCfg = c.style ?? {};

    // Live preview — reads current style tokens so changes appear immediately.
    const previewAccent   = sty.accent_color     ?? '#f4601e';
    const previewCardBg   = sty.card_bg          ?? '#1c1c1e';
    const previewTileBg   = sty.tile_bg          ?? '#1c1c1e';
    const previewTileBr   = sty.tile_border      ?? '#2a2a30';
    const previewTileHov  = sty.tile_hover_bg    ?? 'rgba(255,255,255,0.07)';
    const previewSensBg   = sty.tile_sensor_bg   ?? 'rgba(255,255,255,0.04)';
    const previewText1    = sty.text_primary     ?? '#e5e7eb';
    const previewText2    = sty.text_secondary   ?? '#9ca3af';
    const previewMuted    = sty.text_muted       ?? '#6b7280';
    const previewOnline   = sty.online_color     ?? '#4ade80';
    const previewOffline  = sty.offline_color    ?? '#ef4444';
    const previewHdrBg1   = sty.header_bg        ?? '#1a1a2e';
    const previewHdrBg2   = sty.header_bg2       ?? '#0f3460';
    const previewHdrTx    = sty.header_text_color ?? '#ffffff';
    const previewHdrOrb   = sty.header_orb_color ?? '#3b82f6';
    const previewHdrTsz   = sty.header_title_size ?? 1.1;
    const previewHdrPad   = sty.header_padding   ?? 16;
    const previewHdrBrW   = sty.header_border_width ?? 0;
    const previewHdrBrC   = sty.header_border_color ?? '#4ade80';
    const previewHdrOnl   = sty.header_stat_online  ?? '#4ade80';
    const previewHdrPow   = sty.header_stat_power   ?? '#fb923c';
    const previewFont     = sty.font_family ? `'${sty.font_family}', sans-serif` : 'inherit';
    const previewScale    = sty.text_size_scale ?? 1;
    const previewRadius   = sty.tile_radius ?? 12;
    const previewBrW      = sty.tile_border_width ?? 1;
    const previewHdrRad   = sty.header_radius ?? 0;
    const hdrBorder       = previewHdrBrW > 0 ? `${previewHdrBrW}px solid ${previewHdrBrC}` : 'none';
    const previewPreview = html`
      <div class="style-preview" style="font-family:${previewFont};background:${previewCardBg}">
        <div class="sp-header"
          style="background:linear-gradient(135deg,${previewHdrBg1},${previewHdrBg2});color:${previewHdrTx};border-radius:${previewHdrRad}px;padding:${Math.round(previewHdrPad*0.55)}px 12px;border-bottom:${hdrBorder};position:relative;overflow:hidden">
          <span class="sp-h-orb" style="background:radial-gradient(circle,${previewHdrOrb} 0%,transparent 70%)"></span>
          <span class="sp-h-title" style="font-size:${(previewHdrTsz*previewScale).toFixed(2)}em;position:relative;z-index:1">${sty.header_icon ?? '⚡'} ${c.title ?? 'Shelly'}</span>
          <span class="sp-h-stat" style="color:${previewHdrOnl};position:relative;z-index:1">● 12 on</span>
          <span class="sp-h-stat" style="color:${previewHdrPow};position:relative;z-index:1">42 W</span>
        </div>
        <div class="sp-tile"
          style="background:${previewTileBg};border:${previewBrW}px solid ${previewTileBr};border-radius:${previewRadius}px">
          <div class="sp-row" style="color:${previewText1};font-size:${(13*previewScale).toFixed(0)}px">
            <span class="sp-dot" style="background:${previewOnline}"></span>
            Lampi
            <span class="sp-tog" style="background:${previewAccent}">ON</span>
          </div>
          <div class="sp-row sp-chips" style="color:${previewText2};font-size:${(10*previewScale).toFixed(0)}px">
            <span class="sp-chip" style="background:${previewSensBg}">4.1 W</span>
            <span class="sp-chip" style="background:${previewSensBg}">235 V</span>
            <span class="sp-chip" style="background:${previewSensBg}">44.6 °C</span>
          </div>
          <svg viewBox="0 0 200 22" preserveAspectRatio="none" style="width:100%;height:22px;display:block">
            <polygon points="0,18 25,14 50,16 75,9 100,11 125,5 150,7 175,3 200,1 200,22 0,22"
              fill="${previewAccent}" fill-opacity="0.15"/>
            <polyline points="0,18 25,14 50,16 75,9 100,11 125,5 150,7 175,3 200,1"
              fill="none" stroke="${previewAccent}" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="sp-tile"
          style="background:${previewTileHov};border:${previewBrW}px solid ${previewTileBr};border-radius:${previewRadius}px">
          <div class="sp-row" style="color:${previewText1};font-size:${(13*previewScale).toFixed(0)}px">
            <span class="sp-dot" style="background:${previewOffline}"></span>
            <span style="color:${previewMuted}">Offline tile (hover state)</span>
          </div>
        </div>
        <div class="sp-hint" style="color:${previewMuted}">Live preview — reflects current colour, typography, and tile settings</div>
      </div>`;

    return html`
      ${this._adv(html`
      <div class="style-toolbar">
        <button class="btn-copy ${this._copyAreaOpen ? 'active' : ''}" @click=${() => { this._copyStyle(); }}>⧉ Copy style</button>
        <button class="btn-copy ${this._pasteOpen ? 'active' : ''}" @click=${() => { this._pasteOpen = !this._pasteOpen; this._copyAreaOpen = false; }}>⬇ Paste style</button>
        ${this._styleClipFeedback ? html`<span class="clip-feedback">${this._styleClipFeedback}</span>` : nothing}
      </div>
      ${this._copyAreaOpen ? html`
        <div class="paste-area">
          <div style="font-size:10px;color:var(--t2);margin-bottom:2px">Select all and copy (Ctrl+A, Ctrl+C), then paste into another card's Paste style box</div>
          <textarea class="paste-ta" rows="3" readonly
            .value=${this._copyJson}
            @focus=${(e: Event) => { (e.target as HTMLTextAreaElement).select(); }}></textarea>
        </div>` : nothing}
      ${this._pasteOpen ? html`
        <div class="paste-area">
          <div style="font-size:10px;color:var(--t2);margin-bottom:2px">Paste style JSON, then click Apply</div>
          <textarea class="paste-ta" rows="3" placeholder="Paste style JSON here…"
            .value=${this._pasteText}
            @input=${(e: Event) => { this._pasteText = (e.target as HTMLTextAreaElement).value; }}></textarea>
          <button class="btn-copy" @click=${() => this._applyPastedStyle()}>Apply</button>
        </div>` : nothing}
      `)}
      ${previewPreview}
      ${this._renderTabSections('card-theme', this._globalSectionDescriptors())}
      ${this._renderRoomStyleSection()}`;
  }

  /** Relocated per-room styling (Redesign Phase 3c) — a room picker + the existing
   *  room-style panel, now living under Card & Theme instead of Rooms & devices. */
  private _renderRoomStyleSection(): TemplateResult {
    const areas = this._getAreas().map(a => a.name);
    const room = this._cardThemeRoom;
    const body = html`
      <div class="field" style="margin-bottom:8px">
        <div class="field-lbl">Room</div>
        <select class="inline-text" style="width:100%"
          @change=${(e: Event) => { this._cardThemeRoom = (e.target as HTMLSelectElement).value; }}>
          <option value="">— select a room —</option>
          <option value="Favourites" ?selected=${room === 'Favourites'}>★ Favourites</option>
          ${areas.map(a => html`<option value=${a} ?selected=${a === room}>${a}</option>`)}
        </select>
      </div>
      ${room ? this._renderRoomStylePanel(room) : html`<div class="hint" style="margin:8px 2px">Pick a room to style its header, columns and tile look.</div>`}`;
    return this._sec('room-style', '⌂', 'rgba(74,222,128,0.1)', '#4ade80', 'Per-room styling', nothing, body);
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
        <label class="sw"><input type="checkbox" .checked=${c.show_graphs !== false}
          @change=${(e:Event)=>this._set('show_graphs', (e.target as HTMLInputElement).checked ? undefined : false)}>
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
  //  MAIN RENDER
  // ══════════════════════════════════════════════════════════════

  /** Apply a colour-theme preset — merges its palette over the current style.
   *  Colours only; radius/font/sizes are left untouched. The active theme is
   *  derived from the colours (detectTheme), so no separate flag is stored. */
  private _applyTheme(name: Exclude<ThemePreset, 'custom'>) {
    this._set('style', applyThemePalette(this._config.style, name));
  }

  /** Pick a theme — warn first if the current colours are custom (would be lost).
   *  Switching between presets is lossless, so it applies immediately. */
  private _onPickTheme(name: Exclude<ThemePreset, 'custom'>) {
    const sty = this._config.style ?? {};
    const hasColours = THEME_KEYS.some(k => sty[k] !== undefined);
    if (hasColours && detectTheme(sty) === 'custom') this._pendingTheme = name;
    else this._applyTheme(name);
  }

  /** Restore the saved custom palette over the current style. */
  private _applySaved() {
    if (this._savedTheme) this._set('style', { ...(this._config.style ?? {}), ...this._savedTheme });
  }

  /** Config keys that describe *content* (what's shown), preserved by "Reset look". */
  private static readonly _CONTENT_KEYS = [
    'type', 'title', 'mode', 'universal_scope', 'include_integrations', 'exclude_integrations',
    'include_domains', 'exclude_domains', 'areas', 'name_groups', 'hidden_devices', 'favorites',
    'hidden_entities', 'show_offline', 'views', 'default_view', 'delegate_controls',
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

  /** "Defaults" quick-setup panel: the four global defaults in one place. */
  private _renderDefaultsPanel(): TemplateResult {
    const c = this._config;
    const sty = c.style ?? {};
    const views = c.views ?? [];
    const activeTheme = detectTheme(sty);
    const savedActive = !!this._savedTheme && Object.entries(this._savedTheme).every(([k, v]) => (sty as Record<string, unknown>)[k] === v);
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
            <div class="dp-title">Colour theme</div>
            <div class="theme-grid">
              ${this._savedTheme ? html`
                <button class="theme-swatch saved ${savedActive ? 'on' : ''}" title="Your saved colours — click to restore"
                  @click=${() => this._applySaved()}>
                  <span class="ts-preview" style="background:${this._savedTheme.card_bg ?? '#1e1a17'}">
                    <span class="ts-tile" style="background:${this._savedTheme.tile_bg ?? 'rgba(255,255,255,.04)'};border:1px solid ${this._savedTheme.tile_border ?? 'rgba(255,255,255,.08)'}"></span>
                    <span class="ts-accent" style="background:${this._savedTheme.accent_color ?? '#c98a63'}"></span>
                  </span>
                  <span class="ts-name">★ Saved</span>
                </button>` : nothing}
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
            ${this._pendingTheme ? html`
              <div class="theme-warn">
                <div class="tw-msg">Replace your current custom colours with <b>${THEME_LABELS[this._pendingTheme]}</b>?</div>
                <div class="tw-btns">
                  <button class="tw-save" @click=${() => { this._saveCurrentTheme(); if (this._pendingTheme) this._applyTheme(this._pendingTheme); this._pendingTheme = null; }}>💾 Save current &amp; apply</button>
                  <button class="tw-apply" @click=${() => { if (this._pendingTheme) this._applyTheme(this._pendingTheme); this._pendingTheme = null; }}>Apply anyway</button>
                  <button class="tw-cancel" @click=${() => { this._pendingTheme = null; }}>Cancel</button>
                </div>
              </div>`
              : (activeTheme === 'custom' ? html`<div class="hint">Custom — your colours don't match a preset.${this._savedTheme ? '' : ' Applying one will offer to save these first.'}</div>` : nothing)}
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
            )}
          </div>

          <div class="dp-group">
            <div class="dp-title" style="display:flex;align-items:center;justify-content:space-between">
              <span>Smart tile styles</span>
              <label class="sw"><input type="checkbox" .checked=${c.smart_tile_styles === true}
                @change=${(e:Event)=>this._set('smart_tile_styles',(e.target as HTMLInputElement).checked || undefined)}>
                <span class="sw-t"></span><span class="sw-b"></span></label>
            </div>
            <div class="dp-hint-inline">Auto-pick a layout per device type where you haven't set one — relay→power monitor, light→colour wheel, sensor→card.</div>
          </div>

          <div class="dp-group">
            <div class="dp-title" style="display:flex;align-items:center;justify-content:space-between">
              <span>Native controls</span>
              <label class="sw"><input type="checkbox" .checked=${c.delegate_controls === true}
                @change=${(e:Event)=>this._set('delegate_controls',(e.target as HTMLInputElement).checked || undefined)}>
                <span class="sw-t"></span><span class="sw-b"></span></label>
            </div>
            <div class="dp-hint-inline">Show controls for media players, fans, vacuums, locks and other devices this card doesn't draw itself, using Home Assistant's own tiles. Off by default — each one embeds a native element, so it costs a little render time on big media fleets.</div>
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
              @click=${() => { this._tab = 'card-theme'; this._defaultsOpen = false; }}>More tile settings →</button>
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
    allTabSectionKeys['devices'] = ['rooms'];
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
    const showSectionToggle = curKeys.length > 1;
    return html`
      <div class="shell">
        <div class="tab-nav">
          ${tabs.map(t => html`
            <div class="tab ${this._tab===t.id?'active':''}" @click=${()=>{this._tab=t.id;}}>
              <span class="tab-icon">${t.icon}</span>${t.label}
            </div>`)}
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
          <span class="sec-toolbar-spacer"></span>
          ${showSectionToggle ? html`
            <button class="sec-toolbar-btn" title="Expand all sections" @click=${() => setAllSections(true)}>▾ Expand all</button>
            <button class="sec-toolbar-btn" title="Collapse all sections" @click=${() => setAllSections(false)}>▸ Collapse all</button>
          ` : nothing}
        </div>
        ${this._defaultsOpen ? this._renderDefaultsPanel() : nothing}
        <div class="tab-body">
          ${(() => {
            // Tab bodies resolve by id; unknown ids (custom tabs from the designer)
            // render their assigned global sections.
            const bodyFor: Record<string, () => TemplateResult> = {
              devices: () => this._renderDevicesTab(),
              'device-styling': () => this._renderDeviceStylingTab(),
              views:   () => this._renderViewsTab(),
              'card-theme': () => this._renderStyleTab(),
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
    .tab-nav { display:flex; gap:2px; padding:10px 16px 0; border-bottom:1px solid var(--border); background:var(--s1); overflow-x:auto; flex-shrink:0; }
    .tab-nav::-webkit-scrollbar { height:0; }
    .tab { font-size:11px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; padding:8px 14px; color:var(--t3); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .15s; border-radius:5px 5px 0 0; user-select:none; display:flex; align-items:center; }
    .tab:hover { color:var(--t2); }
    .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
    .tab-icon { margin-right:5px; font-size:10px; opacity:0.7; }
    .sec-toolbar { display:flex; align-items:center; gap:6px; padding:8px 16px 0; background:var(--s1); flex-shrink:0; }
    .sec-toolbar-spacer { flex:1; }
    .adv-toggle { display:inline-flex; align-items:center; gap:7px; cursor:pointer; user-select:none; }
    .adv-lbl { font-size:11px; font-weight:600; letter-spacing:.02em; color:var(--t2); }
    .adv-toggle:hover .adv-lbl { color:var(--text); }
    .defaults-btn.active { background:var(--accentbg); color:var(--accent); border-color:var(--accentbdr); }
    /* Defaults quick-setup panel */
    .defaults-panel { padding:12px 16px; background:var(--s1); border-bottom:1px solid var(--border); flex-shrink:0; max-height:52vh; overflow-y:auto; }
    .dp-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px; }
    .dp-group { display:flex; flex-direction:column; gap:8px; background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:10px; }
    .dp-title { font-size:11px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; color:var(--t2); display:flex; align-items:center; gap:8px; }
    .dp-hint-inline { font-size:10px; font-weight:400; text-transform:none; letter-spacing:0; color:var(--t3); }
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
    .theme-warn { margin-top:8px; padding:9px 11px; border:1px solid var(--accentbdr); background:var(--accentbg); border-radius:8px; }
    .tw-msg { font-size:11px; color:var(--text); margin-bottom:7px; }
    .tw-btns { display:flex; flex-wrap:wrap; gap:6px; }
    .tw-btns button { font-size:10px; padding:5px 9px; border-radius:5px; cursor:pointer; border:1px solid var(--border2); background:transparent; color:var(--t2); transition:all .15s; }
    .tw-save { border-color:var(--accentbdr) !important; color:var(--accent) !important; font-weight:600; }
    .tw-save:hover { background:var(--accentbg); }
    .tw-apply:hover, .tw-cancel:hover { color:var(--text); border-color:var(--accent); }
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
    .xc-yaml { width:100%; min-height:120px; font-family:monospace; font-size:12px; background:var(--s2); color:var(--t2); border:1px solid var(--border); border-radius:6px; padding:8px; resize:vertical; }
    ha-yaml-editor { display:block; margin-top:4px; }
    .tab-body { padding:16px; background:var(--bg); overflow-y:auto; flex:1; min-height:0; }
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
    .field-lbl { font-size:11px; font-weight:600; letter-spacing:0.04em; color:var(--t2); text-transform:uppercase; margin-bottom:7px; }
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
    .hint { font-size:11px; color:var(--t3); font-style:italic; }
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
    .rsp-section-lbl { font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); margin:8px 0 4px; padding-bottom:4px; border-bottom:1px solid var(--border); }
    .rsp-section-lbl:first-child { margin-top:0; }
    .fav-btn { background:none; border:none; cursor:pointer; font-size:13px; color:var(--t3); padding:0 2px; line-height:1; transition:color .15s,transform .15s; flex-shrink:0; }
    .fav-btn:hover { color:var(--amber); transform:scale(1.2); }
    .fav-btn.on { color:var(--amber); }
    .dev-style-hint { font-size:9px; color:var(--t3); font-weight:400; letter-spacing:.04em; text-transform:none; }

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
    .tp-name-row { justify-content:space-between; }
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
    .style-toolbar { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
    .btn-copy.active { background:var(--s3); color:var(--text); }
    .clip-feedback { font-size:11px; color:var(--t2); animation:fadeout 1.5s forwards; }
    @keyframes fadeout { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
    .paste-area { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
    .paste-ta { font-size:11px; font-family:monospace; background:var(--s2); border:1px solid var(--border); border-radius:6px; color:var(--text); padding:8px; resize:vertical; width:100%; box-sizing:border-box; }

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
    .view-card-chev { font-size:10px; color:var(--t3); }
    .view-card-body { padding:10px 14px 14px; border-top:1px solid var(--border); background:var(--s1); }
    .view-dev-list { max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; padding:6px; background:var(--s2); border:1px solid var(--border); border-radius:6px; }
    .view-dev-row { display:flex; align-items:center; gap:8px; padding:4px 6px; border-radius:4px; cursor:pointer; font-size:12px; }
    .view-dev-row:hover { background:var(--s3); }
    .view-dev-name { flex:1; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .view-dev-area { font-size:10px; color:var(--t3); }

    /* ── Live style preview (Style tab top) ── */
    .style-preview { margin:0 0 14px; padding:10px; background:var(--s2); border:1px solid var(--border); border-radius:10px; display:flex; flex-direction:column; gap:8px; }
    .sp-header { display:flex; align-items:center; gap:10px; border-radius:6px; }
    .sp-h-orb { position:absolute; width:60px; height:60px; left:-10px; top:-20px; border-radius:50%; opacity:.6; filter:blur(8px); pointer-events:none; }
    .sp-h-title { font-weight:600; flex:1; }
    .sp-h-stat { font-size:11px; font-weight:600; }
    .sp-tile { padding:8px 10px; display:flex; flex-direction:column; gap:6px; }
    .sp-row { display:flex; align-items:center; gap:6px; }
    .sp-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .sp-tog { margin-left:auto; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; color:#fff; }
    .sp-chips { gap:5px; flex-wrap:wrap; }
    .sp-chip { background:rgba(255,255,255,0.06); padding:2px 7px; border-radius:8px; }
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
