import { LitElement, css, PropertyValues, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * Renders a native Home Assistant tile-card control for a single entity — the
 * Phase 3 delegation fallback (docs/universal-engine-plan.md). Used only for the
 * "long tail" controllable domains this card does NOT hand-roll: lock, media_player,
 * fan, vacuum, siren, humidifier, water_heater, lawn_mower, alarm_control_panel.
 * Climate / cover / light / switch keep our own custom renderers — delegation never
 * touches them.
 *
 * It lazily builds the native element via the frontend's loadCardHelpers() (the
 * same supported-ish global mini-graph/Mushroom use) and re-pushes `.hass` on every
 * update. The native card chrome is dissolved via CSS vars so it blends into our
 * tile surface instead of looking like a card-in-a-card.
 */
@customElement('hdd-delegated')
export class HddDelegated extends LitElement {
  @property({ attribute: false }) hass?: unknown;
  @property() entity = '';
  @property({ attribute: false }) features?: unknown[];

  @state() private _el?: HTMLElement;
  /** entity the current _el was built for — guards against rebuild loops */
  private _built = '';

  static styles = css`
    :host {
      display: block;
      /* dissolve the native card chrome so the control sits on our tile surface */
      --ha-card-background: transparent;
      --ha-card-border-width: 0;
      --ha-card-box-shadow: none;
      --ha-card-border-radius: 8px;
    }
  `;

  protected willUpdate(_changed: PropertyValues) {
    if (this.entity && this.entity !== this._built) this._build();
  }

  protected updated() {
    // The native element manages its own subtree; it just needs fresh hass.
    if (this._el && this.hass) (this._el as unknown as { hass: unknown }).hass = this.hass;
  }

  private async _build(): Promise<void> {
    const entity = this.entity;
    this._built = entity;
    try {
      const loader = (window as unknown as { loadCardHelpers?: () => Promise<any> }).loadCardHelpers;
      const helpers = loader ? await loader() : undefined;
      // entity changed again while we awaited — abandon this build
      if (!helpers || this.entity !== entity) return;
      const el: HTMLElement = helpers.createCardElement({
        type: 'tile',
        entity,
        features: this.features ?? [],
      });
      if (this.hass) (el as unknown as { hass: unknown }).hass = this.hass;
      this._el = el;
    } catch {
      this._el = undefined;
    }
  }

  protected render() {
    return this._el ?? nothing;
  }
}

/**
 * Renders any Lovelace card (built-in or a HACS custom card the user has) from its
 * normal card config, via loadCardHelpers().createCardElement(). Used to embed the
 * user's own cards into the dashboard (header/footer/per-room). Unlike hdd-delegated
 * it keeps the card's native chrome — it's a real card, not a control inside a tile.
 */
@customElement('hdd-card')
export class HddCard extends LitElement {
  @property({ attribute: false }) hass?: unknown;
  @property({ attribute: false }) config?: unknown;

  @state() private _el?: HTMLElement;
  private _builtKey = '';

  static styles = css`
    :host { display: block; }
    :host > * { width: 100%; }
  `;

  protected willUpdate(_changed: PropertyValues) {
    const key = this.config ? JSON.stringify(this.config) : '';
    if (key && key !== this._builtKey) this._build(key);
  }

  protected updated() {
    if (this._el && this.hass) (this._el as unknown as { hass: unknown }).hass = this.hass;
  }

  private async _build(key: string): Promise<void> {
    this._builtKey = key;
    try {
      const loader = (window as unknown as { loadCardHelpers?: () => Promise<any> }).loadCardHelpers;
      const helpers = loader ? await loader() : undefined;
      // config changed again while awaiting — abandon this build
      if (!helpers || JSON.stringify(this.config) !== key) return;
      const el: HTMLElement = helpers.createCardElement(this.config);
      if (this.hass) (el as unknown as { hass: unknown }).hass = this.hass;
      this._el = el;
    } catch {
      this._el = undefined;
    }
  }

  protected render() {
    return this._el ?? nothing;
  }
}
