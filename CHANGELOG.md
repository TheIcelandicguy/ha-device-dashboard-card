# Changelog

All notable changes to HA Device Dashboard. Versions are git tags; HACS
installs from them.

## Unreleased

### Views can filter by integration, and the filter has one implementation

A view could be cut by profile, domain, area, device or entity pattern — every
axis except the one a mixed fleet is most naturally cut on. "The Shelly view" was
not expressible. `filter.integrations` now is, with a picker listing what the
fleet actually has and how many of each.

**The gates moved to `src/view-filter.ts` first.** There were two copies: the
card filtered devices to render them, the editor filtered them again to print
"42 of 178 match", each with its own version of the same six gates and nothing
keeping them in step. Adding a seventh to one would have silently made the
other's count wrong — and that count is what you trust while building a view,
before you can see the result. One implementation now, with 21 assertions over
it, including the ordering that made the No Room bug above so confusing.

### A view filtered by rooms silently dropped every device that has none

Reported: views were created, the card showed no No Room section, and after
adding two specific devices to those views they rendered **completely blank**.

Two faults compounding, and the second made the first look like the fix:

**A view's area picker could not name the unassigned bucket.** It listed the real
areas only, so ticking every room still excluded every device without one — and
the pill that would have included them did not exist. This is the No Room bug
fixed in v1.4.1 for the Rooms tab, sitting one layer over in the view filter,
which that fix did not reach.

**Every view gate is an AND.** So the obvious next move — naming the missing
devices under *Include specific devices* — did not add them back. It intersected:
areas kept the 94 devices that have a room, then the device list narrowed those
to two that had already been removed. Nothing left.

And a view that filters to nothing rendered a blank page. No tiles, no rooms,
nothing saying why — the failure this card keeps repeating.

Now: the picker offers **No Room**, and an empty view explains itself.

> Nothing matches the "Default" view.
> The devices filter removed the last 94 devices.
> 80 devices have no room, and a list of rooms does not include them — tick No
> Room as well.
> A view's filters all have to pass, so naming devices narrows the result rather
> than adding to it.

Each gate now records what it removed, so the message names the one that took the
last device rather than guessing.

### The big number says what it is

A sensor tile labelled its headline value with the reading's `device_class` —
"temperature", "humidity" — which works for hardware that has one and leaves a
blank for everything else. A PC led with a bare **35 %** and no clue which of the
readings graphed underneath it was, leaving you to infer it from the values
below.

It falls back to the entity's own name now: **SPCC free space**, **cpuload**.
Devices that report a class are unchanged.

### A flat graph shows one number, not the same one twice

With the scale printed at both ends, a series that never moved rendered its value
top *and* bottom — `190` over `190`. Honest, and it read as a rendering fault. A
flat series has a level rather than a range, so it prints once, centred.

### Graphs show the scale they are drawn against

A sparkline autoscales to its own data, which makes the shape readable and the
height meaningless: the same line can be a 2 °C wobble or a 40 °C swing, and
nothing on screen said which.

The top and bottom of the y-axis now print either side of every plot — on
**both** sides, because on a wide graph the number you want is whichever edge
your eye is already at.

It pays for itself immediately on a PC tile: `gpuload` draws a violently spiky
line that turns out to run between 13.0 and 22.3, and `memoryusage` looks like a
steep climb across 52.6 to 59.3. Neither shape means what it looks like without
the numbers beside it.

Where `sensor_ranges` pins a range the labels show that range rather than the
data's extremes, since the pinned range is what the line is drawn against — which
is the whole point of pinning one.

`graph_style.axis_labels`, default on, with a switch in Graphs & Sensors beside
the other graph toggles.

### The firmware spread names every device, and the bars are gone

The spread told you 18 devices are on 1.7.5 and three are on 1.14.0. It never
told you *which* three, which is the question you actually have when deciding
what to go and update.

Every version now lists its devices, each with its room, each opening that
device's detail sheet — the same thing an attention row does. No click: the
names are the content, and hiding them behind an interaction to preserve a bar
chart had it backwards.

The bars went with it. They drew a proportion the device names answer better,
and they were occupying the width the names needed — on a 1500px tablet the bar
was mostly empty space to the right of a two-digit count.

A tooltip would have been the cheap version of this and useless: it gets read on
a wall tablet, where there is no hover.

**Each device shows its generation in front of the version**, because the
generation is what decides whether a version is even applicable — a Gen1 will
never see a 2.x build, so "out of date" means something different per row. On one
real fleet the two track each other exactly: 2.7.4 is entirely G2, 2.0.1 entirely
G3, 1.14.x entirely G1. That is only visible once both are on the same line.

The `G1`/`BLE`/blank rule moved to `genLabel()` in `src/helpers.ts`. It was inline
in `block-tile.ts`, and the firmware spread wanting it too would have made a
second copy of a formatting decision — the thing the roadmap's "one chip
renderer" item is about. `'other'` still renders as nothing: it means "no idea",
and a badge saying so is worse than no badge.

### The firmware spread is per integration, and "newest" was wrong

Same treatment as the attention list above, and it turned up a real bug rather
than just noise.

`firmwareGroups` sorted every version string in the fleet into one list and
marked the top one newest. That is right for a fleet of Shellys and wrong the
moment a fleet spans vendors, because version strings are not on a common scale.
On a real 178-device instance the **"newest" tag landed on `BTHome BLE v2`** — a
single device, and not a version number — while the highest Shelly release,
2.7.4, was not marked at all. Every Shelly row read as out of date against a
label from another vendor.

Each integration now gets its own spread and its own newest: `SHELLY 2.7.4` and
`HUE 2.85.1`, each correct within its vendor.

**Integrations that agree with themselves are dropped.** A single version is not
a spread. Ten of thirteen integrations on that instance were in that position,
each contributing a row that said nothing — 24 version rows became the 3
integrations actually drifting.

The header chip follows: one drifting integration still reads "8 firmware
versions", more than one reads "2 integrations on mixed versions". And muting an
integration removes it from the firmware block too, since the block lives inside
the same section.

Also fixed while verifying: an integration appearing in both the attention list
and the firmware spread was counted twice by the label-collision check, so Shelly
briefly rendered as its slug next to a perfectly friendly "Hue". Distinct
integrations are counted now, not appearances.

### Needs attention groups by integration, and you can stop counting one

In universal mode the attention list was a flat run of everything. Measured on a
176-device instance: **53 rows**, of which 18 were Music Assistant speakers and
13 were HACS repositories — burying the three Shellys that were genuinely
offline.

None of those rows was wrong. The speakers really do report `unavailable` on
every entity and the repositories really do have updates. But a speaker that is
not currently reachable is normal for a speaker, and one integration drowning
the rest is the shape of the problem — so the integration is the axis to cut on.

**Grouped.** Once a fleet spans more than one integration the list groups, worst
kind first and then by size, each group showing its own count. A fleet on one
integration renders flat, exactly as before.

**Muted, not hidden.** `attention_muted_integrations` stops an integration being
*counted*: 53 becomes 22. The muted groups stay at the foot of the list with
their counts, because a setting you cannot see is a setting you cannot undo —
which is what the No Room filter taught, by deleting the row that held the
switch.

Editable two ways: a picker under **Needs attention** in the editor, listing the
integrations actually producing rows with their counts so you never have to know
a slug; and a mute toggle on each group header in the edit dialog's live preview.
The preview is the only place the toggle appears, because a card on a dashboard
cannot write its own config — the same rule the delegate notice follows.

