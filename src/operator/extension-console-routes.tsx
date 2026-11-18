import { listRows, type ListWindow } from '../ui/listing'
import { PanelForm } from '../ui/admin'
import { FormSection } from '../ui/patterns'
import { Button, NativeSelect } from '../ui/controls'
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
  template,
  templatesFromSettings,
} from '../extensions/canned/templates'
import { cannedSettings } from './canned-settings-page'
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
import { library } from '../extensions/articles/articles-usecase'
import { article, articleKey, publicPath } from '../extensions/articles/article'
import { repository } from '../extensions/issues/issues'
import {
  configuredRepository,
  issueDestination,
  issueChoices,
} from '../extensions/issues/issues-usecase'
import {
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
  consoleFrame(c.env, c.get('operator'), c.req.path, {
    q: c.req.query('q') ?? '',
    filter: c.req.query('filter') ?? '',
    sort: c.req.query('sort') ?? '',
    page: c.req.query('page') ?? '',
  })
const key = (product: string, id: string) =>
  '/articles/edit?' + new URLSearchParams({ product, id })
app.get('/articles', async (c) => {
  const api = active(c, 'articles')
  if (!api) return c.notFound()
  const data = await library(api)
  return c.render(
    libraryPage(await frame(c), data.articles, data.candidates, c.req.query()),
  )
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
  if (from < 0 || from >= to)
    return c.text('開始日と終了日を確認してください。', 400)
  const report = async (start: number, end: number) =>
    z.record(z.string(), z.number().nullable()).parse(
      await invoke(context(c), scopes, 'metrics.report', {
        product,
        from: start,
        to: end,
      }),
    )
  const [result, previous] = await Promise.all([
    report(from, to),
    from > 0
      ? report(Math.max(0, from - (to - from)), from)
      : Object.fromEntries([]),
  ])
  const iso = (time: number) =>
    new Date(time + japanOffset).toISOString().slice(0, 10)
  return c.render(
    metricsPage(
      state,
      { product, period, start: iso(from), end: iso(to - day) },
      result,
      previous,
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
  const restored = await undoPublicSetting(
    context(c),
    String((await c.req.parseBody()).changeId),
  )
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
        publicSettings:
          id === 'chat' || id === 'form'
            ? {
                responseTime:
                  (await publicProduct(c.env, p.id))?.responseTime ?? '',
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
        repository:
          id === 'issues' ? await configuredRepository(api, p.id) : undefined,
      }
    }),
  )
}
function guideNotice(id: string, query: Record<string, string>) {
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
  authorize(ctx, 'admin', scopes)
  const id = c.req.param('id')
  const installed = c.env.EXTENSIONS?.active.find(
    (item) => item.extension.id === id,
  )
  if (!installed) return c.notFound()
  const api = extensionContext(ctx, installed)
  const state = await frame(c)
  const portals = await guidePortals(c, id, api, state.products)
  const sections =
    id === 'export'
      ? (await panels(ctx, scopes, 'settings')).filter((p) => p.id === id)
      : []
  let list: ListWindow | undefined
  let content = extensionPanels(sections)
  if (id === 'canned' || id === 'rules') {
    const { rows, versions } = await readExtensionSettings(c.env.DB, id)
    if (id === 'canned') {
      const templates = templatesFromSettings(api.config, rows)
      const window = listRows([...templates], state.query, ([, t]) => ({
        text: t.name + ' ' + t.body,
      }))
      list = window
      content = cannedSettings(
        new Map(window.rows),
        versions,
        templates.size > 0,
      )
    } else {
      const rules = rulesFromSettings(
        api.config,
        rows,
        rows.find((row) => row.key === 'order')?.value,
      )
      const ordered = rules.map((item, index) => ({ ...item, index }))
      const window = listRows(ordered, state.query, ({ rule }) => ({
        text: [rule.subjectContains, rule.label, rule.assignee, rule.product]
          .filter(Boolean)
          .join(' '),
      }))
      list = window
      content = rulesSettings(state, window.rows, versions, rules.length)
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
) {
  if (token === null)
    return c.redirect('/extensions/' + id + '?publicSettings=conflict', 303)
  return c.redirect(
    '/extensions/' + id + '?saved=1' + (token ? '&undo=' + token : ''),
    303,
  )
}
app.post('/extensions/:id{canned|rules}/undo-setting', async (c) => {
  const id = c.req.param('id') as 'canned' | 'rules'
  if (!active(c, id)) return c.notFound()
  const restored = await undoExtensionSetting(
    context(c),
    id,
    (await c.req.parseBody()).changeId,
  )
  return c.redirect(
    '/extensions/' +
      id +
      '?publicSettings=' +
      (restored ? 'restored' : 'outdated'),
    303,
  )
})
app.post('/extensions/canned/save', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  const api = active(c, 'canned')
  if (!api) return c.notFound()
  const form = await c.req.parseBody()
  const item = template.parse(form)
  const id = z.string().max(100).parse(form.id)
  if (id && !(await savedTemplates(api)).has(id)) return c.notFound()
  return settingResult(
    c,
    'canned',
    await editExtensionSetting(
      ctx,
      'canned',
      'template/' + (id || ctx.uuid()),
      item,
      form.revision,
    ),
  )
})
app.post('/extensions/rules/add', async (c) => {
  const ctx = context(c)
  authorize(ctx, 'admin', scopes)
  const api = active(c, 'rules')
  if (!api) return c.notFound()
  const { revision, ...submitted } = await c.req.parseBody()
  const fields = Object.fromEntries(
    Object.entries(submitted).filter(([, v]) => v !== ''),
  )
  const key = fields.key ? ruleKey.parse(fields.key) : undefined
  delete fields.key
  if (key && !(await storedRules(api)).some((item) => item.key === key))
    return c.notFound()
  const rule = ruleSchema.parse(fields)
  const state = await frame(c)
  if (
    (rule.product && !state.products.some((p) => p.id === rule.product)) ||
    (rule.assignee &&
      !state.operators.some((p) => p.email === rule.assignee)) ||
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
    ),
  )
})
app.post('/extensions/rules/remove', async (c) => {
  authorize(context(c), 'admin', scopes)
  const api = active(c, 'rules')
  if (!api) return c.notFound()
  const form = await c.req.parseBody()
  const key = ruleKey.parse(form.key)
  if (!(await storedRules(api)).some((item) => item.key === key))
    return c.notFound()
  const token = await editExtensionSetting(
    context(c),
    'rules',
    key,
    null,
    form.revision,
  )
  return token === null
    ? settingResult(c, 'rules', null)
    : c.redirect('/extensions/rules?removed=yes', 303)
})
app.post('/extensions/rules/move', async (c) => {
  authorize(context(c), 'admin', scopes)
  const api = active(c, 'rules')
  if (!api) return c.notFound()
  const fields = await c.req.parseBody()
  const done = await moveRule(
    api,
    ruleKey.parse(fields.key),
    z.enum(['up', 'down']).parse(fields.direction) === 'up' ? -1 : 1,
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
    ),
  )
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
  const { repo, origin } = await issueDestination(api, product)
  const choices = await issueChoices(api, repo)
  const view = choices.length ? (
    <FormSection title="Issue の選択">
      <PanelForm
        method="post"
        action="/actions/issues.link"
        data-repo={repo}
        data-backlink={origin + '/conversation/' + number}
      >
        <input type="hidden" name="number" value={number} />
        <label>
          Issue
          <NativeSelect name="issue">
            {choices.map((i) => (
              <option value={i.number}>
                {i.title} (#{i.number})
              </option>
            ))}
          </NativeSelect>
        </label>
        <Button>既存の Issue と紐づける</Button>
      </PanelForm>
    </FormSection>
  ) : (
    <p>このリポジトリには Issue がありません。</p>
  )
  return c.render(adminPage('既存の Issue を選ぶ', await frame(c), view))
})
export { app as extensionConsoleRoutes }
