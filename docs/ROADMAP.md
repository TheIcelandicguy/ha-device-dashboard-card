# Roadmap

Known work, with the reasoning for its order. Deliberately short — anything
user-facing (a bug, a feature request) belongs in
[Issues](https://github.com/TheIcelandicguy/ha-device-dashboard-card/issues),
not here. This file is for structural work that no user will ever file.

## Next

**Measure render cost at 200+ tiles.** `npm run bench` covers discovery (3.7 ms
for 224 devices, cached against registry+config identity) and the cascades. What
is *not* measured is DOM render time for a large fleet, which is the more likely
real-world limit. Benchmark the thing that hurts, not the thing already known to
be fast.

## Done

Kept only where the reasoning is still worth having; the changelog is the record.

**Render sensors with no recognised `device_class`** — v1.4.0. The card decided
what to show by `device_class` in two places, so a computer, NAS or VM host was
discovered and then drawn blank. Both selections moved to `src/sensor-pick.ts`,
and `sensors` / `graph_sensors` now take entity ids alongside class keys
(`src/sensor-keys.ts`). The fleet check that verified it also caught a
regression on the way in: HA files battery under `diagnostic`, and for a door
sensor the battery is the only reading there is.

**Say when discovery hid something** — the notice counts what each filter
dropped and links to the setting. Two things learned building it. Attribution
has to be per *device* and only when nothing of it survived, or a device with
entities from two integrations gets blamed on the denied one. And the count must
come from the browser's `hass.entities`, which omits disabled entities — the
websocket registry includes them, and counting those inflated the figure roughly
2.5×, reporting devices as "hidden by your settings" that are simply disabled in
Home Assistant.

**A fixture library for device detection** — `npm run test:detection` runs
`getDeviceProfile` and `detectShellyGen` over 215 scrubbed registry rows
harvested from a live instance across 30-odd integrations, against recorded
expectations. Proven by reintroducing the original ordering bug — the name test
above `hw_version` — which the suite reports as a hand-checked regression with
the reasoning attached.

Two things it taught immediately. `detectShellyGen` is never handed a display
name: both call sites pass `device.model`, so the "name" its comments describe is
the model string, and a test that passes a name tests nothing real. And the first
mutation I tried did not fail, because `hw_version` short-circuits above it —
which is the fix working, but it means a mutation has to be placed where the bug
actually was to prove anything.

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

**Virtual devices — a tile built from entities rather than hardware.** Considered
and deliberately parked. The idea was to let a tile's subject be a user-chosen
set of entities, for things Home Assistant does not model as a device
(helpers, template sensors). Most of the machinery exists: `extra_sensors`
already merges arbitrary entities into a device's entity list and marks them
`borrowed_from`, and `tile_layout` / `custom_styles` already let a tile's
*shape* be composed by hand. Only the subject is fixed to a discovered device.

It was parked because the case that prompted it did not need it: every
CPU/RAM/storage sensor on the instance that raised the question turned out to
belong to a device already, so the answer was the notice above, not a new tile.
The narrower justification — genuinely device-less entities — is real but
unproven demand. Wait for someone to ask for *that* specifically.

If it is ever built, one rule settles most of the design: a virtual device has
no hardware, so it can never be offline, must never appear in Needs attention,
and must not count in the header's online tally. `borrowed_from` already
establishes the principle that borrowed entities do not speak for the device's
health.

**Submit to the HACS default store.** The repo meets every requirement (public,
description, topics, README, `hacs.json`, releases, validation green). Being in
the default store is the difference between "paste a URL into custom
repositories" and "search HACS for it" — the single largest adoption lever left.
