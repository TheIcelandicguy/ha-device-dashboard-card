# Shelly Virtual Components — Complete Setup & Usage Guide

## Prerequisites

- **Device compatibility:** Gen3, Gen4, or Gen2 Pro devices only
- **Firmware:** 1.1.0+ (virtual components), 1.0.0+ (script handle API)
- **Limits:** Max 10 virtual components per device, IDs 200–299
- **HA integration:** Shelly integration auto-discovers virtual components as native entities

---

## Part 1: Creating Virtual Components

### Method A: Web UI (easiest)

1. Open your Shelly device's web interface: `http://<device-ip>`
2. Navigate to **Scripts** → **Components** tab
3. Click **Create new** next to "User-defined components"
4. Select the component type: **Boolean**, **Number**, **Text**, **Enum**, or **Button**
5. Fill in the configuration:
   - **Name** — display name (use Icelandic: "Guest mode", "Lighting mode", etc.)
   - **View** — how it renders in the Shelly app (toggle/label, slider/field, dropdown/label)
   - **Custom Icon URL** — optional icon for the Shelly app home page
6. Click **Save**
7. To display on the device home page, create a **Group** and assign components to it:
   - Go to the **Groups** tab
   - Click **Create group**, give it a name, and select which components belong to it
   - Only grouped components appear on the device's home page

### Method B: RPC via HTTP (scriptable, bulk setup)

```bash
# Boolean — guest mode toggle
curl -X POST -d '{
  "id":1,
  "method":"Virtual.Add",
  "params":{
    "type":"boolean",
    "config":{
      "name":"Guest mode",
      "persisted":true,
      "default_value":false,
      "meta":{"ui":{"view":"toggle","titles":["Off","On"]}}
    }
  }
}' http://192.168.1.100/rpc
# Response: {"id":1,"src":"...","params":{"id":200}}

# Number — temperature setpoint
curl -X POST -d '{
  "id":1,
  "method":"Virtual.Add",
  "params":{
    "type":"number",
    "config":{
      "name":"Temperature",
      "min":15,"max":35,
      "default_value":22,
      "persisted":true,
      "meta":{"ui":{"view":"slider","unit":"°C","step":0.5}}
    }
  }
}' http://192.168.1.100/rpc

# Enum — lighting scene selector
curl -X POST -d '{
  "id":1,
  "method":"Virtual.Add",
  "params":{
    "type":"enum",
    "config":{
      "name":"Lighting mode",
      "options":["day","evening","movie","night","away"],
      "default_value":"day",
      "persisted":true,
      "meta":{"ui":{"view":"dropdown","titles":{
        "day":"Daylight",
        "evening":"Evening",
        "movie":"Movie",
        "night":"Night light",
        "away":"All off"
      }}}
    }
  }
}' http://192.168.1.100/rpc

# Text — status display (read-only)
curl -X POST -d '{
  "id":1,
  "method":"Virtual.Add",
  "params":{
    "type":"text",
    "config":{
      "name":"Status",
      "default_value":"Nothing new",
      "meta":{"ui":{"view":"label"}}
    }
  }
}' http://192.168.1.100/rpc

# Button — master off trigger
curl -X POST -d '{
  "id":1,
  "method":"Virtual.Add",
  "params":{
    "type":"button",
    "config":{
      "name":"Turn off all"
    }
  }
}' http://192.168.1.100/rpc

# Delete a virtual component
curl -X POST -d '{
  "id":1,
  "method":"Virtual.Delete",
  "params":{"key":"boolean:200"}
}' http://192.168.1.100/rpc

# List all components on device
curl http://192.168.1.100/rpc/Shelly.GetComponents?dynamic_only=true
```

### Method C: Auto-create from Script (on boot)

```javascript
// Script that creates its own virtual components if they don't exist
// Useful for distributing scripts that need specific virtuals

Shelly.call("Shelly.GetComponents", { dynamic_only: true }, function(res) {
  let found = false;
  for (let i = 0; i < res.components.length; i++) {
    if (res.components[i].key === "boolean:200") { found = true; break; }
  }
  if (!found) {
    Shelly.call("Virtual.Add", {
      type: "boolean",
      id: 200,
      config: {
        name: "Guest mode",
        persisted: true,
        default_value: false,
        meta: { ui: { view: "toggle", titles: ["Off", "On"] } }
      }
    }, function(r, ec, em) {
      if (ec === 0) print("Created boolean:200");
      else print("Error creating:", em);
    });
  }
});
```

---

## Part 2: Component Configuration Reference

### Boolean

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name |
| `persisted` | boolean | Keep value across reboots (default: false) |
| `default_value` | boolean | Value on reboot if not persisted |
| `meta.ui.view` | string | `"toggle"` = interactive switch, `"label"` = read-only display |
| `meta.ui.titles` | array[2] | Labels for [false, true]: `["Closed", "Open"]` |
| `meta.ui.icon` | string | URL to custom icon |

**HA mapping:** toggle → `switch`, label → `binary_sensor`

### Number

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name |
| `persisted` | boolean | Keep value across reboots |
| `default_value` | number | Value on reboot |
| `min` | number | Minimum allowed |
| `max` | number | Maximum allowed |
| `meta.ui.view` | string | `"slider"` or `"field"` (text input) |
| `meta.ui.unit` | string | Unit suffix: `"°C"`, `"W"`, `"%"`, `"lux"` |
| `meta.ui.step` | number | Increment for slider: `0.5`, `1`, `10` |

