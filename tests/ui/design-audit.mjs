// Compare the rendered document with DESIGN.md, including component-specific insets.
export function inspectDesign() {
  const root = getComputedStyle(document.documentElement)
  const tokens = (names) =>
    new Set(names.map((name) => parseFloat(root.getPropertyValue(name))))
  const fonts = tokens(
    ['title-lg', 'title-sm', 'body', 'caption', 'reading'].map(
      (id) => '--typography-' + id + '-fontSize',
    ),
  )
  const scale = tokens(
    ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((id) => '--spacing-' + id),
  )
  scale.add(0)
  const problems = new Set(),
    sizes = new Set()
  const components = [
    ['.switch-track,input[role=switch]', 'switch'],
    ['.status-badge', 'status-open'],
    ['.label-chip,.delivery-failed,.delivery-awaiting-approval', 'label-chip'],
    ['.message-inbound', 'message-inbound'],
    ['.message-outbound', 'message-outbound'],
    ['.message-note', 'message-note'],
  ]
  const insets = components.map(([selector, id]) => [
    selector,
    root
      .getPropertyValue('--components-' + id + '-padding')
      .trim()
      .split(/\s+/)
      .map(parseFloat),
  ])
  const properties = [
    'row-gap',
    'column-gap',
    'padding-top',
    'padding-left',
    'padding-right',
    'padding-bottom',
    'margin-top',
    'margin-bottom',
  ]
  const describe = (el) =>
    el.localName + '.' + [...el.classList].slice(0, 2).join('.')
  function inspectSpacing(el) {
    for (const name of properties) {
      const value = el.computedStyleMap().get(name)
      if (value?.unit !== 'px' || scale.has(value.value)) continue
      if (
        name.startsWith('padding') &&
        insets.some(
          ([selector, values]) =>
            el.matches(selector) && values.includes(value.value),
        )
      )
        continue
      if (el.matches('.sr-only,.skip-link:not(:focus)')) continue
      problems.add(describe(el) + ' ' + name + ' ' + value.value)
    }
  }
  function inspectType(el) {
    if (
      ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    )
      return
    const size = parseFloat(getComputedStyle(el).fontSize)
    sizes.add(size)
    if (!fonts.has(size)) problems.add(describe(el) + ' font-size ' + size)
  }
  const compact = parseFloat(root.getPropertyValue('--layout-context-width'))
  const reading = parseFloat(
    root.getPropertyValue('--components-help-article-width'),
  )
  function inspectMeasure(el) {
    const short = el.matches(
      'main input:is([type=number],[type=date],[type=time],[type=datetime-local]),main select:is([name=role],[name=status],[name=period])',
    )
    const prose = el.matches(
      'main textarea,main p:not([role=status],[role=alert],.banner-success,.banner-error,.empty-state,.timeline-entry)',
    )
    const limit = short ? compact : reading
    if ((short || prose) && el.getBoundingClientRect().width > limit + 1)
      problems.add(
        describe(el) +
          ' (' +
          (el.name || el.textContent.trim().slice(0, 15)) +
          ') exceeds ' +
          limit +
          'px',
      )
  }
  for (const el of document.querySelectorAll('body *')) {
    if (
      !(el instanceof HTMLElement) ||
      !el.checkVisibility() ||
      el.closest('.sr-only,svg,script,style')
    )
      continue
    inspectType(el)
    inspectSpacing(el)
    inspectMeasure(el)
  }
  if (sizes.size > 4) problems.add('font sizes ' + [...sizes].join(','))
  return [...problems]
}
