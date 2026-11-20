window.onHelpdeskPage((signal) => {
  for (const panel of document.querySelectorAll('[data-widget-settings]')) {
    const { origin, product } = panel.dataset
    const form = panel.querySelector('[data-widget-options]')
    const snippet = panel.querySelector('[data-snippet]')
    const preview = panel.querySelector('iframe')
    const disclosure = preview.closest('details')
    let previewUrl = preview.src
    let timer
    function showPreview() {
      clearTimeout(timer)
      if (!disclosure.open) return
      preview.loading = 'eager'
      if (preview.src !== previewUrl) preview.src = previewUrl
    }
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
      const url = new URL(preview.dataset.previewPath, origin)
      url.searchParams.set('position', position.value)
      url.searchParams.set('label', label.value.trim() || 'ヘルプ')
      previewUrl = url.href
      clearTimeout(timer)
      if (disclosure.open) timer = setTimeout(showPreview, 200)
    }
    signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
    disclosure.addEventListener('toggle', showPreview, { signal })
    form.elements.position.addEventListener('change', refresh)
    form.elements.label.addEventListener('input', refresh)
    form
      .querySelector('[data-show-widget-preview]')
      .addEventListener('click', () => {
        disclosure.open = true
        showPreview()
        disclosure.querySelector('summary').focus()
        preview.scrollIntoView({ block: 'center' })
      })
  }
})
