import { html, nothing, TemplateResult } from 'lit';
import {
  formatCurrent, formatEnergy, formatPower, formatTemp, formatUptime, formatVoltage, rssiToQuality,
  entityTier,
} from '../helpers';
import type { HassAttrs, HAEntity } from '../types';
import type { TileCtx } from '../tiles/tile-context';

const BRIGHTNESS_MAX = 255;

/** Top-level detail sheet — called from the main class once per open device. */
export function renderDetailSheet(ctx: TileCtx): TemplateResult {
  return html`
    <div class="ds-backdrop" @click=${() => ctx.closeDetailSheet()}>
      <div class="ds-sheet" @click=${(e: Event) => e.stopPropagation()}>
        ${renderSheetHeader(ctx)}
        <div class="ds-body ds-body--${ctx.profile.type}">
          ${renderSheetProfile(ctx)}
          ${renderSheetCustomize(ctx)}
        </div>
      </div>
    </div>`;
}

function renderSheetProfile(ctx: TileCtx): TemplateResult {
  switch (ctx.profile.type) {
    case 'relay':        return renderSheetRelay(ctx);
    case 'plug':         return renderSheetPlug(ctx);
    case 'dimmer':       return renderSheetDimmer(ctx);
    case 'rgb':          return renderSheetRgb(ctx);
    case 'climate':      return renderSheetClimate(ctx);
    case 'cover':        return renderSheetCover(ctx);
    case 'valve':        return renderSheetValve(ctx);
    case 'energy':       return renderSheetEnergy(ctx);
    case 'sensor':       return renderSheetSensor(ctx);
    case 'input':        return renderSheetInput(ctx);
    case 'uni':          return renderSheetUni(ctx);
    case 'wall_display': return renderSheetWallDisplay(ctx);
    default:             return renderSheetGeneric(ctx);
  }
}

// ── Shared sections ────────────────────────────────────────────────────────

/** "Customise tile" — toggle which blocks & sensor chips show on the card face.
 *  Persists per-viewer (localStorage) and bakes to config when editing. */
function renderSheetCustomize(ctx: TileCtx): TemplateResult {
  const cz = ctx.customize;
  return html`
    <details class="ds-customize">
      <summary class="ds-cz-summary">⚙ Customise tile${cz.customized ? html`<span class="ds-cz-dot" title="This tile has custom visibility"></span>` : nothing}</summary>
      <div class="ds-cz-body">
        <div class="ds-cz-hint">Choose what appears on this tile on the dashboard.</div>
        <label class="ds-cz-row ds-cz-graphs">
          <input type="checkbox" .checked=${cz.graphs}
            @change=${(e: Event) => cz.setGraphs((e.target as HTMLInputElement).checked)}>
          <span>Sparkline graphs</span>
        </label>
        <div class="ds-cz-group-lbl">Sections</div>
        <div class="ds-cz-list">
          ${cz.blocks.map(b => html`
            <label class="ds-cz-row">
              <input type="checkbox" .checked=${b.visible}
                @change=${(e: Event) => cz.setBlock(b.id, (e.target as HTMLInputElement).checked)}>
              <span>${b.label}</span>
            </label>`)}
        </div>
        ${cz.chips.length ? html`
          <div class="ds-cz-group-lbl">Sensor chips</div>
          <div class="ds-cz-list">
            ${cz.chips.map(c => html`
              <label class="ds-cz-row">
                <input type="checkbox" .checked=${c.visible}
                  @change=${(e: Event) => cz.setChip(c.key, (e.target as HTMLInputElement).checked)}>
                <span>${c.label}</span>
              </label>`)}
          </div>` : nothing}
        ${cz.customized ? html`<button class="ds-cz-reset" @click=${() => cz.reset()}>↺ Reset to default</button>` : nothing}
      </div>
    </details>`;
}

