// Classic and module scripts share the lifetime of the current server-rendered page.
;(() => {
  let page = new AbortController()
  window.helpdeskNavigate = async (url, options) => {
    if (options?.history === 'replace') location.replace(url)
    else location.assign(url)
  }
  window.onHelpdeskPage = (mount) => {
    document.addEventListener('helpdesk:page', () => mount(page.signal))
    if (page) mount(page.signal)
  }
  document.addEventListener('helpdesk:leave', () => {
    page?.abort()
    page = null
  })
  document.addEventListener('helpdesk:page', () => {
    page = new AbortController()
  })
})()
