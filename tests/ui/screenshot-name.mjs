import { existsSync } from 'node:fs'

export function screenshotName(name) {
  if (process.env.HELPDESK_DAILY_CAPTURE) return [name]
  const updated = 'ui/current/' + name
  return existsSync('docs/reports/' + updated)
    ? updated.split('/')
    : ['loop', 'round-17', 'screens', name]
}
