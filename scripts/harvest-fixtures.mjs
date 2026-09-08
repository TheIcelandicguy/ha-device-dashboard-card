#!/usr/bin/env node
/**
 * Harvest device-detection fixtures from a running Home Assistant.
 *
 * Detection is the most fragile part of the card and the part most likely to be
 * wrong on hardware the author has never seen. Two detection bugs were found in
 * one evening, both by looking at real device data and neither by reading the
 * code: a `/^sh/i` rule that matched *every* device named "Shelly…", and the BLU
 * Gateway — a mains WiFi Gen3 unit whose name contains "BLU" — resolving to
 * `ble`. Reasoning found neither. Real rows do.
 *
 *   HA_URL=http://homeassistant.local:8123 node scripts/harvest-fixtures.mjs
 *
 * Token from `HA_TOKEN` or a `.ha-token` file in the repo root (gitignored).
 *
 * ── What is written, and what is not ──────────────────────────────────────────
 *
 * The output is committed to a public repo, so it carries only what detection
 * actually reads, and every identifier is scrubbed:
 *
 *   - MAC addresses in entity ids and names → a stable fake per real MAC, so
 *     two entities of one device still share a suffix and channel pairing still
 *     resolves. `shellyplus1pm_b0b21c1aefe4` → `shellyplus1pm_aabbcc000007`.
 *   - IP addresses → `10.0.0.N`, same stability.
 *   - `configuration_url`, `identifiers`, `connections`, `serial_number` →
 *     dropped entirely. Detection never reads them; they are pure serial-number
 *     leakage.
 *   - `friendly_name` and every other attribute except `device_class` and
 *     `unit_of_measurement` → dropped.
 *
 * Device names are kept ONLY for the integrations whose detection actually reads
 * them — `shelly` and `bthome`, where the BLU-by-name rule lives and where the
 * second bug was. Every other integration gets `<model> N`, because a phone or a
 * laptop is usually named after a person and no detection rule reads it. Pass
 * --anonymise-names to do the same to Shelly names too, at the cost of the
 * name-based cases.
 *
 * Check the output before committing regardless: a Shelly named after someone
 * would still come through.
 *
 * ── Deduplication ────────────────────────────────────────────────────────────
 *
 * One exemplar per distinct hardware shape — manufacturer, model, model_id,
 * hw_version and the set of entity domains/classes. Forty identical Shelly 1PMs
 * prove nothing forty times; the fixture's value is breadth.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const HA_URL = process.env.HA_URL || 'http://homeassistant.local:8123';
const OUT = join('scripts', 'fixtures', 'detection-devices.json');
const ANON = process.argv.includes('--anonymise-names');

function token() {
  if (process.env.HA_TOKEN) return process.env.HA_TOKEN.trim();
  if (existsSync('.ha-token')) return readFileSync('.ha-token', 'utf8').trim();
  console.error('No token: set HA_TOKEN or create .ha-token in the repo root.');
  process.exit(1);
}

async function registries(tok) {
  const { WebSocket } = await import('ws').catch(() => ({ WebSocket: globalThis.WebSocket }));
  return new Promise((resolve, reject) => {
    const sock = new WebSocket(HA_URL.replace(/^http/, 'ws') + '/api/websocket');
    const out = {}; let n = 0;
    sock.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.type === 'auth_required') return sock.send(JSON.stringify({ type: 'auth', access_token: tok }));
      if (m.type === 'auth_invalid') return reject(new Error('auth invalid'));
      if (m.type === 'auth_ok') {
        sock.send(JSON.stringify({ id: 1, type: 'config/entity_registry/list' }));
        sock.send(JSON.stringify({ id: 2, type: 'config/device_registry/list' }));
        return;
      }
      if (m.type === 'result') { out[m.id] = m.result; if (++n === 2) { sock.close(); resolve(out); } }
    };
    sock.onerror = reject;
  });
}

// ── Scrubbing ────────────────────────────────────────────────────────────────
// Stable per run: the same real value always maps to the same fake, so entities
// of one device keep sharing a suffix and nothing about detection changes.
const macMap = new Map();
const ipMap = new Map();
const fakeMac = (real) => {
  if (!macMap.has(real)) {
    const n = macMap.size + 1;
    macMap.set(real, 'aabbcc' + String(n).padStart(6, '0'));
  }
  return macMap.get(real);
};
const fakeIp = (real) => {
  if (!ipMap.has(real)) ipMap.set(real, `10.0.0.${ipMap.size + 1}`);
  return ipMap.get(real);
};

/**
 * A MAC (12 hex, bare or separated) or any other long hex identifier — the
 * per-instance ids browser_mod and music_assistant put in entity ids are 8 hex
 * chars and just as unique as a MAC.
 *
 * The run must contain a letter, so a pure-digit firmware date like `20260311`
 * survives: it identifies a build, not a device, and scrubbing it would churn
 * the fixture for nothing.
 */
