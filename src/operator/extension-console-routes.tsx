import { visibleProductIds, can } from '../core/operators/project-access'
import {
  requireConversations,
  requireProduct,
} from '../core/operators/project-targets-store'
import { requireSettings } from '../core/settings/project-settings-usecase'
import { defaultTimeZone } from '../core/operators/time-zone'
import { reportPeriod } from '../extensions/metrics/report-period'
import {
  articlePerformance,
  missingArticleQuestions,
  missingQuestion,
} from './suggestion-insights-usecase'
import { missingArticlesPage } from './missing-articles-page'
import {
  recommendationForm,
  saveRecommendationForm,
} from './recommendation-settings-usecase'
import { widgetPosition, widgetLabel } from '../core/intakes/chat-widget'
import { widgetPreviewPage } from './widget-settings-page'
import { issueBoardRoutes } from './issue-board-routes'
import { automaticMailRoutes } from './automatic-mail-routes'
import { listRows, type ListWindow } from '../ui/listing'
import {
  readExtensionSettings,
  editExtensionSetting,
  undoExtensionSetting,
} from '../core/extensions/admin-settings-usecase'
import {
  moveRule,
  ruleKey,
  rulesFromSettings,
} from '../extensions/rules/rule-list'
import {
  savedTemplates,
  projectTemplateKey,
  template,
  templatesFromSettings,
} from '../extensions/canned/templates'
import { cannedSettings } from './canned-settings-page'
import { groupedDetail } from '../core/extensions/triage-usecase'
import {
  cannedCounts,
  cannedUse,
  recordCannedUse,
  replyTemplateChoices,
} from '../extensions/canned/suggestions-usecase'
import { Hono, type Context as HttpContext } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../core/operators/middleware'
import { context, scopes } from '../core/operations/operations-routes'
import { authorize } from '../core/operations/catalog'
import { consoleFrame } from '../core/conversations/console-usecase'
import { extensionContext } from '../core/extensions/context-usecase'
import { invoke } from '../core/operations/runtime-usecase'
import { panels } from '../core/extensions/registry-usecase'
import { extensionPanels } from '../core/extensions/extensions-page'
import {
  publicGuides,
  permissionText,
} from '../core/extensions/extension-guides'
import { reportResult } from '../extensions/metrics/extension'
import { voiceFilters } from './voice-filters'
import { voiceBuckets, voiceList } from './voices-usecase'
import { voicesOverview, voicesResults } from './voices-page'
import {
  articleCandidates,
  articleOrigin,
  candidateForEditor,
} from './article-candidates-usecase'
import { library } from '../extensions/articles/articles-usecase'
import { article, articleKey, publicPath } from '../extensions/articles/article'
import { repository } from '../extensions/issues/issues'
import { configuredRepository } from '../extensions/issues/issues-usecase'
import {
  chatWidgetSettings,
  editChatWidget,
  editPublicSetting,
  undoPublicSetting,
  embedSites,
} from '../core/intakes/public-settings-usecase'
import { publicProduct } from '../public/product-usecase'
import type { ExtensionContext } from '../core/extensions/extension'
import type { ConsoleFrame } from '../core/conversations/console-usecase'
import { hostedPolicy } from '../core/intakes/hosted-policy-usecase'
import {
  libraryPage,
  candidatesPage,
  editorPage,
  metricsPage,
  guidePage,
  adminPage,
} from './extension-admin-page'

