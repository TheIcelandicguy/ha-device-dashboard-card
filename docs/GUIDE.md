# Guide

<!-- Generated from src/help.ts by `npm run docs:guide` — do not edit by hand. -->

How the card fits together. For the exhaustive option list — every key, its scope and its default — see docs/tools/reference.html.

This is the same text as the editor's **? Help** panel.

## How it works

### Why a setting sometimes does nothing

Almost every visual option can be set at several levels, and the most specific one wins. The order is: this device → this device type → this room → this view → the whole card → the built-in default.

That is why a per-device colour beats a room colour, and why a card-wide `tile_style` beats the per-profile defaults that `smart_tile_styles` turns on — the card-wide value is more specific than a built-in default, so smart styles never get a look in. Set styles per device type instead of card-wide if you want both.

Two things sit above all of it: your own Customize tweaks on a tile (stored in this browser, see Local tweaks) and, for blocks, whatever a saved custom style defines.

The editor flags the common cases for you — see Conflicts.

### Discovery: what the card looks at

**Shelly mode** (the default) keeps only Shelly and BTHome devices. Most "my device is missing" reports are simply this.

**Universal mode** discovers every device in Home Assistant, then narrows it three ways: a *scope* (real devices / controllable only / everything), a built-in deny-list of things that are not really devices (phones, browsers, routers, the supervisor), and your own Hide integrations / Hide entity types lists on top.

The two hide lists resolve in opposite directions, which is worth knowing: for domains, excluding wins; for integrations, `include_integrations` is a force-include that overrides the deny-list. That is how you bring one router back without unhiding all of them.

Shelly devices keep their full-fidelity detection in universal mode — model, generation, per-channel merging — so switching modes never downgrades them.

### Profiles, tile styles and blocks are three different things

A **profile** is what the card decides a device *is* — relay, dimmer, cover, sensor, input, and so on — from its entities, refined by Shelly model. It drives the badge, the default chips and the default layout. You can override it per device if the guess is wrong.

A **tile style** is how that device is drawn: the adaptive block tile (`default`), or a purpose-built one (power monitor, light control, climate dial, cover, sensor card, input keypad, scene button).

A **block** is one row of content inside the `default` style only — name row, chips, graph, dimmer, cover controls, and so on. Setting blocks on a device that renders as a power monitor does nothing, because that style does not use blocks; use its Elements instead.

### Blocks, elements and chips — which one hides what

**Blocks** reorder and hide the parts of the `default` tile. **Elements** show and hide the parts of every other style (its toggle, graph, secondary readings…). **Sensor chips** choose which measurements appear as little pills, in any style.

The editor only offers what applies: pick a power-monitor style and the block grid disappears in favour of that style's elements.

The Device styling panel goes further and narrows to the device in front of you — an i4 offers only the chips it can actually produce and the blocks it can actually render. Flip **All options** at the top of that panel if you want the full surface back.

### Input devices have no output

A Shelly i3, i4 or UNI is a wall switch: it reports presses and controls nothing by itself. Nothing in Home Assistant can make it emit a press, so the card cannot "push" a channel for you.

What it can do is run the same thing the physical button runs. Give a channel an action and its row becomes a key: tap toggles an entity or runs a script, hold dims the target light (alternating direction each hold, like a wall dimmer), double-tap runs a second action, and an optional dropdown exposes a `select` entity such as WLED presets.

A key that toggles something lights up while that thing is on, so the tile doubles as a status display. A key that runs a script stays neutral — the card cannot know a script's state and will not pretend to.

Channels you have not wired stay as read-only status rows showing the last event and when it fired, so a half-configured switch shows both.

### Themes and colours

The **theme** is authoritative: every colour comes from the preset you pick. The `style` block holds only colours you deliberately changed on top.

Picking a theme clears those overrides, so the editor offers to save your current colours first — they come back under a ★ Saved entry in the theme picker.

Older configs wrote the whole palette into `style`, which shadowed the theme and made switching it do nothing. Those are migrated automatically on load: a palette that exactly matches a preset collapses back to the theme name, while a partial palette is left alone as the genuine override it is.

### Local tweaks live in your browser

The little Customize panel on a tile — which blocks, which chips, graphs on or off — is deliberately *not* saved to your dashboard. It is stored in the browser you did it in, so you can adjust a tile on your phone without changing what everyone else sees.

The catch: those tweaks sit above the config in every cascade. If a YAML edit seems to be ignored on one device only, that is usually why.

Each tile has a reset in its own Customize panel, and **◆ Defaults → Clear local tweaks** wipes all of them for this browser at once.

