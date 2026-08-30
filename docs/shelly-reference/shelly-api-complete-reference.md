# Shelly Gen2+ API — Complete Services & Components Reference
## Supplement to the Virtual Components & Integration Strategy Guides

*Sourced from shelly-api-docs.shelly.cloud — the official Shelly Technical Documentation*

---

## Documentation Structure Overview

The Shelly API docs at `shelly-api-docs.shelly.cloud` contain 5 separate documentation sites:

| Site | Covers | Protocol |
|------|--------|----------|
| **Gen1 Device API** | Shelly 1, 2.5, Dimmer2, RGBW2, Plug S, EM, 3EM, i3, etc. | HTTP REST + CoAP/CoIoT |
| **Gen2+ Device API** | Plus, Pro, Gen3, Gen4, Wall Display, BLU Gateway | JSON-RPC 2.0 (HTTP/MQTT/WS) |
| **BLU Devices** | BLU Button, Motion, H&T, Door/Window, TRV, RC Button | BLE (BTHome protocol) |
| **Integrator API** | Cloud-to-cloud for 3rd party platform integration | HTTPS REST |
| **Cloud Control API** | Shelly Cloud server-side device management (v2) | HTTPS REST |

---

## Gen2+ API: All Components & Services

Every Gen2+ device exposes a subset of the following 35 components/services. Each device page in the docs lists exactly which ones it supports.

### Services (no physical hardware)

| Service | RPC Namespace | Purpose | Limits |
|---------|---------------|---------|--------|
| **Shelly** | `Shelly` | Device info, profiles, reboot, OTA, GetStatus/GetConfig for all components | — |
| **Schedule** | `Schedule` | Cron-based timed execution of RPC methods | 20 jobs/device, 5 calls/job |
| **Webhook** | `Webhook` | Event-triggered HTTP requests with conditions and token replacement | 20 hooks/device (10 for battery) |
| **HTTP** | `HTTP` | Send outbound HTTP/HTTPS GET/POST requests from device | — |
| **KVS** | `KVS` | Key-value persistent storage accessible via RPC | 50 keys, key ≤42 chars, value ≤253 chars |
| **Script** | `Script` | Manage on-device mJS scripts (create, start, stop, upload code) | 10 scripts max |

### System & Connectivity

| Component | RPC Namespace | Purpose |
|-----------|---------------|---------|
| **System** | `Sys` | Device time, timezone, geolocation, ECO mode, logs, OTA, reboot scheduling |
| **WiFi** | `WiFi` | STA/AP config, roaming, scan, static IP |
| **Ethernet** | `Eth` | Wired LAN (Pro devices only) |
| **BLE** | `BLE` | Bluetooth Low Energy observer/scanner, proxy config |
| **Cloud** | `Cloud` | Shelly Cloud connection status and enable/disable |
| **MQTT** | `MQTT` | MQTT broker config, TLS/mTLS, topic prefix, status/control topics |
| **Outbound WebSocket** | `Ws` | Persistent WS connection to external server |
| **Zigbee** | `Zigbee` | Zigbee radio config (Gen4 only) |
| **Matter** | `Matter` | Matter commissioning and factory reset (Gen3/Gen4 with Matter firmware) |

### Functional Components (hardware-backed)

| Component | RPC Namespace | Purpose | Key status fields |
|-----------|---------------|---------|-------------------|
| **Input** | `Input` | Physical button/switch inputs | `state`, button events (single/double/long/triple push) |
| **Switch** | `Switch` | Relay outputs (on/off) | `output`, `apower`, `voltage`, `aenergy`, `temperature` |
| **Light** | `Light` | Dimmable outputs | `output`, `brightness`, `transition_duration` |
| **RGB** | `RGB` | RGB LED control | `output`, `rgb` [r,g,b], `brightness` |
| **RGBW** | `RGBW` | RGBW LED control | `output`, `rgb`, `white`, `brightness` |
| **CCT** | `CCT` | Correlated Color Temperature light | `output`, `brightness`, `ct` |
| **Cover** | `Cover` | Roller shutters/blinds | `state` (open/closed/opening/closing/stopped), `current_pos`, `apower` |
| **Voltmeter** | `Voltmeter` | Analog voltage input (Plus Uni, Plus Add-on) | `voltage` |
| **Modbus** | `Modbus` | MODBUS-RTU via UART (The Pill) | — |

### Sensor Components

| Component | RPC Namespace | Status fields |
|-----------|---------------|---------------|
| **Temperature** | `Temperature` | `tC`, `tF` |
| **Humidity** | `Humidity` | `rh` (relative humidity %) |
| **Illuminance** | `Illuminance` | `lux` |
| **Flood** | `Flood` | `flood` (boolean) |
| **Smoke** | `Smoke` | `alarm` (boolean) |
| **DevicePower** | `DevicePower` | `battery` (V, %), `external` (present) |

### Energy Monitoring Components

| Component | RPC Namespace | Purpose | Key status fields |
|-----------|---------------|---------|-------------------|
| **EM** | `EM` | Multi-phase energy meter (3EM triphase) | `total_act_power`, `total_aprt_power`, per-phase: `a/b/c_act_power`, `a/b/c_voltage`, `a/b/c_current`, `a/b/c_pf` |
| **EM1** | `EM1` | Single-phase energy meter (monophase profile) | `act_power`, `aprt_power`, `voltage`, `current`, `pf`, `freq` |
| **PM1** | `PM1` | Power meter (PM Mini, inline monitors) | `apower`, `voltage`, `current`, `aenergy`, `freq` |
| **EMData** | `EMData` | Historical energy data storage (3EM triphase) | Time-series data with configurable periods |
| **EM1Data** | `EM1Data` | Historical energy data storage (per-channel) | Time-series with CSV export capability |

### Special Components

| Component | RPC Namespace | Purpose |
|-----------|---------------|---------|
| **DALI** | `DALI` | DALI lighting bus control (Pro Dimmer) |
| **XMOD** | `XMOD` | Shelly X platform customization via JWT |
| **BTHomeControl** | `BTHomeControl` | Direct BLU→device control mapping (offline/online learning) |

---

## KVS (Key-Value Store) — Full API

The KVS provides persistent storage of key-value pairs on the device itself, accessible via RPC from scripts, HA, or HTTP. Unlike virtual components, KVS data does NOT create HA entities — it's purely device-side storage.

**However, HA 2024.2+ added `shelly.get_kvs_value` and `shelly.set_kvs_value` actions** that let automations read/write KVS directly.

### Limits

| Limit | Value |
|-------|-------|
| Max key length | 42 characters |
| Max value length | 253 characters |
| Max number of keys | 50 |
| Value types | Any valid JSON (string, number, boolean, null, object, array) |
| Concurrency | etag-based optimistic locking for atomic updates |

### Methods

```bash
# KVS.Set — create or update a key
curl "http://{IP}/rpc/KVS.Set?key=%22room_mode%22&value=%22evening%22"
# Response: {"etag":"0DWty8HwCB","rev":2733}

# KVS.Get — read a key
curl "http://{IP}/rpc/KVS.Get?key=%22room_mode%22"
# Response: {"etag":"0DWty8HwCB","value":"evening"}

# KVS.List — list all keys with etags
curl "http://{IP}/rpc/KVS.List"
# Response: {"keys":{"room_mode":{"etag":"0DWty8HwCB"},...},"rev":2733}

# KVS.GetMany — bulk read with pattern matching
curl -X POST -d '{"id":1,"method":"KVS.GetMany","params":{"match":"room_*"}}' http://{IP}/rpc
# Response: {"items":[{"key":"room_mode","etag":"...","value":"evening"},...],"offset":0,"total":3}

# KVS.Delete — remove a key
curl -X POST -d '{"id":1,"method":"KVS.Delete","params":{"key":"room_mode"}}' http://{IP}/rpc

# Conditional update with etag (atomic)
curl -X POST -d '{"id":1,"method":"KVS.Set","params":{"key":"counter","value":42,"etag":"0DWty8HwCB"}}' http://{IP}/rpc
# Fails if etag doesn't match current value (someone else changed it)
```

