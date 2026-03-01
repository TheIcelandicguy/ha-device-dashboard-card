// ─── Shelly Dashboard Card — Entry Point ───────────────────────────────────────
// Registers the fleet dashboard card and exposes it to the HA card picker.

import './shelly-dashboard-card';
import './editor';

// Register card with the HA Lovelace card picker
window.customCards = window.customCards || [];

window.customCards.push({
  type: 'shelly-dashboard-card',
  name: 'Shelly Dashboard',
  description: 'Fleet overview of all Shelly devices — auto-discovered from Home Assistant.',
  preview: true,
  documentationURL: 'https://github.com/TheIcelandicguy/shelly-dashboard-card',
});

console.info(
  '%c SHELLY-DASHBOARD-CARD %c v1.0.0 ',
  'color: white; background: #1565c0; padding: 2px 6px; border-radius: 3px 0 0 3px; font-weight: bold;',
  'color: #1565c0; background: #e3f2fd; padding: 2px 6px; border-radius: 0 3px 3px 0;'
);
