/**
 * The resolution cascades, as pure functions.
 *
 * Every visual option can be set at several levels and the most specific wins:
 * device → device type → room → view → card → built-in default. That logic used
 * to live only as methods on the card element, which meant it could not be
 * tested without a DOM — and the one bug it produced (the renderer and the
 * Customize panel resolving blocks differently) went unnoticed until someone
 * read both by hand.
 *
 * Nothing here touches `hass` or the DOM. The card keeps the viewer-local
 * overrides (localStorage) and memoisation; this owns the config layering.
 *
 * Every option belongs to one of three FAMILIES, and the family fixes the ladder.
 * The layer sets used to differ per option — `sensors` had no view layer, blocks
 * had neither room nor view, `columns` had no device layer — which meant there
 * were five ladders to learn and no way to state the rule. There are now three:
 *
 *   Tile        device → type → room → view → card
 *               theme, colour, tile style + variant, blocks, chips, elements,
 *               graphs, energy window. Anything drawn inside a tile.
 *   Container   room → view → card
 *               columns, tile size, gap. A grid needs something to hold it, so
 *               there is no device layer — one device has no column count.
 *   Card chrome view → card
 *               header, card surface, typography. A room does not contain the
 *               card's header, so it cannot set one.
 *
 * Saved looks (`custom_styles`, `style_presets`) are not a rung: they sit between
 * the view and the card, as a side ladder any layer can point at.
 */
import type {
  HADeviceDashboardConfig, HADevice, DeviceProfile, TileStyle, TileLayout,
  ViewConfig, EnergyPeriod, CustomStyleDef, PowerMonitorVariant, ThemePreset, TileSize,
} from './types';
import { PROFILE_DEFAULT_BLOCKS, PROFILE_DEFAULT_SENSORS, profileDefaultTileStyle } from './helpers';

/** Everything the cascades need to resolve one device. */
export interface CascadeInput {
  config: HADeviceDashboardConfig;
  device: HADevice;
  profile: DeviceProfile;
  /** The active view, when one is selected. */
  view?: ViewConfig;
}

const deviceStyle = (i: CascadeInput) => i.config.device_styles?.[i.device.device_id];
const profileStyle = (i: CascadeInput) => i.config.profile_styles?.[i.profile];
const areaStyle = (i: CascadeInput) => (i.device.area ? i.config.area_styles?.[i.device.area] : undefined);

/** Legacy style aliases, remapped to a power-monitor variant at render time. */
const LEGACY_VARIANT: Partial<Record<string, PowerMonitorVariant>> = {
  hero: 'big-number', ring: 'gauge', spark: 'graph', hbar: 'compact', list: 'table',
};

/** device → type → room → view → card → the profile default (smart styles only). */
export function rawTileStyle(i: CascadeInput): TileStyle | undefined {
  return deviceStyle(i)?.tile_style
    ?? profileStyle(i)?.tile_style
    ?? areaStyle(i)?.tile_style
    ?? i.view?.tile_style
    ?? i.config.tile_style
    ?? (i.config.smart_tile_styles ? profileDefaultTileStyle(i.profile, i.device) : undefined);
}

/** Unwrap a `custom:<key>` into the built-in style it renders as, plus its def. */
export function resolveCustomStyle(
  config: HADeviceDashboardConfig,
  raw: TileStyle | undefined,
): { base: TileStyle | undefined; custom?: CustomStyleDef } {
  if (typeof raw === 'string' && raw.startsWith('custom:')) {
    const def = config.custom_styles?.[raw.slice(7)];
    return { base: def?.base ?? 'default', custom: def };
  }
  return { base: raw };
}

/** Remap a legacy alias to its modern style + variant. */
export function resolveStyle(raw: TileStyle | undefined): { style: TileStyle; variant: PowerMonitorVariant } {
  if (raw && raw in LEGACY_VARIANT) return { style: 'power-monitor', variant: LEGACY_VARIANT[raw]! };
  if (raw === 'command') return { style: 'scene-button', variant: 'big-number' };
  return { style: raw ?? 'default', variant: 'big-number' };
}

/** The saved custom style in force, if the chosen style is a `custom:` one. */
export const customDef = (i: CascadeInput): CustomStyleDef | undefined =>
  resolveCustomStyle(i.config, rawTileStyle(i)).custom;

