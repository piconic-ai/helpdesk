import type { ProductScope } from '../operators/project-targets-store'
import type { filterSchema } from '../conversations/filters'
import type { Bindings } from '../settings/bindings'
import { extensionStorage } from './extension-store'
import { canonical, type Aliases } from './aliases'
import { listConversations, detail } from '../conversations/conversations-store'
import type { z } from 'zod'
import { setLabel } from '../operations/operator-store'
import type { Audit } from '../conversations/conversations-store'

type Env = Pick<Bindings, 'DB' | 'EXTENSIONS'>
export async function conversationAliases(env: Env) {
  const aliases: Aliases = {}
  for (const { extension } of env.EXTENSIONS?.active ?? []) {
    if (extension.aliases)
      Object.assign(
        aliases,
        await extension.aliases(extensionStorage(env.DB, extension.id)),
      )
  }
  return aliases
}
export async function visibleConversations(
  env: Env,
  filter: z.infer<typeof filterSchema>,
  now: number,
  scope: ProductScope = null,
) {
  const hidden = new Set<number>()
  for (const { extension } of env.EXTENSIONS?.active ?? []) {
    if (extension.hidden)
      for (const n of await extension.hidden(
        extensionStorage(env.DB, extension.id),
        now,
      ))
        hidden.add(n)
  }
  const aliases = await conversationAliases(env)
  const groups = Object.fromEntries(
    Object.keys(aliases).map((n) => [n, canonical(aliases, Number(n))]),
  )
  return (await listConversations(env.DB, filter, groups, scope)).filter(
    (c) => !hidden.has(c.number) && aliases[c.number] === undefined,
  )
}
async function conversationGroup(env: Env, number: number) {
  const aliases = await conversationAliases(env)
  const main = canonical(aliases, number)
  const members = Object.keys(aliases)
    .map(Number)
    .filter((alias) => canonical(aliases, alias) === main)
  return { main, numbers: [main, ...members] }
}
export async function groupedDetail(
  env: Env,
  number: number,
  scope: ProductScope = null,
) {
  const group = await conversationGroup(env, number)
  return detail(env.DB, group.main, group.numbers, scope)
}
export async function changeGroupLabel(
  env: Env,
  audit: Audit,
  input: { number: number; label: string; action: 'add' | 'remove' },
) {
  const group = await conversationGroup(env, input.number)
  return setLabel(
    env.DB,
    audit,
    { ...input, number: group.main },
    group.numbers,
  )
}
