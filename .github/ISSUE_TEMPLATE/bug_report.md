---
name: Bug report
about: Something renders wrong, a control misbehaves, or a device is missing
labels: bug
---

**Before anything else — confirm which build you are actually running.**
The single most common "bug" is a stale cached bundle: open the browser
console (F12) and find the `ha-device-dashboard` build-tag line printed on
load. If it doesn't change after you update, hard-refresh (Ctrl+Shift+R) and
check the Lovelace resource URL's `?v=` cache-buster before filing.

**Build tag** (from the console):

**Home Assistant version** (Settings → About):

**How the card is configured**
Discovery mode (`shelly` default / `universal`), and the relevant YAML —
the editor's YAML tab has a Copy button. Trim device IDs if you prefer.

```yaml

```

**What happens, and what you expected**
Screenshots help enormously — this is a visual card.

**Device(s) involved** (model / integration), if the issue is per-device:

**Notes**
- "My device is missing" is usually the default Shelly-only discovery mode —
  try `mode: universal` before filing.
- Browser + platform (desktop / mobile, light / dark theme) if it looks
  layout- or colour-related.
