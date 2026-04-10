import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { HADeviceDashboardConfig, AreaStyle, TileBlockId, EntityAnimationType } from './types';
import { getAllDevices, GRAPH_SENSOR_DEFS } from './helpers';
import { renderAnimSvg, ANIM_OPTIONS, ANIM_COLORS, ANIM_CSS } from './anim-icons';

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_OPTIONS: Array<{ label: string; value: string | undefined }> = [
  { label: 'Default',  value: undefined },
  { label: 'Inter',    value: 'Inter, sans-serif' },
  { label: 'Roboto',   value: 'Roboto, sans-serif' },
  { label: 'Mono',     value: "'IBM Plex Mono', monospace" },
  { label: 'System',   value: 'system-ui, sans-serif' },
];

const INTEGRATIONS = [
  { key: 'shelly', label: 'Shelly', badge: 'SHELLY', color: '#f4601e', bg: 'rgba(244,96,30,0.2)' },
];

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

const GRAPH_SENSOR_DEFS_LOCAL = [
  { key: 'power', label: 'Power', unit: 'W', color: '#f4601e' },
  { key: 'voltage', label: 'Voltage', unit: 'V', color: '#a78bfa' },
  { key: 'current', label: 'Current', unit: 'A', color: '#fbbf24' },
  { key: 'energy', label: 'Energy', unit: 'kWh', color: '#4ade80' },
  { key: 'apparent_power', label: 'App. Power', unit: 'VA', color: '#f472b6' },
  { key: 'reactive_power', label: 'React. Power', unit: 'VAr', color: '#818cf8' },
  { key: 'frequency', label: 'Frequency', unit: 'Hz', color: '#34d399' },
  { key: 'power_factor', label: 'Power Factor', unit: '%', color: '#fb923c' },
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#4fc3f7' },
  { key: 'humidity', label: 'Humidity', unit: '%', color: '#2dd4bf' },
  { key: 'illuminance', label: 'Illuminance', unit: 'lx', color: '#fde047' },
  { key: 'co2', label: 'CO₂', unit: 'ppm', color: '#a3e635' },
  { key: 'battery', label: 'Battery', unit: '%', color: '#86efac' },
  { key: 'rssi', label: 'RSSI', unit: 'dBm', color: '#7dd3fc' },
];

const TILE_BLOCKS: Array<{ id: TileBlockId; label: string; sub: string }> = [
  { id: 'name_row',      label: 'Name row',          sub: 'Device name + status dot + primary control' },
  { id: 'sensors',       label: 'Sensor chips',       sub: 'Power, temp, voltage, RSSI…' },
  { id: 'graph',         label: 'Sparkline graph',    sub: 'History sparklines per selected sensor' },
  { id: 'dimmer',        label: 'Dimmer / color',     sub: 'Brightness + color picker for lights' },
  { id: 'cover_controls',label: 'Cover controls',     sub: 'Open / stop / close + position' },
  { id: 'trv_control',   label: 'TRV control',        sub: 'Thermostat display + ± buttons' },
  { id: 'power_bar',        label: 'Power bar',          sub: 'Mini usage bar at tile bottom' },
  { id: 'virtual_controls', label: 'Virtual controls',   sub: 'Script-defined switches, selectors & actions' },
  { id: 'badges',           label: 'Type & gen badges',  sub: 'Dimmer · G3 · Relay labels' },
];

/** Config keys that belong to style/layout — copied by "Copy style", excluded: device/room keys */
const STYLE_KEYS: ReadonlyArray<string> = [
  'style', 'tile_size', 'tile_opacity', 'card_opacity',
  'card_bg_image', 'card_bg_image_size',
  'tile_layout', 'graph_style', 'graph_sensors',
  'graph_hours', 'graph_line_color', 'graph_sensor_colors',
  'sensors', 'sort_by', 'view_mode', 'columns',
  'show_power_bar', 'power_bar_max',
  'area_styles', 'device_styles',
];



// ─── Editor component ─────────────────────────────────────────────────────────