import { ruleSchema, storedRules } from '../extensions/rules/extension'
import { rulesSettings } from './rules-console-page'
const app = new Hono<AppEnv>()
app.use('/extensions/*', async (c, next) => {
  await next()
  const location = c.res.headers.get('Location')
  if (
    c.req.method !== 'POST' ||
    c.res.status !== 303 ||
    !location?.startsWith('/extensions/')
  )
    return
  const target = new URL(location, c.req.url)
  const inputs = await c.req.parseBody()
  const from = c.req.header('Referer')
  const previous = from && URL.parse(from)
  const source =
    previous && previous.origin === target.origin
      ? previous.searchParams.get('product')
      : undefined
  const product =
    inputs.returnProduct ||
    source ||
    (!can(c.get('operator'), 'global').allowed && inputs.product)
  if (
    typeof product === 'string' &&
    product &&
    can(c.get('operator'), 'manage', product).allowed
  ) {
    target.searchParams.set('product', product)
    c.header('Location', target.pathname + target.search)
  }
})
app.route('/', issueBoardRoutes)
app.route('/', automaticMailRoutes)
type RequestContext = HttpContext<AppEnv>
function active(c: RequestContext, id: string) {
  const item = c.env.EXTENSIONS?.active.find((i) => i.extension.id === id)
  return item && extensionContext(context(c), item)
}
const frame = (c: RequestContext) =>
  consoleFrame(c.env, c.get('operator'), c.req.path, {
    product: c.req.query('product') ?? '',
    q: c.req.query('q') ?? '',
    filter: c.req.query('filter') ?? '',
    sort: c.req.query('sort') ?? '',
    page: c.req.query('page') ?? '',
  })
const key = (product: string, id: string) =>
  '/articles/edit?' + new URLSearchParams({ product, id })
