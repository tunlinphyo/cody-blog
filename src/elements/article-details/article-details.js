import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-details.css?inline";
import { litStaticStyles } from "../utils.js";

export class ArticleDetails extends LitElement {
  static properties = {
    detailTitle: { type: String, attribute: 'detail-title' },
    activeIndex: { type: Number },
    summaryCount: { state: true },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.detailTitle = "Attributes"
    this.activeIndex = null;
    this.summaryTitle = "";
    this.summaryCount = 0;
  }

  getSummaries() {
    return this.renderRoot
      ?.querySelector("slot")
      ?.assignedElements({ flatten: true })
      .filter((element) => element.localName === "article-summary") ?? [];
  }

  handleSlotChange = () => {
    let activeIndex = null;

    this.getSummaries().forEach((summary, index) => {
      summary.index = index;

      if (summary.hasAttribute("open")) {
        activeIndex = index;
      }
    });

    this.activeIndex = activeIndex;
  };

  handleSummaryOpen = (event) => {
    const summaries = this.getSummaries();
    const target = event.composedPath().find((element) => element.localName === "article-summary");
    const activeIndex = event.detail.index ?? summaries.indexOf(target);

    if (activeIndex < 0) {
      return;
    }

    summaries.forEach((summary, index) => {
      summary.toggleAttribute("open", index === activeIndex);
    });

    this.activeIndex = activeIndex;
  };

  handleCloseClick = () => {
    this.getSummaries().forEach((summary) => {
      summary.removeAttribute("open");
    });

    this.activeIndex = null;
  };

  render() {
    return html`
      <div class="button-container">
        <button type="button" ?disabled=${this.activeIndex === null} @click=${this.handleCloseClick}>
          <svg viewBox="0 0 24 24" width="24">
            <g stroke="currentColor" stroke-width="1.4" fill="none">
              <line class="top-line" x1="5" y1="5" x2="19" y2="19" />
              <line class="bottom-line" x1="19" y1="5" x2="5" y2="19" />
            </g>
          </svg>
        </button>
      </div>
      <div class="detail">
        <h2 class="title">${this.detailTitle}</h2>
      </div>
      <div class="summary-container" @article-summary-open=${this.handleSummaryOpen}>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `
  }
}

if (!customElements.get("article-details")) {
  customElements.define("article-details", ArticleDetails);
}
