import { LitElement, html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./styles.css?inline";
import { litStaticStyles } from "../utils.js";
import "../utils/article-toast.js";
import { highlightCss, highlightHtml, highlightJs } from "./utils.js";

const htmlEscapeChars = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function highlightText(code) {
  return code.replace(/[&<>"']/g, (char) => htmlEscapeChars[char]) || "<br>";
}

export class ArticleCode extends LitElement {
  static plainTextLanguages = new Set(["text", "txt", "plain", "plaintext", "text/plain"]);

  static properties = {
    language: { type: String, attribute: "language" }, // html | css | js | text
    mini: { type: Boolean, attribute: "mini" },
    code: { state: true },
    mobileMaxHeight: { type: String, attribute: "mobile-max-height" },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.language = "html";
    this.mini = false;
    this.code = "";
    this.handleSlotChange = () => this.updateCode();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    this.updateCode();
  }

  willUpdate(changedProperties) {
    if (!changedProperties.has("mobileMaxHeight")) {
      return;
    }

    if (this.mobileMaxHeight) {
      this.style.setProperty("--mobile-max-height", `${this.mobileMaxHeight}`);
    } else {
      this.style.removeProperty("--mobile-max-height");
    }
  }

  updateCode() {
    const slot = this.renderRoot.querySelector("slot");
    const code = (slot?.assignedNodes({ flatten: true }) || [])
      .map((node) => this.serializeAssignedCodeNode(node))
      .join("");

    this.code = this.normalizeCodeIndent(code);
  }

  serializeAssignedCodeNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.localName === "template") {
      return Array.from(node.content.childNodes, (child) => this.serializeCodeNode(child)).join("");
    }

    return this.serializeCodeNode(node);
  }

  serializeCodeNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) return this.serializeElementNode(node);
    if (node.nodeType === Node.COMMENT_NODE) return `<!--${node.textContent || ""}-->`;

    return node.textContent || "";
  }

  serializeElementNode(node) {
    const tagName = node.localName;
    const attributes = Array.from(node.attributes, (attribute) => {
      const value = attribute.value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

      return ` ${attribute.name}="${value}"`;
    }).join("");

    if (!node.childNodes.length) return `<${tagName}${attributes} />`;

    const children = Array.from(node.childNodes, (child) => this.serializeCodeNode(child)).join("");

    return `<${tagName}${attributes}>${children}</${tagName}>`;
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
    if (ArticleCode.plainTextLanguages.has(language)) return highlightText(this.code);

    return highlightJs(this.code);
  }

  get lang() {
    const languages = {
      html: "HTML",
      css: "CSS",
      js: "JavaScript",
      text: "Text",
    };

    return languages[this.language?.toLowerCase()] || "Unknow";
  }

  handleCopyClick = async () => {
    await navigator.clipboard.writeText(this.code);
    this.showToast("Code copied");
  };

  showToast(message) {
    this.renderRoot.querySelector("article-toast")?.show(message);
  }

  render() {
    return html`${!this.mini ? html`<div class="header">
        <div class="language">${this.lang}</div>
        <button class="copy-code" type="button" @click=${this.handleCopyClick}>
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <rect class="shake-1" x="7" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="Canvas" />
            <rect class="shake-2" x="2" y="7" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="Canvas" />
          </svg>
          <span>Copy</span>
        </button>
      </div>` : ""}
      <div class="scroll-view ${this.mini ? 'mini' : ''}">
        <pre><code><slot hidden @slotchange=${this.handleSlotChange}>
          </slot>${unsafeHTML(this.highlightedCode)}</code></pre>
      </div>
      <article-toast></article-toast>`;
  }
}

if (!customElements.get("article-code")) {
  customElements.define("article-code", ArticleCode);
}
