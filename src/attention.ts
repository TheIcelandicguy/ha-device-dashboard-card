/**
 * Fleet-level summaries: what needs looking at, and which firmware everything is
 * on.
 *
 * A 50-device dashboard hides its own problems — three offline devices among
 * fifty tiles is something you scroll past. Both functions here answer a
 * question the per-tile rendering cannot: *which* devices, out of all of them.
 *
 * Pure, like the cascades: hass state comes in as a plain map so this is
 * testable without a browser.
 */
import type { HADevice } from './types';

export type AttentionKind = 'offline' | 'alert' | 'battery' | 'update';

export interface AttentionItem {
  device: HADevice;
  kinds: AttentionKind[];
  /** Human summary, e.g. "offline · overtemp" — built by the caller's renderer. */
  detail: string[];
}

export interface AttentionOptions {
  /** Battery percentage at or below which a device is worth flagging. */
  batteryBelow?: number;
}

interface StateLike { state?: string; attributes?: Record<string, unknown> }
type States = Record<string, StateLike | undefined>;

const DEAD = new Set(['unavailable', 'unknown']);

/** Same rule the tiles use: a device is online if any of its entities has a
 *  usable state. A battery sensor still reporting counts. */
export function isOnline(device: HADevice, states: States): boolean {
  return device.entities.some(e => {
    const s = states[e.entity_id];
    return !!s && !DEAD.has(s.state ?? '');
  });
}

/** Firing alerts on a device — the same device_class / id rules as the chips. */
export function firingAlerts(device: HADevice, states: States): string[] {
  const out: string[] = [];
  for (const e of device.entities) {
    if (e.domain !== 'binary_sensor') continue;
    const s = states[e.entity_id];
    if (!s || s.state !== 'on') continue;
    const dc = (s.attributes?.device_class as string) ?? '';
    if (dc === 'heat' || e.entity_id.includes('overtemp')) out.push('overtemp');
    else if (dc === 'safety' || e.entity_id.includes('overpower')) out.push('overpower');
    else if (dc === 'smoke') out.push('smoke');
    else if (dc === 'moisture') out.push('water');
    else if (dc === 'gas') out.push('gas');
  }
  return [...new Set(out)];
}

/** Lowest battery reading on the device, or null if it has none. */
export function batteryLevel(device: HADevice, states: States): number | null {
  let low: number | null = null;
  for (const e of device.entities) {
    if (e.domain !== 'sensor') continue;
    const s = states[e.entity_id];
    if (!s || (s.attributes?.device_class as string) !== 'battery') continue;
    const v = parseFloat(s.state ?? '');
    if (isNaN(v)) continue;
    low = low === null ? v : Math.min(low, v);
  }
  return low;
}

/** An `update` entity that is on — i.e. an install is available. */
export function pendingUpdate(device: HADevice, states: States): { current: string; next: string } | null {
  for (const e of device.entities) {
    if (e.domain !== 'update') continue;
    const s = states[e.entity_id];
    if (!s || s.state !== 'on') continue;
    return {
      current: (s.attributes?.installed_version as string) ?? '',
      next: (s.attributes?.latest_version as string) ?? '',
    };
  }
  return null;
}

/**
 * Devices worth a look, worst first: offline, then firing alerts, then flat
 * batteries, then available updates. A device can appear for several reasons and
 * is listed once with all of them.
 */
export function attentionItems(
  devices: HADevice[],
  states: States,
  opts: AttentionOptions = {},
): AttentionItem[] {
  const floor = opts.batteryBelow ?? 20;
  const items: AttentionItem[] = [];

  for (const device of devices) {
    const kinds: AttentionKind[] = [];
    const detail: string[] = [];

    if (!isOnline(device, states)) {
      kinds.push('offline');
      detail.push('offline');
    } else {
      // Only meaningful for a device that is actually reporting — an offline
      // device's last-known alert is noise, not news.
      const alerts = firingAlerts(device, states);
      if (alerts.length) { kinds.push('alert'); detail.push(...alerts); }
      const batt = batteryLevel(device, states);
      if (batt !== null && batt <= floor) { kinds.push('battery'); detail.push(`battery ${Math.round(batt)}%`); }
      const upd = pendingUpdate(device, states);
      if (upd) { kinds.push('update'); detail.push(upd.next ? `update → ${upd.next}` : 'update available'); }
    }

    if (kinds.length) items.push({ device, kinds, detail });
  }

  const rank: Record<AttentionKind, number> = { offline: 0, alert: 1, battery: 2, update: 3 };
  const worst = (i: AttentionItem) => Math.min(...i.kinds.map(k => rank[k]));
  return items.sort((a, b) => worst(a) - worst(b) || a.device.name.localeCompare(b.device.name));
}

/**
 * Lights on, out of lights present. The header's old "Light" chip averaged
 * illuminance in lux, which is a different question — this one answers "how many
 * lights are on", which is what people read that chip as asking.
 *
 * Counts `light` entities only: a switch driving a lamp is a switch as far as HA
 * is concerned, and guessing otherwise would make the number unexplainable.
 */
export function lightCounts(devices: HADevice[], states: States): { on: number; total: number; onNames: string[] } {
  let on = 0, total = 0;
  const onNames: string[] = [];
  for (const d of devices) {
    for (const e of d.entities) {
      if (e.domain !== 'light') continue;
      const s = states[e.entity_id];
      if (!s || DEAD.has(s.state ?? '')) continue;
      total++;
      if (s.state === 'on') {
        on++;
        onNames.push((s.attributes?.friendly_name as string) ?? d.name);
      }
    }
  }
  return { on, total, onNames };
}

export interface FirmwareGroup {
  version: string;
  devices: HADevice[];
  /** True for the highest version present — the one everything else lags. */
  current: boolean;
}

/**
 * Firmware spread across the fleet. Shelly stamps versions like
 * `20260311-095847/1.7.5-g9979d16`; the semantic part is what matters, so group
 * on that and keep the raw string for display.
 */
export function firmwareGroups(devices: HADevice[]): FirmwareGroup[] {
  const byVersion = new Map<string, HADevice[]>();
  for (const d of devices) {
    const raw = d.sw_version;
    if (!raw) continue;
    const version = shortVersion(raw);
    if (!byVersion.has(version)) byVersion.set(version, []);
    byVersion.get(version)!.push(d);
  }
  const groups = [...byVersion.entries()]
    .map(([version, ds]) => ({ version, devices: ds, current: false }))
    .sort((a, b) => compareVersions(b.version, a.version));
  if (groups.length) groups[0].current = true;
  return groups;
}

/** `20260311-095847/1.7.5-g9979d16` → `1.7.5`. Anything unrecognised is kept. */
export function shortVersion(raw: string): string {
  const m = raw.match(/(\d+\.\d+(?:\.\d+)?)/);
  return m ? m[1] : raw;
}

/** Numeric-segment comparison, so 1.10.0 sorts above 1.9.9. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(n => parseInt(n, 10));
  const pb = b.split('.').map(n => parseInt(n, 10));
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0, y = pb[i] ?? 0;
    if (isNaN(x) || isNaN(y)) return a.localeCompare(b);
    if (x !== y) return x - y;
  }
  return 0;
}
