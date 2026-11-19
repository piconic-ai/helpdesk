import { z } from 'zod'

export async function readProductIcon(db: D1Database, id: string) {
  const row = await db
    .prepare(
      'SELECT p.name,i.emoji,i.image_key FROM products p LEFT JOIN product_icons i ON i.product=p.id WHERE p.id=?',
    )
    .bind(id)
    .first()
  return z
    .object({
      name: z.string(),
      emoji: z.string().nullable(),
      image_key: z.uuid().nullable(),
    })
    .nullable()
    .parse(row)
}

export async function replaceProductIcon(
  db: D1Database,
  product: string,
  emoji: string | null,
  key: string | null,
) {
  const replace =
    emoji || key
      ? db
          .prepare(
            'INSERT INTO product_icons(product,emoji,image_key) VALUES(?,?,?) ON CONFLICT(product) DO UPDATE SET emoji=excluded.emoji,image_key=excluded.image_key',
          )
          .bind(product, emoji, key)
      : db.prepare('DELETE FROM product_icons WHERE product=?').bind(product)
  const [previous] = await db.batch<{ image_key: string | null }>([
    db
      .prepare('SELECT image_key FROM product_icons WHERE product=?')
      .bind(product),
    replace,
  ])
  return previous.results[0]?.image_key
}
