// Headless smoke test for docs/tools/config-builder.html: run its script against
// a stub DOM and check the YAML it emits for the keys added today.
import { readFileSync } from 'node:fs';

const html = readFileSync('docs/tools/config-builder.html', 'utf8');
const code = html.match(/<script>([\s\S]*)<\/script>/)[1];

const stub = () => new Proxy({
  style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  appendChild() {}, addEventListener() {}, removeEventListener() {},
  querySelector: () => stub(), querySelectorAll: () => [],
  innerHTML: '', textContent: '', value: '', className: '',
}, {
  get: (t, k) => (k in t ? t[k] : typeof k === 'string' && k.startsWith('on') ? undefined : stub()),
  set: (t, k, v) => { t[k] = v; return true; },
});

const document = {
  getElementById: () => stub(),
  createElement: () => stub(),
  addEventListener() {},
};

const sandbox = { document, window: {}, navigator: { clipboard: { writeText() {} } }, console, Blob: class {}, URL: { createObjectURL: () => '', revokeObjectURL() {} } };
const run = new Function(...Object.keys(sandbox), code + '\n;return { buildConfig, yamlOf: typeof toYaml==="function"?toYaml:null, S, fresh, applyImport: typeof applyImport==="function"?applyImport:null, MANAGED };');
const api = run(...Object.values(sandbox));

// 1. a bare card emits nothing but the type
let out = api.buildConfig();
console.log('bare config keys:', Object.keys(out).join(', '));
if (Object.keys(out).length !== 1) throw new Error('bare config should be type-only');

// 2. the new controls emit the right keys
Object.assign(api.S, {
  mode: 'universal', universal_scope: 'all',
  exclude_integrations: ['hue', 'tplink'], exclude_domains: ['update'],
  delegate_controls: true, energy_period: 'today', sort_by: 'area',
  theme: 'nordic_warm', tile_style: 'input-control',
});
out = api.buildConfig();
const expect = {
  mode: 'universal', universal_scope: 'all', delegate_controls: true,
  energy_period: 'today', sort_by: 'area', theme: 'nordic_warm', tile_style: 'input-control',
};
for (const [k, v] of Object.entries(expect)) {
  if (JSON.stringify(out[k]) !== JSON.stringify(v)) throw new Error(`${k}: expected ${v}, got ${JSON.stringify(out[k])}`);
}
if (JSON.stringify(out.exclude_integrations) !== JSON.stringify(['hue', 'tplink'])) throw new Error('exclude_integrations');
if (out.style) throw new Error('theme must not be materialised into style');
console.log('universal config:', JSON.stringify(out));

// 3. scope at its default is omitted, and shelly mode drops the universal keys
Object.assign(api.S, { mode: 'shelly' });
out = api.buildConfig();
for (const k of ['mode', 'universal_scope', 'exclude_integrations', 'exclude_domains']) {
  if (k in out) throw new Error(`${k} leaked into a Shelly-mode config`);
}
console.log('shelly-mode config:', JSON.stringify(out));

// 4. every emitted key is declared MANAGED, so import never calls one "unhandled"
Object.assign(api.S, { mode: 'universal', universal_scope: 'controllable' });
const unmanaged = Object.keys(api.buildConfig()).filter(k => !api.MANAGED.includes(k));
if (unmanaged.length) throw new Error('emitted but not MANAGED: ' + unmanaged.join(', '));
console.log('all emitted keys are MANAGED');

console.log('\nOK');
