import { createMiddleware } from 'hono/factory'
import type { AppEnv } from './middleware'

// Reuse each operator route's authorization, validation and redirect target
// for in-place interactions. Ordinary forms still follow their native redirect.
export const localResponse = createMiddleware<AppEnv>(async (c, next) => {
  await next()
  const view = c.req.header('X-Helpdesk-View')
  if (view === 'action' && c.req.method === 'POST' && c.res.status === 303) {
    const location = c.res.headers.get('Location')
    if (!location) return
    const target = new URL(location, c.req.url)
    if (target.origin !== new URL(c.req.url).origin) return
    c.res = c.json(
      { location: target.pathname + target.search + target.hash },
      200,
    )
    c.res.headers.delete('Location')
  } else if (
    view === 'page' &&
    c.req.method === 'GET' &&
    c.res.ok &&
    c.res.headers.get('Content-Type')?.startsWith('text/html') &&
    !c.res.headers.has('Content-Disposition')
  ) {
    c.res = c.json({ html: await c.res.text() }, 200)
  }
})
