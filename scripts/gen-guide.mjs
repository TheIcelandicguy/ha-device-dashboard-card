/**
 * Generate docs/GUIDE.md from src/help.ts — the same content the editor's
 * ? Help panel renders.
 *
 * Everything else under docs/ is hand-synced and drifts (see CLAUDE.md); this
 * exists so the guide cannot. Never edit docs/GUIDE.md by hand: change
 * src/help.ts and run `npm run docs:guide`.
 *
 * TypeScript can't be imported by node directly, so the help module is compiled
 * to a temp dir with the tsc that already ships as a devDependency, imported,
 * then thrown away.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = mkdtempSync(join(tmpdir(), 'hdd-guide-'));
try {
  // Call the local tsc through node rather than npx: since Node 20, spawning a
  // .cmd shim without a shell fails outright on Windows.
  execFileSync(
    process.execPath,
    [join('node_modules', 'typescript', 'bin', 'tsc'),
      'src/help.ts', '--outDir', out, '--module', 'es2020', '--target', 'es2020', '--skipLibCheck'],
    { stdio: 'inherit' },
  );

  const { HELP_CONCEPTS, HELP_RECIPES, HELP_INTRO } =
    await import(pathToFileURL(join(out, 'help.js')).href);

  const topic = (t) => {
    const lines = [`### ${t.title}`, ''];
    for (const p of t.body) lines.push(p, '');
    if (t.steps) {
      t.steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
      lines.push('');
    }
    return lines.join('\n');
  };

  const md = [
    '# Guide',
    '',
    '<!-- Generated from src/help.ts by `npm run docs:guide` — do not edit by hand. -->',
    '',
    HELP_INTRO,
    '',
    'This is the same text as the editor\'s **? Help** panel.',
    '',
    '## How it works',
    '',
    ...HELP_CONCEPTS.map(topic),
    '## Recipes',
    '',
    ...HELP_RECIPES.map(topic),
  ].join('\n');

  writeFileSync('docs/GUIDE.md', md.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
  console.log(`docs/GUIDE.md written — ${HELP_CONCEPTS.length} concepts, ${HELP_RECIPES.length} recipes`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
