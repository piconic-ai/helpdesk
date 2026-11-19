// Runs against every seeded screen and viewport, including open overlays.
export function inspectIdentity() {
  const findings = []
  const openCount = document.querySelector(
    '.sidebar-views a[href*="status=open"] .sidebar-count',
  )
  if (
    openCount &&
    !document.title.startsWith('(' + openCount.textContent + ') ')
  )
    findings.push('Tab count differs from the open inbox')
  for (const el of document.querySelectorAll('[data-ui=empty]'))
    if (el.querySelectorAll(':scope > svg').length !== 1)
      findings.push('Empty list is missing its illustration')
  function symbolControl(el) {
    if (!el.checkVisibility() || !el.querySelector('svg[data-glyph]'))
      return false
    const copy = el.cloneNode(true)
    copy.querySelectorAll('svg').forEach((node) => node.remove())
    return !copy.textContent.trim()
  }
  function lacksName(el) {
    return !(
      el.getAttribute('aria-label')?.trim() ||
      el.getAttribute('aria-labelledby')?.trim()
    )
  }
  document
    .querySelectorAll('svg[data-glyph]:not([aria-hidden=true])')
    .forEach((icon) => {
      if (lacksName(icon) || !icon.querySelector('title')?.textContent.trim())
        findings.push(
          'Missing accessible name or tooltip on ' + icon.dataset.glyph,
        )
    })
  document.querySelectorAll('button, a[href]').forEach((el) => {
    if (symbolControl(el) && (lacksName(el) || !el.title))
      findings.push(
        'Symbol control needs a name and tooltip: ' + el.outerHTML.slice(0, 80),
      )
  })
  return findings
}
