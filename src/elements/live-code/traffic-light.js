import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./traffic-light.css?inline";
import { litStaticStyles } from "../utils.js";

export class TrafficLight extends LitElement {
  static properties = {
    uiView: { type: String, attribute: "ui-view" },
    lightType: { type: String, attribute: "light-type" }, // red | yellow | green
    disabled: { type: Boolean, reflect: true }
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  willUpdate(changedProperties) {
    if (changedProperties.has("uiView") || changedProperties.has("lightType")) {
      this.disabled = this.getDisabled()
    }
  }

  constructor() {
    super();
    this.disabled = this.getDisabled()
  }

  render() {
    return html`
      <button part="button" @click=${this.handleClick} .disabled=${this.disabled}>
        ${this.renderSvg()}
        <span screenreader-only>Set ${this.uiView} view</span>
      </button>
    `
  }

  getDisabled() {
    return (
      (this.lightType === "green" && this.uiView === "full")
      || (this.lightType === "yellow" && this.uiView === "mini")
      || (this.lightType === "red" && this.uiView === "closed")
    )
  }

  renderSvg() {
    if (this.lightType === "green") {
      return html`
        <svg part="icon" viewBox="0 0 24 24" width="10" height="10">
          <mask id="fullscreen-mask:001">
            <rect x="0" y="0" width="24" height="24" rx="0" stroke-width="0" fill="white" />
            <polygon points="21 0 24 3 3 24 0 21" fill="black" />
          </mask>
          <rect mask="url(#fullscreen-mask:001)" x="3" y="3" width="18" height="18" rx="2.5" fill="currentColor" />
        </svg>
      `
    }
    if (this.lightType === "yellow") {
      return html`
        <svg part="icon" viewBox="0 0 24 24" width="10" height="10">
          <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
        </svg>
      `
    }

    return html`
      <svg part="icon" viewBox="0 0 24 24" width="10" height="10">
        <g stroke-linecap="round" stroke="currentColor" stroke-width="5">
          <line x1="4" y1="4" x2="20" y2="20" />
          <line x1="20" y1="4" x2="4" y2="20" />
        </g>
      </svg>
    `
  }

  handleClick = () => {
    const states = {
      red: 'closed',
      yellow: 'mini',
      green: 'full',
    }
    this.dispatchEvent(
      new CustomEvent("toggle-view", {
        detail: { state: states[this.lightType] },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (!customElements.get("traffic-light")) {
  customElements.define("traffic-light", TrafficLight);
}
