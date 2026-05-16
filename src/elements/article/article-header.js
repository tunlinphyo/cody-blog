import { LitElement, html, nothing, svg } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-header.css?inline";
import { litStaticStyles } from "../utils.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export class ArticleHeader extends LitElement {
  static properties = {
    date: { type: String, attribute: "date" },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    if (!this.hasAttribute("role")) this.setAttribute("role", "banner");
  }

  get dateYMD() {
    const date = this.date || "";
    return {
      year: date.slice(0, 4), 
      month: MONTHS[date.slice(5, 7) - 1], 
      day: date.slice(8, 10)
    };
  }

  render() {
    return html`
      <div class="date">
        <div class="day">${this.dateYMD.day}</div>
        <div class="month">${this.dateYMD.month}</div>
        <div class="year">${this.dateYMD.year}</div>
      </div>
      <h1><slot /></h1>
    `;
  }
}

if (!customElements.get("article-header")) {
  customElements.define("article-header", ArticleHeader);
}
