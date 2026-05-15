import { LitElement, html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import resetStyles from "../../assets/styles/reset.css?inline";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./styles.css?inline";
import { litStaticStyles } from "../utils.js";
import { highlightCss, highlightHtml, highlightJs } from "./utils.js";

export class ArticleCode extends LitElement {
  static properties = {
    language: { type: String, attribute: "language" }, // html | css | js
    code: { state: true },
    toastMessage: { state: true },
  };

  static styles = litStaticStyles(resetStyles, utilsStyles, previewStyles);

  constructor() {
    super();
    this.language = "js";
    this.code = "";
    this.toastMessage = "";
    this.toastTimer = undefined;
    this.handleSlotChange = () => this.updateCode();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this.toastTimer);
  }

  firstUpdated() {
    this.updateCode();
  }

  updateCode() {
    const slot = this.renderRoot.querySelector("slot");
    const code = (slot?.assignedNodes({ flatten: true }) || [])
      .map((node) => this.serializeCodeNode(node))
      .join("");

    this.code = this.normalizeCodeIndent(code);
  }

  serializeCodeNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) return node.outerHTML;
    if (node.nodeType === Node.COMMENT_NODE) return `<!--${node.textContent || ""}-->`;

    return node.textContent || "";
  }

  normalizeCodeIndent(code) {
    // 1. Split into lines
    const lines = code.split("\n");

    // 2. Find the first line that actually contains text to determine the base indent
    const firstCodeLineIndex = lines.findIndex((line) => line.trim().length > 0);
    if (firstCodeLineIndex === -1) return code.trim();

    const indentMatch = lines[firstCodeLineIndex].match(/^[\t ]*/);
    const indent = indentMatch ? indentMatch[0] : "";

    // 3. Remove that specific indent from all lines and trim the outer block
    return lines
      .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
      .join("\n")
      .trim();
  }

  get highlightedCode() {
    const language = this.language?.toLowerCase();

    if (language === "html") return highlightHtml(this.code);
    if (language === "css") return highlightCss(this.code);

    return highlightJs(this.code);
  }

  get lang() {
    const languages = {
      html: "HTML",
      css: "CSS",
      js: "JavaScript",
    };

    return languages[this.language] || "Unknow";
  }

  handleCopyClick = async () => {
    await navigator.clipboard.writeText(this.code);
    this.showToast("Code copied");
  };

  showToast(message) {
    window.clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage = "";
    }, 2000);
  }

  render() {
    return html` <div class="header">
        <div class="language">${this.lang}</div>
        <button class="copy-code" type="button" @click=${this.handleCopyClick}>
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <rect class="shake-1" x="7" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="Canvas" />
            <rect class="shake-2" x="2" y="7" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="Canvas" />
          </svg>
          <span>Copy</span>
        </button>
      </div>
      <div class="scroll-view">
        <pre><code><slot hidden @slotchange=${this.handleSlotChange}>
          </slot>${unsafeHTML(this.highlightedCode)}</code></pre>
      </div>
      <div class="toast-message" role="status" aria-live="polite" ?hidden=${!this.toastMessage}>
        ${this.toastMessage}
      </div>`;
  }
}

if (!customElements.get("article-code")) {
  customElements.define("article-code", ArticleCode);
}
