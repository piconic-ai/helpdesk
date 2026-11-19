import { LabelDot } from '../ui/inbox-parts'
import { ProductMark } from '../ui/product-mark'
import type { ConsoleFrame } from '../core/conversations/console-usecase'
import type { storedRules } from '../extensions/rules/extension'
import { select } from '../core/conversations/console-page'
import {
  ActionBar,
  EmptyState,
  ListRow,
  RowList,
  FormSection,
} from '../ui/patterns'
import { Button, Input, Field } from '../ui/controls'
import { Disclosure, SaveActions } from '../ui/admin'

export function rulesSettings(
  frame: ConsoleFrame,
  rules: (Awaited<ReturnType<typeof storedRules>>[number] & {
    index: number
  })[],
  versions: Map<string, string>,
  total: number,
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
      <Field label="件名に含む言葉">
        <Input
          name="subjectContains"
          maxlength={200}
          value={rule.subjectContains}
        />
      </Field>
      {select(
        'label',
        '付けるラベル',
        {
          '': '付けない',
          ...Object.fromEntries(frame.labels.map((l) => [l, l])),
        },
        rule.label ?? '',
        (name) => name && <LabelDot label={name} colors={frame.labelColors} />,
      )}
      {select(
        'assignee',
        '担当者',
        { '': '変更しない', ...people },
        rule.assignee ?? '',
      )}
      <small>ラベルまたは担当者を選択してください。</small>
      <SaveActions
        verb={key ? '変更を保存' : 'ルールを保存'}
        cancel="/extensions/rules"
        primary={!key}
      />
    </form>
  )
  return (
    <>
      <h2>保存済みのルール</h2>
      <p>
        上から順に適用します。複数の担当者指定が一致すると、最後の指定が優先されます。
      </p>
      {!rules.length && (
        <EmptyState icon={total ? 'search' : 'rules'}>
          {total
            ? '条件に合うルールはありません。'
            : '保存済みのルールはありません。'}
        </EmptyState>
      )}
      <div data-list="rules">
        <RowList>
          {rules.map(({ key, rule, index }) => (
            <ListRow
              title={
                <>
                  {rule.product ? (
                    <ProductMark
                      product={{
                        id: rule.product,
                        name: products[rule.product] ?? rule.product,
                      }}
                    />
                  ) : (
                    '全プロダクト'
                  )}{' '}
                  · {rule.subjectContains || 'すべての件名'}
                </>
              }
              description={
                <>
                  {rule.label && (
                    <>
                      <LabelDot label={rule.label} colors={frame.labelColors} />
                      {rule.label}
                    </>
                  )}
                  {rule.label && rule.assignee && '・'}
                  {people[rule.assignee ?? '']}
                </>
              }
              status={index + 1 + '番目'}
              action={
                <Disclosure title="編集">
                  {editor(key, rule)}
                  <ActionBar>
                    <form action="/extensions/rules/move" method="post">
                      <input
                        type="hidden"
                        name="revision"
                        value={versions.get('order') ?? ''}
                      />
                      <input type="hidden" name="key" value={key} />
                      <Button
                        variant="ghost"
                        name="direction"
                        value="up"
                        disabled={index === 0}
                      >
                        上へ
                      </Button>
                      <Button
                        variant="ghost"
                        name="direction"
                        value="down"
                        disabled={index === total - 1}
                      >
                        下へ
                      </Button>
                    </form>
                    <form action="/extensions/rules/remove" method="post">
                      <input
                        type="hidden"
                        name="revision"
                        value={versions.get(key) ?? ''}
                      />
                      <input type="hidden" name="key" value={key} />
                      <Button variant="destructive">このルールを解除</Button>
                    </form>
                  </ActionBar>
                </Disclosure>
              }
            />
          ))}
        </RowList>
      </div>
      <FormSection id="new-rule" title="新しいルール">
        {editor()}
      </FormSection>
    </>
  )
}
