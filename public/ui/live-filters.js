window.onHelpdeskPage((signal) => {
  const forms = [...document.querySelectorAll('form[data-live-filters]')]
  if (!forms.length) return
  const storageKey = 'helpdesk:filter-focus'
  const textField = (el) =>
    el instanceof HTMLInputElement && ['text', 'search'].includes(el.type)

  function changedSinceRender(field) {
    if (field instanceof HTMLSelectElement) {
      const options = [...field.options]
      if (field.multiple)
        return options.some(
          (option) => option.selected !== option.defaultSelected,
        )
      const initial =
        options.findLast((option) => option.defaultSelected) ??
        (field.size <= 1
          ? options.find((option) => option.matches(':enabled'))
          : undefined)
      return field.selectedOptions[0] !== initial
    }
    if (['checkbox', 'radio'].includes(field.type))
      return field.checked !== field.defaultChecked
    return field.value !== field.defaultValue
  }

  let pendingUrl
  function submit(form, lockChoices = false) {
    if (!form.reportValidity()) return
    const destination = new URL(form.action || location.pathname, location.href)
    destination.search = ''
    for (const [name, value] of new FormData(form))
      if (typeof value === 'string' && value)
        destination.searchParams.append(name, value)
    for (const control of form.querySelectorAll('[data-implicit-value]'))
      if (control.value === control.dataset.implicitValue)
        destination.searchParams.delete(control.name)
    if (destination.href === (pendingUrl ?? location.href)) return
    pendingUrl = destination.href
    const field = document.activeElement
    const popover = field?.closest(':popover-open')
    if (
      (textField(field) || field instanceof HTMLSelectElement || popover) &&
      field.form === form
    )
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
    if (lockChoices) form.inert = true
    document.dispatchEvent(new Event('helpdesk:filter-loading'))
    void window.helpdeskNavigate(destination.href).then(() => {
      if (pendingUrl !== destination.href) return
      pendingUrl = undefined
      form.inert = false
      form.dispatchEvent(
        new Event('helpdesk:filter-settled', { bubbles: true }),
      )
      if (destination.href === location.href)
        document.dispatchEvent(new Event('helpdesk:filter-focus'))
    })
  }

  for (const form of forms) {
    let timer
    let composing = false
    const schedule = () => {
      clearTimeout(timer)
      // Supersede the in-flight result before it can discard more recent typing.
      if (pendingUrl) submit(form)
      else timer = setTimeout(() => submit(form), 250)
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
      if (
        textField(event.target) &&
        event.target.name &&
        !composing &&
        !event.isComposing
      )
        schedule()
    })
    form.addEventListener('change', (event) => {
      if (textField(event.target)) return
      delete event.target.dataset.implicitValue
      clearTimeout(timer)
      if (!composing) submit(form, true)
    })
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      clearTimeout(timer)
      if (!composing) submit(form)
    })
    // The browser accepts edits before this deferred script attaches its listeners.
    const changed = [
      ...form.querySelectorAll(
        'input[name]:enabled, select[name]:enabled, textarea[name]:enabled',
      ),
    ].filter(changedSinceRender)
    for (const field of changed) delete field.dataset.implicitValue
    if (changed.length) schedule()
    addEventListener('pagehide', () => clearTimeout(timer), { signal })
    signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
  }
  document.addEventListener('helpdesk:filter-focus', () => restoreFocus(true), {
    signal,
  })
  if (!document.documentElement.hasAttribute('data-bf-navigating'))
    restoreFocus(false)
  function restoreFocus(afterNavigation) {
    const saved = sessionStorage.getItem(storageKey)
    if (!saved) return
    sessionStorage.removeItem(storageKey)
    // An operator can focus a field and select text before this script loads.
    if (
      !afterNavigation &&
      document.activeElement &&
      document.activeElement !== document.body
    )
      return
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
  }
})
