import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { z } from 'zod'
import type { AppEnv } from '../core/operators/middleware'
import { verifyIntake } from '../core/intakes/intake-usecase'
import type { IntakePolicy } from '../core/intakes/intake'
import { hostedPolicy } from '../core/intakes/hosted-policy-usecase'
import { extensionContext } from '../core/extensions/context-usecase'
import type { ExtensionContext, Extension } from '../core/extensions/extension'
import { question } from '../extensions/chat/chat'
import { recommendArticles } from '../extensions/chat/extension'
import {
  intakePage,
  matchingArticles,
  receiptPage,
  type Fields,
  type FormKind,
} from './intake-pages'
import { publicProduct } from './product-usecase'
import { publicDocument, publicPolicy } from './layout-pages'

type Intake = NonNullable<Extension['intakes']>[number]
const kinds = z.enum(['chat', 'feedback', 'form'])
const htmlPath = '/help/:id{chat|feedback|form}/:product'
const receipt = z.object({ number: z.int().positive() })
const matches = z.object({
  kind: z.literal('show_articles'),
  articles: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string().regex(/^\/help\/articles\//),
    }),
  ),
})

async function submit(
  kind: FormKind,
  ctx: ExtensionContext,
  product: string,
  intake: Intake,
  policy: IntakePolicy,
  fields: Fields,
) {
  if (kind === 'chat' && !fields.email) {
    const text = question.shape.question.parse(fields.question)
    const articles = await recommendArticles(ctx, product, text)
    return articles.length
      ? matchingArticles(articles)
      : intakePage(kind, policy, fields, true)
  }
  const result = await intake.run(ctx, product, fields)
  const found = matches.safeParse(result)
  return found.success
    ? matchingArticles(found.data.articles)
    : receiptPage(kind, receipt.parse(result).number)
}

function submissionRequest(request: Request, form: FormData) {
  const headers = new Headers(request.headers)
  headers.set('X-Helpdesk-Key', String(form.get('publicKey') ?? ''))
  headers.set(
    'CF-Turnstile-Response',
    String(form.get('cf-turnstile-response') ?? ''),
  )
  return new Request(request.url, { headers })
}

function submittedFields(data: FormData) {
  const fields: Fields = {}
  for (const key of ['email', 'question', 'body', 'subject']) {
    const value = data.get(key)
    if (typeof value === 'string' && value !== '') fields[key] = value
  }
  return fields
}

const app = new Hono<AppEnv>()
app.use(htmlPath, bodyLimit({ maxSize: 256 * 1024 }))
app.on(['GET', 'POST'], htmlPath, async (c) => {
  const kind = kinds.parse(c.req.param('id')),
    product = c.req.param('product'),
    origin = new URL(c.req.url).origin
  const installed = c.env.EXTENSIONS?.active.find(
    (i) => i.extension.id === kind,
  )
  const intake = installed?.extension.intakes?.find(
    (i) => i.path === (kind === 'chat' ? 'ask' : 'submit'),
  )
  if (!intake || !installed) return c.notFound()
  const policy = await hostedPolicy(c.env, product, origin)
  if (!policy) return c.notFound()
  const info = await publicProduct(c.env, product)
  if (!info) return c.notFound()
  const turnstile = Boolean(policy.turnstileSecretBinding)
  const render = (
    page: { title: string; html: string },
    status: 200 | 400 | 403 | 503 = 200,
  ) =>
    c.html(
      publicDocument(info, page, { chat: kind === 'chat', turnstile }),
      status,
    )
  c.header(
    'Content-Security-Policy',
    publicPolicy(policy.origins) +
      (turnstile
        ? "; script-src https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self'"
        : ''),
  )
  if (turnstile && !policy.turnstileSiteKey)
    return render(
      {
        title: '受付を一時停止しています',
        html: '<h1>受付を一時停止しています</h1><p>しばらくしてから、もう一度お試しください。</p>',
      },
      503,
    )
  if (c.req.method === 'GET') return render(intakePage(kind, policy))
  if (c.req.header('origin') !== origin)
    return c.text('送信元を確認できませんでした。', 403)
  const data = await c.req.formData().catch(() => null)
  if (!data)
    return render(
      intakePage(kind, policy, {}, false, 'フォームから入力し直してください。'),
      400,
    )
  const fields = submittedFields(data)
  const now = Date.now()
  const allowed = await verifyIntake(
    c.env,
    product,
    submissionRequest(c.req.raw, data),
    policy,
    now,
  )
  if (!allowed)
    return render(
      intakePage(
        kind,
        policy,
        fields,
        Boolean(fields.email),
        '送信を確認できませんでした。時間をおいて、もう一度お試しください。',
      ),
      403,
    )
  const ctx = extensionContext(
    {
      env: c.env,
      actor: { kind: 'extension', id: kind },
      operator: { email: '', role: 'agent' },
      now,
      uuid: () => crypto.randomUUID(),
    },
    installed,
  )
  try {
    return render(await submit(kind, ctx, product, intake, policy, fields))
  } catch (error) {
    if (error instanceof z.ZodError)
      return render(
        intakePage(
          kind,
          policy,
          fields,
          Boolean(fields.email),
          '入力内容を確認し、必要な項目を入力してください。',
        ),
        400,
      )
    return render(
      intakePage(
        kind,
        policy,
        fields,
        Boolean(fields.email),
        '受付に失敗しました。時間をおいて、もう一度お試しください。',
      ),
      503,
    )
  }
})
export { app as hostedIntakeRoutes }
