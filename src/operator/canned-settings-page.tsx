import type { savedTemplates } from '../extensions/canned/templates'
export function cannedSettings(
  items: Awaited<ReturnType<typeof savedTemplates>>,
  versions: Map<string, string>,
) {
  const editor = (id: string, name: string, body: string) => (
    <form
      className="settings-card"
      method="post"
      action="/extensions/canned/save"
    >
      <input type="hidden" name="id" value={id} />
      <input
        type="hidden"
        name="revision"
        value={versions.get('template/' + id) ?? ''}
      />
      <label>
        定型文の表示名
        <input required name="name" maxlength={100} value={name} />
      </label>
      <label>
        定型文の本文
        <textarea required name="body" maxlength={4000}>
          {body}
        </textarea>
      </label>
      <button>{id ? '変更を保存' : '定型文を作成'}</button>
    </form>
  )
  return (
    <section>
      <h2>定型返信の管理</h2>

      {[...items].map(([id, item]) => (
        <details>
          <summary>{item.name}</summary>
          {editor(id, item.name, item.body)}
        </details>
      ))}
      <h3>新しい定型文</h3>
      {editor('', '', '')}
    </section>
  )
}
