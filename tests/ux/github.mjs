import { resolvedExample } from '../ui/review-issue-seed.mjs'
// In-process HTTP service for the test Worker's external GitHub binding.
export function createGithub() {
  const created = []
  const comments = []
  let closed = false
  const issue = () => ({
    number: 42,
    title: 'Inquiry #1',
    state: closed ? 'closed' : 'open',
    closed_at: closed ? '2026-11-18T04:00:00Z' : null,
  })
  return {
    created,
    comments,
    close() {
      closed = true
    },
    async fetch(request) {
      const { hostname, pathname } = new URL(request.url)
      if (hostname !== 'api.github.com')
        return new Response('Unknown host', { status: 404 })
      if (/\/issues$/.test(pathname) && request.method === 'POST') {
        created.push(await request.json())
        return Response.json(issue(), { status: 201 })
      }
      if (/\/issues\/42\/comments$/.test(pathname)) {
        if (request.method === 'POST') {
          comments.push(await request.json())
          return Response.json(comments.at(-1), { status: 201 })
        }
        return Response.json(comments)
      }
      if (/\/issues\/43$/.test(pathname)) return Response.json(resolvedExample)
      if (/\/issues\/43\/comments$/.test(pathname))
        return Response.json(request.method === 'POST' ? {} : [])
      if (/\/issues\/42$/.test(pathname)) return Response.json(issue())
      if (/\/issues$/.test(pathname))
        return Response.json([issue(), resolvedExample])
      return new Response('Unknown GitHub endpoint', { status: 404 })
    },
  }
}
