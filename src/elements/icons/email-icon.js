import { LitElement, svg } from "lit";

export class EmailIcon extends LitElement {
  static properties = {
    size: { type: String, attribute: "size" },
  };

  constructor() {
    super();
    this.size = "16";
    this.id = "email";
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return svg`
      <svg width=${this.size} viewBox="0 0 32 24" role="img" aria-labelledby="emailIconTitle">
        <title id="emailIconTitle">Send email to Tun</title>
        <mask id="envload-cut">
          <rect x="0" y="0" width="32" height="24" fill="white" />
          <polygon points="0 0 0 4.5 16 17.5 32 4.5 32 0" fill="black" />
        </mask>
        <mask id="envload-radius-cut">
          <g transform="translate(-16 0)">
            <rect x="0" y="0" width="32" height="24" fill="black" />
            <rect x="2.5" y="0" width="27" height="19" rx="3" fill="white" />
          </g>
        </mask>
        <g stroke="currentColor" stroke-width="0.6" fill="white">
          <g transform="translate(16 18)">
            <rect x="-11.5" y="-16" width="23" height="16" rx="1" transform="scale(1 0)">
              <desc>Paper</desc>
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 0; 1 0; 1 1"
                keyTimes="0; .3; 1"
                dur=".25s"
                begin="email.mouseenter"
                fill="freeze"
              />
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1; 1 0"
                dur=".15s"
                begin="email.mouseleave"
                fill="freeze"
              />
            </rect>
          </g>
        </g>
        <g stroke="currentColor" stroke-width="0" fill="currentColor">
          <rect mask="url(#envload-cut)" x="2.5" y="5" width="27" height="19" rx="3"></rect>
          <g transform="translate(16 5)">
            <polygon mask="url(#envload-radius-cut)" id="email-flap" points="-12.5 0 12.5 0 0 10.5">
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1; 1 0;"
                dur=".2s"
                begin="email.mouseenter"
                fill="freeze"
              />
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 0; 1 1"
                dur=".2s"
                begin="email.mouseleave"
                repeatCount="1"
                fill="freeze"
              />
            </polygon>
          </g>
        </g>
      </svg>
    `
  }
}

if (!customElements.get("email-icon")) {
  customElements.define("email-icon", EmailIcon);
}
