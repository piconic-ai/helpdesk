import { replyDelay } from '../settings/reply-delay'
import { projectRole } from './project-access'
import { z } from 'zod'
export const operatorSchema = z.object({
  email: z.email(),
  role: projectRole,
  memberships: z.record(z.string(), projectRole).optional(),
  tokenProducts: z.array(z.string()).optional(),
})
export type Operator = z.infer<typeof operatorSchema>
export const membershipJson =
  '(SELECT json_group_object(m.product,m.role) FROM product_members m WHERE m.email=o.email)'
export const storedOperator = operatorSchema.extend({
  memberships: z
    .string()
    .transform((v): unknown => JSON.parse(v))
    .pipe(z.record(z.string(), projectRole)),
})
export async function registerOperator(db: D1Database, email: string) {
  const identity = db
    .prepare(
      `SELECT o.email,o.role,${membershipJson} AS memberships FROM operators o WHERE o.email=?`,
    )
    .bind(email)
  const known = await identity.first()
  if (known) return storedOperator.parse(known)
  const [, , , , row] = await db.batch([
    db
      .prepare(
        "INSERT INTO operators SELECT ?, CASE WHEN EXISTS(SELECT 1 FROM operators) THEN 'agent' ELSE 'admin' END ON CONFLICT(email) DO NOTHING",
      )
      .bind(email),
    db
      .prepare(`INSERT INTO product_members(product,email,role)
      SELECT product,email,role FROM product_invitations WHERE email=?
      ON CONFLICT(product,email) DO NOTHING`)
      .bind(email),
    db
      .prepare(`INSERT INTO events(kind,actor,payload,at)
      SELECT 'project_member_added',json_object('kind','operator','id',email),json_object('product',product,'email',email,'role',role),?
      FROM product_invitations WHERE email=?`)
      .bind(Date.now(), email),
    db.prepare('DELETE FROM product_invitations WHERE email=?').bind(email),
    identity,
  ])
  return storedOperator.parse(row.results[0])
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
