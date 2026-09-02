# Changelog

All notable changes to HA Device Dashboard. Versions are git tags; HACS
installs from them.

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
