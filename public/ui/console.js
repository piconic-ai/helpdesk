const drawer = document.querySelector('#nav-drawer')
const sidebar = document.querySelector('#navigation')
const openDrawer = document.querySelector('[data-open-drawer]')
const mobileHeader = document.querySelector('.mobile-header')
function closeDrawer() {
  drawer.close()
}
if (drawer && sidebar && openDrawer) {
  openDrawer.addEventListener('click', () => {
    drawer.append(sidebar)
    drawer.showModal()
    sidebar.querySelector('[data-close-drawer]')?.focus()
    openDrawer.setAttribute('aria-expanded', 'true')
  })
  sidebar
    .querySelector('[data-close-drawer]')
    ?.addEventListener('click', closeDrawer)
  drawer.addEventListener('close', () => {
    mobileHeader.after(sidebar)
    openDrawer.setAttribute('aria-expanded', 'false')
    openDrawer.focus()
  })
  matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches && drawer.open) closeDrawer()
  })
}
for (const form of document.querySelectorAll(
  '[data-ui-page] form[method=post]',
)) {
  const feedback = new Map()
  const clear = (field) => {
    feedback.get(field)?.remove()
    feedback.delete(field)
    field.removeAttribute('aria-invalid')
    field.removeAttribute('aria-describedby')
  }
  form.addEventListener(
    'invalid',
    (event) => {
      const field = event.target
      if (!(field instanceof HTMLInputElement)) return
      clear(field)
      const error = document.createElement('small')
      error.className = 'field-error'
      error.id = 'error-' + field.name
      error.setAttribute('role', 'alert')
      if (field.validity.valueMissing)
        error.textContent = 'この項目を入力してください。'
      else if (field.type === 'email')
        error.textContent =
          'メールアドレスを name@example.com の形式で入力してください。'
      else error.textContent = '入力できる範囲の値を指定してください。'
      field.setAttribute('aria-invalid', 'true')
      field.setAttribute('aria-describedby', error.id)
      field.after(error)
      feedback.set(field, error)
    },
    true,
  )
  form.addEventListener('input', (event) => {
    if (event.target.validity?.valid && feedback.has(event.target))
      clear(event.target)
  })
}
const forget = document.querySelector('[data-forget]')
if (forget) {
  const dialog = forget.querySelector('dialog')
  function confirmDeletion() {
    if (!forget.reportValidity()) return
    forget.querySelector('[data-delete-contact]').textContent =
      forget.elements.contact.selectedOptions[0]?.textContent ?? ''
    forget.querySelector('[data-delete-count]').textContent =
      forget.elements.contact.selectedOptions[0]?.dataset.conversations ?? '0'
    dialog.showModal()
  }
  forget
    .querySelector('[data-confirm-forget]')
    .addEventListener('click', confirmDeletion)
  forget
    .querySelector('[data-cancel-forget]')
    .addEventListener('click', () => dialog.close())
  forget.addEventListener('submit', (event) => {
    if (!dialog.open) {
      event.preventDefault()
      confirmDeletion()
    }
  })
}
const inbox = document.querySelector('[data-inbox-results]')
if (inbox) {
  const content = inbox.querySelector('[data-inbox-content]')
  const placeholder = inbox.querySelector('[data-inbox-loading]')
  let timer
  const reset = () => {
    clearTimeout(timer)
    inbox.removeAttribute('aria-busy')
    content.hidden = false
    placeholder.hidden = true
  }
  const loading = () => {
    reset()
    timer = setTimeout(() => {
      inbox.setAttribute('aria-busy', 'true')
      content.hidden = true
      placeholder.hidden = false
    }, 180)
  }
  if (window.navigation) {
    window.navigation.addEventListener('navigate', (event) => {
      const next = new URL(event.destination.url)
      if (
        !event.hashChange &&
        next.origin === location.origin &&
        next.pathname === '/'
      ) {
        loading()
        event.signal.addEventListener('abort', reset, { once: true })
      }
    })
    window.navigation.addEventListener('navigateerror', reset)
  } else {
    document
      .querySelector('form[data-live-filters]')
      ?.addEventListener('submit', loading)
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') reset()
    })
  }
  window.addEventListener('pageshow', reset)
}
document
  .querySelector('[data-inbox-view] [data-ui=row-list]')
  ?.addEventListener('click', (event) => {
    const row = event.target.closest('a.conversation-row')
    if (!row) return
    row
      .closest('ul')
      .querySelector('.conversation-row-selected')
      ?.classList.remove('conversation-row-selected')
    row.classList.add('conversation-row-selected')
  })

const reportFilter = document.querySelector('form[action="/metrics"]')
reportFilter?.addEventListener('change', (event) => {
  if (event.target.type === 'date')
    reportFilter.elements.period.value = 'custom'
})
