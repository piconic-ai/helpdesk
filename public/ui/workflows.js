const confirmation = document.getElementById('action-confirmation')
const shortcuts = document.getElementById('keyboard-help')
const permitted = new WeakSet()

function openDialog(dialog, trigger) {
  if (document.querySelector('dialog[open]')) return
  const previousPopover = trigger?.closest(':popover-open')
  // A native dialog preserves its ancestor popovers when entering the top layer.
  const parent = previousPopover ?? document.body
  if (dialog.parentNode !== parent) parent.append(dialog)
  dialog.returnValue = ''
  const previousFocus = document.activeElement
  dialog.onclose = () => {
    // A queued close event can arrive after the user has moved on or reopened it.
    if (dialog.open) return
    const focused = document.activeElement
    if (dialog.parentNode !== document.body) document.body.append(dialog)
    if (
      focused !== document.body &&
      focused !== previousFocus &&
      focused !== trigger &&
      !dialog.contains(focused)
    )
      return
    if (
      dialog.returnValue !== 'confirmed' &&
      previousPopover?.isConnected &&
      !previousPopover.matches(':popover-open')
    )
      previousPopover.showPopover()
    trigger?.focus({ preventScroll: true })
  }
  const { scrollX: left, scrollY: top } = window
  dialog.showModal()
  dialog.querySelector('button')?.focus({ preventScroll: true })
  if (scrollX !== left || scrollY !== top)
    window.scrollTo({ left, top, behavior: 'instant' })
}

function confirmAction(
  trigger,
  title,
  description,
  verb,
  commit,
  cancel = 'キャンセル',
) {
  confirmation.querySelector('h2').textContent = title
  confirmation.querySelector('p').textContent = description
  confirmation.querySelector('[data-close-modal]').textContent = cancel
  const button = confirmation.querySelector('[data-commit]')
  button.textContent = verb
  const destructive =
    trigger.classList.contains('button-danger') || verb === '下書きを破棄'
  button.classList.toggle('button-primary', !destructive)
  button.classList.toggle('button-danger', destructive)
  button.onclick = () => {
    confirmation.close('confirmed')
    commit()
  }
  openDialog(confirmation, trigger)
}

