import type { IntakePolicy } from '../core/intakes/intake'
import { ActionLink, Button, Field, Input, Textarea } from '../ui/controls'
import { DetailPage, EditPage, ListPage, Notice } from '../ui/patterns'
import {
  Challenge,
  PublicForm,
  PublicLinks,
  ReceiptDetails,
} from '../ui/public-forms'

export type FormKind = 'form' | 'chat' | 'feedback'
export type Fields = Record<string, string>
const titles = {
  form: 'お問い合わせ',
  chat: 'ヘルプチャット',
  feedback: 'フィードバック',
}
const fieldsByKind = {
  form: { name: 'body', label: 'お問い合わせ内容', limit: 100000 },
  feedback: { name: 'body', label: 'ご意見・ご要望', limit: 100000 },
  chat: { name: 'question', label: '質問', limit: 30000 },
}

function EmailField({ value }: { value?: string }) {
  return (
    <Field label="連絡先メールアドレス">
      <Input
        name="email"
        type="email"
        autocomplete="email"
        required
        value={value ?? ''}
      />
    </Field>
  )
}
function IntakeKey({ policy }: { policy: IntakePolicy }) {
  return <input type="hidden" name="publicKey" value={policy.publicKey} />
}
function Verification({ policy }: { policy: IntakePolicy }) {
  return policy.turnstileSecretBinding ? (
    <Challenge siteKey={policy.turnstileSiteKey} />
  ) : null
}
export function intakePage(
  kind: FormKind,
  policy: IntakePolicy,
  fields: Fields = {},
  requestContact = false,
  error = '',
) {
  const title = titles[kind]
  const chat = kind === 'chat'
  const search = chat && !requestContact
  const field = fieldsByKind[kind]
  return {
    title,
    html: String(
      <EditPage title={title}>
        {error && <Notice kind="error">{error}</Notice>}
        <PublicForm>
          <IntakeKey policy={policy} />
          {kind === 'form' && (
            <Field label="件名">
              <Input
                name="subject"
                required
                maxlength={500}
                value={fields.subject ?? ''}
              />
            </Field>
          )}
          <Field label={field.label}>
            <Textarea
              name={field.name}
              rows={4}
              required
              maxlength={field.limit}
            >
              {fields[field.name] ?? ''}
            </Textarea>
          </Field>
          {chat && requestContact && (
            <>
              <input type="hidden" name="handoff" value="yes" />
              <p>担当者から返信するための連絡先を入力してください。</p>
            </>
          )}
          {!search && <EmailField value={fields.email} />}
          <Verification policy={policy} />
          <Button variant="default" type="submit">
            {search ? '質問する' : '送信'}
          </Button>
        </PublicForm>
      </EditPage>,
    ),
  }
}

export function receiptPage(
  kind: FormKind,
  number: number,
  fields: Fields,
  responseTime: string | null,
) {
  const title =
    (kind === 'feedback'
      ? 'フィードバックを受け付けました'
      : '問い合わせを受け付けました') +
    '（#' +
    number +
    '）'
  const entries: [string, string | undefined][] = []
  if (kind === 'chat') entries.push(['質問', fields.question])
  entries.push([
    kind === 'feedback' ? '登録した連絡先' : '返信先',
    fields.email,
  ])
  if (kind !== 'feedback' && responseTime)
    entries.push(['返信の目安', responseTime])
  return {
    title,
    html: String(
      <DetailPage title={titles[kind]}>
        <Notice kind="success">{title}</Notice>
        <ReceiptDetails entries={entries} />
        {kind === 'feedback' && <p>フィードバックへの返信はありません。</p>}
      </DetailPage>,
    ),
  }
}

export function matchingArticles(
  items: { id: string; title: string; url: string }[],
  policy: IntakePolicy,
  question: string,
) {
  const title = '関連する記事'
  return {
    title,
    html: String(
      <ListPage title={title} description={question}>
        <PublicLinks
          newTab
          items={items.map((a) => ({
            label: a.title + '（新しいタブ）',
            path: a.url,
          }))}
        />
        <details>
          <summary role="button">解決しなかったので問い合わせる</summary>
          <PublicForm>
            <IntakeKey policy={policy} />
            <input type="hidden" name="handoff" value="yes" />
            <input type="hidden" name="question" value={question} />
            <EmailField />
            <Verification policy={policy} />
            <Button type="submit" variant="default">
              送信
            </Button>
          </PublicForm>
        </details>
        <ActionLink variant="ghost" href="">
          別の質問をする
        </ActionLink>
      </ListPage>,
    ),
  }
}
export function intakeUnavailable() {
  const title = '受付を一時停止しています'
  return {
    title,
    html: String(
      <DetailPage title={title}>
        <p>しばらくしてから、もう一度お試しください。</p>
      </DetailPage>,
    ),
  }
}
