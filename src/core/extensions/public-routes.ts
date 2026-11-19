import { productIcon } from '../settings/product-icon-usecase'
import { productIconSvg } from '../../ui/product-mark'
import type { Bindings } from '../settings/bindings'
import { Hono } from 'hono'
import type { AppEnv } from '../operators/middleware'
import { extensionContext } from './context-usecase'
import { publicDocument, publicPolicy } from '../../public/layout-pages'
import { hostedPolicy } from '../intakes/hosted-policy-usecase'
import {
  acceptsHostedSubmissions,
  contactDestination,
} from '../../public/contact'
import { publicProduct } from '../../public/product-usecase'
async function articleOptions(
  env: Bindings,
  id: string,
  product: string,
  origin: string,
  mailbox?: string | null,
) {
  if (id !== 'articles') return {}
  const policy = await hostedPolicy(env, product, origin)
  const hasForm = env.EXTENSIONS?.active.some((e) => e.extension.id === 'form')
  const contact = contactDestination(
    product,
    mailbox,
    !!hasForm && acceptsHostedSubmissions(policy),
  )
  return { origins: policy?.origins ?? [], contact }
}

const app = new Hono<AppEnv>()
app.get('/help/product-icon/:product', async (c) => {
  const icon = await productIcon(c.env, c.req.param('product'))
  if (!icon) return c.notFound()
  if (icon.image)
    return new Response(icon.image.body, {
      headers: { 'Content-Type': 'image/png' },
    })
  return new Response(productIconSvg(icon.name, icon.emoji), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  })
})
function articleLayout(id: string, method: string, path?: string) {
  if (id !== 'articles' || method !== 'GET') return 'other'
  return path?.replaceAll('/', '') ? 'article' : 'index'
}
app.all('/help/:id/:product/:path{.*}?', async (c) => {
  const { id, product, path } = c.req.param()
  const item = c.env.EXTENSIONS?.active.find((x) => x.extension.id === id)
  if (!item) return c.notFound()
  const info = await publicProduct(c.env, product)
  if (id === 'articles' && !info?.mailbox) return c.notFound()
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
  const origin = new URL(c.req.url).origin
  const method = c.req.method
  if (method === 'POST' && c.req.header('origin') !== origin)
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
  const { origins, contact } = await articleOptions(
    c.env,
    id,
    product,
    origin,
    info?.mailbox,
  )
  const layout = articleLayout(id, method, path)
  const search = layout === 'index'
  c.header(
    'Content-Security-Policy',
    publicPolicy(origins) +
      (layout !== 'other'
        ? `; script-src ${origin}/ui/ ${origin}/components/; connect-src 'self'`
        : ''),
  )
  return c.html(
    publicDocument(info ?? { name: product, mailbox: null }, page, {
      article: layout === 'article',
      contact,
      search,
    }),
    page.status ?? 200,
  )
})
export { app as publicRoutes }
