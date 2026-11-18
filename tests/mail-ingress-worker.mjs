import worker from './worker.js'

function localBindings(env) {
  return {
    ...env,
    AI: {
      run: async () => {
        throw new Error('No test AI response configured')
      },
    },
    EMAIL: {
      send: async () => ({ messageId: crypto.randomUUID() + '@example.org' }),
    },
  }
}
export default {
  async fetch(request, env) {
    env = localBindings(env)
    if (new URL(request.url).pathname === '/cron') {
      await worker.scheduled({ scheduledTime: Date.now() + 3600000 }, env)
      return new Response(null, { status: 204 })
    }
    const interrupted = request.headers.get('X-Test-Queue')
    if (interrupted) {
      const queue = env.JOBS
      env = {
        ...env,
        JOBS: {
          async send(job) {
            if (interrupted === 'after') await queue.send(job)
            throw new Error('Queue acknowledgement unavailable')
          },
        },
      }
    }
    await worker.email(
      {
        raw: request.body,
        from: request.headers.get('X-Envelope-From') ?? '',
        to: request.headers.get('X-Envelope-To'),
      },
      env,
    )
    return new Response(null, { status: 202 })
  },
  queue(batch, env) {
    return worker.queue(batch, localBindings(env))
  },
}
