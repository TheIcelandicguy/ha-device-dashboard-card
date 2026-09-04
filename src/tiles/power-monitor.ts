import { html, svg, nothing, TemplateResult } from 'lit';
import { formatPower, formatEnergy, formatUptime, gaugeRings } from '../helpers';
import type { PowerMonitorVariant } from '../types';
import type { TileCtx } from './tile-context';
import { renderNameDot, chipsInHeader } from './tile-parts';

export function renderPowerMonitorTile(ctx: TileCtx, variant: PowerMonitorVariant): TemplateResult {
  switch (variant) {
    case 'gauge':    return renderPMGauge(ctx);
    case 'graph':    return renderPMGraph(ctx);
    case 'compact':  return renderPMCompact(ctx);
    case 'table':    return renderPMTable(ctx);
    default:         return renderPMBigNumber(ctx);
  }
}

type PMSensors = ReturnType<TileCtx['tileSensors']>;

/** The shared lower body under a variant. The style's 'graph' element means
 *  "graphs on this tile" — it hides the companion sensor rows as well as the
 *  variant's own spark, so it is not a dead toggle on Gauge and Compact, which
 *  have no spark of their own. A variant that draws its own power spark passes
 *  `skipPowerGraph` so power is not drawn twice. */
function lowerBody(ctx: TileCtx, opts: { skipPowerGraph?: boolean } = {}): TemplateResult | typeof nothing {
  if (!ctx.showEl('lower_body')) return nothing;
  return ctx.renderTileLowerBody(ctx.device, ctx.profile, { ...opts, skipGraphs: !ctx.showEl('graph') });
}

/** The secondary readings as one chip strip — shared by every placement. The
 *  energy chip carries the period-aware label (Energy today / this week …) as
 *  a tooltip: the strip has no room for the table variant's row label, but the
 *  period context must not silently vanish when the chips replace that row. */
function pmChips(s: PMSensors, cls = 'ts-chips'): TemplateResult {
  return html`<div class="${cls}">
    ${s.voltage != null ? html`<span class="ts-chip">${s.voltage.toFixed(1)} V</span>` : nothing}
    ${s.current != null ? html`<span class="ts-chip">${s.current.toFixed(2)} A</span>` : nothing}
    ${s.energy  != null ? html`<span class="ts-chip" title="${s.energyLabel ?? 'Energy'}">${s.energy.toFixed(2)} kWh</span>` : nothing}
    ${s.temp    != null ? html`<span class="ts-chip">${s.temp.toFixed(1)} °C</span>` : nothing}
    ${s.rssi    != null ? html`<span class="ts-chip">${s.rssi} dBm</span>` : nothing}
  </div>`;
}

