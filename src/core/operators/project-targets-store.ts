import { scopeBinding, type ProductScope } from './project-permission'

export function conversationProducts(
  db: D1Database,
  numbers: readonly number[],
) {
  return db
    .prepare(
      'SELECT product FROM conversations WHERE number IN (SELECT value FROM json_each(?))',
    )
    .bind(JSON.stringify(numbers))
    .all<{ product: string }>()
}

export function mediaProduct(
  db: D1Database,
  kind: 'message' | 'attachment',
  id: string,
) {
  const lookup =
    kind === 'message'
      ? 'WHERE m.id=?'
      : 'JOIN attachments a ON a.message=m.id WHERE a.key=?'
  return db
    .prepare(
      'SELECT c.product FROM conversations c JOIN messages m USING(number) ' +
        lookup,
    )
    .bind(id)
    .first<string>('product')
}

export async function accessibleNumbers(
  db: D1Database,
  numbers: readonly number[],
  products: ProductScope,
) {
  if (!products || !numbers.length) return new Set(numbers)
  const rows = await db
    .prepare(
      'SELECT number FROM conversations WHERE number IN (SELECT value FROM json_each(?)) AND product IN (SELECT value FROM json_each(?))',
    )
    .bind(JSON.stringify(numbers), JSON.stringify(products))
    .all<{ number: number }>()
  return new Set(rows.results.map((r) => r.number))
}

export async function isProjectAssignee(
  db: D1Database,
  number: number,
  email: string,
) {
  return !!(await db
    .prepare(
      'SELECT 1 AS member FROM conversations c JOIN product_members pm USING(product) WHERE c.number=? AND pm.email=?',
    )
    .bind(number, email)
    .first('member'))
}

export async function projectOperators(db: D1Database, products: ProductScope) {
  const rows = await db
    .prepare(
      'SELECT product,email FROM product_members WHERE ?1 IS NULL OR product IN (SELECT value FROM json_each(?1))',
    )
    .bind(scopeBinding(products))
    .all<{ product: string; email: string }>()
  return Map.groupBy(rows.results, (row) => row.email)
}
