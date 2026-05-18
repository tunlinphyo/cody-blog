import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import resetButtonStyles from "./reset-button.css?inline";
import { litStaticStyles } from "../utils";

export class ResetButton extends LitElement {
  static styles = litStaticStyles(utilsStyles, resetButtonStyles);

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
        <svg viewBox="0 0 24 24" width="24" height="24">
          <mask id="reload-mask:000">
            <rect x="0" y="0" width="24" height="24" rx="0" stroke-width="0" fill="white" />
            <polygon points="13 2 21 2 3 22 11 22" fill="black" />
          </mask>
          <g stroke="currentColor" stroke-width="1">
            <circle mask="url(#reload-mask:000)" cx="12" cy="12" r="7.5" fill="none" stroke-width="1.5" />
            <polygon points="11 2.5 11 6.5 14.5 4.5" fill="currentColor" transform="rotate(12 11 4.5)" />
            <polygon points="13 21.5 13 17.5 9.5 19.5" fill="currentColor" transform="rotate(12 13 19.5)" />
          </g>
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
