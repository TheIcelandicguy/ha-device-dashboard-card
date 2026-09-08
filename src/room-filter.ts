/**
 * Which rooms the card shows — the `areas` filter, as pure functions.
 *
 * The unassigned bucket (devices with no HA area) is a room like any other as
 * far as `areas` is concerned: the card matches on `(d.area ?? '')`, so the
 * empty string is its key and an `areas` list must be able to contain it.
 *
 * The editor drew a row for it but left it out of the key universe, and the two
 * bugs that followed both read as the card losing devices by itself:
 *
 *  - Switching **any** room off wrote an explicit `areas` list built from the
 *    real areas only. `''` could never be in that list, so every device without
 *    a room disappeared from the card at the same time.
 *  - The row was derived from the *area-filtered* device list, so once those
 *    devices were filtered out the row vanished with them — leaving no way to
 *    switch No Room back on. The setting was unreachable from the UI that set it.
 *
 * Hence the rule this module exists to state once: the universe of room keys
 * includes `''` whenever any device is unassigned, and it is decided from every
 * discovered device, never from the filtered view.
 */

/** The `areas` key for devices with no HA area. Empty string, because the card
 *  filters on `(d.area ?? '')` — not the display label, which is translated. */
export const NO_AREA_KEY = '';

/**
 * Every room key the filter can name: the real areas, plus the unassigned
 * bucket when anything is actually in it.
 *
 * `hasUnassigned` must be computed from the full device list. Deriving it from
 * the filtered one is self-referential — the filter removes the devices, which
 * removes the key, which removes the row that would have restored them.
 */
export function areaKeyUniverse(areaNames: readonly string[], hasUnassigned: boolean): string[] {
  return hasUnassigned ? [...areaNames, NO_AREA_KEY] : [...areaNames];
}

/** undefined = no filter = every room on. */
export function isAreaOn(selected: readonly string[] | undefined, key: string): boolean {
  return selected === undefined || selected.includes(key);
}

/**
 * The new `areas` value after toggling one room.
 *
 * Returns `undefined` — "no filter" — once every known room is on again, so
 * switching the last one back restores the default rather than freezing an
 * exhaustive list that would then silently exclude any room added later.
 */
export function toggleAreaSelection(
  allKeys: readonly string[],
  selected: readonly string[] | undefined,
  key: string,
): string[] | undefined {
  const on = new Set(selected === undefined ? allKeys : selected);
  if (on.has(key)) on.delete(key);
  else on.add(key);
  // Membership, not size: a stale key from a deleted room would otherwise make
  // an incomplete selection look complete.
  return allKeys.every(k => on.has(k)) ? undefined : [...on];
}