function renderSheetHeader(ctx: TileCtx): TemplateResult {
  const { device, profile, accent, online } = ctx;
  const fw = ctx.getFirmware(device);
  const s = ctx.tileSensors(device);
  return html`
    <div class="ds-header" style="--ds-accent:${accent}">
      <div class="ds-header-top">
        <div class="ds-header-info">
          <span class="dot ${online ? 'online' : 'offline'}"></span>
          <span class="ds-device-name">${device.name}</span>
        </div>
        <button class="ds-close" @click=${() => ctx.closeDetailSheet()}>✕</button>
      </div>
      <div class="ds-header-meta">
        ${device.area ? html`<span class="ds-chip ds-chip--room">${device.area}</span>` : nothing}
        <span class="ds-chip ds-chip--type">${profile.label}</span>
        ${device.model ? html`<span class="ds-chip">${device.model}</span>` : nothing}
        ${profile.gen !== 'other' ? html`<span class="ds-chip">Gen ${profile.gen}</span>` : nothing}
        ${device.ip ? html`<span class="ds-chip">${device.ip}</span>` : nothing}
      </div>
      ${fw ? html`<div class="ds-fw-update"><span>FW update: ${fw.current} → ${fw.newVersion}</span></div>` : nothing}
      ${s.rssi != null ? html`<div class="ds-signal">Wi-Fi: ${rssiToQuality(s.rssi)} (${s.rssi} dBm)${s.uptime != null ? html` · Up ${formatUptime(s.uptime)}` : nothing}</div>` : nothing}
      <div class="ds-accent-bar" style="background:${accent}"></div>
    </div>`;
}

function renderSheetHistoryTabs(ctx: TileCtx): TemplateResult {
  const graphEnts = ctx.getGraphEntities(ctx.device);
  if (!graphEnts.length) return html``;
  const hr = ctx.getDetailHistoryRange();
  return html`
    <div class="ds-section">
      <div class="ds-tabs">
        <button class="ds-tab ${hr === 24 ? 'ds-tab--active' : ''}" @click=${() => ctx.setDetailHistoryRange(24)}>24h</button>
        <button class="ds-tab ${hr === 168 ? 'ds-tab--active' : ''}" @click=${() => ctx.setDetailHistoryRange(168)}>7d</button>
        <button class="ds-tab ${hr === 720 ? 'ds-tab--active' : ''}" @click=${() => ctx.setDetailHistoryRange(720)}>30d</button>
      </div>
      ${ctx.renderSparklinesExpanded(ctx.device, hr)}
    </div>`;
}

