import worker from './worker.js'
export default {
  async fetch(request, env) {
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
    return worker.queue(batch, {
      ...env,
      EMAIL: {
        send: async () => ({ messageId: crypto.randomUUID() + '@example.org' }),
      },
    })
  },
}
