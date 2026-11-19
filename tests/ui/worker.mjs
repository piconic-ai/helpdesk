// Exercise the compiled application with a local email binding and a deterministic AI response.
import worker from './worker.js'
let sequence = 0
const clock = Date.now.bind(Date)
let clockStart
function localEnv(env, origin) {
  clockStart ??= clock()
  Date.now = () =>
    Number(env.FIXED_NOW) + (env.TICKING_CLOCK ? clock() - clockStart : 0)
  crypto.randomUUID = () =>
    '00000000-0000-4000-8000-' + (++sequence).toString(16).padStart(12, '0')
  return {
    ...env,
    PUBLIC_INTAKES: {
      slide: {
        publicKey: 'visual-test',
        origins: [
          origin,
          ...(env.TEST_EMBED_ORIGIN ? [env.TEST_EMBED_ORIGIN] : []),
        ],
        limitPerMinute: 100,
      },
    },
    AI: {
      run: async (_model, input) => ({
        response: [
          { id: 0, score: input.query.includes('領収書') ? 0.95 : 0.05 },
        ],
      }),
    },
    EMAIL: {
      send: async () => ({
        messageId: '<local-' + ++sequence + '@example.com>',
      }),
    },
  }
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (
      request.method === 'POST' &&
      request.headers.get('X-Simulation-Key') === env.SIMULATION_KEY &&
      url.pathname.startsWith('/__simulation/')
    ) {
      const local = localEnv(env, url.origin)
      if (url.pathname === '/__simulation/mail') {
        await worker.email(
          {
            from: url.searchParams.get('from'),
            to: url.searchParams.get('to'),
            raw: request.body,
          },
          local,
        )
      } else if (url.pathname === '/__simulation/scheduled') {
        await worker.scheduled({ scheduledTime: Date.now() }, local)
      } else return new Response(null, { status: 404 })
      return new Response(null, { status: 204 })
    }
    const local = localEnv(env, url.origin)
    if (
      env.TEST_ADMIN_COOKIE &&
      request.headers
        .get('Cookie')
        ?.split(/;\s*/)
        .includes('peer-admin=' + env.TEST_ADMIN_COOKIE)
    )
      local.LOCAL_OPERATOR = 'mori@example.com'
    return worker.fetch(request, local, ctx)
  },
  email(message, env) {
    return worker.email(message, localEnv(env, 'http://localhost'))
  },
  scheduled(event, env) {
    return worker.scheduled(event, localEnv(env, 'http://localhost'))
  },
  queue(batch, env) {
    return worker.queue(batch, localEnv(env, 'http://localhost'))
  },
}
