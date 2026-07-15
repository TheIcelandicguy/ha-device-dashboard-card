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
- **Phase 2 — Universal discovery behind `mode: universal`.** Drop the filter when
  the flag is on; add ecosystem providers, `lock`/`media` profiles, integration
  badge. The proving milestone.
- **Phase 3 — Delegation fallback.** `loadCardHelpers()` for unstyled domains only.
- **Phase 4 — Editor universal support + reset buttons.** The heavy one; builds
  incrementally.
- **Phase 5 — Flip the default.** Make universal default; update picker / README /
  screenshots. Deferred bravery.

## Backward-compat guarantees

- Flag-off is byte-for-byte today's behavior.
- Existing configs are never live-mutated; `FACTORY_DEFAULTS` applies only at
  first-run and explicit reset.
- Shelly devices always route to `ShellyProvider`.
