;(() => {
  const forms = [...document.querySelectorAll('form[data-live-filters]')]
  if (!forms.length) return
  const storageKey = 'helpdesk:filter-focus'
  const textField = (el) =>
    el instanceof HTMLInputElement && ['text', 'search'].includes(el.type)

  function submit(form) {
    if (!form.reportValidity()) return
    const destination = new URL(form.action || location.pathname, location.href)
    destination.search = ''
    for (const [name, value] of new FormData(form))
      if (typeof value === 'string' && value)
        destination.searchParams.append(name, value)
    for (const control of form.querySelectorAll('[data-implicit-value]'))
      if (control.value === control.dataset.implicitValue)
        destination.searchParams.delete(control.name)
    if (destination.href === location.href) return
    const field = document.activeElement
    const popover = field?.closest(':popover-open')
    if ((textField(field) || popover) && field.form === form)
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          url: destination.href,
          name: field.name,
          popover: popover?.id,
          start: field.selectionStart,
          end: field.selectionEnd,
        }),
      )
    location.assign(destination)
  }

  for (const form of forms) {
    let timer
    let composing = false
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => submit(form), 250)
    }
    form.addEventListener('compositionstart', () => {
      composing = true
      clearTimeout(timer)
    })
    form.addEventListener('compositionend', (event) => {
      composing = false
      if (textField(event.target)) schedule()
    })
    form.addEventListener('input', (event) => {
      if (textField(event.target) && !composing && !event.isComposing)
        schedule()
    })
    form.addEventListener('change', (event) => {
      if (textField(event.target)) return
      delete event.target.dataset.implicitValue
      clearTimeout(timer)
      if (!composing) submit(form)
    })
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      clearTimeout(timer)
      if (!composing) submit(form)
    })
    addEventListener('pagehide', () => clearTimeout(timer))
  }
  const saved = sessionStorage.getItem(storageKey)
  if (!saved) return
  sessionStorage.removeItem(storageKey)
  try {
    const focus = JSON.parse(saved)
    if (focus.url !== location.href) return
    const field = forms
      .flatMap((form) => [...form.elements])
      .find((el) => el.name === focus.name)
    const popover = field?.closest('[popover]')
    if (popover && popover.id === focus.popover) popover.showPopover()
    field?.focus({ preventScroll: true })
    if (textField(field)) field.setSelectionRange(focus.start, focus.end)
  } catch {
    // A stale browser session can have an older focus record.
  }
})()
