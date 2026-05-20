import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import resetButtonStyles from "./article-toast.css?inline";
import { litStaticStyles } from "../utils.js";

export class ArticleToast extends LitElement {
  static properties = {
    message: { type: String },
    showMessage: { state: true },
    duration: { type: Number },
  };

  static styles = litStaticStyles(utilsStyles, resetButtonStyles);

  constructor() {
    super();
    this.message = "";
    this.showMessage = false;
    this.duration = 1800;
    this.timer = undefined;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this.timer);
  }

  show(message) {
    window.clearTimeout(this.timer);
    this.message = message;
    this.showMessage = true;
    this.timer = window.setTimeout(() => {
      this.showMessage = false;
      this.message = "";
    }, this.duration);
  }

  render() {
    return html`
      <div class="toast-message" role="status" aria-live="polite" ?hidden=${!this.showMessage}>
        ${this.message}
      </div>
    `;
  }
}

if (!customElements.get("article-toast")) {
  customElements.define("article-toast", ArticleToast);
}
