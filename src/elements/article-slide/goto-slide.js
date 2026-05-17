import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./goto-slide.css?inline";
import { litStaticStyles } from "../utils.js";

export class GotoSlide extends LitElement {
  static properties = {
    gotoIndex: { type: String, attribute: "goto-index" },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.gotoIndex = 0;
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) {
      this.tabIndex = 0;
    }
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  get index() {
    return parseInt(this.gotoIndex) - 1;
  }

  render() {
    return html`
      <slot></slot>
    `;
  }

  handleClick() {
    this.goToSlide();
  }

  handleKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.click();
  }

  goToSlide() {
    this.dispatchEvent(
      new CustomEvent("article-slide-to-index", {
        bubbles: true,
        composed: true,
        detail: { index: this.index },
      }),
    );
  }
}

if (!customElements.get("goto-slide")) {
  customElements.define("goto-slide", GotoSlide);
}
