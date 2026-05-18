import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./slide-card.css?inline";
import { litStaticStyles } from "../utils.js";

export class HeroCard extends LitElement {
  static properties = {
    background: { type: String, attribute: 'background' }
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  willUpdate(changedProperties) {
    if (!changedProperties.has("background")) {
      return;
    }

    if (this.background) {
      this.style.setProperty("--bg", `var(--${this.background})`);
    } else {
      this.style.removeProperty("--bg");
    }
  }

  render() {
    return html`
      <slot></slot>
    `;
  }
}

if (!customElements.get("hero-card")) {
  customElements.define("hero-card", HeroCard);
}
