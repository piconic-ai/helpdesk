import { inboundJob } from './job'
import type { InboundEnv } from './bindings-store'
import { archiveInbound } from './inbound-usecase'

export async function receiveEmail(
  message: Pick<ForwardableEmailMessage, 'from' | 'to' | 'raw'>,
  env: InboundEnv,
) {
  const rawKey = 'raw/' + crypto.randomUUID()
  await archiveInbound(
    env,
    message.raw,
    inboundJob.parse({
      kind: 'inbound',
      rawKey,
      from: message.from,
      to: message.to.toLowerCase(),
      receivedAt: Date.now(),
    }),
  )
}
