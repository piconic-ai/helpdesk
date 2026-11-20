function visibleBulkActions(widths, moreWidth, available, gap) {
  let fit = widths.length
  let used = widths.reduce((total, width) => total + width, 0)
  if (used + (fit - 1) * gap <= available) return fit
  used += moreWidth + fit * gap
  while (fit && used > available) used -= widths[--fit] + gap
  return fit
}

function fitBulkActions(bar, signal) {
  const group = bar.querySelector('.inbox-bulk-actions')
  const more = group.querySelector('#bulk-more')
  const moreTrigger = more.previousElementSibling
  const moreControl = more.parentElement
  const actions = [...group.children].filter((action) => action !== moreControl)
  const widths = actions.map((action) => action.getBoundingClientRect().width)
  const moreWidth = moreTrigger.getBoundingClientRect().width
  let visible = actions.length

  const observer = new ResizeObserver(() => {
    const available = group.getBoundingClientRect().width
    const gap = parseFloat(getComputedStyle(group).columnGap)
    const fit = visibleBulkActions(widths, moreWidth, available, gap)
    if (fit === visible) return

    const focus = document.activeElement
    const moving = actions.slice(Math.min(fit, visible), Math.max(fit, visible))
    const focusedAction = moving.find((action) => action.contains(focus))
    if (
      (fit === actions.length || more.contains(focusedAction ?? null)) &&
      more.matches(':popover-open')
    )
      more.hidePopover()
    for (const action of moving)
      action.querySelector(':popover-open')?.hidePopover()
    if (fit < visible) more.prepend(...moving)
    else moreControl.before(...moving)
    visible = fit

    const returnFocus =
      focusedAction ??
      (focus === moreTrigger && fit === actions.length ? moving[0] : null)
    if (!returnFocus) return
    const trigger = more.contains(returnFocus)
      ? moreTrigger
      : (returnFocus.querySelector('button') ?? returnFocus)
    trigger.focus({ preventScroll: true })
  })
  observer.observe(group)
  const stop = () => {
    observer.disconnect()
    signal.removeEventListener('abort', stop)
  }
  signal.addEventListener('abort', stop, { once: true })
  return stop
}

// Reuse rows whose server representation did not change, even when another
// conversation enters or leaves the current page.
function reconcileInboxRows(list, updated) {
  const old = new Map(
    [...list.children].map((row) => [row.dataset.number, row]),
  )
  const rows = [...updated.children]
  const numbers = new Set(rows.map((row) => row.dataset.number))
  for (const [number, row] of old) if (!numbers.has(number)) row.remove()
  for (const [index, next] of rows.entries()) {
    let row = old.get(next.dataset.number)
    if (!row?.isEqualNode(next)) {
      row?.replaceWith(next)
      row = next
    }
    if (list.children[index] !== row)
      list.insertBefore(row, list.children[index] ?? null)
  }
}

function bulkPressed(count, total) {
  if (!count) return 'false'
  return count === total ? 'true' : 'mixed'
}

function refreshBulkChoices(bar, checked) {
  const projects = new Set(checked.map((box) => box.dataset.product))
  for (const button of bar.querySelectorAll('[data-member-projects]')) {
    const member = new Set(JSON.parse(button.dataset.memberProjects))
    button.hidden = [...projects].some((project) => !member.has(project))
  }
  for (const button of bar.querySelectorAll('[data-change="assign"]')) {
    const count = checked.filter(
      (box) => box.dataset.assignee === button.dataset.value,
    ).length
    button.setAttribute('aria-pressed', bulkPressed(count, checked.length))
  }
  const labels = checked.map((box) => JSON.parse(box.dataset.labels))
  for (const button of bar.querySelectorAll('[data-bulk-label]')) {
    const count = labels.filter((names) =>
      names.includes(button.dataset.bulkLabel),
    ).length
    button.setAttribute('aria-pressed', bulkPressed(count, checked.length))
  }
}

