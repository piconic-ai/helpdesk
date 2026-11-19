import type { savedTemplates } from '../extensions/canned/templates'
import { ListRow, RowList, FormSection, EmptyState } from '../ui/patterns'
import { Input, Textarea, Field } from '../ui/controls'
import { Disclosure, SaveActions } from '../ui/admin'

export function cannedSettings(
  items: Awaited<ReturnType<typeof savedTemplates>>,
  versions: Map<string, string>,
  hasTemplates: boolean,
) {
  const editor = (id: string, name: string, body: string) => (
    <form method="post" action="/extensions/canned/save">
      <input type="hidden" name="id" value={id} />
      <input
        type="hidden"
        name="revision"
        value={versions.get('template/' + id) ?? ''}
      />
      <Field label="定型文の表示名">
        <Input required name="name" maxlength={100} value={name} />
      </Field>
      <Field
        label="定型文の本文"
        description="相手の名前には {{name}}、プロダクト名には {{product}} が使えます。"
      >
        <Textarea required name="body" maxlength={4000}>
          {body}
        </Textarea>
      </Field>
      <SaveActions
        verb={id ? '変更を保存' : '定型文を作成'}
        cancel="/extensions/canned"
        primary={!id}
      />
    </form>
  )
  return (
    <>
      <h2>保存済みの定型文</h2>
      {items.size ? (
        <RowList>
          {[...items].map(([id, item]) => (
            <ListRow
              title={item.name}
              description={item.body}
              action={
                <Disclosure title={'編集：' + item.name}>
                  {editor(id, item.name, item.body)}
                </Disclosure>
              }
            />
          ))}
        </RowList>
      ) : (
        <EmptyState icon={hasTemplates ? 'search' : 'canned'}>
          {hasTemplates
            ? '条件に合う定型文はありません。'
            : '保存済みの定型文はありません。'}
        </EmptyState>
      )}
      <FormSection title="新しい定型文" id="new-template">
        {editor('', '', '')}
      </FormSection>
    </>
  )
}
