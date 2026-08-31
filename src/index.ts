import './ha-device-dashboard';
import './editor';
import './tiles/delegated-control';

// Build marker — lets you confirm in the browser console which bundle HA loaded.
// Bump the tag on each deploy so a stale cache is obvious at a glance.
const BUILD_TAG = 'theme-cascade-2026-08-31b';
// eslint-disable-next-line no-console
console.info(
  `%c ha-device-dashboard %c ${BUILD_TAG} `,
  'background:#c98a63;color:#1e1a17;font-weight:700;border-radius:3px 0 0 3px',
  'background:#241f1b;color:#f3ece3;border-radius:0 3px 3px 0',
);

window.customCards = window.customCards || [];
window.customCards.push({
  type:             'ha-device-dashboard',
  name:             'HA Device Dashboard',
  description:      'Universal device fleet overview — Shelly, ZHA, Hue, ESPHome, Matter and more.',
  preview:          true,
  documentationURL: 'https://github.com/TheIcelandicguy/ha-device-dashboard-card',
});
