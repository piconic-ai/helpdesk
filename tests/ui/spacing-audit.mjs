// Evaluate rendered boxes, including controls inside otherwise transparent forms.
export function inspectSpacing() {
  const problems = new Set()
  const name = (el) =>
    el.dataset.ui || el.id || el.textContent.trim().slice(0, 18) || el.localName
  const visible = (el) =>
    el.checkVisibility() && el.getBoundingClientRect().width > 0
  const main =
    document.querySelector('dialog:modal') ?? document.querySelector('main')
  if (!main) return ['Missing main surface']
  function framed(el) {
    const s = getComputedStyle(el)
    return (
      s.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
      ['Top', 'Bottom', 'Left', 'Right'].every(
        (side) =>
          parseFloat(s['border' + side + 'Width']) > 0 &&
          s['border' + side + 'Color'] !== 'rgba(0, 0, 0, 0)',
      )
    )
  }
  function boxesWithin(el) {
    if (
      !visible(el) ||
      getComputedStyle(el).position === 'absolute' ||
      el.matches('[popover], dialog:not(:modal)')
    )
      return []
    if (framed(el)) return [el]
    return [...el.children].flatMap(boxesWithin)
  }
  function checkDistance(a, b) {
    const x = a.getBoundingClientRect()
    const y = b.getBoundingClientRect()
    const dx = Math.max(x.left - y.right, y.left - x.right)
    const dy = Math.max(x.top - y.bottom, y.top - x.bottom)
    const tooClose = (gap, overlap) => overlap < -1 && gap >= -1 && gap < 7.9
    if (tooClose(dx, dy) || tooClose(dy, dx))
      problems.add('Under 8px between ' + name(a) + ' and ' + name(b))
  }
  function checkPeers(group) {
    const children = [...group.children].map(boxesWithin)
    children.forEach((batch, index) => {
      const following = children.slice(index + 1).flat()
      for (const a of batch) for (const b of following) checkDistance(a, b)
    })
  }
  function checkHeights(grid) {
    const heights = new Map()
    for (const card of [...grid.children].filter(visible)) {
      const rect = card.getBoundingClientRect()
      const top = Math.round(rect.top)
      if (heights.has(top) && Math.abs(heights.get(top) - rect.height) > 1)
        problems.add('Unequal card heights: ' + name(card))
      heights.set(top, rect.height)
    }
  }
  function wrapped(child) {
    if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim())
      return false
    const range = document.createRange()
    range.selectNodeContents(child)
    return (
      new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size >
      1
    )
  }
  function eachVisible(selector, inspect) {
    for (const element of main.querySelectorAll(selector))
      if (visible(element)) inspect(element)
  }
  eachVisible(
    '[data-layout], [data-ui=filter-line], [data-inbox-content], .context-cards, .reply-area, .settings-card form, main section, .public-form, #thread-actions:popover-open',
    checkPeers,
  )
  eachVisible('[data-layout=grid]', checkHeights)
  eachVisible(
    'time, .row-number, .status-badge, .sidebar-count, button, [data-slot=button], .context-cards code, [data-count]',
    (el) => {
      if ([...el.childNodes].some(wrapped)) problems.add('Wrapped ' + name(el))
    },
  )
  return [...problems]
}
