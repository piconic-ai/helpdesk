import type { Context } from '../operations/catalog-usecase'
import { eventStatement } from '../conversations/conversations-store'
import {
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
  const ext = installed.extension
  const actor = { kind: 'extension', id: ext.id } as const
  function requirePermission(permission: Permission) {
    if (!ext.permissions.includes(permission))
      throw new Error(ext.id + ' requires ' + permission)
  }
  return {
    ...extensionStorage(c.env.DB, ext.id),
    config: installed.settings,
    actor: c.actor,
    now: c.now,
    open: (input) => openIntake(c.env, input, actor, c.now),
    draft: (number, body, key) => {
      return saveDraft(
        c.env,
        number,
        body,
        c.actor,
        c.now,
        key && ext.id + ':' + key,
      )
    },
    contact: (number) => templateContact(c.env, number),
    body: async (number) => {
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
      return externalRequest(url, init)
    },
    secret: (name) => {
      requirePermission('external_fetch')
      return ext.id === 'issues' && name === 'GITHUB_TOKEN'
        ? c.env.GITHUB_TOKEN
        : undefined
    },
    emit: async (kind, number, payload) => {
      await eventStatement(
        c.env.DB,
        { actor: JSON.stringify(actor), now: c.now },
        number,
        ext.id + '.' + kind,
        payload,
      ).run()
    },
  }
}
