import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./slide-card.css?inline";
import overwriteStyles from "./slide-demo-card.css?inline";
import { litStaticStyles } from "../utils.js";

export class SlideDemoCard extends LitElement {
  static properties = {
    background: { type: String, attribute: 'background' }
  };

  static styles = litStaticStyles(utilsStyles, previewStyles, overwriteStyles);

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
      <slot name="description"></slot>
      <slot name="demo"></slot>
    `;
  }
}

if (!customElements.get("slide-demo-card")) {
  customElements.define("slide-demo-card", SlideDemoCard);
}
