import { jsonQuery } from '/components/local-requests.js'

window.onHelpdeskPage((signal) => {
  for (const picker of document.querySelectorAll('[data-issue-picker]')) {
    const form = picker.querySelector('form')
    const search = form.querySelector('[type=search]')
    const select = form.elements.issue
    const button = form.querySelector('button')
    const status = form.querySelector('[role=status]')
    const suggestion = document.querySelector('[data-issue-suggestion]')
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
      if (choices || loading) return
      loading = true
      status.textContent = '課題を読み込んでいます。'
      try {
        const data = await jsonQuery(
          '/issues/choices/' + picker.dataset.issuePicker,
          signal,
        )
        form.dataset.repo = data.repo
        form.dataset.reference = data.reference
        form.dataset.demo = String(data.demo === true)
        choices = data.choices
        filter()
        const match = choices.find((i) => i.number === data.suggested)
        if (suggestion && match) {
          suggestion.textContent = '関連しそうな課題：' + match.title
          suggestion.hidden = false
          suggestion.addEventListener('click', () => {
            openPicker()
            search.value = match.title
            filter()
            select.value = String(match.number)
            select.focus()
          })
        }
      } catch {
        if (signal.aborted) return
        status.textContent =
          '課題を読み込めませんでした。設定を確認し、もう一度開いてください。'
      } finally {
        loading = false
      }
    }
    search.addEventListener('input', () => {
      if (choices) filter()
    })
    function openPicker() {
      const drawer = picker.closest('[popover]')
      if (drawer && !drawer.matches(':popover-open')) drawer.showPopover()
      picker.open = true
      search.focus()
    }
    picker.addEventListener('toggle', () => {
      if (picker.open) void load()
    })
    if (suggestion || picker.open) void load()
    if (new URLSearchParams(location.search).get('issue') === 'link') {
      if (document.readyState === 'loading')
        window.addEventListener('DOMContentLoaded', openPicker, {
          once: true,
          signal,
        })
      else openPicker()
    }
  }
})
