import { shell } from '../conversations/console-page'
import type { ConsoleFrame } from '../conversations/console-usecase'
import {
  projectPath,
  extensionSettingsPath,
} from '../settings/project-setting-links'
import { DetailPage, FormSection } from '../../ui/patterns'
import { Definitions } from '../../ui/admin'
import { ActionLink } from '../../ui/controls'
import { guides, permissionText } from './extension-guides'
import { extensionLabel } from './extension-labels'
import type { Extension } from './extension'

export function extensionDetailsPage(
  frame: ConsoleFrame,
  extension: Extension,
  enabled: boolean,
  product?: string,
) {
  const { id } = extension
  const guide = Object.hasOwn(guides, id) ? guides[id] : undefined
  const name = extensionLabel(id)
  return shell(
    name + 'の詳細',
    <DetailPage
      title={name + 'の詳細'}
      description={guide?.description}
      back={
        product
          ? {
              href: projectPath(product, 'extensions'),
              label: 'プロジェクトの拡張に戻る',
            }
          : { href: '/extensions', label: '拡張の管理に戻る' }
      }
    >
      {guide && (
        <FormSection title="この拡張の動作">
          <Definitions>
            <dt>いつ動くか</dt>
            <dd>{guide.when}</dd>
            <dt>何が起きるか</dt>
            <dd>{guide.effect}</dd>
          </Definitions>
          {id === 'issues' && frame.demoGithub && (
            <p>このデモの起票先は模擬 GitHub です。</p>
          )}
        </FormSection>
      )}
      <FormSection title="使い始めるには">
        {guide && <p>{guide.start}</p>}
        {enabled && (
          <ActionLink
            variant="outline"
            href={extensionSettingsPath(id, product)}
          >
            設定を開く
          </ActionLink>
        )}
        {!enabled && (
          <p>
            {product
              ? 'このプロジェクトで有効にすると、設定を開けます。'
              : 'この環境で提供を開始すると、プロジェクトで有効にできます。'}
          </p>
        )}
      </FormSection>
      <FormSection title="使用する権限">
        <p>{permissionText(extension.permissions)}</p>
      </FormSection>
    </DetailPage>,
    frame,
  )
}
