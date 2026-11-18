import { createMiddleware } from 'hono/factory'
import type { Bindings } from '../settings/bindings'
import type { Operator } from './operators-store'
import { currentOperator } from './access-usecase'
export type AppEnv = { Bindings: Bindings; Variables: { operator: Operator } }
export const authenticate = createMiddleware<AppEnv>(async (c, next) => {
  const operator = await currentOperator(
    c.env,
    c.req.header('Cf-Access-Jwt-Assertion') ?? '',
  )
  if (!operator) return c.text('Authentication required', 401)
  if (
    c.req.method === 'POST' &&
    c.req.header('origin') !== new URL(c.req.url).origin
  )
    return c.text('Invalid request origin', 403)
  c.set('operator', operator)
  await next()
})
