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
 * The layer sets are not identical between options, and that is deliberate
 * rather than sloppy — `sensors` has no view layer, `tile_style` puts the room
 * before the view. Each function documents its own order.
 */
import type {
  HADeviceDashboardConfig, HADevice, DeviceProfile, TileStyle, TileLayout,
  ViewConfig, EnergyPeriod, CustomStyleDef, PowerMonitorVariant,
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
 * device → type → saved style → that style's preset → card → profile default.
 * A saved style's layout outranks the card-wide one: the card-wide value is the
 * least specific thing that can set this. Rooms have no tile_layout.
 */
export function blockLayout(i: CascadeInput): TileLayout {
  return deviceStyle(i)?.tile_layout
    ?? profileStyle(i)?.tile_layout
    ?? customDef(i)?.tile_layout
    ?? i.config.style_presets?.['default']?.tile_layout
    ?? i.config.tile_layout
    ?? PROFILE_DEFAULT_BLOCKS[i.profile] ?? PROFILE_DEFAULT_BLOCKS.generic!;
}

/**
 * Which sensor chips a device shows. `[]` is an explicit "none" and stops the
 * cascade; `undefined` means "inherit", and at the bottom it means "show all".
 * device → type → room → saved style → preset → card → profile default.
 * There is no view layer here.
 */
export function sensorSelection(i: CascadeInput): string[] | undefined {
  const devSel = deviceStyle(i)?.sensors;
  if (devSel !== undefined) return devSel;
  const profSel = profileStyle(i)?.sensors;
  if (profSel !== undefined) return profSel;
  const areaSel = areaStyle(i)?.sensors;
  if (areaSel !== undefined) return areaSel;
  const customSel = customDef(i)?.sensors;
  if (customSel !== undefined) return customSel;
  const presetSel = i.config.style_presets?.[effectiveStyle(i)]?.sensors;
  if (presetSel !== undefined) return presetSel;
  if (i.config.sensors !== undefined) return i.config.sensors;
  return PROFILE_DEFAULT_SENSORS[i.profile];
}

/** Sparklines on/off: device → type → room → card → on. No view layer. */
export function showGraphs(i: CascadeInput): boolean {
  const dev = deviceStyle(i)?.show_graphs;
  if (dev !== undefined) return dev;
  const prof = profileStyle(i)?.show_graphs;
  if (prof !== undefined) return prof;
  const area = areaStyle(i)?.show_graphs;
  if (area !== undefined) return area;
  return i.config.show_graphs ?? true;
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
