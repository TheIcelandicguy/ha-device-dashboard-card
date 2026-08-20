import { css } from 'lit';

export const tilesCss = css`
/* ══════════════════════════════════════════════════════
       ALTERNATIVE TILE STYLES  (.ts-*)
       All use var(--ts-accent) injected inline per-tile.
       Colors fall back to --sc-* variables so themes apply.
    ══════════════════════════════════════════════════════ */

    /* ── Shared inner layout reset ── */
    .ts-hero,.ts-ring,.ts-hbar,.ts-spark,.ts-list {
      display:flex; flex-direction:column; gap:0; width:100%; height:100%;
    }


    /* ── STYLE: HERO NUMBER ─────────────────────────────── */
    .ts-hero-bar { height:2px; margin:-11px -13px 10px; background:var(--sc-tile-border); border-radius:var(--tile-radius) var(--tile-radius) 0 0; }

    .ts-hero-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px; }

    .ts-hero-name { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); line-height:1.3; flex:1; min-width:0; }

    .ts-hero-num  { font-size:2em; font-weight:800; line-height:1; letter-spacing:-0.02em; }

    .ts-hero-unit { font-size:.7em; color:var(--sc-text-muted); margin-top:2px; letter-spacing:.04em; }

    .ts-hero-spark { height:32px; margin:8px 0; }

    .ts-hero-foot { display:flex; align-items:center; justify-content:space-between; padding-top:6px; border-top:1px solid var(--sc-tile-border); margin-top:auto; }

    .ts-chips { display:flex; flex-wrap:wrap; gap:3px; }

    .ts-chip { font-size:var(--fs-sm); padding:2px 6px; border-radius:4px; background:var(--sc-sensor-bg); border:1px solid var(--sc-tile-border); color:var(--sc-text-muted); }

    .ts-uptime { font-size:var(--fs-sm); color:var(--sc-text-muted); white-space:nowrap; }


    /* ── STYLE: DONUT RING ──────────────────────────────── */
    .ts-ring-top  { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; width:100%; }

    .ts-ring-name { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); flex:1; min-width:0; }

    .ts-ring-body { display:flex; align-items:center; gap:12px; flex:1; }

    .ts-ring-stats { display:flex; flex-direction:column; gap:6px; flex:1; }

    .ts-ring-stat  { display:flex; flex-direction:column; gap:1px; }

    .ts-ring-stat-k { font-size:var(--fs-xs); font-weight:600; letter-spacing:.03em; color:var(--sc-text-muted); }

    .ts-ring-stat-v { font-size:.82em; color:var(--sc-text-secondary); }

    .ts-ring-legend { display:flex; flex-wrap:wrap; gap:8px 16px; justify-content:center; margin-top:4px; }

    .ts-ring-chip { display:flex; align-items:baseline; gap:4px; }

    .ts-ring-chip-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; display:inline-block; margin-bottom:1px; }

    .ts-ring-chip-val { font-size:15px; font-weight:800; line-height:1; }

    .ts-ring-chip-unit { font-size:10px; color:var(--sc-text-muted); }


    /* ── STYLE: HORIZONTAL SPLIT ────────────────────────── */
    .ts-hbar { padding:0; gap:0; }

    .ts-hbar-top  { display:flex; align-items:stretch; flex:1; }

    .ts-hbar-left-bar { width:3px; flex-shrink:0; border-radius:var(--tile-radius) 0 0 0; }

    .ts-hbar-main { flex:1; padding:11px 10px 8px 10px; min-width:0; }

    .ts-hbar-name { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); margin-bottom:4px; }

    .ts-hbar-num  { font-size:1.8em; font-weight:800; line-height:1; letter-spacing:-0.02em; }

    .ts-hbar-unit { font-size:.7em; color:var(--sc-text-muted); margin-top:2px; }

    .ts-hbar-side { width:62px; flex-shrink:0; border-left:1px solid var(--sc-tile-border); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:8px 4px; }

    .ts-hbar-sstat { text-align:center; }

    .ts-hbar-sk { font-size:var(--fs-xs); font-weight:600; letter-spacing:.03em; color:var(--sc-text-muted); }

    .ts-hbar-sv { font-size:.78em; color:var(--sc-text-secondary); margin-top:1px; }

    .ts-hbar-footer { display:flex; align-items:center; justify-content:space-between; padding:7px 10px; border-top:1px solid var(--sc-tile-border); }

    .ts-hbar-badge { font-size:var(--fs-sm); padding:2px 7px; border-radius:4px; background:color-mix(in srgb,var(--ts-accent,var(--sc-accent)) 12%,transparent); color:var(--ts-accent,var(--sc-accent)); border:1px solid color-mix(in srgb,var(--ts-accent,var(--sc-accent)) 22%,transparent); }


    /* ── STYLE: SPARKLINE FOCUS ─────────────────────────── */
    .ts-spark-top    { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }

    .ts-spark-name   { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .ts-spark-graph  { margin:4px 0; }

    .ts-spark-bottom { display:flex; align-items:flex-end; justify-content:space-between; margin-top:auto; padding-top:4px; }

    .ts-spark-big    { font-size:1.6em; font-weight:800; line-height:1; letter-spacing:-0.02em; }

    .ts-spark-sub    { font-size:var(--fs-sm); color:var(--sc-text-muted); margin-top:2px; }

    .ts-spark-meta   { text-align:right; }

    .ts-spark-mrow   { font-size:.72em; color:var(--sc-text-muted); margin-bottom:2px; }

    .ts-spark-mrow b { color:var(--sc-text-secondary); font-weight:500; }


    /* ── STYLE: LIST DENSE ──────────────────────────────── */
    .ts-list-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding-bottom:7px; border-bottom:1px solid var(--sc-tile-border); }

    .ts-list-name   { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); flex:1; min-width:0; }

    .ts-list-row    { display:flex; align-items:center; justify-content:space-between; padding:3px 0; border-bottom:1px solid rgba(255,255,255,.035); }

    .ts-list-row:last-of-type { border-bottom:none; }

    .ts-list-label  { font-size:.72em; color:var(--sc-text-muted); }

    .ts-list-val    { font-size:.72em; color:var(--sc-text-secondary); font-family:monospace; }

    .ts-list-spark  { margin-top:6px; padding-top:6px; border-top:1px solid var(--sc-tile-border); }


    /* ── Lower body shared by all alt tile styles ── */
    .ts-lower-body { display:flex; flex-direction:column; gap:0; margin-top:8px; padding-top:8px; border-top:1px solid var(--sc-tile-border); }

    .ts-lower-section { padding:6px 0 2px; }

    .ts-lower-section + .ts-lower-section { border-top:1px solid rgba(255,255,255,0.04); margin-top:4px; padding-top:6px; }

    /* Graphs inside lower body: use the existing sparklines-block styles */
    .ts-lower-graphs .sparklines-block { padding:0; }

    /* Dimmer inside lower body: reuse existing dim-row styles, no extra padding needed */
    .ts-lower-dimmer .tile-dim-row { margin-bottom:4px; }

    /* TRV, valve, cover: these have their own internal padding already */
    .ts-lower-trv .tile-trv-dial,
    .ts-lower-valve .tile-trv-dial { padding:0; }

    /* Relay channels */
    .ts-lower-relay .relay-channels { padding:0; }


    /* ── LIGHT CONTROL ── */
    .ts-light { display:flex;flex-direction:column;gap:6px;width:100% }

    .ts-light-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px }

    .ts-light-name { display:flex;align-items:center;gap:5px;font-size:.82em;font-weight:700;color:var(--sc-text-primary);flex:1;min-width:0 }

    .ts-light-wheel-wrap { display:flex;justify-content:center;margin:4px 0; border-radius:50%; }

    .ts-light-wheel-wrap.ts-wheel-pulse { animation: ts-wheel-pulse 360ms ease-out; }

    .ts-light-wheel { border-radius:50%;display:block }

    .ts-light-row { display:flex;align-items:center;gap:8px }

    .ts-light-lbl { font-size:var(--fs-xs);color:var(--sc-text-muted);width:52px;flex-shrink:0;letter-spacing:.02em }

    .ts-light-pct { font-size:.72em;color:var(--sc-text-secondary);width:36px;text-align:right;flex-shrink:0 }

    .ts-light-slider { accent-color:var(--ts-accent,var(--sc-accent));flex:1 }

    .ts-light-ct { background:linear-gradient(to right,#ff9a3c,white,#c9e8ff) }


    /* ── CLIMATE CONTROL ── */
    .ts-climate { display:flex;flex-direction:column;align-items:center;gap:4px;width:100% }

    .ts-climate-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;width:100% }


    /* ── COVER CONTROL ── */
    .ts-cover { display:flex;flex-direction:column;gap:8px;width:100% }

    .ts-cover-top { display:flex;align-items:center;justify-content:space-between }

    .ts-cover-pct { font-size:1.2em;font-weight:800;line-height:1 }

    .ts-cover-graphic { position:relative;color:var(--sc-text-primary) }

    .ts-cover-state { position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:var(--fs-xs);color:var(--sc-text-muted);white-space:nowrap }

    .ts-cover-btns { display:flex;gap:6px }

    .ts-cover-btn { flex:1;padding:8px 0;border-radius:8px;border:1px solid var(--sc-tile-border);background:rgba(255,255,255,.05);color:var(--sc-text-primary);font-size:14px;cursor:pointer;transition:all .15s;text-align:center }

    .ts-cover-btn:hover { background:rgba(255,255,255,.12);border-color:var(--sc-accent) }

    .ts-cover-stop { color:var(--sc-text-muted);font-size:11px }


    /* ── SENSOR CARD ── */
    .ts-sensor { display:flex;flex-direction:column;gap:4px;width:100% }

    .ts-sensor-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:2px }

    .ts-sensor-dc { font-size:var(--fs-xs);font-weight:600;letter-spacing:.03em;color:var(--sc-text-muted) }

    .ts-sensor-main { display:flex;align-items:baseline;gap:4px }

    .ts-sensor-val { font-size:2.4em;font-weight:800;line-height:1;letter-spacing:-.02em }

    .ts-sensor-unit { font-size:.9em;color:var(--sc-text-muted) }

    .ts-sensor-trend { font-size:.72em;font-weight:600;padding:2px 8px;border-radius:10px;display:inline-block;margin-top:2px }

    .ts-sensor-trend.up { background:rgba(56,217,192,.15);color:#38d9c0;border:1px solid rgba(56,217,192,.25) }

    .ts-sensor-trend.down { background:rgba(248,113,113,.12);color:#f87171;border:1px solid rgba(248,113,113,.2) }

    .ts-sensor-spark { margin:4px 0 }

    .ts-sensor-binary-state { display:flex;align-items:center;gap:8px;font-size:1.1em;font-weight:700;margin:8px 0 }

    .ts-sensor-binary-dot { width:10px;height:10px;border-radius:50%;flex-shrink:0 }


    /* ── SCENE BUTTON ── */
    /* ── input-control: the i3/i4 keypad ── */
    .ts-inputs { display:flex;flex-direction:column;gap:8px;width:100% }
    .ts-inputs-top { display:flex;align-items:center;justify-content:space-between }
    .ts-inputs-empty { font-size:var(--fs-sm);color:var(--sc-text-muted) }
    /* Rows for unassigned channels sit under the keys, visually demoted. */
    .ts-inputs-rest { padding-top:6px;border-top:1px solid rgba(255,255,255,.07);opacity:.85 }
    .ts-keys { display:grid;grid-template-columns:repeat(var(--keys,2),1fr);gap:6px }
    /* Chips sit under the keypad so a key's grid cell never grows taller than
       its neighbour's and drags the following row out of alignment. */
    .ts-key-chips { display:flex;flex-wrap:wrap;align-items:center;gap:6px }
    .ts-key-chip-lbl { font-size:11px;font-weight:600;color:var(--sc-text-secondary) }
    .ts-key-chips .input-sel { flex:1;min-width:0;max-width:none }
    .ts-key { position:relative;min-width:0;display:flex;flex-direction:column;align-items:flex-start;
      gap:2px;width:100%;min-height:54px;padding:8px 10px;border-radius:12px;cursor:pointer;
      font:inherit;text-align:left;overflow:hidden;
      background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);
      color:var(--sc-text-primary);transition:background .15s,border-color .15s,transform .08s }
    .ts-key:hover { background:rgba(255,255,255,.10) }
    .ts-key:active { transform:scale(.97) }
    /* Holding must not scroll the dashboard or select the label. */
    .ts-key.holdable { touch-action:none;user-select:none;-webkit-user-select:none }
    .ts-key-label { font-size:13px;font-weight:700;line-height:1.15;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100% }
    .ts-key-sub { font-size:11px;color:var(--sc-text-secondary);
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100% }
    .ts-key-age { font-size:10px;color:var(--sc-text-muted) }
    .ts-key-pip { position:absolute;top:8px;right:8px;width:7px;height:7px;border-radius:50%;
      background:var(--sc-text-muted);opacity:.5;transition:background .15s,opacity .15s }
    /* Lit: the key's toggle target is on. */
    .ts-key.is-on { background:color-mix(in srgb,var(--ts-accent) 20%,transparent);
      border-color:color-mix(in srgb,var(--ts-accent) 45%,transparent) }
    .ts-key.is-on .ts-key-pip { background:var(--ts-accent);opacity:1;
      box-shadow:0 0 6px var(--ts-accent) }
    .ts-key.is-on:hover { background:color-mix(in srgb,var(--ts-accent) 30%,transparent) }
    /* Target offline — say so rather than showing a confident "off". */
    .ts-key.is-unavailable { opacity:.55;border-style:dashed }
    .ts-key.is-unavailable .ts-key-pip { background:var(--sc-offline-color,#f87171);opacity:.8 }
    /* Neutral: the action isn't a toggle, so there is no state to claim. */
    .ts-key.is-neutral .ts-key-pip { display:none }

    .ts-scene { display:flex;flex-direction:column;gap:6px;width:100% }

    .ts-scene-top { display:flex;align-items:center;justify-content:space-between }

    .ts-scene-centered { align-items:center;justify-content:center;min-height:120px;position:relative;cursor:pointer;user-select:none }

    .ts-scene-icon-wrap { width:48px;height:48px;display:flex;align-items:center;justify-content:center;margin-bottom:6px }

    .ts-scene-icon-wrap .ts-scene-icon { width:48px;height:48px }

    .ts-scene-name { font-size:.9em;font-weight:700;color:var(--sc-text-primary);text-align:center }

    .ts-scene-time { font-size:var(--fs-sm);color:var(--sc-text-muted) }

    .ts-scene-ripple { position:absolute;inset:0;border-radius:inherit;pointer-events:none }

    .ts-scene-ripple.active { animation:scene-ripple .5s ease-out forwards }

    @keyframes ts-wheel-pulse { 0% { box-shadow:0 0 0 0 var(--sc-accent); } 100% { box-shadow:0 0 0 10px transparent; } }

    @keyframes scene-ripple { 0%{box-shadow:inset 0 0 0 0 rgba(255,255,255,.2)} 100%{box-shadow:inset 0 0 0 60px rgba(255,255,255,0)} }
`;
