import { can } from '../operators/project-access'
import { actingProducts, requireProduct } from '../operators/project-permission'
import { requireConversations } from '../operators/project-targets-usecase'
import {
  accessibleNumbers,
  isProjectAssignee,
} from '../operators/project-targets-store'
import {
  presentSuggestion,
  previousSuggestion,
  reactToSuggestion,
  suggestionResolution,
} from '../suggestions/suggestion-store'
import { changeGroupLabel } from './triage-usecase'
import { setAssignment } from '../operations/operator-store'
import {
  history,
  snapshot,
  snapshotCounts,
  inboundBody,
  emitOnce,
  receivedVoices,
} from './history-store'
import { queueStanding } from '../outbound/reply-usecase'
import { changeFeedback } from '../conversations/feedback-usecase'
import { coreOperations } from '../operations/catalog-usecase'
import type { Context } from '../operations/catalog-usecase'
import {
  addInboundMessage,
  openIntake,
  saveDraft,
  templateContact,
} from '../intakes/intake-usecase'
import type { Installed } from './registry'
import type { Permission, ExtensionContext } from './extension'
import { extensionStorage } from './extension-store'
import { externalRequest } from './external-client'

export function extensionContext(
  c: Context,
  installed: Installed,
): ExtensionContext {
  const products = actingProducts(c)
  const ext = installed.extension
  const actor = { kind: 'extension', id: ext.id } as const
  function requirePermission(permission: Permission) {
    if (!ext.permissions.includes(permission))
      throw new Error(ext.id + ' requires ' + permission)
  }
  async function work<T>(number: number, run: () => Promise<T>) {
    await requireConversations(c, [number], 'write')
    return run()
  }
  async function approvedSend(
    number: number,
    body: string,
    key: string,
    operatorRecipient?: string,
  ) {
    requirePermission('send')
    if (!installed.enabledBy)
      throw new Error('Administrator must enable this sending policy')
    await requireConversations(c, [number], 'send')
    return queueStanding(c.env, {
      number,
      body,
      key,
      operatorRecipient,
      policy: ext.id,
      enabledBy: installed.enabledBy,
      now: c.now,
    })
  }
  return {
    visibleProducts: products,
    canManageProject: (product) => can(c.operator, 'manage', product).allowed,
    visibleNumbers: (numbers) => accessibleNumbers(c.env.DB, numbers, products),
    canAssign: (number, email) => isProjectAssignee(c.env.DB, number, email),
    local: c.env.ENVIRONMENT === 'local',
    demoGithub: !!c.env.DEMO_GITHUB,
    enabledBy: installed.enabledBy,
    previousSuggestion: (input) => previousSuggestion(c.env.DB, input),
    presentSuggestion: (input) => presentSuggestion(c.env.DB, input, c.now),
    reactToSuggestion: (input) => reactToSuggestion(c.env.DB, input, c.now),
    suggestionResolution: (product, from, to) =>
      suggestionResolution(c.env.DB, product, from, to, products),
    voices: () => receivedVoices(c.env.DB, products),
    standing: approvedSend,
    notifyEmail: (number, to, body, key) => approvedSend(number, body, key, to),
    change: (number, event) =>
      work(number, () =>
        coreOperations.status.execute({ ...c, actor }, { number, event }),
      ),
    events: (kind) => history(c.env.DB, kind, products),
    snapshotCounts: () => {
      requirePermission('read_body')
      return snapshotCounts(c.env.DB, products)
    },
    snapshot: () => {
      requirePermission('read_body')
      return snapshot(c.env.DB, products)
    },
    convertFeedback: (number) =>
      work(number, () =>
        changeFeedback(c.env, number, c.actor, c.now, 'convert'),
      ),
    unreviewFeedback: (number) =>
      work(number, () =>
        changeFeedback(c.env, number, c.actor, c.now, 'unreview'),
      ),
    reviewFeedback: (number) =>
      work(number, () =>
        changeFeedback(c.env, number, c.actor, c.now, 'review'),
      ),
    resource: async (id, name, input) => {
      const item = c.env.EXTENSIONS?.active.find((x) => x.extension.id === id)
      const resource = item?.extension.resources?.find((r) => r.name === name)
      return item && resource
        ? resource.run(extensionContext(c, item), input)
        : undefined
    },
    articleCandidates: async (product, text) => {
      requireProduct(c, product, 'read')
      const source = c.env.candidateSources?.[ext.id]
      return source ? source(c.env.DB, product, text) : []
    },
    judge: (model, question, articles, name, kind) => {
      requirePermission('external_fetch')
      if (!c.env.AI || !c.env.judgeArticles)
        throw new Error('Configure the Workers AI binding AI')
      return c.env.judgeArticles(
        c.env.AI,
        model,
        question,
        articles,
        name,
        kind,
      )
    },
    ...extensionStorage(c.env.DB, ext.id),
    assign: (number, email) =>
      work(number, () =>
        setAssignment(
          c.env.DB,
          { actor: JSON.stringify(actor), now: c.now },
          { number, email },
        ),
      ),
    label: (number, label) =>
      work(number, () =>
        changeGroupLabel(
          c.env,
          { actor: JSON.stringify(actor), now: c.now },
          { number, label, action: 'add' },
        ),
      ),
    config: installed.settings,
    actor: c.actor,
    now: c.now,
    open: async (input) => {
      requireProduct(c, input.product, 'write')
      return openIntake(c.env, input, actor, c.now)
    },
    addInboundMessage: (number, body) =>
      work(number, () => addInboundMessage(c.env, number, body, actor, c.now)),
    draft: async (number, body, key) => {
      await requireConversations(c, [number], 'draft')
      return saveDraft(
        c.env,
        number,
        body,
        c.actor,
        c.now,
        key && ext.id + ':' + key,
      )
    },
    contact: async (number) => {
      await requireConversations(c, [number], 'read')
      return templateContact(c.env, number)
    },
    inboundBody: async (number, id) => {
      await requireConversations(c, [number], 'read')
      requirePermission('read_body')
      return inboundBody(c.env.DB, number, id)
    },
    body: async (number) => {
      await requireConversations(c, [number], 'read')
      requirePermission('read_body')
      const rows = await c.env.DB.prepare(
        'SELECT body FROM messages WHERE number=? ORDER BY created_at,id',
      )
        .bind(number)
        .all()
      return rows.results.map((row) => String(row.body))
    },
    request: (url, init) => {
      requirePermission('external_fetch')
      if (c.env.DEMO_GITHUB && new URL(url).hostname === 'api.github.com')
        return c.env.DEMO_GITHUB.fetch(url, { ...init, redirect: 'manual' })
      return externalRequest(url, init)
    },
    secret: (name) => {
      requirePermission('external_fetch')
      if (!ext.secrets?.includes(name)) return undefined
      const binding: unknown = Reflect.get(c.env, name)
      return typeof binding === 'string' ? binding : undefined
    },
    emit: (kind, number, payload, key) =>
      emitOnce(
        c.env.DB,
        actor,
        ext.id + '.' + kind,
        number,
        payload,
        c.now,
        key,
      ),
  }
}
