import { html, nothing, TemplateResult } from 'lit';
import type { HAEntity, HassAttrs } from '../types';
import type { TileCtx } from './tile-context';
import { renderNameDot, renderNoEntity, chipsInHeader } from './tile-parts';
import { t } from '../localize';

const PRIORITY_CLASSES = ['temperature', 'humidity', 'carbon_dioxide', 'illuminance', 'battery'];
const BINARY_CLASSES = ['motion', 'door', 'window', 'moisture', 'smoke', 'gas'];

export function renderSensorCardTile(ctx: TileCtx): TemplateResult {
  const { device, accent, online, hass, config } = ctx;

  // Pick best primary numeric sensor
  let primaryEnt: HAEntity | undefined;
  for (const dc of PRIORITY_CLASSES) {
    primaryEnt = device.entities.find(e => {
      if (e.domain !== 'sensor') return false;
      const s = hass.states[e.entity_id];
      return s && (s.attributes as HassAttrs)?.device_class === dc;
    });
    if (primaryEnt) break;
  }
  const binaryEnt = !primaryEnt ? device.entities.find(e => {
    if (e.domain !== 'binary_sensor') return false;
    const s = hass.states[e.entity_id];
    return s && BINARY_CLASSES.includes((s.attributes as HassAttrs)?.device_class ?? '');
  }) : undefined;

  if (!primaryEnt && !binaryEnt) return renderNoEntity(device, online, 'ts-sensor', t('empty.no_sensor'));

  if (primaryEnt) {
    const st = hass.states[primaryEnt.entity_id];
    const val = parseFloat(st?.state ?? '');
    const unit = (st?.attributes as HassAttrs)?.unit_of_measurement ?? '';
    const dc = (st?.attributes as HassAttrs)?.device_class ?? '';
    const tileH = config.graph_hours ?? 24;
    ctx.requestGraphData(primaryEnt.entity_id);
    const pts = ctx.getGraphPoints(primaryEnt.entity_id, tileH);
    let trend = 0;
    if (pts.length >= 2) {
      const half = Math.floor(pts.length / 2);
      const avgNew = pts.slice(half).reduce((a, p) => a + p.v, 0) / (pts.length - half);
      const avgOld = pts.slice(0, half).reduce((a, p) => a + p.v, 0) / half;
      trend = avgNew - avgOld;
    }
    // Secondary chips are MEASUREMENTS: a numeric state with a unit, from a
    // primary (non-diagnostic) sensor. Without the unit test a firmware
    // version like "20260311-…" parsed to a "2026.0" chip.
    const secEnts = device.entities.filter(e => {
      if (e.entity_id === primaryEnt!.entity_id || e.domain !== 'sensor') return false;
      if (e.entity_category) return false;
      const s = hass.states[e.entity_id];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') return false;
      if (!(s.attributes as HassAttrs)?.unit_of_measurement) return false;
      return !isNaN(parseFloat(s.state));
    }).slice(0, 4);
    // header_chips (opt-in) moves the secondary chips into the name row; the
    // bottom placement then stands down — they move, they don't duplicate.
    const hdrChips = chipsInHeader(ctx);
    const bodyChips = !hdrChips && ctx.showEl('secondary');
    // Built only when a placement will render them — a "lean tiles" config
    // with secondary off shouldn't pay for markup that is never inserted.
    const chipSpans = (hdrChips || bodyChips) && secEnts.length ? secEnts.map(e => {
      const ss = hass.states[e.entity_id];
      const v = parseFloat(ss?.state ?? '');
      const u = (ss?.attributes as HassAttrs)?.unit_of_measurement ?? '';
      return html`<span class="ts-chip">${isNaN(v) ? ss?.state : v.toFixed(1)} ${u}</span>`;
    }) : null;
    return html`
      <div class="ts-sensor" style="--ts-accent:${accent}">
        <div class="ts-sensor-top">
          ${renderNameDot(device, online)}
          ${hdrChips && chipSpans ? html`<div class="ts-chips ts-chips-hdr">${chipSpans}</div>` : nothing}
          <span class="ts-sensor-dc">${dc}</span>
        </div>
        ${ctx.showEl('primary_value') ? html`<div class="ts-sensor-main">
          <span class="ts-sensor-val" style="color:${accent}">${isNaN(val) ? st?.state : val % 1 === 0 ? val : val.toFixed(1)}</span>
          <span class="ts-sensor-unit">${unit}</span>
        </div>` : nothing}
        ${ctx.showEl('trend') && pts.length >= 2 ? html`
          <div class="ts-sensor-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : ''}">
            ${trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} ${Math.abs(trend) < 0.05 ? 'stable' : Math.abs(trend).toFixed(1) + ' ' + unit + '/hr'}
          </div>` : nothing}
        ${ctx.showEl('graph') ? (() => {
          // Every selected graph sensor on the device, the primary one first —
          // not just the primary, which left a Wall Display's humidity ungraphed.
          // The style's own 'graph' element is the switch: a sensor card exists
          // to show history, so it does not also wait on Show graphs.
          const ge = ctx.getGraphSensors(device);
          const rows = [
            ...ge.filter(e => e.entityId === primaryEnt!.entity_id),
            ...ge.filter(e => e.entityId !== primaryEnt!.entity_id),
          ];
          return html`<div class="ts-sensor-spark">${ctx.renderSparklinesFiltered(device, rows)}</div>`;
        })() : nothing}
        ${bodyChips && chipSpans ? html`<div class="ts-chips" style="margin-top:6px">
          ${chipSpans}
        </div>` : nothing}
      </div>`;
  }

  // Binary sensor fallback
  const st = hass.states[binaryEnt!.entity_id];
  const isOn = st?.state === 'on';
  const dc = (st?.attributes as HassAttrs)?.device_class ?? '';
  const label = isOn
    ? (dc === 'motion' ? t('state.motion') : dc === 'moisture' ? t('state.flooded')
      : dc === 'smoke' ? t('state.smoke') : t('state.open'))
    : (dc === 'motion' ? t('state.clear') : dc === 'moisture' ? t('state.dry')
      : dc === 'smoke' ? t('state.clear') : t('state.closed'));
  const stateColor = isOn ? '#f87171' : 'var(--sc-online-color)';
  const lastChanged = st?.last_changed ? ctx.timeAgo(st.last_changed) : '';
  return html`
    <div class="ts-sensor" style="--ts-accent:${accent}">
      <div class="ts-sensor-top">
        ${renderNameDot(device, online)}
        <span class="ts-sensor-dc">${dc}</span>
      </div>
      ${ctx.showEl('primary_value') ? html`<div class="ts-sensor-binary-state" style="color:${stateColor}">
        <span class="ts-sensor-binary-dot" style="background:${stateColor}"></span>
        ${label}
      </div>` : nothing}
      ${lastChanged ? html`<div style="font-size:.7em;color:var(--sc-text-muted);margin-top:4px">${lastChanged}</div>` : nothing}
    </div>`;
}
