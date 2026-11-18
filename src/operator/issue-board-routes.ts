import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../core/operators/middleware'
import { context, scopes } from '../core/operations/operations-routes'
import { invoke } from '../core/operations/runtime-usecase'
import { extensionContext } from '../core/extensions/context-usecase'
import { consoleFrame } from '../core/conversations/console-usecase'
import { issueBoard } from '../extensions/issues/board-usecase'
import { issueBoardPage } from './issue-board-page'
const routes = new Hono<AppEnv>()
routes.get('/issues', async (c) => {
  const installed = c.env.EXTENSIONS?.active.find(
    (i) => i.extension.id === 'issues',
  )
  if (!installed) return c.notFound()
  const api = extensionContext(context(c), installed)
  const [frame, rows] = await Promise.all([
    consoleFrame(c.env, c.get('operator'), c.req.path, c.req.query()),
    issueBoard(api),
  ])
  return c.render(issueBoardPage(frame, rows, c.req.query()))
})
routes.post('/issues/drafts', async (c) => {
  const installed = c.env.EXTENSIONS?.active.find(
    (i) => i.extension.id === 'issues',
  )
  if (!installed) return c.notFound()
  const ctx = context(c)
  const { ready } = z
    .object({ ready: z.number() })
    .parse(
      await invoke(ctx, scopes, 'issues.draftNotices', await c.req.parseBody()),
    )
  return c.redirect('/issues?drafts=' + (ready ? 'ready' : 'unchanged'), 303)
})
export { routes as issueBoardRoutes }
