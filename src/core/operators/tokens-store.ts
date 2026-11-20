import { z } from 'zod'
import { storedOperator, membershipJson } from './operators-store'
import { visibleProductIds } from './project-access'
import type { Operator } from './operators-store'
import { PermissionDenied } from '../operations/catalog'
import { tokenSummary, tokenAccess } from './tokens'

const storedProducts = z
  .string()
  .nullable()
  .transform((v): unknown => (v === null ? undefined : JSON.parse(v)))
  .pipe(tokenSummary.shape.products)

type Stored = z.infer<typeof tokenSummary> & { owner: string; digest: string }
export async function saveToken(db: D1Database, token: Stored) {
  const { id, owner, label, access, created_at, digest } = token
  const products = token.products ? JSON.stringify(token.products) : null
  const [saved] = await db.batch([
    db
      .prepare(
        `INSERT INTO api_tokens(id,owner,label,access,created_at,digest,products)
        SELECT ?1,?2,?3,?4,?5,?6,?7 WHERE NOT EXISTS(
          SELECT 1 FROM json_each(?7) selected WHERE NOT EXISTS(
            SELECT 1 FROM products p JOIN product_lifecycle l ON l.product=p.id AND l.archived_at IS NULL
            JOIN operators o ON o.email=?2
            WHERE p.id=selected.value AND (o.role='admin' OR EXISTS(
              SELECT 1 FROM product_members m WHERE m.product=p.id AND m.email=o.email))
          )
        )`,
      )
      .bind(id, owner, label, access, created_at, digest, products),
    db
      .prepare(
        "INSERT INTO events(number,kind,actor,payload,at) SELECT NULL,'token_issued',?,?,? WHERE changes()=1",
      )
      .bind(
        JSON.stringify({ kind: 'operator', id: owner }),
        JSON.stringify({ id, access, products: token.products }),
        created_at,
      ),
  ])
  if (!saved.meta.changes)
    throw new PermissionDenied('Project scope exceeds token owner access')
}
export async function tokenIdentity(db: D1Database, digest: string) {
  const row = await db
    .prepare(
      `SELECT t.id,t.access,t.products,o.email,o.role,${membershipJson} AS memberships
        FROM api_tokens t JOIN operators o ON o.email=t.owner WHERE digest=?`,
    )
    .bind(digest)
    .first()
  return (
    row &&
    storedOperator
      .extend({ id: z.uuid(), access: tokenAccess, products: storedProducts })
      .parse(row)
  )
}
export async function ownedTokens(db: D1Database, owner: string) {
  const rows = await db
    .prepare(
      'SELECT id,label,access,created_at,products FROM api_tokens WHERE owner=? ORDER BY created_at DESC',
    )
    .bind(owner)
    .all()
  return tokenSummary
    .extend({ products: storedProducts })
    .array()
    .parse(rows.results)
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

export async function tokenProjects(db: D1Database, operator: Operator) {
  const ids = visibleProductIds(operator)
  const rows = await db
    .prepare(`SELECT p.id,p.name,l.archived_at AS archivedAt FROM products p JOIN product_lifecycle l ON l.product=p.id
    WHERE ?1 IS NULL OR p.id IN (SELECT value FROM json_each(?1))
    ORDER BY p.name,p.id`)
    .bind(ids === null ? null : JSON.stringify(ids))
    .all()
  return z
    .object({
      id: z.string(),
      name: z.string(),
      archivedAt: z.number().nullable(),
    })
    .array()
    .parse(rows.results)
}
