import type { ConsoleFrame } from '../core/conversations/console-usecase'
import type { storedRules } from '../extensions/rules/extension'
import { select } from '../core/conversations/console-page'

export function rulesSettings(
  frame: ConsoleFrame,
  rules: Awaited<ReturnType<typeof storedRules>>,
  notice: boolean,
) {
  const products = Object.fromEntries(frame.products.map((p) => [p.id, p.name]))
  const people = Object.fromEntries(
    frame.operators.map((o) => [o.email, o.displayName]),
  )
  return (
    <section className="settings-card">
      <h2>受信時の振り分け</h2>
      {notice && (
        <p role="status" className="banner-success">
          振り分けルールを保存しました。
        </p>
      )}
      {rules.map(({ key, rule }) => (
        <form action="/extensions/rules/remove" method="post">
          <input type="hidden" name="key" value={key} />
          <p>
            {products[rule.product ?? ''] ?? '全プロダクト'} ·{' '}
            {rule.subjectContains} →{' '}
            {[rule.label, people[rule.assignee ?? '']]
              .filter(Boolean)
              .join('・')}
          </p>
          <button className="button-secondary">このルールを解除</button>
        </form>
      ))}
      <form method="post" action="/extensions/rules/add">
        {select('product', 'プロダクト', { '': 'すべて', ...products }, '')}
        <label>
          件名に含む言葉
          <input name="subjectContains" required maxlength={200} />
        </label>
        {select(
          'label',
          '付けるラベル',
          {
            '': '付けない',
            ...Object.fromEntries(frame.labels.map((l) => [l, l])),
          },
          '',
        )}
        {select('assignee', '担当者', { '': '変更しない', ...people }, '')}
        <p>ラベルまたは担当者を選択してください。</p>
        <button>ルールを保存</button>
      </form>
    </section>
  )
}
