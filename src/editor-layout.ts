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
    { id: 'discovery',     label: 'Discovery' },
    // Not styling — it decides which entities COUNT as a light, which is about
    // what a device is, not how it looks. It sat in the Header tab only because
    // that tab existed; it belongs with discovery.
    { id: 'lights',        label: 'What counts as a light' },
    { id: 'extra-cards',   label: 'Extra cards' },
  ] },
  { id: 'views', label: 'Views', icon: '☰', sections: [
    { id: 'views-toolbar', label: 'Views toolbar' },
    { id: 'view-card',     label: 'Per-view card + filters' },
  ] },
  // ── Redesign Phase 3 — Design replaces Card & Theme, Device styling and
  //    Header. Those three tabs answered the same question ("how does this
  //    look?") at different scopes, which is why styling felt scattered: the
  //    editor grouped global settings by THING and everything below by SCOPE.
  //    Design is scope-first — pick the layer, one control list redraws.
  //
  //    Their section BODIES are not gone; the registry still owns them and the
  //    Design tab renders them at Global scope, where they belong. Only the tabs
  //    were removed.
  { id: 'design', label: 'Design', icon: '◈', sections: [
    { id: 'design-scope',  label: 'Scope' },
    { id: 'design-panel',  label: 'Controls for the selected scope' },
    // Rendered by the bespoke body at GLOBAL scope only: the settings that have
    // no ladder under them, plus the card chrome the retired tabs owned.
    { id: 'theme',         label: 'Colour theme' },
    { id: 'content',       label: 'Chips & metrics' },
    { id: 'tiles',         label: 'Tiles' },
    { id: 'electrical',    label: 'Sensor chips — Electrical' },
    { id: 'environmental', label: 'Sensor chips — Environmental' },
    { id: 'deviceinfo',    label: 'Sensor chips — Device info', advanced: true },
    { id: 'alerts',        label: 'Sensor chips — Alerts',      advanced: true },
    { id: 'header',        label: 'Header' },
    { id: 'card',          label: 'Card',       advanced: true },
    { id: 'colors',        label: 'Colours' },
    { id: 'typography',    label: 'Typography', advanced: true },
  ] },

  // ── Graphs & Sensors — WIRED to this spec (phase 2 pilot). ──
  //    Labels here must match what the editor previously hardcoded so the live
  //    tab is byte-identical until the layout is actually changed.
  { id: 'graphs', label: 'Graphs & Sensors', icon: '∿', sections: [
    { id: 'graphtype',     label: 'Graph Type' },
    { id: 'graphcolors',   label: 'Per-sensor Colors', advanced: true },
    { id: 'graphranges',   label: 'Sensor Min / Max',  advanced: true },
    // The four sensor-chip groups moved to Design: which chips a tile shows is a
    // design decision with a full ladder under it, while graph type, colours and
    // ranges are about how the data is drawn and stay here.
  ] },

  { id: 'yaml', label: 'YAML', icon: '</>', sections: [
    { id: 'yaml-pane', label: 'YAML output' },
  ] },
];
