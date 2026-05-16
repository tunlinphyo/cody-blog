import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-slide-item.css?inline";
import { litStaticStyles } from "../utils.js";

export class ArticleSlideItem extends LitElement {
  static properties = {
    index: { type: Number },
    active: { type: String, attribute: "active" },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.index = 0;
    this.activeObserver = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.disconnectActiveObserver();
  }

  observeActive(root) {
    this.disconnectActiveObserver();
    this.activeObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          this.dispatchEvent(
            new CustomEvent("article-slide-item-active", {
              bubbles: true,
              composed: true,
              detail: { index: this.index },
            }),
          );
        }
      },
      { root, threshold: 0.6 },
    );
    this.activeObserver.observe(this);
  }

  disconnectActiveObserver() {
    this.activeObserver?.disconnect();
    this.activeObserver = null;
  }

  render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get("article-slide-item")) {
  customElements.define("article-slide-item", ArticleSlideItem);
}
