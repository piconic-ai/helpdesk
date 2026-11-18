import { z } from 'zod'
import { bouncedReply } from './bounce'
import type { InboundJob } from './job'
import type { ParsedMail } from './parse'
import { threadFor, threadHints } from './threading'

const system = JSON.stringify({ kind: 'system' })
const candidateSchema = z.object({
  number: z.number().int(),
  contact: z.string(),
  mailbox: z.string(),
  message_id: z.string().nullable(),
  provider_id: z.string().nullable(),
})

export async function mailboxProduct(db: D1Database, address: string) {
  return z
    .string()
    .nullable()
    .parse(
      await db
        .prepare('SELECT product FROM mailboxes WHERE address=?')
        .bind(address)
        .first('product'),
    )
}

export async function recordFailure(
  db: D1Database,
  job: InboundJob,
  reason: string,
) {
  await db
    .prepare(
      'INSERT OR IGNORE INTO inbound_failures(raw_key,mailbox,sender,reason,at) VALUES(?,?,?,?,?)',
    )
    .bind(job.rawKey, job.to, job.from, reason, job.receivedAt)
    .run()
}

export async function receipt(
  db: D1Database,
  mailbox: string,
  sender: string,
  sourceId: string,
) {
  return z
    .string()
    .nullable()
    .parse(
      await db
        .prepare(
          'SELECT raw_key FROM inbound_receipts WHERE mailbox=? AND sender=? AND source_id=?',
        )
        .bind(mailbox, sender, sourceId)
        .first('raw_key'),
    )
}

async function conversationFor(
  db: D1Database,
  job: InboundJob,
  mail: ParsedMail,
) {
  const hints = threadHints(mail.inReplyTo, mail.refs, mail.subject)
  const rows = await db
    .prepare(`SELECT c.number,c.contact,c.mailbox,m.message_id,m.provider_id
    FROM conversations c LEFT JOIN messages m ON m.number=c.number
    WHERE c.contact=? AND c.mailbox=? AND c.kind='inquiry' AND
    (c.number=? OR m.message_id IN (SELECT value FROM json_each(?)) OR m.provider_id IN (SELECT value FROM json_each(?)))`)
    .bind(
      mail.sender,
      job.to,
      hints.number,
      JSON.stringify(hints.ids),
      JSON.stringify(hints.ids),
    )
    .all()
  return threadFor(
    { ...mail, mailbox: job.to },
    z.array(candidateSchema).parse(rows.results),
  )
}

function bounceStatements(db: D1Database, job: InboundJob, mail: ParsedMail) {
  if (mail.category !== 'bounce') return []
  const failure = bouncedReply(mail)
  if (!failure) return []
  const match = `FROM messages m JOIN conversations c ON c.number=m.number
    WHERE c.contact=? AND c.mailbox=? AND m.kind='outbound' AND m.delivery='sent'
    AND (m.provider_id IN (SELECT value FROM json_each(?)) OR m.message_id IN (SELECT value FROM json_each(?)))`
  const ids = JSON.stringify(failure.ids)
  const bind = [failure.recipient, job.to, ids, ids]
  return [
    db
      .prepare(
        `INSERT INTO events(number,kind,actor,payload,at) SELECT m.number,'reply_failed',?,json_object('message',m.id),? ${match}`,
      )
      .bind(system, job.receivedAt, ...bind),
    db
      .prepare(
        `UPDATE messages SET delivery='failed', reason='Recipient reported a permanent delivery failure' WHERE id IN (SELECT m.id ${match})`,
      )
      .bind(...bind),
  ]
}

export async function saveMail(
  db: D1Database,
  job: InboundJob,
  product: string,
  mail: ParsedMail,
  sourceId: string,
) {
  const number = await conversationFor(db, job, mail)
  const sql: D1PreparedStatement[] = []
  if (number === null) {
    sql.push(
      db
        .prepare(
          'INSERT INTO conversations(product,mailbox,contact,subject,status,created_at) VALUES(?,?,?,?,?,?)',
        )
        .bind(
          product,
          job.to,
          mail.sender,
          mail.subject,
          'open',
          job.receivedAt,
        ),
    )
  }
  const id = job.rawKey.slice(4)
  sql.push(
    db
      .prepare(`INSERT INTO messages(id,number,kind,body,html,raw_key,message_id,in_reply_to,refs,created_at)
    VALUES(?,coalesce(?,last_insert_rowid()),'inbound',?,?,?,?,?,?,?)`)
      .bind(
        id,
        number,
        mail.text,
        mail.html,
        job.rawKey,
        mail.messageId,
        mail.inReplyTo,
        mail.refs,
        job.receivedAt,
      ),
  )
  sql.push(
    db
      .prepare(
        'INSERT INTO inbound_receipts(raw_key,message,mailbox,sender,source_id) VALUES(?,?,?,?,?)',
      )
      .bind(job.rawKey, id, job.to, mail.sender, sourceId),
  )
  const event = (kind: string, payload: object) =>
    db
      .prepare(
        'INSERT INTO events(number,kind,actor,payload,at) SELECT number,?,?,?,? FROM messages WHERE id=?',
      )
      .bind(kind, system, JSON.stringify(payload), job.receivedAt, id)
  if (number === null)
    sql.push(event('conversation_opened', { origin: 'email' }))
  sql.push(
    event('message_received', {
      message: id,
      category: mail.category,
      authentication: mail.authentication,
    }),
  )
  if (number !== null && mail.category === 'human') {
    sql.push(
      db
        .prepare(`INSERT INTO events(number,kind,actor,payload,at) SELECT number,'status_changed',?,json_object('from',status,'to','open'),?
      FROM conversations WHERE number=? AND status IN ('pending','closed')`)
        .bind(system, job.receivedAt, number),
    )
    sql.push(
      db
        .prepare(
          "UPDATE conversations SET status='open',closed_at=NULL WHERE number=? AND status IN ('pending','closed')",
        )
        .bind(number),
    )
  }
  for (const [i, a] of mail.attachments.entries()) {
    sql.push(
      db
        .prepare(
          'INSERT INTO attachments(key,message,filename,mime) VALUES(?,?,?,?)',
        )
        .bind(attachmentKey(job, i), id, a.filename, a.mime),
    )
  }
  await db.batch([...sql, ...bounceStatements(db, job, mail)])
}

export const attachmentKey = (job: InboundJob, index: number) =>
  job.rawKey.replace('raw/', 'attachments/') + '/' + index
