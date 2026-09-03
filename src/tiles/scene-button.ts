import { html, nothing, TemplateResult } from 'lit';
import { renderAnimSvg } from '../anim-icons';
import type { EntityAnimationType } from '../types';
import type { TileCtx } from './tile-context';
import { renderNameDot, renderInputRow } from './tile-parts';

export function renderSceneButtonTile(ctx: TileCtx): TemplateResult {
  const { device, accent, online, config } = ctx;
  const inputs = ctx.getInputChannels(device);
  const devSt = config.device_styles?.[device.device_id];
  const tileIconType = (devSt?.tile_icon ?? 'pulse') as EntityAnimationType;
  const iconSize = devSt?.tile_icon_size ?? 1;
  const cmdIcon = renderAnimSvg(tileIconType, true, `--ent-spd:${devSt?.tile_icon_speed ?? 1};color:${accent}`, 'ts-scene-icon');

  const lastChanged = device.entities.reduce((best, e) => {
    const lc = ctx.hass.states[e.entity_id]?.last_changed ?? '';
    return lc > best ? lc : best;
  }, '');
  const timeAgoStr = lastChanged ? ctx.timeAgo(lastChanged) : '';

  if (inputs.length > 0) {
    return html`
      <div class="ts-scene" style="--ts-accent:${accent}">
        <div class="ts-scene-top">
          ${renderNameDot(device, online)}
        </div>
        ${ctx.showEl('input_rows') ? html`<div class="tile-inputs">
          ${inputs.map(ch => renderInputRow(ctx, device, ch))}
        </div>` : nothing}
      </div>`;
  }

  return html`
    <div class="ts-scene ts-scene-centered" style="--ts-accent:${accent}"
      @click=${(e: Event) => { e.stopPropagation(); ctx.handleScenePress(device); }}>
      ${ctx.showEl('icon') ? html`<div class="ts-scene-icon-wrap" style="--ent-size:${iconSize}">${cmdIcon}</div>` : nothing}
      ${ctx.showEl('name') ? html`<div class="ts-scene-name">${device.name}</div>` : nothing}
      ${timeAgoStr && ctx.showEl('timestamp') ? html`<div class="ts-scene-time">${timeAgoStr}</div>` : nothing}
      <div class="ts-scene-ripple"></div>
    </div>`;
}
