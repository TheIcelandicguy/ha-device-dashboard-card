import { html, svg, css, TemplateResult, CSSResult } from 'lit';
import { EntityAnimationType } from './types';

/**
 * Render an animation icon SVG.
 * outerCls: 'ent-icon' (15 px entity rows) | 'tile-icon' (18 px tile header) | 'icon-preview' (editor grid)
 */
export function renderAnimSvg(
  animType: EntityAnimationType,
  isOn: boolean,
  spdStyle: string,
  outerCls: string
): TemplateResult {
  if (animType === 'none') return html``;
  const st = isOn ? 'on' : 'off';

  if (animType === 'flame') return html`${svg`<svg class="${outerCls} ent-icon-flame ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="flame-main" d="M10 17 C6 17 4 14 4 11 C4 8 6 6 8 4 C8 7 9 8 10 8 C11 8 11 7 11 6 C13 8 16 10 16 13 C16 16 13.5 17 10 17Z" fill="currentColor"/>
    <path class="flame-inner" d="M10 15.5 C8 15.5 7 14 7.5 12 C8 13 9 13.5 10 13.5 C11 13.5 12 13 12 12 C12.5 14 12 15.5 10 15.5Z" fill="rgba(255,220,80,0.8)"/>
  </svg>`}`;

  if (animType === 'snowflake') return html`${svg`<svg class="${outerCls} ent-icon-snowflake" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="snow-arms" style="transform-origin:10px 10px">
      <line x1="10" y1="2.5" x2="10" y2="17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.5" y1="4.5" x2="4.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`;

  if (animType === 'fan') return html`${svg`<svg class="${outerCls} ent-icon-fan ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8"/>
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8" transform="rotate(120 10 10)"/>
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8" transform="rotate(240 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'pulse') return html`${svg`<svg class="${outerCls} ent-icon-pulse ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle class="pulse-ring" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'wave') return html`${svg`<svg class="${outerCls} ent-icon-wave" style="${spdStyle}" viewBox="0 0 20 20">
    <polyline class="energy-wave" points="2,10 5,5 8,15 11,5 14,15 18,10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}`;

  if (animType === 'sun') return html`${svg`<svg class="${outerCls} ent-icon-sun ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="sun-group" style="transform-origin:10px 10px">
      <circle cx="10" cy="10" r="3.5" fill="currentColor"/>
      <line x1="10" y1="2" x2="10" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="16" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2" y1="10" x2="4" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="16" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.3" y1="4.3" x2="5.7" y2="5.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14.3" y1="14.3" x2="15.7" y2="15.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.7" y1="4.3" x2="14.3" y2="5.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="5.7" y1="14.3" x2="4.3" y2="15.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </g>
  </svg>`}`;

  if (animType === 'lightning') return html`${svg`<svg class="${outerCls} ent-icon-lightning ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path d="M11.5 2 L5 11 L9.5 11 L8.5 18 L15 9 L10.5 9 Z" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'heart') return html`${svg`<svg class="${outerCls} ent-icon-heart ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="heart-shape" d="M10 16 C10 16 3 11 3 7 C3 4.5 5 3 7 3 C8.5 3 9.5 4 10 5 C10.5 4 11.5 3 13 3 C15 3 17 4.5 17 7 C17 11 10 16 10 16Z" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'bulb') return html`${svg`<svg class="${outerCls} ent-icon-bulb ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="bulb-body" d="M10 3 C7 3 5 5.5 5 8 C5 10.2 6.5 11.8 7 13 L13 13 C13.5 11.8 15 10.2 15 8 C15 5.5 13 3 10 3Z" fill="currentColor" opacity="0.9"/>
    <rect class="bulb-base1" x="7.5" y="13.5" width="5" height="1.5" rx="0.5" fill="currentColor" opacity="0.65"/>
    <rect class="bulb-base2" x="8.2" y="15.5" width="3.6" height="1" rx="0.5" fill="currentColor" opacity="0.4"/>
  </svg>`}`;

  if (animType === 'leaf') return html`${svg`<svg class="${outerCls} ent-icon-leaf ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="leaf-body" d="M10 17 C10 17 4 13 4 8 C4 5 7 3 10 3 C13 3 16 5 16 8 C16 13 10 17 10 17Z" fill="currentColor"/>
    <line x1="10" y1="17" x2="10" y2="9" stroke="rgba(0,0,0,0.25)" stroke-width="1" stroke-linecap="round"/>
  </svg>`}`;

  if (animType === 'moon') return html`${svg`<svg class="${outerCls} ent-icon-moon ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path d="M14 4 C10.7 4 8 6.7 8 10 C8 13.3 10.7 16 14 16 C11.4 16 9.4 13.3 9.4 10 C9.4 6.7 11.4 4 14 4Z" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'water') return html`${svg`<svg class="${outerCls} ent-icon-water ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="drop-body" d="M10 3 C10 3 5 9 5 13 C5 16 7.2 18 10 18 C12.8 18 15 16 15 13 C15 9 10 3 10 3Z" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'lock') return html`${svg`<svg class="${outerCls} ent-icon-lock ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="5" y="9" width="10" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    <path d="M7 9 L7 6.5 C7 4.3 13 4.3 13 6.5 L13 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="13.5" r="1.5" fill="rgba(0,0,0,0.35)"/>
  </svg>`}`;

  if (animType === 'flame2') return html`${svg`<svg class="${outerCls} ent-icon-flame2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="flame-main" d="M7 17 C4.5 17 3 15 3 12.5 C3 10 4.5 8.5 5.5 6.5 C5.5 9 6.5 10 7.5 10 C8 8.5 8 7.5 8 6 C9.5 7.5 11 9.5 11 12.5 C11 15 9.5 17 7 17Z" fill="currentColor"/>
    <path class="flame-b" d="M13 17 C10.5 17 9 15 9 12.5 C9 10 10.5 8.5 11.5 6.5 C11.5 9 12.5 10 13.5 10 C14 8.5 14 7.5 14 6 C15.5 7.5 17 9.5 17 12.5 C17 15 15.5 17 13 17Z" fill="currentColor" opacity="0.72"/>
  </svg>`}`;

  if (animType === 'flame3') return html`${svg`<svg class="${outerCls} ent-icon-flame3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <ellipse cx="10" cy="17" rx="6" ry="1.5" fill="currentColor" opacity="0.45"/>
    <line x1="6.5" y1="17" x2="9" y2="13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
    <line x1="13.5" y1="17" x2="11" y2="13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
    <path class="flame-main" d="M10 14.5 C8 14.5 6.5 12.5 6.5 10.5 C6.5 9 7.5 7.5 9 6 C9 8 9.5 9 10 9 C10.5 9 11 8 11 6 C12.5 7.5 13.5 9 13.5 10.5 C13.5 12.5 12 14.5 10 14.5Z" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'snowflake2') return html`${svg`<svg class="${outerCls} ent-icon-snowflake2" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="snow-arms" style="transform-origin:10px 10px">
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`;

  if (animType === 'snowflake3') return html`${svg`<svg class="${outerCls} ent-icon-snowflake3" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="snow-drift-g" style="transform-origin:10px 10px">
      <line x1="10" y1="2.5" x2="10" y2="17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.5" y1="4.5" x2="4.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`;

  if (animType === 'fan2') return html`${svg`<svg class="${outerCls} ent-icon-fan2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(90 10 10)"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(180 10 10)"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(270 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'fan3') return html`${svg`<svg class="${outerCls} ent-icon-fan3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9" transform="rotate(120 10 10)"/>
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9" transform="rotate(240 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'lightning2') return html`${svg`<svg class="${outerCls} ent-icon-lightning2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="bolt-a" d="M8 2 L4 9.5 L7.5 9.5 L6.5 17 L11 9.5 L7.5 9.5Z" fill="currentColor"/>
    <path class="bolt-b" d="M13.5 2 L9.5 9.5 L13 9.5 L12 17 L16.5 9.5 L13 9.5Z" fill="currentColor" opacity="0.65"/>
  </svg>`}`;

  if (animType === 'lightning3') return html`${svg`<svg class="${outerCls} ent-icon-lightning3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="arc-path" d="M3 4 Q10 1 17 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="3" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="17" cy="16" r="1.5" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'bulb2') return html`${svg`<svg class="${outerCls} ent-icon-bulb2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="bulb-body" d="M10 3 C7.5 3 6 5.2 6 7.5 C6 9.5 7 11.2 7.5 12.5 L12.5 12.5 C13 11.2 14 9.5 14 7.5 C14 5.2 12.5 3 10 3Z" fill="currentColor" opacity="0.85"/>
    <path class="bulb-filament" d="M8.5 9.5 Q9.5 8 10 9 Q10.5 10 11.5 8.5" fill="none" stroke="rgba(255,210,70,0.95)" stroke-width="0.9" stroke-linecap="round"/>
    <rect class="bulb-base1" x="7.8" y="13" width="4.4" height="1.5" rx="0.5" fill="currentColor" opacity="0.6"/>
    <rect class="bulb-base2" x="8.3" y="15" width="3.4" height="1" rx="0.5" fill="currentColor" opacity="0.4"/>
  </svg>`}`;

  if (animType === 'bulb3') return html`${svg`<svg class="${outerCls} ent-icon-bulb3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <polygon points="10,3 14.3,5.5 14.3,10.5 10,13 5.7,10.5 5.7,5.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle class="bulb-chip" cx="10" cy="8" r="2" fill="currentColor" opacity="0.9"/>
    <line x1="10" y1="13" x2="10" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="8" y1="15" x2="12" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`}`;

  if (animType === 'water2') return html`${svg`<svg class="${outerCls} ent-icon-water2" style="${spdStyle}" viewBox="0 0 20 20">
    <polyline class="wave-a" points="1,8 4,5 7,11 10,5 13,11 16,5 19,8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="48"/>
    <polyline class="wave-b" points="1,13 4,10 7,16 10,10 13,16 16,10 19,13" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="48" opacity="0.5"/>
  </svg>`}`;

  if (animType === 'water3') return html`${svg`<svg class="${outerCls} ent-icon-water3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
    <circle class="ripple1" cx="10" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle class="ripple2" cx="10" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.6"/>
  </svg>`}`;

  if (animType === 'sun2') return html`${svg`<svg class="${outerCls} ent-icon-sun2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path d="M3.5 13 A6.5 6.5 0 0 1 16.5 13 Z" fill="currentColor"/>
    <line x1="10" y1="2" x2="10" y2="5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="4.5" y1="4.5" x2="6.8" y2="6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="15.5" y1="4.5" x2="13.2" y2="6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="1.5" y1="10" x2="4.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="18.5" y1="10" x2="15.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="3.5" y1="13" x2="16.5" y2="13" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.35"/>
  </svg>`}`;

  if (animType === 'sun3') return html`${svg`<svg class="${outerCls} ent-icon-sun3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="sun-group" style="transform-origin:10px 10px">
      <circle cx="10" cy="10" r="3" fill="currentColor"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(30 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(90 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(150 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(180 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(210 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(240 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(270 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(300 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(330 10 10)"/>
    </g>
  </svg>`}`;

  if (animType === 'moon2') return html`${svg`<svg class="${outerCls} ent-icon-moon2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="7" fill="currentColor" opacity="0.9"/>
    <circle cx="7.5" cy="8" r="1.5" fill="rgba(0,0,0,0.14)"/>
    <circle cx="12.5" cy="12" r="1" fill="rgba(0,0,0,0.11)"/>
    <circle cx="8" cy="13" r="0.7" fill="rgba(0,0,0,0.1)"/>
  </svg>`}`;

  if (animType === 'moon3') return html`${svg`<svg class="${outerCls} ent-icon-moon3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path d="M14 4 C10.7 4 8 6.7 8 10 C8 13.3 10.7 16 14 16 C11.4 16 9.4 13.3 9.4 10 C9.4 6.7 11.4 4 14 4Z" fill="currentColor"/>
    <circle class="star1" cx="3.5" cy="5" r="0.9" fill="currentColor"/>
    <circle class="star2" cx="2" cy="12" r="0.7" fill="currentColor"/>
    <circle class="star3" cx="5.5" cy="16.5" r="0.7" fill="currentColor"/>
  </svg>`}`;

  // ── Wind ─────────────────────────────────────────────────────────────────────

  if (animType === 'wind') return html`${svg`<svg class="${outerCls} ent-icon-wind ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <polyline class="wind-line-a" points="2,6 5,5 8,7 11,5 14,7 18,6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24" opacity="1"/>
    <polyline class="wind-line-b" points="2,10 5,9 8,11 11,9 14,11 18,10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" opacity="0.65"/>
    <polyline class="wind-line-c" points="2,14 5,13 8,15 11,13 16,15" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="16" opacity="0.35"/>
  </svg>`}`;

  if (animType === 'wind2') return html`${svg`<svg class="${outerCls} ent-icon-wind2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <polyline class="gust-a" points="3,6 6,10 3,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="gust-b" points="8,6 11,10 8,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
    <polyline class="gust-c" points="13,6 16,10 13,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
  </svg>`}`;

  if (animType === 'wind3') return html`${svg`<svg class="${outerCls} ent-icon-wind3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="spiral-path" d="M10 10 C14 8 16 5 13 3 C10 1 7 4 8 7 C9 10 13 12 15 11 C18 9 17 5 14 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="8" cy="7" r="1" fill="currentColor" opacity="0.5"/>
  </svg>`}`;

  // ── Bell / Alarm ──────────────────────────────────────────────────────────────

  if (animType === 'bell') return html`${svg`<svg class="${outerCls} ent-icon-bell ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path d="M10 3 C10 3 7 5 7 9 L7 13 L4 14 L4 15 L16 15 L16 14 L13 13 L13 9 C13 5 10 3 10 3Z" fill="currentColor"/>
    <path d="M8.5 15.5 C8.5 16.5 9 17.5 10 17.5 C11 17.5 11.5 16.5 11.5 15.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="10" cy="2.5" r="1.2" fill="currentColor" opacity="0.6"/>
  </svg>`}`;

  if (animType === 'bell2') return html`${svg`<svg class="${outerCls} ent-icon-bell2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path d="M7 4 C7 4 5 6 5 9 L5 13 L3 14 L3 15 L13 15 L13 14 L11 13 L11 9 C11 6 9 4 7 4Z" fill="currentColor" opacity="0.9"/>
    <path d="M6.5 15.5 C6.5 16.3 7 17 8 17 C9 17 9.5 16.3 9.5 15.5" fill="none" stroke="currentColor" stroke-width="1.1"/>
    <path class="ring-a" d="M13 7 Q15 9 13 11" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path class="ring-b" d="M14.5 5.5 Q17.5 9 14.5 12.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <path class="ring-c" d="M16 4 Q20 9 16 14" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`;

  if (animType === 'bell3') return html`${svg`<svg class="${outerCls} ent-icon-bell3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <polygon points="10,2 18,16 2,16" fill="currentColor" opacity="0.85"/>
    <rect x="9.3" y="7" width="1.4" height="5" rx="0.7" fill="rgba(0,0,0,0.45)"/>
    <circle cx="10" cy="14" r="1" fill="rgba(0,0,0,0.45)"/>
  </svg>`}`;

  // ── Thermometer ───────────────────────────────────────────────────────────────

  if (animType === 'thermometer') return html`${svg`<svg class="${outerCls} ent-icon-thermometer ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="8.5" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect class="therm-mercury" x="9" y="7" width="2" height="6" rx="1" fill="currentColor"/>
    <circle cx="10" cy="15" r="3" fill="currentColor"/>
    <circle cx="10" cy="15" r="1.5" fill="rgba(255,255,255,0.25)"/>
  </svg>`}`;

  if (animType === 'thermometer2') return html`${svg`<svg class="${outerCls} ent-icon-thermometer2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="7" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect x="7.5" y="5" width="2" height="8" rx="1" fill="currentColor"/>
    <circle cx="8.5" cy="15" r="2.5" fill="currentColor"/>
    <polyline class="therm-arrow" points="14,12 14,5 12,7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="14" y1="5" x2="16" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`}`;

  if (animType === 'thermometer3') return html`${svg`<svg class="${outerCls} ent-icon-thermometer3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="8" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect x="8.5" y="6" width="2" height="7" rx="1" fill="currentColor"/>
    <circle cx="9.5" cy="15" r="2.5" fill="currentColor"/>
    <polyline class="therm-up" points="14.5,11 14.5,6 13,8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <line x1="14.5" y1="6" x2="16" y2="8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.9"/>
    <polyline class="therm-down" points="17.5,9 17.5,14 16,12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    <line x1="17.5" y1="14" x2="19" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/>
  </svg>`}`;

  // ── Battery ───────────────────────────────────────────────────────────────────

  if (animType === 'battery') return html`${svg`<svg class="${outerCls} ent-icon-battery ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="9" height="4" rx="0.8" fill="currentColor" opacity="0.9"/>
  </svg>`}`;

  if (animType === 'battery2') return html`${svg`<svg class="${outerCls} ent-icon-battery2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="4" height="4" rx="0.8" fill="currentColor" opacity="0.5"/>
    <path class="charge-bolt" d="M10 7.5 L8 10.5 L10 10.5 L8.5 13.5 L12 9.5 L10 9.5 Z" fill="currentColor" opacity="0.9"/>
  </svg>`}`;

  if (animType === 'battery3') return html`${svg`<svg class="${outerCls} ent-icon-battery3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="2" height="4" rx="0.8" fill="currentColor"/>
  </svg>`}`;

  // ── Star ──────────────────────────────────────────────────────────────────────

  if (animType === 'star') return html`${svg`<svg class="${outerCls} ent-icon-star ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <polygon points="10,2 12.2,7.6 18.1,7.6 13.5,11.4 15.3,17.1 10,13.6 4.7,17.1 6.5,11.4 1.9,7.6 7.8,7.6" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'star2') return html`${svg`<svg class="${outerCls} ent-icon-star2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <g class="star-body" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="10" rx="1.5" ry="8" fill="currentColor"/>
      <ellipse cx="10" cy="10" rx="8" ry="1.5" fill="currentColor"/>
      <ellipse cx="10" cy="10" rx="1.5" ry="8" fill="currentColor" transform="rotate(45 10 10)" opacity="0.6"/>
      <ellipse cx="10" cy="10" rx="8" ry="1.5" fill="currentColor" transform="rotate(45 10 10)" opacity="0.6"/>
    </g>
  </svg>`}`;

  if (animType === 'star3') return html`${svg`<svg class="${outerCls} ent-icon-star3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle cx="5" cy="5" r="2" fill="currentColor"/>
    <line class="star-tail" x1="5" y1="5" x2="15" y2="15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/>
    <line x1="5" y1="5" x2="12" y2="12" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`;

  // ── Pulse variants ────────────────────────────────────────────────────────────

  if (animType === 'pulse2') return html`${svg`<svg class="${outerCls} ent-icon-pulse2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle class="pulse-ring" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <circle class="pulse-ring2" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"/>
    <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'pulse3') return html`${svg`<svg class="${outerCls} ent-icon-pulse3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <polyline class="ekg-line" points="1,10 4,10 5.5,4 7,13 8.5,8 10,10 18,10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="0"/>
  </svg>`}`;

  // ── Wave variants ─────────────────────────────────────────────────────────────

  if (animType === 'wave2') return html`${svg`<svg class="${outerCls} ent-icon-wave2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect class="bar-odd"  x="2"  y="8"  width="2" height="8"  rx="1" fill="currentColor" style="transform-origin:3px 16px"/>
    <rect class="bar-even" x="5.5" y="5" width="2" height="11" rx="1" fill="currentColor" style="transform-origin:6.5px 16px"/>
    <rect class="bar-odd"  x="9"  y="7"  width="2" height="9"  rx="1" fill="currentColor" style="transform-origin:10px 16px"/>
    <rect class="bar-even" x="12.5" y="4" width="2" height="12" rx="1" fill="currentColor" style="transform-origin:13.5px 16px"/>
    <rect class="bar-odd"  x="16" y="9"  width="2" height="7"  rx="1" fill="currentColor" style="transform-origin:17px 16px"/>
  </svg>`}`;

  if (animType === 'wave3') return html`${svg`<svg class="${outerCls} ent-icon-wave3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
    <path class="arc-a" d="M6.5 6.5 A5 5 0 0 1 13.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    <path class="arc-a" d="M6.5 6.5 A5 5 0 0 0 13.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    <path class="arc-b" d="M4 4 A8.5 8.5 0 0 1 16 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
    <path class="arc-b" d="M4 4 A8.5 8.5 0 0 0 16 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
    <path class="arc-c" d="M1.5 1.5 A12 12 0 0 1 18.5 1.5" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.2"/>
    <path class="arc-c" d="M1.5 1.5 A12 12 0 0 0 18.5 1.5" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.2"/>
  </svg>`}`;

  if (animType === 'wave4') return html`${svg`<svg class="${outerCls} ent-icon-wave4 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
    <path class="wifi-a" d="M6.5 13 A5 5 0 0 1 13.5 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="wifi-b" d="M3.5 10 A9 9 0 0 1 16.5 10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>
    <path class="wifi-c" d="M1 7 A13 13 0 0 1 19 7" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`;

  // ── Heart variant ─────────────────────────────────────────────────────────────

  if (animType === 'heart2') return html`${svg`<svg class="${outerCls} ent-icon-heart2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path class="heart-shape" d="M10 16 C10 16 3 11 3 7 C3 4.5 5 3 7 3 C8.5 3 9.5 4 10 5 C10.5 4 11.5 3 13 3 C15 3 17 4.5 17 7 C17 11 10 16 10 16Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`}`;

  // ── Leaf variant ──────────────────────────────────────────────────────────────

  if (animType === 'leaf2') return html`${svg`<svg class="${outerCls} ent-icon-leaf2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <line x1="10" y1="18" x2="10" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="7.5" cy="11" rx="3" ry="1.8" fill="currentColor" opacity="0.9" transform="rotate(-30 7.5 11)"/>
    <ellipse cx="12.5" cy="9" rx="3" ry="1.8" fill="currentColor" opacity="0.7" transform="rotate(30 12.5 9)"/>
  </svg>`}`;

  // ── Lock variant ──────────────────────────────────────────────────────────────

  if (animType === 'lock2') return html`${svg`<svg class="${outerCls} ent-icon-lock2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="5" y="9" width="10" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    <path d="M7 9 L7 6.5 C7 4.3 13 4.3 13 6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="13.5" r="1.5" fill="rgba(0,0,0,0.35)"/>
  </svg>`}`;

  // ── Screens (Wall Display) ────────────────────────────────────────────────────
  // Shared frame: bezel, panel, stand. What moves is the panel.
  const screenFrame = svg`
    <rect x="2" y="3" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <line x1="7" y1="17.5" x2="13" y2="17.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="10" y1="14" x2="10" y2="17.5" stroke="currentColor" stroke-width="1.4"/>`;

  if (animType === 'display') return html`${svg`<svg class="${outerCls} ent-icon-display ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    ${screenFrame}
    <rect class="scr-panel" x="3.5" y="4.5" width="13" height="8" rx="0.8" fill="currentColor" opacity="0.35"/>
  </svg>`}`;

  if (animType === 'display2') return html`${svg`<svg class="${outerCls} ent-icon-display2 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    ${screenFrame}
    <rect x="3.5" y="4.5" width="13" height="8" rx="0.8" fill="currentColor" opacity="0.18"/>
    <rect class="scr-line" x="3.5" y="4.5" width="13" height="1.2" fill="currentColor" opacity="0.75"/>
  </svg>`}`;

  if (animType === 'display3') return html`${svg`<svg class="${outerCls} ent-icon-display3 ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    ${screenFrame}
    <rect class="scr-wake" x="3.5" y="4.5" width="13" height="8" rx="0.8" fill="currentColor" opacity="0.4" style="transform-origin:10px 8.5px"/>
  </svg>`}`;

  // ── Appliances ────────────────────────────────────────────────────────────────

  if (animType === 'oven') return html`${svg`<svg class="${outerCls} ent-icon-oven ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="3" y="3.5" width="14" height="13.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="6" cy="6.3" r="0.9" fill="currentColor"/>
    <circle cx="9" cy="6.3" r="0.9" fill="currentColor"/>
    <line x1="12" y1="6.3" x2="14.5" y2="6.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <rect x="5.5" y="9" width="9" height="6" rx="1" fill="currentColor" opacity="0.22"/>
    <path class="heat-a" d="M7.5 14 q0.8 -1 0 -2 t0 -2" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path class="heat-b" d="M10 14 q0.8 -1 0 -2 t0 -2" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path class="heat-c" d="M12.5 14 q0.8 -1 0 -2 t0 -2" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  </svg>`}`;

  if (animType === 'washer' || animType === 'washer2') return html`${svg`<svg class="${outerCls} ent-icon-${animType} ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="3" y="2" width="14" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="6" cy="4.8" r="0.8" fill="currentColor"/>
    <circle cx="8.5" cy="4.8" r="0.8" fill="currentColor"/>
    <circle cx="10" cy="11.5" r="4.8" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <g class="drum" style="transform-origin:10px 11.5px">
      <path d="M10 8.2 A3.3 3.3 0 0 1 13.3 11.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M10 14.8 A3.3 3.3 0 0 1 6.7 11.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </g>
    <path class="drum-water" d="M6.5 13 q1.2 -1 2.4 0 t2.4 0 t2.4 0" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6" stroke-dasharray="14"/>
  </svg>`}`;

  if (animType === 'dishwasher') return html`${svg`<svg class="${outerCls} ent-icon-dishwasher ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="3" y="3" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <line x1="5" y1="7.5" x2="15" y2="7.5" stroke="currentColor" stroke-width="1" stroke-dasharray="1.6 1.2" opacity="0.7"/>
    <line x1="5" y1="10.5" x2="15" y2="10.5" stroke="currentColor" stroke-width="1" stroke-dasharray="1.6 1.2" opacity="0.7"/>
    <line class="spray-arm" x1="6.5" y1="14.5" x2="13.5" y2="14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" style="transform-origin:10px 14.5px"/>
    <line class="spray-a" x1="8" y1="14" x2="6" y2="11.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.5"/>
    <line class="spray-b" x1="12" y1="14" x2="14" y2="11.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.5"/>
  </svg>`}`;

  // ── Heating and water ─────────────────────────────────────────────────────────

  if (animType === 'floorheat') return html`${svg`<svg class="${outerCls} ent-icon-floorheat ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="2" y="14" width="16" height="3.5" rx="0.8" fill="currentColor" opacity="0.85"/>
    <line x1="6.5" y1="14" x2="6.5" y2="17.5" stroke="rgba(0,0,0,0.4)" stroke-width="0.8"/>
    <line x1="10.5" y1="14" x2="10.5" y2="17.5" stroke="rgba(0,0,0,0.4)" stroke-width="0.8"/>
    <line x1="14.5" y1="14" x2="14.5" y2="17.5" stroke="rgba(0,0,0,0.4)" stroke-width="0.8"/>
    <path class="heat-a" d="M5.5 12 q1 -1.5 0 -3 t0 -3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path class="heat-b" d="M10 12 q1 -1.5 0 -3 t0 -3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path class="heat-c" d="M14.5 12 q1 -1.5 0 -3 t0 -3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`}`;

  if (animType === 'radiator') return html`${svg`<svg class="${outerCls} ent-icon-radiator ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="2.5" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <rect x="5.7" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <rect x="8.8" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <rect x="11.9" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <rect x="15.1" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <line x1="2.5" y1="9.5" x2="17.5" y2="9.5" stroke="rgba(0,0,0,0.35)" stroke-width="0.9"/>
    <line x1="2.5" y1="14.5" x2="17.5" y2="14.5" stroke="rgba(0,0,0,0.35)" stroke-width="0.9"/>
    <path class="heat-a" d="M6 5.5 q0.8 -1 0 -2 t0 -1.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path class="heat-b" d="M10 5.5 q0.8 -1 0 -2 t0 -1.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path class="heat-c" d="M14 5.5 q0.8 -1 0 -2 t0 -1.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  </svg>`}`;

  if (animType === 'valve') return html`${svg`<svg class="${outerCls} ent-icon-valve ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="1.5" y="11.5" width="17" height="3.6" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="9.1" y="8" width="1.8" height="4" fill="currentColor"/>
    <g class="wheel" style="transform-origin:10px 6px">
      <circle cx="10" cy="6" r="3.4" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <line x1="10" y1="2.6" x2="10" y2="9.4" stroke="currentColor" stroke-width="1.2"/>
      <line x1="6.6" y1="6" x2="13.4" y2="6" stroke="currentColor" stroke-width="1.2"/>
    </g>
  </svg>`}`;

  // ── Safety ────────────────────────────────────────────────────────────────────

  if (animType === 'smoke') return html`${svg`<svg class="${outerCls} ent-icon-smoke ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle class="det-ring" cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    <circle cx="10" cy="3.6" r="0.7" fill="currentColor" opacity="0.6"/>
    <circle cx="16.4" cy="10" r="0.7" fill="currentColor" opacity="0.6"/>
    <circle cx="10" cy="16.4" r="0.7" fill="currentColor" opacity="0.6"/>
    <circle cx="3.6" cy="10" r="0.7" fill="currentColor" opacity="0.6"/>
    <circle class="det-led" cx="10" cy="10" r="1.7" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'camera') return html`${svg`<svg class="${outerCls} ent-icon-camera ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="2.5" y="6" width="11" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <path d="M13.5 8.5 L18 6.5 L18 14.5 L13.5 12.5 Z" fill="currentColor" opacity="0.55"/>
    <circle cx="8" cy="10.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="8" cy="10.5" r="0.9" fill="currentColor"/>
    <circle class="rec-dot" cx="4.8" cy="8.2" r="0.9" fill="#f43f5e"/>
  </svg>`}`;

  // ── Lights and strips ─────────────────────────────────────────────────────────

  if (animType === 'strip' || animType === 'strip2') return html`${svg`<svg class="${outerCls} ent-icon-${animType} ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="1.5" y="7.5" width="17" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <circle class="led led-1" cx="4.5"  cy="10" r="1.15" fill="currentColor"/>
    <circle class="led led-2" cx="7.25" cy="10" r="1.15" fill="currentColor"/>
    <circle class="led led-3" cx="10"   cy="10" r="1.15" fill="currentColor"/>
    <circle class="led led-4" cx="12.75" cy="10" r="1.15" fill="currentColor"/>
    <circle class="led led-5" cx="15.5" cy="10" r="1.15" fill="currentColor"/>
  </svg>`}`;

  if (animType === 'plug') return html`${svg`<svg class="${outerCls} ent-icon-plug ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="7.3" y="3" width="1.8" height="5" rx="0.6" fill="currentColor"/>
    <rect x="10.9" y="3" width="1.8" height="5" rx="0.6" fill="currentColor"/>
    <rect x="5" y="8" width="10" height="7.5" rx="2" fill="currentColor" opacity="0.9"/>
    <line x1="10" y1="15.5" x2="10" y2="18.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <polygon class="spark" points="14.5,1.5 13,4.5 14.6,4.3 13.6,7 16.2,3.6 14.7,3.8" fill="currentColor"/>
  </svg>`}`;

  // ── Doors and rooms ───────────────────────────────────────────────────────────

  if (animType === 'garage') return html`${svg`<svg class="${outerCls} ent-icon-garage ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <path d="M2 9 L10 2.8 L18 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="3.5" y="9" width="13" height="8.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <rect class="door" x="6" y="10.5" width="8" height="7" fill="currentColor" opacity="0.7" style="transform-origin:10px 10.5px"/>
    <line x1="6" y1="13" x2="14" y2="13" stroke="rgba(0,0,0,0.35)" stroke-width="0.8"/>
    <line x1="6" y1="15.3" x2="14" y2="15.3" stroke="rgba(0,0,0,0.35)" stroke-width="0.8"/>
  </svg>`}`;

  if (animType === 'router') return html`${svg`<svg class="${outerCls} ent-icon-router ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <line x1="5" y1="11" x2="4" y2="3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="15" y1="11" x2="16" y2="3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="4" cy="3" r="1" fill="currentColor"/>
    <circle cx="16" cy="3" r="1" fill="currentColor"/>
    <rect x="2" y="11" width="16" height="6.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle class="led led-1" cx="5.5" cy="14.3" r="0.95" fill="currentColor"/>
    <circle class="led led-2" cx="8.5" cy="14.3" r="0.95" fill="currentColor"/>
    <circle class="led led-3" cx="11.5" cy="14.3" r="0.95" fill="currentColor"/>
    <line x1="14" y1="14.3" x2="16" y2="14.3" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  </svg>`}`;

  if (animType === 'pc') return html`${svg`<svg class="${outerCls} ent-icon-pc ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <rect x="11.5" y="2.5" width="6.5" height="15" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle class="pwr" cx="14.75" cy="5" r="0.85" fill="currentColor"/>
    <line x1="13" y1="7.5" x2="16.5" y2="7.5" stroke="currentColor" stroke-width="0.9" opacity="0.5"/>
    <line x1="13" y1="9.3" x2="16.5" y2="9.3" stroke="currentColor" stroke-width="0.9" opacity="0.5"/>
    <rect x="1.5" y="4" width="8.5" height="6.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <line x1="4" y1="13" x2="7.5" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="5.75" y1="10.5" x2="5.75" y2="13" stroke="currentColor" stroke-width="1.2"/>
    <rect class="act act-1" x="3.2" y="7.2" width="1.3" height="2" rx="0.4" fill="currentColor" style="transform-origin:3.85px 9.2px"/>
    <rect class="act act-2" x="5.1" y="6" width="1.3" height="3.2" rx="0.4" fill="currentColor" style="transform-origin:5.75px 9.2px"/>
    <rect class="act act-3" x="7" y="6.8" width="1.3" height="2.4" rx="0.4" fill="currentColor" style="transform-origin:7.65px 9.2px"/>
  </svg>`}`;

  if (animType === 'ble') return html`${svg`<svg class="${outerCls} ent-icon-ble ${st}" style="${spdStyle}" viewBox="0 0 20 20">
    <circle class="ble-ring" cx="10" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0"/>
    <path d="M6 6.5 L14 13.5 L10 17 L10 3 L14 6.5 L6 13.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}`;

  return html``;
}

/**
 * Semantic ON/OFF colours for each animation type.
 * ON  = the icon's active/lit colour shown in the editor picker.
 * OFF = the dimmed colour shown in the OFF-state picker.
 */
export const ANIM_COLORS: Record<EntityAnimationType, { on: string; off: string }> = {
  none:          { on: '#6b7280', off: '#6b7280' },
  flame:         { on: '#f97316', off: '#4b5563' },
  flame2:        { on: '#f97316', off: '#4b5563' },
  flame3:        { on: '#f97316', off: '#4b5563' },
  snowflake:     { on: '#7dd3fc', off: '#7dd3fc' }, // always coloured — cold is always cold
  snowflake2:    { on: '#7dd3fc', off: '#7dd3fc' },
  snowflake3:    { on: '#7dd3fc', off: '#7dd3fc' },
  fan:           { on: '#f4601e', off: '#4b5563' },
  fan2:          { on: '#f4601e', off: '#4b5563' },
  fan3:          { on: '#f4601e', off: '#4b5563' },
  pulse:         { on: '#f4601e', off: '#4b5563' },
  pulse2:        { on: '#f4601e', off: '#4b5563' },
  pulse3:        { on: '#f43f5e', off: '#4b5563' },
  wave:          { on: '#f4601e', off: '#4b5563' },
  wave2:         { on: '#5eead4', off: '#4b5563' },
  wave3:         { on: '#7dd3fc', off: '#4b5563' },
  wave4:         { on: '#93c5fd', off: '#4b5563' },
  sun:           { on: '#fbbf24', off: '#4b5563' },
  sun2:          { on: '#fbbf24', off: '#4b5563' },
  sun3:          { on: '#fbbf24', off: '#4b5563' },
  lightning:     { on: '#fbbf24', off: '#4b5563' },
  lightning2:    { on: '#fbbf24', off: '#4b5563' },
  lightning3:    { on: '#fbbf24', off: '#4b5563' },
  heart:         { on: '#f43f5e', off: '#4b5563' },
  heart2:        { on: '#f43f5e', off: '#4b5563' },
  bulb:          { on: '#fde047', off: '#6b7280' },
  bulb2:         { on: '#fbbf24', off: '#6b7280' },
  bulb3:         { on: '#e0f2fe', off: '#6b7280' },
  leaf:          { on: '#4ade80', off: '#4b5563' },
  leaf2:         { on: '#4ade80', off: '#4b5563' },
  moon:          { on: '#c4b5fd', off: '#4b5563' },
  moon2:         { on: '#f1f5f9', off: '#4b5563' },
  moon3:         { on: '#c4b5fd', off: '#4b5563' },
  water:         { on: '#38bdf8', off: '#4b5563' },
  water2:        { on: '#38bdf8', off: '#38bdf8' }, // always coloured
  water3:        { on: '#38bdf8', off: '#4b5563' },
  lock:          { on: '#a78bfa', off: '#4b5563' },
  lock2:         { on: '#7ecfff', off: '#4b5563' },
  wind:          { on: '#a5f3fc', off: '#4b5563' },
  wind2:         { on: '#a5f3fc', off: '#4b5563' },
  wind3:         { on: '#a5f3fc', off: '#4b5563' },
  bell:          { on: '#fde68a', off: '#4b5563' },
  bell2:         { on: '#fde68a', off: '#4b5563' },
  bell3:         { on: '#fca5a5', off: '#4b5563' },
  thermometer:   { on: '#fb923c', off: '#4b5563' },
  thermometer2:  { on: '#f87171', off: '#4b5563' },
  thermometer3:  { on: '#fb923c', off: '#4b5563' },
  battery:       { on: '#4ade80', off: '#4b5563' },
  battery2:      { on: '#fbbf24', off: '#4b5563' },
  battery3:      { on: '#f87171', off: '#6b7280' },
  star:          { on: '#fde047', off: '#4b5563' },
  star2:         { on: '#fde047', off: '#4b5563' },
  star3:         { on: '#fde047', off: '#4b5563' },
  display:       { on: '#7dd3fc', off: '#4b5563' },
  display2:      { on: '#7dd3fc', off: '#4b5563' },
  display3:      { on: '#7dd3fc', off: '#4b5563' },
  oven:          { on: '#fb923c', off: '#4b5563' },
  washer:        { on: '#7dd3fc', off: '#4b5563' },
  washer2:       { on: '#7dd3fc', off: '#4b5563' },
  dishwasher:    { on: '#38bdf8', off: '#4b5563' },
  floorheat:     { on: '#fb923c', off: '#4b5563' },
  radiator:      { on: '#f87171', off: '#4b5563' },
  valve:         { on: '#38bdf8', off: '#4b5563' },
  smoke:         { on: '#f87171', off: '#6b7280' }, // off = normal: quiet, green LED
  camera:        { on: '#e2e8f0', off: '#4b5563' },
  strip:         { on: '#c084fc', off: '#4b5563' },
  strip2:        { on: '#f472b6', off: '#4b5563' },
  plug:          { on: '#fde68a', off: '#4b5563' },
  garage:        { on: '#cbd5e1', off: '#4b5563' },
  ble:           { on: '#60a5fa', off: '#4b5563' },
  router:        { on: '#34d399', off: '#4b5563' },
  pc:            { on: '#93c5fd', off: '#4b5563' },
};

/**
 * Shared CSS for all icon animations — keyframes + animation rules.
 * Import this into any shadow-DOM component that renders icons.
 * Colors are NOT included here (injected via inline style per icon).
 */
export const ANIM_CSS: CSSResult = css`
  @keyframes flicker    { 0%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(.95) scaleY(1.04)} 66%{transform:scaleX(1.04) scaleY(.97)} 100%{transform:scaleX(.97) scaleY(1.03)} }
  @keyframes snow-spin  { to{transform:rotate(360deg)} }
  @keyframes fan-spin   { to{transform:rotate(360deg)} }
  @keyframes blink      { 50%{opacity:.3} }
  @keyframes icon-pulse { 0%,100%{filter:drop-shadow(0 0 3px var(--ipglow,currentColor))} 50%{filter:drop-shadow(0 0 8px var(--ipglow,currentColor))} }
  @keyframes wave-scroll{ to{stroke-dashoffset:-40} }
  @keyframes drip       { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06) translateY(1px)} }
  @keyframes heartbeat  { 0%,100%{transform:scale(1)} 20%{transform:scale(1.22)} 40%{transform:scale(1)} 60%{transform:scale(1.15)} }
  @keyframes leaf-sway  { 0%,100%{transform:rotate(0deg)} 33%{transform:rotate(6deg)} 66%{transform:rotate(-6deg)} }
  @keyframes snow-drift { 0%{transform:translateY(-3px) rotate(0deg)} 50%{transform:translateY(3px) rotate(180deg)} 100%{transform:translateY(-3px) rotate(360deg)} }
  @keyframes bolt-flash { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes arc-flash  { 0%,100%{opacity:0.15} 50%{opacity:1} }
  @keyframes ripple-out { 0%{r:2;opacity:0.8} 100%{r:9;opacity:0} }
  @keyframes twinkle    { 0%,100%{opacity:1} 50%{opacity:0.15} }
  @keyframes cover-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }
  @keyframes wind-blow  { 0%{transform:translateX(0);opacity:0.3} 50%{opacity:1} 100%{transform:translateX(4px);opacity:0.3} }
  @keyframes bell-ring  { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-10deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-7deg)} 80%{transform:rotate(7deg)} }
  @keyframes therm-pulse{ 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.65)} }
  @keyframes star-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
  @keyframes star-shoot { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(6px,-6px);opacity:0.15} }
  @keyframes ekg-scan   { to{stroke-dashoffset:-50} }
  @keyframes bar-bounce { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }

  /* Flame */
  .ent-icon-flame.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
  .ent-icon-flame.on .flame-inner { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }
  .ent-icon-flame2.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
  .ent-icon-flame2.on .flame-b    { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; animation-delay:calc(-0.4s / var(--ent-spd,1)); }
  .ent-icon-flame3.on .flame-main { animation:flicker calc(1.2s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 15px; }

  /* Snowflake */
  .ent-icon-snowflake  .snow-arms   { animation:snow-spin  calc(6s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-snowflake2 .snow-arms   { animation:snow-spin  calc(8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-snowflake3 .snow-drift-g{ animation:snow-drift calc(4s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Fan */
  .ent-icon-fan.on  .fan-blades { animation:fan-spin calc(1s   / var(--ent-spd,1)) linear infinite; }
  .ent-icon-fan2.on .fan-blades { animation:fan-spin calc(0.8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-fan3.on .fan-blades { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }

  /* Pulse */
  .ent-icon-pulse.on  .pulse-ring  { animation:icon-pulse  calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-pulse2.on .pulse-ring  { animation:ripple-out  calc(1.2s / var(--ent-spd,1)) ease-out    infinite; }
  .ent-icon-pulse2.on .pulse-ring2 { animation:ripple-out  calc(1.2s / var(--ent-spd,1)) ease-out    infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-pulse3.on .ekg-line    { animation:ekg-scan    calc(1.5s / var(--ent-spd,1)) linear      infinite; stroke-dasharray:50; stroke-dashoffset:0; }

  /* Wave */
  .ent-icon-wave   .energy-wave { stroke-dasharray:40; animation:wave-scroll calc(2s   / var(--ent-spd,1)) linear infinite; }
  .ent-icon-wave2.on .bar-odd   { animation:bar-bounce  calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate;         transform-origin:50% 100%; }
  .ent-icon-wave2.on .bar-even  { animation:bar-bounce  calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:50% 100%; }
  .ent-icon-wave3.on .arc-a { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wave3.on .arc-b { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-wave3.on .arc-c { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1s   / var(--ent-spd,1)); }
  .ent-icon-wave4.on .wifi-a { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wave4.on .wifi-b { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.45s / var(--ent-spd,1)); }
  .ent-icon-wave4.on .wifi-c { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s  / var(--ent-spd,1)); }

  /* Sun */
  .ent-icon-sun.on  .sun-group { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-sun3.on .sun-group { animation:snow-spin calc(4s / var(--ent-spd,1)) linear infinite; }

  /* Lightning */
  .ent-icon-lightning.on  { animation:icon-pulse calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lightning2.on .bolt-a { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lightning2.on .bolt-b { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }
  .ent-icon-lightning3.on .arc-path { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Heart */
  .ent-icon-heart.on  .heart-shape { animation:heartbeat calc(1s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-heart2.on .heart-shape { animation:heartbeat calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

  /* Bulb */
  .ent-icon-bulb.on  { animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bulb2.on { animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bulb3.on { animation:icon-pulse calc(2s   / var(--ent-spd,1)) ease-in-out infinite; }

  /* Leaf */
  .ent-icon-leaf.on  .leaf-body { animation:leaf-sway calc(3s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 17px; }
  .ent-icon-leaf2.on { animation:leaf-sway calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 18px; }

  /* Moon */
  .ent-icon-moon.on  { animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon2.on { animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon3.on .star1 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon3.on .star2 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s  / var(--ent-spd,1)); }
  .ent-icon-moon3.on .star3 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.4s / var(--ent-spd,1)); }

  /* Water */
  .ent-icon-water.on   .drop-body { animation:drip       calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-water2     .wave-a    { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear      infinite; }
  .ent-icon-water2     .wave-b    { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear      infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-water3.on  .ripple1   { animation:ripple-out  calc(2s / var(--ent-spd,1)) ease-out    infinite; }
  .ent-icon-water3.on  .ripple2   { animation:ripple-out  calc(2s / var(--ent-spd,1)) ease-out    infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }

  /* Lock */
  .ent-icon-lock.on  { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lock2.on { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Wind */
  .ent-icon-wind.on .wind-line-a { animation:wave-scroll calc(1.4s / var(--ent-spd,1)) linear infinite; stroke-dasharray:24; }
  .ent-icon-wind.on .wind-line-b { animation:wave-scroll calc(1.6s / var(--ent-spd,1)) linear infinite; stroke-dasharray:20; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
  .ent-icon-wind.on .wind-line-c { animation:wave-scroll calc(1.9s / var(--ent-spd,1)) linear infinite; stroke-dasharray:16; animation-delay:calc(-0.5s  / var(--ent-spd,1)); }
  .ent-icon-wind2.on .gust-a { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wind2.on .gust-b { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.33s / var(--ent-spd,1)); }
  .ent-icon-wind2.on .gust-c { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.66s / var(--ent-spd,1)); }
  .ent-icon-wind3.on { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Bell */
  .ent-icon-bell.on { animation:bell-ring calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 2.5px; }
  .ent-icon-bell2.on .ring-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bell2.on .ring-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
  .ent-icon-bell2.on .ring-c { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s  / var(--ent-spd,1)); }
  .ent-icon-bell3.on { animation:icon-pulse calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Thermometer */
  .ent-icon-thermometer.on  .therm-mercury { animation:therm-pulse   calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 13px; }
  .ent-icon-thermometer2.on .therm-arrow   { animation:cover-bounce  calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-thermometer3.on .therm-up      { animation:cover-bounce  calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-thermometer3.on .therm-down    { animation:cover-bounce  calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }

  /* Battery */
  .ent-icon-battery.on  { animation:icon-pulse  calc(2s   / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-battery2.on .charge-bolt { animation:bolt-flash calc(0.9s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-battery3.on { animation:blink       calc(1.2s / var(--ent-spd,1)) step-end    infinite; }

  /* Star */
  .ent-icon-star.on  { animation:star-pulse calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-star2.on .star-body { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; transform-origin:10px 10px; }
  .ent-icon-star3.on { animation:star-shoot calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; }

  /* Screens, appliances, heating, safety, strips, doors (2026-09) */
  @keyframes screen-flicker { 0%,100%{opacity:.35} 7%{opacity:.5} 11%{opacity:.22} 30%{opacity:.42} 46%{opacity:.18} 60%{opacity:.46} 78%{opacity:.3} }
  @keyframes scanline       { 0%{transform:translateY(0)} 100%{transform:translateY(6.8px)} }
  @keyframes screen-wake    { 0%{transform:scale(.06,.08);opacity:0} 35%{transform:scale(1,.1);opacity:1} 65%{transform:scale(1,1);opacity:.7} 100%{transform:scale(1,1);opacity:.4} }
  @keyframes heat-rise      { 0%{transform:translateY(2px);opacity:0} 40%{opacity:.9} 100%{transform:translateY(-3px);opacity:0} }
  @keyframes drum-tumble    { 0%{transform:rotate(0)} 45%{transform:rotate(320deg)} 60%{transform:rotate(290deg)} 100%{transform:rotate(360deg)} }
  @keyframes led-chase      { 0%,100%{opacity:.25} 20%{opacity:1} }
  @keyframes hue-cycle      { to{filter:hue-rotate(360deg)} }
  @keyframes garage-door    { 0%,15%{transform:scaleY(1)} 45%,55%{transform:scaleY(.12)} 85%,100%{transform:scaleY(1)} }
  @keyframes spark-pop      { 0%,70%,100%{opacity:0;transform:scale(.6)} 75%,85%{opacity:1;transform:scale(1)} }

  .ent-icon-display.on  .scr-panel { animation:screen-flicker calc(2.4s / var(--ent-spd,1)) steps(1,end) infinite; }
  .ent-icon-display2.on .scr-line  { animation:scanline calc(2s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-display3.on .scr-wake  { animation:screen-wake calc(3s / var(--ent-spd,1)) ease-out infinite; }
  .ent-icon-oven.on .heat-a, .ent-icon-floorheat.on .heat-a, .ent-icon-radiator.on .heat-a { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; }
  .ent-icon-oven.on .heat-b, .ent-icon-floorheat.on .heat-b, .ent-icon-radiator.on .heat-b { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-0.55s / var(--ent-spd,1)); }
  .ent-icon-oven.on .heat-c, .ent-icon-floorheat.on .heat-c, .ent-icon-radiator.on .heat-c { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-1.1s / var(--ent-spd,1)); }
  .ent-icon-oven.off .heat-a, .ent-icon-oven.off .heat-b, .ent-icon-oven.off .heat-c,
  .ent-icon-floorheat.off .heat-a, .ent-icon-floorheat.off .heat-b, .ent-icon-floorheat.off .heat-c,
  .ent-icon-radiator.off .heat-a, .ent-icon-radiator.off .heat-b, .ent-icon-radiator.off .heat-c { opacity:0; }
  .ent-icon-washer.on  .drum { animation:fan-spin calc(1.6s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-washer2.on .drum { animation:drum-tumble calc(2.4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-washer.on .drum-water, .ent-icon-washer2.on .drum-water { animation:wave-scroll calc(1.8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-washer.off .drum-water, .ent-icon-washer2.off .drum-water { opacity:0; }
  .ent-icon-dishwasher.on .spray-arm { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-dishwasher.on .spray-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-dishwasher.on .spray-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.4s / var(--ent-spd,1)); }
  .ent-icon-dishwasher.off .spray-a, .ent-icon-dishwasher.off .spray-b { opacity:0; }
  .ent-icon-valve.on .wheel { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-smoke.on  .det-led  { animation:blink calc(0.5s / var(--ent-spd,1)) step-end infinite; }
  .ent-icon-smoke.on  .det-ring { animation:icon-pulse calc(1s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-smoke.off .det-led  { fill:#4ade80; animation:blink calc(3s / var(--ent-spd,1)) step-end infinite; }
  .ent-icon-camera.on .rec-dot { animation:blink calc(1.2s / var(--ent-spd,1)) step-end infinite; }
  .ent-icon-camera.off .rec-dot { fill:currentColor; opacity:.4; }
  .ent-icon-strip.on .led-1 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-strip.on .led-2 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.2s / var(--ent-spd,1)); }
  .ent-icon-strip.on .led-3 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s / var(--ent-spd,1)); }
  .ent-icon-strip.on .led-4 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }
  .ent-icon-strip.on .led-5 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.3s / var(--ent-spd,1)); }
  .ent-icon-strip.off .led { opacity:.35; }
  .ent-icon-strip2.on { animation:hue-cycle calc(4s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-strip2.on .led-1 { fill:#f87171; } .ent-icon-strip2.on .led-2 { fill:#fbbf24; } .ent-icon-strip2.on .led-3 { fill:#4ade80; }
  .ent-icon-strip2.on .led-4 { fill:#38bdf8; } .ent-icon-strip2.on .led-5 { fill:#a78bfa; }
  .ent-icon-strip2.off .led { opacity:.35; }
  .ent-icon-plug.on  .spark { animation:spark-pop calc(2s / var(--ent-spd,1)) ease-out infinite; transform-origin:14.6px 4.3px; }
  .ent-icon-plug.off .spark { opacity:0; }
  .ent-icon-garage.on .door { animation:garage-door calc(4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-ble.on .ble-ring { animation:ripple-out calc(1.6s / var(--ent-spd,1)) ease-out infinite; }
  .ent-icon-router.on .led-1 { animation:led-chase calc(1.1s / var(--ent-spd,1)) steps(1,end) infinite; }
  .ent-icon-router.on .led-2 { animation:led-chase calc(0.7s / var(--ent-spd,1)) steps(1,end) infinite; animation-delay:calc(-0.3s / var(--ent-spd,1)); }
  .ent-icon-router.on .led-3 { animation:led-chase calc(1.3s / var(--ent-spd,1)) steps(1,end) infinite; animation-delay:calc(-0.8s / var(--ent-spd,1)); }
  .ent-icon-router.off .led { opacity:.3; }
  .ent-icon-pc.on .pwr   { animation:blink calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-pc.on .act-1 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate; }
  .ent-icon-pc.on .act-2 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; }
  .ent-icon-pc.on .act-3 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate; animation-delay:calc(-0.35s / var(--ent-spd,1)); }
  .ent-icon-pc.off .act  { opacity:.3; }
  .ent-icon-pc.off .pwr  { opacity:.4; }
`;

/** All selectable animation options with short display labels. */
export const ANIM_OPTIONS: Array<{ value: EntityAnimationType; label: string; group: string }> = [
  { value: 'none',        label: 'None',        group: '' },
  { value: 'flame',       label: 'Flame',       group: '🔥' },
  { value: 'flame2',      label: 'Double',      group: '🔥' },
  { value: 'flame3',      label: 'Campfire',    group: '🔥' },
  { value: 'snowflake',   label: 'Snow',        group: '❄️' },
  { value: 'snowflake2',  label: '6-arm',       group: '❄️' },
  { value: 'snowflake3',  label: 'Drifting',    group: '❄️' },
  { value: 'fan',         label: 'Fan 3',       group: '🌀' },
  { value: 'fan2',        label: 'Fan 4',       group: '🌀' },
  { value: 'fan3',        label: 'Vortex',      group: '🌀' },
  { value: 'lightning',   label: 'Bolt',        group: '⚡' },
  { value: 'lightning2',  label: 'Double',      group: '⚡' },
  { value: 'lightning3',  label: 'Arc',         group: '⚡' },
  { value: 'bulb',        label: 'Bulb',        group: '💡' },
  { value: 'bulb2',       label: 'Edison',      group: '💡' },
  { value: 'bulb3',       label: 'LED',         group: '💡' },
  { value: 'water',       label: 'Drop',        group: '💧' },
  { value: 'water2',      label: 'Waves',       group: '💧' },
  { value: 'water3',      label: 'Ripple',      group: '💧' },
  { value: 'sun',         label: 'Sun',         group: '☀️' },
  { value: 'sun2',        label: 'Sunrise',     group: '☀️' },
  { value: 'sun3',        label: 'Burst',       group: '☀️' },
  { value: 'moon',        label: 'Crescent',    group: '🌙' },
  { value: 'moon2',       label: 'Full',        group: '🌙' },
  { value: 'moon3',       label: 'Stars',       group: '🌙' },
  { value: 'pulse',        label: 'Pulse',      group: '◉' },
  { value: 'pulse2',       label: 'Double',     group: '◉' },
  { value: 'pulse3',       label: 'EKG',        group: '◉' },
  { value: 'wave',         label: 'Wave',       group: '〜' },
  { value: 'wave2',        label: 'Equalizer',  group: '〜' },
  { value: 'wave3',        label: 'Signal',     group: '〜' },
  { value: 'wave4',        label: 'WiFi',       group: '〜' },
  { value: 'heart',        label: 'Heart',      group: '❤️' },
  { value: 'heart2',       label: 'Outline',    group: '❤️' },
  { value: 'leaf',         label: 'Leaf',       group: '🌿' },
  { value: 'leaf2',        label: 'Sprout',     group: '🌿' },
  { value: 'lock',         label: 'Lock',       group: '🔒' },
  { value: 'lock2',        label: 'Unlocked',   group: '🔒' },
  { value: 'wind',         label: 'Flow',       group: '💨' },
  { value: 'wind2',        label: 'Gusts',      group: '💨' },
  { value: 'wind3',        label: 'Spiral',     group: '💨' },
  { value: 'bell',         label: 'Bell',       group: '🔔' },
  { value: 'bell2',        label: 'Ring',       group: '🔔' },
  { value: 'bell3',        label: 'Alarm',      group: '🔔' },
  { value: 'thermometer',  label: 'Therm',      group: '🌡️' },
  { value: 'thermometer2', label: 'Hot',        group: '🌡️' },
  { value: 'thermometer3', label: 'Cold/Hot',   group: '🌡️' },
  { value: 'battery',      label: 'Battery',    group: '🔋' },
  { value: 'battery2',     label: 'Charging',   group: '🔋' },
  { value: 'battery3',     label: 'Low',        group: '🔋' },
  { value: 'star',         label: 'Star',       group: '⭐' },
  { value: 'star2',        label: 'Sparkle',    group: '⭐' },
  { value: 'star3',        label: 'Shoot',      group: '⭐' },
  { value: 'display',      label: 'Flicker',    group: '🖥️' },
  { value: 'display2',     label: 'Scanline',   group: '🖥️' },
  { value: 'display3',     label: 'Wake',       group: '🖥️' },
  { value: 'oven',         label: 'Oven',       group: '🍳' },
  { value: 'washer',       label: 'Washer',     group: '🫧' },
  { value: 'washer2',      label: 'Tumble',     group: '🫧' },
  { value: 'dishwasher',   label: 'Dishes',     group: '🫧' },
  { value: 'floorheat',    label: 'Floor heat', group: '♨️' },
  { value: 'radiator',     label: 'Radiator',   group: '♨️' },
  { value: 'valve',        label: 'Valve',      group: '🚰' },
  { value: 'smoke',        label: 'Smoke det.', group: '🚨' },
  { value: 'camera',       label: 'Camera',     group: '📷' },
  { value: 'strip',        label: 'LED strip',  group: '🌈' },
  { value: 'strip2',       label: 'Rainbow',    group: '🌈' },
  { value: 'plug',         label: 'Plug',       group: '🔌' },
  { value: 'garage',       label: 'Garage',     group: '🚗' },
  { value: 'ble',          label: 'Bluetooth',  group: '📡' },
  { value: 'router',       label: 'Router',     group: '📡' },
  { value: 'pc',           label: 'PC',         group: '💻' },
];
