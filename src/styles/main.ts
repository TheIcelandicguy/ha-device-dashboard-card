import { css } from 'lit';

export const mainCss = css`
:host {
      --sc-accent:          #c98a63;
      --sc-accent-glow:     rgba(201,138,99,0.30);
      --sc-graph-line:      var(--sc-accent);
      --tile-radius:        12px;
      --tile-gap:           10px;
      --sc-header-bg:       linear-gradient(135deg,#241f1b 0%,#33291f 100%);
      --sc-header-orb2:     #c98a63;
      --sc-header-text:     #f3ece3;
      --sc-online-color:    #93b384;
      --sc-online-bg:       rgba(147,179,132,0.18);
      --sc-online-border:   rgba(147,179,132,0.28);
      --sc-online-glow:     rgba(147,179,132,0.35);
      --sc-power-color:     #dba25c;
      --sc-offline-dot:     #d47f62;
      --sc-tile-bg:         rgba(255,244,232,0.035);
      --sc-tile-bg-image:   none;
      --sc-tile-bg-image-sz:cover;
      --sc-tile-border:     rgba(255,244,232,0.08);
      --sc-tile-hover-bg:   rgba(255,244,232,0.06);
      --sc-tile-hover-shad: rgba(0,0,0,0.35);
      --sc-tile-exp-bg:     rgba(255,244,232,0.05);
      --sc-sensor-bg:       rgba(255,244,232,0.045);
      --sc-text-primary:    #ece5dc;
      --sc-text-secondary:  #b3a596;
      --sc-text-muted:      #7e7265;
      --sc-text-value:      #f5efe7;
      --sc-text-detail:     #cabfb2;
      --sc-tog-off-bg:      rgba(255,255,255,0.08);
      --sc-tog-off-border:  rgba(255,255,255,0.10);
      --sc-update-color:    #f59e0b;
      --sc-update-glow:     rgba(245,158,11,0.40);
      --sc-font-family:     var(--ha-font-family-body, var(--mdc-typography-font-family, Roboto, system-ui, sans-serif));
      --sc-text-transform:  uppercase;
      --sc-text-scale:      1;
      /* Type scale — every tile font size derives from these four steps */
      --fs-xs: calc(var(--sc-text-scale, 1) * 0.72em);
      --fs-sm: calc(var(--sc-text-scale, 1) * 0.82em);
      --fs-md: calc(var(--sc-text-scale, 1) * 0.95em);
      --fs-lg: calc(var(--sc-text-scale, 1) * 1.2em);
      --sc-card-bg:         var(--ha-card-background, var(--card-background-color, #1e1a17));
      --sc-card-bg-image:   none;
      --sc-card-bg-image-sz:cover;
      --sc-tile-bg-opacity:      1;
      --sc-header-opacity:       1;
      --sc-header-orb-opacity:   0.5;
      --sc-header-radius:        0px;
      --sc-header-padding:       16px;
      --sc-header-title-size:    1.1em;
      --sc-header-icon:          '⚡';
      --sc-header-border-width:  0px;
      --sc-header-border-color:  transparent;
      --sc-tile-border-width:    1px;
      --sc-tile-shadow:          none;
      --sc-card-radius:          var(--ha-card-border-radius, 12px);
      --sc-area-header-color:    var(--sc-accent);
      --sc-hover-bg:             rgba(255,255,255,0.12);
      --sc-focus-ring:           var(--sc-accent);
    }


    ha-card {
      overflow-x: hidden; overflow-y: visible;
      background: var(--sc-card-bg-image) center / var(--sc-card-bg-image-sz) no-repeat, var(--sc-card-bg);
      container-type: inline-size; container-name: ha-dash;
      font-family: var(--sc-font-family);
      border-radius: var(--sc-card-radius);
    }


    /* Unified keyboard-focus ring for every interactive element inside the card */
    button:focus-visible,
    input:focus-visible,
    select:focus-visible,
    [role="button"]:focus-visible {
      outline: 2px solid var(--sc-focus-ring);
      outline-offset: 2px;
    }


    .dash-header {
      position: relative; display: flex; align-items: center; gap:10px;
      padding: var(--sc-header-padding, 16px) 18px; overflow: hidden;
      border-radius: var(--sc-header-radius, 0px);
      border-bottom: var(--sc-header-border-width, 0px) solid var(--sc-header-border-color, transparent);
    }

    .dash-header-bg {
      position: absolute; inset: 0; background: var(--sc-header-bg);
      opacity: var(--sc-header-opacity, 1); pointer-events: none; z-index: 0;
    }

    .dash-stats { margin-right: auto; }

    .dash-header::before,.dash-header::after {
      content:''; position:absolute; border-radius:50%; filter:blur(40px);
      opacity: var(--sc-header-orb-opacity, 0.5);
      animation: drift 8s ease-in-out infinite alternate;
    }

    .dash-header::before { width:120px;height:120px; background:var(--sc-accent); top:-40px;left:-20px; }

    .dash-header::after  { width:100px;height:100px; background:var(--sc-header-orb2); bottom:-30px;right:20px; animation-delay:-4s; }

    @keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(15px,8px) scale(1.15)} }

    @media (prefers-reduced-motion: reduce) {
      .dash-header::before, .dash-header::after { animation: none; }
    }


    .dash-title {
      font-size: var(--sc-header-title-size, 1.1em); font-weight:800; color:var(--sc-header-text);
      letter-spacing:0.02em; position:relative; z-index:1;
      display:flex; align-items:center; gap:8px;
    }

    .dash-title::before { content: var(--sc-header-icon, '⚡'); }


    .dash-stats { display:flex; gap:8px; align-items:center; position:relative; z-index:1; flex-shrink:0; }

    .stat { font-size:0.78em; padding:3px 10px; border-radius:20px; font-weight:600; backdrop-filter:blur(4px); cursor:pointer; transition:all .15s; white-space:nowrap; }

    .stat:hover { opacity:.8; }

    .stat.active { filter:brightness(1.3); box-shadow:0 0 8px currentColor; }

    .stat.online   { background:var(--sc-online-bg);  color:var(--sc-online-color); border:1px solid var(--sc-online-border); }

    .stat.metric   { background:rgba(255,255,255,.07); color:var(--sc-text-secondary); border:1px solid rgba(255,255,255,.12); }

    .stat.updates-count { background:rgba(245,158,11,.18); color:var(--sc-update-color); border:1px solid rgba(245,158,11,.3); }

    .stat.power    { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-power-color); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); }

    .stat.offline-count { background:rgba(75,85,99,.25); color:var(--sc-text-secondary); border:1px solid rgba(75,85,99,.35); }

    .stat.alerts-count  { background:rgba(239,68,68,.2); color:#fca5a5; border:1px solid rgba(239,68,68,.3); animation:blink 2s step-end infinite; }

    /* Scoped header stat chip color overrides */
    .dash-header .stat.online       { color:var(--sc-hstat-online, var(--sc-online-color)); background:color-mix(in srgb,var(--sc-hstat-online, var(--sc-online-color)) 18%,transparent); border-color:color-mix(in srgb,var(--sc-hstat-online, var(--sc-online-color)) 30%,transparent); }

    .dash-header .stat.power        { color:var(--sc-hstat-power, var(--sc-power-color)); }

    .dash-header .stat.offline-count { color:var(--sc-hstat-offline, #9ca3af); }


    /* ── Cloud status chips ── */
    .cloud-chips { display:flex; gap:5px; align-items:center; position:relative; z-index:1; flex-shrink:0; }

    .cloud-chip { font-size:0.72em; font-weight:700; padding:3px 10px; border-radius:20px; backdrop-filter:blur(4px); cursor:pointer; transition:all .15s; white-space:nowrap; }

    .cloud-chip:hover { opacity:.8; }

    .cloud-chip.cloud-on    { background:rgba(74,222,128,.18); color:var(--sc-online-color); border:1px solid rgba(74,222,128,.3); }

    .cloud-chip.cloud-off   { background:rgba(239,68,68,.18);  color:#f87171; border:1px solid rgba(239,68,68,.3); }

    .cloud-chip.cloud-unavail { background:rgba(107,114,128,.2); color:var(--sc-text-secondary); border:1px solid rgba(107,114,128,.3); }

    .cloud-chip.active { filter:brightness(1.3); box-shadow:0 0 8px currentColor; }


    /* ── Cloud detail panel ── */
    .cloud-detail { padding:12px 18px 14px; background:rgba(0,0,0,.3); border-bottom:1px solid rgba(255,255,255,.06); animation:slide-in .15s ease; }

    .cloud-detail-hdr { font-size:.7em; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,.08); }

    .cloud-detail-hdr.cloud-on    { color:var(--sc-online-color); }

    .cloud-detail-hdr.cloud-off   { color:#f87171; }

    .cloud-detail-hdr.cloud-unavail { color:var(--sc-text-secondary); }

    .cloud-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:4px 16px; }

    .cloud-item { font-size:.82em; color:var(--sc-text-secondary); padding:3px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* Header chip drill-down: devices ranked high→low by the chip's metric */
    .metric-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:2px 20px; }

    .metric-row { display:flex; align-items:baseline; justify-content:space-between; gap:10px; padding:3px 0; min-width:0; border-bottom:1px solid rgba(255,255,255,.04); }

    .metric-name { font-size:.82em; color:var(--sc-text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }

    .metric-val { font-size:.82em; font-weight:600; color:var(--sc-text-primary); font-variant-numeric:tabular-nums; flex-shrink:0; }


    /* ── View tabs ──────────────────────────────── */
    .view-tabs {
      display: flex; gap: 4px; padding: 8px 12px 4px; overflow-x: auto;
      border-bottom: 1px solid var(--sc-tile-border);
      scrollbar-width: thin;
    }
    .view-tab {
      flex-shrink: 0; display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 18px;
      background: rgba(255, 255, 255, .04); border: 1px solid transparent;
      color: var(--sc-text-secondary); font-size: .85em; font-weight: 600;
      cursor: pointer; transition: all .15s;
      font-family: inherit;
    }
    .view-tab:hover { background: rgba(255, 255, 255, .08); color: var(--sc-text-primary); }
    .view-tab.active {
      background: color-mix(in srgb, var(--sc-accent) 16%, transparent);
      border-color: color-mix(in srgb, var(--sc-accent) 32%, transparent);
      color: var(--sc-accent);
    }
    .view-tab-icon { --mdc-icon-size: 16px; width: 16px; height: 16px; }

    .dash-body { padding:0 0 8px; }

    .empty { padding:32px; text-align:center; color:var(--secondary-text-color); }

    .empty .hint { font-size:.85em; margin-top:4px; }


    .area-section {
      position:relative; overflow:hidden; margin:6px 10px 2px;
      border:1px solid var(--sc-tile-border); border-radius:10px;
    }
    /* Room backdrop photo (AreaStyle.bg_image). A ::before layer sits behind the
       header + tile grid; semi-transparent tiles let it show through. */
    .area-section[style*="--area-bg-image"]::before {
      content:''; position:absolute; inset:0; z-index:0; pointer-events:none;
      background:var(--area-bg-image) var(--area-bg-pos, center) / var(--area-bg-image-sz, cover) no-repeat;
    }
    /* Ambient mode: blur + darken so the photo reads as mood behind the tiles.
       inset:-28px pushes the soft blurred edges outside the section, which
       overflow:hidden then clips — otherwise the blur feathers to transparent. */
    .area-section.area-bg-ambient::before {
      inset:-28px; filter:blur(16px) brightness(0.5) saturate(1.15);
    }
    .area-section > * { position:relative; z-index:1; }

    /* Frosted-glass tiles over a room photo. Each tile blurs the photo behind it
       into a legible translucent panel, so the photo stays crisp in the gaps but
       the data never sits on a busy image. This is what makes a room backdrop
       look intentional rather than cluttered. */
    .area-section[style*="--area-bg-image"] .device-grid { gap:calc(var(--tile-gap,10px) + 2px); }
    .area-section[style*="--area-bg-image"] .tile {
      backdrop-filter: blur(20px) saturate(1.35);
      -webkit-backdrop-filter: blur(20px) saturate(1.35);
      border-color: rgba(255,255,255,0.16);
      /* drop shadow to lift the panel + a 1px inner top highlight for a glass edge */
      box-shadow: 0 3px 16px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.14);
    }
    .area-section[style*="--area-bg-image"] .tile::after {
      background: rgba(15,17,23,0.52);
      background-image: none;          /* the room photo lives on the section, not each tile */
      opacity: 1;                      /* the glass scrim owns its own alpha */
    }
    /* A soft dark gradient across the bottom of the photo grounds the tiles and
       lifts white text — applied to sharp mode (ambient is already darkened). */
    .area-section[style*="--area-bg-image"]:not(.area-bg-ambient)::before {
      box-shadow: inset 0 -80px 90px -40px rgba(0,0,0,0.55), inset 0 0 0 1000px rgba(0,0,0,0.12);
    }

    .area-header {
      display:flex; align-items:center; justify-content:space-between;
      background:var(--area-header-bg,rgba(255,255,255,0.04));
      padding:8px 14px; cursor:pointer; user-select:none;
      border-radius:10px; transition:filter 0.15s;
    }

    .area-header:hover { filter:brightness(1.08); }

    .area-section:not(.closed) .area-header { border-radius:10px 10px 0 0; border-bottom:1px solid var(--sc-tile-border); }

    .area-name { font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700); text-transform:var(--sc-text-transform,uppercase); letter-spacing:0.08em; color:var(--area-header-color,var(--sc-area-header-color,var(--sc-accent))); }

    .area-chips { display:flex; align-items:center; flex-wrap:wrap; gap:4px; flex:1; margin:0 10px; }

    .area-chip { display:flex; align-items:center; gap:3px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:1px 5px; }

    .area-chip .tsc-lbl { font-size:var(--fs-xs); color:var(--secondary-text-color); }

    .area-chip .tsc-val { font-size:.72em; font-weight:600; color:var(--sc-text-primary,var(--primary-text-color)); }

    .area-meta { display:flex; align-items:center; gap:8px; }

    .area-count { font-size:.75em; color:var(--secondary-text-color); }

    .area-power { font-size:.78em; font-weight:600; color:var(--sc-power-color); }

    .chevron { font-size:.6em; color:var(--secondary-text-color); transition:transform 0.25s; display:inline-block; }

    .chevron.open { transform:rotate(180deg); }

    .area-cog { background:transparent; border:none; color:var(--sc-text-muted, var(--secondary-text-color)); font-size:.8em; cursor:pointer; padding:2px 4px; border-radius:4px; line-height:1; opacity:.55; transition:opacity .15s,color .15s; }
    .area-cog:hover, .area-cog.on { opacity:1; color:var(--sc-accent); }
    .area-cog-pop { margin:0 0 8px; padding:10px 12px; background:var(--sc-tile-exp-bg, rgba(255,255,255,.05)); border:1px solid var(--sc-tile-border); border-radius:8px; }
    .acp-title { font-size:.68em; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--sc-text-muted, var(--secondary-text-color)); margin-bottom:6px; }
    .acp-list { display:flex; flex-wrap:wrap; gap:4px 16px; }
    .acp-row { display:flex; align-items:center; gap:7px; font-size:.8em; color:var(--sc-text-primary, var(--primary-text-color)); cursor:pointer; padding:2px 0; }
    .acp-row input { accent-color:var(--sc-accent); cursor:pointer; }
    .acp-empty { font-size:.75em; color:var(--sc-text-muted, var(--secondary-text-color)); }
    .acp-reset { margin-top:8px; font-size:.72em; padding:4px 10px; border-radius:6px; border:1px solid var(--sc-tile-border); background:transparent; color:var(--sc-text-secondary, var(--secondary-text-color)); cursor:pointer; }
    .acp-reset:hover { color:var(--sc-accent); border-color:var(--sc-accent); }


    .device-grid {
      display:grid; grid-template-columns:repeat(var(--cols,3),1fr);
      gap:var(--tile-gap,10px); padding:4px 12px 14px;
    }

    @container ha-dash (max-width:600px) { .device-grid { --cols:2; } }

    @container ha-dash (max-width:380px) { .device-grid { --cols:1; } }

    @container ha-dash (min-width:700px) { .sparkline-svg.exp { height:56px; } }


    .tile {
      border: var(--sc-tile-border-width, 1px) solid var(--sc-tile-border);
      border-radius:var(--tile-radius); padding:11px 13px;
      transition:transform 0.15s, box-shadow 0.15s;
      display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden;
      isolation:isolate; box-shadow: var(--sc-tile-shadow, none);
    }

    /* A tile_layout row holding two or more blocks side by side. Blocks share the
       width evenly; min-width:0 lets a graph or chip row shrink rather than
       overflow the tile. A block renders nothing when it doesn't apply to the
       device, so a row whose blocks all opted out has no element children — hide
       it, else the tile's flex gap leaves a phantom band. */
    .tile-row { display:flex; gap:6px; align-items:flex-start; }
    .tile-row > * { flex:1 1 0; min-width:0; }
    .tile-row:not(:has(*)) { display:none; }

    .tile--clickable { cursor:default; }

    .tile-trigger { cursor:pointer; }
    /* Whole tile opens the detail sheet; interactive controls keep their own cursor */
    .tile--clickable { cursor:pointer; }
    .tile--clickable button, .tile--clickable a, .tile--clickable input,
    .tile--clickable .ts-light-wheel, .tile--clickable .trv-dial-svg,
    .tile--clickable .valve-interactive, .tile--clickable hdd-delegated { cursor:auto; }
    .tile--clickable button, .tile--clickable a { cursor:pointer; }

    .tile::after {
      content:''; position:absolute; inset:0; z-index:-1; pointer-events:none;
      background:var(--sc-tile-bg);
      background-image:var(--sc-tile-bg-image); background-size:var(--sc-tile-bg-image-sz); background-position:center;
      opacity:var(--sc-tile-bg-opacity,1); transition:opacity 0.15s, background 0.15s;
    }

    .tile::before {
      content:''; position:absolute; top:0;left:0;right:0; height:2px;
      background:linear-gradient(90deg,var(--sc-accent),transparent); opacity:0; transition:opacity 0.2s; z-index:1;
    }

    .tile:hover { transform:translateY(-2px); box-shadow:0 6px 20px var(--sc-tile-hover-shad); }

    .tile:hover::after { background-color:var(--sc-tile-hover-bg); }

    .tile--clickable:hover::before { opacity:1; }

    .tile.offline { opacity:.45; filter:grayscale(.4); }

    .tile.expanded { border-color:var(--sc-accent); box-shadow:0 0 0 1px var(--sc-accent),0 4px 12px var(--sc-accent-glow); transform:none; }

    .tile.expanded::after { background-color:var(--sc-tile-exp-bg); }

    .tile.expanded::before { opacity:1; }

    .tile.tile-sm { padding:7px 9px; gap:4px; }

    .tile.tile-lg { padding:15px 17px; gap:9px; }


    .tile-expanded-panel {
      grid-column:1/-1; margin:2px 4px 6px; padding:14px;
      border:1px solid var(--sc-accent); border-radius:8px;
      background:var(--sc-tile-exp-bg);
      box-shadow:0 0 0 1px var(--sc-accent),0 8px 24px var(--sc-accent-glow);
      animation:slide-in 0.2s ease; cursor:default;
    }

    @keyframes slide-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }


    .tile-top { display:flex; align-items:center; justify-content:space-between; gap:6px; min-width:0; }

    .tile-left { display:flex; align-items:center; gap:6px; min-width:0; flex:1; }


    .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

    .dot.online { background:var(--sc-online-color); box-shadow:0 0 0 0 var(--sc-online-glow); animation:pulse-dot 2.5s ease-in-out infinite; }

    .dot.offline { background:var(--sc-offline-dot); }

    @keyframes pulse-dot { 0%{box-shadow:0 0 0 0 var(--sc-online-glow)} 60%{box-shadow:0 0 0 5px transparent} 100%{box-shadow:0 0 0 0 var(--sc-online-glow)} }


    .tile-name { font-size:calc(var(--sc-text-scale,1) * .88em); font-weight:600; color:var(--sc-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }

    .update-dot { color:var(--sc-update-color); font-size:.65em; flex-shrink:0; animation:blink 2s step-end infinite; }

    @keyframes blink { 50%{opacity:.3} }


    /* ── Tile icons ── */
    .tile-icon { width:18px; height:18px; flex-shrink:0; color:var(--sc-text-muted); transition:color .3s, filter .3s; }


    /* Relay / plug — lightning bolt */
    .tile-icon-relay.on { color:var(--sc-accent); animation:icon-pulse 2s ease-in-out infinite; }

    @keyframes icon-pulse { 0%,100%{filter:drop-shadow(0 0 3px var(--ipglow,var(--sc-accent-glow)))} 50%{filter:drop-shadow(0 0 8px var(--ipglow,var(--sc-accent-glow)))} }


    /* Fan — spinning blades */
    .tile-icon-fan .fan-blades { transform-origin:10px 10px; }

    .tile-icon-fan.on { color:var(--sc-accent); }

    .tile-icon-fan.on .fan-blades { animation:fan-spin 1s linear infinite; }

    @keyframes fan-spin { to{transform:rotate(360deg)} }


    /* Sun — rotate + glow */
    .tile-icon-sun { transform-origin:10px 10px; }

    .tile-icon-sun.on { color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.6)); animation:sun-spin 8s linear infinite; }

    @keyframes sun-spin { to{transform:rotate(360deg)} }


    /* Cover — slat movement */
    .tile-icon-cover.moving { animation:cover-bounce 1s ease-in-out infinite; }

    @keyframes cover-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }


    /* Flame — flicker */
    .tile-icon-flame.on { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.6)); }

    .tile-icon-flame.on .flame-main { animation:flicker 1.5s ease-in-out infinite alternate; transform-origin:10px 18px; }

    .tile-icon-flame.on .flame-inner { animation:flicker 1.5s ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }

    @keyframes flicker { 0%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(.95) scaleY(1.04)} 66%{transform:scaleX(1.04) scaleY(.97)} 100%{transform:scaleX(.97) scaleY(1.03)} }


    /* Valve — drip pulse */
    .tile-icon-valve.on { color:#38bdf8; filter:drop-shadow(0 0 4px rgba(56,189,248,0.5)); }

    .tile-icon-valve.on .drop-body { animation:drip 2s ease-in-out infinite; transform-origin:10px 10px; }

    @keyframes drip { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06) translateY(1px)} }


    /* Energy — wave scroll */
    .tile-icon-energy { color:var(--sc-accent); }

    .tile-icon-energy .energy-wave { stroke-dasharray:40; animation:wave-scroll 2s linear infinite; }

    @keyframes wave-scroll { to{stroke-dashoffset:-40} }


    /* Input — ripple */
    .tile-icon-input.on { color:var(--sc-accent); }

    .tile-icon-input.on .input-ripple { animation:input-ripple .8s ease-out forwards; }

    @keyframes input-ripple { 0%{r:0;opacity:.8} 100%{r:6;opacity:0} }


    /* ── Entity-level state animation icons ─────────────────────────────── */
    .ent-icon { width:15px; height:15px; flex-shrink:0; transition:color .3s,filter .3s; }

    .ent-icon-flame.off { color:#4b5563; }

    .ent-icon-flame.on  { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.55)); }

    .ent-icon-flame.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }

    .ent-icon-flame.on .flame-inner { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }

    .ent-icon-snowflake { color:#7dd3fc; }

    .ent-icon-snowflake .snow-arms { animation:snow-spin calc(6s / var(--ent-spd,1)) linear infinite; }

    @keyframes snow-spin { to { transform:rotate(360deg); } }

    .ent-icon-fan.off { color:#4b5563; }

    .ent-icon-fan.on  { color:var(--sc-accent); }

    .ent-icon-fan.on .fan-blades { animation:fan-spin calc(1s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-pulse.off { color:#4b5563; }

    .ent-icon-pulse.on  { color:var(--sc-accent); }

    .ent-icon-pulse.on .pulse-ring { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    .ent-icon-wave { color:var(--sc-accent); }

    .ent-icon-wave .energy-wave { stroke-dasharray:40; animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-sun.off { color:#4b5563; }

    .ent-icon-sun.on  { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.55)); }

    .ent-icon-sun.on .sun-group { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-lightning.off { color:#4b5563; }

    .ent-icon-lightning.on  { --ipglow:rgba(251,191,36,0.55); color:#fbbf24; animation:icon-pulse calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-heart.off { color:#4b5563; }

    .ent-icon-heart.on  { color:#f43f5e; filter:drop-shadow(0 0 5px rgba(244,63,94,0.55)); }

    .ent-icon-heart.on .heart-shape { animation:heartbeat calc(1s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    @keyframes heartbeat { 0%,100%{transform:scale(1)} 20%{transform:scale(1.22)} 40%{transform:scale(1)} 60%{transform:scale(1.15)} }

    .ent-icon-bulb.off { color:#6b7280; }

    .ent-icon-bulb.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }

    .ent-icon-bulb.off .bulb-base1,.ent-icon-bulb.off .bulb-base2 { opacity:0.3; }

    .ent-icon-bulb.on  { --ipglow:rgba(253,224,71,0.65); color:#fde047; animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-leaf.off { color:#4b5563; }

    .ent-icon-leaf.on  { color:#4ade80; filter:drop-shadow(0 0 5px rgba(74,222,128,0.5)); }

    .ent-icon-leaf.on .leaf-body { animation:leaf-sway calc(3s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 17px; }

    @keyframes leaf-sway { 0%,100%{transform:rotate(0deg)} 33%{transform:rotate(6deg)} 66%{transform:rotate(-6deg)} }

    .ent-icon-moon.off { color:#4b5563; }

    .ent-icon-moon.on  { --ipglow:rgba(196,181,253,0.55); color:#c4b5fd; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-water.off { color:#4b5563; }

    .ent-icon-water.on  { color:#38bdf8; filter:drop-shadow(0 0 5px rgba(56,189,248,0.5)); }

    .ent-icon-water.on .drop-body { animation:drip calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    .ent-icon-lock.off { color:#4b5563; }

    .ent-icon-lock.on  { --ipglow:rgba(167,139,250,0.55); color:#a78bfa; animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    /* ── Flame variants ── */
    .ent-icon-flame2.off,.ent-icon-flame3.off { color:#4b5563; }

    .ent-icon-flame2.on  { color:#f97316; filter:drop-shadow(0 0 6px rgba(249,115,22,0.55)); }

    .ent-icon-flame2.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }

    .ent-icon-flame2.on .flame-b { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; animation-delay:calc(-0.4s / var(--ent-spd,1)); }

    .ent-icon-flame3.on  { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.5)); }

    .ent-icon-flame3.on .flame-main { animation:flicker calc(1.2s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 15px; }

    /* ── Snowflake variants ── */
    .ent-icon-snowflake2 { color:#7dd3fc; }

    .ent-icon-snowflake2 .snow-arms { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-snowflake3 { color:#7dd3fc; }

    .ent-icon-snowflake3 .snow-drift-g { animation:snow-drift calc(4s / var(--ent-spd,1)) ease-in-out infinite; }

    @keyframes snow-drift { 0%{transform:translateY(-3px) rotate(0deg)} 50%{transform:translateY(3px) rotate(180deg)} 100%{transform:translateY(-3px) rotate(360deg)} }

    /* ── Fan variants ── */
    .ent-icon-fan2.off,.ent-icon-fan3.off { color:#4b5563; }

    .ent-icon-fan2.on  { color:var(--sc-accent); }

    .ent-icon-fan2.on .fan-blades { animation:fan-spin calc(0.8s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-fan3.on  { color:var(--sc-accent); }

    .ent-icon-fan3.on .fan-blades { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }

    /* ── Lightning variants ── */
    .ent-icon-lightning2.off,.ent-icon-lightning3.off { color:#4b5563; }

    .ent-icon-lightning2.on { --ipglow:rgba(251,191,36,0.6); color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.5)); }

    .ent-icon-lightning2.on .bolt-a { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-lightning2.on .bolt-b { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }

    @keyframes bolt-flash { 0%,100%{opacity:1} 50%{opacity:0.2} }

    .ent-icon-lightning3.off .arc-path { opacity:0.2; }

    .ent-icon-lightning3.on  { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.6)); }

    .ent-icon-lightning3.on .arc-path { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }

    @keyframes arc-flash { 0%,100%{opacity:0.15} 50%{opacity:1} }

    /* ── Bulb variants ── */
    .ent-icon-bulb2.off { color:#6b7280; }

    .ent-icon-bulb2.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }

    .ent-icon-bulb2.off .bulb-filament { display:none; }

    .ent-icon-bulb2.off .bulb-base1,.ent-icon-bulb2.off .bulb-base2 { opacity:0.3; }

    .ent-icon-bulb2.on { --ipglow:rgba(251,191,36,0.7); color:#fbbf24; animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-bulb3.off { color:#6b7280; }

    .ent-icon-bulb3.off .bulb-chip { fill:none; stroke:currentColor; stroke-width:1; opacity:0.5; }

    .ent-icon-bulb3.on { --ipglow:rgba(224,242,254,0.7); color:#e0f2fe; animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    /* ── Water variants ── */
    .ent-icon-water2 { color:#38bdf8; }

    .ent-icon-water2 .wave-a { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-water2 .wave-b { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-water3.off { color:#4b5563; }

    .ent-icon-water3.on  { --ipglow:rgba(56,189,248,0.5); color:#38bdf8; }

    .ent-icon-water3.on .ripple1 { animation:ripple-out calc(2s / var(--ent-spd,1)) ease-out infinite; }

    .ent-icon-water3.on .ripple2 { animation:ripple-out calc(2s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }

    @keyframes ripple-out { 0%{r:2;opacity:0.8} 100%{r:9;opacity:0} }

    /* ── Sun variants ── */
    .ent-icon-sun2.off,.ent-icon-sun3.off { color:#4b5563; }

    .ent-icon-sun2.on { --ipglow:rgba(251,191,36,0.5); color:#fbbf24; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-sun3.on { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.55)); }

    .ent-icon-sun3.on .sun-group { animation:snow-spin calc(4s / var(--ent-spd,1)) linear infinite; }

    /* ── Moon variants ── */
    .ent-icon-moon2.off,.ent-icon-moon3.off { color:#4b5563; }

    .ent-icon-moon2.on { --ipglow:rgba(241,245,249,0.6); color:#f1f5f9; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-moon3.on { color:#c4b5fd; filter:drop-shadow(0 0 6px rgba(196,181,253,0.55)); }

    .ent-icon-moon3.on .star1 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-moon3.on .star2 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }

    .ent-icon-moon3.on .star3 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.4s / var(--ent-spd,1)); }

    @keyframes twinkle { 0%,100%{opacity:1} 50%{opacity:0.15} }

    @keyframes wind-blow { 0%{transform:translateX(0);opacity:0.3} 50%{opacity:1} 100%{transform:translateX(4px);opacity:0.3} }

    @keyframes bell-ring { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-10deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-7deg)} 80%{transform:rotate(7deg)} }

    @keyframes therm-pulse { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.65)} }

    @keyframes star-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }

    @keyframes star-shoot { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(6px,-6px);opacity:0.15} }

    @keyframes ekg-scan { to{stroke-dashoffset:-50} }

    @keyframes bar-bounce { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }


    /* ── Wind ──────────────────────────────────────────────────── */
    .ent-icon-wind.off,.ent-icon-wind2.off,.ent-icon-wind3.off { color:#4b5563; }

    .ent-icon-wind.on  { color:#a5f3fc; filter:drop-shadow(0 0 5px rgba(165,243,252,0.45)); }

    .ent-icon-wind.on .wind-line-a { animation:wave-scroll calc(1.4s / var(--ent-spd,1)) linear infinite; stroke-dasharray:24; }

    .ent-icon-wind.on .wind-line-b { animation:wave-scroll calc(1.6s / var(--ent-spd,1)) linear infinite; stroke-dasharray:20; animation-delay:calc(-0.25s / var(--ent-spd,1)); }

    .ent-icon-wind.on .wind-line-c { animation:wave-scroll calc(1.9s / var(--ent-spd,1)) linear infinite; stroke-dasharray:16; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-wind2.on { color:#a5f3fc; filter:drop-shadow(0 0 4px rgba(165,243,252,0.4)); }

    .ent-icon-wind2.on .gust-a { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-wind2.on .gust-b { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.33s / var(--ent-spd,1)); }

    .ent-icon-wind2.on .gust-c { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.66s / var(--ent-spd,1)); }

    .ent-icon-wind3.on { color:#a5f3fc; --ipglow:rgba(165,243,252,0.5); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }


    /* ── Bell ──────────────────────────────────────────────────── */
    .ent-icon-bell.off,.ent-icon-bell2.off,.ent-icon-bell3.off { color:#4b5563; }

    .ent-icon-bell.on  { color:#fde68a; --ipglow:rgba(253,230,138,0.55); filter:drop-shadow(0 0 5px rgba(253,230,138,0.4)); animation:bell-ring calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 2.5px; }

    .ent-icon-bell2.on { color:#fde68a; --ipglow:rgba(253,230,138,0.55); filter:drop-shadow(0 0 4px rgba(253,230,138,0.35)); }

    .ent-icon-bell2.on .ring-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-bell2.on .ring-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.25s / var(--ent-spd,1)); }

    .ent-icon-bell2.on .ring-c { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-bell3.on { color:#fca5a5; --ipglow:rgba(252,165,165,0.55); animation:icon-pulse calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }


    /* ── Thermometer ────────────────────────────────────────────── */
    .ent-icon-thermometer.off,.ent-icon-thermometer2.off,.ent-icon-thermometer3.off { color:#4b5563; }

    .ent-icon-thermometer.on  { color:#fb923c; filter:drop-shadow(0 0 5px rgba(251,146,60,0.5)); }

    .ent-icon-thermometer.on .therm-mercury { animation:therm-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 13px; }

    .ent-icon-thermometer2.on { color:#f87171; filter:drop-shadow(0 0 5px rgba(248,113,113,0.5)); }

    .ent-icon-thermometer2.on .therm-arrow { animation:cover-bounce calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-thermometer3.on { color:#fb923c; filter:drop-shadow(0 0 4px rgba(251,146,60,0.45)); }

    .ent-icon-thermometer3.on .therm-up   { animation:cover-bounce calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-thermometer3.on .therm-down { animation:cover-bounce calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }


    /* ── Battery ────────────────────────────────────────────────── */
    .ent-icon-battery.off,.ent-icon-battery2.off { color:#4b5563; }

    .ent-icon-battery.on  { color:#4ade80; --ipglow:rgba(74,222,128,0.5); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-battery2.on { color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.5)); }

    .ent-icon-battery2.on .charge-bolt { animation:bolt-flash calc(0.9s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-battery3      { color:#f87171; }

    .ent-icon-battery3.off  { color:#6b7280; }

    .ent-icon-battery3.on   { color:#f87171; filter:drop-shadow(0 0 4px rgba(248,113,113,0.5)); animation:blink calc(1.2s / var(--ent-spd,1)) step-end infinite; }


    /* ── Star ───────────────────────────────────────────────────── */
    .ent-icon-star.off,.ent-icon-star2.off,.ent-icon-star3.off { color:#4b5563; }

    .ent-icon-star.on  { color:#fde047; --ipglow:rgba(253,224,71,0.55); filter:drop-shadow(0 0 6px rgba(253,224,71,0.45)); animation:star-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    .ent-icon-star2.on { color:#fde047; filter:drop-shadow(0 0 5px rgba(253,224,71,0.4)); }

    .ent-icon-star2.on .star-body { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; transform-origin:10px 10px; }

    .ent-icon-star3.on { color:#fde047; filter:drop-shadow(0 0 4px rgba(253,224,71,0.4)); animation:star-shoot calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; }


    /* ── Pulse variants ─────────────────────────────────────────── */
    .ent-icon-pulse2.off,.ent-icon-pulse3.off { color:#4b5563; }

    .ent-icon-pulse2.on { color:var(--sc-accent); }

    .ent-icon-pulse2.on .pulse-ring  { animation:ripple-out calc(1.2s / var(--ent-spd,1)) ease-out infinite; }

    .ent-icon-pulse2.on .pulse-ring2 { animation:ripple-out calc(1.2s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-pulse3.on { color:#f43f5e; filter:drop-shadow(0 0 4px rgba(244,63,94,0.45)); }

    .ent-icon-pulse3.on .ekg-line { animation:ekg-scan calc(1.5s / var(--ent-spd,1)) linear infinite; stroke-dasharray:50; stroke-dashoffset:0; }


    /* ── Wave variants ──────────────────────────────────────────── */
    .ent-icon-wave2.off,.ent-icon-wave3.off,.ent-icon-wave4.off { color:#4b5563; }

    .ent-icon-wave2.on { color:#5eead4; filter:drop-shadow(0 0 4px rgba(94,234,212,0.4)); }

    .ent-icon-wave2.on .bar-odd  { animation:bar-bounce calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:50% 100%; }

    .ent-icon-wave2.on .bar-even { animation:bar-bounce calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:50% 100%; }

    .ent-icon-wave3.on { color:#7dd3fc; filter:drop-shadow(0 0 4px rgba(125,211,252,0.4)); }

    .ent-icon-wave3.on .arc-a { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-wave3.on .arc-b { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-wave3.on .arc-c { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }

    .ent-icon-wave4.on { color:#93c5fd; filter:drop-shadow(0 0 4px rgba(147,197,253,0.4)); }

    .ent-icon-wave4.on .wifi-a { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-wave4.on .wifi-b { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.45s / var(--ent-spd,1)); }

    .ent-icon-wave4.on .wifi-c { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s / var(--ent-spd,1)); }


    /* ── Heart variant ──────────────────────────────────────────── */
    .ent-icon-heart2.off { color:#4b5563; }

    .ent-icon-heart2.on  { color:#f43f5e; filter:drop-shadow(0 0 5px rgba(244,63,94,0.5)); }

    .ent-icon-heart2.on .heart-shape { animation:heartbeat calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }


    /* ── Leaf variant ───────────────────────────────────────────── */
    .ent-icon-leaf2.off { color:#4b5563; }

    .ent-icon-leaf2.on  { color:#4ade80; filter:drop-shadow(0 0 5px rgba(74,222,128,0.45)); animation:leaf-sway calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 18px; }


    /* ── Lock variant ───────────────────────────────────────────── */
    .ent-icon-lock2.off { color:#4b5563; }

    .ent-icon-lock2.on  { color:#7ecfff; --ipglow:rgba(126,207,255,0.55); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }


    /* Legacy boxed chips — still used by area headers and the detail sheet */
    .tile-sensor-chips { display:flex; flex-wrap:wrap; gap:4px; margin:2px 0 0; min-width:0; }

    .tile-sensor-chip { display:flex; flex-direction:column; align-items:center; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:6px; padding:2px 7px; min-width:38px; max-width:100%; overflow:hidden; }

    .tsc-lbl { font-size:var(--fs-xs); color:var(--sc-text-muted); letter-spacing:.02em; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .tsc-val { font-size:var(--fs-sm); color:var(--sc-text-primary); font-weight:500; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .tile-sensor-chip.warn .tsc-val { color:var(--sc-accent); }

    /* ── Three-tier tile stats ──────────────────────────────────── */
    /* Primary: large unboxed values with inline units */
    .tile-stats { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 14px; margin:4px 0 0; min-width:0; }

    .stat-item { font-size:var(--fs-md); font-weight:600; color:var(--sc-text-primary); font-variant-numeric:tabular-nums; white-space:nowrap; display:inline-flex; align-items:baseline; gap:4px; }

    .stat-item.warn { color:var(--sc-accent); }

    .stat-lbl { font-size:var(--fs-xs); font-weight:500; color:var(--sc-text-muted); }

    /* Electrical: one compound strip per channel */
    .tile-elec-wrap { display:flex; flex-direction:column; gap:2px; margin:4px 0 0; min-width:0; }

    .tile-elec { display:flex; align-items:baseline; gap:6px; font-size:var(--fs-sm); color:var(--sc-text-detail); font-variant-numeric:tabular-nums; background:var(--sc-tile-sensor-bg, rgba(255,255,255,.04)); border-radius:6px; padding:3px 8px; width:fit-content; max-width:100%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }

    /* Diagnostics: single muted footer line */
    .tile-diag { display:flex; align-items:baseline; gap:6px; margin-top:4px; padding-top:4px; border-top:1px solid rgba(255,255,255,.06); font-size:var(--fs-xs); color:var(--sc-text-muted); white-space:nowrap; overflow:hidden; min-width:0; }

    .tile-diag > span { overflow:hidden; text-overflow:ellipsis; }

    .tile-diag .warn { color:var(--sc-accent); }

    .sep { opacity:.4; flex-shrink:0; }


    .tile-bot { display:flex; align-items:center; justify-content:space-between; gap:4px; min-width:0; }

    .tile-power { font-size:var(--fs-md); font-weight:700; color:var(--sc-power-color); font-variant-numeric:tabular-nums; }

    .tile-badges { display:flex; gap:4px; align-items:center; margin-left:auto; }

    .type-badge,.gen-badge,.int-badge-tile { font-size:10px; font-weight:600; letter-spacing:.03em; padding:2px 5px; border-radius:4px; line-height:1.4; white-space:nowrap; }

    .type-relay       { background:rgba(99,102,241,.25);  color:#a5b4fc; }

    .type-dimmer      { background:rgba(234,179,8,.20);   color:#fde047; }

    .type-rgb         { background:rgba(236,72,153,.22);  color:#f9a8d4; }

    .type-plug        { background:rgba(34,197,94,.20);   color:#86efac; }

    .type-cover       { background:rgba(14,165,233,.20);  color:#7dd3fc; }

    .type-energy      { background:rgba(245,158,11,.22);  color:#fcd34d; }

    .type-sensor      { background:rgba(20,184,166,.20);  color:#5eead4; }

    .type-input       { background:rgba(168,85,247,.20);  color:#d8b4fe; }

    .type-climate     { background:rgba(239,68,68,.22);   color:#fca5a5; }

    .gen-1   { background:rgba(107,114,128,.25); color:#9ca3af; }

    .gen-2   { background:rgba(59,130,246,.22);  color:#93c5fd; }

    .gen-3   { background:rgba(34,197,94,.20);   color:#86efac; }

    .gen-4   { background:rgba(168,85,247,.20);  color:#d8b4fe; }

    .gen-ble { background:rgba(6,182,212,.20);   color:#67e8f9; }

    .int-badge-tile { background:rgba(255,255,255,.06); color:var(--sc-text-muted); }

    .tile-ui-link { font-size:11px; font-weight:700; color:var(--sc-accent); text-decoration:none; padding:1px 4px; border-radius:4px; opacity:.75; transition:opacity .15s; }

    .tile-ui-link:hover { opacity:1; }


    .alert-badge { font-size:10px; font-weight:700; padding:2px 5px; border-radius:4px; white-space:nowrap; animation:blink 1.5s step-end infinite; }

    .alert-overtemp  { background:rgba(251,146,60,.25); color:#fdba74; }

    .alert-overpower { background:rgba(239,68,68,.25);  color:#fca5a5; }


    .tog { padding:var(--tog-pad,4px 11px); border:none; border-radius:var(--tog-radius,20px); aspect-ratio:var(--tog-aspect,auto); cursor:pointer; font-size:var(--tog-fsize,.72em); font-weight:700; letter-spacing:.05em; flex-shrink:0; transition:transform .1s,opacity .15s,box-shadow .15s; position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; }

    .tog::after { content:''; position:absolute; inset:0; background:white; opacity:0; transition:opacity .15s; }

    .tog:active::after { opacity:.15; }

    .tog.sm { padding:2px 9px; font-size:.68em; }

    .tog.on { background:var(--tog-on-bg,linear-gradient(135deg,var(--sc-accent),color-mix(in srgb,var(--sc-accent) 70%,#f97316))); color:var(--tog-on-color,white); box-shadow:var(--tog-on-shadow,0 2px 8px var(--sc-accent-glow)); border:var(--tog-on-border,none); }

    .tog.off { background:var(--sc-tog-off-bg); color:var(--sc-text-secondary); border:1px solid var(--sc-tog-off-border); }

    .tog.update { background:linear-gradient(135deg,var(--sc-update-color),color-mix(in srgb,var(--sc-update-color) 60%,#f97316)); color:white; box-shadow:0 2px 6px var(--sc-update-glow); }

    .tog:hover { opacity:.85; transform:scale(1.04); }

    .tog:active { transform:scale(.96); }


    .tile-dim-row { display:flex; align-items:center; gap:8px; }

    .dim-slider { flex:1; min-width:0; cursor:pointer; accent-color:var(--sc-accent); appearance:none; -webkit-appearance:none; height:4px; background:transparent; }

    .dim-slider:disabled { opacity:.3; }

    .dim-slider::-webkit-slider-runnable-track { height:4px; border-radius:2px; background:var(--sc-tile-border); }

    .dim-slider::-moz-range-track { height:4px; border-radius:2px; background:var(--sc-tile-border); border:none; }

    .dim-slider::-webkit-slider-thumb {
      -webkit-appearance:none; appearance:none; width:14px; height:14px; border-radius:50%;
      background:var(--sc-accent); border:2px solid var(--sc-text-value); margin-top:-5px; cursor:pointer;
      box-shadow:0 0 0 1px var(--sc-tile-border); transition:transform 0.12s;
    }

    .dim-slider::-moz-range-thumb {
      width:14px; height:14px; border-radius:50%;
      background:var(--sc-accent); border:2px solid var(--sc-text-value); cursor:pointer;
      box-shadow:0 0 0 1px var(--sc-tile-border); transition:transform 0.12s;
    }

    .dim-slider:hover::-webkit-slider-thumb { transform:scale(1.15); }

    .dim-slider:hover::-moz-range-thumb { transform:scale(1.15); }

    .dim-pct { font-size:var(--fs-sm); font-weight:600; color:var(--sc-text-secondary); min-width:30px; text-align:right; }

    .color-swatch { width:30px; height:20px; border-radius:5px; border:none; cursor:pointer; padding:1px; background:transparent; flex-shrink:0; }

    .color-swatch:disabled { opacity:.3; }


    .cov-btns { display:flex; gap:2px; }

    .cov-btn { background:var(--sc-tog-off-bg); border:1px solid var(--sc-tog-off-border); border-radius:6px; color:var(--sc-text-primary); cursor:pointer; font-size:10px; padding:5px 10px; transition:background .15s; min-height:24px; }

    .cov-btn:hover { background:var(--sc-hover-bg); }

    .cov-btn.stop { color:var(--sc-text-muted); }

    .cov-pos-row { display:flex; align-items:center; gap:6px; }

    .cov-bar { flex:1; height:4px; background:rgba(255,255,255,.10); border-radius:3px; overflow:hidden; }

    .cov-fill { height:100%; background:var(--sc-accent); border-radius:3px; transition:width .4s; }

    .cov-pct { font-size:10px; color:var(--sc-text-secondary); min-width:34px; text-align:right; }


    .tile-trv-row { display:flex; align-items:center; gap:8px; }

    .trv-temps { display:flex; align-items:baseline; gap:4px; flex:1; min-width:0; }

    .trv-cur { font-size:.82em; color:var(--sc-text-secondary); font-variant-numeric:tabular-nums; }

    .trv-sep { font-size:.7em; color:var(--sc-text-muted); }

    .trv-target { font-size:.95em; font-weight:700; color:var(--sc-text-value); font-variant-numeric:tabular-nums; }

    .trv-target.heating { color:var(--sc-accent); }

    .trv-flame { font-size:.75em; flex-shrink:0; }

    .trv-step-btns { display:flex; gap:3px; flex-shrink:0; }

    .trv-step { width:28px;height:28px; border:1px solid var(--sc-tog-off-border); border-radius:6px; background:var(--sc-tog-off-bg); color:var(--sc-text-secondary); font-size:1em; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; }

    .trv-step:hover { background:var(--sc-accent); color:white; }

    .trv-ctrl-row { display:flex; align-items:center; gap:12px; margin-bottom:6px; }

    .trv-big-btn { width:36px;height:36px; border:1px solid var(--sc-tog-off-border); border-radius:50%; background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:1.3em; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; }

    .trv-big-btn:hover { background:var(--sc-accent); color:white; }

    .trv-display { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; }

    .trv-target-big { font-size:1.8em; font-weight:700; color:var(--sc-text-primary); font-variant-numeric:tabular-nums; }

    .trv-current-sub { font-size:.78em; color:var(--sc-text-secondary); }

    .trv-action-badge { font-size:.65em; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:10px; }

    .trv-action-badge.heating { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); }

    .trv-mode-row { display:flex; gap:6px; margin-bottom:6px; }

    .trv-range-lbl { font-size:.68em; color:var(--sc-text-muted); flex-shrink:0; }

    .dim-wrap { display:flex; flex-direction:row; align-items:center; gap:6px; flex:1; min-width:0; }


    .tile-trv-dial { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; width:100%; padding:4px 0; }

    .trv-dial-svg { width:100%; max-width:200px; height:auto; overflow:visible; }

    .dial-target-text { font-size:30px; font-weight:700; fill:var(--sc-text-primary,#fff); }

    .dial-sub-text { font-size:11px; fill:var(--sc-text-secondary,rgba(255,255,255,0.5)); }

    .dial-current-text { font-size:13px; fill:var(--sc-text-secondary,rgba(255,255,255,0.65)); }

    .dial-range-text { font-size:11px; fill:var(--sc-text-secondary,rgba(255,255,255,0.5)); }

    .trv-dial-btns { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:2px; width:100%; }

    .trv-stat-row { display:flex; gap:10px; justify-content:center; margin-top:4px; }

    .trv-stat { display:flex; flex-direction:column; align-items:center; }

    .trv-stat-lbl { font-size:10px; color:var(--sc-text-secondary,rgba(255,255,255,0.55)); }

    .trv-stat-val { font-size:13px; font-weight:600; color:var(--sc-text-primary,#fff); }

    .trv-presets { display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin-top:6px; }

    .trv-preset-btn { font-size:11px; padding:3px 8px; border-radius:12px; border:1px solid var(--sc-border); background:transparent; color:var(--sc-text-primary); cursor:pointer; white-space:nowrap; }

    .trv-preset-btn.active { background:var(--sc-accent,#e67e22); border-color:var(--sc-accent,#e67e22); color:#fff; }


    .valve-interactive { cursor:pointer; touch-action:none; }

    .valve-dial-btns { display:flex; align-items:center; gap:8px; margin-top:10px; }

    .valve-btn { padding:4px 14px; border-radius:8px; border:1px solid var(--sc-tog-off-border); background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:12px; font-weight:600; cursor:pointer; transition:background .15s; }

    .valve-btn:hover { background:var(--sc-hover-bg); }

    .valve-btn.open:hover { background:#0ea5e9; border-color:#0ea5e9; color:#fff; }

    .valve-btn.close:hover { background:#6b7280; border-color:#6b7280; color:#fff; }

    .valve-btn.stop { color:var(--sc-text-muted); font-size:10px; }

    .valve-slider-row { display:flex; align-items:center; gap:6px; width:100%; padding:4px 8px 0; box-sizing:border-box; }


    .tile-inputs { display:flex; flex-direction:column; gap:5px; }

    .input-row { display:flex; align-items:center; gap:8px; padding:5px 8px; border-radius:8px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.04); transition:all .15s; }

    .input-row.active { background:color-mix(in srgb,var(--sc-accent) 15%,transparent); border-color:color-mix(in srgb,var(--sc-accent) 35%,transparent); }

    .input-row-dot { width:8px; height:8px; border-radius:50%; background:var(--sc-text-muted); flex-shrink:0; transition:background .15s; }

    .input-row.active .input-row-dot { background:var(--sc-accent); }

    .input-btn-dot { width:8px; height:8px; border-radius:2px; background:rgba(129,140,248,0.5); flex-shrink:0; }

    .input-row.btn-mode { border-color:rgba(129,140,248,0.18); }

    .input-row-name { font-size:13px; font-weight:600; color:var(--sc-text-primary); min-width:60px; }

    .input-row-event { flex:1; font-size:12px; color:var(--sc-text-secondary); text-transform:capitalize; }

    .input-row-time { font-size:11px; color:var(--sc-text-muted); white-space:nowrap; }

    .input-chip { display:flex; align-items:center; gap:4px; padding:4px 10px 4px 8px; border-radius:14px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.05); font-size:12px; color:var(--sc-text-muted); transition:all .15s; }

    .input-chip.active { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); border-color:color-mix(in srgb,var(--sc-accent) 40%,transparent); }

    .input-dot { width:7px;height:7px; border-radius:50%; background:currentColor; flex-shrink:0; }

    .input-lbl { font-weight:600; }


    /* ── Virtual controls ── */
    .tile-virtuals { display:flex; flex-direction:column; gap:4px; }

    /* Delegated (native HA) controls for long-tail domains — Phase 3 fallback */
    .tile-delegated { display:flex; flex-direction:column; gap:6px; margin-top:2px; }

    /* One-time notice: native controls available but off by default */
    .delegate-notice {
      display:flex; align-items:center; gap:10px; margin:0 12px 10px;
      padding:8px 12px; border-radius:10px;
      background:var(--sc-tile-bg); border:1px solid var(--sc-tile-border);
      font-size:.8em; color:var(--sc-text-secondary);
    }
    .delegate-notice .dn-icon { color:var(--sc-accent); flex-shrink:0; }
    .delegate-notice .dn-text { flex:1; min-width:0; }
    .delegate-notice .dn-text b { color:var(--sc-text-primary); font-weight:600; }
    .delegate-notice .dn-dismiss {
      flex-shrink:0; border:none; background:transparent; cursor:pointer;
      color:var(--sc-text-muted); font-size:1.3em; line-height:1; padding:0 4px;
    }
    .delegate-notice .dn-dismiss:hover { color:var(--sc-text-primary); }

    .virt-row { display:flex; align-items:center; gap:8px; padding:4px 8px; border-radius:7px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.03); }

    .virt-lbl { font-size:11px; color:var(--sc-text-muted); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .virt-val { font-size:12px; color:var(--sc-text-primary); font-weight:500; max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-transform:capitalize; }

    .virt-select, .virt-num { display:flex; align-items:center; gap:3px; }

    .virt-arr { background:none; border:none; color:var(--sc-text-secondary); cursor:pointer; font-size:15px; padding:0 3px; line-height:1; border-radius:4px; transition:color .12s; }

    .virt-arr:hover { color:var(--sc-accent); }

    .virt-btn { background:color-mix(in srgb,var(--sc-accent) 12%,transparent); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); color:var(--sc-accent); font-size:11px; font-weight:600; padding:3px 10px; border-radius:6px; cursor:pointer; transition:all .15s; width:100%; text-align:left; }

    .virt-btn:hover { background:color-mix(in srgb,var(--sc-accent) 22%,transparent); }


    .power-bar { position:absolute; bottom:0;left:0;right:0; height:3px; background:rgba(255,255,255,.06); border-radius:0 0 var(--tile-radius) var(--tile-radius); overflow:hidden; }

    .power-bar-fill { height:100%; background:linear-gradient(90deg,var(--sc-accent),#f97316); border-radius:inherit; transition:width .4s; }


    /* ── Expanded panel ── */
    .expanded { margin-top:10px; border-top:1px solid color-mix(in srgb,var(--sc-accent) 25%,transparent); padding-top:12px; display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start; animation:slide-in .2s ease; }

    .exp-section { flex:1; min-width:140px; }

    .exp-section--full { flex:1 1 100%; min-width:0; }

    .exp-label { font-size:.68em; text-transform:uppercase; letter-spacing:.08em; color:var(--sc-text-muted); margin-bottom:7px; font-weight:600; }

    .exp-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:3px 0; }

    .exp-name { font-size:.84em; color:var(--sc-text-detail); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40%; }

    .sensor-row { display:flex; flex-wrap:wrap; gap:6px; }

    .sensor-chip { display:flex; align-items:center; gap:5px; background:var(--sc-sensor-bg); border-radius:20px; padding:4px 10px; white-space:nowrap; }

    .sensor-label { font-size:var(--fs-xs); letter-spacing:.02em; color:var(--sc-text-muted); }

    .sensor-value { font-size:calc(var(--sc-text-scale,1) * .85em); font-weight:600; color:var(--sc-text-value); font-variant-numeric:tabular-nums; }

    .sensor-value.warn { color:var(--error-color,#ef4444); }

    .expanded-graph-header { display:flex; justify-content:flex-end; padding:0 0 4px; }

    .spark-refresh-all { background:none; border:1px solid rgba(255,255,255,.12); border-radius:6px; color:var(--sc-text-muted); font-size:.75em; cursor:pointer; padding:3px 10px; transition:color .15s,border-color .15s; }

    .spark-refresh-all:hover { color:var(--sc-accent); border-color:var(--sc-accent); }


    /* ── Entity list ── */
    .ent-list-header { display:flex; align-items:center; justify-content:space-between; cursor:pointer; user-select:none; padding:4px 0; }

    .ent-caret { font-size:.65em; color:var(--sc-text-muted); transition:transform .2s; flex-shrink:0; }

    .ent-caret.open { transform:rotate(180deg); }

    .ent-list { display:flex; flex-direction:column; gap:2px; margin-top:6px; }

    .ent-row { display:flex; align-items:center; gap:6px; padding:4px 6px; border-radius:6px; background:var(--sc-tile-bg); min-height:28px; }

    .ent-domain { font-size:var(--fs-xs); font-weight:600; letter-spacing:.02em; min-width:72px; flex-shrink:0; color:var(--sc-text-muted); }

    .ent-name { font-size:.82em; color:var(--sc-text-detail); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .ent-state { font-size:.78em; color:var(--sc-text-secondary); font-family:monospace; white-space:nowrap; flex-shrink:0; }


    /* ── Sparklines ── */
    .sparklines-block { display:flex; flex-direction:column; gap:4px; padding:4px 8px 2px; }

    .sparklines-block.exp { padding:6px 8px 4px; gap:8px; }

    .spark-group { display:flex; flex-direction:column; gap:0; }

    .spark-row { display:flex; align-items:center; gap:6px; min-height:32px; }

    .spark-lbl { font-size:var(--fs-xs); font-weight:600; letter-spacing:.02em; color:var(--sc-text-muted); width:68px; flex-shrink:0; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .spark-svg-wrap { flex:1; position:relative; min-width:0; }

    .sparkline-svg { width:100%; height:32px; display:block; overflow:visible; cursor:crosshair; }

    .sparkline-svg.exp { height:48px; }

    .spark-tick { stroke:rgba(255,255,255,.2); stroke-width:.5; stroke-dasharray:3 3; pointer-events:none; }

    .spark-crosshair { stroke:rgba(255,255,255,.35); stroke-width:.6; stroke-dasharray:2 2; pointer-events:none; }

    .spark-hover-dot { fill:var(--sc-graph-line); stroke:var(--sc-card-bg,#1e1e2e); stroke-width:1.5; pointer-events:none; }

    .spark-tooltip {
      position:absolute; bottom:calc(100% + 4px); transform:translateX(-50%);
      background:rgba(14,14,28,.92); border:1px solid rgba(255,255,255,.12); border-radius:6px;
      padding:4px 8px; pointer-events:none; white-space:nowrap; z-index:20;
      display:flex; flex-direction:column; align-items:center; gap:1px;
    }

    .spark-tooltip-val  { font-size:.78em; font-weight:700; color:var(--sc-graph-line); }

    .spark-tooltip-time { font-size:.65em; color:var(--sc-text-muted); }

    .spark-val { font-size:.75em; font-weight:600; color:var(--sc-text-secondary); white-space:nowrap; min-width:44px; text-align:right; }

    .spark-time-row { display:flex; align-items:center; gap:6px; padding-bottom:1px; }

    .spark-time-spacer { width:68px; flex-shrink:0; }

    .spark-time-labels { flex:1; display:flex; justify-content:space-between; font-size:.62em; color:var(--sc-text-muted); opacity:.65; user-select:none; }

    .spark-time-end { min-width:44px; }

    .spark-no-data { flex:1; font-size:.7em; color:var(--sc-text-muted); opacity:.6; display:flex; align-items:center; padding-left:4px; }

    .spark-retry { background:none; border:none; color:var(--sc-text-muted); font-size:1em; cursor:pointer; padding:0 4px; opacity:.6; }

    .spark-retry:hover { opacity:1; color:var(--sc-accent); }

    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    .sparkline-loading { flex:1; height:32px; border-radius:4px;
      background:linear-gradient(90deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.03) 100%);
      background-size:200% 100%; animation:shimmer 1.6s ease-in-out infinite; }

    .sparkline-loading.exp { height:48px; }


    /* ── RGBW white + effects ── */
    .tile-white-row { margin-top:2px; }

    .dim-white-lbl { font-size:.6em; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); width:14px; flex-shrink:0; text-align:center; }

    .white-slider { accent-color:#e5e7eb; }

    .tile-effects { display:flex; flex-wrap:wrap; gap:4px; padding:4px 8px 2px; }

    .effect-btn { padding:4px 11px; border-radius:12px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:var(--sc-text-secondary); font-size:10px; cursor:pointer; transition:all .15s; white-space:nowrap; min-height:24px; }

    .effect-btn:hover { background:var(--sc-hover-bg); color:var(--sc-text-primary); }

    .effect-btn.active { background:color-mix(in srgb,var(--sc-accent) 25%,transparent); border-color:color-mix(in srgb,var(--sc-accent) 50%,transparent); color:var(--sc-accent); }


    .spark-row-clickable { cursor:pointer; border-radius:6px; transition:background .15s; }

    .spark-row-clickable:hover { background:rgba(255,255,255,.05); }


    /* ── Relay channels ── */
    .relay-channels { display:flex; flex-direction:column; gap:4px; padding:2px 8px 4px; }

    .relay-ch-row { display:flex; align-items:center; gap:8px; padding:3px 0; }

    .relay-ch-dot { width:7px; height:7px; border-radius:50%; background:var(--sc-offline-dot); flex-shrink:0; transition:background .15s; }

    .relay-ch-dot.on { background:var(--sc-online-color); }

    .relay-ch-name { flex:1; font-size:12px; color:var(--sc-text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* ── Favourites section ───────────────────────────────── */
    .fav-section {
      position:relative; overflow:hidden; margin:6px 10px 2px;
      border:1px solid var(--sc-tile-border); border-radius:10px;
    }

    .fav-header {
      display:flex; align-items:center; gap:8px;
      background:rgba(255,255,255,0.04);
      padding:8px 14px; border-radius:10px 10px 0 0;
      border-bottom:1px solid var(--sc-tile-border);
    }

    .fav-star {
      font-size:13px; color:var(--sc-accent); flex-shrink:0;
      filter:drop-shadow(0 0 4px color-mix(in srgb,var(--sc-accent) 60%,transparent));
    }

    .fav-label {
      font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700);
      text-transform:var(--sc-text-transform,uppercase); letter-spacing:0.08em;
      color:var(--sc-accent); flex:1;
    }

    .fav-chips { display:flex; align-items:center; gap:6px; }

    .fav-chip {
      font-size:0.72em; font-weight:600; padding:2px 8px; border-radius:12px;
    }

    .fav-chip-count {
      background:rgba(255,255,255,0.06); color:var(--sc-text-muted);
      border:1px solid rgba(255,255,255,0.08);
    }

    .fav-chip-power {
      background:color-mix(in srgb,var(--sc-accent) 18%,transparent);
      color:var(--sc-power-color);
      border:1px solid color-mix(in srgb,var(--sc-accent) 28%,transparent);
    }

    .fav-grid { padding:4px 12px 14px; }


    /* Tile wrapper — stacks the room label above the tile */
    .fav-tile-wrap { display:flex; flex-direction:column; gap:3px; }


    /* Room label — rendered above the device name in each favourite tile */
    .tile-room-badge {
      align-self:flex-start;
      font-size:8px; font-weight:700; letter-spacing:0.06em;
      text-transform:var(--sc-text-transform,uppercase);
      padding:2px 6px; border-radius:4px;
      background:color-mix(in srgb,var(--sc-accent) 20%,rgba(0,0,0,0.5));
      color:var(--sc-accent);
      border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent);
      pointer-events:none;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;
    }


    /* ── Ambient effects gate ──────────────────────────────────────
       Applied when config.effects is off (the default). Disables purely
       decorative motion/glow; functional cues (alert blink, fan spin,
       explicit per-device icon animations) stay live. */
    .no-fx .dot.online { animation:none; box-shadow:none; }

    .no-fx .tile-icon-relay.on { animation:none; filter:none; }

    .no-fx .stat, .no-fx .cloud-chip { backdrop-filter:none; }

    .no-fx .tile:hover { transform:none; box-shadow:none; }
`;
