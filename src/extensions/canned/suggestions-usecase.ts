import { z } from 'zod'
import type { ExtensionContext } from '../../core/extensions/extension'
import type { JudgmentModel } from '../../core/extensions/article-judgment'
import { cachedTemplates } from './suggestion-store'
import {
  type CannedCandidate,
  type CannedChoice,
  matchTemplates,
  rankTemplates,
} from './suggestions'
import { fillTemplate, savedTemplates } from './templates'

async function judgeTemplates(
  ctx: ExtensionContext,
  contact: { product: string; name: string; subject: string },
  body: string,
  candidates: CannedCandidate[],
  labels: string[],
) {
  if (!candidates.length) return []
  try {
    const settings = await ctx.resource(
      'chat',
      'recommendationSettings',
      contact.product,
    )
    const background = z
      .object({ backgroundModel: z.enum(['clef', 'clef-flash']) })
      .safeParse(settings)
    const model: JudgmentModel =
      background.data?.backgroundModel ?? 'clef-flash'
    const question = contact.subject + '\n\n' + body
    const batches: CannedCandidate[][] = []
    for (let i = 0; i < candidates.length; i += 20)
      batches.push(candidates.slice(i, i + 20))
    const scores = await Promise.all(
      batches.map((batch) =>
        ctx.judge(model, question, batch, contact.name, 'canned'),
      ),
    )
    return rankTemplates(scores.flatMap((batch) => batch.scores))
  } catch {
    return matchTemplates(candidates, contact.subject, labels)
  }
}

export async function replyTemplateChoices(
  db: D1Database,
  ctx: ExtensionContext,
  target: {
    number: number
    inbound: { id: string; number: number }
    labels: string[]
  },
): Promise<CannedChoice[] | null> {
  const contact = await ctx.contact(target.number)
  const templates = await savedTemplates(ctx, contact.product)
  const rows = await cachedTemplates(
    db,
    { number: target.number, inbound: target.inbound.id, now: ctx.now },
    async () => {
      const candidates = [...templates].map(([id, item]): CannedCandidate => ({
        kind: 'canned',
        id,
        title: item.name,
        summary: item.body,
      }))
      const body = await ctx.inboundBody(
        target.inbound.number,
        target.inbound.id,
      )
      return judgeTemplates(ctx, contact, body, candidates, target.labels)
    },
  )
  if (!rows.length) return null
  return rows.flatMap((row) => {
    const item = row.template && templates.get(row.template)
    return row.template && item
      ? [
          {
            kind: 'canned',
            id: row.template,
            title: item.name,
            body: fillTemplate(item.body, contact),
            presentation: row.id,
          },
        ]
      : []
  })
}

export { cannedCounts, cannedUse, recordCannedUse } from './suggestion-store'
