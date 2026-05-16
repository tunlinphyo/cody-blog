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
        <svg part="icon" viewBox="0 0 24 24" width="10" height="10" xmlns="http://www.w3.org/2000/svg">
          <polygon points="4 4 4 17 17 4" fill="currentColor" />
          <polygon points="7 20 20 7 20 20" fill="currentColor" />
        </svg>
      `
    }
    if (this.lightType === "yellow") {
      return html`
        <svg part="icon" viewBox="0 0 24 24" width="10" height="10" xmlns="http://www.w3.org/2000/svg">
          <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="4" />
        </svg>
      `
    }

    return html`
      <svg part="icon" viewBox="0 0 24 24" width="10" height="10" xmlns="http://www.w3.org/2000/svg">
        <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="4" />
        <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" stroke-width="4" />
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