### Energy: totals versus windows

By default the energy chip shows a device's lifetime total, straight from its own sensor. Switch it to Today, This week or This month and the card asks the recorder for consumption over that window instead — no helper entities required.

A device with several energy sensors (a Pro 4PM has one per channel) is summed, not sampled, so a multi-channel device is not under-counted.

If you already keep a Utility Meter for a device, point `energy_entity` at it. That replaces the device's own energy chips everywhere — tile, room total and header — so the override never sits next to the raw numbers it stands in for.

### The Conflicts panel

When a setting is overridden or ignored, a badge appears above the editor tabs. It exists because the failure is otherwise silent — the option is valid, it just never applies.

It watches for: a theme its `style` block contradicts, smart tile styles masked by a card-wide style, discovery filters set while in Shelly mode, an integration or domain in both the include and exclude lists, the Native controls block with the feature switched off, a saved style that no longer exists, styling attached to a device or room that is gone, input actions pointing at missing entities, and hide lists that hide absolutely everything.

Nothing there is an error — a stale block is harmless. It is a list of things that are not doing what they look like they are doing.

## Recipes

### Start from scratch

A new card discovers your Shelly and BTHome devices and groups them by room. Everything below is optional.

1. Edit dashboard → Add card → HA Device Dashboard.
2. To include non-Shelly devices: Rooms & devices → Discovery → Universal, then pick a scope. Start with "Real devices".
3. Set the look once under ◆ Defaults (theme, columns, tile size).
4. Use ◆ Defaults → Reset look if you want the factory appearance back without losing rooms, devices or actions.

### Quieten a noisy universal dashboard

Universal mode surfaces everything, including things that are not really devices. Two lists trim it.

1. Rooms & devices → Discovery.
2. Open Hide integrations and tick what you do not want. Use Hide all, then untick the few you do want.
3. Do the same in Hide entity types for whole domains such as update or camera.
4. Still too much? Drop the scope from Everything to Real devices.

### Give one room its own look

Room styling is keyed by the room name, so renaming an area in Home Assistant orphans it — the Conflicts panel will tell you.

1. Card & Theme → scroll to the room picker at the bottom.
2. Pick the room, then set its colours, tile style, columns or backdrop.
3. Anything you leave alone keeps inheriting from the card-wide settings.

### Make an i3 / i4 button control a light

This mirrors the physical button rather than driving it — both paths keep working independently.

1. Device styling → pick the switch → Input actions.
2. For a channel, choose "Toggle entity" and enter the light, e.g. light.hall. Several entities work too, comma separated.
3. Set "On hold" to "Dim the light while held" for a dimmer. Hold brightens, release, hold again darkens.
4. Optionally set a double-tap action, or point the Dropdown field at a select entity such as select.wled_preset.
5. If the switch does not show a keypad, its tile style is set elsewhere — set Device type "Input" to the Inputs style, or use the per-type panel.

### Generate a card from a checklist

✨ Create builds a whole card from what you tick — and rolls one for you if you would rather be surprised. It replaces the entire config, so it saves your outgoing setup first.

1. Toolbar → ✨ Create.
2. Tick what the card should show, pick tile style, size and columns, pick a theme.
3. 🎲 Random fills the checklist from the card's own vocabularies — every roll is a combination that works.
4. ✨ Surprise me does the same but generates a palette from a random hue, contrast-checked so text stays readable.
5. Press Create card. Your previous config is kept in 📂 Load as “Before ✨ Create” if you want it back.

### Save a setup you can get back

Snapshots capture the whole card config. Slots live in this browser; the file export is what moves between devices.

1. Toolbar → 💾 Save → name it.
2. To restore: 📂 Load → pick it from the list.
3. Before anything drastic, use 📂 Load → Export to file and keep the JSON somewhere safe.
4. A config with embedded background photos can outgrow browser storage — if it warns you, use the file export.

### Show media players, locks, fans and vacuums

The card does not draw these itself; it can embed Home Assistant's own controls for them.

1. Card & Theme → Tiles → turn on Native controls.
2. It is off by default because each one embeds a native element, which costs render time on a large media fleet.
3. The controls appear as the "Native controls" block on the default tile style.

### Split a big dashboard into views

Views are tabs inside the card, each with its own filter and layout — useful once one scrolling wall stops being readable.

1. Views → Add view, name it, give it an icon.
2. Filter it by room, device type, or specific devices.
3. Override columns, tile size or tile style per view if that view needs a different density.
4. Pin the handful of devices you touch daily with Favourites, and let a view show only those.
