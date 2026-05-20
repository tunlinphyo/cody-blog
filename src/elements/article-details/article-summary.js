import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-summary.css?inline";
import { HostSizeAnimation } from "./animation.js";
import { litStaticStyles } from "../utils.js";

export class ArticleSummary extends LitElement {
  static properties = {
    summaryTitle: { type: String, attribute: 'summary-title' },
    index: { type: Number },
    open: { type: Boolean, attribute: "open", reflect: true },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  #hostSizeAnimation;

  constructor() {
    super();
    this.summaryTitle = "";
    this.#hostSizeAnimation = new HostSizeAnimation(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#hostSizeAnimation.cancel();
  }

  firstUpdated() {
    this.#hostSizeAnimation.saveHostBounds();
  }

  updated(changedProperties) {
    if (changedProperties.has("open")) {
      this.#hostSizeAnimation.animateHostSizeChange();
      return;
    }

    this.#hostSizeAnimation.saveHostBounds();
  }

  handleOpenClick = () => {
    this.dispatchEvent(new CustomEvent("article-summary-open", {
      detail: { index: this.index },
      bubbles: true,
      composed: true,
    }));
  };

  render() {
    return html`
      <button type="button" class="opener" @click=${this.handleOpenClick}>
        <svg viewBox="0 0 24 24" width="22" height="22">
          <g stroke="currentColor" stroke-width="1.6" fill="none">
            <circle cx="12" cy="12" r="10" stroke-width="1.4" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="12" y1="7" x2="12" y2="17" />
          </g>
        </svg>
        ${this.summaryTitle}
      </button>
      <div class="details">
        <slot></slot>
      </div>
    `
  }
}

if (!customElements.get("article-summary")) {
  customElements.define("article-summary", ArticleSummary);
}
