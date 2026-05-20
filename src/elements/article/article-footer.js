import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-footer.css?inline";
import { litStaticStyles } from "../utils.js";

export class ArticleFooter extends LitElement {
  static properties = {};

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    if (!this.hasAttribute("role")) this.setAttribute("role", "contentinfo");
  }

  render() {
    return html`
      <a href="/">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 16" width="68">
          <g stroke="currentColor" fill="none">
            <line x1="9" y1="1" x2="4" y2="15" stroke-width="1.6" />
            <line x1="1" y1="6" x2="20" y2="2" stroke-width="1.6" />
            <path stroke-width="1.2" d="M9 6L8 9Q7 13 11 8T12.5 8T14 8Q18 2 17 7T18.5 8" />
            <text
              x="12.5"
              y="15"
              text-anchor="middle"
              font-family="Google Sans Flex, sans-serif"
              font-size="2.8"
              font-weight="900"
              letter-spacing="0.15"
              fill="currentColor"
              stroke="none"
              pathLength="100">UI.DEV</text>
          </g>
        </svg>
      </a>
    `;
  }
}

if (!customElements.get("article-footer")) {
  customElements.define("article-footer", ArticleFooter);
}
