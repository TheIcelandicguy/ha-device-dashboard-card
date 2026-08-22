/**
 * Random palette generator for the editor's 🎲 / ✨ colour buttons.
 *
 * A random hue is only a good idea if the card stays readable, so every text
 * colour is nudged until it clears a WCAG floor against the surface behind it.
 * `scripts/test-palette.mjs` rolls a few hundred and asserts those floors —
 * the guarantee is only worth making because it is checked.
 */
import { THEME_PRESETS, type ThemePalette } from './themes';
import type { ThemePreset } from './types';

const chance = (p: number) => Math.random() < p;

/** A random preset name — the safe roll, always a combination that works. */
export function randomTheme(exclude?: ThemePreset): Exclude<ThemePreset, 'custom'> {
  const names = (Object.keys(THEME_PRESETS) as Array<Exclude<ThemePreset, 'custom'>>)
    .filter(n => n !== exclude);
  return names[Math.floor(Math.random() * names.length)];
}

// ── Generated palettes ────────────────────────────────────────────────────────

const hslToHex = (h: number, s: number, l: number): string => {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const v = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * v).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const luminance = (hex: string): number => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

/** WCAG contrast ratio between two hex colours. */
export const contrast = (a: string, b: string): number => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/** Nudge lightness until the colour clears `min` contrast against `bg`. */
function legible(h: number, s: number, startL: number, bg: string, min: number, up: boolean): string {
  let l = startL;
  for (let i = 0; i < 40; i++) {
    const hex = hslToHex(h, s, l);
    if (contrast(hex, bg) >= min) return hex;
    l += up ? 2 : -2;
    if (l > 98 || l < 2) break;
  }
  return hslToHex(h, s, up ? 98 : 2);
}

/**
 * A whole palette derived from one random hue. Dark or light scheme, with every
 * text colour pushed until it clears WCAG AA against the surface behind it — a
 * random hue should surprise you, not cost you the ability to read the card.
 */
export function randomPalette(): ThemePalette {
  const h = Math.floor(Math.random() * 360);
  const accentH = (h + (chance(0.5) ? 0 : 180)) % 360;
  const dark = chance(0.75);

  const cardBg = dark ? hslToHex(h, 18, 8) : hslToHex(h, 22, 96);
  const tileBg = dark ? hslToHex(h, 16, 13) : '#ffffff';
  const headerBg = dark ? hslToHex(h, 24, 14) : hslToHex(h, 30, 90);
  const accent = legible(accentH, 70, dark ? 62 : 45, tileBg, 3, dark);

  return {
    accent_color: accent,
    card_bg: cardBg,
    tile_bg: tileBg,
    tile_border: dark ? hslToHex(h, 14, 22) : hslToHex(h, 16, 84),
    tile_hover_bg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    tile_hover_shadow: 'rgba(0,0,0,0.35)',
    tile_sensor_bg: dark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.04)',
    tile_exp_bg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    text_primary: legible(h, 12, dark ? 92 : 14, tileBg, 7, dark),
    text_secondary: legible(h, 10, dark ? 72 : 34, tileBg, 4.5, dark),
    text_muted: legible(h, 8, dark ? 55 : 48, tileBg, 3, dark),
    header_bg: headerBg,
    header_bg2: dark ? hslToHex((h + 20) % 360, 28, 20) : hslToHex((h + 20) % 360, 34, 84),
    header_text_color: legible(h, 10, dark ? 94 : 12, headerBg, 7, dark),
    header_orb_color: accent,
    online_color: legible(140, 45, dark ? 62 : 36, tileBg, 3, dark),
    offline_color: legible(8, 60, dark ? 64 : 46, tileBg, 3, dark),
    power_color: legible(38, 70, dark ? 60 : 40, tileBg, 3, dark),
    area_header_color: accent,
  };
}
