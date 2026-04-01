import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import {
  HADeviceDashboardConfig, AreaStyle, TileBlockId,
  ButtonShape, ButtonVariant, ButtonSize, GraphType,
  ThemePreset,
} from './types';
import {
  getAllDevices, getVirtualDevices,
  GRAPH_SENSOR_DEFS,
} from './helpers';

// ─── Tab IDs ──────────────────────────────────────────────────────────────────

type TabId = 'devices' | 'layout' | 'style' | 'graphs' | 'sensors' | 'yaml';

// ─── Theme preset token maps ───────────────────────────────────────────────────

const THEME_TOKENS: Record<ThemePreset, Partial<NonNullable<HADeviceDashboardConfig['style']>>> = {
  dark_industrial: {
    accent_color: '#f4601e', header_bg: '#1a1a2e', header_bg2: '#0f3460',
    tile_bg: 'rgba(255,255,255,0.04)', tile_border: 'rgba(255,255,255,0.07)',
    text_primary: '#e5e7eb', online_color: '#4ade80', power_color: '#fb923c',
  },
  teal_terminal: {
    accent_color: '#2dd4bf', header_bg: '#0d1f1f', header_bg2: '#0a1515',
    tile_bg: 'rgba(0,180,160,0.05)', tile_border: 'rgba(0,180,160,0.15)',
    text_primary: '#c0d0cf', online_color: '#00e676', power_color: '#2dd4bf',
  },
  brutalist: {
    accent_color: '#ff4500', header_bg: '#111', header_bg2: '#111',
    tile_bg: '#f5f0e8', tile_border: '#111',
    text_primary: '#111', online_color: '#00cc44', power_color: '#ff4500',
  },
  frosted_light: {
    accent_color: '#ff5722', header_bg: 'rgba(255,255,255,0.4)', header_bg2: 'rgba(255,255,255,0.2)',
    tile_bg: 'rgba(255,255,255,0.65)', tile_border: 'rgba(255,255,255,0.8)',
    text_primary: '#212121', online_color: '#4caf50', power_color: '#ff5722',
  },
  nordic_warm: {
    accent_color: '#c0631a', header_bg: '#fffdf9', header_bg2: '#f5ede4',
    tile_bg: '#fffdf9', tile_border: '#ede5d8',
    text_primary: '#2c2118', online_color: '#5daa6d', power_color: '#c0631a',
  },
  midnight_purple: {
    accent_color: '#a78bfa', header_bg: '#0a0a0a', header_bg2: '#1a1a2e',
    tile_bg: 'rgba(167,139,250,0.05)', tile_border: 'rgba(167,139,250,0.15)',
    text_primary: '#e2e8f0', online_color: '#4ade80', power_color: '#c084fc',
  },
  custom: {},
};

const PRESET_LABELS: Record<ThemePreset, string> = {
  dark_industrial: 'Dark Industrial',
  teal_terminal:   'Teal Terminal',
  brutalist:       'Brutalist',
  frosted_light:   'Frosted Light',
  nordic_warm:     'Nordic Warm',
  midnight_purple: 'Midnight Purple',
  custom:          'Custom',
};

// ─── Sensor groups ─────────────────────────────────────────────────────────────

const SENSOR_GROUPS: Array<{
  group: string;
  items: Array<{ key: string; label: string }>;
}> = [
  {
    group: 'Electrical',
    items: [
      { key: 'power',          label: 'Power' },
      { key: 'apparent_power', label: 'App. Power' },
      { key: 'reactive_power', label: 'React. Power' },
      { key: 'power_factor',   label: 'Pwr Factor' },
      { key: 'frequency',      label: 'Frequency' },
      { key: 'energy',         label: 'Energy' },
      { key: 'voltage',        label: 'Voltage' },
      { key: 'current',        label: 'Current' },
    ],
  },
  {
    group: 'Environmental',
    items: [
      { key: 'temperature',    label: 'Temperature' },
      { key: 'humidity',       label: 'Humidity' },
      { key: 'illuminance',    label: 'Light' },
      { key: 'co2',            label: 'CO₂' },
      { key: 'gas',            label: 'Gas' },
    ],
  },
  {
    group: 'Device',
    items: [
      { key: 'battery',        label: 'Battery' },
      { key: 'rssi',           label: 'Wi-Fi RSSI' },
      { key: 'uptime',         label: 'Uptime' },
      { key: 'ip',             label: 'IP Address' },
      { key: 'ssid',           label: 'SSID' },
      { key: 'fw_version',     label: 'Firmware' },
      { key: 'mac',            label: 'MAC' },
      { key: 'cloud',          label: 'Cloud' },
      { key: 'mqtt',           label: 'MQTT' },
      { key: 'eth',            label: 'Ethernet' },
    ],
  },
  {
    group: 'Alerts',
    items: [
      { key: 'motion',         label: 'Motion' },
      { key: 'door',           label: 'Door/Window' },
      { key: 'flood',          label: 'Flood' },
      { key: 'smoke',          label: 'Smoke' },
      { key: 'vibration',      label: 'Vibration' },
      { key: 'overpower',      label: 'Overpower' },
      { key: 'overtemp',       label: 'Overtemp' },
    ],
  },
];

// ─── Tile block definitions ────────────────────────────────────────────────────

const BLOCK_DEFS: Array<{ id: TileBlockId; label: string; sub: string }> = [
  { id: 'name_row',       label: 'Name row',           sub: 'Device name · status dot · primary control' },
  { id: 'sensors',        label: 'Sensor chips',        sub: 'Power, temp, voltage, RSSI…' },
  { id: 'graph',          label: 'Sparkline graph',     sub: 'History sparklines per selected sensor' },
  { id: 'dimmer',         label: 'Dimmer / color',      sub: 'Brightness slider + colour picker for lights' },
  { id: 'cover_controls', label: 'Cover controls',      sub: 'Open · Stop · Close + position bar' },
  { id: 'trv_control',    label: 'Thermostat',          sub: 'Temperature display + ± buttons + slider' },
  { id: 'media_controls', label: 'Media controls',      sub: 'Play/pause/stop · volume · source' },
  { id: 'fan_controls',   label: 'Fan controls',        sub: 'Speed, oscillation, direction' },
  { id: 'valve_controls', label: 'Valve controls',      sub: 'Open · Stop · Close + position bar' },
  { id: 'input_channels', label: 'Input channels',      sub: 'Binary input chips (i3/i4/button modules)' },
  { id: 'power_bar',      label: 'Power bar',           sub: 'Mini usage bar at tile bottom' },
  { id: 'badges',         label: 'Type & gen badges',   sub: 'Dimmer · G3 · Relay labels + UI link' },
];

const DEFAULT_BLOCK_ORDER: TileBlockId[] = [
  'name_row', 'sensors', 'graph', 'dimmer', 'cover_controls',
  'trv_control', 'media_controls', 'fan_controls', 'valve_controls',
  'input_channels', 'power_bar', 'badges',
];

// ─── Known integrations ────────────────────────────────────────────────────────

const KNOWN_INTEGRATIONS: Array<{ key: string; label: string; color: string }> = [
  { key: 'shelly',   label: 'Shelly',    color: '#f4601e' },
  { key: 'zha',      label: 'ZHA',       color: '#4a9eff' },
  { key: 'mqtt',     label: 'MQTT',      color: '#fbbf24' },
  { key: 'hue',      label: 'Hue',       color: '#fde047' },
  { key: 'deconz',   label: 'deCONZ',    color: '#818cf8' },
  { key: 'esphome',  label: 'ESPHome',   color: '#4ade80' },
  { key: 'matter',   label: 'Matter',    color: '#2dd4bf' },
  { key: 'tuya',     label: 'Tuya',      color: '#f472b6' },
  { key: 'tasmota',  label: 'Tasmota',   color: '#fb923c' },
  { key: 'wled',     label: 'WLED',      color: '#c084fc' },
  { key: 'tplink',   label: 'Kasa',      color: '#34d399' },
  { key: 'sonos',    label: 'Sonos',     color: '#7dd3fc' },
];

// ─── Editor component ──────────────────────────────────────────────────────────

