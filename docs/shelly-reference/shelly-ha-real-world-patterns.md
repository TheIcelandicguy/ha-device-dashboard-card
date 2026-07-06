# Successful Shelly + Home Assistant Implementations
## Real-World Patterns, Scripts, Automations & Integration Choices

*A curated collection of patterns the community has actually deployed successfully, organized by use case and device type. Each pattern notes which integration was used to achieve it.*

---

## Integration Choices: What Works Best Today

Before the patterns, here's the landscape of how people connect Shelly devices to HA — and what to use when.

### The Native Shelly Integration (Recommended Default)

The **built-in Shelly integration** is the official path and what almost every successful deployment uses. It supports all four generations (Gen1 CoIoT, Gen2 RPC, Gen3, Gen4) with auto-discovery via mDNS/zeroconf, push updates over WebSocket (Gen2+) or CoIoT (Gen1), event entities for buttons/scripts, and full virtual component support. As of HA 2024.2 it includes the `shelly.get_kvs_value` and `shelly.set_kvs_value` actions for direct KVS access from automations.

**Use it for:** Everything Gen2+, including BLU TRV (which connects via the BLU Gateway Gen3 and appears as a `BluTrv` component in HA).

**Notable exception:** Shelly BLU sensors (Button, Motion, Door/Window, H&T) are NOT supported through the Shelly integration — they go through the **BTHome integration** instead, with a Gen2+ Shelly device acting as the BLE proxy.

### MQTT-Based Approaches (Legacy / Specialized)

Two community projects served the MQTT crowd before the native integration matured:

- **`bieniu/ha-shellies-discovery`** — for Gen1 devices, adds MQTT discovery via a Python script. Still maintained but mostly replaced by the native integration for new deployments.
- **`bieniu/ha-shellies-discovery-gen2`** — extended discovery for Gen2/3/4/BLU. Useful if you have specific MQTT broker requirements (VLANs, multi-site, custom prefixes) or want devices on a different network than HA.

**When to use MQTT:** if you're running a complex network topology where mDNS/zeroconf can't reach all devices, or if you need device data on multiple subscribers (HA + Node-RED + Grafana, for example).

### BTHome Integration (BLU Sensors)

The **BTHome integration** is required for BLU Button, Motion, Door/Window, and H&T devices. It needs a BLE proxy to receive the advertisements:
- A Gen2+ mains-powered Shelly device with BLE Observer enabled (acts as a transparent proxy)
- Or an ESPHome Bluetooth Proxy
- Or a built-in Bluetooth adapter on the HA host

The BTHome integration auto-discovers devices that broadcast on UUID `0xFCD2` and creates entities for each sensor/event.

### ESPHome Custom Firmware (Advanced)

Some users **flash Tasmota or ESPHome** onto Gen1 Shellies (ESP8266) for full local control with no cloud dependency. The classic pattern from die-welt.net uses ESPHome on a Shelly 2.5 as a time-based cover with a software "Block Control" switch that prevents accidental physical button presses (kid-proofing). Worth knowing about, but for Gen2+ this is unnecessary — the native firmware does everything ESPHome would.

---

## Pattern 1: Light Switch with Detached Mode (The Most Common Setup)

This is the foundational pattern that almost every successful Shelly deployment uses. The Shelly relay sits behind a physical wall switch, and the switch is configured as **"detached"** so pressing the button does NOT directly toggle the relay — instead, the button press is sent to HA as an event, and HA decides what to do.

**Why detached mode matters:** without it, the physical switch is hardwired to the relay and HA can only observe what already happened. With detached mode, HA becomes the brain — the same physical button can do different things based on time of day, presence, or scene.

### Device Configuration

In the Shelly web UI:
1. **Settings → Input/output settings → Button type:** `Detached Switch` (or `Button` for momentary)
2. For Gen2+: ensure firmware is current
3. For Gen1: enable CoIoT in `Internet & Security → Advanced - Developer settings`

### HA Automation (Gen2+ Event-Based)

```yaml
- alias: "Living room light — single press toggles"
  triggers:
    - trigger: event
      event_type: shelly.click
      event_data:
        device: shellyplus1-441793ce3f08
        channel: 1
        click_type: single_push
  actions:
    - action: light.toggle
      target:
        entity_id: light.living_room

- alias: "Living room light — double press = movie mode"
  triggers:
    - trigger: event
      event_type: shelly.click
      event_data:
        device: shellyplus1-441793ce3f08
        channel: 1
        click_type: double_push
  actions:
    - action: scene.turn_on
      target:
        entity_id: scene.movie_time

- alias: "Living room light — long press = all off"
  triggers:
    - trigger: event
      event_type: shelly.click
      event_data:
        device: shellyplus1-441793ce3f08
        channel: 1
        click_type: long_push
  actions:
    - action: light.turn_off
      target:
        area_id: living_room
```

