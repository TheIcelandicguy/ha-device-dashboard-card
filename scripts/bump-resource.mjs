/**
 * Point Home Assistant's Lovelace resource at the build that was just deployed.
 *
 * The resource URL carries a `?v=` cache-buster. Deploying overwrites the file
 * but leaves that query string alone, so the browser — and HA's service worker,
 * which is the stubborn one — keep serving the previously cached response. A
 * whole day's builds can land on Z: without a single one reaching the dashboard,
 * which is exactly what happened on 2026-08-31. Rewriting `?v=` to the current
 * BUILD_TAG makes "deployed" and "loaded" the same fact.
 *
 * Lovelace resources are NOT in the REST API — they are a WebSocket command — so
 * this needs a long-lived access token:
 *
 *   HA_TOKEN   required. Profile → Security → Long-lived access tokens.
 *   HA_URL     optional, default http://homeassistant.local:8123
 *
 * Never fails the build: no token, no HA, no matching resource — it says why and
 * exits 0. A dashboard that loads a stale bundle is a nuisance; a build that
 * dies because the server is asleep is worse.
 */
import fs from 'fs';

const HA_URL = process.env.HA_URL || 'http://homeassistant.local:8123';
const TOKEN = process.env.HA_TOKEN;
/** Matched against the start of the resource URL, before the `?v=`. */
const RESOURCE_PATH = '/local/community/ha-device-dashboard/ha-device-dashboard.js';

const note = (m) => console.log(`\x1b[33m[bump-resource] ${m}\x1b[0m`);
const good = (m) => console.log(`\x1b[32m[bump-resource] ${m}\x1b[0m`);

/** The tag the bundle prints to the console, read from source. */
function buildTag() {
  const src = fs.readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
  return src.match(/const BUILD_TAG = '([^']+)'/)?.[1];
}

function ws() {
  const url = HA_URL.replace(/^http/, 'ws').replace(/\/$/, '') + '/api/websocket';
  return new WebSocket(url);
}

async function main() {
  const tag = buildTag();
  if (!tag) return note('no BUILD_TAG found in src/index.ts — skipped');
  if (!TOKEN) {
    note(`HA_TOKEN not set — skipped. Set the resource by hand to:`);
    note(`  ${RESOURCE_PATH}?v=${tag}`);
    return;
  }

  const sock = ws();
  let id = 0;
  const pending = new Map();
  const send = (msg) => {
    const mid = ++id;
    sock.send(JSON.stringify({ ...msg, id: mid }));
    return new Promise((res) => pending.set(mid, res));
  };

  const done = new Promise((resolve) => {
    const finish = (fn) => { try { sock.close(); } catch { /* already gone */ } resolve(fn); };

    // A dead or unreachable HA must not hang the build.
    const timer = setTimeout(() => finish(() => note('timed out talking to HA — skipped')), 8000);

    sock.addEventListener('error', () => {
      clearTimeout(timer);
      finish(() => note(`cannot reach ${HA_URL} — skipped`));
    });

    sock.addEventListener('message', async (ev) => {
      const msg = JSON.parse(ev.data);

      if (msg.type === 'auth_required') { sock.send(JSON.stringify({ type: 'auth', access_token: TOKEN })); return; }
      if (msg.type === 'auth_invalid') { clearTimeout(timer); finish(() => note('HA_TOKEN rejected — skipped')); return; }

      if (msg.type === 'auth_ok') {
        const list = await send({ type: 'lovelace/resources' });
        const hit = (list.result ?? []).find((r) => String(r.url).split('?')[0] === RESOURCE_PATH);
        if (!hit) { clearTimeout(timer); finish(() => note(`no resource registered for ${RESOURCE_PATH} — skipped`)); return; }

        const next = `${RESOURCE_PATH}?v=${tag}`;
        if (hit.url === next) { clearTimeout(timer); finish(() => good(`already at ?v=${tag}`)); return; }

        const upd = await send({
          type: 'lovelace/resources/update',
          resource_id: hit.id,
          url: next,
          res_type: hit.type || 'module',
        });
        clearTimeout(timer);
        finish(() => (upd.success === false
          ? note(`HA refused the update: ${upd.error?.message ?? 'unknown'} — skipped`)
          : good(`resource → ?v=${tag} (hard-refresh to pick it up)`)));
        return;
      }

      if (msg.type === 'result' && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    });
  });

  (await done)();
}

main().catch((e) => note(`skipped: ${e.message}`));
