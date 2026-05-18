import { LitElement, html } from "lit";
import utilsStyles from "../../assets/styles/utils.css?inline";
import previewStyles from "./article-slide.css?inline";
import { litStaticStyles } from "../utils.js";

export class ArticleSlide extends LitElement {
  static properties = {
    activeIndex: { type: Number },
    slideCount: { state: true },
  };

  static styles = litStaticStyles(utilsStyles, previewStyles);

  constructor() {
    super();
    this.activeIndex = 0;
    this.slideCount = 0;
    this.slideItems = [];
    this.skipScrollToActiveSlide = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.slideItems.forEach((item) => item.disconnectActiveObserver?.());
  }

  handleSlotChange(event) {
    this.slideItems.forEach((item) => item.disconnectActiveObserver?.());
    this.slideItems = event.target
      .assignedElements({ flatten: true })
      .filter((element) => element.localName === "article-slide-item");
    this.slideCount = this.slideItems.length;
    this.activeIndex = this.clampIndex(this.activeIndex);
    this.updateActiveSlide();
    this.observeSlideItems();
  }

  updated(changedProperties) {
    if (changedProperties.has("activeIndex") || changedProperties.has("slideCount")) {
      this.updateActiveSlide();
      if (this.skipScrollToActiveSlide) {
        this.skipScrollToActiveSlide = false;
      } else {
        this.scrollToActiveSlide();
      }
    }
  }

  clampIndex(index) {
    return Math.min(Math.max(index, 0), Math.max(this.slideCount - 1, 0));
  }

  goToIndex(index) {
    this.activeIndex = this.clampIndex(index);
  }

  goToPrev() {
    this.goToIndex(this.activeIndex - 1);
  }

  goToNext() {
    this.goToIndex(this.activeIndex + 1);
  }

  handleActiveSlide(event) {
    const index = this.clampIndex(event.detail.index);
    if (index === this.activeIndex) return;
    this.skipScrollToActiveSlide = true;
    this.activeIndex = index;
  }

  handleSlideToIndex(event) {
    const index = Number(event.detail?.index);
    if (!Number.isFinite(index)) return;
    this.goToIndex(index);
  }

  updateActiveSlide() {
    this.slideItems.forEach((item, index) => {
      item.index = index;
      item.toggleAttribute("active", index === this.activeIndex);
    });
    this.updateActiveSlideCardBg();
  }

  updateActiveSlideCardBg() {
    const card = this.slideItems[this.activeIndex]?.querySelector(":scope > *");
    const cardStyles = card ? getComputedStyle(card) : null;
    const cardBg = cardStyles?.getPropertyValue("--bg").trim() || cardStyles?.backgroundColor;

    if (cardBg) {
      this.style.setProperty("--active-slide-card-bg", cardBg);
    } else {
      this.style.removeProperty("--active-slide-card-bg");
    }
  }

  observeSlideItems() {
    const root = this.renderRoot.querySelector(".slide-container");
    if (!root) return;
    this.slideItems.forEach((item) => item.observeActive?.(root));
  }

  scrollToActiveSlide() {
    const root = this.renderRoot.querySelector(".slide-container");
    const activeSlide = this.slideItems[this.activeIndex];
    if (!root || !activeSlide) return;

    const rootRect = root.getBoundingClientRect();
    const activeRect = activeSlide.getBoundingClientRect();
    const left = root.scrollLeft + activeRect.left - rootRect.left - (root.clientWidth - activeRect.width) / 2;

    root.scrollTo({
      behavior: "smooth",
      left,
    });
  }

  render() {
    const isFirstSlide = this.activeIndex === 0;
    const isLastSlide = this.activeIndex >= this.slideCount - 1;

    return html`
      <button type="button" class="scroll-button" data-type="prev" ?disabled=${isFirstSlide} @click=${() => this.goToPrev()}>
        <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.4" />
          <line x1="10" y1="4" x2="2" y2="12" stroke="currentColor" stroke-width="1.4" class="top-arrow" />
          <line x1="10" y1="20" x2="2" y2="12" stroke="currentColor" stroke-width="1.4" class="bottom-arrow" />
        </svg>
        <span screenreader-only>Previous</span>
      </button>
      <button type="button" class="scroll-button" data-type="next" ?disabled=${isLastSlide} @click=${() => this.goToNext()}>
        <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.4" />
          <line x1="14" y1="4" x2="22" y2="12" stroke="currentColor" stroke-width="1.4" class="top-arrow" />
          <line x1="14" y1="20" x2="22" y2="12" stroke="currentColor" stroke-width="1.4" class="bottom-arrow" />
        </svg>
        <span screenreader-only>Next</span>
      </button>
      <section
        class="slide-container"
        @article-slide-item-active=${(event) => this.handleActiveSlide(event)}
        @article-slide-to-index=${(event) => this.handleSlideToIndex(event)}
      >
        <slot @slotchange=${(event) => this.handleSlotChange(event)}></slot>
      </section>
      <ul class="bullets">
        ${Array.from(
          { length: this.slideCount },
          (_, index) => html`
            <li>
              <button
                type="button"
                aria-current=${index === this.activeIndex ? "true" : "false"}
                ?disabled=${index === this.activeIndex}
                @click=${() => this.goToIndex(index)}
              >
                <span screenreader-only>${index + 1}</span>
              </button>
            </li>
          `,
        )}
      </ul>
    `;
  }
}

if (!customElements.get("article-slide")) {
  customElements.define("article-slide", ArticleSlide);
}
