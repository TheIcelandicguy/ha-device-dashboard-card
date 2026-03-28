import { LitElement, html, css, PropertyValues, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ShellyDashboardConfig, ShellyHADevice, ShellyHAEntity, ShellyDeviceProfile } from './types';
import {
  getShellyEntities,
  groupShellyByDevice,
  getAllDevices,
  getDeviceProfile,
  formatPower,
  formatEnergy,
  formatVoltage,
  formatCurrent,
  formatTemp,
  rssiToQuality,
  formatUptime,
  formatApparentPower,
  formatReactivePower,
  formatFrequency,
  formatHumidity,
  formatIlluminance,
  formatPpm,
  formatPercent,
} from './helpers';

// ─── Shelly Dashboard Card ──────────────────────────────────────────────────────
// Fleet overview of all Shelly devices, grouped by area, entity-first.

@customElement('shelly-dashboard-card')
export class ShellyDashboardCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: ShellyDashboardConfig;
  @state() private _expandedDevice: string | null = null;
  @state() private _closedAreas = new Set<string>();
  @state() private _entityListOpen = new Set<string>();
  @state() private _searchTerm = '';
  @state() private _bulkMode = false;
  @state() private _selectedDevices = new Set<string>();
  @state() private _sortBy: 'name' | 'power' | 'online' = 'name';
  @state() private _viewMode: 'grid' | 'list' = 'grid';
  @state() private _glowEnabled = true;
  // Graph history: entity_id → array of {t: epoch-ms, v: numeric-value}
  @state() private _graphData = new Map<string, Array<{ t: number; v: number }>>();
  private readonly _graphFetching = new Set<string>();
  private readonly _graphFetchedAt = new Map<string, number>();

  /** HA brightness attribute is 0-255; card UI uses 0-100 % */
  private static readonly BRIGHTNESS_MAX = 255;

  static getConfigElement() {
    return document.createElement('shelly-card-editor');
  }

  static getStubConfig(): ShellyDashboardConfig {
    return { type: 'custom:shelly-dashboard-card' };
  }

  setConfig(config: ShellyDashboardConfig) {
    this._config = config;
    this._sortBy = config.sort_by ?? 'name';
    this._viewMode = config.view_mode ?? 'grid';
    this._glowEnabled = config.show_glow ?? true;
  }

  getCardSize() {
    return 6;
  }

  // Sections dashboard: default span + minimum span
  static getLayoutOptions() {
    return {
      grid_columns: 4,
      grid_rows: 6,
      grid_min_columns: 2,
      grid_min_rows: 3,
    };
  }

  // ─── Data helpers ───────────────────────────────────────────────────────────

  private _getDevices(): ShellyHADevice[] {
    if (!this.hass) return [];
    let devices = this._config.include_all
      ? getAllDevices(this.hass)
      : groupShellyByDevice(this.hass, getShellyEntities(this.hass));
    const areaFilter = this._config.areas;
    if (areaFilter && areaFilter.length > 0) {
      const normalized = new Set(areaFilter.map((a) => a.toLowerCase()));
      devices = devices.filter((d) => normalized.has((d.area ?? '').toLowerCase()));
    }
    if (this._config.show_offline === false) {
      devices = devices.filter((d) => this._isOnline(d));
    }
    if (this._config.hide_shelly === true) {
      devices = devices.filter((d) => !d.isShelly);
    }
    const hiddenDevices = this._config.hidden_devices;
    if (hiddenDevices && hiddenDevices.length > 0) {
      const hiddenSet = new Set(hiddenDevices);
      devices = devices.filter((d) => !hiddenSet.has(d.device_id));
    }
    return devices;
  }

  private _groupByArea(devices: ShellyHADevice[]): Map<string, ShellyHADevice[]> {
    const map = new Map<string, ShellyHADevice[]>();
    for (const d of devices) {
      const key = d.area ?? '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    // Sort: named areas alphabetically, empty area last
    return new Map(
      [...map.entries()]
        .sort(([a], [b]) => {
          if (!a) return 1;
          if (!b) return -1;
          return a.localeCompare(b);
        })
        .map(([area, devs]) => {
          const s = this._sortBy;
          return [area, devs.sort(
            s === 'power'
              ? (a, b) => (this._getPower(b) ?? -1) - (this._getPower(a) ?? -1)
              : s === 'online'
              ? (a, b) => ((this._isOnline(b) ? 1 : 0) - (this._isOnline(a) ? 1 : 0)) || a.name.localeCompare(b.name)
              : (a, b) => a.name.localeCompare(b.name)
          )];
        })
    );
  }

  private _isOnline(device: ShellyHADevice): boolean {
    return device.entities.some((e) => {
      const s = this.hass.states[e.entity_id];
      return s && s.state !== 'unavailable' && s.state !== 'unknown';
    });
  }

  /** Summed power across all power-reporting entities on this device */
  private _getPower(device: ShellyHADevice): number | null {
    let total = 0;
    let found = false;
    for (const e of device.entities) {
      const s = this.hass.states[e.entity_id];
      if (!s) continue;
      const attrs = s.attributes as Record<string, any>;
      // From switch/plug attributes
      if (attrs.current_power_w != null) {
        const p = Number(attrs.current_power_w);
        if (!isNaN(p)) { total += p; found = true; }
        continue;
      }
      // From dedicated power sensor
      if (e.domain === 'sensor' && attrs.device_class === 'power') {
        const v = parseFloat(s.state);
        if (!isNaN(v)) { total += v; found = true; }
      }
    }
    return found ? total : null;
  }

  /** First switch/light entity for the device.
   *  brightness (0-100) and color info are defined for light entities. */
  private _getPrimarySwitch(device: ShellyHADevice): {
    entityId: string; isOn: boolean; brightness?: number;
    colorModes?: string[]; rgbColor?: [number, number, number]; whiteValue?: number;
  } | null {
    for (const e of device.entities) {
      if (e.domain === 'switch' || e.domain === 'light') {
        const s = this.hass.states[e.entity_id];
        if (!s) continue;
        const attrs = s.attributes as any;
        const brightness = e.domain === 'light'
          ? (s.state === 'on' && attrs?.brightness != null
              ? Math.round((attrs.brightness / ShellyDashboardCard.BRIGHTNESS_MAX) * 100)
              : 0)
          : undefined;
        let colorModes: string[] | undefined;
        let rgbColor: [number, number, number] | undefined;
        let whiteValue: number | undefined;
        if (e.domain === 'light') {
          const modes: string[] = attrs?.supported_color_modes ?? [];
          if (modes.some((m) => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(m))) {
            colorModes = modes;
          }
          if (attrs?.rgbw_color) {
            const [r, g, b, w] = attrs.rgbw_color as number[];
            rgbColor = [r, g, b];
            whiteValue = w;
          } else if (attrs?.rgb_color) {
            rgbColor = attrs.rgb_color as [number, number, number];
          }
        }
        return { entityId: e.entity_id, isOn: s.state === 'on', brightness, colorModes, rgbColor, whiteValue };
      }
    }
    return null;
  }

  /** All switch/light entities for a device.
   *  brightness (0-100) and color info are defined for light entities. */
  private _getSwitches(device: ShellyHADevice): Array<{
    entityId: string; name: string; isOn: boolean; brightness?: number;
    colorModes?: string[]; rgbColor?: [number, number, number]; whiteValue?: number;
  }> {
    return device.entities
      .filter((e) => e.domain === 'switch' || e.domain === 'light')
      .map((e) => {
        const s = this.hass.states[e.entity_id];
        const attrs = s?.attributes as any;
        let brightness: number | undefined;
        let colorModes: string[] | undefined;
        let rgbColor: [number, number, number] | undefined;
        let whiteValue: number | undefined;

        if (e.domain === 'light') {
          brightness = s?.state === 'on' && attrs?.brightness != null
            ? Math.round((attrs.brightness / ShellyDashboardCard.BRIGHTNESS_MAX) * 100)
            : 0;
          const modes: string[] = attrs?.supported_color_modes ?? [];
          if (modes.some((m) => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(m))) {
            colorModes = modes;
          }
          if (attrs?.rgbw_color) {
            const [r, g, b, w] = attrs.rgbw_color as number[];
            rgbColor = [r, g, b];
            whiteValue = w;
          } else if (attrs?.rgb_color) {
            rgbColor = attrs.rgb_color as [number, number, number];
          }
        }
        return {
          entityId: e.entity_id,
          name: attrs?.friendly_name ?? e.entity_id.split('.')[1],
          isOn: s?.state === 'on',
          brightness,
          colorModes,
          rgbColor,
          whiteValue,
        };
      });
  }

  private _getTrv(device: ShellyHADevice): {
    entityId: string;
    currentTemp?: number;
    targetTemp?: number;
    minTemp: number;
    maxTemp: number;
    step: number;
    hvacMode: string;
    hvacAction: string;
    presetMode?: string;
    presetModes: string[];
    valvePosition?: number;
  } | null {
    const climateEnt = device.entities.find((e) => e.domain === 'climate');
    if (!climateEnt) return null;
    const s = this.hass.states[climateEnt.entity_id];
    if (!s) return null;
    const attrs = s.attributes as any;

    // Valve position: from climate attrs or a dedicated sensor entity
    let valvePosition: number | undefined =
      attrs?.current_valve_position ?? attrs?.valve_position;
    if (valvePosition == null) {
      const valveEnt = device.entities.find(
        (e) => e.domain === 'sensor' &&
          (e.entity_id.includes('valve') || e.entity_id.includes('position'))
      );
      if (valveEnt) {
        const v = parseFloat(this.hass.states[valveEnt.entity_id]?.state ?? '');
        if (!isNaN(v)) valvePosition = v;
      }
    }

    return {
      entityId: climateEnt.entity_id,
      currentTemp: attrs?.current_temperature,
      targetTemp: attrs?.temperature,
      minTemp: attrs?.min_temp ?? 4,
      maxTemp: attrs?.max_temp ?? 30,
      step: attrs?.target_temp_step ?? 0.5,
      hvacMode: s.state,           // 'heat' | 'off'
      hvacAction: attrs?.hvac_action ?? s.state,
      presetMode: attrs?.preset_mode,
      presetModes: (attrs?.preset_modes ?? []).filter((p: string) => p !== 'none'),
      valvePosition,
    };
  }

  /** Returns true only for RFC-1918 / link-local addresses (no cloud/public IPs) */
  private _isPrivateIp(ip: string): boolean {
    return (
      /^10\./.test(ip) ||
      /^192\.168\./.test(ip) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
      /^169\.254\./.test(ip)
    );
  }

  private _rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  private _hexToRgb(hex: string): [number, number, number] {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }

  /** All displayable sensor/state attributes for a device — sensors + binary sensors.
   *  Filtered by config.sensors when set; empty/missing means show all. */
  private _getSensors(device: ShellyHADevice): Array<{ label: string; value: string; warn?: boolean }> {
    const allowed = this._config.sensors && this._config.sensors.length > 0
      ? new Set(this._config.sensors)
      : null; // null = show all

    const show = (key: string) => !allowed || allowed.has(key);
    const result: Array<{ label: string; value: string; warn?: boolean }> = [];
    const seen = new Set<string>();
    const push = (key: string, label: string, value: string, warn = false) => {
      if (!seen.has(key)) { seen.add(key); result.push({ label, value, warn }); }
    };

    for (const e of device.entities) {
      const s = this.hass.states[e.entity_id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
      const attrs = s.attributes as Record<string, any>;
      const dc: string = attrs.device_class ?? '';
      const id = e.entity_id;

      if (e.domain === 'sensor') {
        // Text-valued diagnostic sensors — handle before parseFloat
        if (!dc && (id.endsWith('_ip') || id.endsWith('_ip_address')) && show('ip')) {
          push('ip', 'IP Address', s.state); continue;
        }
        if (!dc && id.endsWith('_ssid') && show('ssid')) {
          push('ssid', 'SSID', s.state); continue;
        }
        if (!dc && (id.endsWith('_firmware') || id.endsWith('_fw_version')) && show('fw_version')) {
          push('fw_version', 'Firmware', s.state); continue;
        }
        if (!dc && id.endsWith('_mac') && show('mac')) {
          push('mac', 'MAC', s.state); continue;
        }

        const v = parseFloat(s.state);
        if (isNaN(v)) continue;
        if      (dc === 'power'           && show('power'))          push('power',          'Power',        formatPower(v));
        else if (dc === 'apparent_power'  && show('apparent_power')) push('apparent_power', 'App. Power',   formatApparentPower(v));
        else if (dc === 'reactive_power'  && show('reactive_power')) push('reactive_power', 'React. Power', formatReactivePower(v));
        else if (dc === 'power_factor'    && show('power_factor'))   push('power_factor',   'Pwr Factor',   formatPercent(v));
        else if (dc === 'frequency'       && show('frequency'))      push('frequency',      'Frequency',    formatFrequency(v));
        else if (dc === 'energy'          && show('energy'))         push('energy',         'Energy',       formatEnergy(v));
        else if (dc === 'voltage'         && show('voltage'))        push('voltage',        'Voltage',      formatVoltage(v));
        else if (dc === 'current'         && show('current'))        push('current',        'Current',      formatCurrent(v));
        else if (dc === 'temperature'     && show('temperature'))    push('temperature',    'Temp',         formatTemp(v));
        else if (dc === 'humidity'        && show('humidity'))       push('humidity',       'Humidity',     formatHumidity(v));
        else if (dc === 'illuminance'     && show('illuminance'))    push('illuminance',    'Light',        formatIlluminance(v));
        else if (dc === 'carbon_dioxide'  && show('co2'))            push('co2',            'CO₂',          formatPpm(v));
        else if (dc === 'gas'             && show('gas'))            push('gas',            'Gas',          `${v.toFixed(1)} %`);
        else if (dc === 'battery'         && show('battery'))        push('battery',        'Battery',      formatPercent(v));
        else if ((dc === 'signal_strength' || id.includes('rssi')) && show('rssi'))
          push('rssi', 'Wi-Fi', `${rssiToQuality(v)} (${v} dBm)`);
        else if (id.includes('uptime')    && show('uptime'))         push('uptime',         'Uptime',       formatUptime(v));

      } else if (e.domain === 'binary_sensor') {
        const on = s.state === 'on';
        if      (dc === 'motion'    && show('motion'))    push('motion',    'Motion',    on ? 'Motion'      : 'Clear');
        else if ((dc === 'door' || dc === 'window' || dc === 'opening') && show('door'))
          push('door', 'Door/Win', on ? 'Open' : 'Closed');
        else if (dc === 'moisture'  && show('flood'))     push('flood',     'Flood',     on ? 'Flooded'     : 'Dry',        on);
        else if (dc === 'smoke'     && show('smoke'))     push('smoke',     'Smoke',     on ? 'Smoke!'      : 'Clear',      on);
        else if (dc === 'gas'       && show('gas'))       push('gas',       'Gas',       on ? 'Gas!'        : 'Clear',      on);
        else if (dc === 'vibration' && show('vibration')) push('vibration', 'Vibration', on ? 'Vibrating'   : 'Clear');
        else if ((dc === 'heat' || id.includes('overtemperature')) && show('overtemp'))
          push('overtemp',  'Overtemp',  on ? 'Overtemp!'  : 'OK', on);
        else if ((dc === 'safety' || id.includes('overpower')) && show('overpower'))
          push('overpower', 'Overpower', on ? 'Overpower!' : 'OK', on);
        // Connectivity: cloud / MQTT / Ethernet — warn when disconnected
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

  /** Firmware update entity for a device */
  private _getFirmware(device: ShellyHADevice): { entityId: string; current: string; newVersion?: string } | null {
    for (const e of device.entities) {
      if (e.domain !== 'update') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state !== 'on') return null;
      const attrs = s.attributes as Record<string, any>;
      return {
        entityId: e.entity_id,
        current: attrs.installed_version ?? '',
        newVersion: attrs.latest_version,
      };
    }
    return null;
  }

  // ─── Actions ────────────────────────────────────────────────────────────────

  private async _toggle(entityId: string, isOn: boolean, e: Event) {
    e.stopPropagation();
    const domain = entityId.split('.')[0];
    await this.hass.callService(domain, isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
  }

  private async _installUpdate(entityId: string, e: Event) {
    e.stopPropagation();
    await this.hass.callService('update', 'install', { entity_id: entityId });
  }

  private async _setBrightness(entityId: string, pct: number) {
    await this.hass.callService('light', 'turn_on', {
      entity_id: entityId,
      brightness_pct: Math.max(1, Math.min(100, pct)),
    });
  }

  private async _setColor(entityId: string, hex: string, whiteValue?: number, isRgbw = false) {
    const rgb = this._hexToRgb(hex);
    if (isRgbw && whiteValue !== undefined) {
      await this.hass.callService('light', 'turn_on', {
        entity_id: entityId,
        rgbw_color: [...rgb, whiteValue],
      });
    } else {
      await this.hass.callService('light', 'turn_on', {
        entity_id: entityId,
        rgb_color: rgb,
      });
    }
  }

  private async _setWhite(entityId: string, pct: number, rgbColor?: [number, number, number]) {
    const w = Math.round(Math.max(0, Math.min(100, pct)) * ShellyDashboardCard.BRIGHTNESS_MAX / 100);
    const rgb = rgbColor ?? [255, 255, 255];
    await this.hass.callService('light', 'turn_on', {
      entity_id: entityId,
      rgbw_color: [...rgb, w],
    });
  }

  private async _setTemp(entityId: string, temp: number) {
    await this.hass.callService('climate', 'set_temperature', {
      entity_id: entityId,
      temperature: Math.round(temp * 2) / 2,   // round to nearest 0.5
    });
  }

  private async _setHvacMode(entityId: string, mode: string, e: Event) {
    e.stopPropagation();
    await this.hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: mode });
  }

  private async _setPresetMode(entityId: string, preset: string, e: Event) {
    e.stopPropagation();
    await this.hass.callService('climate', 'set_preset_mode', { entity_id: entityId, preset_mode: preset });
  }

  /** Cover/roller entity for a device, or null */
  private _getCover(device: ShellyHADevice): {
    entityId: string;
    state: string;      // 'open' | 'closed' | 'opening' | 'closing' | 'stopped'
    position?: number;  // 0 = fully closed, 100 = fully open
  } | null {
    const ent = device.entities.find((e) => e.domain === 'cover');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;
    return {
      entityId: ent.entity_id,
      state: s.state,
      position: (s.attributes as any)?.current_position,
    };
  }

  private async _coverAction(entityId: string, action: 'open' | 'close' | 'stop', e: Event) {
    e.stopPropagation();
    const svc = { open: 'open_cover', close: 'close_cover', stop: 'stop_cover' } as const;
    await this.hass.callService('cover', svc[action], { entity_id: entityId });
  }

  private async _setCoverPosition(entityId: string, position: number) {
    await this.hass.callService('cover', 'set_cover_position', {
      entity_id: entityId,
      position: Math.round(Math.max(0, Math.min(100, position))),
    });
  }

  /** Valve entity for a device, or null. Reads position from entity attributes or a dedicated sensor. */
  private _getValve(device: ShellyHADevice): {
    entityId: string;
    state: string;
    position?: number;
    temperature?: number;
  } | null {
    const ent = device.entities.find((e) => e.domain === 'valve');
    if (!ent) return null;
    const s = this.hass.states[ent.entity_id];
    if (!s) return null;

    // Position: from valve attributes, or a dedicated position sensor
    let position: number | undefined = (s.attributes as Record<string, any>)?.current_position;
    if (position == null) {
      const posEnt = device.entities.find(
        (e) => e.domain === 'sensor' &&
          (e.entity_id.includes('posision') || e.entity_id.includes('position'))
      );
      if (posEnt) {
        const v = parseFloat(this.hass.states[posEnt.entity_id]?.state ?? '');
        if (!isNaN(v)) position = v;
      }
    }

    // Temperature: from a dedicated sensor
    let temperature: number | undefined;
    const tempEnt = device.entities.find((e) => {
      if (e.domain !== 'sensor') return false;
      const ts = this.hass.states[e.entity_id];
      return (ts?.attributes as Record<string, any>)?.device_class === 'temperature'
        || e.entity_id.includes('temperture') || e.entity_id.includes('temperature');
    });
    if (tempEnt) {
      const v = parseFloat(this.hass.states[tempEnt.entity_id]?.state ?? '');
      if (!isNaN(v)) temperature = v;
    }

    return { entityId: ent.entity_id, state: s.state, position, temperature };
  }

  private async _valveAction(entityId: string, action: 'open' | 'close' | 'stop', e: Event): Promise<void> {
    e.stopPropagation();
    const svc = { open: 'open_valve', close: 'close_valve', stop: 'stop_valve' } as const;
    await this.hass.callService('valve', svc[action], { entity_id: entityId });
  }

  private async _setValvePosition(entityId: string, position: number): Promise<void> {
    await this.hass.callService('valve', 'set_valve_position', {
      entity_id: entityId,
      position: Math.round(Math.max(0, Math.min(100, position))),
    });
  }

  /** Returns input channels (binary_sensor inputs) for i3/i4 and similar input-only devices */
  private _getInputChannels(device: ShellyHADevice): Array<{
    entityId: string;
    label: string;
    fullName: string;
    isOn: boolean;
    channel: number;
  }> {
    return device.entities
      .filter((e) => {
        if (e.domain !== 'binary_sensor') return false;
        const dc = e.attributes?.device_class;
        // Input channels: entity_id contains 'input'/'button', or device_class is null/undefined
        return e.entity_id.includes('input') || e.entity_id.includes('button') || dc == null;
      })
      .map((e) => {
        const s = this.hass.states[e.entity_id];
        const friendly: string = (s?.attributes as Record<string, any>)?.friendly_name ?? '';
        // Extract channel number from entity_id or friendly name
        const numMatch =
          e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i) ??
          friendly.match(/(\d+)\s*$/);
        const channel = numMatch ? parseInt(numMatch[1]) : 0;
        const label = numMatch ? `${channel}` : (friendly.split(' ').pop() ?? '?');
        return { entityId: e.entity_id, label, fullName: friendly || label, isOn: s?.state === 'on', channel };
      })
      .sort((a, b) => a.channel - b.channel);
  }

  // ─── Sparkline / history graph ──────────────────────────────────────────────

  /** Human-readable label for each graphable device_class */
  private static readonly GRAPH_DC_LABELS: Record<string, string> = {
    temperature:    'Temp',
    humidity:       'Hum',
    power:          'Power',
    energy:         'Energy',
    voltage:        'Volt',
    current:        'Curr',
    illuminance:    'Light',
    carbon_dioxide: 'CO₂',
    battery:        'Batt',
    apparent_power: 'App.P',
    reactive_power: 'Re.P',
    frequency:      'Freq',
    power_factor:   'PF',
    gas:            'Gas',
  };

  /** Returns one entry per selected graph_sensor that the device actually has. */
  private _getGraphEntities(device: ShellyHADevice): Array<{
    entityId: string; label: string; dc: string; unit: string;
  }> {
    const enabled = this._config.graph_sensors;
    if (!enabled?.length) return [];
    const results: Array<{ entityId: string; label: string; dc: string; unit: string }> = [];
    for (const dc of enabled) {
      const ent = device.entities.find((e) => {
        if (e.domain !== 'sensor') return false;
        const attrDc =
          (this.hass.states[e.entity_id]?.attributes as Record<string, any>)?.device_class ??
          (e.attributes as Record<string, any>)?.device_class;
        return attrDc === dc;
      });
      if (ent) {
        const unit: string =
          (this.hass.states[ent.entity_id]?.attributes as Record<string, any>)?.unit_of_measurement ?? '';
        results.push({
          entityId: ent.entity_id,
          label: ShellyDashboardCard.GRAPH_DC_LABELS[dc] ?? dc,
          dc,
          unit,
        });
      }
    }
    return results;
  }

  /** Requests a history fetch unless already fresh (< 5 min old). */
  private _requestGraphData(entityId: string): void {
    if (this._graphFetching.has(entityId)) return;
    const age = Date.now() - (this._graphFetchedAt.get(entityId) ?? 0);
    if (age < 5 * 60 * 1000 && this._graphData.has(entityId)) return;
    this._fetchGraphData(entityId);
  }

  /** Fetches HA history for an entity and stores result in _graphData. */
  private async _fetchGraphData(entityId: string): Promise<void> {
    this._graphFetching.add(entityId);
    try {
      const hours = this._config.graph_hours ?? 24;
      const start = new Date(Date.now() - hours * 60 * 60 * 1000);
      const path = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&minimal_response=true&no_attributes=true`;
      const raw = await (this.hass as any).callApi('GET', path) as Array<Array<{ state: string; last_changed: string }>>;
      if (raw?.[0]) {
        const points = raw[0]
          .map((p) => ({ t: new Date(p.last_changed).getTime(), v: parseFloat(p.state) }))
          .filter((p) => !isNaN(p.v));
        const next = new Map(this._graphData);
        next.set(entityId, points);
        this._graphData = next;
        this._graphFetchedAt.set(entityId, Date.now());
      }
    } catch (err) {
      console.warn('[shelly-card] history fetch failed for', entityId, err);
    } finally {
      this._graphFetching.delete(entityId);
    }
  }

  /** Renders one labeled sparkline row per selected graph_sensor found on the device. */
  private _renderSparklines(device: ShellyHADevice): TemplateResult {
    const entities = this._getGraphEntities(device);
    if (!entities.length) return nothing as unknown as TemplateResult;

    const W = 200, H = 32, pad = 2;

    const rows = entities.map(({ entityId, label, unit }) => {
      this._requestGraphData(entityId);
      const points = this._graphData.get(entityId);

      if (!points || points.length < 2) {
        return html`
          <div class="spark-row">
            <span class="spark-lbl">${label}</span>
            <div class="sparkline-loading"></div>
            <span class="spark-val">—</span>
          </div>`;
      }

      const vals = points.map((p) => p.v);
      const min = Math.min(...vals), max = Math.max(...vals);
      const range = max - min || 1;
      const tMin = points[0].t;
      const tRange = (points[points.length - 1].t - tMin) || 1;

      const coords = points.map((p) => {
        const x = ((p.t - tMin) / tRange) * W;
        const y = H - pad - ((p.v - min) / range) * (H - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');

      const gId = `sg-${entityId.replace(/[^a-z0-9]/gi, '')}`;
      const firstX = ((points[0].t - tMin) / tRange * W).toFixed(1);
      const lastVal = vals[vals.length - 1];
      const disp = lastVal % 1 === 0 ? `${lastVal}` : lastVal.toFixed(1);

      return html`
        <div class="spark-row">
          <span class="spark-lbl">${label}</span>
          <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="sparkline-svg">
            <defs>
              <linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--shelly-orange)" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="var(--shelly-orange)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polygon points="${coords} ${W},${H - pad} ${firstX},${H - pad}"
              fill="url(#${gId})"/>
            <polyline points="${coords}" fill="none"
              stroke="var(--shelly-orange)" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="spark-val">${disp} ${unit}</span>
        </div>`;
    });

    return html`<div class="sparklines-block" @click=${(e: Event) => e.stopPropagation()}>${rows}</div>`;
  }

  private _clickTile(device: ShellyHADevice, e: Event) {
    if (this._bulkMode) {
      e.stopPropagation();
      this._toggleBulkSelect(device.device_id);
      return;
    }
    if (this._config.tile_click === 'toggle') {
      const sw = this._getPrimarySwitch(device);
      if (sw) this._toggle(sw.entityId, sw.isOn, e);
      return;
    }
    this._expandedDevice = this._expandedDevice === device.device_id ? null : device.device_id;
  }

  private _expandTile(deviceId: string, e: Event) {
    e.stopPropagation();
    this._expandedDevice = this._expandedDevice === deviceId ? null : deviceId;
  }

  private _toggleArea(area: string) {
    const next = new Set(this._closedAreas);
    if (next.has(area)) {
      next.delete(area);
    } else {
      next.add(area);
    }
    this._closedAreas = next;
  }

  /** Returns active alert types for a device (overtemp, overpower) */
  private _getAlerts(device: ShellyHADevice): Array<'overtemp' | 'overpower'> {
    const alerts: Array<'overtemp' | 'overpower'> = [];
    for (const e of device.entities) {
      if (e.domain !== 'binary_sensor') continue;
      const s = this.hass.states[e.entity_id];
      if (!s || s.state !== 'on') continue;
      const dc = (s.attributes as any).device_class ?? '';
      const id = e.entity_id;
      if (dc === 'heat' || id.includes('overtemperature') || id.includes('overtemp')) {
        alerts.push('overtemp');
      } else if (dc === 'safety' || id.includes('overpower')) {
        alerts.push('overpower');
      }
    }
    return alerts;
  }

  private _toggleBulkSelect(deviceId: string) {
    const next = new Set(this._selectedDevices);
    if (next.has(deviceId)) next.delete(deviceId); else next.add(deviceId);
    this._selectedDevices = next;
  }

  private async _bulkToggle(on: boolean) {
    const devices = this._getDevices();
    for (const deviceId of this._selectedDevices) {
      const device = devices.find((d) => d.device_id === deviceId);
      if (!device) continue;
      const sw = this._getPrimarySwitch(device);
      if (sw) {
        await this.hass.callService(
          sw.entityId.split('.')[0],
          on ? 'turn_on' : 'turn_off',
          { entity_id: sw.entityId }
        );
      }
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  protected render(): TemplateResult {
    if (!this._config || !this.hass) return html``;

    const devices = this._getDevices();

    const includeAll = this._config.include_all ?? false;
    const cardTitle = includeAll ? 'All Devices' : 'Shelly Devices';

    if (!devices.length) {
      return html`
        <ha-card>
          <div class="empty">
            <p>No ${includeAll ? '' : 'Shelly '}devices found.</p>
            <p class="hint">Devices are auto-discovered via the Home Assistant entity registry.</p>
          </div>
        </ha-card>
      `;
    }

    const online = devices.filter((d) => this._isOnline(d)).length;
    const offline = devices.length - online;
    const totalPower = devices.reduce((s, d) => s + (this._getPower(d) ?? 0), 0);
    const alertDevices = devices.filter((d) => this._getAlerts(d).length > 0);
    const byArea = this._groupByArea(devices);

    return html`
      <ha-card>
        <div class="dash-header">
          <span class="dash-title">${cardTitle}</span>
          <div class="dash-stats">
            <span class="stat online">${online}/${devices.length} online</span>
            ${offline > 0 ? html`<span class="stat offline-count">${offline} offline</span>` : nothing}
            <span class="stat power">${formatPower(totalPower)}</span>
            ${alertDevices.length > 0 ? html`<span class="stat alerts-count">⚠ ${alertDevices.length}</span>` : nothing}
          </div>
        </div>
        ${this._renderSearchBar()}
        ${this._bulkMode && this._selectedDevices.size > 0 ? this._renderBulkActions() : nothing}
        <div class="dash-body">
          ${[...byArea.entries()].map(([area, areaDevices]) =>
            this._renderAreaSection(area, areaDevices)
          )}
        </div>
      </ha-card>
    `;
  }

  private _renderAreaSection(area: string, devices: ShellyHADevice[]): TemplateResult {
    const label = area || 'No Area';
    // Apply search filter within this area
    const filtered = this._searchTerm
      ? devices.filter((d) => d.name.toLowerCase().includes(this._searchTerm.toLowerCase()))
      : devices;
    if (!filtered.length) return html``;
    const isClosed = this._closedAreas.has(area);
    const onlineCount = filtered.filter((d) => this._isOnline(d)).length;
    const areaPower = filtered.reduce((s, d) => s + (this._getPower(d) ?? 0), 0);
    const areaStyle = this._config.area_styles?.[label];
    const cols = areaStyle?.columns ?? this._config.columns ?? 3;
    const styleObj: Record<string, string> = {};
    if (areaStyle) {
      // Background
      if (areaStyle.bgImage) {
        const sizeMap: Record<string, string> = {
          contain: 'contain',
          cover:   'cover',
          stretch: '100% 100%',
        };
        styleObj['backgroundImage']    = `url('${areaStyle.bgImage}')`;
        styleObj['backgroundSize']     = sizeMap[areaStyle.bgImageSize ?? 'contain'] ?? 'contain';
        styleObj['backgroundPosition'] = 'center center';
        styleObj['backgroundRepeat']   = 'no-repeat';
        styleObj['overflow']           = 'hidden';
      } else if (areaStyle.bgColor) {
        styleObj['background'] = areaStyle.bgColor;
      }
      // Border
      if (areaStyle.borderColor || areaStyle.borderWidth || areaStyle.borderStyle) {
        styleObj['border'] = `${areaStyle.borderWidth ?? 1}px ${areaStyle.borderStyle ?? 'solid'} ${areaStyle.borderColor ?? 'var(--divider-color)'}`;
      }
      if (areaStyle.borderRadius) {
        styleObj['borderRadius'] = `${areaStyle.borderRadius}px`;
        styleObj['overflow'] = 'hidden';
      }
      // Header — passed via CSS variables consumed by .area-header / .area-name
      if (areaStyle.headerBgColor) {
        styleObj['--area-header-bg'] = areaStyle.headerBgColor2
          ? `linear-gradient(${areaStyle.headerBgDir ?? 'to right'}, ${areaStyle.headerBgColor}, ${areaStyle.headerBgColor2})`
          : areaStyle.headerBgColor;
      }
      if (areaStyle.headerTextColor) styleObj['--area-header-color'] = areaStyle.headerTextColor;
      // Text / typography — routed through CSS variables so they reach the right elements
      if (areaStyle.textColor)  styleObj['--area-header-color']  = areaStyle.textColor;
      if (areaStyle.fontSize)   styleObj['--area-name-size']     = `${areaStyle.fontSize}px`;
      if (areaStyle.fontWeight) styleObj['--area-name-weight']   = areaStyle.fontWeight;
      if (areaStyle.fontStyle)  styleObj['--area-name-style']    = areaStyle.fontStyle;
      // Tile overrides
      if (areaStyle.tileBgColor)     styleObj['--sc-tile-bg']     = areaStyle.tileBgColor;
      if (areaStyle.tileBorderColor) styleObj['--sc-tile-border'] = areaStyle.tileBorderColor;
      // Effects
      const SHADOWS: Record<string, string> = {
        soft:   '0 2px 8px rgba(0,0,0,.18)',
        medium: '0 4px 16px rgba(0,0,0,.28)',
        strong: '0 8px 32px rgba(0,0,0,.45)',
      };
      if (areaStyle.boxShadow && areaStyle.boxShadow !== 'none') {
        styleObj['boxShadow'] = SHADOWS[areaStyle.boxShadow] ?? '';
      }
    }

    return html`
      <div class="area-section ${isClosed ? 'closed' : ''}" style=${styleMap(styleObj)}>
        <div class="area-header" @click=${() => this._toggleArea(area)}>
          <span class="area-name">${label}</span>
          <div class="area-meta">
            <span class="area-count">${onlineCount}/${filtered.length}</span>
            ${areaPower > 0 ? html`<span class="area-power">${formatPower(areaPower)}</span>` : nothing}
            <span class="chevron ${isClosed ? '' : 'open'}">▼</span>
          </div>
        </div>
        ${!isClosed
          ? this._viewMode === 'list'
            ? html`<div class="device-list">${filtered.map((d) => this._renderListRow(d))}</div>`
            : html`<div class="device-grid" style="--cols:${cols}">${filtered.map((d) => this._renderTile(d))}</div>`
          : nothing}
      </div>
    `;
  }

  private _renderTile(device: ShellyHADevice): TemplateResult {
    const online = this._isOnline(device);
    const power = this._getPower(device);
    const sw = this._getPrimarySwitch(device);
    const trv = this._getTrv(device);
    const cover = this._getCover(device);
    const valve = this._getValve(device);
    const profile = getDeviceProfile(device);
    const isExpanded = this._expandedDevice === device.device_id;
    const fw = this._getFirmware(device);
    const isDimmable = sw?.brightness !== undefined;
    const bPct = isDimmable && sw!.isOn ? Math.max(1, sw!.brightness ?? 1) : 0;
    const hasColor = !!(sw?.colorModes?.length);
    const hexColor = hasColor && sw!.rgbColor
      ? this._rgbToHex(...sw!.rgbColor)
      : '#ffffff';
    const isRgbw = hasColor && (sw!.colorModes?.some((m) => m === 'rgbw' || m === 'rgbww') ?? false);
    const isHeating = trv?.hvacMode === 'heat';
    const isCoverMoving = cover?.state === 'opening' || cover?.state === 'closing';
    const isCoverOpen = cover ? (cover.state === 'open' || (cover.position ?? 0) > 0) : false;
    const isValveMoving = valve?.state === 'opening' || valve?.state === 'closing';
    const isValveOpen = valve ? (valve.state === 'open' || (valve.position ?? 0) > 0) : false;
    const inputs = profile.type === 'input' ? this._getInputChannels(device) : [];
    const valveEntityName = valve
      ? ((this.hass.states[valve.entityId]?.attributes as Record<string, any>)?.friendly_name
          ?? valve.entityId.split('.')[1].replace(/_/g, ' '))
      : '';
    const genLabel = profile.gen === 'ble' ? 'BLE' : `G${profile.gen}`;
    const alerts = this._getAlerts(device);
    const tileSize = this._config.tile_size ?? 'md';
    const isSelected = this._bulkMode && this._selectedDevices.has(device.device_id);
    const accentColor = this._config.device_styles?.[device.device_id]?.color;
    const tileStyle: Record<string, string> = {};
    if (accentColor) {
      tileStyle['borderColor'] = accentColor;
      tileStyle['boxShadow'] = `0 0 12px ${accentColor}50`;
    }

    return html`
      <div
        class="tile ${isExpanded ? 'expanded' : ''} ${!online ? 'offline' : ''} ${this._glowEnabled && (sw?.isOn || isHeating || isCoverOpen || isValveOpen) ? 'glow-on' : ''} ${isSelected ? 'selected' : ''} tile-${tileSize}"
        style=${styleMap(tileStyle)}
        @click=${(e: Event) => this._clickTile(device, e)}
      >
        <div class="tile-top">
          <div class="tile-left">
            ${this._bulkMode ? html`
              <input type="checkbox" class="bulk-check"
                .checked=${isSelected}
                @click=${(e: Event) => { e.stopPropagation(); this._toggleBulkSelect(device.device_id); }}
              />
            ` : nothing}
            <span class="dot ${online ? 'online' : 'offline'}"></span>
            <span class="tile-name">${device.name}</span>
            ${fw ? html`<span class="update-dot" title="Firmware update available">●</span>` : nothing}
          </div>
          ${this._config.tile_click === 'toggle' ? html`
            <button class="tile-expand-btn ${isExpanded ? 'active' : ''}"
              @click=${(e: Event) => this._expandTile(device.device_id, e)} title="Expand">⊕</button>
          ` : nothing}
          ${cover ? html`
            <div class="cov-btns" @click=${(e: Event) => e.stopPropagation()}>
              <button class="cov-btn" title="Open"
                @click=${(e: Event) => this._coverAction(cover.entityId, 'open', e)}>▲</button>
              <button class="cov-btn stop" title="Stop"
                @click=${(e: Event) => this._coverAction(cover.entityId, 'stop', e)}>■</button>
              <button class="cov-btn" title="Close"
                @click=${(e: Event) => this._coverAction(cover.entityId, 'close', e)}>▼</button>
            </div>
          ` : sw ? html`
            <button
              class="tog ${sw.isOn ? 'on' : 'off'}"
              @click=${(e: Event) => this._toggle(sw.entityId, sw.isOn, e)}
            >${sw.isOn ? 'ON' : 'OFF'}</button>
          ` : trv ? html`
            <button
              class="tog ${isHeating ? 'on' : 'off'}"
              @click=${(e: Event) => this._setHvacMode(trv.entityId, isHeating ? 'off' : 'heat', e)}
            >${isHeating ? 'HEAT' : 'OFF'}</button>
          ` : nothing}
        </div>

        <!-- Cover position bar -->
        ${cover ? html`
          <div class="cov-pos-row" @click=${(e: Event) => e.stopPropagation()}>
            <div class="cov-bar">
              <div class="cov-fill ${isCoverMoving ? 'moving' : ''}"
                style="width: ${cover.position ?? (cover.state === 'open' ? 100 : 0)}%"></div>
            </div>
            <span class="cov-pct">${
              cover.position != null
                ? `${Math.round(cover.position)}%`
                : cover.state
            }</span>
          </div>
        ` : nothing}

        <!-- Valve body: matches expanded Water Valve section -->
        ${valve ? html`
          <div class="tile-valve-body" @click=${(e: Event) => e.stopPropagation()}>
            <div class="tile-valve-ename">${valveEntityName}</div>
            <div class="trv-mode-row" style="margin-bottom:0">
              <button class="tog sm ${valve.state === 'open' ? 'on' : 'off'}" style="flex:1"
                @click=${(e: Event) => this._valveAction(valve.entityId, 'open', e)}>Open</button>
              <button class="tog sm off" style="flex:1"
                @click=${(e: Event) => this._valveAction(valve.entityId, 'stop', e)}>Stop</button>
              <button class="tog sm ${valve.state === 'closed' ? 'on' : 'off'}" style="flex:1"
                @click=${(e: Event) => this._valveAction(valve.entityId, 'close', e)}>Close</button>
            </div>
            ${valve.position != null ? html`
              <div class="dim-wrap" style="margin-top:4px">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider"
                  min="0" max="100" step="1"
                  style="accent-color: var(--shelly-orange)"
                  .value=${String(valve.position)}
                  @input=${(e: Event) => {
                    const inp = e.target as HTMLInputElement;
                    const disp = inp.closest('.tile-valve-body')?.querySelector('.cov-pos-disp');
                    if (disp) disp.textContent = `${inp.value}%`;
                  }}
                  @change=${(e: Event) => {
                    e.stopPropagation();
                    this._setValvePosition(valve.entityId, parseFloat((e.target as HTMLInputElement).value));
                  }}
                />
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center; font-size:12px; color: var(--sc-text-secondary); margin-top:2px">
                Position: <span class="cov-pos-disp">${Math.round(valve.position)}%</span>
              </div>
            ` : nothing}
            ${valve.temperature != null ? html`
              <div class="trv-valve-row" style="margin-top:4px">
                <span class="sensor-label">Temperature</span>
                <span class="sensor-value">${valve.temperature.toFixed(1)} °C</span>
              </div>
            ` : nothing}
          </div>
        ` : nothing}

        <!-- Input channels for i3/i4 devices -->
        ${inputs.length ? html`
          <div class="tile-inputs" @click=${(e: Event) => e.stopPropagation()}>
            ${inputs.map((ch) => html`
              <div class="input-chip ${ch.isOn ? 'active' : ''}">
                <span class="input-dot"></span>
                <span class="input-lbl">${ch.label}</span>
              </div>
            `)}
          </div>
        ` : nothing}

        <div class="tile-bot">
          ${power != null ? html`<span class="tile-power">${formatPower(power)}</span>` : nothing}
          <div class="tile-badges">
            ${alerts.map((a) => html`<span class="alert-badge alert-${a}">${a === 'overtemp' ? '🌡' : '⚡'}!</span>`)}
            ${profile.label ? html`<span class="type-badge type-${profile.type}">${profile.label}</span>` : nothing}
            ${device.isShelly ? html`<span class="gen-badge gen-${profile.gen}">${genLabel}</span>` : nothing}
            ${device.isShelly && device.ip && this._isPrivateIp(device.ip) ? html`
              <a href="http://${device.ip}" target="_blank" class="tile-ui-link"
                 @click=${(e: Event) => e.stopPropagation()} title="Open Shelly UI">↗</a>
            ` : nothing}
          </div>
        </div>

        ${trv ? html`
          <div class="tile-trv-row" @click=${(e: Event) => e.stopPropagation()}>
            <div class="trv-temps">
              ${trv.currentTemp != null
                ? html`<span class="trv-cur">${trv.currentTemp}°</span><span class="trv-sep">›</span>`
                : nothing}
              <span class="trv-target ${isHeating ? 'heating' : ''}">${trv.targetTemp ?? '—'}°</span>
            </div>
            ${trv.hvacAction === 'heating'
              ? html`<span class="trv-flame" title="Heating">🔥</span>`
              : nothing}
            <div class="trv-step-btns">
              <button class="trv-step" title="Decrease"
                @click=${() => trv.targetTemp != null && this._setTemp(trv.entityId, trv.targetTemp - trv.step)}>−</button>
              <button class="trv-step" title="Increase"
                @click=${() => trv.targetTemp != null && this._setTemp(trv.entityId, trv.targetTemp + trv.step)}>+</button>
            </div>
          </div>
          <div class="tile-dim-row tile-trv-slider" @click=${(e: Event) => e.stopPropagation()}>
            <input
              type="range"
              class="dim-slider"
              min=${trv.minTemp} max=${trv.maxTemp} step=${trv.step}
              style="accent-color: var(--shelly-orange)"
              .value=${String(trv.targetTemp ?? trv.minTemp)}
              @input=${(e: Event) => {
                const inp = e.target as HTMLInputElement;
                const disp = inp.closest('.tile-trv-slider')?.querySelector('.dim-pct');
                if (disp) disp.textContent = `${parseFloat(inp.value).toFixed(1)}°`;
              }}
              @change=${(e: Event) => {
                this._setTemp(trv.entityId, parseFloat((e.target as HTMLInputElement).value));
              }}
            />
            <span class="dim-pct">${trv.targetTemp != null ? trv.targetTemp.toFixed(1) : '—'}°</span>
          </div>
          ${trv.valvePosition != null ? html`
            <div class="cov-pos-row" @click=${(e: Event) => e.stopPropagation()}>
              <div class="cov-bar">
                <div class="cov-fill" style="width: ${Math.min(100, trv.valvePosition)}%"></div>
              </div>
              <span class="cov-pct">V: ${Math.round(trv.valvePosition)}%</span>
            </div>
          ` : nothing}
        ` : nothing}

        ${sw && isDimmable ? html`
          <div class="tile-dim-row" @click=${(e: Event) => e.stopPropagation()}>
            ${isRgbw ? html`<span class="white-icon">RGB</span>` : nothing}
            ${hasColor ? html`
              <input
                type="color"
                class="color-swatch tile-color-swatch"
                .value=${hexColor}
                ?disabled=${!sw.isOn}
                title="Color"
                @input=${(e: Event) => {
                  const hex = (e.target as HTMLInputElement).value;
                  const slider = (e.target as HTMLElement)
                    .closest('.tile-dim-row')?.querySelector('.dim-slider') as HTMLElement | null;
                  if (slider) slider.style.accentColor = hex;
                }}
                @change=${(e: Event) => {
                  e.stopPropagation();
                  const hex = (e.target as HTMLInputElement).value;
                  this._setColor(sw.entityId, hex, sw.whiteValue, isRgbw);
                }}
              />
            ` : nothing}
            <input
              type="range"
              class="dim-slider"
              min="1" max="100"
              style=${styleMap(hasColor ? { accentColor: hexColor } : {})}
              .value=${String(sw.isOn ? Math.max(1, sw.brightness ?? 1) : 1)}
              ?disabled=${!sw.isOn}
              @input=${(e: Event) => {
                const inp = e.target as HTMLInputElement;
                const pct = inp.closest('.tile-dim-row')?.querySelector('.dim-pct');
                if (pct) pct.textContent = `${inp.value}%`;
              }}
              @change=${(e: Event) => {
                this._setBrightness(sw.entityId, parseInt((e.target as HTMLInputElement).value, 10));
              }}
            />
            <span class="dim-pct">${bPct}%</span>
          </div>
        ` : nothing}

        ${sw && isRgbw ? html`
          <div class="tile-dim-row" @click=${(e: Event) => e.stopPropagation()}>
            <span class="white-icon" title="White channel">W</span>
            <input
              type="range"
              class="dim-slider white-slider"
              min="0" max="100" step="1"
              .value=${String(Math.round((sw.whiteValue ?? 0) / ShellyDashboardCard.BRIGHTNESS_MAX * 100))}
              ?disabled=${!sw.isOn}
              @input=${(e: Event) => {
                const inp = e.target as HTMLInputElement;
                const pct = inp.closest('.tile-dim-row')?.querySelector('.dim-pct');
                if (pct) pct.textContent = `${inp.value}%`;
              }}
              @change=${(e: Event) => {
                this._setWhite(sw!.entityId, parseInt((e.target as HTMLInputElement).value, 10), sw!.rgbColor);
              }}
            />
            <span class="dim-pct">${Math.round((sw.whiteValue ?? 0) / ShellyDashboardCard.BRIGHTNESS_MAX * 100)}%</span>
          </div>
        ` : nothing}

        ${this._renderSparklines(device)}
        ${this._renderPowerBar(device)}
        ${isExpanded ? this._renderExpanded(device) : nothing}
      </div>
    `;
  }

  private static readonly _DOMAIN_COLOR: Record<string, string> = {
    switch:        'var(--shelly-orange)',
    light:         '#f0c040',
    sensor:        '#5b8dd9',
    binary_sensor: '#4ecdc4',
    button:        '#9b59b6',
    input_button:  '#9b59b6',
    cover:         '#e67e22',
    climate:       '#e74c3c',
    update:        '#2ecc71',
    number:        '#7f8c8d',
    select:        '#7f8c8d',
    input_boolean: 'var(--shelly-orange)',
    input_number:  '#7f8c8d',
    input_select:  '#7f8c8d',
    input_text:    '#7f8c8d',
    lock:          '#e74c3c',
    fan:           '#5b8dd9',
    media_player:  '#1abc9c',
    text:          '#7f8c8d',
    event:         '#7f8c8d',
  };

  private _renderEntityList(device: ShellyHADevice): TemplateResult {
    return html`
      <div class="ent-list">
        ${device.entities.map((e) => {
          const s = this.hass.states[e.entity_id];
          const rawState = s?.state ?? 'unavailable';
          const unit = (s?.attributes as any)?.unit_of_measurement ?? '';
          const name = (s?.attributes as any)?.friendly_name
            ?? e.entity_id.split('.')[1].replace(/_/g, ' ');
          const stateText = unit ? `${rawState} ${unit}` : rawState;
          const color = ShellyDashboardCard._DOMAIN_COLOR[e.domain] ?? '#7f8c8d';
          const isOn = rawState === 'on' || rawState === 'locked' || rawState === 'open';
          const isToggleable = ['switch', 'light', 'input_boolean', 'fan'].includes(e.domain);
          const isPressable = e.domain === 'button' || e.domain === 'input_button';
          const isLock = e.domain === 'lock';

          return html`
            <div class="ent-row">
              <span class="ent-domain" style="color:${color}">${e.domain}</span>
              <span class="ent-name">${name}</span>
              <span class="ent-state">${stateText}</span>
              ${isToggleable ? html`
                <button class="tog sm ${rawState === 'on' ? 'on' : 'off'}"
                  @click=${(ev: Event) => this._toggle(e.entity_id, rawState === 'on', ev)}>
                  ${rawState === 'on' ? 'ON' : 'OFF'}
                </button>
              ` : isLock ? html`
                <button class="tog sm ${rawState === 'locked' ? 'on' : 'off'}"
                  @click=${(ev: Event) => {
                    ev.stopPropagation();
                    this.hass.callService('lock', isOn ? 'unlock' : 'lock', { entity_id: e.entity_id });
                  }}>
                  ${rawState === 'locked' ? 'LOCKED' : 'OPEN'}
                </button>
              ` : isPressable ? html`
                <button class="tog sm off"
                  @click=${(ev: Event) => {
                    ev.stopPropagation();
                    this.hass.callService('button', 'press', { entity_id: e.entity_id });
                  }}>Press</button>
              ` : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderExpanded(device: ShellyHADevice): TemplateResult {
    const switches = this._getSwitches(device);
    const sensors = this._getSensors(device);
    const fw = this._getFirmware(device);
    const trv = this._getTrv(device);
    const cover = this._getCover(device);
    const valve = this._getValve(device);
    const profile = getDeviceProfile(device);
    const inputs = profile.type === 'input' ? this._getInputChannels(device) : [];
    const ip = device.ip;
    const hasDimmable = switches.some((sw) => sw.brightness !== undefined);
    const showChannels = switches.length > 1 || hasDimmable;

    return html`
      <div class="expanded" @click=${(e: Event) => e.stopPropagation()}>

        ${cover ? html`
          <div class="exp-section exp-section--cover">
            <div class="exp-label">Roller / Cover</div>
            <!-- Open / Stop / Close buttons -->
            <div class="trv-mode-row">
              <button class="tog sm ${cover.state === 'open' ? 'on' : 'off'}"
                @click=${(e: Event) => this._coverAction(cover.entityId, 'open', e)}>Open</button>
              <button class="tog sm off"
                @click=${(e: Event) => this._coverAction(cover.entityId, 'stop', e)}>Stop</button>
              <button class="tog sm ${cover.state === 'closed' ? 'on' : 'off'}"
                @click=${(e: Event) => this._coverAction(cover.entityId, 'close', e)}>Close</button>
            </div>
            ${cover.position != null ? html`
              <!-- Position slider -->
              <div class="dim-wrap" style="margin-top: 8px;">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider"
                  min="0" max="100" step="5"
                  style="accent-color: var(--shelly-orange)"
                  .value=${String(cover.position)}
                  @input=${(e: Event) => {
                    const inp = e.target as HTMLInputElement;
                    const disp = inp.closest('.exp-section--cover')?.querySelector('.cov-pos-disp');
                    if (disp) disp.textContent = `${inp.value}%`;
                  }}
                  @change=${(e: Event) => {
                    e.stopPropagation();
                    this._setCoverPosition(cover.entityId, parseFloat((e.target as HTMLInputElement).value));
                  }}
                />
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center; font-size:12px; color: var(--sc-text-secondary); margin-top: 2px;">
                Position: <span class="cov-pos-disp">${Math.round(cover.position)}%</span>
              </div>
            ` : nothing}
          </div>
        ` : nothing}

        ${valve ? html`
          <div class="exp-section exp-section--cover">
            <div class="exp-label">Water Valve</div>
            <div class="trv-mode-row">
              <button class="tog sm ${valve.state === 'open' ? 'on' : 'off'}"
                @click=${(e: Event) => this._valveAction(valve.entityId, 'open', e)}>Open</button>
              <button class="tog sm off"
                @click=${(e: Event) => this._valveAction(valve.entityId, 'stop', e)}>Stop</button>
              <button class="tog sm ${valve.state === 'closed' ? 'on' : 'off'}"
                @click=${(e: Event) => this._valveAction(valve.entityId, 'close', e)}>Close</button>
            </div>
            ${valve.position != null ? html`
              <div class="dim-wrap" style="margin-top: 8px;">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider"
                  min="0" max="100" step="1"
                  style="accent-color: var(--shelly-orange)"
                  .value=${String(valve.position)}
                  @input=${(e: Event) => {
                    const inp = e.target as HTMLInputElement;
                    const disp = inp.closest('.exp-section--cover')?.querySelector('.cov-pos-disp');
                    if (disp) disp.textContent = `${inp.value}%`;
                  }}
                  @change=${(e: Event) => {
                    e.stopPropagation();
                    this._setValvePosition(valve.entityId, parseFloat((e.target as HTMLInputElement).value));
                  }}
                />
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center; font-size:12px; color: var(--sc-text-secondary); margin-top: 2px;">
                Position: <span class="cov-pos-disp">${Math.round(valve.position)}%</span>
              </div>
            ` : nothing}
            ${valve.temperature != null ? html`
              <div class="trv-valve-row" style="margin-top: 8px;">
                <span class="sensor-label">Temperature</span>
                <span class="sensor-value">${valve.temperature.toFixed(1)} °C</span>
              </div>
            ` : nothing}
          </div>
        ` : nothing}

        ${trv ? html`
          <div class="exp-section exp-section--trv">
            <div class="exp-label">Thermostat</div>

            <!-- Temperature display + ± buttons -->
            <div class="trv-ctrl-row">
              <button class="trv-big-btn"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  if (trv.targetTemp != null)
                    this._setTemp(trv.entityId, Math.max(trv.minTemp, trv.targetTemp - trv.step));
                }}>−</button>
              <div class="trv-display">
                <span class="trv-target-big">${trv.targetTemp != null ? trv.targetTemp.toFixed(1) : '—'}°</span>
                ${trv.currentTemp != null
                  ? html`<span class="trv-current-sub">now ${trv.currentTemp}°</span>`
                  : nothing}
                ${trv.hvacAction === 'heating'
                  ? html`<span class="trv-action-badge heating">Heating</span>`
                  : trv.hvacAction === 'idle'
                    ? html`<span class="trv-action-badge idle">Idle</span>`
                    : nothing}
              </div>
              <button class="trv-big-btn"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  if (trv.targetTemp != null)
                    this._setTemp(trv.entityId, Math.min(trv.maxTemp, trv.targetTemp + trv.step));
                }}>+</button>
            </div>

            <!-- Temperature slider -->
            <div class="dim-wrap" style="margin: 4px 0 8px;">
              <span class="trv-range-lbl">${trv.minTemp}°</span>
              <input type="range" class="dim-slider"
                min=${trv.minTemp} max=${trv.maxTemp} step=${trv.step}
                style="accent-color: var(--shelly-orange)"
                .value=${String(trv.targetTemp ?? trv.minTemp)}
                @input=${(e: Event) => {
                  const inp = e.target as HTMLInputElement;
                  const disp = inp.closest('.exp-section--trv')?.querySelector('.trv-target-big');
                  if (disp) disp.textContent = `${parseFloat(inp.value).toFixed(1)}°`;
                }}
                @change=${(e: Event) => {
                  e.stopPropagation();
                  this._setTemp(trv.entityId, parseFloat((e.target as HTMLInputElement).value));
                }}
              />
              <span class="trv-range-lbl">${trv.maxTemp}°</span>
            </div>

            <!-- Mode buttons -->
            <div class="trv-mode-row">
              <button class="tog sm ${trv.hvacMode === 'heat' ? 'on' : 'off'}"
                @click=${(e: Event) => this._setHvacMode(trv.entityId, 'heat', e)}>Heat</button>
              <button class="tog sm ${trv.hvacMode === 'off' ? 'on' : 'off'}"
                @click=${(e: Event) => this._setHvacMode(trv.entityId, 'off', e)}>Off</button>
            </div>

            <!-- Presets -->
            ${trv.presetModes.length ? html`
              <div class="trv-preset-row">
                ${trv.presetModes.map((p) => html`
                  <button class="tog sm ${trv.presetMode === p ? 'on' : 'off'} trv-preset"
                    @click=${(e: Event) => this._setPresetMode(trv.entityId, p, e)}>${p}</button>
                `)}
              </div>
            ` : nothing}

            <!-- Valve position bar -->
            ${trv.valvePosition != null ? html`
              <div class="trv-valve-row">
                <span class="sensor-label">Valve</span>
                <div class="trv-valve-bar">
                  <div class="trv-valve-fill" style="width: ${Math.min(100, trv.valvePosition)}%"></div>
                </div>
                <span class="sensor-value">${Math.round(trv.valvePosition)}%</span>
              </div>
            ` : nothing}
          </div>
        ` : nothing}

        ${inputs.length ? html`
          <div class="exp-section">
            <div class="exp-label">Inputs</div>
            <div class="input-grid">
              ${inputs.map((ch) => html`
                <div class="input-row">
                  <span class="input-row-dot ${ch.isOn ? 'active' : ''}"></span>
                  <span class="input-row-name">${ch.fullName}</span>
                  <span class="input-row-state ${ch.isOn ? 'active' : ''}">${ch.isOn ? 'ON' : 'OFF'}</span>
                </div>
              `)}
            </div>
          </div>
        ` : nothing}

        ${sensors.length ? html`
          <div class="exp-section">
            <div class="exp-label">Sensors</div>
            <div class="sensor-row">
              ${sensors.map((s) => html`
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
              <button
                class="tog sm update"
                @click=${(e: Event) => this._installUpdate(fw.entityId, e)}
              >Install</button>
            </div>
          </div>
        ` : nothing}

        ${(() => {
          const isOpen = this._entityListOpen.has(device.device_id);
          return html`
            <div class="exp-section exp-section--full">
              <div class="ent-list-header" @click=${(e: Event) => {
                e.stopPropagation();
                const next = new Set(this._entityListOpen);
                if (isOpen) next.delete(device.device_id); else next.add(device.device_id);
                this._entityListOpen = next;
              }}>
                <span class="exp-label" style="margin:0">All Entities (${device.entities.length})</span>
                <span class="ent-caret ${isOpen ? 'open' : ''}">▼</span>
              </div>
              ${isOpen ? this._renderEntityList(device) : nothing}
            </div>
          `;
        })()}

      </div>
    `;
  }

  private _renderSearchBar(): TemplateResult {
    return html`
      <div class="search-bar">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="search"
            class="search-input"
            placeholder="Search devices…"
            .value=${this._searchTerm}
            @input=${(e: Event) => { this._searchTerm = (e.target as HTMLInputElement).value; }}
          />
          ${this._searchTerm ? html`
            <button class="search-clear" @click=${() => { this._searchTerm = ''; }}>✕</button>
          ` : nothing}
        </div>
        <div class="sort-pills">
          ${(['name', 'power', 'online'] as const).map((s) => html`
            <button class="sort-pill ${this._sortBy === s ? 'active' : ''}"
              title="Sort by ${s}"
              @click=${() => { this._sortBy = s; }}>
              ${s === 'name' ? 'A→Z' : s === 'power' ? '⚡' : '●'}
            </button>
          `)}
        </div>
        <div class="view-pills">
          <button class="view-pill ${this._viewMode === 'grid' ? 'active' : ''}"
            @click=${() => { this._viewMode = 'grid'; }} title="Grid view">⊞</button>
          <button class="view-pill ${this._viewMode === 'list' ? 'active' : ''}"
            @click=${() => { this._viewMode = 'list'; }} title="List view">≡</button>
        </div>
        <button class="bulk-toggle-btn ${this._bulkMode ? 'active' : ''}"
          @click=${() => {
            this._bulkMode = !this._bulkMode;
            if (!this._bulkMode) this._selectedDevices = new Set();
          }} title="Bulk select">☑</button>
        <button class="glow-toggle-btn ${this._glowEnabled ? 'active' : ''}"
          @click=${() => { this._glowEnabled = !this._glowEnabled; }}
          title="${this._glowEnabled ? 'Glow: ON — click to turn off' : 'Glow: OFF — click to turn on'}">✦</button>
      </div>
    `;
  }

  private _renderBulkActions(): TemplateResult {
    return html`
      <div class="bulk-bar">
        <span class="bulk-count">${this._selectedDevices.size} selected</span>
        <button class="tog sm on" @click=${() => this._bulkToggle(true)}>All ON</button>
        <button class="tog sm off" @click=${() => this._bulkToggle(false)}>All OFF</button>
        <button class="tog sm off" style="margin-left:auto"
          @click=${() => { this._selectedDevices = new Set(); }}>Clear</button>
      </div>
    `;
  }

  private _renderPowerBar(device: ShellyHADevice): TemplateResult {
    if (!this._config.show_power_bar) return html``;
    const power = this._getPower(device) ?? 0;
    const maxW = this._config.power_bar_max ?? 2000;
    const pct = Math.min(100, (power / maxW) * 100);
    return html`
      <div class="power-bar" title="${power.toFixed(0)} W">
        <div class="power-bar-fill" style="width:${pct}%"></div>
      </div>
    `;
  }

  private _renderListRow(device: ShellyHADevice): TemplateResult {
    const online = this._isOnline(device);
    const power = this._getPower(device);
    const sw = this._getPrimarySwitch(device);
    const trv = this._getTrv(device);
    const valve = this._getValve(device);
    const profile = getDeviceProfile(device);
    const alerts = this._getAlerts(device);
    const isExpanded = this._expandedDevice === device.device_id;
    const isSelected = this._selectedDevices.has(device.device_id);
    const tileSize = this._config.tile_size ?? 'md';

    return html`
      <div
        class="list-row ${!online ? 'offline' : ''} ${isSelected ? 'selected' : ''} row-${tileSize}"
        @click=${(e: Event) => this._clickTile(device, e)}
      >
        ${this._bulkMode ? html`
          <input type="checkbox" class="bulk-check"
            .checked=${isSelected}
            @click=${(e: Event) => { e.stopPropagation(); this._toggleBulkSelect(device.device_id); }}
          />
        ` : nothing}
        <span class="dot ${online ? 'online' : 'offline'}"></span>
        <span class="list-name">${device.name}</span>
        <div class="list-center">
          ${profile.label ? html`<span class="type-badge type-${profile.type}">${profile.label}</span>` : nothing}
          ${alerts.map((a) => html`<span class="alert-badge alert-${a}">${a === 'overtemp' ? '🌡' : '⚡'}!</span>`)}
        </div>
        ${power != null ? html`<span class="list-power">${formatPower(power)}</span>` : nothing}
        <div class="list-ctrl" @click=${(e: Event) => e.stopPropagation()}>
          ${sw ? html`
            <button class="tog sm ${sw.isOn ? 'on' : 'off'}"
              @click=${(e: Event) => this._toggle(sw.entityId, sw.isOn, e)}>
              ${sw.isOn ? 'ON' : 'OFF'}
            </button>
          ` : trv ? html`
            <span class="list-temp">${trv.currentTemp ?? '—'}°→${trv.targetTemp ?? '—'}°</span>
          ` : valve ? html`
            <button class="tog sm ${valve.state === 'open' ? 'on' : 'off'}"
              @click=${(e: Event) => this._valveAction(valve.entityId, valve.state === 'open' ? 'close' : 'open', e)}>
              ${valve.state === 'open' ? 'OPEN' : valve.state === 'closed' ? 'CLOSED' : valve.state.toUpperCase()}
            </button>
          ` : nothing}
        </div>
        <button class="list-expand ${isExpanded ? 'active' : ''}"
          @click=${(e: Event) => this._expandTile(device.device_id, e)} title="Details">›</button>
      </div>
      ${isExpanded ? html`
        <div class="list-detail" @click=${(e: Event) => e.stopPropagation()}>
          ${this._renderExpanded(device)}
        </div>
      ` : nothing}
    `;
  }

  // ─── Styles ─────────────────────────────────────────────────────────────────

  static styles = css`
    /* ── All overridable tokens (card-mod targets :host) ──────────────────
     *
     * Dark theme defaults are set here. Override any via card-mod:
     *   card_mod:
     *     style: |
     *       :host {
     *         --sc-header-bg: linear-gradient(135deg, #1e3a5f, #1e40af);
     *         --sc-tile-bg: rgba(0,0,0,.04);
     *         --sc-text-primary: #111827;
     *       }
     * ─────────────────────────────────────────────────────────────────── */
    :host {
      /* Brand */
      --shelly-orange: #f4601e;
      --shelly-glow:   rgba(244, 96, 30, 0.35);
      --tile-radius:   12px;

      /* Header */
      --sc-header-bg:      linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      --sc-header-orb2:    #3b82f6;
      --sc-header-text:    #ffffff;

      /* Status indicators */
      --sc-online-color:   #4ade80;
      --sc-online-bg:      rgba(74, 222, 128, 0.2);
      --sc-online-border:  rgba(74, 222, 128, 0.3);
      --sc-online-glow:    rgba(74, 222, 128, 0.4);
      --sc-power-color:    #fb923c;
      --sc-offline-dot:    #4b5563;

      /* Tile surfaces */
      --sc-tile-bg:            rgba(255, 255, 255, 0.04);
      --sc-tile-border:        rgba(255, 255, 255, 0.07);
      --sc-tile-hover-bg:      rgba(255, 255, 255, 0.07);
      --sc-tile-hover-shadow:  rgba(0, 0, 0, 0.30);
      --sc-tile-expanded-bg:   rgba(255, 255, 255, 0.06);
      --sc-area-hover-bg:      rgba(255, 255, 255, 0.03);
      --sc-sensor-bg:          rgba(255, 255, 255, 0.04);

      /* Text */
      --sc-text-primary:   #e5e7eb;
      --sc-text-secondary: #9ca3af;
      --sc-text-muted:     #6b7280;
      --sc-text-value:     #f9fafb;
      --sc-text-detail:    #d1d5db;

      /* Toggle OFF state */
      --sc-tog-off-bg:     rgba(255, 255, 255, 0.08);
      --sc-tog-off-border: rgba(255, 255, 255, 0.10);

      /* Firmware update accent */
      --sc-update-color:   #f59e0b;
      --sc-update-glow:    rgba(245, 158, 11, 0.40);
    }

    ha-card {
      overflow: hidden;
      background: var(--ha-card-background, var(--card-background-color, #1c1c1e));
      container-type: inline-size;
      container-name: shelly-card;
    }

    /* ── Animated header background ─────────────────────────────────────── */
    .dash-header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px 14px;
      background: var(--sc-header-bg);
      overflow: hidden;
    }

    .dash-header::before,
    .dash-header::after {
      content: '';
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.5;
      animation: drift 8s ease-in-out infinite alternate;
    }
    .dash-header::before {
      width: 120px; height: 120px;
      background: var(--shelly-orange);
      top: -40px; left: -20px;
    }
    .dash-header::after {
      width: 100px; height: 100px;
      background: var(--sc-header-orb2);
      bottom: -30px; right: 20px;
      animation-delay: -4s;
    }

    @keyframes drift {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(15px, 8px) scale(1.15); }
    }

    .dash-title {
      font-size: 1.15em;
      font-weight: 800;
      color: var(--sc-header-text);
      letter-spacing: 0.02em;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dash-title::before { content: '⚡'; font-size: 1em; }

    .dash-stats {
      display: flex;
      gap: 8px;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .stat {
      font-size: 0.8em;
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }
    .stat.online {
      background: var(--sc-online-bg);
      color: var(--sc-online-color);
      border: 1px solid var(--sc-online-border);
    }
    .stat.power {
      background: color-mix(in srgb, var(--shelly-orange) 20%, transparent);
      color: var(--sc-power-color);
      border: 1px solid color-mix(in srgb, var(--shelly-orange) 30%, transparent);
    }

    /* ── Body ───────────────────────────────────────────────────────────── */
    .dash-body { padding: 0 0 8px; }

    .empty {
      padding: 32px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .empty .hint { font-size: 0.85em; margin-top: 4px; }

    /* ── Area sections ──────────────────────────────────────────────────── */
    .area-section {
      position: relative;
      overflow: hidden;
      margin: 6px 10px 2px;
      border: 1px solid var(--sc-tile-border);
      border-radius: 10px;
    }

    .area-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--area-header-bg, rgba(255,255,255,0.04));
      padding: 8px 14px;
      cursor: pointer;
      user-select: none;
      border-radius: 10px;
      transition: background 0.15s, filter 0.15s;
    }
    .area-header:hover { filter: brightness(1.08); }
    .area-section:not(.closed) .area-header {
      border-radius: 10px 10px 0 0;
      border-bottom: 1px solid var(--sc-tile-border);
    }

    .area-name {
      font-size: var(--area-name-size, 0.78em);
      font-weight: var(--area-name-weight, 700);
      font-style: var(--area-name-style, normal);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--area-header-color, var(--shelly-orange));
    }

    .area-meta { display: flex; align-items: center; gap: 8px; }
    .area-count { font-size: 0.75em; color: var(--secondary-text-color); }
    .area-power { font-size: 0.78em; font-weight: 600; color: var(--sc-power-color); }

    .chevron {
      font-size: 0.6em;
      color: var(--secondary-text-color);
      transition: transform 0.25s ease;
      display: inline-block;
    }
    .chevron.open { transform: rotate(180deg); }

    /* ── Device grid ────────────────────────────────────────────────────── */
    .device-grid {
      display: grid;
      grid-template-columns: repeat(var(--cols, 3), 1fr);
      gap: 10px;
      padding: 4px 12px 14px;
    }
    @container shelly-card (max-width: 600px) { .device-grid { --cols: 2; } }
    @container shelly-card (max-width: 380px) { .device-grid { --cols: 1; } }

    /* ── Device tile ────────────────────────────────────────────────────── */
    .tile {
      background: var(--sc-tile-bg);
      border: 1px solid var(--sc-tile-border);
      border-radius: var(--tile-radius);
      padding: 11px 13px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s;
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
      overflow: hidden;
    }

    .tile::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--shelly-orange), transparent);
      opacity: 0;
      transition: opacity 0.2s;
    }

    .tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px var(--sc-tile-hover-shadow);
      background: var(--sc-tile-hover-bg);
    }
    .tile:hover::before { opacity: 1; }

    .tile.offline { opacity: 0.45; filter: grayscale(0.4); }

    .tile.expanded {
      grid-column: 1 / -1;
      background: var(--sc-tile-expanded-bg);
      border-color: var(--shelly-orange);
      box-shadow: 0 0 0 1px var(--shelly-orange), 0 8px 24px var(--shelly-glow);
      transform: none;
    }
    .tile.expanded::before { opacity: 1; }

    .tile.glow-on { box-shadow: 0 0 12px var(--shelly-glow); }

    /* Full-width brightness row below tile-bot for dimmable devices */
    .tile-dim-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 2px 0 0;
    }

    .tile-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      min-width: 0;
    }

    .tile-left {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex: 1;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot.online {
      background: var(--sc-online-color);
      box-shadow: 0 0 0 0 var(--sc-online-glow);
      animation: pulse-dot 2.5s ease-in-out infinite;
    }
    .dot.offline { background: var(--sc-offline-dot); }

    @keyframes pulse-dot {
      0%   { box-shadow: 0 0 0 0 var(--sc-online-glow); }
      60%  { box-shadow: 0 0 0 5px transparent; }
      100% { box-shadow: 0 0 0 0 var(--sc-online-glow); }
    }

    .tile-name {
      font-size: 0.88em;
      font-weight: 600;
      color: var(--sc-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .update-dot {
      color: var(--sc-update-color);
      font-size: 0.55em;
      flex-shrink: 0;
      animation: blink 2s step-end infinite;
    }
    @keyframes blink { 50% { opacity: 0.3; } }

    .tile-bot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      min-width: 0;
    }

    .tile-power {
      font-size: 0.95em;
      font-weight: 700;
      color: var(--sc-power-color);
      font-variant-numeric: tabular-nums;
    }

    .tile-model {
      font-size: 0.68em;
      color: var(--sc-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
    }

    /* ── Toggle button ──────────────────────────────────────────────────── */
    .tog {
      padding: 4px 11px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.72em;
      font-weight: 700;
      letter-spacing: 0.05em;
      flex-shrink: 0;
      transition: transform 0.1s, opacity 0.15s, box-shadow 0.15s;
      position: relative;
      overflow: hidden;
    }
    .tog::after {
      content: '';
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .tog:active::after { opacity: 0.15; }
    .tog.sm { padding: 2px 9px; font-size: 0.68em; }

    .tog.on {
      background: linear-gradient(135deg, var(--shelly-orange), color-mix(in srgb, var(--shelly-orange) 70%, #f97316));
      color: white;
      box-shadow: 0 2px 8px var(--shelly-glow);
    }
    .tog.off {
      background: var(--sc-tog-off-bg);
      color: var(--sc-text-secondary);
      border: 1px solid var(--sc-tog-off-border);
    }
    .tog.update {
      background: linear-gradient(135deg, var(--sc-update-color), color-mix(in srgb, var(--sc-update-color) 60%, #f97316));
      color: white;
      box-shadow: 0 2px 6px var(--sc-update-glow);
    }
    .tog:hover { opacity: 0.85; transform: scale(1.04); }
    .tog:active { transform: scale(0.96); }

    /* ── Expanded detail ────────────────────────────────────────────────── */
    .expanded {
      margin-top: 10px;
      border-top: 1px solid color-mix(in srgb, var(--shelly-orange) 25%, transparent);
      padding-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
      animation: slide-in 0.2s ease;
    }

    @keyframes slide-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .exp-section { flex: 1; min-width: 140px; }
    .exp-section--full { flex: 1 1 100%; min-width: 0; }

    /* ── All Entities list ──────────────────────────────────────────── */
    .ent-list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      padding: 4px 0;
    }
    .ent-list-header:hover .exp-label { color: var(--sc-text-detail); }

    .ent-caret {
      font-size: 0.65em;
      color: var(--sc-text-muted);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .ent-caret.open { transform: rotate(180deg); }

    .ent-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 6px;
    }

    .ent-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 6px;
      background: var(--sc-tile-bg);
      min-height: 28px;
    }

    .ent-domain {
      font-size: 0.62em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      min-width: 72px;
      flex-shrink: 0;
      opacity: 0.9;
    }

    .ent-name {
      font-size: 0.82em;
      color: var(--sc-text-detail);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ent-state {
      font-size: 0.78em;
      color: var(--sc-text-secondary);
      font-family: monospace;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .exp-label {
      font-size: 0.68em;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--sc-text-muted);
      margin-bottom: 7px;
      font-weight: 600;
    }

    .exp-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 3px 0;
    }

    .exp-name {
      font-size: 0.84em;
      color: var(--sc-text-detail);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex-shrink: 0;
      max-width: 40%;
    }

    /* ── Dimmer horizontal slider ────────────────────────────────────── */
    /* Used both in .tile-dim-row (tile face) and .dim-wrap (expanded view) */
    .dim-wrap {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .dim-slider {
      flex: 1;
      min-width: 0;
      cursor: pointer;
      accent-color: var(--shelly-orange);
      background: transparent;
      padding: 0;
    }
    .dim-slider:disabled { opacity: 0.3; cursor: default; }
    .white-slider { accent-color: #e8e8e8; }
    .white-icon {
      font-size: 0.65em;
      font-weight: 700;
      color: var(--sc-text-secondary);
      min-width: 12px;
      flex-shrink: 0;
      letter-spacing: -0.02em;
    }

    .dim-pct {
      font-size: 0.68em;
      font-weight: 600;
      color: var(--sc-text-secondary);
      font-variant-numeric: tabular-nums;
      text-align: right;
      min-width: 30px;
      flex-shrink: 0;
    }

    /* ── Channels: left-to-right card layout ────────────────────────── */
    .exp-section--channels { flex-basis: 100%; }

    .channels-wrap {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
    }

    .channel-card {
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding: 8px 10px;
      background: var(--sc-sensor-bg);
      border-radius: 10px;
      min-width: 130px;
      flex: 1;
    }

    .channel-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .channel-name {
      font-size: 0.84em;
      font-weight: 600;
      color: var(--sc-text-detail);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex: 1;
    }

    .channel-color-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .channel-color-label {
      font-size: 0.7em;
      color: var(--sc-text-muted);
      flex-shrink: 0;
    }

    /* ── Color picker swatch ─────────────────────────────────────────── */
    .color-swatch {
      width: 34px;
      height: 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      padding: 1px;
      background: transparent;
      flex-shrink: 0;
    }
    .color-swatch:disabled { opacity: 0.3; cursor: default; }

    /* Tile-face swatch — taller to align with the range slider thumb */
    .tile-color-swatch {
      width: 30px;
      height: 20px;
      border-radius: 5px;
    }

    .sensor-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .sensor-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--sc-sensor-bg);
      border-radius: 20px;
      padding: 4px 10px;
      white-space: nowrap;
    }

    .sensor-label {
      font-size: 0.65em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--sc-text-muted);
    }

    .sensor-value {
      font-size: 0.85em;
      font-weight: 600;
      color: var(--sc-text-value);
      font-variant-numeric: tabular-nums;
    }
    .sensor-value.warn { color: var(--error-color, #ef4444); }

    .exp-actions {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      flex: 1;
      min-width: 100px;
      padding-top: 4px;
    }

    .exp-link {
      font-size: 0.8em;
      color: var(--shelly-orange);
      text-decoration: none;
      padding: 4px 10px;
      border: 1px solid color-mix(in srgb, var(--shelly-orange) 30%, transparent);
      border-radius: 6px;
      transition: background 0.15s;
    }
    .exp-link:hover {
      background: color-mix(in srgb, var(--shelly-orange) 10%, transparent);
      text-decoration: none;
    }

    /* ── TRV (Thermostatic Radiator Valve) ──────────────────────────── */

    /* Tile face — compact row */
    .tile-trv-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 2px 0 0;
    }

    .trv-temps {
      display: flex;
      align-items: baseline;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .trv-cur {
      font-size: 0.82em;
      color: var(--sc-text-secondary);
      font-variant-numeric: tabular-nums;
    }

    .trv-sep {
      font-size: 0.7em;
      color: var(--sc-text-muted);
    }

    .trv-target {
      font-size: 0.95em;
      font-weight: 700;
      color: var(--sc-text-value);
      font-variant-numeric: tabular-nums;
    }
    .trv-target.heating { color: var(--shelly-orange); }

    .trv-flame { font-size: 0.75em; flex-shrink: 0; }

    .trv-valve-pct {
      font-size: 0.7em;
      color: var(--sc-text-muted);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .trv-step-btns {
      display: flex;
      gap: 3px;
      flex-shrink: 0;
    }

    .trv-step {
      width: 22px;
      height: 22px;
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      background: var(--sc-tog-off-bg);
      color: var(--sc-text-secondary);
      font-size: 1em;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      line-height: 1;
    }
    .trv-step:hover { background: var(--shelly-orange); color: white; border-color: var(--shelly-orange); }
    .trv-step:active { transform: scale(0.92); }

    /* Expanded section */
    .exp-section--trv { flex-basis: 100%; min-width: unset; }

    .trv-ctrl-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }

    .trv-big-btn {
      width: 36px;
      height: 36px;
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 50%;
      background: var(--sc-tog-off-bg);
      color: var(--sc-text-primary);
      font-size: 1.3em;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
    }
    .trv-big-btn:hover { background: var(--shelly-orange); color: white; border-color: var(--shelly-orange); }
    .trv-big-btn:active { transform: scale(0.92); }

    .trv-display {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }

    .trv-target-big {
      font-size: 1.8em;
      font-weight: 700;
      color: var(--sc-text-primary);
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .trv-current-sub {
      font-size: 0.78em;
      color: var(--sc-text-secondary);
      font-variant-numeric: tabular-nums;
    }

    .trv-action-badge {
      font-size: 0.65em;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 10px;
    }
    .trv-action-badge.heating { background: color-mix(in srgb, var(--shelly-orange) 20%, transparent); color: var(--shelly-orange); }
    .trv-action-badge.idle    { background: var(--sc-sensor-bg); color: var(--sc-text-muted); }

    .trv-range-lbl {
      font-size: 0.68em;
      color: var(--sc-text-muted);
      flex-shrink: 0;
    }

    .trv-mode-row {
      display: flex;
      gap: 6px;
      margin-bottom: 6px;
    }

    .tile-valve-body {
      padding: 4px 0 4px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tile-valve-body .trv-mode-row {
      gap: 4px;
      margin-bottom: 0;
    }

    .tile-valve-ename {
      font-size: 11px;
      color: var(--sc-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tile-valve-temp {
      font-size: 13px;
      font-weight: 500;
      color: var(--sc-text-primary);
    }

    .trv-preset-row {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 6px;
    }

    .trv-preset { text-transform: capitalize; }

    .trv-valve-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .trv-valve-bar {
      flex: 1;
      height: 6px;
      background: var(--sc-sensor-bg);
      border-radius: 3px;
      overflow: hidden;
    }

    .trv-valve-fill {
      height: 100%;
      background: var(--shelly-orange);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    /* ── Cover / Roller controls ────────────────────────────────────────── */
    .cov-btns {
      display: flex;
      gap: 2px;
    }
    .cov-btn {
      background: var(--sc-tog-off-bg);
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      color: var(--sc-text-primary);
      cursor: pointer;
      font-size: 10px;
      padding: 3px 7px;
      line-height: 1;
      transition: background 0.15s;
    }
    .cov-btn:hover { background: rgba(255,255,255,.15); }
    .cov-btn.stop  { color: var(--sc-text-muted); }

    .cov-pos-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0 2px;
    }
    .cov-bar {
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,.10);
      border-radius: 3px;
      overflow: hidden;
    }
    .cov-fill {
      height: 100%;
      background: var(--shelly-orange);
      border-radius: 3px;
      transition: width 0.4s ease;
    }
    .cov-fill.moving {
      animation: pulse-bar 0.8s ease-in-out infinite alternate;
    }
    @keyframes pulse-bar {
      from { opacity: 1; }
      to   { opacity: 0.5; }
    }
    .cov-pct {
      font-size: 10px;
      color: var(--sc-text-secondary);
      min-width: 34px;
      text-align: right;
    }

    /* ── Device type + gen badges ───────────────────────────────────────── */
    .tile-badges {
      display: flex;
      gap: 4px;
      align-items: center;
      margin-left: auto;
    }
    .type-badge,
    .gen-badge {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.03em;
      padding: 2px 5px;
      border-radius: 4px;
      line-height: 1.4;
      white-space: nowrap;
    }

    /* Shelly UI quick-link on tile face */
    .tile-ui-link {
      font-size: 11px;
      font-weight: 700;
      color: var(--shelly-orange);
      text-decoration: none;
      padding: 1px 4px;
      border-radius: 4px;
      opacity: 0.75;
      transition: opacity 0.15s, background 0.15s;
      line-height: 1.4;
    }
    .tile-ui-link:hover {
      opacity: 1;
      background: rgba(244, 96, 30, 0.15);
    }

    /* Type badge colours */
    .type-relay        { background: rgba(99,102,241,.25);  color: #a5b4fc; }
    .type-dimmer       { background: rgba(234,179,8,.20);   color: #fde047; }
    .type-rgb          { background: rgba(236,72,153,.22);  color: #f9a8d4; }
    .type-plug         { background: rgba(34,197,94,.20);   color: #86efac; }
    .type-cover        { background: rgba(14,165,233,.20);  color: #7dd3fc; }
    .type-energy       { background: rgba(245,158,11,.22);  color: #fcd34d; }
    .type-sensor       { background: rgba(20,184,166,.20);  color: #5eead4; }
    .type-input        { background: rgba(168,85,247,.20);  color: #d8b4fe; }
    .type-trv          { background: rgba(239,68,68,.22);   color: #fca5a5; }

    /* ── Input channels (i3 / i4) ───────────────────────────────────────── */
    .tile-inputs {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      padding: 4px 0 2px;
    }
    .input-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px 4px 8px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.05);
      font-size: 12px;
      color: var(--sc-text-muted);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .input-chip.active {
      background: rgba(255,106,0,0.20);
      color: var(--shelly-orange);
      border-color: rgba(255,106,0,0.40);
    }
    .input-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
    .input-lbl { font-weight: 600; }

    /* Expanded inputs section */
    .input-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }
    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .input-row-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--sc-text-muted);
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .input-row-dot.active { background: var(--shelly-orange); }
    .input-row-name {
      flex: 1;
      font-size: 13px;
      color: var(--sc-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .input-row-state {
      font-size: 11px;
      font-weight: 600;
      color: var(--sc-text-muted);
      letter-spacing: 0.04em;
    }
    .input-row-state.active { color: var(--shelly-orange); }
    .type-wall_display { background: rgba(99,102,241,.25);  color: #c4b5fd; }
    .type-uni          { background: rgba(156,163,175,.20); color: #d1d5db; }
    .type-unknown      { display: none; }

    /* Gen badge colours */
    .gen-1   { background: rgba(107,114,128,.25); color: #9ca3af; }
    .gen-2   { background: rgba(59,130,246,.22);  color: #93c5fd; }
    .gen-3   { background: rgba(34,197,94,.20);   color: #86efac; }
    .gen-4   { background: rgba(168,85,247,.20);  color: #d8b4fe; }
    .gen-ble { background: rgba(6,182,212,.20);   color: #67e8f9; }

    /* ── Enhanced on-state glow animation ───────────────────────────────── */
    .tile.glow-on {
      animation: pulse-glow 3s ease-in-out infinite;
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 8px var(--shelly-glow); }
      50%       { box-shadow: 0 0 20px var(--shelly-glow), 0 0 32px var(--shelly-glow); }
    }
    /* expanded tiles don't pulse — they have their own ring */
    .tile.expanded.glow-on { animation: none; box-shadow: 0 0 0 1px var(--shelly-orange), 0 8px 24px var(--shelly-glow); }

    /* ── Tile sizes ──────────────────────────────────────────────────────── */
    .tile.tile-sm { padding: 7px 9px; gap: 4px; }
    .tile.tile-sm .tile-name  { font-size: 0.78em; }
    .tile.tile-sm .tile-power { font-size: 0.82em; }
    .tile.tile-lg { padding: 15px 17px; gap: 9px; }
    .tile.tile-lg .tile-name  { font-size: 1em; }
    .tile.tile-lg .tile-power { font-size: 1.1em; }

    /* ── Bulk select ─────────────────────────────────────────────────────── */
    .bulk-check {
      width: 15px;
      height: 15px;
      accent-color: var(--shelly-orange);
      cursor: pointer;
      flex-shrink: 0;
    }
    .tile.selected {
      border-color: var(--shelly-orange) !important;
      background: color-mix(in srgb, var(--shelly-orange) 8%, var(--sc-tile-bg));
    }
    .list-row.selected {
      border-color: var(--shelly-orange);
      background: color-mix(in srgb, var(--shelly-orange) 8%, var(--sc-tile-bg));
    }

    /* ── Alert badges ────────────────────────────────────────────────────── */
    .alert-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 4px;
      white-space: nowrap;
      animation: blink 1.5s step-end infinite;
    }
    .alert-overtemp { background: rgba(251,146,60,.25); color: #fdba74; }
    .alert-overpower { background: rgba(239,68,68,.25); color: #fca5a5; }

    /* ── Mini power bar ──────────────────────────────────────────────────── */
    .power-bar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: rgba(255,255,255,.06);
      border-radius: 0 0 var(--tile-radius) var(--tile-radius);
      overflow: hidden;
    }
    .power-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--shelly-orange), #f97316);
      border-radius: inherit;
      transition: width 0.4s ease;
    }

    /* ── Sparkline graphs ────────────────────────────────────────────────── */
    .sparklines-block {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 8px 2px;
    }
    .spark-row {
      display: flex;
      align-items: center;
      gap: 6px;
      min-height: 32px;
    }
    .spark-lbl {
      font-size: 0.62em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--sc-text-muted);
      width: 34px;
      flex-shrink: 0;
      text-align: right;
    }
    .sparkline-svg {
      flex: 1;
      height: 32px;
      display: block;
    }
    .spark-val {
      font-size: 0.75em;
      font-weight: 600;
      color: var(--sc-text-secondary);
      white-space: nowrap;
      min-width: 44px;
      text-align: right;
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    .sparkline-loading {
      flex: 1;
      height: 32px;
      border-radius: 4px;
      background: linear-gradient(90deg,
        rgba(255,255,255,.03) 0%,
        rgba(255,255,255,.08) 50%,
        rgba(255,255,255,.03) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.6s ease-in-out infinite;
    }

    /* ── Expand button (tile_click=toggle mode) ──────────────────────────── */
    .tile-expand-btn {
      background: transparent;
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 5px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.8em;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.15s;
      line-height: 1;
    }
    .tile-expand-btn:hover { color: var(--shelly-orange); border-color: var(--shelly-orange); }
    .tile-expand-btn.active { color: var(--shelly-orange); border-color: var(--shelly-orange); }

    /* ── Search bar ──────────────────────────────────────────────────────── */
    .search-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px 6px;
      border-bottom: 1px solid var(--sc-tile-border);
    }
    .search-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--sc-tile-bg);
      border: 1px solid var(--sc-tile-border);
      border-radius: 8px;
      padding: 4px 8px;
      min-width: 0;
    }
    .search-icon { font-size: 0.75em; flex-shrink: 0; }
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--sc-text-primary);
      font-size: 0.82em;
      min-width: 0;
    }
    .search-input::placeholder { color: var(--sc-text-muted); }
    .search-input::-webkit-search-cancel-button { display: none; }
    .search-clear {
      background: transparent;
      border: none;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.72em;
      padding: 0 2px;
      line-height: 1;
      flex-shrink: 0;
    }
    .sort-pills, .view-pills {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
    }
    .sort-pill, .view-pill {
      background: var(--sc-tog-off-bg);
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.7em;
      font-weight: 700;
      padding: 3px 7px;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .sort-pill.active, .view-pill.active {
      background: color-mix(in srgb, var(--shelly-orange) 20%, transparent);
      color: var(--shelly-orange);
      border-color: color-mix(in srgb, var(--shelly-orange) 40%, transparent);
    }
    .sort-pill:hover, .view-pill:hover { opacity: 0.8; }
    .bulk-toggle-btn {
      background: var(--sc-tog-off-bg);
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.85em;
      padding: 3px 7px;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .bulk-toggle-btn.active {
      background: color-mix(in srgb, var(--shelly-orange) 20%, transparent);
      color: var(--shelly-orange);
      border-color: color-mix(in srgb, var(--shelly-orange) 40%, transparent);
    }
    .glow-toggle-btn {
      background: var(--sc-tog-off-bg);
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.8em;
      padding: 3px 7px;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .glow-toggle-btn.active {
      background: color-mix(in srgb, var(--shelly-orange) 20%, transparent);
      color: var(--shelly-orange);
      border-color: color-mix(in srgb, var(--shelly-orange) 40%, transparent);
    }

    /* ── Bulk actions bar ────────────────────────────────────────────────── */
    .bulk-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: color-mix(in srgb, var(--shelly-orange) 10%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--shelly-orange) 25%, transparent);
    }
    .bulk-count {
      font-size: 0.78em;
      color: var(--shelly-orange);
      font-weight: 700;
      flex: 1;
    }

    /* ── Header stat variants ────────────────────────────────────────────── */
    .stat.offline-count {
      background: rgba(75,85,99,.25);
      color: #9ca3af;
      border: 1px solid rgba(75,85,99,.35);
    }
    .stat.alerts-count {
      background: rgba(239,68,68,.2);
      color: #fca5a5;
      border: 1px solid rgba(239,68,68,.3);
      animation: blink 2s step-end infinite;
    }

    /* ── List view ───────────────────────────────────────────────────────── */
    .device-list {
      display: flex;
      flex-direction: column;
      padding: 4px 12px 8px;
      gap: 3px;
    }
    .list-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      background: var(--sc-tile-bg);
      border: 1px solid var(--sc-tile-border);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      min-width: 0;
    }
    .list-row:hover { background: var(--sc-tile-hover-bg); }
    .list-row.offline { opacity: 0.5; }
    .list-name {
      font-size: 0.85em;
      font-weight: 600;
      color: var(--sc-text-primary);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .list-center {
      display: flex;
      gap: 4px;
      align-items: center;
      flex-shrink: 0;
    }
    .list-power {
      font-size: 0.82em;
      font-weight: 700;
      color: var(--sc-power-color);
      font-variant-numeric: tabular-nums;
      min-width: 50px;
      text-align: right;
      flex-shrink: 0;
    }
    .list-ctrl {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .list-temp {
      font-size: 0.78em;
      color: var(--sc-text-secondary);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .list-expand {
      background: transparent;
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 5px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 1.1em;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.15s;
      line-height: 1;
    }
    .list-expand:hover { background: var(--sc-tile-hover-bg); color: var(--sc-text-primary); }
    .list-expand.active { color: var(--shelly-orange); border-color: var(--shelly-orange); transform: rotate(90deg); }
    .list-detail {
      padding: 0 10px 6px 28px;
    }
    /* List row sizes */
    .list-row.row-sm { padding: 5px 8px; }
    .list-row.row-sm .list-name { font-size: 0.78em; }
    .list-row.row-lg { padding: 10px 14px; }
    .list-row.row-lg .list-name { font-size: 0.92em; }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'shelly-dashboard-card': ShellyDashboardCard;
  }
}
