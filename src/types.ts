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
  | 'plug'          // Shelly Plug S, TP-Link Kasa, Tuya outlet …
  | 'switch'        // any generic switch (non-Shelly)
  // Controllable — light domain
  | 'dimmer'        // Shelly Dimmer G3, Plus Dimmer, Zigbee dimmer …
  | 'rgb'           // Shelly RGBW2, Hue color, WLED …
  | 'light'         // any dimmable/CT light (non-Shelly)
  // Controllable — other domains
  | 'climate'       // thermostat, TRV, AC, heat pump
  | 'cover'         // blind, shutter, roller, garage
  | 'fan'           // speed, oscillation, direction
  | 'lock'          // deadbolt, smart lock
  | 'vacuum'        // robot vacuum
  | 'media_player'  // TV, speaker, receiver
  | 'alarm'         // alarm_control_panel
  | 'humidifier'    // humidifier / dehumidifier
  | 'valve'         // water / heating valve
  | 'siren'         // siren / doorbell chime
  // Monitoring only
  | 'energy'        // Shelly EM/3EM, solar, battery pack
  | 'sensor'        // H&T, door, motion, flood, smoke …
  | 'input'         // Shelly i3/i4, button modules
  | 'camera'        // IP camera (snapshot)
  // Shelly-specific
  | 'uni'           // Shelly UNI (open-collector + ADC)
  | 'wall_display'  // Shelly Wall Display (switch + climate)
  // Virtual — no backing device
  | 'script'
  | 'scene'
  | 'automation'
  | 'helper'        // input_boolean/number/text/select/datetime/button
  | 'weather'
  | 'person'
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
  | 'media_controls'  // play/pause/vol + source
  | 'fan_controls'    // speed + oscillation
  | 'valve_controls'  // open/stop/close + position
  | 'input_channels'  // binary input chips (i3/i4)
  | 'relay_channels'  // per-channel toggles for multi-channel relays
  | 'lock_controls'   // lock/unlock buttons
  | 'vacuum_controls' // start/pause/return-to-base
  | 'helper_controls' // input_number slider, input_select pills, input_text field
  | 'siren_controls'  // sound/silence buttons for siren entities
  | 'power_bar'       // mini usage bar at tile bottom
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

/** Per-device visual overrides */
export interface DeviceStyle {
  color?: string;             // accent colour override
  tile_layout?: TileBlockId[]; // per-device block order/visibility
}

/** Full card config */
export interface HADeviceDashboardConfig extends LovelaceCardConfig {
  type: string;

  // ── Device discovery ──────────────────────────────────────────
  /** Integration platforms to include. Default: all. e.g. ['shelly','zha','hue'] */
  integrations?: string[];
  /** Show all HA devices regardless of integration (legacy include_all) */
  include_all?: boolean;
  /** Hide Shelly devices (useful when include_all + hide_shelly) */
  hide_shelly?: boolean;
  /** Also show virtual entities: scripts, scenes, automations, helpers */
  include_entities?: boolean;
  /** Domain globs to include as virtual tiles e.g. ['script.*','scene.*'] */
  entity_domains?: string[];
  /** Area filter. undefined = all; [] = none; ['Eldhús'] = specific */
  areas?: string[];
  /** Device IDs to always show even if not auto-discovered */
  extra_devices?: string[];
  /** Device IDs to hide */
  hidden_devices?: string[];
  /** Entity IDs to hide from the All Entities list in expanded view */
  hidden_entities?: string[];
  /** Show devices whose all entities are unavailable/unknown. Default: true */
  show_offline?: boolean;

  // ── Layout ────────────────────────────────────────────────────
  columns?: number;                    // default: 3
  view_mode?: ViewMode;                // default: 'grid'
  tile_size?: TileSize;                // default: 'md'
  sort_by?: SortBy;                    // default: 'name'
  /** Ordered list of tile blocks. Omit a block to hide it. */
  tile_layout?: TileBlockId[];
  tile_opacity?: number;               // 0-100, default 100 — tile background only
  card_opacity?: number;               // 0-100, default 100 — card background only
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
    tile_bg?: string;
    tile_bg_image?: string;
    tile_bg_image_size?: 'cover' | 'contain' | 'stretch';
    tile_border?: string;
    text_primary?: string;
    online_color?: string;
    power_color?: string;
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
  /** Whether this is a virtual tile (script/scene/automation/helper) */
  isVirtual?: boolean;
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