Gen2+ uses the click types: `btn_down`, `btn_up`, `single_push`, `double_push`, `triple_push`, `long_push`.

Gen1 uses: `single`, `double`, `triple`, `long`, `short_long`, `long_short`.

### Reusable Blueprint

The community blueprint `shelly-plus-1-button-action` covers all 5 button events (single/double/triple/long/long+short) for any Shelly Plus 1, exposing them as configurable inputs in the UI. Worth importing if you have many devices following the same pattern.

### Pitfall to Avoid

If your Shelly input mode is set to **Switch** (not Button), the integration creates binary sensors and you get **on/off state** events instead of click events. You need Button mode (or Detached) to get click events. Choose Switch mode for traditional toggle switches that need to track open/closed state, Button mode for momentary push buttons.

---

## Pattern 2: Motion-Activated Light with Sun Condition

The classic motion light. Motion is detected (either by a Shelly Motion 2 sensor or a Shelly BLU Motion sensor), HA turns on the light, waits for "no motion" or a timeout, then turns it off.

### Setup Components

- **Shelly Motion 2** (battery-powered Wi-Fi motion sensor) — appears as `binary_sensor.shelly_motion_*` via the native Shelly integration
- **OR Shelly BLU Motion** (BLE) — appears via BTHome integration with an entity like `binary_sensor.shellyblumotion_*_motion`
- **Shelly 1 / Plus 1 / 1PM** controlling the light — appears as `switch.*` or `light.*` if appliance type is set to "light"

### HA Automation

```yaml
- alias: "Hallway motion light"
  description: "Turn on hallway light when motion detected, off after 90s of no motion, only after sunset"
  triggers:
    - trigger: state
      entity_id: binary_sensor.shelly_motion_hallway
      to: "on"
  conditions:
    - condition: sun
      after: sunset
      after_offset: "-00:30:00"
  actions:
    - action: light.turn_on
      target:
        entity_id: light.hallway
      data:
        brightness_pct: 60
    - wait_for_trigger:
        - trigger: state
          entity_id: binary_sensor.shelly_motion_hallway
          to: "off"
          for: "00:01:30"
    - action: light.turn_off
      target:
        entity_id: light.hallway
  mode: restart
```

### Critical detail: `mode: restart`

If motion is re-detected during the wait, restart the automation rather than queuing — this keeps the light on as long as someone keeps moving. The most common bug in motion lights is using `mode: single` (default), which causes the light to turn off mid-occupancy because the second motion event was ignored.

### Cyan Automation's Outdoor Light Pattern

A widely-shared real-world variant: a Shelly 1 wired between a PIR motion sensor module and an LED driver. The Shelly is in **detached mode**, so the PIR triggers the input but doesn't directly switch the relay. HA reads the input state via MQTT, applies a sun-elevation condition (only activate when sun is below the horizon), then commands the Shelly relay to turn on the LED for 5 minutes. This is the "smart insertion" pattern — adding HA intelligence to an existing dumb motion light without ripping it out.

---

## Pattern 3: Energy Monitoring with Shelly EM / 3EM / Pro 3EM

Energy monitoring is one of the most popular Shelly use cases. The Shelly 3EM measures three phases simultaneously, while Shelly EM and Pro EM monitor 1-2 single-phase circuits. The Pro 3EM stores 60 days of 1-minute interval data on the device itself.

### Integration

**Native Shelly integration** — auto-discovers and creates entities like `sensor.shelly_3em_phase_a_power`, `sensor.shelly_3em_phase_a_current`, `sensor.shelly_3em_phase_a_energy`, `sensor.shelly_3em_total_power`, etc.

### Energy Dashboard Setup (3-phase house)

The most-cited pattern from the HA community: rather than trying to combine the three phases manually, **add all three phases separately under Settings → Energy**. The dashboard automatically stacks them into one consumption bar. This works because each phase exposes both `total_energy` (consumed) and `total_returned_energy` (sent back to grid for solar) as separate sensors.

```yaml
# Configuration → Energy → Electricity grid
# Add each phase as a "Grid consumption" entry:
#   sensor.shelly_3em_channel_a_energy        (consumption phase A)
#   sensor.shelly_3em_channel_a_returned_energy (return phase A)
#   sensor.shelly_3em_channel_b_energy
#   sensor.shelly_3em_channel_b_returned_energy
#   sensor.shelly_3em_channel_c_energy
#   sensor.shelly_3em_channel_c_returned_energy
```

### Solar PV Integration

The Pro 3EM is positioned as the official Shelly EMS (Energy Management System) device. Common deployment: install it in the main distribution box to monitor everything coming in from the grid + everything going to/from the inverter.

**Common pitfall:** if you mount the CT clamps backwards or have them on the wrong wires, you'll see "massive returns to grid" while also showing grid consumption — this is a directional issue. Always verify CT direction matches the arrow on the clamp pointing toward the load (or grid, depending on where you installed it).

