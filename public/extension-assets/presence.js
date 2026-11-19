window.onHelpdeskPage((signal) => {
  const panel = document.querySelector('section[data-extension=presence]')
  if (!panel) return
  const number = panel.dataset.number
  const tab = crypto.randomUUID()
  const display = panel.querySelector('.extension-content')
  const replyArea = document.querySelector('.reply-area')
  const liveStatus = replyArea ? display.cloneNode(false) : display
  liveStatus.setAttribute('aria-live', 'polite')
  if (replyArea) {
    liveStatus.hidden = true
    replyArea.prepend(liveStatus)
  }
  function changeText(element, text) {
    if (element.textContent !== text) element.textContent = text
  }
  let typedAt = 0
  let pending = false
  let updating = false
  async function heartbeat() {
    if (document.hidden || signal.aborted) return
    if (updating) {
      pending = true
      return
    }
    updating = true
    try {
      const response = await fetch('/actions/presence.heartbeat', {
        signal,
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams({
          number,
          tab,
          mode: Date.now() - typedAt < 12000 ? 'typing' : 'reading',
        }),
      })
      if (!response.ok) throw new Error('Heartbeat failed')
      const users = await response.json()
      const memberStatus =
        users
          .map(
            (user) =>
              user.email +
              '（' +
              (user.mode === 'typing' ? '入力中' : '閲覧中') +
              '）',
          )
          .join(', ') || 'ほかに閲覧中の担当者はいません。'
      if (replyArea) {
        liveStatus.hidden = users.length === 0
        changeText(
          display,
          users.length
            ? 'ほかに' +
                users.length +
                '人がこの会話を開いています。返信欄で状況を確認できます。'
            : memberStatus,
        )
      }
      changeText(liveStatus, memberStatus)
    } catch {
      if (replyArea) liveStatus.hidden = true
      changeText(display, '閲覧状況を取得できません。再確認しています。')
    } finally {
      updating = false
      if (pending) {
        pending = false
        void heartbeat()
      }
    }
  }
  document.addEventListener(
    'input',
    (event) => {
      if (
        event.target.matches(
          'form[action="/actions/reply"] textarea[name="body"]',
        )
      ) {
        const wasIdle = Date.now() - typedAt >= 12000
        typedAt = Date.now()
        if (wasIdle) void heartbeat()
      }
    },
    { signal },
  )
  document.addEventListener('visibilitychange', heartbeat, { signal })
  const timer = setInterval(heartbeat, 5000)
  signal.addEventListener('abort', () => clearInterval(timer), { once: true })
  void heartbeat()
})
