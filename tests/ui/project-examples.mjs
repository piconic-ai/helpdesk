// Six upcoming editions and 22 past ones join the two support projects.
export async function seedConferenceProjects(db) {
  const statements = []
  for (let i = 0; i < 28; i++) {
    const year = 2032 - i
    const id = 'conference-' + year
    statements.push(
      db
        .prepare('INSERT INTO products(id,name) VALUES(?,?)')
        .bind(id, '開発者カンファレンス ' + year),
      db
        .prepare('INSERT INTO mailboxes(address,product) VALUES(?,?)')
        .bind(id + '@example.com', id),
      db
        .prepare(
          'INSERT INTO product_lifecycle(product,archived_at,public_help) VALUES(?,?,0) ON CONFLICT(product) DO UPDATE SET archived_at=excluded.archived_at',
        )
        .bind(id, i < 6 ? null : Date.UTC(year, 11, 31)),
    )
  }
  await db.batch(statements)
}
