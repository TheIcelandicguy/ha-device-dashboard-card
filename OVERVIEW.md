# HA Device Dashboard — Project Overview

A Home Assistant **Lovelace custom card** (frontend, TypeScript + Lit) that
auto-discovers Shelly devices from Home Assistant — or, in universal mode, every
device Home Assistant has — and renders them as a live, device-centric fleet
dashboard with per-device tiles, an expandable detail panel, sparkline history
graphs, a needs-attention summary, filtered views, themes, animated status
icons, and a full visual (GUI) config editor.

> This is a **frontend card**, not a Python integration. It registers the custom
> element `ha-device-dashboard` and is added to a dashboard as
> `type: custom:ha-device-dashboard`. It reads its data from Home Assistant's
> in-browser `hass` object (entity/device/area registries + live states) — it
> installs no backend component and (see §8) does **not** depend on the separate
> `device_pulse` integration.

---

## Table of Contents

1. [What it is](#1-what-it-is)
2. [Key features](#2-key-features)
3. [Installation](#3-installation)
4. [Configuration](#4-configuration)
5. [Architecture](#5-architecture)
6. [Config option reference](#6-config-option-reference)
7. [How it works](#7-how-it-works)
8. [Development & deployment](#8-development--deployment)
9. [Known limitations / roadmap](#9-known-limitations--roadmap)

---

## 1. What it is

- **Type:** Lovelace custom card for Home Assistant.
- **Card type string:** `custom:ha-device-dashboard`
- **Custom elements:** `ha-device-dashboard` (the card) and
  `ha-device-dashboard-editor` (its visual editor), registered from `src/index.ts`.
- **Package:** `ha-device-dashboard`, version **1.6.1** (`package.json`, kept in
  step with the newest `CHANGELOG.md` heading and the git tag — `npm run
  check:docs` fails if they drift), MIT, author `TheIcelandicguy`.
- **Stack:** Lit 3, TypeScript 5, bundled with Rollup to a single ES-module file
  `dist/ha-device-dashboard.js` (minified with terser for production).
- **Focus:** Strongly Shelly-oriented, but no longer Shelly-limited. Discovery runs
  in one of two modes (`config.mode`): the default `shelly` mode covers the HA
  `shelly` integration plus `bthome` (Shelly BLU sensors), while `universal` mode
  discovers every HA device with scoping filters to tame the volume. In both modes
  the card understands all Shelly device profiles and generations (Gen1/2/3/4 +
  BLE) and picks a sensible tile layout per profile.

The card is registered in the "Add card" picker via `window.customCards` with the
name **"HA Device Dashboard"** and description "Universal device fleet overview —
Shelly, ZHA, Hue, ESPHome, Matter and more." That is accurate in universal mode;
in the default Shelly mode only Shelly/BTHome devices appear (see §7).

---

## 2. Key features

- **Auto-discovery** — finds Shelly (and Shelly BLU/BTHome) devices registered in
  HA; no manual entity list required. Opt into `mode: universal` to discover every
  HA device, scoped by `universal_scope`, a built-in integration deny-list you can
  extend or override, and entity-domain allow/deny lists. Shelly devices are
  detected with the same fidelity in both modes, and a dismissible notice says
  how many devices the current mode and filters have dropped (§7).
- **Embedded Lovelace cards** — render your own cards above (`header_cards`),
  below (`footer_cards`) or inside a specific room's section (`area_cards`).
- **Delegated native controls** — `delegate_controls` renders HA's own control
  elements for long-tail domains (lock, media, fan, vacuum …). Off by default
  because each embeds a native tile element, a real render cost on large fleets.
- **Device profiles** — 15 profiles (relay, plug, dimmer, rgb, climate/TRV, cover,
  valve, energy, sensor, input, uni, wall_display, lock, media, generic), each with
  a badge, a default sensor-chip set, and a default tile block order.
- **All generations** — Gen1, Gen2, Gen3, Gen4, and BLE.
- **Room grouping** — devices grouped by HA area into collapsible sections; extra
  `name_groups` sections can be built from device-name prefixes.
- **Tile controls** — toggle relays/plugs, brightness sliders (dimmer/RGB),
  open/stop/close + position for covers and valves, TRV setpoint, input channel
  chips, and virtual-component controls, directly on the tile.
- **Sensor chips** — compact readings (power, temperature, humidity, voltage,
  battery, RSSI …) shown per tile; selectable by category.
- **Tile styles** — purpose-driven layouts: `default` (adaptive blocks),
  `power-monitor` (with `big-number`/`gauge`/`graph`/`compact`/`table` variants),
  `light-control`, `climate-control`, `cover-control`, `sensor-card`,
  `scene-button`; plus user-defined `custom:<key>` styles. "Smart tile styles"
  auto-picks a style per profile.
- **Expandable detail sheet** — clicking a tile opens an inline panel below the
  row with all channels, sensors, firmware/IP/RSSI/uptime, an All-Entities list,
  and taller history graphs.
- **Sparkline history graphs** — per-metric labeled line/area/bar graphs with time
  axis, peak/min markers, tick grid, and hover tooltip; window configurable
  (1–168 h). Every series ends at the sensor's **live** reading (a memoised "now"
  point excluded from auto-scaling and peak dots), so the graph label always
  agrees with the tile's chips.
- **Header stats** — clickable header chips (online/offline/power/energy/temp/
  humidity/light/rssi/alerts/updates) that open high-to-low device drill-downs.
- **Power bar** — optional mini wattage indicator at the tile bottom.
- **Views** — optional multiple named dashboard views (tabs). A view is what its
  filter pills select — profiles, entity domains, integrations, rooms (including
  **No Room**) — minus `exclude_devices`, optionally narrowed by an entity-id
  regex; plus per-view layout and style overrides. A view that matches nothing
  says which filter emptied it instead of rendering blank (§6, §7).
- **Needs attention** — a summary above the rooms listing offline devices, firing
  alerts, flat batteries and pending updates, grouped by integration once a fleet
  spans more than one, with `attention_muted_integrations` to stop an integration
  being counted without hiding it; and a firmware spread computed per integration.
- **Favourites** — devices pinned to a Favourites section.
- **Theming** — 8 built-in colour presets (`warm_dusk` default, `shelly_blue`,
  `dark_industrial`, `teal_terminal`, `brutalist`, `frosted_light`, `nordic_warm`,
  `midnight_purple`) plus fully custom palettes; bundled + Google-Fonts display fonts.
- **Animated status icons** — a large library of SVG animation presets (flame,
  snowflake, fan, pulse, bolt, bulb, water, sun, moon, wind, bell, thermometer,
  battery, star, wave …) assignable per device/entity for on/off states.
- **Per-scope styling cascade** — three families with fixed ladders
  (`src/cascade.ts`): **Tile** (device → type → room → view → card — theme,
  colour, tile style + variant, blocks, chips, elements, graphs, energy window),
  **Container** (room → view → card — columns, tile size, gap), **Card chrome**
  (view → card — header, card surface, typography). Saved looks
  (`custom_styles`, `style_presets`) are a side ladder between view and card,
  not a rung.
- **Responsive** — works in HA Sections view using CSS container queries; a
  mobile-optimised editor layout.
- **Visual editor** — full GUI editor (accordion tabs) with no YAML required; a
  read-only YAML tab for copying the generated config.

---

## 3. Installation

**Requires** Home Assistant with a dashboard that accepts custom cards. In the
default Shelly mode it reads the official **Shelly** integration (and BTHome for
Shelly BLU sensors); in universal mode any integration will do.

### HACS (custom repository)

1. HACS → three-dot menu → **Custom repositories**.
2. Add `https://github.com/TheIcelandicguy/ha-device-dashboard-card`, category
   **Lovelace**.
3. Install **HA Device Dashboard** and reload the browser.

### Manual

1. Copy `dist/ha-device-dashboard.js` to `/config/www/ha-device-dashboard.js`.
2. **Settings → Dashboards → Resources** (or Edit Dashboard → Manage Resources)
   → add resource:
   - **URL:** `/local/ha-device-dashboard.js`
   - **Type:** JavaScript Module
3. Add the card to a dashboard (see §4).

> The repo's own deploy target is `Z:\www\community\ha-device-dashboard\` (an HA
> `www/community/...` path), giving the resource URL
> `/local/community/ha-device-dashboard/ha-device-dashboard.js`. See §8.

---

## 4. Configuration

The card works with zero configuration — it auto-discovers everything. Options are
added on top and can also be set entirely through the visual editor.

### Minimal example

```yaml
type: custom:ha-device-dashboard
```

### Fuller example

```yaml
type: custom:ha-device-dashboard
title: Shelly
theme: dark_industrial
columns: 3
tile_size: md
sort_by: power
show_offline: true
smart_tile_styles: true
areas:
  - Living Room
  - Kitchen
sensors:
  - power
  - temperature
  - battery
header_chips: [online, offline, power, alerts]
show_graphs: true
graph_sensors: [power, temperature]
graph_hours: 24
area_styles:
  Living Room:
    columns: 4
    headerBgColor: "#e65c00"
    tileBgColor: "#16213e"
    tile_style: power-monitor
device_styles:
  abcdef1234567890:
    color: "#4fc3f7"
    tile_icon: flame
```

The **authoritative** definition is `HADeviceDashboardConfig` in `src/types.ts` —
well commented, and the only file guaranteed to match the shipped behaviour.

`docs/card-reference.json` is the machine-readable model that drives editor
defaults and the offline HTML tools in `docs/tools/` (defaults, first-run values,
the 15 profiles, themes, tile blocks, header chips, and every editor control with
its config key, scope, default and advanced flag) — but it lags `types.ts`, so
check it against the type rather than trusting it alone.

> `README.md` was resynced with `types.ts` (2026-08-19, again 2026-09-02, and its
> Discovery / Views / Needs attention sections rewritten for v1.6.0) and is a
> fair summary — but `src/types.ts` remains the authority for the option surface
> whenever the two disagree.

---

## 5. Architecture

### Repo layout

```
src/
  index.ts              Entry point — imports the card + editor, registers
                        the <ha-device-dashboard> custom card metadata,
                        prints a BUILD_TAG marker to the console.
  ha-device-dashboard.ts  The main card LitElement (~4.2k lines): config, hass
                        wiring, device grouping, the discovery notice, the
                        needs-attention block, header, tiles, detail sheet,
                        graph fetching, CSS-var/style building.
  editor.ts             The visual editor LitElement
                        <ha-device-dashboard-editor> (~7.2k lines): accordion
                        tabs, live preview, YAML export.
  editor-layout.ts      Data-driven EDITOR_LAYOUT — tabs/sections spec that the
                        editor renders from (section-registry refactor).
  cascade.ts            EVERY resolution cascade as pure functions — the three
                        families (Tile / Container / Card chrome), style +
                        custom-style + legacy-alias resolution, blockLayout,
                        elementVisible + elementDefault, sensorSelection,
                        showGraphs, energyPeriod. Tested by test:card.
  design-scope.ts       The Design tab's scope model as pure functions
                        (scopeCanSet, scope keys, device grouping, override
                        collection). Tested by test:card.
  sensor-pick.ts        What a sensor tile leads with and what it chips —
                        isMeasurement/isReading, pickPrimarySensor,
                        pickPrimaryBinary, pickSecondarySensors. One predicate
                        shared by both selections, which had drifted apart.
  sensor-keys.ts        The `sensors` / `graph_sensors` list, which holds
                        device_class keys AND entity ids in one list, told
                        apart by the dot. isEntityKey, classKeys, entityKeys,
                        namedEntitiesOn, selectAllKeys.
  view-filter.ts        Which devices a view shows: the AND-ed gates (profiles,
                        domains, integrations, areas, legacy devices,
                        exclude_devices, entity-id regex), one implementation
                        shared by the card that renders them and the editor
                        that counts them. Records what each gate removed, so an
                        empty view can name the one that emptied it instead of
                        rendering blank. NO_AREA ('') is the No Room key.
  room-filter.ts        The `areas` filter as pure functions. The unassigned
                        bucket ('' — "No Room") is a room like any other;
                        leaving it out of the key universe silently dropped
                        every device without an area.
  update-policy.ts      computeUpdateReason() — should the card re-render.
                        The element keeps only the parts needing a DOM
                        (starting the coalescing timer, stamping the clock).
  font-options.ts       The one font catalogue. CDN_FONT_FAMILIES is derived
                        from FONT_OPTIONS rather than declared twice.
  types.ts              All config + data model types (single source of truth
                        for options); HADeviceDashboardConfig.
  helpers.ts            Device discovery (getAllDevices, the
                        DEFAULT_EXCLUDE_INTEGRATIONS deny-list,
                        deviceInUniversalScope, DiscoveryStats), the
                        ProfileProvider registry behind getDeviceProfile,
                        ALL_PROFILES / ALL_DEVICE_DOMAINS (the view-filter pill
                        vocabularies), tile-block/sensor/graph constants and
                        defaults (incl. STYLE_ELEMENTS with per-element
                        defaults), value formatters, config migration.
  help.ts               The ? Help content; docs/GUIDE.md is generated from it.
  palette.ts            Random theme/palette rolls with WCAG floors (test:palette).
  attention.ts          The needs-attention summary logic, pure: attentionItems,
                        groupAttention (by integration), splitMuted,
                        firmwareGroups / firmwareByIntegration, lightCounts.
  shelly-cloud-import.ts  Shelly Cloud room/device matching for the importer.
  themes.ts             THEME_PRESETS (8 palettes) + apply/detect helpers.
  anim-icons.ts         SVG animated status-icon library + renderer.
  fonts.ts              Bundled offline @font-face CSS (BUNDLED_FONT_CSS).
  tiles/                Per-style tile renderers (see below).
  detail/detail-sheet.ts  The expanded per-device detail panel.
  styles/               main.ts / tiles.ts / detail.ts — Lit css blocks.
  translations/         en.ts / is.ts — the string catalogues; localize.ts
                        holds the pure translate() and the ambient t().
scripts/fixtures/       Real device rows for detection tests, plus the expected
                        results. Data, not code — regenerate with
                        `npm run fixtures:harvest` rather than hand-editing,
                        except the `why` notes, which are the part a machine
                        cannot recreate.
docs/                   README, card-reference.json, shelly-reference/, tools/.
dist/ha-device-dashboard.js   Built bundle (committed).
rollup.config.mjs, tsconfig.json, package.json, hacs.json
update.ps1              Git-sync + build + deploy helper.
```

### Main card class — `ha-device-dashboard.ts`

`HADeviceDashboard extends LitElement` (`@customElement('ha-device-dashboard')`).
Key elements:

- Lovelace hooks: `setConfig()` (runs `migrateConfig`), `getConfigElement()`
  (returns `ha-device-dashboard-editor`), `getStubConfig()`, `getLayoutOptions()`.
- `@property hass` receives the Home Assistant object; a `shouldUpdate()` override
  caches the device list and **throttles** re-renders so heavy Shelly sensor churn
  (power sensors pushing every ~1–2 s) doesn't re-render the whole fleet
  continuously (2 s coalescing for pure sensor updates).
- Caches: device list, per-device profile, and the computed card-level CSS-var map
  (rebuilt only when config changes — important because background images can be
  large data URLs).
- Local UI state (not saved to YAML): open/closed areas, expanded detail device,
  graph data, drag positions, and the active view (persisted in `localStorage`).

### Tile renderers — `src/tiles/`

Each tile style is a standalone render function called by the main card:

- `power-monitor.ts` — relay/plug/energy power view (big-number/gauge/graph/
  compact/table variants).
- `light-control.ts` — dimmer/RGB colour + brightness controls.
- `climate-control.ts` — TRV / wall-display thermostat dial.
- `cover-control.ts` — blind/shutter/roller graphic + open/stop/close.
- `sensor-card.ts` — big primary value + sparkline + trend badge.
- `input-control.ts` — the i3/i4 channel keypad.
- `scene-button.ts` — large tappable icon button (input/generic).
- `block-tile.ts` — the `default` adaptive block-grid tile (name_row, sensors,
  graph, dimmer, cover/valve/trv controls, relay/input channels, power_bar,
  virtual_controls, badges).
- `delegated-control.ts` — native HA control elements for long-tail domains
  (lock/fan/vacuum/…; media players have their own `media_controls` block), used by the `delegated_controls` block when
  `delegate_controls` is on. Imported directly from `src/index.ts`.
- `tile-parts.ts` — shared sub-components used across tiles, including
  `chipsInHeader()`, the single predicate for the opt-in `header_chips`
  ("Chips in the name row") placement on power-monitor and sensor-card.
- `tile-context.ts` — the `TileCtx` type and helper interfaces (SensorChip,
  TrvInfo, CoverInfo, GraphEntity, FirmwareInfo, VirtualControl, …) passed into
  every renderer.

### Detail view — `src/detail/detail-sheet.ts`

`renderDetailSheet(...)` produces the expandable panel shown below a tile row: all
channels, full sensor list, firmware/IP/RSSI/uptime, the All-Entities list, and
the taller history graphs with a 24 h / 7 d / 30 d range selector.

### Editor — `editor.ts` + `editor-layout.ts`

The GUI editor is organised into accordion tabs — **Rooms & devices**, **Views**,
**Design**, **Graphs & Sensors**, and a read-only **YAML** tab — with an
**Advanced** toggle that reveals advanced controls and a **Defaults** overlay for
the first-run look (theme, default tile style, columns, smart styles).

**Design** is scope-first and replaced three earlier tabs (Card & Theme, Device
styling, Header). You pick a scope — Global, a view, a room, a device type, or one
device — from a grouped map, and one control list redraws for that layer. Controls
are grouped by the three families in `cascade.ts`, each row naming where its value
comes from, and a family a scope cannot set is shown greyed with the reason. The
scope model is `design-scope.ts` (pure, tested); the section bodies the retired
tabs owned are still in the registry and rendered by Design at Global scope. Two
scopes carry ladder-less extras: Global holds the card-wide sections, and a room
holds **Room chrome — this room only** (backdrop photo, tile gap, room-block and
header colours, per-room header chips, button shapes). The Blocks canvas only
renders when the scope's effective style is the adaptive one — otherwise a notice
names the style in force and points at Elements. Tapping a device tile in the
edit-dialog's live preview jumps to that device's scope (a cancelable
`hdd-editor-goto` window event; with no editor listening the tap opens the
detail sheet as usual).

**Rooms & devices** carries the **Discovery** section: a Shelly only / Universal
mode pill, and in universal mode a scope pill row (Real devices / Controllable /
Everything) and two checklists — *Hide integrations* and *Hide entity types* —
built from what `getDiscoverySources` finds in the running instance. They write
`exclude_integrations` / `exclude_domains`; the force-include keys are YAML-only.

**Views** renders one card per view with a live `matched/total` count computed
through the same `applyViewFilter` the card renders with. The filter block is
headed *"Filter — pick what to include. A group with nothing picked includes all
of it."* and holds pill groups with Select all / none: **Profiles** (from
`ALL_PROFILES`), **Entity domains** (advanced, from `ALL_DEVICE_DOMAINS`),
**Integrations** (only when the fleet spans two or more, each pill labelled with
its device count) and **Areas** (from `areaKeyUniverse` over every discovered
device, so a **No Room** pill exists whenever anything is unassigned). Below the
pills, **Exclude devices** is a checklist that takes individual devices back out;
the old per-device *include* list is gone. An entity-id regex field (advanced)
flags an invalid pattern inline.

Structure is being migrated to the data-driven `EDITOR_LAYOUT` spec (the Graphs tab
is wired to it first; the others render bespoke bodies and must render registry
sections explicitly). The font catalogue has one home, `src/font-options.ts`;
`CDN_FONT_FAMILIES` is derived from it, and `check:docs` fails if a second
declaration reappears.

---

## 6. Config option reference

Top-level keys of `HADeviceDashboardConfig` (`src/types.ts`). Defaults are the
runtime defaults from `docs/card-reference.json` where applicable.

### Discovery

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | string | — | Must be `custom:ha-device-dashboard`. |
| `title` | string | `Shelly` | Header title text. |
| `mode` | `shelly`\|`universal` | `shelly` | Discovery breadth. `shelly` = entities on the `shelly` / `bthome` platforms only (non-Shelly BTHome vendors dropped); `universal` = every HA device, filtered by the five options below. Shelly devices get full-fidelity Shelly detection in both modes. |
| `universal_scope` | `all`\|`devices`\|`controllable` | `devices` | Universal only; tested per device after merging. `devices` = devices with a primary controllable entity **or** a primary sensor with a recognised `device_class` (drops routers, PCs, browsers, pure-diagnostic integrations); `controllable` = only devices with a controllable entity; `all` = raw firehose. |
| `include_integrations` | string[] | — | Universal only. Force-include platforms the deny-lists removed (e.g. `['mobile_app']`). Wins over both deny-lists. YAML only. |
| `exclude_integrations` | string[] | — | Universal only. Added to the built-in deny-list `DEFAULT_EXCLUDE_INTEGRATIONS` (`mobile_app`, `browser_mod`, `hassio`, `systemmonitor`, `backup`, `sun`, `nws`, `netgear`, `tplink_router`, `huawei_lte`, `huawei_ont`, `asuswrt`, `fritzbox_tools`, `fritz`). Case-insensitive. |
| `include_domains` | string[] | all | Universal only. Entity-domain allow-list; when set, only these. YAML only. |
| `exclude_domains` | string[] | — | Universal only. Entity-domain deny-list (e.g. `['update','camera']`). Wins over `include_domains` on a clash. `device_tracker` is never discovered in any mode. |
| `header_cards` / `footer_cards` | LovelaceCardConfig[] | — | Your own Lovelace cards rendered above / below the device grid. |
| `area_cards` | Record<area, LovelaceCardConfig[]> | — | Cards rendered inside a specific room's section, above its tiles. |
| `delegate_controls` | boolean | `false` | Render native HA controls for long-tail domains via the `delegated_controls` block. |
| `energy_period` | EnergyPeriod | lifetime total | What the Energy value shows: cumulative total, or current day/week/month from recorder statistics. Overridable per room/device. |
| `areas` | string[] | all | Area-name filter (`[]` = none). `''` is the No Room bucket's key. |
| `devices` | string[] | all | Card-wide device whitelist, applied before `hidden_devices` (a device in both stays hidden). |
| `name_groups` | string[] | — | Extra sections built from device-name prefixes. |
| `hidden_devices` | string[] | `[]` | Device IDs to hide. |
| `favorites` | string[] | `[]` | Device IDs pinned to the Favourites section. |
| `hidden_entities` | string[] | `[]` | Entity IDs hidden from the expanded All-Entities list. |
| `show_offline` | boolean | `true` | Show devices whose entities are all unavailable. |

### Views

| Option | Type | Default | Description |
|---|---|---|---|
| `views` | ViewConfig[] | — | Named dashboard views (tabs). Each has `id`, `name`, `icon`, `show_favourites` (default false), `show_rooms` (default true), a `filter`, and layout / style overrides (`theme`, `tile_style`, `power_monitor_variant`, `columns`, `tile_size`, `tile_gap`, `sort_by`, `tile_layout`, `sensors`, `elements`, `show_graphs`, `energy_period`, `header_cards` / `footer_cards`, `extra_card_style`, `area_card_placement`, a chrome `style` sub-object). |
| `views[].filter` | ViewFilter | — | `profiles` (DeviceProfile[]), `domains` (any entity's domain), `integrations` (platform slugs, case-insensitive), `areas` (room names, case-insensitive; `''` = No Room), `exclude_devices` (device ids), `entity_id_pattern` (RegExp source; any entity hit). `devices` is legacy: still honoured at runtime, no longer editable, stripped by `migrateConfig`. |
| `default_view` | string | first | `id` of the view selected on first load. |

**A view is what its pills select, minus what you exclude.** Every gate is an
AND, values inside one list are OR-ed, and an absent or empty list is no gate —
so "All" ticked in the editor is the same as nothing ticked, which only holds
because the pill vocabularies derive from the source (`ALL_PROFILES`,
`ALL_DEVICE_DOMAINS`) rather than from hand-written lists that used to be short
by three profiles and eleven domains. Gate order in `src/view-filter.ts`:
profiles → domains → integrations → areas → (legacy devices) → exclude_devices →
entity_id_pattern. Two consequences worth knowing:

- `areas` names rooms, and a device with no room is in none of them; add `''`
  (the **No Room** pill) to include the unassigned bucket. The editor derives
  its room pills from every discovered device, so that pill exists whenever
  anything is unassigned.
- The old `filter.devices` *include* list ANDed with the other gates, so a view
  of every room plus two roomless devices matched nothing. It is gone from the
  editor and stripped from saved configs.

A view that filters to nothing renders an explanation — which gate removed the
last devices, the No Room hint when it applies, and that filters AND — rather
than a blank card.

### Needs attention

| Option | Type | Default | Description |
|---|---|---|---|
| `show_attention` | boolean | `true` | The summary above the rooms; renders only when something qualifies. |
| `attention_battery` | number | `20` | Battery percentage at or below which a device is flagged. |
| `attention_muted_integrations` | string[] | — | Integration slugs whose rows are listed (collapsed, at the foot, with counts) but not counted, and left out of the firmware spread. Case-insensitive. |
| `include_beta_updates` | boolean | `false` | Count a Shelly's `beta_firmware` entity as an available update. |
| `show_firmware_summary` | boolean | `true` | The per-integration firmware spread inside the summary; only integrations running more than one version appear. |

### Layout

| Option | Type | Default | Description |
|---|---|---|---|
| `columns` | number | `3` | Grid columns per row (1–6). |
| `tile_size` | `sm`\|`md`\|`lg` | `md` | Tile size. |
| `sort_by` | `name`\|`power`\|`online`\|`area` | `name` | Tile sort order. |
| `tile_style` | TileStyle | `default` | Global default tile style (lowest in cascade). |
| `smart_tile_styles` | boolean | `false` | Auto-pick a style per device profile when none set. |
| `power_monitor_variant` | variant | `big-number` | Default power-monitor sub-variant. |
| `show_graphs` | boolean | `false` | Master switch for tile sparklines — off by default, tiles are lean and graphs are opt-in. |
| `tile_layout` | TileLayout | all visible | Ordered/visible tile content blocks. |
| `tile_opacity` / `card_opacity` / `header_opacity` | number | `100` | Background transparency for tiles / card / header. |
| `header_show_title` / `header_show_stats` / `header_show_cloud` | boolean | `true`/`true`/`false` | Header sections. |
| `header_show_orbs` | boolean | follows `effects` | Header glow orbs. |
| `effects` | boolean | `false` | Ambient effects (orbs, pulse/glow, blur, hover shadows). |
| `header_chips` | string[] | `online, offline, power, alerts` | Which header stat chips appear (from online/offline/power/energy/temperature/humidity/illuminance/rssi/alerts/updates). |
| `card_bg_image` / `card_bg_image_size` | string | — | Card background image + fit. |
| `show_power_bar` | boolean | `false` | Mini wattage bar at tile bottom. |
| `power_bar_max` | number | `2000` | Watts at 100% fill. |
| `show_entity_list` | boolean | `true` | All-Entities section in expanded view. |

### Style

| Option | Type | Default | Description |
|---|---|---|---|
| `theme` | ThemePreset | `warm_dusk` | One of 8 presets (or `custom`); writes palette colours into `style`. |
| `style` | object | — | ~50 global look keys: `accent_color`, `tile_radius`, `tile_gap`, `font_family`, `text_size_scale`, button shape/variant/size, card/header/tile colours, text tiers, status colours, header sizing, etc. |
| `area_styles` | Record<area, AreaStyle> | — | Per-room overrides: background/image, borders, header gradient, typography, tile colours, columns, `tile_style`, per-area `sensors`/`header_chips`/`show_graphs`/`elements`. |
| `device_styles` | Record<device_id, DeviceStyle> | — | Per-device: accent `color`, `tile_layout`, forced `profile`, `tile_style` + variant, `tile_icon`/`tile_icon_off`/`tile_icon_speed`, per-entity `entity_animations`, `sensors`, `show_graphs`, `elements`. |
| `profile_styles` | Record<profile, DeviceStyle> | — | Per device-type overrides ("all relays"). |
| `style_presets` | Record<tile_style, StylePreset> | — | Default chips/blocks/variant/element-visibility per tile style. |
| `custom_styles` | Record<key, CustomStyleDef> | — | User-defined saved styles (assigned via `tile_style: custom:<key>`). |

### Graphs & sensor chips

| Option | Type | Default | Description |
|---|---|---|---|
| `graph_sensors` | string[] | `[power, temperature, humidity, battery]` | device_class keys **or entity ids** to graph as sparklines. Setting the key replaces the default set. |
| `graph_hours` | number | `24` | History window (1–168 h). |
| `graph_style` | GraphStyle | — | `type` (line/area/bar), line_width, fill, height, show_dots, time_labels, tick_lines, `axis_labels` (y-axis top/bottom printed either side, default true), bar_radius, per-sensor `sensor_ranges`, `gauge_gradients`. |
| `graph_line_color` | string | — | Global fallback line colour. |
| `graph_sensor_colors` | Record<key,color> | — | Per-sensor-class line colours. |
| `sensors` | string[] | all | Which sensor chip keys **or entity ids** to show on tiles. |

### Sensor-chip keys

- **Electrical:** `power`, `apparent_power`, `reactive_power`, `power_factor`,
  `frequency`, `energy`, `voltage`, `current`
- **Environmental:** `temperature`, `humidity`, `illuminance`, `co2`, `gas`
- **Device:** `battery`, `rssi`, `uptime`, `ip`, `ssid`, `fw_version`, `mac`,
  `cloud`, `mqtt`, `eth`
- **Alerts:** `motion`, `door`, `flood`, `smoke`, `vibration`, `overpower`,
  `overtemp`

Both `sensors` and `graph_sensors` also take **entity ids**, mixed into the same
list and told apart by the dot — every entity id has one, no device class does
(`src/sensor-keys.ts`). That is the only way to reach a reading Home Assistant
gives no `device_class`, which is most of what a PC, NAS, router or Proxmox host
reports; before it, those devices were discovered and then drawn blank.

A named entity applies only to the device that owns it, so one card-wide list can
configure a whole fleet. Named readings lead, in the order given, and the
automatic selection fills the remaining slots — naming one does not switch the
rest off. On `tile_style: sensor-card` the first one named is the headline value.

The editor exposes this as a **Specific entities** field under the class pills,
in Design → Sensor chips and in Graphs & Sensors → Graph Type. The pills own the
class half of the list and the field owns the entity half, so neither can clobber
the other — including "All", which keeps named entities because no pill stands
for them.

### The resolution cascade

Every visual option belongs to one of three **families**, and the family fixes
the ladder (`src/cascade.ts`, pure functions, tested):

- **Tile** — device → type → room → view → card. Theme, colour, tile style +
  variant, blocks, chips, elements, graphs, energy window.
- **Container** — room → view → card. Columns, tile size, gap.
- **Card chrome** — view → card. Header, card surface, typography.

Saved looks (`custom_styles`, `style_presets`) sit between view and card as a
side ladder any layer can point at. The terminus differs per option: blocks end
at the per-profile default, chips at the per-profile set, graphs at `false`,
energy at the lifetime total — and **elements end at their own `STYLE_ELEMENTS`
default**, which is visible unless the entry declares `def: false` (opt-in
placements like `header_chips`). Everything comes from config — the editor is
the single source of truth. (An earlier viewer-local `localStorage` override
layer for in-view "what to show" tweaks was removed; it may return as an opt-in
advanced feature.)

---

## 7. How it works

### Reading Home Assistant state

The card never talks to a backend of its own — it uses the `hass` object Lovelace
passes in. `getAllDevices(hass)` in `helpers.ts`:

1. Iterates `hass.entities` (the entity **registry**, indexed and fast — not the
   `states` array) and keeps only device-like domains (`switch`, `light`, `cover`,
   `valve`, `climate`, `sensor`, `binary_sensor`, `fan`, `lock`, `media_player`,
   `vacuum`, `alarm_control_panel`, `humidifier`, `water_heater`, `update`,
   `button`, `number`, `select`, `text`, `camera`, `event`; `device_tracker` is
   deliberately excluded).
2. **Applies the discovery mode.** In **Shelly mode** (`mode` unset or `'shelly'`)
   it keeps only entities whose platform is `shelly` or `bthome` — the latter for
   Shelly BLU BLE sensors that report through HA's BTHome integration — and skips
   non-Shelly BTHome vendors (Tuya, generic BLE) via a `manufacturer`/platform
   check. In **universal mode** it keeps every platform and applies, per entity,
   the domain lists (`exclude_domains` drops, `include_domains` when set keeps
   only those; excluded wins) and the integration deny-list — the built-in
   `DEFAULT_EXCLUDE_INTEGRATIONS` (phones, browsers, the supervisor, system
   monitors, weather, and the router platforms) plus `exclude_integrations`,
   unless the platform is in `include_integrations`, which wins over both. Those
   sets are `null` in Shelly mode, so the checks are true no-ops there rather
   than a second code path. Entities with `hidden_by` set are skipped in both
   modes. A Shelly entity always wins the device's `integration` field, since in
   universal mode other integrations can attach entities to the same device.
3. Groups entities under their device (`hass.devices`), resolving area name via
   `hass.areas`, and extracts the device IP from `configuration_url`.
4. Attaches live state from `hass.states[entity_id]` (O(1) lookup).
5. **Merges duplicate registry rows** in two passes. First, sub-devices fold into
   their parent when they are the same physical unit — `via_device_id` plus a
   matching config-URL host (a Shelly 2.5's per-channel sub-devices), or a
   Shelly child with no config URL on the parent's integration (restricted to
   Shelly so a Hue / ZHA bridge does not swallow every bulb behind it). Second,
   *siblings* describing one unit — same MAC connection or an identical
   `identifiers` entry — fold together, because some integrations register a
   shadow device per real one; the survivor is the row with a config URL, then
   the Shelly one, then the one with most entities.
6. **Applies `universal_scope`** per merged device (`deviceInUniversalScope`):
   `all` keeps everything, `controllable` keeps devices with a primary entity in
   a controllable domain, and `devices` (default) also keeps devices with a
   primary `sensor` / `binary_sensor` carrying a recognised `device_class`.
   Skipped in Shelly mode.

Every drop is counted per device into `DiscoveryStats` (`notShelly`,
`byIntegration`, `byDomain`, `byScope`, and the integrations responsible,
commonest first) — a device only counts as hidden when none of its entities
survived. The card turns that into a dismissible notice at the top: *"165 devices
are not shown: 93 by integration, 72 by scope (browser_mod, hassio, mobile_app…)"*,
or in Shelly mode *"270 more devices are in Home Assistant but not on this
card"*. In the edit dialog its link jumps to the Discovery section; on a
dashboard it is plain text. The count is the entire fix — the defaults stay.

### Profiles, grouping and rendering

- `getDeviceProfile()` derives a **profile** (relay/plug/dimmer/rgb/climate/cover/
  valve/energy/sensor/input/uni/wall_display/lock/media/generic) and **generation**
  from the device's entity domains and Shelly model, producing a badge label.
  It dispatches through the `PROFILE_PROVIDERS` registry, most-specific-first:
  `ShellyProvider` claims any device whose manufacturer contains "shelly" or
  whose platform is `shelly` and runs the model-string reclassification plus
  `detectShellyGen`; `GenericProvider` claims everything else, classifies by
  domain alone, reports gen `'other'` and uses vendor-neutral labels ("Switch",
  "Climate"). `mode` gates discovery breadth, never provider routing — a Shelly
  is detected identically in both modes. Profiles are cached per device.
- Devices are grouped into collapsible **area** sections (plus any `name_groups`
  and a Favourites section), filtered/sorted per the config and active view.
  The active view's `filter` goes through `applyViewFilter` (`src/view-filter.ts`)
  with a trace of what each gate removed; if nothing survives, the card renders
  the explanation described in §6 instead of an empty grid.
- Each device renders as a tile in the resolved **tile style**. With
  `smart_tile_styles`, each profile maps to a default style (relay/plug/energy →
  `power-monitor`, dimmer/rgb → `light-control`, climate → `climate-control`,
  cover → `cover-control`, sensor → `sensor-card`, input/uni → `input-control`;
  a wall_display gets `climate-control` only when it exposes a climate entity);
  otherwise the adaptive `default` block tile is used with the per-profile block
  order.
- **Sensor chips** are chosen per profile (overridable by the `sensors` cascade).
  Controls call HA services through `hass` (toggle, set brightness, cover/valve
  position, climate setpoint, etc.).
- **Graphs** are fetched from HA history for the selected `graph_sensors` over
  `graph_hours`, downsampled and drawn as SVG sparklines, with fetch throttling and
  a manual refresh.

### Needs attention

`src/attention.ts` is pure (states come in as a plain map). `attentionItems`
lists devices worst-first — offline, then firing alerts (faults like
overtemp/overpower and alarms like smoke/water/gas), then batteries at or below
`attention_battery`, then genuine updates (beta firmware excluded unless
`include_beta_updates`); an offline device is reported as offline and nothing
else. `groupAttention` splits the list by each device's `integration`, ordered
by worst kind, then size, then name; with one group and nothing muted the list
renders flat. `splitMuted` sets aside `attention_muted_integrations`: those
groups stay at the foot of the block, collapsed and with their counts, and are
left out of the header count — hiding them outright would hide the way back.
Muting writes config, so the per-group 🔔/🔕 toggle only renders in the edit
dialog's preview, where it fires `hdd-attention-mute` and the editor updates the
list (the editor's own Needs attention section offers the same integrations with
counts). Integrations whose friendly labels collide are shown by slug so a mute
is unambiguous. The firmware spread (`firmwareByIntegration`) is computed per
integration — one "newest" each, since version strings from different vendors
are not comparable — omits integrations on a single version, and omits muted
ones.

### Shelly specifics

- In Shelly mode discovery is Shelly/BTHome only (above); in universal mode
  Shelly devices are still routed to `ShellyProvider` for detection.
- Handles all Shelly device classes and generations, multi-channel relays,
  Shelly BLU sensors, TRV/valve, Wall Display, EM/3EM energy monitors, i3/i4
  inputs, UNI, and **virtual components** (select/number/button/text/boolean) via
  the `virtual_controls` tile block.
- The header stat chips aggregate across the discovered fleet (online/offline
  counts, summed power/energy, average temp/humidity/light/RSSI, alert and
  firmware-update counts) and open drill-down lists.

---

## 8. Development & deployment

### Build

- **Toolchain:** Rollup (`rollup.config.mjs`) + `@rollup/plugin-typescript` +
  node-resolve + terser. Entry `src/index.ts` → `dist/ha-device-dashboard.js`
  (`format: es`, sourcemap only in watch/dev). `tsconfig.json` targets ES2020,
  uses experimental decorators (Lit), strict mode.
- **Scripts** (`package.json`):
  - `npm run build` — production bundle.
  - `npm run watch` — rebuild on change (also auto-deploys, see below).
  - `npm run typecheck` — `tsc --noEmit`.
  - `npm run lint` — ESLint over `src`.
  - `npm test` — `check:docs` plus the four test scripts below.
  - `npm run test:card` — discovery, both merge passes, the cascades, the design
    scope model, sensor selection, the room filter, the view filter (gate order,
    the No Room trap, "All" equals no filter), needs-attention grouping and
    muting, update policy, i18n.
  - `npm run test:detection` — `getDeviceProfile` + `detectShellyGen` over 215
    real registry rows in `scripts/fixtures/`, harvested from a live instance and
    scrubbed. The expected file records what the code does *today*; a diff means
    detection changed, and `--bless` re-records it. Rows with a `why` were checked
    against real hardware and a change to one is reported as a regression.
  - `npm run fixtures:harvest` — regenerate those fixtures from a running HA.
    Read the output before committing: it is published.
  - `npm run test:palette`, `npm run test:builder`.
  - `npm run bench` — logic hot paths against a synthetic fleet (Node).
  - `npm run bench:render` — DOM render cost in headless Chrome against a live
    HA. The logic was already known to be cheap; drawing is the real limit.
- **Runtime deps:** `lit` ^3.1, `custom-card-helpers` ^1.9.
- `src/index.ts` prints a `BUILD_TAG` (e.g. `mobile-editor-2026-07-10f`) to the
  browser console so you can confirm which bundle HA actually loaded.

### Deploying to Home Assistant

The repo targets an HA config mounted on the Windows `Z:` drive:

- **`rollup.config.mjs` `autoDeploy` plugin** — after every build, copies the
  bundle to `Z:/www/community/ha-device-dashboard/ha-device-dashboard.js` (silently
  skipped if `Z:` isn't mapped). So `npm run build`/`watch` deploys automatically.
- **`update.ps1`** — one-command update from Git: `git fetch` + `git reset --hard
  origin/<branch>` (defaults to `master`) to avoid the committed-`dist` merge
  conflict, then rebuilds and reports the deployed build tag.

Because it deploys under `www/community/...`, the Lovelace resource URL is
`/local/community/ha-device-dashboard/ha-device-dashboard.js` (Type: JavaScript
Module).

### Relationship to the `device_pulse` backend

The card is **self-contained and does not depend on** the separate `device_pulse`
("Shelly Devices") HA integration — a source search for `device_pulse` /
`shelly_devices` in `src/` returns no matches. All device and online/offline counts
the card shows are computed in-browser from the HA registries and live states. The
two projects can coexist on the same HA instance but are independent.

### Docs & offline tools

`docs/card-reference.json` is the single machine-readable model of the config
surface. `docs/tools/` holds self-contained offline HTML designers
(`reference.html`, `config-builder.html`, `profile-tiles.html`,
`editor-layout.html`, `style-presets.html`) that read that model. `docs/shelly-
reference/` contains Shelly API / HA-integration reference notes.

---

## 9. Known limitations / roadmap

- **Shelly-first defaults.** Universal mode exists and does discover ZHA / Hue /
  ESPHome / Matter, but `mode` defaults to `shelly`, so out of the box only
  Shelly/BTHome devices appear. Profile detection and tile styling remain far
  richer for Shelly than for anything else (`GenericProvider` classifies by
  domain only). The card says so on screen — a dismissible notice counts what
  discovery dropped and links to the setting — which was the single most common
  "my device is missing" report. `include_integrations` and `include_domains`
  still have no editor control.
- **Detection is the fragile part.** Both bugs found in it came from real device
  data rather than from reading the code, which is why `npm run test:detection`
  exists and why the fixtures are harvested rather than invented. Hardware nobody
  here owns is still the likeliest source of the next one.
- **Doc drift.** Most of `docs/` is hand-synced and lags `src/types.ts` between
  sweeps (`npm run check:docs` catches part of it, not all).
  **`src/types.ts` is the only always-current source** — check the JSON against it
  rather than the other way round.
- **Editor refactor in progress.** The editor is migrating to the data-driven
  `EDITOR_LAYOUT`; only the Graphs & Sensors tab is fully wired to it, with other
  tabs still rendered from bespoke methods (documented as future phases).
- **Docs tools duplicate the model.** The `docs/tools/*.html` designers inline
  their own copy of `card-reference.json` and are kept in sync by hand; a build
  step to generate them from the JSON is noted as future work.
- **Performance on large fleets** is handled by render throttling/caching, and is
  now measured rather than assumed (`npm run bench:render`). On a 276-device
  instance: first render 306 ms, and a push touching 10% of entities 16.4 ms —
  one whole frame. The cost tracks **fleet size, not how much changed**, because
  every tile's template and cascades re-run even where the DOM is left untouched.
  The 2s coalescing window is what keeps that off the critical path. Beyond a few
  hundred tiles the lever would be rendering fewer of them (virtualisation),
  not making each cheaper.
