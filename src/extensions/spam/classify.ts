export function shouldQuarantine(
  authentication: unknown,
  email: string,
  mailbox: string,
) {
  if (email.toLowerCase() === mailbox.toLowerCase()) return true
  return (
    typeof authentication === 'string' &&
    /(?:^|[;\s])(?:dmarc|spf)=fail(?:\s|;|$)/i.test(authentication)
  )
}
