for (const panel of document.querySelectorAll('[data-widget-settings]')) {
  const { origin, product } = panel.dataset
  const form = panel.querySelector('[data-widget-options]')
  const snippet = panel.querySelector('[data-snippet]')
  const result = panel.querySelector('[data-copy-result]')
  const preview = panel.querySelector('iframe')
  let timer
  function refresh() {
    const { position, label } = form.elements
    const script = document.createElement('script')
    script.src = origin + '/widget.js'
    script.dataset.product = product
    if (position.value !== 'bottom-right')
      script.dataset.position = position.value
    if (label.value.trim() && label.value.trim() !== 'ヘルプ')
      script.dataset.label = label.value.trim()
    script.referrerPolicy = 'no-referrer'
    script.setAttribute('async', '')
    snippet.value = script.outerHTML
    result.textContent = ''
    clearTimeout(timer)
    timer = setTimeout(() => {
      const url = new URL(preview.dataset.previewPath, origin)
      url.searchParams.set('position', position.value)
      url.searchParams.set('label', label.value.trim() || 'ヘルプ')
      if (url.href !== preview.src) preview.src = url.href
    }, 200)
  }
  form.elements.position.addEventListener('change', refresh)
  form.elements.label.addEventListener('input', refresh)
  panel
    .querySelector('[data-copy-snippet]')
    .addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(snippet.value)
        result.textContent = 'コピーしました。'
      } catch {
        snippet.focus()
        snippet.select()
        result.textContent = 'コードを選択しました。コピーしてください。'
      }
    })
}
