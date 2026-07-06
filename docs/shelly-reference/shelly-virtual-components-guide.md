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
   - **Name** — display name (use Icelandic: "Gestamódi", "Lýsingarhamur", etc.)
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
      "name":"Gestamódi",
      "persisted":true,
      "default_value":false,
      "meta":{"ui":{"view":"toggle","titles":["Slökkt","Kveikt"]}}
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
      "name":"Hitastig",
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
      "name":"Lýsingarhamur",
      "options":["dagur","kvold","kvikmynd","nott","burt"],
      "default_value":"dagur",
      "persisted":true,
      "meta":{"ui":{"view":"dropdown","titles":{
        "dagur":"Dagljós",
        "kvold":"Kvöldbirta",
        "kvikmynd":"Kvikmynd",
        "nott":"Næturljós",
        "burt":"Allt slökkt"
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
      "name":"Staða",
      "default_value":"Ekkert nýtt",
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
      "name":"Slökkva allt"
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
        name: "Gestamódi",
        persisted: true,
        default_value: false,
        meta: { ui: { view: "toggle", titles: ["Slökkt", "Kveikt"] } }
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
| `meta.ui.titles` | array[2] | Labels for [false, true]: `["Lokað", "Opið"]` |
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
| `options` | array | Allowed values: `["dagur","kvold","nott"]` |
| `persisted` | boolean | Keep value across reboots |
| `default_value` | string\|null | One of the options or null |
| `meta.ui.view` | string | `"dropdown"` = select list, `"label"` = read-only |
| `meta.ui.titles` | object | Friendly names: `{"dagur":"Dagljós"}` |

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
# → {"value":"kvold","source":"UI","last_update_ts":1700864253}

# Write
curl "http://192.168.1.100/rpc/Boolean.Set?id=200&value=true"
curl "http://192.168.1.100/rpc/Number.Set?id=201&value=25.0"
curl "http://192.168.1.100/rpc/Enum.Set?id=203&value=%22nott%22"
curl "http://192.168.1.100/rpc/Text.Set?id=202&value=%22Allt%20í%20lagi%22"

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
let mode    = lightMode.getValue();     // "kvold"

// Write values
guestMode.setValue(true);
tempSet.setValue(24.0);
statusTxt.setValue("Uppfært: " + new Date().toISOString());
lightMode.setValue("nott");

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
    case "dagur":
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 100});
      break;
    case "kvold":
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 40});
      break;
    case "kvikmynd":
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 15});
      break;
    case "nott":
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 5});
      break;
    case "burt":
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
  statusTxt.setValue("Slökkt á öllu kl. " + new Date().toLocaleTimeString());
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
  switch.shelly_stofa_boolean_200        (boolean in toggle mode)
  binary_sensor.shelly_stofa_boolean_200 (boolean in label mode)
  number.shelly_stofa_number_201         (number in field or slider mode)
  sensor.shelly_stofa_text_202           (text in label mode)
  text.shelly_stofa_text_202             (text in field mode)
  select.shelly_stofa_enum_203           (enum in dropdown mode)
  sensor.shelly_stofa_enum_203           (enum in label mode)
  button.shelly_stofa_button_204         (button)
```

### HA Automation Examples

```yaml
# Trigger on enum (scene selector) change
automation:
  - alias: "Stofa lýsingarhamur"
    trigger:
      - platform: state
        entity_id: select.shelly_stofa_enum_203
    action:
      - choose:
          - conditions:
              - condition: state
                entity_id: select.shelly_stofa_enum_203
                state: "dagur"
            sequence:
              - service: scene.turn_on
                target:
                  entity_id: scene.stofa_dagljós
          - conditions:
              - condition: state
                entity_id: select.shelly_stofa_enum_203
                state: "kvold"
            sequence:
              - service: scene.turn_on
                target:
                  entity_id: scene.stofa_kvoldbirta
          - conditions:
              - condition: state
                entity_id: select.shelly_stofa_enum_203
                state: "burt"
            sequence:
              - service: light.turn_off
                target:
                  entity_id: light.stofa_ljos_group

# React to boolean toggle from device
automation:
  - alias: "Gestamódi kveikt"
    trigger:
      - platform: state
        entity_id: switch.shelly_forstofa_boolean_200
        to: "on"
    action:
      - service: light.turn_on
        target:
          entity_id: light.stofa_ljos_group
        data:
          brightness_pct: 30
      - service: notify.mobile_app
        data:
          title: "Gestamódi"
          message: "Gestamódi kveikt — ljós stillt á 30%"

