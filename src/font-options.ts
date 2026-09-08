/**
 * The font catalogue — one list, both consumers.
 *
 * This used to exist twice: `FONT_OPTIONS` in `editor.ts` (the picker) and a
 * separate `CDN_FONT_FAMILIES` array in `ha-device-dashboard.ts` (the card's
 * `<link>` to Google Fonts), each naming the same thirteen CDN families in a
 * different shape. The card carried a comment reading "Keep in sync with
 * FONT_OPTIONS.cdn in editor.ts", and CONTRIBUTING listed keeping them in step
 * as a rule to remember — which is the tell. A rule a human has to remember is
 * a bug with a delay on it: add a font to the picker, forget the other list,
 * and the option renders in the editor while the font never loads.
 *
 * `CDN_FONT_FAMILIES` is now derived rather than declared, so the two cannot
 * disagree. `npm run check:docs` fails if a second declaration reappears.
 *
 * Not merged into `fonts.ts`: that file is generated (base64 WOFF2 payloads)
 * and says so at the top, so hand-written content there would be lost the next
 * time someone regenerates it.
 */

export interface FontOption {
  label: string;
  /** The CSS `font-family` value. `undefined` means "inherit the theme". */
  value: string | undefined;
  group: string;
  /** Google Fonts family name for the CDN `<link>`, e.g. `Alfa+Slab+One`.
   *  Present only on the Display group — System fonts need no download and
   *  Bundled ones are embedded in `fonts.ts`. */
  cdn?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { label: 'Default',              value: undefined,                              group: 'System' },
  { label: 'Inter',                value: 'Inter, sans-serif',                    group: 'System' },
  { label: 'Roboto',               value: 'Roboto, sans-serif',                   group: 'System' },
  { label: 'Mono',                 value: "'IBM Plex Mono', monospace",           group: 'System' },
  { label: 'System UI',            value: 'system-ui, sans-serif',                group: 'System' },
  // ── Bundled (offline) ───────────────────────────────────────
  { label: 'Abril Fatface',        value: "'Abril Fatface', cursive",             group: 'Bundled' },
  { label: 'Bangers',              value: "'Bangers', cursive",                   group: 'Bundled' },
  { label: 'Graduate',             value: "'Graduate', cursive",                  group: 'Bundled' },
  { label: 'Limelight',            value: "'Limelight', cursive",                 group: 'Bundled' },
  { label: 'Lobster',              value: "'Lobster', cursive",                   group: 'Bundled' },
  { label: 'Pacifico',             value: "'Pacifico', cursive",                  group: 'Bundled' },
  { label: 'Righteous',            value: "'Righteous', cursive",                 group: 'Bundled' },
  { label: 'Special Elite',        value: "'Special Elite', cursive",             group: 'Bundled' },
  // ── Display fonts (Google Fonts CDN) ────────────────────────
  { label: 'Alfa Slab One',        value: "'Alfa Slab One', cursive",             group: 'Display', cdn: 'Alfa+Slab+One' },
  { label: 'Bebas Neue',           value: "'Bebas Neue', sans-serif",             group: 'Display', cdn: 'Bebas+Neue' },
  { label: 'Black Ops One',        value: "'Black Ops One', cursive",             group: 'Display', cdn: 'Black+Ops+One' },
  { label: 'Bungee',               value: "'Bungee', cursive",                    group: 'Display', cdn: 'Bungee' },
  { label: 'Bungee Shade',         value: "'Bungee Shade', cursive",              group: 'Display', cdn: 'Bungee+Shade' },
  { label: 'Cinzel',               value: "'Cinzel', serif",                      group: 'Display', cdn: 'Cinzel' },
  { label: 'Dancing Script',       value: "'Dancing Script', cursive",            group: 'Display', cdn: 'Dancing+Script' },
  { label: 'Fredericka the Great', value: "'Fredericka the Great', cursive",      group: 'Display', cdn: 'Fredericka+the+Great' },
  { label: 'Great Vibes',          value: "'Great Vibes', cursive",               group: 'Display', cdn: 'Great+Vibes' },
  { label: 'Monoton',              value: "'Monoton', cursive",                   group: 'Display', cdn: 'Monoton' },
  { label: 'Permanent Marker',     value: "'Permanent Marker', cursive",          group: 'Display', cdn: 'Permanent+Marker' },
  { label: 'Shrikhand',            value: "'Shrikhand', cursive",                 group: 'Display', cdn: 'Shrikhand' },
  { label: 'Ultra',                value: "'Ultra', serif",                       group: 'Display', cdn: 'Ultra' },
];

/** Every CDN family the card must load, derived from the catalogue above. */
export const CDN_FONT_FAMILIES: string[] =
  FONT_OPTIONS.map(f => f.cdn).filter((c): c is string => !!c);

/** The Google Fonts stylesheet URL for every CDN family, or '' if there are none. */
export function cdnFontHref(): string {
  if (!CDN_FONT_FAMILIES.length) return '';
  return `https://fonts.googleapis.com/css2?${CDN_FONT_FAMILIES.map(f => `family=${f}`).join('&')}&display=swap`;
}

/** True when a resolved `font-family` string uses one of the CDN families. */
export function usesCdnFont(fontFamily: string): boolean {
  return CDN_FONT_FAMILIES.some(f => fontFamily.includes(f.replace(/\+/g, ' ')));
}
