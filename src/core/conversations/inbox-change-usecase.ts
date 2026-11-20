import { requireConversations } from '../operators/project-targets-usecase'
import { canonical } from '../extensions/aliases'
import { conversationAliases } from '../extensions/triage-usecase'
import type { Context } from '../operations/catalog-usecase'
import {
  currentState,
  nextState,
  revisionKind,
  type InboxChange,
} from './inbox-changes'
import {
  originalChanges,
  selectedRows,
  saveChanges,
  type Change,
} from './inbox-change-store'

async function membership(c: Context, numbers: number[]) {
  await requireConversations(c, numbers, 'write')
  const aliases = await conversationAliases(c.env)
  const groups: Record<number, number[]> = {}
  for (const n of numbers) {
    const main = canonical(aliases, n)
    groups[main] = [main]
  }
  for (const alias of Object.keys(aliases).map(Number))
    groups[canonical(aliases, alias)]?.push(alias)
  return groups
}
async function apply(
  c: Context,
  changes: Change[],
  kind: string,
  label: string,
  groups: Record<number, number[]>,
) {
  const token = c.uuid()
  await saveChanges(
    c.env.DB,
    { actor: JSON.stringify(c.actor), now: c.now },
    token,
    changes,
    kind,
    label,
    groups,
  )
  return { token, count: changes.length }
}
export async function changeInbox(c: Context, input: InboxChange) {
  const groups = await membership(c, input.numbers)
  const kind = revisionKind(input),
    label = 'label' in input ? input.label : ''
  const rows = await selectedRows(c.env.DB, groups, kind, label)
  if (rows.length !== Object.keys(groups).length)
    throw new Error('Conversation not found')
  const changes = rows
    .map((row) => ({
      number: row.number,
      revision: row.revision,
      previous: currentState(row, input),
      next: nextState(row, input, c.now),
    }))
    .filter((x) => JSON.stringify(x.previous) !== JSON.stringify(x.next))
  return apply(c, changes, kind, label, groups)
}
export async function undoInbox(c: Context, input: { token: string }) {
  const originals = await originalChanges(
    c.env.DB,
    JSON.stringify(c.actor),
    input.token,
  )
  if (!originals.length) throw new Error('Unknown change')
  const state = originals[0]!.payload.next
  const kind = {
    assign: 'assigned',
    label: 'label_changed',
    status: 'status_changed',
  }[state.kind]
  const label = state.kind === 'label' ? state.label : ''
  const groups = await membership(
    c,
    originals.map((x) => x.number),
  )
  const rows = await selectedRows(c.env.DB, groups, kind, label)
  const current = new Map(rows.map((x) => [x.number, x]))
  const changes = originals.map((x) => {
    const row = current.get(x.number)
    if (!row || row.revision !== x.id)
      throw new Error('Conversation changed. Reload and retry.')
    return {
      number: x.number,
      revision: x.id,
      previous: x.payload.next,
      next: x.payload.previous,
    }
  })
  return apply(c, changes, kind, label, groups)
}
