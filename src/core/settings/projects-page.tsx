import { projectPath } from './project-setting-links'
import type { ConsoleFrame } from '../conversations/console-usecase'
import type {
  settingsOperators,
  settingsProjects,
} from './project-settings-usecase'
import { projectTerm } from './project-term'
import { shell, select, action } from '../conversations/console-page'
import { can } from '../operators/project-access'
import { extensionLabel } from '../extensions/extension-labels'
import {
  ListFilters,
  listRows,
  PageLinks,
  matchesSearch,
} from '../../ui/listing'
import {
  EditPage,
  EmptyState,
  FormSection,
  ListPage,
  Notice,
  OverviewPage,
  SettingRow,
  ActionBar,
} from '../../ui/patterns'
import { ProjectPickerForm, ProductMark } from '../../ui/product-mark'
import { ActionLink, Button, Field, Input, Dialog } from '../../ui/controls'
import { setupIssues } from '../conversations/settings-page'

export type ProjectSettings = Awaited<
  ReturnType<typeof settingsProjects>
>[number]
type Person = Awaited<ReturnType<typeof settingsOperators>>[number]
const globalBack = { href: '/settings/global', label: '全体の設定に戻る' }
const rootBack = { href: '/settings', label: '設定に戻る' }
const globalTitle = '全体の設定'
const projectTitle = projectTerm + 'の設定'
const directoryTitle = projectTerm + 'と窓口'
type Row = { href: string; title: string; description: string; value?: string }
const rows = (items: Row[], label = '設定項目') => (
  <nav aria-label={label}>
    {items.map((item) => (
      <SettingRow {...item} />
    ))}
  </nav>
)

export function settingsHome(
  frame: ConsoleFrame,
  projects: ProjectSettings[],
  issues: string[],
) {
  const current = projects.find((p) => p.id === frame.query.product)
  const groups: Row[] = [
    ...(can(frame.operator, 'global').allowed
      ? [
          {
            href: '/settings/global',
            title: globalTitle,
            description:
              projectTerm + '、運営者、拡張、API トークンを管理します。',
          },
        ]
      : []),
    ...(projects.length
      ? [
          {
            href: current ? projectPath(current.id) : '/settings/projects',
            title: projectTitle,
            description: '窓口、メンバー、ラベル、保存期間を管理します。',
            value: current?.name,
          },
        ]
      : []),
  ]
  const filtered = groups.filter((r) =>
    matchesSearch(r.title + ' ' + r.description, frame.query.q),
  )
  return shell(
    '設定',
    <OverviewPage
      title="設定"
      filters={
        <ListFilters
          title="設定項目"
          path="/settings"
          query={frame.query}
          sortable={false}
        />
      }
    >
      {setupIssues(issues)}
      {filtered.length ? (
        rows(filtered)
      ) : (
        <EmptyState icon="search">条件に合う設定項目はありません。</EmptyState>
      )}
    </OverviewPage>,
    frame,
  )
}
export function globalSettings(
  frame: ConsoleFrame,
  items: ProjectSettings[],
  operators: number,
  tokens: number,
) {
  return shell(
    globalTitle,
    <OverviewPage title={globalTitle} back={rootBack}>
      {rows([
        {
          href: '/settings/mailboxes',
          title: directoryTitle,
          description:
            projectTerm + 'を追加し、使用中・保管済みを切り替えます。',
          value: '窓口 ' + items.reduce((n, p) => n + p.mailboxes, 0) + '件',
        },
        {
          href: '/settings/operators',
          title: '運営者',
          description: '所属先と全体の権限を確認・変更します。',
          value: operators + '人',
        },
        {
          href: '/extensions',
          title: '拡張機能',
          description: '各プロジェクトに提供する拡張を選びます。',
        },
        {
          href: '/tokens',
          title: 'API トークンの管理',
          description: 'CLI や MCP に使う自分のトークンを管理します。',
          value: tokens + '件',
        },
      ])}
    </OverviewPage>,
    frame,
  )
}
export function projectsDirectory(
  frame: ConsoleFrame,
  projects: ProjectSettings[],
) {
  const path = '/settings/mailboxes'
  const list = listRows(projects, frame.query, (p) => ({
    text: p.name + ' ' + p.prefix,
    filter: p.archived ? 'archived' : 'active',
  }))
  return shell(
    directoryTitle,
    <ListPage
      title={directoryTitle}
      back={globalBack}
      action={
        <ActionLink href={path + '?new=yes'}>{projectTerm}を追加</ActionLink>
      }
      filters={
        <ListFilters
          title={projectTerm}
          path={path}
          query={frame.query}
          filterLabel="状態"
          options={[
            { value: 'active', label: '使用中' },
            { value: 'archived', label: '保管済み' },
          ]}
        />
      }
      footer={<PageLinks path={path} query={frame.query} {...list} />}
    >
      {frame.query.saved === 'deleted' && (
        <Notice toast kind="success">
          {projectTerm}を削除しました。
        </Notice>
      )}
      {list.rows.length ? (
        <nav aria-label={directoryTitle}>
          {list.rows.map((p) => (
            <SettingRow
              href={projectPath(p.id)}
              title={<ProductMark product={p} />}
              description={
                p.prefix +
                ' ・ 窓口 ' +
                p.mailboxes +
                '件 ・ メンバー ' +
                p.members +
                '人'
              }
              value={p.archived ? '保管済み' : '使用中'}
            />
          ))}
        </nav>
      ) : (
        <EmptyState icon="mail">表示する{projectTerm}がありません。</EmptyState>
      )}
    </ListPage>,
    frame,
  )
}
export function projectPicker(
  frame: ConsoleFrame,
  projects: ProjectSettings[],
) {
  const available = projects.filter((p) => !p.archived)
  return shell(
    projectTitle,
    <EditPage title={projectTitle} back={rootBack}>
      {available.length ? (
        <ProjectPickerForm
          action="/settings/projects"
          products={available}
          empty={projectTerm + 'を選ぶ'}
        />
      ) : (
        <EmptyState icon="mail">使用中の{projectTerm}がありません。</EmptyState>
      )}
    </EditPage>,
    frame,
  )
}
const roleName = (role: string) =>
  role === 'admin' ? projectTerm + 'の管理者' : '担当者'
