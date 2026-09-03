# Changelog

All notable changes to HA Device Dashboard. Versions are git tags; HACS
installs from them.

## Unreleased

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

### Graphs

- **The gauge follows the device.** `power_monitor_variant: gauge` used to
  hard-code four electrical rings (W/V/A/°C), so a Wall Display or BLU H&T got a
  lone temperature arc and no humidity. It now draws one ring per sensor class
  the device reports — power, voltage, current, temperature, humidity,
  illuminance, CO₂, battery — up to four, with sensible default ranges
  (temperature −10…40 °C rather than 0…100) and the graph palette's colours.
  Environmental rings stay lit when the relay is off.
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

### Editor

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
