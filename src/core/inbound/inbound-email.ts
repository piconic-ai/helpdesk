import { inboundJob } from './job'
import type { InboundEnv } from './bindings-store'
import { archiveInbound } from './inbound-usecase'

export async function receiveEmail(
  message: Pick<ForwardableEmailMessage, 'from' | 'to' | 'raw'> &
    Partial<Pick<ForwardableEmailMessage, 'setReject'>>,
  env: InboundEnv,
) {
  const rawKey = 'raw/' + crypto.randomUUID()
  const accepted = await archiveInbound(
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
  if (!accepted) message.setReject?.('This support address is archived.')
}
