# Shelly + Home Assistant Integration Strategy
## Best Practices for a 2700+ Entity Smart Home

*Tailored for Davíð's HA instance with Shelly, ZHA, Hue, ESPHome, Matter, Tuya, Z2M, WLED, Tasmota, TP-Link Kasa, Sonos, and deCONZ integrations across Icelandic-named rooms.*

---

## 1. Architecture: Where Should the Logic Live?

The fundamental question is: should intelligence run on the Shelly device (mJS scripts), in Home Assistant (automations), or in a hybrid split? The answer depends on what you're automating.

### Decision Framework

```
┌─────────────────────────────────────────────────────────────┐
│                    WHERE DOES LOGIC BELONG?                  │
├────────────────────┬────────────────────┬───────────────────┤
│   SHELLY SCRIPT    │      HYBRID        │   HA AUTOMATION   │
│   (on-device)      │   (split duties)   │   (centralized)   │
├────────────────────┼────────────────────┼───────────────────┤
│ Must work if HA    │ Shelly handles     │ Crosses multiple  │
│ is offline         │ time-critical      │ integrations      │
│                    │ response           │ (Shelly + Hue +   │
│ Sub-second         │                    │ Sonos + ZHA)      │
│ response needed    │ HA handles         │                   │
│                    │ coordination       │ Needs HA state    │
│ Single-device      │ across rooms       │ (person, sun,     │
│ logic only         │                    │ calendar, etc.)   │
│                    │ Virtual components │                   │
│ Safety-critical    │ bridge the two     │ Complex conditions│
│ (overcurrent,      │                    │ with templates    │
│ flooding, etc.)    │                    │                   │
│                    │                    │ Dashboard-driven  │
│ BLE sensor         │                    │ (user picks mode  │
│ processing         │                    │ from HA UI)       │
└────────────────────┴────────────────────┴───────────────────┘
```

### Tier 1: On-Device Only (Shelly Script)

Use for logic that **must never fail**, even if HA is down, rebooting, or your network has issues — common in Iceland with power fluctuations.

**Examples:**
- Input button handling (short/long/double press → local relay action)
- Overcurrent protection (power > threshold → kill relay)
- BLE sensor reading and gateway forwarding
- Staircase timer (press → on → auto-off after X minutes)
- Dimmer ramp up/down on long press
- Device-to-device direct control (Shelly A calls Shelly B via HTTP)

**Rule:** If losing HA would make a light switch stop working, the logic must be on-device.

### Tier 2: Hybrid (Script + HA via Virtual Components)

The most powerful pattern for your setup. The Shelly handles the time-critical local response, then virtual components act as the bridge to HA for coordination.

**The pattern:**
```
User presses button
    → Shelly script: instant local toggle (< 10ms)
    → Shelly script: update virtual boolean/enum
    → HA: sees virtual entity change
    → HA automation: coordinates other devices (Hue, Sonos, ZHA sensors)
```

**Examples:**
- Scene selector: Shelly enum virtual controls local lights instantly; HA reads the enum and adjusts Hue, WLED strips, Sonos volume
- Guest mode: Shelly boolean toggle dims local light immediately; HA syncs across all rooms, sets alarm state, adjusts thermostat
- Power monitoring: Shelly script reads power, sets a virtual number with current watts; HA uses it for energy dashboard and alerts

**Key principle:** The Shelly script handles its own device. HA handles cross-device orchestration. Virtual components are the API between them.

### Tier 3: HA Only (Centralized Automation)

Use for anything that crosses integration boundaries or needs HA-specific state.

**Examples:**
- "When sun sets AND person is home AND it's a weekday → set all rooms to kvöld mode" (needs sun, person, calendar)
- "When Sonos starts playing in Stofa → dim lights to movie mode" (needs Sonos integration)
- "When ZHA door sensor opens AND alarm is armed → trigger siren" (needs ZHA + alarm panel)
- "When energy consumption > 5kW for 30 minutes → send notification" (needs energy monitoring aggregation)

### Architecture Summary for Your Setup

