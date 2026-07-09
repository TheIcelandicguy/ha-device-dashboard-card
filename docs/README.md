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
| `editor-layout.html` | Editor layout designer — drag editor sections between tabs, reorder, and set which are behind the Advanced toggle. Exports a data-driven `editor-layout.ts` (`EDITOR_LAYOUT`) for a future section-registry refactor of `src/editor.ts`. See [editor-layout-designer plan]. |
| `style-presets.html` | Per-tile-style preset designer — for each style (Default/Power/Light/Climate/Cover/Sensor/Scene) toggle its elements, default chips, variant, and (Default style) blocks. Exports a `style_presets` YAML block. Honoured at runtime via the device→area→style-preset→default cascade + `TileCtx.showEl` (see `STYLE_ELEMENTS` in `src/helpers.ts`). |

The tools currently inline their own copy of the data from `card-reference.json` (kept in
sync by hand). A future build step could generate them from the JSON directly.