Two details worth the words. Integrations whose friendly labels collide fall back
to their slugs, so `spotify` and `spotifyplus` are tellable apart — muting is per
slug, and two groups both reading "Spotify" would make it impossible to know
which one a toggle silenced. And the mute uses its own event rather than a third
payload shape on `hdd-editor-goto`, which is already on the roadmap as a thing to
stop doing.

## v1.5.2 — 2026-09-09

### A sensor you named by entity id is shown even without a unit

Naming `sensor.davidpc_drives_health` (state `OK`) put a chip on the default
tile and produced **nothing at all** on a `sensor-card` — no chip, no headline,
no warning, no way to tell why. Three of the eight readings on a Windows PC are
like that: disk counts, audio sessions, drive health.

The cause was one predicate doing two jobs. `isReading()` demands a unit and a
number because it also guards the *automatic* selection, where a firmware
version like `20260311-095847/1.7.5` would otherwise parse into a "2026.0" chip.
That guard is right for a reading the card picked on your behalf and wrong for
one you typed an entity id for — `pickPrimarySensor` even says so in a comment
("if you asked for it by id, you meant it") while calling the strict test two
lines below.

Named entities now go through `isNamedReadable()`: a sensor or binary_sensor
that is alive. No unit required, no number required — the value is shown as it
reads, so `OK` renders as `OK`. Dead entities are still skipped, and the
automatic path keeps its guard, so nothing starts leading with a firmware
string.

Found by measuring the chip and graph limits rather than by hitting it. While
there: the caps themselves are now written down — `sensor-card` shows four chips
plus the headline value, the default tile has no cap, and graphs have no cap on
any style.

### A graph entity that cannot be plotted is skipped, and the editor says so

`graph_sensors` already takes entity ids, so more graphs on one tile has always
been a matter of naming more of that device's entities — there is no cap on any
tile style. Six on a PC works exactly as three did.

What did not work is naming something unplottable. `sensor.davidpc_drives_health`
reads `OK`, and it got a graph row: a label, an empty plot area, and no
explanation. Now it is skipped, because a line through `OK` is not a thing.

The skip is deliberate but it must not be silent — that is the failure this card
keeps repeating. The editor's conflict list reports it:

> **2 graph entities have no numeric value** — `graph_sensors`: DavidPC Drives
> health, DAVIDPC Default Device read as text, so no line can be drawn and they
> are skipped. They still work as chips under Sensor chips, where the value is
> shown as it reads.

Note the asymmetry is intended: a chip shows a named entity however it reads,
because "Drives health OK" is useful. A graph cannot.

### The default tile labels named chips too

The same fix, on the other tile style. A `sensor-card` learned to label chips it
was told to show by entity id; the **default** tile did not, so a PC read:

> 37 %  52.5 %  14.81 %  2904 MHz

Four numbers, no idea which is which. The default tile has its own chip renderer
with its own rule — *label only where the unit alone is ambiguous* — and a
hardcoded list of the class keys that qualify. A named entity's key is its
entity id, so it matched nothing and never got a label.

A chip named by entity id is *always* the ambiguous case: no vocabulary covers
an arbitrary entity, and a computer's readings are mostly percentages. It now
reads `cpuload 43 %  memoryusage 53.6 %  gpuload 24.22 %  currentclockspeed
2904 MHz`.

Worth naming the pattern: this is the third time one change has needed applying
in two places, because the two tile styles keep their own chip renderers. The
predicate is shared (`isEntityKey`), but the decision to call it is not.

## v1.5.1 — 2026-09-09

### An inherited entity id was invisible, and adding another deleted it

Found in an audit pass over the release, not by anyone hitting it.

The editor's **Specific entities** field was seeded from the scope's *own* list.
While a device or room is inheriting, that list is `undefined` — so the field
showed nothing even though inherited entity ids were live on the tile. And
because the field commits whatever it is showing, adding one entity wrote a list
containing only that one: every inherited id silently gone.

Verified against a running editor rather than argued. Card-wide
`sensors: [temperature, sensor.davidpc_cpuload]`, device scope inheriting: the
field showed **no chips**, and picking `sensor.davidpc_gpuload` produced
`[temperature, sensor.davidpc_gpuload]`. Now it shows `DAVIDPC cpuload` and
produces `[temperature, sensor.davidpc_cpuload, sensor.davidpc_gpuload]`.

This is the same shape as the "Select all" bug fixed in v1.5.0 — a choice with
nothing on screen to represent it, removed by an unrelated action — one layer
down, which is why the first fix did not cover it. The rule now lives in
`namedEntitiesInForce()` and `withNamedEntities()` in `src/sensor-keys.ts` with
six assertions over it, rather than inline in the editor where the first one hid.

Also hardened: `setDevicesHidden()` deduplicates. `hidden_devices` is persisted,
so a repeated id would have lived in config forever with nothing explaining it.
Not reachable from the UI today; the function was simply loose.

### Render cost measured, not assumed

`npm run bench` covers the card's logic — discovery, attention, the cascades —
and found it cheap: 4 ms of discovery for 224 devices, cached so it does not run
on a state push. That was always the part known to be fast. The part nobody had
measured is the DOM, which cannot be measured in Node at all.

`npm run bench:render` drives headless Chrome against a running Home Assistant,
builds the real card with the real `hass`, and times it at increasing fleet
sizes. On 276 real devices:

| devices | tiles | first render | state push |
|---|---|---|---|
| 25 | 25 | 38 ms | 4.6 ms |
| 100 | 100 | 208 ms | 7.9 ms |
| 200 | 200 | 267 ms | 9.9 ms |
| 276 | 276 | 306 ms | **16.4 ms** |

**The finding: cost tracks fleet size, not how much changed.** Every one of those
pushes altered the same 10% of entities. It costs 4.6 ms at 25 devices and 16.4 ms
at 276 — one whole frame — because Lit re-runs every tile's template and its
cascades even where the output is byte-identical and the DOM is left untouched.

That reframes the 2s coalescing window in `shouldUpdate`. It is not amortising a
small constant; it is what keeps a full-frame render off the critical path on a
large fleet. Nothing is being changed on the strength of this — the card is fine
at these sizes and guessing at performance produces complexity nobody needs — but
if it ever does need fixing, the lever is rendering fewer tiles, not making each
one cheaper.

Two notes for anyone rerunning it. Graphs add roughly a quarter to both numbers.
And device *mix* matters as much as count: a run including routers with 90
entities each cost nearly twice the first render of one with the same number of
Shellys, so runs are only comparable with the same discovery settings.

## v1.5.0 — 2026-09-09

### The card says when discovery hid something

Discovery filters twice, and both defaults are right: a built-in integration
deny-list (`netgear`, `mobile_app`, `hassio`, `tplink_router`, `systemmonitor` …)
and `universal_scope`, which keeps devices with a controllable entity or a sensor
carrying a recognised `device_class`. Without them a smart-home dashboard fills
with routers, phones and diagnostics. Shelly mode is narrower still — everything
that is not a Shelly is out.

What was wrong is that all of it was **silent**. A user whose devices were
dropped saw an incomplete card and concluded it was broken, with nothing on
screen pointing at the setting responsible. That was the first question the
project got after launch, and it caught the author out too: a screenshot taken
while building the previous release rendered one tile instead of three, because
`tplink_router` and `hassio` are on the deny list and nothing said so.

A dismissible line at the top of the card now says what was dropped and why:

