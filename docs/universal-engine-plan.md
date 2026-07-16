# Universal Device Engine — Design & Plan

Status: **active** · Started 2026-07 · Owner: TheIcelandicguy

## Why

Market research (most-wanted HA integrations / add-ons / cards) points at an
unsolved gap: a **generic device dashboard that auto-lays-out any device and still
looks designed**. Existing answers (`auto-entities`, stock `entities`) solve
discovery but produce walls of gray rows. This card already has the missing
ingredient — a polished, profile-aware tile system, themes, and room backdrops.

**Strategic thesis:** "generic" has always meant "ugly." Our polish is the moat.
So we go universal by *extending our tiles* to more devices — not by delegating to
native HA elements, which would hand away the one thing that differentiates us.
Delegation is a fallback for the long tail only.

Key enabling fact: `getDeviceProfile` already classifies by **entity domain**, not
Shelly model — so it is ~80% universal today. The Shelly-only-ness is essentially
the single discovery filter at `helpers.ts:44`.

## Decisions (locked)

1. **Device-centric** grouping stays — it's the card's identity. We do not adopt
   autoLayout's area-split.
2. **Two resets**: "Reset look" (styling keys only, preserves content) and "Reset
   everything" (full factory defaults).
3. **Add `lock` and `media`** as first-class profiles.
4. **Delegation is fallback-only** for unstyled long-tail domains — never for
   climate / cover / light (our custom tiles win there).
5. **Ship universal behind a `mode` flag.** The flag gates discovery *breadth*,
   not provider routing.

## Provider model (answers decision 5)

The mode flag gates how many devices are discovered; provider routing is automatic
and mode-independent, most-specific-first:

