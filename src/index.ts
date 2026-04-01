import './ha-device-dashboard';
import './editor';

window.customCards = window.customCards || [];
window.customCards.push({
  type:             'ha-device-dashboard',
  name:             'HA Device Dashboard',
  description:      'Universal device fleet overview — Shelly, ZHA, Hue, ESPHome, Matter and more.',
  preview:          true,
  documentationURL: 'https://github.com/TheIcelandicguy/ha-device-dashboard',
});
