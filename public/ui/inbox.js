window.onHelpdeskPage((signal) => {
  const operator = document.body.dataset.operator
  if (!operator) return
  const key = 'inbox-change:' + operator
  const pageKey = location.pathname + location.search
  const inbox = document.querySelector('[data-inbox-view]')
  const bar = inbox?.querySelector('.inbox-bulk')
  const boxes = [...document.querySelectorAll('.row-select input')]
  const all = inbox?.querySelector('[data-select-all]')
  const selected = () =>
    boxes.filter((box) => box.checked).map((box) => Number(box.value))
  function bulkLabelStates() {
    const sets = boxes
      .filter((box) => box.checked)
      .map((box) => new Set(JSON.parse(box.dataset.labels)))
    for (const button of bar.querySelectorAll('[data-bulk-label]')) {
      const count = sets.filter((labels) =>
        labels.has(button.dataset.bulkLabel),
      ).length
      button.setAttribute(
        'aria-pressed',
        count ? (count === sets.length ? 'true' : 'mixed') : 'false',
      )
    }
  }
  function refresh() {
    if (!bar) return
    bulkLabelStates()
    const assignees = new Set(
      boxes.filter((box) => box.checked).map((box) => box.dataset.assignee),
    )
    for (const candidate of bar.querySelectorAll('[data-change="assign"]'))
      candidate.setAttribute(
        'aria-pressed',
        assignees.has(candidate.dataset.value)
          ? assignees.size === 1
            ? 'true'
            : 'mixed'
          : 'false',
      )
    const size = selected().length
    bar.inert = !size
    bar.setAttribute('aria-hidden', String(!size))
    const filters = inbox.querySelector('[data-ui=filters]')
    filters.inert = !!size
    if (all) {
      all.checked = boxes.length > 0 && size === boxes.length
      all.indeterminate = size > 0 && size < boxes.length
    }
    bar.querySelector('[data-selected-count]').textContent = size + '件を選択中'
  }
  const verbs = {
    assign: '担当者を変更しました。',
    add: 'ラベルを付けました。',
    remove: 'ラベルを外しました。',
    closed: '完了にしました。',
    reopened: '未対応に戻しました。',
    marked_spam: '迷惑メールにしました。',
    unmarked_spam: '迷惑メールを解除しました。',
    undo: '元に戻しました。',
  }
  let pending = false
  async function perform(change, notice) {
    if (pending) return
    pending = true
    try {
      const undo = 'token' in change
      const response = await fetch('/inbox/' + (undo ? 'undo' : 'change'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(change),
      })
      if (!response.ok)
        throw new Error(
          '現在の状態に操作を適用できません。画面を更新して対象を確認してください。',
        )
      const receipt = await response.json()
      if (signal.aborted) return
      await showChangeReceipt(change, receipt, notice, undo)
    } catch (error) {
      if (!signal.aborted) window.helpdeskToast(error.message, true)
      pending = false
    }
  }
  async function showChangeReceipt(change, receipt, notice, undo) {
    const target = new URL(location.href)
    if (!inbox) target.searchParams.delete('notice')
    const message = receipt.count
      ? receipt.count + '件 · ' + verbs[undo ? 'undo' : change.action]
      : '対象はすでにこの状態です。'
    sessionStorage.setItem(
      key,
      JSON.stringify({
        path: target.pathname + target.search,
        token: undo || !receipt.count ? null : receipt.token,
        message: notice && receipt.count ? verbs[change.action] : message,
        selected: selected(),
        focus: document.activeElement.closest('.inbox-item')?.dataset.number,
        position: [...document.querySelectorAll('.inbox-item')].indexOf(
          document.activeElement.closest('.inbox-item'),
        ),
      }),
    )
    await window.helpdeskNavigate(target.href, { history: 'replace' })
    if (!signal.aborted) {
      pending = false
      restoreReceipt()
    }
  }
  function restoreReceipt() {
    const serialized = sessionStorage.getItem(key)
    if (!serialized) return
    const receipt = JSON.parse(serialized)
    if (receipt.path !== pageKey) {
      sessionStorage.removeItem(key)
      return
    }
    for (const box of boxes)
      box.checked = receipt.selected.includes(Number(box.value))
    refresh()
    const result = window.helpdeskToast(receipt.message)
    const items = [...document.querySelectorAll('.inbox-item')]
    if (receipt.focus && items.length) {
      const next =
        items.find((item) => item.dataset.number === receipt.focus) ??
        items[Math.min(receipt.position, items.length - 1)]
      next?.querySelector('.conversation-row')?.focus({ preventScroll: true })
    }
    if (receipt.token) {
      const undo = document.createElement('button')
      undo.type = 'button'
      undo.className = 'button-quiet'
      undo.textContent = '元に戻す'
      undo.addEventListener('click', () => perform({ token: receipt.token }))
      result.append(' ', undo)
    }
  }
  async function toggleLabel(form, change) {
    if (pending) return
    pending = true
    try {
      const response = await fetch('/inbox/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(change),
      })
      if (!response.ok)
        throw new Error(
          'ラベルを更新できませんでした。もう一度お試しください。',
        )
      const { token, count } = await response.json()
      const updated = await fetch(location.href)
      if (!updated.ok)
        throw new Error(
          'ラベルは更新されました。画面を更新して確認してください。',
        )
      if (signal.aborted) return
      const doc = new DOMParser().parseFromString(
        await updated.text(),
        'text/html',
      )
      const trigger = document.querySelector('[popovertarget=thread-labels]')
      trigger.replaceChildren(
        ...doc.querySelector('[popovertarget=thread-labels]').childNodes,
      )
      const panel = form.closest('[popover]')
      const query = panel.querySelector('[data-menu-search]')?.value
      panel.replaceChildren(...doc.getElementById('thread-labels').childNodes)
      panel.dispatchEvent(
        new CustomEvent('helpdesk:menu-updated', { bubbles: true }),
      )
      const search = panel.querySelector('[data-menu-search]')
      if (search && query) {
        search.value = query
        search.dispatchEvent(new Event('input'))
      }
      const timeline = document.querySelector('#thread-messages')
      const records = doc.querySelectorAll('#thread-messages .timeline-entry')
      const previous = timeline.querySelectorAll('.timeline-entry').length
      if (records.length > previous)
        timeline.append(
          records[records.length - 1].closest('article').cloneNode(true),
        )
      const next = [...panel.querySelectorAll('form')].find(
        (item) => item.elements.label?.value === change.label,
      )
      next?.querySelector('button')?.focus({ preventScroll: true })
      const message = window.helpdeskToast(verbs[change.action])
      if (count) {
        const undo = document.createElement('button')
        undo.type = 'button'
        undo.textContent = '元に戻す'
        undo.className = 'button-quiet'
        undo.onclick = () => perform({ token })
        message.append(undo)
      }
    } catch (error) {
      if (!signal.aborted) window.helpdeskToast(error.message, true)
    } finally {
      pending = false
    }
  }
  function fieldChange(action, numbers, value) {
    if (action === 'assign') return { action, numbers, email: value || null }
    if (action === 'add' || action === 'remove')
      return { action, numbers, label: value }
    return { action, numbers }
  }
  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target
      if (
        !['/actions/status', '/actions/assign', '/actions/label'].includes(
          form.getAttribute('action'),
        )
      )
        return
      const path = form.getAttribute('action')
      const f = new FormData(form)
      let action = 'assign'
      if (path === '/actions/status') action = f.get('event')
      if (path === '/actions/label') action = f.get('action')
      event.preventDefault()
      const change = fieldChange(
        action,
        [Number(f.get('number'))],
        f.get('email') ?? f.get('label'),
      )
      if (form.closest('#thread-labels')) void toggleLabel(form, change)
      else perform(change, true)
    },
    { signal },
  )
  restoreReceipt()
  if (!inbox) return
  let anchor
  all?.addEventListener('change', () => {
    for (const box of boxes) box.checked = all.checked
    anchor = undefined
    refresh()
  })
  for (const [index, box] of boxes.entries()) {
    box.addEventListener('click', (event) => {
      if (event.shiftKey && anchor !== undefined)
        for (const item of boxes.slice(
          Math.min(anchor, index),
          Math.max(anchor, index) + 1,
        ))
          item.checked = box.checked
      anchor = index
      refresh()
    })
    box.addEventListener('change', refresh)
  }
  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.defaultPrevented ||
        event.key !== 'Escape' ||
        document.querySelector('dialog[open], :popover-open') ||
        !selected().length
      )
        return
      for (const box of boxes) box.checked = false
      refresh()
      all?.focus({ preventScroll: true })
    },
    { signal },
  )
  refresh()
  function quick(button) {
    const id = Number(button.closest('[data-number]').dataset.number)
    perform(fieldChange(button.dataset.quick, [id], operator))
  }
  async function toggleBulkLabel(button) {
    if (pending) return
    pending = true
    try {
      const label = button.dataset.bulkLabel
      const action =
        button.getAttribute('aria-pressed') === 'true' ? 'remove' : 'add'
      const response = await fetch('/inbox/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, numbers: selected(), label }),
      })
      if (!response.ok)
        throw new Error(
          'ラベルを変更できませんでした。もう一度お試しください。',
        )
      const { token, count } = await response.json()
      if (signal.aborted) return
      const receipt = {
        path: pageKey,
        token,
        message: count + '件 · ' + verbs[action],
        selected: selected(),
      }
      sessionStorage.setItem(key, JSON.stringify(receipt))
      const latest = await fetch(location.href)
      if (!latest.ok)
        throw new Error(
          'ラベルを変更しました。画面を更新して確認してください。',
        )
      if (signal.aborted) return
      const doc = new DOMParser().parseFromString(
        await latest.text(),
        'text/html',
      )
      const updated = [...doc.querySelectorAll('.row-select input')]
      if (
        updated.map((box) => box.value).join(',') !==
        boxes.map((box) => box.value).join(',')
      ) {
        location.reload()
        return
      }
      updated.forEach((box, index) => {
        boxes[index].dataset.labels = box.dataset.labels
        const other = box
          .closest('.inbox-item')
          .querySelector('.conversation-row')
        boxes[index]
          .closest('.inbox-item')
          .querySelector('.conversation-row')
          .replaceChildren(...other.childNodes)
      })
      restoreReceipt()
    } catch (error) {
      if (!signal.aborted) window.helpdeskToast(error.message, true)
    } finally {
      pending = false
    }
  }
  function chooseFilter(button) {
    const form = button.form
    form.elements.assignee.value = button.dataset.filterAssignee
    button.closest('[popover]').hidePopover()
    form.elements.assignee.dispatchEvent(new Event('change', { bubbles: true }))
  }
  inbox.addEventListener('click', (event) => {
    const button = event.target.closest('button')
    if (!button) return
    if (button.hasAttribute('data-clear-selection')) {
      for (const box of boxes) box.checked = false
      refresh()
    }
    if (button.hasAttribute('data-filter-assignee')) chooseFilter(button)
    if (button.hasAttribute('data-quick')) quick(button)
    if (button.hasAttribute('data-bulk-label')) void toggleBulkLabel(button)
    if (button.hasAttribute('data-change'))
      perform(
        fieldChange(button.dataset.change, selected(), button.dataset.value),
      )
  })
  const links = [...inbox.querySelectorAll('a.conversation-row')]
  function isListShortcut(event) {
    return (
      !event.defaultPrevented &&
      !event.isComposing &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.target.closest('input,textarea,select,[contenteditable=true]') &&
      !document.querySelector('dialog[open],:popover-open')
    )
  }
  document.addEventListener(
    'keydown',
    (event) => {
      if (!isListShortcut(event)) return
      const index = links.indexOf(document.activeElement)
      if (event.key === 'j' || event.key === 'k') {
        event.preventDefault()
        const next = index < 0 ? 0 : index + (event.key === 'j' ? 1 : -1)
        links[Math.max(0, Math.min(links.length - 1, next))]?.focus()
      } else if (index >= 0 && (event.key === 'a' || event.key === 'e')) {
        event.preventDefault()
        links[index]
          .closest('li')
          .querySelector(
            '[data-quick="' + (event.key === 'a' ? 'assign' : 'closed') + '"]',
          )
          ?.click()
      }
    },
    { signal },
  )
})
