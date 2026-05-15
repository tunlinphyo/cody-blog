import { LitElement, html } from "lit";
import resetStyles from "../../assets/styles/reset.css?inline";
import utilsStyles from "../../assets/styles/utils.css?inline";
import liveCodeStyles from "./live-code.css?inline";
import { litStaticStyles } from "../utils";
import "./live-code-preview.js";
import "./tiny-code-editor.js";
import {
  buildPreviewDocument,
  escapeAttribute,
  fetchCodeFile,
  normalizeFilePath,
  parsePathList,
} from "./utils";

export class LiveCode extends LitElement {
  static properties = {
    htmlCode: { type: String, attribute: "html-code" },
    cssCode: { type: String, attribute: "css-code" },
    jsCode: { type: String, attribute: "js-code" },
    filePath: { type: String, attribute: "file-path" },
    stylesPath: { type: String, attribute: "styles-path" },
    modulesPath: { type: String, attribute: "modules-path" },
    uiView: { type: String, attribute: "ui-view", reflect: true },
    height: { type: String },
    autorun: { type: Boolean },
    activeTab: { state: true },
    previewDocument: { state: true },
    toastMessage: { state: true },
  };

  setEditorHeight() {
    if (this.height) {
      this.style.setProperty("--editor-height", this.height);
    } else {
      this.style.removeProperty("--editor-height");
    }
  }