### Pattern Matching (KVS.List / KVS.GetMany)

| Pattern | Matches |
|---------|---------|
| `*` | Zero or more characters (stops at `/`) |
| `**` | Zero or more characters (crosses `/`) |
| `?` | Exactly one character (not `/`) |
| `\|` or `,` | Alternative patterns |

### KVS from Script

```javascript
// Read KVS from a script
Shelly.call("KVS.Get", {key: "room_mode"}, function(res) {
  print("Mode is:", res.value);
});

// Write KVS
Shelly.call("KVS.Set", {key: "room_mode", value: "night"});

// Note: Script.storage is separate from KVS!
// Script.storage: private per-script, 12 items, 1024 bytes/value
// KVS: device-wide, 50 keys, 253 chars/value, accessible via RPC from outside
```

### KVS from Home Assistant

```yaml
# Read a KVS value in an automation
service: shelly.get_kvs_value
data:
  device_id: "abc123def456"
  key: "room_mode"
response_variable: result
# result.value contains the stored value

# Write a KVS value
service: shelly.set_kvs_value
data:
  device_id: "abc123def456"
  key: "room_mode"
  value: "evening"
```

### KVS vs Virtual Components vs Script.storage

| Feature | KVS | Virtual Components | Script.storage |
|---------|-----|--------------------|----------------|
| Creates HA entities | No | Yes | No |
| Accessible from outside device | Yes (RPC) | Yes (RPC + HA) | No (script only) |
| Accessible from HA | Yes (shelly.get/set_kvs_value) | Yes (native entities) | No |
| Persistent across reboot | Yes (always) | Configurable (persisted flag) | Yes (always) |
| Max items | 50 | 10 | 12 |
| Max value size | 253 chars | Varies (number: unlimited, text: 200 chars) | 1024 bytes |
| Triggers events/webhooks | No | Yes (change events) | No |
| Script listener API | No (must poll) | Yes (Virtual.on("change")) | No |
| Available on | All Gen2+ | Gen3, Gen4, Gen2 Pro | All Gen2+ |
| Best for | Config data, lookup tables, IP addresses | User-facing controls, HA-visible state | Internal counters, private script state |

---

## Schedule Service — Full API

Cron-based timer that executes RPC methods at defined times. Runs on the device, independent of HA.

### Limits

- 20 schedule jobs per device
- 5 RPC calls per job
- Cron format: `seconds minutes hours day_of_month month day_of_week`
- No leading zeros (use `8` not `08`)

### Cron Timespec Format

```
┌───────── seconds (0-59)
│ ┌─────── minutes (0-59)
│ │ ┌───── hours (0-23)
│ │ │ ┌─── day of month (1-31)
│ │ │ │ ┌─ month (1-12 or JAN-DEC)
│ │ │ │ │ ┌─ day of week (0-6 or SUN-SAT)
│ │ │ │ │ │
0 30 22 * * MON,TUE,WED,THU,FRI
```

Special values: `*` = any, `*/N` = every N, `N-M` = range

### Examples

```bash
# Turn off switch every day at 22:30
curl -X POST -d '{
  "id":1,"method":"Schedule.Create","params":{
    "enable":true,
    "timespec":"0 30 22 * * SUN,MON,TUE,WED,THU,FRI,SAT",
    "calls":[{"method":"Switch.Set","params":{"id":0,"on":false}}]
  }
}' http://{IP}/rpc

# Turn on light at sunrise (requires timezone/geolocation configured)
# Use @sunrise/@sunset tokens in timespec (firmware 1.0+)

# Set enum virtual to "night" every day at 23:00
curl -X POST -d '{
  "id":1,"method":"Schedule.Create","params":{
    "enable":true,
    "timespec":"0 0 23 * * *",
    "calls":[{"method":"Enum.Set","params":{"id":201,"value":"night"}}]
  }
}' http://{IP}/rpc

# Multiple calls in one job (up to 5)
curl -X POST -d '{
  "id":1,"method":"Schedule.Create","params":{
    "enable":true,
    "timespec":"0 0 8 * * MON,TUE,WED,THU,FRI",
    "calls":[
      {"method":"Enum.Set","params":{"id":201,"value":"day"}},
      {"method":"Number.Set","params":{"id":202,"value":100}},
      {"method":"Text.Set","params":{"id":203,"value":"Morgunnstilling"}}
    ]
  }
}' http://{IP}/rpc

# List all schedules
curl http://{IP}/rpc/Schedule.List

# Update a schedule (disable it)
curl -X POST -d '{"id":1,"method":"Schedule.Update","params":{"id":1,"enable":false}}' http://{IP}/rpc

# Delete a schedule
curl -X POST -d '{"id":1,"method":"Schedule.Delete","params":{"id":1}}' http://{IP}/rpc

# Delete all schedules
curl http://{IP}/rpc/Schedule.DeleteAll
```

### Schedule + Virtual Components

Powerful pattern: use Schedule to set virtual component values at specific times, and let the script react via `on("change")`:

```bash
# Morning routine: set mode to "day" at 7:00 weekdays
Schedule.Create timespec="0 0 7 * * MON,TUE,WED,THU,FRI"
  calls=[{"method":"Enum.Set","params":{"id":201,"value":"day"}}]

# Evening routine: set mode to "evening" at 18:00
Schedule.Create timespec="0 0 18 * * *"
  calls=[{"method":"Enum.Set","params":{"id":201,"value":"evening"}}]

# Night routine: set mode to "night" at 23:00
Schedule.Create timespec="0 0 23 * * *"
  calls=[{"method":"Enum.Set","params":{"id":201,"value":"night"}}]
```

The script's `on("change")` listener handles the actual light control — the schedule just changes the mode value. This means you can override the schedule at any time from HA or the Shelly app by selecting a different mode.

---

## Webhook Service — Full API

Webhooks send HTTP requests when device events occur. They support conditional execution, repeat throttling, and URL token replacement.

### Limits

- 20 webhooks per device (10 for battery devices)
- Same event can trigger multiple webhooks

### Event Types per Component

| Component | Events |
|-----------|--------|
| `switch` | `switch.on`, `switch.off`, `switch.toggle` |
| `input` | `input.button_push`, `input.button_longpush`, `input.button_doublepush`, `input.toggle_on`, `input.toggle_off` |
| `cover` | `cover.open`, `cover.close`, `cover.stop`, `cover.stopped`, `cover.opening`, `cover.closing` |
| `temperature` | `temperature.change` (attrs: `tC`, `tF`) |
| `humidity` | `humidity.change` (attrs: `rh`) |
| `flood` | `flood.detected`, `flood.cleared` |
| `smoke` | `smoke.detected`, `smoke.cleared` |
| `boolean` | `boolean.change` (attrs: `value`) |
| `number` | `number.change` (attrs: `value`) |
| `text` | `text.change` (attrs: `value`) |
| `enum` | `enum.change` (attrs: `value`) |

### Conditional Webhooks

```bash
# Only call URL when temperature exceeds 25°C
curl -X POST -d '{
  "id":1,"method":"Webhook.Create","params":{
    "cid":0,
    "enable":true,
    "event":"temperature.change",
    "urls":["http://ha-server:8123/api/webhook/shelly_hot_alert"],
    "condition":"event.tC > 25"
  }
}' http://{IP}/rpc

# Only fire when enum changes to "away" (all off)
curl -X POST -d '{
  "id":1,"method":"Webhook.Create","params":{
    "cid":201,
    "enable":true,
    "event":"enum.change",
    "urls":["http://ha-server:8123/api/webhook/shelly_all_off"],
    "condition":"event.value == \"away\""
  }
}' http://{IP}/rpc

# Repeat throttling: only fire once per 300 seconds
# repeat_period: -1 = fire only on false→true transition
# repeat_period: 0 = fire every time (default)
# repeat_period: 300 = minimum 5 minutes between fires
```

### URL Token Replacement