const MAC_RE = /\b([0-9a-f]{2}[:-]){5}[0-9a-f]{2}\b|\b(?=[0-9a-f]*[a-f])[0-9a-f]{8,}\b/gi;
const IP_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function scrub(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(MAC_RE, (m) => fakeMac(m.toLowerCase().replace(/[:-]/g, '')))
    .replace(IP_RE, (m) => fakeIp(m));
}

const tok = token();
const reg = await registries(tok);
const states = Object.fromEntries(
  (await (await fetch(HA_URL + '/api/states', { headers: { Authorization: 'Bearer ' + tok } })).json())
    .map(s => [s.entity_id, s]));

const byDevice = new Map();
for (const e of reg[1]) {
  if (!e.device_id || e.disabled_by) continue;
  if (!byDevice.has(e.device_id)) byDevice.set(e.device_id, []);
  byDevice.get(e.device_id).push(e);
}

const rows = [];
const seen = new Set();
let anonIndex = 0;

for (const dev of reg[2]) {
  const ents = byDevice.get(dev.id) ?? [];
  if (!ents.length) continue;
  const platform = (ents[0].platform ?? '').toLowerCase();

  const entities = ents.map(e => {
    const st = states[e.entity_id];
    const a = st?.attributes ?? {};
    return {
      entity_id: scrub(e.entity_id),
      domain: e.entity_id.split('.')[0],
      ...(e.entity_category ? { entity_category: e.entity_category } : {}),
      // Only the two attributes detection reads. Everything else — including
      // friendly_name — is dropped rather than scrubbed.
      ...(a.device_class ? { attributes: { device_class: a.device_class } } : {}),
    };
  }).sort((x, y) => x.entity_id.localeCompare(y.entity_id));

  // One exemplar per hardware shape.
  const shape = [
    dev.manufacturer ?? '', dev.model ?? '', dev.model_id ?? '', dev.hw_version ?? '', platform,
    ...entities.map(e => `${e.domain}:${e.attributes?.device_class ?? ''}:${e.entity_category ?? ''}`).sort(),
  ].join('|');
  if (seen.has(shape)) continue;
  seen.add(shape);

  const rawName = dev.name_by_user ?? dev.name ?? dev.id;
  // Only Shelly/BTHome detection reads the display name. Everywhere else the
  // name is dead weight in a public fixture and is usually someone's first name.
  const nameIsRead = platform === 'shelly' || platform === 'bthome';
  const name = (nameIsRead && !ANON)
    ? scrub(rawName)
    : `${dev.model ?? dev.manufacturer ?? platform ?? 'Device'} ${++anonIndex}`;
  rows.push({
    name,
    integration: platform,
    ...(dev.manufacturer ? { manufacturer: dev.manufacturer } : {}),
    ...(dev.model ? { model: String(dev.model) } : {}),
    ...(dev.model_id ? { model_id: String(dev.model_id) } : {}),
    ...(dev.hw_version ? { hw_version: String(dev.hw_version) } : {}),
    ...(dev.sw_version ? { sw_version: scrub(String(dev.sw_version)) } : {}),
    entities,
  });
}

rows.sort((a, b) => (a.integration + a.name).localeCompare(b.integration + b.name));
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  harvested: new Date().toISOString().slice(0, 10),
  note: 'Real registry rows, scrubbed. Regenerate with scripts/harvest-fixtures.mjs. '
      + 'Expected values live in detection-expected.json and are a record of what '
      + 'the code does today, not a claim that it is right.',
  devices: rows,
}, null, 1) + '\n');

const byInt = rows.reduce((m, r) => m.set(r.integration, (m.get(r.integration) ?? 0) + 1), new Map());
console.log(`${rows.length} distinct device shapes → ${OUT}`);
console.log(`scrubbed ${macMap.size} MACs, ${ipMap.size} IPs`);
console.log([...byInt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
  .map(([k, v]) => `  ${String(v).padStart(3)}  ${k}`).join('\n'));
