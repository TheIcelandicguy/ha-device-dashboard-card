# Contributing

## Getting set up

```bash
npm ci
npm run build     # bundles to dist/ (and copies to Z:\www\community\… if mapped)
npm run watch     # rebuild on change
```

`dist/ha-device-dashboard.js` is **committed** — it is what HACS serves. Build
and commit it with your change, or CI will fail on a stale bundle.

## Before opening a PR

```bash
npm run typecheck
npm run lint
npm test          # card logic, detection, palette, config-builder, + the docs checker
npm run check:docs
```

CI runs all of these plus a build and a stale-`dist` check.

## The house rules, learned the hard way

- **`src/types.ts` is the source of truth** for the config surface. `docs/` is
  hand-synced and drifts, which is what `npm run check:docs` is for. Add a key
  and it will tell you what you forgot — including `helpers.CONFIG_KEYS`, which
  drives the editor's "the card does not read this" warning.
- **`docs/GUIDE.md` is generated** from `src/help.ts` by `npm run docs:guide`.
  Never edit the markdown.
- **Cascades belong in `src/cascade.ts`**, as pure functions. They used to be
  methods on the card element, which made them untestable without a DOM — and
  the renderer and the Customize panel silently drifted apart for weeks as a
  result.
- **A check that cannot fail is worse than no check.** Two checks in this repo
  passed for months while matching nothing (a CRLF-blind regex, and one that
  required `interface X {` where the interface had an `extends` clause). If you
  add a guard, break it on purpose once and watch it fail.
- **Measure before optimising.** `npm run bench` times discovery, the fleet
  summaries and the cascades. The summaries were once "the first thing I'd
  memoise" and turned out to cost 0.18 ms for 56 devices.

## Adding a language

The card renders in whatever language Home Assistant reports (`hass.language`),
falling back to English. Only the **dashboard** is translated — tiles, chips,
the header, Needs attention, the detail sheet. The GUI editor is deliberately
English: it is ~600 strings, most of them explanatory paragraphs, and the person
configuring a card chose English in a way the family reading it did not.

To add one:

1. Copy `src/translations/en.ts` to `src/translations/<code>.ts`, where `<code>`
   is the language code HA uses (`de`, `pt-BR` → use `pt` unless you mean the
   region specifically; a region falls back to its base language automatically).
2. Translate the **values**. Never the keys.
3. Register it in `LOCALES` in `src/localize.ts`.
4. `npm run test:card`.

What the tests enforce, so you find out now rather than from a screenshot:

- **Key parity, both ways.** A key English has and yours lacks fails; so does a
  key yours has and English lacks. This is what stops a locale rotting quietly
  as strings are added.
- **Placeholders survive.** `{n}`, `{name}` and friends must appear in your
  string too — drop one and the value it carried vanishes with it.

Three things worth knowing before you start:

- **`chip.*` values are abbreviations on purpose.** They render inside a tile
  chip a few characters wide. Translate the *abbreviation*, not the term, or it
  will clip. `pm.*`, `graph.*` and `detail.*` are full words — there is room.
- **One key per use site, not per word.** `detail.sensor_current` is electrical
  current; `detail.climate_current` is the current *temperature*. They collide
  in English and almost nowhere else.
- **Some English strings are not labels and have no key** — product names, units
  and protocol names (Shelly, Wi-Fi, MQTT, dBm, SSID), HA state strings the card
  matches on (`unavailable`), light effect names HA reports (`Solid`), and
  `'No Area'`, which is the `area_styles` config key for the unassigned bucket
  as well as a label. Translating any of those breaks behaviour rather than
  improving it.

## Cutting a release

1. `CHANGELOG.md`: turn **Unreleased** into `## vX.Y.Z — YYYY-MM-DD`.
2. `package.json`: bump `version` to match. `npm run check:docs` fails if the two
   disagree, or if `OVERVIEW.md` still names the old one.
3. `src/index.ts`: set a fresh `BUILD_TAG`, then `npm run build`.
4. Commit, tag `vX.Y.Z`, push both.
5. `gh release create vX.Y.Z --notes-file ...`
6. Nothing — `.github/workflows/release-asset.yml` attaches the bundle for you
   when the release is published.

**Why step 6 is automated rather than a checklist item.** HACS downloads a
release asset whose name equals `hacs.json`'s `filename`; with no asset it falls
back to the file in the repo tree. The card installs fine either way, so a
missing asset looks like nothing at all — but GitHub counts only *asset*
downloads, so the install is never counted and the download badge quietly stops
moving. A failure with no symptom is a bad fit for a list you read once a
release. (This is also why several very popular cards report 0 downloads in
HACS: they ship from the repo root. Download counts are not comparable between
cards.)

The workflow checks out **the tag**, not the branch, and rebuilds to prove the
committed `dist/` really is what that tag's `src/` produces before uploading. If
you ever do it by hand — backfilling an old release, say — extract from the tag
for the same reason: after a release the working copy usually carries a newer
`BUILD_TAG`, and uploading that would put a different build behind the released
version's name. `workflow_dispatch` on that workflow does the backfill for you.

## Testing without a Home Assistant

`scripts/test-card.mjs` runs the card's logic against fixture `hass` objects —
no browser, no HA. The fixtures deliberately mirror real-world shapes rather
than tidy ones (a device that appears twice in the registry under one MAC, a
Gen1 switch whose channels are all `event.` entities, a device whose input
sensors are tagged `device_class: power`). If you fix a bug, add the shape that
caused it.

## Device detection fixtures

`npm run test:detection` is separate, and works differently. It runs
`getDeviceProfile` and `detectShellyGen` over **real registry rows** in
`scripts/fixtures/detection-devices.json` — 215 of them, harvested from a live
instance across 30-odd integrations and deduplicated to one exemplar per hardware
shape.

It exists because hand-written fixtures pin the rules someone thought to write
down, which is exactly the set that does not contain the bugs. Both detection
bugs found so far came from looking at real device data: a `/^sh/i` rule that
matched every device named "Shelly…", and the BLU Gateway — a mains WiFi Gen3
unit whose name says Bluetooth — resolving to `ble`.

**`detection-expected.json` records what the code does today, not what is
correct.** A failure means detection changed. Read the diff and decide:

```bash
npm run test:detection            # compare
npm run test:detection -- --bless # re-record, once you have decided the change is right
```

Rows carrying a `why` are different: someone checked those against real hardware,
and the suite reports a change to one as a **regression** rather than a drift. Add
a `why` when you fix a detection bug — it is the part `--bless` preserves and the
part a machine cannot regenerate.

### Contributing fixtures for hardware we do not own

This is the most useful thing you can send. Run:

```bash
HA_URL=http://your-ha:8123 HA_TOKEN=... npm run fixtures:harvest
```

**Read the diff before you commit it.** The file is published. The harvester
replaces MACs, IPs and long hex instance ids with stable fakes, drops
configuration URLs, identifiers and serial numbers, drops every attribute except
`device_class`, and keeps device names only for `shelly` / `bthome` — the
integrations whose detection reads them. Everything else is renamed after its
model, because a phone is usually named after its owner. That is thorough, not
exhaustive: a Shelly you named after someone will still come through.

One gotcha if you write a detection test by hand: `detectShellyGen` is never
handed a display name. Both call sites pass `device.model ?? ''`, so the "name"
its comments describe is the model string, and passing a device name tests a path
production cannot reach.
