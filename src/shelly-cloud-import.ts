/**
 * Import a user's Shelly Cloud setup — room photos and per-device product
 * images — straight into the card's config.
 *
 * Everything here talks to the same API the Shelly Control web app uses:
 * `POST https://{server}/interface/device/get_all_lists` with the account's
 * *authorization cloud key* (control.shelly.cloud → user settings →
 * Authorization cloud key). The device shards answer with
 * `Access-Control-Allow-Origin: *`, so a frontend-only card can call it
 * directly — no proxy, no backend.
 *
 * The auth key is a credential: it is used for the one fetch and must never be
 * written into the card config or anywhere else. The image URLs the import
 * produces need no auth — stock images live on the public
 * `control.shelly.cloud` CDN and custom uploads are served from the user's
 * shard under `/shelly_files/` (guarded only by the account hash in the path,
 * which is why the editor tells the user their photo URLs are "unlisted").
 *
 * `get_all_lists` is the app's endpoint, not the documented integrator API —
 * it can change without notice, so every consumer treats a shape mismatch as
 * a soft failure ("Shelly changed something"), never a crash.
 */

/** One room as the cloud reports it. */
export interface CloudRoom {
  id: number;
  name: string;
  /** `images/room_def/…` (stock) or `assets/user_images/…` (custom upload). */
  image?: string;
  floor?: number;
  position?: number;
}

/** One device (or channel) as the cloud reports it. */
export interface CloudDevice {
  /** MAC hex, lowercase, possibly with a `_N` channel suffix. */
  id: string;
  name?: string;
  /** Model SKU, e.g. `SNSW-001P16EU`. */
  type?: string;
  /** `images/device_images/{SKU}.png` — Shelly's official product image. */
  image?: string;
  room_id?: number;
  category?: string;
}

export interface CloudLists {
  rooms: CloudRoom[];
  devices: CloudDevice[];
}

/** Where the stock images (`images/…` paths) live. */
export const CLOUD_IMAGE_CDN = 'https://control.shelly.cloud/';

/**
 * Normalize whatever the user pastes as their server into `https://{host}`.
 * Accepts a bare host, a URL, or a device's cloud config value like
 * `shelly-59-eu.shelly.cloud:6022/jrpc` (port + path are the device websocket,
 * not the REST API — strip them).
 */
export function normalizeCloudServer(input: string): string | undefined {
  let s = (input ?? '').trim();
  if (!s) return undefined;
  s = s.replace(/^[a-z]+:\/\//i, '');
  s = s.split('/')[0].split(':')[0];
  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(s)) return undefined;
  return `https://${s}`;
}

/**
 * Resolve a cloud image path to a fetchable URL.
 * - `images/…` (stock rooms + product shots) → the public CDN. `fullSize`
 *   swaps the `_m` room variant for `_l` (both verified to exist).
 * - `assets/…` (custom uploads) → the user's shard under `/shelly_files/`.
 *   The API hands out the `thumb_` file; dropping the prefix is the full-size
 *   original (verified).
 */
export function resolveCloudImage(
  path: string | undefined,
  server: string,
  fullSize = false,
): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('images/')) {
    const p = fullSize ? path.replace(/_m\.(jpe?g|png)$/i, '_l.$1') : path;
    return CLOUD_IMAGE_CDN + p;
  }
  if (path.startsWith('assets/')) {
    const p = fullSize ? path.replace(/thumb_(?=[^/]+$)/, '') : path;
    return `${server.replace(/\/$/, '')}/shelly_files/${p}`;
  }
  return undefined;
}

/** True when a room image is one of Shelly's generic stock pictures rather
 *  than something the user uploaded. */
export function isStockRoomImage(path: string | undefined): boolean {
  return !!path && path.startsWith('images/room_def/');
}

/** The bare 12-hex MAC a cloud device id carries (channel suffix stripped),
 *  or undefined when the id isn't MAC-shaped (virtual groups etc.). */
