import type { TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type {
  HADevice,
  HADeviceDashboardConfig,
  DeviceProfileResult,
  DetailHistoryRange,
} from '../types';

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
export interface SparkPoint { t: number; v: number }
export interface InputChannel {
  entityId: string;
  label: string;
  isOn: boolean;
  isButton: boolean;
  channel: number;
  lastEvent: string | null;
  lastChanged: string | null;
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

  /** Per-element visibility for this tile's style (Style Presets). Returns true
   *  unless a device/area/style-preset override hides the element. */
  showEl: (id: string) => boolean;

  // Device helpers
  getPrimarySwitch: (d: HADevice) => PrimarySwitch | null;
  getTrv: (d: HADevice) => TrvInfo | null;
  getCover: (d: HADevice) => CoverInfo | null;
  getValve: (d: HADevice) => ValveInfo | null;
  getPower: (d: HADevice) => number | null;
  tileSensors: (d: HADevice) => TileSensors;
  getGraphEntities: (d: HADevice) => GraphEntity[];
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
