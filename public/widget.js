// The launcher runs in the embedding page. Conversation data stays in the frame.
;(() => {
  const script = document.currentScript
  const product = script?.dataset.product?.trim()
  if (!product || product === '.' || product === '..' || window.Helpdesk) return
  const origin = new URL(script.src).origin
  const lang = script.dataset.lang || document.documentElement.lang || 'ja'
  const english = /^en(?:-|$)/i.test(lang)
  const label = script.dataset.label?.trim() || (english ? 'Help' : 'ヘルプ')
  const title = english ? 'Help chat' : 'ヘルプチャット'
  const host = document.createElement('div')
  host.dataset.helpdeskWidget = ''
  host.popover = 'manual'
  if (script.dataset.position === 'bottom-left') host.dataset.left = ''

  const shadow = host.attachShadow({ mode: 'open' })
  // A constructed sheet also works on hosts with a strict style-src policy.
  const style = new CSSStyleSheet()
  style.replaceSync(`
    :host {
      all: initial !important; display: block !important; position: fixed !important;
      inset: auto 16px 16px auto !important; margin: 0 !important;
      padding: 0 !important; border: 0 !important; width: auto !important;
      height: auto !important; overflow: visible !important; background: none !important;
      direction: ltr !important; color-scheme: light !important;
    }
    :host([data-left]) { inset: auto auto 16px 16px !important }
    :host::before, :host::after { display: none !important }
    :host::backdrop, dialog::backdrop { background: transparent }
    button {
      box-sizing: border-box; font: 600 14px/1.4 system-ui, sans-serif; color: #fff;
      background: #111; border: 0; border-radius: 8px; min-height: 44px;
      padding: 0 16px; box-shadow: 0 4px 12px rgba(0,0,0,.18); cursor: pointer;
    }
    button:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px }
    dialog {
      position: fixed; inset: auto 16px 16px auto; box-sizing: border-box;
      width: 360px; max-width: calc(100vw - 32px); height: 360px; max-height: 80dvh;
      padding: 0; margin: 0; border: 1px solid #e5e7eb; border-radius: 12px;
      overflow: hidden; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,.18);
    }
    :host([data-left]) dialog { inset: auto auto 16px 16px }
    dialog button {
      position: absolute; z-index: 1; top: 2px; right: 2px; padding: 0;
      width: 44px; height: 44px; font-size: 22px; font-weight: 400;
      background: #fff; color: #111; box-shadow: none;
    }
    dialog button:focus-visible { outline-offset: -4px }
    iframe { display: block; width: 100%; height: 100%; border: 0 }
    @media (width < 480px) {
      dialog, :host([data-left]) dialog {
        inset: 0; width: 100%; max-width: none; height: 100dvh !important;
        max-height: none; border: 0; border-radius: 0;
      }
    }
  `)
  shadow.adoptedStyleSheets = [style]
  const launcher = document.createElement('button')
  launcher.type = 'button'
  launcher.textContent = label
  launcher.setAttribute('aria-haspopup', 'dialog')
  launcher.setAttribute('aria-controls', 'chat')
  launcher.setAttribute('aria-expanded', 'false')
  const panel = document.createElement('dialog')
  panel.id = 'chat'
  panel.lang = lang
  panel.setAttribute('aria-label', title)
  const dismiss = document.createElement('button')
  dismiss.type = 'button'
  dismiss.textContent = '×'
  dismiss.title = english ? 'Close help' : 'ヘルプを閉じる'
  dismiss.setAttribute('aria-label', dismiss.title)
  panel.append(dismiss)
  if (script.dataset.launcher !== 'none') shadow.append(launcher)
  shadow.append(panel)

  let frame
  let loaded = false
  let returnTo
  const contact = {}
  const send = (message) => frame.contentWindow.postMessage(message, origin)
  function sendOpen() {
    // Keep the origin even when a pathname starts with two slashes.
    const page = new URL(location.origin)
    page.pathname = location.pathname
    send({ type: 'helpdesk:open', page: page.href, lang })
  }
  function makeFrame() {
    const url = new URL('/help/chat/' + encodeURIComponent(product), origin)
    url.search = new URLSearchParams({
      embed: '1',
      parent: location.origin,
      lang,
    })
    frame = document.createElement('iframe')
    frame.title = title
    frame.referrerPolicy = 'no-referrer'
    frame.addEventListener('load', () => {
      loaded = true
      if (panel.open) sendOpen()
      if (Object.keys(contact).length)
        send({ type: 'helpdesk:prefill', ...contact })
    })
    frame.src = url.href
    panel.append(frame)
  }
  function open(trigger) {
    if (panel.open) return
    returnTo = trigger || shadow.activeElement || document.activeElement
    panel.showModal()
    launcher.setAttribute('aria-expanded', 'true')
    if (!frame) makeFrame()
    else if (loaded) sendOpen()
  }
  function close() {
    if (!panel.open) return
    panel.close()
    if (loaded) send({ type: 'helpdesk:close' })
    launcher.setAttribute('aria-expanded', 'false')
    returnTo?.focus?.({ preventScroll: true })
  }
  function prefill(values) {
    if (!values) return
    const changed = {}
    for (const key of ['name', 'email']) {
      if (typeof values[key] === 'string') {
        contact[key] = values[key]
        changed[key] = values[key]
      }
    }
    if (loaded && Object.keys(changed).length)
      send({ type: 'helpdesk:prefill', ...changed })
  }

  addEventListener('message', (event) => {
    if (
      !frame ||
      event.source !== frame.contentWindow ||
      event.origin !== origin
    )
      return
    const message = event.data
    if (message?.type === 'helpdesk:close') close()
    if (
      message?.type === 'helpdesk:height' &&
      Number.isFinite(message.height) &&
      message.height > 0
    )
      panel.style.height = Math.ceil(message.height + 2) + 'px'
  })
  launcher.addEventListener('click', () => open(launcher))
  dismiss.addEventListener('click', close)
  panel.addEventListener('cancel', (event) => {
    event.preventDefault()
    close()
  })
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('[data-helpdesk-open]')
    if (trigger) {
      event.preventDefault()
      open(trigger)
    }
  })
  ;(document.body || document.documentElement).append(host)
  host.showPopover()
  window.Helpdesk = { open: () => open(), close, prefill }
})()
