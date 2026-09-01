import { LovelaceCardConfig } from 'custom-card-helpers';

// ─── Device profile ────────────────────────────────────────────────────────────

/**
 * Universal device type — derived from HA entity domains present on the device.
 * Shelly-specific subtypes (relay/plug/dimmer/rgb/uni) are preserved for
 * accurate badge labelling and default tile block selection.
 */
export type DeviceProfile =
  // Controllable — switch domain
  | 'relay'         // Shelly 1, 2PM, Pro 1 … (wired relay)
  | 'plug'          // Shelly Plug S/Plus
  // Controllable — light domain
  | 'dimmer'        // Shelly Dimmer G3, Plus Dimmer
  | 'rgb'           // Shelly RGBW2
  // Controllable — other domains
  | 'climate'       // Shelly TRV
  | 'cover'         // Shelly 2.5 blind/shutter/roller
  | 'valve'         // Shelly Valve
  | 'lock'          // any lock-domain device (Z-Wave / Zigbee / Matter locks)
  | 'media'         // any media_player device (speakers, TVs, receivers)
  // Monitoring only
  | 'energy'        // Shelly EM/3EM
  | 'sensor'        // Shelly H&T, Smoke, Flood, Motion, Door/Window
  | 'input'         // Shelly i3/i4
  // Shelly-specific
  | 'uni'           // Shelly UNI (open-collector + ADC)
  | 'wall_display'  // Shelly Wall Display (switch + climate)
  // Fallback
  | 'generic';

/** Hardware generation — Shelly devices only; 'other' for everything else */
export type DeviceGen = 1 | 2 | 3 | 4 | 'ble' | 'other';

export interface DeviceProfileResult {
  type: DeviceProfile;
  gen: DeviceGen;
  /** Short label shown on the tile badge, e.g. "Relay", "Dimmer", "TRV" */
  label: string;
  /** Source integration platform, e.g. "shelly", "zha", "hue", "mqtt" */
  integration: string;
}

// ─── Tile block system ─────────────────────────────────────────────────────────

/**
 * Named blocks that can appear on a tile face or expanded panel.
 * Users reorder / hide them via tile_layout in the config.
 */
export type TileBlockId =
  | 'name_row'        // device name + status dot + primary control button
  | 'sensors'         // sensor chip row (power, temp, voltage …)
  | 'graph'           // sparkline history graphs
  | 'dimmer'          // brightness slider + optional colour picker
  | 'cover_controls'  // open/stop/close + position bar
  | 'trv_control'     // thermostat display + ± buttons + slider
  | 'valve_controls'  // open/stop/close + position
  | 'input_channels'  // binary input chips (i3/i4)
  | 'relay_channels'  // per-channel toggles for multi-channel relays
  | 'power_bar'       // mini usage bar at tile bottom
  | 'virtual_controls' // virtual component controls (select, number, button, text, boolean)
  | 'delegated_controls' // native HA controls for long-tail domains (lock, media, fan, vacuum …)
  | 'badges';         // type badge + gen badge + UI link

/** One row of the tile face. Two or more blocks in a row sit side by side. */
export type TileRow = TileBlockId[];

/**
 * Tile block layout, in either of two interchangeable forms:
 *  - flat  `['name_row', 'sensors']`      — one block per row (the original shape)
 *  - rows  `[['name_row'], ['sensors','graph']]` — explicit side-by-side rows
 * Both are accepted everywhere; `normalizeTileLayout` folds the flat form into rows.
 */
export type TileLayout = TileBlockId[] | TileRow[];

// ─── Style system ──────────────────────────────────────────────────────────────

export type ButtonShape   = 'pill' | 'rect' | 'square' | 'circle';
export type ButtonVariant = 'fill' | 'outline' | 'ghost';
export type ButtonSize    = 'sm' | 'md' | 'lg';
export type GraphType     = 'line' | 'area' | 'bar';
export type DetailHistoryRange = 24 | 168 | 720;
export type TileSize      = 'sm' | 'md' | 'lg';
/** Energy display window: lifetime total, or consumption this day/week/month. */
export type EnergyPeriod  = 'total' | 'today' | 'week' | 'month';
/** Device sort order. 'area' groups by room name, then by device name inside it. */
export type SortBy        = 'name' | 'power' | 'online' | 'area';
export type BoxShadow     = 'none' | 'soft' | 'medium' | 'strong';
/** A colour palette. The eight named presets, plus two that are not palettes:
 *  'custom' means the colours in `style` ARE the theme (no base applied), and
 *  'ha' points every colour at Home Assistant's own theme variables, so the
 *  card follows whatever HA theme is active, light/dark included. */