> ⌕ 165 devices are not shown: 93 by integration, 72 by scope (browser_mod,
> hassio, mobile_app…). **Discovery** in the editor has the settings.

and in Shelly mode:

> ⌕ 270 more devices are in Home Assistant but not on this card — it is in
> Shelly mode. **Discovery** in the editor has the settings.

It is a count and a link, not a fix — the defaults do not change. In the edit
dialog the link jumps to the setting; on a dashboard, where a card cannot open
its own editor, it stays plain text rather than a link that goes nowhere.

Two things the counting had to get right. Attribution is per **device** and only
when nothing of it survived, so a device with entities from two integrations —
one denied, one kept — is not reported as hidden. And the numbers come from the
browser's `hass.entities`, which omits disabled entities; the websocket registry
includes them, and counting those inflated the figure roughly 2.5×, reporting
devices as "hidden by your settings" that are simply disabled in Home Assistant.

`getAllDevices` fills the counts as it filters, through an optional out-param, so
the notice costs no second pass over the registry.

### Pick sensors by entity in the editor, not just in YAML

v1.4.0 let `sensors` and `graph_sensors` name individual entities, which is the
only way to reach a reading with no `device_class` — CPU, memory, free disk. The
editor still offered a pill per device class and nothing else, so the feature was
YAML-only and effectively invisible.

Both pickers now carry a **Specific entities** field beneath the class pills,
using Home Assistant's own entity picker with a plain text field as the fallback.
Under Design at device scope it offers that device's own entities; card-wide it
offers anything, since a named entity only ever draws on the device that owns it.

The two halves cannot clobber each other: the pills read and write the class keys,
the field reads and writes the entity ids, and the same is true of **All** — which
already kept named entities, and now has a visible control that put them there.

**"Which sensors to graph" was hidden behind advanced mode.** It sat in the
*Per-sensor Colors* section, which is advanced-only, while the Graph Type
section's own hint told you it was "below" — pointing at a control most users
could not see. It has moved to Graph Type, where the hint already said it was.

### Naming a sensor adds to the tile's chips instead of replacing them

v1.4.0 let you name entities in `sensors`, and treated a named list as the whole
answer: name one reading and the tile showed that and nothing else. That was the
wrong default. "Which sensors show on the tile" is a general setting people use
on its own, and naming one reading should not silently switch the rest off.

Named entities now lead — in the order named — and the automatic selection fills
whatever slots are left, up to the four-chip cap. Name four and the list is
exactly yours; name one and you get it first, plus three the tile chose.

**Chips label the whole row once any of them is named.** Named chips carried
their name and automatic ones did not, which was fine while a tile had only one
kind. Mixing them put a labelled `memoryusage 50.6 %` beside a bare `34.0 %` —
the worst of both, since the second is unreadable and the mismatch looks like a
fault. Tiles that name nothing are unchanged.

### Show or hide a whole room's devices at once

Expanding a room lists its devices with a switch each, and hiding a dozen of
them meant a dozen clicks. Rooms already had **All · None** for switching the
rooms themselves; their contents now have the same control, and so does the
Favourites row.

It only appears when a room holds more than one device — a two-button control
over a single row is noise.

`hidden_devices` is a card-wide list, so the one thing this must not do is
disturb another room while rewriting one. That bookkeeping is
`setDevicesHidden()` in `src/room-filter.ts` rather than an inline filter at the
call site, with 7 assertions over it — including that showing everything again
removes the key rather than leaving an empty array behind.

### A fixture library for device detection

Detection is the most fragile part of the card and the part most likely to be
wrong on hardware the author has never seen. Both bugs found in it so far came
from looking at real device data, neither from reading the code: a `/^sh/i` rule
that matched every device named "Shelly…", and the BLU Gateway — a mains WiFi
Gen3 unit whose name says Bluetooth — resolving to `ble`. It was exercised by a
handful of hand-written fixtures, which is precisely the set that does not
contain the bugs.

`npm run test:detection` now runs `getDeviceProfile` and `detectShellyGen` over
**215 real registry rows**, harvested from a live instance across 30-odd
integrations and deduplicated to one exemplar per hardware shape — 148 sensors,
25 media, 12 dimmers, 9 plugs, 9 relays, and Shelly generations spread across
Gen1, 2, 3, BLU and unknown.

`npm run fixtures:harvest` regenerates them. The output is committed to a public
repo, so it carries only what detection reads: MACs, IPs and long hex instance
ids are replaced with stable fakes, configuration URLs, identifiers and serial
numbers are dropped, every attribute except `device_class` is dropped, and device
names survive only for `shelly` / `bthome` — the integrations whose detection
reads them. Everything else is named after its model, because a phone is usually
named after a person.

Expected results are a record of what the code does **today**, not a claim that
today's answer is right; a diff means detection changed, and `--bless` re-records
it. Rows carrying a `why` were checked against real hardware, and the suite calls
a change to one a regression rather than a drift.

Proven rather than asserted: reintroducing the original ordering bug — the name
test above `hw_version` — makes the suite fail on the BLU Gateway and print the
reasoning next to it.

### Docs caught up, and two gates so they stay that way

The docs had fallen behind the last few releases in ways the existing checker
could not see:

- **`src/help.ts` told a lie.** The Help section on naming entities said "this is
  YAML for now — the editor's pickers still offer classes only, and a future
  release will let you pick entities there too". That release was the previous
  commit. It now describes where the field actually is.
- **README's Sensor chips and Graphs sections** documented device_class keys as
  the only thing those options take, which stopped being true in v1.4.0.
- **OVERVIEW.md calls itself the full architecture tour** and was missing five
  modules — `sensor-pick`, `sensor-keys`, `room-filter`, `update-policy` and
  `font-options` — every one of them extracted precisely so it could be found
  and tested.
- **CONTRIBUTING** said nothing about the detection fixtures, including the part
  a contributor most needs to know: the expected file records what the code does
  today rather than what is right, and the harvester's scrubbing is thorough but
  not exhaustive.

Two new `check:docs` gates, both proven to fail before being committed:

- every `src/*.ts` must appear in OVERVIEW.md, so a module cannot be extracted
  and then be undiscoverable;
- README and OVERVIEW must both still mention entity ids, which is the half of
  the `sensors` / `graph_sensors` story a doc sweep would most easily drop —
  the class list reads complete on its own.

## v1.4.1 — 2026-09-08

### Switching one room off no longer hides every device that has no room

Devices with no Home Assistant area are grouped under **No Room**, and as far as
the `areas` filter is concerned that bucket is a room like any other — the card
matches on `(d.area ?? '')`, so its key is the empty string.

The editor drew a row for it but left that key out of the list of rooms it knew
about. Two things followed, and both looked like the card losing devices on its
own:

- Switching **any** room off wrote an explicit `areas` list built from the real
  areas only. The empty string could never be in that list, so every unassigned
  device disappeared from the card at the same moment — nothing on screen
  connected the two.
- The No Room row was built from the *filtered* device list, so once those
  devices were filtered out the row vanished with them. The switch that would
  have brought them back was gone, which made it unrecoverable from the UI: the
  only fix was to hand-edit YAML.

The No Room switch also never worked in its own right. Clicking it while
everything was on added the key to a set that lacked it, so the row stayed on
however many times you pressed it.

The rule now lives in one place, `src/room-filter.ts`: the unassigned bucket is
part of the room universe whenever any device is in it, and that is decided from
every discovered device rather than from the filtered view — the old way was
self-referential, since the filter removed the devices that justified the row
that would have restored them.

