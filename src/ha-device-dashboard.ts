import { LitElement, html, svg, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  HADeviceDashboardConfig, HADevice, HAEntity,
  TileBlockId, DeviceProfileResult, EntityAnimationType,
} from './types';
import {
  getAllDevices, getDeviceProfile,
  getIntegrationLabel, isPrivateIp, PROFILE_DEFAULT_BLOCKS, GRAPH_DC_LABELS, GRAPH_SENSOR_DEFS,
  formatPower, formatEnergy, formatVoltage, formatCurrent, formatTemp,
  formatUptime, rssiToQuality, formatApparentPower, formatReactivePower,
  formatFrequency, formatHumidity, formatIlluminance, formatPpm, formatPercent,
} from './helpers';
import { renderAnimSvg } from './anim-icons';

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
  @state() private _graphDialog: string | null = null;
  @state() private _cloudDetailOpen: 'on' | 'off' | 'unavailable' | null = null;

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
    // feature bit 4 = SET_POSITION support
    const supportsPosition = !!((s.attributes as any)?.supported_features & 4);
    let position: number | undefined = (s.attributes as any)?.current_position;
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
      const a = ns.attributes as any;
      return (a.min === 0 && a.max === 100) || e.entity_id.includes('position');
    });
    let temperature: number | undefined;
    const te = device.entities.find(e => e.domain === 'sensor' && (this.hass.states[e.entity_id]?.attributes as any)?.device_class === 'temperature');
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
    const bsInputs = device.entities.filter(e =>
      e.domain === 'binary_sensor' && (
        e.entity_id.includes('input') || e.entity_id.includes('button') ||
        e.entity_id.includes('channel') ||
        (e.attributes as any)?.device_class == null
      )
    );
    const eventInputs = device.entities.filter(e =>
      e.domain === 'event' && (
        (e.attributes as any)?.device_class === 'button' ||
        e.entity_id.includes('channel') || e.entity_id.includes('input')
      )
    );

    if (bsInputs.length > 0) {
      return bsInputs.map(e => {
        const s = this.hass.states[e.entity_id];
        const friendly = (s?.attributes as any)?.friendly_name ?? '';
        const m = e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i) ?? friendly.match(/(\d+)\s*$/);
        const ch = m ? parseInt(m[1]) : 0;
        const base = e.entity_id.replace(/^binary_sensor\./, '');
        const evEnt = device.entities.find(ev =>
          ev.domain === 'event' && ev.entity_id.replace(/^event\./, '') === base
        );
        const evState = evEnt ? this.hass.states[evEnt.entity_id] : null;
        const lastEvent: string | null =
          (evState?.attributes as any)?.event_type ??
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
      const friendly = (s?.attributes as any)?.friendly_name ?? '';
      const m = e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i) ?? friendly.match(/(\d+)\s*$/);
      const ch = m ? parseInt(m[1]) : 0;
      const lastEvent: string | null =
        (s?.attributes as any)?.event_type ??
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

  private _getGraphEntities(device: HADevice): Array<{ entityId: string; label: string; dc: string; unit: string }> {
    const dcList = this._config.graph_sensors ?? [];
    if (!dcList.length) return [];
    const results: Array<{ entityId: string; label: string; dc: string; unit: string }> = [];
    for (const dc of dcList) {
      const ents = device.entities.filter(e => {
        if (e.domain !== 'sensor') return false;
        const st = this.hass.states[e.entity_id];
        if (!st || st.state === 'unavailable' || st.state === 'unknown') return false;
        const attrDc = (st.attributes as any)?.device_class ?? (e.attributes as any)?.device_class;
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

  private _renderSparklines(device: HADevice, expanded = false): TemplateResult {
    const entities = this._getGraphEntities(device);
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

      const openDialog = (e: Event) => { e.stopPropagation(); this._graphDialog = device.device_id; };
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

  private _renderGraphDialog(): TemplateResult {
    if (!this._graphDialog) return html``;
    const device = this._getDevices().find(d => d.device_id === this._graphDialog);
    if (!device) return html``;
    return html`
      <div class="graph-dialog-backdrop" @click=${() => this._graphDialog = null}>
        <div class="graph-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="graph-dialog-header">
            <span>${device.name}</span>
            <button class="graph-dialog-close" @click=${() => this._graphDialog = null}>✕</button>
          </div>
          ${this._renderSparklines(device, true)}
        </div>
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

  private _renderValveDial(vc: NonNullable<ReturnType<typeof this._getValve>>) {
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

  private _getVirtualControls(device: HADevice) {
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

      case 'name_row': {
        const devSt = this._config.device_styles?.[device.device_id];
        const tileIconType = isOn
          ? devSt?.tile_icon
          : (devSt?.tile_icon_off ?? devSt?.tile_icon);
        let tileIcon: TemplateResult;
        if (tileIconType) {
          tileIcon = renderAnimSvg(tileIconType, isOn, `--ent-spd:${devSt?.tile_icon_speed ?? 1}`, 'tile-icon');
        } else if (valve) {
          const pos = valve.position ?? (valve.state === 'open' ? 100 : 0);
          const valveIconType: EntityAnimationType | undefined =
            pos > 66 ? 'water2' :   // waves — fully open
            pos > 33 ? 'water3' :   // ripple — ~2/3 open
            pos > 0  ? 'water'  :   // drop — ~1/3 open
            undefined;              // closed — no icon
          tileIcon = valveIconType
            ? renderAnimSvg(valveIconType, true, '--ent-spd:1', 'tile-icon')
            : html``;
        } else if (trv) {
          const heating = trv.hvacAction === 'heating';
          const pos = trv.valvePosition;
          const trvIconType: EntityAnimationType | undefined = heating
            ? (pos != null
                ? (pos > 66 ? 'flame3' :   // campfire — wide open
                   pos > 33 ? 'flame2' :   // double flame — medium
                   'flame')                // single flame — low
                : 'flame')                 // no position data — single flame
            : undefined;                   // idle / off — no icon
          tileIcon = trvIconType
            ? renderAnimSvg(trvIconType, true, '--ent-spd:1', 'tile-icon')
            : html``;
        } else {
          tileIcon = html``;
        }
        const swAnimIcon = sw ? this._renderEntityAnim(sw.entityId, isOn, device.device_id) : html``;
        return html`
          <div class="tile-top">
            <div class="tile-left">
              <span class="dot ${online ? 'online' : 'offline'}"></span>
              ${tileIcon}
              ${swAnimIcon}
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
            ` : nothing}
          </div>
        `;
      }

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

      case 'dimmer': {
        const swState = sw ? this.hass.states[sw.entityId] : null;
        const effectList: string[] = (swState?.attributes as any)?.effect_list ?? [];
        const currentEffect: string | null = (swState?.attributes as any)?.effect ?? null;
        const whiteVal = sw?.whiteValue ?? 0;
        return sw && isDimmable ? html`
          <div class="tile-dim-row" @click=${(e: Event) => e.stopPropagation()}>
            ${hasColor ? html`
              <input type="color" class="color-swatch tile-color-swatch" .value=${hexColor}
                ?disabled=${!isOn}
                @change=${(e: Event) => { e.stopPropagation(); this._setColor(sw.entityId, (e.target as HTMLInputElement).value, whiteVal, isRgbw); }}/>
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
          ${isRgbw ? html`
            <div class="tile-dim-row tile-white-row" @click=${(e: Event) => e.stopPropagation()}>
              <span class="dim-white-lbl">W</span>
              <input type="range" class="dim-slider white-slider" min="0" max="255"
                .value=${String(whiteVal)}
                @input=${(e: Event) => {
                  const el = (e.target as HTMLInputElement).closest('.tile-white-row')?.querySelector('.white-pct');
                  if (el) el.textContent = (e.target as HTMLInputElement).value;
                }}
                @change=${(e: Event) => {
                  const w = parseInt((e.target as HTMLInputElement).value, 10);
                  this._setColor(sw.entityId, hexColor, w, true);
                }}/>
              <span class="white-pct dim-pct">${whiteVal}</span>
            </div>
          ` : nothing}
          ${effectList.length > 1 ? html`
            <div class="tile-effects" @click=${(e: Event) => e.stopPropagation()}>
              ${effectList.filter(fx => fx !== 'Off').map(fx => html`
                <button class="effect-btn ${currentEffect === fx ? 'active' : ''}"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    const isActive = currentEffect === fx;
                    this.hass.callService('light', 'turn_on', { entity_id: sw.entityId, effect: isActive ? 'Off' : fx });
                  }}>
                  ${fx}
                </button>`)}
            </div>
          ` : nothing}
        ` : html``;
      }

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
              <button class="trv-step" @click=${() => {
                const cur = this._trvDragTemp ?? trv.targetTemp;
                if (cur == null) return;
                const next = Math.max(trv.minTemp, Math.round((cur - trv.step) * 100) / 100);
                this._trvDragTemp = next;
                if (this._trvBtnTimer) clearTimeout(this._trvBtnTimer);
                this._trvBtnTimer = setTimeout(() => { this._setTemp(trv.entityId, this._trvDragTemp ?? next); this._trvDragTemp = null; }, 600);
              }}>−</button>
              <span class="trv-flame">${trv.hvacAction === 'heating' ? '🔥' : ''}</span>
              <button class="trv-step" @click=${() => {
                const cur = this._trvDragTemp ?? trv.targetTemp;
                if (cur == null) return;
                const next = Math.min(trv.maxTemp, Math.round((cur + trv.step) * 100) / 100);
                this._trvDragTemp = next;
                if (this._trvBtnTimer) clearTimeout(this._trvBtnTimer);
                this._trvBtnTimer = setTimeout(() => { this._setTemp(trv.entityId, this._trvDragTemp ?? next); this._trvDragTemp = null; }, 600);
              }}>+</button>
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
              <div class="input-row ${ch.isButton ? 'btn-mode' : (ch.isOn ? 'active' : '')}">
                <span class="${ch.isButton ? 'input-btn-dot' : 'input-row-dot'}"></span>
                <span class="input-row-name">${ch.label}</span>
                <span class="input-row-event">${ch.lastEvent ? ch.lastEvent.replace(/_/g, ' ') : '—'}</span>
                <span class="input-row-time">${this._timeAgo(ch.lastChanged)}</span>
              </div>
            `)}
          </div>
        ` : html``;

      case 'virtual_controls': {
        const virtuals = this._getVirtualControls(device);
        if (!virtuals.length) return html``;
        return html`
          <div class="tile-virtuals" @click=${(e: Event) => e.stopPropagation()}>
            ${virtuals.map(v => {
              if (v.value === 'unavailable') return nothing;
              if (v.domain === 'select') {
                const opts = v.options ?? [];
                const cur = opts.indexOf(v.value);
                return html`
                  <div class="virt-row">
                    <span class="virt-lbl">${v.label}</span>
                    <div class="virt-select">
                      <button class="virt-arr" @click=${() => {
                        const next = opts[(cur - 1 + opts.length) % opts.length];
                        this._selectOption(v.entityId, next);
                      }}>‹</button>
                      <span class="virt-val">${v.value.replace(/_/g, ' ')}</span>
                      <button class="virt-arr" @click=${() => {
                        const next = opts[(cur + 1) % opts.length];
                        this._selectOption(v.entityId, next);
                      }}>›</button>
                    </div>
                  </div>`;
              }
              if (v.domain === 'number') {
                const num = parseFloat(v.value);
                const step = v.step ?? 1;
                const decimals = step < 1 ? String(step).split('.')[1]?.length ?? 1 : 0;
                return html`
                  <div class="virt-row">
                    <span class="virt-lbl">${v.label}</span>
                    <div class="virt-num">
                      <button class="virt-arr" @click=${() => this._setNumberValue(v.entityId, Math.max(v.min ?? 0, +(num - step).toFixed(decimals)))}>−</button>
                      <span class="virt-val">${isNaN(num) ? v.value : num.toFixed(decimals)}</span>
                      <button class="virt-arr" @click=${() => this._setNumberValue(v.entityId, Math.min(v.max ?? 100, +(num + step).toFixed(decimals)))}>+</button>
                    </div>
                  </div>`;
              }
              if (v.domain === 'button') {
                return html`
                  <div class="virt-row">
                    <button class="virt-btn" @click=${(e: Event) => this._pressButton(v.entityId, e)}>${v.label}</button>
                  </div>`;
              }
              if (v.domain === 'text') {
                return html`
                  <div class="virt-row">
                    <span class="virt-lbl">${v.label}</span>
                    <span class="virt-val">${v.value}</span>
                  </div>`;
              }
              if (v.domain === 'switch') {
                return html`
                  <div class="virt-row">
                    <span class="virt-lbl">${v.label}</span>
                    <button class="tog sm ${v.isOn ? 'on' : 'off'}"
                      @click=${(e: Event) => this._toggle(v.entityId, v.isOn, e)}>
                      ${v.isOn ? 'ON' : 'OFF'}
                    </button>
                  </div>`;
              }
              return nothing;
            })}
          </div>`;
      }

      case 'relay_channels': {
        const relayEnts = device.entities.filter(e =>
          e.domain === 'switch' && /_(switch|relay|channel)_\d/.test(e.entity_id)
        );
        if (relayEnts.length <= 1) return html``;
        return html`
          <div class="relay-channels" @click=${(e: Event) => e.stopPropagation()}>
            ${relayEnts.map(e => {
              const s = this.hass.states[e.entity_id];
              const on = s?.state === 'on';
              const name = (s?.attributes as any)?.friendly_name ?? e.entity_id;
              return html`
                <div class="relay-ch-row">
                  <span class="relay-ch-dot ${on ? 'on' : ''}"></span>
                  ${this._renderEntityAnim(e.entity_id, on, device.device_id)}
                  <span class="relay-ch-name">${name}</span>
                  <button class="tog sm ${on ? 'on' : 'off'}"
                    @click=${(ev: Event) => this._toggle(e.entity_id, on, ev)}>
                    ${on ? 'ON' : 'OFF'}
                  </button>
                </div>`;
            })}
          </div>`;
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
              ${intLabel ? html`<span class="int-badge-tile">${intLabel}</span>` : nothing}
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
    const _defaultBlocks: TileBlockId[] = ['name_row', 'sensors', 'graph', 'dimmer', 'cover_controls', 'trv_control', 'valve_controls', 'input_channels', 'relay_channels', 'power_bar', 'badges'];
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
    const grouped = this._groupByArea(devices);

    // Cloud connectivity stats from binary_sensor.*_cloud entities
    const cloudSensors = Object.values(this.hass.states)
      .filter(s => s.entity_id.startsWith('binary_sensor.') && s.entity_id.endsWith('_cloud'));
    const cloudOnline    = cloudSensors.filter(s => s.state === 'on');
    const cloudOffline   = cloudSensors.filter(s => s.state === 'off');
    const cloudUnavail   = cloudSensors.filter(s => s.state === 'unavailable');
    const cloudName = (s: (typeof cloudSensors)[0]) =>
      ((s.attributes.friendly_name as string) ?? s.entity_id).replace(/\s*[Cc]loud$/, '').trim();

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
    if (st.tile_border)        cardInlineStyles['--sc-tile-border']      = st.tile_border;
    if (st.tile_border_width != null) cardInlineStyles['--sc-tile-border-width'] = `${st.tile_border_width}px`;
    if (st.tile_hover_bg)      cardInlineStyles['--sc-tile-hover-bg']    = st.tile_hover_bg;
    if (st.tile_hover_shadow)  cardInlineStyles['--sc-tile-hover-shad']  = st.tile_hover_shadow;
    if (st.tile_sensor_bg)     cardInlineStyles['--sc-sensor-bg']        = st.tile_sensor_bg;
    if (st.tile_exp_bg)        cardInlineStyles['--sc-tile-exp-bg']      = st.tile_exp_bg;
    if (st.card_radius != null) cardInlineStyles['--sc-card-radius']     = `${st.card_radius}px`;
    if (st.text_primary)       cardInlineStyles['--sc-text-primary']     = st.text_primary;
    if (st.text_secondary)     cardInlineStyles['--sc-text-secondary']   = st.text_secondary;
    if (st.text_muted)         cardInlineStyles['--sc-text-muted']       = st.text_muted;
    if (st.offline_color)      cardInlineStyles['--sc-offline-dot']      = st.offline_color;
    if (st.online_color)       cardInlineStyles['--sc-online-color']     = st.online_color;
    if (st.power_color)        cardInlineStyles['--sc-power-color']      = st.power_color;
    if (st.area_header_color)  cardInlineStyles['--sc-area-header-color']= st.area_header_color;
    if (this._config.graph_line_color) cardInlineStyles['--sc-graph-line'] = this._config.graph_line_color;
    // Tile box shadow preset
    const shadowMap: Record<string, string> = {
      soft:   '0 2px 8px rgba(0,0,0,0.25)',
      medium: '0 4px 16px rgba(0,0,0,0.40)',
      strong: '0 8px 28px rgba(0,0,0,0.60)',
    };
    if (st.tile_box_shadow && st.tile_box_shadow !== 'none')
      cardInlineStyles['--sc-tile-shadow'] = shadowMap[st.tile_box_shadow] ?? 'none';
    else if (st.tile_box_shadow === 'none')
      cardInlineStyles['--sc-tile-shadow'] = 'none';

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
    if (st.header_text_color)            cardInlineStyles['--sc-header-text']         = st.header_text_color;
    if (st.header_orb_color)             cardInlineStyles['--sc-header-orb2']         = st.header_orb_color;
    if (st.header_icon !== undefined)    cardInlineStyles['--sc-header-icon']         = `'${st.header_icon}'`;
    if (st.header_title_size)            cardInlineStyles['--sc-header-title-size']   = `${st.header_title_size}em`;
    if (st.header_radius != null)        cardInlineStyles['--sc-header-radius']       = `${st.header_radius}px`;
    if (st.header_padding != null)       cardInlineStyles['--sc-header-padding']      = `${st.header_padding}px`;
    if (st.header_border_color)          cardInlineStyles['--sc-header-border-color'] = st.header_border_color;
    if (st.header_border_width != null)  cardInlineStyles['--sc-header-border-width'] = `${st.header_border_width}px`;
    if (st.header_stat_online)           cardInlineStyles['--sc-hstat-online']        = st.header_stat_online;
    if (st.header_stat_power)            cardInlineStyles['--sc-hstat-power']         = st.header_stat_power;
    if (st.header_stat_offline)          cardInlineStyles['--sc-hstat-offline']       = st.header_stat_offline;
    if (this._config.header_show_orbs === false) cardInlineStyles['--sc-header-orb-opacity'] = '0';
    const headerTransparency = this._config.header_opacity ?? 100;
    if (headerTransparency < 100) cardInlineStyles['--sc-header-opacity'] = String(headerTransparency / 100);

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
      <ha-card style=${styleMap(cardInlineStyles)} @click=${() => { if (this._cloudDetailOpen) this._cloudDetailOpen = null; }}>
        ${this._renderGraphDialog()}
        <div class="dash-header">
          <div class="dash-header-bg"></div>
          ${this._config.header_show_title !== false ? html`
            <span class="dash-title">${this._config.title ?? 'Shelly'}</span>` : nothing}
          ${this._config.header_show_stats !== false ? html`
            <div class="dash-stats">
              <span class="stat online">${online}/${devices.length} online</span>
              ${offline > 0 ? html`<span class="stat offline-count">${offline} offline</span>` : nothing}
              <span class="stat power">${formatPower(totalPower)}</span>
              ${alertDevices.length > 0 ? html`<span class="stat alerts-count">⚠ ${alertDevices.length}</span>` : nothing}
            </div>` : nothing}
          ${this._config.header_show_cloud !== false ? html`
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
        <div class="dash-body">
          ${[...grouped.entries()].map(([area, areaDevices]) =>
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
      --sc-offline-dot:     #ef4444;
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
      --sc-tile-bg-opacity:      1;
      --sc-header-opacity:       1;
      --sc-header-orb-opacity:   0.5;
      --sc-header-radius:        0px;
      --sc-header-padding:       16px;
      --sc-header-title-size:    1.1em;
      --sc-header-icon:          '⚡';
      --sc-header-border-width:  0px;
      --sc-header-border-color:  transparent;
      --sc-tile-border-width:    1px;
      --sc-tile-shadow:          none;
      --sc-card-radius:          var(--ha-card-border-radius, 12px);
      --sc-area-header-color:    var(--sc-accent);
    }

    ha-card {
      overflow-x: hidden; overflow-y: visible;
      background: var(--sc-card-bg-image) center / var(--sc-card-bg-image-sz) no-repeat, var(--sc-card-bg);
      container-type: inline-size; container-name: ha-dash;
      font-family: var(--sc-font-family);
      border-radius: var(--sc-card-radius);
    }

    .dash-header {
      position: relative; display: flex; align-items: center; gap:10px;
      padding: var(--sc-header-padding, 16px) 18px; overflow: hidden;
      border-radius: var(--sc-header-radius, 0px);
      border-bottom: var(--sc-header-border-width, 0px) solid var(--sc-header-border-color, transparent);
    }
    .dash-header-bg {
      position: absolute; inset: 0; background: var(--sc-header-bg);
      opacity: var(--sc-header-opacity, 1); pointer-events: none; z-index: 0;
    }
    .dash-stats { margin-right: auto; }
    .dash-header::before,.dash-header::after {
      content:''; position:absolute; border-radius:50%; filter:blur(40px);
      opacity: var(--sc-header-orb-opacity, 0.5);
      animation: drift 8s ease-in-out infinite alternate;
    }
    .dash-header::before { width:120px;height:120px; background:var(--sc-accent); top:-40px;left:-20px; }
    .dash-header::after  { width:100px;height:100px; background:var(--sc-header-orb2); bottom:-30px;right:20px; animation-delay:-4s; }
    @keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(15px,8px) scale(1.15)} }

    .dash-title {
      font-size: var(--sc-header-title-size, 1.1em); font-weight:800; color:var(--sc-header-text);
      letter-spacing:0.02em; position:relative; z-index:1;
      display:flex; align-items:center; gap:8px;
    }
    .dash-title::before { content: var(--sc-header-icon, '⚡'); }

    .dash-stats { display:flex; gap:8px; align-items:center; position:relative; z-index:1; flex-shrink:0; }
    .stat { font-size:0.78em; padding:3px 10px; border-radius:20px; font-weight:600; backdrop-filter:blur(4px); }
    .stat.online   { background:var(--sc-online-bg);  color:var(--sc-online-color); border:1px solid var(--sc-online-border); }
    .stat.power    { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-power-color); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); }
    .stat.offline-count { background:rgba(75,85,99,.25); color:#9ca3af; border:1px solid rgba(75,85,99,.35); }
    .stat.alerts-count  { background:rgba(239,68,68,.2); color:#fca5a5; border:1px solid rgba(239,68,68,.3); animation:blink 2s step-end infinite; }
    /* Scoped header stat chip color overrides */
    .dash-header .stat.online       { color:var(--sc-hstat-online, var(--sc-online-color)); background:color-mix(in srgb,var(--sc-hstat-online, var(--sc-online-color)) 18%,transparent); border-color:color-mix(in srgb,var(--sc-hstat-online, var(--sc-online-color)) 30%,transparent); }
    .dash-header .stat.power        { color:var(--sc-hstat-power, var(--sc-power-color)); }
    .dash-header .stat.offline-count { color:var(--sc-hstat-offline, #9ca3af); }

    /* ── Cloud status chips ── */
    .cloud-chips { display:flex; gap:5px; align-items:center; position:relative; z-index:1; flex-shrink:0; }
    .cloud-chip { font-size:0.72em; font-weight:700; padding:3px 10px; border-radius:20px; backdrop-filter:blur(4px); cursor:pointer; transition:all .15s; white-space:nowrap; }
    .cloud-chip:hover { opacity:.8; }
    .cloud-chip.cloud-on    { background:rgba(74,222,128,.18); color:#4ade80; border:1px solid rgba(74,222,128,.3); }
    .cloud-chip.cloud-off   { background:rgba(239,68,68,.18);  color:#f87171; border:1px solid rgba(239,68,68,.3); }
    .cloud-chip.cloud-unavail { background:rgba(107,114,128,.2); color:#9ca3af; border:1px solid rgba(107,114,128,.3); }
    .cloud-chip.active { filter:brightness(1.3); box-shadow:0 0 8px currentColor; }

    /* ── Cloud detail panel ── */
    .cloud-detail { padding:12px 18px 14px; background:rgba(0,0,0,.3); border-bottom:1px solid rgba(255,255,255,.06); animation:slide-in .15s ease; }
    .cloud-detail-hdr { font-size:.7em; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,.08); }
    .cloud-detail-hdr.cloud-on    { color:#4ade80; }
    .cloud-detail-hdr.cloud-off   { color:#f87171; }
    .cloud-detail-hdr.cloud-unavail { color:#9ca3af; }
    .cloud-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:4px 16px; }
    .cloud-item { font-size:.82em; color:var(--sc-text-secondary); padding:3px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

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
    .area-name { font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700); text-transform:var(--sc-text-transform,uppercase); letter-spacing:0.08em; color:var(--area-header-color,var(--sc-area-header-color,var(--sc-accent))); }
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
      border: var(--sc-tile-border-width, 1px) solid var(--sc-tile-border);
      border-radius:var(--tile-radius); padding:11px 13px; cursor:pointer;
      transition:transform 0.15s, box-shadow 0.15s;
      display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden;
      isolation:isolate; box-shadow: var(--sc-tile-shadow, none);
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

    /* ── Tile icons ── */
    .tile-icon { width:18px; height:18px; flex-shrink:0; color:var(--sc-text-muted); transition:color .3s, filter .3s; }

    /* Relay / plug — lightning bolt */
    .tile-icon-relay.on { color:var(--sc-accent); animation:icon-pulse 2s ease-in-out infinite; }
    @keyframes icon-pulse { 0%,100%{filter:drop-shadow(0 0 3px var(--ipglow,var(--sc-accent-glow)))} 50%{filter:drop-shadow(0 0 8px var(--ipglow,var(--sc-accent-glow)))} }

    /* Fan — spinning blades */
    .tile-icon-fan .fan-blades { transform-origin:10px 10px; }
    .tile-icon-fan.on { color:var(--sc-accent); }
    .tile-icon-fan.on .fan-blades { animation:fan-spin 1s linear infinite; }
    @keyframes fan-spin { to{transform:rotate(360deg)} }

    /* Sun — rotate + glow */
    .tile-icon-sun { transform-origin:10px 10px; }
    .tile-icon-sun.on { color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.6)); animation:sun-spin 8s linear infinite; }
    @keyframes sun-spin { to{transform:rotate(360deg)} }

    /* Cover — slat movement */
    .tile-icon-cover.moving { animation:cover-bounce 1s ease-in-out infinite; }
    @keyframes cover-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }

    /* Flame — flicker */
    .tile-icon-flame.on { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.6)); }
    .tile-icon-flame.on .flame-main { animation:flicker 1.5s ease-in-out infinite alternate; transform-origin:10px 18px; }
    .tile-icon-flame.on .flame-inner { animation:flicker 1.5s ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }
    @keyframes flicker { 0%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(.95) scaleY(1.04)} 66%{transform:scaleX(1.04) scaleY(.97)} 100%{transform:scaleX(.97) scaleY(1.03)} }

    /* Valve — drip pulse */
    .tile-icon-valve.on { color:#38bdf8; filter:drop-shadow(0 0 4px rgba(56,189,248,0.5)); }
    .tile-icon-valve.on .drop-body { animation:drip 2s ease-in-out infinite; transform-origin:10px 10px; }
    @keyframes drip { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06) translateY(1px)} }

    /* Energy — wave scroll */
    .tile-icon-energy { color:var(--sc-accent); }
    .tile-icon-energy .energy-wave { stroke-dasharray:40; animation:wave-scroll 2s linear infinite; }
    @keyframes wave-scroll { to{stroke-dashoffset:-40} }

    /* Input — ripple */
    .tile-icon-input.on { color:var(--sc-accent); }
    .tile-icon-input.on .input-ripple { animation:input-ripple .8s ease-out forwards; }
    @keyframes input-ripple { 0%{r:0;opacity:.8} 100%{r:6;opacity:0} }

    /* ── Entity-level state animation icons ─────────────────────────────── */
    .ent-icon { width:15px; height:15px; flex-shrink:0; transition:color .3s,filter .3s; }
    .ent-icon-flame.off { color:#4b5563; }
    .ent-icon-flame.on  { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.55)); }
    .ent-icon-flame.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
    .ent-icon-flame.on .flame-inner { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }
    .ent-icon-snowflake { color:#7dd3fc; }
    .ent-icon-snowflake .snow-arms { animation:snow-spin calc(6s / var(--ent-spd,1)) linear infinite; }
    @keyframes snow-spin { to { transform:rotate(360deg); } }
    .ent-icon-fan.off { color:#4b5563; }
    .ent-icon-fan.on  { color:var(--sc-accent); }
    .ent-icon-fan.on .fan-blades { animation:fan-spin calc(1s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-pulse.off { color:#4b5563; }
    .ent-icon-pulse.on  { color:var(--sc-accent); }
    .ent-icon-pulse.on .pulse-ring { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
    .ent-icon-wave { color:var(--sc-accent); }
    .ent-icon-wave .energy-wave { stroke-dasharray:40; animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-sun.off { color:#4b5563; }
    .ent-icon-sun.on  { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.55)); }
    .ent-icon-sun.on .sun-group { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-lightning.off { color:#4b5563; }
    .ent-icon-lightning.on  { --ipglow:rgba(251,191,36,0.55); color:#fbbf24; animation:icon-pulse calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-heart.off { color:#4b5563; }
    .ent-icon-heart.on  { color:#f43f5e; filter:drop-shadow(0 0 5px rgba(244,63,94,0.55)); }
    .ent-icon-heart.on .heart-shape { animation:heartbeat calc(1s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
    @keyframes heartbeat { 0%,100%{transform:scale(1)} 20%{transform:scale(1.22)} 40%{transform:scale(1)} 60%{transform:scale(1.15)} }
    .ent-icon-bulb.off { color:#6b7280; }
    .ent-icon-bulb.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }
    .ent-icon-bulb.off .bulb-base1,.ent-icon-bulb.off .bulb-base2 { opacity:0.3; }
    .ent-icon-bulb.on  { --ipglow:rgba(253,224,71,0.65); color:#fde047; animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-leaf.off { color:#4b5563; }
    .ent-icon-leaf.on  { color:#4ade80; filter:drop-shadow(0 0 5px rgba(74,222,128,0.5)); }
    .ent-icon-leaf.on .leaf-body { animation:leaf-sway calc(3s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 17px; }
    @keyframes leaf-sway { 0%,100%{transform:rotate(0deg)} 33%{transform:rotate(6deg)} 66%{transform:rotate(-6deg)} }
    .ent-icon-moon.off { color:#4b5563; }
    .ent-icon-moon.on  { --ipglow:rgba(196,181,253,0.55); color:#c4b5fd; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-water.off { color:#4b5563; }
    .ent-icon-water.on  { color:#38bdf8; filter:drop-shadow(0 0 5px rgba(56,189,248,0.5)); }
    .ent-icon-water.on .drop-body { animation:drip calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
    .ent-icon-lock.off { color:#4b5563; }
    .ent-icon-lock.on  { --ipglow:rgba(167,139,250,0.55); color:#a78bfa; animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    /* ── Flame variants ── */
    .ent-icon-flame2.off,.ent-icon-flame3.off { color:#4b5563; }
    .ent-icon-flame2.on  { color:#f97316; filter:drop-shadow(0 0 6px rgba(249,115,22,0.55)); }
    .ent-icon-flame2.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
    .ent-icon-flame2.on .flame-b { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; animation-delay:calc(-0.4s / var(--ent-spd,1)); }
    .ent-icon-flame3.on  { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.5)); }
    .ent-icon-flame3.on .flame-main { animation:flicker calc(1.2s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 15px; }
    /* ── Snowflake variants ── */
    .ent-icon-snowflake2 { color:#7dd3fc; }
    .ent-icon-snowflake2 .snow-arms { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-snowflake3 { color:#7dd3fc; }
    .ent-icon-snowflake3 .snow-drift-g { animation:snow-drift calc(4s / var(--ent-spd,1)) ease-in-out infinite; }
    @keyframes snow-drift { 0%{transform:translateY(-3px) rotate(0deg)} 50%{transform:translateY(3px) rotate(180deg)} 100%{transform:translateY(-3px) rotate(360deg)} }
    /* ── Fan variants ── */
    .ent-icon-fan2.off,.ent-icon-fan3.off { color:#4b5563; }
    .ent-icon-fan2.on  { color:var(--sc-accent); }
    .ent-icon-fan2.on .fan-blades { animation:fan-spin calc(0.8s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-fan3.on  { color:var(--sc-accent); }
    .ent-icon-fan3.on .fan-blades { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }
    /* ── Lightning variants ── */
    .ent-icon-lightning2.off,.ent-icon-lightning3.off { color:#4b5563; }
    .ent-icon-lightning2.on { --ipglow:rgba(251,191,36,0.6); color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.5)); }
    .ent-icon-lightning2.on .bolt-a { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-lightning2.on .bolt-b { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }
    @keyframes bolt-flash { 0%,100%{opacity:1} 50%{opacity:0.2} }
    .ent-icon-lightning3.off .arc-path { opacity:0.2; }
    .ent-icon-lightning3.on  { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.6)); }
    .ent-icon-lightning3.on .arc-path { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
    @keyframes arc-flash { 0%,100%{opacity:0.15} 50%{opacity:1} }
    /* ── Bulb variants ── */
    .ent-icon-bulb2.off { color:#6b7280; }
    .ent-icon-bulb2.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }
    .ent-icon-bulb2.off .bulb-filament { display:none; }
    .ent-icon-bulb2.off .bulb-base1,.ent-icon-bulb2.off .bulb-base2 { opacity:0.3; }
    .ent-icon-bulb2.on { --ipglow:rgba(251,191,36,0.7); color:#fbbf24; animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-bulb3.off { color:#6b7280; }
    .ent-icon-bulb3.off .bulb-chip { fill:none; stroke:currentColor; stroke-width:1; opacity:0.5; }
    .ent-icon-bulb3.on { --ipglow:rgba(224,242,254,0.7); color:#e0f2fe; animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    /* ── Water variants ── */
    .ent-icon-water2 { color:#38bdf8; }
    .ent-icon-water2 .wave-a { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-water2 .wave-b { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-water3.off { color:#4b5563; }
    .ent-icon-water3.on  { --ipglow:rgba(56,189,248,0.5); color:#38bdf8; }
    .ent-icon-water3.on .ripple1 { animation:ripple-out calc(2s / var(--ent-spd,1)) ease-out infinite; }
    .ent-icon-water3.on .ripple2 { animation:ripple-out calc(2s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }
    @keyframes ripple-out { 0%{r:2;opacity:0.8} 100%{r:9;opacity:0} }
    /* ── Sun variants ── */
    .ent-icon-sun2.off,.ent-icon-sun3.off { color:#4b5563; }
    .ent-icon-sun2.on { --ipglow:rgba(251,191,36,0.5); color:#fbbf24; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-sun3.on { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.55)); }
    .ent-icon-sun3.on .sun-group { animation:snow-spin calc(4s / var(--ent-spd,1)) linear infinite; }
    /* ── Moon variants ── */
    .ent-icon-moon2.off,.ent-icon-moon3.off { color:#4b5563; }
    .ent-icon-moon2.on { --ipglow:rgba(241,245,249,0.6); color:#f1f5f9; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-moon3.on { color:#c4b5fd; filter:drop-shadow(0 0 6px rgba(196,181,253,0.55)); }
    .ent-icon-moon3.on .star1 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-moon3.on .star2 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }
    .ent-icon-moon3.on .star3 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.4s / var(--ent-spd,1)); }
    @keyframes twinkle { 0%,100%{opacity:1} 50%{opacity:0.15} }
    @keyframes wind-blow { 0%{transform:translateX(0);opacity:0.3} 50%{opacity:1} 100%{transform:translateX(4px);opacity:0.3} }
    @keyframes bell-ring { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-10deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-7deg)} 80%{transform:rotate(7deg)} }
    @keyframes therm-pulse { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.65)} }
    @keyframes star-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
    @keyframes star-shoot { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(6px,-6px);opacity:0.15} }
    @keyframes ekg-scan { to{stroke-dashoffset:-50} }
    @keyframes bar-bounce { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }

    /* ── Wind ──────────────────────────────────────────────────── */
    .ent-icon-wind.off,.ent-icon-wind2.off,.ent-icon-wind3.off { color:#4b5563; }
    .ent-icon-wind.on  { color:#a5f3fc; filter:drop-shadow(0 0 5px rgba(165,243,252,0.45)); }
    .ent-icon-wind.on .wind-line-a { animation:wave-scroll calc(1.4s / var(--ent-spd,1)) linear infinite; stroke-dasharray:24; }
    .ent-icon-wind.on .wind-line-b { animation:wave-scroll calc(1.6s / var(--ent-spd,1)) linear infinite; stroke-dasharray:20; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
    .ent-icon-wind.on .wind-line-c { animation:wave-scroll calc(1.9s / var(--ent-spd,1)) linear infinite; stroke-dasharray:16; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-wind2.on { color:#a5f3fc; filter:drop-shadow(0 0 4px rgba(165,243,252,0.4)); }
    .ent-icon-wind2.on .gust-a { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-wind2.on .gust-b { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.33s / var(--ent-spd,1)); }
    .ent-icon-wind2.on .gust-c { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.66s / var(--ent-spd,1)); }
    .ent-icon-wind3.on { color:#a5f3fc; --ipglow:rgba(165,243,252,0.5); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    /* ── Bell ──────────────────────────────────────────────────── */
    .ent-icon-bell.off,.ent-icon-bell2.off,.ent-icon-bell3.off { color:#4b5563; }
    .ent-icon-bell.on  { color:#fde68a; --ipglow:rgba(253,230,138,0.55); filter:drop-shadow(0 0 5px rgba(253,230,138,0.4)); animation:bell-ring calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 2.5px; }
    .ent-icon-bell2.on { color:#fde68a; --ipglow:rgba(253,230,138,0.55); filter:drop-shadow(0 0 4px rgba(253,230,138,0.35)); }
    .ent-icon-bell2.on .ring-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-bell2.on .ring-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
    .ent-icon-bell2.on .ring-c { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-bell3.on { color:#fca5a5; --ipglow:rgba(252,165,165,0.55); animation:icon-pulse calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

    /* ── Thermometer ────────────────────────────────────────────── */
    .ent-icon-thermometer.off,.ent-icon-thermometer2.off,.ent-icon-thermometer3.off { color:#4b5563; }
    .ent-icon-thermometer.on  { color:#fb923c; filter:drop-shadow(0 0 5px rgba(251,146,60,0.5)); }
    .ent-icon-thermometer.on .therm-mercury { animation:therm-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 13px; }
    .ent-icon-thermometer2.on { color:#f87171; filter:drop-shadow(0 0 5px rgba(248,113,113,0.5)); }
    .ent-icon-thermometer2.on .therm-arrow { animation:cover-bounce calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-thermometer3.on { color:#fb923c; filter:drop-shadow(0 0 4px rgba(251,146,60,0.45)); }
    .ent-icon-thermometer3.on .therm-up   { animation:cover-bounce calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-thermometer3.on .therm-down { animation:cover-bounce calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }

    /* ── Battery ────────────────────────────────────────────────── */
    .ent-icon-battery.off,.ent-icon-battery2.off { color:#4b5563; }
    .ent-icon-battery.on  { color:#4ade80; --ipglow:rgba(74,222,128,0.5); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-battery2.on { color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.5)); }
    .ent-icon-battery2.on .charge-bolt { animation:bolt-flash calc(0.9s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-battery3      { color:#f87171; }
    .ent-icon-battery3.off  { color:#6b7280; }
    .ent-icon-battery3.on   { color:#f87171; filter:drop-shadow(0 0 4px rgba(248,113,113,0.5)); animation:blink calc(1.2s / var(--ent-spd,1)) step-end infinite; }

    /* ── Star ───────────────────────────────────────────────────── */
    .ent-icon-star.off,.ent-icon-star2.off,.ent-icon-star3.off { color:#4b5563; }
    .ent-icon-star.on  { color:#fde047; --ipglow:rgba(253,224,71,0.55); filter:drop-shadow(0 0 6px rgba(253,224,71,0.45)); animation:star-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
    .ent-icon-star2.on { color:#fde047; filter:drop-shadow(0 0 5px rgba(253,224,71,0.4)); }
    .ent-icon-star2.on .star-body { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; transform-origin:10px 10px; }
    .ent-icon-star3.on { color:#fde047; filter:drop-shadow(0 0 4px rgba(253,224,71,0.4)); animation:star-shoot calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; }

    /* ── Pulse variants ─────────────────────────────────────────── */
    .ent-icon-pulse2.off,.ent-icon-pulse3.off { color:#4b5563; }
    .ent-icon-pulse2.on { color:var(--sc-accent); }
    .ent-icon-pulse2.on .pulse-ring  { animation:ripple-out calc(1.2s / var(--ent-spd,1)) ease-out infinite; }
    .ent-icon-pulse2.on .pulse-ring2 { animation:ripple-out calc(1.2s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-pulse3.on { color:#f43f5e; filter:drop-shadow(0 0 4px rgba(244,63,94,0.45)); }
    .ent-icon-pulse3.on .ekg-line { animation:ekg-scan calc(1.5s / var(--ent-spd,1)) linear infinite; stroke-dasharray:50; stroke-dashoffset:0; }

    /* ── Wave variants ──────────────────────────────────────────── */
    .ent-icon-wave2.off,.ent-icon-wave3.off,.ent-icon-wave4.off { color:#4b5563; }
    .ent-icon-wave2.on { color:#5eead4; filter:drop-shadow(0 0 4px rgba(94,234,212,0.4)); }
    .ent-icon-wave2.on .bar-odd  { animation:bar-bounce calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:50% 100%; }
    .ent-icon-wave2.on .bar-even { animation:bar-bounce calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:50% 100%; }
    .ent-icon-wave3.on { color:#7dd3fc; filter:drop-shadow(0 0 4px rgba(125,211,252,0.4)); }
    .ent-icon-wave3.on .arc-a { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-wave3.on .arc-b { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-wave3.on .arc-c { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }
    .ent-icon-wave4.on { color:#93c5fd; filter:drop-shadow(0 0 4px rgba(147,197,253,0.4)); }
    .ent-icon-wave4.on .wifi-a { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-wave4.on .wifi-b { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.45s / var(--ent-spd,1)); }
    .ent-icon-wave4.on .wifi-c { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s / var(--ent-spd,1)); }

    /* ── Heart variant ──────────────────────────────────────────── */
    .ent-icon-heart2.off { color:#4b5563; }
    .ent-icon-heart2.on  { color:#f43f5e; filter:drop-shadow(0 0 5px rgba(244,63,94,0.5)); }
    .ent-icon-heart2.on .heart-shape { animation:heartbeat calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    /* ── Leaf variant ───────────────────────────────────────────── */
    .ent-icon-leaf2.off { color:#4b5563; }
    .ent-icon-leaf2.on  { color:#4ade80; filter:drop-shadow(0 0 5px rgba(74,222,128,0.45)); animation:leaf-sway calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 18px; }

    /* ── Lock variant ───────────────────────────────────────────── */
    .ent-icon-lock2.off { color:#4b5563; }
    .ent-icon-lock2.on  { color:#7ecfff; --ipglow:rgba(126,207,255,0.55); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

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
    .trv-dial-svg { width:100%; max-width:360px; height:auto; overflow:visible; }
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

    .valve-interactive { cursor:pointer; touch-action:none; }
    .valve-dial-btns { display:flex; align-items:center; gap:8px; margin-top:10px; }
    .valve-btn { padding:4px 14px; border-radius:8px; border:1px solid var(--sc-tog-off-border); background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:12px; font-weight:600; cursor:pointer; transition:background .15s; }
    .valve-btn:hover { background:rgba(255,255,255,.15); }
    .valve-btn.open:hover { background:#0ea5e9; border-color:#0ea5e9; color:#fff; }
    .valve-btn.close:hover { background:#6b7280; border-color:#6b7280; color:#fff; }
    .valve-btn.stop { color:var(--sc-text-muted); font-size:10px; }
    .valve-slider-row { display:flex; align-items:center; gap:6px; width:100%; padding:4px 8px 0; box-sizing:border-box; }

    .tile-inputs { display:flex; flex-direction:column; gap:5px; padding:4px 0 2px; }
    .input-row { display:flex; align-items:center; gap:8px; padding:5px 8px; border-radius:8px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.04); transition:all .15s; }
    .input-row.active { background:color-mix(in srgb,var(--sc-accent) 15%,transparent); border-color:color-mix(in srgb,var(--sc-accent) 35%,transparent); }
    .input-row-dot { width:8px; height:8px; border-radius:50%; background:var(--sc-text-muted); flex-shrink:0; transition:background .15s; }
    .input-row.active .input-row-dot { background:var(--sc-accent); }
    .input-btn-dot { width:8px; height:8px; border-radius:2px; background:rgba(129,140,248,0.5); flex-shrink:0; }
    .input-row.btn-mode { border-color:rgba(129,140,248,0.18); }
    .input-row-name { font-size:13px; font-weight:600; color:var(--sc-text-primary); min-width:60px; }
    .input-row-event { flex:1; font-size:12px; color:var(--sc-text-secondary); text-transform:capitalize; }
    .input-row-time { font-size:11px; color:var(--sc-text-muted); white-space:nowrap; }
    .input-chip { display:flex; align-items:center; gap:4px; padding:4px 10px 4px 8px; border-radius:14px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.05); font-size:12px; color:var(--sc-text-muted); transition:all .15s; }
    .input-chip.active { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); border-color:color-mix(in srgb,var(--sc-accent) 40%,transparent); }
    .input-dot { width:7px;height:7px; border-radius:50%; background:currentColor; flex-shrink:0; }
    .input-lbl { font-weight:600; }

    /* ── Virtual controls ── */
    .tile-virtuals { display:flex; flex-direction:column; gap:4px; padding:4px 0 2px; }
    .virt-row { display:flex; align-items:center; gap:8px; padding:4px 8px; border-radius:7px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.03); }
    .virt-lbl { font-size:11px; color:var(--sc-text-muted); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .virt-val { font-size:12px; color:var(--sc-text-primary); font-weight:500; max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-transform:capitalize; }
    .virt-select, .virt-num { display:flex; align-items:center; gap:3px; }
    .virt-arr { background:none; border:none; color:var(--sc-text-secondary); cursor:pointer; font-size:15px; padding:0 3px; line-height:1; border-radius:4px; transition:color .12s; }
    .virt-arr:hover { color:var(--sc-accent); }
    .virt-btn { background:color-mix(in srgb,var(--sc-accent) 12%,transparent); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); color:var(--sc-accent); font-size:11px; font-weight:600; padding:3px 10px; border-radius:6px; cursor:pointer; transition:all .15s; width:100%; text-align:left; }
    .virt-btn:hover { background:color-mix(in srgb,var(--sc-accent) 22%,transparent); }

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

    /* ── RGBW white + effects ── */
    .tile-white-row { margin-top:2px; }
    .dim-white-lbl { font-size:.6em; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); width:14px; flex-shrink:0; text-align:center; }
    .white-slider { accent-color:#e5e7eb; }
    .tile-effects { display:flex; flex-wrap:wrap; gap:4px; padding:4px 8px 2px; }
    .effect-btn { padding:2px 9px; border-radius:12px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:var(--sc-text-secondary); font-size:10px; cursor:pointer; transition:all .15s; white-space:nowrap; }
    .effect-btn:hover { background:rgba(255,255,255,.1); color:var(--sc-text-primary); }
    .effect-btn.active { background:color-mix(in srgb,var(--sc-accent) 25%,transparent); border-color:color-mix(in srgb,var(--sc-accent) 50%,transparent); color:var(--sc-accent); }

    /* ── Graph dialog ── */
    .graph-dialog-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.65); backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center; }
    .graph-dialog { background:var(--sc-card-bg); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:20px; width:min(720px,92vw); max-height:85vh; overflow-y:auto; }
    .graph-dialog-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; font-size:15px; font-weight:600; color:var(--sc-text-primary); }
    .graph-dialog-close { background:none; border:none; color:var(--sc-text-muted); font-size:18px; cursor:pointer; padding:4px 8px; border-radius:6px; transition:all .15s; }
    .graph-dialog-close:hover { color:var(--sc-text-primary); background:rgba(255,255,255,.08); }
    .spark-row-clickable { cursor:pointer; border-radius:6px; transition:background .15s; }
    .spark-row-clickable:hover { background:rgba(255,255,255,.05); }
    .graph-dialog .sparklines-block { padding:0; }
    .graph-dialog .spark-lbl { width:90px; font-size:.7em; }
    .graph-dialog .sparkline-svg { height:120px !important; }
    .graph-dialog .sparkline-loading { height:120px !important; }
    .graph-dialog .spark-group { margin-bottom:12px; }

    /* ── Relay channels ── */
    .relay-channels { display:flex; flex-direction:column; gap:4px; padding:2px 8px 4px; }
    .relay-ch-row { display:flex; align-items:center; gap:8px; padding:3px 0; }
    .relay-ch-dot { width:7px; height:7px; border-radius:50%; background:var(--sc-offline-dot); flex-shrink:0; transition:background .15s; }
    .relay-ch-dot.on { background:var(--sc-online-color); }
    .relay-ch-name { flex:1; font-size:12px; color:var(--sc-text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-device-dashboard': HADeviceDashboard;
  }
}
