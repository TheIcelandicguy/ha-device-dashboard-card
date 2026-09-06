/**
 * Cross-check docs/ against src/. Most of docs/ is hand-synced (see CLAUDE.md)
 * and drifts silently; this reports the drift instead of waiting for someone to
 * trip over it. Read-only — it never edits, it just lists mismatches.
 *
 * Run with `npm run check:docs`.
 */
import { readFileSync } from 'node:fs';

const read = (f) => readFileSync(f, 'utf8');
const ref = JSON.parse(read('docs/card-reference.json'));
const problems = [];
const note = (where, msg) => problems.push(`${where}: ${msg}`);

const setEq = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const missing = (a, b) => a.filter((x) => !b.includes(x));

// ── tile styles: the TS union vs the reference vs the two designers ──
const types = read('src/types.ts');
/** Values of one exported union, scoped to its own declaration — types.ts has
 *  several unions of lowercase strings and a loose regex mixes them together. */
const union = (name) => {
  // Built from a plain string, not a template literal: `\s` in a template is
  // just "s". And the repo is CRLF, so the terminator has to tolerate \r.
  const re = new RegExp('export type ' + name + ' =([\\s\\S]*?);\\r?\\n');
  const body = types.match(re)?.[1] ?? '';
  if (!body) note('scripts/check-docs.mjs', `could not read the ${name} union — check the extractor`);
  return [...body.matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
};
const LEGACY_STYLES = ['hero', 'ring', 'hbar', 'spark', 'list', 'command'];
const realStyles = union('TileStyle').filter((s) => !LEGACY_STYLES.includes(s));
const refStyles = ref.tileStyles.map((t) => t.key);
if (!setEq(realStyles, refStyles)) {
  note('card-reference.tileStyles', `missing ${missing(realStyles, refStyles).join(', ') || '—'}; extra ${missing(refStyles, realStyles).join(', ') || '—'}`);
}
for (const f of ['docs/tools/profile-tiles.html', 'docs/tools/style-presets.html']) {
  const html = read(f);
  const absent = realStyles.filter((s) => s !== 'default' && !html.includes(`'${s}'`));
  if (absent.length) note(f, `tile styles not mentioned: ${absent.join(', ')}`);
}

// ── tile blocks ──
const realBlocks = union('TileBlockId');
const refBlocks = ref.tileBlocks.map((b) => b.id);
if (missing(refBlocks, realBlocks).length || missing(realBlocks, refBlocks).length) {
  note('card-reference.tileBlocks', `missing ${missing(realBlocks, refBlocks).join(', ') || '—'}; extra ${missing(refBlocks, realBlocks).join(', ') || '—'}`);
}

// ── profiles ──
const refProfiles = ref.profiles.map((p) => p.key);
const profileLabelBlock = read('src/helpers.ts').match(/PROFILE_LABELS[^{]*\{([\s\S]*?)\n\};/);
const labelKeys = profileLabelBlock ? [...profileLabelBlock[1].matchAll(/^\s*(\w+):/gm)].map((m) => m[1]) : [];
const unionProfiles = union('DeviceProfile');
if (unionProfiles.length && labelKeys.length && !setEq(unionProfiles, labelKeys)) {
  note('src', `PROFILE_LABELS and the DeviceProfile union disagree: ${missing(unionProfiles, labelKeys).join(', ') || '—'}`);
}
if (labelKeys.length && !setEq(labelKeys, refProfiles)) {
  note('card-reference.profiles', `missing ${missing(labelKeys, refProfiles).join(', ') || '—'}; extra ${missing(refProfiles, labelKeys).join(', ') || '—'}`);
}

// ── per-profile smart style + default blocks ──
const helpers = read('src/helpers.ts');
const smartBlock = helpers.match(/PROFILE_DEFAULT_TILE_STYLE[^{]*\{([\s\S]*?)\n\};/);
if (smartBlock) {
  for (const [, k, v] of smartBlock[1].matchAll(/^\s*(\w+):\s*'([a-z-]+)'/gm)) {
    const entry = ref.profiles.find((p) => p.key === k);
    if (entry && entry.smartStyle !== v) note('card-reference.profiles', `${k}.smartStyle is "${entry.smartStyle}", code says "${v}"`);
  }
}
const blockOrder = helpers.match(/PROFILE_DEFAULT_BLOCKS[^{]*\{([\s\S]*?)\n\};/);
if (blockOrder && ref.profileBlockOrder) {
  for (const [, k, list] of blockOrder[1].matchAll(/^\s*(\w+):\s*\[([^\]]*)\]/gm)) {
    const code = [...list.matchAll(/'([\w]+)'/g)].map((m) => m[1]);
    const docd = ref.profileBlockOrder[k];
    if (docd && JSON.stringify(code) !== JSON.stringify(docd)) {
      note('card-reference.profileBlockOrder', `${k} differs — code [${code.join(',')}] vs docs [${docd.join(',')}]`);
    }
  }
}

// ── per-profile chip defaults ──
// The JSON writes [] for a profile the code omits, and an omitted profile means
// "show every chip", not "show none". Compare with that convention in mind.
const chipDefaults = helpers.match(/PROFILE_DEFAULT_SENSORS[^{]*\{([\s\S]*?)\n\};/);
if (chipDefaults) {
  for (const p of ref.profiles) {
    const row = chipDefaults[1].match(new RegExp(`^\\s*${p.key}:\\s*\\[([\\s\\S]*?)\\]`, 'm'));
    const code = row ? [...row[1].matchAll(/'([\w]+)'/g)].map((m) => m[1]) : null;
    const docd = p.chips ?? [];
    if (code === null) {
      if (docd.length) note('card-reference.profiles', `${p.key} lists chips but the code has no entry (= show all)`);
    } else if (JSON.stringify(code) !== JSON.stringify(docd)) {
      note('card-reference.profiles', `${p.key} chips differ — code [${code.join(',')}] vs docs [${docd.join(',')}]`);
    }
  }
}

// ── style elements ──
// Compare per-style ELEMENT IDS, not just style keys: the designer's inlined
// ELEMENTS map is hand-synced, and a style-key presence test let a new element
// (header_chips) drift past this gate unnoticed.
const seBlock = helpers.match(/STYLE_ELEMENTS[^{]*\{([\s\S]*?)\n\};/);
if (seBlock) {
  const presets = read('docs/tools/style-presets.html');
  const styleRe = /^\s{2}'?([\w-]+)'?:\s*\[([\s\S]*?)\],\s*$/gm;
  for (const m of seBlock[1].matchAll(styleRe)) {
    const st = m[1];
    if (!presets.includes(`'${st}'`)) { note('style-presets.html', `no elements listed for style "${st}"`); continue; }
    const desRow = presets.match(new RegExp(`'${st}':\\s*\\[(.*)\\],?`));
    const codeIds = [...m[2].matchAll(/\{ id: '(\w+)'/g)].map((x) => x[1]);
    const desIds = desRow ? [...desRow[1].matchAll(/\['(\w+)','/g)].map((x) => x[1]) : [];
    for (const id of codeIds) if (!desIds.includes(id)) {
      note('style-presets.html', `style "${st}" is missing element "${id}" from STYLE_ELEMENTS`);
    }
    for (const id of desIds) if (!codeIds.includes(id)) {
      note('style-presets.html', `style "${st}" lists element "${id}" that STYLE_ELEMENTS no longer has`);
    }
  }
}

// ── reference.html: guard the drift classes that slipped past this gate ──
// It inlines its own copy of every table and nothing regenerates it, so check
// the two things that actually went stale: element rows claiming the old
// "all visible" default (elements can be def: false now), and the retired
// per-room panel ("Room picker") coming back from an old sync.
{
  const refHtml = read('docs/tools/reference.html');
  const refJson = read('docs/card-reference.json');
  for (const [name, text] of [['reference.html', refHtml], ['card-reference.json', refJson]]) {
    for (const line of text.split('\n')) {
      if (line.includes('.elements') && line.includes('all visible')) {
        note(name, `an .elements row still claims "all visible" — elements default per STYLE_ELEMENTS (def: false = opt-in): ${line.trim().slice(0, 90)}…`);
      }
    }
    if (/behind a room picker|Room picker'/.test(text)) {
      note(name, 'describes the retired per-room panel ("Room picker") — room styling lives in Design → room scope');
    }
  }
}

// ── header chips + themes ──
const chipKeys = [...helpers.matchAll(/\{ key: '(\w+)',\s+label: '[^']*',\s+agg:/g)].map((m) => m[1]);
if (!setEq(chipKeys, ref.headerChips.map((c) => c.key))) note('card-reference.headerChips', 'differs from HEADER_CHIP_DEFS');
const themeKeys = [...read('src/themes.ts').matchAll(/^\s{2}(\w+):\s*\{$/gm)].map((m) => m[1]);
const refThemes = (ref.themes ?? []).map((t) => t.key ?? t.name ?? t);
if (refThemes.length && missing(themeKeys, refThemes).length) {
  note('card-reference.themes', `missing ${missing(themeKeys, refThemes).join(', ')}`);
}

// ── sensor chips: editor groups vs reference vs the designers ──
const sgBlock = read('src/editor.ts').match(/const SENSOR_GROUPS[^=]*=\s*\[([\s\S]*?)\n\];/);
const codeChips = sgBlock ? [...sgBlock[1].matchAll(/\{ key: '(\w+)'/g)].map((m) => m[1]) : [];
const refChips = Object.values(ref.sensorGroups ?? {}).flat().map((i) => i.key ?? i);
if (codeChips.length && refChips.length && missing(codeChips, refChips).length) {
  note('card-reference.sensorGroups', `missing ${missing(codeChips, refChips).join(', ')}`);
}
for (const f of ['docs/tools/config-builder.html', 'docs/tools/style-presets.html', 'docs/tools/profile-tiles.html']) {
  const html = read(f);
  const absent = codeChips.filter((c) => !html.includes(`'${c}'`));
  if (absent.length) note(f, `sensor chips not offered: ${absent.join(', ')}`);
}

// ── factory defaults ──
const fd = helpers.match(/FACTORY_DEFAULTS[^{]*\{([\s\S]*?)\n\}\);/);
if (fd && ref.firstRun) {
  for (const [, k, v] of fd[1].matchAll(/^\s*(\w+):\s*'?([\w.-]+)'?,/gm)) {
    const row = ref.firstRun.find((r) => (r.source ?? '').includes(k) || (r.setting ?? '').toLowerCase().includes(k.replace(/_/g, ' ')));
    if (!row) note('card-reference.firstRun', `no row for FACTORY_DEFAULTS.${k} (= ${v})`);
  }
}

// `[^{]*` because the interface extends LovelaceCardConfig. Without it this
// matched nothing, and every check depending on it skipped in silence.
const cfg = types.match(/interface HADeviceDashboardConfig[^{]*\{([\s\S]*?)\n\}/);
const cfgKeys = cfg ? [...new Set([...cfg[1].matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]))] : [];

// ── the runtime key list vs the interface ──
// CONFIG_KEYS drives the editor's "the card does not read this" warning, so a
// key missing from it would be reported to the user as unknown.
const keyList = helpers.match(/CONFIG_KEYS[^=]*=\s*\[([\s\S]*?)\];/);
if (keyList && cfgKeys.length) {
  const listed = [...keyList[1].matchAll(/'(\w+)'/g)].map((m) => m[1]);
  const gone = missing(cfgKeys, listed);
  const extra = missing(listed, cfgKeys);
  if (gone.length) note('helpers.CONFIG_KEYS', `missing ${gone.join(', ')} — the editor would call them unknown`);
  if (extra.length) note('helpers.CONFIG_KEYS', `lists keys the interface no longer has: ${extra.join(', ')}`);
}

// ── config keys the README never mentions ──
const readme = read('README.md');
if (cfg) {
  const keys = cfgKeys;
  const undocumented = keys.filter((k) => !readme.includes(k) && !['type'].includes(k));
  if (undocumented.length) note('README.md', `config keys never mentioned: ${undocumented.join(', ')}`);
}

// ── the generated guide must match its source ──
const help = read('src/help.ts');
const guide = read('docs/GUIDE.md');
for (const [, title] of help.matchAll(/title: '([^']+)'/g)) {
  const plain = title.replace(/\\'/g, "'");
  if (!guide.includes(plain)) note('docs/GUIDE.md', `stale — missing topic "${plain}" (run npm run docs:guide)`);
}

// ── BUILD_TAG present in the shipped bundle ──
const tag = read('src/index.ts').match(/BUILD_TAG = '([^']+)'/)?.[1];
if (tag && !read('dist/ha-device-dashboard.js').includes(tag)) {
  note('dist', `bundle does not contain BUILD_TAG "${tag}" — dist is stale, run npm run build`);
}

// ── the version is stated in four places and drifted in one ──
// package.json, the newest CHANGELOG heading, the git tag and OVERVIEW.md all
// name the release. OVERVIEW.md sat at 1.0.0 through three of them, because
// nothing compared them. The tag is not checked here — it is cut after this
// runs — but the two files that ship in the repo are.
const pkgVersion = JSON.parse(read('package.json')).version;
const newestChangelog = read('CHANGELOG.md').match(/^## v?(\d+\.\d+\.\d+)/m)?.[1];
if (newestChangelog && newestChangelog !== pkgVersion) {
  note('CHANGELOG.md', `newest heading is ${newestChangelog}, package.json is ${pkgVersion}`);
}
const overviewVersion = read('OVERVIEW.md').match(/version \*\*(\d+\.\d+\.\d+)\*\*/)?.[1];
if (overviewVersion && overviewVersion !== pkgVersion) {
  note('OVERVIEW.md', `states version ${overviewVersion}, package.json is ${pkgVersion}`);
}

if (problems.length) {
  console.log(`${problems.length} doc mismatch(es):\n`);
  for (const p of problems) console.log('  • ' + p);
  process.exitCode = 1;
} else {
  console.log('docs match src');
}
