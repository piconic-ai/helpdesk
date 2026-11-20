import { z } from 'zod'
import { projectRole, type ProjectRole } from './project-access'
import type { Audit } from '../conversations/conversations-store'

const nameSql =
  "coalesce(nullif(p.display_name,''), substr(o.email,1,instr(o.email,'@')-1))"
const person = z.object({
  email: z.email(),
  displayName: z.string(),
  avatarKey: z.string().nullable(),
})
const rosterRow = person.extend({
  role: projectRole,
  assigned: z.number().int(),
  invited: z.union([z.literal(0), z.literal(1)]).transform(Boolean),
})

export async function readMembers(db: D1Database, product: string) {
  const rows = await db
    .prepare(`
    SELECT m.email,${nameSql} AS displayName,p.avatar_key AS avatarKey,m.role,
      (SELECT COUNT(*) FROM conversations c WHERE c.product=m.product AND c.assignee=m.email) AS assigned,0 AS invited
    FROM product_members m JOIN operators o ON o.email=m.email
    LEFT JOIN operator_profiles p ON p.email=m.email WHERE m.product=?1
    UNION ALL
    SELECT email,email,NULL,role,0,1 FROM product_invitations WHERE product=?1
    ORDER BY invited,displayName,email`)
    .bind(product)
    .all()
  return rosterRow.array().parse(rows.results)
}

export async function searchPeople(
  db: D1Database,
  product: string,
  query: string,
) {
  const rows = await db
    .prepare(`
    SELECT o.email,${nameSql} AS displayName,p.avatar_key AS avatarKey
    FROM operators o LEFT JOIN operator_profiles p ON p.email=o.email
    WHERE (instr(lower(${nameSql}),lower(?1))>0 OR instr(lower(o.email),lower(?1))>0)
    AND NOT EXISTS(SELECT 1 FROM product_members m WHERE m.product=?2 AND m.email=o.email)
    ORDER BY displayName,o.email LIMIT 25`)
    .bind(query, product)
    .all()
  return person.array().parse(rows.results)
}

type MemberChange = { product: string; email: string; role: ProjectRole }

function auditChange(
  db: D1Database,
  audit: Audit,
  kind: string,
  input: { product: string; email: string },
) {
  return db
    .prepare(
      'INSERT INTO events(kind,actor,payload,at) SELECT ?,?,?,? WHERE changes()=1',
    )
    .bind(kind, audit.actor, JSON.stringify(input), audit.now)
}

export async function saveMember(
  db: D1Database,
  audit: Audit,
  input: MemberChange,
) {
  const { product, email, role } = input
  await db.batch([
    db
      .prepare(
        'UPDATE product_members SET role=? WHERE product=? AND email=? AND role<>?',
      )
      .bind(role, product, email, role),
    auditChange(db, audit, 'project_member_role_changed', input),
    db
      .prepare(`INSERT INTO product_members(product,email,role)
      SELECT ?,email,? FROM operators WHERE email=? ON CONFLICT(product,email) DO NOTHING`)
      .bind(product, role, email),
    auditChange(db, audit, 'project_member_added', input),
    db
      .prepare(`INSERT INTO product_invitations(product,email,role)
      SELECT ?1,?2,?3 WHERE NOT EXISTS(SELECT 1 FROM operators WHERE email=?2)
      ON CONFLICT(product,email) DO UPDATE SET role=excluded.role WHERE role<>excluded.role`)
      .bind(product, email, role),
    auditChange(db, audit, 'project_member_invited', input),
  ])
}

export async function removeMember(
  db: D1Database,
  audit: Audit,
  input: { product: string; email: string; expectedAssigned?: number },
) {
  const { product, email, expectedAssigned } = input
  const [member, , invite] = await db.batch([
    db
      .prepare(`DELETE FROM product_members WHERE product=?1 AND email=?2 AND
      (?3 IS NULL OR ?3=(SELECT count(*) FROM conversations WHERE product=?1 AND assignee=?2))`)
      .bind(product, email, expectedAssigned ?? null),
    auditChange(db, audit, 'project_member_removed', input),
    db
      .prepare('DELETE FROM product_invitations WHERE product=? AND email=?')
      .bind(product, email),
    auditChange(db, audit, 'project_invitation_removed', input),
  ])
  if (!member.meta.changes && !invite.meta.changes)
    throw new Error('Project member or assignment count changed')
}
