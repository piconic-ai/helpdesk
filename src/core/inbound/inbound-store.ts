import { z } from 'zod'
import { bouncedReply } from './bounce'
import type { InboundJob } from './job'
import type { ParsedMail } from './parse'
import { threadFor, threadHints } from './threading'
import { finishInbound } from './inbound-jobs-store'

const eligible = '(?=0 OR EXISTS(SELECT 1 FROM inbound_jobs WHERE raw_key=?))'

const system = JSON.stringify({ kind: 'system' })
const candidateSchema = z.object({
  number: z.number().int(),
  message_id: z.string().nullable(),
  provider_id: z.string().nullable(),
})

export async function archivedMailbox(db: D1Database, address: string) {
  return (
    (await db
      .prepare(
        'SELECT 1 FROM mailboxes m JOIN product_lifecycle l ON l.product=m.product WHERE m.address=? AND l.archived_at IS NOT NULL',
      )
      .bind(address)
      .first()) !== null
  )
}

export async function mailboxProduct(db: D1Database, address: string) {
  return z
    .string()
    .nullable()
    .parse(
      await db
        .prepare(
          'SELECT m.product FROM mailboxes m LEFT JOIN product_lifecycle l ON l.product=m.product WHERE m.address=? AND l.archived_at IS NULL',
        )
        .bind(address)
        .first('product'),
    )
}

export async function recordFailure(
  db: D1Database,
  job: InboundJob,
  reason: string,
) {
  await db.batch([
    db
      .prepare(
        `INSERT OR IGNORE INTO inbound_failures(raw_key,mailbox,sender,reason,at) SELECT ?,?,?,?,? WHERE ${eligible}`,
      )
      .bind(
        job.rawKey,
        job.to,
        job.from,
        reason,
        job.receivedAt,
        Number(!!job.tracked),
        job.rawKey,
      ),
    finishInbound(db, job),
  ])
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

export async function conversationFor(
  db: D1Database,
  job: InboundJob,
  mail: ParsedMail,
) {
  const hints = threadHints(mail.inReplyTo, mail.refs, mail.subject)
  if (hints.reference) {
    const { prefix, serial } = hints.reference
    // A legacy suffix refers to the immutable global ID. A qualified one
    // refers to the slot previously issued under that project's prefix.
    // Before project numbering the suffix alone identified the case. Retired
    // prefixes missing from the old audit log are safe only while unclaimed.
    return db
      .prepare(`SELECT number FROM conversations WHERE contact=?1 AND mailbox=?2 AND kind='inquiry'
        AND number=CASE
          WHEN ?4 IS NULL THEN ?3
          WHEN EXISTS(SELECT 1 FROM reserved_ticket_prefixes WHERE prefix=?4)
            THEN (SELECT conversation FROM ticket_references WHERE prefix=?4 AND serial=?3)
          ELSE (SELECT conversation FROM ticket_references WHERE prefix='#' AND serial=?3)
        END`)
      .bind(mail.sender, job.to, serial, prefix)
      .first<number>('number')
  }
  if (!hints.ids.length) return null
  const rows = await db
    .prepare(`SELECT c.number,m.message_id,m.provider_id
    FROM conversations c JOIN messages m ON m.number=c.number
    WHERE c.contact=?1 AND c.mailbox=?2 AND c.kind='inquiry' AND
    (m.message_id IN (SELECT value FROM json_each(?3)) OR m.provider_id IN (SELECT value FROM json_each(?3)))`)
    .bind(mail.sender, job.to, JSON.stringify(hints.ids))
    .all()
  return threadFor(hints.ids, candidateSchema.array().parse(rows.results))
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
  number: number | null,
) {
  const sql: D1PreparedStatement[] = []
  if (number === null) {
    sql.push(
      db
        .prepare(
          'INSERT INTO conversations(product,mailbox,contact,contact_name,subject,status,created_at) VALUES(?,?,?,?,?,?,?)',
        )
        .bind(
          product,
          job.to,
          mail.sender,
          mail.name,
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
    SELECT ?,coalesce(?,last_insert_rowid()),'inbound',?,?,?,?,?,?,? WHERE ${eligible}`)
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
        Number(!!job.tracked),
        job.rawKey,
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
      first: number === null,
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
  await db.batch([
    ...sql,
    ...bounceStatements(db, job, mail),
    finishInbound(db, job),
  ])
}

export const attachmentKey = (job: InboundJob, index: number) =>
  job.rawKey.replace('raw/', 'attachments/') + '/' + index
