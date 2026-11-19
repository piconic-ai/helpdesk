for (const picker of document.querySelectorAll('[data-issue-picker]')) {
  const form = picker.querySelector('form')
  const search = form.querySelector('[type=search]')
  const select = form.elements.issue
  const button = form.querySelector('button')
  const status = form.querySelector('[role=status]')
  let choices
  function filter() {
    const value = select.value
    const query = search.value.trim().toLocaleLowerCase()
    const matches = choices.filter((i) =>
      i.title.toLocaleLowerCase().includes(query),
    )
    select.replaceChildren(
      ...matches.map(
        (i) => new Option('#' + i.number + ' ' + i.title, i.number),
      ),
    )
    if (matches.some((i) => String(i.number) === value)) select.value = value
    select.disabled = button.disabled = matches.length === 0
    status.textContent = matches.length
      ? matches.length + '件の課題'
      : '該当する課題はありません。'
  }
  let loading = false
  async function load() {
    if (!picker.open || choices || loading) return
    loading = true
    status.textContent = '課題を読み込んでいます。'
    try {
      const response = await fetch(
        '/issues/choices/' + picker.dataset.issuePicker,
      )
      if (!response.ok) throw new Error()
      const data = await response.json()
      form.dataset.repo = data.repo
      form.dataset.backlink = data.backlink
      choices = data.choices
      filter()
    } catch {
      status.textContent =
        '課題を読み込めませんでした。設定を確認し、もう一度開いてください。'
    } finally {
      loading = false
    }
  }
  search.addEventListener('input', () => {
    if (choices) filter()
  })
  picker.addEventListener('toggle', load)
  if (picker.open) void load()
  if (new URLSearchParams(location.search).get('issue') === 'link') {
    window.addEventListener('DOMContentLoaded', () => {
      const drawer = picker.closest('[popover]')
      if (drawer && !drawer.matches(':popover-open')) drawer.showPopover()
      picker.open = true
      search.focus()
    })
  }
}
