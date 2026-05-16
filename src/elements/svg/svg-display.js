import { LitElement, html, nothing, svg } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./svg-display.css?inline";
import { litStaticStyles } from "../utils.js";

const gridPath = Array.from({ length: 25 }, (_, index) => {
  const position = index * 10;
  return `M 0 ${position} L 240 ${position} M ${position} 0 L ${position} 240`;
}).join(" ");

export class SvgDisplay extends LitElement {
  static properties = {
    step: { type: Number },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.step = 0;
  }

  get stepNumber() {
    return Number.parseInt(this.step, 10);
  }

  render() {
    return svg`
      <svg viewBox="0 0 240 240">
        <g stroke="#fff5" stroke-width="0.5" fill="none">
          <path d=${gridPath} />
        </g>
        ${this.stepNumber === 1 ? svg`
          <line x1="50" y1="120" x2="190" y2="120" stroke="currentColor" stroke-width="10" />
        ` : nothing}
        ${this.stepNumber === 2 ? svg`
          <line x1="50" y1="70" x2="190" y2="70" stroke="currentColor" stroke-width="10" />
          <line x1="50" y1="120" x2="190" y2="120" stroke="currentColor" stroke-width="10" />
          <line x1="50" y1="170" x2="190" y2="170" stroke="currentColor" stroke-width="10" />
        ` : nothing}
        ${this.stepNumber === 3 ? svg`
          <line x1="50" y1="70" x2="190" y2="70" stroke="currentColor" stroke-width="10" />
          <line x1="50" y1="120" x2="190" y2="120" stroke="currentColor" stroke-width="10" />
          <line x1="50" y1="170" x2="190" y2="170" stroke="currentColor" stroke-width="10" />
          <rect x="10" y="10" width="220" height="220" stroke="currentColor" stroke-width="10" fill="none" />
        ` : nothing}
        ${this.stepNumber === 4 ? svg`
          <g stroke="currentColor" stroke-width="10" stroke-linecap="round">
            <line x1="50" y1="70" x2="190" y2="70" />
            <line x1="50" y1="120" x2="190" y2="120" />
            <line x1="50" y1="170" x2="190" y2="170" />
            <rect x="10" y="10" width="220" height="220" rx="30" fill="none" />
          </g>
        ` : nothing}
      </svg>
    `;
  }
}

if (!customElements.get("svg-display")) {
  customElements.define("svg-display", SvgDisplay);
}
