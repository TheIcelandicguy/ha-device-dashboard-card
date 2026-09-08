/**
 * Which reading a sensor tile leads with, and which it shows as chips.
 *
 * Pure, so it can be tested without a DOM — and shared, so the two selections
 * cannot drift. They had already drifted: the *secondary* chips were chosen by
 * whether a reading is usable (primary-tier, live, carries a unit, parses as a
 * number), while the *primary* value demanded one of five hardcoded device
 * classes and never checked the value was usable at all.
 *
 * That combination produced a tile leading with "unavailable %" labelled
 * `battery` on a machine reporting a dozen live figures: the dead battery sensor
 * was the only entity whose class was on the list, so it won. Meanwhile CPU and
 * memory — which carry no `device_class` whatsoever — could never be chosen, so
 * computers, NAS boxes and VM hosts rendered as "No sensor".
 */

import type { HADevice, HAEntity, HassAttrs } from './types';
import { namedEntitiesOn } from './sensor-keys';

/** Classes worth leading with when a device has one — a room's temperature says
 *  more at a glance than its signal strength. A preference, never a filter. */
export const PRIORITY_CLASSES = ['temperature', 'humidity', 'carbon_dioxide', 'illuminance', 'battery'];

export const BINARY_CLASSES = ['motion', 'door', 'window', 'moisture', 'smoke', 'gas'];

/** Minimal shape of `hass.states` this module needs. */
export type StatesMap = Record<string, { state: string; attributes?: Record<string, unknown> } | undefined>;

const attrs = (states: StatesMap, id: string) => (states[id]?.attributes ?? {}) as HassAttrs;

/**
 * A reading worth putting on a tile: a primary-tier sensor holding a live
 * number with a unit.
 *
 * The unit test is load-bearing rather than tidiness — without it a firmware
 * version like `20260311-095847/1.7.5` parses to a "2026.0" chip.
 *
 * The explicit `unavailable` / `unknown` clause is redundant today: both fail
 * `parseFloat` anyway. It stays because it states the intent, and because the
 * numeric test is the accident, not the rule — the point is that a dead entity
 * must never outrank a live one.
 */
export function isMeasurement(e: HAEntity, states: StatesMap): boolean {
  return isReading(e, states) && !e.entity_category;
}

/**
 * The same usable-number test, but allowing diagnostic entities.
 *
 * Home Assistant files battery level under `diagnostic`, and for a door sensor,
 * a remote or a phone the battery is the *only* thing the device reports. A
 * plain non-diagnostic rule turned nine real devices into "No sensor" tiles, so
 * the primary gets a last-resort tier that chips deliberately do not.
 */
export function isReading(e: HAEntity, states: StatesMap): boolean {
  if (e.domain !== 'sensor') return false;
  const s = states[e.entity_id];
  if (!s || s.state === 'unavailable' || s.state === 'unknown') return false;
  if (!attrs(states, e.entity_id).unit_of_measurement) return false;
  return !isNaN(parseFloat(s.state));
}

/**
 * The tile's headline reading: a priority class if the device has one, else any
 * usable measurement. Returns undefined only when the device reports nothing
 * numeric at all — at which point the caller falls back to a binary sensor.
 */
export function pickPrimarySensor(
  device: HADevice,
  states: StatesMap,
  named?: readonly string[],
): HAEntity | undefined {
  // An explicit choice outranks every heuristic below it — that is what naming
  // an entity in `sensors` is for. Diagnostics included: if you asked for it by
  // id, you meant it.
  for (const e of namedEntitiesOn(device, named)) {
    if (isReading(e, states)) return e;
  }

  const classed = (usable: (e: HAEntity) => boolean) => {
    for (const dc of PRIORITY_CLASSES) {
      const hit = device.entities.find(
        e => usable(e) && attrs(states, e.entity_id).device_class === dc);
      if (hit) return hit;
    }
    return undefined;
  };

  // 1. A recognised class the user would lead with — a room's temperature.
  const preferred = classed(e => isMeasurement(e, states));
  if (preferred) return preferred;

  // 2. Failing that, whatever this device does report. A CPU percentage carries
  //    no device_class at all, and refusing to show it was the difference
  //    between a useful tile and "No sensor".
  const any = device.entities.find(e => isMeasurement(e, states));
  if (any) return any;

  // 3. Last resort, a diagnostic reading — but only a priority class, so a
  //    battery-powered sensor leads with its battery rather than its RSSI.
  return classed(e => isReading(e, states));
}

/** The binary state to lead with when there is no numeric reading at all. */
export function pickPrimaryBinary(device: HADevice, states: StatesMap): HAEntity | undefined {
  return device.entities.find(e =>
    e.domain === 'binary_sensor'
    && states[e.entity_id]
    && BINARY_CLASSES.includes((attrs(states, e.entity_id).device_class as string) ?? ''));
}

/** Everything else worth chipping beneath the headline, capped for space. */
export function pickSecondarySensors(
  device: HADevice,
  states: StatesMap,
  primaryId: string | undefined,
  limit = 4,
  named?: readonly string[],
): HAEntity[] {
  // Named entities, in the order named, are the whole answer when given: the
  // point of listing them is to say what the tile shows and in what order.
  const explicit = namedEntitiesOn(device, named)
    .filter(e => e.entity_id !== primaryId && isReading(e, states));
  if (explicit.length) return explicit.slice(0, limit);

  return device.entities
    .filter(e => e.entity_id !== primaryId && isMeasurement(e, states))
    .slice(0, limit);
}
