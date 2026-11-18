import type { ParsedMail } from './parse'
import { messageIds } from './threading'

export function bouncedReply(mail: ParsedMail) {
  const status = mail.attachments.find(
    (a) => a.mime === 'message/delivery-status',
  )
  if (!status) return null
  const report = new TextDecoder().decode(status.content)
  const failed = report
    .split(/\r?\n\r?\n/)
    .find((part) => /^Action:\s*failed\s*$/im.test(part))
  const recipient =
    failed && /^Final-Recipient:\s*rfc822;\s*([^\s<>]+)\s*$/im.exec(failed)?.[1]
  if (!recipient) return null
  const original = mail.attachments.find(
    (a) => a.mime === 'message/rfc822' || a.mime === 'text/rfc822-headers',
  )
  const headers =
    original &&
    new TextDecoder().decode(original.content).split(/\r?\n\r?\n/, 1)[0]
  const originalId =
    headers && /^Message-ID:\s*(<[^<>\s]+>)/im.exec(headers)?.[1]
  const ids = originalId ? [originalId] : messageIds(mail.inReplyTo)
  return { recipient: recipient.toLowerCase(), ids }
}
