import { html, nothing, TemplateResult } from 'lit';
import type { HADevice } from '../types';
import type { TileCtx, InputChannel } from './tile-context';

/** header_chips (an opt-in element) moves a style's secondary chips into the
 *  name row; the style's own chip placement then stands down — the chips move,
 *  they don't duplicate. Gated on 'secondary' too, so hiding the readings
 *  hides them wherever they sit. One predicate for every style that supports
 *  the placement, so the mutual exclusion can't drift per style. */
export function chipsInHeader(ctx: TileCtx): boolean {
  return ctx.showEl('header_chips') && ctx.showEl('secondary');
}

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

/** One input-channel status row: state dot, name, last event and how long ago,
 *  plus whatever action the channel carries. Shared by the block tile's
 *  `input_channels` block, the scene-button tile and input-control's list of
 *  channels that have no action bound. */
export function renderInputRow(
  ctx: TileCtx,
  device: HADevice,
  ch: InputChannel,
): TemplateResult {
  const hasAction = ctx.getInputActionLabel(device, ch) != null;
  // A button reports its last press ("single push · 21h ago"); a switch reports
  // its position. Neither is a dash — a row that only ever said "—" was the
  // reason input tiles read as broken.
  const status = ch.kind === 'button'
    ? (ch.lastEvent ? ch.lastEvent.replace(/_/g, ' ') : 'no press yet')
    : (ch.isOn ? 'On' : 'Off');
  // With no action to run, the row itself opens the entity's more-info — a
  // button's press history, a switch's state log — instead of doing nothing.
  const open = hasAction ? undefined : (e: Event) => { e.stopPropagation(); ctx.fireMoreInfo(ch.entityId); };
  return html`
    <div class="input-row ${ch.isButton ? 'btn-mode' : 'sw-mode'} ${ch.isOn ? 'active' : ''} ${open ? 'tappable' : ''}"
      title=${open ? 'Show history' : ''} @click=${open}>
      <span class="${ch.isButton ? 'input-btn-dot' : 'input-row-dot'}"></span>
      <span class="input-row-name">${ch.label}</span>
      <span class="input-row-event ${ch.kind === 'switch' ? (ch.isOn ? 'is-on' : 'is-off') : ''}">${status}</span>
      <span class="input-row-time">${ctx.timeAgo(ch.lastChanged)}</span>
      <span class="input-row-act">${renderInputAction(ctx, device, ch)}</span>
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
  const chip = ctx.getInputSelectChip(device, ch);
  if (!label) return chip ? renderInputSelectChip(ctx, chip) : nothing;
  const hold = ctx.inputHasHold(device, ch);
  const end = () => ctx.endInputHold();
  // While a hold ramps, the button shows the ramp instead of its label —
  // direction and where the light is — so a hold visibly does something.
  const dim = ctx.getInputDimFeedback(ch);
  return html`
    <button class="input-act ${hold ? 'holdable' : ''} ${dim ? 'dimming' : ''}"
      title=${hold ? `${label} — hold to dim` : label}
      @click=${(e: Event) => ctx.runInputAction(device, ch, e)}
      @pointerdown=${(e: Event) => ctx.startInputHold(device, ch, e)}
      @pointerup=${end} @pointerleave=${end} @pointercancel=${end}
      >${dim ? `${dim.dir > 0 ? '▲' : '▼'} ${dim.pct}%` : label}</button>
    ${chip ? renderInputSelectChip(ctx, chip) : nothing}`;
}

/** The row's dropdown chip. A native <select> so it works with touch and
 *  keyboard; clicks are kept off the tile so picking an option doesn't also
 *  open the detail sheet. */
export function renderInputSelectChip(
  ctx: TileCtx,
  chip: { entity: string; label?: string; options: string[]; current: string },
): TemplateResult {
  return html`
    <select class="input-sel" title=${chip.label ?? chip.entity}
      @click=${(e: Event) => e.stopPropagation()}
      @pointerdown=${(e: Event) => e.stopPropagation()}
      @change=${(e: Event) => {
        e.stopPropagation();
        ctx.setInputSelectOption(chip.entity, (e.target as HTMLSelectElement).value);
      }}>
      ${chip.options.map(o => html`
        <option value=${o} ?selected=${o === chip.current}>${chip.label ? `${chip.label}: ${o}` : o}</option>`)}
    </select>`;
}

/** Some WLED builds prefix audio-reactive effects with a note glyph. */
const SOUND_GLYPH = /^\s*[♪♫♬♩]\s*/;

/** WLED's audio-reactive effects. HA's WLED integration reports plain effect
 *  names — no ♪/♫ markers survive — so the set has to be known here. Read off a
 *  WLED 16.0.0 device's `/json/fxdata`, where the flags field carries `v`
 *  (volume reactive) or `f` (frequency reactive); guessing from names alone gets
 *  it wrong in both directions (Swirl and Akemi are audio, DNA and Matrix are
 *  not). Anything not listed simply groups as an ordinary effect. */
const WLED_SOUND_EFFECTS = new Set([
  'pixels', 'pixelwave', 'juggles', 'matripix', 'gravimeter', 'plasmoid',
  'puddles', 'midnoise', 'noisemeter', 'freqwave', 'freqmatrix', 'geq',
  'waterfall', 'freqpixels', 'noisefire', 'puddlepeak', 'noisemove',
  'ripple peak', 'freqmap', 'gravcenter', 'gravcentric', 'gravfreq',
  'dj light', 'funky plank', 'blurz', 'waverly', 'swirl', 'rocktaves',
  'akemi', 'ps spray', 'ps geq 2d', 'ps geq nova', 'ps blobs', 'ps geq 1d',
  'ps sonic stream', 'ps sonic boom', 'ps springy',
]);

const isSoundReactive = (fx: string): boolean =>
  SOUND_GLYPH.test(fx) || WLED_SOUND_EFFECTS.has(fx.replace(SOUND_GLYPH, '').trim().toLowerCase());

/**
 * Effect picker. WLED exposes ~190 effects and rendering them as chips buried
 * the rest of the tile under a wall of buttons, so this is a dropdown: sound-
 * reactive effects grouped first, everything else after, each in the order the
 * integration reported them.
 */
export function renderEffectPicker(
  effectList: string[],
  currentEffect: string | null,
  setEffect: (fx: string) => void,
): TemplateResult | typeof nothing {
  if (effectList.length <= 1) return nothing;

  const sound = effectList.filter(isSoundReactive);
  const plain = effectList.filter(fx => !isSoundReactive(fx) && fx !== 'Off');
  // Clearing the effect means picking whatever this light calls "no effect".
  const reset = effectList.find(fx => fx === 'Off') ?? effectList.find(fx => fx === 'Solid');

  const option = (fx: string) => html`
    <option value=${fx} ?selected=${currentEffect === fx}>${fx}</option>`;

  return html`
    <div class="tile-effects" @click=${(e: Event) => e.stopPropagation()}>
      <select class="effect-sel"
        @pointerdown=${(e: Event) => e.stopPropagation()}
        @change=${(e: Event) => {
          e.stopPropagation();
          setEffect((e.target as HTMLSelectElement).value);
        }}>
        ${reset ? html`
          <option value=${reset} ?selected=${!currentEffect || currentEffect === reset}>— no effect —</option>` : nothing}
        ${sound.length ? html`
          <optgroup label="Sound reactive">${sound.map(option)}</optgroup>` : nothing}
        <optgroup label="Effects">${plain.filter(fx => fx !== reset).map(option)}</optgroup>
      </select>
    </div>`;
}
