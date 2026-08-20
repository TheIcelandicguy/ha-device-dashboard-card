import { html, nothing, TemplateResult } from 'lit';
import type { TileCtx, InputChannel } from './tile-context';
import type { HADevice } from '../types';
import { renderNameDot, renderInputRow, renderInputSelectChip } from './tile-parts';

/**
 * Input devices (Shelly i3, Plus/Gen3 i4, UNI) rendered as what they physically
 * are: a keypad. The hardware has no output of its own — nothing in HA can make
 * it emit a press — so a channel only becomes a key once the user binds an
 * action to it. Channels without one stay compact status rows, which is why a
 * half-configured device shows both halves.
 */
export function renderInputControlTile(ctx: TileCtx): TemplateResult {
  const { device, accent, online } = ctx;
  const channels = ctx.getInputChannels(device);

  const wired = channels.filter(ch => ctx.getInputActionLabel(device, ch) != null);
  const bare = channels.filter(ch => ctx.getInputActionLabel(device, ch) == null);

  // 1 key gets the full width; 2-4 sit 2-up (a 3rd wraps under, which reads as a
  // wall plate); 5+ go 3-up before the labels get too cramped to read.
  const cols = wired.length <= 1 ? 1 : wired.length <= 4 ? 2 : 3;

  return html`
    <div class="ts-inputs" style="--ts-accent:${accent}">
      ${ctx.showEl('name') ? html`
        <div class="ts-inputs-top">${renderNameDot(device, online)}</div>` : nothing}

      ${wired.length && ctx.showEl('keypad') ? html`
        <div class="ts-keys" style="--keys:${cols}"
          @click=${(e: Event) => e.stopPropagation()}>
          ${wired.map(ch => renderKey(ctx, device, ch))}
        </div>` : nothing}

      ${bare.length && ctx.showEl('input_rows') ? html`
        <div class="tile-inputs ${wired.length ? 'ts-inputs-rest' : ''}"
          @click=${(e: Event) => e.stopPropagation()}>
          ${bare.map(ch => renderInputRow(ctx, device, ch))}
        </div>` : nothing}

      ${!channels.length ? html`
        <span class="ts-inputs-empty">No input channels</span>` : nothing}
    </div>`;
}

/** One keypad key. Tap runs the channel's action, hold dims where configured;
 *  both come from TileCtx so the gesture handling stays in one place. */
function renderKey(ctx: TileCtx, device: HADevice, ch: InputChannel): TemplateResult {
  const label = ctx.getInputActionLabel(device, ch)!;
  const state = ctx.getInputActionState(device, ch);
  const chip = ctx.getInputSelectChip(device, ch);
  const holdable = ctx.inputHasHold(device, ch);
  const end = () => ctx.endInputHold();

  // The channel's own name is only worth a second line when it says something
  // the action label doesn't — otherwise the key would read "Stokkur / Stokkur".
  const sub = ch.label && ch.label.toLowerCase() !== label.toLowerCase() ? ch.label : '';

  return html`
    <div class="ts-key-wrap">
      <button
        class="ts-key ${state ? `is-${state}` : 'is-neutral'} ${holdable ? 'holdable' : ''}"
        title=${holdable ? `${label} — hold to dim` : label}
        @click=${(e: Event) => ctx.runInputAction(device, ch, e)}
        @pointerdown=${(e: Event) => ctx.startInputHold(device, ch, e)}
        @pointerup=${end} @pointerleave=${end} @pointercancel=${end}>
        <span class="ts-key-pip"></span>
        <span class="ts-key-label">${label}</span>
        ${sub && ctx.showEl('target_state') ? html`<span class="ts-key-sub">${sub}</span>` : nothing}
        ${ctx.showEl('last_event') && ch.lastChanged
          ? html`<span class="ts-key-age">${ctx.timeAgo(ch.lastChanged)}</span>` : nothing}
      </button>
      ${chip ? renderInputSelectChip(ctx, chip) : nothing}
    </div>`;
}
