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
  /** Count beta firmware offers as updates. Off by default — see isBetaUpdate. */
  includeBeta?: boolean;
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

/**
 * Two different things get called "alerts", and conflating them was a bug:
 *
 *  - a **fault** is the device complaining about itself (overtemp, overpower).
 *    That is what the tile badge and the header chip have always meant.
 *  - an **alarm** is the world being wrong (smoke, water, gas). Different
 *    urgency, different audience, same need to be surfaced.
 *
 * Both are computed here so the tiles, the header count and the attention list
 * cannot drift apart — which they had, with a firing smoke alarm showing in one
 * and not the others.
 */
export function deviceFaults(device: HADevice, states: States): string[] {
  const out: string[] = [];
  for (const e of device.entities) {
    if (e.domain !== 'binary_sensor') continue;
    const s = states[e.entity_id];
    if (!s || s.state !== 'on') continue;
    const dc = (s.attributes?.device_class as string) ?? '';
    if (dc === 'heat' || e.entity_id.includes('overtemp')) out.push('overtemp');
    else if (dc === 'safety' || e.entity_id.includes('overpower')) out.push('overpower');
  }
  return [...new Set(out)];
}

export function environmentAlarms(device: HADevice, states: States): string[] {
  const out: string[] = [];
  for (const e of device.entities) {
    if (e.domain !== 'binary_sensor') continue;
    const s = states[e.entity_id];
    if (!s || s.state !== 'on') continue;
    const dc = (s.attributes?.device_class as string) ?? '';
    if (dc === 'smoke') out.push('smoke');
    else if (dc === 'moisture') out.push('water');
    else if (dc === 'gas') out.push('gas');
  }
  return [...new Set(out)];
}

/** Everything worth raising on a device, faults and alarms together. */
export function firingAlerts(device: HADevice, states: States): string[] {
  return [...deviceFaults(device, states), ...environmentAlarms(device, states)];
}

/** Whether an update is genuinely available — an `update` entity that is on AND
 *  offers a version different from the installed one. The header chip has always
 *  used the stricter rule; the attention list now uses the same one. */
export function hasUpdate(
  device: HADevice,
  states: States,
  opts: { includeBeta?: boolean } = {},
): boolean {
  const u = pendingUpdate(device, states, opts);
  return !!u && !!u.next && u.next !== u.current;
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

/**
 * A Shelly exposes two update entities per device: `firmware` and
 * `beta_firmware`. The beta one is on whenever a beta exists, which is nearly
 * always — on a real fleet that was 21 of 25 "available updates", none of which
 * anyone intended to install. Betas are excluded unless asked for.
 */
export function isBetaUpdate(entityId: string, attributes?: Record<string, unknown>): boolean {
  return /beta/i.test(entityId) || /beta/i.test((attributes?.friendly_name as string) ?? '');
}

/** An `update` entity that is on — i.e. an install is available. */
export function pendingUpdate(
  device: HADevice,
  states: States,
  opts: { includeBeta?: boolean } = {},
): { current: string; next: string; entityId: string } | null {
  for (const e of device.entities) {
    if (e.domain !== 'update') continue;
    const s = states[e.entity_id];
    if (!s || s.state !== 'on') continue;
    if (!opts.includeBeta && isBetaUpdate(e.entity_id, s.attributes)) continue;
    return {
      entityId: e.entity_id,
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
      const upd = hasUpdate(device, states, opts) ? pendingUpdate(device, states, opts) : null;
      if (upd) { kinds.push('update'); detail.push(`update → ${upd.next}`); }
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
export interface LightCountOptions {
  /** HA label ids that mean "this device drives a light". A device carrying one
   *  has its switch entities counted too. */
  labels?: string[];
  /** Entity ids to count regardless of domain or label. */
  entities?: string[];
}

export function lightCounts(
  devices: HADevice[],
  states: States,
  opts: LightCountOptions = {},
): { on: number; total: number; onNames: string[] } {
  const labels = new Set(opts.labels ?? []);
  const extra = new Set(opts.entities ?? []);
  let on = 0, total = 0;
  const onNames: string[] = [];
  const seen = new Set<string>();

  const consider = (entityId: string, fallbackName: string) => {
    if (seen.has(entityId)) return;
    const s = states[entityId];
    if (!s || DEAD.has(s.state ?? '')) return;
    seen.add(entityId);
    total++;
    if (s.state === 'on') {
      on++;
      onNames.push((s.attributes?.friendly_name as string) ?? fallbackName);
    }
  };

  for (const d of devices) {
    // A device labelled as driving lights lends that meaning to its switches:
    // HA has no way to know a relay is wired to a lamp, and the user does.
    const labelled = !!d.labels?.some(l => labels.has(l));
    for (const e of d.entities) {
      if (e.domain === 'light' || extra.has(e.entity_id) || (labelled && e.domain === 'switch')) {
        consider(e.entity_id, d.name);
      }
    }
  }

  // Explicit entities that belong to no discovered device still count.
  for (const id of extra) consider(id, id);

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
    if (raw == null || raw === '') continue;
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

/** `20260311-095847/1.7.5-g9979d16` → `1.7.5`. Anything unrecognised is kept.
 *  Tolerates non-string input — in universal mode some integrations report a
 *  numeric `sw_version` (e.g. a Yamaha receiver's `2.87`), which must not crash. */
export function shortVersion(raw: unknown): string {
  const s = typeof raw === 'string' ? raw : String(raw ?? '');
  const m = s.match(/(\d+\.\d+(?:\.\d+)?)/);
  return m ? m[1] : s;
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
