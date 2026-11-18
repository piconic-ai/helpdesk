import { z } from 'zod'
export async function readPublicProduct(db: D1Database, product: string) {
  const row = await db
    .prepare(
      'SELECT p.name, (SELECT address FROM mailboxes WHERE product=p.id ORDER BY address LIMIT 1) AS mailbox FROM products p WHERE id=?',
    )
    .bind(product)
    .first()
  return z
    .object({ name: z.string(), mailbox: z.email().nullable() })
    .nullable()
    .parse(row)
}
