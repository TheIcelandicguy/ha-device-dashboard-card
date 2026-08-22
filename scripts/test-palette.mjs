/**
 * Tests for src/palette.ts — the ✨ Create logic.
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

const out = mkdtempSync(join(tmpdir(), 'hdd-palette-'));
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
    'src/palette.ts', '--outDir', out,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--moduleResolution', 'node',
  ], { stdio: 'inherit' });

  const m = createRequire(import.meta.url)(join(out, 'palette.js'));
  const { randomPalette, randomTheme, contrast } = m;

  console.log('randomTheme (100 rolls)');
  let notPreset = 0, sameAsExcluded = 0;
  for (let i = 0; i < 100; i++) {
    const name = randomTheme('warm_dusk');
    if (typeof name !== 'string') notPreset++;
    if (name === 'warm_dusk') sameAsExcluded++;
  }
  check('always returns a preset name', notPreset === 0);
  check('never returns the excluded one', sameAsExcluded === 0, `${sameAsExcluded} repeats`);

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
