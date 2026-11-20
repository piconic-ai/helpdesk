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
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-drawer]')) closeDrawer()
  })
  drawer.addEventListener('close', () => {
    mobileHeader.after(sidebar)
    openDrawer.setAttribute('aria-expanded', 'false')
    if (document.activeElement === document.body) openDrawer.focus()
  })
  matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches && drawer.open) closeDrawer()
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

window.onHelpdeskPage((signal) => {
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
      const missing =
        !form.elements.label.value && !form.elements.assignee.value
      form.querySelector('[type=submit]').disabled = missing
      form.querySelector('[data-rule-requirement]').hidden = !missing
    }
    form.addEventListener('change', update)
    form.addEventListener('helpdesk:restore-choice', update, true)
    window.addEventListener('pageshow', update, { signal })
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
      window.navigation.addEventListener(
        'navigate',
        (event) => {
          const next = new URL(event.destination.url)
          if (
            !event.hashChange &&
            next.origin === location.origin &&
            next.pathname === '/'
          ) {
            loading()
            event.signal.addEventListener('abort', reset, { once: true })
          }
        },
        { signal },
      )
      window.navigation.addEventListener('navigateerror', reset, { signal })
    } else {
      document
        .querySelector('form[data-live-filters]')
        ?.addEventListener('submit', loading)
      window.addEventListener(
        'keydown',
        (event) => {
          if (event.key === 'Escape') reset()
        },
        { signal },
      )
    }
    window.addEventListener('pageshow', reset, { signal })
    document.addEventListener('helpdesk:filter-loading', loading, { signal })
    document.addEventListener('helpdesk:filter-settled', reset, { signal })
    signal.addEventListener('abort', reset, { once: true })
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
    narrow.addEventListener('change', adapt, { signal })
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

  for (const frame of document.querySelectorAll('iframe[data-mail-frame]')) {
    frame.contentWindow.postMessage('helpdesk:measure-mail', '*')
  }

  function canRefreshDelivery() {
    return (
      !signal.aborted &&
      document.activeElement?.matches('body, main, main h1, main h2') &&
      !document.querySelector('dialog[open], :popover-open')
    )
  }
  async function refreshDelivery(form) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
      if (!canRefreshDelivery()) return
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
          if (canRefreshDelivery())
            void window.helpdeskNavigate(location.href, { history: 'replace' })
          return
        }
      } catch {
        return
      }
    }
  }

  const schedules = Map.groupBy(
    document.querySelectorAll('form[data-undo-reply]'),
    (form) => form.elements.id.value,
  )
  for (const forms of schedules.values()) {
    const form = forms[0]
    const until = Date.now() + Number(form.dataset.undoReply)
    const stop = () => clearInterval(timer)
    const finish = () => {
      stop()
      forms.forEach((node) => {
        node.hidden = true
      })
      void refreshDelivery(form)
    }
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((until - Date.now()) / 1000))
      if (!seconds) return finish()
      for (const node of forms)
        node.querySelector('[data-remaining]').textContent =
          Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
    }
    const timer = setInterval(tick, 500)
    signal.addEventListener('abort', stop, { once: true })
    let submitting = false
    for (const node of forms) {
      node
        .querySelector('[data-dismiss-scheduled]')
        ?.addEventListener('click', () => {
          node.hidden = true
        })
      node.addEventListener('submit', async (event) => {
        event.preventDefault()
        if (submitting) return
        const action =
          event.submitter?.getAttribute('formaction') || node.action
        submitting = true
        try {
          const response = await fetch(action, {
            method: 'POST',
            body: new FormData(node),
            headers: { Accept: 'application/json' },
          })
          if (!response.ok) throw new Error()
          if (signal.aborted) return
          if (
            new URL(action, location.href).pathname === '/actions/sendReplyNow'
          ) {
            finish()
            return
          }
          stop()
          const { number, body, restoredDraft } = await response.json()
          if (!restoredDraft) {
            const area = document.querySelector(
              'textarea[data-draft-slot="reply"]',
            )
            area.value = [area.value, body].filter(Boolean).join('\n\n')
            area.form.inert = true
            area.dataset.restoringDraft = ''
            area.dispatchEvent(new Event('input', { bubbles: true }))
            delete area.dataset.restoringDraft
          }
          await window.helpdeskNavigate(
            '/conversation/' +
              number +
              '?notice=' +
              (restoredDraft ? 'undoApproval' : 'undoReply'),
          )
          if (restoredDraft)
            document
              .getElementById('approve-' + restoredDraft)
              ?.querySelector('textarea')
              ?.focus()
        } catch {
          submitting = false
          if (!signal.aborted)
            window.helpdeskToast(
              '送信予定を変更できませんでした。会話の送信状態を確認して、もう一度お試しください。',
              true,
            )
        }
      })
    }
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
    const observer = new ResizeObserver(size)
    observer.observe(subject)
    signal.addEventListener('abort', () => observer.disconnect(), {
      once: true,
    })
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
})
