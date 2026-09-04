# Changelog

All notable changes to HA Device Dashboard. Versions are git tags; HACS
installs from them.

## Unreleased

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