The Rooms & devices tree is now built from the unfiltered device list generally,
so a room you switch off still shows its contents instead of reading as empty,
and a favourite in a switched-off room no longer disappears from the Favourites
row.

Verified by rendering the editor against a live instance and reading its rows
back: with `areas: ['Kitchen']` the No Room row was **missing** before and is now
present, switched off, still listing its 80 devices. 14 new assertions.

## v1.4.0 — 2026-09-08

### Name the sensors you want, by entity id

`sensors` and `graph_sensors` have only ever held **device_class** keys —
`temperature`, `power`, `battery`. That covers hardware that reports a class and
misses everything else. A Proxmox host, a NAS, a router or a PC reports CPU load,
memory use and free disk with no `device_class` at all, so no key existed that
could name them: they were unreachable from config rather than merely unselected.

Both lists now take an **entity id** anywhere a class key goes, in the same list,
told apart by the dot that every entity id has and no device class does:

```yaml
tile_style: sensor-card
sensors:
  - sensor.davidpc_cpuload
  - sensor.davidpc_memoryusage
  - sensor.tp_link_router_cpu_used
graph_sensors:
  - sensor.davidpc_cpuload
  - sensor.davidpc_memoryusage
```

A named entity applies only to the device that owns it, so one card-wide list
configures a whole fleet without drawing a CPU chip on all fifty tiles — the
example above gives the PC its readings and the router its own, from one list.
On `sensor-card` the first entity named is also the headline value, and the
order you name them is the order they appear.

A separate `sensor_entities` key was the alternative and was rejected: it would
need its own rung on the Tile ladder, and two lists that can disagree about one
tile is the shape of bug this codebase keeps deleting.

**"Select all" no longer eats your entity ids.** The editor's chip and graph
pickers show one pill per device class, so ticking *All* rewrote the list as
"every class" and silently dropped anything named by id — a choice with no pill
on screen to show it had gone. *All* now keeps them; *None* still clears
everything, because that is what it says.

The editor's pickers still offer classes only — choosing entities there is the
next step. `npm run test:card` gained 26 assertions covering the split, the
ownership rule, the ordering and the select-all merge.

### Sensor tiles show what the device actually reports

A sensor tile chose its headline reading from five hardcoded device classes —
`temperature`, `humidity`, `carbon_dioxide`, `illuminance`, `battery` — and did
not check the value was usable. The chips *below* it, in the same file, already
asked the right question: is this a live number with a unit? Two rules for one
decision, and they disagreed.

So a machine reporting a dozen live figures led with **"unavailable %"**: its
dead battery sensor was the only entity whose class was on the list, so it won.
And CPU, memory and disk — which carry no `device_class` at all — could never be
chosen, so computers, NAS boxes, routers and VM hosts rendered as **"No sensor"**
however many sensors they had. This is what the Proxmox report on Reddit was
about.

Both selections now come from `src/sensor-pick.ts`, so they cannot drift again.
The five classes are a *preference* rather than a filter: a recognised class
wins if the device has one, otherwise the tile leads with whatever the device
does report, and a dead entity never outranks a live one.

Checked against a live 200-device instance rather than asserted: 14 devices that
rendered "No sensor" now lead with a real reading (CPU load, printer ink, power,
drive life), and the only tiles that lost their headline are four whose value
was `unavailable`. Relays that used to lead with their own chip temperature — a
diagnostic value — now lead with power, with the temperature still graphed
beneath.

That fleet check also caught a regression on the way in. Home Assistant files
battery level under `diagnostic`, and for a door sensor, a remote or a phone the
battery is the *only* thing it reports; excluding diagnostics outright blanked
nine working devices. A diagnostic reading is now a documented last resort for
the headline — and only for a priority class, so nothing leads with its signal
strength — while chips still refuse them.

Thirteen new assertions in `npm run test:card`, including the exact
"unavailable battery beats live CPU" case.

**Still to come:** naming the entities you want per tile, rather than relying on
this order. That is the part that lets you build an arbitrary system tile.

### Three duplications removed, and a render decision made testable

An outside review of the source pointed at these; all three were real.

**One font catalogue.** `CDN_FONT_FAMILIES` in the card and `FONT_OPTIONS` in the
editor were two hand-kept lists of the same thirteen families in different
shapes, with a comment in one asking humans to keep it in step with the other —
a rule you have to remember is a bug with a delay on it. Add a font to the
picker, forget the second list, and the option renders while the font never
loads. Both now derive from `src/font-options.ts`, and `npm run check:docs`
fails if a second declaration reappears.

**Editor storage no longer keyed by the card's title.** Saved looks, palettes and
the advanced-mode flag lived under `…:${config.title}` — a display string doing
duty as a storage key, the same mistake `'No Area'` made as a config key. Two
cards called "My home" shared one library; renaming a card orphaned everything
saved under the old name. They are global to the browser now, with the old
title-keyed entry migrated forward on first read.

**`shouldUpdate` is a pure function again.** Seventy lines resolving one boolean
from config state, UI state, input targets, the device cache, entity domains and
a throttle window — untestable where it sat, because it needed a DOM.
`computeUpdateReason()` in `src/update-policy.ts` makes the decision; the element
keeps only the parts that need a browser (starting the coalescing timer,
stamping the clock). Behaviour is unchanged and 17 new assertions pin it,
including one that every key in `LOCAL_RENDER_KEYS` really does force a render —
a new piece of UI state forgotten from that list is the exact failure this was
extracted to make visible.


### The "empty = the tap target" hint would not go away

Under **Input actions**, the entity pickers for *On hold → Dim* and *Double tap →
Toggle* carried a note reading `Empty = the tap target (light.x)`. It was shown
whenever the channel's *tap* target existed, without ever looking at the field it
sat beneath — so it stayed there after you picked an entity, reading as though
the choice had not registered.

It now appears only while that picker is actually empty, which is the one moment
it is telling the truth. The wording says what it means as well: *Optional —
leave empty to use the tap target (…)*, and both fields are labelled optional,
since the previous phrasing left it unclear whether a light had to be chosen for
dimming at all.


### An input row's action button showed two characters of its label

On the adaptive `default` tile, a channel's action button ellipsised down to
almost nothing — `Stokkur` rendered as "S…", `Borðstofu ljós` as "Borð…".

`.input-row-act` carried `min-width: 0`, which let it *shrink* rather than wrap.
The button's `max-width: 60%` was then 60% of a collapsing container, so the
narrower the tile the shorter the label, down to one or two letters. The comment
above that rule has always said the button "drops to its own right-aligned line
when the tile is narrow" — it could not, because shrinking always won.

`flex-shrink: 0` is what actually produces that wrap, and with the button on its
own line the 60% cap is unnecessary. Verified at 560px (button inline, label in
full) and at 340px (button wrapped to its own line, still in full).


### A one-device card can drop the room heading

`show_rooms` now exists card-wide, not only per view.

The Help's "Use the card for a single device" told you to turn off *Group by
room* in Views — and you could not, because with no view configured the renderer
read `!activeView || activeView.show_rooms !== false`, which is unconditionally
true. Following the topic meant inventing a view whose only purpose was to hold
that one switch: exactly the ceremony `devices` was added to remove. So the
feature that made a single-device card possible still left a room heading over
the single tile.

A view's own `show_rooms` still wins, and both default to on, so a config that
sets neither groups by room exactly as before. The switch sits next to *Show the
header* at Design → Global → Header, where the other card-level chrome toggles
already are, and the Help topic now points there.


### The hardware generation comes from the integration, not from the name

