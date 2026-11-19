import { labelEdit } from '../conversations/labels'
import {
  editLabelDirectory,
  labelDirectory,
} from '../conversations/label-colors-store'
import { z } from 'zod'
import { listContacts } from '../operations/operator-store'
import type { Context } from '../operations/catalog-usecase'

export function sendingDomains(declaration: string | undefined) {
  return [
    ...new Set(
      (declaration ?? '')
        .split(',')
        .map((domain) => domain.trim().toLowerCase())
        .filter((domain) => z.hostname().safeParse(domain).success),
    ),
  ]
}
export function settingsContacts(ctx: Context) {
  return listContacts(ctx.env.DB)
}

export function mailboxInput(
  ctx: Context,
  form: Record<string, string | File>,
  mailboxes: { product: string; name: string }[],
) {
  const domains = sendingDomains(ctx.env.SENDING_DOMAINS)
  const address = domains.length
    ? z
        .email()
        .parse(
          String(form.local ?? '') + '@' + z.enum(domains).parse(form.domain),
        )
    : z.email().parse(form.address)
  if (form.product) {
    const current = mailboxes.find((m) => m.product === form.product)
    if (!current) throw new Error('Unknown product')
    return { ...current, address }
  }
  const name = z.string().trim().min(1).max(200).parse(form.name)
  return { product: ctx.uuid(), name, address }
}

export const settingsLabels = (ctx: Context) => labelDirectory(ctx.env.DB)
export function changeLabel(ctx: Context, input: Record<string, unknown>) {
  return editLabelDirectory(
    ctx.env.DB,
    labelEdit.parse({ action: 'color', ...input }),
  )
}
