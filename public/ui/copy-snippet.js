for (const panel of document.querySelectorAll('[data-copy-block]')) {
  const snippet = panel.querySelector('[data-snippet]')
  const result = panel.querySelector('[data-copy-result]')
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