**HA mapping:** both modes → `number` entity (slider vs box mode in HA)

### Text

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name |
| `persisted` | boolean | Keep value across reboots |
| `default_value` | string | Value on reboot (max 200 chars) |
| `meta.ui.view` | string | `"label"` = read-only, `"field"` = editable |

**HA mapping:** label → `sensor`, field → `text`

### Enum

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name |
| `options` | array | Allowed values: `["day","evening","night"]` |
| `persisted` | boolean | Keep value across reboots |
| `default_value` | string\|null | One of the options or null |
| `meta.ui.view` | string | `"dropdown"` = select list, `"label"` = read-only |
| `meta.ui.titles` | object | Friendly names: `{"day":"Daylight"}` |

**HA mapping:** dropdown → `select`, label → `sensor`

### Button

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name |
| `meta.ui.view` | string | `"button"` = visible, `"hidden"` = not shown |

**HA mapping:** → `button` entity (press fires event on device)

### Group

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Group display name |
| `components` | array | Component keys: `["boolean:200","number:201"]` |

**HA mapping:** none (organizational only, for Shelly app/web UI)

---

## Part 3: Reading & Writing Values

### Via RPC (HTTP)

```bash
# Read
curl http://192.168.1.100/rpc/Boolean.GetStatus?id=200
# → {"value":true,"source":"script","last_update_ts":1700864253}

curl http://192.168.1.100/rpc/Number.GetStatus?id=201
# → {"value":22.5,"source":"rpc","last_update_ts":1700864253}

curl http://192.168.1.100/rpc/Enum.GetStatus?id=203
# → {"value":"evening","source":"UI","last_update_ts":1700864253}

# Write
curl "http://192.168.1.100/rpc/Boolean.Set?id=200&value=true"
curl "http://192.168.1.100/rpc/Number.Set?id=201&value=25.0"
curl "http://192.168.1.100/rpc/Enum.Set?id=203&value=%22night%22"
curl "http://192.168.1.100/rpc/Text.Set?id=202&value=%22All%20OK%22"

# Reconfigure
curl "http://192.168.1.100/rpc/Number.SetConfig?id=201&config={%22min%22:10,%22max%22:40}"
```

### Via Script (on-device)

```javascript
// === MODERN API (firmware 1.0.0+) — Virtual handle ===

// Get handles
let guestMode = Virtual.getHandle("boolean:200");
let tempSet   = Virtual.getHandle("number:201");
let statusTxt = Virtual.getHandle("text:202");
let lightMode = Virtual.getHandle("enum:203");
let masterOff = Virtual.getHandle("button:204");

// Read values (synchronous)
let isGuest = guestMode.getValue();     // true or false
let temp    = tempSet.getValue();       // 22.5
let mode    = lightMode.getValue();     // "evening"

// Write values
guestMode.setValue(true);
tempSet.setValue(24.0);
statusTxt.setValue("Updated: " + new Date().toISOString());
lightMode.setValue("night");

// === LISTEN FOR CHANGES ===

// Boolean change (from HA, Shelly app, or RPC)
guestMode.on("change", function(ev) {
  print("Guest mode:", ev.value, "by:", ev.source);
  if (ev.value) {
    // Guest mode ON — set lights to 50%
    Shelly.call("Light.Set", {id: 0, on: true, brightness: 50});
  } else {
    // Guest mode OFF — restore to 100%
    Shelly.call("Light.Set", {id: 0, on: true, brightness: 100});
  }
});

// Enum change — lighting scene selector
lightMode.on("change", function(ev) {
  print("Mode changed to:", ev.value);
  switch (ev.value) {
    case "day":
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 100});
      break;
    case "evening":
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 40});
      break;
    case "movie":
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 15});
      break;
    case "night":
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 5});
      break;
    case "away":
      Shelly.call("Light.Set", {id: 0, on: false});
      break;
  }
});

// Number change — temperature threshold
tempSet.on("change", function(ev) {
  print("New temp setpoint:", ev.value, "°C");
  // Store in Script.storage for other logic
  Script.storage.setItem("target_temp", JSON.stringify(ev.value));
});

// Button press events
masterOff.on("single_push", function(ev) {
  print("Master OFF pressed!");
  Shelly.call("Switch.Set", {id: 0, on: false});
  // Also call other Shellys
  Shelly.call("HTTP.GET", {
    url: "http://192.168.1.101/rpc/Switch.Set?id=0&on=false"
  });
  Shelly.call("HTTP.GET", {
    url: "http://192.168.1.102/rpc/Switch.Set?id=0&on=false"
  });
  statusTxt.setValue("All off at " + new Date().toLocaleTimeString());
});

// Remove a listener
let listenerId = guestMode.on("change", function(ev) { /* ... */ });
guestMode.off(listenerId);  // stop listening


// === LEGACY API (works on older firmware too) ===

// Read via Shelly.getComponentStatus (synchronous)
let boolVal = Shelly.getComponentStatus("boolean", 200);
print("Boolean value:", boolVal.value);

// Write via Shelly.call
Shelly.call("Boolean.Set", {id: 200, value: true});
Shelly.call("Number.Set", {id: 201, value: 25.0});

// Listen via event/status handlers
Shelly.addStatusHandler(function(e) {
  if (e.component === "boolean:200") {
    print("Boolean changed:", JSON.stringify(e.delta));
  }
  if (e.component === "enum:203") {
    let val = Shelly.getComponentStatus("enum", 203).value;
    print("Enum is now:", val);
  }
});
```

