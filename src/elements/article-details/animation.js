const hostSizeAnimationOptions = {
  duration: 420,
  easing: `linear(
    0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%,
    0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.006 50.1%, 1.015 55%, 1.017 63.9%,
    1.001
  )`,
};

const sameHostSize = (from, to) =>
  from.width === to.width &&
  from.height === to.height &&
  from.marginInlineStart === to.marginInlineStart &&
  from.marginInlineEnd === to.marginInlineEnd;

export class HostSizeAnimation {
  #host;
  #hostBounds;
  #hostSizeAnimation;

  constructor(host) {
    this.#host = host;
  }

  cancel() {
    this.#hostSizeAnimation?.cancel();
  }

  saveHostBounds() {
    this.#hostBounds = this.#getHostBounds();
  }

  animateHostSizeChange() {
    const from = this.#hostSizeAnimation ? this.#getHostBounds() : this.#hostBounds;
    this.#hostSizeAnimation?.cancel();

    this.saveHostBounds();
    const to = this.#hostBounds;

    if (
      !from ||
      !to ||
      sameHostSize(from, to) ||
      typeof this.#host.animate !== "function" ||
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const previousBoxSizing = this.#host.style.boxSizing;
    const previousOverflow = this.#host.style.overflow;
    this.#host.style.boxSizing = "border-box";
    this.#host.style.overflow = "hidden";
    this.#host.classList.add("animation");

    const animation = this.#host.animate(
      [
        {
          width: `${from.width}px`,
          height: `${from.height}px`,
          marginInlineStart: from.marginInlineStart,
          marginInlineEnd: from.marginInlineEnd,
        },
        {
          width: `${to.width}px`,
          height: `${to.height}px`,
          marginInlineStart: to.marginInlineStart,
          marginInlineEnd: to.marginInlineEnd,
        },
      ],
      hostSizeAnimationOptions,
    );

    this.#hostSizeAnimation = animation;

    const cleanup = () => {
      if (this.#hostSizeAnimation !== animation) {
        return;
      }

      this.#host.style.boxSizing = previousBoxSizing;
      this.#host.style.overflow = previousOverflow;
      this.#host.classList.remove("animation");
      this.#hostSizeAnimation = undefined;
    };

    animation.addEventListener("finish", cleanup, { once: true });
    animation.addEventListener("cancel", cleanup, { once: true });
  }

  #getHostBounds() {
    const { width, height } = this.#host.getBoundingClientRect();
    const { marginInlineStart, marginInlineEnd } = getComputedStyle(this.#host);
    return { width, height, marginInlineStart, marginInlineEnd };
  }
}