| Room / Device | Shelly Script | Virtual Components | HA Automation |
|---------------|---------------|--------------------|---------------|
| Light switches (all rooms) | Input handling, local toggle, dimming | Lýsingarhamur (enum), Birtustig (number) | Cross-room scene sync, time-based presets |
| Power monitoring (Eldhús) | Overcurrent protection, load shedding | Power status (number), Alert flag (boolean) | Energy dashboard, monthly reports |
| BLE sensors | BLE scanning, BTHome decoding | — (use BTHome integration) | Threshold alerts, history graphs |
| Covers/blinds | Position control, obstruction safety | — | Sun-based automation, weather-based |
| Gecko spa | — | Target temp (number), Status (text) | Schedule, presence-based heating |
| Master off | Local relay off | Slökkva allt (button) | Turn off all Hue/WLED/Sonos/ZHA devices |

---

## 2. Scalability: Deploying Across 50+ Shelly Devices

### The Template Pattern

With your 2700+ entities, you can't write bespoke scripts and automations for every device. The solution is standardized templates.

#### Standard Virtual Component Layout

Define a **standard set of virtual components** that every room's Shelly gets. This makes automation templates work universally.

```
Every room Shelly gets:
  boolean:200  → "Gestamódi" (guest mode)        → HA: switch
  enum:201     → "Lýsingarhamur" (scene mode)     → HA: select
  number:202   → "Birtustig" (brightness %)        → HA: number
  text:203     → "Staða" (status display)          → HA: sensor
  button:204   → "Slökkva" (quick off)             → HA: button
```

#### Deployment Script

Deploy the same virtual layout to all devices at once:

```bash
#!/bin/bash
# deploy-room-virtuals.sh
# Standard virtual component template for every room Shelly

DEVICES=(
  "192.168.1.100"  # Forstofa
  "192.168.1.101"  # Eldhús
  "192.168.1.102"  # Stofa
  "192.168.1.103"  # Herbergi 1
  "192.168.1.104"  # Herbergi 2
  "192.168.1.105"  # Baðherbergi
  "192.168.1.106"  # Bílskúr
)

VIRTUALS='[
  {"type":"boolean","id":200,"config":{"name":"Gestamódi","persisted":true,"default_value":false,"meta":{"ui":{"view":"toggle","titles":["Slökkt","Kveikt"]}}}},
  {"type":"enum","id":201,"config":{"name":"Lýsingarhamur","persisted":true,"default_value":"dagur","options":["dagur","kvold","kvikmynd","nott","burt"],"meta":{"ui":{"view":"dropdown","titles":{"dagur":"Dagljós","kvold":"Kvöldbirta","kvikmynd":"Kvikmynd","nott":"Næturljós","burt":"Allt slökkt"}}}}},
  {"type":"number","id":202,"config":{"name":"Birtustig","min":0,"max":100,"default_value":100,"persisted":true,"meta":{"ui":{"view":"slider","unit":"%","step":5}}}},
  {"type":"text","id":203,"config":{"name":"Staða","default_value":"Tilbúið","meta":{"ui":{"view":"label"}}}},
  {"type":"button","id":204,"config":{"name":"Slökkva"}}
]'

for IP in "${DEVICES[@]}"; do
  echo "━━━ Setting up $IP ━━━"
  # Check if device is reachable
  if ! curl -s --connect-timeout 3 "http://$IP/rpc/Shelly.GetDeviceInfo" > /dev/null; then
    echo "  ✗ Device unreachable, skipping"
    continue
  fi

  # Get device name for logging
  NAME=$(curl -s "http://$IP/rpc/Shelly.GetDeviceInfo" | python3 -c "import sys,json;print(json.load(sys.stdin).get('name','unknown'))" 2>/dev/null)
  echo "  Device: $NAME"

  # Create each virtual component
  echo "$VIRTUALS" | python3 -c "
import sys, json, urllib.request, time
ip = '$IP'
virtuals = json.load(sys.stdin)
for v in virtuals:
    try:
        req = urllib.request.Request(
            f'http://{ip}/rpc',
            data=json.dumps({'id':1,'method':'Virtual.Add','params':v}).encode(),
            headers={'Content-Type':'application/json'}
        )
        resp = urllib.request.urlopen(req, timeout=5)
        result = json.loads(resp.read())
        print(f'  ✓ Created {v[\"type\"]}:{result.get(\"params\",{}).get(\"id\",\"?\")} — {v[\"config\"][\"name\"]}')
    except Exception as e:
        err = str(e)
        if '409' in err or 'already' in err.lower():
            print(f'  ○ {v[\"type\"]}:{v[\"id\"]} already exists — {v[\"config\"][\"name\"]}')
        else:
            print(f'  ✗ Error creating {v[\"type\"]}: {err}')
    time.sleep(0.3)  # throttle to avoid overwhelming the device
"
  echo ""
done

echo "Done! Reload the Shelly integration in HA to discover new entities."
```

