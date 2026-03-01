import {
  ShellyDeviceInfo,
  ShellyGen,
  ShellyStatus,
  ShellyRelayState,
  ShellyTemperature,
  ShellyFirmwareInfo,
} from './types';

// ─── Gen detection ─────────────────────────────────────────────────────────────

/**
 * Auto-detects the generation of a Shelly device from its /shelly endpoint.
 * Gen1 returns { type, mac, fw, ... }; Gen2/3 return { gen: 2|3, ... }.
 */
async function detectGen(ip: string): Promise<ShellyGen> {
  const res = await fetch(`http://${ip}/shelly`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Failed to reach ${ip}/shelly`);
  const data = await res.json();
  if (data.gen === 3) return 3;
  if (data.gen === 2) return 2;
  return 1;
}

// ─── Gen1 helpers ──────────────────────────────────────────────────────────────

interface Gen1Status {
  relays?: Array<{
    ison: boolean;
    source?: string;
    overpower?: boolean;
    overtemperature?: boolean;
  }>;
  meters?: Array<{ power: number; total: number; voltage?: number }>;
  emeters?: Array<{ power: number; total: number; voltage?: number; current?: number }>;
  temperature?: number;
  tmp?: { tC: number };
  update?: { status: string; has_update: boolean; new_version?: string; beta_version?: string };
  wifi_sta?: { rssi: number };
  uptime?: number;
  ram_free?: number;
}

interface Gen1Info {
  type: string;
  mac: string;
  fw: string;
  auth: boolean;
  num_outputs?: number;
}

async function gen1GetInfo(ip: string): Promise<ShellyDeviceInfo> {
  const [shellyRes, settingsRes] = await Promise.all([
    fetch(`http://${ip}/shelly`, { signal: AbortSignal.timeout(5000) }),
    fetch(`http://${ip}/settings`, { signal: AbortSignal.timeout(5000) }),
  ]);
  const shelly: Gen1Info = await shellyRes.json();
  const settings = await settingsRes.json();
  return {
    id: shelly.mac,
    name: settings.name ?? shelly.type,
    model: shelly.type,
    gen: 1,
    fw_ver: shelly.fw,
    mac: shelly.mac,
    ip,
    auth_enabled: shelly.auth,
  };
}

async function gen1GetStatus(ip: string): Promise<ShellyStatus> {
  const [statusRes, infoRes] = await Promise.all([
    fetch(`http://${ip}/status`, { signal: AbortSignal.timeout(5000) }),
    fetch(`http://${ip}/shelly`, { signal: AbortSignal.timeout(5000) }),
  ]);
  const s: Gen1Status = await statusRes.json();
  const shelly: Gen1Info = await infoRes.json();

  const meters = s.emeters ?? s.meters ?? [];

  const relays: ShellyRelayState[] = (s.relays ?? []).map((r, i) => ({
    channel: i,
    name: `Relay ${i}`,
    ison: r.ison,
    source: r.source,
    power: meters[i]?.power,
    energy: meters[i]?.total ? meters[i].total / 60 : undefined, // Wmin → kWh
    voltage: meters[i]?.voltage,
    current: (s.emeters ?? [])[i]?.current,
    overpower: r.overpower,
    overtemperature: r.overtemperature,
  }));

  const temperatures: ShellyTemperature[] = [];
  const tC = s.tmp?.tC ?? s.temperature;
  if (tC !== undefined) temperatures.push({ id: 0, tC });

  let firmware: ShellyFirmwareInfo | undefined;
  if (s.update) {
    firmware = {
      current: shelly.fw,
      update_available: s.update.has_update,
      new_version: s.update.new_version,
      beta_available: !!s.update.beta_version,
    };
  }

  return {
    online: true,
    relays,
    temperatures,
    firmware,
    wifi_rssi: s.wifi_sta?.rssi,
    uptime: s.uptime,
  };
}

