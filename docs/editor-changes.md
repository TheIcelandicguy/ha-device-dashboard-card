# Editor changes, before and after

The card gets screenshotted constantly. The **editor** almost never did, so
changes to it shipped on a description — "this is tidier now" — which is an
assertion rather than something you can check. This page is the check: when a
control is added, removed, relabelled or moved, the pair goes here.

Newest first. Each entry names the version it shipped in, the change, and what
to look at — because two screenshots of a dense form do not point at their own
difference.

---

## v1.7.0 — a new "Hold to dim" toggle under Design > Tiles

Narrow tiles (two-plus columns on a phone, or any tile ≤170px) stand the
brightness slider upright, but it is still a thin target to hit with a thumb.
`dimmer_hold` (default off) replaces it with a press-and-hold gesture instead:
hold a dimmable tile for ~450ms, then drag up or down over the tile's height
to set 1–100%, with a percentage overlay while dragging — this turns the light
on if it was off, starting the drag from a nominal 1%. A mouse skips the hold —
clicking and dragging dims immediately. The slider and the gesture are never
shown together.

**What to look at:** the new **Hold to dim** row between **Native controls**
and **Tile size** — same control style as its neighbours (a labelled toggle
with a one-line hint), off by default.

| Before | After |
|---|---|
| ![Hold to dim toggle off](images/editor/v1.7.0-hold-to-dim-before.png) | ![Hold to dim toggle on](images/editor/v1.7.0-hold-to-dim-after.png) |

---

## v1.6.1 — "All" in a view filter now means all

A view's **Filter** offers pills for profiles, entity domains, integrations and
rooms. Ticking them all was supposed to be the same as filtering by nothing.
It wasn't: the pill lists were hand-written and had drifted behind the code, so
"All" selected a subset and quietly hid every device of a kind that had no pill.

**What to look at:**

- The header above the pills. **`FILTER (EMPTY = ALL DEVICES)`** → **`FILTER —
  PICK WHAT TO INCLUDE. A GROUP WITH NOTHING PICKED INCLUDES ALL OF IT.`** The
  old wording said what an *empty* group does and left the direction of a
  *filled* one to be guessed — and it was guessed backwards, as an exclude list.
- The **PROFILES** row. 12 pills before, 15 after: `lock`, `media` and `generic`
  were missing, so a fully-ticked filter excluded every device of those kinds.
- Not visible here: **entity domains** had 10 of 21. That group sits behind the
  **Advanced** toggle, which is off in both shots.

Both lists now derive from the source of truth — `ALL_PROFILES` (the
`PROFILE_LABELS` keys) and `ALL_DEVICE_DOMAINS` (the `DEVICE_DOMAINS` set) in
`src/helpers.ts` — so a pill cannot go missing again, and `npm run test:card`
asserts that every pill ticked matches exactly what no filter matches.

| Before | After |
|---|---|
| ![Views tab before](images/editor/v1.6.1-view-filter-before.png) | ![Views tab after](images/editor/v1.6.1-view-filter-after.png) |

---

## How to capture a pair

The editor is a custom element, so it renders headlessly without a dashboard
around it:

```js
const ed = document.createElement('ha-device-dashboard-editor');
ed.hass = hass;
ed.setConfig(config);
document.body.appendChild(ed);
await ed.updateComplete;
ed._tab = 'views';                     // 'devices' | 'views' | 'design' | 'graphs' | 'yaml'
// accordions start closed — click the section header to open one
ed.shadowRoot.querySelectorAll('.sec-hdr')[0].click();
```

Drive it through the DevTools Protocol the same way `.tmp-shoot.mjs` drives the
card: seed `hassTokens` in localStorage on the HA origin from `.ha-token`, then
`Page.captureScreenshot` with a clip once `updateComplete` has resolved.

Three things that are easy to get wrong:

- **Take the *before* shot first**, against the bundle as it is now. Once the
  edit is made it is gone, and reconstructing it from an old `dist/` is work.
- **Use the same viewport and the same config for both**, or the diff is buried
  under reflow. Crop both to one height.
- **Read the frame before committing it.** These go in a public repo — room and
  device names are fine, an IP or a notification is not.

Images live in `docs/images/editor/`, named
`v<version>-<subject>-{before,after}.png`.
