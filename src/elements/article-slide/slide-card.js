import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./slide-card.css?inline";
import { litStaticStyles } from "../utils.js";

export class SlideCard extends LitElement {
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
      <div class="card-container">
        <slot></slot>
      </div>
    `;
  }
}

if (!customElements.get("slide-card")) {
  customElements.define("slide-card", SlideCard);
}