function displaySwatch(form, selected) {
  const panel = form.closest('[popover]')
  const trigger = document.querySelector(
    '[popovertarget="' + CSS.escape(panel.id) + '"]',
  )
  trigger.querySelector('.label-dot').dataset.identityColor = selected.value
  for (const swatch of form.querySelectorAll('button'))
    swatch.setAttribute('aria-pressed', String(swatch === selected))
  panel.hidePopover()
  trigger.focus({ preventScroll: true })
  window.helpdeskToast('ラベルの色を変更しました。')
}
document.addEventListener('submit', async (event) => {
  const form = event.target
  if (form.getAttribute('action') !== '/settings/labels' || !event.submitter)
    return
  event.preventDefault()
  if (form.getAttribute('aria-busy') === 'true') return
  form.setAttribute('aria-busy', 'true')
  const selected = event.submitter
  try {
    const response = await fetch(form.getAttribute('action'), {
      method: 'POST',
      body: new FormData(form, selected),
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error()
    if (form.matches('.swatches')) displaySwatch(form, selected)
    else location.assign('/settings/labels?saved=yes')
  } catch {
    window.helpdeskToast(
      'ラベルを更新できませんでした。同じ名前の有無と使用件数を確認して、もう一度お試しください。',
      true,
    )
  } finally {
    form.removeAttribute('aria-busy')
  }
})

function submissionDetails(form, trigger) {
  const action = new URL(
    form.getAttribute('action') || location.href,
    location.href,
  ).pathname
  const recipient =
    document.querySelector('.composer')?.dataset.contact ||
    document.querySelector('.thread-header')?.dataset.contact
  const label = trigger?.textContent.trim() || '実行する'
  if (action === '/actions/approve')
    return [
      label,
      recipient +
        ' に承認済みの返信を送信します。\n' +
        form.elements.body.value,
    ]
  if (action === '/actions/discard' && !form.closest('.banner-success'))
    return [
      label,
      '会話 #' +
        form.elements.number.value +
        ' の下書き1件を削除します。\n' +
        (
          form.closest('.draft-review')?.querySelector('textarea')?.value ||
          form.closest('article')?.querySelector('.message-body')
            ?.textContent ||
          ''
        ).slice(0, 200),
    ]
  if (action === '/actions/issues.link')
    return [
      label,
      (form.dataset.demo === 'true' ? '模擬 GitHub の ' : '') +
        form.dataset.repo +
        ' の「' +
        form.elements.issue.selectedOptions[0].textContent.trim() +
        '」に、この会話へのリンクをコメントとして投稿します。\n' +
        '会話 #' +
        form.elements.number.value +
        ' · ' +
        new URL(form.dataset.backlink).host +
        (['localhost', '127.0.0.1', '[::1]'].includes(
          new URL(form.dataset.backlink).hostname,
        )
          ? '（この端末で開けます）'
          : ''),
    ]
  if (action === '/actions/merge.combine')
    return [
      'この会話を統合する',
      '「' +
        form.dataset.source +
        '」を「' +
        form.elements.target.selectedOptions[0].textContent.trim() +
        '」に統合します。',
    ]
  if (action === '/actions/feedback.convert')
    return [
      label,
      'フィードバック #' +
        form.elements.number.value +
        '「' +
        document.querySelector('h1').textContent.trim() +
        '」を返信できる問い合わせに変更します。',
    ]
  return settingsConfirmation(action, form, trigger, label)
}

function settingsConfirmation(action, form, trigger, label) {
  if (form.dataset.labelImpact !== undefined) {
    const target = form.elements.namedItem('target')
    return [
      label,
      '「' +
        form.elements.label.value +
        '」を使用する会話は' +
        form.dataset.labelImpact +
        '件です。' +
        (target
          ? '「' + target.value + '」にまとめます。'
          : 'すべてからこのラベルを外して削除します。'),
    ]
  }
  if (action === '/extensions/rules/remove')
    return [label, form.dataset.ruleSummary + ' の振り分けルールを削除します。']
  if (form.elements.enabled?.value === 'yes' && form.dataset.permissions)
    return [
      form.closest('[data-extension]').querySelector('h3').textContent +
        (form.elements.enabled.value === 'yes'
          ? 'を有効にする'
          : 'を無効にする'),
      (form.dataset.publicIntake
        ? '全プロダクトで機能が使えるようになります。受付はプロダクトごとに開始します。\n'
        : '') +
        '使用する権限：' +
        form.dataset.permissions,
    ]
  if (form.elements.enabled?.value === 'no')
    return [
      form.closest('[data-extension]').querySelector('h3').textContent +
        (form.elements.enabled.value === 'yes'
          ? 'を有効にする'
          : 'を無効にする'),
      form.closest('[data-extension]').querySelector('h3').textContent +
        'を無効にします。設定は保持され、再度有効にするまで新しい処理は停止します。',
    ]
  if (action === '/articles/edit' && trigger?.value === 'publish')
    return [
      label,
      '「' + form.elements.title.value + '」を公開ヘルプに掲載します。',
    ]
}

async function reviewIssue(form, trigger) {
  if (trigger.disabled) return
  trigger.disabled = true
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'text/html' },
    })
    if (!response.ok) throw new Error()
    const doc = new DOMParser().parseFromString(
      await response.text(),
      'text/html',
    )
    const create = doc.querySelector('form[action="/actions/issues.create"]')
    if (!create) throw new Error()
    const content = create.closest('section')
    const fields = new FormData(create)
    trigger.disabled = false
    trigger.focus({ preventScroll: true })
    confirmAction(
      trigger,
      '起票内容を確認',
      [
        content.querySelector('[data-public-target]').textContent,
        content.querySelector('h2').textContent,
        content.querySelector('pre').textContent,
        content.querySelector('[data-public-link]').textContent,
      ].join('\n'),
      '確認した内容で起票',
      () => {
        const submit = document.createElement('form')
        submit.method = 'post'
        submit.action = '/actions/issues.create'
        for (const [name, value] of fields) {
          const input = document.createElement('input')
          Object.assign(input, { name, value, type: 'hidden' })
          submit.append(input)
        }
        document.body.append(submit)
        form.dispatchEvent(
          new CustomEvent('helpdesk:submit-linked-draft', {
            bubbles: true,
            detail: submit,
          }),
        )
        submit.submit()
      },
      '入力内容を修正する',
    )
  } catch {
    window.helpdeskToast(
      '起票内容を取得できませんでした。入力内容を確認してもう一度お試しください。',
      true,
    )
  } finally {
    trigger.disabled = false
  }
}

