import { Hono, type Context as HttpContext } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import { z } from 'zod'
import { authenticate, type AppEnv } from '../operators/middleware'
import { coreOperations, type Context, type Scope } from './catalog-usecase'
import { authorize, PermissionDenied } from './catalog'
import {
  inboxPage,
  conversationPage,
  settingsPage,
} from '../conversations/conversations-page'
import { readHtml, download } from '../conversations/media-usecase'
const scopes = new Set<Scope>(['read', 'write', 'send', 'admin'])
const app = new Hono<AppEnv>()
function context(c: HttpContext<AppEnv>): Context {
  const operator = c.get('operator')
  return {
    env: c.env,
    operator,
    actor: { kind: 'operator', id: operator.email },
    now: Date.now(),
    uuid: () => crypto.randomUUID(),
  }
}
function run<K extends keyof typeof coreOperations>(
  ctx: Context,
  name: K,
  input: unknown,
): ReturnType<(typeof coreOperations)[K]['execute']> {
  const op = coreOperations[name]
  authorize(ctx, op.permission, scopes)
  return op.execute(ctx, input) as ReturnType<
    (typeof coreOperations)[K]['execute']
  >
}
app.use('*', authenticate)
app.use('*', jsxRenderer(undefined, { docType: true }))
app.get('/', async (c) => {
  const ctx = context(c),
    query = c.req.query()
  const [rows, failures] = await Promise.all([
    run(ctx, 'list', query),
    run(ctx, 'failures', {}),
  ])
  return c.render(inboxPage(rows, failures, query))
})
app.get('/settings', async (c) =>
  c.render(settingsPage(await run(context(c), 'settings', {}))),
)
app.get('/conversation/:number', async (c) =>
  c.render(
    conversationPage(
      await run(context(c), 'get', { number: c.req.param('number') }),
    ),
  ),
)
app.get('/mail/:id', async (c) => {
  const html = await readHtml(c.env, c.req.param('id'))
  if (html === null) return c.notFound()
  c.header(
    'Content-Security-Policy',
    "default-src 'none'; sandbox; frame-ancestors 'self'; base-uri 'none'",
  )
  return c.html(html)
})
app.get('/attachment', async (c) => {
  const file = await download(
    c.env,
    z.string().min(1).parse(c.req.query('key')),
  )
  if (!file) return c.notFound()
  return new Response(file.body, {
    headers: {
      'content-type': 'application/octet-stream',
      'content-disposition':
        "attachment; filename*=UTF-8''" + encodeURIComponent(file.filename),
    },
  })
})
app.post('/actions/:name', async (c) => {
  const name = c.req.param('name')
  if (!Object.hasOwn(coreOperations, name)) return c.notFound()
  const input = await c.req.parseBody()
  await run(context(c), name as keyof typeof coreOperations, input)
  const number = z.coerce.number().int().positive().safeParse(input.number)
  return c.redirect(
    number.success ? '/conversation/' + number.data : '/settings',
    303,
  )
})
app.onError((err, c) => {
  if (err instanceof PermissionDenied) return c.text(err.message, 403)
  if (err instanceof z.ZodError)
    return c.text(
      err.issues.map((i) => i.path.join('.') + ' ' + i.message).join('\n'),
      400,
    )
  if (err.message === 'Conversation not found') return c.notFound()
  return c.text('Operation could not be completed', 409)
})
export { app as operatorRoutes }