function updateInboxContent(content, incoming) {
  const list = content.querySelector('[data-ui=row-list]')
  const newList = incoming.querySelector('[data-ui=row-list]')
  if (!list || !newList) {
    if (content.innerHTML !== incoming.innerHTML)
      content.replaceChildren(...incoming.childNodes)
    return
  }
  reconcileInboxRows(list, newList)
  const before = content.querySelector('.inbox-pagination')
  const after = incoming.querySelector('.inbox-pagination')
  if (!after) before?.remove()
  else if (!before) content.append(after)
  else if (!before.isEqualNode(after)) before.replaceWith(after)
}

function updateInboxCounts(inbox, next) {
  const count = inbox.querySelector('[data-inbox-count]')
  const total = next.querySelector('[data-inbox-count]').textContent
  if (total !== count.textContent) count.textContent = total
  const breakdown = inbox.querySelector('[data-project-counts]')
  const counts = next.querySelector('[data-project-counts]')
  if (!counts) breakdown?.remove()
  else if (!breakdown)
    inbox.querySelector('[data-inbox-results]').before(counts)
  else if (counts.innerHTML !== breakdown.innerHTML)
    breakdown.replaceChildren(...counts.childNodes)
}

function returnInboxFocus(inbox, focused, row, position) {
  const sameRow =
    row &&
    inbox.querySelector(
      '.inbox-item[data-number="' + CSS.escape(row.dataset.number) + '"]',
    )
  let action = '.conversation-row'
  if (focused.matches('input')) action = '.row-select input'
  if (focused.hasAttribute('data-quick'))
    action = '[data-quick="' + CSS.escape(focused.dataset.quick) + '"]'
  const rows = inbox.querySelectorAll('a.conversation-row')
  const target =
    sameRow?.querySelector(action) ??
    sameRow?.querySelector('.conversation-row') ??
    rows[Math.min(position, rows.length - 1)] ??
    inbox.querySelector('input[type=search]')
  target?.focus({ preventScroll: true })
}