@customElement('ha-device-dashboard-editor')
export class HADeviceDashboardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: HADeviceDashboardConfig;
  @state() private _tab: 'devices'|'layout'|'graphs'|'yaml' = 'devices';
  @state() private _openSections: Record<string, boolean> = {
    rooms: true,
    grid: true, tileorder: true,
    header: false, colors: true, tiles: true, typography: false, buttons: false, roomstyles: false,
    graphtype: true, graphcolors: false,
    electrical: true, environmental: true, deviceinfo: false, alerts: false,
  };
  @state() private _expandedRooms: Set<string> = new Set();
  @state() private _expandedDevices: Set<string> = new Set();
  @state() private _deviceSearch = '';
  @state() private _bgEditArea: string | null = null;
  @state() private _styleTab: Record<string, string> = {};
  @state() private _hiddenBlocks: Set<TileBlockId> = new Set();
  @state() private _dragOrder: TileBlockId[] = TILE_BLOCKS.map(b => b.id);
  @state() private _dragOver: TileBlockId | null = null;
  @state() private _styleClipFeedback = '';
  @state() private _copyAreaOpen = false;
  @state() private _copyJson = '';
  @state() private _pasteOpen = false;
  @state() private _pasteText = '';
  private _styleClipTimer?: number;

  setConfig(config: HADeviceDashboardConfig) {
    this._config = config;
  }

  private _set(key: string, value: unknown) {
    if (!this._config) return;
    const updated: Record<string, unknown> = { ...this._config, [key]: value };
    // 'areas: []' is a valid sentinel meaning "no rooms selected" — never delete it
    if (value === '' || value === undefined || (Array.isArray(value) && value.length === 0 && key !== 'areas')) {
      delete updated[key];
    }
    fireEvent(this, 'config-changed', { config: updated });
  }

  private _toggleSec(id: string) {
    this._openSections = { ...this._openSections, [id]: !this._openSections[id] };
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
    navigator.clipboard.writeText(this._copyJson).catch((err) => { console.warn('[editor] clipboard write failed', err); });
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
      fireEvent(this, 'config-changed', { config: updated });
      this._showStyleFeedback('Applied!');
      this._pasteOpen = false;
      this._pasteText = '';
    } catch {
      this._showStyleFeedback('Invalid style data');
    }
  }

  private _getAreas(): Array<{ id: string; name: string }> {
    if (!this.hass) return [];
    return Object.values((this.hass as any).areas ?? {})
      .map((a: any) => ({ id: a.area_id, name: a.name as string }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private _getAllHADevices(): Array<{ device_id: string; name: string; area?: string }> {
    if (!this.hass) return [];
    const dr: Record<string,any> = (this.hass as any).devices ?? {};
    const er: Record<string,any> = (this.hass as any).entities ?? {};
    const seen = new Set<string>();
    const res: Array<{device_id:string;name:string;area?:string}> = [];
    for (const e of Object.values(er)) {
      const id: string = (e as any)?.device_id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const dev = dr[id];
      if (!dev) continue;
      const aId = dev.area_id ?? (e as any).area_id;
      const area = aId ? (this.hass as any).areas?.[aId]?.name : undefined;
      res.push({ device_id: id, name: dev.name_by_user ?? dev.name ?? id, area });
    }
    return res.sort((a,b)=>a.name.localeCompare(b.name));
  }

  private _getDiscoveredDevices(): Array<{ device_id: string; name: string; area?: string }> {
    if (!this.hass) return [];
    const areas = this._config.areas;
    let raw = getAllDevices(this.hass);
    if (areas !== undefined) {
      const norm = new Set(areas.map(a => a.toLowerCase()));
      raw = raw.filter(d => norm.has((d.area ?? '').toLowerCase()));
    }
    return raw.map(d => ({ device_id: d.device_id, name: d.name, area: d.area }))
              .sort((a,b)=>a.name.localeCompare(b.name));
  }

  private _getEntitiesForDevice(deviceId: string) {
    const er: Record<string,any> = (this.hass as any).entities ?? {};
    const res: Array<{entity_id:string;name:string;domain:string}> = [];
    for (const [eid, e] of Object.entries(er)) {
      if ((e as any).device_id !== deviceId) continue;
      const s = this.hass.states[eid];
      res.push({ entity_id: eid, name: (s?.attributes as any)?.friendly_name ?? eid, domain: eid.split('.')[0] });
    }
    return res.sort((a,b)=>a.name.localeCompare(b.name));
  }

  // ── Area style helpers ──────────────────────────────────────────────────────
  private _setAreaStyle(n: string, key: keyof AreaStyle, value: string|number|undefined) {
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

  private _triggerUpload(n: string) {
    (this.renderRoot.querySelector(`input[data-upload="${n}"]`) as HTMLInputElement|null)?.click();
  }

  private _handleUpload(n: string, e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => this._setAreaStyle(n, 'bgImage', r.result as string);
    r.onerror = () => { console.warn('[editor] failed to read file', file.name); };
    r.readAsDataURL(file);
    (e.target as HTMLInputElement).value = '';
  }

  private _handleTileBgUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const sty = this._config.style ?? {};
      this._set('style', { ...sty, tile_bg_image: r.result as string });
    };
    r.onerror = () => { console.warn('[editor] failed to read file', file.name); };
    r.readAsDataURL(file);
    (e.target as HTMLInputElement).value = '';
  }

  private _handleCardBgUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { this._set('card_bg_image', r.result as string); };
    r.onerror = () => { console.warn('[editor] failed to read file', file.name); };
    r.readAsDataURL(file);
    (e.target as HTMLInputElement).value = '';
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

    // Room rows
    const roomBody = html`
      <div class="rooms-toolbar">
        <div class="toolbar-group">
          <span class="toolbar-lbl">Sort</span>
          <div class="pill-grp">
            ${(['name','power','online'] as const).map(v => html`
              <span class="pill ${(c.sort_by ?? 'name') === v ? 'on' : ''}"
                @click=${()=>this._set('sort_by',v)}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
          </div>
        </div>
        <div class="toolbar-group">
          <span class="toolbar-lbl">View</span>
          <div class="pill-grp">
            ${(['grid','list','compact'] as const).map(v => html`
              <span class="pill ${(c.view_mode ?? 'grid') === v ? 'on' : ''}"
                @click=${()=>this._set('view_mode',v)}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
          </div>
        </div>
        <div class="tog-row" style="border:none;padding:4px 0 0">
          <div class="tog-lbl">Show offline devices</div>
          <label class="sw"><input type="checkbox" .checked=${c.show_offline !== false}
            @change=${(e:Event)=>this._set('show_offline',(e.target as HTMLInputElement).checked)}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>
      </div>
      ${areaKeys.map(areaKey => {
        const label = areaKey || 'No Room';
        const devicesInArea = byArea.get(areaKey) ?? [];
        const isIncluded = isAreaOn(areaKey);
        const isExpanded = this._expandedRooms.has(areaKey);
        return html`
          <div class="room-row">
            <div class="room-dot" style="background:${isIncluded ? '#4ade80' : 'var(--t3)'}"></div>
            <span class="room-name" style="color:${isIncluded ? 'var(--text)' : 'var(--t2)'}">${label}</span>
            ${devicesInArea.length ? html`<span class="room-count">${devicesInArea.length} devices</span>` : nothing}
            <label class="sw"><input type="checkbox" .checked=${isIncluded}
              @change=${()=>toggleArea(areaKey)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
            <button class="room-style-btn" @click=${(e:Event)=>{
              e.stopPropagation();
              this._tab = 'layout';
              this._openSections = { ...this._openSections, roomstyles: true };
              this._expandedRooms = new Set([...this._expandedRooms, areaKey]);
            }}>Style ›</button>
            <button class="room-style-btn" @click=${(e:Event)=>{
              e.stopPropagation();
              const next = new Set(this._expandedRooms);
              next.has(areaKey) ? next.delete(areaKey) : next.add(areaKey);
              this._expandedRooms = next;
            }}>${isExpanded ? '▲' : 'Devices'}</button>
          </div>
          ${isExpanded ? html`
            <div class="room-devices">
              ${devicesInArea.length ? devicesInArea.map(dev => {
                const isHidden = hiddenDevices.includes(dev.device_id);
                const hasDevStyle = !!(c.device_styles?.[dev.device_id]);
                const isDevExpanded = this._expandedDevices.has(dev.device_id);
                return html`
                  <div class="room-device-row">
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
                    <button class="room-style-btn" @click=${(e: Event) => {
                      e.stopPropagation();
                      const next = new Set(this._expandedDevices);
                      next.has(dev.device_id) ? next.delete(dev.device_id) : next.add(dev.device_id);
                      this._expandedDevices = next;
                    }}>${isDevExpanded ? '▲' : 'Style'}</button>
                  </div>
                  ${isDevExpanded ? this._renderDeviceStyleInline(dev.device_id) : nothing}`;
              }) : html`<div class="room-device-empty">No devices in this room</div>`}
            </div>
          ` : nothing}`;
      })}`;

    return html`
      ${this._sec('rooms','⌂','rgba(74,222,128,0.1)','#4ade80','Rooms', roomsBadge, roomBody)}`;
  }

  private _setDeviceStyle(deviceId: string, patch: Partial<{
    color: string | undefined;
    tile_layout: TileBlockId[] | undefined;
    tile_icon: string | undefined;
    tile_icon_off: string | undefined;
    tile_icon_speed: number | undefined;
    entity_animations: Record<string, { on?: string; off?: string; speed?: number }> | undefined;
  }>) {
    const current = this._config.device_styles?.[deviceId] ?? {};
    const next: Record<string, unknown> = { ...current, ...patch };
    if (next['color'] === undefined) delete next['color'];
    if (next['tile_layout'] === undefined) delete next['tile_layout'];
    if (next['tile_icon'] === undefined) delete next['tile_icon'];
    if (next['tile_icon_off'] === undefined) delete next['tile_icon_off'];
    if (next['tile_icon_speed'] === undefined) delete next['tile_icon_speed'];
    if (next['entity_animations'] === undefined) delete next['entity_animations'];
    const allStyles = { ...(this._config.device_styles ?? {}), [deviceId]: next };
    if (!Object.keys(next).length) delete allStyles[deviceId];
    this._set('device_styles', Object.keys(allStyles).length ? allStyles : undefined);
  }

  private _renderDeviceStyleInline(deviceId: string): TemplateResult {
    const devStyle = this._config.device_styles?.[deviceId] ?? {};
    const globalLayout: TileBlockId[] = this._config.tile_layout ?? TILE_BLOCKS.map(b => b.id);
    const devLayout: TileBlockId[] | null = (devStyle as any).tile_layout ?? null;
    const entityAnims: Record<string, { on?: string; off?: string; speed?: number }> = (devStyle as any).entity_animations ?? {};

    const toggleBlock = (blockId: TileBlockId) => {
      const isVisible = devLayout === null ? globalLayout.includes(blockId) : devLayout.includes(blockId);
      const next = TILE_BLOCKS.map(b => b.id).filter(id => {
        if (id === blockId) return !isVisible;
        return devLayout === null ? globalLayout.includes(id) : devLayout.includes(id);
      });
      const sameAsGlobal = next.length === globalLayout.length && next.every(id => globalLayout.includes(id));
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

    // Find switch entities for this device to show animation pickers
    const allDevices = this.hass ? getAllDevices(this.hass) : [];
    const dev = allDevices.find(d => d.device_id === deviceId);
    const switchEnts = dev ? dev.entities.filter(e => e.domain === 'switch' || e.domain === 'light') : [];

    return html`
      <div class="dev-style-panel">
        <div class="color-row">
          <span class="color-key">Accent colour</span>
          <span class="color-val">${(devStyle as any).color ?? '#f4601e'}</span>
          <input type="color" .value=${(devStyle as any).color ?? '#f4601e'}
            @change=${(e: Event) => this._setDeviceStyle(deviceId, { color: (e.target as HTMLInputElement).value })}/>
          ${(devStyle as any).color ? html`<button class="color-reset"
            @click=${() => this._setDeviceStyle(deviceId, { color: undefined })}>↺</button>` : nothing}
        </div>
        <div class="tile-icon-row">
          <span class="color-key">Tile icon</span>
          <div class="tile-icon-pickers">
            <span class="tile-icon-state-lbl">ON</span>
            <details class="icon-picker-wrap">
              <summary class="icon-picker-btn compact">
                ${(devStyle as any).tile_icon
                  ? renderAnimSvg((devStyle as any).tile_icon as EntityAnimationType, true, `--ent-spd:1;color:${ANIM_COLORS[(devStyle as any).tile_icon as EntityAnimationType].on}`, 'icon-preview-sm')
                  : html`<span class="icon-cell-none">—</span>`}
              </summary>
              <div class="icon-picker-grid">
                ${ANIM_OPTIONS.map(opt => html`
                  <button
                    class="icon-cell ${((devStyle as any).tile_icon ?? 'none') === opt.value ? 'selected' : ''}"
                    title="${opt.group} ${opt.label}"
                    @click=${(ev: Event) => {
                      this._setDeviceStyle(deviceId, { tile_icon: opt.value === 'none' ? undefined : opt.value as EntityAnimationType });
                      ((ev.target as HTMLElement).closest('details') as HTMLDetailsElement)?.removeAttribute('open');
                    }}
                  >
                    ${opt.value === 'none'
                      ? html`<span class="icon-cell-none">—</span>`
                      : renderAnimSvg(opt.value, true, `--ent-spd:1;color:${ANIM_COLORS[opt.value].on}`, 'icon-preview')}
                    <span class="icon-cell-label">${opt.label}</span>
                  </button>
                `)}
              </div>
            </details>
            <span class="tile-icon-state-lbl">OFF</span>
            <details class="icon-picker-wrap">
              <summary class="icon-picker-btn compact">
                ${(devStyle as any).tile_icon_off
                  ? renderAnimSvg((devStyle as any).tile_icon_off as EntityAnimationType, false, `--ent-spd:1;color:${ANIM_COLORS[(devStyle as any).tile_icon_off as EntityAnimationType].off}`, 'icon-preview-sm')
                  : html`<span class="icon-cell-none">—</span>`}
              </summary>
              <div class="icon-picker-grid flip">
                ${ANIM_OPTIONS.map(opt => html`
                  <button
                    class="icon-cell ${((devStyle as any).tile_icon_off ?? 'none') === opt.value ? 'selected' : ''}"
                    title="${opt.group} ${opt.label}"
                    @click=${(ev: Event) => {
                      this._setDeviceStyle(deviceId, { tile_icon_off: opt.value === 'none' ? undefined : opt.value as EntityAnimationType });
                      ((ev.target as HTMLElement).closest('details') as HTMLDetailsElement)?.removeAttribute('open');
                    }}
                  >
                    ${opt.value === 'none'
                      ? html`<span class="icon-cell-none">—</span>`
                      : renderAnimSvg(opt.value, false, `--ent-spd:1;color:${ANIM_COLORS[opt.value].off}`, 'icon-preview')}
                    <span class="icon-cell-label">${opt.label}</span>
                  </button>
                `)}
              </div>
            </details>
          </div>
          <select class="anim-select" style="width:90px" .value=${String((devStyle as any).tile_icon_speed ?? 1)}
            @change=${(ev: Event) => {
              const v = Number((ev.target as HTMLSelectElement).value);
              this._setDeviceStyle(deviceId, { tile_icon_speed: v === 1 ? undefined : v });
            }}>
            <option value="0.25" ?selected=${((devStyle as any).tile_icon_speed ?? 1) === 0.25}>0.25× Slow</option>
            <option value="0.5"  ?selected=${((devStyle as any).tile_icon_speed ?? 1) === 0.5}>0.5× Slow</option>
            <option value="1"    ?selected=${((devStyle as any).tile_icon_speed ?? 1) === 1}>1× Normal</option>
            <option value="1.5"  ?selected=${((devStyle as any).tile_icon_speed ?? 1) === 1.5}>1.5× Fast</option>
            <option value="2"    ?selected=${((devStyle as any).tile_icon_speed ?? 1) === 2}>2× Fast</option>
            <option value="3"    ?selected=${((devStyle as any).tile_icon_speed ?? 1) === 3}>3× Rapid</option>
            <option value="5"    ?selected=${((devStyle as any).tile_icon_speed ?? 1) === 5}>5× Frantic</option>
          </select>
        </div>
        <div class="field-lbl" style="margin-bottom:4px">Visible blocks</div>
        <div class="block-toggles">
          ${TILE_BLOCKS.map(b => {
            const on = devLayout === null ? globalLayout.includes(b.id) : devLayout.includes(b.id);
            return html`<span class="block-tog ${on ? 'on' : ''}" @click=${() => toggleBlock(b.id)}>
              ${on ? '👁' : '○'} ${b.label}
            </span>`;
          })}
        </div>
        ${switchEnts.length ? html`
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
                <details class="icon-picker-wrap">
                  <summary class="icon-picker-btn compact">
                    ${curOn !== 'none'
                      ? renderAnimSvg(curOn, true, `--ent-spd:1;color:${ANIM_COLORS[curOn].on}`, 'icon-preview-sm')
                      : html`<span class="icon-cell-none">—</span>`}
                  </summary>
                  <div class="icon-picker-grid">
                    ${ANIM_OPTIONS.map(opt => html`
                      <button class="icon-cell ${curOn === opt.value ? 'selected' : ''}"
                        title="${opt.group} ${opt.label}"
                        @click=${(ev: Event) => {
                          setEntityAnim(e.entity_id, 'on', opt.value);
                          ((ev.target as HTMLElement).closest('details') as HTMLDetailsElement)?.removeAttribute('open');
                        }}>
                        ${opt.value === 'none'
                          ? html`<span class="icon-cell-none">—</span>`
                          : renderAnimSvg(opt.value, true, `--ent-spd:1;color:${ANIM_COLORS[opt.value].on}`, 'icon-preview')}
                        <span class="icon-cell-label">${opt.label}</span>
                      </button>`)}
                  </div>
                </details>
                <details class="icon-picker-wrap">
                  <summary class="icon-picker-btn compact">
                    ${curOff !== 'none'
                      ? renderAnimSvg(curOff, false, `--ent-spd:1;color:${ANIM_COLORS[curOff].off}`, 'icon-preview-sm')
                      : html`<span class="icon-cell-none">—</span>`}
                  </summary>
                  <div class="icon-picker-grid flip">
                    ${ANIM_OPTIONS.map(opt => html`
                      <button class="icon-cell ${curOff === opt.value ? 'selected' : ''}"
                        title="${opt.group} ${opt.label}"
                        @click=${(ev: Event) => {
                          setEntityAnim(e.entity_id, 'off', opt.value);
                          ((ev.target as HTMLElement).closest('details') as HTMLDetailsElement)?.removeAttribute('open');
                        }}>
                        ${opt.value === 'none'
                          ? html`<span class="icon-cell-none">—</span>`
                          : renderAnimSvg(opt.value, false, `--ent-spd:1;color:${ANIM_COLORS[opt.value].off}`, 'icon-preview')}
                        <span class="icon-cell-label">${opt.label}</span>
                      </button>`)}
                  </div>
                </details>
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
        ` : nothing}
        <button class="room-style-btn" style="align-self:flex-end;margin-top:2px" @click=${() => {
          const updated = { ...(this._config.device_styles ?? {}) };
          delete updated[deviceId];
          this._set('device_styles', Object.keys(updated).length ? updated : undefined);
        }}>Clear device style</button>
      </div>`;
  }

  private _renderRoomStyleInline(name: string): TemplateResult {
    const st: AreaStyle = this._config.area_styles?.[name] ?? {};
    const tab = this._styleTab[name] ?? 'background';
    const setTab = (t:string) => { this._styleTab = {...this._styleTab, [name]: t}; };

    const colorRow = (label: string, key: keyof AreaStyle, def: string) => {
      const currentVal = (st as any)[key] ?? def;
      return html`
      <div class="color-row">
        <div class="color-preview-swatch" style="background:${currentVal}"></div>
        <span class="color-key">${label}</span>
        <input type="color" .value=${currentVal}
          @change=${(e:Event)=>this._setAreaStyle(name, key, (e.target as HTMLInputElement).value)}/>
        ${(st as any)[key] ? html`<button class="color-reset" @click=${()=>this._setAreaStyle(name,key,undefined)}>↺</button>` : nothing}
      </div>`;
    };

    const slRow = (label: string, key: keyof AreaStyle, min: number, max: number, step: number, def: number, unit: string) => html`
      <div class="sl-row">
        <span class="color-key">${label}</span>
        <input type="range" min="${min}" max="${max}" step="${step}" style="flex:1;accent-color:#f4601e"
          .value=${String((st as any)[key] ?? def)}
          @input=${(e:Event)=>this._setAreaStyle(name,key,parseInt((e.target as HTMLInputElement).value,10))}/>
        <span class="sl-val">${(st as any)[key] ?? def}${unit}</span>
      </div>`;

    const tabContent =
      tab === 'background' ? html`
        ${colorRow('Color', 'bgColor', '#1c1c1e')}
        <div class="color-row">
          <span class="color-key">Image</span>
          <input type="file" accept="image/*" hidden data-upload="${name}" @change=${(e:Event)=>this._handleUpload(name,e)}/>
          <button class="upload-btn" @click=${()=>this._triggerUpload(name)}>↑ Upload</button>
          <input type="text" class="inline-text" placeholder="/local/img.jpg"
            .value=${st.bgImage?.startsWith('data:') ? '(embedded)' : (st.bgImage ?? '')}
            @change=${(e:Event)=>{const v=(e.target as HTMLInputElement).value;this._setAreaStyle(name,'bgImage',v&&v!=='(embedded)'?v:undefined);}}/>
          ${st.bgImage ? html`<button class="color-reset" @click=${()=>this._setAreaStyle(name,'bgImage',undefined)}>↺</button>` : nothing}
        </div>` :
      tab === 'header' ? html`
        ${colorRow('Gradient start','headerBgColor','#1a1a2e')}
        ${colorRow('Gradient end','headerBgColor2','#0f3460')}
        ${colorRow('Text color','textColor','#f4601e')}
        ${slRow('Font size','fontSize',8,32,1,12,'px')}` :
      tab === 'tiles' ? html`
        ${colorRow('Tile bg','tileBgColor','#1c1c1e')}
        ${slRow('Opacity','tileOpacity',0,100,1,100,'%')}
        ${colorRow('Border','tileBorderColor','#ffffff')}
        ${slRow('Radius','tileBorderRadius',0,20,1,12,'px')}
        ${colorRow('Accent','accentColor','#f4601e')}` :
      html`
        ${slRow('Columns','columns',1,6,1,3,'')}
        ${slRow('Gap','tileGap',4,24,2,10,'px')}
        ${slRow('Border width','borderWidth',0,8,1,1,'px')}
        ${slRow('Border radius','borderRadius',0,32,2,10,'px')}`;

    return html`
      <div class="room-style-panel">
        <div class="style-panel-hdr">
          <span>${name}</span>
          ${Object.keys(st).length ? html`<button class="clear-btn" @click=${()=>this._clearAreaStyle(name)}>Clear all</button>` : nothing}
        </div>
        <div class="style-tabs">
          ${(['background','header','tiles','layout'] as const).map(t => html`
            <button class="stab ${tab===t?'on':''}" @click=${()=>setTab(t)}>${t[0].toUpperCase()+t.slice(1)}</button>`)}
        </div>
        <div class="style-body">${tabContent}</div>
      </div>`;
  }


  // ══════════════════════════════════════════════════════════════
  //  TAB: LAYOUT
  // ══════════════════════════════════════════════════════════════

  private _renderLayoutTab(): TemplateResult {
    const c = this._config;

    const gridBody = html`
      <div class="field">
        <div class="field-lbl">Columns <span class="field-note">overridden per-room in Style tab</span></div>
        <div class="step-row">
          <button class="step-btn" @click=${()=>this._set('columns',Math.max(1,(c.columns??1)-1))}>−</button>
          <span class="step-val">${c.columns ?? 1}</span>
          <button class="step-btn" @click=${()=>this._set('columns',Math.min(6,(c.columns??1)+1))}>+</button>
          <input type="range" min="1" max="6" step="1" style="flex:1;margin-left:8px"
            .value=${String(c.columns ?? 1)}
            @input=${(e:Event)=>this._set('columns',parseInt((e.target as HTMLInputElement).value,10))}/>
        </div>
      </div>`;

    // Tile order drag list
    const tileOrderBody = html`
      <div class="preview-label">Live preview</div>
      <div class="tile-preview">
        <div class="tile-preview-hdr">
          <div style="display:flex;align-items:center;gap:6px">
            <div class="tp-dot"></div>
            <span style="font-size:12px;font-weight:600">Ljós yfir vaska</span>
          </div>
          <span class="tp-tog">ON</span>
        </div>
        <div class="tp-chips">
          <span class="tp-chip">235 V</span>
          <span class="tp-chip">44.6 °C</span>
          <span class="tp-chip">Good −54 dBm</span>
        </div>
        <div class="tp-graph">
          <svg viewBox="0 0 200 30" preserveAspectRatio="none" width="100%" height="100%">
            <polygon points="0,25 20,22 40,24 60,18 80,20 100,14 120,16 140,12 160,8 180,10 200,6 200,30 0,30" fill="#f4601e" fill-opacity="0.18"/>
            <polyline points="0,25 20,22 40,24 60,18 80,20 100,14 120,16 140,12 160,8 180,10 200,6" fill="none" stroke="#f4601e" stroke-width="1.2"/>
          </svg>
        </div>
        <div class="tp-bot">
          <span class="tp-power">4.1 W</span>
          <div style="display:flex;gap:4px">
            <span class="tp-badge" style="background:rgba(234,179,8,.2);color:#fde047">Dimmer</span>
            <span class="tp-badge" style="background:rgba(34,197,94,.2);color:#86efac">G3</span>
          </div>
        </div>
      </div>
      <div class="field-lbl" style="margin-bottom:8px">Drag to reorder · eye to hide</div>
      <div class="drag-list">
        ${this._dragOrder.map(blockId => {
          const meta = TILE_BLOCKS.find(b => b.id === blockId);
          if (!meta) return nothing;
          const isHidden = this._hiddenBlocks.has(blockId);
          const isDragOver = this._dragOver === blockId;
          return html`
            <div class="drag-item ${isHidden ? 'hidden-item' : ''} ${isDragOver ? 'drag-over' : ''}"
              draggable="true"
              @dragstart=${(e:DragEvent)=>{ e.dataTransfer!.setData('text', blockId); e.dataTransfer!.effectAllowed = 'move'; }}
              @dragenter=${(e:DragEvent)=>{ e.preventDefault(); this._dragOver = blockId; }}
              @dragover=${(e:DragEvent)=>{ e.preventDefault(); }}
              @dragleave=${()=>{ if (this._dragOver === blockId) this._dragOver = null; }}
              @drop=${(e:DragEvent)=>{
                e.preventDefault();
                const src = e.dataTransfer!.getData('text') as TileBlockId;
                if (!src || src === blockId) { this._dragOver = null; return; }
                const order = [...this._dragOrder];
                const si = order.indexOf(src), ti = order.indexOf(blockId);
                order.splice(si,1); order.splice(ti,0,src);
                this._dragOrder = order; this._dragOver = null;
                this._set('tile_layout', order.filter(id => !this._hiddenBlocks.has(id)));
              }}>
              <div class="drag-handle"><span></span><span></span><span></span></div>
              <div style="flex:1">
                <div class="drag-label">${meta.label}</div>
                <div class="drag-sub">${meta.sub}</div>
              </div>
              <button class="drag-eye" @click=${()=>{
                    const next = new Set(this._hiddenBlocks);
                    next.has(blockId) ? next.delete(blockId) : next.add(blockId);
                    this._hiddenBlocks = next;
                    const visible = this._dragOrder.filter(id => !next.has(id));
                    this._set('tile_layout', visible);
                  }} style="opacity:${isHidden ? 0.35 : 1}">👁</button>
            </div>`;
        })}
      </div>`;

    return html`
      ${this._sec('grid','⊟','rgba(45,212,191,0.1)','#2dd4bf','Grid', nothing, gridBody)}
      ${this._sec('tileorder','↕','rgba(244,96,30,0.12)','#f4601e','Tile Block Order',
        html`<span class="tag-new">Drag</span>`, tileOrderBody)}`;
  }

  // ══════════════════════════════════════════════════════════════
  //  TAB: STYLE
  // ══════════════════════════════════════════════════════════════

  private _renderStyleTab(): TemplateResult {
    const c = this._config;
    const sty = c.style ?? {};

    const hStyleSet = (key: string, val: unknown) => this._set('style', { ...sty, [key]: val });
    const hStyleDel = (key: string) => { const s={...sty}; delete (s as any)[key]; this._set('style', s); };
    const hColorRow = (label: string, key: string, def: string) => {
      const cur = (sty as any)[key] ?? def;
      return html`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${cur}"></div>
          <span class="color-key">${label}</span>
          <input type="color" .value=${cur}
            @change=${(e:Event) => hStyleSet(key, (e.target as HTMLInputElement).value)}/>
          ${(sty as any)[key] ? html`<button class="color-reset" @click=${() => hStyleDel(key)}>↺</button>` : nothing}
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
      <!-- Appearance sliders -->
      <div class="field">
        <div class="field-lbl">Title size — <span style="color:#f4601e">${(sty.header_title_size ?? 1.1).toFixed(1)}em</span></div>
        <input type="range" min="0.7" max="1.8" step="0.1" .value=${String(sty.header_title_size ?? 1.1)}
          @input=${(e:Event) => { const v=parseFloat((e.target as HTMLInputElement).value); hStyleSet('header_title_size', v===1.1?undefined:v); }}/>
      </div>
      <div class="field">
        <div class="field-lbl">Header height — <span style="color:#f4601e">${sty.header_padding ?? 16}px</span></div>
        <input type="range" min="6" max="40" step="2" .value=${String(sty.header_padding ?? 16)}
          @input=${(e:Event) => { const v=parseInt((e.target as HTMLInputElement).value); hStyleSet('header_padding', v===16?undefined:v); }}/>
      </div>
      <div class="field">
        <div class="field-lbl">Corner radius — <span style="color:#f4601e">${sty.header_radius ?? 0}px</span></div>
        <input type="range" min="0" max="24" step="2" .value=${String(sty.header_radius ?? 0)}
          @input=${(e:Event) => { const v=parseInt((e.target as HTMLInputElement).value); hStyleSet('header_radius', v===0?undefined:v); }}/>
      </div>
      <!-- Bottom border/separator -->
      <div class="field">
        <div class="field-lbl">Bottom border — <span style="color:#f4601e">${sty.header_border_width ?? 0}px</span></div>
        <input type="range" min="0" max="6" step="1" .value=${String(sty.header_border_width ?? 0)}
          @input=${(e:Event) => { const v=parseInt((e.target as HTMLInputElement).value); hStyleSet('header_border_width', v===0?undefined:v); }}/>
      </div>
      ${(sty.header_border_width ?? 0) > 0 ? hColorRow('Border color', 'header_border_color', '#4ade80') : nothing}
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
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show cloud chips</div>
        <label class="sw"><input type="checkbox" .checked=${c.header_show_cloud !== false}
          @change=${(e:Event) => this._set('header_show_cloud', (e.target as HTMLInputElement).checked ? undefined : false)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show glow orbs</div>
        <label class="sw"><input type="checkbox" .checked=${c.header_show_orbs !== false}
          @change=${(e:Event) => this._set('header_show_orbs', (e.target as HTMLInputElement).checked ? undefined : false)}>
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
        <div class="field-lbl">Background opacity — <span style="color:#f4601e">${c.header_opacity ?? 100}%</span></div>
        <input type="range" min="0" max="100" step="5" .value=${String(c.header_opacity ?? 100)}
          @input=${(e:Event) => { const v=parseInt((e.target as HTMLInputElement).value); this._set('header_opacity', v===100?undefined:v); }}/>
      </div>`;

    const colorRow = (label: string, key: string, def: string) => {
      const cur = (sty as any)[key] ?? def;
      return html`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${cur}"></div>
          <span class="color-key">${label}</span>
          <input type="color" .value=${cur}
            @change=${(e:Event)=>this._set('style',{...sty,[key]:(e.target as HTMLInputElement).value})}/>
          ${(sty as any)[key] ? html`<button class="color-reset" @click=${()=>{const s={...sty};delete(s as any)[key];this._set('style',s)}}>↺</button>` : nothing}
        </div>`;
    };
    const colorBody = html`
      ${colorRow('Dashboard BG',       'card_bg',           '#1c1c1e')}
      ${colorRow('Accent / brand',     'accent_color',      '#f4601e')}
      ${colorRow('Room header label',  'area_header_color', '#f4601e')}
      ${colorRow('Tile background',    'tile_bg',           '#1c1c1e')}
      ${colorRow('Tile border',        'tile_border',       '#2a2a30')}
      ${colorRow('Tile hover BG',      'tile_hover_bg',     'rgba(255,255,255,0.07)')}
      ${colorRow('Tile hover shadow',  'tile_hover_shadow', 'rgba(0,0,0,0.30)')}
      ${colorRow('Sensor chip BG',     'tile_sensor_bg',    'rgba(255,255,255,0.04)')}
      ${colorRow('Expanded panel BG',  'tile_exp_bg',       'rgba(255,255,255,0.06)')}
      ${colorRow('Text primary',       'text_primary',      '#e5e7eb')}
      ${colorRow('Text secondary',     'text_secondary',    '#9ca3af')}
      ${colorRow('Text muted',         'text_muted',        '#6b7280')}
      ${colorRow('Online dot',         'online_color',      '#4ade80')}
      ${colorRow('Offline dot',        'offline_color',     '#ef4444')}
      ${colorRow('Power reading',      'power_color',       '#fb923c')}`;

    const typogBody = html`
      <div class="field">
        <div class="field-lbl">Font family</div>
        <div class="pill-grp">
          ${FONT_OPTIONS.map(f => html`
            <span class="pill ${(sty.font_family ?? undefined) === f.value ? 'on' : ''}"
              @click=${() => {
                if (f.value === undefined) {
                  const { font_family: _ff, ...rest } = sty as any;
                  this._set('style', Object.keys(rest).length ? rest : undefined);
                } else {
                  this._set('style', { ...sty, font_family: f.value });
                }
              }}>${f.label}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Area label style</div>
        <div class="pill-grp">
          ${(['uppercase','capitalize','none'] as const).map(v => html`
            <span class="pill ${(sty.text_transform ?? 'uppercase') === v ? 'on' : ''}"
              @click=${() => this._set('style', { ...sty, text_transform: v })}>${v}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Text scale — <span style="color:#f4601e">${(sty.text_size_scale ?? 1).toFixed(2)}×</span></div>
        <input type="range" min="0.8" max="1.3" step="0.05" .value=${String(sty.text_size_scale ?? 1)}
          @input=${(e:Event) => this._set('style', { ...sty, text_size_scale: parseFloat((e.target as HTMLInputElement).value) })}/>
      </div>
      </div>`;

    const btnShape   = sty.button_shape   ?? 'pill';
    const btnVariant = sty.button_variant ?? 'fill';
    const btnSize    = sty.button_size    ?? 'md';
    const isSquarish = btnShape === 'square' || btnShape === 'circle';
    const previewRadius = btnShape === 'pill' ? '20px' : btnShape === 'rect' ? '6px' : btnShape === 'square' ? '6px' : '50%';
    const previewPad    = isSquarish
      ? (btnSize === 'sm' ? '3px 5px' : btnSize === 'lg' ? '6px 12px' : '4px 8px')
      : (btnSize === 'sm' ? '2px 8px' : btnSize === 'lg' ? '6px 16px' : '4px 12px');
    const previewFsize  = btnSize === 'sm' ? '10px' : btnSize === 'lg' ? '13px' : '11px';
    const previewAspect = isSquarish ? '1' : 'auto';
    const previewOnStyle = btnVariant === 'outline'
      ? `background:transparent;color:var(--accent);border:1px solid var(--accent);box-shadow:none`
      : btnVariant === 'ghost'
      ? `background:transparent;color:var(--accent);border:none;box-shadow:none`
      : `background:var(--accent);color:white;border:none`;
    const sharedPrevStyle = `border-radius:${previewRadius};padding:${previewPad};font-size:${previewFsize};aspect-ratio:${previewAspect};display:inline-flex;align-items:center;justify-content:center;`;
    const btnBody = html`
      <div class="btn-preview">
        <span class="preview-btn on" style="${sharedPrevStyle}${previewOnStyle}">ON</span>
        <span class="preview-btn off" style="${sharedPrevStyle}">OFF</span>
      </div>
      <div class="field">
        <div class="field-lbl">Shape</div>
        <div class="pill-grp">
          ${(['pill','rect','square','circle'] as const).map(v => html`
            <span class="pill ${(sty.button_shape ?? 'pill') === v ? 'on' : ''}" @click=${()=>this._set('style',{...sty,button_shape:v})}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Variant</div>
        <div class="pill-grp">
          ${(['fill','outline','ghost'] as const).map(v => html`
            <span class="pill ${(sty.button_variant ?? 'fill') === v ? 'on' : ''}" @click=${()=>this._set('style',{...sty,button_variant:v})}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Size</div>
        <div class="pill-grp">
          ${(['sm','md','lg'] as const).map((v,i) => html`
            <span class="pill ${(sty.button_size ?? 'md') === v ? 'on' : ''}" @click=${()=>this._set('style',{...sty,button_size:v})}>${['Small','Medium','Large'][i]}</span>`)}
        </div>
      </div>`;

    const cardTranspPct  = c.card_opacity  ?? 100;
    const tileTranspPct  = c.tile_opacity  ?? 100;
    const tileBgColor    = sty.tile_bg ?? 'rgba(255,255,255,0.04)';
    const cardBgColor    = sty.card_bg ?? '#1c1c1e';
    const tileRadius     = sty.tile_radius ?? 12;
    const tileBorder     = sty.tile_border ?? 'rgba(255,255,255,0.07)';
    const cardBgImageUrl  = c.card_bg_image ? `url('${c.card_bg_image}')` : 'none';
    const cardBgImageSize = c.card_bg_image_size === 'stretch' ? '100% 100%' : (c.card_bg_image_size ?? 'cover');
    const cardBgMixed = cardTranspPct < 100
      ? `color-mix(in srgb, ${cardBgColor} ${cardTranspPct}%, transparent)` : cardBgColor;
    const tileBgMixed = tileTranspPct < 100
      ? `color-mix(in srgb, ${tileBgColor} ${tileTranspPct}%, transparent)` : tileBgColor;

    const tilesBody = html`
      <div class="preview-label">Live preview</div>
      <div class="transp-preview" style="background-color:${cardBgColor};background-image:${cardBgImageUrl};background-size:${cardBgImageSize};background-position:center;">
        <div class="transp-card-layer" style="background-color:${cardBgMixed};">
          ${[0,1,2].map(i => html`
            <div class="transp-tile" style="background-color:${tileBgMixed};border-radius:${tileRadius}px;border:1px solid ${tileBorder};">
              <div class="transp-tile-name">Device ${i+1}</div>
              <div class="transp-tile-chips">
                <div class="transp-chip"></div>
                <div class="transp-chip"></div>
              </div>
            </div>`)}
        </div>
      </div>

      <div class="field">
        <div class="field-lbl">Tile size</div>
        <div class="pill-grp">
          ${(['sm','md','lg'] as const).map((v,i) => html`
            <span class="pill ${(c.tile_size ?? 'md') === v ? 'on' : ''}" @click=${()=>this._set('tile_size',v)}>${['Small','Medium','Large'][i]}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Tile gap — <span style="color:#f4601e">${sty.tile_gap ?? 10}px</span></div>
        <input type="range" min="4" max="24" step="2" .value=${String(sty.tile_gap ?? 10)}
          @input=${(e:Event)=>this._set('style',{...sty,tile_gap:parseInt((e.target as HTMLInputElement).value,10)})}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile radius — <span style="color:#f4601e">${sty.tile_radius ?? 12}px</span></div>
        <input type="range" min="0" max="24" .value=${String(sty.tile_radius ?? 12)}
          @input=${(e:Event)=>this._set('style',{...sty,tile_radius:parseInt((e.target as HTMLInputElement).value,10)})}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile border width — <span style="color:#f4601e">${sty.tile_border_width ?? 1}px</span></div>
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
      <div class="field">
        <div class="field-lbl">Card corner radius — <span style="color:#f4601e">${sty.card_radius ?? 12}px</span></div>
        <input type="range" min="0" max="32" step="2" .value=${String(sty.card_radius ?? 12)}
          @input=${(e:Event)=>{ const v=parseInt((e.target as HTMLInputElement).value); this._set('style',{...sty,card_radius:v===12?undefined:v}); }}/>
      </div>

      <div class="tiles-divider">Transparency</div>
      <div class="field">
        <div class="field-lbl">Card — <span style="color:#f4601e">${100 - cardTranspPct}%</span></div>
        <input type="range" min="0" max="100" .value=${String(100 - cardTranspPct)}
          @input=${(e:Event)=>this._set('card_opacity', 100 - parseInt((e.target as HTMLInputElement).value,10))}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tiles — <span style="color:#f4601e">${100 - tileTranspPct}%</span></div>
        <input type="range" min="0" max="100" .value=${String(100 - tileTranspPct)}
          @input=${(e:Event)=>this._set('tile_opacity', 100 - parseInt((e.target as HTMLInputElement).value,10))}/>
      </div>

      <div class="tiles-divider">Backgrounds</div>
      <div class="field">
        <div class="field-lbl">Card background image</div>
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="card-bg"
            @change=${(e:Event) => this._handleCardBgUpload(e)}/>
          <button class="upload-btn" @click=${() => {
            (this.renderRoot.querySelector('input[data-upload="card-bg"]') as HTMLInputElement|null)?.click();
          }}>↑ Local</button>
          <input type="text" class="inline-text" placeholder="/local/image.png or https://…"
            .value=${c.card_bg_image?.startsWith('data:') ? '(embedded)' : (c.card_bg_image ?? '')}
            @change=${(e:Event) => {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v && v !== '(embedded)') this._set('card_bg_image', v); else this._set('card_bg_image', undefined);
            }}/>
          ${c.card_bg_image ? html`<button class="color-reset" @click=${() => {
            const updated = { ...this._config };
            delete (updated as any).card_bg_image;
            delete (updated as any).card_bg_image_size;
            fireEvent(this, 'config-changed', { config: updated });
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
      </div>
      <div class="field">
        <div class="field-lbl">Tile background image</div>
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="tile-bg"
            @change=${(e:Event) => this._handleTileBgUpload(e)}/>
          <button class="upload-btn" @click=${() => {
            (this.renderRoot.querySelector('input[data-upload="tile-bg"]') as HTMLInputElement|null)?.click();
          }}>↑ Local</button>
          <input type="text" class="inline-text" placeholder="/local/image.png or https://…"
            .value=${sty.tile_bg_image?.startsWith('data:') ? '(embedded)' : (sty.tile_bg_image ?? '')}
            @change=${(e:Event) => {
              const v = (e.target as HTMLInputElement).value.trim();
              const next = { ...sty };
              if (v && v !== '(embedded)') next.tile_bg_image = v; else delete (next as any).tile_bg_image;
              this._set('style', Object.keys(next).length ? next : undefined);
            }}/>
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
      </div>`;

    const allAreas = this._getAreas();
    const styledCount = Object.keys(c.area_styles ?? {}).length;
    const roomStylesBody = html`
      ${allAreas.length === 0 ? html`<div class="field-hint">No rooms configured in Home Assistant.</div>` :
        allAreas.map(area => {
          const isExpanded = this._expandedRooms.has(area.name);
          const hasStyle = !!(c.area_styles?.[area.name] && Object.keys(c.area_styles[area.name]).length);
          const roomSt = c.area_styles?.[area.name] ?? {};
          const swatches = [roomSt.bgColor, roomSt.headerBgColor, roomSt.tileBgColor, roomSt.accentColor].filter(Boolean) as string[];
          return html`
            <div class="room-style-row">
              <div class="room-style-hdr" @click=${()=>{
                const next = new Set(this._expandedRooms);
                next.has(area.name) ? next.delete(area.name) : next.add(area.name);
                this._expandedRooms = next;
              }}>
                <span class="room-style-name">${area.name}</span>
                ${swatches.length ? html`
                  <div class="room-swatch-strip">
                    ${swatches.map(c => html`<span class="room-swatch" style="background:${c}"></span>`)}
                  </div>` : nothing}
                ${hasStyle && !swatches.length ? html`<span class="room-styled-dot"></span>` : nothing}
                <span class="room-style-chev">${isExpanded ? '▲' : '▼'}</span>
              </div>
              ${isExpanded ? this._renderRoomStyleInline(area.name) : nothing}
            </div>`;
        })}`;

    return html`
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
      ${this._sec('header','◈','rgba(99,102,241,0.1)','#818cf8','Header', nothing, headerBody)}
      ${this._sec('colors','◐','rgba(244,96,30,0.12)','#f4601e','Colors', nothing, colorBody)}
      ${this._sec('tiles','⊡','rgba(45,212,191,0.1)','#2dd4bf','Tiles', nothing, tilesBody)}
      ${this._sec('typography','T','rgba(251,191,36,0.1)','#fbbf24','Typography', nothing, typogBody)}
      ${this._sec('buttons','⬭','rgba(74,222,128,0.1)','#4ade80','Buttons', nothing, btnBody)}
      ${this._sec('roomstyles','⌂','rgba(74,222,128,0.08)','#4ade80','Per-Room Styles',
        styledCount ? this._badge(`${styledCount} styled`, '#4ade80', 'rgba(74,222,128,0.1)') : nothing,
        roomStylesBody)}`;
  }


  // ══════════════════════════════════════════════════════════════
  //  TAB: GRAPHS
  // ══════════════════════════════════════════════════════════════

  private _renderGraphsTab(): TemplateResult {
    const c = this._config;
    const gs = c.graph_style ?? {};
    const graphType = gs.type ?? 'line';
    const sensorColors = c.graph_sensor_colors ?? {};
    const getColor = (key: string) => sensorColors[key] ?? GRAPH_SENSOR_DEFS_LOCAL.find(s=>s.key===key)?.color ?? '#f4601e';

    const gtBody = html`
      <div class="field">
        <div class="field-lbl">Type</div>
        <div class="pill-grp">
          ${(['line','area','bar'] as const).map(t => html`
            <span class="pill ${graphType === t ? 'on' : ''}" @click=${()=>this._set('graph_style',{...gs,type:t})}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field" style="opacity:${graphType==='bar'?0.4:1}">
        <div class="field-lbl">Line thickness — <span style="color:#f4601e">${gs.line_width ?? 1.5}px</span></div>
        <input type="range" min="0.5" max="4" step="0.5" ?disabled=${graphType==='bar'} .value=${String(gs.line_width ?? 1.5)}
          @input=${(e:Event)=>this._set('graph_style',{...gs,line_width:parseFloat((e.target as HTMLInputElement).value)})}/>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Fill area under line</div>
        <label class="sw"><input type="checkbox" .checked=${gs.fill !== false} @change=${(e:Event)=>this._set('graph_style',{...gs,fill:(e.target as HTMLInputElement).checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="field">
        <div class="field-lbl">Graph height — <span style="color:#f4601e">${gs.height ?? 32}px</span></div>
        <input type="range" min="20" max="80" step="4" .value=${String(gs.height ?? 32)}
          @input=${(e:Event)=>this._set('graph_style',{...gs,height:parseInt((e.target as HTMLInputElement).value,10)})}/>
      </div>
      <div class="field">
        <div class="field-lbl">History window — <span style="color:#f4601e">${c.graph_hours ?? 24}h</span></div>
        <input type="range" min="1" max="168" step="1" .value=${String(c.graph_hours ?? 24)}
          @input=${(e:Event)=>this._set('graph_hours',parseInt((e.target as HTMLInputElement).value,10))}/>
      </div>
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
      </div>`;

    const selectedGraphs = c.graph_sensors ?? [];
    const colorBody = selectedGraphs.length ? html`
      ${selectedGraphs.map(key => {
        const meta = GRAPH_SENSOR_DEFS_LOCAL.find(s => s.key === key);
        const color = getColor(key);
        const isCustom = !!sensorColors[key];
        return html`
          <div class="color-row">
            <div class="color-preview-swatch" style="background:${color}"></div>
            <span class="color-key">${meta?.label ?? key}</span>
            <input type="color" .value=${color}
              @change=${(e:Event)=>{
                const v = (e.target as HTMLInputElement).value;
                this._set('graph_sensor_colors', {...sensorColors,[key]:v});
              }}/>
            ${isCustom ? html`<button class="color-reset" @click=${()=>{
              const next={...sensorColors}; delete next[key];
              this._set('graph_sensor_colors', Object.keys(next).length ? next : undefined);
            }}>↺</button>` : nothing}
          </div>`;
      })}
      <div class="field" style="margin-top:10px">
        <div class="field-lbl">Which sensors to graph</div>
        <div class="pill-grp">
          ${GRAPH_SENSOR_DEFS_LOCAL.map(s => html`
            <span class="pill ${selectedGraphs.includes(s.key) ? 'on' : ''}" @click=${()=>{
              const next = selectedGraphs.includes(s.key) ? selectedGraphs.filter(k=>k!==s.key) : [...selectedGraphs,s.key];
              this._set('graph_sensors', next);
            }}>${s.label}</span>`)}
        </div>
      </div>` :
      html`<div class="empty-hint">No graph sensors selected yet. Add them in the Sensors tab or here:</div>
      <div class="pill-grp" style="margin-top:8px">
        ${GRAPH_SENSOR_DEFS_LOCAL.map(s => html`
          <span class="pill" @click=${()=>this._set('graph_sensors',[...(c.graph_sensors??[]),s.key])}>${s.label}</span>`)}
      </div>`;

    return html`
      ${this._sec('graphtype','∿','rgba(45,212,191,0.1)','#2dd4bf','Graph Type', nothing, gtBody)}
      ${this._sec('graphcolors','◐','rgba(244,96,30,0.12)','#f4601e','Per-sensor Colors', nothing, colorBody)}`;
  }

  // ══════════════════════════════════════════════════════════════
  //  TAB: SENSORS
  // ══════════════════════════════════════════════════════════════

  private _renderSensorsTab(): TemplateResult {
    const c = this._config;
    const selected = c.sensors ?? [];

    return html`
      ${SENSOR_GROUPS.map(grp => {
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
              const isGraphable = !!GRAPH_SENSOR_DEFS_LOCAL.find(g => g.key === s.key);
              const graphSensors = c.graph_sensors ?? [];
              const graphOn = graphSensors.includes(s.key);
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
                      const next = graphOn ? graphSensors.filter(k=>k!==s.key) : [...graphSensors, s.key];
                      this._set('graph_sensors', next);
                    }}>∿</button>` : nothing}
                </div>`;
            })}
          </div>`;
        return this._sec(grp.group.toLowerCase().replace(' ',''), grp.icon, grp.iconBg, grp.iconColor, grp.group, badge, body);
      })}`;
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

  protected render(): TemplateResult {
    if (!this._config) return html``;
    const c = this._config;
    type TabId = 'devices'|'layout'|'graphs'|'yaml';
    const tabs: Array<{id:TabId;label:string;icon:string}> = [
      {id:'devices',label:'Rooms',icon:'⌂'},
      {id:'layout',label:'Layout & Style',icon:'⊡'},
      {id:'graphs',label:'Graphs & Sensors',icon:'∿'},
      {id:'yaml',label:'YAML',icon:'</>'},
    ];
    return html`
      <div class="shell">
        <div class="tab-nav">
          ${tabs.map(t => html`
            <div class="tab ${this._tab===t.id?'active':''}" @click=${()=>{this._tab=t.id;}}>
              <span class="tab-icon">${t.icon}</span>${t.label}
            </div>`)}
        </div>
        <div class="tab-body">
          ${this._tab==='devices' ? this._renderDevicesTab()
           :this._tab==='layout'  ? html`${this._renderLayoutTab()}${this._renderStyleTab()}`
           :this._tab==='graphs'  ? html`${this._renderGraphsTab()}${this._renderSensorsTab()}`
           :                        this._renderYamlTab()}
        </div>
      </div>`;
  }


  static styles = [ANIM_CSS, css`
    :host { display:block; font-family:'DM Sans',sans-serif; }
    * { box-sizing:border-box; }

    /* ── CSS vars ── */
    .shell {
      --bg:#0f0f12; --s1:#17171c; --s2:#1e1e26; --s3:#25252f;
      --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
      --text:#e2e2e8; --t2:#888896; --t3:#555560;
      --accent:#f4601e; --accentbg:rgba(244,96,30,0.12); --accentbdr:rgba(244,96,30,0.3);
      --blue:#4a9eff; --green:#4ade80; --purple:#a78bfa; --teal:#2dd4bf; --amber:#fbbf24;
      background:var(--bg); color:var(--text); border-radius:8px; overflow:hidden;
    }

    /* ── Tab nav ── */
    .tab-nav { display:flex; gap:2px; padding:10px 16px 0; border-bottom:1px solid var(--border); background:var(--s1); overflow-x:auto; }
    .tab-nav::-webkit-scrollbar { height:0; }
    .tab { font-size:11px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; padding:8px 14px; color:var(--t3); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .15s; border-radius:5px 5px 0 0; user-select:none; display:flex; align-items:center; }
    .tab:hover { color:var(--t2); }
    .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
    .tab-icon { margin-right:5px; font-size:10px; opacity:0.7; }
    .tab-body { padding:14px; background:var(--bg); max-height:70vh; overflow-y:auto; }
    .tab-body::-webkit-scrollbar { width:3px; }
    .tab-body::-webkit-scrollbar-thumb { background:var(--s3); border-radius:2px; }

    /* ── Section accordion ── */
    .sec { border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-bottom:6px; }
    .sec-hdr { display:flex; align-items:center; justify-content:space-between; padding:11px 14px; cursor:pointer; user-select:none; background:var(--s2); transition:background .12s; }
    .sec-hdr:hover { background:var(--s3); }
    .sec-hdr-l { display:flex; align-items:center; gap:9px; }
    .sec-ico { width:22px; height:22px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
    .sec-title { font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:var(--text); }
    .sec-hdr-r { display:flex; align-items:center; gap:8px; }
    .sec-badge { font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px; }
    .chev { font-size:10px; color:var(--t3); transition:transform .2s; }
    .sec.open .chev { transform:rotate(180deg); }
    .sec-body { display:none; padding:14px; border-top:1px solid var(--border); background:var(--bg); }
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
    input[type="text"] { background:var(--s2); border:1px solid var(--border2); border-radius:8px; padding:7px 11px; font-size:12px; color:var(--text); outline:none; width:100%; }
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

    /* ── Color row ── */
    .color-row { display:flex; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid var(--border); }
    .color-row:last-child { border-bottom:none; }
    .color-key { font-size:12px; color:var(--t2); flex:1; min-width:0; }
    .color-val { font-family:monospace; font-size:10px; color:var(--t3); min-width:60px; text-align:right; }
    .color-reset { font-size:11px; color:var(--t3); background:none; border:none; cursor:pointer; padding:2px 4px; border-radius:3px; transition:color .15s; }
    .color-reset:hover { color:var(--accent); }
    input[type="color"] { width:36px; height:28px; border:1px solid var(--border2); border-radius:5px; padding:2px 3px; background:var(--s2); cursor:pointer; flex-shrink:0; }
    .color-preview-swatch { width:20px; height:20px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); flex-shrink:0; }
    .sl-row { display:flex; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid var(--border); }
    .sl-row:last-child { border-bottom:none; }
    .sl-val { font-family:monospace; font-size:11px; color:var(--accent); min-width:36px; text-align:right; }
    .inline-text { flex:1; background:var(--s2); border:1px solid var(--border2); border-radius:6px; padding:4px 8px; font-size:11px; color:var(--text); outline:none; min-width:0; }
    .bg-img-row { display:flex; align-items:center; gap:6px; }
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
    .room-device-row { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
    .room-device-row:last-child { border-bottom:none; }
    .room-device-name { flex:1; font-size:11px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .room-device-empty { font-size:11px; color:var(--t3); padding:6px 0; }
    .dev-style-dot { width:5px; height:5px; border-radius:50%; background:var(--accent); flex-shrink:0; }
    .dev-style-panel { background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:10px 12px; margin:2px 0 6px 18px; display:flex; flex-direction:column; gap:8px; }
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
    .icon-picker-wrap { position:relative; display:inline-block; flex:1; }
    .icon-picker-wrap summary { list-style:none; }
    .icon-picker-wrap summary::-webkit-details-marker { display:none; }
    .icon-picker-btn { cursor:pointer; display:flex; align-items:center; gap:5px; padding:4px 8px; border-radius:6px; background:var(--s3,#1e1e1e); border:1px solid var(--border,#333); color:var(--text); min-height:26px; }
    .icon-picker-btn:hover { border-color:var(--acc,#f4601e); }
    .icon-picker-grid { position:absolute; z-index:20; top:calc(100% + 4px); left:0; display:grid; grid-template-columns:repeat(6,1fr); gap:3px; padding:8px; background:var(--s2,#1a1a1a); border:1px solid var(--border2,#444); border-radius:8px; width:240px; max-height:280px; overflow-y:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5); }
    .icon-picker-grid.flip { left:auto; right:0; }
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

    /* ── Tile mini preview ── */
    .tile-preview { background:#141418; border:1px solid var(--border); border-radius:12px; padding:12px; margin-bottom:12px; position:relative; overflow:hidden; }
    .tile-preview::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,var(--accent),transparent); }
    .tile-preview-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .tp-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; }
    .tp-tog { font-size:9px; font-weight:700; padding:3px 9px; border-radius:12px; background:var(--accent); color:white; letter-spacing:0.08em; }
    .tp-chips { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px; }
    .tp-chip { font-size:9px; padding:2px 7px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:4px; color:var(--t2); }
    .tp-graph { height:30px; background:rgba(255,255,255,0.03); border-radius:4px; overflow:hidden; }
    .tp-bot { display:flex; align-items:center; justify-content:space-between; margin-top:7px; }
    .tp-power { font-size:13px; font-weight:700; color:var(--accent); }
    .tp-badge { font-size:8px; font-weight:700; padding:1px 5px; border-radius:3px; letter-spacing:0.04em; }


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
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-device-dashboard-editor': HADeviceDashboardEditor;
  }
}
