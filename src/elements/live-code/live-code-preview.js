import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./live-code-preview.css?inline";
import { litStaticStyles } from "../utils.js";

export class LiveCodePreview extends LitElement {
  static properties = {
    srcdoc: { type: String },
    uiView: { type: String, attribute: "ui-view" },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.srcdoc = "";
  }

  render() {
    return html`
      <div class="toolbar">
        <div class="lights">
          <traffic-light light-type="red" .uiView=${this.uiView}></traffic-light>
          <traffic-light light-type="yellow" .uiView=${this.uiView}></traffic-light>
          <traffic-light light-type="green" .uiView=${this.uiView}></traffic-light>
        </div>
        <div class="searchbar"></div>
        <div class="actions">
          <button class="reload" @click=${this.handleReloadClick}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <mask id="reload-mask:001">
                <rect x="0" y="0" width="24" height="24" rx="0" stroke-width="0" fill="white" />
                <polygon points="22 8 22 16 16 13 16 11" fill="black" />
              </mask>
              <g stroke="currentColor" stroke-width="1">
                <circle mask="url(#reload-mask:001)" cx="12" cy="12" r="7.5" fill="none" stroke-width="1.5" />
                <polygon points="17 4 17 10 20.5 7" fill="currentColor" transform="rotate(45 17 7)" />
              </g>
            </svg>
            <span screenreader-only>Reload Preview</span>
          </button>
        </div>
      </div>
      <div class="iframe-container">
        <iframe
          title="Live code preview"
          .srcdoc=${this.srcdoc}
        ></iframe>
      </div>
    `;
  }

  handleReloadClick = (event) => {
    const liveCode = this.getRootNode().host;
    if (typeof liveCode?.updatePreview === "function") {
      liveCode.updatePreview();
      this.srcdoc = liveCode.previewDocument;
    }

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

    const iframe = this.renderRoot.querySelector("iframe");
    if (iframe) {
      iframe.srcdoc = this.srcdoc;
    }
  };
}

if (!customElements.get("live-code-preview")) {
  customElements.define("live-code-preview", LiveCodePreview);
}
