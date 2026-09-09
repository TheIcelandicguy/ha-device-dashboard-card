#!/usr/bin/env node
/**
 * Measure what it costs to actually DRAW the card.
 *
 * `bench.mjs` measures the logic — discovery, attention, the cascades — and
 * found it fast: 4 ms of discovery for 224 devices, cached against registry and
 * config identity so it does not run on a state push. That is the part that was
 * already known to be cheap. The part nobody had measured is the DOM: Lit
 * rendering several hundred tiles, each with chips, graphs and controls, is the
 * more likely real-world limit and cannot be measured in Node at all.
 *
 * So this drives headless Chrome against a running Home Assistant, builds the
 * real card element with the real `hass`, and times it at increasing fleet
 * sizes:
 *
 *   HA_URL=http://homeassistant.local:8123 node scripts/bench-render.mjs
 *   node scripts/bench-render.mjs --sizes 10,50,100,200 --graphs
 *
 * Token from `HA_TOKEN` or `.ha-token`. Needs Chrome; set CHROME to override the
 * path.
 *
 * ── What the numbers mean ────────────────────────────────────────────────────
 *
 *   first    element created, config set, hass set → updateComplete, then a
 *            forced layout read. The cost of opening a dashboard.
 *   update   a real state push: ~10% of the fleet's entities change, a new
 *            `hass` is assigned, → updateComplete. The cost of a push getting
 *            through `shouldUpdate`, which happens every couple of seconds on a
 *            Shelly fleet. Non-sensor entities are churned on purpose — sensor
 *            churn is coalesced over 2s, so in a tight loop it would measure the
 *            throttle rather than the render.
 *
 * Both include layout, because a render that has not been laid out has not cost
 * what it is going to cost. Neither includes graph history fetches — those are
 * network, queued six at a time, and deliberately outside this measurement.
 *
 * 16.7 ms is one frame at 60 Hz. `update` is the number to care about: `first`
 * happens once, `update` happens forever.
 */

import { spawn } from 'node:child_process';
import { readFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';

const HA_URL = process.env.HA_URL || 'http://homeassistant.local:8123';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9240;
const PROFILE = 'C:/Users/brave/AppData/Local/Temp/hddbench/profile';
const FRAME_MS = 16.7;

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const SIZES = arg('--sizes', '25,50,100,200').split(',').map(Number).filter(Boolean);
const GRAPHS = process.argv.includes('--graphs');
const REPEATS = Number(arg('--repeats', '5'));

function token() {
  if (process.env.HA_TOKEN) return process.env.HA_TOKEN.trim();
  if (existsSync('.ha-token')) return readFileSync('.ha-token', 'utf8').trim();
  console.error('No token: set HA_TOKEN or create .ha-token in the repo root.');
  process.exit(1);
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

rmSync(PROFILE, { recursive: true, force: true });
mkdirSync(PROFILE, { recursive: true });
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--force-device-scale-factor=1',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, 'about:blank',
], { stdio: 'ignore' });

let wsUrl = null;
for (let i = 0; i < 40 && !wsUrl; i++) {
  await sleep(250);
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl; }
  catch { /* not up yet */ }
}
if (!wsUrl) { chrome.kill(); throw new Error('Chrome did not start — set CHROME to its path.'); }