# Set a number virtual from HA (e.g., from an input_number helper)
automation:
  - alias: "Sync temperature setpoint"
    trigger:
      - platform: state
        entity_id: input_number.target_temperature
    action:
      - service: number.set_value
        target:
          entity_id: number.shelly_eldhus_number_201
        data:
          value: "{{ states('input_number.target_temperature') }}"

# Press virtual button from HA automation
automation:
  - alias: "Slökkva öllu við miðnætti"
    trigger:
      - platform: time
        at: "00:00:00"
    action:
      - service: button.press
        target:
          entity_id: button.shelly_forstofa_button_204
```

### Mushroom Dashboard Cards

```yaml
# Boolean toggle — Mushroom entity card
type: custom:mushroom-entity-card
entity: switch.shelly_forstofa_boolean_200
name: Gestamódi
icon: mdi:account-group
fill_container: true
tap_action:
  action: toggle

# Enum select — Mushroom select card
type: custom:mushroom-select-card
entity: select.shelly_stofa_enum_203
name: Lýsingarhamur
icon: mdi:lightbulb-group
fill_container: true

# Number slider — Mushroom number card
type: custom:mushroom-number-card
entity: number.shelly_eldhus_number_201
name: Hitastig
icon: mdi:thermometer
fill_container: true
display_mode: slider

# Status text — Mushroom entity card
type: custom:mushroom-entity-card
entity: sensor.shelly_forstofa_text_202
name: Staða
icon: mdi:information
fill_container: true

# Button — Mushroom entity card with tap action
type: custom:mushroom-entity-card
entity: button.shelly_forstofa_button_204
name: Slökkva allt
icon: mdi:power-off
fill_container: true
tap_action:
  action: call-service
  service: button.press
  target:
    entity_id: button.shelly_forstofa_button_204
```

---

## Part 5: Complete Working Example

### Scenario: Stofa (living room) lighting controller

This sets up a Shelly Gen3/Gen4 device in your Stofa with:
- **Enum** for selecting lighting mode (5 scenes)
- **Number** for setting custom brightness percentage
- **Boolean** for enabling "movie mode" dim timer
- **Text** for displaying current status
- **Button** for quick all-off

#### Step 1: Create all virtuals via script (runs once)

```javascript
// stofa-setup.js — Run once to create virtual components
// After running, disable this script and enable the main controller script