#### Standard Room Script Template

Deploy the same controller script to every room, just changing the config at the top:

```javascript
// room-controller.js — Deploy to every room Shelly
// Only change the CONFIG section per device

// ═══ CONFIG — change per device ═══
let CONFIG = {
  room: "Stofa",           // Room name for status messages
  relay_id: 0,             // Which relay/light to control
  relay_type: "Light",     // "Light" or "Switch"
  preset_dagur: 100,       // Brightness for day mode
  preset_kvold: 40,        // Brightness for evening mode
  preset_kvikmynd: 15,     // Brightness for movie mode
  preset_nott: 5,          // Brightness for night mode
};
// ═══ END CONFIG ═══

let mode   = Virtual.getHandle("enum:201");
let bright = Virtual.getHandle("number:202");
let status = Virtual.getHandle("text:203");
let offBtn = Virtual.getHandle("button:204");
let guest  = Virtual.getHandle("boolean:200");

let presets = {
  dagur:     CONFIG.preset_dagur,
  kvold:     CONFIG.preset_kvold,
  kvikmynd:  CONFIG.preset_kvikmynd,
  nott:      CONFIG.preset_nott,
  burt:      0
};

function applyMode(m) {
  let b = presets[m];
  if (typeof b === "undefined") return;
  if (b === 0) {
    Shelly.call(CONFIG.relay_type + ".Set", {id: CONFIG.relay_id, on: false});
  } else {
    let params = {id: CONFIG.relay_id, on: true};
    if (CONFIG.relay_type === "Light") params.brightness = b;
    Shelly.call(CONFIG.relay_type + ".Set", params);
    bright.setValue(b);
  }
  status.setValue(CONFIG.room + ": " + m);
}

mode.on("change", function(ev) { applyMode(ev.value); });

bright.on("change", function(ev) {
  if (ev.source === "script") return;
  let p = {id: CONFIG.relay_id, on: ev.value > 0};
  if (CONFIG.relay_type === "Light" && ev.value > 0) p.brightness = ev.value;
  Shelly.call(CONFIG.relay_type + ".Set", p);
  status.setValue(CONFIG.room + ": " + ev.value + "%");
});

offBtn.on("single_push", function() {
  Shelly.call(CONFIG.relay_type + ".Set", {id: CONFIG.relay_id, on: false});
  bright.setValue(0);
  mode.setValue("burt");
  status.setValue(CONFIG.room + ": slökkt");
});

status.setValue(CONFIG.room + ": tilbúið");
```

### HA Blueprint for Room Scene Automation

Instead of writing an automation for every room, create one **blueprint** and instantiate it per room:

