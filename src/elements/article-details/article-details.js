import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-details.css?inline";
import { litStaticStyles } from "../utils.js";

export class ArticleDetails extends LitElement {
  static properties = {
    activeIndex: { type: Number },
    summaryCount: { state: true },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
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
    this.getSummaries().forEach((summary, index) => {
      summary.index = index;
    });
  };

  handleSummaryOpen = (event) => {
    const summaries = this.getSummaries();
    const target = event.composedPath().find((element) => element.localName === "article-summary");
    const activeIndex = event.detail.index ?? summaries.indexOf(target);

    summaries.forEach((summary, index) => {
      summary.toggleAttribute("open", index === activeIndex);
    });

    this.activeIndex = activeIndex;
  };

  render() {
    return html`
      <div class="summary-container" @article-summary-open=${this.handleSummaryOpen}>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `
  }
}

if (!customElements.get("article-details")) {
  customElements.define("article-details", ArticleDetails);
}
