import type { TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type {
  HADevice,
  HADeviceDashboardConfig,
  DeviceProfileResult,
  DetailHistoryRange,
} from '../types';
import type { SensorReading } from '../helpers';

// Placeholder shapes — mirrored from anonymous return types in ha-device-dashboard.ts.
// TODO: lift these into types.ts as tiles are extracted in later phases.
export interface PrimarySwitch {
  entityId: string;
  isOn: boolean;
  brightness?: number;
  colorModes?: string[];
  rgbColor?: [number, number, number];
  whiteValue?: number;
}
export interface TrvInfo {
  entityId: string;
  currentTemp: number | undefined;
  targetTemp: number | undefined;
  minTemp: number;
  maxTemp: number;
  step: number;
  hvacAction: string;
  hvacMode: string;
  presetMode: string | undefined;
  presetModes: string[];
  valvePosition: number | undefined;
}
export interface CoverInfo { entityId: string; state: string; position: number | undefined }
export interface ValveInfo {
  entityId: string;
  state: string;
  position: number | undefined;
  supportsPosition?: boolean;
  numEntityId?: string;
  temperature?: number;
}
export interface TileSensors {
  power: number | null;
  voltage: number | null;
  current: number | null;
  energy: number | null;
  /** What `energy` represents: 'Energy' (lifetime) or 'Today'/'Week'/'Month'. */
  energyLabel: string;
  temp: number | null;
  rssi: number | null;
  uptime: number | null;
}
export interface GraphEntity { entityId: string; label: string; dc: string; unit: string }
/** One playable entry of a media player's browse tree. */
export interface BrowseItem { title: string; id: string; type: string }
export interface BrowseGroup { label: string; items: BrowseItem[] }
/** `live` marks the synthetic "now" point appended from the current state —
 *  drawn like any other, but excluded from auto-scaling and peak dots so an
 *  instantaneous spike can't flatten a series of statistic means. */
export interface SparkPoint { t: number; v: number; live?: boolean }
/** One physical input on a Shelly (or similar) device.
 *
 *  `kind` is what HA's entity shape says the input IS: a momentary **button**
 *  reports presses on an `event` entity (single/double/long push); a steady
 *  **switch** reports its position on a `binary_sensor`. A device with both for
 *  one channel is a button — the event is the richer signal.
 *
 *  `output` is the relay/light on the SAME device that shares the input's
 *  channel number (`input_0` ↔ `switch_0`): the output the input is wired to.
 *  With it, an unconfigured row can still do the obvious thing — toggle that
 *  output — instead of being a dead status line. Input-only hardware (i3/i4,
 *  UNI) has no output, so it stays undefined there. */
export interface InputChannel {
  entityId: string;
  label: string;
  isOn: boolean;
  /** Kept for renderers that only care about momentary vs steady. Equals kind === 'button'. */
  isButton: boolean;
  kind: 'button' | 'switch';
  channel: number;
  lastEvent: string | null;
  lastChanged: string | null;
  /** Entity id of the paired output on this device, when one exists. */
  output?: string;
}
export interface FirmwareInfo { entityId: string; current: string; newVersion: string | undefined }
/** Visual tier for tile chip rendering. Defaults to 'primary' when unset. */
export type SensorChipTier = 'primary' | 'electrical' | 'diag';
export interface SensorChip {
  label: string;
  value: string;
  warn?: boolean;
  /** Sensor key ('power', 'rssi', …) — matches editor SENSOR_GROUPS keys */
  key?: string;
  /** Rendering tier — primary (large), electrical (compound strip), diag (muted footer) */
  tier?: SensorChipTier;
  /** Channel label for multi-channel devices (e.g. '1', '2') */
  ch?: string;
}
export interface VirtualControl {
  entityId: string;
  domain: 'select' | 'number' | 'button' | 'text' | 'switch';
  label: string;
  value: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  isOn: boolean;
}
export type DeviceAlert = 'overtemp' | 'overpower';

export interface TileCtx {
  hass: HomeAssistant;
  config: HADeviceDashboardConfig;
  device: HADevice;
  profile: DeviceProfileResult;
  accent: string;
  online: boolean;
  isOn: boolean;

  /** Per-element visibility for this tile's style (Style Presets). The default
   *  comes from STYLE_ELEMENTS (`def: false` marks opt-in elements) unless a
   *  device/area/style-preset override says otherwise. */
  showEl: (id: string) => boolean;

  // Device helpers
  getPrimarySwitch: (d: HADevice) => PrimarySwitch | null;
  getTrv: (d: HADevice) => TrvInfo | null;
  getCover: (d: HADevice) => CoverInfo | null;
  getValve: (d: HADevice) => ValveInfo | null;
  getPower: (d: HADevice) => number | null;
  tileSensors: (d: HADevice) => TileSensors;
  /** Selected graph sensors, gated by Show graphs (companion rows, graph block). */
  getGraphEntities: (d: HADevice) => GraphEntity[];
  /** Selected graph sensors regardless of Show graphs — for surfaces that are
   *  about history (sensor card, detail sheet) and carry their own switch. */
  getGraphSensors: (d: HADevice) => GraphEntity[];
  /** Kick off (or refresh) a media player's browse tree — one level down from
   *  the root, which for a Wall Display is its radio favourites. Cached, and
   *  only ever called on demand: a fleet of media players must not start a
   *  request storm on first render. */
  requestBrowse: (entityId: string) => void;
  /** Playable items from the browse tree, grouped by the folder they came
   *  from. null = never asked, 'pending' = loading, [] = nothing offered. */
  getBrowseGroups: (entityId: string) => BrowseGroup[] | 'pending' | null;
  /** First live reading per device_class, with where it came from — what the
   *  gauge rings draw. Primary entities win; a diagnostic one only stands in
   *  for a class nothing else reports. */
  sensorValues: (d: HADevice) => Record<string, SensorReading>;
  getPowerSparks: (d: HADevice) => SparkPoint[];
  ensureGraphData: (d: HADevice) => void;

  // Shared renderers
  renderEntityAnim: (entityId: string, isOn: boolean, deviceId: string) => TemplateResult;
  renderSparklinesFiltered: (d: HADevice, entities: GraphEntity[]) => TemplateResult;
  renderTileLowerBody: (
    d: HADevice,
    profile: DeviceProfileResult,
    opts?: { skipPowerGraph?: boolean; skipGraphs?: boolean },
  ) => TemplateResult;
  renderTrvDial: (trv: TrvInfo) => TemplateResult;
  renderValveDial: (vc: ValveInfo) => TemplateResult;

  // Service wrappers
  setTemp: (entityId: string, temp: number) => void;
  setHvacMode: (entityId: string, mode: string, e: Event) => void;
  setPresetMode: (entityId: string, preset: string) => void;
  coverAction: (entityId: string, action: 'open' | 'close' | 'stop', e: Event) => void;
  /** Drive a position-aware cover straight to a percentage (0 closed … 100 open). */
  setCoverPosition: (entityId: string, pos: number) => void;
  /** Start an `update.*` entity's install — the detail sheet's firmware row. */
  installUpdate: (entityId: string, e: Event) => void;
  valveAction: (entityId: string, action: 'open' | 'close' | 'stop', e: Event) => void;
  toggle: (entityId: string, isOn: boolean, e: Event) => void;
  pressButton: (entityId: string, e: Event) => void;
  setNumberValue: (entityId: string, v: number) => void;
  selectOption: (entityId: string, option: string) => void;

  // Tile-specific helpers
  timeAgo: (ts: string | null | undefined) => string;
  getInputChannels: (d: HADevice) => InputChannel[];
  /** Label of the action bound to this input channel, or null when unmapped.
   *  Input hardware has no output, so the row runs an assigned action instead. */
  getInputActionLabel: (d: HADevice, ch: InputChannel) => string | null;
  /** True when the channel also has a press-and-hold action (e.g. hold to dim). */
  inputHasHold: (d: HADevice, ch: InputChannel) => boolean;
  /** Live hold-to-dim feedback for this channel while a hold is ramping:
   *  direction and the brightness the ramp is at. Null when not dimming. */
  getInputDimFeedback: (ch: InputChannel) => { dir: 1 | -1; pct: number } | null;
  /** Live state of the channel's toggle target, for keypad lit/off styling.
   *  `null` = unknowable (the action isn't a toggle), so the key stays neutral. */
  getInputActionState: (d: HADevice, ch: InputChannel) => 'on' | 'off' | 'unavailable' | null;
  /** Dropdown chip on the row — a `select` entity's options (WLED presets, …),
   *  for what a third gesture used to do at the wall. Null when unconfigured. */
  getInputSelectChip: (d: HADevice, ch: InputChannel) => {
    entity: string; label?: string; options: string[]; current: string;
  } | null;
  setInputSelectOption: (entityId: string, option: string) => void;
  runInputAction: (d: HADevice, ch: InputChannel, e: Event) => void;
  startInputHold: (d: HADevice, ch: InputChannel, e: Event) => void;
  endInputHold: () => void;
  handleScenePress: (d: HADevice) => void;
  adjustTrvTemp: (trv: TrvInfo, direction: -1 | 1) => void;
  requestGraphData: (entityId: string, hours?: number) => void;
  getGraphPoints: (entityId: string, hours: number) => SparkPoint[];
  rgbToHex: (r: number, g: number, b: number) => string;
  setBrightness: (entityId: string, pct: number) => void;
  setColor: (entityId: string, hex: string, whiteValue?: number, isRgbw?: boolean) => void;

  // Block-tile helpers
  getAlerts: (d: HADevice) => DeviceAlert[];
  getFirmware: (d: HADevice) => FirmwareInfo | null;
  getSensors: (d: HADevice) => SensorChip[];
  getVirtualControls: (d: HADevice) => VirtualControl[];
  renderSparklines: (d: HADevice) => TemplateResult;
  renderSparklinesExpanded: (d: HADevice, hours: number) => TemplateResult;
  renderPowerBar: (d: HADevice) => TemplateResult;

  // Detail-sheet helpers
  closeDetailSheet: () => void;
  getDetailHistoryRange: () => DetailHistoryRange;
  setDetailHistoryRange: (r: DetailHistoryRange) => void;
  fireMoreInfo: (entityId: string) => void;
}
