const panel = document.currentScript.closest('section')
const number = panel.dataset.number
const tab = crypto.randomUUID()
const display = document.createElement('p')
display.setAttribute('aria-live', 'polite')
panel.append(display)
let typedAt = 0
let pending = false
let updating = false
async function heartbeat() {
  if (document.hidden) return
  if (updating) {
    pending = true
    return
  }
  updating = true
  try {
    const response = await fetch('/actions/presence.heartbeat', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        number,
        tab,
        mode: Date.now() - typedAt < 12000 ? 'typing' : 'reading',
      }),
    })
    if (!response.ok) return
    const users = await response.json()
    display.textContent = users
      .map((user) => user.email + ' (' + user.mode + ')')
      .join(', ')
  } catch {
    display.textContent = ''
  } finally {
    updating = false
    if (pending) {
      pending = false
      void heartbeat()
    }
  }
}
document.addEventListener('input', (event) => {
  if (
    event.target.matches('form[action="/actions/reply"] textarea[name="body"]')
  ) {
    const wasIdle = Date.now() - typedAt >= 12000
    typedAt = Date.now()
    if (wasIdle) void heartbeat()
  }
})
document.addEventListener('visibilitychange', heartbeat)
const timer = setInterval(heartbeat, 5000)
window.addEventListener('pagehide', () => clearInterval(timer), { once: true })
void heartbeat()
