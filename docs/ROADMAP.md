# Roadmap

Known work, with the reasoning for its order. Deliberately short — anything
user-facing (a bug, a feature request) belongs in
[Issues](https://github.com/TheIcelandicguy/ha-device-dashboard-card/issues),
not here. This file is for structural work that no user will ever file.

## Next

**A fixture library for device detection.** Detection is the most fragile part of
the card and the part most likely to be wrong on hardware the author has never
seen. It is currently exercised by a handful of hand-written fixtures.

The shape wanted is `input device → expected profile` over hundreds of real
registry rows, harvested from live instances across several integrations rather
than invented. The case for it is empirical: two detection bugs were found in
one evening, both by real device data and neither by reading the code —

- a `/^sh/i` rule that matched *every* device named "Shelly…", so the whole
  unrecognised long tail would have reported as Gen 1;
- the BLU Gateway, a mains WiFi Gen3 device whose name contains "BLU",
  resolving to `'ble'`.

Reasoning alone found neither. This is the highest-value item on the list.

**Measure render cost at 200+ tiles.** `npm run bench` covers discovery (3.7 ms
for 224 devices, cached against registry+config identity) and the cascades. What
is *not* measured is DOM render time for a large fleet, which is the more likely
real-world limit. Benchmark the thing that hurts, not the thing already known to
be fast.

## Later

**Split `ha-device-dashboard.ts`.** ~4,000 lines covering state, rendering, graph
data, the period-energy fetch queue, gestures, the detail sheet and views.
Candidates to extract: `energy-data-controller`, `graph-data-controller`,
`device-cache`, `gesture-controller`. Best done opportunistically — pull one out
next time that area is touched — rather than as a single refactor. A large
rewrite of the file people are currently installing, for reasons no user has
reported, is a poor trade.

**Split `editor.ts`.** ~7,000 lines. The same argument applies, with one extra
caveat: the editor is already mid-migration toward the data-driven
`EDITOR_LAYOUT` spec, and only Graphs & Sensors renders from it. A split by tab
now would collide with finishing that. Finish the migration first.

**Typed Home Assistant registry interfaces.** Registry access goes through
`(hass as any).entities` / `.devices` / `.areas`. Small local interfaces plus
type guards would make discovery — the core of the project — refactor-safe.
Compile-time risk only, which is why it is here rather than above.

**Translate the editor.** The dashboard is translated; the editor is English
only, and deliberately so — ~600 strings, most of them explanatory paragraphs
rather than labels. Nothing in `src/localize.ts` blocks it: editor keys go in the
same catalogues under an `editor.` prefix. Worth doing if translators appear.

**Submit to the HACS default store.** The repo meets every requirement (public,
description, topics, README, `hacs.json`, releases, validation green). Being in
the default store is the difference between "paste a URL into custom
repositories" and "search HACS for it" — the single largest adoption lever left.
