import { z } from 'zod'
import type { Audit } from '../conversations/conversations-store'

export async function chatEmbedSites(db: D1Database, product: string) {
  const rows = await db
    .prepare(
      "SELECT setting FROM public_help_settings WHERE product=? AND setting<>'response_time' AND value='enabled' ORDER BY setting",
    )
    .bind(product)
    .all()
  return z
    .array(z.object({ setting: z.string() }))
    .parse(rows.results)
    .map((r) => r.setting)
}

export async function readChatWidgetValue(db: D1Database, product: string) {
  return db
    .prepare(
      "SELECT value FROM public_help_settings WHERE product=? AND setting='chat_widget'",
    )
    .bind(product)
    .first<string>('value')
}

export async function savePublicSetting(
  db: D1Database,
  product: string,
  setting: string,
  value: string,
  changeId: string,
  audit: Audit,
) {
  const [change] = await db.batch([
    db
      .prepare(`INSERT INTO public_help_settings(product,setting,value,change_id,actor)
      SELECT ?,?,?,?,? WHERE ?<>COALESCE((SELECT value FROM public_help_settings WHERE product=? AND setting=?),'')
      ON CONFLICT(product,setting) DO UPDATE SET previous=value, value=excluded.value, change_id=excluded.change_id, actor=excluded.actor
      RETURNING change_id`)
      .bind(
        product,
        setting,
        value,
        changeId,
        audit.actor,
        value,
        product,
        setting,
      ),
    db
      .prepare(
        "INSERT INTO events(kind,actor,payload,at) SELECT 'public_setting_updated',?,?,? WHERE changes()=1",
      )
      .bind(
        audit.actor,
        JSON.stringify({ product, setting, value }),
        audit.now,
      ),
  ])
  return change.results.length ? changeId : ''
}

export async function restorePublicSetting(
  db: D1Database,
  changeId: string,
  audit: Audit,
  authorize: (product: string) => void = () => {},
) {
  const product = await db
    .prepare(
      'SELECT product FROM public_help_settings WHERE change_id=? AND actor=?',
    )
    .bind(changeId, audit.actor)
    .first<string>('product')
  if (!product) return false
  authorize(product)
  const [restored] = await db.batch([
    db
      .prepare(
        "UPDATE public_help_settings SET value=previous, previous='', change_id=NULL WHERE change_id=? AND actor=? RETURNING product",
      )
      .bind(changeId, audit.actor),
    db
      .prepare(
        "INSERT INTO events(kind,actor,payload,at) SELECT 'public_setting_restored',?,?,? WHERE changes()=1",
      )
      .bind(audit.actor, JSON.stringify({ changeId }), audit.now),
  ])
  return restored.results.length > 0
}
