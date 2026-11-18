import { Hono, type Context } from 'hono'
import { z } from 'zod'
import type { Bindings } from './src/core/settings/bindings'
import type { AppEnv } from './src/core/operators/middleware'
import { extensionConsoleRoutes } from './src/operator/extension-console-routes'
import { operatorRoutes } from './src/core/operations/operations-routes'
import { receiveEmail } from './src/core/inbound/inbound-email'
import { recoverInbound } from './src/core/inbound/inbound-usecase'
import { processInbound } from './src/core/inbound/inbound-queue'
import { deliverReply, recoverReplies } from './src/core/outbound/reply-usecase'
import { purgeExpired } from './src/core/retention/retention-usecase'

import { extensions, publicIntakes } from './helpdesk.config'
import { configure } from './src/core/extensions/registry-usecase'
import {
  deliverEvent,
  enqueueEvents,
  tick,
} from './src/core/extensions/dispatch-usecase'
import { intakeRoutes } from './src/core/extensions/intake-routes'
import { judgeArticles } from './src/extensions/chat/judge-client'
import { hostedIntakeRoutes } from './src/public/intake-routes'
import { publicRoutes } from './src/core/extensions/public-routes'
import { machineRoutes } from './src/core/operations/machine-routes'

import { missingPublicPage, helpLanding } from './src/public/not-found-pages'
import { publicProduct, helpDestinations } from './src/public/product-usecase'
import { operatorErrorPage } from './src/core/conversations/console-page'

async function renderMissingPage(c: Context<AppEnv>) {
  if (
    c.res.status === 404 &&
    c.req.method === 'GET' &&
    c.req.header('accept')?.includes('text/html')
  ) {
    const path = c.req.path
    if (path.startsWith('/help/')) {
      const id = path.split('/')[3] ?? ''
      const product = id && (await publicProduct(c.env, id))
      const hasArticles = c.env.EXTENSIONS?.active.some(
        (item) => item.extension.id === 'articles',
      )
      const back =
        product && hasArticles
          ? '/help/articles/' + encodeURIComponent(id) + '/'
          : '/help/'
      c.res = await c.html(
        missingPublicPage(product || { name: 'ヘルプ', mailbox: null }, back),
        404,
      )
    } else if (
      c.get('operator') &&
      !/^\/(?:api|mcp|public|ui|components|extension-assets)(?:\/|$)/.test(path)
    ) {
      c.res = await c.html(operatorErrorPage(404), 404)
    }
  }
}
export const app = new Hono<AppEnv>()
app.use('*', async (c, next) => {
  try {
    c.env = await configure(
      { ...c.env, judgeArticles: c.env.judgeArticles ?? judgeArticles },
      extensions,
      publicIntakes,
    )
  } catch (error) {
    return c.text(
      'Invalid helpdesk configuration: ' +
        (error instanceof Error ? error.message : 'Unknown error'),
      500,
    )
  }
  await next()
  await renderMissingPage(c)
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
for (const asset of [
  '/extension-assets/*',
  '/components/*',
  '/ui/*',
  '/styles.css',
  '/uno.css',
])
  app.get(asset, (c) => c.env.ASSETS.fetch(c.req.raw))
app.route('/', hostedIntakeRoutes)
app.route('/', publicRoutes)
app.on('GET', ['/help', '/help/'], async (c) =>
  c.html(helpLanding(await helpDestinations(c.env, new URL(c.req.url).origin))),
)
app.get('/help/*', (c) => c.notFound())
app.route('/', intakeRoutes)
app.route('/', machineRoutes)
operatorRoutes.route('/', extensionConsoleRoutes)
app.route('/', operatorRoutes)
export default {
  fetch: app.fetch,
  async email(message: ForwardableEmailMessage, env: Bindings) {
    await receiveEmail(message, await configure(env, extensions, publicIntakes))
  },
  async queue(batch: MessageBatch, env: Bindings) {
    env = await configure(env, extensions, publicIntakes)
    for (const job of batch.messages) {
      try {
        const { kind } = z
          .object({ kind: z.enum(['inbound', 'outbound', 'dispatch']) })
          .parse(job.body)
        if (kind === 'inbound') await processInbound(job.body, env)
        else if (kind === 'dispatch') {
          const data = z
            .object({ extension: z.string(), event: z.number() })
            .parse(job.body)
          await deliverEvent(env, data.extension, data.event, Date.now())
        } else
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
    await enqueueEvents(env, Date.now())
  },
  async scheduled(event: ScheduledController, env: Bindings) {
    env = await configure(env, extensions, publicIntakes)
    await Promise.all([
      tick(env, event.scheduledTime),
      recoverInbound(env, event.scheduledTime),
      recoverReplies(env),
      purgeExpired(env, event.scheduledTime),
    ])
  },
}
