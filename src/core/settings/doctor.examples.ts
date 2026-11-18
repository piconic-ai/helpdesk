export const bindingExamples = [
  { name: 'DB', section: 'd1_databases' },
  { name: 'RAW', section: 'r2_buckets' },
  { name: 'JOBS', section: 'queues.producers' },
  { name: 'EMAIL', section: 'send_email' },
  { name: 'ASSETS', section: 'assets' },
] as const

export const declarationExamples = [
  { value: undefined, issue: 'set SENDING_DOMAINS' },
  { value: 'other.example', issue: 'add it to SENDING_DOMAINS' },
  { value: 'https://example.org', issue: 'comma-separated hostnames' },
  { value: 'other.example, EXAMPLE.ORG', issue: null },
] as const