export type ThemePreset   = 'warm_dusk' | 'shelly_blue' | 'dark_industrial' | 'teal_terminal' | 'brutalist' | 'frosted_light' | 'nordic_warm' | 'midnight_purple' | 'custom' | 'ha';

/** Global graph display settings */
export interface SensorRange {
  min?: number;
  max?: number;
}

export interface GraphStyle {
  type?: GraphType;           // default: 'line'
  line_width?: number;        // px, default 1.5
  fill?: boolean;             // area fill under line, default true
  height?: number;            // px per sparkline row, default 32
  show_dots?: boolean;        // peak/min dots, default true
  time_labels?: boolean;      // time axis labels, default true
  tick_lines?: boolean;       // vertical tick marks, default true
  bar_radius?: number;        // bar corner radius px, default 1.5
  /** Manual y-axis min/max per sensor device_class key */
  sensor_ranges?: Record<string, SensorRange>;
}

/** Per-area visual overrides */
export interface AreaStyle {
  /** Colour palette for this room, overriding the view's and the card's. The
   *  most specific palette layer there is — the individual colour fields below
   *  still override it key by key, so a room can take `nordic_warm` and bend one
   *  colour. Only presets: 'custom' means "the colours in the card's `style` ARE
   *  the palette", which is a card-level idea, so it is ignored here (the room
   *  falls through to the view/card theme).
   *
   *  Four of the palette's 19 keys describe the CARD's header — `header_bg`,
   *  `header_bg2`, `header_text_color`, `header_orb_color` — which no room
   *  contains, so they are skipped when a room theme is expanded. The other 15
   *  scope to the room's container, `card_bg` among them: it paints the room
   *  block, this room's equivalent of the card surface. `bgColor` below still
   *  overrides that. */
  theme?: ThemePreset;
  // Background
  bgColor?: string;
  /** Room backdrop photo (data: URL or /local/… path), behind this room's tiles. */
  bg_image?: string;
  bg_image_size?: 'cover' | 'contain' | 'stretch';
  /** How the room backdrop reads: 'sharp' = crisp photo (cover), 'ambient' =
   *  blurred + darkened so tiles stay readable. Default 'sharp'. */
  bg_image_mode?: 'sharp' | 'ambient';
  /** Which band of the photo shows when 'sharp' + cover crops it. Default center. */
  bg_image_pos?: 'top' | 'center' | 'bottom';
  // Border
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  // Header
  headerBgColor?: string;
  headerBgColor2?: string;
  headerBgDir?: string;
  headerTextColor?: string;
  // Typography
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  // Tiles
  tileBgColor?: string;
  tileBorderColor?: string;
  tileOpacity?: number;
  tileBorderRadius?: number;
  tileGap?: number;
  tileTextColor?: string;
  accentColor?: string;
  columns?: number;
  // Effects
  boxShadow?: BoxShadow;
  // Tile layout style for this area
  tile_style?: TileStyle;
  // Sub-variant for the power-monitor style
  power_monitor_variant?: PowerMonitorVariant;
  // Per-room button styling
  buttonShape?: ButtonShape;
  buttonVariant?: ButtonVariant;
  buttonSize?: ButtonSize;
  /** Tile block order/visibility for this room. Blocks had no room layer at all
   *  until the families were made uniform. */
  tile_layout?: TileLayout;
  /** Tile size for this room (Container family: room → view → card). */
  tile_size?: TileSize;
  /** Sensor chip keys for tiles in this area. undefined = inherit global `sensors`. */
  sensors?: string[];
  /** Summary chip keys shown in this area's HEADER row (power/energy/temperature/
   *  humidity/co2/illuminance). Independent of `sensors` (which drives the tiles).
   *  undefined = inherit; an explicit (possibly empty) list is authoritative. */
  header_chips?: string[];
  /** Per-area override for tile sparkline graphs. undefined = inherit global. */
  show_graphs?: boolean;
  /** Per-element visibility override for tiles in this area. Element id → visible.
   *  Omitted ids inherit style preset → default (visible). */
  elements?: Record<string, boolean>;
  /** Per-room energy window override (total/today/week/month). */
  energy_period?: EnergyPeriod;
}

/**
 * Purpose-driven tile layout styles.
 * Legacy generic names (hero/ring/hbar/spark/list/command) are silently
 * remapped at render time — no existing YAML breaks.
 */
export type TileStyle =
  | 'default'          // original adaptive block-grid tile
  | 'power-monitor'    // relay/plug/energy — power number, gauge, graph or table
  | 'light-control'    // dimmer/rgb — colour wheel + brightness sliders
  | 'climate-control'  // TRV/wall_display — thermostat dial front-and-centre
  | 'cover-control'    // blind/shutter — shutter graphic + open/stop/close
  | 'sensor-card'      // sensor — big primary value + sparkline + trend badge
  | 'scene-button'     // input/generic — large tappable icon button
  | 'input-control'    // i3/i4/UNI — keypad of channel buttons + status rows
  // Legacy aliases (remapped, not shown in picker)
  | 'hero' | 'ring' | 'hbar' | 'spark' | 'list' | 'command'
  // User-defined saved styles — `custom:<key>`, resolved to a base at render time
  | `custom:${string}`;

