import { LitElement, svg } from "lit";

export class LinkedInIcon extends LitElement {
  static properties = {
    size: { type: String, attribute: "size" },
  };

  constructor() {
    super();
    this.size = "16";
    this.id = "linkedin";
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return svg`
      <svg width=${this.size} viewBox="0 0 32 24" role="img" aria-labelledby="linkedinIconTitle">
        <title id="linkedinIconTitle">Connect with Tun on LinkedIn</title>
        <g fill="currentColor">
          <ellipse cx="5.25" cy="3.5" ry="3.5" rx="4">
            <desc>Top part of i</desc>
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1 1; 1.2 1.4"
              dur=".2s"
              begin="linkedin.mouseenter"
              repeatCount="1"
              fill="freeze"
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1.2 1.4; 1 1"
              dur=".2s"
              begin="linkedin.mouseleave"
              repeatCount="1"
              fill="freeze"
            />
          </ellipse>
          <g transform="translate(0 24)">
            <rect x="1.75" y="-16.5" width="6.5" height="16.5">
              <desc>Bottom part of i</desc>
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1; 1.2 .8"
                dur=".2s"
                begin="linkedin.mouseenter"
                repeatCount="1"
                fill="freeze"
              />
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1.2 .8; 1 1"
                dur=".2s"
                begin="linkedin.mouseleave"
                repeatCount="1"
                fill="freeze"
              />
            </rect>
          </g>
          <g transform="translate(29.1 24)">
            <g>
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1; .9 .8"
                dur=".2s"
                begin="linkedin.mouseenter"
                repeatCount="1"
                fill="freeze"
              />
              <animateTransform
                attributeName="transform"
                type="scale"
                values=".9 .8; 1 1"
                dur=".2s"
                begin="linkedin.mouseleave"
                repeatCount="1"
                fill="freeze"
              />
              <path
                fill="currentColor"
                transform="translate(-29.1 -24)"
                d="M23.75 6.9c-3.23 0-4.96 1.4-5.68 2.52V7.5h-6.57
                  c.09 1.4 0 16.5 0 16.5h6.57v-8.8
                  c0-.5.06-1 .22-1.35.49-.95 1.48-1.86 3.12-1.86
                  2.23 0 3.12 1.38 3.12 3.38V24h6.57v-9.1
                  c0-4.88-2.7-8-7.35-8z"
              />
            </g>
          </g>
        </g>
      </svg>
    `
  }
}

if (!customElements.get("linked-in-icon")) {
  customElements.define("linked-in-icon", LinkedInIcon);
}
