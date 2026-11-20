import { extensionBack } from '../core/settings/project-setting-links'
import { projectTerm } from '../core/settings/project-term'
import type { ConsoleFrame } from '../core/conversations/console-usecase'
import type { AutomaticPolicy } from '../extensions/automatic-message'
import { extensionLabel } from '../core/extensions/extension-labels'
import { FormSection, ActionBar, EditPage, Notice } from '../ui/patterns'
import {
  Field,
  Button,
  Input,
  NativeSelect,
  Textarea,
  ActionLink,
} from '../ui/controls'
import { BodyText } from '../ui/admin'
import { shell } from '../ui/console-shell'
import { productSelect } from './extension-admin-page'

type MessageForm = {
  product: string
  productName: string
  language: 'ja' | 'en'
  wording: string
  revision: string
  subject: string
  preview: string
}
type Approval = { by: string | null; at: number | null }
const timestamp = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  dateStyle: 'medium',
  timeStyle: 'short',
})
export function automaticMailPage(
  id: AutomaticPolicy,
  frame: ConsoleFrame,
  approval: Approval,
  data?: MessageForm,
  notice?: string,
  error = false,
) {
  const policy = extensionLabel(id)
  const path = '/extensions/' + id
  return shell(
    policy,
    <EditPage title={policy} back={extensionBack(frame.query.product)}>
      {notice && (
        <Notice toast kind={error ? 'error' : 'success'}>
          {notice}
        </Notice>
      )}
      <FormSection title="自動送信の承認">
        <p>
          {id === 'auto-ack'
            ? '初めて受け付けた問い合わせメールに自動で返信します。'
            : '問い合わせを完了すると、回答用のリンクを自動で送ります。'}
        </p>
        <p>承認の対象は、{data?.productName ?? '選択したプロジェクト'}です。</p>
        {approval.by ? (
          <p>
            有効にした運営者：
            {frame.operators.find((o) => o.email === approval.by)?.displayName}
            （{approval.by}）<br />
            有効化日時：
            {approval.at == null ? (
              '記録なし'
            ) : (
              <time datetime={new Date(approval.at).toISOString()}>
                {timestamp.format(approval.at)}（日本時間）
              </time>
            )}
          </p>
        ) : (
          <p>管理者の有効化が記録されていないため、自動送信は停止中です。</p>
        )}
      </FormSection>
      {data ? (
        <>
          <form method="get" action={path} data-live-filters="">
            {productSelect(frame, data.product)}
            <noscript>
              <Button>{projectTerm}を表示</Button>
            </noscript>
          </form>
          <FormSection title={data.productName + ' の送信文面'}>
            <p>
              問い合わせ番号と件名は表示例です。
              {id === 'survey' && '回答先は送信ごとに発行する専用リンクです。'}
            </p>
            <strong>件名　{data.subject}</strong>
            <BodyText>{data.preview}</BodyText>
          </FormSection>
          <FormSection title="文面を編集">
            <form
              method="post"
              action={path + '/message'}
              data-draft-screen={path}
            >
              <Input type="hidden" name="product" value={data.product} />
              <Input type="hidden" name="revision" value={data.revision} />
              <Field
                label="自動送信の案内の言語"
                description="定型の案内と既定の本文に使います。編集した本文はそのまま送ります。"
              >
                <NativeSelect name="language">
                  <option value="ja" selected={data.language === 'ja'}>
                    日本語
                  </option>
                  <option value="en" selected={data.language === 'en'}>
                    英語
                  </option>
                </NativeSelect>
              </Field>
              <Field
                label="本文"
                description="自動送信の表示と問い合わせ番号は自動で入ります。"
              >
                <Textarea name="body" required rows={4} maxlength={8000}>
                  {data.wording}
                </Textarea>
              </Field>
              <ActionBar>
                <Button variant="outline" name="intent" value="preview">
                  プレビュー
                </Button>
                <Button variant="default" name="intent" value="save">
                  文面を保存
                </Button>
                <ActionLink
                  variant="ghost"
                  data-discard-draft=""
                  href={
                    path + '?' + new URLSearchParams({ product: data.product })
                  }
                >
                  取り消し
                </ActionLink>
              </ActionBar>
            </form>
          </FormSection>
        </>
      ) : (
        <p>「{projectTerm}と窓口」で窓口を登録すると文面を編集できます。</p>
      )}
      <FormSection title="使用する権限">
        <p>メール送信</p>
      </FormSection>
    </EditPage>,
    frame,
  )
}
