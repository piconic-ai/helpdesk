import type { panels, management } from './registry-usecase'
import { shell } from '../conversations/conversations-page'
export function managementPage(data: Awaited<ReturnType<typeof management>>) {
  return shell(
    'Extensions',
    <>
      <h1>Extensions</h1>
      {data.entries.map((e) => (
        <section>
          <h2>{e.id}</h2>
          <p>Permissions: {e.permissions.join(', ') || 'none'}</p>
          <form action={'/extensions/' + e.id} method="post">
            <input
              type="hidden"
              name="enabled"
              value={e.enabled ? 'no' : 'yes'}
            />
            <button>
              {e.enabled ? 'Disable' : 'Enable'} {e.id}
            </button>
          </form>
        </section>
      ))}
      {data.failures.length > 0 && (
        <section>
          <h2>Failed deliveries</h2>
          {data.failures.map((f) => (
            <p>
              {String(f.extension)} · event {String(f.event)} ·{' '}
              {String(f.error)}
            </p>
          ))}
        </section>
      )}
    </>,
  )
}
export function extensionPanels(
  data: Awaited<ReturnType<typeof panels>>,
  number?: number,
) {
  return (
    <>
      {data.map((p) => (
        <section>
          <h2>{p.title}</h2>
          {p.content && <p className="body">{p.content}</p>}
          {p.links.map((link) => (
            <a href={link.href}>{link.label}</a>
          ))}
          {p.operations.map((op) => (
            <form method="post" action={'/actions/' + op.name}>
              {Object.keys(op.inputSchema.properties ?? {}).map((key) =>
                key === 'number' && number ? (
                  <input type="hidden" name="number" value={number} />
                ) : (
                  <label>
                    {key}
                    {p.choices[key] ? (
                      <select name={key}>
                        {p.choices[key].map((v) => (
                          <option value={v}>{v}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={key}
                        required={op.inputSchema.required?.includes(key)}
                      />
                    )}
                  </label>
                ),
              )}
              <button>{op.description}</button>
            </form>
          ))}
        </section>
      ))}
    </>
  )
}
export function operationResult(
  title: string,
  result: unknown,
  number?: number,
) {
  return shell(
    title,
    <>
      <h1>{title}</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <a href={number ? '/conversation/' + number : '/'}>Return to helpdesk</a>
    </>,
  )
}
