import { conversationAliases } from '../extensions/triage-usecase'
import { canonical } from '../extensions/aliases'
import type { InboundEnv } from './bindings-store'
import type { InboundJob } from './job'
import {
  conversationFor,
  attachmentKey,
  mailboxProduct,
  receipt,
  recordFailure,
  saveMail,
} from './inbound-store'
import { parseMail, type ParsedMail } from './parse'
import {
  archiveState,
  dueInbound,
  finishInbound,
  reserveInbound,
} from './inbound-jobs-store'

export async function archiveInbound(
  env: InboundEnv,
  raw: ReadableStream,
  job: InboundJob,
) {
  await reserveInbound(env.DB, job)
  await env.RAW.put(job.rawKey, raw)
  const state = await archiveState(env.DB, job)
  if (state === 'removed') await env.RAW.delete(job.rawKey)
  if (state === 'pending') {
    // The scheduled worker retries until the consumer commits the receipt.
    await env.JOBS.send({ ...job, tracked: true }).catch(() => {})
  }
}

export async function recoverInbound(env: InboundEnv, now: number) {
  for (const job of await dueInbound(env.DB, now)) {
    if (await env.RAW.head(job.rawKey)) await env.JOBS.send(job)
    else if (now - job.receivedAt >= 24 * 60 * 60 * 1000)
      await finishInbound(env.DB, job).run()
  }
}

async function sourceId(messageId: string | null, raw: ArrayBuffer) {
  if (messageId) return messageId
  const digest = await crypto.subtle.digest('SHA-256', raw)
  return (
    'sha256:' +
    Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('')
  )
}

export async function ingest(env: InboundEnv, job: InboundJob) {
  if (job.tracked && (await archiveState(env.DB, job)) !== 'pending') return
  const product = await mailboxProduct(env.DB, job.to)
  if (product === null) {
    await env.RAW.delete(job.rawKey)
    await finishInbound(env.DB, job).run()
    return
  }
  const object = await env.RAW.get(job.rawKey)
  if (!object) return
  if (object.size > 25 * 1024 * 1024) {
    await recordFailure(env.DB, job, 'Message exceeds 25 MiB')
    return
  }
  const raw = await object.arrayBuffer()
  const mail = await parseMail(raw, job.from).catch(async () => {
    await recordFailure(env.DB, job, 'Message could not be parsed')
    return null
  })
  if (!mail) return
  const source = await sourceId(mail.messageId, raw)
  await persistInbound(env, job, product, mail, source)
}

async function persistInbound(
  env: InboundEnv,
  job: InboundJob,
  product: string,
  mail: ParsedMail,
  source: string,
) {
  const keys = mail.attachments.map((_, i) => attachmentKey(job, i))
  const existing = await receipt(env.DB, job.to, mail.sender, source)
  if (existing) {
    if (existing !== job.rawKey) await env.RAW.delete([job.rawKey, ...keys])
    await finishInbound(env.DB, job).run()
    return
  }
  for (const [i, a] of mail.attachments.entries())
    await env.RAW.put(keys[i], a.content)
  try {
    const matched = await conversationFor(env.DB, job, mail)
    const number =
      matched === null
        ? null
        : canonical(await conversationAliases(env), matched)
    await saveMail(env.DB, job, product, mail, source, number)
  } catch (error) {
    const winner = await receipt(env.DB, job.to, mail.sender, source)
    if (
      !winner &&
      (!job.tracked || (await archiveState(env.DB, job)) !== 'removed')
    )
      throw error
    if (winner !== job.rawKey) await env.RAW.delete([job.rawKey, ...keys])
    await finishInbound(env.DB, job).run()
  }
}
