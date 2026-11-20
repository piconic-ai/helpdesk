// BarefootJS UI, adapted from PopoverContent, DropdownMenuContent and DialogContent.
// MIT, BarefootJS Contributors. See src/ui/BAREFOOT-LICENSE.
const focusable =
  'button:not(:disabled), summary, a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'

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
      item.checkVisibility() &&
      (!menu.matches('[popover]') || item.closest('[popover]') === menu) &&
      item.getAttribute('aria-disabled') !== 'true',
  )
}
function navigateMenu(event) {
  const menu = event.target.closest(panelSelector + ', dialog:modal')
  if (
    !menu?.matches(panelSelector) ||
    !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
  )
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
    if (positions.has(panel)) {
      positions.get(panel)()
      positions.delete(panel)
      panel.style.removeProperty('top')
      panel.style.removeProperty('left')
    }
    if (!open) return
    if (panel.id === 'product-switcher') orderRecentProjects(panel)
    prepareSearch(panel)
    const scope = trigger.closest(
      '[data-slot="popover"], [data-slot="dropdown-menu"]',
    )
    // The template picker lives outside the composer form and has its own named anchor.
    const outsideAnchor = getComputedStyle(panel).positionAnchor
    const namedPair =
      outsideAnchor?.startsWith('--') &&
      outsideAnchor !== '--helpdesk-trigger' &&
      getComputedStyle(trigger).anchorName === outsideAnchor
    const bounds = panel.getBoundingClientRect()
    if (
      !hasAnchorPositioning ||
      (!scope?.contains(panel) && !namedPair) ||
      bounds.top < 0 ||
      bounds.bottom > innerHeight
    ) {
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
    if (!panel.contains(document.activeElement))
      menuItems(panel)[0]?.focus({ preventScroll: true })
  },
  true,
)
document.addEventListener('keydown', navigateMenu)
document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.key !== 'ArrowDown') return
  const trigger = event.target.closest('[popovertarget]')
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

document.addEventListener('helpdesk:menu-updated', (event) =>
  prepareSearch(event.target),
)
function projectHistoryKey(panel) {
  return (
    'helpdesk:recent-projects:' +
    panel.closest('[data-project-history]').dataset.projectHistory
  )
}
function recentProjects(panel) {
  try {
    const ids = JSON.parse(
      localStorage.getItem(projectHistoryKey(panel)) || '[]',
    )
    return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}
function orderRecentProjects(panel) {
  const links = new Map(
    Array.from(panel.querySelectorAll('[data-project-option]'), (link) => [
      link.dataset.projectOption,
      link,
    ]),
  )
  const ordered = new Set([...recentProjects(panel), ...links.keys()])
  for (const id of ordered) {
    const link = links.get(id)
    if (link) panel.append(link)
  }
}
document.addEventListener(
  'click',
  (event) => {
    const link = event.target.closest('[data-project-option]')
    if (!link) return
    const panel = link.closest('#product-switcher')
    const id = link.dataset.projectOption
    const recent = [
      id,
      ...recentProjects(panel).filter((previous) => previous !== id),
    ].slice(0, 8)
    try {
      localStorage.setItem(projectHistoryKey(panel), JSON.stringify(recent))
    } catch {}
  },
  true,
)
function prepareSearch(panel) {
  if (panel.querySelector(':scope > [data-menu-search]')) return
  const options = menuItems(panel).filter(
    (item) =>
      item.matches('button,a[href]') &&
      !item.matches('[popovertarget], [data-manage-labels]'),
  )
  const count =
    panel.id === 'product-switcher'
      ? panel.querySelectorAll('[data-project-option]').length
      : panel.dataset.projectChoices === undefined
        ? options.length
        : Number(panel.dataset.projectChoices)
  if (count <= 8) return
  const search = document.createElement('input')
  search.type = 'search'
  search.dataset.menuSearch = ''
  search.placeholder = '候補を絞り込む'
  search.setAttribute('aria-label', search.placeholder)
  search.addEventListener('input', () => {
    const q = search.value.trim().toLocaleLowerCase()
    for (const option of menuItems(panel)) {
      if (
        !option.matches('button,a[href]') ||
        option.matches('[popovertarget], [data-manage-labels]')
      )
        continue
      option.hidden = !(option.getAttribute('aria-label') || option.textContent)
        .toLocaleLowerCase()
        .includes(q)
    }
  })
  panel.prepend(search)
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.defaultPrevented) return
  const panel = event.target.closest(panelSelector + ', dialog:modal')
  if (!panel?.matches(':popover-open')) return
  event.preventDefault()
  event.stopPropagation()
  panel.hidePopover()
  document
    .querySelector('[popovertarget="' + CSS.escape(panel.id) + '"]')
    ?.focus({ preventScroll: true })
})

// A native select retains form serialization and validity. Rich choices use the shared popup.
function richChoice(select, index) {
  const wrap = select.parentElement
  const wrapper = document.createElement('span')
  wrapper.dataset.slot = 'popover'
  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'button-secondary'
  trigger.dataset.slot = 'popover-trigger'
  const panel = document.createElement('div')
  panel.id = 'choice-menu-' + index
  panel.popover = 'auto'
  if (select.name === 'product')
    panel.dataset.projectChoices = String(
      Array.from(select.options).filter((option) => option.value).length,
    )
  panel.dataset.slot = 'popover-content'
  trigger.setAttribute('popovertarget', panel.id)
  trigger.setAttribute('aria-controls', panel.id)
  trigger.setAttribute('aria-expanded', 'false')
  const label =
    select.getAttribute('aria-label') ||
    select.labels?.[0]?.querySelector('[data-slot=field-label]')?.textContent ||
    select.name
  function display() {
    const selected = select.selectedOptions[0]
    trigger.replaceChildren(
      ...Array.from(selected?.childNodes || [], (node) => node.cloneNode(true)),
    )
    trigger.setAttribute(
      'aria-label',
      label + '：' + (trigger.textContent.trim() || '選択'),
    )
    for (const button of panel.querySelectorAll('[data-choice]'))
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.choice === select.value),
      )
  }
  for (const opt of select.options) {
    if (opt.disabled && !opt.value) continue
    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'button-quiet'
    item.dataset.choice = opt.value
    item.disabled = opt.disabled
    item.append(...Array.from(opt.childNodes, (node) => node.cloneNode(true)))
    item.setAttribute('aria-label', opt.textContent.trim())
    item.addEventListener('click', () => {
      select.value = opt.value
      display()
      panel.hidePopover()
      trigger.focus({ preventScroll: true })
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    panel.append(item)
  }
  if (select.name === 'label' && select.form?.dataset.labelDirectory) {
    const manage = document.createElement('a')
    manage.href = select.form.dataset.labelDirectory
    manage.dataset.manageLabels = ''
    manage.textContent = 'ラベルを管理'
    panel.append(manage)
  }
  select.addEventListener('helpdesk:restore-choice', display)
  select.addEventListener('change', display)
  select.addEventListener('invalid', () => trigger.focus())
  trigger.disabled = select.disabled
  display()
  wrapper.append(trigger, panel)
  wrap.after(wrapper)
  wrap.hidden = true
}
window.onHelpdeskPage(() => {
  document
    .querySelectorAll(
      'select[data-product-select],select:has(option .label-dot, option svg),form[data-live-filters] select[name=sort]',
    )
    .forEach(richChoice)
})
