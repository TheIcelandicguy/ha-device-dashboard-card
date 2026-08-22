/**
 * Card builder — turn a set of choices into a whole card config, and roll random
 * ones. Pure: no DOM, no hass, no Lit, so the editor can drive it and a test can
 * assert on what it emits.
 *
 * Two rules it keeps:
 *  - Emit only what differs from the built-in defaults. A generated config should
 *    read like something a person wrote, not a dump of every key.
 *  - A generated palette must stay legible. "Surprise me" picks a hue, not a
 *    lottery ticket — text is contrast-checked against the surface behind it.
 */
import type {
  HADeviceDashboardConfig, TileStyle, PowerMonitorVariant, TileSize, SortBy,
  EnergyPeriod, GraphType, ThemePreset,
} from './types';
import { THEME_PRESETS, type ThemePalette } from './themes';
import { DEFAULT_HEADER_CHIPS } from './helpers';

export interface BuilderChoices {
  /** Discovery — universal opens the card to every HA device. */
  universal: boolean;
  scope: 'devices' | 'controllable' | 'all';
  /** Colours: a preset name, or 'custom' with a generated palette. */
  theme: ThemePreset;
  palette?: ThemePalette;
  /** Tiles. '' means the adaptive block tile. */
  tileStyle: TileStyle | '';
  variant: PowerMonitorVariant;
  smart: boolean;
  tileSize: TileSize;
  columns: number;
  /** Content. */
  chips: string[];
  headerChips: string[];
  showGraphs: boolean;
  graphType: GraphType;
  showTitle: boolean;
  showStats: boolean;
  showCloud: boolean;
  orbs: boolean;
  delegate: boolean;
  energyPeriod: EnergyPeriod;
  sortBy: SortBy;
}

export const DEFAULT_CHOICES: BuilderChoices = {
  universal: false, scope: 'devices',
  theme: 'warm_dusk', tileStyle: '', variant: 'big-number', smart: false,
  tileSize: 'md', columns: 3,
  chips: [], headerChips: [...DEFAULT_HEADER_CHIPS],
  showGraphs: true, graphType: 'line',
  showTitle: true, showStats: true, showCloud: false, orbs: false,
  delegate: false, energyPeriod: 'total', sortBy: 'name',
};

/** Assemble a card config. Only non-defaults are written. */
export function buildCardConfig(c: BuilderChoices, title?: string): HADeviceDashboardConfig {
  const out: Record<string, unknown> = { type: 'custom:ha-device-dashboard' };
  if (title?.trim()) out.title = title.trim();

  if (c.universal) {
    out.mode = 'universal';
    if (c.scope !== 'devices') out.universal_scope = c.scope;
  }

  // Colours: a preset is just its name — writing the palette into `style` would
  // shadow the theme, which is the drift migrateConfig exists to undo.
  if (c.theme === 'custom' && c.palette) {
    out.theme = 'custom';
    out.style = { ...c.palette };
  } else if (c.theme !== 'warm_dusk') {
    out.theme = c.theme;
  }

  if (c.tileStyle) {
    out.tile_style = c.tileStyle;
    if (c.tileStyle === 'power-monitor' && c.variant !== 'big-number') out.power_monitor_variant = c.variant;
  }
  if (c.smart) out.smart_tile_styles = true;
  if (c.tileSize !== 'md') out.tile_size = c.tileSize;
  if (c.columns !== 3) out.columns = c.columns;
  if (c.sortBy !== 'name') out.sort_by = c.sortBy;

  if (c.chips.length) out.sensors = [...c.chips];
  const hc = c.headerChips;
  if (hc.length !== DEFAULT_HEADER_CHIPS.length || hc.some((k, i) => k !== DEFAULT_HEADER_CHIPS[i])) {
    out.header_chips = [...hc];
  }
  if (!c.showGraphs) out.show_graphs = false;
  else if (c.graphType !== 'line') out.graph_style = { type: c.graphType };

  if (!c.showTitle) out.header_show_title = false;
  if (!c.showStats) out.header_show_stats = false;
  if (c.showCloud) out.header_show_cloud = true;
  if (c.orbs) out.header_show_orbs = true;
  if (c.delegate) out.delegate_controls = true;
  if (c.energyPeriod !== 'total') out.energy_period = c.energyPeriod;

  return out as HADeviceDashboardConfig;
}

// ── Random ────────────────────────────────────────────────────────────────────

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const chance = (p: number) => Math.random() < p;

const ROLLABLE_STYLES: Array<TileStyle | ''> = ['', '', 'power-monitor', 'sensor-card', 'light-control'];
const VARIANTS: PowerMonitorVariant[] = ['big-number', 'gauge', 'graph', 'compact', 'table'];
const SIZES: TileSize[] = ['sm', 'md', 'md', 'lg'];
const GRAPH_TYPES: GraphType[] = ['line', 'area', 'bar'];
const PERIODS: EnergyPeriod[] = ['total', 'today', 'week', 'month'];
const SORTS: SortBy[] = ['name', 'name', 'power', 'area'];

/**
 * A roll from the vocabularies the card already ships, so every result is a
 * combination that works. `chipPool` is the caller's chip vocabulary — the
 * builder does not own that list.
 */
export function randomChoices(chipPool: string[], base: BuilderChoices = DEFAULT_CHOICES): BuilderChoices {
  const themes = Object.keys(THEME_PRESETS) as Array<Exclude<ThemePreset, 'custom'>>;
  const style = pick(ROLLABLE_STYLES);
  // Chips: a handful, never none — an empty list would mean "no chips at all".
  const shuffled = [...chipPool].sort(() => Math.random() - 0.5);
  const chips = shuffled.slice(0, Math.max(2, Math.min(shuffled.length, 3 + Math.floor(Math.random() * 4))));
  return {
    ...base,
    theme: pick(themes),
    palette: undefined,
    tileStyle: style,
    variant: pick(VARIANTS),
    smart: style === '' && chance(0.5),
    tileSize: pick(SIZES),
    columns: 2 + Math.floor(Math.random() * 4),
    chips: chipPool.length ? chips : [],
    showGraphs: chance(0.8),
    graphType: pick(GRAPH_TYPES),
    orbs: chance(0.3),
    showCloud: chance(0.2),
    energyPeriod: pick(PERIODS),
    sortBy: pick(SORTS),
  };
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

/** One-line summary of a roll, for the panel's "here's what you got" line. */
export function describeChoices(c: BuilderChoices): string {
  const style = c.tileStyle || (c.smart ? 'smart per type' : 'adaptive');
  const bits = [
    c.theme === 'custom' ? 'generated palette' : c.theme.replace(/_/g, ' '),
    style,
    `${c.columns} columns`,
    `${c.tileSize} tiles`,
  ];
  if (c.chips.length) bits.push(`${c.chips.length} chips`);
  if (!c.showGraphs) bits.push('no graphs');
  return bits.join(' · ');
}
