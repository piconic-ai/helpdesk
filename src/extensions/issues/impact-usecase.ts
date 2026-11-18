import type { ExtensionContext } from '../../core/extensions/extension'
import { proportions } from './outcomes'
import { loadIssueState } from './board-usecase'
import { linked, linkPrefix } from './issues'
import { z } from 'zod'
import { issueDestination } from './issues-usecase'
const input = z.object({
  product: z.string().min(1),
  issue: z.coerce.number().int().positive(),
  days: z.coerce.number().int().min(1).max(365).default(30),
})
const counts = z.object({
  total: z.number(),
  linked: z.number(),
  share: z.number().nullable(),
})
export const impactOutput = z.object({
  closedAt: z.number().nullable(),
  before: counts,
  after: counts,
  caveat: z.string(),
})
export const impactOperation = {
  name: 'impact',
  description:
    'Compare the share of conversations linked to this issue before and after closure (estimate)',
  permission: 'read' as const,
  input,
  output: impactOutput,
  async run(ctx: ExtensionContext, args: unknown) {
    const { product, issue, days } = input.parse(args)
    const { repo } = await issueDestination(ctx, product)
    const [voices, links, metadata] = await Promise.all([
      ctx.voices(),
      ctx.list(linkPrefix(repo, issue)),
      loadIssueState(ctx, repo, issue),
    ])
    const numbers = new Set(links.map((row) => linked.parse(row.value).number))
    const closedAt = metadata?.closedAt ?? null
    return {
      closedAt,
      ...proportions(
        voices,
        numbers,
        product,
        closedAt ?? ctx.now,
        ctx.now,
        days,
      ),
      caveat:
        '目安。会話数が少ない場合や修正後の観測期間が短い場合、割合は大きく変動します。',
    }
  },
}
