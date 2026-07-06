import { html, TemplateResult } from 'lit';
import type { HADevice } from '../types';

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
