import { html, LitElement, svg } from "lit";


export class GitHubIcon extends LitElement {
  static properties = {
    size: { type: String, attribute: "size" },
    title: { type: String, attribute: "title" },
  };

  constructor() {
    super();
    this.size = "32";
    this.title = "Visit Tun's GitHub profile";
  }

  render() {
    return html`
      <svg width=${this.size} viewBox="0 0 32 24" role="img" aria-labelledby="githubIconTitle">
        <title id="githubIconTitle">${this.title}</title>
        <g stroke="currentColor" stroke-width="0" fill="currentColor">
          <rect id="head" x="5" y="2" width="22" height="14" rx="10">
            <animateTransform attributeName="transform" type="translate" 
              values="0 0; 0 1.5; 0 0" 
              keyTimes="0; .5; 1" 
              dur=".4s" 
              begin="github.mouseenter" 
              repeatCount="1" 
              fill="remove" />
          </rect>
          <path d="M 1 8 Q 0 4 1 1 Q 5 2 7 4.5" transform="translate(6, 0)" />
          <path d="M 7 8 Q 8 4 7 1 Q 3 2 1 4.5" transform="translate(18, 0)" />
          <rect x="11" y="15" width="10" height="20" rx="8" />
          <path id="tail" d="M 8 4 Q 4 5 3 3 Q 2 1 0 1" stroke-width="2" stroke-linecap="round" fill="none" transform="translate(4, 16)">
            <animateTransform attributeName="transform" type="rotate" 
              additive="sum" 
              values="0 7 4; 20 7 4; -5 7 4; 0 7 4" 
              keyTimes="0; .4; .8; 1" 
              dur=".6s" 
              begin="github.mouseenter" 
              repeatCount="1" 
              fill="remove" />
          </path>
        </g>
      </svg>
    `
  }
}

if (!customElements.get("github-icon")) {
  customElements.define("github-icon", GitHubIcon);
}
