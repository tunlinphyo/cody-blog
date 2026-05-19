const supportsInterpolateSize =
  globalThis.CSS?.supports?.("interpolate-size", "allow-keywords") ?? false

if (!supportsInterpolateSize) {
  const roots = new WeakSet()
  const observedDetails = new WeakSet()
  const closingDetails = new WeakMap()
  const pendingDetails = new Set()
  let pendingFrame = 0
  const resizeObserver =
    "ResizeObserver" in globalThis
      ? new ResizeObserver((entries) => {
          for (const { target } of entries) {
            scheduleDetailsUpdate(target)
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
    const summary = details.querySelector(":scope > summary")
    const lastChild = details.lastElementChild

    if (!summary || !lastChild || summary === lastChild) {
      return 0
    }

    const range = document.createRange()
    range.setStartAfter(summary)
    range.setEndAfter(lastChild)

    const height = Math.ceil(range.getBoundingClientRect().height)
    range.detach()

    return height
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

  const flushDetailsUpdates = () => {
    pendingFrame = 0

    for (const details of pendingDetails) {
      updateDetails(details)
    }

    pendingDetails.clear()
  }

  const scheduleDetailsUpdate = (details) => {
    if (!(details instanceof HTMLDetailsElement)) {
      return
    }

    pendingDetails.add(details)

    if (!pendingFrame) {
      pendingFrame = requestAnimationFrame(flushDetailsUpdates)
    }
  }

  const observeDetails = (details) => {
    if (observedDetails.has(details)) {
      return
    }

    observedDetails.add(details)
    resizeObserver?.observe(details)
    scheduleDetailsUpdate(details)
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
      cancelAnimationFrame(closing.frame)
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
    const frame = requestAnimationFrame(() => {
      details.dataset.closing = ""
      details.addEventListener("transitionend", onTransitionEnd)
    })

    const timer = setTimeout(() => finishClose(details), 350)
    closingDetails.set(details, { frame, onTransitionEnd, timer })
  }

  const openDetails = (details) => {
    cancelClose(details)
    details.style.setProperty("--details-content-height", "0px")
    details.open = true

    requestAnimationFrame(() => {
      scheduleDetailsUpdate(details)
    })
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
