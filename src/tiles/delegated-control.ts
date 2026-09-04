import { LitElement, css, html, PropertyValues, nothing } from 'lit';
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
 * normal card config. Used to embed the user's own cards into the dashboard
 * (header/footer/per-room). Unlike hdd-delegated it keeps the card's native
 * chrome — it's a real card, not a control inside a tile.
 *
 * It hands the config to Home Assistant's own `<hui-card>` wrapper, which is what
 * a real dashboard view uses. That matters: `hui-card` evaluates the card's
 * `visibility:` conditions, applies its grid options and knows about preview
 * mode. This used to call `createCardElement` — the low-level factory *under*
 * that wrapper — so an embedded card with `visibility:` set validated fine and
 * then always showed, silently dropping a Lovelace feature.
 *
 * `createCardElement` stays as the fallback for a Home Assistant old enough not
 * to define `hui-card`.
 */
@customElement('hdd-card')
export class HddCard extends LitElement {
  @property({ attribute: false }) hass?: unknown;
  @property({ attribute: false }) config?: unknown;
  /** True when the host card is HA's edit-dialog live preview, so an embedded
   *  card can render its edit-mode affordances instead of acting live. */
  @property({ type: Boolean }) preview = false;

  /** Fallback path only: the element built by createCardElement. */
  @state() private _el?: HTMLElement;
  /** null = still deciding, true = HA's wrapper is available. */
  @state() private _hui: boolean | null = null;
  private _builtKey = '';

  static styles = css`
    :host { display: block; }
    /* An author :host rule beats the UA's [hidden] rule, so the host needs to
       opt back out explicitly — see _mirrorHidden. */
    :host([hidden]) { display: none; }
    :host > * { width: 100%; }
    /* hui-card carries no display of its own. When a visibility condition fails
       it hides itself with an INLINE display:none, and an inline style beats a
       stylesheet rule, so setting block here cannot defeat the hiding. */
    hui-card { display: block; }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    if (this._hui === null) void this._resolveWrapper();
  }

  /** `hui-card` ships with the rest of Lovelace and is lazy-loaded, so on a cold
   *  load it can be undefined for a moment. Wait for the card helpers (which pull
   *  the same bundle) before settling on the fallback. */
  private async _resolveWrapper(): Promise<void> {
    if (customElements.get('hui-card')) { this._hui = true; return; }
    try {
      const loader = (window as unknown as { loadCardHelpers?: () => Promise<unknown> }).loadCardHelpers;
      if (loader) await loader();
    } catch { /* settle on whatever is defined */ }
    this._hui = !!customElements.get('hui-card');
  }

  protected willUpdate(_changed: PropertyValues) {
    if (this._hui !== false) return;   // wrapper path needs no hand-built element
    const key = this.config ? JSON.stringify(this.config) : '';
    if (key && key !== this._builtKey) void this._build(key);
  }

  protected updated() {
    if (this._hui === false) {
      if (this._el && this.hass) (this._el as unknown as { hass: unknown }).hass = this.hass;
      return;
    }
    void this._mirrorHidden();
  }

  /**
   * `hui-card` hides ITSELF when a visibility condition fails, which leaves this
   * host as an empty grid item — and the strip's gap around it, so a hidden card
   * still shows as a blank slot. Mirror the state onto the host so it leaves the
   * layout entirely. Waiting on the wrapper's own update first: its visibility
   * pass runs on its update, not ours.
   */
  private async _mirrorHidden(): Promise<void> {
    const inner = this.renderRoot.querySelector('hui-card') as
      (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
    if (!inner) return;
    try { await inner.updateComplete; } catch { /* mirror whatever it settled on */ }
    this.hidden = !!inner.hidden;
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
    if (this._hui === null) return nothing;   // one frame, while we decide
    if (this._hui) {
      return this.config
        ? html`<hui-card .hass=${this.hass} .config=${this.config} .preview=${this.preview}></hui-card>`
        : nothing;
    }
    return this._el ?? nothing;
  }
}
