// The transcript, editable contact details and read position belong to this document.
const copy = JSON.parse(document.body.dataset.chatCopy)
const parentOrigin = document.body.dataset.chatParent
const history = document.querySelector('#chat-history')
const turns = document.querySelector('#chat-turns')
const reading = document.querySelector('#chat-reading')
const ask = document.querySelector('#chat-ask')
const question = ask.elements.question
const error = document.querySelector('#chat-error')
const external = document.querySelector('#chat-external')
const questions = []
const presentations = []
const defaults = { email: '', name: '' }
const edited = new Set()
let sourcePage = ''
let contact
let articleLink
let displayedArticle
let busy = false

function element(tag, text, attributes = {}) {
  const node = document.createElement(tag)
  if (text !== null) node.textContent = text
  for (const [name, value] of Object.entries(attributes))
    node.setAttribute(name, value)
  return node
}
function button(text, onClick, variant = 'button-secondary') {
  const control = element('button', text, {
    type: 'button',
    'data-slot': 'button',
    class: variant,
  })
  control.addEventListener('click', onClick)
  return control
}
function showError(message) {
  error.querySelector('span').textContent = message
  error.hidden = !message
}
error.querySelector('button').addEventListener('click', () => showError(''))
function requestBody(intent, fields, token) {
  const data = new FormData()
  data.set('intent', intent)
  data.set('publicKey', ask.elements.publicKey.value)
  if (token) data.set('cf-turnstile-response', token.value)
  for (const [key, value] of Object.entries(fields))
    if (value) data.set(key, value)
  return data
}
async function submit(intent, fields, control, done) {
  if (busy) return
  busy = true
  const previousChoices =
    intent === 'ask'
      ? turns.querySelectorAll('.chat-choices:not([hidden])')
      : []
  previousChoices.forEach((el) => (el.hidden = true))
  control.disabled = true
  showError('')
  const token = document.querySelector('[name="cf-turnstile-response"]')
  const data = requestBody(intent, fields, token)
  try {
    const res = await fetch(location.pathname, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
      referrerPolicy: 'no-referrer',
    })
    if (!res.ok) throw Error(res.status === 403 ? copy.rate : copy.retry)
    done(await res.json())
  } catch (e) {
    previousChoices.forEach((el) => (el.hidden = false))
    if (intent === 'unresolved') showContact()
    else showError(e.message === copy.rate ? copy.rate : copy.retry)
  } finally {
    busy = false
    control.disabled = false
    if (token) window.turnstile?.reset()
  }
}
function focusVisible(node) {
  node.focus({ preventScroll: true })
  node.scrollIntoView({ block: 'nearest' })
}
function appendTurn(text, response) {
  turns
    .querySelectorAll('[role=status]')
    .forEach((node) => node.removeAttribute('role'))
  turns.querySelectorAll('.chat-choices').forEach((choices) => choices.remove())
  questions.push(text)
  ask.reset()
  ask.querySelector('[type=submit]').className = 'button-secondary'
  contact?.remove()
  contact = null
  const group = element('section', null, { class: 'chat-turn' })
  group.append(element('p', text, { class: 'visitor-question' }))
  const result = element('div', null, { class: 'chat-answer' })
  group.append(result)
  turns.append(group)
  const items = response.articles
  if (response.presentation) presentations.push(response.presentation)
  if (items.length) showMatches(result, response)
  else {
    result.append(element('p', copy.noMatch))
    showContact()
  }
}
ask.addEventListener('submit', (event) => {
  event.preventDefault()
  const text = question.value.trim()
  if (!text) return question.focus()
  if ([...questions, text].join('\n\n').length > 30000) {
    showError(copy.tooLong)
    return
  }
  void submit(
    'ask',
    { question: text, requestId: crypto.randomUUID() },
    event.submitter ?? ask.querySelector('button'),
    (response) => appendTurn(text, response),
  )
})
function showMatches(
  result,
  { articles: items, needsHuman, presentation: turn },
) {
  const list = element('ul', null)
  const heading = element('h2', copy.related, { tabindex: '-1' })
  result.append(heading, list)
  if (needsHuman)
    result.prepend(
      button(copy.contactFirst, () => showContact(), 'button-primary'),
    )
  let selected = items[0]
  items.forEach((item) => {
    const link = element('a', item.title, { href: item.url })
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      event.preventDefault()
      selected = item
      void openArticle(link, item)
    })
    const row = element('li', null)
    row.append(link)
    if (item.excerpt) row.append(element('p', item.excerpt))
    list.append(row)
  })
  const choices = element('div', null, { class: 'chat-choices' })
  const solved = button(copy.solved, () =>
    submit('resolve', { article: selected.id, turn }, solved, () => {
      const notice = element('p', copy.solvedNotice, {
        role: 'status',
        tabindex: '-1',
      })
      choices.replaceWith(notice)
      focusVisible(notice)
    }),
  )
  choices.append(
    solved,
    button(copy.unresolved, (event) =>
      submit(
        'unresolved',
        { article: selected.id, turn },
        event.currentTarget,
        showContact,
      ),
    ),
  )
  result.append(choices)
  focusVisible(needsHuman ? result.firstElementChild : heading)
}
function contactField(label, name, type) {
  const wrap = element('label', label)
  const input = element('input', null, {
    type,
    name,
    autocomplete: name,
    'data-slot': 'input',
  })
  input.value = defaults[name]
  if (name === 'email') input.required = true
  else input.maxLength = 200
  input.addEventListener('input', () => {
    edited.add(name)
    defaults[name] = input.value
  })
  wrap.append(input)
  return wrap
}
function showContact() {
  if (contact) {
    focusVisible(contact.querySelector('input'))
    return
  }
  ask.hidden = true
  const previousChoices = [
    ...turns.querySelectorAll('.chat-choices:not([hidden])'),
  ]
  previousChoices.forEach((choice) => (choice.hidden = true))
  const submissionId = crypto.randomUUID()
  const form = element('form', null, { class: 'chat-contact' })
  const send = element('button', copy.send, {
    type: 'submit',
    class: 'button-primary',
    'data-slot': 'button',
  })
  const actions = element('div', null, { class: 'chat-choices' })
  actions.append(
    send,
    button(
      copy.cancel,
      () => {
        form.remove()
        contact = null
        ask.hidden = false
        previousChoices.forEach((choice) => (choice.hidden = false))
        focusVisible(question)
      },
      'button-quiet',
    ),
  )
  form.append(
    element('p', copy.instructions),
    contactField(copy.email, 'email', 'email'),
    contactField(copy.name, 'name', 'text'),
    actions,
  )
  // A handoff includes the entire transcript and follows the latest question.
  history.append(form)
  contact = form
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    void submit(
      'handoff',
      {
        email: form.elements.email.value,
        name: form.elements.name.value,
        question: questions.join('\n\n'),
        presentations: presentations.join(','),
        submissionId,
        sourcePage,
      },
      send,
      (receipt) => showReceipt(form, receipt),
    )
  })
  focusVisible(form.elements.email)
}
function showReceipt(form, receipt) {
  const name = element('p', copy.receipt + '（' + receipt.reference + '）', {
    role: 'status',
    tabindex: '-1',
  })
  const dl = element('dl', null, { class: 'receipt-details' })
  dl.append(element('dt', copy.replyTo), element('dd', receipt.email))
  if (receipt.responseTime)
    dl.append(element('dt', copy.estimate), element('dd', receipt.responseTime))
  const summary = element('section', null, { class: 'chat-receipt' })
  summary.append(name, dl)
  form.remove()
  history.prepend(summary)
  document.querySelector('#chat-intro').hidden = true
  contact = null
  ask.hidden = true
  document.querySelector('#chat-verification').hidden = true
  turns.querySelectorAll('.chat-choices').forEach((node) => node.remove())
  focusVisible(name)
}
async function openArticle(link, item) {
  articleLink = link
  displayedArticle = item
  history.hidden = true
  ask.hidden = true
  reading.hidden = false
  external.href = item.url
  const title = reading.querySelector('h2')
  title.textContent = item.title
  const body = reading.querySelector('article')
  body.replaceChildren()
  focusVisible(title)
  try {
    const res = await fetch(item.url, { referrerPolicy: 'no-referrer' })
    if (!res.ok) throw Error()
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html')
    const article = doc.querySelector('main article')
    if (!article) throw Error()
    if (displayedArticle !== item) return
    // The article endpoint sanitizes Markdown. Preserve its base for relative links.
    for (const a of article.querySelectorAll('a[href]')) {
      a.href = new URL(a.getAttribute('href'), res.url).href
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
    }
    body.replaceChildren(...article.childNodes)
  } catch {
    if (displayedArticle === item) body.textContent = copy.articleError
  }
}
document.querySelector('#chat-back').addEventListener('click', () => {
  displayedArticle = null
  reading.hidden = true
  history.hidden = false
  ask.hidden = Boolean(contact || history.querySelector('.chat-receipt'))
  focusVisible(articleLink)
})
function post(value) {
  if (parentOrigin && window.parent !== window)
    window.parent.postMessage(value, parentOrigin)
}
function handleOpen(data) {
  if (typeof data.page === 'string' && URL.canParse(data.page)) {
    const url = new URL(data.page)
    if (url.origin === parentOrigin && !url.username && !url.password)
      sourcePage = url.origin + url.pathname
  }
  if (!reading.hidden) focusVisible(reading.querySelector('h2'))
  else if (contact) focusVisible(contact.elements.email)
  else if (!ask.hidden) focusVisible(question)
}
function prefill(data) {
  for (const key of ['email', 'name']) {
    if (typeof data[key] !== 'string' || edited.has(key)) continue
    defaults[key] = data[key].slice(0, key === 'name' ? 200 : 320)
    if (contact) contact.elements[key].value = defaults[key]
  }
}
if (parentOrigin && window.parent !== window) {
  addEventListener('message', (event) => {
    if (
      event.origin !== parentOrigin ||
      event.source !== window.parent ||
      !event.data
    )
      return
    if (event.data.type === 'helpdesk:open') handleOpen(event.data)
    if (event.data.type === 'helpdesk:prefill') prefill(event.data)
    if (event.data.type === 'helpdesk:close') document.activeElement?.blur()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      post({ type: 'helpdesk:close' })
    }
  })
  new ResizeObserver(([entry]) => {
    post({
      type: 'helpdesk:height',
      height: Math.ceil(entry.borderBoxSize[0].blockSize),
    })
  }).observe(document.querySelector('.chat-window'))
}
