import type { IntakePolicy } from '../core/intakes/intake'

export function acceptsHostedSubmissions(policy?: IntakePolicy) {
  return (
    !!policy && (!policy.turnstileSecretBinding || !!policy.turnstileSiteKey)
  )
}

export function contactDestination(
  product: string,
  mailbox: string | null | undefined,
  formAvailable: boolean,
) {
  if (!mailbox) return undefined
  return formAvailable
    ? '/help/form/' + encodeURIComponent(product)
    : 'mailto:' + mailbox
}