---

## Part 4: Home Assistant Integration

### Auto-Discovery

Virtual components are discovered automatically by the Shelly HA integration. After creating them:

1. Go to **Settings → Devices & Services → Shelly**
2. Find your device and click **Reconfigure** or wait for the next poll
3. The new entities appear under the device

### Entity ID Pattern

```
{platform}.{device_name}_{type}_{id}

Examples:
  switch.shelly_livingroom_boolean_200        (boolean in toggle mode)
  binary_sensor.shelly_livingroom_boolean_200 (boolean in label mode)
  number.shelly_livingroom_number_201         (number in field or slider mode)
  sensor.shelly_livingroom_text_202           (text in label mode)
  text.shelly_livingroom_text_202             (text in field mode)
  select.shelly_livingroom_enum_203           (enum in dropdown mode)
  sensor.shelly_livingroom_enum_203           (enum in label mode)
  button.shelly_livingroom_button_204         (button)
```

### HA Automation Examples

```yaml
# Trigger on enum (scene selector) change
automation:
  - alias: "Living Room lighting mode"
    trigger:
      - platform: state
        entity_id: select.shelly_livingroom_enum_203
    action:
      - choose:
          - conditions:
              - condition: state
                entity_id: select.shelly_livingroom_enum_203
                state: "day"
            sequence:
              - service: scene.turn_on
                target:
                  entity_id: scene.livingroom_daglight
          - conditions:
              - condition: state
                entity_id: select.shelly_livingroom_enum_203
                state: "evening"
            sequence:
              - service: scene.turn_on
                target:
                  entity_id: scene.livingroom_evening
          - conditions:
              - condition: state
                entity_id: select.shelly_livingroom_enum_203
                state: "away"
            sequence:
              - service: light.turn_off
                target:
                  entity_id: light.livingroom_light_group

# React to boolean toggle from device
automation:
  - alias: "Guest mode on"
    trigger:
      - platform: state
        entity_id: switch.shelly_hallway_boolean_200
        to: "on"
    action:
      - service: light.turn_on
        target:
          entity_id: light.livingroom_light_group
        data:
          brightness_pct: 30
      - service: notify.mobile_app
        data:
          title: "Guest mode"
          message: "Guest mode on — light set to 30%"

# Set a number virtual from HA (e.g., from an input_number helper)
automation:
  - alias: "Sync temperature setpoint"
    trigger:
      - platform: state
        entity_id: input_number.target_temperature
    action:
      - service: number.set_value
        target:
          entity_id: number.shelly_kitchen_number_201
        data:
          value: "{{ states('input_number.target_temperature') }}"

# Press virtual button from HA automation
automation:
  - alias: "Turn off all at midnight"
    trigger:
      - platform: time
        at: "00:00:00"
    action:
      - service: button.press
        target:
          entity_id: button.shelly_hallway_button_204
```

### Mushroom Dashboard Cards

```yaml
# Boolean toggle — Mushroom entity card
type: custom:mushroom-entity-card
entity: switch.shelly_hallway_boolean_200
name: Guest mode
icon: mdi:account-group
fill_container: true
tap_action:
  action: toggle

# Enum select — Mushroom select card
type: custom:mushroom-select-card
entity: select.shelly_livingroom_enum_203
name: Lighting mode
icon: mdi:lightbulb-group
fill_container: true

# Number slider — Mushroom number card
type: custom:mushroom-number-card
entity: number.shelly_kitchen_number_201
name: Temperature
icon: mdi:thermometer
fill_container: true
display_mode: slider

# Status text — Mushroom entity card
type: custom:mushroom-entity-card
entity: sensor.shelly_hallway_text_202
name: Status
icon: mdi:information
fill_container: true

# Button — Mushroom entity card with tap action
type: custom:mushroom-entity-card
entity: button.shelly_hallway_button_204
name: Turn off all
icon: mdi:power-off
fill_container: true
tap_action:
  action: call-service
  service: button.press
  target:
    entity_id: button.shelly_hallway_button_204
```

---

## Part 5: Complete Working Example

### Scenario: Living Room (living room) lighting controller

This sets up a Shelly Gen3/Gen4 device in your Living Room with:
- **Enum** for selecting lighting mode (5 scenes)
- **Number** for setting custom brightness percentage
- **Boolean** for enabling "movie mode" dim timer
- **Text** for displaying current status
- **Button** for quick all-off

#### Step 1: Create all virtuals via script (runs once)