### Solar Surplus Automation (using a separate Shelly Plug for the load)

```yaml
- alias: "Heat water with PV surplus"
  description: "When solar production exceeds consumption by 1500W for 5 min, switch on water heater"
  triggers:
    - trigger: numeric_state
      entity_id: sensor.shelly_3em_total_power
      below: -1500   # negative = exporting
      for: "00:05:00"
  conditions:
    - condition: state
      entity_id: switch.water_heater
      state: "off"
  actions:
    - action: switch.turn_on
      target:
        entity_id: switch.water_heater
    - action: notify.mobile_app
      data:
        message: "Water heater turned on — exporting {{ (states('sensor.shelly_3em_total_power') | int * -1) }}W"

- alias: "Stop heating when surplus drops"
  triggers:
    - trigger: numeric_state
      entity_id: sensor.shelly_3em_total_power
      above: -200
      for: "00:03:00"
  conditions:
    - condition: state
      entity_id: switch.water_heater
      state: "on"
  actions:
    - action: switch.turn_off
      target:
        entity_id: switch.water_heater
```

### Daily/Yesterday Tracking via Utility Meter

The community pattern from cyan-automation for tracking daily energy use:

```yaml
# configuration.yaml
utility_meter:
  daily_energy:
    source: sensor.shelly_em_channel_1_energy
    name: Daily Energy
    cycle: daily

template:
  - sensor:
      - name: "Yesterday's Energy"
        unit_of_measurement: "kWh"
        device_class: energy
        state_class: total_increasing
        state: "{{ state_attr('sensor.daily_energy', 'last_period') | float(0) }}"
```

