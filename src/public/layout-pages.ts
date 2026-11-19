import { html } from 'hono/html'
import { PublicShell } from '../ui/public-shell'

type Product = { id?: string; name: string; mailbox: string | null }
const policy =
  "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors "
export function publicPolicy(origins?: string[]) {
  if (!origins) return policy + "'none'"
  // Only exact HTTP(S) hosts may become CSP source expressions.
  const sources = origins.filter((s) =>
    /^https?:\/\/(?:[a-z0-9.-]+|\[[0-9a-f:]+\])(?::[0-9]+)?$/i.test(s),
  )
  return policy + ["'self'", ...sources].join(' ')
}
export function publicDocument(
  product: Product,
  page: { title: string; html: string },
  options: {
    contact?: string
    chat?: boolean
    turnstile?: boolean
    search?: boolean
  } = {},
) {
  return html`<!doctype html>
    ${PublicShell({ product, title: page.title, content: page.html, ...options })}`
}
