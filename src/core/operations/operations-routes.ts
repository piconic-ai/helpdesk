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
  htmlMailPage,
} from '../conversations/conversations-page'
import {
  consoleFrame,
  inboxMetadata,
  threadFiles,
} from '../conversations/console-usecase'
import {
  settingsSections,
  settingsSectionPage,
} from '../conversations/settings-page'
import {
  mailboxInput,
  settingsContacts,
  sendingDomains,
} from '../settings/console-settings-usecase'
import { enableHostedIntake } from '../intakes/hosted-policy-usecase'
import { operatorErrorPage } from '../conversations/console-page'
import { readHtml, download } from '../conversations/media-usecase'
import { recordView } from '../extensions/view-usecase'
import { describe, invoke } from './runtime-usecase'
import {
  panels,
  management,
  toggle,
  replyLinks,
} from '../extensions/registry-usecase'
import {
  extensionPanels,
  managementPage,
  operationResult,
  issuePreview,
} from '../extensions/extensions-page'
export const scopes = new Set<Scope>([
  'read',
  'draft',
  'write',
  'send',
  'admin',
])
const app = new Hono<AppEnv>()
export function context(c: HttpContext<AppEnv>): Context {
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
  const isFeedback = query.view === 'feedback'
  const isApproval = query.view === 'approval'
  const status =
    query.status || (isFeedback ? 'received' : isApproval ? 'all' : 'open')
  const [listed, failures, frame] = await Promise.all([
    run(ctx, 'list', { ...query, status }),
    run(ctx, 'failures', {}),
    consoleFrame(c.env, ctx.operator, c.req.path, query, ctx.now),
  ])
  const rows = listed.filter((row) =>
    isFeedback
      ? row.kind === 'feedback'
      : row.kind === 'inquiry' &&
        (!isApproval || frame.approvalNumbers.has(row.number)),
  )
  return c.render(
    inboxPage(
      rows,
      failures,
      query,
      frame,
      await inboxMetadata(
        c.env,
        rows.map((r) => r.number),
        ctx.operator,
      ),
    ),
  )
})
app.get('/settings', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  return c.render(
    settingsPage(
      (await run(ctx, 'doctor', {})).issues,
      await consoleFrame(c.env, ctx.operator, c.req.path),
    ),
  )
})
app.get(
  '/settings/:section{mailboxes|operators|retention|deletion}',
  async (c) => {
    const ctx = context(c)
    const section = settingsSections.parse(c.req.param('section'))
    const data = await run(ctx, 'settings', {})
    return c.render(
      settingsSectionPage(
        section,
        data,
        sendingDomains(c.env.SENDING_DOMAINS),
        section === 'deletion' ? await settingsContacts(ctx) : [],
        await consoleFrame(c.env, ctx.operator, c.req.path),
        c.req.query('saved') === 'yes',
      ),
    )
  },
)
app.post('/settings/mailboxes', async (c) => {
  const ctx = context(c)
  const data = await run(ctx, 'settings', {})
  const input = mailboxInput(ctx, await c.req.parseBody(), data.mailboxes)
  await run(ctx, 'mailbox', input)
  return c.redirect('/settings/mailboxes?saved=yes', 303)
})
app.post('/settings/public-intakes/:product', async (c) => {
  const form = await c.req.parseBody()
  const destination = z
    .enum(['/extensions/form', '/extensions/feedback', '/extensions/chat'])
    .parse(form.returnTo)
  await enableHostedIntake(
    context(c),
    c.req.param('product'),
    new URL(c.req.url).origin,
  )
  return c.redirect(destination + '?started=yes', 303)
})
app.get('/conversation/:number', async (c) => {
  const ctx = context(c)
  const data = await run(ctx, 'get', { number: c.req.param('number') })
  const number = data.conversation.number
  await recordView(ctx, number)
  return c.render(
    conversationPage(
      data,
      extensionPanels(
        await panels(ctx, scopes, 'conversation', number),
        number,
        data,
      ),
      await consoleFrame(
        c.env,
        ctx.operator,
        c.req.path,
        {
          product: data.conversation.product,
          notice: c.req.query('notice') ?? '',
        },
        ctx.now,
      ),
      await inboxMetadata(c.env, [number], ctx.operator),
      await threadFiles(c.env, data.attachments),
      await replyLinks(
        ctx,
        data.conversation.product,
        new URL(c.req.url).origin,
      ),
    ),
  )
})
app.get('/mail/:id', async (c) => {
  const html = await readHtml(c.env, c.req.param('id'))
  if (html === null) return c.notFound()
  c.header(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'self'; sandbox; frame-ancestors 'self'; base-uri 'none'",
  )
  return c.html(htmlMailPage(html))
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
app.get('/extensions', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  return c.render(
    managementPage(
      await management(ctx),
      await consoleFrame(c.env, ctx.operator, c.req.path),
      c.req.query('changed'),
    ),
  )
})
app.post('/extensions/:id', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  const value = z.enum(['yes', 'no']).parse((await c.req.parseBody()).enabled)
  await toggle(ctx, c.req.param('id'), value === 'yes')
  return c.redirect(
    '/extensions?changed=' + encodeURIComponent(c.req.param('id')),
    303,
  )
})
function extensionFormFields(
  ctx: Context,
  name: string,
  input: Record<string, string | File>,
) {
  const properties =
    describe(ctx, scopes).find((op) => op.name === name)?.inputSchema
      .properties ?? {}
  return Object.fromEntries(
    Object.entries(input)
      .filter(([, value]) => value !== '')
      .map(([field, value]) => {
        const definition = properties[field]
        if (typeof definition === 'object' && definition?.type === 'boolean') {
          if (value === 'true') return [field, true]
          if (value === 'false') return [field, false]
        }
        return [field, value]
      }),
  )
}
async function extensionResponse(
  c: HttpContext<AppEnv>,
  ctx: Context,
  name: string,
  input: Record<string, string | File>,
  result: unknown,
) {
  const number = Number(input.number) || undefined
  if (name === 'issues.preview') {
    const proposal = z
      .object({
        title: z.string(),
        body: z.string(),
        repository: z.string(),
        number: z.number(),
        confirmation: z.string(),
      })
      .parse(result)
    return c.render(
      issuePreview(
        proposal,
        await consoleFrame(c.env, ctx.operator, c.req.path),
      ),
    )
  }
  if (
    number &&
    name !== 'issues.impact' &&
    c.req.header('accept')?.includes('text/html')
  ) {
    const target =
      name === 'merge.combine'
        ? z.object({ number: z.number() }).parse(result).number
        : number
    return c.redirect(
      '/conversation/' + target + '?notice=' + encodeURIComponent(name),
      303,
    )
  }
  return c.render(
    operationResult(
      name,
      result,
      number,
      await consoleFrame(c.env, ctx.operator, c.req.path),
    ),
  )
}
app.post('/actions/:name', async (c) => {
  const name = c.req.param('name')
  const input = await c.req.parseBody()
  if (
    !Object.hasOwn(coreOperations, name) &&
    !c.env.EXTENSIONS?.active.some((e) =>
      e.extension.operations?.some(
        (o) => e.extension.id + '.' + o.name === name,
      ),
    )
  )
    return c.notFound()
  const ctx = context(c)
  const args = name.includes('.')
    ? extensionFormFields(ctx, name, input)
    : input
  if (name === 'snooze.defer' && typeof args.untilLocal === 'string') {
    args.until = new Date(args.untilLocal + ':00+09:00').toISOString()
    delete args.untilLocal
  }
  const result = await invoke(ctx, scopes, name, args)
  if (c.req.header('accept') === 'application/json') return c.json(result)
  if (name.includes('.')) return extensionResponse(c, ctx, name, input, result)
  const settingsLocations: Record<string, string> = {
    role: 'operators',
    retention: 'retention',
    forget: 'deletion',
    mailbox: 'mailboxes',
  }
  const settingsLocation = settingsLocations[name]
  if (settingsLocation)
    return c.redirect('/settings/' + settingsLocation + '?saved=yes', 303)
  const number = z.coerce.number().int().positive().safeParse(input.number)
  const notice = name === 'status' ? String(input.event) : name
  return c.redirect(
    number.success
      ? '/conversation/' + number.data + '?notice=' + encodeURIComponent(notice)
      : '/settings',
    303,
  )
})
app.onError(async (err, c) => {
  if (c.req.header('accept')?.includes('text/html')) {
    const status =
      err instanceof PermissionDenied
        ? 403
        : err instanceof z.ZodError
          ? 400
          : err.message === 'Conversation not found'
            ? 404
            : 409
    return c.html(
      operatorErrorPage(
        status,
        await consoleFrame(c.env, c.get('operator'), c.req.path),
      ),
      status,
    )
  }
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