`detectShellyGen` read the *display model name* and, when nothing matched,
returned **Gen 1**. So any Shelly whose name did not fit one of the patterns —
including every model released after this code was written — was confidently
reported as first generation.

Home Assistant's Shelly integration writes the answer straight into the device
registry as `hw_version: gen1` / `gen2` / `gen3`. The card now asks that first,
then the `model_id` prefix (`SH`=1, `SN`/`SA`=2, `S3`=3, `S4`=4 — stable
manufacturer codes), then the name, and finally `'other'`, which honestly means
"unknown" rather than asserting Gen 1. On a 283-row Shelly fleet that moves 97%
of devices onto an authoritative source; only BLU/BTHome, which carry neither
field, still rely on the name.

This is not only the badge. `gen` picks the button numbering for `shelly.click`
press replay — Gen1 ids are 1-based, Gen2+ 0-based — so a new device guessed as
Gen 1 replayed presses on the wrong channel. `'other'` is treated as Gen2+
there, which is what anything made in the last several years is.

`hw_version` is only read for devices already established as Shelly, and only
when it matches `gen<n>`: other integrations put arbitrary text in that field
(`esp32`, `RAX50` on this instance), and it must not be mistaken for a
generation.

The name-based "BLU" test sits *below* both authoritative sources, which matters
more than it sounds: a Shelly **BLU Gateway** (`S3GW-1DBT001`, `hw_version:
gen3`) is a mains-powered Gen3 WiFi device that bridges BLU sensors. Its name
contains "BLU" but it is not a BLU device, and checking the name first reported
it as Bluetooth while discarding a perfectly good `gen3`. Real BLU hardware —
the BLU TRV (`SBTR-001AEU`), BLU H&T (`SBHT-003C`) — carries no `hw_version`, so
it falls through to the `SB` prefix or the name and still reports `'ble'`.

The name test also refuses to fire for anything called a **gateway**, because a
gateway bridges Bluetooth rather than being a Bluetooth device. Shelly ships two
whose names say otherwise and which are both mains-powered WiFi units: the BLU
Gateway Gen3 (`S3GW-1DBT001`) and the Bluetooth Gateway (`SNGW-BT01` — `SN`, so
Gen2 hardware, despite being the first of its product line). This function
reports Shelly's hardware generation, not product iteration.

`HADevice` gained `model_id` and `hw_version` to carry this.

## v1.3.0 — 2026-09-06

### The dashboard speaks your language

The card now renders in whatever language Home Assistant reports, falling back
to English. **English and Icelandic** ship; adding a locale is one file, and
`CONTRIBUTING.md` documents it.

Scope is deliberate: the **dashboard** is translated — tiles, chips, the header,
Needs attention, the detail sheet, ~180 strings. The **GUI editor is not**. That
is ~600 strings, most of them explanatory paragraphs rather than labels, and it
would be a manual to maintain in every language. The person configuring a card
chose English in a way the family reading it did not. Nothing about the design
blocks the editor later: its keys go in the same catalogues under an `editor.`
prefix.

`translate()` is pure — language in, string out — so `npm run test:card` gates
catalogue parity in both directions: a key English has and a locale lacks fails,
and so does a key a locale has that English dropped. Placeholders are checked
too, since a translation that loses `{n}` loses the number with it. That gate is
the point — a locale that rots silently is worse than no locale.

Two things this turned up that are worth naming, because both would have shipped
as bugs in every non-English install:

- **`'No Area'` is a config key, not just a label.** The unassigned-devices
  bucket is what `area_styles` and per-room header chips are stored under, and
  the same variable was being used for the heading and the lookup. Translated,
  the card would have looked up a room block that does not exist and silently
  dropped that room's styling. Split into `styleKey` (always English) and
  `label` (localized).
- **A chip's value was being compared against the literal `'Connected'`** to pick
  its ✓/✗ mark. Once the value was localized that comparison could never match
  again. It now compares against the same catalogue string it renders.

Not translated, on purpose: product, unit and protocol names (Shelly, Wi-Fi,
MQTT, dBm, SSID), Home Assistant state strings the card matches on
(`unavailable`), and light effect names HA reports (`Solid`). Translating any of
those changes behaviour rather than language.

### The header describes what you are looking at

**Fix.** The header's stats were computed from every discovered device while
Needs attention and the room grouping used the active view's. On a filtered
view that meant the header reported the fleet — a Displays tab showing nine wall
displays was headed "58/61 online, 3 offline, 608.1 W". It now reads 9/9.

If you have filtered views, their header numbers will change. They were
describing devices that view does not show.

### Putting the card on a dashboard for one device

Three things were in the way, all fixed:

- **`devices`** — a card-wide whitelist, the include that `hidden_devices` was
  always the exclude of. It existed only on a *view* filter, so showing one
  device meant inventing a view whose only job was to name it. Editor: Rooms &
  devices → *Show only these devices* (Advanced). Applied before
  `hidden_devices`, so a device in both stays hidden — an exclusion should not
  be overridable by an inclusion.
- **`show_header`** — turning off the title and the stats left an empty 32px
  bar with nowhere to go. `false` removes the element.
- And with the header fix above, a one-device card reads "1/1 online" rather
  than announcing the whole house over a single tile.

The checklist widget grew a wording parameter on the way: it began life as three
hide-lists, so "3 hidden" was baked in, and a whitelist reusing it would have
said that about the three devices it was *showing*.

### Embedded cards have a real visual editor

Adding a card meant writing YAML. It now opens Home Assistant's own form for
that card type — the same one its Add-card dialog shows — with a **Form / YAML**
switch, and the value carries across when you flip between them.

This was deliberately not done before, for a documented reason: a card editor's
`config-changed` bubbles all the way up to Home Assistant's edit-card dialog,
which reads it as an edit to *our* card and replaces this editor with its own.
Two things fixed that. The editor now comes from the card class's own
`getConfigElement()` rather than `hui-card-element-editor` — the latter is only
the dialog's wrapper around exactly that, and is not even defined outside it —
and the events it does emit are stopped at the panel boundary. Verified: editing
in the form emits nothing past the panel, and the only `config-changed` that
still reaches Home Assistant is this editor saving its own config, as it should.

It works for HACS cards too, which carry the same `getConfigElement`. A card
that ships no editor falls back to YAML and says so rather than looking broken.

### The card-type list is checked against your Home Assistant

"Start from a card type" offered 22 hardcoded names, which had already drifted:
it was missing `heading`, `todo-list`, `clock`, `statistic`, `humidifier`,
`alarm-panel` and seven more that Home Assistant 2026.8 ships.

Home Assistant exposes no way to enumerate its cards — they are lazily imported,
and the picker that holds the real list is not loaded outside its own dialog.
But asking for a card type triggers that import, and a type that exists ends up
registered while one that does not never appears. So the editor now asks about
every candidate once, when you open Add card, and offers what actually
registered. On this instance that is 36 built-in types instead of 22, with two
speculative names dropped as not real.

The list is therefore a superset to be checked rather than a claim to be
trusted: a name your Home Assistant does not have is simply never offered, so it
only has to keep up, not be right.

### Room cards can sit among the tiles instead of above them

`area_cards` always rendered as a full-width strip over a room's tiles, which
reads as a banner across the room — even though `types.ts` had been calling it
"the 'mixed in among the tiles' placement" for as long as it existed.

