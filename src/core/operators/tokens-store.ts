import { z } from 'zod'
import { operatorSchema } from './operators-store'
import { tokenSummary, tokenAccess } from './tokens'

type Stored = z.infer<typeof tokenSummary> & { owner: string; digest: string }
export async function saveToken(db: D1Database, token: Stored) {
  const { id, owner, label, access, created_at, digest } = token
  await db.batch([
    db
      .prepare(
        'INSERT INTO api_tokens(id,owner,label,access,created_at,digest) VALUES(?,?,?,?,?,?)',
      )
      .bind(id, owner, label, access, created_at, digest),
    db
      .prepare(
        "INSERT INTO events(number,kind,actor,payload,at) VALUES(NULL,'token_issued',?,?,?)",
      )
      .bind(
        JSON.stringify({ kind: 'operator', id: owner }),
        JSON.stringify({ id, access }),
        created_at,
      ),
  ])
}
export async function tokenIdentity(db: D1Database, digest: string) {
  const row = await db
    .prepare(
      'SELECT t.id,t.access,o.email,o.role FROM api_tokens t JOIN operators o ON o.email=t.owner WHERE digest=?',
    )
    .bind(digest)
    .first()
  return (
    row &&
    operatorSchema.extend({ id: z.uuid(), access: tokenAccess }).parse(row)
  )
}
export async function ownedTokens(db: D1Database, owner: string) {
  const rows = await db
    .prepare(
      'SELECT id,label,access,created_at FROM api_tokens WHERE owner=? ORDER BY created_at DESC',
    )
    .bind(owner)
    .all()
  return tokenSummary.array().parse(rows.results)
}
export async function revokeToken(
  db: D1Database,
  owner: string,
  id: string,
  now: number,
) {
  const [deleted] = await db.batch([
    db.prepare('DELETE FROM api_tokens WHERE owner=? AND id=?').bind(owner, id),
    db
      .prepare(
        "INSERT INTO events(kind,actor,payload,at) SELECT 'token_revoked',?,?,? WHERE changes()=1",
      )
      .bind(
        JSON.stringify({ kind: 'operator', id: owner }),
        JSON.stringify({ id }),
        now,
      ),
  ])
  return deleted.meta.changes === 1
}
