const confirmation = document.getElementById('action-confirmation')
const shortcuts = document.getElementById('keyboard-help')
const permitted = new WeakSet()

function openDialog(dialog, trigger) {
  if (document.querySelector('dialog[open]')) return
  const previousPopover = trigger?.closest(':popover-open')
  dialog.returnValue = ''
  dialog.addEventListener(
    'close',
    () => {
      if (
        dialog.returnValue !== 'confirmed' &&
        previousPopover?.isConnected &&
        !previousPopover.matches(':popover-open')
      )
        previousPopover.showPopover()
      trigger?.focus({ preventScroll: true })
    },
    { once: true },
  )
  const { scrollX: left, scrollY: top } = window
  dialog.showModal()
  dialog.querySelector('button')?.focus({ preventScroll: true })
  if (scrollX !== left || scrollY !== top)
    window.scrollTo({ left, top, behavior: 'instant' })
}

function confirmAction(trigger, title, description, verb, commit) {
  confirmation.querySelector('h2').textContent = title
  confirmation.querySelector('p').textContent = description
  const button = confirmation.querySelector('[data-commit]')
  button.textContent = verb
  button.onclick = () => {
    confirmation.close('confirmed')
    commit()
  }
  openDialog(confirmation, trigger)
}

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
    return [label, 'この会話から下書き1件を削除します。']
  if (action === '/actions/issues.link')
    return [
      label,
      form.dataset.repo +
        ' の「' +
        form.elements.issue.selectedOptions[0].textContent.trim() +
        '」に、この会話へのリンクをコメントとして投稿します。\n' +
        form.dataset.backlink,
    ]
  if (action === '/actions/merge.combine')
    return [
      label,
      'この会話を「' +
        form.elements.target.selectedOptions[0].textContent.trim() +
        '」に統合します。',
    ]
  if (action === '/actions/feedback.convert')
    return [label, 'このフィードバックを返信できる問い合わせに変更します。']
  return settingsConfirmation(action, form, trigger, label)
}

function settingsConfirmation(action, form, trigger, label) {
  if (action === '/extensions/rules/remove')
    return [label, '選択した振り分けルール1件を削除します。']
  if (form.elements.enabled?.value === 'yes' && form.dataset.permissions)
    return [
      trigger.getAttribute('aria-label'),
      '使用する権限：' + form.dataset.permissions,
    ]
  if (form.elements.enabled?.value === 'no')
    return [
      label,
      form.closest('[data-extension]').querySelector('h3').textContent +
        'を無効にします。',
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
    confirmAction(
      trigger,
      '起票内容を確認',
      [
        content.querySelector('p').textContent,
        content.querySelector('h2').textContent,
        content.querySelector('pre').textContent,
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
    )
  } catch {
    let error = form.querySelector('[role=alert]')
    if (!error) {
      error = document.createElement('p')
      error.setAttribute('role', 'alert')
      form.append(error)
    }
    error.textContent =
      '起票内容を取得できませんでした。入力内容を確認してもう一度お試しください。'
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
    document.querySelector('.thread-header > a')?.click()
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
          if (matchMedia('(max-width: 767px)').matches)
            document.querySelector('[data-open-drawer]').click()
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
