import type { InboundEnv } from './bindings-store'
import { receiveEmail } from './inbound-email'
import { processInbound } from './inbound-queue'

export default {
  async fetch(request: Request, env: InboundEnv) {
    if (!request.body) return new Response(null, { status: 400 })
    await receiveEmail(
      {
        raw: request.body,
        from: request.headers.get('X-Envelope-From') ?? '',
        to: request.headers.get('X-Envelope-To') ?? '',
      },
      env,
    )
    return new Response(null, { status: 202 })
  },
  async queue(batch: MessageBatch, env: InboundEnv) {
    for (const job of batch.messages) await processInbound(job.body, env)
  },
}
