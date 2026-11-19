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
  const fields = []
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
  function restore({ field, key, initial }, reset = false) {
    const stored = get(key)
    if (stored === null && !reset) return
    const value = stored ?? initial
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
    if (drafts.has(form)) return
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
      initial: read(field),
    }))
    drafts.set(form, entries)
    for (const entry of entries) {
      const save = () => {
        const value = read(entry.field)
        put(entry.key, value === entry.initial ? null : value)
      }
      entry.field.addEventListener('input', save)
      entry.field.addEventListener('change', save)
      restore(entry)
    }
    fields.push(...entries)
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

  document.addEventListener('click', (event) => {
    const form = event.target
      .closest?.('a[data-discard-draft]')
      ?.closest('form')
    if (!form || event.defaultPrevented) return
    for (const entry of drafts.get(form) ?? []) put(entry.key, null)
  })
  consumeReceipt()
  document.addEventListener('DOMContentLoaded', () => {
    for (const form of document.forms) bind(form)
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
    if (event.persisted) for (const entry of fields) restore(entry, true)
  })
})()
