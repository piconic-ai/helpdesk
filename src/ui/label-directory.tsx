import { Button, Field, Input, NativeSelect, Popover } from './controls'
import { LabelDot } from './inbox-parts'
import { identityColor, identityColorNames } from './identity-color'
import { EmptyState } from './patterns'

type Row = { name: string; count: number }
const endpoint = '/settings/labels'
export const addLabel = () => (
  <Popover id="add-label" label="ラベルを追加" variant="outline">
    <form action={endpoint} method="post">
      <Input type="hidden" name="action" value="add" />
      <Field label="ラベル名（20字まで）">
        <Input name="name" maxlength={20} required />
      </Field>
      <Button variant="default">追加する</Button>
    </form>
  </Popover>
)

function swatches(label: string, color: number, index: number) {
  return (
    <Popover
      id={'label-color-' + index}
      label={
        <>
          <LabelDot label={label} color={color} />
          <span className="sr-only">{label}の色を変更</span>
        </>
      }
    >
      <form action={endpoint} method="post" className="swatches">
        <Input type="hidden" name="label" value={label} />
        {identityColorNames.map((name, n) => (
          <Button
            type="submit"
            variant="ghost"
            name="color"
            value={String(n)}
            aria-label={name}
            aria-pressed={color === n}
          >
            <LabelDot label={name} color={n} />
          </Button>
        ))}
      </form>
    </Popover>
  )
}
function labelActions(row: Row, rows: Row[], index: number) {
  return (
    <Popover
      id={'label-actions-' + index}
      label="操作"
      accessibleName={'操作：' + row.name}
    >
      <p>{row.name}</p>
      {rows.length > 1 && (
        <form method="post" action={endpoint} data-label-impact={row.count}>
          <Input type="hidden" name="action" value="merge" />
          <Input type="hidden" name="count" value={row.count} />
          <Input type="hidden" name="label" value={row.name} />
          <Field label="まとめる先">
            <NativeSelect name="target" aria-label="まとめる先" required>
              {rows
                .filter((r) => r.name !== row.name)
                .map((r) => (
                  <option value={r.name}>{r.name}</option>
                ))}
            </NativeSelect>
          </Field>
          <Button>別のラベルにまとめる</Button>
        </form>
      )}
      <form method="post" action={endpoint} data-label-impact={row.count}>
        <Input type="hidden" name="action" value="delete" />
        <Input type="hidden" name="label" value={row.name} />
        <Input type="hidden" name="count" value={row.count} />
        <Button variant="destructive">削除</Button>
      </form>
    </Popover>
  )
}
export function labelTable(rows: Row[], colors: Record<string, number>) {
  if (!rows.length)
    return (
      <EmptyState icon="tag">
        ラベルを追加すると会話の分類に使えます。
      </EmptyState>
    )
  return (
    <table className="label-directory">
      <thead>
        <tr>
          <th scope="col">ラベル</th>
          <th scope="col">会話数</th>
          <th scope="col">操作</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr>
            <th scope="row">
              <div className="label-name">
                {swatches(
                  row.name,
                  colors[row.name] ?? identityColor(row.name),
                  index,
                )}
                <Popover
                  id={'label-rename-' + index}
                  label={<span className="label-display-name">{row.name}</span>}
                  accessibleName={row.name + 'の名前を変更'}
                >
                  <form
                    method="post"
                    action={endpoint}
                    data-layout="stack"
                    data-gap="xs"
                  >
                    <Input type="hidden" name="action" value="rename" />
                    <Input type="hidden" name="label" value={row.name} />
                    <p className="label-current-name">現在の名前：{row.name}</p>
                    <Field label="新しい名前（20字まで）">
                      <Input
                        name="name"
                        required
                        maxlength={20}
                        value={row.name}
                      />
                    </Field>
                    <Button>名前を変更</Button>
                    <Button
                      type="button"
                      variant="ghost"
                      popovertarget={'label-rename-' + index}
                      popovertargetaction="hide"
                    >
                      取り消し
                    </Button>
                  </form>
                </Popover>
              </div>
              {row.name.length > 20 && (
                <small>20字以内の名前に変更してください。</small>
              )}
            </th>
            <td>{row.count}件</td>
            <td>{labelActions(row, rows, index)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
