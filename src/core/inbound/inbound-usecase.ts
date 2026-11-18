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
import { parseMail } from './parse'

export async function archiveInbound(
  env: InboundEnv,
  raw: ReadableStream,
  job: InboundJob,
) {
  await env.RAW.put(job.rawKey, raw)
  await env.JOBS.send(job)
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
  const product = await mailboxProduct(env.DB, job.to)
  if (product === null) {
    await env.RAW.delete(job.rawKey)
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
  const existing = await receipt(env.DB, job.to, mail.sender, source)
  if (existing) {
    if (existing !== job.rawKey) await env.RAW.delete(job.rawKey)
    return
  }
  const keys = mail.attachments.map((_, i) => attachmentKey(job, i))
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
    if (!winner) throw error
    if (winner !== job.rawKey) await env.RAW.delete([job.rawKey, ...keys])
  }
}
