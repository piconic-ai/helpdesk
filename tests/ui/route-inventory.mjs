import { app } from '../../dist/worker/worker.js'
import { extensions } from '../../helpdesk.config.ts'
import { surveyId } from './seed.mjs'

// Only endpoints which cannot render a page are excluded. Every new GET or ALL
// route must resolve to a seeded browser URL, or fail the capture at discovery.
const resources = new Set([
  '/*',
  '/extension-assets/*',
  '/components/*',
  '/ui/*',
  '/widget.js',
  '/styles.css',
  '/uno.css',
  '/help/product-icon/:product',
  '/public/*',
  '/api/*',
  '/api/operations',
  '/mcp',
  '/tokens/*',
  '/attachment',
  '/account/avatar/:key',
  '/issues/choices/:number',
  '/conversation/:number/canned-suggestions',
])
function examples(path) {
  if (path.includes('{') && !path.includes('{.*}')) {
    const [, token, values] = path.match(/(:\w+\{([^}]+)\})/)
    return values
      .split('|')
      .flatMap((value) => examples(path.replace(token, value)))
  }
  if (path === '/help/:id/:product/:path{.*}?')
    return ['/help/articles/slide/receipt', '/help/survey/slide/' + surveyId]
  if (path === '/help/*') return ['/help/absent/slide']
  if (path === '/extensions/:id')
    return extensions.map(({ extension }) => '/extensions/' + extension.id)
  const samples = {
    owner: 'example',
    repo: 'helpdesk',
    issue: '43',
    number: '1',
    product: 'slide',
    id: 'in-6',
  }
  const url = path.replace(/:(\w+)/g, (_, name) => {
    if (!Object.hasOwn(samples, name))
      throw new Error('Missing route parameter fixture for ' + path)
    return samples[name]
  })
  if (url === '/articles/edit') return [url + '?product=slide&id=receipt']
  return [url]
}

export function registeredScreens() {
  const paths = new Set(
    app.routes
      .filter((r) => r.method === 'GET' || r.method === 'ALL')
      .map((r) => r.path),
  )
  return [
    ...new Set(
      [...paths].filter((path) => !resources.has(path)).flatMap(examples),
    ),
  ]
}
export function routeScenes(known) {
  const urls = new Set(known.map((s) => s.url))
  return registeredScreens()
    .filter((url) => !urls.has(url))
    .map((url) => ({
      id:
        'route-' +
        (url.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') || 'home'),
      group: '登録されている画面',
      label: url,
      url,
      status: url === '/help/absent/slide' ? 404 : 200,
      registered: true,
    }))
}
