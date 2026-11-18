// In-process HTTP service for the test Worker's external GitHub binding.
export function createGithub() {
  const created = []
  let closed = false
  const issue = () => ({
    number: 42,
    title: 'Inquiry #1',
    state: closed ? 'closed' : 'open',
    closed_at: closed ? '2026-11-18T04:00:00Z' : null,
  })
  return {
    created,
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
      if (/\/issues\/42$/.test(pathname)) return Response.json(issue())
      if (/\/issues$/.test(pathname)) return Response.json([issue()])
      return new Response('Unknown GitHub endpoint', { status: 404 })
    },
  }
}
