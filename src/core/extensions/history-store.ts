import { z } from 'zod'
import type { ExtensionEvent } from './extension'
import { eventStatement } from '../conversations/conversations-store'
import type { Context } from '../operations/catalog-usecase'
export async function history(
  db: D1Database,
  kind?: string,
): Promise<ExtensionEvent[]> {
  const select =
    'SELECT e.*,c.product FROM events e LEFT JOIN conversations c USING(number)'
  const statement =
    kind === undefined
      ? db.prepare(select + ' ORDER BY e.id')
      : db.prepare(select + ' WHERE e.kind=? ORDER BY e.id').bind(kind)
  const result = await statement.all()
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
export async function snapshot(db: D1Database) {
  const [conversations, messages, events] = await db.batch([
    db.prepare('SELECT * FROM conversations ORDER BY number'),
    db.prepare(
      'SELECT id,number,kind,body,html,delivery,approval,actor,created_at FROM messages ORDER BY number,created_at,id',
    ),
    db.prepare('SELECT * FROM events ORDER BY id'),
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