/** Sub-variants for the power-monitor style */
export type PowerMonitorVariant =
  | 'big-number'  // dominant watt reading + area-fill sparkline  (was: hero)
  | 'gauge'       // stacked multi-ring arcs with arrow needles    (was: ring)
  | 'graph'       // tall sparkline dominates                      (was: spark)
  | 'compact'     // horizontal split: number left, stats right    (was: hbar)
  | 'table';      // all sensor rows + mini sparkline footer       (was: list)

/** Animation preset for entity state icons */
export type EntityAnimationType =
  | 'none'
  | 'flame'      // flickering orange fire
  | 'snowflake'  // spinning blue snowflake
  | 'fan'        // spinning fan blades
  | 'pulse'      // expanding ring pulse
  | 'wave'       // scrolling energy waveform
  | 'sun'        // rotating yellow sun
  | 'lightning'  // pulsing lightning bolt
  | 'heart'      // beating heart
  | 'bulb'       // glowing lightbulb
  | 'leaf'       // swaying green leaf
  | 'moon'       // glowing crescent moon
  | 'water'      // dripping water drop
  | 'lock'       // glowing lock
  // — Flame variants
  | 'flame2'     // double flame — two overlapping flames
  | 'flame3'     // campfire — log base with rising flame
  // — Snowflake variants
  | 'snowflake2' // 6-arm classic with tick marks
  | 'snowflake3' // drifting — translates up/down while spinning
  // — Fan variants
  | 'fan2'       // 4-blade propeller
  | 'fan3'       // vortex — curved arc blades
  // — Lightning variants
  | 'lightning2' // double bolt
  | 'lightning3' // arc/spark — curved arc that flashes
  // — Bulb variants
  | 'bulb2'      // Edison vintage — filament coil, warm amber glow
  | 'bulb3'      // LED — hexagonal chip, cool blue-white
  // — Water variants
  | 'water2'     // waves — scrolling sine wave lines
  | 'water3'     // ripple — expanding concentric circles
  // — Sun variants
  | 'sun2'       // sunrise — half-disc on horizon with upward rays
  | 'sun3'       // starburst — 12 alternating rays, faster spin
  // — Moon variants
  | 'moon2'      // full moon — circle with pulsing glow
  | 'moon3'      // crescent + twinkling stars
  // Wind
  | 'wind'       // flowing sine-wave lines scrolling right
  | 'wind2'      // staggered chevron gusts
  | 'wind3'      // spiral arc with glow
  // Bell / Alarm
  | 'bell'       // classic bell shaking
  | 'bell2'      // bell + radiating ring arcs
  | 'bell3'      // triangle alarm with glow flash
  // Thermometer
  | 'thermometer'    // tube + bulb + pulsing mercury
  | 'thermometer2'   // thermometer + up-arrow (hot)
  | 'thermometer3'   // thermometer + up/down arrows (hot/cold)
  // Battery
  | 'battery'    // 75% filled battery with glow
  | 'battery2'   // battery + charging bolt flash
  | 'battery3'   // low battery blinking
  // Star
  | 'star'       // 5-point star with pulse
  | 'star2'      // 4-point sparkle spinning
  | 'star3'      // shooting star
  // Pulse variants
  | 'pulse2'     // double concentric rings
  | 'pulse3'     // ECG flatline spike
  // Wave variants
  | 'wave2'      // equalizer bars
  | 'wave3'      // sound-wave concentric arcs
  | 'wave4'      // wifi/signal arcs
  // Heart variant
  | 'heart2'     // outline/hollow heart
  // Leaf variant
  | 'leaf2'      // sprout — stem + two leaves
  // Lock variant
  | 'lock2';     // open padlock