/** The built-in style a device actually renders as. */
export function effectiveStyle(i: CascadeInput): TileStyle {
  const { base } = resolveCustomStyle(i.config, rawTileStyle(i));
  return resolveStyle(base).style;
}

/**
 * Blocks the `default` tile is built from. THE cascade — the renderer and the
 * Customize panel both resolve through here, because when they had one each the
 * panel listed a different set than the tile drew.
 *
 * Tile family: device → type → room → view → saved style → that style's preset
 * → card → profile default. A saved style's layout outranks the card-wide one:
 * the card-wide value is the least specific thing that can set this.
 */
export function blockLayout(i: CascadeInput): TileLayout {
  return deviceStyle(i)?.tile_layout
    ?? profileStyle(i)?.tile_layout
    ?? areaStyle(i)?.tile_layout
    ?? i.view?.tile_layout
    ?? customDef(i)?.tile_layout
    ?? i.config.style_presets?.['default']?.tile_layout
    ?? i.config.tile_layout
    ?? PROFILE_DEFAULT_BLOCKS[i.profile] ?? PROFILE_DEFAULT_BLOCKS.generic!;
}

/**
 * Which sensor chips a device shows. `[]` is an explicit "none" and stops the
 * cascade; `undefined` means "inherit", and at the bottom it means "show all".
 * Tile family: device → type → room → view → saved style → preset → card →
 * profile default.
 */
export function sensorSelection(i: CascadeInput): string[] | undefined {
  const devSel = deviceStyle(i)?.sensors;
  if (devSel !== undefined) return devSel;
  const profSel = profileStyle(i)?.sensors;
  if (profSel !== undefined) return profSel;
  const areaSel = areaStyle(i)?.sensors;
  if (areaSel !== undefined) return areaSel;
  const viewSel = i.view?.sensors;
  if (viewSel !== undefined) return viewSel;
  const customSel = customDef(i)?.sensors;
  if (customSel !== undefined) return customSel;
  const presetSel = i.config.style_presets?.[effectiveStyle(i)]?.sensors;
  if (presetSel !== undefined) return presetSel;
  if (i.config.sensors !== undefined) return i.config.sensors;
  return PROFILE_DEFAULT_SENSORS[i.profile];
}

/** Sparklines on/off: device → type → room → card → off. No view layer.
 *  Default is OFF — tiles are lean out of the box and graphs are opt-in (the
 *  power tiles' Display picker, or a global/room/device show_graphs). This
 *  governs the getGraphEntities-based sparklines: the power
 *  tiles' companion sensor graphs, the sensor tile's primary spark, and the
 *  block tile's graph block. The inline hero/graph-variant sparklines run off
 *  the separate `graph` element visibility and are unaffected. */
export function showGraphs(i: CascadeInput): boolean {
  const dev = deviceStyle(i)?.show_graphs;
  if (dev !== undefined) return dev;
  const prof = profileStyle(i)?.show_graphs;
  if (prof !== undefined) return prof;
  const area = areaStyle(i)?.show_graphs;
  if (area !== undefined) return area;
  const view = i.view?.show_graphs;
  if (view !== undefined) return view;
  return i.config.show_graphs ?? false;
}

/**
 * Whether one part of the chosen tile style is shown.
 * device → type → room → view → saved style → preset → shown. Mirrors the
 * tile_style cascade, so a view that switches style can adjust its parts.
 */
export function elementVisible(i: CascadeInput, id: string): boolean {
  return deviceStyle(i)?.elements?.[id]
    ?? profileStyle(i)?.elements?.[id]
    ?? areaStyle(i)?.elements?.[id]
    ?? i.view?.elements?.[id]
    ?? customDef(i)?.elements?.[id]
    ?? i.config.style_presets?.[effectiveStyle(i)]?.elements?.[id]
    ?? true;
}

/** Energy window: device → type → room → view → card → lifetime total. */
export function energyPeriod(i: CascadeInput): EnergyPeriod {
  return deviceStyle(i)?.energy_period
    ?? profileStyle(i)?.energy_period
    ?? areaStyle(i)?.energy_period
    ?? i.view?.energy_period
    ?? i.config.energy_period
    ?? 'total';
}

