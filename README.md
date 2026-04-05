# HA Device Dashboard

[![HACS](https://img.shields.io/badge/HACS-Custom-orange)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-2.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A Home Assistant Lovelace custom card that auto-discovers all your Shelly devices and displays them in a live, interactive fleet dashboard.

![Dashboard preview](docs/preview.png)

---

## Features

- **Auto-discovery** — finds all Shelly devices registered in HA, no manual list required
- **All device types** — relay, plug, dimmer, RGB/RGBW, roller/cover, valve, sensor, input (i3/i4), TRV, Wall Display, energy monitor
- **All generations** — Gen1, Gen2, Gen3, BLE
- **Area grouping** — devices grouped by HA area with collapsible sections
- **Tile controls** — toggle switches, dimmers, covers, valves directly from the tile
- **Sensor chips** — key sensor readings (temperature, power, humidity …) shown as compact chips at the top of every tile
- **Expanded detail** — click a tile to open an inline panel directly below that tile row, showing all channels, sensors, firmware version, IP, RSSI, uptime and more
- **Sparkline graphs** — per-metric labeled line graphs with time axis, peak/min markers, interactive hover tooltip and dotted tick grid
- **Power bar** — mini wattage indicator at the bottom of each tile
- **Bulk actions** — select multiple tiles and toggle them together
- **Sensor filtering** — choose which electrical, environmental, and alert sensors are shown
- **Tile style** — solid, semi-transparent, or fully transparent tile/card backgrounds
- **Per-area styling** — custom colors, fonts, backgrounds, tile colors, column counts per room
- **Sort & filter** — sort by name, power, or online status; filter by area
- **HA Sections view** — fully responsive with CSS container queries
- **Visual editor** — full GUI config editor with accordion sections, no YAML required

---

## Installation

### HACS (Recommended)

1. Open HACS → Frontend
2. Click the three-dot menu → **Custom repositories**
3. Add: `https://github.com/TheIcelandicguy/shelly-dashboard-card` — Category: **Lovelace**
4. Install **Shelly Dashboard Card**
5. Reload the browser

### Manual

1. Download `dist/ha-device-dashboard.js` from the latest release
2. Copy to `/config/www/ha-device-dashboard.js`
3. Go to **Dashboard → Edit → Manage Resources** and add:
   - URL: `/local/ha-device-dashboard.js`
   - Type: JavaScript Module

---

## Basic Configuration

```yaml
type: custom:shelly-dashboard-card
```

That's it — the card auto-discovers everything. Add options to customise:

```yaml
type: custom:shelly-dashboard-card
columns: 3
show_offline: true
tile_style: semi
areas:
  - Living Room
  - Kitchen
sensors:
  - power
  - temperature
  - battery
sort_by: power
graph_sensors:
  - power
  - temperature
graph_hours: 24
```

---

## Configuration Reference

### Top-level options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `columns` | number | `3` | Global tile columns per row (1–6) |
| `show_offline` | boolean | `true` | Show offline devices (greyed out) |
| `include_all` | boolean | `false` | Show all HA devices, not just Shelly |
| `hide_shelly` | boolean | `false` | Hide Shelly devices (use with `include_all`) |
| `areas` | string[] | all | Filter to specific HA area names |
| `sensors` | string[] | all | Which sensor types to display (see below) |
| `sort_by` | string | `name` | Sort tiles: `name`, `power`, `online` |
| `view_mode` | string | `grid` | `grid` or `list` |
| `tile_size` | string | `md` | Tile size: `sm`, `md`, `lg` |
| `tile_click` | string | `expand` | Tile click action: `expand` or `toggle` |
| `tile_style` | string | `semi` | Tile background: `solid`, `semi`, or `transparent` |
| `show_power_bar` | boolean | `false` | Mini wattage bar at tile bottom |
| `power_bar_max` | number | `2000` | Watts at 100% fill |
| `show_glow` | boolean | `true` | Pulsing glow on active tiles |
| `hidden_devices` | string[] | `[]` | Device IDs to hide |
| `graph_sensors` | string[] | `[]` | Sensor types to show as sparkline graphs |
| `graph_hours` | number | `24` | History window in hours (1–168) |
| `area_styles` | object | — | Per-area visual overrides (see below) |
| `device_styles` | object | — | Per-device accent colour (keyed by `device_id`) |

### Sensor types

Pass any combination of these in the `sensors` array:

| Category | Keys |
|----------|------|
| Electrical | `power`, `apparent_power`, `reactive_power`, `power_factor`, `frequency`, `energy`, `voltage`, `current` |
| Environmental | `temperature`, `humidity`, `illuminance`, `co2`, `gas` |
| Device | `battery`, `rssi`, `uptime`, `ip`, `ssid`, `fw_version`, `mac`, `cloud`, `mqtt`, `eth` |
| Alerts | `motion`, `door`, `flood`, `smoke`, `vibration`, `overpower`, `overtemp` |

### Tile style (`tile_style`)

Controls how tile and card backgrounds look:

| Value | Description |
|-------|-------------|
| `solid` | Opaque tile panels — clearly distinct from the card background |
| `semi` | Subtle glass/frosted effect (default) |
| `transparent` | Fully transparent — card, header, and tiles all show through to the dashboard background |

### Graphable types (`graph_sensors`)

```yaml
graph_sensors:
  - temperature
  - power
  - current
  - humidity
  - voltage
  - energy
  - apparent_power
  - illuminance
  - carbon_dioxide
  - battery
graph_hours: 24
```

Each selected type renders as its own labeled sparkline row. Features:
- **Time axis** — HH:MM labels at start, midpoint, and now
- **Dotted tick grid** — vertical guide lines at start/mid/end; horizontal dashed baseline where dash spacing = 1 minute (≤1 h), 2 minutes (1–5 h), or 5 minutes (>5 h)
- **Peak/min markers** — orange dot at highest value, muted dot at lowest
- **Interactive hover** — mouse over any point to see the exact value and timestamp
- **Expanded view** — clicking a tile opens a taller, wider graph panel directly below the tile row
- **Retry** — each graph row with no history shows a ↺ button; the expanded panel has a "Refresh graphs" button to re-fetch all at once

### Area styles (`area_styles`)

```yaml
area_styles:
  Living Room:
    bgColor: "#1a1a2e"
    headerBgColor: "#e65c00"
    headerBgColor2: "#f9d423"
    headerBgDir: "to right"
    headerTextColor: "#ffffff"
    fontSize: 13
    fontWeight: bold
    borderColor: "#e65c00"
    borderRadius: 12
    boxShadow: medium
    tileBgColor: "#16213e"
    tileBorderColor: "#e65c00"
    columns: 4
  Kitchen:
    bgColor: "#0f3460"
    columns: 2
```

| Style option | Type | Description |
|---|---|---|
| `bgColor` | string | Area background colour |
| `bgImage` | string | Image URL or base64 as background |
| `bgImageSize` | string | `contain`, `cover`, or `stretch` |
| `borderColor` | string | Area section border colour |
| `borderWidth` | number | Border width in px |
| `borderRadius` | number | Border radius in px (0–32) |
| `borderStyle` | string | `solid`, `dashed`, or `dotted` |
| `headerBgColor` | string | Area header background (or gradient start) |
| `headerBgColor2` | string | Gradient end colour |
| `headerBgDir` | string | CSS gradient direction, e.g. `to right`, `135deg` |
| `headerTextColor` | string | Area name text colour |
| `fontSize` | number | Area name font size in px |
| `fontWeight` | string | `normal` or `bold` |
| `fontStyle` | string | `normal` or `italic` |
| `tileBgColor` | string | Override tile background colour in this area |
| `tileBorderColor` | string | Override tile border colour in this area |
| `columns` | number | Override column count for this area (1–6) |
| `boxShadow` | string | `none`, `soft`, `medium`, or `strong` |

---

## Visual Editor

The card ships with a full GUI editor. Open it via **Edit Dashboard → Add Card → Shelly Dashboard Card → Configure**.

The editor is split into accordion sections:

- **Rooms to display** — pick which HA areas to show
- **Electrical** — toggle individual electrical sensors
- **Environmental** — toggle environmental sensors
- **Devices** — toggle device-level sensors
- **Alerts** — toggle alert sensors
- **Graphs** — pick which sensor types render as sparkline graphs + set the time window
- **Room Styles** — tile style (solid/semi/transparent) + per-area colour, font, tile, and layout overrides
- **Hidden Devices** — click devices to hide/unhide
- **Layout** — columns, offline visibility, include-all toggle

---

## Device type support

| Type | Tile shows | Controls |
|------|-----------|----------|
| Relay | Channel states, power | Toggle per channel |
| Plug | Power, energy | Toggle |
| Dimmer | Brightness % | Slider |
| RGB / RGBW | Color mode, brightness | Toggle |
| Cover / Roller | Position % | Open / Stop / Close + position slider |
| Valve | Position % | Open / Stop / Close + position slider |
| Energy monitor | Power, voltage, current, energy | — |
| Sensor (H&T, Flood…) | Temperature, humidity, battery, alert states | — |
| Input (i3, i4, BLU) | Per-channel state chips | — |
| TRV | Temperature setpoint | — |

---

## License

MIT