```yaml
# blueprints/automation/shelly_room_scene.yaml
blueprint:
  name: "Shelly herbergi lýsingarhamur"
  description: "React to Shelly scene selector enum and control room lights"
  domain: automation
  input:
    scene_selector:
      name: "Lýsingarhamur select entity"
      description: "The Shelly enum virtual component"
      selector:
        entity:
          filter:
            domain: select
            integration: shelly
    light_target:
      name: "Ljós til að stýra"
      description: "The light or light group for this room"
      selector:
        target:
          entity:
            domain: light
    brightness_dagur:
      name: "Birtustig — dagur"
      default: 100
      selector:
        number:
          min: 0
          max: 100
          unit_of_measurement: "%"
    brightness_kvold:
      name: "Birtustig — kvöld"
      default: 40
      selector:
        number:
          min: 0
          max: 100
          unit_of_measurement: "%"
    brightness_kvikmynd:
      name: "Birtustig — kvikmynd"
      default: 15
      selector:
        number:
          min: 0
          max: 100
          unit_of_measurement: "%"
    brightness_nott:
      name: "Birtustig — nótt"
      default: 5
      selector:
        number:
          min: 0
          max: 100
          unit_of_measurement: "%"
    color_temp_dagur:
      name: "Litahiti — dagur (Kelvin)"
      default: 4000
      selector:
        number:
          min: 2000
          max: 6500
          unit_of_measurement: "K"
    color_temp_kvold:
      name: "Litahiti — kvöld (Kelvin)"
      default: 2700
      selector:
        number:
          min: 2000
          max: 6500
          unit_of_measurement: "K"

variables:
  scene_selector: !input scene_selector
  brightness_dagur: !input brightness_dagur
  brightness_kvold: !input brightness_kvold
  brightness_kvikmynd: !input brightness_kvikmynd
  brightness_nott: !input brightness_nott
  color_temp_dagur: !input color_temp_dagur
  color_temp_kvold: !input color_temp_kvold

trigger:
  - platform: state
    entity_id: !input scene_selector

action:
  - choose:
      - conditions:
          - condition: state
            entity_id: !input scene_selector
            state: "dagur"
        sequence:
          - service: light.turn_on
            target: !input light_target
            data:
              brightness_pct: "{{ brightness_dagur }}"
              color_temp_kelvin: "{{ color_temp_dagur }}"
      - conditions:
          - condition: state
            entity_id: !input scene_selector
            state: "kvold"
        sequence:
          - service: light.turn_on
            target: !input light_target
            data:
              brightness_pct: "{{ brightness_kvold }}"
              color_temp_kelvin: "{{ color_temp_kvold }}"
      - conditions:
          - condition: state
            entity_id: !input scene_selector
            state: "kvikmynd"
        sequence:
          - service: light.turn_on
            target: !input light_target
            data:
              brightness_pct: "{{ brightness_kvikmynd }}"
              color_temp_kelvin: 2200
      - conditions:
          - condition: state
            entity_id: !input scene_selector
            state: "nott"
        sequence:
          - service: light.turn_on
            target: !input light_target
            data:
              brightness_pct: "{{ brightness_nott }}"
              color_temp_kelvin: 2000
      - conditions:
          - condition: state
            entity_id: !input scene_selector
            state: "burt"
        sequence:
          - service: light.turn_off
            target: !input light_target

mode: single
```

**Instantiate per room** (UI or YAML):
```yaml
# automations.yaml — one entry per room, all using the same blueprint
- id: stofa_scene
  alias: "Stofa lýsingarhamur"
  use_blueprint:
    path: shelly_room_scene.yaml
    input:
      scene_selector: select.shelly_stofa_lysingarhamur
      light_target:
        entity_id: light.stofa_ljos_group
      brightness_dagur: 100
      brightness_kvold: 40

- id: eldhus_scene
  alias: "Eldhús lýsingarhamur"
  use_blueprint:
    path: shelly_room_scene.yaml
    input:
      scene_selector: select.shelly_eldhus_lysingarhamur
      light_target:
        entity_id: light.eldhus_ljos_group
      brightness_dagur: 100
      brightness_kvold: 60

- id: herbergi_scene
  alias: "Herbergi lýsingarhamur"
  use_blueprint:
    path: shelly_room_scene.yaml
    input:
      scene_selector: select.shelly_herbergi_lysingarhamur
      light_target:
        entity_id: light.herbergi_ljos_group
      brightness_dagur: 80
      brightness_kvold: 30
      brightness_nott: 2
```

### Whole-House Scene Sync

A single automation that syncs all room enums when a house-level mode changes:

```yaml
automation:
  - id: hushamur_sync
    alias: "Húshamur — Samstilla öll herbergi"
    trigger:
      - platform: state
        entity_id: input_select.hushamur
    action:
      - service: select.select_option
        target:
          entity_id:
            - select.shelly_forstofa_lysingarhamur
            - select.shelly_stofa_lysingarhamur
            - select.shelly_eldhus_lysingarhamur
            - select.shelly_herbergi_lysingarhamur
            - select.shelly_badherbergi_lysingarhamur
        data:
          option: "{{ states('input_select.hushamur') }}"
```

---

## 3. Dashboard UX: Optimal Design for Virtual Components

### Design Principles for Your Setup

