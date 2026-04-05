import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { HADeviceDashboardConfig, AreaStyle, TileBlockId } from './types';
import { getAllDevices, GRAPH_SENSOR_DEFS } from './helpers';

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_OPTIONS: Array<{ label: string; value: string | undefined }> = [
  { label: 'Default',  value: undefined },
  { label: 'Inter',    value: 'Inter, sans-serif' },
  { label: 'Roboto',   value: 'Roboto, sans-serif' },
  { label: 'Mono',     value: "'IBM Plex Mono', monospace" },
  { label: 'System',   value: 'system-ui, sans-serif' },
];

const INTEGRATIONS = [
  { key: 'shelly',  label: 'Shelly',               badge: 'SHELLY', color: '#f4601e', bg: 'rgba(244,96,30,0.2)' },
  { key: 'zha',     label: 'Zigbee Home Automation',badge: 'ZHA',   color: '#4a9eff', bg: 'rgba(74,158,255,0.2)' },
  { key: 'z2m',     label: 'Zigbee2MQTT',           badge: 'Z2M',   color: '#a78bfa', bg: 'rgba(167,139,250,0.2)' },
  { key: 'hue',     label: 'Philips Hue',           badge: 'HUE',   color: '#2dd4bf', bg: 'rgba(45,212,191,0.2)' },
  { key: 'esphome', label: 'ESPHome',               badge: 'ESP',   color: '#4ade80', bg: 'rgba(74,222,128,0.2)' },
  { key: 'mqtt',    label: 'MQTT',                  badge: 'MQTT',  color: '#fbbf24', bg: 'rgba(251,191,36,0.2)' },
  { key: 'tasmota', label: 'Tasmota',               badge: 'TASMO', color: '#fb923c', bg: 'rgba(251,146,60,0.2)' },
  { key: 'matter',  label: 'Matter',                badge: 'MATTER',color: '#818cf8', bg: 'rgba(129,140,248,0.2)' },
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
  { id: 'power_bar',     label: 'Power bar',          sub: 'Mini usage bar at tile bottom' },
  { id: 'badges',        label: 'Type & gen badges',  sub: 'Dimmer · G3 · Relay labels' },
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
  @state() private _tab: 'devices'|'layout'|'style'|'graphs'|'sensors'|'yaml' = 'devices';
  @state() private _openSections: Record<string, boolean> = {
    integrations: true, rooms: true, sortview: false,
    grid: true, tileorder: true,
    colors: true, tiles: true, typography: false, buttons: false, roomstyles: false,
    graphtype: true, graphcolors: false,
    electrical: true, environmental: true, deviceinfo: false, alerts: false,
  };
  @state() private _expandedRooms: Set<string> = new Set();
  @state() private _expandedDevices: Set<string> = new Set();
  @state() private _deviceSearch = '';
  @state() private _bgEditArea: string | null = null;
  @state() private _styleTab: Record<string, string> = {};
  @state() private _hiddenBlocks: Set<TileBlockId> = new Set(['badges']);
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
    const integrations = c.integrations ?? [];
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
    const allHA = this._getAllHADevices();
    const extraDevices = c.extra_devices ?? [];
    const hiddenDevices = c.hidden_devices ?? [];
    const hiddenEntities = c.hidden_entities ?? [];

    // Count devices per integration
    const intCounts: Record<string, number> = {};
    if (this.hass) {
      const er: Record<string,any> = (this.hass as any).entities ?? {};
      for (const e of Object.values(er)) {
        const p = (e as any).platform?.toLowerCase() ?? '';
        if (p) intCounts[p] = (intCounts[p] ?? 0) + 1;
      }
    }

    const allIntKeys = INTEGRATIONS.map(i => i.key);
    const toggleIntegration = (key: string) => {
      // undefined/[] = all on. Toggling OFF one builds an explicit include list of all others.
      // Toggling the last one back ON resets to undefined (show all).
      const currentlyOn = integrations.length === 0
        ? new Set(allIntKeys)
        : new Set(integrations);
      if (currentlyOn.has(key)) {
        currentlyOn.delete(key);
      } else {
        currentlyOn.add(key);
      }
      // If all are on, reset to undefined (= show all, no filter)
      const next = currentlyOn.size === allIntKeys.length
        ? undefined
        : [...currentlyOn];
      this._set('integrations', next);
    };

    // Build device tree by area
    const byArea = new Map<string, Array<{device_id:string;name:string}>>();
    for (const dev of allDiscovered) {
      const key = dev.area ?? '';
      if (!byArea.has(key)) byArea.set(key, []);
      byArea.get(key)!.push(dev);
    }
    for (const id of extraDevices) {
      if (allDiscovered.find(d => d.device_id === id)) continue;
      const dev = allHA.find(d => d.device_id === id);
      if (!dev) continue;
      const key = dev.area ?? '';
      if (!byArea.has(key)) byArea.set(key, []);
      if (!byArea.get(key)!.find(d => d.device_id === id))
        byArea.get(key)!.push({ device_id: dev.device_id, name: dev.name });
    }
    const areaKeys = [...allAreas.map(a => a.name)];
    if (byArea.has('')) areaKeys.push('');

    const q = this._deviceSearch.toLowerCase().trim();
    const searchFiltered = q.length >= 1
      ? allHA.filter(d => d.name.toLowerCase().includes(q) || (d.area ?? '').toLowerCase().includes(q)).slice(0, 20)
      : [];

    // Integration section
    const intBody = html`
      <div class="field-lbl">Show devices from</div>
      ${INTEGRATIONS.map(int => {
        const isOn = integrations.length === 0 || integrations.includes(int.key);
        const count = intCounts[int.key] ?? 0;
        return html`
          <div class="int-row">
            <span class="int-badge" style="color:${int.color};background:${int.bg}">${int.badge}</span>
            <span class="int-name">${int.label}</span>
            ${count ? html`<span class="int-count">${count} entities</span>` : nothing}
            <label class="sw"><input type="checkbox" .checked=${isOn} @change=${()=>toggleIntegration(int.key)}><span class="sw-t"></span><span class="sw-b"></span></label>
          </div>`;
      })}
      <div class="divider"></div>
      <div class="tog-row">
        <div><div class="tog-lbl">Include virtual entities</div><div class="tog-sub">Scripts, scenes, automations, helpers</div></div>
        <label class="sw"><input type="checkbox" .checked=${c.include_entities ?? false} @change=${(e:Event)=>this._set('include_entities',(e.target as HTMLInputElement).checked)}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>`;

    const onCount = selectedAreas === undefined ? allAreas.length : selectedAreas.length;
    const roomsBadge = this._badge(`${onCount} / ${allAreas.length}`, '#4ade80', 'rgba(74,222,128,0.1)');

    // Room rows
    const roomBody = html`
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
              this._tab = 'style';
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
      })}
      <!-- Extra device search -->
      <div class="room-extra">
        <div class="field-lbl" style="margin-top:10px">Pin extra devices</div>
        <div class="search-wrap">
          <span class="search-ico">⌕</span>
          <input type="text" placeholder="Search by name or area…" .value=${this._deviceSearch}
            @input=${(e:Event)=>{ this._deviceSearch = (e.target as HTMLInputElement).value; }}/>
        </div>
        ${q.length >= 1 ? html`
          <div class="search-results">
            ${searchFiltered.length ? searchFiltered.map(d => {
              const pinned = extraDevices.includes(d.device_id);
              return html`<div class="search-row ${pinned ? 'pinned' : ''}" @click=${()=>{
                if (pinned) return;
                this._set('extra_devices', [...extraDevices, d.device_id]);
                this._deviceSearch = '';
              }}>
                <span class="search-name">${d.name}</span>
                ${d.area ? html`<span class="search-area">${d.area}</span>` : nothing}
                ${pinned ? html`<span style="color:#f4601e;font-size:10px">✓</span>` : nothing}
              </div>`;
            }) : html`<div class="search-empty">No devices match "${q}"</div>`}
          </div>` : nothing}
        ${extraDevices.length ? html`
          <div class="pinned-chips">
            ${extraDevices.map(id => {
              const dev = allHA.find(d=>d.device_id===id);
              return html`<span class="pinned-chip" @click=${()=>{
                const next = extraDevices.filter(x=>x!==id);
                this._set('extra_devices', next.length ? next : undefined);
              }}>${dev?.name ?? id} ✕</span>`;
            })}
          </div>` : nothing}
      </div>`;

    const sortBody = html`
      <div class="field">
        <div class="field-lbl">Sort devices by</div>
        <div class="pill-grp">
          ${(['name','power','online'] as const).map(v => html`
            <span class="pill ${(c.sort_by ?? 'name') === v ? 'on' : ''}" @click=${()=>this._set('sort_by',v)}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">View mode</div>
        <div class="pill-grp">
          ${(['grid','list','compact'] as const).map(v => html`
            <span class="pill ${(c.view_mode ?? 'grid') === v ? 'on' : ''}" @click=${()=>this._set('view_mode',v)}>${v[0].toUpperCase()+v.slice(1)}</span>`)}
        </div>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Show offline devices</div>
        <label class="sw"><input type="checkbox" .checked=${c.show_offline !== false} @change=${(e:Event)=>this._set('show_offline',(e.target as HTMLInputElement).checked)}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      `;

    return html`
      ${this._sec('integrations','⬡','rgba(74,158,255,0.1)','#4a9eff','Integrations',
        this._badge('active','#4a9eff','rgba(74,158,255,0.1)'), intBody)}
      ${this._sec('rooms','⌂','rgba(74,222,128,0.1)','#4ade80','Rooms', roomsBadge, roomBody)}
      ${this._sec('sortview','⊞','rgba(167,139,250,0.1)','#a78bfa','Sort & View', nothing, sortBody)}`;
  }

  private _setDeviceStyle(deviceId: string, patch: Partial<{ color: string | undefined; tile_layout: TileBlockId[] | undefined }>) {
    const current = this._config.device_styles?.[deviceId] ?? {};
    const next: Record<string, unknown> = { ...current, ...patch };
    if (next['color'] === undefined) delete next['color'];
    if (next['tile_layout'] === undefined) delete next['tile_layout'];
    const allStyles = { ...(this._config.device_styles ?? {}), [deviceId]: next };
    if (!Object.keys(next).length) delete allStyles[deviceId];
    this._set('device_styles', Object.keys(allStyles).length ? allStyles : undefined);
  }

  private _renderDeviceStyleInline(deviceId: string): TemplateResult {
    const devStyle = this._config.device_styles?.[deviceId] ?? {};
    const globalLayout: TileBlockId[] = this._config.tile_layout ?? TILE_BLOCKS.map(b => b.id);
    const devLayout: TileBlockId[] | null = (devStyle as any).tile_layout ?? null;

    const toggleBlock = (blockId: TileBlockId) => {
      const isVisible = devLayout === null ? globalLayout.includes(blockId) : devLayout.includes(blockId);
      const next = TILE_BLOCKS.map(b => b.id).filter(id => {
        if (id === blockId) return !isVisible;
        return devLayout === null ? globalLayout.includes(id) : devLayout.includes(id);
      });
      const sameAsGlobal = next.length === globalLayout.length && next.every(id => globalLayout.includes(id));
      this._setDeviceStyle(deviceId, { tile_layout: sameAsGlobal ? undefined : next });
    };

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
        <div class="field-lbl" style="margin-bottom:4px">Visible blocks</div>
        <div class="block-toggles">
          ${TILE_BLOCKS.map(b => {
            const on = devLayout === null ? globalLayout.includes(b.id) : devLayout.includes(b.id);
            return html`<span class="block-tog ${on ? 'on' : ''}" @click=${() => toggleBlock(b.id)}>
              ${on ? '👁' : '○'} ${b.label}
            </span>`;
          })}
        </div>
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

    const colorRow = (label: string, key: keyof AreaStyle, def: string) => html`
      <div class="color-row">
        <span class="color-key">${label}</span>
        <span class="color-val">${(st as any)[key] ?? def}</span>
        <input type="color" .value=${(st as any)[key] ?? def}
          @change=${(e:Event)=>this._setAreaStyle(name, key, (e.target as HTMLInputElement).value)}/>
        ${(st as any)[key] ? html`<button class="color-reset" @click=${()=>this._setAreaStyle(name,key,undefined)}>↺</button>` : nothing}
      </div>`;

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


    const colorBody = html`
      ${[
        { label: 'Dashboard BG',     key: 'card_bg',       def: '#1c1c1e' },
        { label: 'Accent / brand',   key: 'accent_color',  def: '#f4601e' },
        { label: 'Tile background',  key: 'tile_bg',       def: '#1c1c1e' },
        { label: 'Tile border',      key: 'tile_border',   def: '#2a2a30' },
        { label: 'Text primary',     key: 'text_primary',  def: '#e5e7eb' },
        { label: 'Online dot',       key: 'online_color',  def: '#4ade80' },
        { label: 'Power reading',    key: 'power_color',   def: '#fb923c' },
      ].map(({label,key,def}) => html`
        <div class="color-row">
          <span class="color-key">${label}</span>
          <span class="color-val">${(sty as any)[key] ?? def}</span>
          <input type="color" .value=${(sty as any)[key] ?? def}
            @change=${(e:Event)=>this._set('style',{...sty,[key]:(e.target as HTMLInputElement).value})}/>
          ${(sty as any)[key] ? html`<button class="color-reset" @click=${()=>{const s={...sty};delete(s as any)[key];this._set('style',s)}}>↺</button>` : nothing}
        </div>`)}`;

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
          return html`
            <div class="room-style-row">
              <div class="room-style-hdr" @click=${()=>{
                const next = new Set(this._expandedRooms);
                next.has(area.name) ? next.delete(area.name) : next.add(area.name);
                this._expandedRooms = next;
              }}>
                <span class="room-style-name">${area.name}</span>
                ${hasStyle ? html`<span class="room-styled-dot"></span>` : nothing}
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
        <div class="tog-lbl">Fill under curve</div>
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
            <span class="color-key">${meta?.label ?? key}</span>
            <span class="color-val">${color}</span>
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
            <span class="sensors-hdr-lbl">${selectedCount === 0 ? 'All shown' : `${selectedCount} selected`}</span>
            <button class="sensors-all-btn" @click=${(e:Event) => {
              e.stopPropagation();
              const next = grpAllOn
                ? selected.filter(k => !grpKeys.includes(k))
                : [...new Set([...selected, ...grpKeys])];
              this._set('sensors', next);
            }}>${grpAllOn ? 'Deselect all' : 'Select all'}</button>
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
                  <div class="sensor-dot ${grp.group==='Alerts'?'alert-dot':''}"></div>
                  <span class="sensor-name">${s.label}</span>
                  ${isGraphable ? html`<button class="sensor-graph-btn ${graphOn ? 'on' : ''}"
                    title="${graphOn ? 'Remove graph' : 'Add graph'}"
                    @click=${(e:Event) => {
                      e.stopPropagation();
                      const next = graphOn ? graphSensors.filter(k=>k!==s.key) : [...graphSensors, s.key];
                      this._set('graph_sensors', next);
                    }}>~</button>` : nothing}
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
    const tabs: Array<{id:typeof this._tab;label:string}> = [
      {id:'devices',label:'Devices'},{id:'layout',label:'Layout'},{id:'style',label:'Style'},
      {id:'graphs',label:'Graphs'},{id:'sensors',label:'Sensors'},{id:'yaml',label:'YAML'},
    ];
    return html`
      <div class="shell">
        <div class="tab-nav">
          ${tabs.map(t => html`
            <div class="tab ${this._tab===t.id?'active':''}" @click=${()=>{this._tab=t.id;}}>${t.label}</div>`)}
        </div>
        <div class="tab-body">
          ${this._tab==='devices' ? this._renderDevicesTab()
           :this._tab==='layout'  ? this._renderLayoutTab()
           :this._tab==='style'   ? this._renderStyleTab()
           :this._tab==='graphs'  ? this._renderGraphsTab()
           :this._tab==='sensors' ? this._renderSensorsTab()
           :                        this._renderYamlTab()}
        </div>
      </div>`;
  }


  static styles = css`
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
    .tab { font-size:11px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; padding:8px 14px; color:var(--t3); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .15s; border-radius:5px 5px 0 0; user-select:none; }
    .tab:hover { color:var(--t2); }
    .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
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
    input[type="color"] { width:32px; height:28px; border:1px solid var(--border2); border-radius:5px; padding:2px 3px; background:var(--s2); cursor:pointer; flex-shrink:0; }
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

    /* ── Integration rows ── */
    .int-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border); }
    .int-row:last-of-type { border-bottom:none; }
    .int-badge { font-size:9px; font-weight:700; padding:2px 7px; border-radius:3px; letter-spacing:0.06em; flex-shrink:0; min-width:52px; text-align:center; }
    .int-name { font-size:12px; color:var(--text); flex:1; }
    .int-count { font-size:10px; color:var(--t3); }

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
    .room-style-panel { margin:8px 0 12px; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
    .style-panel-hdr { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--s2); font-size:12px; font-weight:600; }
    .clear-btn { font-size:10px; background:none; border:1px solid rgba(239,68,68,0.4); border-radius:4px; color:#ef4444; padding:3px 8px; cursor:pointer; }
    .style-tabs { display:flex; gap:4px; padding:6px 10px; background:var(--bg); border-bottom:1px solid var(--border); }
    .stab { flex:1; padding:5px 4px; border-radius:5px; font-size:10px; font-weight:600; text-align:center; cursor:pointer; border:1px solid var(--border); background:var(--s2); color:var(--t2); transition:all .12s; }
    .stab.on { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }
    .style-body { padding:10px 12px; }

    /* ── Search ── */
    .room-extra { margin-top:8px; }
    .search-wrap { display:flex; align-items:center; gap:6px; background:var(--s2); border:1px solid var(--border2); border-radius:8px; padding:7px 11px; margin-bottom:6px; }
    .search-wrap input { background:none; border:none; outline:none; font-size:12px; color:var(--text); width:100%; font-family:inherit; }
    .search-ico { color:var(--t3); font-size:13px; }
    .search-results { border:1px solid var(--border2); border-radius:8px; max-height:160px; overflow-y:auto; background:var(--s1); margin-bottom:6px; }
    .search-row { display:flex; align-items:center; gap:8px; padding:7px 12px; cursor:pointer; border-bottom:1px solid var(--border); transition:background .12s; }
    .search-row:hover { background:var(--s2); }
    .search-row.pinned { opacity:0.4; cursor:default; }
    .search-name { flex:1; font-size:11px; color:var(--text); }
    .search-area { font-size:9px; color:var(--t3); background:var(--s2); border-radius:8px; padding:1px 7px; }
    .search-empty { padding:10px 12px; font-size:11px; color:var(--t3); font-style:italic; }
    .pinned-chips { display:flex; flex-wrap:wrap; gap:5px; }
    .pinned-chip { font-size:10px; padding:4px 10px; border-radius:20px; border:1px solid var(--accentbdr); background:var(--accentbg); color:var(--accent); cursor:pointer; }
    .pinned-chip:hover { filter:brightness(1.2); }

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
    .sensor-graph-btn { margin-left:auto; flex-shrink:0; background:transparent; border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:var(--t2); font-size:11px; padding:1px 5px; cursor:pointer; line-height:1.4; }
    .sensor-graph-btn.on { background:rgba(74,158,255,0.18); border-color:#4a9eff; color:#4a9eff; }
    .sensor-graph-btn:hover { border-color:rgba(255,255,255,0.3); }
    .sensor-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
    .sensor-item { display:flex; align-items:center; gap:8px; padding:7px 10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:pointer; transition:all .12s; user-select:none; }
    .sensor-item:hover { border-color:var(--border2); }
    .sensor-item.active { border-color:var(--accentbdr); background:var(--accentbg); }
    .sensor-dot { width:6px; height:6px; border-radius:50%; background:var(--t3); flex-shrink:0; transition:background .12s; }
    .sensor-item.active .sensor-dot { background:var(--accent); }
    .alert-dot { background:rgba(248,113,113,0.5) !important; }
    .sensor-item.active .alert-dot { background:#f87171 !important; }
    .sensor-name { font-size:11px; color:var(--t2); flex:1; }
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-device-dashboard-editor': HADeviceDashboardEditor;
  }
}