app.get('/conversation/:number/canned-suggestions', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'read', scopes)
  const api = active(c, 'canned')
  const number = z.coerce
    .number()
    .int()
    .positive()
    .safeParse(c.req.param('number'))
  if (!api || !number.success) return c.notFound()
  c.header('Cache-Control', 'no-store')
  await requireConversations(ctx, [number.data], 'read')
  const { conversation, messages, labels } = await groupedDetail(
    c.env,
    number.data,
  )
  const inbound = messages.findLast((message) => message.kind === 'inbound')
  if (
    !inbound ||
    conversation.kind !== 'inquiry' ||
    conversation.status.kind === 'spam'
  )
    return c.json([])
  const choices = await replyTemplateChoices(c.env.DB, api, {
    number: conversation.number,
    inbound,
    labels: labels.map(({ name }) => name),
  })
  return choices ? c.json(choices) : c.body(null, 202)
})
app.post('/conversation/:number/canned-selection', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'read', scopes)
  const number = z.coerce
    .number()
    .int()
    .positive()
    .safeParse(c.req.param('number'))
  const use = cannedUse.safeParse(await c.req.parseBody())
  if (!number.success || !use.success) return c.body(null, 400)
  if (!active(c, 'canned')) return c.notFound()
  await requireConversations(ctx, [number.data], 'write')
  const saved = await recordCannedUse(
    c.env.DB,
    number.data,
    ctx.operator.email,
    use.data,
  )
  return c.body(null, saved ? 204 : 404)
})
app.post('/conversation/:number/article-selection', async (c) => {
  const api = active(c, 'articles')
  if (!api) return c.notFound()
  const number = z.coerce
    .number()
    .int()
    .positive()
    .safeParse(c.req.param('number'))
  const choice = z
    .object({ presentation: z.uuid(), article: z.string().min(1).max(120) })
    .safeParse(Object.fromEntries(await c.req.formData()))
  if (!choice.success || !number.success) return c.body(null, 400)
  const { product } = await api.contact(number.data)
  const accepted = await api.reactToSuggestion({
    ...choice.data,
    product,
    number: number.data,
    surface: 'composer',
    action: 'attached',
  })
  return c.body(null, accepted ? 204 : 404)
})
app.get('/articles', async (c) => {
  const api = active(c, 'articles')
  if (!api) return c.notFound()
  const [data, candidates, performance] = await Promise.all([
    library(api),
    articleCandidates(c.env.DB, visibleProductIds(c.get('operator'))),
    articlePerformance(c.env.DB, visibleProductIds(c.get('operator'))),
  ])
  return c.render(
    libraryPage(
      await frame(c),
      data.articles.filter(
        (a) => can(c.get('operator'), 'read', a.product).allowed,
      ),
      performance,
      candidates.length,
      c.req.query(),
    ),
  )
})
app.get('/articles/candidates', async (c) => {
  if (!active(c, 'articles')) return c.notFound()
  return c.render(
    candidatesPage(
      await frame(c),
      await articleCandidates(c.env.DB, visibleProductIds(c.get('operator'))),
      c.req.query(),
    ),
  )
})
app.get('/articles/questions', async (c) => {
  if (!active(c, 'articles')) return c.notFound()
  const product = c.req.query('product') ?? ''
  const page = z.coerce
    .number()
    .int()
    .positive()
    .catch(1)
    .parse(c.req.query('page'))
  return c.render(
    missingArticlesPage(
      await frame(c),
      product,
      await missingArticleQuestions(
        c.env.DB,
        product,
        page,
        visibleProductIds(c.get('operator')),
      ),
    ),
  )
})
app.get('/articles/new', async (c) => {
  if (!active(c, 'articles')) return c.notFound()
  const question = c.req.query('question')
  if (question) {
    const source = await missingQuestion(c.env.DB, question)
    if (!source || !can(c.get('operator'), 'read', source.product).allowed)
      return c.notFound()
    return c.render(
      editorPage(
        await frame(c),
        {
          product: source.product,
          title: source.question.slice(0, 200).replace(/[\uD800-\uDBFF]$/, ''),
        },
        false,
      ),
    )
  }
  const number = c.req.query('candidate')
  if (number === undefined)
    return c.render(editorPage(await frame(c), {}, false))
  const source = await candidateForEditor(c.env.DB, {
    number: z.coerce.number().int().positive().parse(number),
  })
  if (!source || !can(c.get('operator'), 'read', source.product).allowed)
    return c.notFound()
  if (source.articleId) return c.redirect(key(source.product, source.articleId))
  return c.render(
    editorPage(
      await frame(c),
      {
        product: source.product,
        title: source.topic.slice(0, 200).replace(/[\uD800-\uDBFF]$/, ''),
      },
      false,
      undefined,
      source,
    ),
  )
})
app.get('/articles/edit', async (c) => {
  const api = active(c, 'articles')
  if (!api) return c.notFound()
  const query = article.pick({ product: true, id: true }).parse(c.req.query())
  requireProduct(context(c), query.product, 'read')
  const current = article.safeParse(
    await api.get(articleKey(query.product, query.id)),
  )
  if (!current.success) return c.notFound()
  const notices: Record<string, string> = {
    publish: '記事を公開しました。',
    draft: '下書きを保存しました。',
  }
  return c.render(
    editorPage(
      await frame(c),
      current.data,
      false,
      notices[c.req.query('notice') ?? ''],
      await candidateForEditor(c.env.DB, query),
    ),
  )
})
app.post('/articles/edit', async (c) => {
  const api = active(c, 'articles')
  if (!api) return c.notFound()
  const form = await c.req.parseBody()
  const intent = z.enum(['draft', 'preview', 'publish']).parse(form.intent)
  const state = await frame(c)
  if (!state.products.some((p) => p.id === form.product)) return c.notFound()
  const params = z
    .object({
      product: z.string(),
      id: z.string().optional(),
      number: z.coerce.number().int().positive().optional(),
    })
    .parse(form)
  const origin = await articleOrigin(
    c.env.DB,
    api,
    params.product,
    params.id,
    params.number,
  )
  if (!origin) return c.notFound()
  if (origin.existingId)
    return c.redirect(key(params.product, origin.existingId), 303)
  const id = form.id || crypto.randomUUID()
  const proposed = article.parse({
    ...form,
    id,
    status: intent === 'publish' ? 'published' : 'draft',
  })
  if (intent === 'preview')
    return c.render(
      editorPage(
        state,
        {
          ...proposed,
          id: form.id ? proposed.id : undefined,
          status: origin.status,
        },
        true,
        undefined,
        origin.source,
      ),
    )
  const saved = article.pick({ id: true, status: true }).parse(
    await invoke(context(c), scopes, 'articles.save', {
      ...proposed,
      candidateNumber: form.number,
    }),
  )
  return c.redirect(
    key(proposed.product, saved.id) +
      '&notice=' +
      (saved.status === 'published' ? 'publish' : 'draft'),
    303,
  )
})
app.get('/voices', async (c) => {
  if (!active(c, 'metrics')) return c.notFound()
  const q = voiceFilters.safeParse(c.req.query())
  if (!q.success) return c.text('集計条件を確認してください。', 400)
  return c.render(
    voicesOverview(
      await frame(c),
      q.data,
      await voiceBuckets(
        c.env.DB,
        q.data,
        visibleProductIds(c.get('operator')),
      ),
    ),
  )
})
app.get('/voices/conversations', async (c) => {
  if (!active(c, 'metrics')) return c.notFound()
  const q = voiceFilters.safeParse(c.req.query())
  if (!q.success) return c.text('集計条件を確認してください。', 400)
  return c.render(
    voicesResults(
      await frame(c),
      q.data,
      await voiceList(
        c.env.DB,
        q.data,
        c.req.query('page'),
        visibleProductIds(c.get('operator')),
      ),
    ),
  )
})
const date = z.iso.date()
app.get('/metrics', async (c) => {
  if (!active(c, 'metrics')) return c.notFound()
  const state = await frame(c)
  const query = c.req.query()
  const product = z.string().parse(query.product ?? '')
  if (product && !state.products.some((p) => p.id === product))
    return c.notFound()
  const period = z.enum(['7', '30', '90', 'custom']).parse(query.period ?? '30')
  const zone =
    state.operators.find((person) => person.email === state.operator.email)
      ?.timeZone ?? defaultTimeZone
  const range = reportPeriod(
    period === 'custom'
      ? {
          kind: 'custom',
          start: date.parse(query.start),
          end: date.parse(query.end),
        }
      : { kind: 'rolling', days: Number(period) },
    state.now,
    zone,
  )
  const { from, to } = range
  if (from < 0 || from >= to)
    return c.text('開始日と終了日を確認してください。', 400)
  const { history = [], ...result } = reportResult.parse(
    await invoke(context(c), scopes, 'metrics.report', {
      product,
      from,
      to,
      includeHistory: true,
      timeZone: zone,
    }),
  )
  return c.render(
    metricsPage(
      state,
      { product, period, start: range.start, end: range.end, timeZone: zone },
      result,
      history,
    ),
  )
})
const publicSettingNotices: Record<string, string> = {
  restored: '設定を元に戻しました。',
  outdated: 'この変更は元に戻せません。現在の設定を確認してください。',
  conflict:
    '設定が更新されたため、保存できませんでした。現在の内容を確認してからもう一度編集してください。',
  saved: '公開受付の設定を保存しました。',
}
app.get('/extensions/chat/preview/:product', async (c) => {
  authorize(context(c), 'admin', scopes, c.req.param('product'))
  if (!active(c, 'chat')) return c.notFound()
  const product = await publicProduct(c.env, c.req.param('product'))
  if (!product?.mailbox) return c.notFound()
  const origin = new URL(c.req.url).origin
  const saved = await chatWidgetSettings(c.env.DB, product.id)
  const options = z
    .object({ position: widgetPosition, label: widgetLabel })
    .safeParse({
      position: c.req.query('position') ?? saved.position,
      label: c.req.query('label') ?? saved.label,
    })
  if (!options.success)
    return c.text('ボタンの位置と文言を確認してください。', 400)
  c.header(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; style-src 'self'; frame-src 'self'; frame-ancestors 'self'; img-src 'self'; base-uri 'none'",
  )
  return c.html(widgetPreviewPage(origin, product, options.data))
})
app.post('/extensions/chat/recommendations', async (c) => {
  if (!active(c, 'chat')) return c.notFound()
  const token = await saveRecommendationForm(
    context(c),
    await c.req.parseBody(),
  )
  return c.redirect(
    '/extensions/chat?publicSettings=' +
      (token === null ? 'conflict' : 'recommendations') +
      (token ? '&undo=' + token : ''),
    303,
  )
})
app.post('/extensions/chat/widget-settings', async (c) => {
  if (!active(c, 'chat')) return c.notFound()
  const fields = await c.req.parseBody()
  const token = await editChatWidget(
    context(c),
    String(fields.product ?? ''),
    fields,
  )
  if (token === null)
    return c.text('ボタンの位置・文言・説明文を確認してください。', 400)
  return c.redirect(
    '/extensions/chat?publicSettings=saved' + (token ? '&undo=' + token : ''),
    303,
  )
})
app.post(
  '/extensions/:id{chat|form}/:setting{embed-sites|public-settings}',
  async (c) => {
    const id = c.req.param('id')
    if (
      !active(c, id) ||
      (c.req.param('setting') === 'embed-sites' && id !== 'chat')
    )
      return c.notFound()
    const fields = await c.req.parseBody()
    const setting =
      c.req.param('setting') === 'embed-sites'
        ? {
            site: String(fields.site ?? '').trim(),
            remove: fields.intent === 'remove',
          }
        : { responseTime: String(fields.responseTime ?? '').trim() }
    const token = await editPublicSetting(
      context(c),
      String(fields.product ?? ''),
      setting,
    )
    if (token === null)
      return c.text(
        '入力内容を確認してください。埋め込み先にはパスを含まないサイトのアドレスを入力してください。',
        400,
      )
    return c.redirect(
      '/extensions/' +
        id +
        '?publicSettings=saved' +
        (token ? '&undo=' + token : ''),
      303,
    )
  },
)
app.post('/extensions/:id{form|chat}/undo-setting', async (c) => {
  const id = c.req.param('id')
  if (!active(c, id)) return c.notFound()
  const token = String((await c.req.parseBody()).changeId)
  const ctx = context(c)
  const restored =
    (await undoPublicSetting(ctx, token)) ||
    (id === 'chat' && (await undoExtensionSetting(ctx, 'chat', token)))
  return c.redirect(
    '/extensions/' +
      id +
      '?publicSettings=' +
      (restored ? 'restored' : 'outdated'),
    303,
  )
})
async function guidePortals(
  c: RequestContext,
  id: string,
  api: ExtensionContext,
  products: ConsoleFrame['products'],
) {
  const origin = new URL(c.req.url).origin
  const applicable =
    Object.hasOwn(publicGuides, id) || id === 'issues' ? products : []
  return Promise.all(
    applicable.map(async (p) => {
      const policy =
        id === 'issues' ? undefined : await hostedPolicy(c.env, p.id, origin)
      return {
        ...p,
        ready: id === 'articles' || !!policy,
        recommendation:
          id === 'chat'
            ? await recommendationForm(context(c), api, p.id)
            : undefined,
        publicSettings:
          id === 'chat' || id === 'form'
            ? {
                responseTime:
                  (await publicProduct(c.env, p.id))?.responseTime ?? '',
                widget:
                  id === 'chat'
                    ? await chatWidgetSettings(c.env.DB, p.id)
                    : undefined,
                inheritedSites:
                  policy?.origins.filter((site) => site !== origin) ?? [],
                sites: id === 'chat' ? await embedSites(c.env.DB, p.id) : [],
              }
            : undefined,
        configured: !!c.env.PUBLIC_INTAKES?.[p.id],
        url:
          origin +
          (id === 'articles'
            ? publicPath(p.id)
            : '/help/' + id + '/' + encodeURIComponent(p.id)),
        tokenReady:
          id === 'issues' ? Boolean(api.secret('GITHUB_TOKEN')) : undefined,
        repository:
          id === 'issues' ? await configuredRepository(api, p.id) : undefined,
      }
    }),
  )
}
function guideNotice(id: string, query: Record<string, string>) {
  if (id === 'chat' && query.publicSettings === 'recommendations')
    return '記事のおすすめ設定を保存しました。'
  if (Object.hasOwn(publicSettingNotices, query.publicSettings))
    return publicSettingNotices[query.publicSettings]
  if (id === 'rules' && query.removed === 'yes')
    return '振り分けルールを削除しました。'
  if (query.started === 'yes') return 'このサイトで受付を開始しました。'
  if (query.saved !== '1') return
  const messages: Record<string, string> = {
    canned: '定型文を保存しました。',
    rules: '振り分けルールを保存しました。',
    issues: 'リポジトリを登録しました。',
  }
  return Object.hasOwn(messages, id) ? messages[id] : undefined
}
app.get('/extensions/:id', async (c) => {
  const ctx = context(c)
  const project = c.req.query('product')
  authorize(ctx, 'admin', scopes, project)
  const id = c.req.param('id')
  const installed = c.env.EXTENSIONS?.active.find(
    (item) => item.extension.id === id,
  )
  if (!installed) return c.notFound()
  const api = extensionContext(ctx, installed)
  const state = await frame(c)
  const portals = await guidePortals(
    c,
    id,
    api,
    state.products.filter((p) => !project || p.id === project),
  )
  const sections =
    id === 'export'
      ? (await panels(ctx, scopes, 'settings')).filter((p) => p.id === id)
      : []
  let list: ListWindow | undefined
  let content =
    id === 'notify' ? (
      <p>{await installed.extension.settingsSummary?.(api)}</p>
    ) : (
      extensionPanels(sections)
    )
  if (id === 'canned' || id === 'rules') {
    const { rows, versions } = await readExtensionSettings(c.env.DB, id)
    if (id === 'canned') {
      const product = c.req.query('product') ?? state.products[0]?.id
      if (!product) return c.redirect('/settings/projects', 302)
      requireSettings(ctx, product)
      state.query.product = product
      const templates = templatesFromSettings(api.config, rows, product)
      const window = listRows([...templates], state.query, ([, t]) => ({
        text: t.name + ' ' + t.body,
      }))
      list = window
      content = cannedSettings(
        new Map(window.rows),
        versions,
        templates.size > 0,
        state.products,
        state.products.filter((p) => can(ctx.operator, 'manage', p.id).allowed),
        product,
        await cannedCounts(c.env.DB, product),
      )
    } else {
      const rules = rulesFromSettings(
        api.config,
        rows,
        rows.find((row) => row.key === 'order')?.value,
      )
      const ordered = rules
        .filter((r) => !project || r.rule.product === project)
        .map((item, index) => ({ ...item, index }))
      const window = listRows(ordered, state.query, ({ rule }) => ({
        text: [rule.subjectContains, rule.label, rule.assignee, rule.product]
          .filter(Boolean)
          .join(' '),
      }))
      list = window
      content = rulesSettings(state, window.rows, versions, ordered.length)
    }
  }
  return c.render(
    guidePage(
      id,
      state,
      portals,
      content,
      guideNotice(id, c.req.query()),
      z.uuid().safeParse(c.req.query('undo')).data,
      ['conflict', 'outdated'].includes(c.req.query('publicSettings') ?? ''),
      permissionText(installed.extension.permissions),
      list,
    ),
  )
})
function settingResult(
  c: RequestContext,
  id: 'canned' | 'rules',
  token: string | null,
  product?: string,
) {
  const project = product ? '&product=' + encodeURIComponent(product) : ''
  if (token === null)
    return c.redirect(
      '/extensions/' + id + '?publicSettings=conflict' + project,
      303,
    )
  return c.redirect(
    '/extensions/' +
      id +
      '?saved=1' +
      project +
      (token ? '&undo=' + token : ''),
    303,
  )
}
app.post('/extensions/:id{canned|rules}/undo-setting', async (c) => {
  const id = c.req.param('id') as 'canned' | 'rules'
  if (!active(c, id)) return c.notFound()
  const form = await c.req.parseBody()
  const restored = await undoExtensionSetting(context(c), id, form.changeId)
  return c.redirect(
    '/extensions/' +
      id +
      '?publicSettings=' +
      (restored ? 'restored' : 'outdated') +
      (typeof form.returnProduct === 'string' && form.returnProduct
        ? '&product=' + encodeURIComponent(form.returnProduct)
        : ''),
    303,
  )
})
app.post('/extensions/canned/save', async (c) => {
  const ctx = context(c),
    api = active(c, 'canned')
  if (!api) return c.notFound()
  const form = await c.req.parseBody(),
    product = z.string().min(1).parse(form.product)
  requireSettings(ctx, product)
  const item = template.parse({ ...form, product })
  const id = z.string().max(100).parse(form.id)
  if (id && !(await savedTemplates(api, product)).has(id)) return c.notFound()
  return settingResult(
    c,
    'canned',
    await editExtensionSetting(
      ctx,
      'canned',
      projectTemplateKey(product, id || ctx.uuid()),
      item,
      form.revision,
      undefined,
      product,
    ),
    product,
  )
})
app.post('/extensions/canned/copy', async (c) => {
  const ctx = context(c),
    api = active(c, 'canned')
  if (!api) return c.notFound()
  const form = z
    .object({ product: z.string().min(1), target: z.string().min(1) })
    .parse(await c.req.parseBody())
  requireSettings(ctx, form.target)
  if (!can(ctx.operator, 'read', form.product).allowed) return c.notFound()
  const { versions } = await readExtensionSettings(c.env.DB, 'canned')
  const templates = await savedTemplates(api, form.product)
  for (const [id, item] of templates) {
    const key = projectTemplateKey(form.target, id)
    if (!versions.has(key))
      await editExtensionSetting(
        ctx,
        'canned',
        key,
        { ...item, product: form.target },
        '',
        undefined,
        form.target,
      )
  }
  return settingResult(c, 'canned', '', form.target)
})
app.post('/extensions/rules/add', async (c) => {
  const ctx = context(c)
  const api = active(c, 'rules')
  if (!api) return c.notFound()
  const { revision, ...submitted } = await c.req.parseBody()
  const fields = Object.fromEntries(
    Object.entries(submitted).filter(([, v]) => v !== ''),
  )
  const key = fields.key ? ruleKey.parse(fields.key) : undefined
  delete fields.key
  if (key) {
    const existing = (await storedRules(api)).find((item) => item.key === key)
    if (!existing) return c.notFound()
    authorize(ctx, 'admin', scopes, existing.rule.product)
  }
  const rule = ruleSchema.parse(fields)
  authorize(ctx, 'admin', scopes, rule.product)
  const state = await frame(c)
  if (
    (rule.product && !state.products.some((p) => p.id === rule.product)) ||
    (rule.assignee &&
      !state.operators.some(
        (p) =>
          p.email === rule.assignee &&
          (!rule.product || p.projects.includes(rule.product)),
      )) ||
    (rule.label && !state.labels.includes(rule.label))
  )
    return c.text('選択した項目が見つかりません。', 400)
  return settingResult(
    c,
    'rules',
    await editExtensionSetting(
      ctx,
      'rules',
      key ?? 'rule/new-' + ctx.uuid(),
      rule,
      revision,
      undefined,
      rule.product,
    ),
  )
})
app.post('/extensions/rules/remove', async (c) => {
  const api = active(c, 'rules')
  if (!api) return c.notFound()
  const form = await c.req.parseBody()
  const key = ruleKey.parse(form.key)
  const existing = (await storedRules(api)).find((item) => item.key === key)
  if (!existing) return c.notFound()
  const token = await editExtensionSetting(
    context(c),
    'rules',
    key,
    null,
    form.revision,
    undefined,
    existing.rule.product,
  )
  return token === null
    ? settingResult(c, 'rules', null)
    : c.redirect('/extensions/rules?removed=yes', 303)
})
app.post('/extensions/rules/move', async (c) => {
  const api = active(c, 'rules')
  if (!api) return c.notFound()
  const fields = await c.req.parseBody()
  const key = ruleKey.parse(fields.key)
  const existing = (await storedRules(api)).find((r) => r.key === key)
  if (!existing) return c.notFound()
  const product =
    can(c.get('operator'), 'global').allowed && !c.req.query('product')
      ? undefined
      : existing.rule.product
  authorize(context(c), 'admin', scopes, product)
  const done = await moveRule(
    api,
    key,
    z.enum(['up', 'down']).parse(fields.direction) === 'up' ? -1 : 1,
    product,
  )
  if (!done) return c.text('一覧を更新してから並べ替えてください。', 409)
  return settingResult(
    c,
    'rules',
    await editExtensionSetting(
      context(c),
      'rules',
      'order',
      done.keys,
      fields.revision,
      done.expected,
      product,
    ),
  )
})
app.post('/extensions/issues/repository', async (c) => {
  const ctx = context(c)
  const api = active(c, 'issues')
  if (!api) return c.notFound()
  const input = z
    .object({ product: z.string(), repository })
    .parse(await c.req.parseBody())
  authorize(ctx, 'admin', scopes, input.product)
  if (!(await frame(c)).products.some((p) => p.id === input.product))
    return c.notFound()
  await api.put('repository/' + input.product, input.repository)
  return c.redirect('/extensions/issues?saved=1', 303)
})
app.get('/extensions/issues/link/:number', (c) => {
  if (!active(c, 'issues')) return c.notFound()
  const number = z.coerce.number().int().positive().parse(c.req.param('number'))
  return c.redirect('/conversation/' + number + '?issue=link', 302)
})
export { app as extensionConsoleRoutes }