`area_card_placement: grid` (Extra cards → Room → **Where in the room**) puts each
card inside the device grid, taking a tile's place, so a camera or a weather card
reads as one more thing in the room. Cards lead the grid rather than trailing it:
a card put in a room is nearly always what you want to see first, and a trailing
card would move every time a device came or went.

In the grid a card's `grid_options.columns` counts **tiles**, not twelfths, and
`'full'` spans the row — the header strip is twelve columns by Home Assistant's
convention, while a room grid is however many columns that room has, and a
`columns: 6` card in a three-column room would otherwise land on half a tile.

Default is `above`, unchanged, and it is card chrome so a view can differ.

### You can see the card you are editing

Adding an embedded card meant writing YAML blind and finding out what it made
only after pressing Add. The editor now draws it as you type, under the YAML.

It renders through the same `hdd-card` the dashboard uses, so it is not an
approximation — including Home Assistant's own error card when the config is
wrong, which is the most useful thing a preview can show. When Look is set to
Match this card the preview is painted in the card's palette too, from one
shared stylesheet, so it cannot disagree with the dashboard. The backdrop is a
checker plate because many cards are translucent and on a flat panel you cannot
tell a transparent background from one that matches by accident.

Updates are debounced, so a keystroke does not rebuild the card.

### Embedded cards can be painted in the card's own look

An embedded card always looked like a Home Assistant card dropped onto the
dashboard — its own near-black background and square corners against your tiles.
`extra_card_style: match` (Extra cards → **Look** → *Match this card*) gives it
the card's tile background, border, radius, text colours, accent and font, so it
sits in the dashboard instead of on top of it.

Nothing is restyled card by card and no card-mod is involved: the palette is
mapped onto the Home Assistant theme variables that every Lovelace card already
reads, and custom properties inherit through shadow roots — so it reaches HACS
cards too. A card that hard-codes its own colours keeps them, as it should.

Default is `ha`, unchanged, and it is card chrome so a view can differ.

### Header and footer cards can differ per view

They were card-wide only: with three views, the same header cards showed on all
three. A view can now carry its own `header_cards` / `footer_cards`. Card chrome,
so the ladder is view → card, and a view's list **replaces** the card-wide one
rather than adding to it — which is what makes `[]` a real value, "no header
cards on this view". Appending could not express that.

Unset falls through to the card-wide list, so nothing written before this moves.
In the editor, Extra cards gains an **Applies to** picker; selecting a view shows
the list that actually renders there, and adding, editing or reordering from it
gives that view a list of its own. "Use the card-wide list" clears the override.
Conflicts names the case where every view overrides, since the card-wide list is
then unreachable and editing it does nothing.

### Extra cards can be reordered

Each row has ▲ ▼. Changing the order used to mean deleting a card and adding it
back in the right place.

### Embedded cards go through Home Assistant's own wrapper

An embedded card (`header_cards` / `footer_cards` / `area_cards`) was built with
`createCardElement`, the low-level factory. A real dashboard view uses
`<hui-card>`, the wrapper *above* it — so three things a Lovelace card can
normally do were quietly dropped on the way in. All three now work:

- **`visibility:` conditions are honoured.** State, user and screen-size
  conditions did nothing on an embedded card: the YAML validated and the card
  then always showed. A card hidden by a condition now leaves the strip
  entirely, taking its gap with it, rather than sitting there as a blank slot.
- **`grid_options` place the card.** The strip is a twelve-column grid, so
  `grid_options: {columns: 6}` gives a half-width card and two of them sit side
  by side. Only what *you* wrote is read, never the card element's own default —
  a tile card reports a default of six columns, and honouring that would have
  silently halved every embedded tile in every existing config. No
  `grid_options` still means full width. `rows` becomes a minimum height, since
  this strip grows to its content instead of clipping to a row grid.
- **Preview mode reaches the card**, so an embedded card in the edit dialog can
  render its edit-mode affordances instead of acting live.

`createCardElement` remains the fallback for a Home Assistant old enough not to
define `hui-card`.

## v1.2.0 — 2026-09-04

### Ask before turning a device off

Some loads are expensive to switch off by accident — a freezer, a server, the
router, the heating. `confirm_off` on a device opens a prompt before the card
switches it off. Turning it **on** is never confirmed, so the guard costs
nothing in the safe direction.

Design → the device → **Safety — this device only** → *Ask before turning off*.

It is device-only, with no type/room/view ladder. That is deliberate: two
identical plugs in one room can disagree about it, and arming a whole type or
room would put the prompt in front of you constantly and train you to tap
through it. The check sits in the single call every on/off button already went
through, so it covers every tile style, the per-channel relay rows and the
detail sheet at once — a control drawn by Home Assistant under Native controls
switches the device directly and is outside the card's reach, which the editor
says when both are on.

### The on/off button can be hidden on every style that draws one

It was hideable on the Power style only. The default adaptive tile and the
Light style drew it unconditionally, so on those it was the one control the
editor could not reach. Both now carry the same `toggle` element, at every rung
of the tile ladder.

### Graphs over a range longer than a day read the wrong day

`graph_hours: 115` drew nothing while the same sensor's detail sheet — which
asks for 24h — drew fine. Two causes, both real:

- **The raw-history fetch never sent `end_time`.** Home Assistant answers
  `history/period/<start>` with *one day starting at start*, so every range
  over 24h read the OLDEST day of the window rather than the newest. A 115h
  graph was showing the slice from 115h ago to 91h ago; a sensor added today
  did not exist then, so it came back empty. Long ranges now send `end_time`,
  and a sensor added an hour ago returns 22 states over 115h instead of none.
- **A young entity has no hourly statistics to draw.** Beyond 48h the card asks
  for hourly rows, and an entity created an hour or two ago has at most one —
  not enough for a line. Its 5-minute rows cover the same span at the same
  cost, so those are tried before falling back to raw history.

Also: a series too short to draw is retried after 30 seconds rather than five
minutes, and the row reads "no history yet", so a sensor added moments ago
fills itself in instead of looking broken. A series that draws keeps the
five-minute cache and a long range keeps its thirty.

### Fixes from the v1.1.0 audit

Seventeen confirmed findings from a review of everything since v1.1.0:

- **A hand-written scalar no longer takes the card down.** `gauge_gradients`
  and `radio_stations` expect lists; a string or an object where one belongs
  threw inside render. Both are now ignored when unusable.
- **Gauge arcs wear their gradient correctly.** The gradient was resolved
  against the *drawn* part of the arc, so every arc ran the full colour range
  and its tip was always the last stop — a cold reading showed a red tip under
  a blue label. It now spans the ring, so the arc's colour at the tip is the
  label's colour.
- **A pinned layout keeps its media controls.** Media players stopped being
  "delegated" in this release; a layout saved before that named only the old
  block and silently lost its controls. `migrateConfig` inserts the new
  `media_controls` block wherever the old one is named, at every rung.
- **Borrowed readings stay the lender's.** Only the online check skipped
  `extra_sensors`; faults, alarms, battery, updates and every room and fleet
  total counted them too — a borrowed BLU battery at 15% put a mains-powered
  Wall Display in Needs attention, and a borrowed power sensor was summed
  twice. One rule now, `isOwn`, used by every reader that judges the device or
  adds up a room.
- **The colour wheel keeps transparency.** Tile and room backgrounds are rgba
  tints; the wheel opened on black and the first touch wrote an opaque colour,
  losing the tint for good. It now reads rgba and short hex, carries the alpha
  through on an Opacity slider, and says so when a value is `transparent` or a
  CSS variable rather than pretending it is black.
