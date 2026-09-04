import { html, svg, nothing, TemplateResult } from 'lit';
import type { TileCtx } from './tile-context';
import { renderNameDot } from './tile-parts';

const SLATS = [3, 7, 11, 15, 19, 23, 27]; // y positions of slat centres

export function renderCoverControlTile(ctx: TileCtx): TemplateResult {
  const { device, accent, online } = ctx;
  const cover = ctx.getCover(device);
  if (!cover) return html`<div class="ts-cover"><span style="color:var(--sc-text-muted);font-size:.8em">No cover entity</span></div>`;

  const pos = cover.position ?? (cover.state === 'open' ? 100 : 0);
  const moving = cover.state === 'opening' || cover.state === 'closing';
  const visibleSlats = Math.ceil((pos / 100) * SLATS.length);

  return html`
    <div class="ts-cover" style="--ts-accent:${accent}" @click=${(e: Event) => e.stopPropagation()}>
      <div class="ts-cover-top">
        ${renderNameDot(device, online)}
        ${ctx.showEl('position_pct') ? html`<span class="ts-cover-pct" style="color:${accent}">${Math.round(pos)}%</span>` : nothing}
      </div>
      ${ctx.showEl('shutter_graphic') ? html`<div class="ts-cover-graphic">
        <svg viewBox="0 0 60 32" style="width:100%;height:40px">
          <rect x="1" y="1" width="58" height="1.5" rx="0.75" fill="currentColor" opacity=".6"/>
          <line x1="30" y1="2.5" x2="30" y2="31" stroke="currentColor" stroke-width="0.8" opacity=".3"/>
          ${SLATS.map((y, i) => svg`<rect x="3" y="${y}" width="54" height="3" rx="1" fill="${accent}" opacity="${i < visibleSlats ? '0.85' : '0.1'}"/>`)}
        </svg>
        ${moving && ctx.showEl('moving_label') ? html`<span class="ts-cover-state">${cover.state === 'opening' ? '▲ Opening…' : '▼ Closing…'}</span>` : nothing}
      </div>` : nothing}
      ${ctx.showEl('buttons') ? html`<div class="ts-cover-btns">
        <button class="ts-cover-btn" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'open',  e)}>▲</button>
        <button class="ts-cover-btn ts-cover-stop" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'stop', e)}>■</button>
        <button class="ts-cover-btn" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'close', e)}>▼</button>
      </div>` : nothing}
      ${cover.position != null && ctx.showEl('position_slider') ? html`
        <input type="range" class="ts-cover-slider" min="0" max="100" .value=${String(Math.round(pos))}
          title="Position" aria-label="Cover position"
          @pointerdown=${(e: Event) => e.stopPropagation()}
          @change=${(e: Event) => ctx.setCoverPosition(cover.entityId, parseInt((e.target as HTMLInputElement).value, 10))}/>` : nothing}
      ${ctx.showEl('graphs') && ctx.getGraphEntities(device).length
        ? html`<div class="ts-lower-section ts-lower-graphs">${ctx.renderSparklines(device)}</div>` : nothing}
    </div>`;
}
