import { replyDelay } from '../settings/reply-delay'
import { z } from 'zod'
export const operatorSchema = z.object({
  email: z.email(),
  role: z.enum(['admin', 'agent']),
})
export type Operator = z.infer<typeof operatorSchema>
export async function registerOperator(db: D1Database, email: string) {
  const [, row] = await db.batch([
    db
      .prepare(
        "INSERT INTO operators SELECT ?, CASE WHEN EXISTS(SELECT 1 FROM operators) THEN 'agent' ELSE 'admin' END ON CONFLICT(email) DO NOTHING",
      )
      .bind(email),
    db.prepare('SELECT email,role FROM operators WHERE email=?').bind(email),
  ])
  return operatorSchema.parse(row.results[0])
}

export async function listOperators(db: D1Database) {
  const rows = await db
    .prepare(
      "SELECT o.email, o.role,coalesce(p.time_zone,'Asia/Tokyo') AS timeZone,coalesce(p.reply_delay,10) AS replyDelay,p.avatar_key AS avatarKey, coalesce(nullif(p.display_name,''), substr(o.email,1,instr(o.email,'@')-1)) AS displayName FROM operators o LEFT JOIN operator_profiles p ON p.email=o.email ORDER BY displayName,o.email",
    )
    .all()
  return operatorSchema
    .extend({
      timeZone: z.string(),
      replyDelay,
      displayName: z.string(),
      avatarKey: z.string().nullable(),
    })
    .array()
    .parse(rows.results)
}