```javascript
// livingroom-setup.js — Run once to create virtual components
// After running, disable this script and enable the main controller script

let components = [
  { type: "enum", id: 200, config: {
    name: "Lighting mode", persisted: true, default_value: "day",
    options: ["day","evening","movie","night","away"],
    meta: { ui: { view: "dropdown", titles: {
      day: "Daylight", evening: "Evening",
      movie: "Movie", night: "Night light", away: "All off"
    }}}
  }},
  { type: "number", id: 201, config: {
    name: "Brightness", min: 0, max: 100, default_value: 100, persisted: true,
    meta: { ui: { view: "slider", unit: "%", step: 5 }}
  }},
  { type: "boolean", id: 202, config: {
    name: "Movie mode timed", persisted: false, default_value: false,
    meta: { ui: { view: "toggle", titles: ["Off", "On"] }}
  }},
  { type: "text", id: 203, config: {
    name: "Living Room status", default_value: "Ready",
    meta: { ui: { view: "label" }}
  }},
  { type: "button", id: 204, config: {
    name: "Turn off livingroom"
  }}
];

let idx = 0;
function createNext() {
  if (idx >= components.length) {
    print("All components created! Now create a group.");
    // Create a group for the home page
    Shelly.call("Virtual.Add", {
      type: "group",
      config: {
        name: "Living Room control panel",
        components: ["enum:200","number:201","boolean:202","text:203","button:204"]
      }
    });
    return;
  }
  let c = components[idx];
  Shelly.call("Virtual.Add", {type: c.type, id: c.id, config: c.config},
    function(res, ec, em) {
      if (ec === 0) print("Created", c.type + ":" + c.id);
      else print("Error:", em);
      idx++;
      // Throttle: max 5 concurrent RPC calls
      Timer.set(500, false, createNext);
    }
  );
}
createNext();
```

#### Step 2: Main controller script

```javascript
// livingroom-controller.js — Main automation script
// Set to run on startup

let lightMode   = Virtual.getHandle("enum:200");
let brightness  = Virtual.getHandle("number:201");
let movieTimer  = Virtual.getHandle("boolean:202");
let statusText  = Virtual.getHandle("text:203");
let offButton   = Virtual.getHandle("button:204");

// Brightness presets per mode
let presets = {
  day:     100,
  evening:     40,
  movie:  15,
  night:      5,
  away:      0
};

let movieTimerHandle = null;

// Apply lighting based on mode
function applyMode(mode) {
  let brt = presets[mode];
  if (typeof brt === "undefined") return;

  if (brt === 0) {
    Shelly.call("Light.Set", {id: 0, on: false});
    statusText.setValue("Off");
  } else {
    Shelly.call("Light.Set", {id: 0, on: true, brightness: brt});
    brightness.setValue(brt);  // sync slider
    statusText.setValue("Hamur: " + mode + " (" + brt + "%)");
  }
}

// React to mode changes
lightMode.on("change", function(ev) {
  print("Mode -> " + ev.value + " from " + ev.source);
  applyMode(ev.value);
});

// React to manual brightness slider changes
brightness.on("change", function(ev) {
  if (ev.source === "script") return;  // ignore our own updates
  print("Brightness -> " + ev.value + "% from " + ev.source);
  if (ev.value === 0) {
    Shelly.call("Light.Set", {id: 0, on: false});
  } else {
    Shelly.call("Light.Set", {id: 0, on: true, brightness: ev.value});
  }
  statusText.setValue("Handstillt: " + ev.value + "%");
});

// Movie mode timer — dim to 5% after 10 minutes
movieTimer.on("change", function(ev) {
  if (ev.value) {
    statusText.setValue("Movie: dimming after 10 min");
    // Set to movie brightness now
    Shelly.call("Light.Set", {id: 0, on: true, brightness: 30});
    // After 10 minutes, dim to 5%
    movieTimerHandle = Timer.set(600000, false, function() {
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 5});
      brightness.setValue(5);
      statusText.setValue("Movie: dimmt");
      movieTimer.setValue(false);  // reset toggle
    });
  } else {
    if (movieTimerHandle) {
      Timer.clear(movieTimerHandle);
      movieTimerHandle = null;
    }
    statusText.setValue("Timer stopped");
  }
});

// Master off button
offButton.on("single_push", function() {
  Shelly.call("Light.Set", {id: 0, on: false});
  brightness.setValue(0);
  lightMode.setValue("away");
  statusText.setValue("All off");
  // Clear any running timers
  if (movieTimerHandle) {
    Timer.clear(movieTimerHandle);
    movieTimerHandle = null;
    movieTimer.setValue(false);
  }
  print("Master OFF");
});

// Initial status
statusText.setValue("Ready — " + lightMode.getValue());
print("Living Room controller started");
```

#### Step 3: HA dashboard card

```yaml
# Complete Living Room control section for your HA dashboard
type: vertical-stack
cards:
  - type: custom:mushroom-title-card
    title: Living Room
    subtitle: "{{ states('sensor.shelly_livingroom_text_203') }}"
  - type: grid
    columns: 2
    square: false
    cards:
      - type: custom:mushroom-select-card
        entity: select.shelly_livingroom_enum_200
        name: Lighting mode
        icon: mdi:lightbulb-group
        fill_container: true
      - type: custom:mushroom-entity-card
        entity: switch.shelly_livingroom_boolean_202
        name: Movieahamur
        icon: mdi:filmstrip
        fill_container: true
  - type: custom:mushroom-number-card
    entity: number.shelly_livingroom_number_201
    name: Brightness
    icon: mdi:brightness-percent
    fill_container: true
    display_mode: slider
  - type: custom:mushroom-entity-card
    entity: button.shelly_livingroom_button_204
    name: Turn off livingroom
    icon: mdi:power-off
    icon_color: red
    fill_container: true
    tap_action:
      action: call-service
      service: button.press
      target:
        entity_id: button.shelly_livingroom_button_204
```