  constructor() {
    super();
    this.htmlCode = "";
    this.cssCode = "";
    this.jsCode = "";
    this.filePath = "";
    this.stylesPath = "";
    this.modulesPath = "";
    this.autorun = false;
    this.uiView = "mini";
    this.activeTab = "html";
    this.previewDocument = "";
    this.updateTimer = undefined;
    this.loadRequestId = 0;
    this.defaultHtmlCode = "";
    this.defaultCssCode = "";
    this.defaultJsCode = "";
    this.height = "";
    this.toastMessage = "";
    this.toastTimer = undefined;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this.toastTimer);
  }

  // Runs once after the first render
  firstUpdated() {
    this.defaultHtmlCode = this.htmlCode;
    this.defaultCssCode = this.cssCode;
    this.defaultJsCode = this.jsCode;
    this.updatePreview();
  }

  updated(changedProperties) {
    if (changedProperties.has("height")) {
      this.setEditorHeight();
    }

    if (changedProperties.has("uiView")) {
      console.log(this.uiView);
    }

    // Only react to file path changes automatically
    if (changedProperties.has("filePath") && this.filePath) {
      void this.loadCodeFiles();
      return;
    }

    const codeChanged =
      changedProperties.has("htmlCode") ||
      changedProperties.has("cssCode") ||
      changedProperties.has("jsCode");
    const previewDependencyChanged =
      changedProperties.has("stylesPath") || changedProperties.has("modulesPath");

    if ((codeChanged && this.autorun) || previewDependencyChanged) {
      this.schedulePreviewUpdate();
    }
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("uiView")) {
      this.uiView = this.normalizeUiView(this.uiView);
    }
  }

  static styles = litStaticStyles(resetStyles, utilsStyles, liveCodeStyles);

  render() {
    const playPause = this.autorun
      ? "M 3 6 Q 3 3 6 3 L 18 3 Q 21 3 21 6 L 21 18 Q 21 21 18 21 L 6 21 Q 3 21 3 18 Z"
      : "M 4 5 Q 4 1 8 3 L 19 10 Q 21 11 21 12 L 21 12 Q 21 13 19 14 L 8 21 Q 4 23 4 19 Z";
    return html`
      <div class="editor-panel">
        <div class="toolbar">
          <div class="tabs" role="tablist" aria-label="Code editors">
            ${this.renderTab("html", "HTML")} ${this.renderTab("css", "CSS")}
            ${this.renderTab("js", "JS")}
          </div>

          <div class="actions">
            <button class="run" type="button" @click=${this.handleReloadDefaultsClick}>
              <svg viewBox="0 0 28 28" width="19" height="19" xmlns="http://www.w3.org/2000/svg">
                <mask id="circle-cutout-mask:002">
                  <rect x="0" y="0" width="28" height="28" fill="white" />
                  <rect x="12" y="4" width="4" height="24" fill="black" transform="rotate(30 14 14)" />
                  <rect x="12" y="0" width="4" height="24" fill="black" transform="rotate(30 14 14)" />
                </mask>
                <circle cx="14" cy="14" r="10" mask="url(#circle-cutout-mask:002)" stroke="currentColor" stroke-width="2" fill="none" />
                <polygon points="13 0 13 8 19 4" fill="currentColor" transform="rotate(15 13 4)" />
                <polygon points="9 24 15 20 15 28" fill="currentColor" transform="rotate(15 15 24)" />
              </svg>
              <span screenreader-only>Reset Code</span>
            </button>
            <button class="run play-pause" type="button" data-play="${this.autorun}" @click=${this.handleRunClick}>
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" stroke="currentColor" stroke-width="1.8" d=${playPause} />
              </svg>
              <span screenreader-only>Play/Pause</span>
            </button>

            ${this.uiView === "closed"
        ? html`
          <button class="run open-full" type="button" @click=${this.handleOpenView}>
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="2" width="22" height="20" rx="4" stroke="currentColor" stroke-width="2" fill="none" />
              <g fill="currentColor">
                <circle cx="6" cy="6" r="1.5"></circle>
                <circle cx="10" cy="6" r="1.5" style="animation-delay: 0.1s"></circle>
                <circle cx="14" cy="6" r="1.5" style="animation-delay: 0.2s"></circle>
              </g>
            </svg>
            <span screenreader-only>Open Preview</span>
          </button>`
        : ""
      }
          </div>
        </div>

        <div class="editor-wrap">
          ${this.renderEditor("html", "HTML", this.htmlCode)}
          ${this.renderEditor("css", "CSS", this.cssCode)}
          ${this.renderEditor("js", "JS", this.jsCode)}
        </div>
      </div>

      <live-code-preview
        .srcdoc=${this.previewDocument}
        .uiView=${this.uiView}
        @toggle-view=${this.handleFullPreviewToggle}
      ></live-code-preview>

      <div class="toast-message" role="status" aria-live="polite" ?hidden=${!this.toastMessage}>
        ${this.toastMessage}
      </div>
    `;
  }

  renderEditor(tab, label, code) {
    const active = this.activeTab === tab;

    return html`
      <div class="scroll-container" ?hidden=${!active}>
        <tiny-code-editor
          language=${tab}
          aria-label="${label} editor"
          .value=${code}
          @input=${(event) => this.handleInput(event)}
        ></tiny-code-editor>
      </div>
    `;
  }

  renderTab(tab, label) {
    return html`
      <button
        class="tab"
        type="button"
        role="tab"
        aria-selected=${this.activeTab === tab}
        @click=${() => (this.activeTab = tab)}
      >
        ${label}
      </button>
    `;
  }

  handleRunClick = () => {
    this.autorun = !this.autorun;
    this.showToast(this.autorun ? "Autoupdate Enabled" : "Autoupdate Disabled");

    if (this.autorun) {
      this.updatePreview();
    }
  };

  showToast(message) {
    window.clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage = "";
    }, 2000);
  }

  normalizeUiView(uiView) {
    return ["full", "mini", "closed"].includes(uiView) ? uiView : "mini";
  }

  handleFullPreviewToggle = (event) => {
    this.uiView = this.normalizeUiView(event.detail.state);
  };

  handleOpenView = () => {
    this.uiView = window.matchMedia("(max-width: 48rem) and (orientation: portrait)").matches
      ? "full"
      : "mini";
  };

  handleReloadDefaultsClick = (event) => {
    window.clearTimeout(this.updateTimer);

    if (this.filePath) {
      void this.loadCodeFiles();
    } else {
      this.htmlCode = this.defaultHtmlCode;
      this.cssCode = this.defaultCssCode;
      this.jsCode = this.defaultJsCode;
      this.updatePreview();
    }

    this.showToast("Code Reset");

    const button = event.currentTarget;
    button.disabled = true;
    button.classList.add("is-reloading");

    button.addEventListener(
      "animationend",
      () => {
        button.classList.remove("is-reloading");
        button.disabled = false;
      },
      { once: true },
    );
  };

  handleInput(event) {
    const value = event.currentTarget.value;
    const tab = event.currentTarget.language;
    this[`${tab}Code`] = value;

    this.dispatchEvent(
      new CustomEvent("code-change", {
        detail: { html: this.htmlCode, css: this.cssCode, js: this.jsCode },
        bubbles: true,
        composed: true,
      }),
    );
  }

  schedulePreviewUpdate() {
    window.clearTimeout(this.updateTimer);
    this.updateTimer = window.setTimeout(() => this.updatePreview(), 1200);
  }

  async loadCodeFiles() {
    const requestId = ++this.loadRequestId;
    const baseUrl = normalizeFilePath(this.filePath);

    const [htmlVal, cssVal, jsVal] = await Promise.all([
      fetchCodeFile(baseUrl, "index.html"),
      fetchCodeFile(baseUrl, "style.css"),
      fetchCodeFile(baseUrl, "script.js"),
    ]);

    if (requestId !== this.loadRequestId) return;

    this.defaultHtmlCode = htmlVal;
    this.defaultCssCode = cssVal;
    this.defaultJsCode = jsVal;
    this.htmlCode = htmlVal;
    this.cssCode = cssVal;
    this.jsCode = jsVal;
    this.updatePreview();
  }

  get previewStyles() {
    return parsePathList(this.stylesPath)
      .map((path) => `<link rel="stylesheet" href="${escapeAttribute(path)}" />`)
      .join("");
  }

  get previewModules() {
    return parsePathList(this.modulesPath)
      .map((path) => `<script type="module" src="${escapeAttribute(path)}"></script>`)
      .join("");
  }

  updatePreview = () => {
    this.previewDocument = buildPreviewDocument({
      htmlCode: this.htmlCode,
      cssCode: this.cssCode,
      jsCode: this.jsCode,
      previewStyles: this.previewStyles,
      previewModules: this.previewModules,
    });
  };
}

if (!customElements.get("live-code")) {
  customElements.define("live-code", LiveCode);
}
