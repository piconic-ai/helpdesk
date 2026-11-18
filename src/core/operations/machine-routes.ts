import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import type { Context, Scope } from './catalog-usecase'
import { authenticate, type AppEnv } from '../operators/middleware'
import {
  machineIdentity,
  issueToken,
  listTokens,
  disableToken,
} from '../operators/tokens-usecase'
import { tokensPage } from '../operators/tokens-page'
import { invoke, describe } from './runtime-usecase'
import {
  machineResult,
  responseSchema,
  toolInstruction,
} from './machine-result'
import { machineError } from './machine-errors'
import { serveMcp } from './machine-mcp'

type MachineEnv = AppEnv & {
  Variables: { principal: { ctx: Context; scopes: ReadonlySet<Scope> } }
}
const machine = new Hono<MachineEnv>()
const bearer = createMiddleware<MachineEnv>(async (c, next) => {
  const origin = c.req.header('origin')
  if (origin && origin !== new URL(c.req.url).origin)
    return c.json({ error: 'Invalid request origin' }, 403)
  const identity = await machineIdentity(c.env, c.req.header('authorization'))
  if (!identity) {
    c.header('WWW-Authenticate', 'Bearer realm="helpdesk"')
    return c.json({ error: 'Bearer token required' }, 401)
  }
  c.set('principal', identity)
  await next()
})
machine.use('/api/*', bearer)
machine.use('/mcp', bearer)
machine.get('/api/operations', async (c) => {
  const { ctx, scopes } = c.get('principal')
  return c.json({
    operations: (await describe(ctx, scopes)).map((op) => ({
      ...op,
      description: op.description + ' ' + toolInstruction,
      outputSchema: responseSchema(op.outputSchema),
    })),
  })
})
machine.post('/api/operations/:name', async (c) => {
  const { ctx, scopes } = c.get('principal')
  return c.json(
    machineResult(
      await invoke(ctx, scopes, c.req.param('name'), await c.req.json()),
    ),
  )
})
machine.all('/mcp', (c) => {
  const { ctx, scopes } = c.get('principal')
  return serveMcp(c.req.raw, ctx, scopes)
})
machine.use('/tokens', authenticate)
machine.use('/tokens/*', authenticate)
machine.get('/tokens', async (c) =>
  c.html(tokensPage(await listTokens(c.env, c.get('operator').email))),
)
machine.post('/tokens', async (c) => {
  const owner = c.get('operator').email
  const secret = await issueToken(
    c.env,
    owner,
    await c.req.parseBody(),
    Date.now(),
  )
  return c.html(tokensPage(await listTokens(c.env, owner), secret), 201)
})
machine.post('/tokens/:id/revoke', async (c) => {
  const deleted = await disableToken(
    c.env,
    c.get('operator').email,
    c.req.param('id'),
    Date.now(),
  )
  return deleted ? c.redirect('/tokens', 303) : c.notFound()
})
machine.onError((err, c) => {
  const error = machineError(err)
  return c.json({ error: error.message }, error.status)
})
export { machine as machineRoutes }
