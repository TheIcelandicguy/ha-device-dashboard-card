import { html, nothing, TemplateResult } from 'lit';
import type { HassAttrs } from '../types';
import type { TileCtx } from './tile-context';
import { renderNameDot, renderNoEntity, chipsInHeader } from './tile-parts';
import { t } from '../localize';
import { pickPrimarySensor, pickPrimaryBinary, pickSecondarySensors } from '../sensor-pick';
import { namedEntitiesOn } from '../sensor-keys';
import { stripDevicePrefix, formatReading } from '../helpers';
import type { StatesMap } from '../sensor-pick';


export function renderSensorCardTile(ctx: TileCtx): TemplateResult {
  const { device, accent, online, hass, config } = ctx;

  // Both selections live in sensor-pick.ts so they cannot drift apart again —
  // the primary used to demand one of five device classes while the chips below
  // asked only whether a reading was usable.
  // A named entity in `sensors` says outright what this tile is about; without
  // one the picker falls back to its class preference.
  const named = ctx.sensorSelection(device);
  const primaryEnt = pickPrimarySensor(device, hass.states as StatesMap, named);
  const binaryEnt = !primaryEnt ? pickPrimaryBinary(device, hass.states as StatesMap) : undefined;

  if (!primaryEnt && !binaryEnt) return renderNoEntity(device, online, 'ts-sensor', t('empty.no_sensor'));

  if (primaryEnt) {
    const st = hass.states[primaryEnt.entity_id];
    const val = parseFloat(st?.state ?? '');
    const unit = (st?.attributes as HassAttrs)?.unit_of_measurement ?? '';
    // What the big number is. A device_class says it for recognised hardware
    // ("temperature"), and says nothing at all for the readings that have none
    // — a PC led with a bare "35 %" and left you to infer from the graphs
    // underneath which of them it was. Fall back to the entity's own name.
    const primaryAttrs = st?.attributes as HassAttrs | undefined;
    const dc = (primaryAttrs?.device_class as string)
      || stripDevicePrefix((primaryAttrs?.friendly_name as string) ?? '', device.name)
      || primaryEnt.entity_id.split('.')[1]?.replace(/_/g, ' ')
      || '';
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
    const secEnts = pickSecondarySensors(
      device, hass.states as StatesMap, primaryEnt.entity_id, 4, named);
    // header_chips (opt-in) moves the secondary chips into the name row; the
    // bottom placement then stands down — they move, they don't duplicate.
    const hdrChips = chipsInHeader(ctx);
    const bodyChips = !hdrChips && ctx.showEl('secondary');
    // Built only when a placement will render them — a "lean tiles" config
    // with secondary off shouldn't pay for markup that is never inserted.
    // Chips from a device_class are self-describing: "60.0 lx" can only be the
    // illuminance. An entity named by id is not — "49.8 %" and "12.1 %" side by
    // side are memory and GPU and the tile has no way to say which. So a named
    // chip carries its name, and uses the general formatter rather than a fixed
    // one decimal ("2904 MHz", not "2904.0 MHz").
    const namedIds = new Set(namedEntitiesOn(device, named).map(e => e.entity_id));
    // Naming even one reading turns labelling on for the whole row. Named chips
    // fill the first slots and the automatic pick fills the rest, so a labelled
    // "memoryusage 50.6 %" next to a bare "34.0 %" is the worst of both — you
    // cannot tell what the second one is, and the mismatch reads as a fault.
    const labelled = secEnts.some(e => namedIds.has(e.entity_id));
    const chipSpans = (hdrChips || bodyChips) && secEnts.length ? secEnts.map(e => {
      const ss = hass.states[e.entity_id];
      const a = ss?.attributes as HassAttrs;
      const v = parseFloat(ss?.state ?? '');
      const u = (a?.unit_of_measurement as string) ?? '';
      if (!labelled) {
        return html`<span class="ts-chip">${isNaN(v) ? ss?.state : v.toFixed(1)} ${u}</span>`;
      }
      const lbl = stripDevicePrefix((a?.friendly_name as string) ?? '', device.name)
        || e.entity_id.split('.')[1]?.replace(/_/g, ' ') || e.entity_id;
      return html`<span class="ts-chip" title=${lbl}>
        <span class="ts-chip-lbl">${lbl}</span>${isNaN(v) ? ss?.state : formatReading(v, u)}</span>`;
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
