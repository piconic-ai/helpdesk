import type { ConsoleFrame } from '../core/conversations/console-usecase'
import type { storedRules } from '../extensions/rules/extension'
import { select } from '../core/conversations/console-page'

export function rulesSettings(
  frame: ConsoleFrame,
  rules: Awaited<ReturnType<typeof storedRules>>,
  versions: Map<string, string>,
) {
  const products = Object.fromEntries(frame.products.map((p) => [p.id, p.name]))
  const people = Object.fromEntries(
    frame.operators.map((o) => [o.email, o.displayName]),
  )
  const editor = (
    key = '',
    rule: Partial<(typeof rules)[number]['rule']> = {},
  ) => (
    <form method="post" action="/extensions/rules/add">
      <input type="hidden" name="revision" value={versions.get(key) ?? ''} />
      <input type="hidden" name="key" value={key} />
      {select(
        'product',
        'プロダクト',
        { '': 'すべて', ...products },
        rule.product ?? '',
      )}
      <label>
        件名に含む言葉
        <input
          name="subjectContains"
          maxlength={200}
          value={rule.subjectContains}
        />
      </label>
      {select(
        'label',
        '付けるラベル',
        {
          '': '付けない',
          ...Object.fromEntries(frame.labels.map((l) => [l, l])),
        },
        rule.label ?? '',
      )}
      {select(
        'assignee',
        '担当者',
        { '': '変更しない', ...people },
        rule.assignee ?? '',
      )}
      <p>ラベルまたは担当者を選択してください。</p>
      <button>{key ? '変更を保存' : 'ルールを保存'}</button>
    </form>
  )
  return (
    <section className="settings-card">
      <h2>受信時の振り分け</h2>

      <h3>保存済みのルール</h3>
      <p>
        上から順に適用します。複数の担当者指定が一致すると、最後の指定が優先されます。
      </p>
      {rules.length === 0 && (
        <p className="empty-state">保存済みのルールはありません。</p>
      )}
      <ol className="rule-list">
        {rules.map(({ key, rule }, index) => (
          <li>
            <strong>
              {products[rule.product ?? ''] ?? '全プロダクト'} ·{' '}
              {rule.subjectContains || 'すべての件名'}
            </strong>
            <p>
              {[rule.label, people[rule.assignee ?? '']]
                .filter(Boolean)
                .join('・')}
            </p>
            <details>
              <summary>編集</summary>
              {editor(key, rule)}
            </details>
            <div className="page-actions">
              <form action="/extensions/rules/move" method="post">
                <input
                  type="hidden"
                  name="revision"
                  value={versions.get('order') ?? ''}
                />
                <input type="hidden" name="key" value={key} />
                <button name="direction" value="up" disabled={index === 0}>
                  上へ
                </button>
                <button
                  name="direction"
                  value="down"
                  disabled={index === rules.length - 1}
                >
                  下へ
                </button>
              </form>
              <form action="/extensions/rules/remove" method="post">
                <input
                  type="hidden"
                  name="revision"
                  value={versions.get(key) ?? ''}
                />
                <input type="hidden" name="key" value={key} />
                <button>このルールを解除</button>
              </form>
            </div>
          </li>
        ))}
      </ol>
      <h3>新しいルール</h3>
      {editor()}
    </section>
  )
}
