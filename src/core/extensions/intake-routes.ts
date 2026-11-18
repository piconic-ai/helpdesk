import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import type { AppEnv } from '../operators/middleware'
import { intakePolicySchema } from '../intakes/intake'
import { verifyIntake } from '../intakes/intake-usecase'
import { extensionContext } from './context-usecase'
const app = new Hono<AppEnv>()
app.use('/public/*', bodyLimit({ maxSize: 256 * 1024 }))
app.on(['OPTIONS', 'POST'], '/public/:id/:product/:path', async (c) => {
  const { id, product, path } = c.req.param()
  const installed = c.env.EXTENSIONS?.active.find((i) => i.extension.id === id)
  const intake = installed?.extension.intakes?.find((i) => i.path === path)
  if (!installed || !intake) return c.notFound()
  const policy = intakePolicySchema.safeParse(c.env.PUBLIC_INTAKES?.[product])
  const origin = c.req.header('origin')
  if (!policy.success || !origin || !policy.data.origins.includes(origin))
    return c.json({ error: 'Request denied' }, 403)
  c.header('Vary', 'Origin')
  c.header('Access-Control-Allow-Origin', origin)
  if (c.req.method === 'OPTIONS') {
    c.header(
      'Access-Control-Allow-Headers',
      'Content-Type, X-Helpdesk-Key, CF-Turnstile-Response',
    )
    c.header('Access-Control-Allow-Methods', 'POST')
    return c.body(null, 204)
  }
  const now = Date.now()
  if (!(await verifyIntake(c.env, product, c.req.raw, policy.data, now)))
    return c.json({ error: 'Request denied' }, 403)
  const ctx = extensionContext(
    {
      env: c.env,
      actor: { kind: 'extension', id },
      operator: { role: 'agent', email: '' },
      now,
      uuid: () => crypto.randomUUID(),
    },
    installed,
  )
  try {
    return c.json(await intake.run(ctx, product, await c.req.json()), 201)
  } catch {
    return c.json({ error: 'Invalid submission' }, 400)
  }
})
export { app as intakeRoutes }
