import type { ConsoleFrame } from '../conversations/console-usecase'
import {
  deletion,
  retention,
  settingsNotice,
} from '../conversations/settings-page'
import { ListPage, EditPage, FormSection } from '../../ui/patterns'
import { ProductSelect } from '../../ui/product-mark'
import { Button } from '../../ui/controls'
import { addLabel, labelTable } from '../../ui/label-directory'
import { shell } from '../conversations/console-page'
import { projectBack, projectPath } from './project-setting-links'
import { projectTerm } from './project-term'
import type { projectSettingValues } from './project-settings-usecase'

type Project = NonNullable<Awaited<ReturnType<typeof projectSettingValues>>>
export function dataSectionPage(
  frame: ConsoleFrame,
  data: Project,
  section: 'deletion' | 'retention',
  contacts: Parameters<typeof deletion>[0],
) {
  const title = section === 'deletion' ? '連絡先のデータ削除' : '保存期間'
  const project = data.project
  return shell(
    title,
    <EditPage
      title={title}
      description={project.name}
      back={projectBack(project.id)}
    >
      {settingsNotice(section, frame.query.saved)}
      {section === 'deletion'
        ? deletion(contacts, project.id)
        : retention(data, project.id)}
    </EditPage>,
    frame,
  )
}
export function projectLabelsPage(
  frame: ConsoleFrame,
  project: Project['project'],
  labels: Parameters<typeof labelTable>[0],
  colors: Record<string, number>,
) {
  const path = projectPath(project.id, 'labels')
  const sources = frame.products.filter((p) => p.id !== project.id)
  return shell(
    'ラベル',
    <ListPage
      title="ラベル"
      description={project.name}
      back={projectBack(project.id)}
      action={addLabel(path)}
    >
      {settingsNotice('labels', frame.query.saved)}
      {labelTable(labels, colors, path)}
      {!!sources.length && (
        <FormSection
          title={'ほかの' + projectTerm + 'から写す'}
          description="登録済みのラベルはそのまま残ります。"
        >
          <form action={path + '/copy'} method="post">
            <ProductSelect
              label="コピー元"
              products={sources}
              empty="コピー元を選ぶ"
            />
            <Button>ラベルを写す</Button>
          </form>
        </FormSection>
      )}
    </ListPage>,
    frame,
  )
}
