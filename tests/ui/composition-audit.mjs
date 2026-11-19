// Runs inside Chromium against the layout at the active viewport width.
export function inspectComposition() {
  const problems = []
  const main = document.querySelector('main')
  const templates = main?.querySelectorAll('[data-ui-page]')
  const expected = document.body.dataset.ui === 'gallery' ? 4 : 1
  if (templates?.length !== expected)
    return [
      'Expected ' +
        expected +
        ' page templates in main, found ' +
        (templates?.length ?? 0),
    ]
  const visible = (el) =>
    el.checkVisibility() && el.getBoundingClientRect().width > 0
  function checkAlignment(template) {
    const title = template.querySelector('[data-ui=heading] h1')
    const body = template.querySelector('[data-ui=body]')
    if (
      !title ||
      !body ||
      Math.abs(
        title.getBoundingClientRect().left - body.getBoundingClientRect().left,
      ) > 1
    )
      problems.push('Page heading and body must share a left edge')
  }
  function checkColumnWidth(template) {
    const body = template.querySelector('[data-ui=body]')
    const max = { detail: 760, edit: 560 }[template.dataset.uiPage]
    if (max && body?.getBoundingClientRect().width > max + 1)
      problems.push(template.dataset.uiPage + ' exceeds ' + max + 'px')
  }
  function checkInsets() {
    const root = getComputedStyle(document.documentElement)
    const cardPadding = root
      .getPropertyValue('--components-settings-card-padding')
      .trim()
    for (const card of main.querySelectorAll(
      '[data-ui=metric-card],[data-ui=form-section],[data-ui=extension-card]',
    )) {
      if (!visible(card)) continue
      const style = getComputedStyle(card)
      if (
        ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'].some(
          (side) => style[side] !== cardPadding,
        )
      )
        problems.push(card.dataset.ui + ' padding must match ' + cardPadding)
    }
  }
  function checkNavigation() {
    for (const item of document.querySelectorAll('ul > li')) {
      if (
        visible(item) &&
        getComputedStyle(item).display === 'list-item' &&
        getComputedStyle(item).listStyleType !== 'none'
      )
        problems.push(
          'Visible list marker on ' + item.textContent.trim().slice(0, 25),
        )
    }
    for (const link of document.querySelectorAll('a[href]')) {
      if (!visible(link) || link.closest('p, article blockquote, article li'))
        continue
      const style = getComputedStyle(link)
      if (
        style.textDecorationLine.includes('underline') &&
        style.color === 'rgb(37, 99, 235)'
      )
        problems.push(
          'Underlined navigation link: ' + link.textContent.trim().slice(0, 35),
        )
    }
  }
  function borderedRows() {
    const groups = []
    for (const button of main.querySelectorAll(
      'button,summary,a[data-slot=button],[role=button]',
    )) {
      if (!visible(button)) continue
      const style = getComputedStyle(button)
      if (
        style.borderTopStyle === 'none' ||
        parseFloat(style.borderTopWidth) === 0 ||
        style.borderTopColor === 'rgba(0, 0, 0, 0)'
      )
        continue
      const rect = button.getBoundingClientRect()
      const middle = (rect.top + rect.bottom) / 2
      let row = groups.find((r) => Math.abs(r.middle - middle) < 2)
      if (!row) {
        row = { middle, items: [] }
        groups.push(row)
      }
      row.items.push({
        left: rect.left,
        right: rect.right,
        label: button.textContent.trim().slice(0, 20),
      })
    }
    return groups
  }
  function checkButtonGroups() {
    for (const row of borderedRows()) {
      const items = row.items.sort((a, b) => a.left - b.left)
      let run = []
      for (const item of items) {
        if (run.length && item.left - run.at(-1).right > 24) run = []
        run.push(item)
        if (run.length === 4)
          problems.push(
            'Four adjacent bordered controls: ' +
              run.map((i) => i.label).join(', '),
          )
      }
    }
  }
  function checkEditors() {
    const stacked = innerWidth <= 767 ? 'details' : 'details[open]'
    for (const editor of main.querySelectorAll(
      '[data-ui=list-row] > ' + stacked,
    )) {
      if (!visible(editor)) continue
      const caption = editor.parentElement.firstElementChild
      if (
        editor.getBoundingClientRect().top <
        caption.getBoundingClientRect().bottom
      )
        problems.push(
          'Editor crowds its row title: ' + caption.textContent.trim(),
        )
    }
    const templates = main.querySelector(
      '.reply-area [data-extension=canned] details[open]',
    )
    const composer = main.querySelector('.reply-area .composer')
    if (
      templates &&
      composer &&
      visible(templates) &&
      templates.getBoundingClientRect().bottom >
        composer.getBoundingClientRect().top + 1
    )
      problems.push('Composer covers the open template choices')
    for (const select of main.querySelectorAll('[data-slot=native-select]')) {
      if (
        visible(select) &&
        getComputedStyle(select).appearance === 'base-select' &&
        getComputedStyle(select, '::picker-icon').display !== 'none'
      )
        problems.push('Duplicate dropdown arrow on ' + select.name)
    }
  }
  for (const template of templates) {
    checkAlignment(template)
    checkColumnWidth(template)
  }
  checkInsets()
  if (!document.body.matches('.public-surface')) {
    checkNavigation()
    checkButtonGroups()
    checkEditors()
  }
  return [...new Set(problems)]
}
