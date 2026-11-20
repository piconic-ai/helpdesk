import { NAVIGATING_ATTR, startRouter } from '@barefootjs/router'
import { disposeScope, rehydrateScope } from '@barefootjs/client/runtime'

const shell = document.body.dataset.routerShell
const isConsole = document.body.classList.contains('app-shell')
const surface = isConsole ? '.app-shell' : '.public-surface'
const selector = `body${surface}[data-router-shell="${CSS.escape(shell)}"]:not(:has(script[data-classic-panel])) [bf-region]`
const consolePages = new Set([
  '',
  'account',
  'articles',
  'conversation',
  'extensions',
  'issues',
  'metrics',
  'settings',
  'tokens',
  'voices',
])

function routeLink(link) {
  if (
    link.hasAttribute('download') ||
    link.relList.contains('external') ||
    link.dataset.bfRouter === 'false' ||
    (link.target && link.target !== '_self')
  )
    return false
  const url = new URL(link.href)
  if (
    url.origin !== location.origin ||
    (url.hash &&
      url.pathname === location.pathname &&
      url.search === location.search)
  )
    return false
  if (!isConsole) {
    return shell
      ? url.pathname.startsWith(
          '/help/articles/' + encodeURIComponent(shell) + '/',
        )
      : /^\/help\/?$/.test(url.pathname)
  }
  return (
    consolePages.has(url.pathname.split('/')[1]) &&
    !url.pathname.startsWith('/extensions/chat/preview/') &&
    !url.pathname.startsWith('/account/avatar/') &&
    !url.pathname.startsWith('/issues/choices/')
  )
}

if (
  document.querySelector(selector) &&
  (isConsole || window.top === window.self)
) {
  const main = document.querySelector('main')
  const announcement = document.createElement('div')
  announcement.className = 'sr-only'
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')

  let displayedPath = location.pathname
  function enterPage() {
    delete main.dataset.hydrating
    rehydrateScope(main)
    if (
      displayedPath !== location.pathname &&
      !main.contains(document.activeElement)
    ) {
      const heading = main.querySelector('h1, h2') ?? main
      if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
    displayedPath = location.pathname
    // A filter, returned draft or inbox action can now restore more specific focus.
    document.dispatchEvent(new Event('helpdesk:page'))
    announcement.textContent = document.title
  }

  // An overlapping navigation may reuse markup swapped by its predecessor
  // before that predecessor reached hydration.
  new MutationObserver(() => {
    if (
      main.hasAttribute('data-hydrating') &&
      !document.documentElement.hasAttribute(NAVIGATING_ATTR)
    )
      enterPage()
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: [NAVIGATING_ATTR],
  })

  const router = startRouter({
    region: selector,
    shouldIntercept: routeLink,
    // Each visit reads the current assignment, approval and delivery state.
    prefetch: false,
    manageFocus: false,
    cacheCap: 0,
    dispose(region) {
      // Native fields are editable while new island modules load.
      if (region.matches('main')) {
        if (!announcement.isConnected) document.body.prepend(announcement)
        main.dataset.routed = ''
        main.dataset.hydrating = ''
        document.dispatchEvent(new Event('helpdesk:leave'))
      }
      disposeScope(region)
    },
    rehydrate(region) {
      document.querySelector('#nav-drawer[open]')?.close()
      if (region === main) enterPage()
      else rehydrateScope(region)
    },
  })
  window.helpdeskNavigate = router.navigate
}
