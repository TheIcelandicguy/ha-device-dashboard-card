# Roadmap

Known work, with the reasoning for its order. Deliberately short — anything
user-facing (a bug, a feature request) belongs in
[Issues](https://github.com/TheIcelandicguy/ha-device-dashboard-card/issues),
not here. This file is for structural work that no user will ever file.

## Next

**Render sensors that carry no recognised `device_class`.** *Promised publicly on
the launch thread — this one has a waiting user.*

The card decides what to show by `device_class`, in two places: the chip row and
the sensor tile's primary value. Anything outside those lists is discovered and
then silently not rendered.

That excludes an entire category of device. CPU and memory percentages carry **no
device class at all**; disk and memory in bytes are **`data_size`**, which is in
neither list. So a computer, NAS, server or VM host can be discovered, grouped
into a room, and show nothing but its own name.

Reproduced on a live instance: a card scoped to System Monitor, Home Assistant
Core and a Windows PC over MQTT rendered four tiles, `4/4 online`, and not one
reading between them. Switching to `tile_style: sensor-card` was worse — the
System Monitor tile led with **"unavailable %"** labelled `battery`, having found
the single entity whose class it recognised and preferred a dead one to a dozen
live ones.

Two things follow. The obvious fix is to let `sensors` and `graph_sensors` accept
explicit entity ids alongside device classes, so a tile can be told what to show
when the card cannot infer it. The subtler one is that the sensor tile should
prefer a *live* entity over an unavailable one when choosing its primary, which
is a bug independent of everything above.

This supersedes the virtual-device idea below. The request that prompted that one
— CPU/RAM/storage — needs neither a new tile type nor a synthetic device: those
sensors already sit on real, discovered devices. They just cannot be drawn.

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

**Say when discovery hid something.** Universal mode filters twice — a built-in
integration deny-list (`systemmonitor`, `hassio`, `netgear`, `tplink_router`,
`mobile_app` …) and `universal_scope`, which keeps only devices with a
controllable entity or a sensor carrying a recognised `device_class`. Both
defaults are right: without them a smart-home dashboard fills up with routers,
phones and diagnostics.

What is wrong is that they are **silent**. A user whose devices were filtered
sees an incomplete card and concludes it is broken, and nothing on screen points
at the setting responsible. This is the shape of the first question the project
got after launch — someone asking whether Proxmox CPU/RAM/disk could be shown.

They can. Verified against a live instance: with `include_integrations` and
`universal_scope: all`, System Monitor, Home Assistant Core, a Windows PC over
MQTT, a Netgear router and three TP-Link routers all render with sensor tiles
and graphs. Every one of those sensors was already attached to a device — none
of it needed a new tile type, only the two filters turned off.

Note this is necessary but not sufficient: turning the filters off reveals the
devices, and the item above is what makes them worth revealing. A notice that
leads someone to an empty tile has helped nobody.

So the fix is a notice, not a feature: *"N devices hidden — 12 by integration,
40 by scope"*, with a link to the setting. The pattern already exists — the
delegated-controls notice counts affected devices and dispatches
`hdd-editor-goto` to jump to its setting — so this is a second instance of
something the card already does, not new machinery.

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
