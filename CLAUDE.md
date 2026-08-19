# CLAUDE.md

HA Device Dashboard — a Home Assistant **Lovelace custom card** (frontend only, no
Python backend). TypeScript + Lit 3, bundled by Rollup to a single committed file
`dist/ha-device-dashboard.js`. It auto-discovers devices from the in-browser
`hass` object — Shelly/BTHome by default, or every HA device in universal mode —
and renders a device-centric fleet dashboard.

Full architecture tour lives in `OVERVIEW.md` (untracked, on-disk only). Read it
when you need depth; this file is the fast orientation.

## Commands

- `npm run build` — production bundle (also auto-deploys to `Z:\www\community\ha-device-dashboard\` if `Z:` is mapped).
- `npm run watch` — rebuild + auto-deploy on change.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint over `src`.
- `.\update.ps1` — git-sync (`reset --hard origin/<branch>`) + build + report build tag.

## Source of truth

- **`src/types.ts`** (`HADeviceDashboardConfig`) is the one file that is always
  right, and it's well commented — the doc comment on an option usually gives the
  default and the reasoning.
- **`docs/card-reference.json`** drives the editor defaults and the offline
  designers, but it lags `types.ts`. Check both; treat a mismatch as work to do.
- README was resynced with `types.ts` on 2026-08-19 (the old `include_all`,
  `hide_shelly`, `view_mode`, `tile_click`, `show_glow` drift is gone), but it is
  still a summary — `types.ts` remains the authority for the option surface.
- Options added after the last doc sweep, easy to miss: `mode`, `universal_scope`,
  `include_integrations` / `exclude_integrations`, `include_domains` /
  `exclude_domains`, `header_cards` / `footer_cards` / `area_cards`,
  `delegate_controls`, `energy_period`.
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
  for the `default` adaptive tile) + `delegated-control.ts` (native HA controls for
  long-tail domains) + `tile-context.ts` (`TileCtx`) + `tile-parts.ts`.
- `src/detail/detail-sheet.ts` — the expandable per-device panel.
- `src/styles/` — Lit css blocks (`main.ts`, `tiles.ts`, `detail.ts`).
- `themes.ts`, `anim-icons.ts`, `fonts.ts` (bundled offline @font-face).

## Load-bearing facts / gotchas

- **Discovery has two modes, and the default is narrow.** `getAllDevices` keys off
  `config.mode`: unset or `'shelly'` keeps only platform `shelly` / `bthome` (and
  drops BTHome devices from other vendors). `'universal'` discovers every HA
  device, scoped by `universal_scope` (`devices` default / `controllable` / `all`),
  a built-in `DEFAULT_EXCLUDE_INTEGRATIONS` deny-list plus the user's
  `exclude_integrations` (with `include_integrations` as force-include), and
  `include_domains` / `exclude_domains`. All those scoping sets are `null` in
  Shelly mode, so they're genuine no-ops rather than a second code path. Shelly
  devices keep full-fidelity profile detection in universal mode via the
  `ProfileProvider` registry. Most "device is missing" reports are just Shelly mode.
- **A Shelly entity always wins the device's `integration` field.** In universal
  mode several integrations (routers, `device_pulse`) can attach entities to the
  same HA device; without that rule `integration` would keep whichever platform
  was seen first.
- **Two merge passes collapse duplicate registry rows.** First `via_device_id` +
  same config-URL host folds per-channel sub-devices into their parent. Then a
  hardware-identity pass folds *siblings* that describe one physical unit — same
  MAC connection or an identical `identifiers` entry. That second pass exists
  because some integrations (`device_pulse`) register a shadow device per real
  device instead of attaching entities to it, which showed up as two tiles per
  device in universal mode. Survivor = has a config URL, then Shelly, then most
  entities.
- **The card can embed other Lovelace cards** — `header_cards`, `footer_cards` and
  per-room `area_cards`. `delegate_controls` additionally renders native HA
  controls for long-tail domains (lock/media/fan/vacuum) via
  `src/tiles/delegated-control.ts`; it's off by default because each embeds a
  native tile element, which costs real render time on large media fleets.
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
