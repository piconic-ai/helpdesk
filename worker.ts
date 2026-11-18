import { Hono } from 'hono'
import { z } from 'zod'
import type { Bindings } from './src/core/settings/bindings'
import type { AppEnv } from './src/core/operators/middleware'
import { operatorRoutes } from './src/core/operations/operations-routes'
import { receiveEmail } from './src/core/inbound/inbound-email'
import { processInbound } from './src/core/inbound/inbound-queue'
import { deliverReply, recoverReplies } from './src/core/outbound/reply-usecase'
import { purgeExpired } from './src/core/retention/retention-usecase'

export const app = new Hono<AppEnv>()
app.use('*', async (c, next) => {
  if (c.env.LOCAL_OPERATOR && c.env.ENVIRONMENT !== 'local')
    return c.text('LOCAL_OPERATOR requires ENVIRONMENT=local', 500)
  await next()
  if (!c.res.headers.has('Content-Security-Policy'))
    c.header(
      'Content-Security-Policy',
      "default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; frame-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    )
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('Referrer-Policy', 'same-origin')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  c.header('Cache-Control', 'no-store')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  c.header('Strict-Transport-Security', 'max-age=31536000')
})
for (const asset of ['/components/*', '/styles.css', '/uno.css'])
  app.get(asset, (c) => c.env.ASSETS.fetch(c.req.raw))
app.route('/', operatorRoutes)
export default {
  fetch: app.fetch,
  email: receiveEmail,
  async queue(batch: MessageBatch, env: Bindings) {
    for (const job of batch.messages) {
      try {
        const { kind } = z
          .object({ kind: z.enum(['inbound', 'outbound']) })
          .parse(job.body)
        if (kind === 'inbound') await processInbound(job.body, env)
        else
          await deliverReply(
            env,
            z.object({ id: z.string() }).parse(job.body).id,
            Date.now(),
          )
        job.ack()
      } catch {
        job.retry()
      }
    }
  },
  async scheduled(event: ScheduledController, env: Bindings) {
    await Promise.all([
      recoverReplies(env),
      purgeExpired(env, event.scheduledTime),
    ])
  },
}
