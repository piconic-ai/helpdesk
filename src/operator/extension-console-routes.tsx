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
import { publicGuides } from '../core/extensions/extension-guides'
import { library } from '../extensions/articles/articles-usecase'
import { article, articleKey, publicPath } from '../extensions/articles/article'
import { repository } from '../extensions/issues/issues'
import {
  configuredRepository,
  issueDestination,
  issueChoices,
} from '../extensions/issues/issues-usecase'
import { hostedPolicy } from '../core/intakes/hosted-policy-usecase'
import {
  libraryPage,
  editorPage,
  metricsPage,
  guidePage,
  adminPage,
} from './extension-admin-page'

import { ruleSchema, storedRules } from '../extensions/rules/extension'
import { rulesSettings } from './rules-console-page'
const app = new Hono<AppEnv>()
type RequestContext = HttpContext<AppEnv>
function active(c: RequestContext, id: string) {
  const item = c.env.EXTENSIONS?.active.find((i) => i.extension.id === id)
  return item && extensionContext(context(c), item)
}
const frame = (c: RequestContext) =>
  consoleFrame(c.env, c.get('operator'), c.req.path)
const key = (product: string, id: string) =>
  '/articles/edit?' + new URLSearchParams({ product, id })
app.get('/articles', async (c) => {
  const api = active(c, 'articles')
  if (!api) return c.notFound()
  const data = await library(api)
  return c.render(libraryPage(await frame(c), data.articles, data.candidates))
})
app.get('/articles/new', async (c) =>
  active(c, 'articles')
    ? c.render(editorPage(await frame(c), {}, false))
    : c.notFound(),
)
app.get('/articles/edit', async (c) => {
  const api = active(c, 'articles')
  if (!api) return c.notFound()
  const query = article.pick({ product: true, id: true }).parse(c.req.query())
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
  const previous =
    form.id &&
    article.safeParse(
      await api.get(articleKey(String(form.product), String(form.id))),
    )
  if (previous && !previous.success) return c.notFound()
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
          status: previous ? previous.data.status : 'draft',
        },
        true,
      ),
    )
  await invoke(context(c), scopes, 'articles.save', proposed)
  return c.redirect(
    key(proposed.product, proposed.id) + '&notice=' + intent,
    303,
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
  // Date inputs represent calendar days in Japan; the report takes a half-open UTC interval.
  const day = 86400000
  const japanOffset = 9 * 3600000
  const today = Math.floor((state.now + japanOffset) / day) * day - japanOffset
  const to =
    period === 'custom'
      ? Date.parse(date.parse(query.end)) - japanOffset + day
      : today + day
  const from =
    period === 'custom'
      ? Date.parse(date.parse(query.start)) - japanOffset
      : to - Number(period) * day
  const result = z
    .record(z.string(), z.number().nullable())
    .parse(
      await invoke(context(c), scopes, 'metrics.report', { product, from, to }),
    )
  const iso = (time: number) =>
    new Date(time + japanOffset).toISOString().slice(0, 10)
  return c.render(
    metricsPage(
      state,
      { product, period, start: iso(from), end: iso(to - day) },
      result,
    ),
  )
})
app.get('/extensions/:id', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  const id = c.req.param('id')
  const api = active(c, id)
  if (!api) return c.notFound()
  const state = await frame(c)
  const origin = new URL(c.req.url).origin
  const applicable =
    Object.hasOwn(publicGuides, id) || id === 'issues' ? state.products : []
  const portals = await Promise.all(
    applicable.map(async (p) => ({
      ...p,
      ready: id === 'articles' || !!(await hostedPolicy(c.env, p.id, origin)),
      configured: !!c.env.PUBLIC_INTAKES?.[p.id],
      url:
        origin +
        (id === 'articles'
          ? publicPath(p.id)
          : '/help/' + id + '/' + encodeURIComponent(p.id)),
      repository:
        id === 'issues' ? await configuredRepository(api, p.id) : undefined,
    })),
  )
  const sections =
    id === 'export'
      ? (await panels(ctx, scopes, 'settings')).filter((p) => p.id === id)
      : []
  const content =
    id === 'rules'
      ? rulesSettings(
          state,
          await storedRules(api),
          c.req.query('saved') === '1',
        )
      : extensionPanels(sections)
  return c.render(
    guidePage(
      id,
      state,
      portals,
      content,
      c.req.query('started') === 'yes'
        ? 'このサイトで受付を開始しました。'
        : id === 'issues' && c.req.query('saved') === '1'
          ? 'リポジトリを登録しました。'
          : undefined,
    ),
  )
})
app.post('/extensions/rules/add', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  const api = active(c, 'rules')
  if (!api) return c.notFound()
  const fields = Object.fromEntries(
    Object.entries(await c.req.parseBody()).filter(([, v]) => v !== ''),
  )
  const rule = ruleSchema.parse(fields)
  const state = await frame(c)
  if (
    (rule.product && !state.products.some((p) => p.id === rule.product)) ||
    (rule.assignee &&
      !state.operators.some((p) => p.email === rule.assignee)) ||
    (rule.label && !state.labels.includes(rule.label))
  )
    return c.text('選択した項目が見つかりません。', 400)
  await api.put('rule/' + ctx.uuid(), rule)
  return c.redirect('/extensions/rules?saved=1', 303)
})
app.post('/extensions/rules/remove', async (c) => {
  authorize(context(c), 'admin', scopes)
  const api = active(c, 'rules')
  if (!api) return c.notFound()
  const key = z
    .string()
    .regex(/^rule\/[a-f0-9-]{36}$/)
    .parse((await c.req.parseBody()).key)
  await api.remove(key)
  return c.redirect('/extensions/rules?saved=1', 303)
})
app.post('/extensions/issues/repository', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  const api = active(c, 'issues')
  if (!api) return c.notFound()
  const input = z
    .object({ product: z.string(), repository })
    .parse(await c.req.parseBody())
  if (!(await frame(c)).products.some((p) => p.id === input.product))
    return c.notFound()
  await api.put('repository/' + input.product, {
    repo: input.repository,
    origin: new URL(c.req.url).origin,
  })
  return c.redirect('/extensions/issues?saved=1', 303)
})
app.get('/extensions/issues/link/:number', async (c) => {
  const api = active(c, 'issues')
  if (!api) return c.notFound()
  const number = z.coerce.number().int().positive().parse(c.req.param('number'))
  const { product } = await api.contact(number)
  const { repo } = await issueDestination(api, product)
  const choices = await issueChoices(api, repo)
  const view = choices.length ? (
    <form className="settings-card" method="post" action="/actions/issues.link">
      <input type="hidden" name="number" value={number} />
      <label>
        Issue
        <select name="issue">
          {choices.map((i) => (
            <option value={i.number}>
              {i.title} (#{i.number})
            </option>
          ))}
        </select>
      </label>
      <button>既存の Issue と紐づける</button>
    </form>
  ) : (
    <p>このリポジトリには Issue がありません。</p>
  )
  return c.render(adminPage('既存の Issue を選ぶ', await frame(c), view))
})
export { app as extensionConsoleRoutes }