window.onHelpdeskPage((signal) => {
  const inbox = document.querySelector('[data-inbox-view]')
  if (!inbox) return
  const operator = document.body.dataset.operator
  const key = 'inbox-change:' + operator
  const pageKey = location.pathname + location.search
  let bar = inbox.querySelector('.inbox-bulk')
  let stopFitting = bar && fitBulkActions(bar, signal)
  const boxes = () => [...inbox.querySelectorAll('.row-select input')]
  const selected = () => boxes().filter((box) => box.checked)
  const checkedNumbers = () => selected().map((box) => Number(box.value))
  const links = () => [...inbox.querySelectorAll('a.conversation-row')]
  let anchor
  function refresh() {
    const checked = selected()
    const filters = inbox.querySelector('[data-ui=filters]')
    filters.inert = checked.length > 0
    if (!bar) return
    refreshBulkChoices(bar, checked)
    if (!checked.length) {
      for (const panel of bar.querySelectorAll(':popover-open'))
        panel.hidePopover()
    }
    bar.inert = !checked.length
    bar.setAttribute('aria-hidden', String(!checked.length))
    const all = inbox.querySelector('[data-select-all]')
    if (all) {
      all.checked = checked.length > 0 && checked.length === boxes().length
      all.indeterminate = checked.length > 0 && !all.checked
    }
    bar.querySelector('[data-selected-count]').textContent =
      checked.length + '件を選択中'
  }
  function patchResults(doc) {
    const next = doc.querySelector('[data-inbox-view]')
    if (!next) throw new Error('Expected an inbox')
    const content = inbox.querySelector('[data-inbox-content]')
    const incoming = next.querySelector('[data-inbox-content]')
    const selection = new Set(checkedNumbers())
    const focused = document.activeElement
    const row = focused.closest('.inbox-item')
    const position = row ? [...row.parentNode.children].indexOf(row) : 0
    const bulkFocus = bar?.contains(focused)
    updateInboxContent(content, incoming)
    const afterBar = next.querySelector('.inbox-bulk')
    if (bar && !afterBar) {
      stopFitting()
      bar.remove()
      bar = null
    } else if (!bar && afterBar) {
      inbox.querySelector('.inbox-tools').append(afterBar)
      bar = afterBar
      stopFitting = fitBulkActions(bar, signal)
    }
    updateInboxCounts(inbox, next)
    for (const box of boxes()) box.checked = selection.has(Number(box.value))
    refresh()
    if (
      (row && focused !== document.activeElement) ||
      (bulkFocus && !selected().length)
    )
      returnInboxFocus(inbox, focused, row, position)
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
  function showReceipt(receipt, stale = false) {
    const wasInToast = document.activeElement.closest('[data-toast]')
    const node = window.helpdeskToast(
      receipt.message + (stale ? ' 一覧を更新できませんでした。' : ''),
      stale,
    )
    if (receipt.token || receipt.feedbackUndo) {
      const undo = document.createElement('button')
      undo.type = 'button'
      undo.className = 'button-quiet'
      undo.textContent = '元に戻す'
      undo.onclick = () =>
        receipt.token
          ? changeRows({ token: receipt.token }, receipt.focus)
          : reviewFeedback('unreview', receipt.feedbackUndo)
      node.append(' ', undo)
    }
    if (stale) {
      const retry = document.createElement('button')
      retry.type = 'button'
      retry.className = 'button-quiet'
      retry.textContent = '一覧を更新'
      retry.onclick = () => commit(async () => receipt)
      node.append(' ', retry)
    }
    if (wasInToast && !document.activeElement.closest('[data-toast]')) {
      const row = links().find(
        (link) =>
          link.closest('.inbox-item').dataset.number === String(receipt.focus),
      )
      const target =
        row ?? links()[0] ?? inbox.querySelector('input[type=search]')
      target?.focus({ preventScroll: true })
    }
  }
  async function commit(mutate) {
    if (pending || signal.aborted) return
    pending = true
    const content = inbox.querySelector('[data-inbox-content]')
    content.setAttribute('aria-busy', 'true')
    try {
      const { jsonMutation, pageQuery, syncPageCounts } =
        await import('/components/local-requests.js')
      const receipt = await mutate(jsonMutation)
      if (signal.aborted) return
      let stale = false
      try {
        const doc = await pageQuery(location.href, signal)
        if (signal.aborted) return
        patchResults(doc)
        syncPageCounts(doc)
      } catch {
        if (signal.aborted) return
        stale = true
      }
      sessionStorage.setItem(
        key,
        JSON.stringify({
          ...receipt,
          path: pageKey,
          selected: checkedNumbers(),
        }),
      )
      showReceipt(receipt, stale)
    } catch {
      if (!signal.aborted)
        window.helpdeskToast(
          '現在の状態に操作を適用できません。対象を確認してもう一度お試しください。',
          true,
        )
    } finally {
      content.removeAttribute('aria-busy')
      pending = false
    }
  }
  function changeRows(change, focus = change.numbers?.[0]) {
    const undo = 'token' in change
    return commit(async (mutate) => {
      const { count, token } = await mutate(
        '/inbox/' + (undo ? 'undo' : 'change'),
        change,
      )
      return {
        message: count
          ? count + '件 · ' + verbs[undo ? 'undo' : change.action]
          : '対象はすでにこの状態です。',
        token: !undo && count ? token : null,
        focus,
      }
    })
  }
  function reviewFeedback(action, number) {
    return commit(async (mutate) => {
      const fields = new FormData()
      fields.set('number', String(number))
      await mutate('/actions/feedback.' + action, fields, {
        accept: 'application/json',
      })
      return {
        message:
          action === 'review'
            ? 'フィードバックを確認済みにしました。'
            : 'フィードバックを未確認に戻しました。',
        feedbackUndo: action === 'review' ? number : null,
        focus: number,
      }
    })
  }
  function fieldChange(action, numbers, value) {
    if (action === 'assign') return { action, numbers, email: value || null }
    if (action === 'add' || action === 'remove')
      return { action, numbers, label: value }
    return { action, numbers }
  }
  const saved = sessionStorage.getItem(key)
  if (saved) {
    const receipt = JSON.parse(saved)
    if (receipt.path === pageKey) {
      for (const box of boxes())
        box.checked ||= receipt.selected?.includes(Number(box.value))
      showReceipt(receipt)
    } else sessionStorage.removeItem(key)
  }
  refresh()
  inbox.addEventListener(
    'change',
    (event) => {
      if (event.target.matches('[data-select-all]')) {
        for (const box of boxes()) box.checked = event.target.checked
        anchor = undefined
        refresh()
      } else if (event.target.matches('.row-select input')) refresh()
    },
    { signal },
  )
  inbox.addEventListener(
    'click',
    (event) => {
      const box = event.target.closest('.row-select input')
      if (box) {
        const current = boxes()
        const from = current.findIndex((other) => other.value === anchor)
        const to = current.indexOf(box)
        if (event.shiftKey && from >= 0)
          for (const item of current.slice(
            Math.min(from, to),
            Math.max(from, to) + 1,
          ))
            item.checked = box.checked
        anchor = box.value
        refresh()
      }
    },
    { signal },
  )
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
      for (const box of boxes()) box.checked = false
      refresh()
      inbox.querySelector('[data-select-all]')?.focus({ preventScroll: true })
    },
    { signal },
  )
  inbox.addEventListener(
    'submit',
    (event) => {
      const form = event.target
      const path = form.getAttribute('action')
      if (
        event.defaultPrevented ||
        !['/actions/feedback.review', '/actions/feedback.unreview'].includes(
          path,
        )
      )
        return
      event.preventDefault()
      void reviewFeedback(
        path.split('.').at(-1),
        Number(form.elements.number.value),
      )
    },
    { signal },
  )
  function chooseFilter(button) {
    const form = button.form
    form.elements.assignee.value = button.dataset.filterAssignee
    button.closest('[popover]').hidePopover()
    form.elements.assignee.dispatchEvent(new Event('change', { bubbles: true }))
  }
  inbox.addEventListener(
    'click',
    (event) => {
      const button = event.target.closest('button')
      if (!button) return
      if (button.hasAttribute('data-clear-selection')) {
        for (const box of boxes()) box.checked = false
        refresh()
        inbox.querySelector('[data-select-all]')?.focus({ preventScroll: true })
      }
      if (button.hasAttribute('data-filter-assignee')) chooseFilter(button)
      if (button.hasAttribute('data-quick'))
        void changeRows(
          fieldChange(
            button.dataset.quick,
            [Number(button.closest('[data-number]').dataset.number)],
            operator,
          ),
        )
      if (button.hasAttribute('data-bulk-label'))
        void changeRows(
          fieldChange(
            button.getAttribute('aria-pressed') === 'true' ? 'remove' : 'add',
            checkedNumbers(),
            button.dataset.bulkLabel,
          ),
        )
      if (button.hasAttribute('data-change'))
        void changeRows(
          fieldChange(
            button.dataset.change,
            checkedNumbers(),
            button.dataset.value,
          ),
        )
    },
    { signal },
  )
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
      const rows = links()
      const index = rows.indexOf(document.activeElement)
      if (event.key === 'j' || event.key === 'k') {
        event.preventDefault()
        const next = index < 0 ? 0 : index + (event.key === 'j' ? 1 : -1)
        rows[Math.max(0, Math.min(rows.length - 1, next))]?.focus()
      } else if (index >= 0 && (event.key === 'a' || event.key === 'e')) {
        event.preventDefault()
        rows[index]
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