/** Per-device visual overrides */
export interface DeviceStyle {
  /** Colour palette for this device's tile — the most specific palette layer.
   *  Tile scope only: the six keys describing the card's own surfaces
   *  (`card_bg`, the four `header_*`, `area_header_color`) are outside any tile,
   *  so 13 of the 19 apply. `color` below still overrides the accent on top.
   *  Presets and 'ha'; 'custom' is ignored, as at every layer below the card. */
  theme?: ThemePreset;
  color?: string;             // accent colour override
  /** Per-tile background photo (data: URL or /local/… path). Overrides the global tile image. */
  bg_image?: string;
  bg_image_size?: 'cover' | 'contain' | 'stretch';
  /** Per-device energy window override (total/today/week/month). */
  energy_period?: EnergyPeriod;
  /** Point the energy value at a specific entity (e.g. a Utility Meter) instead
   *  of the device's auto-detected `_energy` sensors. Replaces them everywhere —
   *  tile chip, room total and header chip — so the override never renders
   *  alongside the raw sensors it stands in for. */
  energy_entity?: string;
  tile_layout?: TileLayout; // per-device block order/visibility
  /** Override the auto-detected device profile (categorisation). undefined = auto. */
  profile?: DeviceProfile;
  /** Per-device tile style — overrides area tile_style */
  tile_style?: TileStyle;
  /** Sub-variant for power-monitor style */
  power_monitor_variant?: PowerMonitorVariant;
  /** Custom icon shown in the tile header when entity is ON */
  tile_icon?: EntityAnimationType;
  /** Custom icon shown in the tile header when entity is OFF (falls back to tile_icon if unset) */
  tile_icon_off?: EntityAnimationType;
  /** Speed multiplier for the custom tile icon (default 1) */
  tile_icon_speed?: number;
  /** Per-entity state animations, keyed by entity_id */
  entity_animations?: Record<string, { on?: EntityAnimationType; off?: EntityAnimationType; speed?: number }>;
  /** Sensor chip keys for this device. undefined = inherit area/global `sensors`. */
  sensors?: string[];
  /** Per-device override for tile sparkline graphs. undefined = inherit area/global. */
  show_graphs?: boolean;
  /** Per-element visibility override for this device's tile style. Element id →
   *  visible. Omitted ids inherit area → style preset → default (visible). */
  elements?: Record<string, boolean>;
  /** What tapping an input channel row runs, keyed by the channel's entity_id
   *  (what the editor writes) or its channel number. Input-only hardware — Shelly
   *  i3/i4, UNI — has no output, so nothing in HA can make it emit a press; the
   *  row runs the action you assign instead, mirroring what the physical button
   *  is wired to do. Unmapped channels stay read-only status rows. */
  input_actions?: Record<string, InputActionConfig>;
}

/** An action bound to one input channel. `perform-action` covers scripts and
 *  scenes too — they are just `script.x` / `scene.turn_on` service calls. */
export interface InputActionConfig {
  action: 'perform-action' | 'toggle' | 'more-info' | 'none';
  /** `perform-action`: the service to call, e.g. 'script.hall_lights' or
   *  'light.turn_on'. A bare `script.foo` is called as-is (no `.turn_on`). */
  perform_action?: string;
  /** Target entity: what to toggle / show, or the service call's target. A list
   *  drives several entities from one channel (e.g. two WLED segments on one
   *  physical button); `dim` seeds its ramp from the first one's brightness. */
  entity?: string | string[];
  /** Extra service data merged into the call. */
  data?: Record<string, unknown>;
  /** Row button label. Defaults to the script/scene's friendly name, then the
   *  service or entity id. */
  label?: string;
  /** Press-and-hold behaviour, mirroring a wall switch's long press. */
  hold_action?: InputHoldConfig;
  /** Double-tap behaviour, mirroring a wall switch's double push (Shelly's own
   *  dimmer script uses double = on at 100%). Configuring this delays the single
   *  tap by ~250ms so the card can tell the two apart; channels without one keep
   *  firing instantly. `action: 'dim'` is meaningless here — hold only. */
  double_tap_action?: InputGestureConfig;
  /** Optional second chip on the row: a dropdown of a `select` entity's options.
   *  A row only has tap and hold, so anything a third gesture used to do at the
   *  wall — cycling WLED presets, say — needs its own control. */
  select_chip?: InputSelectChipConfig;
}

/** Dropdown chip on an input row, listing a `select` entity's options. Picking
 *  one calls `select.select_option`. */
export interface InputSelectChipConfig {
  entity: string;
  /** Chip label prefix. Default: just the current option. */
  label?: string;
}

/** What a secondary gesture (hold, double tap) on an input row does. `dim` ramps
 *  the target light while held and alternates direction between holds — hold to
 *  brighten, release, hold again to darken, which is how a Shelly-linked dimmer
 *  behaves at the wall — and so only applies to `hold_action`. */
export interface InputGestureConfig {
  action: 'dim' | 'perform-action' | 'toggle' | 'more-info' | 'none';
  /** Light to dim, or the action's target. Defaults to the tap action's entity. */
  entity?: string | string[];
  perform_action?: string;
  data?: Record<string, unknown>;
  /** Brightness step per tick, in % of full. Default 5. */
  step?: number;
  /** Milliseconds between steps. Default 200. */
  interval?: number;
}

