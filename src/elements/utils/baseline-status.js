import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import baselineStatusStyles from "./baseline-status.css?inline";
import { litStaticStyles } from "../utils.js";
import {
  formatBaselineDate,
  getBaselineStatus,
  getDescription,
  renderActions,
  getBaselineStatusTitle,
  getBaselineBrowsers,
} from "./baseline-helper.js";

const API_ENDPOINT = "https://api.webstatus.dev/v1/features/";

export class BaselineStatus extends LitElement {
  static properties = {
    featureId: { type: String, attribute: "feature-id" },
    feature: { state: true },
    loadState: { state: true },
  };

  static styles = litStaticStyles(utilsStyles, baselineStatusStyles);

  constructor() {
    super();
    this.featureId = "";
    this.feature = undefined;
    this.loadState = "idle";
    this.abortController = undefined;
    this.requestId = 0;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.abortController?.abort();
  }

  updated(changedProperties) {
    if (changedProperties.has("featureId")) {
      void this.loadFeature();
    }
  }

  get resolvedFeatureId() {
    return (this.featureId || "").trim();
  }

  get fallbackFeature() {
    return {
      name: this.resolvedFeatureId || "Unknown feature",
      feature_id: this.resolvedFeatureId,
      baseline: { status: "no_data" },
      browser_implementations: {},
    };
  }

  async loadFeature() {
    const featureId = this.resolvedFeatureId;
    this.abortController?.abort();
    this.requestId += 1;

    if (!featureId) {
      this.feature = undefined;
      this.loadState = "idle";
      return;
    }

    const requestId = this.requestId;
    const abortController = new AbortController();
    this.abortController = abortController;
    this.loadState = "loading";

    try {
      const response = await fetch(`${API_ENDPOINT}${encodeURIComponent(featureId)}`, {
        cache: "force-cache",
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`WebStatus API responded with ${response.status}`);
      }

      const feature = await response.json();
      if (requestId !== this.requestId) return;

      this.feature = feature?.baseline ? feature : this.fallbackFeature;
      this.loadState = "complete";
    } catch {
      if (abortController.signal.aborted || requestId !== this.requestId) return;

      this.feature = this.fallbackFeature;
      this.loadState = "error";
    }
  }

  render() {
    const feature = this.feature || this.fallbackFeature;
    const status = getBaselineStatus(feature);
    const date = formatBaselineDate(feature);

    const description =
      this.loadState === "loading"
        ? "Fetching browser support information from WebStatus."
        : getDescription(status, date);

    return html`
      <h3>${feature.name}</h3>
      <details data-status=${status}>
        <summary>
          <div class="baseline-status-title">
            ${getBaselineStatusTitle(status, date)}
          </div>
          <div class="baseline-status-browsers">
            ${getBaselineBrowsers(feature, status)}
          </div>
        </summary>
        <div class="information">
          ${description}
          ${renderActions(feature, this.resolvedFeatureId)}
        </div>
      </details>
    `;
  }
}

if (!customElements.get("baseline-status")) {
  customElements.define("baseline-status", BaselineStatus);
}