---

## Part 6: Tips & Gotchas

### Persistence

- Set `persisted: true` for anything that should survive power outages (common in Iceland)
- Non-persisted values reset to `default_value` on reboot
- `Script.storage` is separate — use it for internal script state, not HA-visible data

### Source Tracking

Every value change includes a `source` field indicating who made the change:
- `"UI"` — Shelly app or web interface
- `"rpc"` — HTTP RPC call (from HA or curl)
- `"script"` — on-device script
- `"mqtt"` — MQTT publish

Use this to prevent feedback loops:
```javascript
myBool.on("change", function(ev) {
  if (ev.source === "script") return;  // don't react to our own changes
  // Only react to external changes (HA, app, etc.)
});
```

### Webhook Events

Each virtual type fires a webhook event on change:
- `boolean.change`, `number.change`, `text.change`, `enum.change`
- You can configure webhooks in the device's Actions menu to call external URLs

### Limits

- 10 virtual components max per device
- Text values max 200 characters
- IDs must be in range 200–299
- Max 5 concurrent RPC calls from scripts
- Gen3/Gen4 and Gen2 Pro only (not Gen2 Plus or Gen1)

### Bulk Setup Script

To deploy the same virtual layout across multiple Shelly devices:

```bash
#!/bin/bash
# deploy-virtuals.sh — Apply to multiple devices
DEVICES=("192.168.1.100" "192.168.1.101" "192.168.1.102")

for IP in "${DEVICES[@]}"; do
  echo "Setting up $IP..."
  curl -s -X POST -d '{"id":1,"method":"Virtual.Add","params":{"type":"boolean","id":200,"config":{"name":"Guest mode","persisted":true}}}' http://$IP/rpc
  curl -s -X POST -d '{"id":1,"method":"Virtual.Add","params":{"type":"button","id":204,"config":{"name":"Turn off all"}}}' http://$IP/rpc
  echo " done"
done
```

---

## Part 7: Setting Up Virtual Components in Home Assistant

This section walks through every step of getting virtual components visible, usable, and automated inside Home Assistant.

### Step 1: Prerequisites on the Shelly Side

Before HA can see your virtual components, they must exist on the device:

1. **Firmware version:** Ensure your device is running firmware **1.1.0 or newer** (check at `http://<device-ip>/rpc/Shelly.GetDeviceInfo`)
2. **Device generation:** Must be Gen3, Gen4, or Gen2 Pro — Gen2 Plus and Gen1 do not support virtual components
3. **Create the virtual components** using any of the methods from Part 1 (Web UI, RPC, or script)
4. **Give the device a name** in the Shelly web UI under Settings → Device Name (e.g., "Shelly Living Room"). This name becomes part of the HA entity IDs

### Step 2: Add the Shelly Device to HA (if not already added)

The Shelly integration uses mDNS auto-discovery, so most devices are found automatically.

**If auto-discovered:**
1. Go to **Settings → Devices & Services**
2. You should see a notification: "Discovered: Shelly ..."
3. Click **Configure** → **Submit**
4. The device and all its entities (including virtual components) are added

**If not auto-discovered (manual add):**
1. Go to **Settings → Devices & Services**
2. Click **+ Add Integration**
3. Search for **Shelly**
4. Enter the device IP address (e.g., `192.168.1.100`)
5. If the device has authentication enabled, enter the password
6. Click **Submit**

**If the device is behind a Range Extender:**
1. Follow manual add steps above
2. When prompted, enter the custom TCP port configured on the Range Extender
3. Only static IP or DHCP reserved IP is supported for devices behind Range Extenders

### Step 3: Getting HA to Discover New Virtual Components

If the Shelly device was **already in HA** when you created the virtual components, HA needs to be told to re-poll the device:

**Method A: Reload the integration (fastest)**
1. Go to **Settings → Devices & Services → Shelly**
2. Click the **⋮** (three dots) menu on the Shelly integration card
3. Click **Reload**
4. Wait 10–30 seconds for HA to re-query all Shelly devices

**Method B: Reconfigure the device**
1. Go to **Settings → Devices & Services → Shelly**
2. Find your specific device in the device list
3. Click on it → click **Reconfigure**
4. Submit to re-discover all entities

**Method C: Restart HA**
1. Go to **Settings → System → Restart**
2. This forces a full re-discovery of all integrations

**Method D: Wait for automatic poll**
- The Shelly integration polls devices approximately every 60 seconds for status updates
- New virtual components are typically picked up within 1–2 minutes automatically
- If they don't appear after 5 minutes, use Method A or B

### Step 4: Verify the Entities Appeared

1. Go to **Settings → Devices & Services → Shelly**
2. Click on your Shelly device (e.g., "Shelly Living Room")
3. You should see the virtual component entities listed alongside the physical entities:

