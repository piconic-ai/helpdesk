import { z } from 'zod'

export async function cachedTemplates(
  db: D1Database,
  input: { number: number; inbound: string; now: number },
  rank: () => Promise<string[]>,
) {
  const id = crypto.randomUUID()
  const claimed = await db
    .prepare(`INSERT INTO canned_presentations(id,number,inbound,claimed_at)
    VALUES(?1,?2,?3,?4)
    ON CONFLICT(number,inbound) DO UPDATE SET id=excluded.id,claimed_at=excluded.claimed_at
    WHERE ready=0 AND claimed_at < ?4 - 15000
    RETURNING id`)
    .bind(id, input.number, input.inbound, input.now)
    .first<string>('id')
  if (claimed) {
    try {
      const ids = await rank()
      await db.batch([
        ...ids.map((template, position) =>
          db
            .prepare(`INSERT INTO canned_impressions(presentation,template,position)
            SELECT id,?2,?3 FROM canned_presentations WHERE id=?1`)
            .bind(id, template, position),
        ),
        db
          .prepare('UPDATE canned_presentations SET ready=1 WHERE id=?')
          .bind(id),
      ])
    } catch (error) {
      await db
        .prepare('DELETE FROM canned_presentations WHERE id=? AND ready=0')
        .bind(id)
        .run()
        .catch(() => undefined)
      throw error
    }
  }
  const result = await db
    .prepare(`SELECT p.id, i.template FROM canned_presentations p
    LEFT JOIN canned_impressions i ON i.presentation=p.id
    WHERE p.number=? AND p.inbound=? AND p.ready=1 ORDER BY i.position`)
    .bind(input.number, input.inbound)
    .all()
  return z
    .array(z.object({ id: z.uuid(), template: z.string().nullable() }))
    .parse(result.results)
}

export const cannedUse = z.object({
  id: z.uuid(),
  presentation: z.uuid(),
  template: z.string().min(1).max(100),
  action: z.enum(['selected', 'unchanged', 'edited']),
})

export async function recordCannedUse(
  db: D1Database,
  number: number,
  operator: string,
  use: z.infer<typeof cannedUse>,
) {
  const accepted = await db
    .prepare(`INSERT INTO canned_uses(id,presentation,template,operator,edited)
    SELECT ?1,p.id,i.template,?4,?5 FROM canned_presentations p JOIN canned_impressions i ON i.presentation=p.id
    WHERE p.id=?2 AND i.template=?3 AND p.number=?6
    ON CONFLICT(id) DO UPDATE SET edited=coalesce(canned_uses.edited,excluded.edited)
    WHERE canned_uses.presentation=excluded.presentation AND canned_uses.template=excluded.template
      AND canned_uses.operator=excluded.operator
    RETURNING id`)
    .bind(
      use.id,
      use.presentation,
      use.template,
      operator,
      use.action === 'selected' ? null : Number(use.action === 'edited'),
      number,
    )
    .first<string>('id')
  return Boolean(accepted)
}

export async function cannedCounts(db: D1Database) {
  const result = await db
    .prepare(`SELECT i.template, count(DISTINCT i.presentation) AS shown,
    count(u.id) AS used, sum(u.edited) AS edited, count(u.edited) AS submitted
    FROM canned_impressions i LEFT JOIN canned_uses u USING(presentation,template)
    GROUP BY i.template`)
    .all()
  const counts = z
    .object({
      template: z.string(),
      shown: z.number(),
      used: z.number(),
      edited: z.number().nullable(),
      submitted: z.number(),
    })
    .array()
    .parse(result.results)
  return new Map(counts.map((item) => [item.template, item]))
}
