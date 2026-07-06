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
        <span class="ts-cover-pct" style="color:${accent}">${Math.round(pos)}%</span>
      </div>
      <div class="ts-cover-graphic">
        <svg viewBox="0 0 60 32" style="width:100%;height:40px">
          <rect x="1" y="1" width="58" height="1.5" rx="0.75" fill="currentColor" opacity=".6"/>
          <line x1="30" y1="2.5" x2="30" y2="31" stroke="currentColor" stroke-width="0.8" opacity=".3"/>
          ${SLATS.map((y, i) => svg`<rect x="3" y="${y}" width="54" height="3" rx="1" fill="${accent}" opacity="${i < visibleSlats ? '0.85' : '0.1'}"/>`)}
        </svg>
        ${moving ? html`<span class="ts-cover-state">${cover.state === 'opening' ? '▲ Opening…' : '▼ Closing…'}</span>` : nothing}
      </div>
      <div class="ts-cover-btns">
        <button class="ts-cover-btn" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'open',  e)}>▲</button>
        <button class="ts-cover-btn ts-cover-stop" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'stop', e)}>■</button>
        <button class="ts-cover-btn" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'close', e)}>▼</button>
      </div>
    </div>`;
}