- **A relay's gauge no longer reads as overheating.** The temperature ring's
  −10…40 °C range is a room range, but on a relay the only temperature is its
  own board at 45–65 °C, which pegged the arc full red. A reading now knows
  whether it came from a diagnostic entity and takes the 0–100 range if so.
- **Channel-numbered input actions are editable.** An action written in YAML
  under its channel number could be neither changed nor cleared: the editor
  read that key but always wrote the entity-id one, leaving a stale entry
  behind a new shadowing one.
- **No empty band under light, climate and cover tiles.** The new Sensor
  graphs element rendered its padded wrapper even with graphs off, which is
  the default.
- **Device-only settings count as customisation.** A tile photo, animated
  icons, borrowed sensors and input actions were invisible to the "n set
  here" badge, the scope tree, the Changes panel and Reset all.
- **One colour per sensor class.** A class shown as a gauge gradient had no
  sparkline colour control at all, and its line fell back to the palette while
  the arc above it ran the gradient; the line now takes the middle of the
  gradient, and the editor's row is labelled for both. The row's preview also
  used a different resolver from the tile, so power previewed the wrong colour.
- **The Rainbow icon cycles again.** Its glow and its hue rotation were
  different filter functions, which CSS interpolates discretely, so the card's
  copy never cycled while the editor's did.
- **The entity-search scope is per device.** Choosing "This device's entities"
  on one device narrowed the picker on every device opened afterwards, hiding
  the lights an i4 exists to control.
- **A borrowed sensor that reports late shows up.** One whose state arrived
  after the first render stayed missing until an unrelated rebuild.
- **Chips and gauge agree.** The chips took the first temperature sensor while
  the gauge preferred a primary one, so one tile could show two temperatures.
- **`dim` on a double tap is rejected.** It type-checks no more, and a
  hand-written one is named in the Conflicts panel instead of silently doing
  nothing.
- **One definition of "has a control of its own"**, so a device whose only
  control is a vacuum or a siren is no longer treated as input-only.
- **Input rows stop re-detecting the device profile** once per row per render,
  which bypassed the card's profile cache.

### Inputs that do something

- **Replay the press.** `input_actions[...].action: press` fires the same
  `shelly.click` event the wall button does (device_id, button number, click
  type), so automations with a Shelly device trigger run unchanged instead of
  being re-wired inside the card. Hold and double tap replay long and double
  pushes. The button number is read from the entity registry, so renamed inputs
  still map correctly; `channel:` overrides it.
- **Buttons and switches are told apart.** An input channel is a `button`
  (momentary, reports presses) or a `switch` (steady, reports its position); the
  row's status reads "single push · 2m ago" or On/Off instead of a dash.
- **Paired outputs toggle by default.** An input wired to a relay on its own
  device (a 1PM's Input 0 → Switch 0, a dimmer's up/down pair) toggles that
  output with no configuration. Input-only hardware gets no default.
- **Unbound rows open more-info** — the press history for a button, the state
  log for a switch — instead of doing nothing.
- **Hold-to-dim shows its ramp** — the key reads ▲ 62% while it climbs, with a
  pulsing ring, and clears on release.
- **Rows wrap on narrow tiles** so the action button and dropdown chip drop to
  their own line instead of cramming into the corner.
- **Dropdown chips name themselves** — "Preset: Boot master on" rather than the
  bare option; `select_chip.label` still overrides.

### The card's own media control

- **`media_controls` block.** A Wall Display's radio, a receiver, any
  `media_player`: a state pill, what is playing (the station name on the
  display), play/pause, stop, previous/next, a volume slider, a station
  dropdown and a ☰ button into Home Assistant's Browse media dialog. Draws only
  what the entity's `supported_features` declares. On by default for the
  media and wall_display profiles, and available on the Blocks canvas for any
  device that has a media player. Media players no longer count as
  "delegated" — Native controls is now only for locks, fans, vacuums and the
  rest of the long tail.
- **Station dropdown.** Lists what the player itself offers, read through
  Home Assistant's browse-media API one folder deep — a Wall Display's radio
  favourites (star a station on the display and it appears), a receiver's
  presets — and starts one with `play_media`. Plus the card's own streams:
  `radio_stations`, name + stream URL rows under Global → Tiles → Radio
  stations, or per device in `device_styles[id].radio_stations`.

### Borrowed readings

- **`extra_sensors`** — show sensor entities from another device on this tile
  as if it reported them: a BLU H&T's temperature and humidity on a Wall
  Display XL, which only has a light sensor. Merged at discovery, so the chips,
  graphs, gauge rings, sensor card and detail sheet (marked "from <device>")
  all see them, while the lender keeps showing them too. Borrowed entities
  never count toward the device's online state. Editor: Design → the device →
  Extra sensors, with the entity picker.

### Graphs

- **The gauge follows the device.** `power_monitor_variant: gauge` used to
  hard-code four electrical rings (W/V/A/°C), so a Wall Display or BLU H&T got a
  lone temperature arc and no humidity. It now draws one ring per sensor class
  the device reports — power, voltage, current, temperature, humidity,
  illuminance, CO₂, battery — up to four, with sensible default ranges
  (temperature −10…40 °C rather than 0…100) and the graph palette's colours.
  Environmental rings stay lit when the relay is off.
- **Gauge arcs can be gradients.** A ring runs 2–3 colours along its sweep,
  empty end to full end, so temperature climbs blue → yellow → red, humidity
  dry → wet, battery red → green; the value label wears the colour at the
  reading. `graph_style.gauge_gradients[key]`; the Graphs tab's "Gauge ring
  colours" shows each class as a Flat / Gradient choice over a preview bar,
  with the stop pickers laid out under the bar at the range values they sit
  at (−10 °C · 15 °C · 40 °C) and a + mid / − mid switch between two and
  three stops. Illuminance runs dusk-grey → yellow → white. Value
  label now sits centred just under the crown of its own arc — outer arc, its
  value, middle arc, its value — instead of piling onto the two arc ends.
- **The sensor card graphs every selected sensor**, primary first, instead of
  only the primary one — and its own "Sparkline graphs" element is the switch.
  It no longer also waits on Show graphs, which defaults off and left a card
  whose whole point is history without one.
- **The detail sheet always has its history tabs.** It used to go blank when
  tiles had Show graphs off.
- **One rule for where graphs show.** Show graphs governs the sensor rows on
  every tile style: the block tile's graph block, the rows under all five
  power-monitor variants, and a new "Sensor graphs" element on Light control,
  Climate and Cover (a dimmer on Light control gets the same power/temperature
  rows it gets on the default tile). Number and Table no longer draw power
  twice / drop the other sensors — every variant with its own power spark skips
  only power. The power-monitor "Graphs" element now hides the sensor rows as
  well as the spark, so it is no longer a dead toggle on Gauge and Compact.

### Eighteen new animated icons

Drawn for the devices a Shelly house actually has: **Flicker / Scanline /
Wake** screens for the Wall Displays; **Oven**, **Washer**, **Tumble** and
**Dishes** for the appliance relays; **Floor heat** and **Radiator** for the
heating groups; a turning **Valve**; a **Smoke detector** whose LED blinks
green at rest and red fast in alarm; a **Camera** with a REC dot; **LED strip**
(chasing) and **Rainbow** (hue-cycling) for WLED and RGBW; a **Plug** with a
spark; a **Garage** door rolling up and down; a pulsing **Bluetooth** mark for
BLU sensors; a **Router** with blinking activity LEDs; and a **PC** with a
breathing power LED and activity bars. All honour the speed and size
multipliers.

