---
name: ha-device-dashboard-dev
description: Reference for developing Davíð's HA Device Dashboard — the Home Assistant Lovelace custom card (TypeScript + Lit 3, Rollup, v1.7.0). Repo TheIcelandicguy/ha-device-dashboard-card, local folder E:\shelly-dashboard-card, element and bundle ha-device-dashboard, deployed to Z:\www\community\ha-device-dashboard\. Use whenever working on the card — universal discovery and universal_scope, the integration deny-list, views and filter pills, Needs attention and muting, the five-tab editor and EDITOR_LAYOUT, the dimmer_hold hold-to-dim gesture, detection fixtures, tests and CI — and whenever building or deploying it, bumping the resource ?v=, or checking which BUILD_TAG the browser loaded. Trigger even when the user just says "the card", "device dashboard", "shelly dashboard card", "ha-device-dashboard", "the editor" or "the dimmer". Read it before answering from memory; the folder, repo and element names all differ and have caused confusion.
---

# HA Device Dashboard — card development

A Home Assistant **Lovelace custom card**, frontend only: no Python, no
integration, no helper entities. TypeScript + Lit 3, bundled by Rollup into one
committed file `dist/ha-device-dashboard.js`. It reads the in-browser `hass`
object (entity/device/area registries plus live state), auto-discovers devices
— Shelly/BTHome by default, every HA device in universal mode — and renders a
device-centric fleet dashboard: tiles grouped by room, a needs-attention
summary, filtered views, sparkline graphs, a detail sheet, and a full GUI
editor. Public since 2026-09-07; HACS installs from its releases.

## Three names for one thing

| Where | Name |
|---|---|
| Local folder | `E:\shelly-dashboard-card` (Bash: `/e/shelly-dashboard-card`) |
| GitHub repo | `TheIcelandicguy/ha-device-dashboard-card` |
| npm package, element, bundle, `hacs.json` filename, deploy folder | `ha-device-dashboard` |

The folder kept its name from when the card was Shelly-only; everything else
was renamed. This has cost real time: a search for "ha-device-dashboard" on
`E:` finds nothing, and `C:\Users\brave\shelly-dashboard-card` does not exist
as a project: it is a stray folder holding only a `.gitignore`, not a repo
(the global CLAUDE.md names `Shelly- card`, an abandoned Vite prototype, as the
decoy). Do not work in either; the real repo is on `E:`.

## Repo state (verified 2026-10-07)

- **Version 1.7.0**, tagged `v1.7.0` and released 2026-10-06 (the CHANGELOG heading says
  2026-10-05; `package.json`, `CHANGELOG.md`, `BUILD_TAG` in `src/index.ts` all
  agree on 1.7.0). The bundle on `Z:` is
  1.7.0 and the registered resource is `?v=v1.7.0`. `npm run check:docs` fails if
  package.json and the changelog disagree.
- **`master` is the trunk** and is what other people's dashboards load. Branch
  and open a PR, even for a one-line fix; CI is the only gate. Local
  branches besides `master`: `chore/repo-hygiene` and
  `claude/confident-dirac-n8tloc` (PR #24, merged into `master` for 1.7.0; the
  branch still exists, and so does the old `feat/vertical-dimmer`, on `origin`
  only). Branch names churn between sessions; check
  `git branch -a` rather than trusting a list here.
- **`dist/` is committed** and CI fails on a stale one, so every PR carries a
  rebuilt bundle. This is also why `git pull` fails with "local changes would be
  overwritten": use `.\update.ps1` (below), never fight the conflict by hand.
- **Git hooks never fire.** `.git/config` has
  `hooksPath = C:\Users\brave\shelly-dashboard-card\.git\hooks`, a path that
  does not exist. Nothing pre-commit runs locally; do not assume a hook caught
  anything. Fixing it is a one-line `git config core.hooksPath` change but has
  not been asked for.
- Scratch files `.tmp-*`, `backups/`, `.ha-token`, `video-script.md` and
  `docs/universal-engine-plan.md` are gitignored on purpose. `.claude/` too,
  except `.claude/skills/`, which holds this skill and is tracked.

## Which docs to trust

1. **`src/types.ts`** (`HADeviceDashboardConfig`) — the authority for the option
   surface, and well commented; the doc comment usually carries the default and
   the reasoning. When a doc disagrees with it, the doc is the bug.