```bash
# Include event data in the URL
"urls":["http://server/api?temp=${ev.tC}&humidity=${status['humidity:0'].rh}"]

# Include device info
"urls":["http://server/api?device=${info.id}&ip=${status.wifi.sta_ip}"]

# Include current switch state
"urls":["http://server/api?power=${status['switch:0'].apower}"]
```

### Webhooks + HA Webhook Trigger

```yaml
# HA automation triggered by Shelly webhook
automation:
  - alias: "Shelly webhook — temp alert"
    trigger:
      - platform: webhook
        webhook_id: shelly_hot_alert
        allowed_methods:
          - GET
          - POST
    action:
      - service: notify.mobile_app
        data:
          title: "Temp alert"
          message: "Shelly reported a temp alert"
```

---

## Gen4 New Components

Gen4 devices add several components not available on earlier generations:

| Component | Description |
|-----------|-------------|
| **Zigbee** | Zigbee 3.0 radio — device acts as Zigbee end device (not coordinator). Config: enable, network join/leave |
| **Matter** | Matter over WiFi — commissioning, pairing, factory reset. Methods: `Matter.FactoryReset` |
| **BTHomeControl** | Direct mapping between BLU devices and local outputs. Supports offline learning (works without WiFi/cloud). Methods: `BTHomeControl.AddPairing`, `BTHomeControl.RemovePairing` |
| **CCT** | Correlated Color Temperature for tunable white lights (Duo Bulb Gen3, etc.) |
| **DALI** | DALI lighting bus (Pro Dimmer models) |

### Device Profiles

Some devices support multiple profiles — mutually exclusive hardware configurations:

```bash
# List available profiles
curl http://{IP}/rpc/Shelly.ListProfiles
# → {"profiles":["switch","cover"],"active":"switch"}

# Switch profile
curl -X POST -d '{"id":1,"method":"Shelly.SetProfile","params":{"name":"cover"}}' http://{IP}/rpc
# Requires reboot to apply
```

Devices with profiles: Plus 2PM, Pro 2PM, Gen3 2PM, Gen4 2PM, 3EM Gen3 (triphase/monophase)

---

## Per-Device Component Availability

### Gen1 Devices

Gen1 uses the HTTP REST + CoAP/CoIoT protocol (not the Gen2+ RPC components above); the table maps each device to the HA entities the native Shelly integration creates.

| Device | Channels / Hardware | Sensors & HA entities |
|--------|--------------------|----------------------|
| Shelly 1 (SHSW-1) | 1 relay (dry contact), 1 input, no power metering | `switch` + input `binary_sensor`/events; optional add-on: up to 3× DS18B20 or 1× DHT22 → `sensor` temperature/humidity |
| Shelly 1PM (SHSW-PM) | 1 relay, 1 input, power metering | `switch`, `sensor` power (W) + energy, internal temperature + overheating `binary_sensor`; same DS18B20/DHT22 add-on as Shelly 1 |
| Shelly 1L (SHSW-L) | 1 relay, 2 inputs, **no-neutral** wiring (min. 20 W load) | `switch`, power/energy sensors reported by firmware (approximate — no dedicated metering circuit), internal temperature + overtemp; supports the temperature add-on |
| Shelly 2 (SHSW-21/22) | 2 relays **or** 1 roller (cover), 2 inputs | `switch` ×2 or `cover`; **one shared meter** for both channels (single power/energy sensor, voltage) |
| Shelly 2.5 (SHSW-25) | 2 relays **or** 1 roller with position, 2 inputs | `switch` ×2 or `cover` (position %); **per-channel** power + energy sensors, voltage, internal temperature + overtemp |
| Shelly 4Pro (SHSW-44) | 4 relays, per-channel power metering, DIN-rail | **Not supported by the HA Shelly integration** (CoAP v1 protocol, like Shelly Sense) |
| Shelly Plug (SHPLG-1) / Plug E (SHPLG2-1) / Plug S (SHPLG-S) / Plug US (SHPLG-U1) | 1 relay socket; Plug 16 A, Plug S 12 A (LED ring), Plug US 15 A | `switch`, power + energy sensors, overpower `binary_sensor`; Plug S additionally reports internal temperature + overtemp |
| Shelly EM (SHEM) | 1 relay (contactor control), 2 CT clamp channels (50 A/120 A clamps) | `switch`, per-channel power, energy, energy returned, voltage sensors |
| Shelly 3EM (SHEM-3) | 1 relay (contactor control), 3 phase CT channels (120 A) | `switch`, per-phase power, current, voltage, power factor, energy + energy returned sensors |
| Shelly Dimmer (SHDM-1) / Dimmer 2 (SHDM-2) | 1 dimming channel (leading/trailing edge), 2 inputs; Dimmer 2 works without neutral | `light` with brightness, power + energy sensors, internal temperature + overtemp, input events; load-error `binary_sensor` |
| Shelly Duo (SHBDUO-1, E27 + GU10) | White bulb, dimmable + tunable CCT (2700–6500 K) | `light` (brightness, color temp), power + energy sensors |
| Shelly Duo RGBW / Bulb RGBW (SHCB-1, E27 + GU10) | RGBW bulb, color or white mode | `light` (RGBW, brightness, color temp in white mode), power + energy sensors |
| Shelly Bulb (SHBLB-1) | Original RGBW E27 bulb, color/white modes | `light` (RGBW/effects), power + energy sensors |
| Shelly Vintage (SHVIN-1) | Dimmable warm-white filament bulb | `light` (brightness), power + energy sensors |
| Shelly RGBW2 (SHRGBW2) | 4 PWM channels, 12/24 V DC: **color mode** = 1× RGBW, **white mode** = 4 independent channels; 1 input | Color: one `light` + power/energy; White: 4× `light`, each with its own power + energy sensor; input events |
| Shelly i3 (SHIX3-1) | 3 inputs only, no relay, mains powered | Per input: `binary_sensor` (switch mode) or `event`/`shelly.click` (button mode: short/long/double/triple push); no sensors |
| Shelly Button1 (SHBTN-1/2) | 1 physical button, battery (rechargeable, USB) | `shelly.click` events (1×/2×/3×/long push), battery sensor, charger state; sleeps between presses — no `binary_sensor` for the button itself |
| Shelly H&T (SHHT-1) | Battery (or USB add-on) sensor | Temperature, humidity, battery sensors; sleeping device — reports on change thresholds/periodic wake |
| Shelly Flood (SHWT-1) | Battery water-leak sensor | Flood `binary_sensor`, temperature, battery sensors; sleeping device |
| Shelly Door/Window 1 (SHDW-1) | Battery contact sensor | Opening `binary_sensor`, lux + illumination level, tilt (°), vibration `binary_sensor`, battery; **no temperature**; sleeping device |
| Shelly Door/Window 2 (SHDW-2) | Battery contact sensor | Everything DW1 has **plus temperature sensor**; sleeping device |
| Shelly Gas (SHGS-1) | **Mains powered** natural-gas/LPG detector; optional valve add-on | Gas alarm (mild/heavy) `binary_sensor`, concentration (ppm) sensor, self-test status, `valve`/switch for the gas-valve add-on; no battery sensor |
| Shelly Smoke (SHSM-01) | Battery smoke detector | Smoke `binary_sensor`, **temperature sensor**, battery, sensor-error; sleeping device |
| Shelly Motion (SHMOS-01) | Battery (rechargeable, USB-powerable) PIR | Motion + vibration/tamper `binary_sensor`s, lux sensor, battery; **no temperature**; always-listening WiFi (not deep-sleeping, but requires CoIoT unicast) |
| Shelly Motion 2 (SHMOS-02) | As Motion, revised hardware | Everything Motion has **plus temperature sensor** |
| Shelly TRV (SHTRV-01) | Thermostatic radiator valve, rechargeable battery (USB-C) | `climate` entity (target/current temperature), valve position (%) sensor, battery, boost mode; sleeping device, slow to respond |
| Shelly Uni (SHUNI-1) | 2 potential-free outputs (max 100 mA), 2 digital inputs, 1 ADC (0–12 V / 0–30 V), 12–36 V supply | `switch` ×2, input `binary_sensor`s/events, ADC voltage sensor; add-on: up to 3× DS18B20 or 1× DHT22 → temperature/humidity sensors |
| Shelly Sense (SHSEN-1) | Battery IR blaster + PIR (motion, lux, temp, humidity) | **Not supported by the HA Shelly integration** (CoAP v1, like the 4Pro) |

