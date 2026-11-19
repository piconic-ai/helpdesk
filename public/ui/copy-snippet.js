window.onHelpdeskPage(() => {
  for (const panel of document.querySelectorAll('[data-copy-block]')) {
    const snippet = panel.querySelector('[data-snippet]')
    panel
      .querySelector('[data-copy-snippet]')
      .addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(snippet.value)
          window.helpdeskToast('コピーしました。')
        } catch {
          snippet.focus()
          snippet.select()
          window.helpdeskToast(
            'コードを選択しました。コピーしてください。',
            true,
          )
        }
      })
  }
})
