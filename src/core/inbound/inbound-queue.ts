import type { InboundEnv } from './bindings-store'
import { inboundJob } from './job'
import { ingest } from './inbound-usecase'

export async function processInbound(body: unknown, env: InboundEnv) {
  await ingest(env, inboundJob.parse(body))
}
