import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { z } from 'zod'
import type { Installed } from '../core/extensions/registry'
import type { AppEnv } from '../core/operators/middleware'
import { verifyIntake } from '../core/intakes/intake-usecase'
import type { IntakePolicy } from '../core/intakes/intake'
import { hostedPolicy } from '../core/intakes/hosted-policy-usecase'
import { extensionContext } from '../core/extensions/context-usecase'
import type { ExtensionContext, Extension } from '../core/extensions/extension'
import { question } from '../extensions/chat/chat'
import { submissionSchema } from '../core/intakes/intake'
import {
  suggestionIds,
  presentArticles,
} from '../extensions/article-suggestions-usecase'
import { handOffQuestion } from '../extensions/chat/extension'
import {
  intakePage,
  intakeUnavailable,
  matchingArticles,
  formSuggestions,
  chatResolvedPage,
  receiptPage,
  type Fields,
  type FormKind,
} from './intake-pages'
import { chatDocument } from '../ui/chat-document'
import { chatTurn } from './chat-turn-usecase'
import {
  embedSites,
  chatWidgetSettings,
} from '../core/intakes/public-settings-usecase'
import { acceptsHostedSubmissions, contactDestination } from './contact'
import { publicProduct } from './product-usecase'
import { publicDocument, publicPolicy } from './layout-pages'

type Intake = NonNullable<Extension['intakes']>[number]
const kinds = z.enum(['chat', 'feedback', 'form'])
const htmlPath = '/help/:id{chat|feedback|form}/:product'
const receipt = z.object({ number: z.int().positive() })
async function submitForm(
  ctx: ExtensionContext,
  product: string,
  intake: Intake,
  policy: IntakePolicy,
  fields: Fields,
  responseTime: string | null,
) {
  const data = submissionSchema.parse({
    body: fields.body,
    subject: fields.subject,
    email: fields.email,
  })
  const submissionId =
    z.uuid().optional().parse(fields.submissionId) ?? crypto.randomUUID()
  if (fields.send !== 'yes') {
    const offer = await presentArticles(ctx, {
      product,
      surface: 'form',
      question: data.subject + '\n' + data.body,
      contact: data.email,
    })
    if (offer) fields.presentations = offer.presentation
    if (offer?.articles.length)
      return formSuggestions(offer.articles, policy, {
        ...fields,
        submissionId,
      })
  }
  const result = receipt.parse(
    await intake.run(ctx, product, {
      ...data,
      submissionId,
      suggestionIds: suggestionIds(fields.presentations),
    }),
  )
  return receiptPage('form', result.number, fields, responseTime)
}
async function submit(
  kind: FormKind,
  ctx: ExtensionContext,
  product: string,
  intake: Intake,
  policy: IntakePolicy,
  fields: Fields,
  responseTime: string | null,
) {
  if (kind === 'form')
    return submitForm(ctx, product, intake, policy, fields, responseTime)
  if (kind === 'feedback')
    return receiptPage(
      kind,
      receipt.parse(await intake.run(ctx, product, fields)).number,
      fields,
      responseTime,
    )
  if (!fields.email && fields.handoff !== 'yes') {
    const text = question.shape.question.parse(fields.question)
    const offer = await presentArticles(ctx, {
      product,
      surface: 'chat',
      question: text,
    })
    return offer?.articles.length
      ? matchingArticles(
          offer.articles,
          policy,
          text,
          offer.presentation,
          offer.needsHuman,
        )
      : intakePage(
          kind,
          policy,
          {
            ...fields,
            submissionId: offer?.presentation ?? crypto.randomUUID(),
            presentations: offer?.presentation ?? '',
          },
          true,
        )
  }
  const result = await handOffQuestion(ctx, product, {
    ...fields,
    suggestionIds: suggestionIds(fields.presentations),
  })
  return receiptPage(kind, result.number, fields, responseTime)
}
function validationMessage(kind: FormKind, error: z.ZodError) {
  if (kind !== 'feedback')
    return '入力内容を確認し、必要な項目を入力してください。'
  return error.issues.some((issue) => issue.path[0] === 'email')
    ? 'メールアドレスを確認するか、連絡先を空にして送信してください。'
    : 'ご意見・ご要望を1文字以上、100,000文字以内で入力してください。'
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
  for (const key of [
    'email',
    'question',
    'body',
    'subject',
    'handoff',
    'submissionId',
    'presentations',
    'send',
  ]) {
    const value = data.get(key)
    if (typeof value === 'string' && value !== '') fields[key] = value
  }
  return fields
}

function intakeCsp(origins: string[], kind: FormKind, policy: IntakePolicy) {
  const scripts = []
  if (kind === 'chat') scripts.push("'self'")
  if (policy.turnstileSecretBinding)
    scripts.push('https://challenges.cloudflare.com')
  return [
    publicPolicy(origins),
    scripts.length && 'script-src ' + scripts.join(' '),
    (kind === 'chat' || policy.turnstileSecretBinding) && "connect-src 'self'",
    policy.turnstileSecretBinding &&
      'frame-src https://challenges.cloudflare.com',
  ]
    .filter(Boolean)
    .join('; ')
}