/** Hold behaviour — the same shape as any other secondary gesture. */
export type InputHoldConfig = InputGestureConfig;

/** The subset of DeviceStyle the per-type ("all relays") layer actually resolves.
 *  It used to be typed as the whole of DeviceStyle, which let the editor and YAML
 *  accept a dozen keys — bg_image, energy_period, energy_entity, tile_icon,
 *  entity_animations, input_actions — that no cascade ever reads at profile level.
 *  Widening this means teaching the matching resolver to look here too. */
/** Per-device-type overrides — the whole Tile family, so the type layer can say
 *  anything a device can. It used to be a narrower Pick, which is why widening it
 *  meant teaching the resolvers first; they now all carry the type layer. */
export type ProfileStyle = Pick<DeviceStyle,
  'theme' | 'color' | 'tile_style' | 'power_monitor_variant' | 'tile_layout'
  | 'sensors' | 'show_graphs' | 'elements' | 'energy_period'>;

/** A user-defined, savable tile style. Renders as `base` with the saved config
 *  applied; assigned via `tile_style: 'custom:<key>'`. */
export interface CustomStyleDef {
  /** Display name in the style picker (defaults to the key). */
  label?: string;
  /** Which built-in tile style it renders as. */
  base: TileStyle;
  variant?: PowerMonitorVariant;
  /** Element visibility for the base style. */
  elements?: Record<string, boolean>;
  /** Default sensor chips. */
  sensors?: string[];
  /** Block order (base = 'default'). */
  tile_layout?: TileLayout;
}

/** A per-tile-style default preset. Applies to every tile rendered in that style,
 *  below device/area overrides and above the per-profile built-in defaults. */
export interface StylePreset {
  /** Default power-monitor variant for power-monitor style. */
  variant?: PowerMonitorVariant;
  /** Default sensor chips for tiles of this style. undefined = inherit global. */
  sensors?: string[];
  /** Default block order/visibility for the 'default' (block) style. */
  tile_layout?: TileLayout;
  /** Per-element visibility for this style. Element id → visible (omit = visible). */
  elements?: Record<string, boolean>;
}

/** Per-view filter — all fields AND-ed; within a list values OR-ed. */
export interface ViewFilter {
  profiles?: DeviceProfile[];
  /** Device matches if ANY of its entities has a domain in this list. */
  domains?: string[];
  /** Case-insensitive area name whitelist. */
  areas?: string[];
  /** device_id whitelist. */
  devices?: string[];
  /** device_id blacklist (applied after all include gates). */
  exclude_devices?: string[];
  /** RegExp source tested against every entity_id; device matches if any hit. */
  entity_id_pattern?: string;
}

/** A single named dashboard view. */
export interface ViewConfig {
  /** Stable identifier; used for tab highlighting and localStorage persistence. */
  id: string;
  /** Tab label. */
  name: string;
  /** Tab icon — mdi:* passed to <ha-icon>, otherwise treated as EntityAnimationType. */
  icon?: string;

  /** Show the Favourites section in this view. Default: false. */
  show_favourites?: boolean;
  /** Group devices by room (area) inside this view. Default: true. */
  show_rooms?: boolean;

  /** Filter pipeline; omitting = show all devices (subject to global hidden_devices/areas). */
  filter?: ViewFilter;

  // Layout / style overrides — applied between area_styles and defaults.
  /** Colour palette while this view is showing, overriding the card's `theme`.
   *  A view re-bases the whole palette: it outranks the card-level `style`
   *  overrides on all 19 palette keys (a view is the more specific layer), while
   *  leaving every non-palette key in `style` — radius, gap, fonts, sizes, header
   *  geometry — untouched. That mirrors what applying a theme in the editor does.
   *  Unlike a room theme this one reaches the card header too, since the header
   *  belongs to the view being shown. Presets only; 'custom' is ignored. */
  theme?: ThemePreset;
  tile_style?: TileStyle;
  power_monitor_variant?: PowerMonitorVariant;
  columns?: number;
  tile_size?: TileSize;
  sort_by?: SortBy;
  /** Element visibility for tiles in this view. A view can switch tile style, so
   *  it needs to be able to adjust that style's parts too. */
  elements?: Record<string, boolean>;
  /** Energy window for this view (total / today / week / month). */
  energy_period?: EnergyPeriod;
  /** Tile block order/visibility while this view is showing. */
  tile_layout?: TileLayout;
  /** Sensor chips for this view. An explicit (possibly empty) list is
   *  authoritative, like every other layer of `sensors`. */
  sensors?: string[];
  /** Tile sparklines for this view. */
  show_graphs?: boolean;
  /** Gap between tiles in this view (Container family). */
  tile_gap?: number;
  /** Card-chrome overrides while this view is showing — header, card surface and
   *  typography. The Card-chrome family is view → card, so this is the only layer
   *  below the card that carries them; a room does not contain the card's header.
   *  Applied over the palette the view's `theme` re-bases, so a view can take a
   *  theme and still bend one header colour. */
  style?: Pick<NonNullable<HADeviceDashboardConfig['style']>,
    'card_bg' | 'card_radius' | 'font_family' | 'text_size_scale'
    | 'header_bg' | 'header_bg2' | 'header_text_color' | 'header_orb_color'
    | 'header_icon' | 'header_title_size' | 'header_radius' | 'header_padding'
    | 'header_border_color' | 'header_border_width'
    | 'header_stat_online' | 'header_stat_power' | 'header_stat_offline'>;
}

