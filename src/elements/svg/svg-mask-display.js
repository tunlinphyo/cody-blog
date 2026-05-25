import { LitElement, nothing, svg } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./svg-display.css?inline";
import { litStaticStyles } from "../utils.js";

const gridPath = Array.from({ length: 25 }, (_, index) => {
  const position = index * 10;
  return `M 0 ${position} L 240 ${position} M ${position} 0 L ${position} 240`;
}).join(" ");

export class SvgMaskDisplay extends LitElement {
  static properties = {
    step: { type: Number, attribute: "step" },
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
        <g stroke="oklch(from var(--gray) l c h / 0.7)" stroke-width="0.5" fill="none">
          <path d=${gridPath} />
        </g>
        <mask id="cut-out-for-reload:001">
          <rect x="0" y="0" width="240" height="240" fill="white" />
          <polygon points="120 0 165 0 75 240 120 240" fill="black" />
        </mask>
        ${this.stepNumber === 0 ? svg`
          <g color="color-mix(in srgb, var(--foreground), var(--background) 20%)">
            <circle mask="url(#cut-out-for-reload:001)" cx="120" cy="120" r="100"
              stroke="currentColor" stroke-width="10" fill="none" />
            <polygon points="100 0 100 40 140 20" fill="currentColor" transform="rotate(4 100 20)" />
            <polygon points="140 240 140 200 100 220" fill="currentColor" transform="rotate(4 140 220)" />
          </g>
        ` : nothing}
        ${this.stepNumber === 1 ? svg`
          <circle cx="120" cy="120" r="100" stroke="currentColor" stroke-width="10" fill="none" />
        ` : nothing}
        ${this.stepNumber === 2 ? svg`
          <circle cx="120" cy="120" r="100" stroke="currentColor" stroke-width="10" fill="none" />
          <rect x="0" y="0" width="240" height="240" fill="oklch(from #fff l c h / 0.6)" />
        ` : nothing}
        ${this.stepNumber === 3 ? svg`
          <circle cx="120" cy="120" r="100" stroke="currentColor" stroke-width="10" fill="none" />
          <rect x="0" y="0" width="240" height="240" fill="oklch(from #fff l c h / 0.6)" />
          <polygon points="120 0 165 0 75 240 120 240" fill="oklch(from #000 l c h / 0.6)" />
        ` : nothing}
        ${this.stepNumber === 4 ? svg`
          <circle mask="url(#cut-out-for-reload:001)" cx="120" cy="120" r="100" stroke="currentColor" stroke-width="10" fill="none" />
        ` : nothing}
        ${this.stepNumber === 5 ? svg`
          <circle mask="url(#cut-out-for-reload:001)" cx="120" cy="120" r="100" stroke="currentColor" stroke-width="10" fill="none" />
          <polygon points="100 0 100 40 140 20" fill="var(--blue)" />
          <polygon points="100 0 100 40 140 20" fill="oklch(from currentColor l c h / 0.7)" transform="rotate(4 100 20)" />
        ` : nothing}
        ${this.stepNumber === 6 ? svg`
          <circle mask="url(#cut-out-for-reload:001)" cx="120" cy="120" r="100" stroke="currentColor" stroke-width="10" fill="none" />
          <polygon points="100 0 100 40 140 20" fill="currentColor" transform="rotate(4 100 20)" />
          <polygon points="140 240 140 200 100 220" fill="currentColor" transform="rotate(4 140 220)" />
        ` : nothing}
      </svg>
    `;
  }
}

if (!customElements.get("svg-mask-display")) {
  customElements.define("svg-mask-display", SvgMaskDisplay);
}
