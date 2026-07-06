import { html, nothing, TemplateResult } from 'lit';
import type { HassAttrs } from '../types';
import type { TileCtx } from './tile-context';
import { renderNameDot, renderNoEntity } from './tile-parts';

const PRESET_ICONS: Record<string, string> = { comfort: '🏠', eco: '🌿', boost: '🚀', away: '🌙', none: '❄️' };

export function renderClimateControlTile(ctx: TileCtx): TemplateResult {
  const { device, accent, online, hass } = ctx;
  const trv = ctx.getTrv(device);

  if (!trv) return renderNoEntity(device, online, 'ts-climate', 'No climate entity');

  const isHeating = trv.hvacAction === 'heating';
  const battEnt = device.entities.find(e => e.domain === 'sensor' &&
    (hass.states[e.entity_id]?.attributes as HassAttrs)?.device_class === 'battery');
  const battPct = battEnt ? parseFloat(hass.states[battEnt.entity_id]?.state ?? '') || null : null;

  return html`
    <div class="ts-climate" style="--ts-accent:${accent}" @click=${(e: Event) => e.stopPropagation()}>
      <div class="ts-climate-top">
        ${renderNameDot(device, online)}
        <div style="display:flex;align-items:center;gap:6px">
          ${isHeating
            ? html`<span style="font-size:11px;padding:2px 7px;border-radius:10px;background:rgba(249,115,22,0.18);color:#f97316;font-weight:600">🔥 Heating</span>`
            : html`<span style="font-size:11px;padding:2px 7px;border-radius:10px;background:rgba(255,255,255,0.06);color:var(--sc-text-muted)">Idle</span>`}
        </div>
      </div>
      ${ctx.renderTrvDial(trv)}
      <div class="trv-dial-btns">
        <button class="trv-step" @click=${() => ctx.adjustTrvTemp(trv, -1)}>−</button>
        <span class="trv-flame">${isHeating ? '🔥' : ''}</span>
        <button class="trv-step" @click=${() => ctx.adjustTrvTemp(trv, 1)}>+</button>
      </div>
      <div class="trv-stat-row">
        <div class="trv-stat"><span class="trv-stat-lbl">Now</span><span class="trv-stat-val">${trv.currentTemp != null ? `${trv.currentTemp}°` : '—'}</span></div>
        <div class="trv-stat"><span class="trv-stat-lbl">Set</span><span class="trv-stat-val">${trv.targetTemp != null ? `${trv.targetTemp.toFixed(1)}°` : '—'}</span></div>
        ${trv.valvePosition != null ? html`<div class="trv-stat"><span class="trv-stat-lbl">Valve</span><span class="trv-stat-val">${Math.round(trv.valvePosition)}%</span></div>` : nothing}
        ${battPct != null ? html`<div class="trv-stat"><span class="trv-stat-lbl">Batt</span><span class="trv-stat-val">${battPct}%</span></div>` : nothing}
      </div>
      ${trv.presetModes.length ? html`<div class="trv-presets">${trv.presetModes.map(p => html`
        <button class="trv-preset-btn ${trv.presetMode === p ? 'active' : ''}"
          @click=${() => ctx.setPresetMode(trv.entityId, p)}>${(PRESET_ICONS[p] ?? '') + p}</button>`)}
      </div>` : nothing}
    </div>`;
}
