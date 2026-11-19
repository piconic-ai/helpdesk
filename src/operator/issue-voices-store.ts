export async function issueVoiceSummaries(db: D1Database, numbers: number[]) {
  if (!numbers.length) return []
  const { results } = await db
    .prepare(
      `SELECT c.number, COALESCE(NULLIF(c.contact_name,''),NULLIF(c.contact,''),'匿名') AS name,
       c.subject,p.name AS productName
     FROM conversations c JOIN products p ON p.id=c.product
     WHERE c.number IN (SELECT value FROM json_each(?))
     ORDER BY c.created_at DESC,c.number DESC`,
    )
    .bind(JSON.stringify(numbers))
    .all<{
      number: number
      name: string
      subject: string
      productName: string
    }>()
  return results
}
