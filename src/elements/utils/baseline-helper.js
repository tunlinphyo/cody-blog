import { html, nothing } from "lit";

const BASELINE = {
  limited: {
    description:
      "This feature is not Baseline because it does not work in some widely-used browsers.",
  },
  newly: {
    description:
      "This feature works across the latest devices and browser versions. It might not work in older browsers.",
  },
  widely: {
    description:
      "This feature is well established and works across many devices and browser versions.",
  },
  no_data: {
    description: "Browser support information for this feature is not available yet.",
  },
};

const BROWSERS = [
  { label: "Chrome", keys: ["chrome", "chrome_android"], icon: 'chrome' },
  { label: "Edge", keys: ["edge"], icon: 'edge' },
  { label: "Firefox", keys: ["firefox", "firefox_android"], icon: 'firefox' },
  { label: "Safari", keys: ["safari", "safari_ios"], icon: 'safari' },
];

export function getBaselineStatus(feature) {
  return feature?.baseline?.status || "no_data";
}

export function getBaselineStatusTitle(status, date) {
  if (status === "limited") {
    return html`<strong>Limited availability</strong>`
  }
  if (status === "newly") {
    return html`
      <strong>Baseline</strong>Newly available
      <em>${date.split(" ")[1]}<em>`
  }
  if (status === "widely") {
    return html `<strong>Baseline</strong>Widely available`
  }

  return html`<strong>Unknow status</strong>`
}

export function getBaselineBrowsers(feature, status) {
  const implementations = feature.browser_implementations || {};

  return html`
    ${BROWSERS.map(browser => {
      const support = getBrowserSupport(implementations, browser.keys);
      return html`
        <div class="browser" data-browser="${browser.icon}" data-support=${support} data-status=${status}></div>
      `
    })}
  `
}

export function formatBaselineDate(feature) {
  const date = feature?.baseline?.low_date;
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getDescription(status, date) {
  if (status === "newly" && date) {
    return `Since ${date}, this feature works across the latest devices and browser versions. It might not work in older browsers.`;
  }

  if (status === "widely" && date) {
    return `This feature is well established and works across many devices and browser versions. It has been available across browsers since ${date}.`;
  }

  return BASELINE[status]?.description || BASELINE.no_data.description;
}

function getBrowserSupport(implementations, keys) {
  const browserImplementations = keys.map((key) => implementations?.[key]).filter(Boolean);

  if (!browserImplementations.length) return "unknown";

  return browserImplementations.every((implementation) => implementation.status === "available")
    ? "available"
    : "not-available";
}

export function renderActions(feature, resolvedFeatureId) {
  const featureId = feature.feature_id || resolvedFeatureId;
  if (!featureId) return nothing;

  return html`
    <div class="actions">
      <a
        href="https://github.com/web-platform-dx/web-features/blob/main/features/${featureId}.yml"
        target="_top"
        >Learn More</a
      >
    </div>
  `;
}
