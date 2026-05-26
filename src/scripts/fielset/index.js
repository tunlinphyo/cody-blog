import "./styles.css"

const labelSizeAnimationOptions = {
  duration: 250,
  easing: `ease-out`,
};

const toggleCloseButtonDisabled = (fieldset) => {
  const closeButton = fieldset?.querySelector("button.close-fieldset");
  if (closeButton) {
    closeButton.disabled = !fieldset.querySelector("fieldset input:checked");
  }
};

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const closeButton = target.closest(".fielset button.close-fieldset");
  const fieldset = closeButton?.closest(".fielset");
  const checkedInput = fieldset?.querySelector("fieldset input:checked");

  if (checkedInput) {
    checkedInput.checked = false;
    checkedInput.dispatchEvent(new Event("change", { bubbles: true }));
    toggleCloseButtonDisabled(fieldset);
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.matches(".fielset fieldset input")) {
    toggleCloseButtonDisabled(target.closest(".fielset"));
  }
});

const reduceMotion = () =>
  globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

class FieldsetLabelSizeAnimation {
  #animation;
  #bounds;
  #label;

  constructor(label) {
    this.#label = label;
    this.#bounds = this.#getBounds();
  }

  animateToCurrentSize() {
    if (this.#animation) {
      return;
    }

    const from = this.#bounds;
    const to = this.#getBounds();
    this.#bounds = to;

    if (
      !from ||
      from.width === to.width && from.height === to.height ||
      typeof this.#label.animate !== "function" ||
      reduceMotion()
    ) {
      return;
    }

    const previousBoxSizing = this.#label.style.boxSizing;
    const previousOverflow = this.#label.style.overflow;
    this.#label.style.boxSizing = "border-box";
    this.#label.style.overflow = "hidden";

    const animation = this.#label.animate(
      [
        { width: `${from.width}px`, height: `${from.height}px` },
        { width: `${to.width}px`, height: `${to.height}px` },
      ],
      labelSizeAnimationOptions,
    );

    this.#animation = animation;

    const cleanup = () => {
      if (this.#animation !== animation) {
        return;
      }

      this.#label.style.boxSizing = previousBoxSizing;
      this.#label.style.overflow = previousOverflow;
      this.#animation = undefined;
    };

    animation.addEventListener("finish", cleanup, { once: true });
    animation.addEventListener("cancel", cleanup, { once: true });
  }

  #getBounds() {
    const { width, height } = this.#label.getBoundingClientRect();
    return { width, height };
  }
}

const fieldsetLabels = document.querySelectorAll(".fielset fieldset label");

if (fieldsetLabels.length > 0 && "ResizeObserver" in globalThis) {
  const labelAnimations = new WeakMap();

  const resizeObserver = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      labelAnimations.get(target)?.animateToCurrentSize();
    }
  });

  for (const label of fieldsetLabels) {
    labelAnimations.set(label, new FieldsetLabelSizeAnimation(label));
    resizeObserver.observe(label);
  }
}
