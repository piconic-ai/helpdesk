import { z } from 'zod'
export async function readPublicProduct(db: D1Database, product: string) {
  const row = await db
    .prepare(
      "SELECT p.id,p.name, (SELECT value FROM public_help_settings WHERE product=p.id AND setting='response_time') AS responseTime, (SELECT address FROM mailboxes WHERE product=p.id ORDER BY address LIMIT 1) AS mailbox FROM products p WHERE id=?",
    )
    .bind(product)
    .first()
  return z
    .object({
      id: z.string(),
      name: z.string(),
      mailbox: z.email().nullable(),
      responseTime: z.string().nullable(),
    })
    .nullable()
    .parse(row)
}

export async function hostedProducts(
  db: D1Database,
  origin: string,
  configured: string[],
) {
  const rows = await db
    .prepare(`SELECT p.id,p.name,(SELECT address FROM mailboxes WHERE product=p.id ORDER BY address LIMIT 1) AS mailbox FROM products p
    LEFT JOIN hosted_intakes h ON h.product=p.id
    WHERE h.origin=? OR p.id IN (SELECT value FROM json_each(?)) ORDER BY p.name,p.id`)
    .bind(origin, JSON.stringify(configured))
    .all()
  return z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        mailbox: z.email().nullable(),
      }),
    )
    .parse(rows.results)
}
