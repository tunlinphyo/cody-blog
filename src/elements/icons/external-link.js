import { css, LitElement, svg } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import { litStaticStyles } from "../utils.js";

export class ExternalLink extends LitElement {
  static properties = {
    size: { type: String, attribute: "size" },
  };

  static styles = litStaticStyles(utilsStyles, css`
    :host {
      display: inline-block;
      translate: 1px 2px;
    }
    rect, line {
      transition: transform 0.3s var(--ease-2);
    }  
  `);

  constructor() {
    super();
    this.size = "16";
  }

  render() {
    return svg`
      <svg viewBox="0 0 24 24" width=${this.size} height=${this.size}>
        <mask id="link-conner-cutout:001">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <rect x="12" y="2" width="10" height="10" rx="0" fill="black" />
        </mask>
        <g stroke="currentColor" stroke-width="2">
          <rect mask="url(#link-conner-cutout:001)" x="1" y="4" width="18" height="18" rx="3" fill="none" />
          <rect mask="url(#link-conner-cutout:001)" x="15" y="1" width="8" height="8" rx="2" fill="none"
            style="transform: var(--link-arrow-offset);" />
          <line x1="23" y1="1" x2="12" y2="12" style="transform: var(--link-line-offset);" /> 
        </g>
      </svg>
    `
  }
}

if (!customElements.get("external-link")) {
  customElements.define("external-link", ExternalLink);
}