```
Entity ID                                    Type       Description
─────────────────────────────────────────────────────────────────────
switch.shelly_livingroom_guest_mode                switch     Boolean (toggle mode)
select.shelly_livingroom_light_mode            select     Enum (dropdown mode)
number.shelly_livingroom_brightness                number     Number (slider mode)
sensor.shelly_livingroom_status                    sensor     Text (label mode)
button.shelly_livingroom_turn_off_livingroom            button     Button
light.shelly_livingroom_switch_0                  light      Physical relay
sensor.shelly_livingroom_power                    sensor     Physical power meter
...
```

**If entities are missing:**
- Check that the device firmware is 1.1.0+ (`http://<ip>/rpc/Shelly.GetDeviceInfo`)
- Verify components exist: `http://<ip>/rpc/Shelly.GetComponents?dynamic_only=true`
- Try Reload integration or Restart HA
- Check the HA logs at **Settings → System → Logs** and filter for "shelly"

### Step 5: Customize Entity Names and Icons

The Shelly integration generates entity IDs from the device name and component name. You can customize the display in HA:

**Via the UI:**
1. Go to **Settings → Devices & Services → Entities**
2. Find your virtual entity (search by name or entity_id)
3. Click on it → click the **gear icon** (⚙️)
4. Change:
   - **Name** — display name shown on dashboards
   - **Icon** — set a Material Design Icon (e.g., `mdi:account-group`)
   - **Entity ID** — change the entity_id if needed (e.g., rename to `switch.guest_mode_livingroom`)
   - **Area** — assign to a room/area (e.g., "Living Room")

**Via customize.yaml:**
```yaml
# configuration.yaml
homeassistant:
  customize: !include customize.yaml

# customize.yaml
switch.shelly_livingroom_guest_mode:
  friendly_name: "Guest mode"
  icon: mdi:account-group

select.shelly_livingroom_light_mode:
  friendly_name: "Lighting mode Stofu"
  icon: mdi:lightbulb-group

number.shelly_livingroom_brightness:
  friendly_name: "Brightness"
  icon: mdi:brightness-percent

sensor.shelly_livingroom_status:
  friendly_name: "Status Stofu"
  icon: mdi:information-outline

button.shelly_livingroom_turn_off_livingroom:
  friendly_name: "Turn off Stofu"
  icon: mdi:power-off
```

### Step 6: Assign Entities to Areas

For your Icelandic room naming convention:

1. Go to **Settings → Areas & Zones**
2. Create areas if they don't exist: Hallway, Kitchen, Living Room, Bedroom, Bathroom, Garage, Outdoor
3. Go to each device under **Settings → Devices & Services → Shelly → [device]**
4. Click **Area** and assign it to the correct room
5. All entities on that device automatically inherit the area assignment
6. Alternatively, assign individual entities to areas via the entity settings (gear icon)

### Step 7: Build Dashboard Controls

#### Mushroom Cards (recommended for your setup)

```yaml
# ── Living Room Virtual Components Control Panel ──

# Title with live status from text virtual
type: custom:mushroom-title-card
title: Living Room control panel
subtitle: "{{ states('sensor.shelly_livingroom_status') }}"

---

# Boolean toggle — Guest mode
type: custom:mushroom-entity-card
entity: switch.shelly_livingroom_guest_mode
name: Guest mode
icon: mdi:account-group
fill_container: true
tap_action:
  action: toggle
hold_action:
  action: more-info

---

# Enum select — Lighting scene
type: custom:mushroom-select-card
entity: select.shelly_livingroom_light_mode
name: Lighting mode
icon: mdi:lightbulb-group
fill_container: true

---

# Number slider — Brightness
type: custom:mushroom-number-card
entity: number.shelly_livingroom_brightness
name: Brightness
icon: mdi:brightness-percent
fill_container: true
display_mode: slider

---

# Button — Quick off
type: custom:mushroom-entity-card
entity: button.shelly_livingroom_turn_off_livingroom
name: Turn off livingroom
icon: mdi:power-off
icon_color: red
fill_container: true
tap_action:
  action: call-service
  service: button.press
  target:
    entity_id: button.shelly_livingroom_turn_off_livingroom

---

# Status text — read-only display
type: custom:mushroom-entity-card
entity: sensor.shelly_livingroom_status
name: Status
icon: mdi:information-outline
fill_container: true
```

#### Browser_mod Popup (detailed controls in a popup)

```yaml
# Main card that opens a popup with all virtual controls
type: custom:mushroom-template-card
primary: Living Room
secondary: "{{ states('select.shelly_livingroom_light_mode') }}"
icon: mdi:sofa
icon_color: >
  {% if is_state('select.shelly_livingroom_light_mode', 'away') %}
    gray
  {% elif is_state('select.shelly_livingroom_light_mode', 'night') %}
    deep-purple
  {% else %}
    amber
  {% endif %}
fill_container: true
tap_action:
  action: fire-dom-event
  browser_mod:
    service: browser_mod.popup
    data:
      title: Living Room control panel
      size: wide
      content:
        type: vertical-stack
        cards:
          - type: custom:mushroom-select-card
            entity: select.shelly_livingroom_light_mode
            name: Lighting mode
            fill_container: true
          - type: custom:mushroom-number-card
            entity: number.shelly_livingroom_brightness
            name: Brightness
            display_mode: slider
            fill_container: true
          - type: grid
            columns: 2
            square: false
            cards:
              - type: custom:mushroom-entity-card
                entity: switch.shelly_livingroom_guest_mode
                name: Guest mode
                fill_container: true
                tap_action:
                  action: toggle
              - type: custom:mushroom-entity-card
                entity: button.shelly_livingroom_turn_off_livingroom
                name: Turn off
                icon_color: red
                fill_container: true
                tap_action:
                  action: call-service
                  service: button.press
                  target:
                    entity_id: button.shelly_livingroom_turn_off_livingroom
          - type: custom:mushroom-entity-card
            entity: sensor.shelly_livingroom_status
            name: Status
            fill_container: true
```