document.addEventListener(
  'submit',
  (event) => {
    const form = event.target
    if (permitted.delete(form)) return
    const trigger = event.submitter
    if (!trigger || form.closest('dialog')) return
    const issue = form.getAttribute('action') === '/actions/issues.preview'
    const details = issue ? null : submissionDetails(form, trigger)
    if (!issue && !details) return
    event.preventDefault()
    event.stopImmediatePropagation()
    if (issue) {
      void reviewIssue(form, trigger)
      return
    }
    confirmAction(trigger, details[0], details[1], details[0], () => {
      permitted.add(form)
      form.requestSubmit(trigger)
    })
  },
  true,
)

function editTarget(element) {
  return element?.closest(
    'input,textarea,select,[contenteditable]:not([contenteditable=false])',
  )
}

// Keep the first tab interaction when the server-rendered form precedes its module.
function replayEarlyTabInput(event) {
  const tab = event.target.closest?.('.composer-tabs [role=tab]')
  if (!tab || event.defaultPrevented) return
  const key = event.key
  if (key && !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return
  if (key) event.preventDefault()
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      const current = document.activeElement
      if (current?.closest('[role=tablist]') !== tab.parentElement) return
      if (key) {
        current.dispatchEvent(
          new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
          }),
        )
      } else if (tab.getAttribute('aria-selected') !== 'true') {
        tab.click()
      }
    },
    { once: true },
  )
}
document.addEventListener('keydown', replayEarlyTabInput)
document.addEventListener('click', replayEarlyTabInput)
document.addEventListener(
  'DOMContentLoaded',
  () => {
    document.removeEventListener('keydown', replayEarlyTabInput)
    document.removeEventListener('click', replayEarlyTabInput)
  },
  { once: true },
)

function editMode(composer, mode) {
  const tab = composer.querySelectorAll('.composer-tabs button')[
    mode === 'note' ? 1 : 0
  ]
  if (!tab?.disabled && !tab?.parentElement.hidden) tab?.click()
  composer.querySelector('textarea:not(:disabled)')?.focus()
}
function dismissEditor(target, editing) {
  if (target.closest(':popover-open')) return
  const expanded = target.closest('details[open]')
  if (expanded) {
    expanded.open = false
    expanded.querySelector('summary').focus()
  } else editing?.blur()
}
document.addEventListener('keydown', (event) => {
  if (
    event.isComposing ||
    event.defaultPrevented ||
    document.querySelector('dialog[open]')
  )
    return
  const composer = document.querySelector('.composer')
  const editing = editTarget(event.target)
  if (event.key === 'Escape') return dismissEditor(event.target, editing)
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === 'Enter' &&
    composer?.contains(event.target)
  ) {
    event.preventDefault()
    composer.requestSubmit(composer.querySelector('button.button-primary'))
    return
  }
  if (editing || event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key === '?') openDialog(shortcuts, document.activeElement)
  if (event.key === 'u') {
    document.querySelector('.thread-toolbar > a')?.click()
    return
  }
  if (!composer) return
  if (event.key === 'r' || event.key === 'n') {
    event.preventDefault()
    editMode(composer, event.key === 'n' ? 'note' : 'reply')
  }
})
function showShortcutHelp(trigger) {
  const menu = trigger.closest('[popover]')
  const opener =
    menu && document.querySelector('[popovertarget="' + menu.id + '"]')
  if (menu) menu.hidePopover()
  const restore = opener || trigger
  const navigation = trigger.closest('#nav-drawer:modal')
  if (!navigation) return openDialog(shortcuts, restore)
  navigation.addEventListener(
    'close',
    () => {
      shortcuts.addEventListener(
        'close',
        () => {
          if (matchMedia('(max-width: 767px)').matches) {
            document.querySelector('[data-open-drawer]').click()
            restore.focus({ preventScroll: true })
          }
        },
        { once: true },
      )
      openDialog(shortcuts, restore)
    },
    { once: true },
  )
  navigation.close()
}

document.addEventListener('click', (event) => {
  const help = event.target.closest('[data-keyboard-help]')
  if (help) showShortcutHelp(help)
  if (event.target.closest('[data-close-modal]'))
    event.target.closest('dialog').close()
  if (event.target.closest('dialog')) return
  for (const menu of document.querySelectorAll(
    'details.action-menu[open],details.choice-popover[open]',
  ))
    if (!menu.contains(event.target)) menu.open = false
})
