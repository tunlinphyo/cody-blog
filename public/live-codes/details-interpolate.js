const supportsInterpolateSize =
  globalThis.CSS?.supports?.("interpolate-size", "allow-keywords") ?? false

if (!supportsInterpolateSize) {
  const roots = new WeakSet()
  const observedDetails = new WeakSet()
  const closingDetails = new WeakMap()
  const resizeObserver =
    "ResizeObserver" in globalThis
      ? new ResizeObserver((entries) => {
          for (const { target } of entries) {
            updateDetails(target)
          }
        })
      : null

  const styleText = `
    details[open]:not([data-closing])::details-content {
      height: var(--details-content-height, auto) !important;
    }
  `

  const injectStyle = (root) => {
    if (roots.has(root)) {
      return
    }

    roots.add(root)
    root.addEventListener("click", handleClick)

    const style = document.createElement("style")
    style.textContent = styleText

    if (root instanceof Document) {
      root.head.append(style)
      return
    }

    root.append(style)
  }

  const getContentHeight = (details) => {
    let height = 0

    for (const child of details.children) {
      if (child.localName === "summary") {
        continue
      }

      const rect = child.getBoundingClientRect()
      const style = getComputedStyle(child)
      height +=
        rect.height +
        Number.parseFloat(style.marginBlockStart) +
        Number.parseFloat(style.marginBlockEnd)
    }

    return Math.ceil(height)
  }

  const updateDetails = (details) => {
    if (!(details instanceof HTMLDetailsElement)) {
      return
    }

    injectStyle(details.getRootNode())

    if (!details.open) {
      details.style.removeProperty("--details-content-height")
      return
    }

    details.style.setProperty(
      "--details-content-height",
      `${getContentHeight(details)}px`,
    )
  }

  const observeDetails = (details) => {
    if (observedDetails.has(details)) {
      return
    }

    observedDetails.add(details)
    resizeObserver?.observe(details)
    updateDetails(details)
  }

  const scan = (root) => {
    injectStyle(
      root instanceof Document || root instanceof ShadowRoot
        ? root
        : root.getRootNode(),
    )

    if (root instanceof HTMLDetailsElement) {
      observeDetails(root)
    }

    for (const details of root.querySelectorAll("details")) {
      observeDetails(details)
    }

    for (const element of root.querySelectorAll("*")) {
      if (element.shadowRoot) {
        scan(element.shadowRoot)
      }
    }
  }

  const cancelClose = (details) => {
    const closing = closingDetails.get(details)

    if (closing) {
      clearTimeout(closing.timer)
      details.removeEventListener("transitionend", closing.onTransitionEnd)
      closingDetails.delete(details)
    }

    delete details.dataset.closing
  }

  const finishClose = (details) => {
    cancelClose(details)
    details.open = false
    details.style.removeProperty("--details-content-height")
  }

  const closeDetails = (details) => {
    const onTransitionEnd = (event) => {
      if (event.pseudoElement === "::details-content") {
        finishClose(details)
      }
    }

    cancelClose(details)
    details.style.setProperty(
      "--details-content-height",
      `${getContentHeight(details)}px`,
    )
    forceLayout(details)
    details.dataset.closing = ""
    details.addEventListener("transitionend", onTransitionEnd)

    const timer = setTimeout(() => finishClose(details), 350)
    closingDetails.set(details, { onTransitionEnd, timer })
  }

  const openDetails = (details) => {
    cancelClose(details)
    details.style.setProperty("--details-content-height", "0px")
    details.open = true

    requestAnimationFrame(() => {
      updateDetails(details)
    })
  }

  function forceLayout(element) {
    element.getBoundingClientRect()
  }

  function handleClick(event) {
    if (event.defaultPrevented || !(event.target instanceof Element)) {
      return
    }

    const summary = event.target.closest("summary")
    const details = summary?.parentElement

    if (!(details instanceof HTMLDetailsElement)) {
      return
    }

    event.preventDefault()

    if (details.open) {
      closeDetails(details)
      return
    }

    openDetails(details)
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.target instanceof HTMLDetailsElement
      ) {
        updateDetails(mutation.target)
        continue
      }

      for (const node of mutation.addedNodes) {
        if (node instanceof Element || node instanceof ShadowRoot) {
          scan(node)
        }
      }
    }
  })

  observer.observe(document, {
    attributeFilter: ["open"],
    attributes: true,
    childList: true,
    subtree: true,
  })

  addEventListener("resize", () => scan(document), { passive: true })

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => scan(document), {
      once: true,
    })
  } else {
    scan(document)
  }
}
