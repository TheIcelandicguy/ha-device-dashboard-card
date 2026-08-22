/**
 * Tests for src/card-builder.ts — the ✨ Create logic.
 *
 * The interesting one is the palette: "Surprise me" rolls a random hue, and the
 * promise is that it stays readable. That is only worth claiming if it is
 * checked, so this rolls a few hundred and asserts WCAG ratios on every one.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const out = mkdtempSync(join(tmpdir(), 'hdd-builder-'));
let failures = 0;
const check = (name, ok, detail = '') => {
  if (ok) console.log('  ✓ ' + name);
  else { failures++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
};

try {
  // CommonJS on purpose: tsc emits extensionless relative imports, which ESM
  // refuses to resolve but CJS resolution handles by appending .js.
  execFileSync(process.execPath, [
    join('node_modules', 'typescript', 'bin', 'tsc'),
    'src/card-builder.ts', '--outDir', out,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--moduleResolution', 'node',
  ], { stdio: 'inherit' });

  const m = createRequire(import.meta.url)(join(out, 'card-builder.js'));
  const { buildCardConfig, randomChoices, randomPalette, contrast, DEFAULT_CHOICES } = m;

  console.log('\nbuildCardConfig');
  const bare = buildCardConfig({ ...DEFAULT_CHOICES });
  check('defaults emit only `type`', Object.keys(bare).length === 1, JSON.stringify(bare));

  const themed = buildCardConfig({ ...DEFAULT_CHOICES, theme: 'nordic_warm' });
  check('a preset writes `theme` and no palette', themed.theme === 'nordic_warm' && !themed.style);

  const custom = buildCardConfig({ ...DEFAULT_CHOICES, theme: 'custom', palette: randomPalette() });
  check('a generated palette writes both', custom.theme === 'custom' && !!custom.style);

  const full = buildCardConfig({
    ...DEFAULT_CHOICES, universal: true, scope: 'all', tileStyle: 'power-monitor', variant: 'gauge',
    tileSize: 'lg', columns: 5, chips: ['power', 'energy'], showGraphs: true, graphType: 'bar',
    delegate: true, energyPeriod: 'week', sortBy: 'area', orbs: true,
  }, 'Home');
  const want = {
    title: 'Home', mode: 'universal', universal_scope: 'all', tile_style: 'power-monitor',
    power_monitor_variant: 'gauge', tile_size: 'lg', columns: 5, delegate_controls: true,
    energy_period: 'week', sort_by: 'area', header_show_orbs: true,
  };
  const wrong = Object.entries(want).filter(([k, v]) => JSON.stringify(full[k]) !== JSON.stringify(v));
  check('choices map to the right keys', wrong.length === 0, wrong.map(([k]) => k).join(', '));
  check('default header chips are not written', !('header_chips' in full));
  check('bar graphs write graph_style', full.graph_style?.type === 'bar');

  console.log('\nrandomChoices (200 rolls)');
  const pool = ['power', 'energy', 'temperature', 'humidity', 'battery', 'rssi', 'illuminance'];
  let bad = [];
  for (let i = 0; i < 200; i++) {
    const c = randomChoices(pool);
    if (c.columns < 2 || c.columns > 5) bad.push('columns ' + c.columns);
    if (c.chips.length < 2) bad.push('chips ' + c.chips.length);
    if (new Set(c.chips).size !== c.chips.length) bad.push('duplicate chips');
    if (!c.chips.every(k => pool.includes(k))) bad.push('chip outside pool');
    if (!['sm', 'md', 'lg'].includes(c.tileSize)) bad.push('size ' + c.tileSize);
    const cfg = buildCardConfig(c);
    if (cfg.type !== 'custom:ha-device-dashboard') bad.push('bad type');
  }
  check('every roll is in range and buildable', bad.length === 0, [...new Set(bad)].slice(0, 4).join('; '));

  console.log('\nrandomPalette (300 rolls) — WCAG floors');
  const fails = { primary: 0, secondary: 0, muted: 0, accent: 0, header: 0 };
  let worst = { primary: 99, secondary: 99, header: 99 };
  for (let i = 0; i < 300; i++) {
    const p = randomPalette();
    const pr = contrast(p.text_primary, p.tile_bg);
    const se = contrast(p.text_secondary, p.tile_bg);
    const mu = contrast(p.text_muted, p.tile_bg);
    const ac = contrast(p.accent_color, p.tile_bg);
    const hd = contrast(p.header_text_color, p.header_bg);
    if (pr < 7) fails.primary++;
    if (se < 4.5) fails.secondary++;
    if (mu < 3) fails.muted++;
    if (ac < 3) fails.accent++;
    if (hd < 7) fails.header++;
    worst = { primary: Math.min(worst.primary, pr), secondary: Math.min(worst.secondary, se), header: Math.min(worst.header, hd) };
  }
  check('primary text ≥ 7:1 on the tile', fails.primary === 0, `${fails.primary} failed, worst ${worst.primary.toFixed(2)}`);
  check('secondary text ≥ 4.5:1', fails.secondary === 0, `${fails.secondary} failed, worst ${worst.secondary.toFixed(2)}`);
  check('muted text ≥ 3:1', fails.muted === 0, `${fails.muted} failed`);
  check('accent ≥ 3:1', fails.accent === 0, `${fails.accent} failed`);
  check('header text ≥ 7:1 on the header', fails.header === 0, `${fails.header} failed, worst ${worst.header.toFixed(2)}`);
} finally {
  rmSync(out, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} failure(s)` : '\nOK');
process.exitCode = failures ? 1 : 0;
