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
  const number = Number(/\[#([1-9]\d*)\]/.exec(subject)?.[1])
  return {
    ids,
    number:
      !inReplyTo && !references && Number.isSafeInteger(number) ? number : null,
  }
}

export type Candidate = {
  number: number
  contact: string
  mailbox: string
  message_id: string | null
  provider_id: string | null
}

export function threadFor(
  mail: {
    sender: string
    mailbox: string
    inReplyTo: string
    refs: string
    subject: string
  },
  candidates: Candidate[],
) {
  const hints = threadHints(mail.inReplyTo, mail.refs, mail.subject)
  const own = candidates.filter(
    (c) => c.contact === mail.sender && c.mailbox === mail.mailbox,
  )
  for (const id of hints.ids) {
    const found = own.find((c) => c.message_id === id || c.provider_id === id)
    if (found) return found.number
  }
  return own.find((c) => c.number === hints.number)?.number ?? null
}
