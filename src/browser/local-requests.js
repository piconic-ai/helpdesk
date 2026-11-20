import {
  createMutation,
  createQuery,
  createRoot,
  http,
} from '@barefootjs/client'

function localPath(input) {
  const url = new URL(input, location.href)
  if (url.origin !== location.origin) throw new Error('Expected a local URL')
  return url.pathname + url.search
}

// Each caller consumes the action's promise. Release the reactive owner once
// the request starts so completed console pages do not accumulate in the cache.
// Barefoot shares concurrent reads and separates them again after a write.
function requestAction(create) {
  return createRoot((dispose) => {
    try {
      const [, action] = create()
      return action()
    } finally {
      dispose()
    }
  })
}

async function read(url, headers, signal) {
  signal?.throwIfAborted()
  const result = await requestAction(() =>
    createQuery(() => http.get(url, undefined, { headers }), { ttl: 0 }),
  )
  signal?.throwIfAborted()
  return result
}

export function jsonQuery(url, signal) {
  return read(localPath(url), { Accept: 'application/json' }, signal)
}

export async function pageQuery(url, signal) {
  // A fragment is part of Barefoot's request key but is never sent to the
  // server. A simultaneous JSON resource read cannot share this representation.
  const { html } = await read(
    localPath(url) + '#console-page',
    {
      Accept: 'text/html',
      'X-Helpdesk-View': 'page',
    },
    signal,
  )
  if (typeof html !== 'string') throw new Error('Expected an operator page')
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (
    !doc.body.matches('.app-shell') ||
    doc.body.dataset.routerShell !== document.body.dataset.routerShell
  ) {
    throw new Error('Unexpected operator page')
  }
  return doc
}

export function jsonMutation(url, body, { accept } = {}) {
  const path = localPath(url)
  const form = body instanceof FormData || body instanceof URLSearchParams
  return requestAction(() =>
    createMutation(
      () =>
        http.post(path, body, {
          headers: {
            Accept: accept ?? (form ? 'text/html' : 'application/json'),
            'X-Helpdesk-View': 'action',
          },
        }),
      { invalidates: ['/'] },
    ),
  )
}

export function syncPageCounts(doc) {
  const links = new Map(
    [...doc.querySelectorAll('.sidebar-item[href]')].map((link) => [
      link.getAttribute('href'),
      link,
    ]),
  )
  for (const link of document.querySelectorAll('.sidebar-item[href]')) {
    const next = links.get(link.getAttribute('href'))
    if (!next) continue
    const count = link.querySelector('.sidebar-count')
    const updated = next.querySelector('.sidebar-count')
    if (!updated) count?.remove()
    else if (!count) link.append(updated.cloneNode(true))
    else if (count.textContent !== updated.textContent)
      count.textContent = updated.textContent
  }
  if (doc.title && doc.title !== document.title) document.title = doc.title
}
