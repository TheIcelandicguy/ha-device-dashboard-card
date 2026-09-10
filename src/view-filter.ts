/**
 * Which devices a view shows — as a pure function, with one implementation.
 *
 * There were two. The card filtered devices to render them and the editor
 * filtered them again to print "42 of 178 match", each with its own copy of the
 * same six gates. Nothing kept them in step, so adding a gate to one silently
 * made the other's count wrong — and the count is what people trust when they
 * are building a view and cannot see the result yet.
 *
 * ── Every gate is an AND ─────────────────────────────────────────────────────
 *
 * A device has to pass all of them. That is easy to forget, because the editor
 * reads as a series of things you switch on, and it produced the worst bug this
 * filter has had: a view listing every room still excluded devices that have
 * none, and naming those devices under "include specific devices" *narrowed*
 * the result instead of adding to them — the area gate had already removed
 * them, so the intersection was empty and the view rendered blank.
 *
 * Hence `trace`: each gate records what it removed, so an empty view can name
 * the gate that emptied it rather than showing a blank page.
 */

import type { DeviceProfile, ViewFilter } from './types';

/** The minimum a device must expose to be filtered. */
export interface FilterableDevice {
  device_id: string;
  area?: string;
  integration?: string;
  entities: Array<{ domain: string; entity_id: string }>;
}

export interface ViewGate {
  gate: string;
  before: number;
  after: number;
}

/**
 * The unassigned bucket's key in a view's `areas` list — the same empty string
 * the card matches on via `(d.area ?? '')`, and the same one `room-filter.ts`
 * uses. A list of real room names excludes every device without a room unless
 * this is in it.
 */
export const NO_AREA = '';

export function applyViewFilter<T extends FilterableDevice>(
  devices: readonly T[],
  filter: ViewFilter | undefined,
  profileOf: (d: T) => DeviceProfile,
  trace?: ViewGate[],
): T[] {
  let out = [...devices];
  if (!filter) return out;

  const gate = (name: string, next: T[]) => {
    trace?.push({ gate: name, before: out.length, after: next.length });
    out = next;
  };

  if (filter.profiles?.length) {
    const allow = new Set(filter.profiles);
    gate('profiles', out.filter(d => allow.has(profileOf(d))));
  }
  if (filter.domains?.length) {
    const allow = new Set(filter.domains);
    gate('domains', out.filter(d => d.entities.some(e => allow.has(e.domain))));
  }
  if (filter.integrations?.length) {
    const allow = new Set(filter.integrations.map(i => i.toLowerCase()));
    gate('integrations', out.filter(d => allow.has((d.integration ?? '').toLowerCase())));
  }
  if (filter.areas?.length) {
    // Case-insensitive, and `''` is a legitimate member: it is the No Room
    // bucket, not an empty selection.
    const allow = new Set(filter.areas.map(a => a.toLowerCase()));
    gate('areas', out.filter(d => allow.has((d.area ?? '').toLowerCase())));
  }
  if (filter.devices?.length) {
    const allow = new Set(filter.devices);
    gate('devices', out.filter(d => allow.has(d.device_id)));
  }
  if (filter.exclude_devices?.length) {
    const block = new Set(filter.exclude_devices);
    gate('exclude_devices', out.filter(d => !block.has(d.device_id)));
  }
  if (filter.entity_id_pattern) {
    let re: RegExp | null = null;
    // An invalid pattern filters nothing rather than throwing: a half-typed
    // regex in the editor must not blank the card being edited.
    try { re = new RegExp(filter.entity_id_pattern); } catch { re = null; }
    if (re) gate('entity_id_pattern', out.filter(d => d.entities.some(e => re!.test(e.entity_id))));
  }
  return out;
}

/** The gate that took the last device, for the empty-view explanation. */
export function emptiedBy(trace: readonly ViewGate[]): ViewGate | undefined {
  return trace.find(g => g.after === 0 && g.before > 0);
}

/**
 * Does this filter list rooms while leaving out the unassigned bucket?
 *
 * The specific trap worth naming on screen: every room ticked still hides
 * devices that have none, and nothing about a full list of rooms suggests
 * something is missing from it.
 */
export function missesNoRoom(filter: ViewFilter | undefined, unassignedCount: number): boolean {
  const areas = filter?.areas;
  return unassignedCount > 0 && !!areas?.length && !areas.includes(NO_AREA);
}
