/**
 * The Design tab's scope model, as pure functions.
 *
 * The tab is scope-first: you pick WHERE you are editing, and the same control
 * list redraws for that layer. Everything about what a scope is, what it may
 * set, and how devices are grouped for picking one lives here — no DOM, no
 * `hass`, no Lit — so the rules can be tested and the editor keeps only markup.
 *
 * Scopes are the rungs of the family ladders in `cascade.ts`. They are not the
 * same set for every family, and `scopeCanSet` is the single place that says so.
 */
import type { HADevice, DeviceProfile, HADeviceDashboardConfig } from './types';

/** Where the user is editing. */
export type DesignScope =
  | { kind: 'global' }
  | { kind: 'view'; id: string }
  | { kind: 'room'; name: string }
  | { kind: 'type'; profile: DeviceProfile }
  | { kind: 'device'; id: string };

export const GLOBAL_SCOPE: DesignScope = { kind: 'global' };

/** The three families from `cascade.ts`, as the editor groups its controls. */
export type DesignFamily = 'tile' | 'container' | 'chrome';

/**
 * Which scopes may set which family. The gaps are the honest ones documented on
 * the cascades: a grid needs something to hold it, so Container stops at the
 * room; a room does not contain the card's header, so chrome stops at the view.
 *
 * The editor asks this instead of hiding controls by hand, so a control cannot
 * appear at a layer the renderer would ignore.
 */
export function scopeCanSet(scope: DesignScope, family: DesignFamily): boolean {
  switch (family) {
    case 'tile':      return true;                       // every rung
    case 'container': return scope.kind === 'global' || scope.kind === 'view' || scope.kind === 'room';
    case 'chrome':    return scope.kind === 'global' || scope.kind === 'view';
  }
}

/** Why a family is unavailable here — shown in place of the controls, so the
 *  ladder is taught rather than discovered. */
export function whyUnavailable(scope: DesignScope, family: DesignFamily): string | undefined {
  if (scopeCanSet(scope, family)) return undefined;
  if (family === 'container') {
    return scope.kind === 'device'
      ? 'Columns, tile size and gap belong to the grid a tile sits in, not to one device. Set them on the room, the view, or the card.'
      : 'A device type is a set of tiles scattered across rooms, so it has no grid of its own. Set these on the room, the view, or the card.';
  }
  return 'The header and the card surface belong to the card. Only a view can restyle them, because a view replaces what the whole card shows.';
}

/** Stable string for persistence and equality — scopes are compared a lot. */
export function scopeKey(scope: DesignScope): string {
  switch (scope.kind) {
    case 'global': return 'global';
    case 'view':   return `view:${scope.id}`;
    case 'room':   return `room:${scope.name}`;
    case 'type':   return `type:${scope.profile}`;
    case 'device': return `device:${scope.id}`;
  }
}

/**
 * Rebuild a scope from its key, dropping anything that no longer exists — a
 * persisted scope outlives the room or device it names, and reopening the editor
 * onto a device that was deleted would show controls writing into nothing.
 */
export function parseScopeKey(
  key: string | null | undefined,
  known: { views: string[]; rooms: string[]; types: string[]; devices: string[] },
): DesignScope {
  if (!key || key === 'global') return GLOBAL_SCOPE;
  const sep = key.indexOf(':');
  if (sep < 0) return GLOBAL_SCOPE;
  const kind = key.slice(0, sep);
  const id = key.slice(sep + 1);
  if (kind === 'view'   && known.views.includes(id))   return { kind: 'view', id };
  if (kind === 'room'   && known.rooms.includes(id))   return { kind: 'room', name: id };
  if (kind === 'type'   && known.types.includes(id))   return { kind: 'type', profile: id as DeviceProfile };
  if (kind === 'device' && known.devices.includes(id)) return { kind: 'device', id };
  return GLOBAL_SCOPE;
}

/** How the device tree is grouped while picking a scope. */
export type GroupBy = 'room' | 'integration' | 'type';

export interface ScopeGroup {
  /** Group heading. */
  label: string;
  /** The scope the heading itself selects, when the grouping is also a layer.
   *  Integration grouping has none — it is navigation, not a rung. */
  scope?: DesignScope;
  devices: Array<{ id: string; name: string }>;
}

/**
 * Devices grouped for the scope picker. With a fleet of any size a flat list of
 * devices is unusable, so the tree is grouped first and expanded second.
 *
 * Room and type groupings double as layers — their headings select the room or
 * device-type scope. Integration is browse-only: it is a real property of a
 * device but not a rung on any ladder, so its heading selects nothing.
 */
