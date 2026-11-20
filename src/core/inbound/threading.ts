import { ticketSubjectTag } from '../conversations/ticket-reference'

export function messageIds(value: string) {
  return value.match(/<[^<>\s]{1,998}>/g) ?? []
}

export function threadHints(
  inReplyTo: string,
  references: string,
  subject: string,
) {
  const ids = [
    ...new Set([...messageIds(inReplyTo), ...messageIds(references).reverse()]),
  ].slice(0, 48)
  const tag = !inReplyTo && !references ? ticketSubjectTag.exec(subject) : null
  const serial = Number(tag?.[2])
  return {
    ids,
    reference:
      tag && Number.isSafeInteger(serial)
        ? { prefix: tag[1] ?? null, serial }
        : null,
  }
}

export function threadFor(
  ids: string[],
  candidates: {
    number: number
    message_id: string | null
    provider_id: string | null
  }[],
) {
  for (const id of ids) {
    const found = candidates.find(
      (c) => c.message_id === id || c.provider_id === id,
    )
    if (found) return found.number
  }
  return null
}
