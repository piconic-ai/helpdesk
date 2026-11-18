;(() => {
  const operator = document.body.dataset.operator
  if (!operator) return
  const key = 'inbox-change:' + operator
  const pageKey = location.pathname + location.search
  const inbox = document.querySelector('[data-inbox-view]')
  const bar = inbox?.querySelector('.inbox-bulk')
  const boxes = [...document.querySelectorAll('.row-select input')]
  const selected = () =>
    boxes.filter((box) => box.checked).map((box) => Number(box.value))
  function refresh() {
    if (!bar) return
    const size = selected().length
    bar.hidden = !size
    bar.querySelector('[data-selected-count]').textContent = size + '件を選択'
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
  function banner(text, error = false) {
    const host =
      inbox ??
      document.querySelector('.thread-header') ??
      document.querySelector('main')
    let node = host.querySelector('[data-change-notice]')
    if (!node) {
      node = document.createElement('p')
      node.dataset.changeNotice = ''
      host.querySelector('.page-header')?.after(node)
    }
    node.className = error ? 'banner-error' : 'banner-success'
    node.setAttribute('role', error ? 'alert' : 'status')
    node.replaceChildren(text)
    return node
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
      if (target.href === location.href) location.reload()
      else location.replace(target)
    } catch (error) {
      banner(error.message, true)
      pending = false
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
    const result = banner(receipt.message)
    const items = [...document.querySelectorAll('.inbox-item')]
    if (receipt.focus && items.length) {
      const next =
        items.find((item) => item.dataset.number === receipt.focus) ??
        items[Math.min(receipt.position, items.length - 1)]
      next?.querySelector('.conversation-row')?.focus()
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
  function fieldChange(action, numbers, value) {
    if (action === 'assign') return { action, numbers, email: value || null }
    if (action === 'add' || action === 'remove')
      return { action, numbers, label: value }
    return { action, numbers }
  }
  document.addEventListener('submit', (event) => {
    const form = event.target
    if (
      !['/actions/status', '/actions/assign', '/actions/label'].includes(
        form.getAttribute('action'),
      )
    )
      return
    const path = new URL(form.action).pathname
    const f = new FormData(form)
    let action = 'assign'
    if (path === '/actions/status') action = f.get('event')
    if (path === '/actions/label') action = f.get('action')
    event.preventDefault()
    perform(
      fieldChange(
        action,
        [Number(f.get('number'))],
        f.get('email') ?? f.get('label'),
      ),
      true,
    )
  })
  restoreReceipt()
  if (!inbox) return
  for (const box of boxes) box.addEventListener('change', refresh)
  function quick(button) {
    const id = Number(button.closest('[data-number]').dataset.number)
    perform(fieldChange(button.dataset.quick, [id], operator))
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
  document.addEventListener('keydown', (event) => {
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
  })
})()