2. **`CLAUDE.md`** and **`OVERVIEW.md`** — both rewritten 2026-09-10 for
   universal discovery and the view filter pills; treat as current. CLAUDE.md
   is the fast orientation with the gotchas; OVERVIEW.md is the full tour and
   the config table.
3. **`docs/card-reference.json`** — the machine-readable model that drives
   editor defaults and the offline designers in `docs/tools/*.html`. It lags
   `types.ts`; check it against the type, not the other way round. Known
   mismatch today: its `defaults.show_graphs` is `true` and its first-run row
   says `show_graphs ?? true`, while `cascade.ts` returns `?? false` and README
   says off. Its `$comment` also claims `FACTORY_DEFAULTS` includes
   `show_graphs` (it does not) and lists `tile_style: null` where the code has
   `'default'`.
4. **`README.md`** — a fair summary, resynced 2026-08-19 / 09-02 and its
   Discovery, Views and Needs attention sections rewritten for v1.6.0.
5. **`CONTRIBUTING.md`** — the PR checklist, "Cutting a release", adding a
   language, and the fixture rules. **`docs/ROADMAP.md`** — structural work only;
   user-visible things go to GitHub Issues.
6. **`docs/GUIDE.md`** is generated from `src/help.ts` by `npm run docs:guide`.
   Edit the TypeScript, never the markdown.

Two gates keep the docs honest and both must pass before a session ends:
`npm run check:docs` (`scripts/check-docs.mjs` — vocabularies, per-profile
defaults, first-run rows, element ids in the designers, `CONFIG_KEYS` vs the
interface, README key coverage, guide freshness, BUILD_TAG present in `dist`,
version agreement, single font catalogue, every `src/*.ts` mentioned in
OVERVIEW) and `python check_docs.py` (paths, `NAME = value` constants, the
version quoted in `CLAUDE.md` against `package.json`, and this skill's own
description version). As of 2026-10-07 both
pass clean (0 failures, 0 warnings) — the v1.4.1/v1.6.0-vs-1.6.1 mismatch
recorded here on 2026-09-11 has since been fixed; CLAUDE.md's references to
v1.4.1 and v1.6.0 that remain are historical (describing when a fix landed),
not a stale current-version claim.

## Layout

