const drawer = document.querySelector('#nav-drawer')
const sidebar = document.querySelector('#navigation')
const openDrawer = document.querySelector('[data-open-drawer]')
const mobileHeader = document.querySelector('.mobile-header')
for (const picker of document.querySelectorAll('.image-file-picker')) {
  const input = picker.querySelector('input[type=file]')
  const presentation = picker.querySelector('[data-file-presentation]')
  const filename = picker.querySelector('[data-file-name]')
  const update = () => {
    filename.textContent = input.files[0]?.name ?? '未選択'
  }
  input.addEventListener('change', update)
  input.form?.addEventListener('reset', () => queueMicrotask(update))
  update()
  presentation.hidden = false
}
for (const form of document.querySelectorAll(
  'form[action="/extensions/rules/add"]',
)) {
  const update = () => {
    const missing = !form.elements.label.value && !form.elements.assignee.value
    form.querySelector('[type=submit]').disabled = missing
    form.querySelector('[data-rule-requirement]').hidden = !missing
  }
  form.addEventListener('change', update)
  form.addEventListener('helpdesk:restore-choice', update, true)
  window.addEventListener('pageshow', update)
  update()
}
function enableCompactReply() {
  const replyArea = document.querySelector('#reply-area')
  if (
    !replyArea ||
    replyArea.querySelector('[data-expand-reply]')?.closest('[hidden]')
  )
    return

  replyArea.dataset.reading = ''
  const expand = () => {
    delete replyArea.dataset.reading
  }
  replyArea.addEventListener('focusin', (event) => {
    if (event.target.matches('textarea, [role=tab]')) expand()
  })
  replyArea
    .querySelector('[data-expand-reply]')
    ?.addEventListener('click', () => {
      expand()
      replyArea.querySelector('textarea:enabled')?.focus()
    })
}
enableCompactReply()
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
      event.preventDefault()
      clear(field)
      const error = document.createElement('small')
      error.className = 'field-error'
      error.id = 'error-' + field.name
      error.setAttribute('role', 'alert')
      if (field.validity.valueMissing)
        error.textContent = 'この項目を入力してください。'
      else if (field.validity.patternMismatch && field.title)
        error.textContent = field.title
      else if (field.type === 'email')
        error.textContent =
          'メールアドレスを name@example.com の形式で入力してください。'
      else error.textContent = '入力できる範囲の値を指定してください。'
      field.setAttribute('aria-invalid', 'true')
      field.setAttribute('aria-describedby', error.id)
      field.after(error)
      feedback.set(field, error)
      if (
        form.querySelector(
          'input:invalid, select:invalid, textarea:invalid',
        ) === field
      )
        field.focus()
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
  const count = document.querySelector('[data-inbox-count]')
  const pendingCount = document.querySelector('[data-inbox-count-pending]')
  let timer
  const reset = () => {
    clearTimeout(timer)
    inbox.removeAttribute('aria-busy')
    content.inert = false
    placeholder.hidden = true
    count.hidden = false
    pendingCount.hidden = true
  }
  const loading = () => {
    reset()
    timer = setTimeout(() => {
      inbox.setAttribute('aria-busy', 'true')
      content.inert = true
      placeholder.hidden = false
      count.hidden = true
      pendingCount.hidden = false
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

const relatedInfo = document.getElementById('related-info')
if (relatedInfo) {
  const narrow = matchMedia('(max-width: 1199px)')
  const trigger = document.querySelector('.context-drawer-trigger')
  const adapt = () => {
    relatedInfo.toggleAttribute('popover', narrow.matches)
    if (narrow.matches) {
      trigger.setAttribute('aria-expanded', 'false')
      trigger.setAttribute('popovertarget', 'related-info')
    } else {
      trigger.removeAttribute('aria-expanded')
      trigger.removeAttribute('popovertarget')
    }
  }
  adapt()
  narrow.addEventListener('change', adapt)
  trigger.addEventListener('click', () => {
    if (!narrow.matches) relatedInfo.focus({ preventScroll: false })
  })
  relatedInfo.addEventListener('toggle', () => {
    trigger.setAttribute(
      'aria-expanded',
      String(relatedInfo.matches(':popover-open')),
    )
  })
}

window.addEventListener('message', (event) => {
  if (event.origin !== 'null' || event.data?.type !== 'helpdesk:mail-height')
    return
  const height = event.data.height
  if (!Number.isSafeInteger(height) || height < 0) return
  const frame = [...document.querySelectorAll('iframe[data-mail-frame]')].find(
    (candidate) => candidate.contentWindow === event.source,
  )
  if (frame) frame.height = String(Math.min(16000, Math.max(1, height)))
})

for (const frame of document.querySelectorAll('iframe[data-mail-frame]')) {
  frame.contentWindow.postMessage('helpdesk:measure-mail', '*')
}

async function refreshDelivery(form) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    if (
      document.activeElement !== document.body ||
      document.querySelector('dialog[open], :popover-open')
    )
      return
    try {
      const response = await fetch('/actions/get', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams({ number: form.elements.number.value }),
      })
      if (!response.ok) return
      const { messages } = await response.json()
      if (
        messages.find((message) => message.id === form.elements.id.value)
          ?.delivery !== 'queued'
      ) {
        if (document.activeElement === document.body) location.reload()
        return
      }
    } catch {
      return
    }
  }
}

for (const form of document.querySelectorAll('form[data-undo-reply]')) {
  const button = form.querySelector('button')
  const timer = setTimeout(() => {
    form.hidden = true
    if (!button.disabled) void refreshDelivery(form)
  }, Number(form.dataset.undoReply))
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (button.disabled) return
    button.disabled = true
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error()
      const { number, body } = await response.json()
      const area = document.querySelector('textarea[data-draft-slot="reply"]')
      area.value = [area.value, body].filter(Boolean).join('\n\n')
      area.dataset.restoringDraft = ''
      area.dispatchEvent(new Event('input', { bubbles: true }))
      delete area.dataset.restoringDraft
      location.assign('/conversation/' + number + '?notice=undoReply')
    } catch {
      clearTimeout(timer)
      form.hidden = false
      form.setAttribute('role', 'alert')
      form.querySelector('span').textContent =
        '送信を取り消せませんでした。会話を再読み込みして送信状態を確認してください。'
    }
  })
}

const subject = document.querySelector('.thread-subject')
if (subject) {
  const button = document.createElement('button')
  button.className = 'subject-toggle'
  button.type = 'button'
  button.textContent = '全文を表示'
  button.hidden = true
  button.setAttribute('aria-expanded', 'false')
  subject.parentElement.after(button)
  const size = () => {
    if (subject.dataset.expanded !== 'true')
      button.hidden = subject.scrollHeight <= subject.clientHeight + 1
  }
  button.onclick = () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true'
    button.setAttribute('aria-expanded', String(expanded))
    subject.dataset.expanded = String(expanded)
    button.textContent = expanded ? '折りたたむ' : '全文を表示'
  }
  subject.onclick = () => {
    if (!button.hidden) button.click()
  }
  new ResizeObserver(size).observe(subject)
}

for (const choices of document.querySelectorAll('[data-retention-mode]')) {
  const form = choices.closest('form')
  const sync = () => {
    form.elements.days.disabled =
      form.elements.retentionMode.value === 'unlimited'
    form.elements.days.closest('[data-slot="field"]').hidden =
      form.elements.days.disabled
  }
  choices.addEventListener('change', sync)
  sync()
}
