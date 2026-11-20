import { forProject, extensionProducts } from '../extensions/registry'
import {
  can,
  inboxProductIds,
  visibleProductIds,
} from '../operators/project-access'
import { projectOperators } from '../operators/project-targets-store'
import { labelColors } from './label-colors-store'
import { inboxSort } from './inbox-location'
import { extensionContext } from '../extensions/context-usecase'
import { listOperators, type Operator } from '../operators/operators-store'
import type { Bindings } from '../settings/bindings'
import {
  conversationAliases,
  visibleConversations,
} from '../extensions/triage-usecase'
import { canonical } from '../extensions/aliases'
import { filterSchema } from './filters'
import {
  products,
  pageNumbers,
  rowDetails,
  fileMessages,
  labelChoices,
  awaitingApproval,
} from './console-store'

function labelManagementPath(
  operator: Operator,
  product: string,
  choices: { id: string }[],
) {
  if (product)
    return can(operator, 'manage', product).allowed
      ? '/settings/projects/' + encodeURIComponent(product) + '/labels'
      : undefined
  if (
    can(operator, 'global').allowed ||
    choices.some((p) => can(operator, 'manage', p.id).allowed)
  )
    return '/settings/projects'
}

export async function consoleFrame(
  env: Bindings,
  operator: Operator,
  path: string,
  query: Record<string, string> = {},
  now = Date.now(),
) {
  const product = query.product ?? ''
  const scope = visibleProductIds(operator)
  const chosen = product
    ? can(operator, 'read', product).allowed
      ? [product]
      : []
    : scope
  const [choices, people, memberships, labels, drafts, aliases, rows] =
    await Promise.all([
      products(
        env.DB,
        scope,
        path.startsWith('/settings'),
        product || undefined,
      ),
      listOperators(env.DB),
      projectOperators(env.DB, chosen),
      labelChoices(env.DB, chosen),
      awaitingApproval(env.DB),
      conversationAliases(env),
      visibleConversations(
        env,
        filterSchema.parse({ product, status: 'all' }),
        now,
        inboxProductIds(operator, { product }),
      ),
    ])
  const operators = people
    .filter(
      (person) => memberships.has(person.email) || (!product && scope === null),
    )
    .map((person) => ({
      ...person,
      projects: memberships.get(person.email)?.map((m) => m.product) ?? [],
    }))
  const draftNumbers = new Set(
    drafts.map((number) => canonical(aliases, number)),
  )
  const openNumbers = rows
    .filter((row) => row.status.kind === 'open')
    .map((row) => row.number)
  const approvalNumbers = new Set(
    rows
      .filter((row) => row.kind === 'inquiry' && draftNumbers.has(row.number))
      .map((row) => row.number),
  )
  const counts: Record<string, number> = {
    open: 0,
    pending: 0,
    closed: 0,
    spam: 0,
    mine: 0,
    received: 0,
    approval: approvalNumbers.size,
  }
  for (const r of rows) {
    if (r.kind === 'inquiry' || r.status.kind === 'received')
      counts[r.status.kind] = (counts[r.status.kind] ?? 0) + 1
    if (
      r.kind === 'inquiry' &&
      r.assignment.kind === 'assigned' &&
      r.assignment.to === operator.email
    )
      counts.mine++
  }
  return {
    labelDirectory: labelManagementPath(operator, product, choices),
    demoGithub: !!env.DEMO_GITHUB,
    path,
    query,
    operator,
    products: choices,
    operators,
    labels,
    labelColors: await labelColors(env.DB, chosen),
    approvalNumbers,
    openNumbers,
    counts,
    extensions: await Promise.all(
      (env.EXTENSIONS?.active ?? [])
        .filter((item) =>
          product
            ? forProject(item, product)
            : extensionProducts(item, scope)?.length !== 0,
        )
        .map(async (installed) => ({
          id: installed.extension.id,
          permitsMail: installed.extension.permissions.includes('send'),
          icon: installed.extension.icon,
          slots: installed.extension.panels?.map((p) => p.slot) ?? [],
          count: await installed.extension.navigationCount?.(
            extensionContext(
              {
                env,
                operator,
                actor: { kind: 'operator', id: operator.email },
                now,
                uuid: () => crypto.randomUUID(),
              },
              installed,
            ),
          ),
        })),
    ),
    now,
  }
}
export type ConsoleFrame = Awaited<ReturnType<typeof consoleFrame>>
export async function inboxOrder(
  env: Bindings,
  numbers: number[],
  query: Record<string, string>,
) {
  const limit = 20
  const pages = Math.max(1, Math.ceil(numbers.length / limit))
  const page = Math.min(
    pages,
    Math.max(
      1,
      Number.isSafeInteger(Number(query.page)) ? Number(query.page) : 1,
    ),
  )
  const aliases = await conversationAliases(env)
  const groups = Object.fromEntries(
    Object.keys(aliases).map((n) => [n, canonical(aliases, Number(n))]),
  )
  return {
    page,
    pages,
    total: numbers.length,
    numbers: await pageNumbers(
      env.DB,
      numbers,
      groups,
      inboxSort(query),
      (page - 1) * limit,
      limit,
    ),
  }
}
export async function inboxMetadata(
  env: Bindings,
  numbers: number[],
  operator: Operator,
  approval = false,
) {
  const aliases = await conversationAliases(env)
  const groups = Object.fromEntries(
    Object.keys(aliases).map((n) => [n, canonical(aliases, Number(n))]),
  )
  const rows = await rowDetails(
    env.DB,
    numbers,
    groups,
    operator.email,
    approval,
  )
  return new Map(rows.map((row) => [row.number, row]))
}
export async function threadFiles(
  env: Bindings,
  files: { key: string; filename: string; mime: string }[],
) {
  if (!files.length) return []
  const owners = new Map(
    (
      await fileMessages(
        env.DB,
        files.map((f) => f.key),
      )
    ).map((f) => [f.key, f.message]),
  )
  return Promise.all(
    files.map(async (f) => ({
      ...f,
      message: owners.get(f.key),
      size: (await env.RAW.head(f.key))?.size,
    })),
  )
}
