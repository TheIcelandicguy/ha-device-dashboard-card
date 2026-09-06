/**
 * Localization for everything a dashboard *viewer* sees.
 *
 * Scope is deliberate: the card's runtime surface — tiles, chips, the header,
 * the detail sheet, Needs attention — is translated; the GUI editor is not. The
 * family reading the dashboard did not choose English, while the person
 * configuring the card did, and 600 editor strings (most of them explanatory
 * paragraphs) would be a manual to maintain in every locale rather than a set
 * of labels. If that changes, nothing here needs to: the editor's keys go in
 * the same catalogues under an `editor.` prefix.
 *
 * `translate()` is the pure core — language in, string out — so the tests can
 * gate catalogue parity without a `hass`. `t()` is the ambient wrapper the
 * render path actually calls, because threading a language through every tile
 * render function and every shared fragment would be noise at 130 call sites
 * for a value that is genuinely ambient. The card sets it from `hass` on each
 * update; see `setLanguage`.
 */

import { EN } from './translations/en';
import { IS } from './translations/is';

/** One locale's strings, keyed the same in every language. */
export type Translations = Record<string, string>;

/**
 * Every shipped locale, by its language code.
 *
 * Adding one: copy `src/translations/en.ts`, translate the values (never the
 * keys), and register it here. `npm run test:card` fails if a catalogue is
 * missing a key English has, or carries one English does not — so a locale
 * cannot silently rot as strings are added. See CONTRIBUTING.md.
 */
export const LOCALES: Record<string, Translations> = {
  en: EN,
  is: IS,
};

export const FALLBACK_LANGUAGE = 'en';

/**
 * The best locale we have for what Home Assistant reports.
 *
 * HA gives things like `en`, `en-GB`, `pt-BR`, `is`. An exact match wins, then
 * the base language — someone on `de-CH` should get German if we ever ship it,
 * not English — and English is the floor.
 */
export function resolveLanguage(lang: string | null | undefined): string {
  if (!lang) return FALLBACK_LANGUAGE;
  const want = lang.toLowerCase();
  if (LOCALES[want]) return want;
  const base = want.split('-')[0];
  if (LOCALES[base]) return base;
  return FALLBACK_LANGUAGE;
}

/**
 * Look up a key, pure.
 *
 * A missing key falls back to English rather than rendering blank or shouting
 * the key at the user: a half-translated locale should read as a mix of two
 * languages, which is mildly untidy, not as a broken card. An unknown key
 * anywhere returns the key itself, which is the loudest thing that is still
 * safe to put on screen.
 *
 * `{name}` placeholders are substituted from `vars`. A placeholder with no
 * matching var is left as written, so a translator who typos one sees it on
 * screen instead of losing the sentence.
 */
export function translate(
  lang: string | null | undefined,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const code = resolveLanguage(lang);
  const raw = LOCALES[code]?.[key] ?? LOCALES[FALLBACK_LANGUAGE][key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (whole, name) =>
    (name in vars ? String(vars[name]) : whole));
}

/** Every key English defines — the contract a locale is checked against. */
export function knownKeys(): string[] {
  return Object.keys(LOCALES[FALLBACK_LANGUAGE]);
}

// ── the ambient language ────────────────────────────────────────────
// Set once per hass update by the card, read by t() everywhere else. It is
// module state, which the rest of this codebase avoids on purpose — but a
// viewer's language is a property of the page, not of any one tile, and the
// alternative is a parameter on every render function and every shared
// fragment in src/tiles/. translate() stays pure for the tests.

let currentLanguage = FALLBACK_LANGUAGE;

/** Point `t()` at a language. Takes whatever `hass.language` holds. */
export function setLanguage(lang: string | null | undefined): void {
  currentLanguage = resolveLanguage(lang);
}

/** The language `t()` is currently answering in — already resolved. */
export function getLanguage(): string {
  return currentLanguage;
}

/** Translate in the ambient language. The render path's entry point. */
export function t(key: string, vars?: Record<string, string | number>): string {
  return translate(currentLanguage, key, vars);
}

/**
 * Translate, or fall back to a value the caller already has.
 *
 * For labels that come from a data table rather than a template — device
 * profiles, graph device_classes. Those tables are open-ended: Home Assistant
 * can report a device_class the card has no key for, and the table's own
 * English label is a better answer than the raw key would be. `t()` returning
 * the key on a miss is what makes this detectable.
 */
export function tOr(key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}
