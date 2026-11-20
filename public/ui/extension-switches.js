import { jsonMutation, pageQuery } from '/components/local-requests.js'

// A filtered card can disappear and return in its original group when undone.
function insertInOrder(parent, element) {
  let next = element.nextElementSibling
  while (next && !document.getElementById(next.id))
    next = next.nextElementSibling
  parent.insertBefore(element, next && document.getElementById(next.id))
}

function updateCard(snapshot, id) {
  const groups = document.getElementById('extension-groups')
  const card = document.getElementById(id)
  const fresh = snapshot.getElementById(id)
  if (card && fresh) {
    card.replaceChildren(...fresh.childNodes)
  } else if (card) {
    const grid = card.parentElement
    card.remove()
    if (groups && !grid.children.length) grid.parentElement.remove()
  } else if (groups && fresh) {
    const section = fresh.closest('section')
    const group = document.getElementById(section.id)
    if (group) insertInOrder(group.querySelector('[data-ui="metrics"]'), fresh)
    else insertInOrder(groups, section)
  }
  if (!groups) return
  const empty = snapshot.querySelector('#extension-groups > [data-ui="empty"]')
  groups.querySelector('[data-ui="empty"]')?.remove()
  if (empty) groups.append(empty)
  const count = '.heading-description'
  document.querySelector(count).textContent =
    snapshot.querySelector(count).textContent
}

function updateMenuLinks(current, fresh) {
  const byHref = (menu, link) =>
    menu.querySelector(
      'a[href="' + CSS.escape(link.getAttribute('href')) + '"]',
    )
  for (const link of current.querySelectorAll('a')) {
    if (!byHref(fresh, link)) link.remove()
  }
  let previous = current.querySelector('h2')
  for (const link of [...fresh.querySelectorAll('a')]) {
    const existing = byHref(current, link)
    if (!existing) previous.after(link)
    else if (!existing.isEqualNode(link))
      existing.replaceChildren(...link.childNodes)
    previous = existing ?? link
  }
}

function updateExtensionNavigation(snapshot) {
  const menu = '#navigation .sidebar-extensions'
  const current = document.querySelector(menu)
  const fresh = snapshot.querySelector(menu)
  if (fresh && current) updateMenuLinks(current, fresh)
  else if (fresh)
    document.querySelector('#navigation .sidebar-footer').before(fresh)
  else current?.remove()

  const link = '#navigation .sidebar-views a[href*="view=feedback"]'
  const feedback = document.querySelector(link)
  const next = snapshot.querySelector(link)
  if (next && !feedback)
    document.querySelector('#navigation .sidebar-views').append(next)
  else if (!next) feedback?.remove()
}

function showResult(snapshot) {
  const notice = snapshot.querySelector('main [data-toast]')
  if (!notice) return
  const message = document.createDocumentFragment()
  message.append(...notice.childNodes)
  window.helpdeskToast(message, notice.matches('[role="alert"]'))
}

async function change(form, body, signal) {
  const receipt = await jsonMutation(form.action, body)
  if (signal.aborted) return
  const url = new URL(receipt.location, location.origin)
  const filters = new URL(location.href).searchParams
  for (const key of ['q', 'filter']) {
    if (filters.has(key)) url.searchParams.set(key, filters.get(key))
  }
  const snapshot = await pageQuery(url, signal)
  if (signal.aborted) return
  const top = scrollY
  const restoreFocus = form.contains(document.activeElement)
  const id = 'extension-' + form.dataset.extensionChange
  updateCard(snapshot, id)
  updateExtensionNavigation(snapshot)
  showResult(snapshot)
  if (restoreFocus) {
    const target =
      document.getElementById(id)?.querySelector('button') ??
      document.querySelector('[data-change-notice] button') ??
      document.querySelector('main input[type="search"]')
    target?.focus({ preventScroll: true })
  }
  window.scrollTo({ top, behavior: 'instant' })
}

window.onHelpdeskPage((signal) => {
  const main = document.querySelector('main')
  if (!main?.querySelector('form[data-extension-change]')) return
  let queue = Promise.resolve()
  main.addEventListener(
    'submit',
    (event) => {
      const form = event.target
      if (
        !form.matches('form[data-extension-change]') ||
        event.defaultPrevented
      )
        return
      event.preventDefault()
      if (form.hasAttribute('aria-busy')) return
      form.setAttribute('aria-busy', 'true')
      const button = event.submitter
      const body = new FormData(form, button)
      queue = queue.then(async () => {
        if (signal.aborted) return
        try {
          await change(form, body, signal)
        } catch {
          if (!signal.aborted)
            window.helpdeskToast(
              '設定の変更結果を確認できませんでした。ページを開き直して設定を確認してください。',
              true,
            )
        } finally {
          form.removeAttribute('aria-busy')
        }
      })
    },
    { signal },
  )
})