/** Full card config */
export interface HADeviceDashboardConfig extends LovelaceCardConfig {
  type: string;

  // ── Views (optional multi-dashboard) ──────────────────────────
  /** Ordered list of named views. If absent, the card renders the single default view. */
  views?: ViewConfig[];
  /** id of the view selected on first load. Falls back to the first view. */
  default_view?: string;

  // ── Device discovery ──────────────────────────────────────────
  /** Discovery breadth. 'shelly' (default/undefined) discovers only Shelly +
   *  BTHome devices — identical to the card's original behaviour. 'universal'
   *  discovers every HA device; Shelly devices still get full-fidelity Shelly
   *  detection (see the ProfileProvider registry in helpers.ts). */
  mode?: 'shelly' | 'universal';
  /** Universal-mode scope, taming the "every entity in HA" firehose. Ignored in
   *  shelly mode.
   *  - 'devices' (default): actuators + devices with a recognised sensor
   *    (temperature/power/motion/…). Drops routers, PCs, browsers, pure-diagnostic
   *    integrations.
   *  - 'controllable': only devices with a controllable entity.
   *  - 'all': every discovered device (the raw firehose). */
  universal_scope?: 'all' | 'devices' | 'controllable';
  /** Universal-mode force-include platforms — re-add integrations that are in the
   *  built-in or user deny-list (e.g. ['mobile_app'] to show phones again). */
  include_integrations?: string[];
  /** Universal-mode platform deny-list, ADDED to the built-in defaults
   *  (mobile_app / browser_mod / routers / systemmonitor / …). */
  exclude_integrations?: string[];
  /** Universal-mode entity-domain allow-list. When set, only these domains. */
  include_domains?: string[];
  /** Universal-mode entity-domain deny-list (e.g. ['update','device_tracker']). */
  exclude_domains?: string[];
  /** Render native HA controls for long-tail domains (lock/media/fan/vacuum/…) via
   *  the `delegated_controls` block. Off by default because each embeds a native
   *  tile element — real render cost on large media fleets. */
  delegate_controls?: boolean;

  // ── Extra Lovelace cards (embed the user's own cards) ─────────
  /** Any Lovelace cards to render across the top of the dashboard, above the
   *  device grid (built-in or HACS custom cards). */
  header_cards?: LovelaceCardConfig[];
  /** Any Lovelace cards to render across the bottom, below the device grid. */
  footer_cards?: LovelaceCardConfig[];
  /** Lovelace cards to render inside a specific room's section, above its device
   *  tiles. Keyed by area name — the "mixed in among the tiles" placement. */
  area_cards?: Record<string, LovelaceCardConfig[]>;
  /** Area filter. undefined = all; [] = none; ['Kitchen'] = specific */
  areas?: string[];
  /** Device IDs to hide */
  hidden_devices?: string[];
  /** Device IDs pinned to the Favourites section at the top of the card */
  favorites?: string[];
  /** Entity IDs to hide from the All Entities list in expanded view */
  hidden_entities?: string[];
  /** Show devices whose all entities are unavailable/unknown. Default: true */
  show_offline?: boolean;
  /** Card title shown in header. Default: 'Shelly' */
  title?: string;

