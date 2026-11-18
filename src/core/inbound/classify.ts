import type { Email } from 'postal-mime'

export function header(mail: Email, name: string) {
  return mail.headers.find((h) => h.key === name)?.value.trim() ?? ''
}

export function classify(mail: Email, envelopeFrom: string) {
  const report = header(mail, 'content-type').toLowerCase()
  if (
    (!envelopeFrom || envelopeFrom === '<>') &&
    /report-type\s*=\s*"?delivery-status/.test(report)
  )
    return 'bounce'
  if (!envelopeFrom || envelopeFrom === '<>') return 'automatic'
  const auto = header(mail, 'auto-submitted')
    .toLowerCase()
    .split(';')[0]
    ?.trim()
  if (auto && auto !== 'no') return 'automatic'
  if (
    ['bulk', 'list', 'junk', 'auto_reply'].includes(
      header(mail, 'precedence').toLowerCase(),
    )
  )
    return 'automatic'
  return 'human'
}
