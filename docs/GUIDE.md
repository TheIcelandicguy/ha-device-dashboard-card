# Guide

<!-- Generated from src/help.ts by `npm run docs:guide` — do not edit by hand. -->

How the card fits together. For the exhaustive option list — every key, its scope and its default — see docs/tools/reference.html.

This is the same text as the editor's **? Help** panel.

## How it works

### Why a setting sometimes does nothing

Almost every visual option can be set at several levels, and the most specific one wins. The order is: this device → this device type → this room → this view → the whole card → the built-in default.

That is why a per-device colour beats a room colour, and why a card-wide `tile_style` beats the per-profile defaults that `smart_tile_styles` turns on — the card-wide value is more specific than a built-in default, so smart styles never get a look in. Set styles per device type instead of card-wide if you want both.

For blocks there is one extra rung: a saved custom style's own layout sits above the room and card-wide values, since choosing a saved look is more deliberate than leaving the global default in place.

The editor flags the common cases for you — see Conflicts.

### Where a setting lives

Everything about how the card looks is in one tab: **Design**. It is *scope-first* — you pick **where** you are editing, and the same control list redraws for that layer. Global, a view, a room, a device type, or one device.

Pick the scope in the map at the top. Devices are grouped by room, type or integration; room and type headings are clickable because they are layers you can style, while an integration is only a way to find a device. The number on a chip is how many settings that layer overrides, so you can see where customisation lives without opening everything.

Every control says where its value is coming from — **set here**, with a ↺ to drop it, or **from Room · Kitchen** / **from Card**. Most specific wins, always.

What you can set depends on the layer, and the tab says why. There are three groups. **Tile** settings — theme, colour, tile style, blocks, chips, graphs, energy window — can be set anywhere: device, type, room, view, card. **Container** settings — columns, tile size, gap — stop at the room, because a grid needs something to hold it and one device has no column count. **Card chrome** — the header, the card surface, typography — only a view or the card can set, because a room does not contain the card's header.

Global also holds the settings that have nothing under them at all: the theme picker, chips & metrics, tiles, the sensor-chip groups, and the card's own header and type.

### Global defaults vs. per-room overrides

The **Chips & metrics** section in Design (at Global scope) sets three things card-wide: which chips each room header shows, which window the energy readout totals (Total / Today / Week / Month), and which sensor chips appear on tiles. Treat it as the first stop — decide what data is on show, then style it.

These are *defaults*. Every room and device inherits them, but any room or device can override any of them — by picking that room or device as the scope in Design — and the moment it does, it stops listening to the global. A global toggle only moves scopes that are still inheriting: turning a chip on globally will **not** turn it on in a room that has set its own chips, and turning it off will not turn it off there.

Each picker tells you which state it is in. **Inheriting from …** means a global change still reaches it; **Custom selection** means it is pinned to its own value. Setting a room or device to an empty selection is itself a custom choice ("show none"), not the same as inheriting.

To hand control back to the global default, use that scope's reset — `↺ Default` for room header chips, `↺ Inherit` for the chip pickers. Room header chips resolve room → global → built-in; energy and sensor chips also allow a per-device override (and, for sensor chips, a per-type one) in front of the room.

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

Design narrows to whatever scope you pick: choose one device and it offers only the chips that device can produce and the blocks it can render — an i4 offers only the chips it can actually produce and the blocks it can actually render. Flip **All options** at the top of that panel if you want the full surface back.

### Input devices have no output

A Shelly i3, i4 or UNI is a wall switch: it reports presses and controls nothing by itself. Nothing in Home Assistant can make it emit a press, so the card cannot "push" a channel for you.

What it can do is run the same thing the physical button runs. Give a channel an action and its row becomes a key: tap toggles an entity or runs a script, hold dims the target light (alternating direction each hold, like a wall dimmer), double-tap runs a second action, and an optional dropdown exposes a `select` entity such as WLED presets.

A key that toggles something lights up while that thing is on, so the tile doubles as a status display. A key that runs a script stays neutral — the card cannot know a script's state and will not pretend to.

Channels you have not wired stay as read-only status rows showing the last event and when it fired, so a half-configured switch shows both.

### What counts as a light

The **Lights** header chip counts `light` entities that are on. A relay or plug wired to a lamp is a `switch` as far as Home Assistant is concerned — it has no way to know what is on the other end of the wire, and neither does the card.

You do. Label those devices in Home Assistant (Settings → Areas & labels), then tick the label under **Header → What counts as a light**. Every `switch` on a labelled device is counted from then on. The picker only offers labels that exist on your devices, with how many carry each.

For the stragglers a label does not cover, name entities directly in the same panel. A device caught by both routes is still counted once.

### Themes and colours

The **theme** is authoritative: every colour comes from the preset you pick. The `style` block holds only colours you deliberately changed on top.

**Follow HA** is the exception: instead of a palette it points every colour at Home Assistant’s own theme variables, so the card matches whatever HA theme is active and follows it into light or dark. Available per card, per view and per room like any other theme.

Picking a theme clears those overrides, so the editor offers to save your current colours first — they come back under a ★ Saved entry in the theme picker.

Older configs wrote the whole palette into `style`, which shadowed the theme and made switching it do nothing. Those are migrated automatically on load: a palette that exactly matches a preset collapses back to the theme name, while a partial palette is left alone as the genuine override it is.

