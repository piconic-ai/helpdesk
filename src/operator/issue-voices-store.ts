export async function issueVoiceSummaries(db: D1Database, numbers: number[]) {
  if (!numbers.length) return []
  const { results } = await db
    .prepare(
      `SELECT c.number, COALESCE(NULLIF(c.contact_name,''),NULLIF(c.contact,''),'匿名') AS name,
       c.product,c.subject,NULLIF(c.contact,'') AS email,p.name AS productName
     FROM conversations c JOIN products p ON p.id=c.product
     WHERE c.number IN (SELECT value FROM json_each(?))
     ORDER BY c.created_at DESC,c.number DESC`,
    )
    .bind(JSON.stringify(numbers))
    .all<{
      number: number
      email: string | null
      name: string
      subject: string
      product: string
      productName: string
    }>()
  return results
}

export async function issueNoticeDrafts(db: D1Database, ids: string[]) {
  if (!ids.length) return []
  const { results } = await db
    .prepare(
      `SELECT m.id,m.number,m.body,c.contact AS email,c.subject,c.status
     FROM messages m JOIN conversations c ON c.number=m.number
     WHERE m.id IN (SELECT value FROM json_each(?))
       AND m.kind='outbound' AND m.delivery IN ('draft','awaiting_approval') AND m.approval IS NULL
       AND c.kind='inquiry'
     ORDER BY m.number`,
    )
    .bind(JSON.stringify(ids))
    .all<{
      id: string
      number: number
      body: string
      email: string
      subject: string
      status: string
    }>()
  return Promise.all(
    results.map(async (draft) => {
      // Bind each selection to the exact recipient and text the operator reviewed.
      const version = new TextEncoder().encode(
        JSON.stringify([draft.id, draft.email, draft.body]),
      )
      const digest = new Uint8Array(
        await crypto.subtle.digest('SHA-256', version),
      )
      return {
        ...draft,
        reviewKey: Array.from(digest, (byte) =>
          byte.toString(16).padStart(2, '0'),
        ).join(''),
        canApprove:
          Boolean(draft.email) && ['open', 'pending'].includes(draft.status),
      }
    }),
  )
}
export type IssueNoticeDraft = Awaited<
  ReturnType<typeof issueNoticeDrafts>
>[number]
