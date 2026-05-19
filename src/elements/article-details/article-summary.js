import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-summary.css?inline";
import { litStaticStyles } from "../utils.js";

export class ArticleSummary extends LitElement {
  static properties = {
    summaryTitle: { type: String, attribute: 'summary-title' },
    index: { type: Number },
    open: { type: Boolean, attribute: "open", reflect: true },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.summaryTitle = "";
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
      <button type="button" class="opener" @click=${this.handleOpenClick}>${this.summaryTitle}</button>
      <div class="details">
        <slot></slot>
      </div>
    `
  }
}

if (!customElements.get("article-summary")) {
  customElements.define("article-summary", ArticleSummary);
}