export function cloudMac(id: string): string | undefined {
  const m = /^([0-9a-f]{12})(?:_\d+)?$/i.exec(id ?? '');
  return m ? m[1].toLowerCase() : undefined;
}

const normName = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Auto-pair cloud rooms with HA area names by normalized name (case,
 * whitespace and accents ignored — "Bílskúr" pairs with "Bilskur"). Rooms with
 * no match map to undefined; the editor asks the user about those.
 */
export function matchCloudRooms(
  rooms: CloudRoom[],
  areaNames: string[],
): Map<number, string | undefined> {
  const byNorm = new Map(areaNames.map(n => [normName(n), n]));
  return new Map(rooms.map(r => [r.id, byNorm.get(normName(r.name ?? ''))]));
}

/** The subset of a HA device-registry entry the matcher needs. */
export interface RegistryDeviceLike {
  id: string;
  connections?: Array<[string, string]>;
  identifiers?: Array<[string, string]>;
}

/**
 * Match cloud devices to HA registry rows by MAC. A cloud id is the bare MAC;
 * HA carries it as a `mac` connection (`b4:8a:0a:…`) and Shelly's integration
 * also puts it in `identifiers` as `['shelly', 'B48A0A…']`. One MAC can match
 * several registry rows (per-channel sub-devices, device_pulse shadows) — all
 * of them are returned so the style lands on whichever row survives the card's
 * merge passes.
 */
export function matchCloudDevices(
  devices: CloudDevice[],
  registry: Iterable<RegistryDeviceLike>,
): Map<string, string[]> {
  const byMac = new Map<string, string[]>();
  for (const dev of registry) {
    const macs = new Set<string>();
    for (const [type, value] of dev.connections ?? []) {
      if (type === 'mac') macs.add(value.replace(/[:-]/g, '').toLowerCase());
    }
    for (const [domain, ident] of dev.identifiers ?? []) {
      if (domain === 'shelly' && /^[0-9a-f]{12}$/i.test(ident)) macs.add(ident.toLowerCase());
    }
    for (const mac of macs) {
      const list = byMac.get(mac) ?? [];
      list.push(dev.id);
      byMac.set(mac, list);
    }
  }
  const out = new Map<string, string[]>();
  for (const d of devices) {
    const mac = cloudMac(d.id);
    if (!mac) continue;
    const ids = byMac.get(mac);
    if (ids?.length) out.set(mac, ids);
  }
  return out;
}

/**
 * Fetch the account's rooms + devices from the cloud. Throws with a
 * user-showable message on auth or shape problems. The auth key is only ever
 * part of this one request body.
 */
export async function fetchCloudLists(server: string, authKey: string): Promise<CloudLists> {
  let res: Response;
  try {
    res = await fetch(`${server}/interface/device/get_all_lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `auth_key=${encodeURIComponent(authKey)}`,
    });
  } catch {
    throw new Error('Could not reach the Shelly Cloud server — check the server address.');
  }
  let json: any;
  try { json = await res.json(); } catch {
    throw new Error('The Shelly Cloud server sent an unexpected reply.');
  }
  if (!res.ok || json?.isok !== true) {
    const detail = json?.errors ? Object.values(json.errors).join(' ') : `HTTP ${res.status}`;
    throw new Error(`Shelly Cloud refused the request: ${detail}`);
  }
  const rooms = json?.data?.rooms, devices = json?.data?.devices;
  if (typeof rooms !== 'object' || typeof devices !== 'object' || rooms === null || devices === null) {
    throw new Error('Shelly Cloud answered without room/device lists — the API may have changed.');
  }
  return {
    rooms: Object.values(rooms as Record<string, CloudRoom>).filter(r => r && typeof r.id === 'number'),
    devices: Object.values(devices as Record<string, CloudDevice>).filter(d => d && typeof d.id === 'string'),
  };
}
