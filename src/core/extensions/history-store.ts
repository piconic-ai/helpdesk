import {
  scopeBinding,
  type ProductScope,
} from '../operators/project-permission'
import { z } from 'zod'
import type { ExtensionEvent } from './extension'
import { eventStatement } from '../conversations/conversations-store'
import type { Context } from '../operations/catalog-usecase'
export async function receivedVoices(
  db: D1Database,
  scope: ProductScope = null,
) {
  const { results } = await db
    .prepare(
      "SELECT number,product,created_at AS createdAt,kind,status FROM conversations WHERE status!='spam' AND (?1 IS NULL OR product IN (SELECT value FROM json_each(?1))) ORDER BY number",
    )
    .bind(scopeBinding(scope))
    .all()
  return z
    .array(
      z.object({
        number: z.number(),
        product: z.string(),
        createdAt: z.number(),
        status: z.string(),
        kind: z.enum(['inquiry', 'feedback']),
      }),
    )
    .parse(results)
}
export async function history(
  db: D1Database,
  kind?: string,
  scope: ProductScope = null,
): Promise<ExtensionEvent[]> {
  const result = await db
    .prepare(`SELECT e.*,c.product FROM events e LEFT JOIN conversations c USING(number)
    WHERE (?1 IS NULL OR e.kind=?1) AND ${visibleEvent} ORDER BY e.id`)
    .bind(kind ?? null, scopeBinding(scope))
    .all()
  const schema = z.object({
    id: z.number(),
    at: z.number(),
    kind: z.string(),
    number: z.number().nullable(),
    product: z.string().nullable(),
    actor: z.string(),
    payload: z.string(),
  })
  return schema
    .array()
    .parse(result.results)
    .map(({ product, ...e }) => ({
      ...e,
      actor: JSON.parse(e.actor),
      payload: { product, ...JSON.parse(e.payload) },
    }))
}
// A deployment-wide event has no project. Project-tagged events can exist before a conversation opens.
const visibleEvent = `(?2 IS NULL OR coalesce(c.product,json_extract(e.payload,'$.product')) IN (SELECT value FROM json_each(?2)))`
const visibleConversation =
  '(?1 IS NULL OR c.product IN (SELECT value FROM json_each(?1)))'
export async function snapshotCounts(
  db: D1Database,
  scope: ProductScope = null,
) {
  const ids = scopeBinding(scope)
  const row = await db
    .prepare(`SELECT
    (SELECT count(*) FROM conversations c WHERE ${visibleConversation}) AS conversations,
    (SELECT count(*) FROM messages m JOIN conversations c USING(number) WHERE ${visibleConversation}) AS messages,
    (SELECT count(*) FROM events e LEFT JOIN conversations c USING(number) WHERE ${visibleEvent}) AS events`)
    .bind(ids, ids)
    .first<{ conversations: number; messages: number; events: number }>()
  return row!
}
export async function snapshot(db: D1Database, scope: ProductScope = null) {
  const ids = scopeBinding(scope)
  const [conversations, messages, events] = await db.batch([
    db
      .prepare(
        `SELECT c.* FROM conversations c WHERE ${visibleConversation} ORDER BY number`,
      )
      .bind(ids),
    db
      .prepare(`SELECT m.id,m.number,m.kind,m.body,m.html,m.delivery,m.approval,m.actor,m.created_at
      FROM messages m JOIN conversations c USING(number) WHERE ${visibleConversation} ORDER BY m.number,m.created_at,m.id`)
      .bind(ids),
    db
      .prepare(
        `SELECT e.* FROM events e LEFT JOIN conversations c USING(number) WHERE ${visibleEvent} ORDER BY e.id`,
      )
      .bind(null, ids),
  ])
  return {
    conversations: conversations.results as Record<string, unknown>[],
    messages: messages.results as Record<string, unknown>[],
    events: events.results as Record<string, unknown>[],
  }
}
export function recordView(ctx: Context, number: number) {
  return eventStatement(
    ctx.env.DB,
    { actor: JSON.stringify(ctx.actor), now: ctx.now },
    number,
    'conversation_viewed',
    {},
  ).run()
}
export async function emitOnce(
  db: D1Database,
  actor: unknown,
  kind: string,
  number: number | null,
  payload: unknown,
  at: number,
  key?: string,
) {
  await db
    .prepare(
      'INSERT INTO events(kind,number,payload,actor,at,dedup_key) VALUES(?,?,?,?,?,?) ON CONFLICT(dedup_key) WHERE dedup_key IS NOT NULL DO NOTHING',
    )
    .bind(
      kind,
      number,
      JSON.stringify(payload),
      JSON.stringify(actor),
      at,
      key === undefined ? null : JSON.stringify([kind, key]),
    )
    .run()
}
export async function inboundBody(db: D1Database, number: number, id?: string) {
  return (
    (await db
      .prepare(
        "SELECT body FROM messages WHERE number=? AND kind='inbound' AND (? IS NULL OR id=?) ORDER BY created_at DESC LIMIT 1",
      )
      .bind(number, id ?? null, id ?? null)
      .first<string>('body')) ?? ''
  )
}
