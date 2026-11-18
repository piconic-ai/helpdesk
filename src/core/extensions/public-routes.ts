import { Hono } from 'hono'
import type { AppEnv } from '../operators/middleware'
import { extensionContext } from './context-usecase'
import { html, raw } from 'hono/html'
const app = new Hono<AppEnv>()
app.all('/help/:id/:product/:path{.*}?', async (c) => {
  const { id, product, path } = c.req.param()
  const item = c.env.EXTENSIONS?.active.find((x) => x.extension.id === id)
  if (!item) return c.notFound()
  const ctx = extensionContext(
    {
      actor: { kind: 'extension', id },
      env: c.env,
      operator: { email: '', role: 'agent' },
      now: Date.now(),
      uuid: () => crypto.randomUUID(),
    },
    item,
  )
  const method = c.req.method
  if (method === 'POST' && c.req.header('origin') !== new URL(c.req.url).origin)
    return c.text('Invalid origin', 403)
  const page =
    method === 'POST'
      ? await item.extension.publicAction?.(ctx, product, path ?? '', c.req.raw)
      : method === 'GET'
        ? await item.extension.publicPage?.(
            ctx,
            product,
            path ?? '',
            new URL(c.req.url).searchParams,
          )
        : null
  if (!page) return c.notFound()
  c.header(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  )
  return c.html(
    html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link rel="stylesheet" href="/styles.css" />
          <title>${page.title}</title>
        </head>
        <body>
          <main>${raw(page.html)}</main>
        </body>
      </html>`,
  )
})
export { app as publicRoutes }