Given your "Industrial Precision" design language (dark base, teal #38d9c0, amber #f5a623, DM Mono/Syne typography), here's the dashboard architecture:

### Three-Layer Dashboard Pattern

```
Layer 1: OVERVIEW (main dashboard)
  ├── Room cards with status chips (auto-entities)
  ├── Each card shows: room name, current mode, brightness indicator
  └── Tap → opens Layer 2

Layer 2: ROOM POPUP (browser_mod popup)
  ├── Scene selector (enum → Mushroom select)
  ├── Brightness slider (number → Mushroom number)
  ├── Guest mode toggle (boolean → Mushroom entity)
  ├── Quick off button
  └── Status text display

Layer 3: DEVICE DETAIL (native more-info)
  ├── All physical entities (power, temperature, RSSI)
  ├── Firmware status
  └── Diagnostic entities
```

### Overview Dashboard Section

```yaml
# Main Heim dashboard — sections view
views:
  - title: Heim
    type: sections
    sections:
      # ── Room overview section ──
      - type: grid
        title: Herbergi
        cards:
          # Each room gets a template card that summarizes its state
          - type: custom:mushroom-template-card
            primary: Stofa
            secondary: >
              {{ states('select.shelly_stofa_lysingarhamur') | replace('dagur','Dagljós')
                 | replace('kvold','Kvöldbirta') | replace('kvikmynd','Kvikmynd')
                 | replace('nott','Næturljós') | replace('burt','Slökkt') }}
              {% if is_state('switch.shelly_stofa_gestamodi','on') %} · Gestir{% endif %}
            icon: mdi:sofa
            icon_color: >
              {% set m = states('select.shelly_stofa_lysingarhamur') %}
              {% if m == 'burt' %}disabled
              {% elif m == 'nott' %}deep-purple
              {% elif m == 'kvikmynd' %}indigo
              {% elif m == 'kvold' %}amber
              {% else %}teal{% endif %}
            fill_container: true
            tap_action:
              action: fire-dom-event
              browser_mod:
                service: browser_mod.popup
                data:
                  title: Stofa
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
                            icon: mdi:account-group
                            fill_container: true
                            tap_action:
                              action: toggle
                          - type: custom:mushroom-entity-card
                            entity: button.shelly_stofa_slokkva
                            name: Slökkva
                            icon: mdi:power-off
                            icon_color: red
                            fill_container: true
                            tap_action:
                              action: call-service
                              service: button.press
                              target:
                                entity_id: button.shelly_stofa_slokkva
                      - type: custom:mushroom-entity-card
                        entity: sensor.shelly_stofa_stada
                        name: Staða
                        fill_container: true

          # Repeat same pattern for other rooms (or use decluttering-card)

      # ── Whole-house controls ──
      - type: grid
        title: Allt húsið
        cards:
          - type: custom:mushroom-select-card
            entity: input_select.hushamur
            name: Húshamur
            icon: mdi:home-lightbulb
            fill_container: true
          - type: custom:mushroom-chips-card
            chips:
              - type: entity
                entity: switch.shelly_forstofa_gestamodi
                name: Gestir
                icon: mdi:account-group
                tap_action:
                  action: toggle
              - type: template
                content: "{{ states.select | selectattr('entity_id','search','lysingarhamur') | selectattr('state','eq','burt') | list | count }}/{{ states.select | selectattr('entity_id','search','lysingarhamur') | list | count }} slökkt"
                icon: mdi:lightbulb-group-off
```

### Decluttering Card for Room Repetition

Install `custom:decluttering-card` via HACS to avoid repeating the same card definition for every room:

```yaml
# lovelace/decluttering_templates.yaml
decluttering_templates:
  room_control:
    card:
      type: custom:mushroom-template-card
      primary: "[[name]]"
      secondary: >
        {{ states('[[scene_entity]]') | replace('dagur','Dagljós')
           | replace('kvold','Kvöldbirta') | replace('kvikmynd','Kvikmynd')
           | replace('nott','Næturljós') | replace('burt','Slökkt') }}
      icon: "[[icon]]"
      icon_color: >
        {% set m = states('[[scene_entity]]') %}
        {% if m == 'burt' %}disabled{% elif m == 'nott' %}deep-purple
        {% elif m == 'kvold' %}amber{% else %}teal{% endif %}
      fill_container: true
      tap_action:
        action: fire-dom-event
        browser_mod:
          service: browser_mod.popup
          data:
            title: "[[name]]"
            size: wide
            content:
              type: vertical-stack
              cards:
                - type: custom:mushroom-select-card
                  entity: "[[scene_entity]]"
                  fill_container: true
                - type: custom:mushroom-number-card
                  entity: "[[brightness_entity]]"
                  display_mode: slider
                  fill_container: true
                - type: grid
                  columns: 2
                  square: false
                  cards:
                    - type: custom:mushroom-entity-card
                      entity: "[[guest_entity]]"
                      name: Gestamódi
                      fill_container: true
                      tap_action:
                        action: toggle
                    - type: custom:mushroom-entity-card
                      entity: "[[off_entity]]"
                      name: Slökkva
                      icon_color: red
                      fill_container: true
                      tap_action:
                        action: call-service
                        service: button.press
                        target:
                          entity_id: "[[off_entity]]"

# Then use it for each room — just 5 lines per room instead of 50:
cards:
  - type: custom:decluttering-card
    template: room_control
    variables:
      - name: Stofa
      - icon: mdi:sofa
      - scene_entity: select.shelly_stofa_lysingarhamur
      - brightness_entity: number.shelly_stofa_birtustig
      - guest_entity: switch.shelly_stofa_gestamodi
      - off_entity: button.shelly_stofa_slokkva

  - type: custom:decluttering-card
    template: room_control
    variables:
      - name: Eldhús
      - icon: mdi:stove
      - scene_entity: select.shelly_eldhus_lysingarhamur
      - brightness_entity: number.shelly_eldhus_birtustig
      - guest_entity: switch.shelly_eldhus_gestamodi
      - off_entity: button.shelly_eldhus_slokkva

  - type: custom:decluttering-card
    template: room_control
    variables:
      - name: Forstofa
      - icon: mdi:door
      - scene_entity: select.shelly_forstofa_lysingarhamur
      - brightness_entity: number.shelly_forstofa_birtustig
      - guest_entity: switch.shelly_forstofa_gestamodi
      - off_entity: button.shelly_forstofa_slokkva
```

---

## 4. Network & Reliability Considerations

### Static IPs (already done)

You've already assigned static IPs via your Huawei V261a-20 router for 43 of 61 devices. For virtual components to work reliably, every Shelly device must have a stable IP. The HA Shelly integration stores the IP at setup time.

### Push Updates vs Polling

- Gen2+ devices push status updates to HA automatically on state change
- Virtual component changes are pushed instantly
- Diagnostic entities (RSSI, temperature) are polled every 60 seconds
- If push updates aren't arriving: check CoIoT peer settings (Gen1) or ensure the HA IP is reachable from the Shelly subnet

### Firmware Management

```yaml
# Auto-entities card to show devices needing updates
type: custom:auto-entities
card:
  type: entities
  title: Shelly uppfærslur
filter:
  include:
    - entity_id: "update.shelly_*"
      state: "on"
show_empty: false
```

### Warm Standby HA Instance

Since you have a backup HA on Hyper-V, ensure both instances can discover Shelly devices. Virtual component states are stored on the Shelly device itself (when `persisted: true`), so they survive HA failover without data loss.

---

## 5. Monitoring Dashboard

### Shelly Fleet Health

```yaml
type: vertical-stack
cards:
  - type: custom:mushroom-title-card
    title: Shelly floti
    subtitle: >
      {{ states.sensor | selectattr('entity_id','search','shelly.*rssi')
         | list | count }} tæki ·
      {{ states.update | selectattr('entity_id','search','shelly')
         | selectattr('state','eq','on') | list | count }} uppfærslur
  - type: custom:auto-entities
    card:
      type: grid
      columns: 4
      square: false
    card_param: cards
    filter:
      include:
        - entity_id: "sensor.shelly_*_rssi"
          options:
            type: custom:mushroom-entity-card
            icon: mdi:wifi
            icon_color: >
              {% set v = states(entity) | int(-100) %}
              {% if v > -50 %}green{% elif v > -70 %}amber{% else %}red{% endif %}
            fill_container: true
    sort:
      method: state
      numeric: true
```

---

## 6. Recommended Implementation Order

1. **Start with one room** (Stofa is a good candidate) — create all 5 virtual components, deploy the controller script, set up the HA automation, build the dashboard card
2. **Validate the pattern** — test scene selection from both the Shelly web UI and HA dashboard, confirm bidirectional sync works
3. **Create the blueprint** — convert the working Stofa automation into a blueprint
4. **Deploy to remaining rooms** — use the bash deployment script for virtuals, copy the controller script with modified CONFIG section, instantiate the blueprint per room
5. **Add the decluttering card** — create the dashboard template, add all rooms with 5-line entries
6. **Build the whole-house layer** — add the `input_select.hushamur` and sync automation
7. **Add monitoring** — fleet health dashboard, firmware update tracking
8. **Iterate** — add room-specific features (movie mode timer for Stofa, cooking timer for Eldhús, etc.)
