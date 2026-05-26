const supportsInterpolateSize =
  globalThis.CSS?.supports?.("interpolate-size", "allow-keywords") ?? false;

if (!supportsInterpolateSize && "document" in globalThis) {
  const closingClass = "closing";
  const animationOptions = {
    duration: 300,
    easing: "ease-out",
  };
  const animations = new WeakMap();

  const reduceMotion = () =>
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const getBlockBorderHeight = (details) => {
    const styles = globalThis.getComputedStyle(details);
    return (
      Number.parseFloat(styles.borderBlockStartWidth) +
      Number.parseFloat(styles.borderBlockEndWidth)
    );
  };

  const getSummaryHeight = (details) =>
    Math.ceil(details.querySelector("summary")?.getBoundingClientRect().height ?? 0) +
    getBlockBorderHeight(details);

  const getDetailsHeight = (details) => Math.ceil(details.getBoundingClientRect().height);

  const getOpenHeight = (details) => {
    const previousHeight = details.style.height;
    details.style.removeProperty("height");
    const height = Math.ceil(details.scrollHeight);
    details.style.height = previousHeight;
    return height + getBlockBorderHeight(details);
  };

  const cancelAnimation = (details) => {
    const active = animations.get(details);
    if (!active) {
      return;
    }

    animations.delete(details);
    active.animation.cancel();
  };

  const finishAnimation = (details, animation, isOpen, styles) => {
    if (animations.get(details)?.animation !== animation) {
      return;
    }

    details.style.boxSizing = styles.boxSizing;
    details.style.height = styles.height;
    details.style.overflow = styles.overflow;
    details.open = isOpen;
    details.classList.remove(closingClass);
    animations.delete(details);
  };

  const animateDetails = (details, isOpen) => {
    const active = animations.get(details);
    const from = getDetailsHeight(details);
    cancelAnimation(details);
    details.classList.toggle(closingClass, !isOpen);

    if (reduceMotion() || typeof details.animate !== "function") {
      details.open = isOpen;
      details.classList.remove(closingClass);
      return;
    }

    const wasOpen = details.open;
    const activeStyles = active?.styles;

    details.open = true;
    const to = isOpen ? getOpenHeight(details) : getSummaryHeight(details);

    if (from === to) {
      details.open = isOpen;
      details.classList.remove(closingClass);
      return;
    }

    const styles = {
      boxSizing: activeStyles?.boxSizing ?? details.style.boxSizing,
      height: activeStyles?.height ?? details.style.height,
      overflow: activeStyles?.overflow ?? details.style.overflow,
    };

    details.style.boxSizing = "border-box";
    details.style.height = `${from}px`;
    details.style.overflow = "clip";

    const animation = details.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      animationOptions,
    );

    animations.set(details, { animation, styles });
    animation.addEventListener("finish", () => finishAnimation(details, animation, isOpen, styles), {
      once: true,
    });
    animation.addEventListener("cancel", () => finishAnimation(details, animation, wasOpen, styles), {
      once: true,
    });
  };

  const closeNamedSiblings = (details) => {
    if (!details.name) {
      return;
    }

    const root = details.getRootNode();

    for (const sibling of root.querySelectorAll("details[name]")) {
      if (sibling !== details && sibling.name === details.name && sibling.open) {
        animateDetails(sibling, false);
      }
    }
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) {
      return;
    }

    const summary = event.target.closest("summary");
    const details = summary?.parentElement;

    if (!(details instanceof HTMLDetailsElement)) {
      return;
    }

    event.preventDefault();

    const willOpen = !details.open;

    if (willOpen) {
      closeNamedSiblings(details);
    }

    animateDetails(details, willOpen);
  });
}
