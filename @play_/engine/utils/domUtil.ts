/**
 * Plays a CSS animation on an element, ensuring it's visible before and hidden after.
 *
 * @param element The HTMLElement to animate.
 * @param endFn A callback function executed after animation completion and element is hidden.
 */
export function playAnimation(
  element: HTMLElement,
  endFn: () => void,
  dur = 3000,
): void {
  if (!element) {
    console.error("playAnimation: Element is null or undefined.")
    endFn() // Call callback even on error
    return
  }

  // Make element visible
  element.style.visibility = "visible"
  element.style.display = "block"

  const animationEndHandler = (event: Event) => {
    // Only proceed if this specific animation (triggered by 'playing' class) finished
    if (element.classList.contains("playing")) {
      element.removeEventListener("animationend", animationEndHandler) // Clean up listener

      // Hide the element
      element.style.visibility = "hidden"
      element.style.display = "none"

      // Execute the provided callback
      endFn?.()
    }
  }

  // Prepare for animation restart (remove and re-add class for consistent triggering)
  element.classList.remove("playing")
  void element.offsetWidth // Force reflow
  element.addEventListener("animationend", animationEndHandler, { once: true }) // Add listener for completion

  // Trigger the animation
  element.classList.add("playing")

  // Fallback: if animationend doesn't fire, ensure endFn is called
  setTimeout(() => {
    if (element.classList.contains("playing")) {
      console.warn(
        `Animation on element ${
          element.id || element.className || "unnamed"
        } timed out.`,
      )
      animationEndHandler(new Event("syntheticAnimationEnd")) // Manually trigger handler
    }
  }, dur) // Adjust timeout based on your longest animation
}

/**
 * Observes the size changes of a given HTML element using ResizeObserver,
 * with an optional throttling mechanism.
 *
 * @param {HTMLElement} element The HTML element to observe.
 * @param {Function} callback A callback function to execute on each throttled resize.
 * It receives an object with 'width' and 'height' as arguments.
 * @param {number} [throttleDelay=100] The delay in milliseconds to throttle the callback.
 * Defaults to 100ms.
 * @returns {ResizeObserver | null} The ResizeObserver instance, allowing for unobserving later,
 * or null if the element is invalid.
 */
export function observeDivSizeChange(element, callback, throttleDelay = 100) {
  if (!(element instanceof HTMLElement)) {
    console.error("The provided element is not a valid HTML element.")
    return null
  }

  // Ensure a callback function is provided
  if (typeof callback !== "function") {
    console.warn(
      "No callback function provided. The ResizeObserver will still fire, but no action will be taken on resize.",
    )
  }

  let timeoutId = null // To store the timeout ID for throttling

  // Create a new ResizeObserver instance
  const observer = new ResizeObserver((entries) => {
    // Clear any existing timeout to ensure the callback is only called after the delay
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      // We only expect one entry since we're observing a single element
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect

        // Execute the custom callback if provided
        if (typeof callback === "function") {
          callback({ width: Math.round(width), height: Math.round(height) })
        }

        // You can still keep a console log for debugging purposes if you wish
        // console.log(`Throttled size change for ID: ${element.id || 'N/A'}: Width = ${Math.round(width)}px, Height = ${Math.round(height)}px`);
      }
      timeoutId = null // Reset timeoutId after execution
    }, throttleDelay)
  })

  // Start observing the target element
  observer.observe(element)

  console.log(
    `Started observing element with ID: ${
      element.id || "No ID"
    } with a throttle delay of ${throttleDelay}ms.`,
  )

  // Return the observer instance so it can be unobserved if needed
  return observer
}
