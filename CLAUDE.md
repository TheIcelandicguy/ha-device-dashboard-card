# CLAUDE.md

HA Device Dashboard — a Home Assistant **Lovelace custom card** (frontend only, no
Python backend). TypeScript + Lit 3, bundled by Rollup to a single committed file
`dist/ha-device-dashboard.js`. It auto-discovers Shelly/BTHome devices from the
in-browser `hass` object and renders a device-centric fleet dashboard.

Full architecture tour lives in `OVERVIEW.md` (untracked, on-disk only). Read it
when you need depth; this file is the fast orientation.

## Commands

- `npm run build` — production bundle (also auto-deploys to `Z:\www\community\ha-device-dashboard\` if `Z:` is mapped).
- `npm run watch` — rebuild + auto-deploy on change.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint over `src`.
- `.\update.ps1` — git-sync (`reset --hard origin/<branch>`) + build + report build tag.

## Source of truth

- **`src/types.ts`** (`HADeviceDashboardConfig`) and **`docs/card-reference.json`**
  are canonical for config options. README has legacy-key drift (`include_all`,
  `hide_shelly`, `view_mode`, `tile_click`, `show_glow` are NOT real options) —
  don't trust it for the option surface.
- The `docs/tools/*.html` designers inline their own copy of `card-reference.json`
  and are hand-synced.

## Layout

- `src/ha-device-dashboard.ts` (~3k lines) — main card: config, hass wiring, device
  grouping, header, graph fetch, CSS-var building.
- `src/editor.ts` (~3.8k lines) — GUI editor. Mid-refactor toward the data-driven
  `EDITOR_LAYOUT` spec in `src/editor-layout.ts`; only the Graphs & Sensors tab is
  fully wired to it, other tabs still render from bespoke methods.
- `src/helpers.ts` — discovery (`getAllDevices`), `getDeviceProfile`, defaults,
  `migrateConfig`.
- `src/tiles/` — one render fn per tile style (`power-monitor`, `light-control`,
  `climate-control`, `cover-control`, `sensor-card`, `scene-button`, `block-tile`
  for the `default` adaptive tile) + `tile-context.ts` (`TileCtx`) + `tile-parts.ts`.
- `src/detail/detail-sheet.ts` — the expandable per-device panel.
- `src/styles/` — Lit css blocks (`main.ts`, `tiles.ts`, `detail.ts`).
- `themes.ts`, `anim-icons.ts`, `fonts.ts` (bundled offline @font-face).

## Load-bearing facts / gotchas

- **Discovery is Shelly + BTHome ONLY** (`getAllDevices` filters platform to
  `shelly` / `bthome`), despite the "universal device fleet" picker string. ZHA/
  Hue/ESPHome/Matter are not discovered.
- **Resolution cascade** for style/layout: device → device-type (profile) → area/
  room → view → global → built-in default. Viewer-local "what to show" tweaks layer
  on top via `localStorage` (not saved to YAML).
- **Render throttling**: `shouldUpdate()` coalesces pure sensor updates over ~2s so
  heavy Shelly power-sensor churn doesn't re-render the whole fleet. Card-level
  CSS-var map is cached and only rebuilt on config change (bg images can be huge
  data URLs).
- Reads the HA **entity registry** (`hass.entities`, indexed) not the `states`
  array; merges per-channel sub-devices into their parent via `via_device_id` +
  config-URL host.
- `src/index.ts` prints a `BUILD_TAG` to the browser console — use it to confirm
  which bundle HA actually loaded after a deploy + hard-refresh.
- `dist/ha-device-dashboard.js` is committed. `.gitattributes` keeps it from showing
  as perpetually modified. Don't hand-edit it — it's generated.
- Editor and card must keep `CDN_FONT_FAMILIES` / `FONT_OPTIONS` in sync.

## Deploy

Builds copy to `Z:\www\community\ha-device-dashboard\`, so the HA Lovelace resource
URL is `/local/community/ha-device-dashboard/ha-device-dashboard.js` (JavaScript
Module). Hard-refresh HA after deploying.
