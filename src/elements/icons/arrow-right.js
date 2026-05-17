import { css, LitElement, svg } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import { litStaticStyles } from "../utils.js";

export class ArrowRight extends LitElement {
  static properties = {
    size: { type: String, attribute: "size" },
  };

  static styles = litStaticStyles(utilsStyles, css`
    line {
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
        <g stroke="currentColor" stroke-width="1">
          <line x1="2" y1="12" x2="22" y2="12" style="transform: translateX(var(--arrow-line-offset, 0));" />
          <line x1="13" y1="7" x2="22" y2="12" part="arrow-top" stroke-width="1.1" style="transform: translateX(var(--arrow-top-offset, 0));" />
          <line x1="13" y1="17" x2="22" y2="12" part="arrow-top" stroke-width="1.1" style="transform: translateX(var(--arrow-top-offset, 0));" />
        </g>
      </svg>
    `
  }
}

if (!customElements.get("arrow-right")) {
  customElements.define("arrow-right", ArrowRight);
}
