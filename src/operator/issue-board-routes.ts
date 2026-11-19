import { Hono, type Context } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../core/operators/middleware'
import { context, scopes } from '../core/operations/operations-routes'
import { invoke } from '../core/operations/runtime-usecase'
import { extensionContext } from '../core/extensions/context-usecase'
import { consoleFrame } from '../core/conversations/console-usecase'
import { issueCreationChoices, issueDetail } from './issue-board-usecase'
import {
  issueBoard,
  refreshIssueState,
} from '../extensions/issues/board-usecase'
import {
  configuredRepository,
  issueDestination,
  issueChoices,
} from '../extensions/issues/issues-usecase'
import { issueRef, positive } from '../extensions/issues/issues'
import { issueKey } from '../extensions/issues/outcomes'
import {
  issueBoardPage,
  issueDetailPage,
  issueNewPage,
} from './issue-board-page'

const routes = new Hono<AppEnv>()
function enabled(c: Context<AppEnv>) {
  const installed = c.env.EXTENSIONS?.active.find(
    (i) => i.extension.id === 'issues',
  )
  return installed && extensionContext(context(c), installed)
}
const frame = (c: Context<AppEnv>) =>
  consoleFrame(c.env, c.get('operator'), c.req.path, c.req.query())
routes.get('/issues', async (c) => {
  const api = enabled(c)
  if (!api) return c.notFound()
  const [layout, rows] = await Promise.all([frame(c), issueBoard(api)])
  return c.render(issueBoardPage(layout, rows, c.req.query()))
})
routes.get('/issues/new', async (c) => {
  const api = enabled(c)
  if (!api) return c.notFound()
  const layout = await frame(c)
  const choices = await issueCreationChoices(c.env.DB, api, layout.products)
  return c.render(issueNewPage(layout, choices))
})
routes.get('/issues/:owner/:repo/:issue', async (c) => {
  const api = enabled(c)
  if (!api) return c.notFound()
  const params = issueRef.safeParse({
    repository: c.req.param('owner') + '/' + c.req.param('repo'),
    issue: c.req.param('issue'),
  })
  if (!params.success) return c.notFound()
  const detail = await issueDetail(c.env.DB, api, params.data)
  if (!detail) return c.notFound()
  return c.render(
    issueDetailPage(
      await frame(c),
      detail.rows,
      detail.contacts,
      c.req.query('drafts'),
    ),
  )
})
routes.post('/issues/:owner/:repo/:issue/demo-close', async (c) => {
  const service = c.env.DEMO_GITHUB
  const api = enabled(c)
  if (!service || !api) return c.notFound()
  const ref = issueRef.safeParse({
    repository: c.req.param('owner') + '/' + c.req.param('repo'),
    issue: c.req.param('issue'),
  })
  if (!ref.success) return c.notFound()
  const { repository, issue } = ref.data
  if (!(await api.get('issue/' + issueKey(repository, issue))))
    return c.notFound()
  const response = await service.fetch(
    'https://api.github.com/repos/' + repository + '/issues/' + issue,
    {
      method: 'PATCH',
      body: JSON.stringify({
        state: 'closed',
        closed_at: new Date(api.now).toISOString(),
      }),
    },
  )
  if (!response.ok)
    return c.text('模擬 GitHub の課題を閉じられませんでした。', 502)
  // Read back the remote change. Operators create and approve notices in the usual workflow.
  await refreshIssueState(api, repository, issue)
  return c.redirect('/issues', 303)
})
routes.get('/issues/choices/:number', async (c) => {
  const api = enabled(c)
  if (!api) return c.notFound()
  const number = positive.parse(c.req.param('number'))
  const { product } = await api.contact(number)
  if (
    !(await configuredRepository(api, product)) ||
    !api.secret('GITHUB_TOKEN')
  )
    return c.notFound()
  const { repo, origin } = await issueDestination(api, product)
  return c.json({
    repo,
    backlink: origin + '/conversation/' + number,
    choices: await issueChoices(api, repo),
  })
})
routes.post('/issues/drafts', async (c) => {
  const api = enabled(c)
  if (!api) return c.notFound()
  const body = await c.req.parseBody()
  const ref = issueRef.parse(body)
  const key = issueKey(ref.repository, ref.issue)
  const rows = (await issueBoard(api)).filter(
    (r) => issueKey(r.repository, r.issue) === key,
  )
  const ctx = context(c)
  let count = 0
  for (const row of rows) {
    if (body.product && body.product !== row.product) continue
    const draft = z.object({ ready: z.number() }).parse(
      await invoke(ctx, scopes, 'issues.draftNotices', {
        ...ref,
        product: row.product,
      }),
    )
    count += draft.ready
  }
  return c.redirect(
    '/issues/' + key + '?drafts=' + (count ? 'ready' : 'unchanged'),
    303,
  )
})
export { routes as issueBoardRoutes }