### Step 8: Create HA Automations

#### Automation: React to Enum Scene Change

```yaml
automation:
  - id: livingroom_light_mode_breyting
    alias: "Living Room — Lighting mode breyting"
    description: "React when lighting mode is changed on the Shelly device or from HA"
    trigger:
      - platform: state
        entity_id: select.shelly_livingroom_light_mode
    condition: []
    action:
      - choose:
          - conditions:
              - condition: state
                entity_id: select.shelly_livingroom_light_mode
                state: "day"
            sequence:
              - service: light.turn_on
                target:
                  entity_id: light.livingroom_light_group
                data:
                  brightness_pct: 100
                  color_temp_kelvin: 4000
          - conditions:
              - condition: state
                entity_id: select.shelly_livingroom_light_mode
                state: "evening"
            sequence:
              - service: light.turn_on
                target:
                  entity_id: light.livingroom_light_group
                data:
                  brightness_pct: 40
                  color_temp_kelvin: 2700
          - conditions:
              - condition: state
                entity_id: select.shelly_livingroom_light_mode
                state: "movie"
            sequence:
              - service: light.turn_on
                target:
                  entity_id: light.livingroom_light_group
                data:
                  brightness_pct: 15
                  color_temp_kelvin: 2200
          - conditions:
              - condition: state
                entity_id: select.shelly_livingroom_light_mode
                state: "night"
            sequence:
              - service: light.turn_on
                target:
                  entity_id: light.livingroom_light_group
                data:
                  brightness_pct: 5
                  color_temp_kelvin: 2000
          - conditions:
              - condition: state
                entity_id: select.shelly_livingroom_light_mode
                state: "away"
            sequence:
              - service: light.turn_off
                target:
                  entity_id: light.livingroom_light_group
    mode: single
```

#### Automation: Sync Guest Mode Across All Rooms

```yaml
automation:
  - id: guest_mode_allir_bedroom
    alias: "Guest mode — Sync all bedroom"
    description: "When guest mode is toggled on Hallway, sync to all rooms"
    trigger:
      - platform: state
        entity_id: switch.shelly_hallway_guest_mode
    action:
      # Sync the boolean to all other Shelly devices with Guest mode virtual
      - service: "switch.turn_{{ trigger.to_state.state }}"
        target:
          entity_id:
            - switch.shelly_livingroom_guest_mode
            - switch.shelly_kitchen_guest_mode
            - switch.shelly_bedroom_guest_mode
      # Set lights based on mode
      - if:
          - condition: state
            entity_id: switch.shelly_hallway_guest_mode
            state: "on"
        then:
          - service: light.turn_on
            target:
              entity_id: all
            data:
              brightness_pct: 30
          - service: notify.mobile_app
            data:
              title: "Guest mode on"
              message: "All lights set to 30%"
        else:
          - service: notify.mobile_app
            data:
              title: "Guest mode off"
              message: "Light back to normal"
    mode: single
```

#### Automation: Virtual Button as Scene Trigger

```yaml
automation:
  - id: turn_off_ollu_takki
    alias: "Turn off all — Button"
    description: "Master off button pressed on any Shelly"
    trigger:
      # Listen for button press on ALL Shelly devices that have this virtual
      - platform: state
        entity_id:
          - button.shelly_hallway_turn_off_all
          - button.shelly_livingroom_turn_off_all
          - button.shelly_kitchen_turn_off_all
    action:
      - service: light.turn_off
        target:
          entity_id: all
      - service: switch.turn_off
        target:
          entity_id:
            - switch.shelly_livingroom_guest_mode
            - switch.shelly_hallway_guest_mode
      # Reset all scene selectors to "away"
      - service: select.select_option
        target:
          entity_id:
            - select.shelly_livingroom_light_mode
            - select.shelly_kitchen_light_mode
        data:
          option: "away"
    mode: single
```

#### Automation: Number Virtual as Threshold Monitor

```yaml
automation:
  - id: hitastig_vidvorun
    alias: "Temperature — Alert if over threshold"
    description: "Alert when temperature exceeds the configurable threshold"
    trigger:
      - platform: numeric_state
        entity_id: sensor.shelly_kitchen_temperature
        above: input_number.hitavidburdur_throskuld
        # Or use the Shelly number virtual directly:
        # above: number.shelly_kitchen_number_201
    action:
      - service: notify.mobile_app
        data:
          title: "Temp alert"
          message: >
            Temperature in kitchen is {{ states('sensor.shelly_kitchen_temperature') }}°C,
            over threshold ({{ states('number.shelly_kitchen_number_201') }}°C)
    mode: single
```

### Step 9: Use HA Services to Control Virtuals

You can control Shelly virtual components from HA using standard services. Here's every service available for each type:

```yaml
# ── BOOLEAN (switch entity) ──
# Turn on
service: switch.turn_on
target:
  entity_id: switch.shelly_livingroom_guest_mode

# Turn off
service: switch.turn_off
target:
  entity_id: switch.shelly_livingroom_guest_mode

# Toggle
service: switch.toggle
target:
  entity_id: switch.shelly_livingroom_guest_mode


# ── NUMBER (number entity) ──
# Set value
service: number.set_value
target:
  entity_id: number.shelly_livingroom_brightness
data:
  value: 75


# ── TEXT (text entity, field mode only) ──
# Set value
service: text.set_value
target:
  entity_id: text.shelly_livingroom_text_202
data:
  value: "New message from HA"


# ── ENUM (select entity) ──
# Select an option
service: select.select_option
target:
  entity_id: select.shelly_livingroom_light_mode
data:
  option: "evening"

# Select first option
service: select.select_first
target:
  entity_id: select.shelly_livingroom_light_mode

# Select last option
service: select.select_last
target:
  entity_id: select.shelly_livingroom_light_mode

# Select next option (cycle forward)
service: select.select_next
target:
  entity_id: select.shelly_livingroom_light_mode
data:
  cycle: true

# Select previous option (cycle backward)
service: select.select_previous
target:
  entity_id: select.shelly_livingroom_light_mode
data:
  cycle: true


# ── BUTTON (button entity) ──
# Press the button (triggers event on Shelly device)
service: button.press
target:
  entity_id: button.shelly_livingroom_turn_off_livingroom
```

### Step 10: Template Sensors and Helpers

You can create HA template sensors that derive values from virtual components:

```yaml
# configuration.yaml or via UI helpers

# Template sensor: combine multiple virtual states into one
template:
  - sensor:
      - name: "Living Room hamur samantekt"
        unique_id: livingroom_hamur_samantekt
        state: >
          {% set mode = states('select.shelly_livingroom_light_mode') %}
          {% set guest = is_state('switch.shelly_livingroom_guest_mode', 'on') %}
          {% set brightness = states('number.shelly_livingroom_brightness') | int(0) %}
          {% if guest %}Gestir ({{ brightness }}%)
          {% else %}{{ mode | title }} ({{ brightness }}%)
          {% endif %}
        icon: mdi:sofa

      # Combine all room scene selectors into one status
      - name: "Whole-house mode"
        unique_id: heildarhamur_huss
        state: >
          {% set rooms = [
            states('select.shelly_livingroom_light_mode'),
            states('select.shelly_kitchen_light_mode'),
            states('select.shelly_bedroom_light_mode')
          ] %}
          {% if rooms | unique | list | length == 1 %}
            {{ rooms[0] | title }}
          {% else %}
            Mixed
          {% endif %}
        icon: mdi:home

# Input select helper: mirror a Shelly enum for use in other automations
input_select:
  house_mode:
    name: "House mode"
    options:
      - day
      - evening
      - movie
      - night
      - away
    initial: day
    icon: mdi:home-lightbulb

# Automation to sync input_select → all Shelly enums
automation:
  - id: sync_house_mode
    alias: "Sync House mode to all Shellys"
    trigger:
      - platform: state
        entity_id: input_select.house_mode
    action:
      - service: select.select_option
        target:
          entity_id:
            - select.shelly_livingroom_light_mode
            - select.shelly_kitchen_light_mode
            - select.shelly_bedroom_light_mode
        data:
          option: "{{ states('input_select.house_mode') }}"
```

### Step 11: Use with Shelly KVS (Key-Value Storage) from HA

HA 2024.2+ added `shelly.get_kvs_value` and `shelly.set_kvs_value` actions. These let you read/write arbitrary key-value data on the Shelly device — separate from virtual components, but useful alongside them:

```yaml
# Set a KVS value on the device (scripts can read this)
service: shelly.set_kvs_value
data:
  device_id: "abc123def456"  # from HA device info
  key: "ha_last_scene"
  value: "evening"

# Get a KVS value (useful in scripts/automations via response variable)
service: shelly.get_kvs_value
data:
  device_id: "abc123def456"
  key: "ha_last_scene"
response_variable: kvs_result
# kvs_result.value contains the stored value
```

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Virtual entities don't appear in HA | Reload the Shelly integration or restart HA. Verify components exist: `http://<ip>/rpc/Shelly.GetComponents?dynamic_only=true` |
| "Setup error: Check the protocols" | Update HA Core to latest version. Known issue in 2025.2.1, fixed in 2025.2.2+ |
| Entity shows "unavailable" | Check device is online, firmware is 1.1.0+, and device is Gen3/Gen4/Gen2 Pro |
| Changes from HA don't reach Shelly | Ensure device IP hasn't changed (use static IP / DHCP reservation) |
| Changes from Shelly don't reach HA | Push updates should work automatically. Check that HA can reach the device on the network |
| Entity name is wrong | Change the component name on the Shelly device, then reload integration. Or customize in HA |
| Too many entities on one device | Max 10 virtual components per device. Spread across multiple devices |
| Boolean shows as binary_sensor (not switch) | Change the view mode from "label" to "toggle" on the Shelly device |
| Enum shows as sensor (not select) | Change the view mode from "label" to "dropdown" on the Shelly device |