A **view** and a **room** can each take a theme of their own, resolved room → view → card. A view theme repaints the whole card, header included, while that view is showing, and outranks the colours in `style`. A room theme repaints what the room contains — its block background, tiles, text, accent and its own header — but not the card header, which no room encloses; the room's individual colour fields still override it key by key.

### Energy: totals versus windows

By default the energy chip shows a device's lifetime total, straight from its own sensor. Switch it to Today, This week or This month and the card asks the recorder for consumption over that window instead — no helper entities required.

A device with several energy sensors (a Pro 4PM has one per channel) is summed, not sampled, so a multi-channel device is not under-counted.

If you already keep a Utility Meter for a device, point `energy_entity` at it. That replaces the device's own energy chips everywhere — tile, room total and header — so the override never sits next to the raw numbers it stands in for.

### Needs attention

A fifty-device dashboard hides its own problems — three offline devices among fifty tiles is something you scroll past. The summary above the rooms answers the question the tiles cannot: which ones.

It lists offline devices, firing alerts, flat batteries and pending updates, worst first. Each row opens that device. It is invisible when nothing qualifies, so it costs nothing on a good day.

An offline device is reported as offline and nothing else — its last alert reading is stale, not news.

The firmware block groups the fleet by version and marks the newest, so a device left behind on an old build is obvious. It appears only when more than one version is running.

**Beta firmware does not count as an update.** A Shelly exposes a `beta_firmware` entity that is on nearly permanently — on one real fleet that was 21 of 25 "available updates". Turn on `include_beta_updates` if you actually run betas.

### The Conflicts panel

When a setting is overridden or ignored, a badge appears above the editor tabs. It exists because the failure is otherwise silent — the option is valid, it just never applies.

It watches for: a theme its `style` block contradicts, smart tile styles masked by a card-wide style, discovery filters set while in Shelly mode, an integration or domain in both the include and exclude lists, the Native controls block with the feature switched off, a saved style that no longer exists, styling attached to a device or room that is gone, input actions pointing at missing entities, hide lists that hide absolutely everything, keys the card does not read at all, and an input action whose channel has been renamed out from under it.

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

### Import your Shelly app setup

Coming from the Shelly app? The card can pull each room's photo and the official product image for every device from your Shelly Cloud account. The auth key is used for the one fetch and never saved; imported images stay hosted on Shelly's cloud.

1. Get your key: control.shelly.cloud → user settings → Authorization cloud key. Note the server shown next to it.
2. Rooms & devices → Import from Shelly Cloud → paste both → Fetch my Shelly setup.
3. Pair any cloud rooms that did not auto-match with a room here (name matching ignores accents).
4. Pick what to import — room photos, product images on tiles, full-size vs thumbnails — and Apply.
5. A custom room photo's cloud URL is unlisted but not private. Swap in a /local/… photo later if that matters.
6. To invalidate a key you have shared or leaked, change your Shelly account password — the key only rotates with it.

### Give one room its own look

Room styling is keyed by the room name, so renaming an area in Home Assistant orphans it — the Conflicts panel will tell you.

1. Design → Scope → pick the room (or expand it to reach one device).
2. Pick the room, then set its colours, tile style, columns or backdrop.
3. Anything you leave alone keeps inheriting from the card-wide settings.

### Make an i3 / i4 button control a light

This mirrors the physical button rather than driving it — both paths keep working independently.

1. Design → Scope → expand a room → pick the switch → Input actions.
2. For a channel, choose "Toggle entity" and enter the light, e.g. light.hall. Several entities work too, comma separated.
3. Set "On hold" to "Dim the light while held" for a dimmer. Hold brightens, release, hold again darkens.
4. Optionally set a double-tap action, or point the Dropdown field at a select entity such as select.wled_preset.
5. If the switch does not show a keypad, its tile style is set elsewhere — set Device type "Input" to the Inputs style, or use the per-type panel.

### Roll a colour scheme

The theme picker can roll a look for you, and keep the ones you like as named palettes.

1. Design → Colour theme. Global sets the card; pick a view, room, type or device first to set one just there.
2. 🎲 Random lands on one of the built-in presets.
3. ✨ Surprise me generates a palette from a random hue instead. Every text colour is contrast-checked against the surface behind it, so a roll is never unreadable.
4. 💾 Save keeps the colours you are looking at under a name — including a preset you have tweaked. Saved palettes appear as ★ swatches in the picker; ✕ on a swatch forgets it.
5. Rolling stashes the current colours as “Before roll” first, and picking a preset stashes them as “Before theme change”, so neither is a one-way door.

### Save a setup you can get back

Snapshots capture the whole card config. Slots live in this browser; the file export is what moves between devices.

1. Toolbar → 💾 Save → name it.
2. To restore: 📂 Load → pick it from the list.
3. Before anything drastic, use 📂 Load → Export to file and keep the JSON somewhere safe.
4. A config with embedded background photos can outgrow browser storage — if it warns you, use the file export.

### Show media players, locks, fans and vacuums

The card does not draw these itself; it can embed Home Assistant's own controls for them.

1. Design → Tiles (Global scope) → turn on Native controls.
2. It is off by default because each one embeds a native element, which costs render time on a large media fleet.
3. The controls appear as the "Native controls" block on the default tile style.

### Split a big dashboard into views

Views are tabs inside the card, each with its own filter and layout — useful once one scrolling wall stops being readable.

1. Views → Add view, name it, give it an icon.
2. Filter it by room, device type, or specific devices.
3. Override columns, tile size or tile style per view if that view needs a different density.
4. Pin the handful of devices you touch daily with Favourites, and let a view show only those.