const { WebSocket } = await import('ws').catch(() => ({ WebSocket: globalThis.WebSocket }));
const ws = new WebSocket(wsUrl, { maxPayload: 512 * 1024 * 1024 });
await new Promise(r => { ws.onopen = r; });
let id = 0; const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const mid = ++id; pending.set(mid, { res, rej });
  ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
});
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
};

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable');
  // A desktop-ish viewport: tile count per row changes layout cost.
  await S('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1200, deviceScaleFactor: 1, mobile: false });

  await S('Page.navigate', { url: `${HA_URL}/lovelace/0` });
  await sleep(2500);
  await S('Runtime.evaluate', {
    expression: `localStorage.setItem('hassTokens', JSON.stringify({
      access_token: ${JSON.stringify(token())}, token_type:'Bearer', expires_in:315360000,
      hassUrl: ${JSON.stringify(HA_URL)}, clientId:null, expires: Date.now()+315360000000 })); 'ok'`,
    returnByValue: true,
  });
  await S('Page.navigate', { url: `${HA_URL}/lovelace/0` });

  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    await sleep(500);
    const r = await S('Runtime.evaluate', {
      expression: `!!(document.querySelector('home-assistant')?.hass && customElements.get('ha-device-dashboard'))`,
      returnByValue: true,
    });
    ready = r.result?.value === true;
  }
  if (!ready) throw new Error('The card never registered — is the resource loaded on this dashboard?');

  const bench = `(async (sizes, repeats, graphs) => {
    const hass = document.querySelector('home-assistant').hass;
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;width:1600px';
    document.body.appendChild(host);

    // Real device ids, so the card discovers and renders real hardware.
    const Card = customElements.get('ha-device-dashboard');
    const probe = new Card();
    probe.hass = hass;
    // Force-include the deny-listed integrations: this is a benchmark, and the
    // question is how the card behaves at 200+ tiles, so we want every real
    // device the instance can offer rather than the sensible default set.
    const DISCOVER = {
      mode:'universal', universal_scope:'all',
      include_integrations: ['tplink_router','hassio','netgear','mobile_app',
        'browser_mod','systemmonitor','backup','sun','nws','huawei_lte','asuswrt'],
    };
    probe.setConfig(Object.assign({ type:'custom:ha-device-dashboard' }, DISCOVER));
    host.appendChild(probe);
    await probe.updateComplete;
    // _getDevices() is the card's own discovery + cache; _cachedDevices is what
    // it filled. Either way we want real ids, so the benchmark renders real
    // hardware rather than a synthetic fleet that misses whatever is slow.
    const found = (typeof probe._getDevices === 'function' ? probe._getDevices() : null)
      ?? probe._cachedDevices ?? [];
    const allIds = found.map(d => d.device_id);
    probe.remove();

    const out = [];
    for (const n of sizes) {
      const ids = allIds.slice(0, n);
      if (ids.length < n) { out.push({ n, skipped: 'only ' + ids.length + ' devices available' }); continue; }
      const config = Object.assign({ type:'custom:ha-device-dashboard' }, DISCOVER,
        { devices: ids, show_graphs: graphs });

      // ── first render ──
      const firsts = [];
      for (let r = 0; r < repeats; r++) {
        const el = new Card();
        el.hass = hass;
        const t0 = performance.now();
        el.setConfig(config);
        host.appendChild(el);
        await el.updateComplete;
        el.getBoundingClientRect().height;      // force layout
        firsts.push(performance.now() - t0);
        if (r < repeats - 1) el.remove();
        else var kept = el;
      }

      // ── update render on the built card ──
      // A real push changes a handful of states, and Lit only rewrites the DOM
      // that actually differs — so requestUpdate() alone measures the empty
      // case (~3 ms at any size, because nothing changed). Mutate real entities
      // instead. Non-sensor ones, because shouldUpdate coalesces pure sensor
      // churn over 2s: in a tight loop that would measure the throttle, not the
      // render.
      const devs = kept._cachedDevices ?? [];
      const churn = [];
      for (const d of devs) {
        const e = (d.entities ?? []).find(x => x.domain === 'switch' || x.domain === 'light'
          || x.domain === 'binary_sensor');
        if (e) churn.push(e.entity_id);
        if (churn.length >= Math.max(1, Math.round(devs.length / 10))) break;
      }

      const updates = [];
      for (let r = 0; r < repeats; r++) {
        const states = Object.assign({}, kept.hass.states);
        for (const id of churn) {
          const cur = states[id];
          if (!cur) continue;
          states[id] = Object.assign({}, cur, {
            state: cur.state === 'on' ? 'off' : 'on',
            last_updated: new Date(Date.now() + r).toISOString(),
          });
        }
        const nextHass = Object.assign(Object.create(Object.getPrototypeOf(kept.hass)), kept.hass, { states });
        const t0 = performance.now();
        kept.hass = nextHass;
        await kept.updateComplete;
        kept.getBoundingClientRect().height;
        updates.push(performance.now() - t0);
      }

      const tiles = kept.shadowRoot ? kept.shadowRoot.querySelectorAll('.tile').length : 0;
      const nodes = kept.shadowRoot ? kept.shadowRoot.querySelectorAll('*').length : 0;
      kept.remove();

      const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
      out.push({ n, tiles, nodes, churned: churn.length, first: med(firsts), update: med(updates) });
    }
    host.remove();
    return JSON.stringify(out);
  })(${JSON.stringify(SIZES)}, ${REPEATS}, ${GRAPHS})`;

  const r = await S('Runtime.evaluate', { expression: bench, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) {
    throw new Error('benchmark threw: ' + JSON.stringify(r.exceptionDetails).slice(0, 500));
  }

  const rows = JSON.parse(r.result.value);
  const pct = (ms) => `(${(ms / FRAME_MS * 100).toFixed(0)}% of a frame)`;
  console.log(`\nDOM render, real devices, 1600px viewport, graphs ${GRAPHS ? 'ON' : 'off'}`
    + `, median of ${REPEATS}\n`);
  for (const row of rows) {
    if (row.skipped) { console.log(`${String(row.n).padStart(4)} devices  — skipped: ${row.skipped}`); continue; }
    console.log(`${String(row.n).padStart(4)} devices  ${String(row.tiles).padStart(4)} tiles  `
      + `${String(row.nodes).padStart(6)} nodes  (${row.churned} entities changed per update)`);
    console.log(`      first   ${row.first.toFixed(1).padStart(7)} ms  ${pct(row.first)}`);
    console.log(`      update  ${row.update.toFixed(1).padStart(7)} ms  ${pct(row.update)}`);
  }
  console.log('\nupdate is the number that matters: first happens once, update happens'
    + '\nevery time a state push gets through shouldUpdate (~2s on a Shelly fleet).');
} finally {
  ws.close();
  chrome.kill();
}