export function groupDevices(
  devices: HADevice[],
  by: GroupBy,
  profileOf: (d: HADevice) => DeviceProfile,
): ScopeGroup[] {
  const groups = new Map<string, ScopeGroup>();
  for (const d of devices) {
    let label: string;
    let scope: DesignScope | undefined;
    if (by === 'room') {
      label = d.area || 'No room';
      // '' is a real area key the renderer uses; keep it rather than the label.
      scope = { kind: 'room', name: d.area ?? '' };
    } else if (by === 'type') {
      const p = profileOf(d);
      label = p;
      scope = { kind: 'type', profile: p };
    } else {
      label = d.integration || 'unknown';
      scope = undefined;
    }
    let g = groups.get(label);
    if (!g) { g = { label, scope, devices: [] }; groups.set(label, g); }
    g.devices.push({ id: d.device_id, name: d.name });
  }
  for (const g of groups.values()) g.devices.sort((a, b) => a.name.localeCompare(b.name));
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Human label for the scope chip — "Room · Eldhus", "Device · Lampi". */
export function scopeLabel(
  scope: DesignScope,
  lookup: { viewName: (id: string) => string; deviceName: (id: string) => string },
): string {
  switch (scope.kind) {
    case 'global': return 'Global';
    case 'view':   return `View · ${lookup.viewName(scope.id)}`;
    case 'room':   return `Room · ${scope.name || 'No room'}`;
    case 'type':   return `Type · ${scope.profile}`;
    case 'device': return `Device · ${lookup.deviceName(scope.id)}`;
  }
}

/**
 * The config object a scope writes into, or undefined when nothing is set there
 * yet. Read-only: the editor owns the patching, this only says where to look, so
 * that "is anything set here?" has one answer.
 */
export function scopeBlock(
  config: HADeviceDashboardConfig,
  scope: DesignScope,
): Record<string, unknown> | undefined {
  switch (scope.kind) {
    case 'global': return config as unknown as Record<string, unknown>;
    case 'view':   return (config.views ?? []).find(v => v.id === scope.id) as unknown as Record<string, unknown> | undefined;
    case 'room':   return config.area_styles?.[scope.name] as unknown as Record<string, unknown> | undefined;
    case 'type':   return config.profile_styles?.[scope.profile] as unknown as Record<string, unknown> | undefined;
    case 'device': return config.device_styles?.[scope.id] as unknown as Record<string, unknown> | undefined;
  }
}

/** How many design keys a scope overrides — drives the "n set here" badge on
 *  every rung, so the tree shows where customisation actually lives. */
export function overrideCount(config: HADeviceDashboardConfig, scope: DesignScope, keys: string[]): number {
  const block = scopeBlock(config, scope);
  if (!block) return 0;
  return keys.filter(k => block[k] !== undefined).length;
}

/**
 * The design keys a scope can hold, by family. One list, so the scope badges,
 * the "n set here" header and the changes panel cannot disagree about what
 * counts as customisation — they each had their own copy, which is how counts
 * drift apart.
 */
export const DESIGN_KEYS = {
  tile: ['theme', 'color', 'tile_style', 'power_monitor_variant', 'tile_layout',
    'sensors', 'show_graphs', 'elements', 'energy_period'],
  /** `tileGap` is AreaStyle's spelling of the same idea as `tile_gap`. */
  container: ['columns', 'tile_size', 'tileGap', 'tile_gap'],
  chrome: ['style'],
} as const;

export const ALL_DESIGN_KEYS: string[] = [
  ...DESIGN_KEYS.tile, ...DESIGN_KEYS.container, ...DESIGN_KEYS.chrome,
];

/** One thing the config changes away from the built-in look. */
export interface DesignOverride {
  scope: DesignScope;
  /** Config key, or a palette key when `palette` is true. */
  key: string;
  value: unknown;
  /** True for a colour in `style` that differs from the theme it sits on —
   *  those are overrides of the THEME rather than of a parent layer. */
  palette?: boolean;
}

/**
 * Everything the config sets away from the default look, across every scope.
 *
 * Answers "what have I actually customised?", which is the question a new user is
 * really asking when they cannot tell what stays and what does not. Pure: the
 * caller supplies the theme's palette, because resolving a theme name to colours
 * belongs to themes.ts and dragging it in here would couple the two.
 */
export function collectOverrides(
  config: HADeviceDashboardConfig,
  themePalette: Record<string, unknown> | undefined,
): DesignOverride[] {
  const out: DesignOverride[] = [];
  const push = (scope: DesignScope, block: Record<string, unknown> | undefined, keys: string[]) => {
    if (!block) return;
    for (const k of keys) if (block[k] !== undefined) out.push({ scope, key: k, value: block[k] });
  };

  // Card level: the design keys, minus `style` — its palette keys are compared
  // against the theme below rather than counted wholesale, or every themed card
  // would report one permanent "change".
  push(GLOBAL_SCOPE, config as unknown as Record<string, unknown>,
    ALL_DESIGN_KEYS.filter(k => k !== 'style' && k !== 'theme' && k !== 'tileGap'));

  const style = (config.style ?? {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(style)) {
    if (v === undefined) continue;
    // A palette key equal to the theme's is not a change; a non-palette key
    // (radius, fonts, header geometry) always is, since no theme sets those.
    const base = themePalette?.[k];
    if (base !== undefined && base === v) continue;
    out.push({ scope: GLOBAL_SCOPE, key: k, value: v, palette: base !== undefined });
  }

  for (const v of config.views ?? []) {
    push({ kind: 'view', id: v.id }, v as unknown as Record<string, unknown>, ALL_DESIGN_KEYS);
  }
  for (const [name, block] of Object.entries(config.area_styles ?? {})) {
    push({ kind: 'room', name }, block as unknown as Record<string, unknown>, ALL_DESIGN_KEYS);
  }
  for (const [profile, block] of Object.entries(config.profile_styles ?? {})) {
    push({ kind: 'type', profile: profile as DeviceProfile }, block as unknown as Record<string, unknown>, ALL_DESIGN_KEYS);
  }
  for (const [id, block] of Object.entries(config.device_styles ?? {})) {
    push({ kind: 'device', id }, block as unknown as Record<string, unknown>, ALL_DESIGN_KEYS);
  }
  return out;
}
