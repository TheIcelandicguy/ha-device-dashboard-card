import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { ShellyDashboardConfig, AreaStyle } from './types';
import { getShellyEntities, groupShellyByDevice, getAllDevices } from './helpers';

@customElement('shelly-card-editor')
export class ShellyCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: ShellyDashboardConfig;
  @state() private _bgEditArea: string | null = null;
  @state() private _openSections: Set<string> = new Set(['rooms']);

  private _toggleSection(id: string) {
    const next = new Set(this._openSections);
    if (next.has(id)) next.delete(id); else next.add(id);
    this._openSections = next;
  }

  setConfig(config: ShellyDashboardConfig) {
    this._config = config;
  }

  private _valueChanged(key: string, value: unknown) {
    if (!this._config) return;
    const updated = { ...this._config, [key]: value };
    if (value === '' || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete (updated as Record<string, unknown>)[key];
    }
    fireEvent(this, 'config-changed', { config: updated });
  }

  private _toggleArea(areaName: string, currentAreas: string[]) {
    const next = currentAreas.includes(areaName)
      ? currentAreas.filter((a) => a !== areaName)
      : [...currentAreas, areaName];
    this._valueChanged('areas', next);
  }

  private _toggleSensor(key: string, currentSensors: string[]) {
    const next = currentSensors.includes(key)
      ? currentSensors.filter((s) => s !== key)
      : [...currentSensors, key];
    this._valueChanged('sensors', next);
  }

  private _toggleGraph(key: string, current: string[]) {
    const next = current.includes(key)
      ? current.filter((s) => s !== key)
      : [...current, key];
    this._valueChanged('graph_sensors', next);
  }

  private static readonly GRAPH_TYPES = [
    { key: 'temperature',    label: 'Temperature' },
    { key: 'humidity',       label: 'Humidity' },
    { key: 'power',          label: 'Power' },
    { key: 'energy',         label: 'Energy (kWh)' },
    { key: 'voltage',        label: 'Voltage' },
    { key: 'current',        label: 'Current' },
    { key: 'apparent_power', label: 'App. Power' },
    { key: 'illuminance',    label: 'Illuminance' },
    { key: 'carbon_dioxide', label: 'CO₂' },
    { key: 'battery',        label: 'Battery' },
  ];

  private _getDiscoveredDevices(): Array<{ device_id: string; name: string; area?: string }> {
    if (!this.hass) return [];
    const c = this._config as ShellyDashboardConfig;
    let raw = c.include_all
      ? getAllDevices(this.hass)
      : groupShellyByDevice(this.hass, getShellyEntities(this.hass));
    // If areas are filtered, only show devices from those areas
    const areaFilter = c.areas;
    if (areaFilter && areaFilter.length > 0) {
      const normalized = new Set(areaFilter.map((a) => a.toLowerCase()));
      raw = raw.filter((d) => normalized.has((d.area ?? '').toLowerCase()));
    }
    return raw
      .map((d) => ({ device_id: d.device_id, name: d.name, area: d.area }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private _triggerBgImageUpload(areaName: string) {
    const input = this.renderRoot.querySelector(
      `input[data-area-upload="${areaName}"]`
    ) as HTMLInputElement | null;
    input?.click();
  }

  private _handleBgImageUpload(areaName: string, e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this._setAreaStyle(areaName, 'bgImage', reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected if needed
    (e.target as HTMLInputElement).value = '';
  }

  private _toggleHiddenDevice(deviceId: string, current: string[]) {
    const next = current.includes(deviceId)
      ? current.filter((id) => id !== deviceId)
      : [...current, deviceId];
    this._valueChanged('hidden_devices', next);
  }

  private _renderDevicePicker(hiddenIds: string[]): TemplateResult {
    const devices = this._getDiscoveredDevices();
    if (!devices.length) {
      return html`<p class="hint">No devices discovered yet.</p>`;
    }
    return html`
      <div class="area-picker">
        ${devices.map((d) => {
          const isHidden = hiddenIds.includes(d.device_id);
          return html`
            <div
              class="area-chip ${isHidden ? 'hidden-chip' : ''}"
              title=${d.area ? `Area: ${d.area}` : 'No area assigned'}
              @click=${() => this._toggleHiddenDevice(d.device_id, hiddenIds)}
            >${d.name}${isHidden ? html` <span class="chip-x">✕</span>` : nothing}</div>
          `;
        })}
      </div>
    `;
  }

  private _setAreaStyle(areaName: string, key: keyof AreaStyle, value: string | number | undefined) {
    const c = this._config as ShellyDashboardConfig;
    const current: AreaStyle = { ...(c.area_styles?.[areaName] ?? {}) };
    if (value === undefined || value === '' || value === 0) {
      delete current[key];
    } else {
      (current as Record<string, unknown>)[key] = value;
    }
    const all = { ...(c.area_styles ?? {}) };
    if (Object.keys(current).length > 0) {
      all[areaName] = current;
    } else {
      delete all[areaName];
    }
    this._valueChanged('area_styles', Object.keys(all).length > 0 ? all : undefined);
  }

  private _clearAreaStyleKeys(areaName: string, keys: Array<keyof AreaStyle>) {
    const c = this._config as ShellyDashboardConfig;
    const current: AreaStyle = { ...(c.area_styles?.[areaName] ?? {}) };
    for (const key of keys) delete current[key];
    const all = { ...(c.area_styles ?? {}) };
    if (Object.keys(current).length > 0) {
      all[areaName] = current;
    } else {
      delete all[areaName];
    }
    this._valueChanged('area_styles', Object.keys(all).length > 0 ? all : undefined);
  }

  private _clearAreaStyle(areaName: string) {
    const c = this._config as ShellyDashboardConfig;
    const all = { ...(c.area_styles ?? {}) };
    delete all[areaName];
    this._valueChanged('area_styles', Object.keys(all).length > 0 ? all : undefined);
  }

  private static readonly SENSOR_GROUPS: Array<{ group: string; items: Array<{ key: string; label: string }> }> = [
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
        { key: 'rssi',           label: 'Wi-Fi Signal' },
        { key: 'uptime',         label: 'Uptime' },
        { key: 'ip',             label: 'IP Address' },
        { key: 'ssid',           label: 'SSID' },
        { key: 'fw_version',     label: 'Firmware Ver.' },
        { key: 'mac',            label: 'MAC Address' },
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

  private _renderSensorPicker(selectedSensors: string[]): TemplateResult {
    const allSelected = selectedSensors.length === 0;
    return html`
      <div class="area-picker">
        <div
          class="area-chip ${allSelected ? 'selected' : ''}"
          @click=${() => this._valueChanged('sensors', [])}
        >All sensors</div>
        ${ShellyCardEditor.SENSOR_GROUPS.map(({ group, items }) => html`
          <div class="chip-group-label">${group}</div>
          ${items.map(({ key, label }) => {
            const isSelected = selectedSensors.includes(key);
            return html`
              <div
                class="area-chip ${isSelected ? 'selected' : ''}"
                @click=${() => this._toggleSensor(key, selectedSensors)}
              >${label}</div>
            `;
          })}
        `)}
      </div>
    `;
  }

  private _getAreas(): Array<{ id: string; name: string }> {
    if (!this.hass) return [];
    return Object.values((this.hass as any).areas ?? {})
      .map((a: any) => ({ id: a.area_id, name: a.name as string }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private _textInput(label: string, key: string, value: string | undefined, placeholder = ''): TemplateResult {
    return html`
      <div class="field">
        <label>${label}</label>
        <input
          type="text"
          .value=${value ?? ''}
          placeholder=${placeholder}
          @change=${(e: Event) => this._valueChanged(key, (e.target as HTMLInputElement).value)}
        />
      </div>
    `;
  }

  private _toggle(label: string, key: string, value: boolean | undefined): TemplateResult {
    return html`
      <div class="field row">
        <label>${label}</label>
        <input
          type="checkbox"
          .checked=${value ?? false}
          @change=${(e: Event) => this._valueChanged(key, (e.target as HTMLInputElement).checked)}
        />
      </div>
    `;
  }

  private _numberInput(label: string, key: string, value: number | undefined, min = 1, max = 10): TemplateResult {
    return html`
      <div class="field">
        <label>${label}</label>
        <input
          type="number"
          min=${min}
          max=${max}
          .value=${String(value ?? '')}
          @change=${(e: Event) => {
            const v = parseInt((e.target as HTMLInputElement).value, 10);
            this._valueChanged(key, isNaN(v) ? undefined : v);
          }}
        />
      </div>
    `;
  }

  private _renderSection(id: string, title: string, content: TemplateResult, badge?: string): TemplateResult {
    const isOpen = this._openSections.has(id);
    return html`
      <div class="acc-section">
        <div class="acc-header ${isOpen ? 'open' : ''}" @click=${() => this._toggleSection(id)}>
          <span class="acc-title">${title}</span>
          ${badge ? html`<span class="acc-badge">${badge}</span>` : nothing}
          <span class="acc-chevron">▼</span>
        </div>
        ${isOpen ? html`<div class="acc-body">${content}</div>` : nothing}
      </div>
    `;
  }

  private _renderSensorGroupContent(groupKey: string, selectedSensors: string[]): TemplateResult {
    const group = ShellyCardEditor.SENSOR_GROUPS.find((g) => g.group === groupKey);
    if (!group) return html``;
    const groupSelected = group.items.filter((i) => selectedSensors.includes(i.key));
    return html`
      <p class="hint">Select which sensors to show. Leave all unselected to show all.</p>
      <div class="area-picker">
        ${group.items.map(({ key, label }) => html`
          <div class="area-chip ${selectedSensors.includes(key) ? 'selected' : ''}"
            @click=${() => this._toggleSensor(key, selectedSensors)}>${label}</div>
        `)}
      </div>
      ${groupSelected.length ? html`
        <button class="clear-btn" style="margin-top:6px"
          @click=${() => this._valueChanged('sensors',
            selectedSensors.filter((s) => !group.items.find((i) => i.key === s))
          )}>Clear group</button>
      ` : nothing}
    `;
  }

  private _renderAreaPicker(selectedAreas: string[]): TemplateResult {
    const areas = this._getAreas();
    if (!areas.length) {
      return html`<p class="hint">No areas found in Home Assistant.</p>`;
    }
    const allSelected = selectedAreas.length === 0;
    return html`
      <div class="area-picker">
        <div
          class="area-chip ${allSelected ? 'selected' : ''}"
          @click=${() => this._valueChanged('areas', [])}
        >All rooms</div>
        ${areas.map((area) => {
          const isSelected = selectedAreas.includes(area.name);
          return html`
            <div
              class="area-chip ${isSelected ? 'selected' : ''}"
              @click=${() => this._toggleArea(area.name, selectedAreas)}
            >${area.name}</div>
          `;
        })}
      </div>
    `;
  }

  protected render(): TemplateResult {
    if (!this._config) return html``;

    const c = this._config;
    const selectedAreas = c.areas ?? [];
    const selectedSensors = c.sensors ?? [];
    const allAreas = this._getAreas();
    const areaStyles = c.area_styles ?? {};
    const hiddenDevices = c.hidden_devices ?? [];

    // Badge helpers
    const roomsBadge = selectedAreas.length ? `${selectedAreas.length}` : 'All';
    const sensorBadge = (groupKey: string) => {
      const group = ShellyCardEditor.SENSOR_GROUPS.find((g) => g.group === groupKey)!;
      const n = group.items.filter((i) => selectedSensors.includes(i.key)).length;
      return n ? `${n}` : 'All';
    };
    const styledAreaCount = Object.keys(areaStyles).length;
    const hiddenBadge = hiddenDevices.length ? `${hiddenDevices.length}` : undefined;

    // Room Styles body (kept intact, just moved inside accordion)
    const roomStylesBody = html`
      <p class="hint">Pick a room to customise its background, text colour, and font.</p>
      ${allAreas.length ? html`
        <div class="area-picker">
          ${allAreas.map((area) => {
            const hasStyle = !!areaStyles[area.name];
            const isEditing = this._bgEditArea === area.name;
            return html`
              <div
                class="area-chip ${isEditing ? 'selected' : ''} ${hasStyle ? 'has-bg' : ''}"
                @click=${() => { this._bgEditArea = isEditing ? null : area.name; }}
              >${area.name}${hasStyle ? ' ●' : ''}</div>
            `;
          })}
        </div>

        ${this._bgEditArea ? (() => {
          const name = this._bgEditArea;
          const st: AreaStyle = areaStyles[name] ?? {};
          return html`
            <div class="area-bg-group">
              <div class="area-bg-label">${name}</div>

              <div class="style-group-label">Background</div>

              <div class="style-row">
                <span class="style-lbl">Color</span>
                <input type="color" class="style-color ${st.bgColor ? 'active' : ''}"
                  .value=${st.bgColor ?? '#ffffff'}
                  @change=${(e: Event) =>
                    this._setAreaStyle(name, 'bgColor', (e.target as HTMLInputElement).value)}
                />
                ${st.bgColor ? html`
                  <button class="style-clr" title="Clear"
                    @click=${() => this._setAreaStyle(name, 'bgColor', undefined)}>✕</button>
                ` : nothing}
                <span class="style-hint">${st.bgColor ?? 'default'}</span>
              </div>

              <div class="style-row style-row--full">
                <span class="style-lbl">Image</span>
                <input type="file" accept="image/*" hidden
                  data-area-upload="${name}"
                  @change=${(e: Event) => this._handleBgImageUpload(name, e)}
                />
                <button class="upload-btn" title="Upload image from device"
                  @click=${() => this._triggerBgImageUpload(name)}>
                  ↑ Upload
                </button>
                <input type="text" class="style-text"
                  .value=${st.bgImage?.startsWith('data:') ? '(embedded image)' : (st.bgImage ?? '')}
                  placeholder="/local/images/room.jpg or https://..."
                  @change=${(e: Event) => {
                    const v = (e.target as HTMLInputElement).value;
                    this._setAreaStyle(name, 'bgImage', v && v !== '(embedded image)' ? v : undefined);
                  }}
                />
                ${st.bgImage ? html`
                  <button class="style-clr" title="Clear"
                    @click=${() => this._clearAreaStyleKeys(name, ['bgImage', 'bgImageSize'])}>✕</button>
                ` : nothing}
              </div>

              ${st.bgImage ? html`
                <div class="style-row">
                  <span class="style-lbl">Size</span>
                  <div class="style-btn-group">
                    ${([
                      { val: 'contain', lbl: 'Fit' },
                      { val: 'cover',   lbl: 'Fill' },
                      { val: 'stretch', lbl: 'Stretch' },
                    ] as const).map(({ val, lbl }) => html`
                      <button
                        class="style-btn ${(st.bgImageSize ?? 'contain') === val ? 'active' : ''}"
                        @click=${() => this._setAreaStyle(name, 'bgImageSize', val)}
                      >${lbl}</button>
                    `)}
                  </div>
                </div>
              ` : nothing}

              <div class="style-group-label">Border</div>

              <div class="style-row">
                <span class="style-lbl">Color</span>
                <input type="color" class="style-color ${st.borderColor ? 'active' : ''}"
                  .value=${st.borderColor ?? '#ffffff'}
                  @change=${(e: Event) =>
                    this._setAreaStyle(name, 'borderColor', (e.target as HTMLInputElement).value)}
                />
                ${st.borderColor ? html`
                  <button class="style-clr" title="Clear"
                    @click=${() => this._setAreaStyle(name, 'borderColor', undefined)}>✕</button>
                ` : nothing}
                <span class="style-hint">${st.borderColor ?? 'default'}</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Width</span>
                <input type="number" class="style-num"
                  min="0" max="10" step="1"
                  .value=${String(st.borderWidth ?? '')}
                  placeholder="1"
                  @change=${(e: Event) => {
                    const v = parseInt((e.target as HTMLInputElement).value, 10);
                    this._setAreaStyle(name, 'borderWidth', isNaN(v) ? undefined : v);
                  }}
                />
                <span class="style-unit">px</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Radius</span>
                <input type="number" class="style-num"
                  min="0" max="32" step="1"
                  .value=${String(st.borderRadius ?? '')}
                  placeholder="0"
                  @change=${(e: Event) => {
                    const v = parseInt((e.target as HTMLInputElement).value, 10);
                    this._setAreaStyle(name, 'borderRadius', isNaN(v) ? undefined : v);
                  }}
                />
                <span class="style-unit">px</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Style</span>
                <div class="style-btn-group">
                  ${(['solid', 'dashed', 'dotted'] as const).map((s) => html`
                    <button class="style-btn ${(st.borderStyle ?? 'solid') === s ? 'active' : ''}"
                      @click=${() => this._setAreaStyle(name, 'borderStyle', s)}>${s}</button>
                  `)}
                </div>
              </div>

              <div class="style-group-label">Header</div>

              <div class="style-row">
                <span class="style-lbl">Bg</span>
                <input type="color" class="style-color ${st.headerBgColor ? 'active' : ''}"
                  title="Color 1"
                  .value=${st.headerBgColor ?? '#ffffff'}
                  @change=${(e: Event) =>
                    this._setAreaStyle(name, 'headerBgColor', (e.target as HTMLInputElement).value)}
                />
                <span class="style-hint style-hint--mid">→</span>
                <input type="color" class="style-color ${st.headerBgColor2 ? 'active' : ''}"
                  title="Color 2 (gradient)"
                  .value=${st.headerBgColor2 ?? '#ffffff'}
                  @change=${(e: Event) =>
                    this._setAreaStyle(name, 'headerBgColor2', (e.target as HTMLInputElement).value)}
                />
                ${st.headerBgColor ? html`
                  <button class="style-clr" title="Clear both"
                    @click=${() => {
                      this._setAreaStyle(name, 'headerBgColor', undefined);
                      this._setAreaStyle(name, 'headerBgColor2', undefined);
                      this._setAreaStyle(name, 'headerBgDir', undefined);
                    }}>✕</button>
                ` : nothing}
              </div>

              ${st.headerBgColor && st.headerBgColor2 ? html`
                <div class="style-row">
                  <span class="style-lbl">Dir</span>
                  <div class="style-btn-group">
                    ${([
                      { val: 'to right',  lbl: '→' },
                      { val: 'to left',   lbl: '←' },
                      { val: 'to bottom', lbl: '↓' },
                      { val: 'to top',    lbl: '↑' },
                      { val: '135deg',    lbl: '↘' },
                      { val: '45deg',     lbl: '↗' },
                    ] as const).map(({ val, lbl }) => html`
                      <button class="style-btn style-btn--icon ${(st.headerBgDir ?? 'to right') === val ? 'active' : ''}"
                        @click=${() => this._setAreaStyle(name, 'headerBgDir', val)}>${lbl}</button>
                    `)}
                  </div>
                </div>
              ` : nothing}

              <div class="style-row">
                <span class="style-lbl">Text Color</span>
                <input type="color" class="style-color ${st.headerTextColor ? 'active' : ''}"
                  .value=${st.headerTextColor ?? '#ffffff'}
                  @change=${(e: Event) =>
                    this._setAreaStyle(name, 'headerTextColor', (e.target as HTMLInputElement).value)}
                />
                ${st.headerTextColor ? html`
                  <button class="style-clr" title="Clear"
                    @click=${() => this._setAreaStyle(name, 'headerTextColor', undefined)}>✕</button>
                ` : nothing}
                <span class="style-hint">${st.headerTextColor ?? 'default'}</span>
              </div>

              <div class="style-group-label">Name Text</div>

              <div class="style-row">
                <span class="style-lbl">Color</span>
                <input type="color" class="style-color ${st.textColor ? 'active' : ''}"
                  .value=${st.textColor ?? '#ff6a00'}
                  @change=${(e: Event) =>
                    this._setAreaStyle(name, 'textColor', (e.target as HTMLInputElement).value)}
                />
                ${st.textColor ? html`
                  <button class="style-clr" title="Clear"
                    @click=${() => this._setAreaStyle(name, 'textColor', undefined)}>✕</button>
                ` : nothing}
                <span class="style-hint">${st.textColor ?? 'default'}</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Size</span>
                <input type="number" class="style-num"
                  min="8" max="48" step="1"
                  .value=${String(st.fontSize ?? '')}
                  placeholder="—"
                  @change=${(e: Event) => {
                    const v = parseInt((e.target as HTMLInputElement).value, 10);
                    this._setAreaStyle(name, 'fontSize', isNaN(v) ? undefined : v);
                  }}
                />
                <span class="style-unit">px</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Weight</span>
                <div class="style-btn-group">
                  <button class="style-btn ${!st.fontWeight || st.fontWeight === 'normal' ? 'active' : ''}"
                    @click=${() => this._setAreaStyle(name, 'fontWeight', 'normal')}>Normal</button>
                  <button class="style-btn ${st.fontWeight === 'bold' ? 'active' : ''}"
                    @click=${() => this._setAreaStyle(name, 'fontWeight', 'bold')}>Bold</button>
                </div>
              </div>

              <div class="style-row">
                <span class="style-lbl">Style</span>
                <div class="style-btn-group">
                  <button class="style-btn ${!st.fontStyle || st.fontStyle === 'normal' ? 'active' : ''}"
                    @click=${() => this._setAreaStyle(name, 'fontStyle', 'normal')}>Normal</button>
                  <button class="style-btn ${st.fontStyle === 'italic' ? 'active' : ''}"
                    @click=${() => this._setAreaStyle(name, 'fontStyle', 'italic')}>Italic</button>
                </div>
              </div>

              <div class="style-group-label">Tiles</div>

              <div class="style-row">
                <span class="style-lbl">Bg Color</span>
                <input type="color" class="style-color ${st.tileBgColor ? 'active' : ''}"
                  .value=${st.tileBgColor ?? '#1c1c1e'}
                  @change=${(e: Event) =>
                    this._setAreaStyle(name, 'tileBgColor', (e.target as HTMLInputElement).value)}
                />
                ${st.tileBgColor ? html`
                  <button class="style-clr" title="Clear"
                    @click=${() => this._setAreaStyle(name, 'tileBgColor', undefined)}>✕</button>
                ` : nothing}
                <span class="style-hint">${st.tileBgColor ?? 'default'}</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Border</span>
                <input type="color" class="style-color ${st.tileBorderColor ? 'active' : ''}"
                  .value=${st.tileBorderColor ?? '#ffffff'}
                  @change=${(e: Event) =>
                    this._setAreaStyle(name, 'tileBorderColor', (e.target as HTMLInputElement).value)}
                />
                ${st.tileBorderColor ? html`
                  <button class="style-clr" title="Clear"
                    @click=${() => this._setAreaStyle(name, 'tileBorderColor', undefined)}>✕</button>
                ` : nothing}
                <span class="style-hint">${st.tileBorderColor ?? 'default'}</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Columns</span>
                <input type="number" class="style-num"
                  min="1" max="6" step="1"
                  .value=${String(st.columns ?? '')}
                  placeholder="—"
                  @change=${(e: Event) => {
                    const v = parseInt((e.target as HTMLInputElement).value, 10);
                    this._setAreaStyle(name, 'columns', isNaN(v) ? undefined : v);
                  }}
                />
                <span class="style-hint" style="margin-left:4px">overrides global</span>
              </div>

              <div class="style-group-label">Effects</div>

              <div class="style-row">
                <span class="style-lbl">Shadow</span>
                <div class="style-btn-group">
                  ${(['none', 'soft', 'medium', 'strong'] as const).map((s) => html`
                    <button class="style-btn ${(st.boxShadow ?? 'none') === s ? 'active' : ''}"
                      @click=${() => this._setAreaStyle(name, 'boxShadow', s)}>${s}</button>
                  `)}
                </div>
              </div>

              ${Object.keys(st).length ? html`
                <button class="clear-btn" @click=${() => this._clearAreaStyle(name)}>
                  Clear all styles
                </button>
              ` : nothing}
            </div>
          `;
        })() : nothing}
      ` : html`<p class="hint">No areas found in Home Assistant.</p>`}
    `;

    return html`
      <div class="editor">
        ${this._renderSection('rooms', 'Rooms to display',
          html`
            <p class="hint">Select which rooms to show. Leave all unselected to show every room.</p>
            ${this._renderAreaPicker(selectedAreas)}
          `,
          roomsBadge
        )}

        ${this._renderSection('electrical', 'Electrical',
          this._renderSensorGroupContent('Electrical', selectedSensors),
          sensorBadge('Electrical')
        )}

        ${this._renderSection('environmental', 'Environmental',
          this._renderSensorGroupContent('Environmental', selectedSensors),
          sensorBadge('Environmental')
        )}

        ${this._renderSection('device', 'Devices',
          this._renderSensorGroupContent('Device', selectedSensors),
          sensorBadge('Device')
        )}

        ${this._renderSection('alerts', 'Alerts',
          this._renderSensorGroupContent('Alerts', selectedSensors),
          sensorBadge('Alerts')
        )}

        ${(() => {
          const selectedGraphs: string[] = c.graph_sensors ?? [];
          const graphBadge = selectedGraphs.length ? `${selectedGraphs.length}` : undefined;
          return this._renderSection('graphs', 'Graphs', html`
            <p class="hint">Select which sensor types show as mini graphs on tiles. Each selected type appears as its own labeled row.</p>
            <div class="area-picker">
              ${ShellyCardEditor.GRAPH_TYPES.map(({ key, label }) => html`
                <div class="area-chip ${selectedGraphs.includes(key) ? 'selected' : ''}"
                  @click=${() => this._toggleGraph(key, selectedGraphs)}>${label}</div>
              `)}
            </div>
            ${selectedGraphs.length ? this._numberInput('History window (hours)', 'graph_hours', c.graph_hours ?? 24, 1, 168) : nothing}
          `, graphBadge);
        })()}

        ${this._renderSection('room-styles', 'Room Styles',
          roomStylesBody,
          styledAreaCount ? `${styledAreaCount}` : undefined
        )}

        ${this._renderSection('hidden', 'Hidden Devices',
          html`
            <p class="hint">Click a device to hide it from the dashboard. Click again to show it.</p>
            ${this._renderDevicePicker(hiddenDevices)}
          `,
          hiddenBadge
        )}

        ${this._renderSection('layout', 'Layout', html`
          ${this._numberInput('Columns per row', 'columns', c.columns, 1, 6)}
          ${this._toggle('Show offline devices', 'show_offline', c.show_offline ?? true)}
          ${this._toggle('Show all HA devices (not just Shelly)', 'include_all', c.include_all ?? false)}
          ${this._toggle('Hide Shelly devices', 'hide_shelly', c.hide_shelly ?? false)}
        `)}
      </div>
    `;
  }

  static styles = css`
    .editor { padding: 8px 0; }

    /* ── Accordion sections ──────────────────────────────────────────────── */
    .acc-section {
      border: 1px solid var(--divider-color, rgba(0,0,0,.12));
      border-radius: 8px;
      margin-bottom: 8px;
      overflow: hidden;
    }
    .acc-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      cursor: pointer;
      user-select: none;
      background: var(--secondary-background-color);
      transition: filter 0.15s;
    }
    .acc-header:hover { filter: brightness(1.06); }
    .acc-header.open {
      border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08));
    }
    .acc-title {
      flex: 1;
      font-size: 0.82em;
      font-weight: 700;
      color: var(--primary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .acc-badge {
      font-size: 0.72em;
      background: var(--primary-color);
      color: white;
      border-radius: 10px;
      padding: 1px 8px;
      font-weight: 700;
      line-height: 1.6;
    }
    .acc-chevron {
      font-size: 0.65em;
      color: var(--secondary-text-color);
      transition: transform 0.2s;
    }
    .acc-header.open .acc-chevron { transform: rotate(180deg); }
    .acc-body { padding: 10px 14px 12px; }

    .hint {
      font-size: 0.82em;
      color: var(--primary-text-color);
      margin: 0 0 10px;
    }

    /* Per-area style panel */
    .area-bg-group {
      border: 1px solid var(--divider-color, rgba(0,0,0,.1));
      border-radius: 8px;
      padding: 8px 10px 6px;
      margin-bottom: 10px;
    }

    .area-bg-label {
      font-size: 0.82em;
      font-weight: 700;
      color: var(--primary-text-color);
      margin-bottom: 6px;
    }

    .style-group-label {
      font-size: 0.7em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--secondary-text-color);
      margin: 8px 0 4px;
      padding-top: 6px;
      border-top: 1px solid var(--divider-color, rgba(0,0,0,.06));
    }
    .style-group-label:first-of-type { margin-top: 0; border-top: none; padding-top: 0; }

    .style-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      min-height: 28px;
    }
    .style-row--full { flex-wrap: wrap; }

    .style-lbl {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      min-width: 42px;
      flex-shrink: 0;
    }

    .style-color {
      width: 32px;
      height: 26px;
      border: 1px solid var(--divider-color, rgba(0,0,0,.2));
      border-radius: 4px;
      padding: 1px 2px;
      cursor: pointer;
      background: none;
      flex-shrink: 0;
      opacity: 0.45;
    }
    .style-color.active { opacity: 1; }

    .style-hint {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      font-family: monospace;
    }
    .style-hint--mid { font-family: inherit; opacity: 0.5; }

    .style-text {
      flex: 1;
      min-width: 0;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.85em;
      color: var(--primary-text-color);
    }

    .style-num {
      width: 54px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      border-radius: 6px;
      padding: 4px 6px;
      font-size: 0.85em;
      color: var(--primary-text-color);
      text-align: center;
    }

    .style-unit {
      font-size: 0.78em;
      color: var(--secondary-text-color);
    }

    .upload-btn {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.2));
      border-radius: 6px;
      color: var(--primary-text-color);
      font-size: 0.8em;
      padding: 4px 10px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .upload-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .style-clr {
      background: none;
      border: none;
      color: var(--secondary-text-color);
      font-size: 0.75em;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      line-height: 1;
      flex-shrink: 0;
    }
    .style-clr:hover { color: var(--error-color, #f44336); }

    .style-btn-group {
      display: flex;
      gap: 4px;
    }

    .style-btn {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      border-radius: 6px;
      color: var(--secondary-text-color);
      font-size: 0.8em;
      padding: 3px 10px;
      cursor: pointer;
    }
    .style-btn.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      font-weight: 600;
    }
    .style-btn--icon { padding: 3px 7px; min-width: 28px; text-align: center; }

    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }
    .field.row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    label {
      font-size: 0.875em;
      color: var(--primary-text-color);
    }

    input[type="text"],
    input[type="number"] {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 0.9em;
      color: var(--primary-text-color);
      width: 100%;
      box-sizing: border-box;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    /* Area chip picker */
    .area-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-bottom: 4px;
    }

    .area-chip {
      padding: 5px 13px;
      border-radius: 20px;
      font-size: 0.85em;
      cursor: pointer;
      user-select: none;
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }

    .area-chip:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .area-chip.selected {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      font-weight: 600;
    }

    .area-chip.has-bg {
      border-color: var(--accent-color, #ff9800);
    }

    .area-chip.hidden-chip {
      background: var(--error-color, #f44336);
      border-color: var(--error-color, #f44336);
      color: white;
      font-weight: 600;
    }
    .area-chip.hidden-chip:hover {
      filter: brightness(0.88);
    }

    .chip-x {
      font-size: 0.8em;
      opacity: 0.85;
    }

    .clear-btn {
      background: none;
      border: 1px solid var(--error-color, #f44336);
      border-radius: 6px;
      color: var(--error-color, #f44336);
      font-size: 0.8em;
      padding: 4px 10px;
      cursor: pointer;
      margin-bottom: 6px;
    }
    .clear-btn:hover { background: var(--error-color, #f44336); color: white; }

    /* Group label inside chip picker — forces a new row */
    .chip-group-label {
      width: 100%;
      font-size: 0.7em;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--secondary-text-color);
      font-weight: 700;
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px solid var(--divider-color, rgba(0,0,0,.06));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'shelly-card-editor': ShellyCardEditor;
  }
}
