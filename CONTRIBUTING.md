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

## Testing without a Home Assistant

`scripts/test-card.mjs` runs the card's logic against fixture `hass` objects —
no browser, no HA. The fixtures deliberately mirror real-world shapes rather
than tidy ones (a device that appears twice in the registry under one MAC, a
Gen1 switch whose channels are all `event.` entities, a device whose input
sensors are tagged `device_class: power`). If you fix a bug, add the shape that
caused it.
