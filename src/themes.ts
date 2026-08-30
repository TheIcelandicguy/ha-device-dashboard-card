import type { HADeviceDashboardConfig, ThemePreset } from './types';

/** The colour subset of `style` a theme preset sets. */
export type ThemePalette = Partial<NonNullable<HADeviceDashboardConfig['style']>>;

/** Named colour-only palettes. Applying one writes these keys into `config.style`;
 *  everything else (radius, font, sizes) is left alone. `dark_industrial` is the
 *  ship default and is deliberately identical to the runtime fallback colours in
 *  `_buildCardStyles`, so a fresh card with no `theme` renders as this preset. */
export const THEME_PRESETS: Record<Exclude<ThemePreset, 'custom'>, ThemePalette> = {
  // ── Ship default — subtle & warm: muted terracotta on warm charcoal
  //    (== runtime CSS-default colours, so a fresh card renders as this) ──
  warm_dusk: {
    accent_color: '#c98a63',
    card_bg: '#1e1a17',
    tile_bg: 'rgba(255,244,232,0.035)',
    tile_border: 'rgba(255,244,232,0.08)',
    tile_hover_bg: 'rgba(255,244,232,0.06)',
    tile_hover_shadow: 'rgba(0,0,0,0.35)',
    tile_sensor_bg: 'rgba(255,244,232,0.045)',
    tile_exp_bg: 'rgba(255,244,232,0.05)',
    text_primary: '#ece5dc',
    text_secondary: '#b3a596',
    text_muted: '#7e7265',
    header_bg: '#241f1b',
    header_bg2: '#33291f',
    header_text_color: '#f3ece3',
    header_orb_color: '#c98a63',
    online_color: '#93b384',
    offline_color: '#d47f62',
    power_color: '#dba25c',
    area_header_color: '#c98a63',
  },
  // ── Shelly orange on near-black, industrial ──
  dark_industrial: {
    accent_color: '#f4601e',
    card_bg: '#1c1c1e',
    tile_bg: 'rgba(255,255,255,0.04)',
    tile_border: 'rgba(255,255,255,0.07)',
    tile_hover_bg: 'rgba(255,255,255,0.07)',
    tile_hover_shadow: 'rgba(0,0,0,0.30)',
    tile_sensor_bg: 'rgba(255,255,255,0.04)',
    tile_exp_bg: 'rgba(255,255,255,0.06)',
    text_primary: '#e5e7eb',
    text_secondary: '#9ca3af',
    text_muted: '#6b7280',
    header_bg: '#1a1a2e',
    header_bg2: '#0f3460',
    header_text_color: '#ffffff',
    header_orb_color: '#3b82f6',
    online_color: '#4ade80',
    offline_color: '#ef4444',
    power_color: '#fb923c',
    area_header_color: '#f4601e',
  },
  // ── Azure on deep slate-blue, modeled on the Shelly Control app's dark look ──
  shelly_blue: {
    accent_color: '#3ea1f5',
    card_bg: '#12161f',
    tile_bg: '#1a212e',
    tile_border: '#263247',
    tile_hover_bg: 'rgba(62,161,245,0.08)',
    tile_hover_shadow: 'rgba(0,0,0,0.40)',
    tile_sensor_bg: 'rgba(62,161,245,0.06)',
    tile_exp_bg: 'rgba(62,161,245,0.08)',
    text_primary: '#e9eef6',
    text_secondary: '#a9b7cd',
    text_muted: '#6b7a91',
    header_bg: '#151b28',
    header_bg2: '#1e2c47',
    header_text_color: '#eef3fa',
    header_orb_color: '#3ea1f5',
    online_color: '#39c86e',
    offline_color: '#ef5350',
    power_color: '#f5a623',
    area_header_color: '#3ea1f5',
  },
  // ── Teal on deep green-black, terminal vibe ──
  teal_terminal: {
    accent_color: '#2dd4bf',
    card_bg: '#0b0f0e',
    tile_bg: '#0f1917',
    tile_border: '#1e2b28',
    tile_hover_bg: 'rgba(45,212,191,0.08)',
    tile_hover_shadow: 'rgba(0,0,0,0.40)',
    tile_sensor_bg: 'rgba(45,212,191,0.05)',
    tile_exp_bg: 'rgba(45,212,191,0.07)',
    text_primary: '#d1fae5',
    text_secondary: '#6ee7b7',
    text_muted: '#4b5563',
    header_bg: '#042f2e',
    header_bg2: '#0b6157',
    header_text_color: '#ccfbf1',
    header_orb_color: '#2dd4bf',
    online_color: '#34d399',
    offline_color: '#f87171',
    power_color: '#fbbf24',
    area_header_color: '#2dd4bf',
  },
  // ── High-contrast flat, yellow on pure black ──
  brutalist: {
    accent_color: '#facc15',
    card_bg: '#000000',
    tile_bg: '#0a0a0a',
    tile_border: '#ffffff',
    tile_hover_bg: 'rgba(255,255,255,0.12)',
    tile_hover_shadow: 'rgba(250,204,21,0.25)',
    tile_sensor_bg: 'rgba(255,255,255,0.06)',
    tile_exp_bg: 'rgba(255,255,255,0.09)',
    text_primary: '#ffffff',
    text_secondary: '#d4d4d4',
    text_muted: '#a3a3a3',
    header_bg: '#000000',
    header_bg2: '#171717',
    header_text_color: '#facc15',
    header_orb_color: '#facc15',
    online_color: '#22c55e',
    offline_color: '#ef4444',
    power_color: '#facc15',
    area_header_color: '#ffffff',
  },
  // ── Light theme — Apple-blue on frosted white ──
  frosted_light: {
    accent_color: '#0071e3',
    card_bg: '#f2f2f7',
    tile_bg: '#ffffff',
    tile_border: '#d1d1d6',
    tile_hover_bg: 'rgba(0,0,0,0.04)',
    tile_hover_shadow: 'rgba(0,0,0,0.12)',
    tile_sensor_bg: 'rgba(0,0,0,0.04)',
    tile_exp_bg: 'rgba(0,0,0,0.05)',
    text_primary: '#1c1c1e',
    text_secondary: '#48484a',
    text_muted: '#8e8e93',
    header_bg: '#e8eef7',
    header_bg2: '#cfe0f5',
    header_text_color: '#1c1c1e',
    header_orb_color: '#0071e3',
    online_color: '#34c759',
    offline_color: '#ff3b30',
    power_color: '#ff9500',
    area_header_color: '#0071e3',
  },
  // ── Nord palette, warm aurora accents ──
  nordic_warm: {
    accent_color: '#d08770',
    card_bg: '#2e3440',
    tile_bg: '#3b4252',
    tile_border: '#434c5e',
    tile_hover_bg: 'rgba(236,239,244,0.06)',
    tile_hover_shadow: 'rgba(0,0,0,0.30)',
    tile_sensor_bg: 'rgba(236,239,244,0.04)',
    tile_exp_bg: 'rgba(236,239,244,0.06)',
    text_primary: '#eceff4',
    text_secondary: '#d8dee9',
    text_muted: '#9aa4b8',
    header_bg: '#3b4252',
    header_bg2: '#434c5e',
    header_text_color: '#eceff4',
    header_orb_color: '#ebcb8b',
    online_color: '#a3be8c',
    offline_color: '#bf616a',
    power_color: '#d08770',
    area_header_color: '#d08770',
  },
  // ── Violet on deep indigo-black ──
  midnight_purple: {
    accent_color: '#a78bfa',
    card_bg: '#0f0a1e',
    tile_bg: '#1a1030',
    tile_border: '#2e1f4d',
    tile_hover_bg: 'rgba(167,139,250,0.10)',
    tile_hover_shadow: 'rgba(0,0,0,0.45)',
    tile_sensor_bg: 'rgba(167,139,250,0.06)',
    tile_exp_bg: 'rgba(167,139,250,0.08)',
    text_primary: '#ede9fe',
    text_secondary: '#c4b5fd',
    text_muted: '#7c6ba8',
    header_bg: '#1e1b4b',
    header_bg2: '#4c1d95',
    header_text_color: '#ede9fe',
    header_orb_color: '#a78bfa',
    online_color: '#4ade80',
    offline_color: '#fb7185',
    power_color: '#c084fc',
    area_header_color: '#a78bfa',
  },
};

