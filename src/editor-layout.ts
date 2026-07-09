// ─────────────────────────────────────────────────────────────────────────────
//  EDITOR LAYOUT — data-driven structure of the card editor.
//
//  Authored by the offline Editor Layout Designer (docs/tools/editor-layout.html)
//  and pasted here. The editor renders its tabs/sections from this spec via a
//  per-section registry, so reorganizing the editor is a data change, not a code
//  edit.
//
//  Rollout (see docs plan): the **graphs** tab is wired to this in phase 2; the
//  remaining tabs still render from their bespoke methods and are listed here for
//  completeness / future phases. `advanced` replaces the old hardcoded
//  ADV_SECTIONS gating for wired tabs.
// ─────────────────────────────────────────────────────────────────────────────

export interface EditorSection {
  /** Stable id — the key into the editor's per-section render registry. */
  id: string;
  /** Section header label. */
  label: string;
  /** Gated behind the editor's Advanced toggle. */
  advanced?: boolean;
  /** Start collapsed the first time the section is shown. */
  collapsedByDefault?: boolean;
}

export interface EditorTab {
  id: string;
  label: string;
  icon: string;
  sections: EditorSection[];
}

export const EDITOR_LAYOUT: EditorTab[] = [
  // ── Contextual tabs (not yet layout-driven; listed for completeness) ──
  { id: 'devices', label: 'Rooms & devices', icon: '⌂', sections: [
    { id: 'rooms-toolbar', label: 'Rooms toolbar' },
    { id: 'device-panel',  label: 'Per-device style panel' },
    { id: 'room-panel',    label: 'Per-room style panel' },
  ] },
  { id: 'views', label: 'Views', icon: '☰', sections: [
    { id: 'views-toolbar', label: 'Views toolbar' },
    { id: 'view-card',     label: 'Per-view card + filters' },
  ] },
  { id: 'layout', label: 'Layout & Style', icon: '⊡', sections: [
    { id: 'header',     label: 'Header' },
    { id: 'tiles',      label: 'Tiles' },
    { id: 'card',       label: 'Card',       advanced: true },
    { id: 'colors',     label: 'Colours',    advanced: true },
    { id: 'typography', label: 'Typography', advanced: true },
  ] },

  // ── Graphs & Sensors — WIRED to this spec (phase 2 pilot). ──
  //    Labels here must match what the editor previously hardcoded so the live
  //    tab is byte-identical until the layout is actually changed.
  { id: 'graphs', label: 'Graphs & Sensors', icon: '∿', sections: [
    { id: 'graphtype',     label: 'Graph Type' },
    { id: 'graphcolors',   label: 'Per-sensor Colors', advanced: true },
    { id: 'graphranges',   label: 'Sensor Min / Max',  advanced: true },
    { id: 'electrical',    label: 'Electrical' },
    { id: 'environmental', label: 'Environmental' },
    { id: 'deviceinfo',    label: 'Device Info', advanced: true },
    { id: 'alerts',        label: 'Alerts',      advanced: true },
  ] },

  { id: 'yaml', label: 'YAML', icon: '</>', sections: [
    { id: 'yaml-pane', label: 'YAML output' },
  ] },
];
