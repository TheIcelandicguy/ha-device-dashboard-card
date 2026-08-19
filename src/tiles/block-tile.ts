import { html, nothing, TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { renderAnimSvg } from '../anim-icons';
import { formatPower, getIntegrationLabel, isPrivateIp, delegatableEntities, DELEGATE_FEATURES } from '../helpers';
import type { EntityAnimationType, TileBlockId, HassAttrs } from '../types';
import type { TileCtx, SensorChip } from './tile-context';
import { renderInputAction } from './tile-parts';

/** Default block-based tile renderer — dispatches to per-block sub-renderers. */
export function renderBlockTile(ctx: TileCtx, blockId: TileBlockId): TemplateResult {
  const { device, profile, config, hass, online } = ctx;
  const sw = ctx.getPrimarySwitch(device);
  const trv = ctx.getTrv(device);
  const cover = ctx.getCover(device);
  const valve = ctx.getValve(device);
  const alerts = ctx.getAlerts(device);
  const fw = ctx.getFirmware(device);
  const power = ctx.getPower(device);
  const sensors = ctx.getSensors(device);
  const inputs = ctx.getInputChannels(device);
  const isOn = sw?.isOn ?? false;
  const isDimmable = sw?.brightness !== undefined;
  const bPct = sw && isDimmable && isOn ? Math.max(1, sw.brightness ?? 1) : 0;
  const hasColor = !!sw?.colorModes?.length;
  const hexColor = sw?.rgbColor ? ctx.rgbToHex(...sw.rgbColor) : '#ffffff';
  const isRgbw = !!sw?.colorModes?.some(m => m === 'rgbw' || m === 'rgbww');
  const isHeating = trv?.hvacMode === 'heat';
  const genLabel = profile.gen === 'ble' ? 'BLE' : profile.gen === 'other' ? '' : `G${profile.gen}`;
  const intLabel = getIntegrationLabel(device.integration);

  switch (blockId) {

    case 'name_row': {
      const devSt = config.device_styles?.[device.device_id];
      const tileIconType = isOn
        ? devSt?.tile_icon
        : (devSt?.tile_icon_off ?? devSt?.tile_icon);
      let tileIcon: TemplateResult;
      if (tileIconType) {
        tileIcon = renderAnimSvg(tileIconType as EntityAnimationType, isOn, `--ent-spd:${devSt?.tile_icon_speed ?? 1}`, 'tile-icon');
      } else if (valve) {
        const pos = valve.position ?? (valve.state === 'open' ? 100 : 0);
        const valveIconType: EntityAnimationType | undefined =
          pos > 66 ? 'water2' :
          pos > 33 ? 'water3' :
          pos > 0  ? 'water'  :
          undefined;
        tileIcon = valveIconType
          ? renderAnimSvg(valveIconType, true, '--ent-spd:1', 'tile-icon')
          : html``;
      } else if (trv) {
        const heating = trv.hvacAction === 'heating';
        const pos = trv.valvePosition;
        const trvIconType: EntityAnimationType | undefined = heating
          ? (pos != null
              ? (pos > 66 ? 'flame3' :
                 pos > 33 ? 'flame2' :
                 'flame')
              : 'flame')
          : undefined;
        tileIcon = trvIconType
          ? renderAnimSvg(trvIconType, true, '--ent-spd:1', 'tile-icon')
          : html``;
      } else {
        tileIcon = html``;
      }
      const swAnimIcon = sw ? ctx.renderEntityAnim(sw.entityId, isOn, device.device_id) : html``;
      return html`
        <div class="tile-top">
          <div class="tile-left tile-trigger">
            <span class="dot ${online ? 'online' : 'offline'}"></span>
            ${tileIcon}
            ${swAnimIcon}
            <span class="tile-name">${device.name}</span>
            ${fw ? html`<span class="update-dot" title="Firmware update">●</span>` : nothing}
          </div>
          ${cover ? html`
            <div class="cov-btns" @click=${(e: Event) => e.stopPropagation()}>
              <button class="cov-btn" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'open', e)}>▲</button>
              <button class="cov-btn stop" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'stop', e)}>■</button>
              <button class="cov-btn" @click=${(e: Event) => ctx.coverAction(cover.entityId, 'close', e)}>▼</button>
            </div>
          ` : sw ? html`
            <button class="tog ${isOn ? 'on' : 'off'}"
              @click=${(e: Event) => ctx.toggle(sw.entityId, isOn, e)}>
              ${isOn ? 'ON' : 'OFF'}
            </button>
          ` : trv ? html`
            <button class="tog ${isHeating ? 'on' : 'off'}"
              @click=${(e: Event) => ctx.setHvacMode(trv.entityId, isHeating ? 'off' : 'heat', e)}>
              ${isHeating ? 'HEAT' : 'OFF'}
            </button>
          ` : nothing}
        </div>
      `;
    }

    case 'sensors': {
      if (!sensors.length) return html``;
      // Three-tier layout: primary values large and unboxed, electrical readings
      // as one compound strip per channel, diagnostics in a single muted line.
      const primary = sensors.filter(s => (s.tier ?? 'primary') === 'primary');
      const elec    = sensors.filter(s => s.tier === 'electrical');
      const diag    = sensors.filter(s => s.tier === 'diag');
      // Primary values carry their unit; a short label is kept only where the
      // unit alone is ambiguous (%, ppm) or for alert states.
      const LABELED = new Set(['humidity', 'battery', 'gas', 'co2', 'door', 'motion', 'flood', 'smoke', 'vibration', 'overtemp', 'overpower']);
      const elecByCh = new Map<string, typeof elec>();
      for (const s of elec) {
        const k = s.ch ?? '';
        if (!elecByCh.has(k)) elecByCh.set(k, []);
        elecByCh.get(k)!.push(s);
      }
      const connVal = (s: SensorChip) =>
        (s.key === 'cloud' || s.key === 'mqtt' || s.key === 'eth')
          ? `${s.label} ${s.value === 'Connected' ? '✓' : '✗'}`
          : `${s.label} ${s.value}`;
      return html`
        ${primary.length ? html`
          <div class="tile-stats">
            ${primary.map(s => html`
              <span class="stat-item ${s.warn ? 'warn' : ''}">
                ${s.ch ? html`<span class="stat-lbl">${s.ch}</span>` : nothing}
                ${!s.ch && s.key && LABELED.has(s.key) ? html`<span class="stat-lbl">${s.label}</span>` : nothing}
                ${s.value}
              </span>`)}
          </div>` : nothing}
        ${elec.length ? html`
          <div class="tile-elec-wrap">
            ${[...elecByCh.entries()].map(([chLbl, items]) => html`
              <div class="tile-elec">
                ${chLbl ? html`<span class="stat-lbl">${chLbl}</span>` : nothing}
                ${items.map((s, i) => html`${i > 0 ? html`<span class="sep">·</span>` : nothing}${s.key === 'power_factor' ? `PF ${s.value}` : s.value}`)}
              </div>`)}
          </div>` : nothing}
        ${diag.length ? html`
          <div class="tile-diag" title=${diag.map(s => `${s.label}: ${s.value}`).join('  ·  ')}>
            ${diag.map((s, i) => html`${i > 0 ? html`<span class="sep">·</span>` : nothing}<span class="${s.warn ? 'warn' : ''}">${connVal(s)}</span>`)}
          </div>` : nothing}
      `;
    }

    case 'graph':
      return ctx.renderSparklines(device);

    case 'dimmer': {
      const swState = sw ? hass.states[sw.entityId] : null;
      const effectList: string[] = (swState?.attributes as HassAttrs)?.effect_list ?? [];
      const currentEffect: string | null = (swState?.attributes as HassAttrs)?.effect ?? null;
      const whiteVal = sw?.whiteValue ?? 0;
      return sw && isDimmable ? html`
        <div class="tile-dim-row" @click=${(e: Event) => e.stopPropagation()}>
          ${hasColor ? html`
            <input type="color" class="color-swatch tile-color-swatch" .value=${hexColor}
              ?disabled=${!isOn}
              @change=${(e: Event) => { e.stopPropagation(); ctx.setColor(sw.entityId, (e.target as HTMLInputElement).value, whiteVal, isRgbw); }}/>
          ` : nothing}
          <input type="range" class="dim-slider" min="1" max="100"
            style=${styleMap(hasColor ? { accentColor: hexColor } : {})}
            .value=${String(isOn ? Math.max(1, sw.brightness ?? 1) : 1)}
            ?disabled=${!isOn}
            @input=${(e: Event) => {
              const pct = (e.target as HTMLInputElement).closest('.tile-dim-row')?.querySelector('.dim-pct');
              if (pct) pct.textContent = `${(e.target as HTMLInputElement).value}%`;
            }}
            @change=${(e: Event) => { ctx.setBrightness(sw.entityId, parseInt((e.target as HTMLInputElement).value, 10)); }}/>
          <span class="dim-pct">${bPct}%</span>
        </div>
        ${isRgbw ? html`
          <div class="tile-dim-row tile-white-row" @click=${(e: Event) => e.stopPropagation()}>
            <span class="dim-white-lbl">W</span>
            <input type="range" class="dim-slider white-slider" min="0" max="255"
              .value=${String(whiteVal)}
              @input=${(e: Event) => {
                const el = (e.target as HTMLInputElement).closest('.tile-white-row')?.querySelector('.white-pct');
                if (el) el.textContent = (e.target as HTMLInputElement).value;
              }}
              @change=${(e: Event) => {
                const w = parseInt((e.target as HTMLInputElement).value, 10);
                ctx.setColor(sw.entityId, hexColor, w, true);
              }}/>
            <span class="white-pct dim-pct">${whiteVal}</span>
          </div>
        ` : nothing}
        ${effectList.length > 1 ? html`
          <div class="tile-effects" @click=${(e: Event) => e.stopPropagation()}>
            ${effectList.filter(fx => fx !== 'Off').map(fx => html`
              <button class="effect-btn ${currentEffect === fx ? 'active' : ''}"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  const isActive = currentEffect === fx;
                  hass.callService('light', 'turn_on', { entity_id: sw.entityId, effect: isActive ? 'Off' : fx });
                }}>
                ${fx}
              </button>`)}
          </div>
        ` : nothing}
      ` : html``;
    }

    case 'cover_controls':
      return cover ? html`
        <div class="cov-pos-row" @click=${(e: Event) => e.stopPropagation()}>
          <div class="cov-bar">
            <div class="cov-fill" style="width:${cover.position ?? (cover.state === 'open' ? 100 : 0)}%"></div>
          </div>
          <span class="cov-pct">${cover.position != null ? `${Math.round(cover.position)}%` : cover.state}</span>
        </div>
      ` : html``;

    case 'trv_control': {
      const battEnt = device.entities.find(e => e.domain === 'sensor' &&
        (hass.states[e.entity_id]?.attributes as HassAttrs)?.device_class === 'battery');
      const batteryPct = battEnt != null ? parseFloat(hass.states[battEnt.entity_id]?.state ?? '') || null : null;
      const PRESET_ICONS: Record<string, string> = { comfort: '🏠', eco: '🌿', boost: '🚀', away: '🌙', none: '❄️' };
      return trv ? html`
        <div class="tile-trv-dial" @click=${(e: Event) => e.stopPropagation()}>
          ${ctx.renderTrvDial(trv)}
          <div class="trv-dial-btns">
            <button class="trv-step" @click=${() => ctx.adjustTrvTemp(trv, -1)}>−</button>
            <span class="trv-flame">${trv.hvacAction === 'heating' ? '🔥' : ''}</span>
            <button class="trv-step" @click=${() => ctx.adjustTrvTemp(trv, 1)}>+</button>
          </div>
          <div class="trv-stat-row">
            <div class="trv-stat"><span class="trv-stat-lbl">Now</span><span class="trv-stat-val">${trv.currentTemp != null ? `${trv.currentTemp}°` : '—'}</span></div>
            <div class="trv-stat"><span class="trv-stat-lbl">Set</span><span class="trv-stat-val">${trv.targetTemp != null ? `${trv.targetTemp.toFixed(1)}°` : '—'}</span></div>
            ${trv.valvePosition != null ? html`<div class="trv-stat"><span class="trv-stat-lbl">Valve</span><span class="trv-stat-val">${Math.round(trv.valvePosition)}%</span></div>` : nothing}
            ${batteryPct != null ? html`<div class="trv-stat"><span class="trv-stat-lbl">Batt</span><span class="trv-stat-val">${batteryPct}%</span></div>` : nothing}
          </div>
          ${trv.presetModes.length ? html`
            <div class="trv-presets">
              ${trv.presetModes.map(p => html`
                <button class="trv-preset-btn ${trv.presetMode === p ? 'active' : ''}"
                  @click=${() => ctx.setPresetMode(trv.entityId, p)}>
                  ${(PRESET_ICONS[p] ?? '') + p}
                </button>
              `)}
            </div>
          ` : nothing}
        </div>
      ` : html``;
    }

    case 'input_channels':
      return inputs.length ? html`
        <div class="tile-inputs" @click=${(e: Event) => e.stopPropagation()}>
          ${inputs.map(ch => html`
            <div class="input-row ${ch.isButton ? 'btn-mode' : (ch.isOn ? 'active' : '')}">
              <span class="${ch.isButton ? 'input-btn-dot' : 'input-row-dot'}"></span>
              <span class="input-row-name">${ch.label}</span>
              <span class="input-row-event">${ch.lastEvent ? ch.lastEvent.replace(/_/g, ' ') : '—'}</span>
              <span class="input-row-time">${ctx.timeAgo(ch.lastChanged)}</span>
              ${renderInputAction(ctx, device, ch)}
            </div>
          `)}
        </div>
      ` : html``;

    case 'virtual_controls': {
      const virtuals = ctx.getVirtualControls(device);
      if (!virtuals.length) return html``;
      return html`
        <div class="tile-virtuals" @click=${(e: Event) => e.stopPropagation()}>
          ${virtuals.map(v => {
            if (v.value === 'unavailable') return nothing;
            if (v.domain === 'select') {
              const opts = v.options ?? [];
              const cur = opts.indexOf(v.value);
              return html`
                <div class="virt-row">
                  <span class="virt-lbl">${v.label}</span>
                  <div class="virt-select">
                    <button class="virt-arr" @click=${() => {
                      const next = opts[(cur - 1 + opts.length) % opts.length];
                      ctx.selectOption(v.entityId, next);
                    }}>‹</button>
                    <span class="virt-val">${v.value.replace(/_/g, ' ')}</span>
                    <button class="virt-arr" @click=${() => {
                      const next = opts[(cur + 1) % opts.length];
                      ctx.selectOption(v.entityId, next);
                    }}>›</button>
                  </div>
                </div>`;
            }
            if (v.domain === 'number') {
              const num = parseFloat(v.value);
              const step = v.step ?? 1;
              const decimals = step < 1 ? String(step).split('.')[1]?.length ?? 1 : 0;
              return html`
                <div class="virt-row">
                  <span class="virt-lbl">${v.label}</span>
                  <div class="virt-num">
                    <button class="virt-arr" @click=${() => ctx.setNumberValue(v.entityId, Math.max(v.min ?? 0, +(num - step).toFixed(decimals)))}>−</button>
                    <span class="virt-val">${isNaN(num) ? v.value : num.toFixed(decimals)}</span>
                    <button class="virt-arr" @click=${() => ctx.setNumberValue(v.entityId, Math.min(v.max ?? 100, +(num + step).toFixed(decimals)))}>+</button>
                  </div>
                </div>`;
            }
            if (v.domain === 'button') {
              return html`
                <div class="virt-row">
                  <button class="virt-btn" @click=${(e: Event) => ctx.pressButton(v.entityId, e)}>${v.label}</button>
                </div>`;
            }
            if (v.domain === 'text') {
              return html`
                <div class="virt-row">
                  <span class="virt-lbl">${v.label}</span>
                  <span class="virt-val">${v.value}</span>
                </div>`;
            }
            if (v.domain === 'switch') {
              return html`
                <div class="virt-row">
                  <span class="virt-lbl">${v.label}</span>
                  <button class="tog sm ${v.isOn ? 'on' : 'off'}"
                    @click=${(e: Event) => ctx.toggle(v.entityId, v.isOn, e)}>
                    ${v.isOn ? 'ON' : 'OFF'}
                  </button>
                </div>`;
            }
            return nothing;
          })}
        </div>`;
    }

    case 'relay_channels': {
      const relayEnts = device.entities.filter(e =>
        e.domain === 'switch' && /_(switch|relay|channel)_\d/.test(e.entity_id)
      );
      if (relayEnts.length <= 1) return html``;
      return html`
        <div class="relay-channels" @click=${(e: Event) => e.stopPropagation()}>
          ${relayEnts.map(e => {
            const s = hass.states[e.entity_id];
            const on = s?.state === 'on';
            const name = (s?.attributes as HassAttrs)?.friendly_name ?? e.entity_id;
            return html`
              <div class="relay-ch-row">
                <span class="relay-ch-dot ${on ? 'on' : ''}"></span>
                ${ctx.renderEntityAnim(e.entity_id, on, device.device_id)}
                <span class="relay-ch-name">${name}</span>
                <button class="tog sm ${on ? 'on' : 'off'}"
                  @click=${(ev: Event) => ctx.toggle(e.entity_id, on, ev)}>
                  ${on ? 'ON' : 'OFF'}
                </button>
              </div>`;
          })}
        </div>`;
    }

    case 'valve_controls': {
      const vc = ctx.getValve(device);
      return vc ? html`
        <div class="tile-trv-dial" @click=${(e: Event) => e.stopPropagation()}>
          ${ctx.renderValveDial(vc)}
          <div class="valve-dial-btns">
            <button class="valve-btn close" @click=${(e: Event) => ctx.valveAction(vc.entityId, 'close', e)}>Close</button>
            <button class="valve-btn stop" @click=${(e: Event) => ctx.valveAction(vc.entityId, 'stop', e)}>■</button>
            <button class="valve-btn open" @click=${(e: Event) => ctx.valveAction(vc.entityId, 'open', e)}>Open</button>
          </div>
        </div>
      ` : html``;
    }

    case 'delegated_controls': {
      // Native HA controls for long-tail domains our own tiles don't render
      // (lock, media_player, fan, vacuum, …). Opt-in: each embeds a native tile
      // element, so it's off unless delegate_controls is enabled.
      if (!config.delegate_controls) return html``;
      const dels = delegatableEntities(device);
      if (!dels.length) return html``;
      return html`
        <div class="tile-delegated" @click=${(e: Event) => e.stopPropagation()}>
          ${dels.map(e => html`
            <hdd-delegated .hass=${hass} .entity=${e.entity_id} .features=${DELEGATE_FEATURES[e.domain]}></hdd-delegated>
          `)}
        </div>`;
    }

    case 'power_bar':
      return ctx.renderPowerBar(device);

    case 'badges':
      return html`
        <div class="tile-bot">
          ${power != null ? html`<span class="tile-power">${formatPower(power)}</span>` : nothing}
          <div class="tile-badges">
            ${alerts.map(a => html`<span class="alert-badge alert-${a}">${a === 'overtemp' ? '🌡' : '⚡'}!</span>`)}
            ${profile.label ? html`<span class="type-badge type-${profile.type}">${profile.label}</span>` : nothing}
            ${genLabel ? html`<span class="gen-badge gen-${profile.gen}">${genLabel}</span>` : nothing}
            ${intLabel ? html`<span class="int-badge-tile">${intLabel}</span>` : nothing}
            ${device.isShelly && device.ip && isPrivateIp(device.ip) ? html`
              <a href="http://${device.ip}" target="_blank" class="tile-ui-link"
                @click=${(e: Event) => e.stopPropagation()}>↗</a>
            ` : nothing}
          </div>
        </div>
      `;

    default:
      return html``;
  }
}
