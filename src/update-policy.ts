/**
 * Should the card re-render? — as a pure function.
 *
 * This lived inside `shouldUpdate()` on the element: seventy lines resolving one
 * boolean from config state, UI state, input targets, the device cache, entity
 * domains, a throttle window and a timer. It worked, but it could only be
 * exercised by mounting the card in a browser, so in practice it was never
 * tested at all — and it is exactly the kind of code that keeps working until
 * one new piece of state is forgotten from the list.
 *
 * The same argument moved the cascades into `cascade.ts`. The decision is pure
 * here; the element keeps the side effects (starting the timer, stamping the
 * clock), because those are the only parts that need a DOM.
 */

import type { HADevice } from './types';

/** Local state whose change always forces a render — nothing to diff. */
export const LOCAL_RENDER_KEYS: readonly string[] = [
  '_config',
  '_closedAreas',
  '_graphData',
  '_periodEnergy',
  '_periodEnergyErrAt',
  '_valveDragPos',
  '_trvDragTemp',
  '_detailDevice',
  '_detailHistoryRange',
  '_activeViewId',
  '_cloudDetailOpen',
  '_areaChipOpen',
  'preview',
];

/** Shelly power sensors push every second or two; coalesce that churn. */
export const SENSOR_THROTTLE_MS = 2000;

export type UpdateReason =
  /** A config or UI-state property changed. */
  | 'local-state'
  /** Something changed that was not `hass` and not in the local list. */
  | 'non-hass'
  /** No previous hass, no current hass, or no device cache yet. */
  | 'no-baseline'
  /** An entity an input action targets changed — often on another device. */
  | 'input-target'
  /** A non-sensor entity of ours changed: render at once. */
  | 'interactive'
  /** Only sensors changed and the throttle window has elapsed. */
  | 'sensor-due'
  /** Only sensors changed, still inside the window: defer. */
  | 'sensor-throttled'
  /** Nothing belonging to this card changed. */
  | 'none';

export interface UpdatePolicyInput {
  /** Keys of the Lit `changedProperties` map. */
  changedKeys: Iterable<string>;
  /** `states` of the previous hass, or null/undefined if there wasn't one. */
  oldStates: Record<string, unknown> | null | undefined;
  newStates: Record<string, unknown> | null | undefined;
  /** The discovered devices, or null before the first discovery. */
  devices: readonly HADevice[] | null | undefined;
  /** Entity ids that input actions drive. */
  inputTargets: Iterable<string>;
  now: number;
  lastSensorRender: number;
  throttleMs?: number;
}

export interface UpdateDecision {
  render: boolean;
  reason: UpdateReason;
  /** True when the caller should stamp its sensor-render clock. */
  stampSensorRender: boolean;
  /** ms until a deferred render is due, or null when nothing is pending. */
  scheduleIn: number | null;
}

export function computeUpdateReason(i: UpdatePolicyInput): UpdateDecision {
  const throttleMs = i.throttleMs ?? SENSOR_THROTTLE_MS;
  const keys = new Set(i.changedKeys);
  const yes = (reason: UpdateReason): UpdateDecision =>
    ({ render: true, reason, stampSensorRender: false, scheduleIn: null });

  if (LOCAL_RENDER_KEYS.some(k => keys.has(k))) return yes('local-state');

  // Anything that is not a hass push and not local state: render rather than
  // guess. Lit only calls this for properties that actually changed.
  if (!keys.has('hass')) return yes('non-hass');

  if (!i.oldStates || !i.newStates || !i.devices) return yes('no-baseline');

  // Input targets first. A keypad key lights from an entity that usually
  // belongs to ANOTHER device — or to none the card discovered — so the
  // per-device scan below would never see it and the key would go stale.
  for (const id of i.inputTargets) {
    if (i.oldStates[id] !== i.newStates[id]) return yes('input-target');
  }

  let sensorChanged = false;
  for (const dev of i.devices) {
    for (const e of dev.entities ?? []) {
      const id = e.entity_id;
      if (!id) continue;
      if (i.oldStates[id] !== i.newStates[id]) {
        if (e.domain !== 'sensor') return yes('interactive');
        sensorChanged = true;
      }
    }
  }

  if (!sensorChanged) {
    return { render: false, reason: 'none', stampSensorRender: false, scheduleIn: null };
  }

  const waited = i.now - i.lastSensorRender;
  if (waited >= throttleMs) {
    return { render: true, reason: 'sensor-due', stampSensorRender: true, scheduleIn: null };
  }
  return {
    render: false,
    reason: 'sensor-throttled',
    stampSensorRender: false,
    scheduleIn: throttleMs - waited,
  };
}