  // ── Layout ────────────────────────────────────────────────────
  columns?: number;                    // default: 3
  tile_size?: TileSize;                // default: 'md'
  sort_by?: SortBy;                    // default: 'name'
  /** Global default tile style — lowest-priority in the cascade
   *  (device → area → view → this). Omit = 'default' (adaptive blocks). */
  tile_style?: TileStyle;
  /** When true, tiles with no explicit style fall to a per-profile default style
   *  (relay→power-monitor, dimmer→light-control, sensor→sensor-card, …) instead
   *  of the adaptive 'default'. Off by default. */
  smart_tile_styles?: boolean;
  /** Global default power-monitor variant, used when tile_style resolves to
   *  power-monitor and no closer scope sets one. */
  power_monitor_variant?: PowerMonitorVariant;
  /** Master switch for tile sparkline graphs (the graph_sensors-driven graph
   *  section). undefined = off — tiles are lean by default and graphs are opt-in.
   *  Overridable per-area and per-device. `graph_sensors` stays the "which sensors
   *  to plot" palette; this is "whether to show them". */
  show_graphs?: boolean;
  /** Ordered list of tile blocks. Omit a block to hide it. */
  tile_layout?: TileLayout;
  tile_opacity?: number;               // 0-100, default 100 — tile background only
  card_opacity?: number;               // 0-100, default 100 — card background only
  header_opacity?: number;             // 0-100, default 100 — header background only
  header_show_title?: boolean;         // default true
  header_show_stats?: boolean;         // default true
  header_show_cloud?: boolean;         // default false (card tests === true)
  header_show_orbs?: boolean;          // default: follows `effects`
  /** Ambient visual effects: header orbs, pulse/glow animations, backdrop blur, hover shadows. Default: false */
  effects?: boolean;
  /** The collapse/expand-all-rooms button, in a small toolbar row directly above
   *  the first room. Default true, but it only renders where it would do
   *  something: rooms grouped, and at least one room shown — a flat grid or a
   *  Favourites-only view never shows it. Not a `header_*` option: it lives with
   *  the rooms it controls, not in the card header. */
  show_collapse_all?: boolean;         // default true
  /** Which stat chips the header shows, in order. Keys from HEADER_CHIP_DEFS
   *  (online, offline, power, energy, temperature, humidity, illuminance, rssi, alerts, updates).
   *  undefined = default set (online, offline, power, alerts). Every chip is clickable and
   *  opens a high-to-low device list for its metric. */
  header_chips?: string[];
  /** Global default for which summary chips each ROOM header shows (keys from
   *  AREA_CHIP_DEFS: power, energy, voltage, current, temperature, humidity,
   *  battery, rssi…). undefined = the built-in DEFAULT_AREA_HEADER_CHIPS. A
   *  per-room `area_styles[room].header_chips` overrides this. Distinct from
   *  `header_chips`, which is the card's own top (fleet-summary) header. */
  area_header_chips?: string[];
  card_bg_image?: string;
  card_bg_image_size?: 'cover' | 'contain' | 'stretch';
  show_power_bar?: boolean;            // default: false
  power_bar_max?: number;              // W at 100%, default 2000
  show_entity_list?: boolean;          // expanded: All Entities section, default true

  // ── Style ─────────────────────────────────────────────────────
  /** Named palette used as the BASE for `style` — every colour `style` doesn't
   *  set comes from the preset, so hand-written YAML can say `theme: nordic_warm`
   *  instead of listing 20 colours. 'custom' means "the colours in `style` are the
   *  theme" and applies no base. The GUI editor writes the full palette into
   *  `style` (and records the name here), which shadows the base entirely. */
  theme?: ThemePreset;
  style?: {
    accent_color?: string;
    tile_radius?: number;
    tile_gap?: number;
    font_family?: string;
    text_size_scale?: number;
    button_shape?: ButtonShape;
    button_variant?: ButtonVariant;
    button_size?: ButtonSize;
    card_bg?: string;
    header_bg?: string;
    header_bg2?: string;
    header_text_color?: string;
    header_orb_color?: string;
    header_icon?: string;            // emoji/text before title, default '⚡'
    header_title_size?: number;      // em, default 1.1
    header_radius?: number;          // px corner radius, default 0
    header_padding?: number;         // px vertical padding, default 16
    header_border_color?: string;    // bottom separator color
    header_border_width?: number;    // px, default 0
    header_stat_online?: string;     // online chip color override
    header_stat_power?: string;      // power chip color override
    header_stat_offline?: string;    // offline chip color override
    tile_bg?: string;
    tile_bg_image?: string;
    tile_bg_image_size?: 'cover' | 'contain' | 'stretch';
    tile_border?: string;
    tile_border_width?: number;      // px, default 1
    tile_box_shadow?: BoxShadow;     // tile always-on shadow preset
    tile_hover_bg?: string;          // tile hover background
    tile_hover_shadow?: string;      // tile hover shadow color
    tile_sensor_bg?: string;         // sensor chip background
    tile_exp_bg?: string;            // expanded panel background
    card_radius?: number;            // px, outer card corner radius
    text_primary?: string;
    text_secondary?: string;         // secondary/meta text color
    text_muted?: string;             // muted text color
    offline_color?: string;          // offline status dot color
    online_color?: string;
    power_color?: string;
    area_header_color?: string;      // global room header label color
  };
  /** Per-area style overrides */
  area_styles?: Record<string, AreaStyle>;
  /** HA label ids that mark a device as driving a light. A relay or plug carrying
   *  one is counted by the Lights header chip, which otherwise only knows about
   *  `light` entities — HA has no idea a switch is wired to a lamp. */
  light_labels?: string[];
  /** Individual entities to count as lights, for anything a label does not cover. */
  light_entities?: string[];