type Product = NonNullable<Awaited<ReturnType<typeof publicProduct>>>
type Render = (
  page: { title: string; html: string },
  status?: 200 | 400 | 403 | 503,
) => Response | Promise<Response>

async function chatEntry(
  c: Context<AppEnv>,
  info: Product,
  policy: IntakePolicy,
  origins: string[],
) {
  const embedded = c.req.query('embed') === '1'
  if (embedded) c.header('Referrer-Policy', 'no-referrer')
  const parent = embedded ? c.req.query('parent') || '' : ''
  if (embedded && !origins.includes(parent)) {
    c.header('Content-Security-Policy', publicPolicy())
    return c.text('埋め込み先が登録されていません。', 403)
  }
  const active = new Set(c.env.EXTENSIONS?.active.map((i) => i.extension.id))
  const settings = await chatWidgetSettings(c.env.DB, info.id)
  return c.html(
    chatDocument({
      product: info,
      parent,
      lang: /^en(?:-|$)/i.test(c.req.query('lang') ?? '') ? 'en' : 'ja',
      introduction: settings.introduction,
      publicKey: policy.publicKey,
      siteKey: policy.turnstileSecretBinding
        ? policy.turnstileSiteKey
        : undefined,
      articles: active.has('articles'),
      contact: contactDestination(info.id, info.mailbox, active.has('form')),
      feedback: active.has('feedback'),
    }),
  )
}

const app = new Hono<AppEnv>()
// URL-encoded Japanese text may occupy nine bytes per UTF-16 code unit.
app.use(htmlPath, bodyLimit({ maxSize: 1024 * 1024 }))
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
  if (!info?.mailbox) return c.notFound()
  const turnstile = Boolean(policy.turnstileSecretBinding)
  const render = (
    page: { title: string; html: string },
    status: 200 | 400 | 403 | 503 = 200,
  ) =>
    c.html(
      publicDocument(info, page, {
        chat: kind === 'chat',
        turnstile,
        contact:
          status >= 400
            ? contactDestination(product, info.mailbox, false)
            : undefined,
      }),
      status,
    )
  const origins =
    kind === 'chat'
      ? [...policy.origins, ...(await embedSites(c.env.DB, product))]
      : policy.origins
  c.header('Content-Security-Policy', intakeCsp(origins, kind, policy))
  if (!acceptsHostedSubmissions(policy)) return render(intakeUnavailable(), 503)
  if (c.req.method === 'GET') {
    if (kind === 'chat') return chatEntry(c, info, policy, origins)
    return render(
      intakePage(
        kind,
        policy,
        kind === 'form' ? { submissionId: crypto.randomUUID() } : {},
        false,
        '',
        ['articles', 'chat'].every((id) =>
          c.env.EXTENSIONS?.active.some(
            (installed) => installed.extension.id === id,
          ),
        ),
      ),
    )
  }
  return submitHosted(c, kind, info, installed, intake, policy, render)
})
async function submitHosted(
  c: Context<AppEnv>,
  kind: FormKind,
  info: Product,
  installed: Installed,
  intake: Intake,
  policy: IntakePolicy,
  render: Render,
) {
  const product = info.id
  const origin = new URL(c.req.url).origin
  if (c.req.header('origin') !== origin)
    return render(
      intakePage(
        kind,
        policy,
        {},
        false,
        '送信元を確認できませんでした。このフォームからもう一度お試しいただくか、メールでお問い合わせください。',
      ),
      403,
    )
  const data = await c.req.formData().catch(() => null)
  if (!data)
    return render(
      intakePage(kind, policy, {}, false, 'フォームから入力し直してください。'),
      400,
    )
  const fields = submittedFields(data)
  const now = Date.now()
  const requestContact = fields.handoff === 'yes' || Boolean(fields.email)
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
          requestContact,
          '送信を確認できませんでした。時間をおいて、もう一度お試しください。',
        ),
        403,
      )
    if (
      kind === 'chat' &&
      (c.req.header('accept') === 'application/json' ||
        data.get('intent') === 'resolve')
    ) {
      const turn = await chatTurn(ctx, product, data, info.responseTime)
      return c.req.header('accept') === 'application/json'
        ? c.json(turn)
        : render(chatResolvedPage())
    }
    return render(
      await submit(
        kind,
        ctx,
        product,
        intake,
        policy,
        fields,
        info.responseTime,
      ),
    )
  } catch (error) {
    if (error instanceof z.ZodError)
      return render(
        intakePage(
          kind,
          policy,
          fields,
          requestContact,
          validationMessage(kind, error),
        ),
        400,
      )
    return render(
      intakePage(
        kind,
        policy,
        fields,
        requestContact,
        '受付に失敗しました。時間をおいて、もう一度お試しください。',
      ),
      503,
    )
  }
}
export { app as hostedIntakeRoutes }