### Leftovers from the Design move

An audit of the editor after Card & Theme, Device styling, Header and Rooms
styling were folded into Design found four orphaned features and a pile of
dead code. The features were rewired, the rest removed:

- **Save this look as a style** at device and type scope — the writer had
  survived (`custom_styles` could be listed and deleted but never created).
- **Install** button on the detail sheet's firmware row — the `update.install`
  call existed, nothing showed it.
- **Position slider** on the cover tile (element `position_slider`, for covers
  that report a position) — `cover.set_cover_position` existed, nothing used it.
- **Transparency at every level.** The room's "Tile opacity" slider had been
  writing a key nothing read; it now overrides the card-wide tile
  transparency for that room. New alongside it: **Room block opacity**
  (`area_styles[name].bgOpacity`), so card, room and tile can each be made
  translucent independently.
- **Every config key has a control again.** A key-by-key check found
  fourteen keys the card rendered but no control wrote since the merge.
  Global Tiles: the card-wide **ON/OFF button shape / variant / size** and the
  **power bar** (on/off + full scale). Room chrome: **tile text colour**,
  **border colour** and **style**, **shadow**, header **gradient direction**,
  **font weight** and **font style**. Views: per-view **device sort** (the
  key existed but the card never read it — it now beats the card-wide sort
  while that view is showing). Graphs:
  **bar corner radius** and the **fallback line colour**. Chips & metrics: the
  detail sheet's **entity list** toggle. Three room keys that were documented
  but never rendered now render: `headerTextColor` (as a fallback for
  `textColor`), `fontStyle` and `boxShadow`.
- Removed: ~70 editor CSS rules (the slide-in device panel, the rooms styling
  accordion, the transparency preview, the drag-list block editor), a dozen
  card CSS rules from older tile layouts, three dead state fields, and a stale
  tab id.

### Editor

- **Every colour control opens the editor's own colour wheel** — a
  hue/saturation disc, a brightness slider, a hex field and the graph palette
  as presets — instead of the browser's colour dialog, which on a phone is a
  full-screen detour with no sense of the card's palette. Theme colours, room
  chrome, tile colours, header colours, the gauge gradient stops and the
  sparkline colours all use it; picks apply live.
- **Animated icons are back at device scope.** The tile's ON/OFF header icon
  and speed (`tile_icon`, `tile_icon_off`, `tile_icon_speed`) and, under
  Advanced, the per-switch icons (`entity_animations`) had the same fate: the
  icon popover survived the panel's retirement, nothing called it. Design → the
  device → Animated icons. New alongside: a **size** multiplier
  (`tile_icon_size`, per-entity `size`) next to the speed one, and both sliders
  are labelled with what they do.
- **Tile photo is back at device scope.** The per-device backdrop
  (`device_styles[id].bg_image`) lost its uploader when the Device styling
  panel was retired — Shelly Cloud import could still write it, the editor
  could not. Design → the device → Tile photo, with the same upload / URL /
  fit picker the room backdrop uses.
- **Input actions get Home Assistant's entity picker** — search by name, room
  or entity id, scoped to the device's own entities or everything, with the
  chosen targets shown as removable chips. Each channel is a card with the action
  in its header and a labelled grid beneath it.
- **Larger helper text** throughout the Design tab and Controls; the live tile
  preview under the style picker is gone (the edit dialog's preview does that
  job).

### Internal: three resolvers and two mappings that existed twice

No behaviour change, but the kind of duplication that produced the bugs in this
release.
`radio_stations` and a view's `sort_by` were resolved inline at their call
sites rather than in `cascade.ts`, where every other ladder lives; both are now
`cascade.radioStations()` and `cascade.sortBy()`. Discovery and
`attachExtraSensors` each built an entity from a registry row with their own
copy of the same eight-field mapping — one `toEntity()` now, so a borrowed
entity cannot quietly lack a field an owned one has. `InputChannel.isButton`
was a second spelling of `kind === 'button'`, set independently at two
construction sites, and is gone. The editor's pill row is one `_pills()`
helper, and the device-sort options are one list instead of two that could
drift apart.

## v1.1.0 — 2026-09-02

The editor-redesign release: 55 commits since v1.0.0.

### The Design tab (scope-first editor)

- **One styling tab.** Design replaces the Card & Theme, Device styling and
  Header tabs: pick a scope — Global, a view, a room, a device type, or one
  device — and the same control list redraws for that layer. Every row names
  where its value comes from, with a reset back to inheriting.
- **Three family ladders** (`cascade.ts`, pure and tested) instead of five
  ragged ones: Tile (device → type → room → view → card), Container
  (room → view → card), Card chrome (view → card).
- **◆ n changes** — a panel listing everything the config sets away from the
  default look, each entry clearable in place; plus a **Saved looks** shelf so
  custom styles and presets have a home again.
- **Room chrome** — a room scope carries its ladder-less extras (backdrop
  photo, tile gap, room-block and header colours, per-room header chips,
  ON/OFF button shapes) in a dedicated block.
- **Honest surfaces** — the Blocks drag canvas only appears when the scope's
  effective style is the adaptive one; otherwise a notice names the style in
  force and points at its Elements.
- **Tap-to-edit** — tapping a device tile in the edit dialog's live preview
  jumps straight to that device's scope in Design. Controls on the tile stay
  live for testing; outside the editor a tap opens the detail sheet as always.

### Tiles & themes

- **Chips in the name row** — a new opt-in element on the power-monitor and
  sensor-card styles moves the secondary readings up beside the device name.
  Elements can now declare a default of hidden (`def: false`).
- **Follow HA** theme — every colour taken live from the active Home Assistant
  theme, light/dark included; plus per-view and per-room themes, and a
  `shelly_blue` preset modeled on the Shelly Control app.
- **Import from Shelly Cloud** — pull your cloud room photos and official
  product images straight into the card (the auth key never touches the config).
- Power-monitor tiles lead with the on/off button; collapse/expand-all for
  rooms; clickable room-header chips with per-device drill-downs.

### Graphs

- Every sparkline now **ends at the live sensor reading**, so the graph label
  always agrees with the tile's chips. The live point is deliberately excluded
  from auto-scaling and the peak/min dots — a kettle switching on no longer
  flattens 24 hours of history.

### Fixes & hardening

- A twelve-finding adversarial review of the new editor code, all confirmed
  findings fixed — including element toggles that couldn't override an
  inherited value, a Design jump that landed on a collapsed section, and
  fleet-wide SVG rewrites on every render.
- Global element toggles now land where the card actually reads them
  (`style_presets[<style>].elements`); stray top-level `elements` keys are
  migrated automatically.
- Header overflow wraps instead of clipping; readable native dropdowns;
  restored `AreaStyle.bgColor`; per-device tile photos win over the room
  photo's glass scrim.

### Docs

- README, OVERVIEW, the generated guide, the reference JSON and the offline
  designers all resynced to the shipped card, and `npm run check:docs` gained
  gates for the drift classes that slipped through.

Note: the pre-release checkpoint tag `v2.1.0-full-controls` (commit `20c83ce`)
was removed — it predated this versioning scheme and would have confused
HACS's version ordering.

## v1.0.0 — 2026-08-23

First public release. Auto-discovering device dashboard for Shelly (and, in
universal mode, any Home Assistant device): per-device tiles with live
controls, sensor chips, sparkline history, an expandable detail sheet, eight
colour themes, animated status icons, views, favourites, needs-attention
summaries, and a full visual editor.
