import { html, nothing, TemplateResult } from 'lit';
import type { HADevice } from '../types';
import type { TileCtx, InputChannel } from './tile-context';

/** Standard name + online-dot header used across alt-style tiles. */
export function renderNameDot(device: HADevice, online: boolean, className = 'ts-hero-name'): TemplateResult {
  return html`
    <div class="${className} tile-trigger">
      <span class="dot ${online ? 'online' : 'offline'}"></span>${device.name}
    </div>`;
}

/** Standard "no X entity" fallback tile content. */
export function renderNoEntity(
  device: HADevice,
  online: boolean,
  tileClass: string,
  message: string,
): TemplateResult {
  return html`
    <div class="${tileClass}">
      ${renderNameDot(device, online)}
      <span style="color:var(--sc-text-muted);font-size:.8em">${message}</span>
    </div>`;
}

/** Action button on an input-channel row. Input hardware (i3/i4, UNI) has no
 *  output — HA cannot make it emit a press — so the row runs the action the user
 *  assigned to that channel. Unmapped channels stay read-only status rows. */
export function renderInputAction(
  ctx: TileCtx,
  device: HADevice,
  ch: InputChannel,
): TemplateResult | typeof nothing {
  const label = ctx.getInputActionLabel(device, ch);
  if (!label) return nothing;
  const hold = ctx.inputHasHold(device, ch);
  const end = () => ctx.endInputHold();
  return html`
    <button class="input-act ${hold ? 'holdable' : ''}"
      title=${hold ? `${label} — hold to dim` : label}
      @click=${(e: Event) => ctx.runInputAction(device, ch, e)}
      @pointerdown=${(e: Event) => ctx.startInputHold(device, ch, e)}
      @pointerup=${end} @pointerleave=${end} @pointercancel=${end}
      >${label}</button>`;
}
