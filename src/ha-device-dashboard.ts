import { LitElement, html, svg, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  HADeviceDashboardConfig, HADevice, HAEntity,
  TileBlockId, DeviceProfileResult,
} from './types';
import {
  getAllDevices, getVirtualDevices, getDeviceById, getDeviceProfile,
  getIntegrationLabel, isPrivateIp, PROFILE_DEFAULT_BLOCKS, GRAPH_DC_LABELS, GRAPH_SENSOR_DEFS,
  formatPower, formatEnergy, formatVoltage, formatCurrent, formatTemp,
  formatUptime, rssiToQuality, formatApparentPower, formatReactivePower,
  formatFrequency, formatHumidity, formatIlluminance, formatPpm, formatPercent,
} from './helpers';

// ─── Ha Device Dashboard Card ──────────────────────────────────────────────────

@customElement('ha-device-dashboard')
export class HADeviceDashboard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public preview = false;
  @state() private _config!: HADeviceDashboardConfig;
  @state() private _closedAreas = new Set<string>();
  @state() private _entityListOpen = new Set<string>();
  @state() private _graphData = new Map<string, Array<{ t: number; v: number }>>();
  private readonly _graphFetching = new Set<string>();
  private readonly _graphFetchedAt = new Map<string, number>();

  // Device list cache — only recompute when entity/device registries or config change
  private _cachedDevices: HADevice[] | null = null;
  private _cacheEntitiesRef: unknown = null;
  private _cacheDevicesRef: unknown = null;
  private _cacheConfigRef: HADeviceDashboardConfig | null = null;

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
  }

  getCardSize() { return 6; }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._graphFetching.clear();
    this._graphFetchedAt.clear();
    this._graphData = new Map();
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

    let devices = getAllDevices(this.hass, this._config.integrations);

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

    // hide_shelly
    if (this._config.hide_shelly) {
      devices = devices.filter(d => !d.isShelly);
    }

    // hidden_devices
    if (this._config.hidden_devices?.length) {
      const hidden = new Set(this._config.hidden_devices);
      devices = devices.filter(d => !hidden.has(d.device_id));
    }

    // Virtual entities
    if (this._config.include_entities) {
      const virtual = getVirtualDevices(this.hass, this._config.entity_domains);
      devices = [...devices, ...virtual];
    }

    // Extra pinned devices
    if (this._config.extra_devices?.length) {
      const existing = new Set(devices.map(d => d.device_id));
      for (const id of this._config.extra_devices) {
        if (existing.has(id)) continue;
        const extra = getDeviceById(this.hass, id);
        if (extra) devices.push(extra);
      }
    }

    this._cachedDevices = devices;
    return devices;
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

  private _getTrv(device: HADevice) {
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

  private _getCover(device: HADevice) {
    const ent = device.entities.find(e => e.domain === 'cover');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;
    return { entityId: ent.entity_id, state: s.state, position: (s.attributes as any)?.current_position as number | undefined };
  }

  private _getValve(device: HADevice) {
    const ent = device.entities.find(e => e.domain === 'valve');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;
    let position: number | undefined = (s.attributes as any)?.current_position;
    if (position == null) {
      const pe = device.entities.find(e => e.domain === 'sensor' && e.entity_id.includes('position'));
      if (pe) { const v = parseFloat(this.hass.states[pe.entity_id]?.state ?? ''); if (!isNaN(v)) position = v; }
    }
    let temperature: number | undefined;
    const te = device.entities.find(e => e.domain === 'sensor' && (this.hass.states[e.entity_id]?.attributes as any)?.device_class === 'temperature');
    if (te) { const v = parseFloat(this.hass.states[te.entity_id]?.state ?? ''); if (!isNaN(v)) temperature = v; }
    return { entityId: ent.entity_id, state: s.state, position, temperature };
  }

  private _getFan(device: HADevice) {
    const ent = device.entities.find(e => e.domain === 'fan');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;
    const attrs = s.attributes as Record<string, unknown>;
    return {
      entityId:       ent.entity_id,
      isOn:           s.state === 'on',
      percentage:     attrs.percentage as number | undefined,
      percentageStep: (attrs.percentage_step as number) ?? 10,
      oscillating:    attrs.oscillating as boolean | undefined,
      presetMode:     attrs.preset_mode as string | undefined,
      presetModes:    (attrs.preset_modes as string[]) ?? [],
    };
  }

  private _getMedia(device: HADevice) {
    const ent = device.entities.find(e => e.domain === 'media_player');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;
    const attrs = s.attributes as Record<string, unknown>;
    return {
      entityId:  ent.entity_id,
      state:     s.state,
      isPlaying: s.state === 'playing',
      volume:    attrs.volume_level as number | undefined,
      isMuted:   attrs.is_volume_muted as boolean | undefined,
      title:     attrs.media_title as string | undefined,
      artist:    attrs.media_artist as string | undefined,
    };
  }

  private async _setValvePosition(entityId: string, pos: number) {
    await this.hass.callService('valve', 'set_valve_position', { entity_id: entityId, position: Math.round(Math.max(0, Math.min(100, pos))) });
  }

  private _getAlerts(device: HADevice): Array<'overtemp' | 'overpower'> {
    const alerts: Array<'overtemp' | 'overpower'> = [];
    for (const e of device.entities) {
      if (e.domain !== 'binary_sensor') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state !== 'on') continue;
      const dc = (s.attributes as any).device_class ?? '';
      if (dc === 'heat' || e.entity_id.includes('overtemp')) alerts.push('overtemp');
      else if (dc === 'safety' || e.entity_id.includes('overpower')) alerts.push('overpower');
    }
    return alerts;
  }

  private _getFirmware(device: HADevice) {
    for (const e of device.entities) {
      if (e.domain !== 'update') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state !== 'on') continue;
      const attrs = s.attributes as any;
      return { entityId: e.entity_id, current: attrs.installed_version ?? '', newVersion: attrs.latest_version };
    }
    return null;
  }

  /** Extracts a short channel label from an entity_id, e.g. "Ch 1" / "Ch 2". Returns '' if no channel found.
   *  Handles both switch-prefixed names (switch_0_power) and dc-suffixed names (power_0, energy_0). */
  private _chLabel(entityId: string): string {
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

  private _getSensors(device: HADevice): Array<{ label: string; value: string; warn?: boolean }> {
    const allowed = this._config.sensors?.length ? new Set(this._config.sensors) : null;
    const show = (k: string) => !allowed || allowed.has(k);
    const result: Array<{ label: string; value: string; warn?: boolean }> = [];
    const seen = new Set<string>();

    // Pre-scan: find which electrical device_classes appear on more than one entity
    // so we can show per-channel labels for multi-channel devices (e.g. Shelly 2.5)
    const ELECTRICAL_DCS = new Set(['power','energy','current','voltage','apparent_power','reactive_power','power_factor','frequency']);
    const dcIds = new Map<string, string[]>();
    for (const e of device.entities) {
      const s = this.hass.states[e.entity_id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
      const dc = (s.attributes as any)?.device_class as string ?? '';
      if (ELECTRICAL_DCS.has(dc)) {
        if (!dcIds.has(dc)) dcIds.set(dc, []);
        dcIds.get(dc)!.push(e.entity_id);
      }
    }
    const multiDcs = new Set([...dcIds.entries()].filter(([, ids]) => ids.length > 1).map(([dc]) => dc));

    const push = (k: string, label: string, value: string, warn = false, entityId?: string) => {
      // For multi-channel sensors, key by (device_class + channel label) so that two entities
      // mapping to the same channel slot (e.g. energy_0 and switch_0_energy) only show once,
      // while different channels (Ch 1, Ch 2) and unlabelled totals each get their own slot.
      const key = (entityId && multiDcs.has(k)) ? `${k}_${this._chLabel(entityId)}` : k;
      if (!seen.has(key)) { seen.add(key); result.push({ label, value, warn }); }
    };

    // ── Virtual domain chips ────────────────────────────────────────────────────
    if (device.isVirtual) {
      const e = device.entities[0];
      if (!e) return result;
      const s = this.hass.states[e.entity_id];
      if (!s) return result;
      const attrs = s.attributes as Record<string, unknown>;

      if (e.domain === 'automation') {
        const isOff = s.state === 'off';
        push('state',    'State',    isOff ? 'Off' : 'On', isOff);
        push('last_run', 'Last run', this._timeAgo(attrs.last_triggered as string | null));
        const mode = attrs.mode as string | undefined;
        if (mode && mode !== 'single') push('mode', 'Mode', mode);

      } else if (e.domain === 'script') {
        push('state', 'State', s.state === 'on' ? 'Running' : 'Off');

      } else if (e.domain === 'input_boolean') {
        push('state', 'State', s.state === 'on' ? 'On' : 'Off');

      } else if (e.domain === 'input_number') {
        const unit = (attrs.unit_of_measurement as string | undefined) ?? '';
        push('value', 'Value', unit ? `${s.state} ${unit}` : s.state);

      } else if (e.domain === 'input_text') {
        const text = s.state.length > 20 ? s.state.slice(0, 20) + '…' : s.state;
        push('text', 'Text', text || '—');

      } else if (e.domain === 'input_select') {
        push('option', 'Option', s.state);

      } else if (e.domain === 'input_datetime') {
        const raw = s.state;
        const dtMatch   = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
        const timeMatch = raw.match(/^(\d{2}:\d{2})/);
        const friendly  = dtMatch ? `${dtMatch[1]} ${dtMatch[2]}` : timeMatch ? timeMatch[1] : raw;
        push('datetime', 'Date/Time', friendly);

      } else if (e.domain === 'input_button') {
        push('pressed', 'Pressed', this._timeAgo(attrs.timestamp as string | null));

      } else if (e.domain === 'timer') {
        const statusMap: Record<string, string> = { idle: 'Idle', active: 'Active', paused: 'Paused' };
        push('status', 'Status', statusMap[s.state] ?? s.state);
        if ((s.state === 'active' || s.state === 'paused') && attrs.remaining)
          push('left', 'Left', attrs.remaining as string);

      } else if (e.domain === 'counter') {
        push('count', 'Count', s.state);
      }
      // scene: no chips — stateless
      return result;
    }
    // ── End virtual domain chips ────────────────────────────────────────────────

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
        const ch = multiDcs.size ? this._chLabel(id) : '';
        const chSufx = (k: string) => (multiDcs.has(k) && ch) ? ` ${ch}` : '';
        if      (dc === 'power'           && show('power'))          push('power',          `Power${chSufx('power')}`,          formatPower(v),           false, id);
        else if (dc === 'apparent_power'  && show('apparent_power')) push('apparent_power', `App.P${chSufx('apparent_power')}`, formatApparentPower(v),   false, id);
        else if (dc === 'reactive_power'  && show('reactive_power')) push('reactive_power', `Re.P${chSufx('reactive_power')}`,  formatReactivePower(v),   false, id);
        else if (dc === 'power_factor'    && show('power_factor'))   push('power_factor',   `PF${chSufx('power_factor')}`,      formatPercent(v),         false, id);
        else if (dc === 'frequency'       && show('frequency'))      push('frequency',      `Freq${chSufx('frequency')}`,       formatFrequency(v),       false, id);
        else if (dc === 'energy'          && show('energy'))         push('energy',         `Energy${chSufx('energy')}`,        formatEnergy(v),          false, id);
        else if (dc === 'voltage'         && show('voltage'))        push('voltage',        `Volt${chSufx('voltage')}`,         formatVoltage(v),         false, id);
        else if (dc === 'current'         && show('current'))        push('current',        `Curr${chSufx('current')}`,         formatCurrent(v),         false, id);
        else if (dc === 'temperature'     && show('temperature'))    push('temperature',    'Temp',         formatTemp(v));
        else if (dc === 'humidity'        && show('humidity'))       push('humidity',       'Hum',          formatHumidity(v));
        else if (dc === 'illuminance'     && show('illuminance'))    push('illuminance',    'Light',        formatIlluminance(v));
        else if (dc === 'carbon_dioxide'  && show('co2'))            push('co2',            'CO₂',          formatPpm(v));
        else if (dc === 'gas'             && show('gas'))            push('gas',            'Gas',          `${v.toFixed(1)} %`);
        else if (dc === 'battery'         && show('battery'))        push('battery',        'Batt',         formatPercent(v));
        else if ((dc === 'signal_strength' || id.includes('rssi'))   && show('rssi'))
          push('rssi', 'Wi-Fi', `${rssiToQuality(v)} (${v} dBm)`);
        else if (id.includes('uptime')    && show('uptime'))         push('uptime',         'Uptime',       formatUptime(v));
      } else if (e.domain === 'binary_sensor') {
        const on = s.state === 'on';
        if      (dc === 'motion'   && show('motion'))    push('motion',    'Motion',    on ? 'Motion'    : 'Clear');
        else if ((dc === 'door' || dc === 'window' || dc === 'opening') && show('door'))
          push('door', 'Door', on ? 'Open' : 'Closed');
        else if (dc === 'moisture' && show('flood'))     push('flood',     'Flood',     on ? 'Flooded'   : 'Dry', on);
        else if (dc === 'smoke'    && show('smoke'))     push('smoke',     'Smoke',     on ? 'Smoke!'    : 'Clear', on);
        else if (dc === 'gas'      && show('gas'))       push('gas',       'Gas',       on ? 'Gas!'      : 'Clear', on);
        else if (dc === 'vibration' && show('vibration')) push('vibration', 'Vibr',    on ? 'Vibrating' : 'Clear');
        else if ((dc === 'heat' || id.includes('overtemp')) && show('overtemp'))
          push('overtemp', 'Overtemp', on ? 'Overtemp!' : 'OK', on);
        else if ((dc === 'safety' || id.includes('overpower')) && show('overpower'))
          push('overpower', 'Overpower', on ? 'Overpower!' : 'OK', on);
        else if (dc === 'connectivity' && id.includes('cloud') && show('cloud'))
          push('cloud', 'Cloud', on ? 'Connected' : 'Offline', !on);
        else if (dc === 'connectivity' && id.includes('mqtt') && show('mqtt'))
          push('mqtt', 'MQTT', on ? 'Connected' : 'Offline', !on);
        else if (dc === 'connectivity' && id.includes('eth') && show('eth'))
          push('eth', 'Ethernet', on ? 'Connected' : 'Offline', !on);
      }
    }
    return result;
  }

  private _getInputChannels(device: HADevice) {
    return device.entities
      .filter(e => e.domain === 'binary_sensor' && (
        e.entity_id.includes('input') || e.entity_id.includes('button') ||
        (e.attributes as any)?.device_class == null
      ))
      .map(e => {
        const s = this.hass.states[e.entity_id];
        const friendly = (s?.attributes as any)?.friendly_name ?? '';
        const m = e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i) ?? friendly.match(/(\d+)\s*$/);
        const ch = m ? parseInt(m[1]) : 0;
        return { entityId: e.entity_id, label: m ? `${ch}` : '?', fullName: friendly || e.entity_id, isOn: s?.state === 'on', channel: ch };
      })
      .sort((a, b) => a.channel - b.channel);
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

  // ── Sparkline system ──────────────────────────────────────────────────────

  private _getGraphEntities(device: HADevice): Array<{ entityId: string; label: string; dc: string; unit: string }> {
    const dcList = this._config.graph_sensors ?? [];
    if (!dcList.length) return [];
    const results: Array<{ entityId: string; label: string; dc: string; unit: string }> = [];
    for (const dc of dcList) {
      const ents = device.entities.filter(e => {
        if (e.domain !== 'sensor') return false;
        const attrDc = (this.hass.states[e.entity_id]?.attributes as any)?.device_class ?? (e.attributes as any)?.device_class;
        return attrDc === dc || (dc === 'signal_strength' && e.entity_id.includes('rssi'));
      });
      const seenLabels = new Set<string>();
      for (const ent of ents) {
        const unit = (this.hass.states[ent.entity_id]?.attributes as any)?.unit_of_measurement ?? '';
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

  private _requestGraphData(entityId: string) {
    if (this._graphFetching.has(entityId)) return;
    const age = Date.now() - (this._graphFetchedAt.get(entityId) ?? 0);
    if (age < 5 * 60_000 && this._graphData.has(entityId)) return;
    // Add to queue and drain — prevents simultaneous history API hammering
    if (!this._fetchQueue.includes(entityId)) {
      this._fetchQueue.push(entityId);
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
      this._drainFetchQueue(); // process next in queue
    });
  }

  private _retryGraphData(entityId: string) {
    if (this._graphFetching.has(entityId)) return;
    this._graphFetchedAt.delete(entityId);
    const next = new Map(this._graphData); next.delete(entityId);
    this._graphData = next;
    // Route through the queue so concurrent fetches don't bypass the anti-hammering guard
    this._fetchQueue = this._fetchQueue.filter(id => id !== entityId);
    this._requestGraphData(entityId);
  }

  private _refreshAllGraphs(device: HADevice) {
    const ids = this._getGraphEntities(device).map(e => e.entityId).filter(id => !this._graphFetching.has(id));
    ids.forEach(id => this._graphFetchedAt.delete(id));
    const next = new Map(this._graphData); ids.forEach(id => next.delete(id));
    this._graphData = next;
    ids.forEach(id => this._fetchGraphData(id));
  }

  private async _fetchGraphData(entityId: string) {
    this._graphFetching.add(entityId);
    try {
      const hours = this._config.graph_hours ?? 24;
      const start = new Date(Date.now() - hours * 3600_000);
      const path = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&minimal_response=true&no_attributes=true`;
      const raw = await (this.hass as any).callApi('GET', path) as Array<Array<{ state: string; last_changed: string }>>;
      const series = raw?.[0] ?? [];
      let points = series.map(p => ({ t: new Date(p.last_changed).getTime(), v: parseFloat(p.state) })).filter(p => !isNaN(p.v));
      if (points.length === 1) {
        const live = parseFloat(this.hass.states[entityId]?.state ?? '');
        points.push({ t: Date.now(), v: isNaN(live) ? points[0].v : live });
      }
      const next = new Map(this._graphData); next.set(entityId, points);
      this._graphData = next;
    } catch (err) {
      console.warn('[ha-device-dashboard] history fetch failed', entityId, err);
      // Store empty array so the retry guard works — prevents hammering HA on every render
      const next = new Map(this._graphData); next.set(entityId, []);
      this._graphData = next;
    } finally {
      this._graphFetchedAt.set(entityId, Date.now());
      this._graphFetching.delete(entityId);
    }
  }

  private _renderSparklines(device: HADevice): TemplateResult {
    const entities = this._getGraphEntities(device);
    if (!entities.length) return html``;

    const gs = this._config.graph_style ?? {};
    const W = 200;
    const H = gs.height ?? 32;
    const customH = gs.height != null;  // only override CSS height when explicitly set
    const lw = gs.line_width ?? 1.5;
    const showDots = gs.show_dots !== false;
    const showTicks = gs.tick_lines !== false;
    const showTimeLabels = gs.time_labels !== false;
    const graphType = gs.type ?? 'line';
    // 'area' type always fills; 'line' type never fills; 'bar' type is separate
    const fill = graphType === 'area';
    const graphHours = this._config.graph_hours ?? 24;
    const tickMs = graphHours <= 1 ? 60_000 : graphHours <= 5 ? 120_000 : 300_000;
    const sensorColors = this._config.graph_sensor_colors ?? {};
    const globalColor = this._config.graph_line_color;
    const pad = 4;

    const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const rows = entities.map(({ entityId, label, unit, dc }) => {
      // Resolve to a concrete color so SVG elements never rely on CSS variable resolution
      const lineColor = sensorColors[dc] ?? globalColor ?? GRAPH_SENSOR_DEFS.find(s => s.key === dc)?.defaultColor ?? '#f4601e';
      const points = this._graphData.get(entityId);
      this._requestGraphData(entityId);  // no-op if already fetched/fetching

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
            <button class="spark-retry" @click=${(e: Event) => { e.stopPropagation(); this._retryGraphData(entityId); }}>↺</button>
          </div>`;
      }

      const vals = points.map(p => p.v);
      const min = Math.min(...vals), max = Math.max(...vals);
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

      return html`
        <div class="spark-group">
          <div class="spark-row">
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
      <div class="sparklines-block">
        ${rows}
      </div>`;
  }

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

  private _renderTrvDial(trv: NonNullable<ReturnType<typeof this._getTrv>>) {
    const { minTemp, maxTemp, targetTemp, currentTemp } = trv;
    const cx = 100, cy = 95, r = 72;
    const target = targetTemp ?? minTemp;
    const targetRatio = Math.max(0, Math.min(1, (target - minTemp) / (maxTemp - minTemp)));
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
    const fillColor = this._trvColor(targetRatio);
    const targetAngle = toAngle(target);
    const [tx, ty] = toXY(targetAngle, r);
    const curRatio = currentTemp != null ? (currentTemp - minTemp) / (maxTemp - minTemp) : null;
    const curXY = currentTemp != null ? toXY(toAngle(currentTemp), r) : null;
    const curColor = curRatio != null ? this._trvColor(curRatio) : fillColor;
    // gradient id scoped to avoid conflicts if multiple TRV tiles
    const gid = `trv-grad-${this._getTrv.name}`;
    return svg`
      <svg viewBox="0 0 200 155" class="trv-dial-svg">
        <defs>
          <linearGradient id="${gid}" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${this._trvColor(0)}"/>
            <stop offset="50%"  stop-color="${this._trvColor(0.5)}"/>
            <stop offset="100%" stop-color="${this._trvColor(1)}"/>
          </linearGradient>
        </defs>
        <!-- full track with blue→red gradient -->
        <path d="${arcPath(210, 510, r)}" fill="none" stroke="url(#${gid})" stroke-width="10" stroke-linecap="round" opacity="0.25"/>
        <!-- fill arc to target -->
        ${targetAngle > 210 ? svg`<path d="${arcPath(210, targetAngle, r)}" fill="none" stroke="url(#${gid})" stroke-width="10" stroke-linecap="round"/>` : nothing}
        <!-- current temp dot -->
        ${curXY ? svg`<circle cx="${curXY[0]}" cy="${curXY[1]}" r="6" fill="white" stroke="${curColor}" stroke-width="2.5"/>` : nothing}
        <!-- target handle -->
        <circle cx="${tx}" cy="${ty}" r="10" fill="${fillColor}" stroke="white" stroke-width="2.5"/>
        <!-- center: target temp -->
        <text x="${cx}" y="${cy - 14}" text-anchor="middle" class="dial-target-text">${target.toFixed(1)}°</text>
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" class="dial-sub-text">target</text>
        <text x="${cx}" y="${cy + 20}" text-anchor="middle" class="dial-current-text">${currentTemp != null ? `now ${currentTemp}°` : ''}</text>
        <!-- min/max labels -->
        <text x="22" y="148" text-anchor="middle" class="dial-range-text">${minTemp}°</text>
        <text x="178" y="148" text-anchor="middle" class="dial-range-text">${maxTemp}°</text>
      </svg>
    `;
  }

  private _renderValveDial(vc: NonNullable<ReturnType<typeof this._getValve>>) {
    const pos = vc.position ?? (vc.state === 'open' ? 100 : 0);
    const cx = 100, cy = 90, r = 72;
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
    const posAngle = toAngle(pos);
    const [hx, hy] = toXY(posAngle, r);
    const handleColor = `hsl(${200 + pos * 0.2}, ${40 + pos * 0.55}%, ${38 + pos * 0.18}%)`;
    const stateLabel = vc.state === 'opening' ? 'Opening…' : vc.state === 'closing' ? 'Closing…'
      : pos === 100 ? 'Open' : pos === 0 ? 'Closed' : 'Partial';
    return svg`
      <svg viewBox="0 0 200 145" class="trv-dial-svg">
        <defs>
          <linearGradient id="valve-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#6b7280"/>
            <stop offset="100%" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        <path d="${arcPath(210, 510, r)}" fill="none" stroke="url(#valve-grad)" stroke-width="10" stroke-linecap="round" opacity="0.25"/>
        ${pos > 0 ? svg`<path d="${arcPath(210, posAngle, r)}" fill="none" stroke="url(#valve-grad)" stroke-width="10" stroke-linecap="round"/>` : nothing}
        <circle cx="${hx}" cy="${hy}" r="10" fill="${handleColor}" stroke="white" stroke-width="2.5"/>
        <text x="${cx}" y="${cy - 10}" text-anchor="middle" class="dial-target-text">${Math.round(pos)}%</text>
        <text x="${cx}" y="${cy + 8}" text-anchor="middle" class="dial-sub-text">${stateLabel}</text>
        <text x="22" y="138" text-anchor="middle" class="dial-range-text">Closed</text>
        <text x="178" y="138" text-anchor="middle" class="dial-range-text">Open</text>
      </svg>
    `;
  }

  private _renderBlock(
    blockId: TileBlockId,
    device: HADevice,
    profile: DeviceProfileResult
  ): TemplateResult {
    const sw = this._getPrimarySwitch(device);
    const trv = this._getTrv(device);
    const cover = this._getCover(device);
    const valve = this._getValve(device);
    const alerts = this._getAlerts(device);
    const online = this._isOnline(device);
    const fw = this._getFirmware(device);
    const power = this._getPower(device);
    const sensors = this._getSensors(device);
    const inputs = this._getInputChannels(device);
    const isOn = sw?.isOn ?? false;
    const isDimmable = sw?.brightness !== undefined;
    const bPct = isDimmable && isOn ? Math.max(1, sw!.brightness ?? 1) : 0;
    const hasColor = !!(sw?.colorModes?.length);
    const hexColor = hasColor && sw!.rgbColor ? this._rgbToHex(...sw!.rgbColor) : '#ffffff';
    const isRgbw = hasColor && (sw!.colorModes?.some(m => m === 'rgbw' || m === 'rgbww') ?? false);
    const isHeating = trv?.hvacMode === 'heat';
    const genLabel = profile.gen === 'ble' ? 'BLE' : profile.gen === 'other' ? '' : `G${profile.gen}`;
    const intLabel = getIntegrationLabel(device.integration);

    switch (blockId) {

      case 'name_row':
        return html`
          <div class="tile-top">
            <div class="tile-left">
              <span class="dot ${online ? 'online' : 'offline'}"></span>
              <span class="tile-name">${device.name}</span>
              ${fw ? html`<span class="update-dot" title="Firmware update">●</span>` : nothing}
            </div>
            ${cover ? html`
              <div class="cov-btns" @click=${(e: Event) => e.stopPropagation()}>
                <button class="cov-btn" @click=${(e: Event) => this._coverAction(cover.entityId, 'open', e)}>▲</button>
                <button class="cov-btn stop" @click=${(e: Event) => this._coverAction(cover.entityId, 'stop', e)}>■</button>
                <button class="cov-btn" @click=${(e: Event) => this._coverAction(cover.entityId, 'close', e)}>▼</button>
              </div>
            ` : sw ? html`
              <button class="tog ${isOn ? 'on' : 'off'}"
                @click=${(e: Event) => this._toggle(sw.entityId, isOn, e)}>
                ${isOn ? 'ON' : 'OFF'}
              </button>
            ` : trv ? html`
              <button class="tog ${isHeating ? 'on' : 'off'}"
                @click=${(e: Event) => this._setHvacMode(trv.entityId, isHeating ? 'off' : 'heat', e)}>
                ${isHeating ? 'HEAT' : 'OFF'}
              </button>
            ` : device.isVirtual ? html`
              <button class="tog off"
                @click=${async (e: Event) => {
                  e.stopPropagation();
                  const ent = device.entities[0];
                  if (!ent) return;
                  if (ent.domain === 'script') await this.hass.callService('script', 'turn_on', { entity_id: ent.entity_id });
                  else if (ent.domain === 'scene') await this.hass.callService('scene', 'turn_on', { entity_id: ent.entity_id });
                  else if (ent.domain === 'automation') await this.hass.callService('automation', 'trigger', { entity_id: ent.entity_id });
                  else if (ent.domain === 'input_button') await this.hass.callService('input_button', 'press', { entity_id: ent.entity_id });
                  else if (ent.domain === 'input_boolean') await this.hass.callService('input_boolean', 'toggle', { entity_id: ent.entity_id });
                }}>
                RUN
              </button>
            ` : nothing}
          </div>
        `;

      case 'sensors':
        return sensors.length ? html`
          <div class="tile-sensor-chips">
            ${sensors.map(s => html`
              <div class="tile-sensor-chip ${s.warn ? 'warn' : ''}">
                <span class="tsc-lbl">${s.label}</span>
                <span class="tsc-val">${s.value}</span>
              </div>
            `)}
          </div>
        ` : html``;

      case 'graph':
        return this._renderSparklines(device);

      case 'dimmer':
        return sw && isDimmable ? html`
          <div class="tile-dim-row" @click=${(e: Event) => e.stopPropagation()}>
            ${hasColor ? html`
              <input type="color" class="color-swatch tile-color-swatch" .value=${hexColor}
                ?disabled=${!isOn}
                @change=${(e: Event) => { e.stopPropagation(); this._setColor(sw.entityId, (e.target as HTMLInputElement).value, sw.whiteValue, isRgbw); }}/>
            ` : nothing}
            <input type="range" class="dim-slider" min="1" max="100"
              style=${styleMap(hasColor ? { accentColor: hexColor } : {})}
              .value=${String(isOn ? Math.max(1, sw.brightness ?? 1) : 1)}
              ?disabled=${!isOn}
              @input=${(e: Event) => {
                const pct = (e.target as HTMLInputElement).closest('.tile-dim-row')?.querySelector('.dim-pct');
                if (pct) pct.textContent = `${(e.target as HTMLInputElement).value}%`;
              }}
              @change=${(e: Event) => { this._setBrightness(sw.entityId, parseInt((e.target as HTMLInputElement).value, 10)); }}/>
            <span class="dim-pct">${bPct}%</span>
          </div>
        ` : html``;

      case 'cover_controls':
        return cover ? html`
          <div class="cov-pos-row" @click=${(e: Event) => e.stopPropagation()}>
            <div class="cov-bar">
              <div class="cov-fill" style="width:${cover.position ?? (cover.state === 'open' ? 100 : 0)}%"></div>
            </div>
            <span class="cov-pct">${cover.position != null ? `${Math.round(cover.position)}%` : cover.state}</span>
          </div>
        ` : html``;

      case 'trv_control': {
        const battEnt = device.entities.find(e => e.domain === 'sensor' &&
          (this.hass.states[e.entity_id]?.attributes as any)?.device_class === 'battery');
        const batteryPct = battEnt != null ? parseFloat(this.hass.states[battEnt.entity_id]?.state ?? '') || null : null;
        const PRESET_ICONS: Record<string, string> = { comfort: '🏠', eco: '🌿', boost: '🚀', away: '🌙', none: '❄️' };
        return trv ? html`
          <div class="tile-trv-dial" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderTrvDial(trv)}
            <div class="trv-dial-btns">
              <button class="trv-step" @click=${() => trv.targetTemp != null && this._setTemp(trv.entityId, Math.max(trv.minTemp, trv.targetTemp - trv.step))}>−</button>
              <span class="trv-flame">${trv.hvacAction === 'heating' ? '🔥' : ''}</span>
              <button class="trv-step" @click=${() => trv.targetTemp != null && this._setTemp(trv.entityId, Math.min(trv.maxTemp, trv.targetTemp + trv.step))}>+</button>
            </div>
            <div class="trv-stat-row">
              <div class="trv-stat"><span class="trv-stat-lbl">Now</span><span class="trv-stat-val">${trv.currentTemp != null ? `${trv.currentTemp}°` : '—'}</span></div>
              <div class="trv-stat"><span class="trv-stat-lbl">Set</span><span class="trv-stat-val">${trv.targetTemp != null ? `${trv.targetTemp.toFixed(1)}°` : '—'}</span></div>
              ${trv.valvePosition != null ? html`<div class="trv-stat"><span class="trv-stat-lbl">Valve</span><span class="trv-stat-val">${Math.round(trv.valvePosition)}%</span></div>` : nothing}
              ${batteryPct != null ? html`<div class="trv-stat"><span class="trv-stat-lbl">Batt</span><span class="trv-stat-val">${batteryPct}%</span></div>` : nothing}
            </div>
            ${trv.presetModes.length ? html`
              <div class="trv-presets">
                ${trv.presetModes.map(p => html`
                  <button class="trv-preset-btn ${trv.presetMode === p ? 'active' : ''}"
                    @click=${() => this._setPresetMode(trv.entityId, p)}>
                    ${(PRESET_ICONS[p] ?? '') + p}
                  </button>
                `)}
              </div>
            ` : nothing}
          </div>
        ` : html``;
      }

      case 'input_channels':
        return inputs.length ? html`
          <div class="tile-inputs" @click=${(e: Event) => e.stopPropagation()}>
            ${inputs.map(ch => html`
              <div class="input-chip ${ch.isOn ? 'active' : ''}">
                <span class="input-dot"></span>
                <span class="input-lbl">${ch.label}</span>
              </div>
            `)}
          </div>
        ` : html``;

      case 'fan_controls': {
        const fan = this._getFan(device);
        return fan ? html`
          <div class="tile-dim-row" @click=${(e: Event) => e.stopPropagation()}>
            <input type="range" class="dim-slider" min="0" max="100" step="${fan.percentageStep}"
              .value=${String(fan.isOn ? (fan.percentage ?? 0) : 0)}
              ?disabled=${!fan.isOn}
              @change=${(e: Event) => {
                e.stopPropagation();
                const pct = parseInt((e.target as HTMLInputElement).value, 10);
                this.hass.callService('fan', pct > 0 ? 'turn_on' : 'turn_off',
                  { entity_id: fan.entityId, ...(pct > 0 ? { percentage: pct } : {}) });
              }}/>
            <span class="dim-pct">${fan.isOn ? (fan.percentage ?? 0) : 0}%</span>
            ${fan.oscillating !== undefined ? html`
              <button class="tog sm ${fan.oscillating ? 'on' : 'off'}"
                @click=${(e: Event) => { e.stopPropagation(); this.hass.callService('fan', 'oscillate', { entity_id: fan.entityId, oscillating: !fan.oscillating }); }}>
                ⟳
              </button>
            ` : nothing}
          </div>
        ` : html``;
      }

      case 'valve_controls': {
        const vc = this._getValve(device);
        return vc ? html`
          <div class="tile-trv-dial" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderValveDial(vc)}
            <div class="valve-dial-btns">
              <button class="valve-btn close" @click=${(e: Event) => this._valveAction(vc.entityId, 'close', e)}>Close</button>
              <button class="valve-btn stop" @click=${(e: Event) => this._valveAction(vc.entityId, 'stop', e)}>■</button>
              <button class="valve-btn open" @click=${(e: Event) => this._valveAction(vc.entityId, 'open', e)}>Open</button>
            </div>
          </div>
        ` : html``;
      }

      case 'media_controls': {
        const media = this._getMedia(device);
        return media ? html`
          <div class="tile-media-row" @click=${(e: Event) => e.stopPropagation()}>
            ${media.title ? html`<span class="media-title">${media.title}${media.artist ? html` · <em class="media-artist">${media.artist}</em>` : nothing}</span>` : nothing}
            <div class="media-btns">
              <button class="cov-btn" title="Previous"
                @click=${(e: Event) => { e.stopPropagation(); this.hass.callService('media_player', 'media_previous_track', { entity_id: media.entityId }); }}>⏮</button>
              <button class="cov-btn" title="${media.isPlaying ? 'Pause' : 'Play'}"
                @click=${(e: Event) => { e.stopPropagation(); this.hass.callService('media_player', media.isPlaying ? 'media_pause' : 'media_play', { entity_id: media.entityId }); }}>
                ${media.isPlaying ? '⏸' : '▶'}
              </button>
              <button class="cov-btn" title="Next"
                @click=${(e: Event) => { e.stopPropagation(); this.hass.callService('media_player', 'media_next_track', { entity_id: media.entityId }); }}>⏭</button>
              <button class="cov-btn ${media.isMuted ? 'stop' : ''}" title="${media.isMuted ? 'Unmute' : 'Mute'}"
                @click=${(e: Event) => { e.stopPropagation(); this.hass.callService('media_player', 'volume_mute', { entity_id: media.entityId, is_volume_muted: !media.isMuted }); }}>
                ${media.isMuted ? '🔇' : '🔊'}
              </button>
            </div>
            ${media.volume != null ? html`
              <input type="range" class="dim-slider" min="0" max="100" step="5"
                .value=${String(Math.round((media.volume ?? 0) * 100))}
                @change=${(e: Event) => { e.stopPropagation(); this.hass.callService('media_player', 'volume_set', { entity_id: media.entityId, volume_level: parseInt((e.target as HTMLInputElement).value) / 100 }); }}/>
            ` : nothing}
          </div>
        ` : html``;
      }

      case 'power_bar':
        return this._renderPowerBar(device);

      case 'badges':
        return html`
          <div class="tile-bot">
            ${power != null ? html`<span class="tile-power">${formatPower(power)}</span>` : nothing}
            <div class="tile-badges">
              ${alerts.map(a => html`<span class="alert-badge alert-${a}">${a === 'overtemp' ? '🌡' : '⚡'}!</span>`)}
              ${profile.label ? html`<span class="type-badge type-${profile.type}">${profile.label}</span>` : nothing}
              ${genLabel ? html`<span class="gen-badge gen-${profile.gen}">${genLabel}</span>` : nothing}
              ${intLabel && !device.isVirtual ? html`<span class="int-badge-tile">${intLabel}</span>` : nothing}
              ${device.isShelly && device.ip && isPrivateIp(device.ip) ? html`
                <a href="http://${device.ip}" target="_blank" class="tile-ui-link"
                  @click=${(e: Event) => e.stopPropagation()}>↗</a>
              ` : nothing}
            </div>
          </div>
        `;

      default:
        return html``;
    }
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

  private _renderTile(device: HADevice): TemplateResult {
    const online = this._isOnline(device);
    const profile = getDeviceProfile(device);
    const tileSize = this._config.tile_size ?? 'md';
    const accentColor = this._config.device_styles?.[device.device_id]?.color;
    const tileStyle: Record<string, string> = {};
    if (accentColor) {
      tileStyle['borderColor'] = accentColor;
      tileStyle['boxShadow'] = `0 0 12px ${accentColor}50`;
    }
    const _defaultBlocks: TileBlockId[] = ['name_row', 'sensors', 'graph', 'dimmer', 'cover_controls', 'trv_control', 'media_controls', 'fan_controls', 'valve_controls', 'input_channels', 'power_bar', 'badges'];
    const blockOrder: TileBlockId[] =
      this._config.device_styles?.[device.device_id]?.tile_layout ??
      this._config.tile_layout ??
      PROFILE_DEFAULT_BLOCKS[profile.type] ??
      _defaultBlocks;

    return html`
      <div class="tile ${!online ? 'offline' : ''} tile-${tileSize}"
        style=${styleMap(tileStyle)}>
        ${blockOrder.map(blockId => this._renderBlock(blockId, device, profile))}
      </div>
    `;
  }

  // ── Area section ──────────────────────────────────────────────────────────

  private _getAreaChips(devices: HADevice[]): Array<{ label: string; value: string }> {
    const allowed = this._config.sensors?.length ? new Set(this._config.sensors) : null;
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
      if (areaStyle.bgImage) {
        styleObj['backgroundImage'] = `url('${areaStyle.bgImage}')`;
        styleObj['backgroundSize']  = areaStyle.bgImageSize === 'stretch' ? '100% 100%' : (areaStyle.bgImageSize ?? 'contain');
        styleObj['backgroundPosition'] = 'center';
        styleObj['backgroundRepeat'] = 'no-repeat';
      } else if (areaStyle.bgColor) {
        styleObj['background'] = areaStyle.bgColor;
      }
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
      if (areaStyle.tileBgColor)     styleObj['--sc-tile-bg']        = areaStyle.tileBgColor;
      if (areaStyle.tileBorderColor) styleObj['--sc-tile-border']    = areaStyle.tileBorderColor;
      if (areaStyle.tileBorderRadius != null) styleObj['--tile-radius'] = `${areaStyle.tileBorderRadius}px`;
      if (areaStyle.tileGap != null) styleObj['--tile-gap']          = `${areaStyle.tileGap}px`;
      if (areaStyle.tileTextColor)   styleObj['--sc-text-primary']   = areaStyle.tileTextColor;
      if (areaStyle.accentColor) {
        styleObj['--sc-accent']      = areaStyle.accentColor;
        styleObj['--sc-graph-line']  = areaStyle.accentColor;
        styleObj['--sc-accent-glow'] = `${areaStyle.accentColor}59`;
      }
    }

    // Flat grid — no expanded panel
    const gridItems = devices.map(d => this._renderTile(d));
    const areaChips = this._getAreaChips(devices);

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
                    const unit = (s?.attributes as any)?.unit_of_measurement ?? '';
                    const name = (s?.attributes as any)?.friendly_name ?? e.entity_id.split('.')[1].replace(/_/g, ' ');
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
    const st = this._config.style ?? {};

    if (!devices.length) {
      return html`
        <ha-card>
          <div class="empty">
            <p>No devices found.</p>
            <p class="hint">No devices found matching your filters.</p>
          </div>
        </ha-card>`;
    }

    const online = devices.filter(d => this._isOnline(d)).length;
    const offline = devices.length - online;
    const totalPower = devices.reduce((s, d) => s + (this._getPower(d) ?? 0), 0);
    const alertDevices = devices.filter(d => this._getAlerts(d).length > 0);
    const byArea = this._groupByArea(devices);

    // Build CSS variable inline styles from config.style
    const cardInlineStyles: Record<string, string> = {};
    if (st.accent_color)  cardInlineStyles['--sc-accent']       = st.accent_color;
    if (st.tile_radius)   cardInlineStyles['--tile-radius']     = `${st.tile_radius}px`;
    if (st.tile_gap)      cardInlineStyles['--tile-gap']        = `${st.tile_gap}px`;
    if (st.font_family)      cardInlineStyles['--sc-font-family']    = st.font_family;
    if (st.text_transform)   cardInlineStyles['--sc-text-transform'] = st.text_transform;
    if (st.text_size_scale)  cardInlineStyles['--sc-text-scale']     = String(st.text_size_scale);
    if (st.tile_bg)            cardInlineStyles['--sc-tile-bg']         = st.tile_bg;
    if (st.tile_bg_image)      cardInlineStyles['--sc-tile-bg-image']   = `url("${st.tile_bg_image}")`;
    if (st.tile_bg_image_size) cardInlineStyles['--sc-tile-bg-image-sz']= st.tile_bg_image_size === 'stretch' ? '100% 100%' : st.tile_bg_image_size;
    if (this._config.card_bg_image)      cardInlineStyles['--sc-card-bg-image']   = `url("${this._config.card_bg_image}")`;
    if (this._config.card_bg_image_size) cardInlineStyles['--sc-card-bg-image-sz']= this._config.card_bg_image_size === 'stretch' ? '100% 100%' : this._config.card_bg_image_size;
    if (st.tile_border)        cardInlineStyles['--sc-tile-border']     = st.tile_border;
    if (st.text_primary)  cardInlineStyles['--sc-text-primary'] = st.text_primary;
    if (st.online_color)  cardInlineStyles['--sc-online-color'] = st.online_color;
    if (st.power_color)   cardInlineStyles['--sc-power-color']  = st.power_color;
    if (this._config.graph_line_color) cardInlineStyles['--sc-graph-line'] = this._config.graph_line_color;

    // Button style vars
    const btnShape   = st.button_shape   ?? 'pill';
    const btnVariant = st.button_variant ?? 'fill';
    const btnSize    = st.button_size    ?? 'md';
    const togPadMap: Record<string,string> = { sm: '2px 8px', md: '4px 11px', lg: '6px 16px' };
    const togPadSqMap: Record<string,string> = { sm: '3px 5px', md: '4px 8px', lg: '6px 12px' };
    const isSquarish = btnShape === 'square' || btnShape === 'circle';
    cardInlineStyles['--tog-radius'] = btnShape === 'pill' ? '20px' : btnShape === 'rect' ? '6px' : btnShape === 'square' ? '6px' : '50%';
    cardInlineStyles['--tog-pad']    = isSquarish ? togPadSqMap[btnSize] ?? togPadSqMap.md : togPadMap[btnSize] ?? togPadMap.md;
    cardInlineStyles['--tog-fsize']  = btnSize === 'sm' ? '.65em' : btnSize === 'lg' ? '.8em' : '.72em';
    cardInlineStyles['--tog-aspect'] = isSquarish ? '1' : 'auto';
    if (btnVariant === 'outline') {
      cardInlineStyles['--tog-on-bg']     = 'transparent';
      cardInlineStyles['--tog-on-border'] = '1px solid var(--sc-accent)';
      cardInlineStyles['--tog-on-color']  = 'var(--sc-accent)';
      cardInlineStyles['--tog-on-shadow'] = 'none';
    } else if (btnVariant === 'ghost') {
      cardInlineStyles['--tog-on-bg']     = 'transparent';
      cardInlineStyles['--tog-on-border'] = 'none';
      cardInlineStyles['--tog-on-color']  = 'var(--sc-accent)';
      cardInlineStyles['--tog-on-shadow'] = 'none';
    } else {
      // fill (default) — no override needed, existing CSS handles it
    }

    if (st.header_bg && st.header_bg2) {
      cardInlineStyles['--sc-header-bg'] = `linear-gradient(135deg, ${st.header_bg} 0%, ${st.header_bg2} 100%)`;
    } else if (st.header_bg) {
      cardInlineStyles['--sc-header-bg'] = st.header_bg;
    }

    const cardBgBase = st.card_bg ?? 'var(--ha-card-background, #1c1c1e)';
    if (st.card_bg) cardInlineStyles['--sc-card-bg'] = st.card_bg;
    const cardTransparency = this._config.card_opacity ?? 100;
    if (cardTransparency < 100) {
      cardInlineStyles['--sc-card-bg'] = `color-mix(in srgb, ${cardBgBase} ${cardTransparency}%, transparent)`;
    }
    const tileTransparency = this._config.tile_opacity ?? 100;
    if (tileTransparency < 100) {
      cardInlineStyles['--sc-tile-bg-opacity'] = String(tileTransparency / 100);
    }

    return html`
      <ha-card style=${styleMap(cardInlineStyles)}>
        <div class="dash-header">
          <span class="dash-title">HA Devices</span>
          <div class="dash-stats">
            <span class="stat online">${online}/${devices.length} online</span>
            ${offline > 0 ? html`<span class="stat offline-count">${offline} offline</span>` : nothing}
            <span class="stat power">${formatPower(totalPower)}</span>
            ${alertDevices.length > 0 ? html`<span class="stat alerts-count">⚠ ${alertDevices.length}</span>` : nothing}
          </div>
        </div>
        <div class="dash-body">
          ${[...byArea.entries()].map(([area, areaDevices]) =>
            this._renderAreaSection(area, areaDevices)
          )}
        </div>
      </ha-card>
    `;
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  static styles = css`
    :host {
      --sc-accent:          #f4601e;
      --sc-accent-glow:     rgba(244,96,30,0.35);
      --sc-graph-line:      var(--sc-accent);
      --tile-radius:        12px;
      --tile-gap:           10px;
      --sc-header-bg:       linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
      --sc-header-orb2:     #3b82f6;
      --sc-header-text:     #ffffff;
      --sc-online-color:    #4ade80;
      --sc-online-bg:       rgba(74,222,128,0.2);
      --sc-online-border:   rgba(74,222,128,0.3);
      --sc-online-glow:     rgba(74,222,128,0.4);
      --sc-power-color:     #fb923c;
      --sc-offline-dot:     #4b5563;
      --sc-tile-bg:         rgba(255,255,255,0.04);
      --sc-tile-bg-image:   none;
      --sc-tile-bg-image-sz:cover;
      --sc-tile-border:     rgba(255,255,255,0.07);
      --sc-tile-hover-bg:   rgba(255,255,255,0.07);
      --sc-tile-hover-shad: rgba(0,0,0,0.30);
      --sc-tile-exp-bg:     rgba(255,255,255,0.06);
      --sc-sensor-bg:       rgba(255,255,255,0.04);
      --sc-text-primary:    #e5e7eb;
      --sc-text-secondary:  #9ca3af;
      --sc-text-muted:      #6b7280;
      --sc-text-value:      #f9fafb;
      --sc-text-detail:     #d1d5db;
      --sc-tog-off-bg:      rgba(255,255,255,0.08);
      --sc-tog-off-border:  rgba(255,255,255,0.10);
      --sc-update-color:    #f59e0b;
      --sc-update-glow:     rgba(245,158,11,0.40);
      --sc-font-family:     'DM Sans', sans-serif;
      --sc-text-transform:  uppercase;
      --sc-text-scale:      1;
      --sc-card-bg:         var(--ha-card-background, var(--card-background-color, #1c1c1e));
      --sc-card-bg-image:   none;
      --sc-card-bg-image-sz:cover;
      --sc-tile-bg-opacity: 1;
    }

    ha-card {
      overflow-x: hidden; overflow-y: visible;
      background: var(--sc-card-bg-image) center / var(--sc-card-bg-image-sz) no-repeat, var(--sc-card-bg);
      container-type: inline-size; container-name: ha-dash;
      font-family: var(--sc-font-family);
    }

    .dash-header {
      position: relative; display: flex; align-items: center; justify-content: space-between;
      padding: 16px 18px 14px; background: var(--sc-header-bg); overflow: hidden;
    }
    .dash-header::before,.dash-header::after {
      content:''; position:absolute; border-radius:50%; filter:blur(40px); opacity:0.5;
      animation: drift 8s ease-in-out infinite alternate;
    }
    .dash-header::before { width:120px;height:120px; background:var(--sc-accent); top:-40px;left:-20px; }
    .dash-header::after  { width:100px;height:100px; background:var(--sc-header-orb2); bottom:-30px;right:20px; animation-delay:-4s; }
    @keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(15px,8px) scale(1.15)} }

    .dash-title {
      font-size:1.1em; font-weight:800; color:var(--sc-header-text);
      letter-spacing:0.02em; position:relative; z-index:1;
      display:flex; align-items:center; gap:8px;
    }
    .dash-title::before { content:'⚡'; }

    .dash-stats { display:flex; gap:8px; align-items:center; position:relative; z-index:1; }
    .stat { font-size:0.78em; padding:3px 10px; border-radius:20px; font-weight:600; backdrop-filter:blur(4px); }
    .stat.online   { background:var(--sc-online-bg);  color:var(--sc-online-color); border:1px solid var(--sc-online-border); }
    .stat.power    { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-power-color); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); }
    .stat.offline-count { background:rgba(75,85,99,.25); color:#9ca3af; border:1px solid rgba(75,85,99,.35); }
    .stat.alerts-count  { background:rgba(239,68,68,.2); color:#fca5a5; border:1px solid rgba(239,68,68,.3); animation:blink 2s step-end infinite; }

    .dash-body { padding:0 0 8px; }
    .empty { padding:32px; text-align:center; color:var(--secondary-text-color); }
    .empty .hint { font-size:.85em; margin-top:4px; }

    .area-section {
      position:relative; overflow:hidden; margin:6px 10px 2px;
      border:1px solid var(--sc-tile-border); border-radius:10px;
    }
    .area-header {
      display:flex; align-items:center; justify-content:space-between;
      background:var(--area-header-bg,rgba(255,255,255,0.04));
      padding:8px 14px; cursor:pointer; user-select:none;
      border-radius:10px; transition:filter 0.15s;
    }
    .area-header:hover { filter:brightness(1.08); }
    .area-section:not(.closed) .area-header { border-radius:10px 10px 0 0; border-bottom:1px solid var(--sc-tile-border); }
    .area-name { font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700); text-transform:var(--sc-text-transform,uppercase); letter-spacing:0.08em; color:var(--area-header-color,var(--sc-accent)); }
    .area-chips { display:flex; align-items:center; flex-wrap:wrap; gap:4px; flex:1; margin:0 10px; }
    .area-chip { display:flex; align-items:center; gap:3px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:1px 5px; }
    .area-chip .tsc-lbl { font-size:.65em; color:var(--secondary-text-color); }
    .area-chip .tsc-val { font-size:.72em; font-weight:600; color:var(--sc-text-primary,var(--primary-text-color)); }
    .area-meta { display:flex; align-items:center; gap:8px; }
    .area-count { font-size:.75em; color:var(--secondary-text-color); }
    .area-power { font-size:.78em; font-weight:600; color:var(--sc-power-color); }
    .chevron { font-size:.6em; color:var(--secondary-text-color); transition:transform 0.25s; display:inline-block; }
    .chevron.open { transform:rotate(180deg); }

    .device-grid {
      display:grid; grid-template-columns:repeat(var(--cols,3),1fr);
      gap:var(--tile-gap,10px); padding:4px 12px 14px;
    }
    @container ha-dash (max-width:600px) { .device-grid { --cols:2; } }
    @container ha-dash (max-width:380px) { .device-grid { --cols:1; } }
    @container ha-dash (min-width:700px) { .sparkline-svg.exp { height:56px; } }

    .tile {
      border:1px solid var(--sc-tile-border);
      border-radius:var(--tile-radius); padding:11px 13px; cursor:pointer;
      transition:transform 0.15s, box-shadow 0.15s;
      display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden;
      isolation:isolate;
    }
    .tile::after {
      content:''; position:absolute; inset:0; z-index:-1; pointer-events:none;
      background:var(--sc-tile-bg);
      background-image:var(--sc-tile-bg-image); background-size:var(--sc-tile-bg-image-sz); background-position:center;
      opacity:var(--sc-tile-bg-opacity,1); transition:opacity 0.15s, background 0.15s;
    }
    .tile::before {
      content:''; position:absolute; top:0;left:0;right:0; height:2px;
      background:linear-gradient(90deg,var(--sc-accent),transparent); opacity:0; transition:opacity 0.2s; z-index:1;
    }
    .tile:hover { transform:translateY(-2px); box-shadow:0 6px 20px var(--sc-tile-hover-shad); }
    .tile:hover::after { background-color:var(--sc-tile-hover-bg); }
    .tile:hover::before { opacity:1; }
    .tile.offline { opacity:.45; filter:grayscale(.4); }
    .tile.expanded { border-color:var(--sc-accent); box-shadow:0 0 0 1px var(--sc-accent),0 4px 12px var(--sc-accent-glow); transform:none; }
    .tile.expanded::after { background-color:var(--sc-tile-exp-bg); }
    .tile.expanded::before { opacity:1; }
    .tile.tile-sm { padding:7px 9px; gap:4px; }
    .tile.tile-lg { padding:15px 17px; gap:9px; }

    .tile-expanded-panel {
      grid-column:1/-1; margin:2px 4px 6px; padding:14px;
      border:1px solid var(--sc-accent); border-radius:8px;
      background:var(--sc-tile-exp-bg);
      box-shadow:0 0 0 1px var(--sc-accent),0 8px 24px var(--sc-accent-glow);
      animation:slide-in 0.2s ease; cursor:default;
    }
    @keyframes slide-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

    .tile-top { display:flex; align-items:center; justify-content:space-between; gap:6px; min-width:0; }
    .tile-left { display:flex; align-items:center; gap:6px; min-width:0; flex:1; }

    .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .dot.online { background:var(--sc-online-color); box-shadow:0 0 0 0 var(--sc-online-glow); animation:pulse-dot 2.5s ease-in-out infinite; }
    .dot.offline { background:var(--sc-offline-dot); }
    @keyframes pulse-dot { 0%{box-shadow:0 0 0 0 var(--sc-online-glow)} 60%{box-shadow:0 0 0 5px transparent} 100%{box-shadow:0 0 0 0 var(--sc-online-glow)} }

    .tile-name { font-size:calc(var(--sc-text-scale,1) * .88em); font-weight:600; color:var(--sc-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
    .update-dot { color:var(--sc-update-color); font-size:.55em; flex-shrink:0; animation:blink 2s step-end infinite; }
    @keyframes blink { 50%{opacity:.3} }

    .tile-sensor-chips { display:flex; flex-wrap:wrap; gap:4px; margin:2px 0 0; }
    .tile-sensor-chip { display:flex; flex-direction:column; align-items:center; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:6px; padding:2px 7px; min-width:38px; }
    .tsc-lbl { font-size:.6em; color:var(--sc-text-muted); text-transform:uppercase; letter-spacing:.03em; }
    .tsc-val { font-size:calc(var(--sc-text-scale,1) * .78em); color:var(--sc-text-primary); font-weight:500; }
    .tile-sensor-chip.warn .tsc-val { color:var(--sc-accent); }

    .tile-bot { display:flex; align-items:center; justify-content:space-between; gap:4px; min-width:0; }
    .tile-power { font-size:.95em; font-weight:700; color:var(--sc-power-color); font-variant-numeric:tabular-nums; }
    .tile-badges { display:flex; gap:4px; align-items:center; margin-left:auto; }
    .type-badge,.gen-badge,.int-badge-tile { font-size:9px; font-weight:600; letter-spacing:.03em; padding:2px 5px; border-radius:4px; line-height:1.4; white-space:nowrap; }
    .type-relay       { background:rgba(99,102,241,.25);  color:#a5b4fc; }
    .type-dimmer      { background:rgba(234,179,8,.20);   color:#fde047; }
    .type-rgb         { background:rgba(236,72,153,.22);  color:#f9a8d4; }
    .type-plug        { background:rgba(34,197,94,.20);   color:#86efac; }
    .type-cover       { background:rgba(14,165,233,.20);  color:#7dd3fc; }
    .type-energy      { background:rgba(245,158,11,.22);  color:#fcd34d; }
    .type-sensor      { background:rgba(20,184,166,.20);  color:#5eead4; }
    .type-input       { background:rgba(168,85,247,.20);  color:#d8b4fe; }
    .type-climate     { background:rgba(239,68,68,.22);   color:#fca5a5; }
    .type-media_player{ background:rgba(26,188,156,.20);  color:#5eead4; }
    .type-script,.type-scene,.type-automation { background:rgba(99,102,241,.20); color:#c4b5fd; }
    .type-helper      { background:rgba(156,163,175,.20); color:#d1d5db; }
    .type-script.type-badge,.type-scene.type-badge,.type-automation.type-badge,.type-helper.type-badge { font-size:18px; padding:4px 10px; border-radius:6px; }
    .gen-1   { background:rgba(107,114,128,.25); color:#9ca3af; }
    .gen-2   { background:rgba(59,130,246,.22);  color:#93c5fd; }
    .gen-3   { background:rgba(34,197,94,.20);   color:#86efac; }
    .gen-4   { background:rgba(168,85,247,.20);  color:#d8b4fe; }
    .gen-ble { background:rgba(6,182,212,.20);   color:#67e8f9; }
    .int-badge-tile { background:rgba(255,255,255,.06); color:var(--sc-text-muted); }
    .tile-ui-link { font-size:11px; font-weight:700; color:var(--sc-accent); text-decoration:none; padding:1px 4px; border-radius:4px; opacity:.75; transition:opacity .15s; }
    .tile-ui-link:hover { opacity:1; }

    .alert-badge { font-size:9px; font-weight:700; padding:2px 5px; border-radius:4px; white-space:nowrap; animation:blink 1.5s step-end infinite; }
    .alert-overtemp  { background:rgba(251,146,60,.25); color:#fdba74; }
    .alert-overpower { background:rgba(239,68,68,.25);  color:#fca5a5; }

    .tog { padding:var(--tog-pad,4px 11px); border:none; border-radius:var(--tog-radius,20px); aspect-ratio:var(--tog-aspect,auto); cursor:pointer; font-size:var(--tog-fsize,.72em); font-weight:700; letter-spacing:.05em; flex-shrink:0; transition:transform .1s,opacity .15s,box-shadow .15s; position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; }
    .tog::after { content:''; position:absolute; inset:0; background:white; opacity:0; transition:opacity .15s; }
    .tog:active::after { opacity:.15; }
    .tog.sm { padding:2px 9px; font-size:.68em; }
    .tog.on { background:var(--tog-on-bg,linear-gradient(135deg,var(--sc-accent),color-mix(in srgb,var(--sc-accent) 70%,#f97316))); color:var(--tog-on-color,white); box-shadow:var(--tog-on-shadow,0 2px 8px var(--sc-accent-glow)); border:var(--tog-on-border,none); }
    .tog.off { background:var(--sc-tog-off-bg); color:var(--sc-text-secondary); border:1px solid var(--sc-tog-off-border); }
    .tog.update { background:linear-gradient(135deg,var(--sc-update-color),color-mix(in srgb,var(--sc-update-color) 60%,#f97316)); color:white; box-shadow:0 2px 6px var(--sc-update-glow); }
    .tog:hover { opacity:.85; transform:scale(1.04); }
    .tog:active { transform:scale(.96); }

    .tile-dim-row { display:flex; align-items:center; gap:8px; padding:2px 0 0; }
    .dim-slider { flex:1; min-width:0; cursor:pointer; accent-color:var(--sc-accent); }
    .dim-slider:disabled { opacity:.3; }
    .dim-pct { font-size:.68em; font-weight:600; color:var(--sc-text-secondary); min-width:30px; text-align:right; }
    .color-swatch { width:30px; height:20px; border-radius:5px; border:none; cursor:pointer; padding:1px; background:transparent; flex-shrink:0; }
    .color-swatch:disabled { opacity:.3; }

    .cov-btns { display:flex; gap:2px; }
    .cov-btn { background:var(--sc-tog-off-bg); border:1px solid var(--sc-tog-off-border); border-radius:6px; color:var(--sc-text-primary); cursor:pointer; font-size:10px; padding:3px 7px; transition:background .15s; }
    .cov-btn:hover { background:rgba(255,255,255,.15); }
    .cov-btn.stop { color:var(--sc-text-muted); }
    .cov-pos-row { display:flex; align-items:center; gap:6px; padding:4px 0 2px; }
    .cov-bar { flex:1; height:4px; background:rgba(255,255,255,.10); border-radius:3px; overflow:hidden; }
    .cov-fill { height:100%; background:var(--sc-accent); border-radius:3px; transition:width .4s; }
    .cov-pct { font-size:10px; color:var(--sc-text-secondary); min-width:34px; text-align:right; }

    .tile-trv-row { display:flex; align-items:center; gap:8px; padding:2px 0 0; }
    .trv-temps { display:flex; align-items:baseline; gap:4px; flex:1; min-width:0; }
    .trv-cur { font-size:.82em; color:var(--sc-text-secondary); font-variant-numeric:tabular-nums; }
    .trv-sep { font-size:.7em; color:var(--sc-text-muted); }
    .trv-target { font-size:.95em; font-weight:700; color:var(--sc-text-value); font-variant-numeric:tabular-nums; }
    .trv-target.heating { color:var(--sc-accent); }
    .trv-flame { font-size:.75em; flex-shrink:0; }
    .trv-step-btns { display:flex; gap:3px; flex-shrink:0; }
    .trv-step { width:22px;height:22px; border:1px solid var(--sc-tog-off-border); border-radius:6px; background:var(--sc-tog-off-bg); color:var(--sc-text-secondary); font-size:1em; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; }
    .trv-step:hover { background:var(--sc-accent); color:white; }
    .trv-ctrl-row { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
    .trv-big-btn { width:36px;height:36px; border:1px solid var(--sc-tog-off-border); border-radius:50%; background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:1.3em; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; }
    .trv-big-btn:hover { background:var(--sc-accent); color:white; }
    .trv-display { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; }
    .trv-target-big { font-size:1.8em; font-weight:700; color:var(--sc-text-primary); font-variant-numeric:tabular-nums; }
    .trv-current-sub { font-size:.78em; color:var(--sc-text-secondary); }
    .trv-action-badge { font-size:.65em; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:10px; }
    .trv-action-badge.heating { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); }
    .trv-mode-row { display:flex; gap:6px; margin-bottom:6px; }
    .trv-range-lbl { font-size:.68em; color:var(--sc-text-muted); flex-shrink:0; }
    .dim-wrap { display:flex; flex-direction:row; align-items:center; gap:6px; flex:1; min-width:0; }

    .tile-trv-dial { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; width:100%; padding:4px 0; }
    .trv-dial-svg { width:100%; height:auto; overflow:visible; }
    .dial-target-text { font-size:30px; font-weight:700; fill:var(--sc-text-primary,#fff); }
    .dial-sub-text { font-size:11px; fill:var(--sc-text-secondary,rgba(255,255,255,0.5)); }
    .dial-current-text { font-size:13px; fill:var(--sc-text-secondary,rgba(255,255,255,0.65)); }
    .dial-range-text { font-size:11px; fill:var(--sc-text-secondary,rgba(255,255,255,0.5)); }
    .trv-dial-btns { display:flex; align-items:center; gap:12px; margin-top:2px; }
    .trv-stat-row { display:flex; gap:10px; justify-content:center; margin-top:4px; }
    .trv-stat { display:flex; flex-direction:column; align-items:center; }
    .trv-stat-lbl { font-size:10px; color:var(--sc-text-secondary,rgba(255,255,255,0.55)); }
    .trv-stat-val { font-size:13px; font-weight:600; color:var(--sc-text-primary,#fff); }
    .trv-presets { display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin-top:6px; }
    .trv-preset-btn { font-size:11px; padding:3px 8px; border-radius:12px; border:1px solid var(--sc-border); background:transparent; color:var(--sc-text-primary); cursor:pointer; white-space:nowrap; }
    .trv-preset-btn.active { background:var(--sc-accent,#e67e22); border-color:var(--sc-accent,#e67e22); color:#fff; }

    .valve-dial-btns { display:flex; align-items:center; gap:8px; margin-top:2px; }
    .valve-btn { padding:4px 14px; border-radius:8px; border:1px solid var(--sc-tog-off-border); background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:12px; font-weight:600; cursor:pointer; transition:background .15s; }
    .valve-btn:hover { background:rgba(255,255,255,.15); }
    .valve-btn.open:hover { background:#0ea5e9; border-color:#0ea5e9; color:#fff; }
    .valve-btn.close:hover { background:#6b7280; border-color:#6b7280; color:#fff; }
    .valve-btn.stop { color:var(--sc-text-muted); font-size:10px; }
    .valve-slider-row { display:flex; align-items:center; gap:6px; width:100%; padding:4px 8px 0; box-sizing:border-box; }

    .tile-inputs { display:flex; gap:5px; flex-wrap:wrap; padding:4px 0 2px; }
    .input-chip { display:flex; align-items:center; gap:4px; padding:4px 10px 4px 8px; border-radius:14px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.05); font-size:12px; color:var(--sc-text-muted); transition:all .15s; }
    .input-chip.active { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); border-color:color-mix(in srgb,var(--sc-accent) 40%,transparent); }
    .input-dot { width:7px;height:7px; border-radius:50%; background:currentColor; flex-shrink:0; }
    .input-lbl { font-weight:600; }

    .tile-media-row { display:flex; flex-direction:column; gap:5px; padding:2px 0 0; }
    .media-title { font-size:.72em; color:var(--sc-text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .media-artist { font-style:normal; color:var(--sc-text-muted); }
    .media-btns { display:flex; gap:3px; }

    .power-bar { position:absolute; bottom:0;left:0;right:0; height:3px; background:rgba(255,255,255,.06); border-radius:0 0 var(--tile-radius) var(--tile-radius); overflow:hidden; }
    .power-bar-fill { height:100%; background:linear-gradient(90deg,var(--sc-accent),#f97316); border-radius:inherit; transition:width .4s; }

    /* ── Expanded panel ── */
    .expanded { margin-top:10px; border-top:1px solid color-mix(in srgb,var(--sc-accent) 25%,transparent); padding-top:12px; display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start; animation:slide-in .2s ease; }
    .exp-section { flex:1; min-width:140px; }
    .exp-section--full { flex:1 1 100%; min-width:0; }
    .exp-label { font-size:.68em; text-transform:uppercase; letter-spacing:.08em; color:var(--sc-text-muted); margin-bottom:7px; font-weight:600; }
    .exp-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:3px 0; }
    .exp-name { font-size:.84em; color:var(--sc-text-detail); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40%; }
    .sensor-row { display:flex; flex-wrap:wrap; gap:6px; }
    .sensor-chip { display:flex; align-items:center; gap:5px; background:var(--sc-sensor-bg); border-radius:20px; padding:4px 10px; white-space:nowrap; }
    .sensor-label { font-size:.65em; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); }
    .sensor-value { font-size:calc(var(--sc-text-scale,1) * .85em); font-weight:600; color:var(--sc-text-value); font-variant-numeric:tabular-nums; }
    .sensor-value.warn { color:var(--error-color,#ef4444); }
    .expanded-graph-header { display:flex; justify-content:flex-end; padding:0 0 4px; }
    .spark-refresh-all { background:none; border:1px solid rgba(255,255,255,.12); border-radius:6px; color:var(--sc-text-muted); font-size:.75em; cursor:pointer; padding:3px 10px; transition:color .15s,border-color .15s; }
    .spark-refresh-all:hover { color:var(--sc-accent); border-color:var(--sc-accent); }

    /* ── Entity list ── */
    .ent-list-header { display:flex; align-items:center; justify-content:space-between; cursor:pointer; user-select:none; padding:4px 0; }
    .ent-caret { font-size:.65em; color:var(--sc-text-muted); transition:transform .2s; flex-shrink:0; }
    .ent-caret.open { transform:rotate(180deg); }
    .ent-list { display:flex; flex-direction:column; gap:2px; margin-top:6px; }
    .ent-row { display:flex; align-items:center; gap:6px; padding:4px 6px; border-radius:6px; background:var(--sc-tile-bg); min-height:28px; }
    .ent-domain { font-size:.62em; font-weight:700; text-transform:uppercase; letter-spacing:.04em; min-width:72px; flex-shrink:0; color:var(--sc-text-muted); }
    .ent-name { font-size:.82em; color:var(--sc-text-detail); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ent-state { font-size:.78em; color:var(--sc-text-secondary); font-family:monospace; white-space:nowrap; flex-shrink:0; }

    /* ── Sparklines ── */
    .sparklines-block { display:flex; flex-direction:column; gap:4px; padding:4px 8px 2px; }
    .sparklines-block.exp { padding:6px 8px 4px; gap:8px; }
    .spark-group { display:flex; flex-direction:column; gap:0; }
    .spark-row { display:flex; align-items:center; gap:6px; min-height:32px; }
    .spark-lbl { font-size:.62em; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); width:68px; flex-shrink:0; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .spark-svg-wrap { flex:1; position:relative; min-width:0; }
    .sparkline-svg { width:100%; height:32px; display:block; overflow:visible; cursor:crosshair; }
    .sparkline-svg.exp { height:48px; }
    .spark-tick { stroke:rgba(255,255,255,.2); stroke-width:.5; stroke-dasharray:3 3; pointer-events:none; }
    .spark-crosshair { stroke:rgba(255,255,255,.35); stroke-width:.6; stroke-dasharray:2 2; pointer-events:none; }
    .spark-hover-dot { fill:var(--sc-graph-line); stroke:var(--sc-card-bg,#1e1e2e); stroke-width:1.5; pointer-events:none; }
    .spark-tooltip {
      position:absolute; bottom:calc(100% + 4px); transform:translateX(-50%);
      background:rgba(14,14,28,.92); border:1px solid rgba(255,255,255,.12); border-radius:6px;
      padding:4px 8px; pointer-events:none; white-space:nowrap; z-index:20;
      display:flex; flex-direction:column; align-items:center; gap:1px;
    }
    .spark-tooltip-val  { font-size:.78em; font-weight:700; color:var(--sc-graph-line); }
    .spark-tooltip-time { font-size:.65em; color:var(--sc-text-muted); }
    .spark-val { font-size:.75em; font-weight:600; color:var(--sc-text-secondary); white-space:nowrap; min-width:44px; text-align:right; }
    .spark-time-row { display:flex; align-items:center; gap:6px; padding-bottom:1px; }
    .spark-time-spacer { width:68px; flex-shrink:0; }
    .spark-time-labels { flex:1; display:flex; justify-content:space-between; font-size:.55em; color:var(--sc-text-muted); opacity:.65; user-select:none; }
    .spark-time-end { min-width:44px; }
    .spark-no-data { flex:1; font-size:.7em; color:var(--sc-text-muted); opacity:.6; display:flex; align-items:center; padding-left:4px; }
    .spark-retry { background:none; border:none; color:var(--sc-text-muted); font-size:1em; cursor:pointer; padding:0 4px; opacity:.6; }
    .spark-retry:hover { opacity:1; color:var(--sc-accent); }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    .sparkline-loading { flex:1; height:32px; border-radius:4px;
      background:linear-gradient(90deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.03) 100%);
      background-size:200% 100%; animation:shimmer 1.6s ease-in-out infinite; }
    .sparkline-loading.exp { height:48px; }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-device-dashboard': HADeviceDashboard;
  }
}