  /** Show the "Needs attention" summary above the rooms — offline devices,
   *  firing alerts, flat batteries, pending updates. It renders only when
   *  something qualifies, so it is invisible on a healthy fleet. Default on. */
  show_attention?: boolean;
  /** Battery percentage at or below which a device is flagged. Default 20. */
  attention_battery?: number;
  /** Count beta firmware as an available update. Off by default: a Shelly offers
   *  a beta almost permanently, which drowns the real updates. */
  include_beta_updates?: boolean;
  /** Show the firmware spread inside that summary. Default on, and only visible
   *  when the fleet is running more than one version. */
  show_firmware_summary?: boolean;

  /** Per-device overrides, keyed by device_id */
  device_styles?: Record<string, DeviceStyle>;
  /** Per-device-TYPE overrides, keyed by profile (relay/dimmer/climate/…). Applies
   *  to every device of that type — "all relays". Sits one rung below device_styles
   *  in the cascade (device → type → area → style preset → global → profile default). */
  profile_styles?: Partial<Record<DeviceProfile, ProfileStyle>>;
  /** Per-tile-style presets: default chips / blocks / variant / element visibility
   *  for every tile rendered in a given style. Overridable per device/area. */
  style_presets?: Partial<Record<TileStyle, StylePreset>>;
  /** User-defined saved tile styles, keyed by slug. Assigned via
   *  `tile_style: 'custom:<key>'`; renders as `base` with the saved config. */
  custom_styles?: Record<string, CustomStyleDef>;

  /** What the Energy value shows: cumulative lifetime total (default) or the
   *  consumption over the current day/week/month, computed from recorder
   *  statistics bucketed in HA's timezone. Applies to every energy chip — tiles,
   *  room headers, the card header and the detail sheet — and is overridable per
   *  room/device. Any chip whose statistics call fails degrades to the lifetime
   *  total under the plain "Energy" label rather than reporting a wrong period. */
  energy_period?: EnergyPeriod;

  // ── Graphs ────────────────────────────────────────────────────
  /** device_class keys to graph. Empty = no graphs. */
  graph_sensors?: string[];
  graph_hours?: number;                // history window in hours, default 24
  graph_style?: GraphStyle;
  /** Global fallback line colour */
  graph_line_color?: string;
  /** Per-sensor-class line colours, e.g. { temperature: '#4fc3f7' } */
  graph_sensor_colors?: Record<string, string>;

  // ── Sensor chips ──────────────────────────────────────────────
  /** Sensor keys to show as chips. Empty/missing = show all. */
  sensors?: string[];
}

// ─── HA device / entity model ──────────────────────────────────────────────────

export interface HADevice {
  device_id: string;
  name: string;
  area?: string;
  model?: string;
  sw_version?: string;
  ip?: string;
  isShelly: boolean;
  /** Source integration platform, e.g. "shelly", "zha", "hue" */
  integration: string;
  /** HA label ids on the device, e.g. ['dimming_lights']. Used by `light_labels`
   *  to count relays and plugs that drive lights as lights. */
  labels?: string[];
  entities: HAEntity[];
}

export interface HAEntity {
  entity_id: string;
  domain: string;
  state: string;
  attributes: Record<string, unknown>;
  device_id?: string;
  area_id?: string;
  platform?: string;
  /** HA registry entity_category: 'config' | 'diagnostic' | undefined (primary). */
  entity_category?: string;
}

/** Narrow structural type for the common HA state.attributes shape.
 *  Use as `(state.attributes as HassAttrs).device_class` instead of `as any`. */
export interface HassAttrs {
  device_class?: string;
  friendly_name?: string;
  unit_of_measurement?: string;
  effect_list?: string[];
  effect?: string;
  min_mireds?: number;
  max_mireds?: number;
  color_temp?: number;
  supported_color_modes?: string[];
  supported_features?: number;
  brightness?: number;
  rgb_color?: [number, number, number];
  rgbw_color?: number[];
  current_position?: number;
  current_temperature?: number;
  temperature?: number;
  min_temp?: number;
  max_temp?: number;
  target_temp_step?: number;
  hvac_action?: string;
  preset_mode?: string;
  preset_modes?: string[];
  current_valve_position?: number;
  valve_position?: number;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  event_type?: string;
  latest_version?: string;
  installed_version?: string;
  [key: string]: unknown;
}

// ─── Global augmentation ────────────────────────────────────────────────────────

declare global {
  interface Window {
    customCards: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}