function renderSheetEntityList(ctx: TileCtx): TemplateResult {
  const { device, hass } = ctx;
  if (!device.entities.length) return html``;
  // Whole-section opt-out; `hidden_entities` trims it row by row instead.
  if (ctx.config.show_entity_list === false) return html``;
  const domainIcon = (d: string) =>
    d === 'switch' ? '⏻' : d === 'light' ? '💡' : d === 'sensor' ? '📊' :
    d === 'binary_sensor' ? '◉' : d === 'climate' ? '🌡' : d === 'cover' ? '🪟' :
    d === 'update' ? '⬆' : d === 'button' ? '⏺' : d === 'number' ? '#' :
    d === 'select' ? '☰' : d === 'text' ? 'Aa' : '•';
  const hidden = new Set(ctx.config.hidden_entities ?? []);
  const shownEntities = device.entities.filter(e => !hidden.has(e.entity_id));
  if (!shownEntities.length) return html``;

  const row = (e: HAEntity, secondary: boolean) => {
    const s = hass.states[e.entity_id];
    const name = (s?.attributes as HassAttrs)?.friendly_name ?? e.entity_id;
    const state = s?.state ?? 'unknown';
    const unit = (s?.attributes as HassAttrs)?.unit_of_measurement ?? '';
    const isToggle = e.domain === 'switch' || e.domain === 'light' || e.domain === 'input_boolean';
    const isOn = state === 'on';
    const lc = s?.last_changed ? ctx.timeAgo(s.last_changed) : '';
    return html`
      <div class="ds-entity-row ${secondary ? 'is-secondary' : ''}" @click=${() => ctx.fireMoreInfo(e.entity_id)}>
        <span class="ds-ent-icon">${domainIcon(e.domain)}</span>
        <span class="ds-ent-name">${name}</span>
        <span class="ds-ent-state">${state}${unit ? ` ${unit}` : ''}</span>
        ${lc ? html`<span class="ds-ent-age">${lc}</span>` : nothing}
        ${isToggle ? html`<button class="tog ${isOn ? 'on' : 'off'}" @click=${(ev: Event) => { ev.stopPropagation(); ctx.toggle(e.entity_id, isOn, ev); }}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
      </div>`;
  };

  // Tier by entity_category so the primary controls lead and config/diagnostic
  // entities settle below as clearly-secondary groups (the "basics first" model).
  const primary = shownEntities.filter(e => entityTier(e) === 'primary');
  const config  = shownEntities.filter(e => entityTier(e) === 'config');
  const diag    = shownEntities.filter(e => entityTier(e) === 'diagnostic');

  return html`
    <div class="ds-section">
      <div class="ds-section-title">All Entities</div>
      ${primary.map(e => row(e, false))}
      ${config.length ? html`<div class="ds-ent-subgroup">Configuration</div>${config.map(e => row(e, true))}` : nothing}
      ${diag.length ? html`<div class="ds-ent-subgroup">Diagnostic</div>${diag.map(e => row(e, true))}` : nothing}
    </div>`;
}

function renderSheetDiagnostics(ctx: TileCtx): TemplateResult {
  const { device } = ctx;
  const alerts = ctx.getAlerts(device);
  const fw = ctx.getFirmware(device);
  const s = ctx.tileSensors(device);
  if (!alerts.length && !fw && s.rssi == null && s.uptime == null && !device.ip) return html``;
  return html`
    <div class="ds-section">
      <div class="ds-section-title">Diagnostics</div>
      <div class="ds-diag-grid">
        ${device.ip ? html`<div class="ds-diag-item"><span class="ds-diag-label">IP</span><span class="ds-diag-val">${device.ip}</span></div>` : nothing}
        ${s.rssi != null ? html`<div class="ds-diag-item"><span class="ds-diag-label">RSSI</span><span class="ds-diag-val">${rssiToQuality(s.rssi)} (${s.rssi} dBm)</span></div>` : nothing}
        ${s.uptime != null ? html`<div class="ds-diag-item"><span class="ds-diag-label">Uptime</span><span class="ds-diag-val">${formatUptime(s.uptime)}</span></div>` : nothing}
        ${fw ? html`<div class="ds-diag-item"><span class="ds-diag-label">Firmware</span><span class="ds-diag-val">${fw.current} → ${fw.newVersion}</span></div>` : nothing}
        ${alerts.length ? html`<div class="ds-diag-item ds-diag-alert"><span class="ds-diag-label">Alerts</span><span class="ds-diag-val">${alerts.join(', ')}</span></div>` : nothing}
      </div>
    </div>`;
}

function renderSheetSensors(ctx: TileCtx): TemplateResult {
  const s = ctx.tileSensors(ctx.device);
  const hasAny = s.power != null || s.voltage != null || s.current != null || s.energy != null || s.temp != null;
  if (!hasAny) return html``;
  return html`
    <div class="ds-section">
      <div class="ds-section-title">Sensors</div>
      <div class="ds-sensor-grid">
        ${s.power   != null ? html`<div class="ds-sensor-item"><span class="ds-sensor-val">${formatPower(s.power)}</span><span class="ds-sensor-label">Power</span></div>` : nothing}
        ${s.voltage != null ? html`<div class="ds-sensor-item"><span class="ds-sensor-val">${formatVoltage(s.voltage)}</span><span class="ds-sensor-label">Voltage</span></div>` : nothing}
        ${s.current != null ? html`<div class="ds-sensor-item"><span class="ds-sensor-val">${formatCurrent(s.current)}</span><span class="ds-sensor-label">Current</span></div>` : nothing}
        ${s.energy  != null ? html`<div class="ds-sensor-item"><span class="ds-sensor-val">${formatEnergy(s.energy)}</span><span class="ds-sensor-label">${s.energyLabel}</span></div>` : nothing}
        ${s.temp    != null ? html`<div class="ds-sensor-item"><span class="ds-sensor-val">${formatTemp(s.temp)}</span><span class="ds-sensor-label">Temp</span></div>` : nothing}
      </div>
    </div>`;
}

/** Shared footer composition. `historyFirst` puts history before sensors (sensor profile). */
function renderSheetFooter(
  ctx: TileCtx,
  opts: { sensors?: boolean; history?: boolean; historyFirst?: boolean } = {},
): TemplateResult {
  const { sensors = true, history = true, historyFirst = false } = opts;
  return html`
    ${historyFirst && history ? renderSheetHistoryTabs(ctx) : nothing}
    ${sensors ? renderSheetSensors(ctx) : nothing}
    ${!historyFirst && history ? renderSheetHistoryTabs(ctx) : nothing}
    ${renderSheetEntityList(ctx)}
    ${renderSheetDiagnostics(ctx)}`;
}

// ── Per-profile renderers ─────────────────────────────────────────────────

function renderSheetRelay(ctx: TileCtx): TemplateResult {
  const { device, hass } = ctx;
  const channels = device.entities.filter(e => e.domain === 'switch');
  return html`
    ${channels.length > 1 ? html`
      <div class="ds-section">
        <div class="ds-section-title">Relay Channels</div>
        <div class="ds-channel-list">
          ${channels.map(ch => {
            const s = hass.states[ch.entity_id];
            const isOn = s?.state === 'on';
            const name = (s?.attributes as HassAttrs)?.friendly_name ?? ch.entity_id;
            const chNum = ch.entity_id.match(/[_-](\d+)$/)?.[1] ?? '';
            const pwEnt = device.entities.find(e => e.domain === 'sensor' && e.entity_id.includes(chNum) && (hass.states[e.entity_id]?.attributes as HassAttrs)?.device_class === 'power');
            const pw = pwEnt ? parseFloat(hass.states[pwEnt.entity_id]?.state ?? '') : NaN;
            return html`
              <div class="ds-channel-row">
                <span class="ds-channel-name">${name}</span>
                ${!isNaN(pw) ? html`<span class="ds-channel-power">${formatPower(pw)}</span>` : nothing}
                <button class="tog ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(ch.entity_id, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>
              </div>`;
          })}
        </div>
      </div>` : channels.length === 1 ? html`
      <div class="ds-section ds-single-toggle">
        ${(() => { const s = hass.states[channels[0].entity_id]; const isOn = s?.state === 'on'; return html`
          <button class="tog ds-big-toggle ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(channels[0].entity_id, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>`;
        })()}
      </div>` : nothing}
    ${renderSheetFooter(ctx)}`;
}

