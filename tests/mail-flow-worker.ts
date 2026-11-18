import worker from '../worker'
import type { Bindings } from '../src/core/settings/bindings'

function localAI(env: Bindings) {
  return {
    ...env,
    AI: {
      run: async () => {
        throw new Error('No test AI response configured')
      },
    } as unknown as Ai,
  }
}

export default {
  fetch: (request: Request, env: Bindings, ctx: ExecutionContext) =>
    worker.fetch(request, localAI(env), ctx),
  email: (message: ForwardableEmailMessage, env: Bindings) =>
    worker.email(message, localAI(env)),
  queue: (batch: MessageBatch, env: Bindings) =>
    worker.queue(batch, localAI(env)),
  scheduled: (event: ScheduledController, env: Bindings) =>
    worker.scheduled(event, localAI(env)),
}