/** Display order + labels for the theme picker. */
export const THEME_ORDER: Array<Exclude<ThemePreset, 'custom'>> = [
  'warm_dusk', 'shelly_blue', 'dark_industrial', 'teal_terminal', 'brutalist',
  'frosted_light', 'nordic_warm', 'midnight_purple',
];

export const THEME_LABELS: Record<ThemePreset, string> = {
  warm_dusk: 'Warm Dusk',
  shelly_blue: 'Shelly Blue',
  dark_industrial: 'Dark Industrial',
  teal_terminal: 'Teal Terminal',
  brutalist: 'Brutalist',
  frosted_light: 'Frosted Light',
  nordic_warm: 'Nordic Warm',
  midnight_purple: 'Midnight Purple',
  custom: 'Custom',
};

/** The ship default preset — a card with no `theme` set renders as this. */
export const DEFAULT_THEME: Exclude<ThemePreset, 'custom'> = 'warm_dusk';

/** The colour keys a palette covers (all presets share this key set). Used to
 *  snapshot the current colours when saving a custom theme before overwriting. */
export const THEME_KEYS = Object.keys(THEME_PRESETS.dark_industrial) as Array<keyof ThemePalette>;

// applyThemePalette (merge a preset into `style`) lived here. It is gone on
// purpose: writing the palette into `style` shadowed `theme` on every key, which
// is the drift migrateConfig now undoes. Applying a theme CLEARS those keys —
// see _applyTheme in editor.ts.

/** Which preset the given style currently matches exactly on every palette key,
 *  or 'custom' if none. Used to highlight the active theme in the picker. */
export function detectTheme(
  style: NonNullable<HADeviceDashboardConfig['style']> | undefined,
): ThemePreset {
  const s = style ?? {};
  // A card with no style set renders on the CSS defaults, which ARE DEFAULT_THEME.
  if (Object.keys(s).length === 0) return DEFAULT_THEME;
  for (const name of THEME_ORDER) {
    const pal = THEME_PRESETS[name];
    let match = true;
    for (const k of Object.keys(pal) as Array<keyof ThemePalette>) {
      if (s[k] !== pal[k]) { match = false; break; }
    }
    if (match) return name;
  }
  return 'custom';
}
