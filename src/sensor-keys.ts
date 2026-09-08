/**
 * One list, two kinds of key.
 *
 * `sensors` and `graph_sensors` have only ever held device_class keys —
 * `temperature`, `power`, `battery`. That works for hardware whose readings
 * carry a class and fails completely for everything else. A Proxmox host, a
 * NAS, a router or a PC reports CPU load, memory use and free disk with no
 * `device_class` whatsoever, so no key existed that could name them: they were
 * unreachable from config, not merely unselected.
 *
 * An entity id is now accepted anywhere a class key is, in the same list, told
 * apart by the dot that every entity id carries and no device_class ever does.
 * So `sensors: ['temperature', 'sensor.davidpc_cpuload']` reads as "the
 * temperature chip, and that particular reading".
 *
 * A separate `sensor_entities` key was the alternative and was rejected: it
 * would need its own rung on the Tile ladder, and two lists that can disagree
 * about the same tile is the shape of bug this codebase keeps deleting.
 *
 * These lists cascade down to *every* tile, so a named entity applies only to
 * the device that owns it. Without that rule one CPU sensor named in the card's
 * global `sensors` would try to draw a CPU chip on all fifty tiles.
 */

import type { HADevice, HAEntity } from './types';

/**
 * Is this key an entity id rather than a device_class?
 *
 * The dot is the whole test. Entity ids are `<domain>.<object_id>` and always
 * have one; HA device classes are single lower-snake words and never do.
 */
export function isEntityKey(key: string): boolean {
  return key.includes('.');
}

/** The device_class keys in a mixed list, in order. */
export function classKeys(list: readonly string[]): string[] {
  return list.filter(k => !isEntityKey(k));
}

/** The entity ids in a mixed list, in order. */
export function entityKeys(list: readonly string[]): string[] {
  return list.filter(isEntityKey);
}

/**
 * The named entities this device actually owns, in the order the user named
 * them — config order, not registry order, because naming them is what the
 * user did to control the order.
 */
export function namedEntitiesOn(device: HADevice, list: readonly string[] | undefined): HAEntity[] {
  if (!list?.length) return [];
  const owned = new Map(device.entities.map(e => [e.entity_id, e]));
  const out: HAEntity[] = [];
  for (const id of entityKeys(list)) {
    const hit = owned.get(id);
    if (hit && !out.includes(hit)) out.push(hit);
  }
  return out;
}

/**
 * What "Select all" writes: every class key on offer, keeping the entity ids
 * already named.
 *
 * "All" is a statement about the class pills, and no pill represents a named
 * entity — so wiping them there would delete a choice the user cannot see on
 * screen and did not touch. "None" still clears the lot, because that is what
 * it says.
 */
export function selectAllKeys(
  current: readonly string[] | undefined,
  allClassKeys: readonly string[],
): string[] {
  return [...entityKeys(current ?? []), ...allClassKeys];
}
