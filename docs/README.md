# Card reference & config tools

Documentation and offline design tools for the **`custom:ha-device-dashboard`** card.

## `card-reference.json` — the single source of truth

A machine-readable model of the card's entire config surface, generated from
`src/editor.ts`, `src/helpers.ts`, and `src/themes.ts`:

- **`defaults`** — the actual runtime default values (what a bare card renders as).
- **`firstRun`** — the first-run defaults, human-readable, with their code source.
- **`profiles`** — the 13 device profiles, each with badge, smart tile style, and default sensor chips.
- **`profileBlockOrder`** — the default tile block order per profile.
- **`themes`** — the 7 colour presets with full palettes.
- **`headerChips`, `sensorGroups`, `tileStyles`, `tileBlocks`** — the pickable vocabularies.
- **`editorTabs`** — every editor control (5 tabs + Defaults panel + toolbar): function, config key, scope, default, advanced flag.
- **`scopes` / `cascade`** — the resolution order (device → room → view → global → profile default).

Every tool below reads from this file's data model. **Keep it in sync** when the card's
config surface changes.

## `tools/` — offline, self-contained HTML tools

Open any of these directly in a browser (no build, no server, no network):

| File | What it does |
|------|--------------|
| `reference.html` | Interactive reference — every default and every editor control, filterable, with scope pills. |
| `config-builder.html` | Build the card's first-run defaults (theme, layout, header chips via drag-and-drop, sensor chips). Imports existing YAML; exports minimal YAML. |
| `profile-tiles.html` | Per-profile tile designer — drag tile blocks and pick default chips per device profile. Exports the `PROFILE_DEFAULT_BLOCKS` / `PROFILE_DEFAULT_SENSORS` / `PROFILE_DEFAULT_TILE_STYLE` constants for `src/helpers.ts`. |

The tools currently inline their own copy of the data from `card-reference.json` (kept in
sync by hand). A future build step could generate them from the JSON directly.