export function projectHome(frame: ConsoleFrame, project: ProjectSettings) {
  const { id } = project
  const url = projectPath(id)
  const suffix = '?product=' + encodeURIComponent(id)
  const links: Row[] = [
    {
      title: '利用する拡張',
      href: projectPath(id, 'extensions'),
      description: project.name + 'で使う拡張を選びます。',
    },
    {
      title: '窓口と差出人',
      href: '/settings/mailboxes?edit=' + encodeURIComponent(id),
      description: 'メールの窓口、アイコン、問い合わせ番号を変更します。',
      value: project.mailboxes + '件',
    },
    {
      title: 'メンバー',
      href: projectPath(id, 'members'),
      description: '担当する運営者と役割を変更します。',
      value: project.members + '人',
    },
    {
      title: 'ラベル',
      href: projectPath(id, 'labels'),
      description: '会話に付けるラベルと色を管理します。',
    },
    {
      title: '保存期間',
      href: projectPath(id, 'retention'),
      description: '完了した会話の本文を保持する期間を設定します。',
      value: project.days ? project.days + '日' : '無期限',
    },
    {
      title: '連絡先のデータ削除',
      href: projectPath(id, 'deletion'),
      description: 'この窓口で受け付けた相手のデータを削除します。',
    },
  ]
  const extensions = frame.extensions
    .filter((e) =>
      [
        'issues',
        'chat',
        'form',
        'feedback',
        'canned',
        'notify',
        'rules',
        'export',
        'survey',
        'auto-ack',
      ].includes(e.id),
    )
    .map((e) => ({
      title: e.id === 'notify' ? '知らせの送り先' : extensionLabel(e.id),
      href: '/extensions/' + e.id + suffix,
      description:
        e.id === 'canned'
          ? '定型文を作成し、ほかの' + projectTerm + 'から写せます。'
          : project.name + 'の設定を確認します。',
    }))
  return shell(
    project.name,
    <OverviewPage
      title={<ProductMark product={project} size="heading" />}
      description={
        project.archived
          ? '保管済み · 新しい問い合わせの受付は終了しています。'
          : '使用中'
      }
      back={rootBack}
    >
      {frame.query.saved && (
        <Notice toast kind="success">
          設定を保存しました。
        </Notice>
      )}
      {rows(links)}
      {!!extensions.length && (
        <FormSection title="拡張の設定">
          {rows(extensions, '拡張の設定')}
        </FormSection>
      )}
      <FormSection title="公開のヘルプ">
        <form method="post" action={url + '/publication'}>
          <label>
            <Input
              type="checkbox"
              name="published"
              checked={project.publicHelp}
            />{' '}
            ヘルプの入口にこの{projectTerm}を掲載する
          </label>
          <Button>公開設定を保存</Button>
        </form>
      </FormSection>
      {can(frame.operator, 'global').allowed && (
        <FormSection
          title="保管"
          description={'状態：' + (project.archived ? '保管済み' : '使用中')}
        >
          <form method="post" action={url + '/archive'}>
            <Input
              type="hidden"
              name="state"
              value={project.archived ? 'active' : 'archived'}
            />
            <Button>{project.archived ? '使用中に戻す' : '保管する'}</Button>
          </form>
        </FormSection>
      )}
      {can(frame.operator, 'global').allowed && (
        <FormSection
          title={projectTerm + 'の削除'}
          description={'過去の会話を残す場合は保管してください。'}
        >
          <Button
            variant="destructive"
            {...{ commandfor: 'delete-project', command: 'show-modal' }}
          >
            削除内容を確認
          </Button>
          <Dialog
            id="delete-project"
            title={project.name + ' を削除しますか？'}
            description={
              '窓口 ' +
              project.mailboxes +
              '件、会話 ' +
              project.conversations +
              '件、添付ファイルと設定を削除します。この操作は取り消せません。'
            }
          >
            <form method="post" action={url + '/delete'}>
              <Input
                type="hidden"
                name="conversations"
                value={project.conversations}
              />
              <Field label={'確認のため「' + project.name + '」と入力'}>
                <Input name="name" required autocomplete="off" />
              </Field>
              <ActionBar>
                <Button
                  autofocus
                  type="button"
                  {...{ commandfor: 'delete-project', command: 'close' }}
                >
                  キャンセル
                </Button>
                <Button variant="destructive">{projectTerm}を削除</Button>
              </ActionBar>
            </form>
          </Dialog>
        </FormSection>
      )}
    </OverviewPage>,
    frame,
  )
}
export function projectOperators(frame: ConsoleFrame, operators: Person[]) {
  const person = operators.find((o) => o.email === frame.query.edit)
  if (person)
    return operatorEditor(
      frame,
      person,
      operators.filter((o) => o.role === 'admin').length === 1 &&
        person.role === 'admin',
    )
  const path = '/settings/operators'
  const list = listRows(operators, frame.query, (o) => ({
    text: o.displayName + ' ' + o.email,
    filter: o.role,
  }))
  return shell(
    '運営者',
    <ListPage
      title="運営者"
      back={globalBack}
      filters={
        <ListFilters
          title="運営者"
          path={path}
          query={frame.query}
          filterLabel="権限で絞り込む"
          options={[
            { value: 'admin', label: '管理者' },
            { value: 'agent', label: '担当者' },
          ]}
        />
      }
      footer={<PageLinks path={path} query={frame.query} {...list} />}
    >
      {frame.query.saved && (
        <Notice toast kind="success">
          運営者の情報を保存しました。
        </Notice>
      )}
      {list.rows.length ? (
        <nav aria-label="運営者一覧">
          {list.rows.map((o) => (
            <SettingRow
              title={o.displayName}
              href={path + '?edit=' + encodeURIComponent(o.email)}
              description={[
                o.projects.length + '件',
                ...o.projects.slice(0, 3).map((p) => p.name),
                ...(o.projects.length > 3
                  ? ['ほか ' + (o.projects.length - 3) + '件']
                  : []),
              ].join(' ・ ')}
              value={o.role === 'admin' ? '全体の管理者' : '担当者'}
            />
          ))}
        </nav>
      ) : (
        <EmptyState icon="search">条件に合う運営者はいません。</EmptyState>
      )}
    </ListPage>,
    frame,
  )
}
function operatorEditor(frame: ConsoleFrame, o: Person, last: boolean) {
  return shell(
    o.displayName,
    <EditPage
      title={o.displayName}
      back={{ href: '/settings/operators', label: '運営者に戻る' }}
    >
      <FormSection title="全体の役割" description={o.email}>
        {action(
          'role',
          '運営者を保存',
          <>
            <Input type="hidden" name="email" value={o.email} />
            <Field label="表示名">
              <Input name="displayName" maxlength={100} value={o.displayName} />
            </Field>
            {last ? (
              <>
                <p>
                  最後の管理者です。権限を変更するには、先にほかの運営者を管理者にしてください。
                </p>
                <Input type="hidden" name="role" value="admin" />
              </>
            ) : (
              select(
                'role',
                '権限',
                { admin: '全体の管理者', agent: '担当者' },
                o.role,
              )
            )}
          </>,
        )}
      </FormSection>
      <FormSection title={'所属する' + projectTerm}>
        {o.projects.length ? (
          rows(
            o.projects.map((p) => ({
              title: p.name,
              description: roleName(p.role),
              href: projectPath(p.id, 'members'),
            })),
          )
        ) : (
          <p>所属先はありません。</p>
        )}
      </FormSection>
    </EditPage>,
    frame,
  )
}
