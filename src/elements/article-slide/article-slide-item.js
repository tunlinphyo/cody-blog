import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-slide-item.css?inline";
import { litStaticStyles } from "../utils.js";

const ARTICLE_SLIDE_HOST_SELECTOR = "article-slide, article-toturial";

export class ArticleSlideItem extends LitElement {
  static properties = {
    index: { type: Number },
    active: { type: String, attribute: "active" },
    slideType: { type: String, attribute: "slide-type", reflect: true },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.index = 0;
    this.slideType = null;
    this.activeObserver = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateSlideHost();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.disconnectActiveObserver();
  }

  get slideHost() {
    return this.closest(ARTICLE_SLIDE_HOST_SELECTOR);
  }

  updateSlideHost() {
    const slideHost = this.slideHost;
    this.slideType = slideHost?.localName ?? null;
    return slideHost;
  }

  observeActive(root) {
    this.disconnectActiveObserver();
    this.activeObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const slideHost = this.updateSlideHost();

          this.dispatchEvent(
            new CustomEvent("article-slide-item-active", {
              bubbles: true,
              composed: true,
              detail: { index: this.index, slideHost, slideType: this.slideType },
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
    return html`
      ${this.slideType == "article-toturial" 
        ? html`
          <div class="placeholder"></div>
          <div class="slot-container">
            <slot></slot>
          </div>` 
        : html`<slot></slot>`}
    `;
  }
}

if (!customElements.get("article-slide-item")) {
  customElements.define("article-slide-item", ArticleSlideItem);
}
