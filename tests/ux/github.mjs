// This service runs in the Miniflare host. No request is forwarded to the network.
import { resolvedExample, finishedExample } from '../ui/review-issue-seed.mjs'

export function createGithub(demo = false) {
  const created = []
  const comments = []
  const repositories = new Map()
  let latest
  function issuesFor(repo) {
    if (!repositories.has(repo)) {
      const seeds =
        repo === 'example/helpdesk'
          ? [
              {
                number: 42,
                title: '領収書の一括ダウンロード',
                state: 'open',
                closed_at: null,
              },
              resolvedExample,
            ]
          : []
      if (demo && repo === 'example/helpdesk') seeds.push(finishedExample)
      repositories.set(
        repo,
        new Map(
          seeds.map((issue) => [issue.number, { ...issue, comments: [] }]),
        ),
      )
    }
    return repositories.get(repo)
  }
  function close(issue, at) {
    if (issue.state === 'closed') return
    issue.state = 'closed'
    issue.closed_at = at
  }
  async function collection(request, issues) {
    if (request.method === 'GET')
      return Response.json(
        [...issues.values()]
          .reverse()
          .sort(
            (a, b) => Number(b.state === 'open') - Number(a.state === 'open'),
          ),
      )
    if (request.method === 'POST') {
      const post = await request.json()
      const issue = {
        number: Math.max(0, ...issues.keys()) + 1,
        title: post.title,
        body: post.body,
        state: 'open',
        closed_at: null,
        comments: [],
      }
      issues.set(issue.number, issue)
      latest = issue
      created.push(post)
      return Response.json(issue, { status: 201 })
    }
    return new Response(null, { status: 405 })
  }
  async function fetch(request) {
    const url = new URL(request.url)
    const match =
      /^\/repos\/([^/]+\/[^/]+)\/issues(?:\/(\d+)(\/comments)?)?$/.exec(
        url.pathname,
      )
    if (url.hostname !== 'api.github.com' || !match)
      return new Response(null, { status: 404 })
    const [, repo, number, isComment] = match
    const issues = issuesFor(repo.toLowerCase())
    if (!number) return collection(request, issues)
    const issue = issues.get(Number(number))
    if (!issue) return new Response(null, { status: 404 })
    if (isComment && request.method === 'POST') {
      const comment = await request.json()
      issue.comments.push(comment)
      comments.push(comment)
      return Response.json(comment, { status: 201 })
    }
    if (request.method === 'GET')
      return Response.json(isComment ? issue.comments : issue)
    if (demo && !isComment && request.method === 'PATCH') {
      const change = await request.json()
      if (change.state !== 'closed') return new Response(null, { status: 400 })
      close(issue, change.closed_at)
      return Response.json(issue)
    }
    return new Response(null, { status: 405 })
  }
  return {
    created,
    comments,
    fetch,
    close() {
      close(
        latest ?? issuesFor('example/helpdesk').get(42),
        resolvedExample.closed_at,
      )
    },
  }
}
