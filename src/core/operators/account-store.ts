import type { ReplyDelay } from '../settings/reply-delay'
import type { MailLanguage } from '../settings/mail-language'

export async function saveProfile(
  db: D1Database,
  email: string,
  name: string,
  avatar: string | null,
  zone?: string,
  delay?: ReplyDelay,
) {
  const [previous] = await db.batch<{ avatar_key: string | null }>([
    db
      .prepare('SELECT avatar_key FROM operator_profiles WHERE email=?')
      .bind(email),
    db
      .prepare(`INSERT INTO operator_profiles(email,display_name,avatar_key,time_zone,reply_delay) VALUES(?1,?2,?3,coalesce(?4,'Asia/Tokyo'),coalesce(?5,10))
      ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name,
      avatar_key=coalesce(excluded.avatar_key,operator_profiles.avatar_key),time_zone=coalesce(?4,operator_profiles.time_zone), reply_delay=coalesce(?5,operator_profiles.reply_delay)`)
      .bind(email, name, avatar, zone ?? null, delay ?? null),
  ])
  return previous.results[0]?.avatar_key
}

export async function saveSender(
  db: D1Database,
  product: string,
  name: string,
  showOperator: boolean,
  language?: MailLanguage,
  minimumDelay?: ReplyDelay,
) {
  const result = await db
    .prepare(`INSERT INTO product_senders(product,name,show_operator,language,minimum_reply_delay)
    SELECT id,?1,?2,coalesce(?3,'ja'),coalesce(?5,10) FROM products WHERE id=?4 ON CONFLICT(product) DO UPDATE SET name=excluded.name,show_operator=excluded.show_operator,language=coalesce(?3,product_senders.language),minimum_reply_delay=coalesce(?5,product_senders.minimum_reply_delay) RETURNING product`)
    .bind(
      name,
      Number(showOperator),
      language ?? null,
      product,
      minimumDelay ?? null,
    )
    .first()
  return result !== null
}
