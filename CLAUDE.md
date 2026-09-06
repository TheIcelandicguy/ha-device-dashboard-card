# CLAUDE.md

HA Device Dashboard — a Home Assistant **Lovelace custom card** (frontend only, no
Python backend). TypeScript + Lit 3, bundled by Rollup to a single committed file
`dist/ha-device-dashboard.js`. It auto-discovers devices from the in-browser
`hass` object — Shelly/BTHome by default, or every HA device in universal mode —
and renders a device-centric fleet dashboard.

Full architecture tour lives in `OVERVIEW.md` (tracked). Read it when you need
depth; this file is the fast orientation. Contributor workflow is in
`CONTRIBUTING.md`.

## Commands

- `npm run build` — production bundle (also auto-deploys to `Z:\www\community\ha-device-dashboard\` if `Z:` is mapped).
- `npm run watch` — rebuild + auto-deploy on change.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint over `src`.
- `npm run check:docs` — cross-check `docs/` against `src/` (vocabularies, per-profile
  defaults, first-run rows, guide freshness, whether `dist` carries the current
  BUILD_TAG). Most of `docs/` is hand-synced, so run this before claiming docs are current.
- `npm run docs:guide` — regenerate `docs/GUIDE.md` from `src/help.ts`.
- `npm run test:builder` — smoke-test `docs/tools/config-builder.html`'s YAML output.
- `npm run test:palette` — test `src/palette.ts`, including WCAG floors on 300
  generated palettes.
- `npm run test:card` — the card's core logic against fixture `hass` objects:
  discovery + both merge passes, input-channel detection, relevance, layout
  utilities, migrateConfig. Compiles `helpers.ts` to CJS in a temp dir (the
  project is `type: module`, so the emitted files need a `{"type":"commonjs"}`
  shim next to them).
- `npm test` — check:docs + the test scripts.
- `npm run bench` — time the hot paths against a synthetic fleet. Measure before
  claiming something needs optimising: the fleet summaries were suspected of
  needing memoisation and came in at 0.18ms for 56 devices.
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

- `src/ha-device-dashboard.ts` (~3.6k lines) — main card: config, hass wiring, device
  grouping, header, graph fetch, CSS-var building.
- `src/editor.ts` (~5.8k lines) — GUI editor. Five tabs: Rooms & devices, Views,
  **Design**, Graphs & Sensors, YAML. Mid-refactor toward the data-driven
  `EDITOR_LAYOUT` spec in `src/editor-layout.ts`; only Graphs & Sensors is fully
  wired to it, the rest render from bespoke methods.
- `src/design-scope.ts` — the Design tab's scope model as pure functions: what
  each rung may set (`scopeCanSet` + `whyUnavailable`), key round-tripping for
  persistence, and how devices are grouped for the picker. No DOM, no `hass`;
  tested by `npm run test:card`.
- `src/helpers.ts` — discovery (`getAllDevices`), `getDeviceProfile`, defaults,
  `migrateConfig`.
- `src/tiles/` — one render fn per tile style (`power-monitor`, `light-control`,
  `climate-control`, `cover-control`, `sensor-card`, `input-control` for the i3/i4
  keypad, `scene-button`, `block-tile` for the `default` adaptive tile) +
  `delegated-control.ts` (native HA controls for long-tail domains) +
  `tile-context.ts` (`TileCtx`) + `tile-parts.ts` (shared fragments: name row,
  input channel row, input action button, effect picker, and `chipsInHeader()` —
  the one predicate for the opt-in header_chips placement, so power-monitor and
  sensor-card can never disagree about when chips move into the name row).
- `src/palette.ts` — the theme picker's 🎲 / ✨ rolls: a random preset, or a
  palette generated from a random hue with WCAG floors enforced per colour. Pure
  (no DOM/hass), tested by `npm run test:palette`.
- `src/help.ts` — the ? Help content, and the source `docs/GUIDE.md` is generated
  from. Edit here, never the markdown.
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
- **Three family ladders, not one cascade.** Every visual option belongs to a
  family and the family fixes the layers — this replaced five ragged ladders that
  could not be stated as a rule:
  - **Tile** — device → type → room → view → card. theme, colour, tile style +
    variant, blocks, chips, elements, graphs, energy window.
  - **Container** — room → view → card. columns, tile size, gap. No device layer:
    a grid needs something to hold it, and one device has no column count.
  - **Card chrome** — view → card. header, card surface, typography. No room
    layer: a room does not contain the card's header.

  Saved looks (`custom_styles`, `style_presets`) are not a rung — they sit between
  view and card as a side ladder. All of it comes from config (YAML) — the editor
  is the single source of truth. (There used to be a viewer-local in-view
  Customize layer on top via `localStorage`; it was removed because it silently
  shadowed the config, and could return later as an opt-in advanced feature.)
- **The editor's Design tab is scope-first** and replaced Card & Theme, Device
  styling and Header. Their section *bodies* still live in the registry
  (`_globalSectionDescriptors`); Design renders them at Global scope. One editor
  per key — do not add a second front-end for a setting that already has one.
- **Every cascade lives in `src/cascade.ts`, as pure functions.** The card's
  `_rawStyle` / `_blockLayout` / `_sensorSelection` / `_showGraphs` / `showEl` /
  `_energyPeriod` are thin wrappers that add memoisation. They were methods until
  the renderer and the editor drifted apart unnoticed; pure functions are testable
  (`npm run test:card`). Each function documents which family it belongs to, and
  the family is the layer set — if you find yourself adding a layer to one option
  only, you are re-creating the ragged ladders that were removed.
- **`EDITOR_LAYOUT` is only load-bearing for tabs with no bespoke body.** Graphs &
  Sensors renders from the spec; `devices`, `views` and `design` render their own
  markup and ignore the section list. Adding a section to the spec for one of
  those documents an intention and renders nothing — which is exactly how "What
  counts as a light" disappeared for one build during the Design migration. Render
  it explicitly in the tab body as well.
- **Blocks resolve in exactly one place — `cascade.blockLayout()`.** The renderer and the
  editor's Customize panel used to each have their own cascade; they disagreed whenever
  `profile_styles` / `custom_styles` / `style_presets` set a layout, so the panel
  rebased a toggle onto a layout that wasn't in force. Order is device → profile →
  room → view → custom style → style preset (the `'default'` key, hardcoded — the
  other resolvers use `effectiveStyle`) → global → profile default: a *saved
  style's* layout outranks the global one, since the global is the least specific
  thing there is.
- **`profile_styles` is `ProfileStyle`, not `DeviceStyle`** — only theme, color,
  tile_style, power_monitor_variant, tile_layout, sensors, show_graphs, elements
  and energy_period are read at the per-type layer. Widening it means teaching the
  matching resolver first.
- **Elements can be default-off.** `STYLE_ELEMENTS` entries may carry `def: false`
  (opt-in placements — `header_chips`, "Chips in the name row", on power-monitor
  and sensor-card). `cascade.elementDefault()` is the only reader of that flag;
  renderers call `showEl(id)` with no literal, so a call site cannot flip the
  default. "Unset elements are shown" is therefore no longer universally true.
- **Global element toggles live in `style_presets[<style>].elements`** — there is
  no top-level `elements` config key, and the cascade never reads one. The editor
  routes the `elements` key through `_setGlobalElements` at Global scope, and
  `migrateConfig` relocates a stray top-level key into the right preset. Note the
  element id `header_chips` is unrelated to the top-level `header_chips` (fleet
  header chips) and `area_styles[room].header_chips` (room-header chips) keys —
  same string, three meanings.
- **Room scope has a fourth block: "Room chrome — this room only"**
  (`_renderRoomChromeBody`): backdrop photo, tile gap, tile/room-block colours,
  room header colours, per-room header chips, button shapes — AreaStyle keys that
  exist once per room, no ladder. It is the pruned survivor of the retired Rooms
  styling panel; everything with a ladder stayed in the family rows above it.
- **The card and editor talk over the `hdd-editor-goto` window event.** A tile tap
  in the edit-dialog preview dispatches `{device}` (cancelable — the editor
  preventDefault()s; with no listener the tap falls back to the detail sheet), and
  the delegate notice dispatches `{tab, section, flash}`. Jumping to a `design-*`
  registry section re-bases the scope to Global transiently and opens the
  `design-panel` ancestor accordion.
- **Input actions run on the screen, never on the wall.** An input channel is a
  `button` (event entity) or a `switch` (steady binary_sensor); an input paired to
  an output on its own device (`pairedOutput` in `helpers.ts`) toggles it with no
  config. Input-only hardware (i3/i4/UNI) gets what `input_actions` says: `toggle`
  / `perform-action` / `more-info` drive targets directly, and `press` replays the
  physical push by firing `shelly.click` (device_id, 1-based button number, click
  type) so existing Shelly *device-trigger* automations run unchanged. The button
  number comes from the registry unique_id via `config/entity_registry/get`
  (`shellyInputChannel`) because a renamed input's entity id no longer says which
  button it is; Gen2+ ids are 0-based, Gen1 are 1-based. That generation comes
  from `detectShellyGen`, which asks the integration before guessing: the
  registry's `hw_version` (`gen1`/`gen2`/`gen3`), then the `model_id` prefix
  (`SH`=1, `SN`/`SA`=2, `S3`=3, `S4`=4, `SB`=BLU), then the display name, then
  `'other'` — never a confident Gen 1, which is what it used to return for every
  model it did not recognise, i.e. every new one. Two traps live in that
  function: `SB`/`SH` are a transposition apart and mean opposite things
  (`SBHT-003C` is a BLU sensor, `SHBTN-2` a Gen1 button), and the name-based BLU
  test must never fire for a *gateway* — the BLU Gateway and the Bluetooth
  Gateway are mains WiFi units whose names say Bluetooth. Automations on the
  `event.*` entity itself never see a replay (that entity is fed by the device),
  and `fire_event` needs an admin login. None of this makes the wall button do
  anything — that stays with Shelly's own actions or an HA automation.
- **Graphs end at the live reading.** `_seriesWithLive` appends the current state
  as a final point (stamped `last_updated`, memoised so unchanged renders return
  the identical array), flagged `live: true` and excluded from y-autoscale and
  peak/min dots — the chip and the graph label agree without a spike rescaling
  the day's history.
- **`theme` is authoritative; `style` holds only deliberate overrides.** The editor
  used to write the whole palette into `style`, which shadowed the theme on every
  key — so the theme label was decorative and hand-editing it did nothing.
  `migrateConfig` strips a palette that matches a preset exactly and keeps the
  `theme` name; a partial palette is left alone. `_applyTheme` clears palette keys
  rather than writing them, and prompts to save the current colours first.
- **The editor flags config conflicts** (`_configConflicts` in `editor.ts`): settings
  another setting silently overrides — a `theme` that `style` contradicts, smart tile
  styles masked by a global `tile_style`, universal-only filters in Shelly mode,
  dangling `custom:` references, `device_styles` keyed to a device that no longer
  exists, input actions pointing at missing entities. Add a check there when adding
  a cascade layer.
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

**Copying the file is only half a deploy.** The registered resource URL carries a
`?v=` cache-buster, and overwriting the file does not change it — so the browser
and HA's service worker keep serving the response they cached under that same URL.
On 2026-08-31 a full day of builds reached `Z:` without one of them reaching the
dashboard, and it read as "the feature didn't work". `npm run build` now runs
`scripts/bump-resource.mjs`, which rewrites `?v=` to the current `BUILD_TAG` over
HA's WebSocket API (Lovelace resources are not in the REST API). For the token it
reads `HA_TOKEN`, or failing that a **`.ha-token`** file in the repo root —
gitignored, and it keeps the secret off the command line and out of shell history
the way `setx HA_TOKEN <value>` does not. (`HA_URL` defaults to
`http://homeassistant.local:8123`.) It is deliberately silent-and-successful
without a token — it prints the URL to set by hand instead. It is skipped in `npm run watch`. `npm run deploy:bump` runs it alone.

So: if a change is definitely in `dist` but not on screen, check the console
`BUILD_TAG` against the `?v=` on the resource before debugging the code.
