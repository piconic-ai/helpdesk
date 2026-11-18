// Exercise the compiled application with a local email binding and a deterministic AI response.
import worker from './worker.js'
let sequence = 0
function localEnv(env, origin) {
  Date.now = () => Number(env.FIXED_NOW)
  crypto.randomUUID = () =>
    '00000000-0000-4000-8000-' + (++sequence).toString(16).padStart(12, '0')
  return {
    ...env,
    PUBLIC_INTAKES: {
      slide: {
        publicKey: 'visual-test',
        origins: [origin],
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
  fetch(request, env, ctx) {
    return worker.fetch(
      request,
      localEnv(env, new URL(request.url).origin),
      ctx,
    )
  },
  queue(batch, env) {
    return worker.queue(batch, localEnv(env, 'http://localhost'))
  },
}