| Path | What |
|---|---|
| `src/index.ts` | Entry: imports card, editor, `tiles/delegated-control`; registers `window.customCards`; prints the `BUILD_TAG` console banner |
| `src/ha-device-dashboard.ts` (~4.2k lines) | The card element: config, hass wiring, grouping, discovery notice, needs-attention block, header, graph fetch, CSS-var map |
| `src/editor.ts` (~7.2k lines) | `<ha-device-dashboard-editor>`, five accordion tabs, live preview, YAML export |
| `src/editor-layout.ts` | The data-driven `EDITOR_LAYOUT` spec (mid-refactor, see Editor) |
| `src/types.ts` | Every config and data type — the option surface |
| `src/helpers.ts` | Discovery (`getAllDevices`, `DEFAULT_EXCLUDE_INTEGRATIONS`, `deviceInUniversalScope`, `DiscoveryStats`), the `ProfileProvider` registry behind `getDeviceProfile`, `detectShellyGen`, `ALL_PROFILES` / `ALL_DEVICE_DOMAINS`, `FACTORY_DEFAULTS`, `CONFIG_KEYS`, `migrateConfig` |
| `src/view-filter.ts` | `applyViewFilter()` — the one implementation of a view's gates; `emptiedBy`, `missesNoRoom`, `NO_AREA = ''` |
| `src/room-filter.ts` | Card-wide `areas` filter as pure functions; `areaKeyUniverse` (also feeds the Views tab's room pills) |
| `src/attention.ts` | `attentionItems`, `groupAttention`, `splitMuted`, `firmwareByIntegration` — pure |
| `src/cascade.ts` | Every resolution cascade as pure functions (three families) |
| `src/design-scope.ts` | The Design tab's scope model, pure |
| `src/sensor-keys.ts` / `sensor-pick.ts` | The mixed `sensors` list (device_class keys and entity ids, told apart by the dot); what a sensor tile leads with |
| `src/update-policy.ts` | `computeUpdateReason()` — the 2 s coalescing window; new reactive state goes in `LOCAL_RENDER_KEYS` |
| `src/font-options.ts` | The one font catalogue; `CDN_FONT_FAMILIES` derived from it |
| `src/help.ts` | The ? Help content, source of `docs/GUIDE.md` |
| `src/palette.ts`, `themes.ts`, `anim-icons.ts`, `fonts.ts`, `shelly-cloud-import.ts` | Palette rolls with WCAG floors, 8 theme presets, SVG animated icons, bundled @font-face (generated — do not hand-edit), Shelly Cloud importer matching |
| `src/tiles/` | One render fn per tile style (`power-monitor`, `light-control`, `climate-control`, `cover-control`, `sensor-card`, `input-control`, `scene-button`, `block-tile`), `delegated-control.ts`, `tile-context.ts` (`TileCtx`), `tile-parts.ts` (shared fragments, `chipsInHeader()`) |
| `src/detail/detail-sheet.ts` | The expandable per-device panel |
| `src/styles/` | Lit css blocks: `main.ts`, `tiles.ts`, `detail.ts` |
| `src/translations/` | `en.ts`, `is.ts`; `src/localize.ts` holds `translate()` and `t()`. Dashboard only — the editor is English by design |
| `scripts/` | The test, bench, harvest, guide and bump scripts (all `.mjs`) |
| `scripts/fixtures/` | `detection-devices.json` (215 scrubbed real registry rows) + `detection-expected.json` |
| `docs/` | README, `card-reference.json`, `GUIDE.md`, `ROADMAP.md`, `tools/` (five offline designers), `shelly-reference/`, `images/` |
| `rollup.config.mjs`, `update.ps1`, `check_docs.py`, `build_skill.py`, `hacs.json` | Build + auto-deploy, git-sync helper, CLAUDE.md and skill gate, packs this skill into a `.skill` for claude.ai, HACS metadata |
| `.claude/skills/ha-device-dashboard-dev/SKILL.md` | This skill's source of truth; edit it here, in the PR it describes |

## Discovery: two modes

`getAllDevices` keys off `config.mode`. Unset or `'shelly'` keeps only entities
on the `shelly` or `bthome` platforms and drops BTHome devices whose
manufacturer is not Shelly. Nothing else applies — that is the original card.
`'universal'` walks the whole entity registry (21 `DEVICE_DOMAINS`;
`device_tracker` is never discovered) and filters three ways, all universal-only:

- **Integration deny-list** — `DEFAULT_EXCLUDE_INTEGRATIONS` (`mobile_app`,
  `browser_mod`, `hassio`, `systemmonitor`, `backup`, `sun`, `nws`, and the
  router platforms `netgear`, `tplink_router`, `huawei_lte`, `huawei_ont`,
  `asuswrt`, `fritzbox_tools`, `fritz`) plus the user's `exclude_integrations`.
  `include_integrations` is a force-include that wins over both.
- **Domains** — `exclude_domains` drops outright; `include_domains`, when set,
  keeps only those. Excluded wins on a clash (the opposite of integrations).
- **Scope**, after the two merge passes, per device: `universal_scope` `all` |
  `controllable` | `devices` (default — also keeps devices whose primary
  sensor carries a recognised `device_class`; that is what drops routers, PCs
  and browsers).

In Shelly mode those sets are `null`, so the checks are genuine no-ops rather
than a second code path. **Mode gates breadth, never detection**:
`getDeviceProfile` dispatches through `PROFILE_PROVIDERS` most-specific-first —
`ShellyProvider` (manufacturer contains "shelly" or platform `shelly`) runs the
model reclassification and `detectShellyGen`; `GenericProvider` classifies by
domain, gen `'other'`, vendor-neutral labels. A Shelly in universal mode is
detected exactly as in Shelly mode, and a Shelly entity always wins a device's
`integration` field. Drops are counted per *device* into `DiscoveryStats`
(hidden only when none of its entities survived) and rendered as the
dismissible "N devices are not shown: … by integration, … by scope" notice —
or "N more devices are in Home Assistant but not on this card" in Shelly mode.
Most "my device is missing" reports are just Shelly mode. The editor's
Discovery section (Rooms & devices tab) exposes mode, scope and the two
hide-checklists; the force-include keys are YAML-only.

## Views and the filter pills

**A view is what its pills select, minus `exclude_devices`.** `applyViewFilter()`
in `src/view-filter.ts` is the only implementation — the card renders through
it and the editor's "n/total" count on each view card calls the same function,
because two copies drifted once. Gate order: `profiles` → `domains` (any
entity) → `integrations` (case-insensitive platform) → `areas` (case-insensitive
name) → legacy `devices` → `exclude_devices` → `entity_id_pattern` (an invalid
regex filters nothing). Every gate ANDs; values inside a list OR; an absent or
empty list is no gate. That last rule is the promise the editor's "All" button
makes, and it only holds because the pill vocabularies derive from source —
`ALL_PROFILES` (the 15 `PROFILE_LABELS` keys) and `ALL_DEVICE_DOMAINS` (the 21
domains). The hand-written lists they replaced had 12 and 10, so "everything
ticked" silently dropped lock/media/generic devices (v1.6.1). A test asserts
every pill ticked matches exactly what no filter matches. Integration pills only
render when the fleet spans two or more integrations.

Three traps the code now names:

- **`filter.devices` is legacy.** An *include* list that ANDed with every other
  gate, so "add these two roomless devices" narrowed the view to nothing. The
  editor no longer offers it; `migrateConfig` strips it on save (widening the
  view to its pills); hand-written YAML is honoured until then.
- **A list of rooms excludes devices with no room.** The card matches
  `(d.area ?? '')`, so `NO_AREA = ''` must be in `filter.areas`. The Views tab
  builds room pills with `areaKeyUniverse` over all discovered devices, so a
  **No Room** pill exists whenever anything is unassigned.
- **An empty view explains itself.** `applyViewFilter` takes a `trace`;
  `_renderEmptyView` names the gate that removed the last device (`emptiedBy`),
  adds the No Room hint (`missesNoRoom`), and says filters AND.

## Needs attention

`attentionItems` (offline → alert → battery → update, worst first; an offline
device is reported as offline and nothing else) is split by `groupAttention`
into per-integration groups ordered by worst kind, then size; a
single-integration fleet renders flat. `attention_muted_integrations` (slugs,
case-insensitive) goes through `splitMuted`: muted groups stay at the foot,
collapsed with their counts, and leave the header count — hiding them outright
would hide the way back. Muting writes config, so the 🔔/🔕 toggle on a group
header only renders in the edit dialog's preview and fires its own
`hdd-attention-mute` window event. Two integrations sharing a friendly label
fall back to slugs. The firmware spread is `firmwareByIntegration`: one
"newest" per integration (cross-vendor version strings are not comparable — a
mixed fleet once crowned "BTHome BLE v2"), single-version integrations omitted,
muted ones omitted. `include_beta_updates` is off because a Shelly offers a
beta almost permanently; `attention_battery` defaults to 20.

## Editor

Five tabs: **Rooms & devices** (holds Discovery), **Views** (one card per view:
pills for profiles / domains / integrations / rooms, an exclude-devices
checklist, a live match count), **Design** (scope-first: Global, a view, a
room, a device type or one device — replaced Card & Theme, Device styling and
Header, whose section bodies still live in `_globalSectionDescriptors`),
**Graphs & Sensors**, and a read-only **YAML** tab.

`EDITOR_LAYOUT` (`src/editor-layout.ts`) is mid-refactor: only Graphs & Sensors
renders from it; `devices`, `views` and `design` render bespoke bodies and
ignore the section list. Adding a section to the spec for one of those renders
nothing — that is how "What counts as a light" vanished for a build. Render it
explicitly in the tab body as well.

The card and editor talk over window events. `hdd-editor-goto` carries either
`{device}` (a tile tap in the preview; cancelable, falls back to the detail
sheet) or `{tab, section, flash}` (the delegate and discovery notices).
`hdd-attention-mute` carries `{integration}` and exists so the mute did not
become a third payload shape on `goto`. `_configConflicts` in `editor.ts` flags
settings another setting silently overrides — add a check there when adding a
cascade layer. Editor localStorage is global, not per-card.

## Design

Every visual option belongs to one of three families with fixed ladders in
`src/cascade.ts`: **Tile** (device → type → room → view → card), **Container**
(room → view → card), **Card chrome** (view → card). Saved looks
(`custom_styles`, `style_presets`) are a side ladder, not a rung. Everything
comes from config; the editor is the single source of truth. Eight theme
presets ship (`warm_dusk` default). For anything new that Davíð will look at,
apply the **industrial-precision** skill's tokens rather than exploring: dark
base `#0d0f12`, teal `#38d9c0` for live/normal, amber `#f5a623` for attention,
DM Mono for data, Syne for display, low radius, dense layout. Its output
targets matter here — eight 4″ Shelly Wall Displays glanced at from 1–2 m,
one Wall Display XL (10″) in Forstofa, plus the desk panel and a superwide.
Render cost is O(fleet), not O(changes) (16.4 ms per push at 276 devices); the
2 s coalescing window is what keeps that off the critical path, and the lever
if it ever matters is fewer tiles, not cheaper ones.

## Dimmer: upright slider + hold-to-dim (PR #24, merged; shipped in v1.7.0)

`light-control.ts`'s brightness slider is normally horizontal, which doesn't
fit a narrow tile. Two independent changes landed together in PR #24
(`claude/confident-dirac-n8tloc` → `master`, folds in the old
`feat/vertical-dimmer` branch):

- **Vertical slider on narrow tiles.** `.tile` is a CSS size container
  (`container-name: tile`); at `<=170px` the brightness slider stands upright
  instead of being squeezed horizontally. Pure layout — no new config.
- **`dimmer_hold`** (`src/types.ts`, default `false`/off) — "Hold to dim" under
  Design > Tiles in the editor. Off: just the (possibly vertical) slider, as
  before. On: the slider is hidden on narrow tiles and replaced by hold+drag —
  roughly a 450 ms hold, then drag up/down over the tile's height maps to
  1–100%, with a percentage overlay while dragging. Never both at once.
  Touch requires the hold (so a scroll gesture isn't mistaken for a drag);
  **mouse input skips the hold** — click-and-drag dims immediately after a
  ~10px move threshold, confirmed working on both phone (touch+hold) and PC
  (mouse-drag) as of 2026-10-05. Holding and dragging an *off* light starts from
  a nominal 1% and turns it on at wherever the drag lands, so the gesture can
  turn a light on, not only dim one that is already lit.

Touched: `src/ha-device-dashboard.ts`, `src/styles/main.ts`,
`src/styles/tiles.ts`, `src/tiles/light-control.ts`, `src/editor.ts`,
`src/types.ts`, `src/helpers.ts`, README, OVERVIEW,
`docs/card-reference.json`, `dist`. The 1.7.0 release commit bumped `BUILD_TAG`,
`package.json` and the changelog, and `docs/editor-changes.md` now carries the
before/after screenshots of the "Hold to dim" toggle (`docs/images/editor/`).

## Commands

Run from `E:\shelly-dashboard-card`. PowerShell, not WSL; Node 25 locally
(CI pins Node 20).

```
npm run typecheck        tsc --noEmit
npm run lint             eslint src
npm test                 check:docs + test:builder + test:palette + test:card + test:detection
npm run check:docs       scripts/check-docs.mjs — docs/ vs src/
python check_docs.py     CLAUDE.md vs the repo (paths, constants, version)
npm run test:card        discovery, both merge passes, input channels, cascades, design scope,
                         sensor selection, room + view filter, attention grouping/muting,
                         update policy, i18n key parity
npm run test:detection   getDeviceProfile + detectShellyGen over the 215 fixture rows
npm run test:detection -- --bless   re-record expected after deciding a change is right
npm run test:palette     WCAG floors on 300 generated palettes
npm run test:builder     docs/tools/config-builder.html's YAML output against a stub DOM
npm run docs:guide       regenerate docs/GUIDE.md from src/help.ts
npm run fixtures:harvest regenerate fixtures from a live HA (HA_URL/HA_TOKEN) — read the diff, it is published
npm run bench            hot paths on a synthetic fleet; bench:render — DOM cost in headless Chrome
```

`test:card` and `test:detection` compile the pure modules with `tsc --module
commonjs` into `.tmp-cardtest/` / `.tmp-detectiontest/` and drop a
`{"type":"commonjs"}` package.json beside the output, because the repo is
`"type": "module"` and the emitted `.js` would otherwise be ESM. Anything you
want testable that way must stay free of DOM and `hass` — which is why the
filters, cascades and attention logic are pure. `detection-expected.json`
records what the code does *today*; a diff means detection changed, not that it
broke. Rows carrying a `why` were checked against real hardware and a change to
one is a regression until argued otherwise. `detectShellyGen` is only ever
handed `device.model`, never a display name.

CI (`.github/workflows/ci.yml`) runs typecheck, lint, `npm test`, build, then
fails if `git diff -- dist/` is non-empty; `hacs.yml` validates packaging
monthly and per PR; `release-asset.yml` attaches `dist/ha-device-dashboard.js`
to a published release from the *tag's* checkout, after proving the committed
dist matches a rebuild of it. Release steps are in CONTRIBUTING.md.

## Build and deploy

`npm run build` does three things (`rollup.config.mjs`): writes
`dist/ha-device-dashboard.js` (terser-minified, no sourcemap), copies it to
`Z:\www\community\ha-device-dashboard\ha-device-dashboard.js` via the
`autoDeploy` plugin (silently skipped if `Z:` is not mapped), and — outside
watch mode — runs `scripts/bump-resource.mjs`, which rewrites the Lovelace
resource's `?v=` to the current `BUILD_TAG` over HA's WebSocket API using
`HA_TOKEN` or the gitignored `.ha-token` in the repo root (present on this
machine). No robocopy is involved for a card; no HA restart either.

Copying the file is only half a deploy. The registered resource is
`/local/community/ha-device-dashboard/ha-device-dashboard.js?v=<tag>` (type
module, id `417b646f5f42430782ba71356fe7b07c`); on 2026-08-31 a whole day of
builds reached `Z:` without one reaching the dashboard because `?v=` never
moved. As of 2026-10-07 it is at `?v=v1.7.0`, matching `BUILD_TAG`. If the bump
script says it was skipped (no token, HA asleep), set the URL through the HA
connector's `ha_config_set_dashboard_resource` — or by hand in Settings →
Dashboards → Resources — then Ctrl+Shift+R. **Keep exactly one resource** for
the card; two collide on `customElements.define`. `npm run deploy:bump` runs the
bump alone; `npm run watch` rebuilds and copies but never bumps.

Bump `BUILD_TAG` in `src/index.ts` on every deploy that should be
distinguishable in the browser. `check:docs` fails if `dist` does not contain
the tag in source, so a tag change without a rebuild is caught.

`.\update.ps1 [-Branch x]` = `git fetch`, `git checkout -- .` (discards
working-tree changes, including uncommitted work — check `git status` first),
`git checkout <branch>`, `git reset --hard origin/<branch>`, `npm run build`,
then greps the deployed bundle for the banner tag. It exists because a repo that
commits `dist/` cannot `git pull` after a local build.

## Verify after deploy (close the loop)

1. Open the dashboard, Ctrl+Shift+R, and read the console banner
   `ha-device-dashboard <tag>` — it must equal `BUILD_TAG` in `src/index.ts`.
   A mismatch means the resource `?v=` did not move or the service worker is
   still serving the old response.
2. No `customElements.define` error in the console — that is the two-resource
   collision.
3. `ha_config_list_dashboard_resources` through the HA connector shows one
   `/local/community/ha-device-dashboard/…` entry at the expected `?v=`.
4. For a logic change, check the numbers moved the way the change predicts —
   the discovery notice count, a view's match count, the attention header.
   A change with no observable effect is unverified, not done.

## Traps on this machine

- **PowerShell, not WSL.** The MCP layer mangles `$` in `-Command` strings;
  put anything with a `$` in a `.ps1` / `.mjs` file and run the file.
- **Commit via a temp file: `git commit -F <file>`, never `-m`** through
  PowerShell — quoting eats the message.
- **Robocopy is not used for cards** (that is the integrations' deploy tool).
  Rollup's `copyFileSync` does the copy; a locked file fails loudly.
- **`update.ps1` resets hard.** Commit or stash before running it.

Before ending a session, run `npm run check:docs` and `python check_docs.py`, and update CLAUDE.md.
