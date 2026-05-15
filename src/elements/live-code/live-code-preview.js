import { LitElement, html } from "lit";
import resetStyles from "../../assets/styles/reset.css?inline";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./live-code-preview.css?inline";
import { litStaticStyles } from "../utils.js";

export class LiveCodePreview extends LitElement {
  static properties = {
    srcdoc: { type: String },
    uiView: { type: String, attribute: "ui-view" },
  };

  static styles = litStaticStyles(resetStyles, utilsStyles, previewStyles);

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
        <button class="reload" @click=${this.handleReloadClick}>
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <mask id="circle-cutout-mask:001">
              <rect x="0" y="0" width="24" height="24" fill="white" />
              <rect x="18" y="6" width="10" height="10" fill="black" transform="rotate(45 20 12)" />
            </mask>
            <circle cx="12" cy="12" r="10" mask="url(#circle-cutout-mask:001)" stroke="currentColor" stroke-width="2" fill="none" />
            <polygon points="17 3 17 13 24 8" fill="currentColor" transform="rotate(50 20 11)" />
          </svg>
          <span screenreader-only>Reload Preview</span>
        </button>
      </div>
      <iframe
        title="Live code preview"
        .srcdoc=${this.srcdoc}
      ></iframe>
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