/** Power-monitor variant: device → type → room → view → card → saved style →
 *  that style's preset → whatever a legacy alias implied. */
export function powerMonitorVariant(i: CascadeInput, legacy: PowerMonitorVariant): PowerMonitorVariant {
  return deviceStyle(i)?.power_monitor_variant
    ?? profileStyle(i)?.power_monitor_variant
    ?? areaStyle(i)?.power_monitor_variant
    ?? i.view?.power_monitor_variant
    ?? i.config.power_monitor_variant
    ?? customDef(i)?.variant
    ?? i.config.style_presets?.['power-monitor']?.variant
    ?? legacy;
}

/**
 * Grid columns. Room sections have an area layer; the flat grid and Favourites
 * do not, but all three honour the view — a view's columns did nothing at all
 * while rooms were on, which is the default.
 */
export function columnsFor(
  config: HADeviceDashboardConfig,
  view: ViewConfig | undefined,
  area?: { columns?: number },
): number {
  return area?.columns ?? view?.columns ?? config.columns ?? 3;
}

/**
 * The palette override in force below the card, room first: room → view. Returns
 * undefined when neither sets one and the card's own `theme` stands.
 *
 * 'custom' is not an override. It means "the colours in the card's `style` ARE
 * the palette", which only makes sense at card level — a view and a room have no
 * `style` object of their own to hold one — so it falls through rather than
 * blanking the palette.
 */
export function overrideTheme(
  view?: { theme?: ThemePreset },
  area?: { theme?: ThemePreset },
): Exclude<ThemePreset, 'custom'> | undefined {
  // Per LAYER, not once over the winner: `area?.theme ?? view?.theme` would let a
  // room's 'custom' swallow the view's real theme, since 'custom' is a value and
  // ?? only skips undefined. Each layer either overrides or steps aside.
  const pick = (t?: ThemePreset) => (t && t !== 'custom' ? t : undefined);
  return pick(area?.theme) ?? pick(view?.theme);
}

/**
 * Which palette applies, most specific first: room → view → card.
 *
 * Shorter than the other cascades on purpose — there is no device or profile
 * layer, because the per-device colour override is a single `color` key, not a
 * palette, and `ProfileStyle` deliberately carries only that same key.
 *
 * The result names a preset; expanding it into CSS variables is the renderer's
 * job, and *where* it can be expanded differs by layer. A view theme reaches
 * every variable including the card header; a room theme reaches only what the
 * room's container encloses — see the note on `AreaStyle.theme`.
 */
export function themeFor(
  config: HADeviceDashboardConfig,
  view?: { theme?: ThemePreset },
  area?: { theme?: ThemePreset },
): ThemePreset | undefined {
  return overrideTheme(view, area) ?? config.theme;
}

/**
 * The palette a single TILE must paint for itself: the device's own theme, or
 * its type's. Returns undefined when neither sets one — the usual case, and the
 * cheap one, because the tile then simply inherits the room/view/card variables
 * that are already in scope.
 *
 * Separate from `themeFor` because the answer is used differently. `themeFor`
 * says which palette is in force; this says whether the renderer has work to do.
 * Tile scope reaches 13 of the 19 palette keys — `card_bg`, the four `header_*`
 * and `area_header_color` describe surfaces no tile contains.
 */
export function tileTheme(i: CascadeInput): Exclude<ThemePreset, 'custom'> | undefined {
  const pick = (t?: ThemePreset) => (t && t !== 'custom' ? t : undefined);
  return pick(deviceStyle(i)?.theme) ?? pick(profileStyle(i)?.theme);
}

/**
 * Container family: room → view → card. Tile size had no resolver at all — it
 * was read inline in the renderer, which is exactly why it never grew a room
 * layer while everything around it did.
 */
export function tileSizeFor(
  config: HADeviceDashboardConfig,
  view?: ViewConfig,
  area?: { tile_size?: TileSize },
): TileSize {
  return area?.tile_size ?? view?.tile_size ?? config.tile_size ?? 'md';
}

/** Container family: room → view → card. Undefined = the CSS default. */
export function tileGapFor(
  config: HADeviceDashboardConfig,
  view?: ViewConfig,
  area?: { tileGap?: number },
): number | undefined {
  return area?.tileGap ?? view?.tile_gap ?? config.style?.tile_gap;
}
