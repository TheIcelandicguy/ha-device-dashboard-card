import { html, svg, nothing, TemplateResult } from 'lit';
import type { HassAttrs } from '../types';
import { formatPower } from '../helpers';
import type { TileCtx } from './tile-context';

const WHEEL_SIZE = 140;
const WHEEL_R = WHEEL_SIZE / 2;

const toRad = (d: number) => (d * Math.PI) / 180;

export function renderLightControlTile(ctx: TileCtx): TemplateResult {
  const { device, isOn, accent, online, hass, profile } = ctx;
  const sw = ctx.getPrimarySwitch(device);
  const s = ctx.tileSensors(device);
  if (!sw) return html`<div class="ts-light"><span style="color:var(--sc-text-muted);font-size:.8em">No light entity</span></div>`;

  // Non-light devices (plug/relay/switch) assigned light-control style:
  // just show a large on/off button — no sliders or colour wheel
  if (sw.entityId.startsWith('switch.') || (profile.type !== 'dimmer' && profile.type !== 'rgb')) {
    return html`
      <div class="ts-light" style="--ts-accent:${accent}">
        <div class="ts-light-top">
          <div class="ts-light-name"><span class="dot ${online ? 'online' : 'offline'}"></span>${device.name}</div>
        </div>
        <div style="display:flex;justify-content:center;align-items:center;flex:1;padding:16px 0">
          <button class="tog ${isOn ? 'on' : 'off'}" style="font-size:1.1em;padding:10px 28px;border-radius:24px"
            @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>
            ${isOn ? 'ON' : 'OFF'}
          </button>
        </div>
        ${s.power != null ? html`<div style="font-size:.72em;color:var(--sc-text-muted);text-align:center">${formatPower(s.power)}</div>` : nothing}
      </div>`;
  }

  const bPct = isOn ? Math.max(1, sw.brightness ?? 1) : 0;
  const hasColor = !!(sw.colorModes?.length);
  const isRgbw = hasColor && (sw.colorModes?.some(m => m === 'rgbw' || m === 'rgbww') ?? false);
  const hexColor = hasColor && sw.rgbColor ? ctx.rgbToHex(...sw.rgbColor) : '#ffffff';
  const whiteVal = sw.whiteValue ?? 0;
  const swState = hass.states[sw.entityId];
  const attrs = (swState?.attributes as HassAttrs) ?? {};
  const effectList: string[] = attrs.effect_list ?? [];
  const currentEffect: string = attrs.effect ?? '';
  const supportsColorTemp = (attrs.supported_color_modes as string[] ?? []).some(m => m === 'color_temp');
  const colorTempMin: number = attrs.min_mireds ?? 153;
  const colorTempMax: number = attrs.max_mireds ?? 500;
  const colorTempCur: number = attrs.color_temp ?? colorTempMin;

  const dotR = hasColor && sw.rgbColor
    ? (() => {
        const [r, g, b] = sw.rgbColor!;
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        let h = 0;
        if (d > 0) {
          if      (max === r) h = ((g - b) / d + 6) % 6;
          else if (max === g) h = (b - r) / d + 2;
          else                h = (r - g) / d + 4;
        }
        const hDeg = h * 60;
        const sat = max === 0 ? 0 : d / max;
        const rad = toRad(hDeg - 90);
        return { x: WHEEL_R + sat * (WHEEL_R - 8) * Math.cos(rad), y: WHEEL_R + sat * (WHEEL_R - 8) * Math.sin(rad) };
      })()
    : null;

  const onWheelClick = (e: MouseEvent) => {
    if (!hasColor || !sw) return;
    e.stopPropagation();
    const el = e.currentTarget as SVGElement;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx, dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = rect.width / 2 - 8;
    if (dist > maxDist + 8) {
      const wrap = el.parentElement;
      if (wrap) {
        wrap.classList.remove('ts-wheel-pulse');
        void wrap.offsetWidth;
        wrap.classList.add('ts-wheel-pulse');
      }
      return;
    }
    const hDeg = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
    const sat = Math.min(1, dist / maxDist);
    const f = (n: number) => { const k = (n + hDeg / 60) % 6; return 1 - sat * Math.max(0, Math.min(k, 4 - k, 1)); };
    const rr = Math.round(f(5) * 255), gg = Math.round(f(3) * 255), bb = Math.round(f(1) * 255);
    hass.callService('light', 'turn_on', { entity_id: sw.entityId, rgb_color: [rr, gg, bb] });
  };

  const gradId = `wsat-${device.device_id.replace(/\W/g, '')}`;

  return html`
    <div class="ts-light" style="--ts-accent:${accent}" @click=${(e: Event) => e.stopPropagation()}>
      <div class="ts-light-top">
        <div class="ts-light-name"><span class="dot ${online ? 'online' : 'offline'}"></span>${device.name}</div>
        <button class="tog ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>
      </div>
      ${hasColor && ctx.showEl('color_wheel') ? html`
        <div class="ts-light-wheel-wrap">
          <svg width="${WHEEL_SIZE}" height="${WHEEL_SIZE}" viewBox="0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}"
            class="ts-light-wheel" @click=${onWheelClick} style="cursor:crosshair">
            <defs>
              <radialGradient id="${gradId}">
                <stop offset="0%"   stop-color="white" stop-opacity="1"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <foreignObject x="0" y="0" width="${WHEEL_SIZE}" height="${WHEEL_SIZE}">
              <div xmlns="http://www.w3.org/1999/xhtml" style="width:${WHEEL_SIZE}px;height:${WHEEL_SIZE}px;border-radius:50%;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);opacity:${isOn ? 1 : 0.3}"></div>
            </foreignObject>
            <circle cx="${WHEEL_R}" cy="${WHEEL_R}" r="${WHEEL_R}" fill="url(#${gradId})" opacity="${isOn ? 1 : 0.3}"/>
            ${dotR ? svg`<circle cx="${dotR.x.toFixed(1)}" cy="${dotR.y.toFixed(1)}" r="7" fill="${hexColor}" stroke="white" stroke-width="2" filter="drop-shadow(0 0 4px rgba(0,0,0,0.6))"/>` : nothing}
          </svg>
        </div>` : nothing}
      ${ctx.showEl('brightness') ? html`<div class="ts-light-row">
        <span class="ts-light-lbl">Brightness</span>
        <div style="display:flex;align-items:center;gap:6px;flex:1">
          <input type="range" class="dim-slider ts-light-slider" min="1" max="100"
            .value=${String(isOn ? bPct : 1)} ?disabled=${!isOn}
            style="--sl-color:${isOn ? hexColor : 'var(--sc-text-muted)'}"
            @input=${(e: Event) => { const pct = (e.target as HTMLInputElement).closest('.ts-light-row')?.querySelector('.ts-light-pct'); if (pct) pct.textContent = `${(e.target as HTMLInputElement).value}%`; }}
            @change=${(e: Event) => ctx.setBrightness(sw.entityId, parseInt((e.target as HTMLInputElement).value, 10))}/>
          <span class="ts-light-pct">${bPct}%</span>
        </div>
      </div>` : nothing}
      ${supportsColorTemp && ctx.showEl('color_temp') ? html`
        <div class="ts-light-row">
          <span class="ts-light-lbl">Temp</span>
          <div style="display:flex;align-items:center;gap:6px;flex:1">
            <input type="range" class="dim-slider ts-light-slider ts-light-ct" min="${colorTempMin}" max="${colorTempMax}"
              .value=${String(colorTempCur)} ?disabled=${!isOn}
              @change=${(e: Event) => { hass.callService('light', 'turn_on', { entity_id: sw.entityId, color_temp: parseInt((e.target as HTMLInputElement).value, 10) }); }}/>
            <span class="ts-light-pct">${Math.round(1000000 / colorTempCur)}K</span>
          </div>
        </div>` : nothing}
      ${isRgbw && ctx.showEl('white') ? html`
        <div class="ts-light-row">
          <span class="ts-light-lbl">White</span>
          <div style="display:flex;align-items:center;gap:6px;flex:1">
            <input type="range" class="dim-slider white-slider ts-light-slider" min="0" max="255"
              .value=${String(whiteVal)} ?disabled=${!isOn}
              @change=${(e: Event) => ctx.setColor(sw.entityId, hexColor, parseInt((e.target as HTMLInputElement).value, 10), true)}/>
            <span class="ts-light-pct">${whiteVal}</span>
          </div>
        </div>` : nothing}
      ${effectList.length > 1 && ctx.showEl('effects') ? html`
        <div class="tile-effects">
          ${effectList.filter(fx => fx !== 'Off').map(fx => html`
            <button class="effect-btn ${currentEffect === fx ? 'active' : ''}"
              @click=${() => hass.callService('light', 'turn_on', { entity_id: sw.entityId, effect: currentEffect === fx ? 'Off' : fx })}>${fx}</button>`)}
        </div>` : nothing}
      ${s.power != null && ctx.showEl('power') ? html`<div style="font-size:.72em;color:var(--sc-text-muted);margin-top:6px">${formatPower(s.power)}</div>` : nothing}
    </div>`;
}
