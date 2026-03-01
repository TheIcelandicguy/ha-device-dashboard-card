# Shelly Dashboard Card

[![HACS](https://img.shields.io/badge/HACS-Custom-orange)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A Home Assistant Lovelace custom card for Shelly devices — two modes in one package.

## Cards

### `custom:shelly-card` — Single Device
Full control and monitoring panel for one Shelly device.

```yaml
type: custom:shelly-card
device_ip: 192.168.1.100
name: Kitchen Plug
show_power: true
show_temperature: true
```

### `custom:shelly-dashboard-card` — Fleet Dashboard
Auto-discovers all your Shelly devices and shows them in a responsive grid.

```yaml
type: custom:shelly-dashboard-card
columns: 3
show_offline: true
area: stofa
```

## Features

- **All Shelly generations** — Gen1, Gen2, Gen3
- **Relay control** — toggle channels directly from the card
- **Power monitoring** — W, kWh, V, A per channel
- **Temperature** — device temp sensor display
- **Firmware** — version display, update available badge, one-click update
- **Actions** — Reboot (with confirmation), open native Shelly UI
- **Fleet view** — auto-discovers all Shelly devices, filter by area
- **Data sources** — HA entity states + direct local HTTP API + optional Shelly Cloud

## Installation

### HACS (Recommended)
1. Open HACS → Frontend
2. Add custom repository: `https://github.com/TheIcelandicguy/shelly-dashboard-card`
3. Install **Shelly Dashboard Card**
4. Restart Home Assistant

### Manual
1. Download `dist/shelly-dashboard-card.js` from the latest release
2. Copy to `/config/www/shelly-dashboard-card.js`
3. Add resource in Dashboard → Edit → Manage Resources:
   - URL: `/local/shelly-dashboard-card.js`
   - Type: JavaScript Module

## Configuration

### `shelly-card` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `device_ip` | string | — | Shelly device local IP address |
| `entity` | string | — | Optional HA entity to bind for state sync |
| `name` | string | device name | Display name |
| `show_power` | boolean | true | Show power monitoring section |
| `show_temperature` | boolean | true | Show temperature section |
| `show_firmware` | boolean | true | Show firmware section |
| `cloud_server` | string | — | Shelly Cloud server URL |
| `cloud_auth_key` | string | — | Shelly Cloud auth key |

### `shelly-dashboard-card` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `columns` | number | 3 | Number of columns in the grid |
| `show_offline` | boolean | true | Show offline devices (greyed out) |
| `area` | string | — | Filter devices by HA area name |

## Notes

**Direct API calls** (`device_ip`) require your HA frontend to be on the same network as your Shelly devices due to browser CORS restrictions. This works in most home network setups. For remote access, use the Shelly Cloud option instead.

## License
MIT
