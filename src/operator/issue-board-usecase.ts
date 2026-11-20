import type { ExtensionContext } from '../core/extensions/extension'
import { issueBoard } from '../extensions/issues/board-usecase'
import { configuredRepository } from '../extensions/issues/issues-usecase'
import { issueKey } from '../extensions/issues/outcomes'
import { issueNoticeDrafts, issueVoiceSummaries } from './issue-voices-store'

export async function issueCreationChoices(
  db: D1Database,
  api: ExtensionContext,
  products: { id: string }[],
) {
  if (!api.secret('GITHUB_TOKEN')) return []
  const configured = await Promise.all(
    products.map(
      async ({ id }) => [id, await configuredRepository(api, id)] as const,
    ),
  )
  const repos = new Map(configured)
  const available = (await api.voices()).filter((voice) =>
    repos.get(voice.product),
  )
  return issueVoiceSummaries(
    db,
    available.map((voice) => voice.number),
  )
}

export async function issueDetail(
  db: D1Database,
  api: ExtensionContext,
  ref: { repository: string; issue: number },
  product?: string,
) {
  const key = issueKey(ref.repository, ref.issue)
  const rows = (await issueBoard(api)).filter(
    (r) =>
      issueKey(r.repository, r.issue) === key &&
      (!product || r.product === product),
  )
  if (!rows.length) return
  const voices = rows.flatMap((row) => row.voices)
  const [contacts, drafts] = await Promise.all([
    issueVoiceSummaries(
      db,
      voices.map((v) => v.number),
    ),
    issueNoticeDrafts(
      db,
      rows[0].state === 'closed'
        ? voices
            .filter((v) => !v.informed && v.delivery === 'reply_drafted')
            .map((v) => v.message)
        : [],
    ),
  ])
  return { rows, contacts: new Map(contacts.map((v) => [v.number, v])), drafts }
}