function renderPMBigNumber(ctx: TileCtx): TemplateResult {
  const { device, isOn, accent, online, config } = ctx;
  const s = ctx.tileSensors(device);
  const sw = ctx.getPrimarySwitch(device);
  const sparks = ctx.getPowerSparks(device);
  const hdrChips = chipsInHeader(ctx);
  ctx.ensureGraphData(device);
  const W = 200, H = 32, pad = 2;
  const lw = config.graph_style?.line_width ?? 1.5;
  const lineColor = isOn ? accent : 'var(--sc-text-muted)';
  const sparkSvg = sparks.length > 1 ? (() => {
    // Scale off the history only: the appended live point is an instantaneous
    // reading against 5-minute means, and letting it set the range flattens
    // the whole series exactly when a load spikes.
    const hist = sparks.filter(p => !p.live).map(p => p.v);
    const psr = config.graph_style?.sensor_ranges?.['power'] ?? {};
    const mn = psr.min ?? Math.min(...hist), mx = psr.max ?? Math.max(...hist), rng = mx - mn || 1;
    const coords = sparks.map((p, i) => `${((i / (sparks.length - 1)) * W).toFixed(1)},${(H - pad - ((p.v - mn) / rng) * (H - pad * 2)).toFixed(1)}`).join(' ');
    const gId = `pm-bn-${device.device_id.replace(/\W/g, '')}`;
    return svg`<defs><linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${coords} ${W},${H - pad} 0,${H - pad}" fill="url(#${gId})"/>
    <polyline points="${coords}" fill="none" stroke="${lineColor}" stroke-width="${lw}" stroke-linecap="round"/>`;
  })() : nothing;
  return html`
    <div class="ts-hero" style="--ts-accent:${accent}">
      <div class="ts-hero-bar" style="background:${isOn ? accent : 'var(--sc-tile-border)'}"></div>
      <div class="ts-hero-top">
        ${sw && ctx.showEl('toggle') ? html`<button class="tog ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
        ${renderNameDot(device, online, 'ts-hero-name')}
        ${hdrChips ? pmChips(s, 'ts-chips ts-chips-hdr') : nothing}
      </div>
      <div class="ts-hero-num" style="color:${isOn ? accent : 'var(--sc-text-muted)'}">${s.power != null ? s.power.toFixed(s.power < 10 ? 1 : 0) : '—'}</div>
      <div class="ts-hero-unit">watts · ${isOn ? 'active' : 'idle'}</div>
      ${ctx.showEl('graph') ? html`<div class="ts-hero-spark"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:${H}px;display:block">${sparkSvg}</svg></div>` : nothing}
      <div class="ts-hero-foot">
        ${!hdrChips && ctx.showEl('secondary') ? pmChips(s) : nothing}
        ${ctx.showEl('uptime') ? html`<span class="ts-uptime">${s.uptime ? formatUptime(s.uptime) : ''}</span>` : nothing}
      </div>
      ${lowerBody(ctx, { skipPowerGraph: true })}
    </div>`;
}

function renderPMGauge(ctx: TileCtx): TemplateResult {
  const { device, isOn, accent, online, config } = ctx;
  const s = ctx.tileSensors(device);
  const sw = ctx.getPrimarySwitch(device);
  // One arc per sensor class the device reports — a relay gets W/V/A/°C, a
  // Wall Display gets °C/%/lx — rather than a fixed electrical set that left a
  // sensor device with one arc and no humidity.
  const rings = gaugeRings(ctx.sensorValues(device), {
    ranges: config.graph_style?.sensor_ranges,
    colors: config.graph_sensor_colors,
    gradients: config.graph_style?.gauge_gradients,
    accent,
  });
  const gradId = (key: string) => `pm-gg-${device.device_id.replace(/\W/g, '')}-${key}`;
  // The relay being off dims the electrical arcs (they read 0 anyway); the
  // room's temperature and humidity are not "off" and keep full strength.
  const ELECTRICAL = new Set(['power', 'voltage', 'current']);

  const CX = 110, CY = 110, sweepDeg = 180, startDeg = 180;
  const ringStep = 22;
  const outerR = 102;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const arcPath = (r: number, pct: number) => {
    const end = startDeg + sweepDeg * Math.min(1, Math.max(0, pct));
    const sx = CX + r * Math.cos(toRad(startDeg)), sy = CY + r * Math.sin(toRad(startDeg));
    const ex = CX + r * Math.cos(toRad(end)),      ey = CY + r * Math.sin(toRad(end));
    const large = sweepDeg * pct > 180 ? 1 : 0;
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  };

  const fmtVal = (v: number, key: string, digits: number): string =>
    key === 'power' && v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(digits);

  // Each value sits centred just under the crown of its own arc, in the band
  // between that arc and the next one in — outer arc, its value, middle arc,
  // its value, inner arc, its value. The band is ringStep wide and the text is
  // 8 tall, so it fits below the stroke without touching the next arc.
  const STROKE = 7;
  const svgH = CY + 8;

  return html`
    <div class="ts-ring" style="--ts-accent:${accent};align-items:center">
      <div class="ts-ring-top" style="width:100%">
        ${sw && ctx.showEl('toggle') ? html`<button class="tog ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
        ${renderNameDot(device, online, 'ts-ring-name')}
        ${chipsInHeader(ctx) ? pmChips(s, 'ts-chips ts-chips-hdr') : nothing /* gauge has no body chips to stand down */}
      </div>
      ${rings.length ? html`
      <svg viewBox="0 0 ${CX * 2} ${svgH}" style="width:100%;max-width:360px;height:auto;overflow:visible;display:block">
        <defs>
          ${rings.map((ring, i) => {
            if (ring.stops.length < 2) return nothing;
            // userSpaceOnUse, not the default objectBoundingBox: a gradient in
            // bounding-box units is resolved against the PARTIAL value arc, so
            // the drawn arc always ran the full colour range and its tip was
            // always the last stop, whatever the reading. Spanning the ring's
            // own diameter makes the arc's colour at the tip equal the label's.
            // The radius must come from the ring's own index, not a filtered one.
            const r = outerR - i * ringStep;
            return svg`
              <linearGradient id="${gradId(ring.key)}" gradientUnits="userSpaceOnUse"
                x1="${CX - r}" y1="0" x2="${CX + r}" y2="0">
                ${ring.stops.map((c, j) => svg`<stop offset="${(j / (ring.stops.length - 1)) * 100}%" stop-color="${c}"/>`)}
              </linearGradient>`;
          })}
        </defs>
        ${rings.map((ring, i) => {
          const r = outerR - i * ringStep;
          // A gradient runs left → right across the arc's bounding box, which is
          // the direction the arc sweeps, so the empty end wears the first stop
          // and a reading climbing the range walks through the colours.
          const stroke = ring.stops.length > 1 ? `url(#${gradId(ring.key)})` : ring.stops[0];
          // The label is ~36 units wide; on a tight inner arc the curve drops
          // several units across that width, so measure the arc's height at
          // the text's ends (the chord), not at its crown.
          const HALF_TEXT = 18;
          const arcAtEdge = CY - Math.sqrt(Math.max(0, r * r - HALF_TEXT * HALF_TEXT));
          const vy = (arcAtEdge + STROKE / 2 + 1.5).toFixed(1);
          const lit = isOn || !ELECTRICAL.has(ring.key);
          return svg`
            <path d="${arcPath(r, 1)}"        fill="none" stroke="${stroke}" stroke-width="${STROKE}" stroke-linecap="round" opacity="0.12"/>
            <path d="${arcPath(r, ring.pct)}" fill="none" stroke="${stroke}" stroke-width="${STROKE}" stroke-linecap="round" opacity="${lit ? '0.9' : '0.3'}"/>
            <text x="${CX}" y="${vy}" font-size="8" fill="${ring.color}" text-anchor="middle" dominant-baseline="hanging" font-family="monospace" font-weight="700" opacity="${lit ? 0.95 : 0.5}">${fmtVal(ring.val, ring.key, ring.digits)} ${ring.label}</text>`;
        })}
      </svg>` : html`<span style="color:var(--sc-text-muted);font-size:.8em">No readings to gauge</span>`}
      ${lowerBody(ctx)}
    </div>`;
}

function renderPMGraph(ctx: TileCtx): TemplateResult {
  const { device, isOn, accent, online, config } = ctx;
  const s = ctx.tileSensors(device);
  const sw = ctx.getPrimarySwitch(device);
  const hdrChips = chipsInHeader(ctx);
  ctx.ensureGraphData(device);
  const sparks = ctx.getPowerSparks(device);
  const W = 200, H = 48, pad = 3;
  const lw = config.graph_style?.line_width ?? 1.5;
  const lineColor = isOn ? accent : 'var(--sc-text-muted)';
  let peakX = 0, peakY = H - pad;
  const sparkBody = sparks.length > 1 ? (() => {
    const vals = sparks.map(p => p.v);
    // Scale and peak off the history only — the appended live point is an
    // instantaneous reading against 5-minute means (see SparkPoint.live).
    const hist = sparks.filter(p => !p.live).map(p => p.v);
    const psr = config.graph_style?.sensor_ranges?.['power'] ?? {};
    const mn = psr.min ?? Math.min(...hist), mx = psr.max ?? Math.max(...hist), rng = mx - mn || 1;
    const ptX = (_: unknown, i: number) => (i / (sparks.length - 1)) * W;
    const ptY = (v: number) => H - pad - ((v - mn) / rng) * (H - pad * 2);
    const maxIdx = vals.indexOf(mx); peakX = ptX(null, Math.max(0, maxIdx)); peakY = ptY(mx);
    const coords = sparks.map((p, i) => `${ptX(null, i).toFixed(1)},${ptY(p.v).toFixed(1)}`).join(' ');
    const gId = `pm-gr-${device.device_id.replace(/\W/g, '')}`;
    return svg`<defs><linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${coords} ${W},${H - pad} 0,${H - pad}" fill="url(#${gId})"/>
    <polyline points="${coords}" fill="none" stroke="${lineColor}" stroke-width="${lw}" stroke-linecap="round"/>
    ${mx > mn ? svg`<circle cx="${peakX.toFixed(1)}" cy="${peakY.toFixed(1)}" r="3" fill="${lineColor}"/>
      <line x1="${peakX.toFixed(1)}" x2="${peakX.toFixed(1)}" y1="${peakY.toFixed(1)}" y2="${H}" stroke="${lineColor}" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.4"/>` : nothing}`;
  })() : nothing;
  return html`
    <div class="ts-spark" style="--ts-accent:${accent}">
      <div class="ts-spark-top">
        ${sw && ctx.showEl('toggle') ? html`<button class="tog ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
        ${renderNameDot(device, online, 'ts-spark-name')}
        ${hdrChips ? pmChips(s, 'ts-chips ts-chips-hdr') : nothing}
      </div>
      ${ctx.showEl('graph') ? html`<div class="ts-spark-graph"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:${H}px;display:block;overflow:visible">${sparkBody}</svg></div>` : nothing}
      <div class="ts-spark-bottom">
        <div>
          <div class="ts-spark-big" style="color:${isOn ? accent : 'var(--sc-text-muted)'}">${s.power != null ? s.power.toFixed(s.power < 10 ? 1 : 0) : '—'}</div>
          <div class="ts-spark-sub">${isOn ? 'W · now' : 'W · idle'}</div>
        </div>
        ${!hdrChips && ctx.showEl('secondary') ? html`<div class="ts-spark-meta">
          ${s.voltage != null ? html`<div class="ts-spark-mrow">${s.voltage.toFixed(1)} <b>V</b></div>` : nothing}
          ${s.current != null ? html`<div class="ts-spark-mrow">${s.current.toFixed(2)} <b>A</b></div>` : nothing}
          ${s.energy  != null ? html`<div class="ts-spark-mrow">${s.energy.toFixed(2)} <b>kWh</b></div>` : nothing}
          ${s.temp    != null ? html`<div class="ts-spark-mrow">${s.temp.toFixed(1)} <b>°C</b></div>` : nothing}
          ${s.rssi    != null ? html`<div class="ts-spark-mrow">${s.rssi} <b>dBm</b></div>` : nothing}
        </div>` : nothing}
      </div>
      ${lowerBody(ctx, { skipPowerGraph: true })}
    </div>`;
}

function renderPMCompact(ctx: TileCtx): TemplateResult {
  const { device, isOn, accent, online } = ctx;
  const s = ctx.tileSensors(device);
  const sw = ctx.getPrimarySwitch(device);
  const hdrChips = chipsInHeader(ctx);
  // .ts-hbar-main is a block, not a flex row, so the header placement needs
  // its own flex wrapper around name + chips — dropping the strip in as a
  // sibling would give it a full-width line above the big number.
  return html`
    <div class="ts-hbar" style="--ts-accent:${accent}">
      <div class="ts-hbar-top">
        <div class="ts-hbar-left-bar" style="background:${isOn ? accent : 'rgba(255,255,255,0.07)'}"></div>
        <div class="ts-hbar-main">
          ${hdrChips ? html`
            <div class="ts-hbar-namerow">
              ${renderNameDot(device, online, 'ts-hbar-name')}
              ${pmChips(s, 'ts-chips ts-chips-hdr')}
            </div>`
          : renderNameDot(device, online, 'ts-hbar-name')}
          <div class="ts-hbar-num" style="color:${isOn ? accent : 'var(--sc-text-muted)'}">${s.power != null ? s.power.toFixed(s.power < 10 ? 1 : 0) : '—'}</div>
          <div class="ts-hbar-unit">watts</div>
        </div>
        ${!hdrChips && ctx.showEl('secondary') ? html`<div class="ts-hbar-side">
          ${s.voltage != null ? html`<div class="ts-hbar-sstat"><div class="ts-hbar-sk">V</div><div class="ts-hbar-sv">${s.voltage.toFixed(0)}</div></div>` : nothing}
          ${s.current != null ? html`<div class="ts-hbar-sstat"><div class="ts-hbar-sk">A</div><div class="ts-hbar-sv">${s.current.toFixed(2)}</div></div>` : nothing}
          ${s.temp    != null ? html`<div class="ts-hbar-sstat"><div class="ts-hbar-sk">°C</div><div class="ts-hbar-sv">${s.temp.toFixed(1)}</div></div>` : nothing}
          ${s.rssi    != null ? html`<div class="ts-hbar-sstat"><div class="ts-hbar-sk">dBm</div><div class="ts-hbar-sv">${s.rssi}</div></div>` : nothing}
        </div>` : nothing}
      </div>
      <div class="ts-hbar-footer">
        <div style="display:flex;gap:6px;align-items:center">
          ${s.energy != null ? html`<span class="ts-hbar-badge">${s.energy.toFixed(2)} kWh</span>` : nothing}
          ${s.uptime != null && ctx.showEl('uptime') ? html`<span class="ts-hbar-badge">${formatUptime(s.uptime)}</span>` : nothing}
        </div>
        ${sw && ctx.showEl('toggle') ? html`<button class="tog ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
      </div>
      ${lowerBody(ctx)}
    </div>`;
}

function renderPMTable(ctx: TileCtx): TemplateResult {
  const { device, isOn, accent, online, config } = ctx;
  const s = ctx.tileSensors(device);
  const sw = ctx.getPrimarySwitch(device);
  const hdrChips = chipsInHeader(ctx);
  ctx.ensureGraphData(device);
  const sparks = ctx.getPowerSparks(device);
  const W = 200, H = 24, pad = 2;
  const lw = config.graph_style?.line_width ?? 1.5;
  const lineColor = isOn ? accent : 'var(--sc-text-muted)';
  const sparkBody = sparks.length > 1 ? (() => {
    // Scale off the history only (see SparkPoint.live).
    const hist = sparks.filter(p => !p.live).map(p => p.v);
    const psr = config.graph_style?.sensor_ranges?.['power'] ?? {};
    const mn = psr.min ?? Math.min(...hist), mx = psr.max ?? Math.max(...hist), rng = mx - mn || 1;
    const coords = sparks.map((p, i) => `${((i / (sparks.length - 1)) * W).toFixed(1)},${(H - pad - ((p.v - mn) / rng) * (H - pad * 2)).toFixed(1)}`).join(' ');
    const gId = `pm-tbl-${device.device_id.replace(/\W/g, '')}`;
    return svg`<defs><linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${coords} ${W},${H - pad} 0,${H - pad}" fill="url(#${gId})"/>
    <polyline points="${coords}" fill="none" stroke="${lineColor}" stroke-width="${lw}" stroke-linecap="round"/>`;
  })() : nothing;
  const row = (label: string, val: string, hi = false) => html`
    <div class="ts-list-row">
      <span class="ts-list-label">${label}</span>
      <span class="ts-list-val" style="${hi ? `color:${accent}` : ''}">${val}</span>
    </div>`;
  return html`
    <div class="ts-list" style="--ts-accent:${accent}">
      <div class="ts-list-header">
        ${sw && ctx.showEl('toggle') ? html`<button class="tog ${isOn ? 'on' : 'off'}" @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>${isOn ? 'ON' : 'OFF'}</button>` : nothing}
        ${renderNameDot(device, online, 'ts-list-name')}
        ${hdrChips ? pmChips(s, 'ts-chips ts-chips-hdr') : nothing}
      </div>
      ${s.power   != null ? row('Power',   formatPower(s.power),         true) : nothing}
      ${!hdrChips && ctx.showEl('secondary') ? html`
        ${s.voltage != null ? row('Voltage', `${s.voltage.toFixed(1)} V`)       : nothing}
        ${s.current != null ? row('Current', `${s.current.toFixed(3)} A`)       : nothing}
        ${s.energy  != null ? row(s.energyLabel, formatEnergy(s.energy))        : nothing}
        ${s.temp    != null ? row('Temp',    `${s.temp.toFixed(1)} °C`)         : nothing}
        ${s.rssi    != null ? row('WiFi',    `${s.rssi} dBm`)                   : nothing}` : nothing}
      ${s.uptime  != null && ctx.showEl('uptime') ? row('Uptime',  formatUptime(s.uptime)) : nothing}
      ${ctx.showEl('graph') ? html`<div class="ts-list-spark">
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:${H}px;display:block">${sparkBody}</svg>
      </div>` : nothing}
      ${lowerBody(ctx, { skipPowerGraph: true })}
    </div>`;
}
