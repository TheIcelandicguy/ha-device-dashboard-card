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
npm test          # card logic, palette, config-builder, + the docs checker
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

## Testing without a Home Assistant

`scripts/test-card.mjs` runs the card's logic against fixture `hass` objects —
no browser, no HA. The fixtures deliberately mirror real-world shapes rather
than tidy ones (a device that appears twice in the registry under one MAC, a
Gen1 switch whose channels are all `event.` entities, a device whose input
sensors are tagged `device_class: power`). If you fix a bug, add the shape that
caused it.