let components = [
  { type: "enum", id: 200, config: {
    name: "Lýsingarhamur", persisted: true, default_value: "dagur",
    options: ["dagur","kvold","kvikmynd","nott","burt"],
    meta: { ui: { view: "dropdown", titles: {
      dagur: "Dagljós", kvold: "Kvöldbirta",
      kvikmynd: "Kvikmynd", nott: "Næturljós", burt: "Allt slökkt"
    }}}
  }},
  { type: "number", id: 201, config: {
    name: "Birtustig", min: 0, max: 100, default_value: 100, persisted: true,
    meta: { ui: { view: "slider", unit: "%", step: 5 }}
  }},
  { type: "boolean", id: 202, config: {
    name: "Kvikmyndahamur tímasettur", persisted: false, default_value: false,
    meta: { ui: { view: "toggle", titles: ["Slökkt", "Kveikt"] }}
  }},
  { type: "text", id: 203, config: {
    name: "Stofa staða", default_value: "Tilbúið",
    meta: { ui: { view: "label" }}
  }},
  { type: "button", id: 204, config: {
    name: "Slökkva stofu"
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
        name: "Stofa stjórnborð",
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
// stofa-controller.js — Main automation script
// Set to run on startup

let lightMode   = Virtual.getHandle("enum:200");
let brightness  = Virtual.getHandle("number:201");
let movieTimer  = Virtual.getHandle("boolean:202");
let statusText  = Virtual.getHandle("text:203");
let offButton   = Virtual.getHandle("button:204");

// Brightness presets per mode
let presets = {
  dagur:     100,
  kvold:     40,
  kvikmynd:  15,
  nott:      5,
  burt:      0
};

let movieTimerHandle = null;

// Apply lighting based on mode
function applyMode(mode) {
  let brt = presets[mode];
  if (typeof brt === "undefined") return;

  if (brt === 0) {
    Shelly.call("Light.Set", {id: 0, on: false});
    statusText.setValue("Slökkt");
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
    statusText.setValue("Kvikmynd: dimmast eftir 10 mín");
    // Set to movie brightness now
    Shelly.call("Light.Set", {id: 0, on: true, brightness: 30});
    // After 10 minutes, dim to 5%
    movieTimerHandle = Timer.set(600000, false, function() {
      Shelly.call("Light.Set", {id: 0, on: true, brightness: 5});
      brightness.setValue(5);
      statusText.setValue("Kvikmynd: dimmt");
      movieTimer.setValue(false);  // reset toggle
    });
  } else {
    if (movieTimerHandle) {
      Timer.clear(movieTimerHandle);
      movieTimerHandle = null;
    }
    statusText.setValue("Tímastilling hætt");
  }
});

// Master off button
offButton.on("single_push", function() {
  Shelly.call("Light.Set", {id: 0, on: false});
  brightness.setValue(0);
  lightMode.setValue("burt");
  statusText.setValue("Slökkt á öllu");
  // Clear any running timers
  if (movieTimerHandle) {
    Timer.clear(movieTimerHandle);
    movieTimerHandle = null;
    movieTimer.setValue(false);
  }
  print("Master OFF");
});

// Initial status
statusText.setValue("Tilbúið — " + lightMode.getValue());
print("Stofa controller started");
```

#### Step 3: HA dashboard card

```yaml
# Complete Stofa control section for your HA dashboard
type: vertical-stack
cards:
  - type: custom:mushroom-title-card
    title: Stofa
    subtitle: "{{ states('sensor.shelly_stofa_text_203') }}"
  - type: grid
    columns: 2
    square: false
    cards:
      - type: custom:mushroom-select-card
        entity: select.shelly_stofa_enum_200
        name: Lýsingarhamur
        icon: mdi:lightbulb-group
        fill_container: true
      - type: custom:mushroom-entity-card
        entity: switch.shelly_stofa_boolean_202
        name: Kvikmyndahamur
        icon: mdi:filmstrip
        fill_container: true
  - type: custom:mushroom-number-card
    entity: number.shelly_stofa_number_201
    name: Birtustig
    icon: mdi:brightness-percent
    fill_container: true
    display_mode: slider
  - type: custom:mushroom-entity-card
    entity: button.shelly_stofa_button_204
    name: Slökkva stofu
    icon: mdi:power-off
    icon_color: red
    fill_container: true
    tap_action:
      action: call-service
      service: button.press
      target:
        entity_id: button.shelly_stofa_button_204
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
  curl -s -X POST -d '{"id":1,"method":"Virtual.Add","params":{"type":"boolean","id":200,"config":{"name":"Gestamódi","persisted":true}}}' http://$IP/rpc
  curl -s -X POST -d '{"id":1,"method":"Virtual.Add","params":{"type":"button","id":204,"config":{"name":"Slökkva allt"}}}' http://$IP/rpc
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
4. **Give the device a name** in the Shelly web UI under Settings → Device Name (e.g., "Shelly Stofa"). This name becomes part of the HA entity IDs

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
2. Click on your Shelly device (e.g., "Shelly Stofa")
3. You should see the virtual component entities listed alongside the physical entities:

```
Entity ID                                    Type       Description
─────────────────────────────────────────────────────────────────────
switch.shelly_stofa_gestamodi                switch     Boolean (toggle mode)
select.shelly_stofa_lysingarhamur            select     Enum (dropdown mode)
number.shelly_stofa_birtustig                number     Number (slider mode)
sensor.shelly_stofa_stada                    sensor     Text (label mode)
button.shelly_stofa_slokkva_stofu            button     Button
light.shelly_stofa_switch_0                  light      Physical relay
sensor.shelly_stofa_power                    sensor     Physical power meter
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
   - **Entity ID** — change the entity_id if needed (e.g., rename to `switch.gestamodi_stofa`)
   - **Area** — assign to a room/area (e.g., "Stofa")

**Via customize.yaml:**
```yaml
# configuration.yaml
homeassistant:
  customize: !include customize.yaml

# customize.yaml
switch.shelly_stofa_gestamodi:
  friendly_name: "Gestamódi"
  icon: mdi:account-group

select.shelly_stofa_lysingarhamur:
  friendly_name: "Lýsingarhamur Stofu"
  icon: mdi:lightbulb-group

number.shelly_stofa_birtustig:
  friendly_name: "Birtustig"
  icon: mdi:brightness-percent

sensor.shelly_stofa_stada:
  friendly_name: "Staða Stofu"
  icon: mdi:information-outline

button.shelly_stofa_slokkva_stofu:
  friendly_name: "Slökkva Stofu"
  icon: mdi:power-off
```

### Step 6: Assign Entities to Areas

For your Icelandic room naming convention:

1. Go to **Settings → Areas & Zones**
2. Create areas if they don't exist: Forstofa, Eldhús, Stofa, Herbergi, Baðherbergi, Bílskúr, Úti
3. Go to each device under **Settings → Devices & Services → Shelly → [device]**
4. Click **Area** and assign it to the correct room
5. All entities on that device automatically inherit the area assignment
6. Alternatively, assign individual entities to areas via the entity settings (gear icon)

### Step 7: Build Dashboard Controls

#### Mushroom Cards (recommended for your setup)

```yaml
# ── Stofa Virtual Components Control Panel ──

# Title with live status from text virtual
type: custom:mushroom-title-card
title: Stofa stjórnborð
subtitle: "{{ states('sensor.shelly_stofa_stada') }}"

---

# Boolean toggle — Guest mode
type: custom:mushroom-entity-card
entity: switch.shelly_stofa_gestamodi
name: Gestamódi
icon: mdi:account-group
fill_container: true
tap_action:
  action: toggle
hold_action:
  action: more-info

---

# Enum select — Lighting scene
type: custom:mushroom-select-card
entity: select.shelly_stofa_lysingarhamur
name: Lýsingarhamur
icon: mdi:lightbulb-group
fill_container: true

---

# Number slider — Brightness
type: custom:mushroom-number-card
entity: number.shelly_stofa_birtustig
name: Birtustig
icon: mdi:brightness-percent
fill_container: true
display_mode: slider

---

# Button — Quick off
type: custom:mushroom-entity-card
entity: button.shelly_stofa_slokkva_stofu
name: Slökkva stofu
icon: mdi:power-off
icon_color: red
fill_container: true
tap_action:
  action: call-service
  service: button.press
  target:
    entity_id: button.shelly_stofa_slokkva_stofu

---

# Status text — read-only display
type: custom:mushroom-entity-card
entity: sensor.shelly_stofa_stada
name: Staða
icon: mdi:information-outline
fill_container: true
```

#### Browser_mod Popup (detailed controls in a popup)

```yaml
# Main card that opens a popup with all virtual controls
type: custom:mushroom-template-card
primary: Stofa
secondary: "{{ states('select.shelly_stofa_lysingarhamur') }}"
icon: mdi:sofa
icon_color: >
  {% if is_state('select.shelly_stofa_lysingarhamur', 'burt') %}
    gray
  {% elif is_state('select.shelly_stofa_lysingarhamur', 'nott') %}
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
      title: Stofa stjórnborð
      size: wide
      content:
        type: vertical-stack
        cards:
          - type: custom:mushroom-select-card
            entity: select.shelly_stofa_lysingarhamur
            name: Lýsingarhamur
            fill_container: true
          - type: custom:mushroom-number-card
            entity: number.shelly_stofa_birtustig
            name: Birtustig
            display_mode: slider
            fill_container: true
          - type: grid
            columns: 2
            square: false
            cards:
              - type: custom:mushroom-entity-card
                entity: switch.shelly_stofa_gestamodi
                name: Gestamódi
                fill_container: true
                tap_action:
                  action: toggle
              - type: custom:mushroom-entity-card
                entity: button.shelly_stofa_slokkva_stofu
                name: Slökkva
                icon_color: red
                fill_container: true
                tap_action:
                  action: call-service
                  service: button.press
                  target:
                    entity_id: button.shelly_stofa_slokkva_stofu
          - type: custom:mushroom-entity-card
            entity: sensor.shelly_stofa_stada
            name: Staða
            fill_container: true
```

### Step 8: Create HA Automations

#### Automation: React to Enum Scene Change

```yaml
automation:
  - id: stofa_lysingarhamur_breyting
    alias: "Stofa — Lýsingarhamur breyting"
    description: "React when lighting mode is changed on the Shelly device or from HA"
    trigger:
      - platform: state
        entity_id: select.shelly_stofa_lysingarhamur
    condition: []
    action:
      - choose:
          - conditions:
              - condition: state
                entity_id: select.shelly_stofa_lysingarhamur
                state: "dagur"
            sequence:
              - service: light.turn_on
                target:
                  entity_id: light.stofa_ljos_group
                data:
                  brightness_pct: 100
                  color_temp_kelvin: 4000
          - conditions:
              - condition: state
                entity_id: select.shelly_stofa_lysingarhamur
                state: "kvold"
            sequence:
              - service: light.turn_on
                target:
                  entity_id: light.stofa_ljos_group
                data:
                  brightness_pct: 40
                  color_temp_kelvin: 2700
          - conditions:
              - condition: state
                entity_id: select.shelly_stofa_lysingarhamur
                state: "kvikmynd"
            sequence:
              - service: light.turn_on
                target:
                  entity_id: light.stofa_ljos_group
                data:
                  brightness_pct: 15
                  color_temp_kelvin: 2200
          - conditions:
              - condition: state
                entity_id: select.shelly_stofa_lysingarhamur
                state: "nott"
            sequence:
              - service: light.turn_on
                target:
                  entity_id: light.stofa_ljos_group
                data:
                  brightness_pct: 5
                  color_temp_kelvin: 2000
          - conditions:
              - condition: state
                entity_id: select.shelly_stofa_lysingarhamur
                state: "burt"
            sequence:
              - service: light.turn_off
                target:
                  entity_id: light.stofa_ljos_group
    mode: single
```

#### Automation: Sync Guest Mode Across All Rooms

```yaml
automation:
  - id: gestamodi_allir_herbergi
    alias: "Gestamódi — Samstilla öll herbergi"
    description: "When guest mode is toggled on Forstofa, sync to all rooms"
    trigger:
      - platform: state
        entity_id: switch.shelly_forstofa_gestamodi
    action:
      # Sync the boolean to all other Shelly devices with Gestamódi virtual
      - service: "switch.turn_{{ trigger.to_state.state }}"
        target:
          entity_id:
            - switch.shelly_stofa_gestamodi
            - switch.shelly_eldhus_gestamodi
            - switch.shelly_herbergi_gestamodi
      # Set lights based on mode
      - if:
          - condition: state
            entity_id: switch.shelly_forstofa_gestamodi
            state: "on"
        then:
          - service: light.turn_on
            target:
              entity_id: all
            data:
              brightness_pct: 30
          - service: notify.mobile_app
            data:
              title: "Gestamódi kveikt"
              message: "Öll ljós stillt á 30%"
        else:
          - service: notify.mobile_app
            data:
              title: "Gestamódi slökkt"
              message: "Ljós aftur í venjulegu"
    mode: single
```

#### Automation: Virtual Button as Scene Trigger

```yaml
automation:
  - id: slokkva_ollu_takki
    alias: "Slökkva öllu — Takki"
    description: "Master off button pressed on any Shelly"
    trigger:
      # Listen for button press on ALL Shelly devices that have this virtual
      - platform: state
        entity_id:
          - button.shelly_forstofa_slokkva_allt
          - button.shelly_stofa_slokkva_allt
          - button.shelly_eldhus_slokkva_allt
    action:
      - service: light.turn_off
        target:
          entity_id: all
      - service: switch.turn_off
        target:
          entity_id:
            - switch.shelly_stofa_gestamodi
            - switch.shelly_forstofa_gestamodi
      # Reset all scene selectors to "burt"
      - service: select.select_option
        target:
          entity_id:
            - select.shelly_stofa_lysingarhamur
            - select.shelly_eldhus_lysingarhamur
        data:
          option: "burt"
    mode: single
```

#### Automation: Number Virtual as Threshold Monitor

```yaml
automation:
  - id: hitastig_vidvorun
    alias: "Hitastig — Viðvörun ef yfir þröskuldi"
    description: "Alert when temperature exceeds the configurable threshold"
    trigger:
      - platform: numeric_state
        entity_id: sensor.shelly_eldhus_temperature
        above: input_number.hitavidburdur_throskuld
        # Or use the Shelly number virtual directly:
        # above: number.shelly_eldhus_number_201
    action:
      - service: notify.mobile_app
        data:
          title: "Hitaviðvörun"
          message: >
            Hitastig í eldhúsi er {{ states('sensor.shelly_eldhus_temperature') }}°C,
            yfir þröskuldi ({{ states('number.shelly_eldhus_number_201') }}°C)
    mode: single
```

### Step 9: Use HA Services to Control Virtuals

You can control Shelly virtual components from HA using standard services. Here's every service available for each type:

```yaml
# ── BOOLEAN (switch entity) ──
# Turn on
service: switch.turn_on
target:
  entity_id: switch.shelly_stofa_gestamodi

# Turn off
service: switch.turn_off
target:
  entity_id: switch.shelly_stofa_gestamodi

# Toggle
service: switch.toggle
target:
  entity_id: switch.shelly_stofa_gestamodi


# ── NUMBER (number entity) ──
# Set value
service: number.set_value
target:
  entity_id: number.shelly_stofa_birtustig
data:
  value: 75


# ── TEXT (text entity, field mode only) ──
# Set value
service: text.set_value
target:
  entity_id: text.shelly_stofa_text_202
data:
  value: "Ný skilaboð frá HA"


# ── ENUM (select entity) ──
# Select an option
service: select.select_option
target:
  entity_id: select.shelly_stofa_lysingarhamur
data:
  option: "kvold"

# Select first option
service: select.select_first
target:
  entity_id: select.shelly_stofa_lysingarhamur

# Select last option
service: select.select_last
target:
  entity_id: select.shelly_stofa_lysingarhamur

# Select next option (cycle forward)
service: select.select_next
target:
  entity_id: select.shelly_stofa_lysingarhamur
data:
  cycle: true

# Select previous option (cycle backward)
service: select.select_previous
target:
  entity_id: select.shelly_stofa_lysingarhamur
data:
  cycle: true


# ── BUTTON (button entity) ──
# Press the button (triggers event on Shelly device)
service: button.press
target:
  entity_id: button.shelly_stofa_slokkva_stofu
```

### Step 10: Template Sensors and Helpers

You can create HA template sensors that derive values from virtual components:

```yaml
# configuration.yaml or via UI helpers

# Template sensor: combine multiple virtual states into one
template:
  - sensor:
      - name: "Stofa hamur samantekt"
        unique_id: stofa_hamur_samantekt
        state: >
          {% set mode = states('select.shelly_stofa_lysingarhamur') %}
          {% set guest = is_state('switch.shelly_stofa_gestamodi', 'on') %}
          {% set brightness = states('number.shelly_stofa_birtustig') | int(0) %}
          {% if guest %}Gestir ({{ brightness }}%)
          {% else %}{{ mode | title }} ({{ brightness }}%)
          {% endif %}
        icon: mdi:sofa

      # Combine all room scene selectors into one status
      - name: "Heildarhamur húss"
        unique_id: heildarhamur_huss
        state: >
          {% set rooms = [
            states('select.shelly_stofa_lysingarhamur'),
            states('select.shelly_eldhus_lysingarhamur'),
            states('select.shelly_herbergi_lysingarhamur')
          ] %}
          {% if rooms | unique | list | length == 1 %}
            {{ rooms[0] | title }}
          {% else %}
            Blandað
          {% endif %}
        icon: mdi:home

# Input select helper: mirror a Shelly enum for use in other automations
input_select:
  hushamur:
    name: "Húshamur"
    options:
      - dagur
      - kvold
      - kvikmynd
      - nott
      - burt
    initial: dagur
    icon: mdi:home-lightbulb

# Automation to sync input_select → all Shelly enums
automation:
  - id: sync_hushamur
    alias: "Sync Húshamur to all Shellys"
    trigger:
      - platform: state
        entity_id: input_select.hushamur
    action:
      - service: select.select_option
        target:
          entity_id:
            - select.shelly_stofa_lysingarhamur
            - select.shelly_eldhus_lysingarhamur
            - select.shelly_herbergi_lysingarhamur
        data:
          option: "{{ states('input_select.hushamur') }}"
```

### Step 11: Use with Shelly KVS (Key-Value Storage) from HA

HA 2024.2+ added `shelly.get_kvs_value` and `shelly.set_kvs_value` actions. These let you read/write arbitrary key-value data on the Shelly device — separate from virtual components, but useful alongside them:

```yaml
# Set a KVS value on the device (scripts can read this)
service: shelly.set_kvs_value
data:
  device_id: "abc123def456"  # from HA device info
  key: "ha_last_scene"
  value: "kvold"

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
