import { ShellyStatus, ShellyRelayState, ShellyTemperature } from './types';

// ─── Shelly Cloud API client ───────────────────────────────────────────────────
//
// Docs: https://shelly-api-docs.shelly.cloud/cloud-control-api/
//
// Regional servers:
//   EU:  https://shelly-12-eu.shelly.cloud
//   US:  https://shelly-13-us.shelly.cloud
//   etc.
//
// Authentication: auth_key in POST body (NOT a header) for all requests.
//
// NOTE: The Cloud API requires Shelly Cloud to be enabled on each device and
// the device added to the user's Shelly Cloud account. It is an optional
// fallback when direct LAN access is unavailable.

export interface CloudDeviceSummary {
  id: string;
  name: string;
  model: string;
  online: boolean;
  room_id?: string;
}

interface CloudListDevicesResponse {
  isok: boolean;
  data?: {
    devices_status: Record<string, CloudDeviceStatus>;
    devices: Record<string, CloudDeviceInfo>;
  };
  errors?: Record<string, unknown>;
}

interface CloudDeviceInfo {
  id: string;
  type: string;
  name?: string;
}

interface CloudDeviceStatus {
  online: boolean;
  _updated?: string;
  relays?: Array<{ ison: boolean; source?: string }>;
  meters?: Array<{ power: number; total: number; voltage?: number }>;
  temperature?: number;
  tmp?: { tC: number };
  switch?: Array<{ id: number; output: boolean; apower?: number }>;
}

interface CloudControlResponse {
  isok: boolean;
  errors?: Record<string, unknown>;
}

export class ShellyCloudClient {
  private readonly server: string;
  private readonly authKey: string;

  constructor(server: string, authKey: string) {
    // Normalize server: strip trailing slash
    this.server = server.replace(/\/$/, '');
    this.authKey = authKey;
  }

  private async post<T>(path: string, body: Record<string, string>): Promise<T> {
    const params = new URLSearchParams({ ...body, auth_key: this.authKey });
    const res = await fetch(`${this.server}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Cloud API ${path} HTTP ${res.status}`);
    return res.json() as Promise<T>;
  }

  /** Returns a list of all devices visible in the cloud account */
  async listDevices(): Promise<CloudDeviceSummary[]> {
    const resp = await this.post<CloudListDevicesResponse>('/device/all_status', {});
    if (!resp.isok || !resp.data) {
      throw new Error('Cloud listDevices failed');
    }
    return Object.entries(resp.data.devices).map(([id, d]) => ({
      id,
      name: d.name ?? id,
      model: d.type,
      online: resp.data!.devices_status[id]?.online ?? false,
    }));
  }

  /** Returns the current status of a device by its cloud device ID */
  async getDeviceStatus(deviceId: string): Promise<ShellyStatus> {
    const resp = await this.post<CloudListDevicesResponse>('/device/all_status', {
      device_id: deviceId,
    });
    if (!resp.isok || !resp.data) {
      return { online: false, relays: [], temperatures: [] };
    }

    const status = resp.data.devices_status[deviceId];
    if (!status) {
      return { online: false, relays: [], temperatures: [] };
    }

    // Normalize relay states — cloud returns Gen1-style or Gen2 switch style
    const relays: ShellyRelayState[] = [];

    if (status.relays) {
      const meters = status.meters ?? [];
      status.relays.forEach((r, i) => {
        relays.push({
          channel: i,
          name: `Relay ${i}`,
          ison: r.ison,
          source: r.source,
          power: meters[i]?.power,
          energy: meters[i]?.total ? meters[i].total / 60 : undefined,
          voltage: meters[i]?.voltage,
        });
      });
    } else if (status.switch) {
      status.switch.forEach((sw) => {
        relays.push({
          channel: sw.id,
          name: `Switch ${sw.id}`,
          ison: sw.output,
          power: sw.apower,
        });
      });
    }

    const temperatures: ShellyTemperature[] = [];
    const tC = status.tmp?.tC ?? status.temperature;
    if (tC !== undefined) temperatures.push({ id: 0, tC });

    return {
      online: status.online,
      relays,
      temperatures,
    };
  }

  /** Toggle a relay via cloud (Gen1-style: isOn = true|false) */
  async setRelay(deviceId: string, channel: number, on: boolean): Promise<void> {
    const resp = await this.post<CloudControlResponse>('/device/relay/control', {
      device_id: deviceId,
      channel: String(channel),
      turn: on ? 'on' : 'off',
    });
    if (!resp.isok) {
      throw new Error(`Cloud setRelay failed: ${JSON.stringify(resp.errors)}`);
    }
  }

  /** Trigger OTA update via cloud */
  async triggerUpdate(deviceId: string): Promise<void> {
    const resp = await this.post<CloudControlResponse>('/device/ota', {
      device_id: deviceId,
      update: '1',
    });
    if (!resp.isok) {
      throw new Error(`Cloud triggerUpdate failed: ${JSON.stringify(resp.errors)}`);
    }
  }
}

/** Singleton cloud client — created once when config is first available */
let _cloudClient: ShellyCloudClient | null = null;
let _cloudClientKey = '';

export function getCloudClient(server: string, authKey: string): ShellyCloudClient {
  const key = `${server}|${authKey}`;
  if (!_cloudClient || _cloudClientKey !== key) {
    _cloudClient = new ShellyCloudClient(server, authKey);
    _cloudClientKey = key;
  }
  return _cloudClient;
}
