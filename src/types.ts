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
  | 'badges';         // type badge + gen badge + UI link

// ─── Style system ──────────────────────────────────────────────────────────────

export type ButtonShape   = 'pill' | 'rect' | 'square' | 'circle';
export type ButtonVariant = 'fill' | 'outline' | 'ghost';
export type ButtonSize    = 'sm' | 'md' | 'lg';
export type GraphType     = 'line' | 'area' | 'bar';
export type ViewMode      = 'grid' | 'list' | 'compact';
export type TileSize      = 'sm' | 'md' | 'lg';
export type SortBy        = 'name' | 'power' | 'online' | 'area';
export type BoxShadow     = 'none' | 'soft' | 'medium' | 'strong';
export type ThemePreset   = 'dark_industrial' | 'teal_terminal' | 'brutalist' | 'frosted_light' | 'nordic_warm' | 'midnight_purple' | 'custom';

/** Global graph display settings */
export interface GraphStyle {
  type?: GraphType;           // default: 'line'
  line_width?: number;        // px, default 1.5
  fill?: boolean;             // area fill under line, default true
  height?: number;            // px per sparkline row, default 32
  show_dots?: boolean;        // peak/min dots, default true
  time_labels?: boolean;      // time axis labels, default true
  tick_lines?: boolean;       // vertical tick marks, default true
  bar_radius?: number;        // bar corner radius px, default 2
}

/** Per-area visual overrides */
export interface AreaStyle {
  // Background
  bgColor?: string;
  bgImage?: string;
  bgImageSize?: 'contain' | 'cover' | 'stretch';
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
}

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
  color?: string;             // accent colour override
  tile_layout?: TileBlockId[]; // per-device block order/visibility
  /** Custom icon shown in the tile header when entity is ON */
  tile_icon?: EntityAnimationType;
  /** Custom icon shown in the tile header when entity is OFF (falls back to tile_icon if unset) */
  tile_icon_off?: EntityAnimationType;
  /** Speed multiplier for the custom tile icon (default 1) */
  tile_icon_speed?: number;
  /** Per-entity state animations, keyed by entity_id */
  entity_animations?: Record<string, { on?: EntityAnimationType; off?: EntityAnimationType; speed?: number }>;
}

/** Full card config */
export interface HADeviceDashboardConfig extends LovelaceCardConfig {
  type: string;

  // ── Device discovery ──────────────────────────────────────────
  /** Area filter. undefined = all; [] = none; ['Eldhús'] = specific */
  areas?: string[];
  /** Device IDs to hide */
  hidden_devices?: string[];
  /** Entity IDs to hide from the All Entities list in expanded view */
  hidden_entities?: string[];
  /** Show devices whose all entities are unavailable/unknown. Default: true */
  show_offline?: boolean;
  /** Card title shown in header. Default: 'Shelly' */
  title?: string;

  // ── Layout ────────────────────────────────────────────────────
  columns?: number;                    // default: 3
  view_mode?: ViewMode;                // default: 'grid'
  tile_size?: TileSize;                // default: 'md'
  sort_by?: SortBy;                    // default: 'name'
  /** Ordered list of tile blocks. Omit a block to hide it. */
  tile_layout?: TileBlockId[];
  tile_opacity?: number;               // 0-100, default 100 — tile background only
  card_opacity?: number;               // 0-100, default 100 — card background only
  header_opacity?: number;             // 0-100, default 100 — header background only
  header_show_title?: boolean;         // default true
  header_show_stats?: boolean;         // default true
  header_show_cloud?: boolean;         // default true
  header_show_orbs?: boolean;          // default true
  card_bg_image?: string;
  card_bg_image_size?: 'cover' | 'contain' | 'stretch';
  show_power_bar?: boolean;            // default: false
  power_bar_max?: number;              // W at 100%, default 2000
  show_entity_list?: boolean;          // expanded: All Entities section, default true

  // ── Style ─────────────────────────────────────────────────────
  theme?: ThemePreset;
  style?: {
    accent_color?: string;
    tile_radius?: number;
    tile_gap?: number;
    font_family?: string;
    text_transform?: 'uppercase' | 'capitalize' | 'none';
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
  /** Per-device overrides, keyed by device_id */
  device_styles?: Record<string, DeviceStyle>;

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