- **Flag OFF (default):** only `shelly` / `bthome` discovered — identical to today.
- **Flag ON (universal):** all devices discovered. Each routes to a provider:
  - `ShellyProvider` — `matches()` = platform is shelly/bthome. Model regex,
    generations, sub-device merge, full tile polish.
  - `ZwaveProvider` / `ZigbeeProvider` / `MatterProvider` — match `zwave_js` /
    `zha` / `matter`; integration-source badge instead of "Gen2".
  - `GenericProvider` — catch-all fallback (today's domain-based `else` path).

A Shelly is **always** handled by `ShellyProvider` regardless of mode.

## Harvest from `autoLayout.ts` (not adopted wholesale)

Take three things; keep our device-centric render path:

- **Un-gated discovery** — drop the Shelly filter, keep the sub-device merge.
- **Entity tiering** — annotate each entity `primary | config | diagnostic`
  (from `entity_category`). This is the lever for "basics only".
- **Registry-signature reactivity** — fold into existing `shouldUpdate` throttle.

Do **not** take: its area-vs-device grouping, or its delegate-first rendering.

## "Basics only" default tile face

Primary tier only: name row + the single dominant control + a curated handful of
`PROFILE_DEFAULT_SENSORS` chips; graph only for sensor-type devices. Config +
diagnostic entities live behind the detail sheet. Principle: **calm, not a data
dump** — that restraint is the differentiator.

## Factory defaults + revert

One frozen `FACTORY_DEFAULTS` object is the single source of the first-run look.
Applied **by value at two moments only** — first-run seed and explicit reset —
never live-merged on load (that would stomp user choices, and lets a future version
ship a new default look without mutating existing configs). "Reset look" restores
only styling keys; "Reset everything" restores the whole object.

## Phased plan

Each phase ships independently and is reversible.

- **Phase 0 — Foundations (invisible).** Extract `ProfileProvider` seam
  (`ShellyProvider` + `GenericProvider` behind an ordered registry); add frozen
  `FACTORY_DEFAULTS` and seed first-run from it. Zero behavior change.
- **Phase 1 — Tiering foundation + detail grouping.** ✅ *Done.* Two of the three
  planned items were already solved in the existing code, so the phase narrowed:
  - **Tile face was already "basics only."** `block-tile.ts` splits chips into
    primary (large) / electrical (strip) / diag (muted footer), and
    `PROFILE_DEFAULT_SENSORS` keeps diagnostics off the face by default. Touching
    it would have *regressed* good behavior, so we didn't.
  - **`registrySignature` dropped.** `_getDevices` already caches the device list
    by reference-equality on `hass.entities` / `hass.devices` / `_config` — cheaper
    and stronger than a string hash. The harvested pattern is superseded.
  - **Shipped:** `entity_category` captured on `HAEntity`; a universal
    `entityTier()` helper (primary/config/diagnostic); the detail sheet's flat
    All-Entities list now groups by tier (config/diagnostic settle below as
    secondary sub-groups). Zero Shelly tile-face change; foundation ready for
    Phase 2's non-Shelly devices, which lack the Shelly chip curation.
- **Phase 2 — Universal discovery behind `mode: universal`.** ✅ *Done.*
  - `mode?: 'shelly' | 'universal'` config flag (default/undefined = shelly, i.e.
    today's behaviour). `getAllDevices(hass, {universal})` skips the platform filter
    only when the flag is on.
  - New `lock` + `media` profiles (type, label, blocks, detection, lock→battery
    chip). Ecosystem *provider classes* were intentionally NOT added — GenericProvider
    already classifies zwave/zigbee/matter by domain, and the badge comes from the
    integration label. Added `zwave_js`→'Z-Wave', `zha`→'Zigbee' labels.
  - **Real-data finding (2728-entity instance):** classification works (media_player→
    media, non-Shelly lights→dimmer/rgb, device_tracker excluded), but universal mode
    is a FIREHOSE — it surfaces routers, PCs, browsers, cameras, 173 update entities.
    A few domains (vacuum/fan/siren/water_heater) fall to `generic` (no detect branch
    yet). **Before Phase 5 can flip the default, universal mode needs scoping**
    (area/integration/domain filters or a "controllable devices only" default). This
    is now the top input to the editor phase. Confirms the flag-first sequencing.
  - Note: the `climate` badge label is still Shelly's 'TRV'; a generic thermostat
    would mislabel. Cosmetic; revisit with per-integration labels.
- **Phase 2.5 — Universal scoping (anti-firehose).** ✅ *Done.* Added because the
  Phase 2 real-data finding showed universal mode surfaces routers/PCs/browsers.
  - `universal_scope?: 'all' | 'devices' | 'controllable'` (default `'devices'`):
    `devices` keeps actuators + devices with a recognised sensor (temp/power/motion/
    …), dropping routers/PCs whose only sensors are data-rate/diagnostic;
    `controllable` keeps actuators only; `all` is the raw firehose.
  - Explicit `include_integrations` / `exclude_integrations` (platform allow/deny)
    and `include_domains` / `exclude_domains` (entity-domain allow/deny). All gated
    to universal mode — shelly mode is untouched.
  - Implemented as `deviceInUniversalScope()` + `CONTROLLABLE_DOMAINS` /
    `RECOGNIZED_SENSOR_DCS`, threaded through `getAllDevices` opts.
  - Note: fan/vacuum/siren/etc. are kept (controllable) but still classify to a
    basic profile — their *control* rendering is Phase 3 (delegation) territory,
    same as lock/media.
- **Phase 2.6 — Live verification + fixes.** ✅ *Done.* Verified in the browser
  against the live instance (temp `uv-verify` dashboard, universal mode). Engine
  confirmed working: 98 devices across 20 integrations, `media` profile (38), no
  render crashes. Live data surfaced — and we fixed — three issues, all rooted in
  "real devices are multi-integration" (HA merges router device_trackers + a Shelly
  Wall Display + device_pulse under one device_id):
  - **Bug A (P2 regression):** a Shelly Wall Display exposes a `media_player`
    (speaker), so the new media branch typed it `media`. Fix: add `media`/`lock` to
    `WEAK_TYPES` so the Shelly model string corrects it back to `wall_display`.
  - **Bug B:** `integration` badge showed a router platform (NETGEA) not Shelly,
    because the shelly-integration correction was gated on `!isShelly`. Fix: a
    Shelly entity always sets `integration = 'shelly'`.
  - **Scoping leak:** phones/browsers/routers/hassio slipped through 'devices'
    scope. Fix: `DEFAULT_EXCLUDE_INTEGRATIONS` (built-in noise deny-list) +
    changed `include_integrations` from allow-list to **force-include** (re-add
    e.g. `mobile_app`). Battery devices are kept — filtering is by integration.
  - Re-verified live: Display wc → `Display`/`Shelly`; noise integrations gone;
    94 clean devices. Resource version bumped (service worker pins by `?v=`).
- **Phase 3 — Delegation fallback.** ✅ *Done.* Native HA controls for the long-tail
  controllable domains our tiles don't hand-roll — never for climate/cover/light/
  switch/valve (those keep our renderers).
  - `hdd-delegated` LitElement (`tiles/delegated-control.ts`): lazily builds a native
    tile via `loadCardHelpers().createCardElement({type:'tile', features})`, re-pushes
    `.hass`, dissolves the native card chrome (CSS vars) so it blends into our tile.
  - `delegated_controls` tile block (added to every profile's default order, a no-op
    when there's nothing to delegate — like `virtual_controls`). `delegatableEntities()`
    + `DELEGATE_FEATURES` select primary entities in lock/media_player/fan/vacuum/
    siren/humidifier/water_heater/lawn_mower/alarm_control_panel and their features.
  - Verified live: 42 delegated controls, 42/42 rendering native controls (36 media
    players w/ playback+volume, 4 fans, 1 vacuum, 1 water_heater). The Shelly Wall
    Display now leads with our sensor graphs then embeds native media transport.
  - **Opt-in:** `delegate_controls` config flag, OFF by default (each control embeds
    a native tile — real render cost on big media fleets). When off, a one-time
    dismissible notice ("N devices have extra controls… turn on Native controls in
    the editor") appears if delegatable devices exist; dismissal persists in
    localStorage. Editor toggle added in the defaults panel. Verified live: off →
    0 native tiles created + notice shown.
- **Phase 4 — Editor universal support + reset buttons.** 🚧 *In progress.*
  - Native-controls toggle (shipped with P3 opt-in).
  - **4a — Discovery section** in the Rooms & devices tab: Shelly↔Universal mode
    pills, scope pills (Real devices / Controllable / Everything), and comma-list
    fields for Hide integrations / Show-anyway (force-include).
  - **4b — Reset buttons** in the Defaults panel: "Reset look" (factory look, keeps
    content — verified: theme/columns/style reset, favourites/hidden/mode/scope/
    views preserved) and "Reset everything" (two-click armed; wipes to type +
    factory look).
  - **4c — Editor device list respects universal mode** (`_allDevices` mirrors the
    card's discovery opts, cache keyed on them). Verified live: editor lists 56
    (shelly) / 93 (universal devices) / 167 (universal all).
  - Verified by instantiating the editor element live: all controls render, resets
    behave correctly, device list tracks mode/scope.
  - **4d — Polish.** ✅ Accurate integration badge labels (music_assistant→Music,
    yamaha_musiccast→Yamaha, roborock→Roborock, spotify, cast, reolink, philips_js,
    gecko, android, upnp, ipp, device_pulse→Pulse, bthome→BTHome…) replacing the
    ugly 6-char truncations; neutral labels for non-Shelly types (climate→'Climate'
    not 'TRV', relay→'Switch'); domain filters (Hide/Only entity types) surfaced in
    the Discovery UI. Verified live: labels clean on 94-tile card; domain fields
    render; Device styling tab opens cleanly for a non-Shelly media_player.

  Phase 4 is functionally complete. Universal mode is fully usable from the GUI:
  discover → scope → filter → style → native controls → factory-reset.
- **Phase 5 — Flip the default.** Make universal default; update picker / README /
  screenshots. Deferred bravery.

## Backward-compat guarantees

- Flag-off is byte-for-byte today's behavior.
- Existing configs are never live-mutated; `FACTORY_DEFAULTS` applies only at
  first-run and explicit reset.
- Shelly devices always route to `ShellyProvider`.
