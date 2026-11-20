import { jsonMutation, jsonQuery } from '/components/local-requests.js'
import { syncThread } from './thread-content.js'

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

window.onHelpdeskPage((signal) => {
  const area = document.querySelector('#reply-area')
  const composer = area?.querySelector('.composer')
  if (!composer) return
  const number = Number(composer.elements.number.value)
  const schedules = new Map()
  const readError =
    '変更後の状態を読み込めませんでした。画面を更新して確認してください。'
  let reads = Promise.resolve()
  const pending = new Set()
  async function read(target, delivery) {
    if (signal.aborted) return
    const url = new URL(target ?? location.href, location.href)
    const source = new URL(url)
    source.searchParams.set('updates', 'thread')
    if (delivery) source.searchParams.set('delivery', delivery)
    const result = await jsonQuery(source, signal)
    if (result.queued) return false
    const doc = new DOMParser().parseFromString(result.html, 'text/html')
    if (Number(doc.body.dataset.threadNumber) !== number)
      throw new Error(readError)
    if (
      doc.querySelector('#reply-area').dataset.threadNoteOnly !==
      area.dataset.threadNoteOnly
    ) {
      await window.helpdeskNavigate(url.href, { history: 'replace' })
      return true
    }
    syncThread(doc)
    if (target) {
      history.replaceState(history.state, '', url)
      document.dispatchEvent(new Event('helpdesk:thread-receipt'))
    }
    const current = area.querySelector('[data-thread-part="receipt"]')
    const next = doc.querySelector('[data-thread-part="receipt"]')
    const held = (node) =>
      node.querySelector('[data-undo-reply]')?.elements.id.value
    if (
      (target || held(current) !== held(next)) &&
      !(held(current) && held(current) === held(next))
    ) {
      current.replaceChildren(...next.childNodes)
      const toast = current.querySelector('[data-toast]')
      if (toast)
        document.dispatchEvent(
          new CustomEvent('helpdesk:thread-toast', { detail: toast }),
        )
    }
    updateSchedules()
    return true
  }
  function refresh(target, delivery) {
    const pending = reads.then(() => read(target, delivery))
    reads = pending.catch(() => {})
    return pending
  }
  function notifyError() {
    if (!signal.aborted) window.helpdeskToast(readError, true)
  }
  function saved(target) {
    return refresh(target).catch(notifyError)
  }
  const thread = { number, saved, showChange }
  window.helpdeskThread = thread
  signal.addEventListener(
    'abort',
    () => {
      if (window.helpdeskThread === thread) delete window.helpdeskThread
      for (const hold of schedules.values()) clearInterval(hold.timer)
    },
    { once: true },
  )
  function scheduleForms(id) {
    return [...document.querySelectorAll('[data-undo-reply]')].filter(
      (f) => f.elements.id.value === id,
    )
  }
  async function finish(id) {
    const hold = schedules.get(id)
    if (!hold || hold.finished) return
    hold.finished = true
    clearInterval(hold.timer)
    scheduleForms(id).forEach((form) => {
      form.hidden = true
    })
    try {
      for (let attempt = 1; attempt <= 5 && !signal.aborted; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
        if (signal.aborted || !schedules.has(id) || (await refresh(null, id)))
          return
      }
    } catch {
      notifyError()
    }
  }
  function updateSchedules() {
    const forms = [...document.querySelectorAll('[data-undo-reply]')]
    for (const [id, hold] of schedules) {
      if (forms.some((f) => f.elements.id.value === id)) continue
      clearInterval(hold.timer)
      schedules.delete(id)
    }
    for (const form of forms) {
      const id = form.elements.id.value
      if (schedules.has(id)) continue
      const until = Date.now() + Number(form.dataset.undoReply)
      function tick() {
        const seconds = Math.max(0, Math.ceil((until - Date.now()) / 1000))
        if (!seconds) return void finish(id)
        for (const node of scheduleForms(id))
          node.querySelector('[data-remaining]').textContent =
            Math.floor(seconds / 60) +
            ':' +
            String(seconds % 60).padStart(2, '0')
      }
      schedules.set(id, { timer: setInterval(tick, 500), finished: false })
      tick()
    }
  }
  updateSchedules()
  document.addEventListener(
    'click',
    (event) => {
      const close = event.target.closest('[data-dismiss-scheduled]')
      if (close) close.form.hidden = true
    },
    { signal },
  )
  async function triage(change, form) {
    const menu = form?.closest(':popover-open')
    const undo = 'token' in change
    const receipt = await jsonMutation(
      '/inbox/' + (undo ? 'undo' : 'change'),
      change,
    )
    if (signal.aborted) return
    const url = new URL(location.href)
    if (change.action === 'marked_spam' || change.action === 'unmarked_spam')
      url.searchParams.set('notice', change.action)
    else url.searchParams.delete('notice')
    if (menu && menu.id !== 'thread-labels') menu.hidePopover()
    const updated = await saved(url)
    if (updated && window.helpdeskThread?.number === number)
      window.helpdeskThread.showChange(change, receipt)
  }
  function showChange(change, receipt) {
    const undo = 'token' in change
    const toast = window.helpdeskToast(
      receipt.count
        ? verbs[undo ? 'undo' : change.action]
        : '対象はすでにこの状態です。',
    )
    if (!undo && receipt.count) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'button-quiet'
      button.textContent = '元に戻す'
      button.onclick = () => run(button, () => triage({ token: receipt.token }))
      toast.append(' ', button)
    }
  }
  async function run(key, work) {
    if (pending.has(key)) return
    pending.add(key)
    try {
      await work()
    } catch {
      if (!signal.aborted)
        window.helpdeskToast(
          '操作の結果を確認できませんでした。もう一度操作する前に、画面を更新して状態を確認してください。',
          true,
        )
    } finally {
      pending.delete(key)
    }
  }
  document.addEventListener(
    'submit',
    (event) => {
      if (event.defaultPrevented) return
      const form = event.target
      if (Number(form.elements.number?.value) !== number) return
      const action = new URL(
        event.submitter?.getAttribute('formaction') ||
          form.getAttribute('action') ||
          location.href,
        location.href,
      ).pathname
      if (
        ['/actions/assign', '/actions/status', '/actions/label'].includes(
          action,
        )
      ) {
        event.preventDefault()
        const change = { numbers: [number] }
        if (action.endsWith('/assign'))
          Object.assign(change, {
            action: 'assign',
            email: form.elements.email.value || null,
          })
        else if (action.endsWith('/label'))
          Object.assign(change, {
            action: form.elements.action.value,
            label: form.elements.label.value,
          })
        else change.action = form.elements.event.value
        void run(form, () => triage(change, form))
        return
      }
      if (
        !form.matches('[data-undo-reply]') &&
        ![
          '/actions/approve',
          '/actions/discard',
          '/actions/retry',
          '/actions/feedback.review',
          '/actions/feedback.convert',
          '/actions/feedback.unreview',
          '/actions/issues.link',
          '/actions/articles.suggest',
        ].includes(action)
      )
        return
      event.preventDefault()
      void run(
        form.matches('[data-undo-reply]') ? form.elements.id.value : form,
        async () => {
          const fields = new FormData(form, event.submitter)
          if (form.matches('[data-undo-reply]')) {
            const result = await jsonMutation(action, fields, {
              accept: 'application/json',
            })
            if (signal.aborted) return
            if (action === '/actions/sendReplyNow')
              return void finish(fields.get('id'))
            if (!result.restoredDraft) {
              const field = composer.querySelector('[data-draft-slot=reply]')
              field.value = [field.value, result.body]
                .filter(Boolean)
                .join('\n\n')
              field.dataset.restoringDraft = ''
              field.dispatchEvent(new Event('input', { bubbles: true }))
              delete field.dataset.restoringDraft
            }
            const url = new URL(location.href)
            url.searchParams.set(
              'notice',
              result.restoredDraft ? 'undoApproval' : 'undoReply',
            )
            await saved(url)
            if (result.restoredDraft)
              document
                .getElementById('approve-' + result.restoredDraft)
                ?.querySelector('textarea')
                ?.focus({ preventScroll: true })
            return
          }
          const result = await jsonMutation(form.getAttribute('action'), fields)
          if (signal.aborted) return
          const target = new URL(result.location, location.href)
          if (target.pathname !== location.pathname)
            return void window.helpdeskNavigate(target.href)
          const inbox = new URL(location.href).searchParams.get('inbox')
          if (inbox) target.searchParams.set('inbox', inbox)
          await saved(target)
        },
      )
    },
    { signal },
  )
})
