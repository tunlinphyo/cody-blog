import { LitElement, html } from "lit";
import resetStyles from "../../assets/styles/reset.css?inline";
import utilsStyles from "../../assets/styles/utils.css?inline";
import resetButtonStyles from "./reset-button.css?inline";
import { litStaticStyles } from "../utils";

export class ResetButton extends LitElement {
  static styles = litStaticStyles(resetStyles, utilsStyles, resetButtonStyles);

  constructor() {
    super();
    this.longPressTimer = undefined;
    this.longPressTriggered = false;
    this.pressStartTime = undefined;
    this.lastPressDuration = 0;
    this.reloadAnimationFrame = undefined;
    this.reloadAnimationStart = undefined;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this.longPressTimer);
    this.stopReloadAnimation();
  }

  render() {
    return html`
      <button
        class="run"
        type="button"
        @click=${this.handleClick}
        @pointerdown=${this.handlePointerDown}
        @pointerup=${this.cancelLongPress}
        @pointercancel=${this.cancelLongPress}
        @pointerleave=${this.cancelLongPress}
      >
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
    `;
  }

  playReloadAnimation() {
    const button = this.renderRoot.querySelector("button");
    const icon = button?.querySelector("svg");
    if (!button || !icon || this.reloadAnimationFrame !== undefined) {
      return;
    }

    const rotate = (timestamp) => {
      this.reloadAnimationStart ??= timestamp;
      const rotation = ((timestamp - this.reloadAnimationStart) / 600) * 360;
      icon.style.rotate = `${rotation % 360}deg`;
      this.reloadAnimationFrame = window.requestAnimationFrame(rotate);
    };

    this.reloadAnimationFrame = window.requestAnimationFrame(rotate);
  }

  stopReloadAnimation() {
    if (this.reloadAnimationFrame !== undefined) {
      window.cancelAnimationFrame(this.reloadAnimationFrame);
      this.reloadAnimationFrame = undefined;
    }

    this.reloadAnimationStart = undefined;

    const button = this.renderRoot.querySelector("button");
    const icon = button?.querySelector("svg");
    if (!button || !icon) {
      return;
    }

    icon.style.rotate = "";
    button.disabled = false;
  }

  handleClick = (event) => {
    if (this.longPressTriggered) {
      this.longPressTriggered = false;
      return;
    }

    const message =
      this.lastPressDuration > 250 ? "Hold a little longer" : "Click and hold to reset";
    this.dispatchEvent(
      new CustomEvent("reset-hint", {
        detail: { message },
        bubbles: true,
        composed: true,
      }),
    );
    event.currentTarget.blur();
  };

  handlePointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    const button = event.currentTarget;

    window.clearTimeout(this.longPressTimer);
    this.longPressTriggered = false;
    this.pressStartTime = performance.now();
    this.lastPressDuration = 0;
    this.playReloadAnimation();

    this.longPressTimer = window.setTimeout(() => {
      this.longPressTriggered = true;
      button.disabled = true;
      this.dispatchEvent(new CustomEvent("reset-code", { bubbles: true, composed: true }));
    }, 1000);
  };

  cancelLongPress = () => {
    window.clearTimeout(this.longPressTimer);
    this.lastPressDuration =
      this.pressStartTime === undefined ? 0 : performance.now() - this.pressStartTime;
    this.pressStartTime = undefined;

    if (!this.longPressTriggered) {
      this.stopReloadAnimation();
    }
  };
}

if (!customElements.get("reset-button")) {
  customElements.define("reset-button", ResetButton);
}