**Gen1 HA integration notes:**

- **CoIoT must be enabled** on every Gen1 device (web UI → Internet & Security → Advanced Developer Settings), and **unicast is strongly recommended**: set the CoIoT peer to `<HA-IP>:5683` and restart the device. Unicast is **mandatory for battery devices** and for HA/devices on different subnets or VLANs (multicast doesn't cross them). UDP 5683 must be open toward HA.
- **Firmware ≥ 1.9 required** (Duo, Bulb RGBW, Dimmer 1/2, RGBW2 and Vintage need ≥ 1.11). Shelly 4Pro and Sense use the older CoAP v1 protocol and are not supported at all.
- **Entity naming:** single-channel devices name entities from the device name (falling back to device ID) — e.g. `switch.kitchen_light`, `sensor.kitchen_light_power`. Multi-channel devices create one sub-device per channel named from the **Channel Name** if set, otherwise "Device Name channel N" (older installs may still carry legacy `_relay_0`-style entity IDs).
- **Battery devices sleep:** they must be woken (button press) to be discovered/configured, `homeassistant.update_entity` cannot poll them, and state arrives only on their own wake/report schedule. Motion/Motion 2 are the exception — always WiFi-connected but push-only (unicast CoIoT required).
- **Momentary inputs (i3, Button1, buttons on relays)** are exposed as `shelly.click` events (usable in device triggers), not long-lived binary sensors — automations should use events for short/long/double/triple push.
- **Gen1 is discontinued** (superseded by Plus/Gen2, Gen3, Gen4) but remains extremely widely deployed and fully supported by the HA Shelly integration. There is no Gen1 "EM50" — the Pro EM-50 is a Gen2 Pro device; likewise "Shelly Air" (announced 2020) never shipped.

### Gen2 (Plus) Devices

| Device | Components |
|--------|------------|
| Plus 1 / 1 Mini | Input, Switch, Script (×10) |
| Plus 1PM / 1PM Mini | Input, Switch (with power metering), Script |
| Plus 2PM | Input (×2), Switch (×2) or Cover, Script |
| Plus i4 | Input (×4), Script |
| Plus H&T | Temperature, Humidity, DevicePower |
| Plus Smoke | Smoke, Temperature, DevicePower |
| Plus RGBW PM | Input, Light (×4 white) or RGBW (color), Script |
| Plus Wall Dimmer | Input (×2), Light, Script |
| Plus Plug S/UK/US/IT | Switch (with PM), Script |
| Plus Uni | Input (×2), Switch (×2), Voltmeter, Script |
| Plus PM Mini | PM1, Input, Script |
| Plus 0-10V Dimmer | Input (×2), Light, Script |

### Gen2 Pro (DIN-rail) Devices

| Device | Components |
|--------|------------|
| Pro 1 / 1PM | Input (×2), Switch, Script, Ethernet |
| Pro 2 / 2PM | Input (×2), Switch (×2) or Cover, Script, Ethernet |
| Pro 3 | Input (×3), Switch (×3), Script, Ethernet |
| Pro 4PM | Input (×4), Switch (×4), Script, Ethernet |
| Pro Dual Cover PM | Input (×4), Cover (×2), Script, Ethernet |
| Pro EM | EM (×2), EMData (×2), Switch, Script, Ethernet |
| Pro 3EM (400) | EM or EM1 (×3), EMData or EM1Data, Script, Ethernet |
| Pro Dimmer 1PM / 2PM | Input, Light (×1 or ×2), Script, Ethernet |
| Pro RGBWW PM | Input (×4), Light (×5), Script, Ethernet |
| BLU Gateway | BLE (gateway), Script |

### Gen3 Devices

| Device | Components (all include WiFi, BLE, Script) |
|--------|---------------------------------------------|
| 1 Gen3 / 1 Mini Gen3 | Input, Switch |
| 1L Gen3 | Input, Switch — no neutral wire |
| 1PM Gen3 / 1PM Mini Gen3 | Input, Switch (PM) |
| 2PM Gen3 | Input (×2), Switch (×2) or Cover (with tilt support) |
| 2L Gen3 | Input (×2), Switch (×2) — no neutral wire |
| i4 Gen3 | Input (×4) — scene/event controller, no relay |
| PM Mini Gen3 | PM1, Input |
| Dimmer Gen3 | Input (×2), Light |
| Dimmer 0/1-10V PM Gen3 | Input (×2), Light (0/1-10V control, PM) |
| DALI Dimmer Gen3 | Input (×2), DALI bridge/dimmer for DALI luminaire networks |
| EM Gen3 | EM, EMData, Switch |
| 3EM Gen3 (official name: 3EM-63 Gen3) | EM or EM1 (×3), EMData or EM1Data |
| Plug S Gen3 / Plug M Gen3 (3000W since 2026 refresh) | Switch (PM), PLUGS_UI (LED control) |
| Plug S MTR Gen3 | Switch (PM), Matter-certified |
| Plug PM Gen3 | Switch (PM) — capability details unverified |
| Outdoor Plug S Gen3 | Switch (PM), outdoor-rated, Matter |
| Shelly Shutter | Cover (dedicated roller/blind/awning controller, PM) |
| Duo Bulb E27 Gen3 / Multicolor Bulb E27 Gen3 | Light (white / RGB) — specs unverified |
| The Pill by Shelly | 5V USB-C low-voltage bridge; sensor add-ons (DS18B20/DHT22/digital input), virtual-component host |
| BLU Gateway Gen3 | BLE gateway (USB dongle), Script, BLU TRV support |
| H&T Gen3 | Temperature, Humidity, DevicePower, HT_UI (screen) |
| Wall Display | Input, Light, Temperature, Humidity, Illuminance, Thermostat |
| Wall Display X2i / XL | Input, Light, Temperature, Humidity, Illuminance, Thermostat, AppStore (fw 2.6.0+) |

### Shelly Wall Display — Detailed Feature Reference

The Wall Display is a touchscreen control panel with built-in 5A relay, temperature/humidity/illuminance sensors, and its own firmware track (currently 2.x, separate from the Gen2+ 1.x firmware). It comes in three models: the original Wall Display, the X2i, and the XL.

#### Models

| Model | Display | Relay | Extras |
|-------|---------|-------|--------|
| Wall Display (original) | 4" 480×480 IPS | 5A/250V | Temperature, humidity, illuminance sensors |
| Wall Display X2i | 4" 480×480 IPS | 5A/250V | Higher performance SoC, AppStore support |
| Wall Display XL | 6.5" 720×1280 IPS | 5A/250V | Larger screen, AppStore support |

#### Firmware 2.6.0-beta (April 2026) — Major New Features

This firmware brings the Wall Display significantly closer to the rest of the Gen2+ ecosystem:

**Virtual Components (New)**
- Full support for Number, Text, Boolean, Enum, and Group virtual component types
- Create, set meta/value, and invoke via RPC `Set` method
- Clickable booleans on the display UI
- `NotifyStatus` on value change (HA integration can react to changes)
- This means the Wall Display can now participate in the same virtual-component-based architecture as Gen3/Gen4/Pro devices

**Scripting Engine — QuickJS (New)**
- The Wall Display now has an on-device scripting engine based on **QuickJS** (NOT the Espruino/mJS engine used by Gen2+/Gen3/Gen4 devices, but API-compatible)
- Supported APIs: `Shelly.call`, `Timer.set` / `Timer.clear` / `Timer.getInfo`, `Shelly.addStatusHandler` / `Shelly.removeStatusHandler`, `Shelly.addEventHandler` / `Shelly.removeEventHandler`
- **BLE scanning from scripts** — with important restrictions:
  - The scanned device must be in the Wall Display's BLE Observer list (no unconditional scanning — too heavy, causes heating)
  - Scanner cannot be started/stopped from scripts — it runs perpetually while BLE Observer is enabled
  - `BLE.SetConfig` is NOT allowed from scripts on the Wall Display
  - Scanner events include fully parsed BTHome data if present
  - Advertisements from encrypted devices are not decrypted (raw `advData` is still available)
  - Events are deduped — only one event per unique advertisement payload

**AppStore (X2i and XL models only)**
- Browse, install, update, uninstall, and run apps from a curated store
- Automatic check for app updates
- Background apps are killed on resume/destroy
- **Home Assistant page is deprecated** on AppStore-capable models — HA is now installed as a separate app from the AppStore

**Thermostat Improvements**
- New "Sensor failure protection" setting — automatically turns off the thermostat and sends a push notification if the temperature sensor fails (invalid readings or no readings for a long time)
- Enabled by default

**Other 2.6.0 Features**
- Automatic OTA update check with user notification (once on startup, every hour after)
- Fahrenheit display support (all values stored internally in Celsius)
- Update log added to diagnostic zip (X2i/XL) for troubleshooting

#### HA Integration for Wall Display

The Wall Display connects to HA via the **native Shelly integration** and creates:
- `light.*` — the built-in relay (when appliance type is set to light)
- `switch.*` — the built-in relay (default)
- `sensor.*_temperature` — room temperature
- `sensor.*_humidity` — room humidity
- `sensor.*_illuminance` — ambient light level
- `climate.*` — thermostat entity (if thermostat is configured)
- `event.*` — input button events

With firmware 2.6.0+, virtual components on the Wall Display will also appear as HA entities (select, number, switch, button, sensor, binary_sensor) just like on Gen3/Gen4 devices.

#### Wall Display Firmware History (Key Releases)

| Version | Key Features |
|---------|-------------|
| 2.0.0 | Completely redesigned UI, weather display, MP3 player, radio streaming |
| 2.1.0 | Restrictions removed for unregistered devices, Sonos integration explored |
| 2.3.x | SONOS tile, OkHttp3 migration, cloud connection stability, virtual groups on home screen |
| 2.4.0 | Settings import/export, alarms (ringtones/radio/media files), PV configuration tile, SpeedTest |
| 2.5.x | Media library improvements, WebUI media management, radio station icon fixes |
| 2.6.0-beta | **Virtual Components, QuickJS scripting, AppStore (X2i/XL), Fahrenheit, auto OTA check, thermostat sensor failure protection** |

### Gen4 Devices

Gen4 dropped the "Plus" branding entirely (CES 2025). All Gen4 devices are multiprotocol: WiFi 6 + BLE + Zigbee, most with Matter. Note: Zigbee mode and WiFi/Matter mode are mutually exclusive on-device — in Zigbee mode the device appears in HA via ZHA/Z2M instead of the Shelly integration.

| Device | Components (all include WiFi 6, BLE, Zigbee, Matter, Script) |
|--------|-----------------------------------------------------------|
| 1 Gen4 / 1 Mini Gen4 | Input, Switch |
| 1PM Gen4 / 1PM Mini Gen4 | Input, Switch (PM) |
| 2PM Gen4 | Input (×2), Switch (×2) or Cover |
| 1L Gen4 / 2L Gen4 | Input, Switch — no neutral wire |
| i4 Gen4 / i4 DC Gen4 | Input (×4) |
| Dimmer Gen4 / Dimmer Gen4 US | Input (×2), Light (wall dimmer, EU + US variants) |
| Dimmer 0/1-10V PM Gen4 | Input (×2), Light (0/1-10V, PM) |
| Plug US Gen4 / Plug Gen4 | Switch (PM, 1800W US) |
| Plug C Gen4 / Plug C PM Gen4 | Switch (PM, 14A) / PM-only monitor (16A) — announced L+B 2026, rolling out |
| Power Strip 4 Gen4 | Switch (×4), per-outlet PM (V/A/W/kWh), 3680W total |
| EM Mini Gen4 | PM1 (mini energy meter, metering only) |
| EM Gen4 | EM (clamp), dry contact for contactor, 16MB local storage — rolling out 2026 |
| Flood Gen4 | Flood (leak detector + extendable sensor cable), DevicePower |
| Flood S Gen4 | Flood (disc floor sensor, battery) — rolling out 2026 |
| Presence Gen4 | mmWave radar presence (60–64 GHz): up to 6 people, 10 zones, 42 m², still-detection; Illuminance; USB-C powered |
| Pro 1PM 40A Gen4 | Input, Switch (PM, 40A), Ethernet |
| 1 / 1PM / 2PM / 1 Mini Gen4 ANZ | Regional AU/NZ variants — distinct model IDs, identical components to EU counterparts |

### Other Families (2025–2026)

| Product | Notes |
|---------|-------|
| **Shelly X MOD1 / XT1** | OEM embeddable module platform (ESP-Shelly-C38F, 8 I/O, UART, sensor add-ons); XT1 hosts custom apps. Appears in HA (if at all) as a generic Shelly-RPC device. |
| **Cury by Shelly** | Smart fragrance diffuser (dual compartments, scheduling); new "Cury" product line, EU launch Feb 2026. |
| **Shelly Wave line** | Z-Wave (Qubino-based) — uses HA's Z-Wave integration, NOT the Shelly integration; out of scope for this card. |

*Device tables refreshed 2026-07 from kb.shelly.cloud (Gen3/Gen4/Mini Gen4/BLE device indexes), shelly.com product pages, and press coverage of the CES 2025 / Light+Building 2026 announcements. Items marked "rolling out" or "unverified" had no full KB/API page yet at refresh time.*

---

## BTHome Dynamic Components

Separate from virtual components. BTHome components are dynamically created to represent real BLE devices (Shelly BLU sensors) paired to a Gen2+ WiFi device acting as a gateway.

### Setup

1. Enable BLE observer on the gateway device
2. Navigate to web UI → Components → BTHome components
3. Click "+" → scan for devices (or enter MAC address)
4. The BLE device must be in pairing mode (hold button)

### BTHome Component Types

| Type | Created for | Provides |
|------|-------------|----------|
| BTHomeDevice | Each paired BLU device | Device metadata, signal, battery |
| BTHomeSensor | Per sensor on the BLU device | Temperature, humidity, illuminance, motion, opening, etc. |

### In Home Assistant

BLU devices paired via BTHome components on a Gen3+ gateway appear through the **Shelly integration** (for BLU TRV only) or the **BTHome integration** (for all other BLU devices). The gateway device acts as a BLE proxy.

---

## Firmware Version Feature Matrix

| Feature | Minimum Firmware | Notes |
|---------|------------------|-------|
| Basic scripting | 0.9.0 | Gen2 ESP32 |
| BLE scanning in scripts | 0.12.0-beta1 | BLE.Scanner API |
| Virtual components | 1.1.0-beta3 | Gen3 + Gen2 Pro only |
| Virtual handle API in scripts | 1.0.0 | `Virtual.getHandle()` |
| Script.storage | 1.5.0 | Per-script persistent KV (12 items) |
| ArrayBuffer + AES | 1.6.0 | Gen3 + Gen4 only |
| LoRa Add-on support | 1.6.0 | Requires LoRa hardware |
| BTHomeControl (direct BLU mapping) | 1.7.0 | Offline/online learning |
| Espruino-based interpreter | 1.0.0 | Replaced mJS, backward compatible |
| Zigbee support | Gen4 FW | Gen4 devices only |
| Matter support | Gen3/Gen4 FW | Requires Matter firmware variant |
| MQTT control topics | 0.12.0+ | Full bidirectional MQTT |
| Webhook conditions & token replacement | 0.14.0+ | Status/config/info context objects |
| Schedule cron with seconds | 0.9.0+ | Full cron support since 1.0.0 |
| KVS pagination (GetMany) | 1.4.0+ | For large KVS stores |

---

## Quick Reference: All RPC Namespaces

```
# Device Management
Shelly.GetDeviceInfo          Shelly.GetStatus         Shelly.GetConfig
Shelly.ListMethods            Shelly.SetAuth           Shelly.Reboot
Shelly.Update                 Shelly.FactoryReset      Shelly.GetComponents
Shelly.ListProfiles           Shelly.SetProfile        Shelly.PutUserCA
Shelly.PutTLSClientCert       Shelly.PutTLSClientKey

# Functional Components
Switch.Set / .GetStatus / .GetConfig / .SetConfig / .Toggle
Light.Set / .GetStatus / .GetConfig / .SetConfig / .Toggle
Cover.Open / .Close / .Stop / .GoToPosition / .Calibrate / .GetStatus / .GetConfig
Input.GetStatus / .GetConfig / .SetConfig / .CheckExpression
RGB.Set / .GetStatus / .GetConfig / .SetConfig
RGBW.Set / .GetStatus / .GetConfig / .SetConfig
CCT.Set / .GetStatus / .GetConfig / .SetConfig

# Energy Monitoring
EM.GetStatus / .GetConfig / .SetConfig / .ResetCounters
EM1.GetStatus / .GetConfig / .SetConfig / .ResetCounters
PM1.GetStatus / .GetConfig / .SetConfig / .ResetCounters
EMData.GetStatus / .GetConfig / .GetData / .GetRecords / .DeleteAllData / .ResetCounters
EM1Data.GetStatus / .GetConfig / .GetData / .GetRecords / .DeleteAllData / .ResetCounters

# Sensors
Temperature.GetStatus / .GetConfig / .SetConfig
Humidity.GetStatus / .GetConfig / .SetConfig
Illuminance.GetStatus / .GetConfig / .SetConfig
Flood.GetStatus / .GetConfig
Smoke.GetStatus / .GetConfig
DevicePower.GetStatus / .GetConfig
Voltmeter.GetStatus / .GetConfig / .SetConfig

# Services
Schedule.Create / .Update / .Delete / .DeleteAll / .List
Webhook.Create / .Update / .Delete / .DeleteAll / .List / .ListSupported
HTTP.GET / .POST / .Request
KVS.Set / .Get / .GetMany / .List / .Delete
Script.Create / .Start / .Stop / .GetStatus / .GetConfig / .SetConfig / .PutCode / .GetCode / .List / .Delete / .Eval

# Virtual Components
Virtual.Add / .Delete
Boolean.Set / .GetStatus / .GetConfig / .SetConfig
Number.Set / .GetStatus / .GetConfig / .SetConfig
Text.Set / .GetStatus / .GetConfig / .SetConfig
Enum.Set / .GetStatus / .GetConfig / .SetConfig
Group.Set / .GetStatus / .GetConfig / .SetConfig

# System
Sys.GetStatus / .GetConfig / .SetConfig / .SetTime
WiFi.GetStatus / .GetConfig / .SetConfig / .Scan / .ListAPClients
BLE.GetStatus / .GetConfig / .SetConfig
Cloud.GetStatus / .GetConfig / .SetConfig
MQTT.GetStatus / .GetConfig / .SetConfig
Ws.GetStatus / .GetConfig / .SetConfig
Zigbee.GetStatus / .GetConfig / .SetConfig
Matter.GetStatus / .GetConfig / .SetConfig / .FactoryReset
```

---

## BLE Scripting — Deep Dive

The `BLE.Scanner` and `BLE.GAP` script APIs let you process raw BLE advertisements from a Shelly device acting as a gateway. This is the foundation that BTHome integration is built on, but you can use it directly for custom BLE protocols.

### Scan Manager Behavior

There are **two scan manager implementations** depending on firmware version, and the difference matters when multiple features want to scan simultaneously:

**Pre-1.5.0-beta1 (Owner-based):**
- First client to request a scan becomes the **owner**
- Further requests fail (other clients can subscribe to existing scan but cannot change options)
- Owner is cleared when the scan ends
- Cloud Relay, BTHome, and scripts compete for the scan
- Conflicts: if BTHome started scanning first with passive options, your script can't request active scanning

**1.5.0-beta1+ (Enhanced Scan Manager):**
- The Scan Manager itself owns the scan
- All clients submit requests; manager merges options using "most aggressive combination"
- Cloud Relay and BTHome submit scan requests transparently when needed
- Scripts can call `BLE.Scanner.Start` independently
- Effective scan options may differ from what each client requested
- Bluetooth can be stopped/started without reboot (since 1.6.0-beta1) — script receives `SCAN_STOP` event with boolean indicating error vs normal stop

**Gen4 limitation:** Bluetooth scanning is **not supported** when the Gen4 device is running in Zigbee mode.

### CPU Throttling (since 1.7.0)

If a script's CPU usage exceeds 25% while scanning, BLE scanner results will be **dropped** to prevent CPU hogging. Critical for designing scripts that process many BLU devices — keep your callback handler lightweight, and offload heavy work (HTTP calls, KVS writes) outside the scan callback.

### Scan Options

| Property | Type | Description |
|----------|------|-------------|
| `duration_ms` | number | Scan duration in ms, `-1` for perpetual. Default 5000. |
| `active` | boolean | `true` = active scan (more data, more power), `false` = passive. Default `false`. |
| `interval_ms` | number | Scan interval in ms. Default 241. |
| `window_ms` | number | Scan window in ms. Max 100, default 61. **Must be ≤ interval/3.** |
| `rssi_thr` | number | (since 1.5.0-beta1) Filter results above this RSSI. Default 0 = no filter. |

### BLE.Scanner API

```javascript
// Start a perpetual passive scan with RSSI filtering
BLE.Scanner.Start({
  duration_ms: -1,
  active: false,
  interval_ms: 320,
  window_ms: 30,
  rssi_thr: -75
});

// Subscribe to scan events
BLE.Scanner.Subscribe(function(event, result, userdata) {
  if (event === BLE.Scanner.SCAN_RESULT) {
    print("MAC:", result.addr, "RSSI:", result.rssi);
    print("Local name:", result.local_name);
    print("Adv data (hex):", result.advData);
    print("Scan response:", result.scanRsp);
    print("Address type:", result.addr_type); // 0=public, 1=random
  } else if (event === BLE.Scanner.SCAN_START) {
    print("Scan started or resumed");
  } else if (event === BLE.Scanner.SCAN_STOP) {
    // result is boolean: true = stopped due to error, false = normal stop
    print("Scan stopped, error:", result);
  }
});

// Stop scanning
BLE.Scanner.Stop();
```

### BLE.GAP Parser Methods

These helpers extract specific fields from raw advertisement data:

```javascript
// Parse manufacturer data for a specific vendor ID (Shelly = 0x0BA9)
let mfgData = BLE.GAP.parseManufacturerDataByVendor(result.advData, 0x0BA9);
if (mfgData !== "") {
  print("Shelly manufacturer data:", mfgData);
}

// Parse a specific EIR (Extended Inquiry Response) type
// 0x16 = Service Data, 0xFF = Manufacturer Data, 0x09 = Complete Local Name
let serviceData = BLE.GAP.ParseDataByEIRType(result.advData, 0x16);
let localName = BLE.GAP.ParseDataByEIRType(result.advData, 0x09);

// Check if a specific service UUID is advertised
let isBTHome = BLE.GAP.HasService(result.advData, 0xFCD2);
```

### BTHome Packet Decoding

BTHome sensors broadcast their data in service data with UUID `0xFCD2`. The data format is `[device_info_byte][object_id, value...][object_id, value...]`:

```javascript
function decodeBTHome(serviceData) {
  let bytes = [];
  for (let i = 0; i < serviceData.length; i++) {
    bytes.push(serviceData.charCodeAt(i));
  }

  let deviceInfo = bytes[0];
  let encrypted = (deviceInfo & 0x01) !== 0;
  let version = (deviceInfo >> 5) & 0x07;

  if (encrypted) return null; // Need bind key

  let result = {};
  let i = 1;
  while (i < bytes.length) {
    let objId = bytes[i++];
    switch (objId) {
      case 0x00: result.packet_id = bytes[i++]; break;
      case 0x01: result.battery = bytes[i++]; break;
      case 0x02: { // Temperature sint16, factor 0.01
        let t = bytes[i] | (bytes[i+1] << 8);
        if (t > 32767) t -= 65536;
        result.temperature = t / 100;
        i += 2;
        break;
      }
      case 0x03: // Humidity uint16, factor 0.01
        result.humidity = (bytes[i] | (bytes[i+1] << 8)) / 100;
        i += 2;
        break;
      case 0x21: result.motion = bytes[i++] === 1; break;
      case 0x2D: result.window = bytes[i++] === 1; break;
      case 0x3A: // Button event uint16
        result.button = bytes[i] | (bytes[i+1] << 8);
        i += 2;
        break;
    }
  }
  return result;
}

// Combine with the scanner
BLE.Scanner.Subscribe(function(event, result) {
  if (event !== BLE.Scanner.SCAN_RESULT) return;

  let serviceData = BLE.GAP.ParseDataByEIRType(result.advData, 0x16);
  if (serviceData.length < 3) return;

  // First 2 bytes = service UUID (little-endian)
  let uuid = serviceData.charCodeAt(0) | (serviceData.charCodeAt(1) << 8);
  if (uuid !== 0xFCD2) return;

  let decoded = decodeBTHome(serviceData.substring(2));
  if (decoded && decoded.temperature !== undefined) {
    print("Sensor", result.addr, "temp:", decoded.temperature, "°C");
  }
});

BLE.Scanner.Start({duration_ms: -1, active: false});
```

### CloudRelay (Shelly Cloud BLU forwarding)

`BLE.CloudRelay` forwards BLU device advertisements to Shelly Cloud for cloud-side scene triggers. **Not relevant for HA-only setups**, but worth knowing exists.

```bash
# List MACs of BLU devices managed by Cloud
curl http://{IP}/rpc/BLE.CloudRelay.List

# Get extended info about received data (paginated)
curl -X POST -d '{"id":1,"method":"BLE.CloudRelay.ListInfos","params":{"offset":0}}' http://{IP}/rpc
```

CloudRelay is **not supported** on Gen4 devices in Zigbee mode. Since 1.5.0-beta1 it no longer requires the BLE Observer to be explicitly enabled.

---

## Shelly BLU Device Catalog

The BLU line consists of battery-operated, low-power devices using BLE radio with the open **BTHome v2** protocol. They work with any home automation platform that supports BTHome — in HA via the BTHome integration, or via the Shelly integration if using a BLU Gateway Gen3 with BLU TRV.

### Common Features (all BLU devices)

| Feature | Detail |
|---------|--------|
| Pairing | Hold device button >10 seconds (blue LED flash indicates pairing mode) |
| Max paired peers | 4 (additional pairings discard least-used keys) |
| Pairing timeout | 1 minute idle |
| Encryption | Optional, PIN-based authentication for decryption |
| Beacon mode | Periodic advertising packets (battery + status, presence detection) |
| Range | ~30m line of sight; extend via WiFi gateway devices |
| Firmware update | OTA via Shelly BLE Debug app or Shelly Smart Control app |
| Service UUID | `0xFCD2` (BTHome v2) |
| Bootloader fallback | Failed OTA leaves device in bootloader mode (sleeps after 40s, button wakes it) |

### Device Specifications

| Device | Short Name | Type | Sensors / Functions |
|--------|------------|------|---------------------|
| **BLU Button 1** | SBBT-002C | Button remote | Single/double/triple/long press, button hold, buzzer (find-my-device), beacon mode, multiclick speed (0-5) |
| **BLU Motion** | SBMO-003Z | PIR motion + light | Motion event, illuminance, configurable blind time, sensitivity (low/med/high), test mode |
| **BLU Door/Window** | SBDW-002C | Reed switch + tilt | Open/closed (immediate), tilt angle (after 2s), illuminance, periodic beacons |
| **BLU H&T** | SBHT-003C | Temp + humidity | Temperature, humidity, packet ID, battery |
| **BLU Wall Switch 4** | SBBT-004CEU | EU 4-button wall remote | 4 independent buttons, all event types, encrypted advertising |
| **BLU RC Button 4** | SBBT-004CUS | US 4-button remote | 4 buttons, beacon mode (up to 60s) |
| **BLU Distance** | SBDI-003E | Ultrasonic distance | 30s default interval, 3 range modes (short/middle/long), button-triggered, optional vibration trigger |
| **BLU TRV** | (BluTRV) | Thermostatic valve | Target/current temp, valve position, errors, manual override, boost, child lock, open window mode (with paired BLU DW), display flip/brightness |
| **BLU Button Tough 1 ZB** | — | Hardened button + Zigbee | Press events, dual BLE+Zigbee transmission |
| **BLU RC Button 4 ZB** | — | 4-button remote + Zigbee | Dual BLE+Zigbee |
| **BLU Wall Switch 4 ZB** | — | Wall remote + Zigbee | Dual BLE+Zigbee |
| **BLU H&T ZB** | — | T+H sensor + Zigbee | Dual BLE+Zigbee |
| **BLU H&T Display ZB** | SBHT-103C | T+H+Lux + Display + Zigbee | Temperature, humidity, illuminance, e-ink display |
| **BLU Button Tough 1** | — | Rugged 1-button remote (BLE-only sibling of the ZB variant) | Press events |
| **BLU Motion ZB** | — | PIR motion + lux + Zigbee | Motion, illuminance, dual BLE+Zigbee |
| **BLU Door/Window ZB** | — | Contact sensor + Zigbee | Open/closed, dual BLE+Zigbee |
| **BLU Remote Control ZB** | — | Multi-button remote + Zigbee | Button events, dual BLE+Zigbee |

### BTHome Object IDs (commonly used)

| Object ID | Name | Type | Scale | Description |
|-----------|------|------|-------|-------------|
| `0x00` | packet_id | uint8 | 1 | Revolving counter (deduplication) |
| `0x01` | battery | uint8 | 1 | Battery level (0-100%) |
| `0x02` | temperature | sint16 | 0.01 | Temperature °C |
| `0x03` | humidity | uint16 | 0.01 | Relative humidity % |
| `0x05` | illuminance | uint24 | 0.01 | Lux |
| `0x21` | motion | uint8 | 1 | Motion (0/1) |
| `0x2D` | window | uint8 | 1 | Window/door (0=closed, 1=open) |
| `0x3A` | button | uint16 | 1 | Button event |
| `0x40` | distance_mm | uint16 | 1 | Distance in millimeters |
| `0x41` | distance_m | uint16 | 0.1 | Distance in meters |
| `0x45` | rotation | sint16 | 0.1 | Tilt/rotation angle (degrees) |

### Button Event Codes (Object 0x3A)

| Code | Event |
|------|-------|
| `0x00` | None |
| `0x01` | press |
| `0x02` | double_press |
| `0x03` | triple_press |
| `0x04` | long_press |
| `0x80` | button hold (BTHome standard, fw 1.0.20+) |
| `0xFE` | button hold (firmware <1.0.20) |

### BLU Button Specific GATT Characteristics

The BLU Button supports a few unique writable characteristics for paired peers (used by the Shelly app):

| Function | UUID | Value |
|----------|------|-------|
| Beacon mode enable | `cb9e957e-952d-4761-a7e1-4416494a5bfa` | byte (required for buzzer) |
| Activate buzzer | `5b026510-4088-c297-46d8-be6c736a087b` | `0x01`=start, `0x00`=stop (auto-stops after 30s) |
| Buzzer enable/disable | `dd78bf35-7680-484e-ad86-1bc1e7738e14` | byte (0=disable) |
| Multiclick speed | `35c8a5e2-1cac-4b03-8386-eb6846a1776e` | 0-5 → [800, 550, 300, 150, 90, 55] ms delay |

### BLU TRV Specific

The BLU TRV is the most complex BLU device — Silabs MG27 chipset (Zigbee-capable hardware) running Allterco firmware. It bridges through a **BLU Gateway Gen3** to expose itself as a `BluTrv` component in HA via the Shelly integration.

**Key features:**
- Manual valve position via rotation ring
- Open window mode (auto-lower target temp when paired BLU Door/Window opens)
- Child lock
- Display flip / brightness
- Override mode (temporary temperature boost)
- Boost mode (sets valve to 100%)
- Power save mode (less precise, battery-friendly)
- Floor heating mode
- Anti-clog routine
- Auto-calibration

**Control via BLU Gateway:**
```bash
# Set target temperature
curl -X POST -d '{
  "id":1,"method":"BluTrv.Call","params":{
    "id":200,
    "method":"TRV.SetTarget",
    "params":{"id":0,"target_C":22}
  }
}' http://{GATEWAY_IP}/rpc

# Get full remote status (target, current, position, errors)
curl -X POST -d '{
  "id":1,"method":"BluTrv.GetRemoteStatus","params":{"id":200}
}' http://{GATEWAY_IP}/rpc

# Set TRV flag (e.g. enable floor heating mode)
curl -X POST -d '{
  "id":1,"method":"BluTrv.Call","params":{
    "id":200,
    "method":"TRV.SetFlag",
    "params":{"id":0,"flag":"floor_heating","value":true}
  }
}' http://{GATEWAY_IP}/rpc
```

Available TRV flags: `floor_heating`, `accel`, `auto_calibrate`, `anticlog`, `power_save`, `silent_mode`

**Webhook events from BLU TRV:**
- `blutrv.temperature_change` — current temperature change (attrs: `current_C`)
- `blutrv.position_change` — valve position change >5%

### BTHomeControl (Direct BLU→Shelly Mapping, since 1.7.0)

The newest feature: pair a BLU device directly to a WiFi Shelly device (Switch, Cover, Light) without HA in between. The BLU device controls the WiFi Shelly directly via BLE.

**Modes:**
- **Offline learning** — works without WiFi or cloud, useful for installations where a BLU button needs to control a local light even when the network is down
- **Online learning** — sets up the mapping while connected, then runs offline

**Supported on:** Plug S Gen3, Outdoor Plug S Gen3, AZ Plug, and other Gen3+ devices listing BTHomeControl in their changelog.

**Use case for your setup:** garage (Garage) door + BLU button → directly controls Shelly Plug S running the garage light, with zero HA dependency. Works even if HA is rebooting or the network is down.

---

## Add-Ons

Several Shelly devices have hardware expansion connectors. Add-ons are physical modules adding new sensor or output capabilities, exposed as additional components with IDs in the range **100-199** (separate from internal components 0-99 and virtual components 200-299).

### Component ID Ranges

| ID Range | Used by |
|----------|---------|
| 0-99 | Built-in (internal) components |
| 100-199 | Add-on peripheral components |
| 200-299 | Virtual components (dynamic) |

This separation means a Shelly Plus 1 with a Sensor Add-on can have:
- `switch:0` (built-in relay)
- `temperature:100`, `temperature:101` (DS18B20 sensors)
- `input:102` (digital_in via Sensor Add-on)
- `boolean:200`, `enum:201`, `number:202` (virtual components)

All accessible via the same RPC interface, all visible in HA.

### Shelly Sensor Add-On

Available for Plus 1, Plus 1PM, Plus 2PM, Plus Uni, Plus i4, and various Gen3 devices.

**Supported peripherals:**

| Peripheral | Component types | Description |
|------------|----------------|-------------|
| `ds18b20` | Temperature | OneWire 1-Wire temperature sensor (multiple per add-on) |
| `dht22` | Temperature, Humidity | DHT22 combined sensor (occupies same GPIO as 1-Wire — exclusive) |
| `digital_in` | Input | Dry contact / button input |
| `analog_in` | Voltmeter | 0-10V analog voltage input |

**Configuration workflow:**

```bash
# Step 1: Enable the add-on type
curl -X POST -d '{
  "id":1,"method":"Sys.SetConfig","params":{
    "config":{"device":{"addon_type":"sensor"}}
  }
}' http://{IP}/rpc

# Step 2: Reboot
curl -X POST -d '{"id":1,"method":"Shelly.Reboot"}' http://{IP}/rpc

# Step 3: Scan for OneWire devices
curl -X POST -d '{"id":1,"method":"SensorAddon.OneWireScan"}' http://{IP}/rpc
# Returns: ["28:ff:64:6:c7:cc:95:b1", ...]

# Step 4: Add a DS18B20 linked to a temperature component
curl -X POST -d '{
  "id":1,"method":"SensorAddon.AddPeripheral","params":{
    "type":"ds18b20",
    "attrs":{"cid":100,"addr":"28:255:100:6:199:204:149:177"}
  }
}' http://{IP}/rpc

# Step 5: Add a digital input
curl -X POST -d '{
  "id":1,"method":"SensorAddon.AddPeripheral","params":{
    "type":"digital_in",
    "attrs":{"cid":101}
  }
}' http://{IP}/rpc

# Step 6: Reboot to activate
curl -X POST -d '{"id":1,"method":"Shelly.Reboot"}' http://{IP}/rpc

# Read like any other component
curl http://{IP}/rpc/Temperature.GetStatus?id=100
# → {"id":100,"tC":21.5,"tF":70.7}
```

**HA integration:** the new components appear automatically as new entities in the Shelly integration after reboot.

### Shelly Pro Output Add-On

For Pro 1, Pro 1PM, Pro 2, Pro 2PM, Pro 3 — adds extra relay outputs.

**Supported peripheral:**
- `digital_out` → Switch component (IDs 100-199)

```bash
# Enable the Pro Output Add-on
curl -X POST -d '{
  "id":1,"method":"Sys.SetConfig","params":{
    "config":{"device":{"addon_type":"prooutput"}}
  }
}' http://{IP}/rpc

# Add a digital output linked to switch:100
curl -X POST -d '{
  "id":1,"method":"ProOutputAddon.AddPeripheral","params":{
    "type":"digital_out",
    "attrs":{"cid":100}
  }
}' http://{IP}/rpc

# Reboot
curl -X POST -d '{"id":1,"method":"Shelly.Reboot"}' http://{IP}/rpc

# Now you have switch:100 in addition to switch:0
curl -X POST -d '{
  "id":1,"method":"Switch.Set","params":{"id":100,"on":true}
}' http://{IP}/rpc
```

### Shelly LoRa Add-On (since fw 1.6.0)

LoRa radio module for long-range, low-bandwidth communication. Supported on:
- Shelly 1 Gen3, 1PM Gen3, EM Gen3, Dimmer 0/1-10V PM Gen3, Dimmer Gen3
- Shelly 1 Gen4, 1PM Gen4

**Use cases:**
- Extending range to remote sensors/actuators in outbuildings
- Mesh networking across a property
- Communication where WiFi isn't available

The LoRa add-on uses its own RPC namespace (`LoRa`) for configuration and message handling. Detailed protocol depends on the application — refer to the Shelly LoRa Add-on docs page for specifics.

### Add-On + Virtual Component Pattern

Combine an add-on sensor with a virtual component for an HA-editable threshold:

```javascript
// Freezer monitor: DS18B20 add-on + virtual threshold + virtual alert
let threshold = Virtual.getHandle("number:200");  // "Freezer limit" — editable in HA
let status    = Virtual.getHandle("text:201");    // "Freezer status" — visible in HA
let alert     = Virtual.getHandle("boolean:202"); // "Freezer alert" — alarm flag

Timer.set(60000, true, function() {
  let temp = Shelly.getComponentStatus("temperature:100").tC;
  let limit = threshold.getValue();

  if (temp > limit) {
    alert.setValue(true);
    status.setValue("ALERT: " + temp + "°C (limit: " + limit + "°C)");
  } else {
    alert.setValue(false);
    status.setValue("OK: " + temp + "°C");
  }
});
```

The user adjusts `number:200` from the HA dashboard, the script reads the new value on its next cycle, and the boolean alert can trigger HA automations to send notifications.
