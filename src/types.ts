import { LovelaceCardConfig } from 'custom-card-helpers';

// ─── Card configs ────────────────────────────────────────────────────────────

export interface AreaStyle {
  // Background
  bgColor?: string;              // solid background color hex, e.g. "#1a1a2e"
  bgImage?: string;              // image URL or base64 data URL
  bgImageSize?: 'contain' | 'cover' | 'stretch'; // default: contain
  // Border
  borderColor?: string;
  borderWidth?: number;          // px, default 1 when borderColor is set
  borderRadius?: number;         // px, 0-32
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  // Header
  headerBgColor?: string;        // background of the area header bar (solid or gradient start)
  headerBgColor2?: string;       // second gradient color; when set creates linear-gradient
  headerBgDir?: string;          // CSS gradient direction, e.g. 'to right', '135deg'
  headerTextColor?: string;      // overrides the orange area-name colour
  // Text / typography (applies to the area header name)
  textColor?: string;            // area name text colour (overrides orange default)
  fontSize?: number;             // area name font size, px
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  // Tiles
  tileBgColor?: string;          // override tile background colour within the area
  tileBorderColor?: string;      // override tile border colour within the area
  columns?: number;              // override column count for this area (1-6)
  // Effects
  boxShadow?: 'none' | 'soft' | 'medium' | 'strong';
}

export interface ShellyDashboardConfig extends LovelaceCardConfig {
  type: string;
  columns?: number;          // default: 3
  show_offline?: boolean;    // default: true
  include_all?: boolean;     // when true: show ALL HA devices, not just Shelly
  hide_shelly?: boolean;     // when true: hide Shelly devices (useful with include_all)
  areas?: string[];          // filter by area names; empty/missing = show all
  sensors?: string[];        // sensor types to show; empty/missing = show all
                             // electrical: power, apparent_power, reactive_power, power_factor,
                             //             frequency, energy, voltage, current
                             // environmental: temperature, humidity, illuminance, co2, gas
                             // device: battery, rssi, uptime, ip, ssid, fw_version, mac,
                             //         cloud, mqtt, eth
                             // alerts: motion, door, flood, smoke, vibration, overpower, overtemp
  area_styles?: Record<string, AreaStyle>; // per-area visual style
  hidden_devices?: string[];              // device_ids to hide from the dashboard
  sort_by?: 'name' | 'power' | 'online';  // default: 'name'
  view_mode?: 'grid' | 'list';            // default: 'grid'
  tile_size?: 'sm' | 'md' | 'lg';        // default: 'md'
  tile_click?: 'expand' | 'toggle';       // default: 'expand' — 'toggle' toggles primary switch
  show_power_bar?: boolean;               // show mini power strip at tile bottom
  power_bar_max?: number;                 // W at 100% fill (default: 2000)
  device_styles?: Record<string, { color?: string }>; // per-device accent color (keyed by device_id)
  show_glow?: boolean;                    // pulsing orange glow on active tiles (default: true)
  tile_style?: 'solid' | 'semi' | 'transparent'; // tile background: solid, semi-transparent (default), or transparent
  graph_sensors?: string[];               // device_class keys to graph: ['temperature','power',…]; empty = no graphs
  graph_hours?: number;                   // history window in hours (default: 24)
}

// ─── HA-level device classification ──────────────────────────────────────────

/** Generation as detected from the HA device model string */
export type HADeviceGen = 1 | 2 | 3 | 4 | 'ble';

/** Functional device type inferred from which HA entity domains are present */
export type ShellyDeviceType =
  | 'relay'        // switch.* — wired relay (Shelly 1, Plus 1, Pro 1 …)
  | 'dimmer'       // light.* without color — Dimmer 1/2, Plus Dimmer, Dimmer G3 …
  | 'rgb'          // light.* with rgb/rgbw modes — RGBW2, Plus RGBW, Duo RGBW …
  | 'plug'         // switch.* — smart plug (Plug S, Plus Plug S, Outdoor Plug S …)
  | 'cover'        // cover.* — roller/shutter mode (2.5, Plus 2PM, Pro 2PM …)
  | 'valve'        // valve.* — water/heating valve (Shelly Valve)
  | 'energy'       // sensor-only power monitor (EM, 3EM, Pro 3EM, Pro EM-50 …)
  | 'sensor'       // environmental / alert sensor (H&T, Flood, Smoke, Motion …)
  | 'input'        // binary_sensor inputs (i3, Plus i4, Button1, BLU Button …)
  | 'trv'          // climate.* — Shelly TRV
  | 'wall_display' // switch + climate — Shelly Wall Display
  | 'uni'          // open-collector outputs + ADC — UNI, Plus UNI
  | 'unknown';

export interface ShellyDeviceProfile {
  type: ShellyDeviceType;
  gen: HADeviceGen;
  /** Short human-readable type label shown on tile badge, e.g. "Relay", "Plug", "RGB" */
  label: string;
}

// ─── Shelly device data ───────────────────────────────────────────────────────

export type ShellyGen = 1 | 2 | 3;

export interface ShellyDeviceInfo {
  id: string;
  name: string;
  model: string;
  gen: ShellyGen;
  fw_ver: string;
  mac: string;
  ip?: string;
  auth_enabled?: boolean;
}

export interface ShellyRelayState {
  channel: number;
  name: string;
  ison: boolean;
  source?: string;
  power?: number;        // W
  energy?: number;       // kWh
  voltage?: number;      // V
  current?: number;      // A
  overpower?: boolean;
  overtemperature?: boolean;
}

export interface ShellyTemperature {
  id: number;
  tC?: number;           // Celsius
  tF?: number;           // Fahrenheit
}

export interface ShellyFirmwareInfo {
  current: string;
  update_available: boolean;
  new_version?: string;
  beta_available?: boolean;
}

export interface ShellyStatus {
  online: boolean;
  device?: ShellyDeviceInfo;
  relays: ShellyRelayState[];
  temperatures: ShellyTemperature[];
  firmware?: ShellyFirmwareInfo;
  wifi_rssi?: number;
  uptime?: number;           // seconds
  ram_free?: number;         // bytes (Gen2/3)
  fs_free?: number;          // bytes (Gen2/3)
}

// ─── HA device grouping ───────────────────────────────────────────────────────

export interface ShellyHADevice {
  device_id: string;
  name: string;
  area?: string;
  model?: string;
  sw_version?: string;
  ip?: string;                // from configuration_url or entity attributes
  isShelly?: boolean;         // true when the device belongs to the Shelly integration
  entities: ShellyHAEntity[];
}

export interface ShellyHAEntity {
  entity_id: string;
  domain: string;
  state: string;
  attributes: Record<string, any>;
  device_id?: string;
  area_id?: string;
}

// ─── Global HA type augmentation ─────────────────────────────────────────────

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
