import { css } from 'lit';

export const detailCss = css`
    /* ══════════════════════════════════════════════════════
         DETAIL SHEET  (.ds-*)
         Modal that opens on short tap of tile icon/name area.
         Uses --ds-accent injected per-device.
      ══════════════════════════════════════════════════════ */

    .ds-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, .55);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      animation: ds-fade-in .15s ease-out;
    }
    @keyframes ds-fade-in { from { opacity: 0 } to { opacity: 1 } }

    .ds-sheet {
      width: min(640px, 92vw); max-height: 88vh; overflow-y: auto;
      background: var(--sc-card-bg, #1c1c1e);
      border: 1px solid var(--sc-tile-border);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, .5);
      display: flex; flex-direction: column;
      animation: ds-slide-up .2s ease-out;
    }
    @keyframes ds-slide-up {
      from { opacity: 0; transform: translateY(12px) }
      to   { opacity: 1; transform: translateY(0) }
    }

    .ds-header {
      position: relative;
      padding: 18px 18px 12px;
      border-bottom: 1px solid var(--sc-tile-border);
    }
    .ds-header-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .ds-header-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
    .ds-device-name {
      font-size: 1.15em; font-weight: 700; color: var(--sc-text-primary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .ds-close {
      background: rgba(255, 255, 255, .06); border: none; color: var(--sc-text-secondary);
      width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
      font-size: 14px; line-height: 1; transition: all .15s;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ds-close:hover { background: rgba(255, 255, 255, .14); color: var(--sc-text-primary); }

    .ds-header-meta { display: flex; flex-wrap: wrap; gap: 5px; }

    .ds-chip {
      font-size: .72em; font-weight: 600; letter-spacing: .03em;
      padding: 3px 9px; border-radius: 12px;
      background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .08);
      color: var(--sc-text-secondary);
    }
    .ds-chip--room { background: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 16%, transparent); color: var(--ds-accent, var(--sc-accent)); border-color: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 26%, transparent); }
    .ds-chip--type { background: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 10%, transparent); color: var(--sc-text-primary); }
    .ds-chip--on    { background: rgba(74, 222, 128, .16); color: var(--sc-online-color); border-color: rgba(74, 222, 128, .28); }
    .ds-chip--alert { background: rgba(239, 68, 68, .18);  color: #fca5a5; border-color: rgba(239, 68, 68, .28); animation: blink 1.4s step-end infinite; }

    .ds-fw-update {
      margin-top: 8px; font-size: .78em; color: var(--sc-update-color);
      padding: 4px 8px; background: rgba(245, 158, 11, .14); border-radius: 6px;
      display: inline-block;
    }
    .ds-signal { margin-top: 6px; font-size: .74em; color: var(--sc-text-muted); }
    .ds-accent-bar {
      position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
      opacity: .8;
    }

    .ds-body { padding: 14px 18px 20px; display: flex; flex-direction: column; gap: 14px; }

    /* Customise tile panel */
    .ds-customize { border: 1px solid var(--sc-tile-border, rgba(255,255,255,.08)); border-radius: 10px; background: var(--sc-tile-bg, rgba(255,255,255,.03)); overflow: hidden; }
    .ds-cz-summary { list-style: none; cursor: pointer; padding: 10px 14px; font-size: .82em; font-weight: 600; color: var(--sc-text-secondary, #9ca3af); display: flex; align-items: center; gap: 8px; user-select: none; }
    .ds-cz-summary::-webkit-details-marker { display: none; }
    .ds-cz-summary:hover { color: var(--sc-text-primary, #e5e7eb); }
    .ds-customize[open] .ds-cz-summary { border-bottom: 1px solid var(--sc-tile-border, rgba(255,255,255,.08)); }
    .ds-cz-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sc-accent, #f4601e); }
    .ds-cz-body { padding: 10px 14px 14px; display: flex; flex-direction: column; gap: 6px; }
    .ds-cz-hint { font-size: .7em; color: var(--sc-text-muted, #6b7280); margin-bottom: 2px; }
    .ds-cz-group-lbl { font-size: .68em; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--sc-text-muted, #6b7280); margin-top: 6px; }
    .ds-cz-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 2px 12px; }
    .ds-cz-row { display: flex; align-items: center; gap: 8px; font-size: .8em; color: var(--sc-text-primary, #e5e7eb); padding: 3px 0; cursor: pointer; }
    .ds-cz-row input { accent-color: var(--sc-accent, #f4601e); cursor: pointer; }
    .ds-cz-reset { align-self: flex-start; margin-top: 8px; font-size: .72em; padding: 5px 10px; border-radius: 6px; border: 1px solid var(--sc-tile-border, rgba(255,255,255,.1)); background: transparent; color: var(--sc-text-secondary, #9ca3af); cursor: pointer; }
    .ds-cz-reset:hover { color: var(--sc-text-primary, #e5e7eb); border-color: var(--sc-accent, #f4601e); }

    .ds-section {
      padding: 12px 14px;
      background: rgba(255, 255, 255, .03);
      border: 1px solid var(--sc-tile-border);
      border-radius: 10px;
    }
    .ds-section-title {
      font-size: .72em; font-weight: 700; letter-spacing: .08em;
      color: var(--sc-text-muted); text-transform: uppercase;
      margin-bottom: 10px;
    }
    /* Sub-heading for the config / diagnostic tiers within the All-Entities list */
    .ds-ent-subgroup {
      font-size: .64em; font-weight: 600; letter-spacing: .07em;
      color: var(--sc-text-muted); text-transform: uppercase; opacity: .75;
      margin: 12px 0 6px;
    }
    /* Config/diagnostic rows read as secondary to the primary controls above */
    .ds-entity-row.is-secondary { opacity: .7; }
    .ds-section .sparklines-block { padding: 0; margin: 0; }

    .ds-single-toggle { display: flex; justify-content: center; padding: 20px; }
    .ds-big-toggle { font-size: 1.1em; padding: 12px 32px; border-radius: 24px; }

    .ds-plug-hero {
      display: flex; align-items: center; justify-content: space-between; gap: 14px;
      padding: 18px;
    }
    .ds-big-power { font-size: 1.8em; font-weight: 800; color: var(--sc-power-color); font-variant-numeric: tabular-nums; }

    .ds-dimmer-control { display: flex; align-items: center; gap: 12px; }
    .ds-dimmer-pct { font-size: 1em; font-weight: 700; color: var(--sc-text-primary); width: 44px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
    .ds-slider { flex: 1; min-width: 0; accent-color: var(--ds-accent, var(--sc-accent)); }

    .ds-color-swatch {
      margin-top: 10px; width: 100%; height: 28px; border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, .1);
    }

    .ds-sensor-hero {
      display: flex; flex-direction: column; align-items: center;
      padding: 18px; gap: 4px;
    }
    .ds-big-value { font-size: 2.6em; font-weight: 800; color: var(--sc-text-primary); line-height: 1; font-variant-numeric: tabular-nums; }
    .ds-big-unit  { font-size: .9em; color: var(--sc-text-muted); letter-spacing: .04em; }

    .ds-alert-row { display: flex; flex-wrap: wrap; gap: 6px; }

    .ds-sensor-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px;
    }
    .ds-sensor-item {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 8px 4px; background: rgba(255, 255, 255, .04); border-radius: 6px;
    }
    .ds-sensor-val { font-size: .95em; font-weight: 700; color: var(--sc-text-primary); font-variant-numeric: tabular-nums; }
    .ds-sensor-label { font-size: var(--fs-xs); color: var(--sc-text-muted); letter-spacing: .02em; margin-top: 2px; }

    .ds-diag-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px;
    }
    .ds-diag-item { display: flex; flex-direction: column; gap: 2px; padding: 6px 10px; background: rgba(255, 255, 255, .04); border-radius: 6px; }
    .ds-diag-label { font-size: var(--fs-xs); color: var(--sc-text-muted); letter-spacing: .02em; }
    .ds-diag-val { font-size: .85em; color: var(--sc-text-primary); font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ds-diag-alert .ds-diag-val { color: #fca5a5; }

    .ds-channel-list { display: flex; flex-direction: column; gap: 4px; }
    .ds-channel-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 10px;
      background: rgba(255, 255, 255, .03); border-radius: 6px;
    }
    .ds-channel-name { flex: 1; font-size: .88em; color: var(--sc-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .ds-channel-power { font-size: .82em; color: var(--sc-power-color); font-variant-numeric: tabular-nums; flex-shrink: 0; }

    .ds-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
    .ds-tab {
      background: rgba(255, 255, 255, .04); border: 1px solid var(--sc-tile-border);
      color: var(--sc-text-secondary); padding: 4px 12px; border-radius: 8px;
      font-size: .78em; font-weight: 600; cursor: pointer; transition: all .15s;
    }
    .ds-tab:hover { background: rgba(255, 255, 255, .08); color: var(--sc-text-primary); }
    .ds-tab--active {
      background: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 18%, transparent);
      border-color: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 36%, transparent);
      color: var(--ds-accent, var(--sc-accent));
    }

    .ds-entity-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 10px;
      background: rgba(255, 255, 255, .03); border-radius: 6px; cursor: pointer;
      transition: background .12s;
    }
    .ds-entity-row:hover { background: rgba(255, 255, 255, .06); }
    .ds-entity-row + .ds-entity-row { margin-top: 4px; }
    .ds-ent-icon { font-size: 1em; width: 20px; text-align: center; flex-shrink: 0; color: var(--sc-text-muted); }
    .ds-ent-name { flex: 1; font-size: .85em; color: var(--sc-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .ds-ent-state { font-size: .82em; color: var(--sc-text-secondary); font-variant-numeric: tabular-nums; flex-shrink: 0; }
    .ds-ent-age { font-size: .7em; color: var(--sc-text-muted); flex-shrink: 0; }

    .ds-climate-info { display: flex; justify-content: space-around; align-items: center; gap: 14px; padding: 6px 0; }
    .ds-climate-current, .ds-climate-target { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .ds-climate-target { flex-direction: row; gap: 8px; }
    .ds-climate-label { font-size: var(--fs-xs); color: var(--sc-text-muted); letter-spacing: .02em; }
    .ds-climate-val { font-size: 1.3em; font-weight: 700; color: var(--sc-text-primary); font-variant-numeric: tabular-nums; }
    .ds-climate-target-val { font-size: 1.5em; color: var(--ds-accent, var(--sc-accent)); min-width: 80px; text-align: center; }
    .ds-temp-btn {
      width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--sc-tile-border);
      background: rgba(255, 255, 255, .05); color: var(--sc-text-primary); cursor: pointer;
      font-size: 1.2em; font-weight: 700; transition: all .15s;
    }
    .ds-temp-btn:hover { background: rgba(255, 255, 255, .12); border-color: var(--ds-accent, var(--sc-accent)); }
    .ds-climate-modes { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .ds-valve-pos { margin-top: 8px; font-size: .82em; color: var(--sc-text-muted); }

    .ds-cover-controls { display: flex; gap: 6px; justify-content: center; margin-bottom: 10px; }
    .ds-cover-btn {
      flex: 1; max-width: 110px; padding: 9px 12px; border-radius: 8px;
      border: 1px solid var(--sc-tile-border); background: rgba(255, 255, 255, .05);
      color: var(--sc-text-primary); font-size: .82em; font-weight: 600; cursor: pointer;
      transition: all .15s;
    }
    .ds-cover-btn:hover { background: rgba(255, 255, 255, .12); border-color: var(--ds-accent, var(--sc-accent)); }
    .ds-cover-pos { font-size: .82em; color: var(--sc-text-muted); margin: 4px 0; }

    .ds-muted { color: var(--sc-text-muted); font-size: .85em; }
`;
