import type { ConsoleFrame } from '../conversations/console-usecase'
import type {
  projectMembers,
  searchProjectOperators,
} from '../operators/project-members-usecase'
import { shell, select } from '../conversations/console-page'
import { projectPath, projectBack } from './project-setting-links'
import { projectTerm } from './project-term'
import { Cluster } from '../../ui/layout'
import { operatorAvatar } from '../../ui/operator-identity'
import {
  EditPage,
  RowList,
  ListRow,
  FormSection,
  ActionBar,
  Notice,
  EmptyState,
} from '../../ui/patterns'
import { Field, Input, Button, NativeSelect, Dialog } from '../../ui/controls'
import { Disclosure } from '../../ui/admin'

const roles = { agent: '担当者', admin: projectTerm + 'の管理者' }
type Member = Awaited<ReturnType<typeof projectMembers>>[number]
type Candidate = Awaited<ReturnType<typeof searchProjectOperators>>[number]
function memberControls(
  url: string,
  member: Member,
  index: number,
  last: boolean,
) {
  if (last)
    return (
      <small>
        最後の管理者です。先にほかのメンバーを管理者にしてください。
      </small>
    )
  return (
    <Disclosure title="編集" accessibleName={'編集：' + member.displayName}>
      <form method="post" action={url}>
        <Input type="hidden" name="email" value={member.email} />
        {select('role', '役割', roles, member.role)}
        <Button>役割を保存</Button>
      </form>
      <Button
        variant="destructive"
        {...{ commandfor: 'remove-member-' + index, command: 'show-modal' }}
      >
        メンバーから外す
      </Button>
      <Dialog
        id={'remove-member-' + index}
        title={member.displayName + ' をメンバーから外しますか？'}
        description={
          '担当している会話 ' + member.assigned + '件は「担当なし」に戻ります。'
        }
      >
        <ActionBar>
          <form method="dialog">
            <Button autofocus>キャンセル</Button>
          </form>
          <form method="post" action={url + '/remove'}>
            <Input type="hidden" name="email" value={member.email} />
            <Input type="hidden" name="assigned" value={member.assigned} />
            <Button variant="destructive">メンバーから外す</Button>
          </form>
        </ActionBar>
      </Dialog>
    </Disclosure>
  )
}
export function membersPage(
  frame: ConsoleFrame,
  project: { id: string; name: string },
  members: Member[],
  candidates: Candidate[],
) {
  const url = projectPath(project.id, 'members')
  const admins = members.filter((m) => !m.invited && m.role === 'admin')
  const query = frame.query.q
  return shell(
    'メンバー',
    <EditPage
      title="メンバー"
      description={project.name}
      back={projectBack(project.id)}
    >
      {frame.query.saved && (
        <Notice toast kind="success">
          メンバーを更新しました。
        </Notice>
      )}
      <FormSection title={'所属するメンバー（' + members.length + '人）'}>
        <RowList className="project-member-list">
          {members.map((m, i) => (
            <ListRow
              title={
                <Cluster as="span" gap="xs">
                  {operatorAvatar(m)} {m.displayName}
                </Cluster>
              }
              description={
                <>
                  <span>{m.email}</span>
                  <small>
                    {(m.invited ? '招待中 ・ ' : '') + roles[m.role]}
                  </small>
                </>
              }
              action={memberControls(
                url,
                m,
                i,
                admins.length === 1 && admins[0].email === m.email,
              )}
            />
          ))}
        </RowList>
      </FormSection>
      <FormSection title="運営者を追加">
        <form method="get" action={url}>
          <Field label="運営者を名前で検索">
            <Input type="search" name="q" value={query} required />
          </Field>
          <Button>検索</Button>
        </form>
        {query &&
          (candidates.length ? (
            <form action={url} method="post">
              <Field label="追加する運営者">
                <NativeSelect name="email" required>
                  {candidates.map((p) => (
                    <option value={p.email}>
                      {p.displayName} ・ {p.email}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              {select('role', '追加する役割', roles, 'agent')}
              <Button>メンバーに追加</Button>
            </form>
          ) : (
            <EmptyState icon="search">
              追加できる運営者が見つかりません。
            </EmptyState>
          ))}
      </FormSection>
      <FormSection
        title="メールアドレスで招待"
        description="初回ログインでこのメンバー一覧に登録されます。"
      >
        <form action={url} method="post">
          <Field label="招く人のメールアドレス">
            <Input type="email" name="email" required />
          </Field>
          {select('role', '招く人の役割', roles, 'agent')}
          <Button>招待する</Button>
        </form>
      </FormSection>
    </EditPage>,
    frame,
  )
}