This gives you `sensor.daily_energy` (today so far) and `sensor.yesterdays_energy` (yesterday's total) for trend cards on the dashboard.

---

## Pattern 4: Appliance Notification (Washing Machine / Dryer Done)

One of the most popular Shelly use cases — using a Shelly Plug S or Shelly EM to detect when a washing machine, dryer, or dishwasher finishes a cycle by watching the power consumption.

### Setup

- **Shelly Plug S** plugged into the wall, appliance plugged into the Shelly
- Native Shelly integration auto-creates `sensor.shellyplug_s_*_power`
- Use the community blueprint **"Sbyx/notify-or-do-something-when-an-appliance-like-a-dishwasher-or-washing-machine-finishes"**

### Real-world automation

```yaml
- alias: "Dryer has finished"
  use_blueprint:
    path: Sbyx/notify-or-do-something-when-an-appliance-like-a-dishwasher-or-washing-machine-finishes.yaml
    input:
      power_sensor: sensor.shellyplug_s_c16e05_power
      starting_threshold: 100      # Power exceeds 100W → cycle started
      starting_hysteresis: 2       # Sustained for 2 minutes
      finishing_threshold: 10      # Power below 10W → cycle ended
      finishing_hysteresis: 10     # Sustained for 10 minutes
      actions:
        - action: notify.telegram
          data:
            title: "Dryer finished"
            message: "Please empty the dryer."
```

The hysteresis values are critical — washing machines have idle periods during a cycle (between rinse and spin) where power drops to near zero for several minutes. A 10-minute hysteresis is generally enough to distinguish a true "cycle complete" from a between-step pause.

---

## Pattern 5: Roller Shutter / Cover Control

Rolling shutters with Shelly 2.5, Shelly Plus 2PM, Shelly Pro 2PM, or Shelly 2PM Gen3. The Gen3 2PM adds **tilt support** for venetian blinds via slat control.

### Device Configuration

1. Shelly web UI → **Device profile: Cover** (this requires a profile change and reboot)
2. Run the calibration routine (Shelly will move the cover up and down to learn the timing)
3. For Gen3 2PM with tilt: enable and configure **Slat control**
4. Native Shelly integration auto-discovers the cover entity

### Sun-Based Automation Using a Blueprint

The community blueprint **"Cover Control Automation (CCA)"** is the most comprehensive option. It handles opening/closing based on:
- Brightness sensor thresholds
- Sun elevation (and azimuth, for orientation-based logic)
- Time windows (e.g., "never close before 7am")
- Weather conditions (don't close during heavy wind)
- Window opening (don't close blinds when window is open for ventilation)

### One-Button Cycling Pattern (Open/Stop/Close/Stop)

If you have a single button to control a cover, this pattern cycles through open → stop → close → stop with each press. Originally designed for the Shelly 2.5 "one button" mode, but works for any cover entity:

```yaml
input_select:
  bedroom_shutter_last_state:
    name: Bedroom Shutter Last State
    options:
      - opening
      - closing
      - open
      - closed

automation:
  - alias: "Track shutter last state"
    trigger:
      - platform: state
        entity_id: cover.bedroom_shutter
    action:
      - service: input_select.select_option
        data:
          option: "{{ trigger.from_state.state }}"
          entity_id: input_select.bedroom_shutter_last_state

  - alias: "Toggle bedroom shutter"
    trigger:
      - platform: event
        event_type: shelly.click
        event_data:
          device: shellyplus2pm-aabbcc
          click_type: single_push
    action:
      - choose:
          # If currently moving, stop it
          - conditions:
              - condition: state
                entity_id: cover.bedroom_shutter
                state: opening
            sequence:
              - service: cover.stop_cover
                target: { entity_id: cover.bedroom_shutter }
          - conditions:
              - condition: state
                entity_id: cover.bedroom_shutter
                state: closing
            sequence:
              - service: cover.stop_cover
                target: { entity_id: cover.bedroom_shutter }
          # If stopped, do the opposite of last direction
          - conditions:
              - condition: state
                entity_id: input_select.bedroom_shutter_last_state
                state: opening
            sequence:
              - service: cover.close_cover
                target: { entity_id: cover.bedroom_shutter }
          - conditions:
              - condition: state
                entity_id: input_select.bedroom_shutter_last_state
                state: closing
            sequence:
              - service: cover.open_cover
                target: { entity_id: cover.bedroom_shutter }
        default:
          - service: cover.open_cover
            target: { entity_id: cover.bedroom_shutter }
```

---

## Pattern 6: Shelly i4 / Plus i4 as a Multi-Button Scene Controller

The Shelly Plus i4 is a 4-input device with no relay outputs — it's purely a button controller. Each input can be configured as Switch or Button mode and provides all the standard click types.

### Integration

Native Shelly — creates 4 event entities (`event.shellyplusi4_*_input_X`) when inputs are in Button mode.

### Blueprint

**"Shelly i4 4 Buttons actions"** — exposes all 4 buttons × 5 events (down, up, single_push, double_push, long_push) as separate inputs. The most popular i4 blueprint, well-tested by the community.

### Real-World Use

A common deployment: mount a Shelly Plus i4 behind a 4-gang wall plate, connect 4 momentary push buttons (or repurpose existing wall switches in detached mode), and create automations like:

- Button 1 single = toggle ceiling light
- Button 1 double = movie scene
- Button 1 long = all-off
- Button 2 single = floor lamp
- Button 3 single = curtains up
- Button 3 long = curtains down
- Button 4 = doorbell mute / sleep mode

This effectively replaces a $200+ scene keypad with a $25 Shelly i4 + 4 momentary switches.

---

## Pattern 7: BLU Button → Local Shelly via On-Device Script

This is the **direct device-to-device pattern** with no HA in the middle. The setup uses one Gen2+ mains-powered Shelly device (acting as a BLE gateway) running a script that listens for BLU Button events and fires HTTP requests to other Shelly devices (Gen1 or Gen2+) on the local network.

### Why Use This Instead of HA?

- Sub-second response time (no HA round-trip)
- Works even if HA is down or rebooting
- Useful for safety-critical things like emergency stop buttons
- Lower power consumption than running HA for simple button-to-relay control

### The Script (from ALLTERCO/shelly-script-examples)

The official `ble-shelly-button1-gateway.js` script. You configure:

```javascript
// Configure the script
let CONFIG = {
  bluButtonAddress: "aa:bb:cc:dd:ee:ff",  // Your BLU Button MAC
  actions: {
    single_push: [
      { url: "http://192.168.1.50/relay/0?turn=toggle" },     // Gen1 syntax
      { url: "http://192.168.1.51/rpc/Switch.Toggle?id=0" }    // Gen2 syntax
    ],
    double_push: [
      { url: "http://192.168.1.52/rpc/Light.Set?id=0&on=true&brightness=100" }
    ],
    long_push: [
      { url: "http://192.168.1.53/rpc/Switch.Set?id=0&on=false" },
      { url: "http://192.168.1.54/rpc/Switch.Set?id=0&on=false" }
    ]
  }
};
```

The script queues URL requests because of the 5-concurrent-RPC-call limit. It uses the BLE scanner to receive button events without any cloud or HA dependency.

### Complementary HA Pattern

You can ALSO have HA listen to the same Gen2+ gateway via its Shelly integration, so the BLU Button events appear as `event.shelly_*` entities in HA for additional, non-time-critical automations. Best of both worlds: the gateway script handles the instant local action, while HA handles things like "also send a notification" or "log the event for analytics."

---

## Pattern 8: BLU TRV (Thermostatic Radiator Valve) Heating Control

The most complex BLU device. Three patterns have emerged:

### Pattern 8A: Single TRV per Room (Recommended)

- Each radiator gets a BLU TRV
- TRV is paired to a **BLU Gateway Gen3** (one gateway handles up to ~10 TRVs depending on BLE range)
- Gateway connects via Wi-Fi to HA
- Native Shelly integration creates a `climate.*` entity for each TRV

The TRV exposes `target_temperature`, `current_temperature`, valve `position`, and `errors` to HA. You set the target through any HA climate dashboard card.

### Pattern 8B: BLU TRV + BLU H&T External Sensor

The internal temperature sensor on the TRV is directly above the radiator, so it reads warmer than the room. To fix this:

1. Pair a **BLU H&T sensor** to the BLU Gateway Gen3
2. Pair the H&T to the TRV via the gateway (BLE.StartBluTrvAssociations)
3. The TRV uses the H&T reading instead of its internal sensor for control

The result is much more accurate room temperature regulation. Several community members report this dramatically improves comfort.

### Pattern 8C: Better Thermostat Integration (Multi-TRV per Room)

If you have multiple radiators in one room, use the **Better Thermostat** custom integration (HACS) to group them into one virtual climate entity. Set the target on the virtual thermostat, and Better Thermostat distributes the command to all the underlying BLU TRV entities.

**Known issue:** when you set a target temperature on the Better Thermostat group, it sometimes shows different temperatures on the individual TRV entities due to timing of state synchronization. This is a known UI quirk; the actual control is correct.

### Pattern 8D: Window-Open Detection

Pair a BLU Door/Window sensor with the TRV (also via the gateway). When the window opens, the TRV's `open_window_mode` automatically lowers the target temperature to prevent wasted heating. This is the most "set-and-forget" feature of the TRV.

---

## Pattern 9: Bedtime / Goodnight Routine

A real-world example from the johnflorin/shelly-use-cases repo, adapted to Icelandic context:

### Hardware

- Shelly 2.5 controlling a roller shutter (`cover.shellyswitch25_xxx`)
- Shelly Plug S powering a "phantom load strip" with the PC, monitor, and other always-on devices
- Google Home / Sonos speakers throughout the house
- TTS service (Cloud TTS or local Piper)

### The Bedtime Script

```yaml
script:
  bedtime:
    alias: "Háttamál"
    sequence:
      # Close the living room shutters
      - service: cover.close_cover
        target:
          entity_id:
            - cover.stofa_shutter
            - cover.eldhus_shutter
      
      # Soft shutdown the PC via RPC shutdown add-on
      - service: hassio.addon_stdin
        data:
          addon: core_rpc_shutdown
          input: "DesktopPC"
      
      # Wait 2 minutes for clean shutdown
      - delay:
          minutes: 2
      
      # Cut power to the phantom load strip
      - service: switch.turn_off
        target:
          entity_id: switch.shellyplug_pc_strip
      
      # Set thermostats to night temperature
      - service: climate.set_temperature
        target:
          entity_id:
            - climate.svefnherbergi_trv
            - climate.stofa_trv
        data:
          temperature: 18
      
      # Turn off all lights
      - service: light.turn_off
        target:
          area_id:
            - stofa
            - eldhus
            - forstofa
```

### Triggered by Time Plus Spoken Reminder

```yaml
- alias: "Bedtime reminder for kids"
  description: "If kids' room shutters are still open at 20:30, ask them to go to bed"
  triggers:
    - trigger: time
      at: "20:30:00"
  conditions:
    - condition: state
      entity_id: cover.barnaherbergi_shutter
      state: open
  actions:
    - action: media_player.volume_set
      data:
        volume_level: 0.5
      target:
        entity_id: media_player.barnaherbergi_speaker
    - action: tts.cloud_say
      data:
        message: "Það er kominn háttatími. Vinsamlegast farðu að sofa núna."
        entity_id: media_player.barnaherbergi_speaker
```

---

## Pattern 10: Bulk Device Configuration via HA

Real-world pattern from the community for keeping all your Shellies configured consistently. The user wrote a script that uses HA to push the same MQTT, cloud, BLE, AP, and timezone settings to every Shelly device, so they all conform to a baseline.

### Use Case

You have 50 Shelly devices and want to:
- Disable Shelly Cloud on all of them (privacy/local-first)
- Disable the AP mode after provisioning (security)
- Set the same MQTT broker on all of them
- Set the same timezone (Atlantic/Reykjavik for Iceland)
- Match each device's name to its HA entity name

### Approach

The community user uses HA's `rest_command` to call each Shelly's RPC endpoint:

```yaml
# configuration.yaml
rest_command:
  shelly_set_config:
    url: "http://{{ host }}/rpc"
    method: POST
    content_type: "application/json"
    payload: >
      {
        "id": 1,
        "method": "{{ method }}",
        "params": {{ params | tojson }}
      }

# scripts.yaml
configure_all_shellies:
  alias: "Configure all Shellies to baseline"
  sequence:
    - repeat:
        for_each:
          - "192.168.1.100"
          - "192.168.1.101"
          - "192.168.1.102"
          # ... etc
        sequence:
          # Disable cloud
          - service: rest_command.shelly_set_config
            data:
              host: "{{ repeat.item }}"
              method: "Cloud.SetConfig"
              params:
                config: { enable: false }
          # Disable BLE
          - service: rest_command.shelly_set_config
            data:
              host: "{{ repeat.item }}"
              method: "BLE.SetConfig"
              params:
                config: { enable: false }
          # Disable AP
          - service: rest_command.shelly_set_config
            data:
              host: "{{ repeat.item }}"
              method: "WiFi.SetConfig"
              params:
                config:
                  ap: { enable: false }
          # Set timezone
          - service: rest_command.shelly_set_config
            data:
              host: "{{ repeat.item }}"
              method: "Sys.SetConfig"
              params:
                config:
                  location: { tz: "Atlantic/Reykjavik" }
          - delay: "00:00:01"
```

This is much faster than clicking through 50 web UIs.

---

## Pattern 11: Load Shedding (High-Power Protection)

Shelly's official `advanced-load-shedding.shelly.js` script runs entirely on the device. It monitors power consumption (via a Pro 3EM or any PM device) and dynamically turns off lower-priority loads when total consumption exceeds a threshold.

### Use Case

Iceland-relevant scenario: you have a 25A house feed and during winter you might run:
- Hot tub (3000W)
- Electric vehicle charger (3500W)
- Sauna (4500W)
- Water heater (2000W)

Together they'd trip your main breaker. The load shedding script turns off lower-priority loads (in this priority order) when the total approaches the limit.

### Configuration

```javascript
let CONFIG = {
  total_power_threshold: 5500,   // Max watts before shedding
  hysteresis: 200,                // Wait until below threshold-200 before re-enabling
  check_interval_ms: 5000,
  
  // Devices in priority order — lowest priority first (sheds first)
  devices: [
    {
      name: "Vatnshitari",
      url: "http://192.168.1.50/rpc/Switch.Set",
      switch_id: 0,
      power_estimate: 2000,
      priority: 1
    },
    {
      name: "Heitur pottur",
      url: "http://192.168.1.51/rpc/Switch.Set",
      switch_id: 0,
      power_estimate: 3000,
      priority: 2
    },
    {
      name: "Bílskúr hleðsla",
      url: "http://192.168.1.52/rpc/Switch.Set",
      switch_id: 0,
      power_estimate: 3500,
      priority: 3   // Highest priority — shed last
    }
  ]
};
```

The companion script `advanced-load-shedding-secondary-source.shelly.js` adds a second power source (PV/solar) so the algorithm considers self-generated power before shedding loads.

---

## Pattern 12: Hot Tub Monitoring & Control

If you have a Gecko spa with the in.touch module (matching your existing setup), the typical pattern is:

### Integration Stack

- **Custom integration** for the Gecko in.touch (HACS package `gecko_home_assistant`)
- **Shelly Plus 1PM** measuring the spa's power draw separately (so you can see actual heating cycles)
- HA automations to coordinate them

### Automation: Pre-Heat Before Use

```yaml
- alias: "Heita pott fyrir notkun"
  description: "Pre-heat hot tub when calendar event 'Hot tub' starts in 90 minutes"
  triggers:
    - trigger: calendar
      entity_id: calendar.fjolskyldudagatal
      event: start
      offset: "-1:30:00"
  conditions:
    - condition: template
      value_template: "{{ 'Heitur pottur' in trigger.calendar_event.summary }}"
  actions:
    - action: climate.set_temperature
      target:
        entity_id: climate.gecko_spa
      data:
        temperature: 38

- alias: "Setja heitan pott á 'sparnaður' eftir notkun"
  triggers:
    - trigger: calendar
      entity_id: calendar.fjolskyldudagatal
      event: end
  conditions:
    - condition: template
      value_template: "{{ 'Heitur pottur' in trigger.calendar_event.summary }}"
  actions:
    - action: climate.set_temperature
      target:
        entity_id: climate.gecko_spa
      data:
        temperature: 35   # Economy temp
```

### Monitoring Heating Efficiency

```yaml
template:
  - sensor:
      - name: "Heita pott orkunotkun í dag"
        unit_of_measurement: "kWh"
        device_class: energy
        state_class: total_increasing
        state: "{{ states('sensor.shellyplus1pm_heitur_pottur_energy') }}"
      
      - name: "Heita pott kostnaður í dag"
        unit_of_measurement: "kr"
        state: >
          {{ (states('sensor.heita_pott_orkunotkun_i_dag') | float * 18.5) | round(0) }}
        # 18.5 ISK/kWh average price
```

---

## Pattern 13: Garage Door / Gate Control with Status

Shelly 1 with detached input mode is the most common DIY garage door opener:

### Hardware

- Shelly 1 (or Plus 1) wired in parallel with the garage door opener button
- Reed switch on the garage door for open/closed status
- The Shelly's input is wired to the reed switch

### Configuration

In the Shelly web UI:
- **Button type:** Detached
- **Auto-off:** 0.5 seconds (so the relay only pulses, mimicking a button press)

### HA Setup

```yaml
# configuration.yaml
cover:
  - platform: template
    covers:
      garage_door:
        friendly_name: "Bílskúrhurð"
        device_class: garage
        value_template: >
          {{ 'open' if is_state('binary_sensor.shelly1_bilskur_input', 'on') else 'closed' }}
        open_cover:
          - condition: state
            entity_id: binary_sensor.shelly1_bilskur_input
            state: "off"
          - service: switch.turn_on
            target:
              entity_id: switch.shelly1_bilskur_relay
        close_cover:
          - condition: state
            entity_id: binary_sensor.shelly1_bilskur_input
            state: "on"
          - service: switch.turn_on
            target:
              entity_id: switch.shelly1_bilskur_relay
        stop_cover:
          - service: switch.turn_on
            target:
              entity_id: switch.shelly1_bilskur_relay
```

### Auto-Close Safety Net

```yaml
- alias: "Auto-close garage if left open"
  description: "If garage left open more than 15 min, close it"
  triggers:
    - trigger: state
      entity_id: cover.garage_door
      to: "open"
      for: "00:15:00"
  actions:
    - action: notify.mobile_app
      data:
        message: "Bílskúrhurð sjálfvirkt að loka eftir 15 mín opin"
    - action: cover.close_cover
      target:
        entity_id: cover.garage_door
```

---

## Pattern 14: BLU Door/Window → HTTP Webhook (No HA Required)

From the ALLTERCO `blu-assistant` examples. A Gen2+ Shelly runs a script that listens for BLE advertisements from a BLU Door/Window sensor and fires HTTP webhooks on open/close events. No HA, no cloud, completely local.

### Use Case

Trigger an audible alarm via a different Shelly when a door opens after hours, even if HA is offline.

### Script

```javascript
const WINDOW_SENSOR_ID = 0x1234;  // Your sensor's BTHome ID
const WINDOW_OPEN_WEBHOOK = "http://192.168.1.99/rpc/Switch.Set?id=0&on=true";
const WINDOW_CLOSE_WEBHOOK = "http://192.168.1.99/rpc/Switch.Set?id=0&on=false";

// Subscribe to BTHome events from the local BTHome integration
BTHome.subscribe(function(data) {
  if (data.id !== WINDOW_SENSOR_ID) return;
  
  if (data.window === 1) {
    Shelly.call("HTTP.GET", { url: WINDOW_OPEN_WEBHOOK });
    print("Window OPEN — fired webhook");
  } else if (data.window === 0) {
    Shelly.call("HTTP.GET", { url: WINDOW_CLOSE_WEBHOOK });
    print("Window CLOSED — fired webhook");
  }
});
```

This is the "fail-safe layer" — even if HA is down for maintenance, your security alerts still work.

---

## Pattern 15: Virtual Components for HA-Driven Scripts

The killer pattern for combining on-device speed with HA flexibility. You expose a virtual enum (scene mode) on a Shelly Plus 1PM, the Shelly script reacts instantly to changes, and HA automations set the enum value.

### Setup

Create the virtual components on the Shelly via curl:

```bash
# Scene enum
curl -X POST -d '{
  "id":1,"method":"Virtual.Add","params":{
    "type":"enum","id":201,
    "config":{
      "name":"Lýsingarhamur",
      "persisted":true,
      "default_value":"dagur",
      "options":["dagur","kvold","kvikmynd","nott","burt"],
      "meta":{"ui":{"view":"dropdown"}}
    }
  }
}' http://192.168.1.100/rpc

# Brightness number
curl -X POST -d '{
  "id":1,"method":"Virtual.Add","params":{
    "type":"number","id":202,
    "config":{
      "name":"Birtustig","min":0,"max":100,"default_value":100,
      "persisted":true,
      "meta":{"ui":{"view":"slider","unit":"%","step":5}}
    }
  }
}' http://192.168.1.100/rpc
```

### On-Device Script (Reacts in <10ms)

```javascript
let mode   = Virtual.getHandle("enum:201");
let bright = Virtual.getHandle("number:202");

let presets = {
  dagur:    100,
  kvold:    40,
  kvikmynd: 15,
  nott:     5,
  burt:     0
};

mode.on("change", function(ev) {
  let b = presets[ev.value];
  if (b === 0) {
    Shelly.call("Light.Set", {id: 0, on: false});
  } else {
    Shelly.call("Light.Set", {id: 0, on: true, brightness: b});
    bright.setValue(b);
  }
});

bright.on("change", function(ev) {
  if (ev.source === "script") return;  // Avoid loops from script-triggered changes
  Shelly.call("Light.Set", {id: 0, on: ev.value > 0, brightness: ev.value});
});
```

### HA Integration (Native Shelly Integration)

After running the script, the Shelly integration automatically discovers the virtual components and creates:
- `select.shelly_lysingarhamur` (the enum dropdown)
- `number.shelly_birtustig` (the brightness slider)

You can use these in HA dashboards directly, or in automations:

```yaml
- alias: "Set evening lighting at sunset"
  triggers:
    - trigger: sun
      event: sunset
      offset: "-00:15:00"
  actions:
    - action: select.select_option
      target:
        entity_id: select.shelly_lysingarhamur
      data:
        option: "kvold"
```

The change propagates through HA → Shelly RPC → script → physical light in <100ms. The light stays controlled by the Shelly script (so it works even if HA is down), but HA orchestrates which mode to use.

---

## Quick Reference: What Integration to Use

| Device Type | Best Integration | Notes |
|-------------|------------------|-------|
| Shelly Gen1 (1, 2.5, Dimmer2, RGBW2, Plug S, EM, 3EM, i3, etc.) | Native Shelly | Enable CoIoT for push updates |
| Shelly Plus / Pro / Gen3 / Gen4 (mains-powered) | Native Shelly | Auto-discovery via mDNS, RPC over WS |
| Shelly Plus / Gen3 (battery-powered: H&T, Smoke) | Native Shelly | May need outbound WebSocket config |
| Shelly BLU Button / Motion / DW / H&T | BTHome | Needs BLE proxy (Gen2+ Shelly with BLE Observer) |
| Shelly BLU TRV | Native Shelly | Via BLU Gateway Gen3 |
| Shelly Wave (Z-Wave) | Z-Wave JS | Z-Wave network required |
| Shelly Pro 3EM | Native Shelly | Add all 3 phases to Energy Dashboard separately |
| Shelly Wall Display | Native Shelly | Works as control panel + sensor source |
| Custom MQTT routing needs | bieniu/ha-shellies-discovery-gen2 | Specialized cases only |
| Custom firmware | ESPHome / Tasmota | Gen1 only, advanced users |

## Quick Reference: Where Should the Logic Live?

| Logic Type | Where | Why |
|------------|-------|-----|
| Button → local relay (instant) | On-device script | Sub-10ms response, works without HA |
| Motion → light with sun condition | HA automation | Needs sun.sun entity, cross-device |
| Energy threshold → load shedding | On-device script | Safety-critical, must work without HA |
| Energy threshold → notification | HA automation | Needs notify service |
| Scene selection across rooms | Virtual enum + HA | Local speed + HA orchestration |
| Calendar-triggered heating | HA automation | Needs calendar integration |
| Solar surplus → water heater | HA automation | Cross-device, needs threshold logic |
| BLU Button → local Shelly relay | On-device script (BLE gateway) | Works without HA, sub-second |
| BLU Button → Hue lights | HA automation | Needs Hue integration |
| Window open → close blinds | HA automation | Cross-device, needs orchestration |
| Window open → reduce TRV target | TRV native feature | Built into BLU TRV firmware |
| Power-state appliance notification | HA blueprint | Hysteresis tuning needed |
| Auto-off after timeout | Either | Shelly auto_off for simple, HA for conditional |

---

## Lessons from Successful Deployments

A few patterns emerge across all the real-world examples:

**Detached mode is non-negotiable for smart switches.** Every successful interactive lighting deployment uses Button or Detached input mode so HA controls behavior. People who skip this step inevitably end up rebuilding their automations later.

**Use the native Shelly integration unless you have a specific reason not to.** It's the most actively maintained, supports all features (KVS, virtual components, BLU TRV, scripts), and handles auto-discovery cleanly. MQTT-based approaches are for specialized network topologies.

**Put critical logic on the device, orchestration in HA.** The hot tub, the freezer alarm, the garage door safety check, the load shedding — these should run on the device so they don't fail when HA is rebooting. HA handles the things that need cross-integration knowledge (calendar events, sun position, person tracking).

**Use blueprints aggressively.** Almost every common pattern has a community blueprint already. Importing a well-tested blueprint (like Sbyx for appliance notifications, or Cover Control Automation for shutters) saves hours of debugging compared to writing from scratch.

**Mode: restart, not single, for motion lights.** This is the single most common bug. Default `mode: single` causes the light to turn off mid-occupancy.

**Virtual components are the bridge between on-device speed and HA flexibility.** You get sub-10ms physical response from the script, plus full HA dashboard control over the parameters. This is the pattern for the future of large Shelly+HA deployments.

**Bulk-configure once, never click 50 web UIs.** Use HA `rest_command` or a bash script to push baseline config to all devices. This keeps your fleet consistent and saves enormous time when adding new devices.

**Test failure modes.** What happens if HA reboots while a motion light is on? What happens if the BLU Gateway loses Wi-Fi while a TRV needs to be set? The successful deployments are the ones where the device-side fallbacks have been tested and verified.
