import type { Bindings } from '../settings/bindings'
import type { Context } from '../operations/catalog-usecase'
import { conversationProject } from '../operators/project-targets-store'
import type { ExtensionEvent } from './extension'
import { forProject, type Installed } from './registry'
import { claimEvent, due, finishEvent, scan } from './extension-store'
import { extensionContext } from './context-usecase'

export async function enqueueEvents(env: Bindings, now: number) {
  for (const item of env.EXTENSIONS?.active ?? []) {
    const kinds = item.extension.subscribers?.map((s) => s.kind) ?? []
    if (!kinds.length || item.projects?.size === 0) continue
    await scan(env.DB, item.extension.id, kinds)
    const ids = await due(env.DB, item.extension.id, now)
    await Promise.all(
      ids.map((event) =>
        env.JOBS.send({
          kind: 'dispatch',
          extension: item.extension.id,
          event,
        }),
      ),
    )
  }
}
async function subscriptionFor(
  db: D1Database,
  item: Installed,
  event: ExtensionEvent,
) {
  if (item.projects?.size === 0) return
  const product =
    event.number === null
      ? event.payload.product
      : await conversationProject(db, event.number)
  if (typeof product === 'string') {
    if (event.id <= (item.projects?.get(product)?.afterEvent ?? 0)) return
    return forProject(item, product)
  }
  if (event.number !== null) return
  if (!item.projects) return item
  const eligible = new Map(
    [...item.projects].filter(([, setting]) => event.id > setting.afterEvent),
  )
  return eligible.size ? { ...item, projects: eligible } : undefined
}
export async function deliverEvent(
  env: Bindings,
  id: string,
  event: number,
  now: number,
) {
  const item = env.EXTENSIONS?.active.find((e) => e.extension.id === id)
  if (!item) return
  const job = await claimEvent(env.DB, id, event, now)
  if (!job) return
  const c: Context = {
    env,
    actor: { kind: 'extension', id },
    operator: { email: item.enabledBy ?? '', role: 'agent' },
    now,
    uuid: () => crypto.randomUUID(),
  }
  try {
    const scoped = await subscriptionFor(env.DB, item, job.event)
    if (scoped) {
      const ctx = extensionContext(c, scoped)
      for (const sub of item.extension.subscribers ?? [])
        if (sub.kind === job.event.kind) await sub.run(ctx, job.event)
    }
    await finishEvent(env.DB, id, event, job.attempt, null, now)
  } catch (error) {
    await finishEvent(
      env.DB,
      id,
      event,
      job.attempt,
      error instanceof Error
        ? error.message.slice(0, 300)
        : 'Subscriber failed',
      now,
    )
  }
}
export async function tick(env: Bindings, now: number) {
  if (
    env.EXTENSIONS?.active.some(
      (x) =>
        x.projects?.size !== 0 &&
        x.extension.subscribers?.some((s) => s.kind === 'scheduled'),
    )
  )
    await env.DB.prepare(
      "INSERT INTO events(kind,actor,at) VALUES('scheduled',?,?)",
    )
      .bind(JSON.stringify({ kind: 'system' }), now)
      .run()
  await enqueueEvents(env, now)
}
