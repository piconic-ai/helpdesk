import { syncPageCounts } from '/components/local-requests.js'

function syncEntries(list, next, before = null) {
  const entries = new Map(
    [...list.children]
      .filter((n) => n.dataset.threadEntry)
      .map((n) => [n.dataset.threadEntry, n]),
  )
  const incoming = [...next.children].filter((n) => n.dataset.threadEntry)
  let anchor = before
  for (const source of incoming.reverse()) {
    const key = source.dataset.threadEntry
    let node = entries.get(key)
    entries.delete(key)
    if (node && key === 'fold') {
      node.querySelector('summary').textContent =
        source.querySelector('summary').textContent
      syncEntries(node, source)
    } else if (
      !node ||
      node.dataset.threadRevision !== source.dataset.threadRevision
    ) {
      const replacement = source.cloneNode(true)
      if (node) node.replaceWith(replacement)
      node = replacement
    }
    if (node.parentElement !== list || node.nextElementSibling !== anchor)
      list.insertBefore(node, anchor)
    anchor = node
  }
  for (const old of entries.values()) old.remove()
}

function syncChoices(part, fresh) {
  const choices = part.querySelector('[data-ui=candidates]')
  const updated = fresh.querySelector('[data-ui=candidates]')
  if (!choices || !updated) return false
  const trigger = part.querySelector('[popovertarget]')
  trigger.replaceChildren(...fresh.querySelector('[popovertarget]').childNodes)
  const focused = document.activeElement.closest('form')
  const value = choices.contains(focused)
    ? (focused.elements.label?.value ?? focused.elements.email?.value)
    : null
  choices.replaceChildren(...updated.childNodes)
  const panel = choices.closest('[popover]')
  panel.dispatchEvent(
    new CustomEvent('helpdesk:menu-updated', { bubbles: true }),
  )
  panel.querySelector('[data-menu-search]')?.dispatchEvent(new Event('input'))
  if (value != null) {
    const form = [...choices.querySelectorAll('form')].find(
      (f) => (f.elements.label?.value ?? f.elements.email?.value) === value,
    )
    form?.querySelector('button')?.focus({ preventScroll: true })
  }
  return true
}

function syncAttributes(doc) {
  for (const next of doc.querySelectorAll('[data-thread-part][data-version]')) {
    const part = document.querySelector(
      '[data-thread-part="' + next.dataset.threadPart + '"]',
    )
    if (!part || part.dataset.version === next.dataset.version) continue
    if (!syncChoices(part, next)) part.replaceChildren(...next.childNodes)
    part.dataset.version = next.dataset.version
  }
}

function syncRelated(next) {
  const id = next.closest('[data-extension]').id
  const current = document
    .getElementById(id)
    ?.querySelector('[data-thread-part="extension-summary"]')
  if (!current) return
  if (!current.isEqualNode(next)) {
    current.replaceChildren(...next.childNodes)
    if (id === 'extension-issues')
      current
        .closest('[data-extension]')
        .querySelector('[data-issue-picker]')
        ?.dispatchEvent(new Event('helpdesk:issue-links'))
  }
  const panel = current.closest('[data-extension]')
  const incoming = next.closest('[data-extension]')
  const operations = new Map(
    [...panel.querySelectorAll('[data-context-operation]')].map((node) => [
      node.dataset.contextOperation,
      node,
    ]),
  )
  for (const node of incoming.querySelectorAll('[data-context-operation]')) {
    if (operations.delete(node.dataset.contextOperation)) continue
    panel.insertBefore(
      node.cloneNode(true),
      panel.querySelector('[data-issue-picker]'),
    )
  }
  for (const stale of operations.values()) stale.remove()
}

function syncSteps(doc) {
  for (const next of doc.querySelectorAll(
    '.thread-toolbar [aria-label$="未対応へ"]',
  )) {
    const current = document.querySelector(
      '.thread-toolbar [aria-label="' + next.getAttribute('aria-label') + '"]',
    )
    if (current && !current.isEqualNode(next)) current.replaceWith(next)
  }
}

export function syncThread(doc) {
  syncAttributes(doc)
  for (const next of doc.querySelectorAll(
    '#related-info [data-extension] [data-thread-part="extension-summary"]',
  ))
    syncRelated(next)
  syncSteps(doc)
  const timeline = document.querySelector('#thread-messages')
  syncEntries(timeline, doc.querySelector('#thread-messages'))
  const area = document.querySelector('#reply-area')
  const receipt = area.querySelector('[data-thread-part="receipt"]')
  syncEntries(area, doc.querySelector('#reply-area'), receipt)
  const step = area.querySelector('.thread-next')
  const nextStep = doc.querySelector('.thread-next')
  if (!step.isEqualNode(nextStep)) step.replaceChildren(...nextStep.childNodes)
  area.querySelector('.composer').dispatchEvent(
    new CustomEvent('helpdesk:thread-state', {
      detail: {
        closed: doc.body.dataset.threadClosed === 'true',
      },
    }),
  )
  syncPageCounts(doc)
}
