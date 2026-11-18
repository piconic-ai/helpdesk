// BarefootJS UI, adapted from PopoverContent, DropdownMenuContent and DialogContent.
// MIT, BarefootJS Contributors. See src/ui/BAREFOOT-LICENSE.
const focusable =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'

// Barefoot's position tracker samples again at close, including a scroll from focus().
function trackPosition(update) {
  update()
  const onChange = () => update()
  window.addEventListener('scroll', onChange, true)
  window.addEventListener('resize', onChange)
  return () => {
    window.removeEventListener('scroll', onChange, true)
    window.removeEventListener('resize', onChange)
    update()
  }
}

function clampDropdownMenuPosition(
  triggerRect,
  content,
  viewport,
  align,
  gap = 4,
) {
  const maxTop = viewport.height - content.height - gap
  const below = triggerRect.bottom + gap
  const above = triggerRect.top - content.height - gap
  const top =
    below > maxTop && above >= gap
      ? above
      : Math.max(gap, Math.min(below, maxTop))
  const maxLeft = viewport.width - content.width - gap
  const left =
    align === 'end' || triggerRect.left > maxLeft
      ? Math.max(gap, Math.min(triggerRect.right - content.width, maxLeft))
      : Math.max(gap, Math.min(triggerRect.left, maxLeft))
  return { top, left }
}
function menuItems(menu) {
  return [...menu.querySelectorAll(focusable)].filter(
    (item) =>
      item.getClientRects().length &&
      item.getAttribute('aria-disabled') !== 'true',
  )
}
function navigateMenu(event) {
  const menu = event.target.closest('[data-slot="dropdown-menu-content"]')
  if (!menu || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
    return
  const items = menuItems(menu)
  if (!items.length) return
  event.preventDefault()
  const currentIndex = items.indexOf(document.activeElement)
  const indices = {
    ArrowDown: (currentIndex + 1) % items.length,
    ArrowUp: currentIndex > 0 ? currentIndex - 1 : items.length - 1,
    Home: 0,
    End: items.length - 1,
  }
  items[indices[event.key]].focus()
}

const panelSelector =
  '[data-slot="popover-content"],[data-slot="dropdown-menu-content"]'
const hasAnchorPositioning =
  CSS.supports('anchor-scope: --helpdesk-trigger') &&
  CSS.supports('position-anchor: --helpdesk-trigger')

const positions = new WeakMap()
document.addEventListener(
  'toggle',
  (event) => {
    const panel = event.target
    if (!panel.matches(panelSelector)) return
    const trigger = document.querySelector(
      '[popovertarget="' + CSS.escape(panel.id) + '"]',
    )
    if (!trigger) return
    const open = panel.matches(':popover-open')
    trigger.setAttribute('aria-expanded', String(open))
    panel.dataset.state = open ? 'open' : 'closed'
    positions.get(panel)?.()
    positions.delete(panel)
    if (!open) return
    if (!hasAnchorPositioning) {
      const update = () => {
        const pos = clampDropdownMenuPosition(
          trigger.getBoundingClientRect(),
          { width: panel.offsetWidth, height: panel.offsetHeight },
          { width: innerWidth, height: innerHeight },
          panel.dataset.align,
        )
        panel.style.top = pos.top + 'px'
        panel.style.left = pos.left + 'px'
      }
      positions.set(panel, trackPosition(update))
    }
    if (panel.dataset.slot === 'dropdown-menu-content')
      menuItems(panel)[0]?.focus()
  },
  true,
)
document.addEventListener('keydown', navigateMenu)
document.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowDown') return
  const trigger = event.target.closest('[data-slot="dropdown-menu-trigger"]')
  if (!trigger) return
  const panel = document.getElementById(trigger.getAttribute('popovertarget'))
  if (!panel || panel.matches(':popover-open')) return
  event.preventDefault()
  panel.showPopover({ source: trigger })
})

// Use the upstream Tab boundary within a native modal. The browser supplies inertness.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return
  const dialog = event.target.closest(
    'dialog[data-slot="dialog-content"]:modal',
  )
  if (!dialog) return
  const items = menuItems(dialog)
  const first = items[0],
    last = items.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
})
