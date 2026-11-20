import type { ConsoleFrame } from '../conversations/console-usecase'
import { shell } from '../conversations/console-page'
import { extensionLabel } from '../extensions/extension-labels'
import { guides } from '../extensions/extension-guides'
import { forProject, type Installed } from '../extensions/registry'
import { ActionLink, Button } from '../../ui/controls'
import { FormSection, OverviewPage, Notice } from '../../ui/patterns'
import {
  projectBack,
  projectPath,
  extensionSettingsPath,
} from './project-setting-links'

export function projectExtensionPage(
  frame: ConsoleFrame,
  project: { id: string; name: string },
  items: Installed[],
) {
  return shell(
    '利用する拡張',
    <OverviewPage
      title="利用する拡張"
      description={project.name}
      back={projectBack(project.id)}
    >
      {frame.query.saved && (
        <Notice kind="success" toast>
          拡張の設定を保存しました。
        </Notice>
      )}
      {!items.length && <p>全体の設定で提供されている拡張はありません。</p>}
      {items.map((item) => {
        const id = item.extension.id
        const active = forProject(item, project.id)
        const needsApproval =
          active &&
          item.extension.permissions.includes('send') &&
          !active.enabledBy
        return (
          <FormSection title={extensionLabel(id)}>
            <p>{guides[id]?.description}</p>
            <p>
              {needsApproval ? '自動送信の承認待ち' : active ? '有効' : '無効'}
            </p>
            <form
              method="post"
              action={projectPath(project.id, 'extensions/' + id)}
              data-layout="cluster"
              data-gap="sm"
            >
              <Button
                name="enabled"
                value={active && !needsApproval ? 'no' : 'yes'}
              >
                {needsApproval
                  ? '自動送信を承認する'
                  : active
                    ? '無効にする'
                    : '有効にする'}
              </Button>
              {needsApproval && (
                <Button name="enabled" value="no">
                  無効にする
                </Button>
              )}
              <ActionLink
                href={
                  '/extensions/' +
                  id +
                  '/details?' +
                  new URLSearchParams({ product: project.id })
                }
              >
                詳細
              </ActionLink>
              {active && (
                <ActionLink href={extensionSettingsPath(id, project.id)}>
                  設定
                </ActionLink>
              )}
            </form>
          </FormSection>
        )
      })}
    </OverviewPage>,
    frame,
  )
}