async function gen1SetRelay(ip: string, channel: number, on: boolean): Promise<void> {
  const res = await fetch(`http://${ip}/relay/${channel}?turn=${on ? 'on' : 'off'}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`gen1SetRelay failed: ${res.status}`);
}

async function gen1Reboot(ip: string): Promise<void> {
  await fetch(`http://${ip}/reboot`, { signal: AbortSignal.timeout(5000) });
}

async function gen1TriggerUpdate(ip: string): Promise<void> {
  await fetch(`http://${ip}/ota?update=1`, { signal: AbortSignal.timeout(5000) });
}

// ─── Gen2/3 helpers ────────────────────────────────────────────────────────────

interface RpcResult<T> {
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

let _rpcId = 1;

async function rpc<T>(ip: string, method: string, params: Record<string, unknown> = {}): Promise<T> {
  const id = _rpcId++;
  const res = await fetch(`http://${ip}/rpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, method, params }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`RPC ${method} HTTP ${res.status}`);
  const body: RpcResult<T> = await res.json();
  if (body.error) throw new Error(`RPC ${method} error ${body.error.code}: ${body.error.message}`);
  return body.result as T;
}

interface Gen23DeviceInfo {
  id: string;
  name: string;
  model: string;
  gen: number;
  fw_id: string;
  ver: string;
  app: string;
  mac: string;
  auth_en: boolean;
}

async function gen23GetInfo(ip: string, gen: 2 | 3): Promise<ShellyDeviceInfo> {
  const info = await rpc<Gen23DeviceInfo>(ip, 'Shelly.GetDeviceInfo');
  return {
    id: info.id,
    name: info.name,
    model: info.model ?? info.app,
    gen: gen as ShellyGen,
    fw_ver: info.ver,
    mac: info.mac,
    ip,
    auth_enabled: info.auth_en,
  };
}

interface Gen23Status {
  [key: string]: unknown;
}

interface SwitchStatus {
  id: number;
  output: boolean;
  source?: string;
  apower?: number;
  voltage?: number;
  current?: number;
  aenergy?: { total: number };
  temperature?: { tC: number };
  errors?: string[];
}

interface ThermostatStatus {
  id: number;
  tC?: number;
}

interface SysStatus {
  uptime?: number;
  ram_free?: number;
  fs_free?: number;
  wifi_sta?: { rssi?: number };
  available_updates?: { stable?: { version: string }; beta?: { version: string } };
  kvs?: unknown;
}

async function gen23GetStatus(ip: string, gen: 2 | 3): Promise<ShellyStatus> {
  const info = await gen23GetInfo(ip, gen);
  const status = await rpc<Gen23Status>(ip, 'Shelly.GetStatus');
  const sys: SysStatus = (status['sys'] as SysStatus) ?? {};

  // Collect switch channels
  const relays: ShellyRelayState[] = [];
  let i = 0;
  while (`switch:${i}` in status) {
    const sw = status[`switch:${i}`] as SwitchStatus;
    relays.push({
      channel: sw.id,
      name: `Switch ${sw.id}`,
      ison: sw.output,
      source: sw.source,
      power: sw.apower,
      voltage: sw.voltage,
      current: sw.current,
      energy: sw.aenergy ? sw.aenergy.total / 1000 : undefined, // Wh → kWh
      overtemperature: sw.errors?.includes('overtemp'),
      overpower: sw.errors?.includes('overpower'),
    });
    i++;
  }

  // Also check cover channels (roller shutters report as "cover")
  // (not included as relay toggles but noted for future use)

  // Temperatures
  const temperatures: ShellyTemperature[] = [];
  let t = 0;
  while (`temperature:${t}` in status) {
    const tmp = status[`temperature:${t}`] as ThermostatStatus;
    if (tmp.tC !== undefined) temperatures.push({ id: t, tC: tmp.tC });
    t++;
  }
  // Also check for temperature on switch components
  for (const relay of relays) {
    const swStatus = status[`switch:${relay.channel}`] as SwitchStatus | undefined;
    if (swStatus?.temperature?.tC !== undefined && temperatures.length === 0) {
      temperatures.push({ id: relay.channel, tC: swStatus.temperature.tC });
    }
  }

  let firmware: ShellyFirmwareInfo | undefined;
  const availUpdates = sys.available_updates;
  if (availUpdates) {
    firmware = {
      current: info.fw_ver,
      update_available: !!(availUpdates.stable || availUpdates.beta),
      new_version: availUpdates.stable?.version,
      beta_available: !!availUpdates.beta,
    };
  } else {
    firmware = { current: info.fw_ver, update_available: false };
  }

  return {
    online: true,
    device: info,
    relays,
    temperatures,
    firmware,
    wifi_rssi: sys.wifi_sta?.rssi,
    uptime: sys.uptime,
    ram_free: sys.ram_free,
    fs_free: sys.fs_free,
  };
}

async function gen23SetRelay(ip: string, channel: number, on: boolean): Promise<void> {
  await rpc(ip, 'Switch.Set', { id: channel, on });
}

async function gen23Reboot(ip: string): Promise<void> {
  await rpc(ip, 'Shelly.Reboot');
}

async function gen23TriggerUpdate(ip: string): Promise<void> {
  await rpc(ip, 'Shelly.Update', { stage: 'stable' });
}

// ─── Public client class ───────────────────────────────────────────────────────

export class ShellyLocalClient {
  private _gen: ShellyGen | null = null;

  constructor(public readonly ip: string) {}

  async detectGen(): Promise<ShellyGen> {
    if (this._gen) return this._gen;
    this._gen = await detectGen(this.ip);
    return this._gen;
  }

  async getDeviceInfo(): Promise<ShellyDeviceInfo> {
    const gen = await this.detectGen();
    if (gen === 1) return gen1GetInfo(this.ip);
    return gen23GetInfo(this.ip, gen as 2 | 3);
  }

  async getStatus(): Promise<ShellyStatus> {
    const gen = await this.detectGen();
    try {
      if (gen === 1) return await gen1GetStatus(this.ip);
      return await gen23GetStatus(this.ip, gen as 2 | 3);
    } catch {
      return { online: false, relays: [], temperatures: [] };
    }
  }

  async setRelay(channel: number, on: boolean): Promise<void> {
    const gen = await this.detectGen();
    if (gen === 1) return gen1SetRelay(this.ip, channel, on);
    return gen23SetRelay(this.ip, channel, on);
  }

  async reboot(): Promise<void> {
    const gen = await this.detectGen();
    if (gen === 1) return gen1Reboot(this.ip);
    return gen23Reboot(this.ip);
  }

  async triggerUpdate(): Promise<void> {
    const gen = await this.detectGen();
    if (gen === 1) return gen1TriggerUpdate(this.ip);
    return gen23TriggerUpdate(this.ip);
  }
}

/** Cache of clients keyed by IP to avoid repeated gen detection */
const _clientCache = new Map<string, ShellyLocalClient>();

export function getShellyClient(ip: string): ShellyLocalClient {
  if (!_clientCache.has(ip)) {
    _clientCache.set(ip, new ShellyLocalClient(ip));
  }
  return _clientCache.get(ip)!;
}
