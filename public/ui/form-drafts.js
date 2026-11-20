;(() => {
  const operator = document.body.dataset.operator
  if (!operator) return
  const prefix = 'helpdesk:form-draft:' + operator + ':'
  const pendingKey = prefix + 'pending'
  const storage = (() => {
    try {
      return window.sessionStorage
    } catch {
      return null
    }
  })()
  if (!storage) return

  // Unknown fields, uploaded files and authentication material never enter storage.
  const names = new Set([
    'displayName',
    'name',
    'body',
    'title',
    'product',
    'local',
    'domain',
    'address',
    'senderName',
    'showOperator',
    'role',
    'days',
    'label',
    'assignee',
    'subjectContains',
    'repository',
    'site',
    'responseTime',
    'untilLocal',
    'summary',
    'topic',
    'template',
    'language',
  ])
  const objectFields = new Set([
    'id',
    'number',
    'product',
    'email',
    'key',
    'label',
  ])
  const drafts = new WeakMap()
  function get(key) {
    try {
      return storage.getItem(key)
    } catch {
      return null
    }
  }
  function put(key, value) {
    try {
      if (value === null) storage.removeItem(key)
      else storage.setItem(key, value)
    } catch {
      /* The browser can still submit when its storage is full. */
    }
  }
  function read(field) {
    return field.type === 'checkbox' ? String(field.checked) : field.value
  }
  function forget({ field, key, companion }) {
    put(key, null)
    if (!companion) return
    put(companion, null)
    delete field.dataset.cannedSelections
  }
  function restoreSelections(field, companion, value) {
    if (!companion) return
    delete field.dataset.cannedSelections
    try {
      const entry = JSON.parse(get(companion) ?? 'null')
      if (entry?.value === value && typeof entry.selections === 'string')
        field.dataset.cannedSelections = entry.selections
    } catch {
      put(companion, null)
    }
  }
  function restore({ field, key, initial, companion }, reset = false) {
    const stored = get(key)
    if (stored === null && !reset) return
    const value = stored ?? initial
    restoreSelections(field, companion, value)
    if (read(field) === value) return
    if (field.type === 'checkbox') field.checked = value === 'true'
    else field.value = value
    if (field instanceof HTMLSelectElement)
      field.dispatchEvent(new Event('helpdesk:restore-choice'))
    if (field.closest('.composer') && !field.disabled) {
      field.dataset.restoringDraft = ''
      field.dispatchEvent(new Event('input', { bubbles: true }))
      delete field.dataset.restoringDraft
    }
  }
  function actionUrl(form) {
    return new URL(form.getAttribute('action') || location.href, location.href)
  }
  function bind(form) {
    // The router commits the destination URL before it mounts the new page.
    if (drafts.has(form) || form.closest('main[data-hydrating]')) return
    if (
      form.method !== 'post' ||
      actionUrl(form).pathname.startsWith('/tokens')
    )
      return
    const controls = [...form.elements]
    const editable = controls.filter(
      (field) =>
        names.has(field.name) &&
        !['hidden', 'file', 'password', 'submit'].includes(field.type) &&
        !field.readOnly,
    )
    if (!editable.length) return
    const action = actionUrl(form).pathname
    const screen =
      form.dataset.draftScreen ??
      (action === '/articles/edit' ? '/articles/editor' : location.pathname)
    const object = controls
      .filter((f) => f.type === 'hidden' && objectFields.has(f.name))
      .map((f) => [f.name, f.value])
    const slots = editable.map((f) => f.dataset.draftSlot || f.name)
    // Keep existing message-body drafts when the language selector is introduced.
    const identity = slots.filter((name) => name !== 'language')
    const scope = prefix + JSON.stringify([screen, action, object, identity])
    const entries = editable.map((field, i) => ({
      field,
      key: scope + ':' + slots[i],
      companion: slots[i] === 'reply' ? scope + ':reply:canned' : null,
      initial:
        field instanceof HTMLTextAreaElement ? field.defaultValue : read(field),
    }))
    drafts.set(form, entries)
    form.addEventListener('reset', (event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) for (const entry of entries) forget(entry)
      })
    })
    for (const entry of entries) {
      const save = () => {
        const value = read(entry.field)
        if (value === entry.initial) {
          forget(entry)
          return
        }
        put(entry.key, value)
        if (entry.companion) {
          const selections = entry.field.dataset.cannedSelections
          put(
            entry.companion,
            selections ? JSON.stringify({ value, selections }) : null,
          )
        }
      }
      entry.field.addEventListener('input', save)
      entry.field.addEventListener('change', save)
      if (read(entry.field) !== entry.initial) save()
      else restore(entry)
    }
  }

  function recordSubmission(source, target) {
    const keys = (drafts.get(source) ?? [])
      .map((entry) => entry.key)
      .filter((key) => get(key) !== null)
    if (!keys.length) return
    const id = crypto.randomUUID()
    put(pendingKey, JSON.stringify({ id, keys }))
    const url = actionUrl(target)
    url.searchParams.set('_draftSubmission', id)
    target.setAttribute('action', url.href)
  }

  function consumeReceipt() {
    const url = new URL(location.href)
    const id = url.searchParams.get('_draftSaved')
    if (!id) return
    try {
      const pending = JSON.parse(get(pendingKey) ?? 'null')
      if (pending?.id === id) {
        for (const key of pending.keys)
          if (key.startsWith(prefix)) put(key, null)
        put(pendingKey, null)
      }
    } catch {
      put(pendingKey, null)
    }
    url.searchParams.delete('_draftSaved')
    history.replaceState(history.state, '', url)
  }

  document.addEventListener(
    'click',
    (event) => {
      const form = event.target
        .closest?.('a[data-discard-draft]')
        ?.closest('form')
      if (
        !form ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      bind(form)
      for (const entry of drafts.get(form) ?? []) forget(entry)
    },
    true,
  )
  consumeReceipt()
  function restoreForms() {
    for (const form of document.forms) bind(form)
  }
  document.addEventListener('DOMContentLoaded', restoreForms)
  document.addEventListener('helpdesk:thread-receipt', () => {
    consumeReceipt()
    restoreForms()
  })
  document.addEventListener('helpdesk:page', () => {
    consumeReceipt()
    restoreForms()
  })
  document.addEventListener(
    'focusin',
    (event) => {
      if (event.target.form) bind(event.target.form)
    },
    true,
  )
  document.addEventListener('submit', (event) => {
    const form = event.target
    if (
      event.defaultPrevented ||
      form.matches('.composer') ||
      event.submitter?.value === 'preview'
    )
      return
    const source =
      actionUrl(form).pathname === '/actions/discard'
        ? form
            .closest('.draft-review')
            ?.querySelector('form[action="/actions/approve"]')
        : form
    if (source) recordSubmission(source, form)
  })
  document.addEventListener('helpdesk:submit-linked-draft', (event) =>
    recordSubmission(event.target, event.detail),
  )
  window.addEventListener('pageshow', (event) => {
    if (event.persisted)
      for (const form of document.forms)
        for (const entry of drafts.get(form) ?? []) restore(entry, true)
  })
})()