function renderSheetPlug(ctx: TileCtx): TemplateResult {
  const sw = ctx.getPrimarySwitch(ctx.device);
  const isOn = sw?.isOn ?? false;
  const s = ctx.tileSensors(ctx.device);
  return html`
    <div class="ds-section ds-plug-hero">
      ${sw ? html`<button class="tog ds-big-toggle ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
      ${s.power != null ? html`<span class="ds-big-power">${formatPower(s.power)}</span>` : nothing}
    </div>
    ${renderSheetFooter(ctx)}`;
}

function renderSheetDimmer(ctx: TileCtx): TemplateResult {
  const sw = ctx.getPrimarySwitch(ctx.device);
  const isOn = sw?.isOn ?? false;
  const brightness = sw?.brightness ?? 0;
  const pct = Math.round((brightness / BRIGHTNESS_MAX) * 100);
  return html`
    <div class="ds-section">
      <div class="ds-section-title">Brightness</div>
      <div class="ds-dimmer-control">
        <span class="ds-dimmer-pct">${pct}%</span>
        <input type="range" min="0" max="255" .value=${String(brightness)}
          @change=${(e: Event) => ctx.setBrightness(sw!.entityId, parseInt((e.target as HTMLInputElement).value))}
          class="ds-slider">
        ${sw ? html`<button class="tog ${isOn ? 'on' : 'off'}" @click=${(ev: Event) => ctx.toggle(sw.entityId, isOn, ev)}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
      </div>
    </div>
    ${renderSheetFooter(ctx)}`;
}

function renderSheetRgb(ctx: TileCtx): TemplateResult {
  const { accent } = ctx;
  const sw = ctx.getPrimarySwitch(ctx.device);
  const isOn = sw?.isOn ?? false;
  const brightness = sw?.brightness ?? 0;
  const pct = Math.round((brightness / BRIGHTNESS_MAX) * 100);
  return html`
    <div class="ds-section">
      <div class="ds-section-title">Light Controls</div>
      <div class="ds-dimmer-control">
        <span class="ds-dimmer-pct">${pct}%</span>
        <input type="range" min="0" max="255" .value=${String(brightness)}
          @change=${(e: Event) => ctx.setBrightness(sw!.entityId, parseInt((e.target as HTMLInputElement).value))}
          class="ds-slider" style="--ds-accent:${accent}">
        ${sw ? html`<button class="tog ${isOn ? 'on' : 'off'}" @click=${(ev: Event) => ctx.toggle(sw.entityId, isOn, ev)}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
      </div>
      ${sw?.rgbColor ? html`<div class="ds-color-swatch" style="background:rgb(${sw.rgbColor.join(',')})"></div>` : nothing}
    </div>
    ${renderSheetFooter(ctx)}`;
}

function renderSheetClimate(ctx: TileCtx): TemplateResult {
  const trv = ctx.getTrv(ctx.device);
  return html`
    <div class="ds-section">
      <div class="ds-section-title">Climate</div>
      ${trv ? html`
        <div class="ds-climate-info">
          <div class="ds-climate-current">
            <span class="ds-climate-label">Current</span>
            <span class="ds-climate-val">${trv.currentTemp?.toFixed(1) ?? '—'}°C</span>
          </div>
          <div class="ds-climate-target">
            <button class="ds-temp-btn" @click=${() => ctx.setTemp(trv.entityId, Math.max(trv.minTemp, (trv.targetTemp ?? 20) - trv.step))}>−</button>
            <span class="ds-climate-val ds-climate-target-val">${trv.targetTemp?.toFixed(1) ?? '—'}°C</span>
            <button class="ds-temp-btn" @click=${() => ctx.setTemp(trv.entityId, Math.min(trv.maxTemp, (trv.targetTemp ?? 20) + trv.step))}>+</button>
          </div>
        </div>
        <div class="ds-climate-modes">
          <span class="ds-chip">${trv.hvacMode}</span>
          ${trv.hvacAction ? html`<span class="ds-chip">${trv.hvacAction}</span>` : nothing}
          ${trv.presetMode ? html`<span class="ds-chip">${trv.presetMode}</span>` : nothing}
        </div>
        ${trv.valvePosition != null ? html`<div class="ds-valve-pos">Valve: ${trv.valvePosition}%</div>` : nothing}
      ` : html`<span class="ds-muted">No climate entity</span>`}
    </div>
    ${renderSheetFooter(ctx)}`;
}

function renderSheetCover(ctx: TileCtx): TemplateResult {
  const cov = ctx.getCover(ctx.device);
  return html`
    <div class="ds-section">
      <div class="ds-section-title">Cover</div>
      ${cov ? html`
        <div class="ds-cover-controls">
          <button class="ds-cover-btn" @click=${(e: Event) => ctx.coverAction(cov.entityId, 'open', e)}>▲ Open</button>
          <button class="ds-cover-btn" @click=${(e: Event) => ctx.coverAction(cov.entityId, 'stop', e)}>■ Stop</button>
          <button class="ds-cover-btn" @click=${(e: Event) => ctx.coverAction(cov.entityId, 'close', e)}>▼ Close</button>
        </div>
        ${cov.position != null ? html`<div class="ds-cover-pos">Position: ${cov.position}%</div>` : nothing}
        <span class="ds-chip">${cov.state}</span>
      ` : html`<span class="ds-muted">No cover entity</span>`}
    </div>
    ${renderSheetFooter(ctx, { history: false })}`;
}

function renderSheetValve(ctx: TileCtx): TemplateResult {
  const vlv = ctx.getValve(ctx.device);
  return html`
    <div class="ds-section">
      <div class="ds-section-title">Valve</div>
      ${vlv ? html`
        <div class="ds-cover-controls">
          <button class="ds-cover-btn" @click=${(e: Event) => ctx.valveAction(vlv.entityId, 'open', e)}>▲ Open</button>
          <button class="ds-cover-btn" @click=${(e: Event) => ctx.valveAction(vlv.entityId, 'stop', e)}>■ Stop</button>
          <button class="ds-cover-btn" @click=${(e: Event) => ctx.valveAction(vlv.entityId, 'close', e)}>▼ Close</button>
        </div>
        ${vlv.position != null ? html`<div class="ds-cover-pos">Position: ${vlv.position}%</div>` : nothing}
        ${vlv.temperature != null ? html`<div class="ds-cover-pos">Temp: ${vlv.temperature.toFixed(1)}°C</div>` : nothing}
        <span class="ds-chip">${vlv.state}</span>
      ` : html`<span class="ds-muted">No valve entity</span>`}
    </div>
    ${renderSheetFooter(ctx, { sensors: false, history: false })}`;
}

function renderSheetEnergy(ctx: TileCtx): TemplateResult {
  return html`${renderSheetFooter(ctx)}`;
}

function renderSheetSensor(ctx: TileCtx): TemplateResult {
  const { device, hass } = ctx;
  const primaryEnt = device.entities.find(e => {
    if (e.domain !== 'sensor') return false;
    const s = hass.states[e.entity_id];
    return s && !isNaN(parseFloat(s.state));
  });
  const alerts = ctx.getAlerts(device);
  return html`
    ${primaryEnt ? (() => {
      const s = hass.states[primaryEnt.entity_id];
      const val = parseFloat(s?.state ?? '');
      const unit = (s?.attributes as HassAttrs)?.unit_of_measurement ?? '';
      return html`
        <div class="ds-section ds-sensor-hero">
          <span class="ds-big-value">${isNaN(val) ? '—' : val.toFixed(1)}</span>
          <span class="ds-big-unit">${unit}</span>
        </div>`;
    })() : nothing}
    ${alerts.length ? html`<div class="ds-section ds-alert-row">${alerts.map(a => html`<span class="ds-chip ds-chip--alert">${a}</span>`)}</div>` : nothing}
    ${renderSheetFooter(ctx, { historyFirst: true })}`;
}

function renderSheetInput(ctx: TileCtx): TemplateResult {
  const { device } = ctx;
  // Same detection as the tile. The old filter here looked only at binary_sensor
  // entities, so a Gen1 i3 — whose channels are all `event.` — reported "No input
  // channels" even while the tile listed them.
  const inputs = ctx.getInputChannels(device);
  return html`
    <div class="ds-section">
      <div class="ds-section-title">Input Channels</div>
      ${inputs.length ? html`
        <div class="ds-channel-list">
          ${inputs.map(ch => {
            const action = ctx.getInputActionLabel(device, ch);
            const state = ctx.getInputActionState(device, ch);
            const lc = ch.lastChanged ? ctx.timeAgo(ch.lastChanged) : '';
            return html`
              <div class="ds-channel-row">
                <span class="ds-channel-name">${ch.label}</span>
                ${action
                  ? html`<span class="ds-chip ${state === 'on' ? 'ds-chip--on' : ''}">${action}</span>`
                  : html`<span class="ds-chip ${ch.isOn ? 'ds-chip--on' : ''}">
                      ${ch.isButton ? (ch.lastEvent ? ch.lastEvent.replace(/_/g, ' ') : '—') : (ch.isOn ? 'ON' : 'OFF')}
                    </span>`}
                ${lc ? html`<span class="ds-ent-age">${lc}</span>` : nothing}
              </div>`;
          })}
        </div>` : html`<span class="ds-muted">No input channels</span>`}
    </div>
    ${renderSheetFooter(ctx, { sensors: false, history: false })}`;
}

function renderSheetUni(ctx: TileCtx): TemplateResult {
  const { device, hass } = ctx;
  const adcEnts = device.entities.filter(e => e.domain === 'sensor' && (e.entity_id.includes('adc') || e.entity_id.includes('analog')));
  const outputs = device.entities.filter(e => e.domain === 'switch');
  return html`
    ${adcEnts.length ? html`
      <div class="ds-section">
        <div class="ds-section-title">ADC Inputs</div>
        ${adcEnts.map(e => {
          const s = hass.states[e.entity_id];
          const val = s?.state ?? '—';
          const unit = (s?.attributes as HassAttrs)?.unit_of_measurement ?? '';
          const name = (s?.attributes as HassAttrs)?.friendly_name ?? e.entity_id;
          return html`<div class="ds-channel-row"><span class="ds-channel-name">${name}</span><span>${val} ${unit}</span></div>`;
        })}
      </div>` : nothing}
    ${outputs.length ? html`
      <div class="ds-section">
        <div class="ds-section-title">Outputs</div>
        <div class="ds-channel-list">
          ${outputs.map(ch => {
            const s = hass.states[ch.entity_id];
            const isOn = s?.state === 'on';
            const name = (s?.attributes as HassAttrs)?.friendly_name ?? ch.entity_id;
            return html`
              <div class="ds-channel-row">
                <span class="ds-channel-name">${name}</span>
                <button class="tog ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(ch.entity_id, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>
              </div>`;
          })}
        </div>
      </div>` : nothing}
    ${renderSheetFooter(ctx, { sensors: false, history: false })}`;
}

function renderSheetWallDisplay(ctx: TileCtx): TemplateResult {
  const trv = ctx.getTrv(ctx.device);
  const sw = ctx.getPrimarySwitch(ctx.device);
  const isOn = sw?.isOn ?? false;
  return html`
    ${trv ? html`
      <div class="ds-section">
        <div class="ds-section-title">Climate</div>
        <div class="ds-climate-info">
          <div class="ds-climate-current">
            <span class="ds-climate-label">Current</span>
            <span class="ds-climate-val">${trv.currentTemp?.toFixed(1) ?? '—'}°C</span>
          </div>
          <div class="ds-climate-target">
            <button class="ds-temp-btn" @click=${() => ctx.setTemp(trv.entityId, Math.max(trv.minTemp, (trv.targetTemp ?? 20) - trv.step))}>−</button>
            <span class="ds-climate-val ds-climate-target-val">${trv.targetTemp?.toFixed(1) ?? '—'}°C</span>
            <button class="ds-temp-btn" @click=${() => ctx.setTemp(trv.entityId, Math.min(trv.maxTemp, (trv.targetTemp ?? 20) + trv.step))}>+</button>
          </div>
        </div>
      </div>` : nothing}
    ${sw ? html`
      <div class="ds-section ds-single-toggle">
        <button class="tog ds-big-toggle ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>
      </div>` : nothing}
    ${renderSheetFooter(ctx)}`;
}

function renderSheetGeneric(ctx: TileCtx): TemplateResult {
  const { device, hass } = ctx;
  const virtuals = device.entities.filter(e =>
    ['select', 'number', 'button', 'text', 'input_boolean', 'input_number', 'input_select'].includes(e.domain));
  return html`
    ${virtuals.length ? html`
      <div class="ds-section">
        <div class="ds-section-title">Controls</div>
        ${virtuals.map(e => {
          const s = hass.states[e.entity_id];
          const name = (s?.attributes as HassAttrs)?.friendly_name ?? e.entity_id;
          const state = s?.state ?? 'unknown';
          return html`<div class="ds-channel-row"><span class="ds-channel-name">${name}</span><span>${state}</span></div>`;
        })}
      </div>` : nothing}
    ${renderSheetFooter(ctx, { sensors: false })}`;
}
