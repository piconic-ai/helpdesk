import { extensionSettingsPath } from '../core/settings/project-setting-links'
import { Input, NativeSelect } from '../ui/controls'
import { SaveActions, Disclosure } from '../ui/admin'
import type { recommendationForm } from './recommendation-settings-usecase'

export type RecommendationForm = Awaited<ReturnType<typeof recommendationForm>>
function modelOptions(selected: string) {
  return ['clef-flash', 'clef'].map((model) => (
    <option value={model} selected={selected === model}>
      {model === 'clef'
        ? 'Clef（より長い記事に対応）'
        : 'Clef Flash（チャットの標準）'}
    </option>
  ))
}
export function RecommendationSettings({
  product,
  settings,
}: {
  product: string
  settings: RecommendationForm
}) {
  const { policy, revision } = settings
  return (
    <Disclosure title="記事のおすすめを設定">
      <form method="post" action="/extensions/chat/recommendations">
        <input type="hidden" name="product" value={product} />
        <input type="hidden" name="revision" value={revision} />
        <label>
          記事を提示する確率の下限（%）
          <Input
            type="number"
            name="threshold"
            min={0}
            max={100}
            step="any"
            required
            value={Number((policy.threshold * 100).toFixed(8))}
          />
        </label>
        <p>この値を超えた記事を、確率の高い順に3件まで提示します。</p>
        <label>
          チャット・フォームのモデル
          <NativeSelect name="interactiveModel">
            {modelOptions(policy.interactiveModel)}
          </NativeSelect>
        </label>
        <label>
          受付返信・運営画面のモデル
          <NativeSelect name="backgroundModel">
            {modelOptions(policy.backgroundModel)}
          </NativeSelect>
        </label>
        <label>
          <Input type="checkbox" name="autoAck" checked={policy.autoAck} />
          自動の受付返信に関連記事を添える
        </label>
        <SaveActions
          verb="記事のおすすめ設定を保存"
          cancel={extensionSettingsPath('chat', product)}
        />
      </form>
    </Disclosure>
  )
}
