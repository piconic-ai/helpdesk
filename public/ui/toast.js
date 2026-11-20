// Keep operation results outside normal flow without moving forms out of their scope.
window.onHelpdeskPage((signal) => {
  let current
  let pointer
  let updateHover = () => {}
  document.addEventListener(
    'pointermove',
    (event) => {
      pointer = { x: event.clientX, y: event.clientY }
      updateHover()
    },
    { passive: true, signal },
  )
  let dispose = () => {}
  function availableComposerSpace(composer, toast) {
    const field = composer.querySelector('textarea:not(:disabled)')
    if (!field || field.value || field === document.activeElement) return
    const rect = field.getBoundingClientRect()
    if (
      rect.height >= toast.height &&
      rect.top >= 0 &&
      rect.bottom <= innerHeight
    )
      return rect.bottom - (rect.height - toast.height) / 2
  }
  function position(node) {
    const composer = document.querySelector('.composer')
    if (!composer || node.hidden) return
    node.style.removeProperty('bottom')
    node.removeAttribute('data-empty-composer')
    const toast = node.getBoundingClientRect()
    const editor = composer.getBoundingClientRect()
    if (
      toast.top >= editor.bottom ||
      toast.bottom <= editor.top ||
      toast.left >= editor.right ||
      toast.right <= editor.left
    )
      return
    const available = availableComposerSpace(composer, toast)
    node.toggleAttribute('data-empty-composer', available !== undefined)
    const footer = composer
      .querySelector('.composer-footer')
      .getBoundingClientRect()
    const top = editor.top >= toast.height + 8 ? editor.top : footer.top
    const bottom = innerHeight - (available ?? top - 8)
    // Snap the fixed notification to a device pixel while the editor settles.
    node.style.bottom =
      Math.floor(bottom * devicePixelRatio) / devicePixelRatio + 'px'
  }
  function show(node) {
    dispose()
    if (current && current !== node) current.hidden = true
    current = node
    if (node.hidden) node.hidden = false
    if (
      node.matches('[role=alert]') &&
      !node.querySelector('[data-dismiss-toast]')
    ) {
      const close = document.createElement('button')
      close.type = 'button'
      close.dataset.dismissToast = ''
      close.className = 'button-quiet'
      close.textContent = '閉じる'
      close.onclick = () => {
        node.hidden = true
      }
      node.append(close)
    }
    let timer
    let inside = false
    const stop = () => clearTimeout(timer)
    const resume = () => {
      stop()
      if (
        inside ||
        node.matches(':focus-within, [role=alert]') ||
        node.querySelector('button:not([data-dismiss-toast]), a[href]')
      )
        return
      timer = setTimeout(() => {
        node.hidden = true
      }, 5000)
    }
    updateHover = () => {
      if (node.hidden || !pointer) return
      const bounds = node.getBoundingClientRect()
      const over =
        pointer.x >= bounds.left &&
        pointer.x <= bounds.right &&
        pointer.y >= bounds.top &&
        pointer.y <= bounds.bottom
      if (over === inside) return
      inside = over
      if (over) stop()
      else resume()
    }
    const place = () => {
      position(node)
      updateHover()
    }
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    const composer = document.querySelector('.composer')
    const observer = new ResizeObserver(place)
    if (composer) {
      observer.observe(composer)
      composer.addEventListener('focusin', place)
      composer.addEventListener('input', place)
    }
    place()
    node.onfocusin = stop
    node.onfocusout = () => queueMicrotask(resume)
    dispose = () => {
      stop()
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
      composer?.removeEventListener('focusin', place)
      composer?.removeEventListener('input', place)
      observer.disconnect()
    }
    queueMicrotask(resume)
  }
  window.helpdeskToast = (message, error = false) => {
    let node = document.querySelector('[data-change-notice]')
    if (!node) {
      node = document.createElement('div')
      node.dataset.changeNotice = ''
      node.dataset.toast = ''
      document.querySelector('main').append(node)
    }
    node.className = error ? 'banner-error' : 'banner-success'
    node.setAttribute('role', error ? 'alert' : 'status')
    node.replaceChildren(message)
    show(node)
    return node
  }
  for (const toast of document.querySelectorAll('[data-toast]')) {
    if (!toast.hidden) show(toast)
    const observer = new MutationObserver(() => {
      if (!toast.hidden && (current !== toast || toast.matches('[role=alert]')))
        show(toast)
    })
    observer.observe(toast, {
      attributes: true,
      attributeFilter: ['hidden', 'role'],
    })
    signal.addEventListener('abort', () => observer.disconnect(), {
      once: true,
    })
  }
  signal.addEventListener('abort', () => dispose(), { once: true })
})
