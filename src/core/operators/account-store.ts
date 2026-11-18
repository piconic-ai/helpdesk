export async function saveProfile(
  db: D1Database,
  email: string,
  name: string,
  avatar: string | null,
) {
  const [previous] = await db.batch<{ avatar_key: string | null }>([
    db
      .prepare('SELECT avatar_key FROM operator_profiles WHERE email=?')
      .bind(email),
    db
      .prepare(`INSERT INTO operator_profiles(email,display_name,avatar_key) VALUES(?,?,?)
      ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name,
      avatar_key=coalesce(excluded.avatar_key,operator_profiles.avatar_key)`)
      .bind(email, name, avatar),
  ])
  return previous.results[0]?.avatar_key
}

export async function saveSender(
  db: D1Database,
  product: string,
  name: string,
  showOperator: boolean,
) {
  const result = await db
    .prepare(`INSERT INTO product_senders(product,name,show_operator)
    SELECT id,?,? FROM products WHERE id=? ON CONFLICT(product) DO UPDATE SET name=excluded.name,show_operator=excluded.show_operator RETURNING product`)
    .bind(name, Number(showOperator), product)
    .first()
  return result !== null
}