@customElement('ha-device-dashboard-editor')
export class HADeviceDashboardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: HADeviceDashboardConfig;
  @state() private _tab: TabId = 'devices';
  @state() private _openSections = new Set<string>(['integrations', 'rooms', 'sort']);
  @state() private _expandedRooms = new Set<string>();
  @state() private _areaStyleTab: Record<string, string> = {};
  @state() private _editingArea: string | null = null;
  @state() private _dragSrc: TileBlockId | null = null;
  @state() private _deviceSearch = '';

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  setConfig(config: HADeviceDashboardConfig) {
    this._config = config;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _val<K extends keyof HADeviceDashboardConfig>(
    key: K
  ): HADeviceDashboardConfig[K] {
    return this._config[key];
  }

  private _set(key: string, value: unknown) {
    if (!this._config) return;
    const updated: Record<string, unknown> = { ...this._config, [key]: value };
    // Remove if empty / undefined
    const keepEmpty = ['areas', 'integrations', 'graph_sensors', 'sensors',
                       'tile_layout', 'entity_domains'].includes(key);
    if (!keepEmpty &&
        (value === undefined || value === '' ||
         (Array.isArray(value) && (value as unknown[]).length === 0))) {
      delete updated[key];
    }
    fireEvent(this, 'config-changed', { config: updated });
  }

  private _setStyle(key: string, value: unknown) {
    const current = { ...(this._config.style ?? {}) };
    if (value === undefined || value === '') {
      delete (current as Record<string, unknown>)[key];
    } else {
      (current as Record<string, unknown>)[key] = value;
    }
    this._set('style', Object.keys(current).length ? current : undefined);
  }

  private _setAreaStyle(area: string, key: keyof AreaStyle, value: unknown) {
    const all = { ...(this._config.area_styles ?? {}) };
    const current: AreaStyle = { ...(all[area] ?? {}) };
    if (value === undefined || value === '' || value === 0) {
      delete current[key];
    } else {
      (current as Record<string, unknown>)[key] = value;
    }
    if (Object.keys(current).length > 0) all[area] = current;
    else delete all[area];
    this._set('area_styles', Object.keys(all).length ? all : undefined);
  }

  private _clearAreaStyle(area: string) {
    const all = { ...(this._config.area_styles ?? {}) };
    delete all[area];
    this._set('area_styles', Object.keys(all).length ? all : undefined);
  }

  private _setGraphStyle(key: string, value: unknown) {
    const current = { ...(this._config.graph_style ?? {}) };
    if (value === undefined) delete (current as Record<string, unknown>)[key];
    else (current as Record<string, unknown>)[key] = value;
    this._set('graph_style', Object.keys(current).length ? current : undefined);
  }

  private _getAreas(): Array<{ id: string; name: string }> {
    if (!this.hass) return [];
    return Object.values((this.hass as any).areas ?? {})
      .map((a: any) => ({ id: a.area_id, name: a.name as string }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private _getDiscoveredDevices() {
    if (!this.hass) return [];
    return getAllDevices(this.hass, this._config.integrations);
  }

  private _getAllHADevices() {
    if (!this.hass) return getAllDevices(this.hass);
    return getAllDevices(this.hass);
  }

  private _toggleSection(id: string) {
    const next = new Set(this._openSections);
    if (next.has(id)) next.delete(id); else next.add(id);
    this._openSections = next;
  }

  private _toggleIntegration(key: string) {
    const current = [...(this._config.integrations ?? [])];
    const idx = current.indexOf(key);
    if (idx >= 0) current.splice(idx, 1); else current.push(key);
    this._set('integrations', current);
  }

  private _toggleArea(name: string) {
    const current = [...(this._config.areas ?? [])];
    const idx = current.indexOf(name);
    if (idx >= 0) current.splice(idx, 1); else current.push(name);
    this._set('areas', current);
  }

  private _toggleSensor(key: string) {
    const current = [...(this._config.sensors ?? [])];
    const idx = current.indexOf(key);
    if (idx >= 0) current.splice(idx, 1); else current.push(key);
    this._set('sensors', current);
  }

  private _toggleGraphSensor(key: string) {
    const current = [...(this._config.graph_sensors ?? [])];
    const idx = current.indexOf(key);
    if (idx >= 0) current.splice(idx, 1); else current.push(key);
    this._set('graph_sensors', current);
  }

  private _toggleGroupSensors(group: string, target: 'sensors' | 'graph_sensors') {
    const groupItems = SENSOR_GROUPS.find(g => g.group === group)?.items ?? [];
    const keys = groupItems.map(i => i.key);
    const current = [...(this._config[target] ?? [])];
    const allOn = keys.every(k => current.includes(k));
    const next = allOn
      ? current.filter(k => !keys.includes(k))
      : [...new Set([...current, ...keys])];
    this._set(target, next);
  }

  // Block order helpers
  private _getBlockOrder(): TileBlockId[] {
    return this._config.tile_layout ?? DEFAULT_BLOCK_ORDER;
  }

  private _moveBlock(from: number, to: number) {
    const order = [...this._getBlockOrder()];
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    this._set('tile_layout', order);
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  private _section(
    id: string,
    title: string,
    iconContent: string,
    iconStyle: string,
    content: TemplateResult,
    badge?: string,
    badgeStyle?: string
  ): TemplateResult {
    const open = this._openSections.has(id);
    return html`
      <div class="sec ${open ? 'open' : ''}">
        <div class="sec-hdr" @click=${() => this._toggleSection(id)}>
          <div class="sec-hdr-l">
            <div class="sec-ico" style=${iconStyle}>${iconContent}</div>
            <span class="sec-title">${title}</span>
          </div>
          <div class="sec-hdr-r">
            ${badge ? html`<span class="sec-badge" style=${badgeStyle ?? ''}>${badge}</span>` : nothing}
            <span class="chev">▼</span>
          </div>
        </div>
        ${open ? html`<div class="sec-body">${content}</div>` : nothing}
      </div>
    `;
  }

  private _togRow(
    label: string,
    sub: string | undefined,
    key: string,
    defaultVal = false
  ): TemplateResult {
    const checked = (this._config[key] ?? defaultVal) as boolean;
    return html`
      <div class="tog-row">
        <div>
          <div class="tog-lbl">${label}</div>
          ${sub ? html`<div class="tog-sub">${sub}</div>` : nothing}
        </div>
        <label class="sw">
          <input type="checkbox" .checked=${checked}
            @change=${(e: Event) => this._set(key as string, (e.target as HTMLInputElement).checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span>
        </label>
      </div>
    `;
  }

  private _pills(
    options: Array<{ value: string; label: string }>,
    current: string,
    onChange: (v: string) => void
  ): TemplateResult {
    return html`
      <div class="pill-grp">
        ${options.map(o => html`
          <span class="pill ${current === o.value ? 'on' : ''}"
            @click=${() => onChange(o.value)}>${o.label}</span>
        `)}
      </div>
    `;
  }

  private _colorRow(
    label: string,
    value: string | undefined,
    defaultVal: string,
    onChange: (v: string) => void,
    onReset: () => void
  ): TemplateResult {
    const current = value ?? defaultVal;
    return html`
      <div class="col-row">
        <div class="col-swatch-wrap">
          <div class="col-dot" style="background:${current}"></div>
          <input type="color" .value=${current} @change=${(e: Event) =>
            onChange((e.target as HTMLInputElement).value)}>
        </div>
        <span class="col-name">${label}</span>
        <span class="col-hex">${current}</span>
        ${value ? html`<button class="col-reset" @click=${onReset}>↺</button>` : nothing}
      </div>
    `;
  }

  private _sliderRow(
    label: string,
    value: number,
    min: number, max: number, step: number,
    unit: string,
    onChange: (v: number) => void
  ): TemplateResult {
    return html`
      <div class="sl-row">
        <div class="sl-label">${label} — <span class="sl-accent">${value}${unit}</span></div>
        <input type="range" .min=${String(min)} .max=${String(max)} .step=${String(step)}
          .value=${String(value)}
          @input=${(e: Event) => onChange(parseFloat((e.target as HTMLInputElement).value))}>
      </div>
    `;
  }

  // ── Tab: Devices ───────────────────────────────────────────────────────────

  private _renderDevicesTab(): TemplateResult {
    const cfg = this._config;
    const activeIntegrations = cfg.integrations ?? [];
    const selectedAreas = cfg.areas ?? [];
    const allAreas = this._getAreas();

    // ── Integrations section
    const intContent = html`
      ${KNOWN_INTEGRATIONS.map(int => html`
        <div class="int-row">
          <span class="int-badge" style="background:${int.color}22;color:${int.color};border:1px solid ${int.color}44">
            ${int.label.toUpperCase().slice(0,6)}
          </span>
          <span class="int-name">${int.label}</span>
          <label class="sw">
            <input type="checkbox"
              .checked=${activeIntegrations.length === 0 || activeIntegrations.includes(int.key)}
              @change=${(e: Event) => this._toggleIntegration(int.key)}>
            <span class="sw-track"></span><span class="sw-thumb"></span>
          </label>
        </div>
      `)}
      <div class="divider"></div>
      ${this._togRow('Include virtual entities', 'Scripts, scenes, automations, helpers', 'include_entities')}
    `;

    // ── Rooms section
    const roomContent = html`
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input type="text" placeholder="Filter rooms…" .value=${this._deviceSearch}
          @input=${(e: Event) => { this._deviceSearch = (e.target as HTMLInputElement).value; }}>
      </div>
      ${allAreas
        .filter(a => !this._deviceSearch || a.name.toLowerCase().includes(this._deviceSearch.toLowerCase()))
        .map(area => {
          const included = selectedAreas.length === 0 || selectedAreas.includes(area.name);
          const hasStyle = !!(cfg.area_styles?.[area.name]);
          return html`
            <div class="room-row">
              <div class="room-dot" style="background:${included ? '#4ade80' : 'var(--text3)'}"></div>
              <span class="room-name">${area.name}</span>
              ${hasStyle ? html`<span class="room-styled-badge">styled</span>` : nothing}
              <label class="sw">
                <input type="checkbox" .checked=${included}
                  @change=${() => this._toggleArea(area.name)}>
                <span class="sw-track"></span><span class="sw-thumb"></span>
              </label>
              <button class="room-style-btn"
                @click=${() => {
                  this._editingArea = this._editingArea === area.name ? null : area.name;
                  this._tab = 'style';
                }}>Style ›</button>
            </div>
          `;
        })}
    `;

    // ── Sort & View section
    const sortContent = html`
      <div class="field">
        <div class="field-lbl">Sort devices by</div>
        ${this._pills(
          [{ value: 'name', label: 'Name' }, { value: 'power', label: 'Power' },
           { value: 'online', label: 'Online first' }, { value: 'area', label: 'Area' }],
          cfg.sort_by ?? 'name',
          v => this._set('sort_by', v)
        )}
      </div>
      <div class="field">
        <div class="field-lbl">View mode</div>
        ${this._pills(
          [{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }, { value: 'compact', label: 'Compact' }],
          cfg.view_mode ?? 'grid',
          v => this._set('view_mode', v)
        )}
      </div>
      ${this._togRow('Show offline devices', undefined, 'show_offline', true)}
      ${this._togRow('Tile click: expand → toggle', 'ON = click tile toggles device, OFF = click expands', 'tile_click' as any, false)}
    `;

    return html`
      ${this._section('integrations', 'Integrations', '⬡',
        'background:rgba(74,158,255,0.1);color:#4a9eff',
        intContent,
        activeIntegrations.length ? `${activeIntegrations.length} active` : 'All',
        'background:rgba(74,158,255,0.1);color:#4a9eff'
      )}
      ${this._section('rooms', 'Rooms', '⌂',
        'background:rgba(74,222,128,0.1);color:#4ade80',
        roomContent,
        selectedAreas.length ? `${selectedAreas.length}/${allAreas.length}` : 'All',
        'background:rgba(74,222,128,0.1);color:#4ade80'
      )}
      ${this._section('sort', 'Sort & View', '⊞',
        'background:rgba(167,139,250,0.1);color:#a78bfa',
        sortContent
      )}
    `;
  }

  // ── Tab: Layout ────────────────────────────────────────────────────────────

  private _renderLayoutTab(): TemplateResult {
    const cfg = this._config;
    const blockOrder = this._getBlockOrder();

    const gridContent = html`
      <div class="field">
        <div class="field-lbl">Columns</div>
        <div class="step-row">
          <button class="step-btn" @click=${() => {
            const v = Math.max(1, (cfg.columns ?? 3) - 1);
            this._set('columns', v);
          }}>−</button>
          <span class="step-val">${cfg.columns ?? 3}</span>
          <button class="step-btn" @click=${() => {
            const v = Math.min(6, (cfg.columns ?? 3) + 1);
            this._set('columns', v);
          }}>+</button>
        </div>
        <div class="field-hint">Overridden per-room in the Style tab</div>
      </div>
      <div class="field">
        <div class="field-lbl">Tile size</div>
        ${this._pills(
          [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }],
          cfg.tile_size ?? 'md',
          v => this._set('tile_size', v)
        )}
      </div>
      ${this._sliderRow('Tile gap', cfg.style?.tile_gap ?? 10, 4, 24, 2, 'px',
        v => this._setStyle('tile_gap', v))}
    `;

    const blockContent = html`
      <div class="preview-label">Drag to reorder · click eye to hide</div>
      <div class="drag-list" id="drag-list">
        ${blockOrder.map((blockId, idx) => {
          const def = BLOCK_DEFS.find(b => b.id === blockId);
          if (!def) return nothing;
          return html`
            <div class="drag-item"
              draggable="true"
              data-idx=${idx}
              @dragstart=${(e: DragEvent) => {
                this._dragSrc = blockId;
                (e.dataTransfer as DataTransfer).effectAllowed = 'move';
              }}
              @dragover=${(e: DragEvent) => {
                e.preventDefault();
                (e.dataTransfer as DataTransfer).dropEffect = 'move';
              }}
              @drop=${(e: DragEvent) => {
                e.stopPropagation();
                if (this._dragSrc && this._dragSrc !== blockId) {
                  const from = blockOrder.indexOf(this._dragSrc);
                  const to = idx;
                  this._moveBlock(from, to);
                }
                this._dragSrc = null;
              }}
              @dragend=${() => { this._dragSrc = null; }}>
              <div class="drag-handle"><span></span><span></span><span></span></div>
              <div style="flex:1;min-width:0">
                <div class="drag-label">${def.label}</div>
                <div class="drag-sub">${def.sub}</div>
              </div>
            </div>
          `;
        })}
      </div>
      <button class="reset-btn" @click=${() => this._set('tile_layout', undefined)}>
        ↺ Reset to default order
      </button>
    `;

    const opacityContent = html`
      ${this._sliderRow('Card background', cfg.tile_opacity ?? 100, 0, 100, 1, '%',
        v => this._set('tile_opacity', v))}
      ${this._togRow('Show mini power bar', 'Usage bar at the bottom of each tile', 'show_power_bar')}
      ${cfg.show_power_bar ? html`
        ${this._sliderRow('Power bar max', cfg.power_bar_max ?? 2000, 100, 10000, 100, 'W',
          v => this._set('power_bar_max', v))}
      ` : nothing}
      ${this._togRow('Show entity list in expanded view', 'All Entities collapsible in expanded tile', 'show_entity_list', true)}
    `;

    return html`
      ${this._section('grid', 'Grid', '⊟',
        'background:rgba(45,212,191,0.1);color:#2dd4bf',
        gridContent)}
      ${this._section('blocks', 'Tile Block Order', '↕',
        'background:rgba(244,96,30,0.1);color:#f4601e',
        blockContent)}
      ${this._section('opacity', 'Opacity & Options', '◑',
        'background:rgba(167,139,250,0.1);color:#a78bfa',
        opacityContent)}
    `;
  }

  // ── Tab: Style ─────────────────────────────────────────────────────────────

  private _renderStyleTab(): TemplateResult {
    const cfg = this._config;
    const st = cfg.style ?? {};
    const theme = cfg.theme ?? 'dark_industrial';

    // Theme presets
    const presetContent = html`
      <div class="preset-grid">
        ${(Object.keys(THEME_TOKENS) as ThemePreset[])
          .filter(k => k !== 'custom')
          .map(k => html`
            <div class="preset-card ${theme === k ? 'active' : ''}"
              @click=${() => {
                this._set('theme', k);
                const tokens = THEME_TOKENS[k];
                const merged = { ...st, ...tokens };
                this._set('style', Object.keys(merged).length ? merged : undefined);
              }}>
              <div class="preset-preview" style="background:${THEME_TOKENS[k].header_bg ?? '#1a1a2e'}">
                <div style="height:28px;width:40%;background:${THEME_TOKENS[k].accent_color ?? '#f4601e'};border-radius:3px;margin-right:4px"></div>
                <div style="flex:1;display:flex;flex-direction:column;gap:3px">
                  <div style="height:10px;background:${THEME_TOKENS[k].tile_bg ?? 'rgba(255,255,255,0.1)'};border-radius:2px"></div>
                  <div style="height:10px;background:${THEME_TOKENS[k].tile_bg ?? 'rgba(255,255,255,0.1)'};border-radius:2px;width:70%"></div>
                </div>
              </div>
              <div class="preset-name">${PRESET_LABELS[k]}</div>
            </div>
        `)}
      </div>
    `;

    // Colors
    const colorContent = html`
      ${this._colorRow('Accent / brand', st.accent_color, '#f4601e',
        v => this._setStyle('accent_color', v),
        () => this._setStyle('accent_color', undefined))}
      ${this._colorRow('Text primary', st.text_primary, '#e5e7eb',
        v => this._setStyle('text_primary', v),
        () => this._setStyle('text_primary', undefined))}
      ${this._colorRow('Online dot', st.online_color, '#4ade80',
        v => this._setStyle('online_color', v),
        () => this._setStyle('online_color', undefined))}
      ${this._colorRow('Power reading', st.power_color, '#fb923c',
        v => this._setStyle('power_color', v),
        () => this._setStyle('power_color', undefined))}
      ${this._colorRow('Tile background', st.tile_bg, 'rgba(255,255,255,0.04)',
        v => this._setStyle('tile_bg', v),
        () => this._setStyle('tile_bg', undefined))}
      ${this._colorRow('Tile border', st.tile_border, 'rgba(255,255,255,0.07)',
        v => this._setStyle('tile_border', v),
        () => this._setStyle('tile_border', undefined))}
      <div class="col-row">
        <span class="col-name">Header background</span>
      </div>
      ${this._colorRow('Start', st.header_bg, '#1a1a2e',
        v => this._setStyle('header_bg', v),
        () => this._setStyle('header_bg', undefined))}
      ${this._colorRow('End (gradient)', st.header_bg2, '#0f3460',
        v => this._setStyle('header_bg2', v),
        () => this._setStyle('header_bg2', undefined))}
    `;

    // Typography
    const typoContent = html`
      <div class="field">
        <div class="field-lbl">Font family</div>
        ${[
          { name: 'DM Sans', sample: 'Ljós yfir vaska · 4.1 W', css: "'DM Sans', sans-serif" },
          { name: 'IBM Plex Mono', sample: 'Ljós yfir vaska · 4.1 W', css: "'IBM Plex Mono', monospace" },
          { name: 'Rajdhani', sample: 'Ljós yfir vaska · 4.1 W', css: "'Rajdhani', sans-serif" },
          { name: 'Syne', sample: 'Ljós yfir vaska · 4.1 W', css: "'Syne', sans-serif" },
        ].map(f => html`
          <div class="font-opt ${(st.font_family ?? "'DM Sans', sans-serif") === f.css ? 'active' : ''}"
            @click=${() => this._setStyle('font_family', f.css)}>
            <div class="font-name">${f.name}</div>
            <div class="font-sample" style="font-family:${f.css}">${f.sample}</div>
          </div>
        `)}
      </div>
    `;

    // Buttons
    const btnContent = html`
      <div class="btn-preview">
        <span class="preview-on" style="
          padding: ${{ sm:'3px 8px', md:'4px 12px', lg:'6px 18px' }[st.button_size ?? 'md']};
          border-radius: ${{ pill:'20px', rect:'6px', square:'8px' }[st.button_shape ?? 'pill']};
          background: ${st.button_variant === 'fill' || !st.button_variant ? (st.accent_color ?? '#f4601e') : 'transparent'};
          border: ${{fill:'none', outline:`1px solid ${st.accent_color ?? '#f4601e'}`, ghost:'none'}[st.button_variant ?? 'fill']};
          color: ${st.button_variant === 'fill' || !st.button_variant ? 'white' : (st.accent_color ?? '#f4601e')};
          font-size: ${{ sm:'10px', md:'11px', lg:'13px' }[st.button_size ?? 'md']};
          font-weight:700; letter-spacing:0.06em;">ON</span>
        <span class="preview-off" style="
          padding: ${{ sm:'3px 8px', md:'4px 12px', lg:'6px 18px' }[st.button_size ?? 'md']};
          border-radius: ${{ pill:'20px', rect:'6px', square:'8px' }[st.button_shape ?? 'pill']};
          background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.5);
          font-size: ${{ sm:'10px', md:'11px', lg:'13px' }[st.button_size ?? 'md']};
          font-weight:700; letter-spacing:0.06em;">OFF</span>
      </div>
      <div class="field">
        <div class="field-lbl">Shape</div>
        ${this._pills(
          [{ value: 'pill', label: 'Pill' }, { value: 'rect', label: 'Rect' }, { value: 'square', label: 'Square' }],
          st.button_shape ?? 'pill',
          v => this._setStyle('button_shape', v)
        )}
      </div>
      <div class="field">
        <div class="field-lbl">Variant</div>
        ${this._pills(
          [{ value: 'fill', label: 'Fill' }, { value: 'outline', label: 'Outline' }, { value: 'ghost', label: 'Ghost' }],
          st.button_variant ?? 'fill',
          v => this._setStyle('button_variant', v)
        )}
      </div>
      <div class="field">
        <div class="field-lbl">Size</div>
        ${this._pills(
          [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }],
          st.button_size ?? 'md',
          v => this._setStyle('button_size', v)
        )}
      </div>
      ${this._sliderRow('Tile corner radius', st.tile_radius ?? 12, 0, 24, 2, 'px',
        v => this._setStyle('tile_radius', v))}
    `;

    // Per-area styles
    const allAreas = this._getAreas();
    const areaContent = html`
      <div class="pill-grp" style="margin-bottom:12px">
        ${allAreas.map(area => {
          const hasStyle = !!(cfg.area_styles?.[area.name]);
          const editing = this._editingArea === area.name;
          return html`
            <span class="pill ${editing ? 'on' : ''} ${hasStyle ? 'has-style' : ''}"
              @click=${() => { this._editingArea = editing ? null : area.name; }}>
              ${area.name}${hasStyle ? ' ●' : ''}
            </span>
          `;
        })}
      </div>
      ${this._editingArea ? this._renderAreaStyleEditor(this._editingArea) : nothing}
    `;

    return html`
      ${this._section('presets', 'Theme Preset', '◈',
        'background:rgba(167,139,250,0.1);color:#a78bfa',
        presetContent)}
      ${this._section('colors', 'Colors', '◐',
        'background:rgba(244,96,30,0.1);color:#f4601e',
        colorContent)}
      ${this._section('typography', 'Typography', 'T',
        'background:rgba(251,191,36,0.1);color:#fbbf24',
        typoContent)}
      ${this._section('buttons', 'Buttons', '⬭',
        'background:rgba(74,222,128,0.1);color:#4ade80',
        btnContent)}
      ${this._section('area-styles', 'Per-Room Styles', '⌂',
        'background:rgba(45,212,191,0.1);color:#2dd4bf',
        areaContent,
        Object.keys(cfg.area_styles ?? {}).length
          ? `${Object.keys(cfg.area_styles!).length} styled`
          : undefined
      )}
    `;
  }

  private _renderAreaStyleEditor(area: string): TemplateResult {
    const cfg = this._config;
    const st: AreaStyle = cfg.area_styles?.[area] ?? {};
    const tab = this._areaStyleTab[area] ?? 'background';
    const setTab = (t: string) => { this._areaStyleTab = { ...this._areaStyleTab, [area]: t }; };

    const tabs = ['background', 'header', 'tiles', 'layout'];

    const bgTab = html`
      ${this._colorRow('Background colour', st.bgColor, '#1c1c1e',
        v => this._setAreaStyle(area, 'bgColor', v),
        () => this._setAreaStyle(area, 'bgColor', undefined))}
      <div class="field">
        <div class="field-lbl">Background image URL</div>
        <input type="text" .value=${st.bgImage ?? ''} placeholder="/local/image.jpg"
          @change=${(e: Event) => this._setAreaStyle(area, 'bgImage', (e.target as HTMLInputElement).value || undefined)}>
      </div>
    `;

    const headerTab = html`
      ${this._colorRow('Header colour 1', st.headerBgColor, '#1a1a2e',
        v => this._setAreaStyle(area, 'headerBgColor', v),
        () => this._setAreaStyle(area, 'headerBgColor', undefined))}
      ${this._colorRow('Header colour 2 (gradient)', st.headerBgColor2, '#0f3460',
        v => this._setAreaStyle(area, 'headerBgColor2', v),
        () => this._setAreaStyle(area, 'headerBgColor2', undefined))}
      ${this._colorRow('Room name colour', st.textColor, '#f4601e',
        v => this._setAreaStyle(area, 'textColor', v),
        () => this._setAreaStyle(area, 'textColor', undefined))}
      ${this._colorRow('Accent colour', st.accentColor, '#f4601e',
        v => this._setAreaStyle(area, 'accentColor', v),
        () => this._setAreaStyle(area, 'accentColor', undefined))}
    `;

    const tilesTab = html`
      ${this._colorRow('Tile background', st.tileBgColor, '#1c1c1e',
        v => this._setAreaStyle(area, 'tileBgColor', v),
        () => this._setAreaStyle(area, 'tileBgColor', undefined))}
      ${this._colorRow('Tile border', st.tileBorderColor, 'rgba(255,255,255,0.07)',
        v => this._setAreaStyle(area, 'tileBorderColor', v),
        () => this._setAreaStyle(area, 'tileBorderColor', undefined))}
      ${this._sliderRow('Tile corner radius', st.tileBorderRadius ?? 12, 0, 20, 2, 'px',
        v => this._setAreaStyle(area, 'tileBorderRadius', v))}
      <div class="field">
        <div class="field-lbl">Shadow</div>
        ${this._pills(
          [{ value: 'none', label: 'None' }, { value: 'soft', label: 'Soft' },
           { value: 'medium', label: 'Medium' }, { value: 'strong', label: 'Strong' }],
          st.boxShadow ?? 'none',
          v => this._setAreaStyle(area, 'boxShadow', v as any)
        )}
      </div>
    `;

    const layoutTab = html`
      <div class="field">
        <div class="field-lbl">Columns override</div>
        <div class="step-row">
          <button class="step-btn" @click=${() => this._setAreaStyle(area, 'columns', Math.max(1, (st.columns ?? 3) - 1))}>−</button>
          <span class="step-val">${st.columns ?? '—'}</span>
          <button class="step-btn" @click=${() => this._setAreaStyle(area, 'columns', Math.min(6, (st.columns ?? 3) + 1))}>+</button>
        </div>
      </div>
      ${this._sliderRow('Tile gap', st.tileGap ?? 10, 4, 24, 2, 'px',
        v => this._setAreaStyle(area, 'tileGap', v))}
      ${this._sliderRow('Border width', st.borderWidth ?? 1, 0, 8, 1, 'px',
        v => this._setAreaStyle(area, 'borderWidth', v))}
      ${this._colorRow('Section border colour', st.borderColor, 'rgba(255,255,255,0.07)',
        v => this._setAreaStyle(area, 'borderColor', v),
        () => this._setAreaStyle(area, 'borderColor', undefined))}
    `;

    return html`
      <div class="area-editor">
        <div class="area-editor-hdr">
          <span class="area-editor-name">${area}</span>
          ${Object.keys(st).length ? html`
            <button class="clear-btn" @click=${() => this._clearAreaStyle(area)}>Clear all</button>
          ` : nothing}
        </div>
        <div class="style-tabs">
          ${tabs.map(t => html`
            <button class="style-tab ${tab === t ? 'active' : ''}"
              @click=${() => setTab(t)}>${t[0].toUpperCase() + t.slice(1)}</button>
          `)}
        </div>
        <div class="style-tab-body">
          ${tab === 'background' ? bgTab
            : tab === 'header'     ? headerTab
            : tab === 'tiles'      ? tilesTab
            :                        layoutTab}
        </div>
      </div>
    `;
  }

  // ── Tab: Graphs ────────────────────────────────────────────────────────────

  private _renderGraphsTab(): TemplateResult {
    const cfg = this._config;
    const gs = cfg.graph_style ?? {};
    const selectedGraphs = cfg.graph_sensors ?? [];
    const sensorColors = cfg.graph_sensor_colors ?? {};

    // Sensor selector
    const groups = [...new Set(GRAPH_SENSOR_DEFS.map(s => s.group))];
    const selectorContent = html`
      ${groups.map(group => {
        const defs = GRAPH_SENSOR_DEFS.filter(s => s.group === group);
        const allOn = defs.every(s => selectedGraphs.includes(s.key));
        return html`
          <div class="sensor-group">
            <div class="sg-hdr">
              <span class="sg-title">${group}</span>
              <button class="sg-all-btn" @click=${() => this._toggleGroupSensors(group, 'graph_sensors')}>
                ${allOn ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div class="sensor-grid">
              ${defs.map(s => {
                const active = selectedGraphs.includes(s.key);
                const color = sensorColors[s.key] ?? s.defaultColor;
                return html`
                  <div class="sensor-card ${active ? 'active' : ''}"
                    @click=${() => this._toggleGraphSensor(s.key)}>
                    <div class="sensor-color-dot" style="background:${color}"></div>
                    <div class="sensor-info">
                      <div class="sensor-name">${s.label}</div>
                      <div class="sensor-unit">${s.unit}</div>
                    </div>
                    ${active ? html`<span class="sensor-check">✓</span>` : nothing}
                  </div>
                `;
              })}
            </div>
          </div>
        `;
      })}
    `;

    // Graph style options
    const styleContent = html`
      <div class="field">
        <div class="field-lbl">Type</div>
        ${this._pills(
          [{ value: 'line', label: 'Line' }, { value: 'area', label: 'Area' }, { value: 'bar', label: 'Bar' }],
          gs.type ?? 'line',
          v => this._setGraphStyle('type', v)
        )}
      </div>
      ${this._sliderRow('Line thickness', gs.line_width ?? 1.5, 0.5, 4, 0.5, 'px',
        v => this._setGraphStyle('line_width', v))}
      ${this._sliderRow('Graph height', gs.height ?? 32, 20, 80, 4, 'px',
        v => this._setGraphStyle('height', v))}
      ${this._sliderRow('History window', cfg.graph_hours ?? 24, 1, 168, 1, 'h',
        v => this._set('graph_hours', v))}
      <div class="divider"></div>
      <div class="tog-row">
        <div><div class="tog-lbl">Fill under curve</div></div>
        <label class="sw"><input type="checkbox" .checked=${gs.fill !== false}
          @change=${(e: Event) => this._setGraphStyle('fill', (e.target as HTMLInputElement).checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span></label>
      </div>
      <div class="tog-row">
        <div><div class="tog-lbl">Peak / min dots</div></div>
        <label class="sw"><input type="checkbox" .checked=${gs.show_dots !== false}
          @change=${(e: Event) => this._setGraphStyle('show_dots', (e.target as HTMLInputElement).checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span></label>
      </div>
      <div class="tog-row">
        <div><div class="tog-lbl">Time axis labels</div></div>
        <label class="sw"><input type="checkbox" .checked=${gs.time_labels !== false}
          @change=${(e: Event) => this._setGraphStyle('time_labels', (e.target as HTMLInputElement).checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span></label>
      </div>
      <div class="tog-row">
        <div><div class="tog-lbl">Tick grid lines</div></div>
        <label class="sw"><input type="checkbox" .checked=${gs.tick_lines !== false}
          @change=${(e: Event) => this._setGraphStyle('tick_lines', (e.target as HTMLInputElement).checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span></label>
      </div>
    `;

    // Per-sensor colour pickers (only for selected)
    const colorContent = selectedGraphs.length
      ? html`
          ${GRAPH_SENSOR_DEFS.filter(s => selectedGraphs.includes(s.key)).map(s => {
            const current = sensorColors[s.key];
            return this._colorRow(
              s.label,
              current,
              s.defaultColor,
              v => {
                const next = { ...sensorColors, [s.key]: v };
                this._set('graph_sensor_colors', next);
              },
              () => {
                const next = { ...sensorColors };
                delete next[s.key];
                this._set('graph_sensor_colors', Object.keys(next).length ? next : undefined);
              }
            );
          })}
        `
      : html`<div class="empty-hint">Select sensors above to configure their line colours.</div>`;

    return html`
      ${this._section('graph-sensors', 'Sensors to graph', '◈',
        'background:rgba(74,158,255,0.1);color:#4a9eff',
        selectorContent,
        selectedGraphs.length ? `${selectedGraphs.length} selected` : 'None',
        'background:rgba(74,158,255,0.1);color:#4a9eff'
      )}
      ${this._section('graph-style', 'Graph style', '∿',
        'background:rgba(45,212,191,0.1);color:#2dd4bf',
        styleContent)}
      ${this._section('graph-colors', 'Line colors', '◐',
        'background:rgba(244,96,30,0.1);color:#f4601e',
        colorContent)}
    `;
  }

  // ── Tab: Sensors ───────────────────────────────────────────────────────────

  private _renderSensorsTab(): TemplateResult {
    const selectedSensors = this._config.sensors ?? [];

    return html`
      ${SENSOR_GROUPS.map(grp => {
        const allOn = grp.items.every(i => selectedSensors.includes(i.key));
        const count = grp.items.filter(i => selectedSensors.includes(i.key)).length;
        const content = html`
          <div class="sg-hdr" style="margin-bottom:8px">
            <span></span>
            <button class="sg-all-btn" @click=${() => this._toggleGroupSensors(grp.group, 'sensors')}>
              ${allOn ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div class="sensor-grid">
            ${grp.items.map(item => {
              const active = selectedSensors.length === 0 || selectedSensors.includes(item.key);
              return html`
                <div class="sensor-card ${active ? 'active' : ''}"
                  @click=${() => this._toggleSensor(item.key)}>
                  <div class="sensor-info">
                    <div class="sensor-name">${item.label}</div>
                  </div>
                  ${active ? html`<span class="sensor-check">✓</span>` : nothing}
                </div>
              `;
            })}
          </div>
        `;

        const badge = count === grp.items.length
          ? 'All'
          : count
          ? `${count}/${grp.items.length}`
          : 'None';

        const colors: Record<string, string> = {
          Electrical:   'rgba(74,158,255,0.1);color:#4a9eff',
          Environmental:'rgba(74,222,128,0.1);color:#4ade80',
          Device:       'rgba(167,139,250,0.1);color:#a78bfa',
          Alerts:       'rgba(239,68,68,0.1);color:#f87171',
        };

        return this._section(
          `sensors-${grp.group}`,
          grp.group,
          grp.group === 'Alerts' ? '⚠' : '◈',
          `background:${colors[grp.group] ?? 'rgba(74,158,255,0.1);color:#4a9eff'}`,
          content,
          badge,
          `background:${colors[grp.group] ?? 'rgba(74,158,255,0.1);color:#4a9eff'}`
        );
      })}
    `;
  }

  // ── Tab: YAML ──────────────────────────────────────────────────────────────

  private _renderYamlTab(): TemplateResult {
    const yaml = this._buildYaml();
    return html`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span class="yaml-label">Generated config</span>
        <button class="btn-copy" @click=${async () => {
          await navigator.clipboard.writeText(yaml);
          const btn = this.renderRoot.querySelector('.btn-copy') as HTMLElement;
          if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
        }}>Copy</button>
      </div>
      <div class="yaml-block">${this._highlightYaml(yaml)}</div>
    `;
  }

  private _buildYaml(): string {
    const c = this._config;
    const lines: string[] = [`type: custom:ha-device-dashboard`];

    if (c.integrations?.length) {
      lines.push('integrations:');
      c.integrations.forEach(i => lines.push(`  - ${i}`));
    }
    if (c.areas?.length) {
      lines.push('areas:');
      c.areas.forEach(a => lines.push(`  - ${a}`));
    }
    if (c.include_entities) lines.push('include_entities: true');
    if (c.show_offline === false) lines.push('show_offline: false');

    lines.push('');
    if (c.columns) lines.push(`columns: ${c.columns}`);
    if (c.view_mode) lines.push(`view_mode: ${c.view_mode}`);
    if (c.tile_size) lines.push(`tile_size: ${c.tile_size}`);
    if (c.sort_by)   lines.push(`sort_by: ${c.sort_by}`);

    if (c.tile_layout?.length) {
      lines.push('tile_layout:');
      c.tile_layout.forEach(b => lines.push(`  - ${b}`));
    }

    if (c.theme) lines.push(`\ntheme: ${c.theme}`);

    const st = c.style;
    if (st && Object.keys(st).length) {
      lines.push('style:');
      Object.entries(st).forEach(([k, v]) => lines.push(`  ${k}: "${v}"`));
    }

    if (c.graph_sensors?.length) {
      lines.push('\ngraph_sensors:');
      c.graph_sensors.forEach(s => lines.push(`  - ${s}`));
    }
    const gs = c.graph_style;
    if (gs && Object.keys(gs).length) {
      lines.push('graph_style:');
      Object.entries(gs).forEach(([k, v]) => lines.push(`  ${k}: ${v}`));
    }
    if (c.graph_hours) lines.push(`graph_hours: ${c.graph_hours}`);

    const sc = c.graph_sensor_colors;
    if (sc && Object.keys(sc).length) {
      lines.push('graph_sensor_colors:');
      Object.entries(sc).forEach(([k, v]) => lines.push(`  ${k}: "${v}"`));
    }

    if (c.sensors?.length) {
      lines.push('\nsensors:');
      c.sensors.forEach(s => lines.push(`  - ${s}`));
    }

    return lines.filter(l => l !== undefined).join('\n');
  }

  private _highlightYaml(yaml: string): TemplateResult {
    const lines = yaml.split('\n').map(line => {
      if (line.startsWith('#')) {
        return html`<span class="yc">${line}</span>\n`;
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && !line.trimStart().startsWith('-')) {
        const key = line.slice(0, colonIdx);
        const rest = line.slice(colonIdx);
        return html`<span class="yk">${key}</span><span>${rest}</span>\n`;
      }
      if (line.trimStart().startsWith('- ')) {
        const indent = line.length - line.trimStart().length;
        const val = line.trim().slice(2);
        return html`${' '.repeat(indent)}<span>- </span><span class="ys">${val}</span>\n`;
      }
      return html`${line}\n`;
    });
    return html`${lines}`;
  }

  // ── Main render ────────────────────────────────────────────────────────────

  protected render(): TemplateResult {
    if (!this._config) return html``;

    const tabs: Array<{ id: TabId; label: string }> = [
      { id: 'devices', label: 'Devices' },
      { id: 'layout',  label: 'Layout' },
      { id: 'style',   label: 'Style' },
      { id: 'graphs',  label: 'Graphs' },
      { id: 'sensors', label: 'Sensors' },
      { id: 'yaml',    label: 'YAML' },
    ];

    return html`
      <div class="editor">
        <div class="tab-nav">
          ${tabs.map(t => html`
            <div class="tab ${this._tab === t.id ? 'active' : ''}"
              @click=${() => { this._tab = t.id; }}>
              ${t.label}
            </div>
          `)}
        </div>

        <div class="tab-body">
          ${this._tab === 'devices' ? this._renderDevicesTab()  : nothing}
          ${this._tab === 'layout'  ? this._renderLayoutTab()   : nothing}
          ${this._tab === 'style'   ? this._renderStyleTab()    : nothing}
          ${this._tab === 'graphs'  ? this._renderGraphsTab()   : nothing}
          ${this._tab === 'sensors' ? this._renderSensorsTab()  : nothing}
          ${this._tab === 'yaml'    ? this._renderYamlTab()     : nothing}
        </div>
      </div>
    `;
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  static styles = css`
    :host {
      --ed-bg:       var(--card-background-color, #17171c);
      --ed-surface:  var(--secondary-background-color, #1e1e26);
      --ed-surface3: rgba(255,255,255,0.06);
      --ed-border:   var(--divider-color, rgba(255,255,255,0.08));
      --ed-border2:  rgba(255,255,255,0.14);
      --ed-text:     var(--primary-text-color, #e2e2e8);
      --ed-text2:    var(--secondary-text-color, #888896);
      --ed-text3:    rgba(255,255,255,0.25);
      --ed-accent:   #f4601e;
      --ed-accentbg: rgba(244,96,30,0.10);
      --ed-accentbdr:rgba(244,96,30,0.28);
      --ed-rad:      8px;
      display: block;
    }

    .editor { font-family: var(--primary-font-family, 'DM Sans', sans-serif); }

    /* ── Tab nav ── */
    .tab-nav {
      display: flex; gap: 1px; padding: 6px 12px 0;
      border-bottom: 1px solid var(--ed-border); overflow-x: auto;
    }
    .tab {
      font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      padding: 7px 12px; color: var(--ed-text3); cursor: pointer;
      border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s;
      border-radius: 5px 5px 0 0; user-select: none;
    }
    .tab:hover { color: var(--ed-text2); }
    .tab.active { color: var(--ed-accent); border-bottom-color: var(--ed-accent); }

    .tab-body { padding: 12px; }

    /* ── Section ── */
    .sec { border: 1px solid var(--ed-border); border-radius: 10px; overflow: hidden; margin-bottom: 7px; }
    .sec-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 13px; cursor: pointer; user-select: none;
      background: var(--ed-surface); transition: filter 0.12s;
    }
    .sec-hdr:hover { filter: brightness(1.06); }
    .sec-hdr-l { display: flex; align-items: center; gap: 8px; }
    .sec-ico {
      width: 20px; height: 20px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0;
    }
    .sec-title {
      font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
      text-transform: uppercase; color: var(--ed-text);
    }
    .sec-hdr-r { display: flex; align-items: center; gap: 7px; }
    .sec-badge { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
    .chev { font-size: 9px; color: var(--ed-text3); }
    .sec.open .chev { transform: rotate(180deg); }
    .sec-body { padding: 13px; border-top: 1px solid var(--ed-border); }

    /* ── Inputs ── */
    input[type="text"],
    input[type="number"] {
      width: 100%; background: var(--ed-surface); border: 1px solid var(--ed-border2);
      border-radius: var(--ed-rad); padding: 7px 10px;
      font-family: inherit; font-size: 12px; color: var(--ed-text); outline: none;
      transition: border-color 0.15s;
    }
    input[type="text"]:focus,
    input[type="number"]:focus { border-color: var(--ed-accent); }
    input[type="range"] { width: 100%; accent-color: var(--ed-accent); cursor: pointer; }

    /* ── Fields ── */
    .field { margin-bottom: 12px; }
    .field:last-child { margin-bottom: 0; }
    .field-lbl {
      font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
      color: var(--ed-text2); text-transform: uppercase; margin-bottom: 7px;
    }
    .field-hint { font-size: 10px; color: var(--ed-text3); margin-top: 4px; }

    /* ── Toggle ── */
    .tog-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 7px 0; border-bottom: 1px solid var(--ed-border);
    }
    .tog-row:last-child { border-bottom: none; }
    .tog-lbl { font-size: 12px; color: var(--ed-text); }
    .tog-sub { font-size: 10px; color: var(--ed-text3); margin-top: 1px; }
    .sw { position: relative; width: 34px; height: 18px; flex-shrink: 0; }
    .sw input { opacity: 0; width: 0; height: 0; }
    .sw-track {
      position: absolute; inset: 0; background: var(--ed-surface3);
      border-radius: 9px; border: 1px solid var(--ed-border2);
      transition: background 0.2s, border-color 0.2s; cursor: pointer;
    }
    .sw-thumb {
      position: absolute; top: 2px; left: 2px; width: 12px; height: 12px;
      background: var(--ed-text3); border-radius: 50%;
      transition: transform 0.2s, background 0.2s; pointer-events: none;
    }
    .sw input:checked ~ .sw-track { background: var(--ed-accentbg); border-color: var(--ed-accentbdr); }
    .sw input:checked ~ .sw-thumb { transform: translateX(16px); background: var(--ed-accent); }

    /* ── Pills ── */
    .pill-grp { display: flex; flex-wrap: wrap; gap: 5px; }
    .pill {
      font-size: 10px; font-weight: 500; padding: 4px 10px;
      border-radius: 20px; border: 1px solid var(--ed-border2); color: var(--ed-text2);
      cursor: pointer; transition: all 0.12s; user-select: none; background: var(--ed-surface);
    }
    .pill:hover { border-color: var(--ed-accent); color: var(--ed-accent); }
    .pill.on { background: var(--ed-accentbg); border-color: var(--ed-accentbdr); color: var(--ed-accent); }
    .pill.has-style { border-color: rgba(251,191,36,0.4); color: #fbbf24; }

    /* ── Slider row ── */
    .sl-row { margin-bottom: 10px; }
    .sl-row:last-child { margin-bottom: 0; }
    .sl-label { font-size: 10px; font-weight: 700; letter-spacing: 0.04em; color: var(--ed-text2); text-transform: uppercase; margin-bottom: 5px; }
    .sl-accent { color: var(--ed-accent); font-weight: 500; }

    /* ── Color row ── */
    .col-row {
      display: flex; align-items: center; gap: 8px; padding: 6px 0;
      border-bottom: 1px solid var(--ed-border);
    }
    .col-row:last-child { border-bottom: none; }
    .col-swatch-wrap {
      width: 22px; height: 22px; border-radius: 4px;
      border: 1px solid var(--ed-border2); cursor: pointer; flex-shrink: 0;
      overflow: hidden; position: relative;
    }
    .col-dot { width: 100%; height: 100%; border-radius: 3px; }
    .col-swatch-wrap input[type="color"] {
      position: absolute; inset: -4px; width: calc(100%+8px); height: calc(100%+8px);
      cursor: pointer; border: none; padding: 0; background: none; opacity: 0;
    }
    .col-name { font-size: 12px; color: var(--ed-text); flex: 1; }
    .col-hex { font-size: 10px; color: var(--ed-text3); font-family: monospace; }
    .col-reset {
      background: none; border: none; color: var(--ed-text3); cursor: pointer;
      font-size: 12px; padding: 0 3px; transition: color 0.12s;
    }
    .col-reset:hover { color: var(--ed-accent); }

    /* ── Step buttons ── */
    .step-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .step-btn {
      width: 26px; height: 26px; border: 1px solid var(--ed-border2); border-radius: var(--ed-rad);
      background: var(--ed-surface); color: var(--ed-text2); font-size: 15px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.12s;
    }
    .step-btn:hover { border-color: var(--ed-accent); color: var(--ed-accent); }
    .step-val { font-size: 13px; color: var(--ed-text); min-width: 24px; text-align: center; font-weight: 600; }

    /* ── Integration rows ── */
    .int-row {
      display: flex; align-items: center; gap: 9px; padding: 8px 0;
      border-bottom: 1px solid var(--ed-border);
    }
    .int-row:last-child { border-bottom: none; }
    .int-badge {
      font-size: 8px; font-weight: 700; padding: 2px 6px;
      border-radius: 3px; letter-spacing: 0.06em; flex-shrink: 0; min-width: 44px; text-align: center;
    }
    .int-name { font-size: 12px; color: var(--ed-text); flex: 1; }

    /* ── Room rows ── */
    .room-row {
      display: flex; align-items: center; gap: 8px; padding: 7px 0;
      border-bottom: 1px solid var(--ed-border);
    }
    .room-row:last-child { border-bottom: none; }
    .room-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .room-name { font-size: 12px; color: var(--ed-text); flex: 1; }
    .room-styled-badge {
      font-size: 9px; padding: 1px 5px; border-radius: 3px;
      background: rgba(251,191,36,0.1); color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.3);
    }
    .room-style-btn {
      background: none; border: 1px solid var(--ed-border);
      border-radius: 5px; color: var(--ed-text3); font-size: 10px;
      padding: 3px 8px; cursor: pointer; transition: all 0.12s;
    }
    .room-style-btn:hover { border-color: var(--ed-accent); color: var(--ed-accent); }

    /* ── Search ── */
    .search-wrap {
      display: flex; align-items: center; gap: 6px; background: var(--ed-surface);
      border: 1px solid var(--ed-border2); border-radius: var(--ed-rad);
      padding: 6px 10px; margin-bottom: 10px;
    }
    .search-wrap input { background: none; border: none; outline: none; font-size: 12px; color: var(--ed-text); width: 100%; }
    .search-icon { font-size: 11px; color: var(--ed-text3); }

    /* ── Drag list ── */
    .drag-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .drag-item {
      display: flex; align-items: center; gap: 9px; padding: 8px 11px;
      background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); cursor: grab; transition: background 0.12s, border-color 0.12s;
      user-select: none;
    }
    .drag-item:hover { background: var(--ed-surface3); border-color: var(--ed-border2); }
    .drag-handle { display: flex; flex-direction: column; gap: 2px; color: var(--ed-text3); }
    .drag-handle span { display: block; width: 13px; height: 1.5px; background: currentColor; border-radius: 1px; }
    .drag-label { font-size: 11px; font-weight: 600; color: var(--ed-text); }
    .drag-sub { font-size: 10px; color: var(--ed-text3); margin-top: 1px; }

    /* ── Preview label ── */
    .preview-label { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ed-text3); margin-bottom: 8px; }

    /* ── Reset btn ── */
    .reset-btn {
      background: none; border: 1px solid var(--ed-border);
      border-radius: 6px; color: var(--ed-text3); font-size: 11px;
      padding: 5px 12px; cursor: pointer; width: 100%; transition: all 0.12s;
    }
    .reset-btn:hover { border-color: var(--ed-accent); color: var(--ed-accent); }

    /* ── Theme presets ── */
    .preset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-bottom: 6px; }
    .preset-card {
      border: 1px solid var(--ed-border); border-radius: var(--ed-rad);
      overflow: hidden; cursor: pointer; transition: border-color 0.15s; position: relative;
    }
    .preset-card:hover { border-color: var(--ed-border2); }
    .preset-card.active { border-color: var(--ed-accent); }
    .preset-card.active::after {
      content: '✓'; position: absolute; top: 5px; right: 5px;
      width: 14px; height: 14px; background: var(--ed-accent); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; color: white; line-height: 14px; text-align: center;
    }
    .preset-preview {
      height: 44px; padding: 8px; display: flex; align-items: flex-end; gap: 4px;
    }
    .preset-name {
      font-size: 9px; font-weight: 600; color: var(--ed-text2); padding: 5px 7px;
      background: var(--ed-surface); border-top: 1px solid var(--ed-border); text-align: center;
      letter-spacing: 0.03em;
    }
    .preset-card.active .preset-name { color: var(--ed-accent); }

    /* ── Font options ── */
    .font-opt {
      padding: 8px 10px; border: 1px solid var(--ed-border); border-radius: var(--ed-rad);
      cursor: pointer; margin-bottom: 5px; transition: all 0.12s;
    }
    .font-opt:last-child { margin-bottom: 0; }
    .font-opt:hover { border-color: var(--ed-border2); }
    .font-opt.active { border-color: var(--ed-accentbdr); background: var(--ed-accentbg); }
    .font-name { font-size: 11px; color: var(--ed-text); margin-bottom: 2px; }
    .font-sample { font-size: 11px; color: var(--ed-text3); }

    /* ── Button preview ── */
    .btn-preview {
      display: flex; align-items: center; gap: 8px; padding: 10px;
      background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); margin-bottom: 12px;
    }

    /* ── Area style editor ── */
    .area-editor {
      background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); padding: 12px; margin-top: 8px;
    }
    .area-editor-hdr {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
    }
    .area-editor-name { font-size: 13px; font-weight: 700; color: var(--ed-text); }
    .clear-btn {
      background: none; border: 1px solid rgba(239,68,68,0.4); border-radius: 5px;
      color: #f87171; font-size: 10px; padding: 3px 9px; cursor: pointer;
    }
    .clear-btn:hover { background: rgba(239,68,68,0.1); }
    .style-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
    .style-tab {
      flex: 1; padding: 4px; border-radius: var(--ed-rad); font-size: 10px; font-weight: 600;
      text-align: center; cursor: pointer; border: 1px solid var(--ed-border);
      background: var(--ed-surface3); color: var(--ed-text2); transition: all 0.12s;
    }
    .style-tab.active { background: var(--ed-accentbg); border-color: var(--ed-accentbdr); color: var(--ed-accent); }

    /* ── Sensor selector ── */
    .sensor-group { margin-bottom: 14px; }
    .sensor-group:last-child { margin-bottom: 0; }
    .sg-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 0; margin-bottom: 7px; border-bottom: 1px solid var(--ed-border);
    }
    .sg-title {
      font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
      text-transform: uppercase; color: var(--ed-text3);
    }
    .sg-all-btn {
      background: none; border: none; font-size: 10px;
      color: var(--ed-text3); cursor: pointer; padding: 1px 4px; border-radius: 3px;
    }
    .sg-all-btn:hover { color: var(--ed-accent); }
    .sensor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
    .sensor-card {
      display: flex; align-items: center; gap: 7px; padding: 7px 9px;
      background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); cursor: pointer; transition: all 0.12s; user-select: none;
      position: relative;
    }
    .sensor-card:hover { border-color: var(--ed-border2); }
    .sensor-card.active { border-color: var(--ed-accentbdr); background: var(--ed-accentbg); }
    .sensor-color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sensor-info { flex: 1; min-width: 0; }
    .sensor-name { font-size: 11px; font-weight: 500; color: var(--ed-text2); }
    .sensor-card.active .sensor-name { color: var(--ed-text); }
    .sensor-unit { font-size: 9px; color: var(--ed-text3); margin-top: 1px; font-family: monospace; }
    .sensor-check { position: absolute; top: 4px; right: 5px; font-size: 9px; color: var(--ed-accent); }

    /* ── Empty hint ── */
    .empty-hint { font-size: 11px; color: var(--ed-text3); padding: 4px 0; line-height: 1.5; }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--ed-border); margin: 8px 0; }

    /* ── YAML tab ── */
    .yaml-label { font-size: 10px; color: var(--ed-text3); font-family: monospace; }
    .btn-copy {
      background: none; border: 1px solid var(--ed-border2); border-radius: 5px;
      color: var(--ed-text2); font-size: 10px; padding: 3px 10px; cursor: pointer; transition: all 0.12s;
    }
    .btn-copy:hover { color: var(--ed-accent); border-color: var(--ed-accentbdr); }
    .yaml-block {
      font-family: 'IBM Plex Mono', 'Consolas', monospace; font-size: 11px; line-height: 1.7;
      color: var(--ed-text2); background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); padding: 10px 12px; overflow-x: auto; white-space: pre;
    }
    .yaml-block::-webkit-scrollbar { height: 4px; }
    .yaml-block::-webkit-scrollbar-thumb { background: var(--ed-surface3); border-radius: 2px; }
    .yk { color: #7dd3fc; }
    .yv { color: #86efac; }
    .ys { color: #fde68a; }
    .yn { color: #f9a8d4; }
    .yc { color: var(--ed-text3); }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-device-dashboard-editor': HADeviceDashboardEditor;
  }
}
