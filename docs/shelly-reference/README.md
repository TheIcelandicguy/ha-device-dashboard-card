# Shelly Reference Documentation

Knowledge base for keeping this card's device support current. The card is a **dedicated Shelly card**: when new Shelly products ship, device profiles, sensors, and capabilities are updated manually in the card source — these documents are the working reference for doing that.

The card's design goal is **local-first**: Shelly users heavy into Home Assistant should be able to run fully local (no Shelly Cloud, no internet) and still get complete visibility and control from HA. Prefer local connectivity signals (Wi-Fi/MQTT/IP/Ethernet) over cloud status when extending the card.

## Documents

| File | Covers |
|---|---|
| [shelly-api-complete-reference.md](shelly-api-complete-reference.md) | All Gen2+ components/services (Switch, Light, RGB(W), CCT, Cover, Input, EM/EM1, TRV, BLU, virtual components…), Gen1 API, per-component status fields |
| [shelly-ha-integration-strategy.md](shelly-ha-integration-strategy.md) | How Shelly devices map into HA (entities, device classes, naming), integration behaviour |
| [shelly-ha-real-world-patterns.md](shelly-ha-real-world-patterns.md) | Real-world automation/dashboard patterns with Shelly + HA |
| [shelly-virtual-components-guide.md](shelly-virtual-components-guide.md) | Gen2+ virtual components (boolean/number/text/enum/button/group) and scripting |

## Official sources for updates

When a new Shelly product or firmware capability appears, refresh these docs and the card's profile detection from:

- https://shelly-api-docs.shelly.cloud — device/component API reference (authoritative)
- https://kb.shelly.cloud/knowledge-base — per-device knowledge base articles
- https://www.shelly.com — product catalogue (new device announcements)
- https://community.shelly.cloud — community forum (early field reports, quirks)

## Where device knowledge lives in the card source

- `src/helpers.ts` — `getDeviceProfile()` (profile detection from HA entities), `PROFILE_DEFAULT_BLOCKS`, `PROFILE_LABELS`, `GRAPH_SENSOR_DEFS`, `HEADER_CHIP_DEFS`
- `src/types.ts` — `DeviceProfile` union (relay, plug, dimmer, rgb, climate, cover, valve, energy, sensor, input, uni, wall_display, generic)
- `src/ha-device-dashboard.ts` — `_getSensors()` sensor-chip matching ladder (device classes + entity-id heuristics)

Typical new-device checklist:
1. Check the device's component list on shelly-api-docs (which of Switch/Light/RGB/Cover/EM/… it exposes).
2. Verify how the HA Shelly integration names its entities (entity-id suffixes matter for the heuristics in `_getSensors`/`_chLabel`).
3. Extend `getDeviceProfile()` if the device doesn't land in the right profile automatically.
4. Add any new sensor device classes to `GRAPH_SENSOR_DEFS` / editor `SENSOR_GROUPS`.
5. Update these reference docs with the new component behaviour.
