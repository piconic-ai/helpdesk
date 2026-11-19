// Keep operation results outside normal flow without moving forms out of their scope.
;(() => {
  let current
  let pointer
  let updateHover = () => {}
  document.addEventListener(
    'pointermove',
    (event) => {
      pointer = { x: event.clientX, y: event.clientY }
      updateHover()
    },
    { passive: true },
  )
  let dispose = () => {}
  function position(node) {
    const tools = document.querySelector('.composer-tools')
    if (!tools || node.hidden) return
    node.style.removeProperty('bottom')
    const toast = node.getBoundingClientRect()
    const bar = tools.getBoundingClientRect()
    if (
      toast.top < bar.bottom &&
      toast.bottom > bar.top &&
      toast.left < bar.right &&
      toast.right > bar.left
    )
      node.style.bottom = innerHeight - bar.top + 8 + 'px'
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
    if (composer) observer.observe(composer)
    place()
    node.onfocusin = stop
    node.onfocusout = () => queueMicrotask(resume)
    dispose = () => {
      stop()
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
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
    new MutationObserver(() => {
      if (!toast.hidden && (current !== toast || toast.matches('[role=alert]')))
        show(toast)
    }).observe(toast, { attributes: true, attributeFilter: ['hidden', 'role'] })
  }
})()
