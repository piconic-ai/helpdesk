import { Hono } from 'hono'
import type { AppEnv } from '../operators/middleware'
import { extensionContext } from './context-usecase'
import { publicDocument, publicPolicy } from '../../public/layout-pages'
import { publicProduct } from '../../public/product-usecase'
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
    return c.text('送信元を確認できませんでした。', 403)
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
  c.header('Content-Security-Policy', publicPolicy)
  const info = await publicProduct(c.env, product)
  return c.html(
    publicDocument(info ?? { name: product, mailbox: null }, page, {
      contact: id === 'articles',
    }),
  )
})
export { app as publicRoutes }
