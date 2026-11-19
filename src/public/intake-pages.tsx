import type { IntakePolicy } from '../core/intakes/intake'
import {
  ActionLink,
  Button,
  Field,
  Input,
  NativeSelect,
  Textarea,
} from '../ui/controls'
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

function EmailField({
  value,
  optional = false,
}: {
  value?: string
  optional?: boolean
}) {
  return (
    <Field
      label={optional ? '連絡先メールアドレス（任意）' : '連絡先メールアドレス'}
    >
      <Input
        name="email"
        type="email"
        autocomplete="email"
        required={!optional}
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
  offerArticles = false,
) {
  const title = titles[kind]
  const chat = kind === 'chat'
  const search = chat && !requestContact
  const field = fieldsByKind[kind]
  return {
    title,
    html: String(
      <EditPage
        title={title}
        description={
          kind === 'form' &&
          (offerArticles
            ? 'すべての項目を入力してください。送信前に関連記事が見つかった場合は、ご案内します。'
            : 'すべての項目を入力してください。')
        }
      >
        {error && <Notice kind="error">{error}</Notice>}
        <PublicForm>
          <IntakeKey policy={policy} />
          {fields.submissionId && (
            <input
              type="hidden"
              name="submissionId"
              value={fields.submissionId}
            />
          )}
          {fields.presentations && (
            <input
              type="hidden"
              name="presentations"
              value={fields.presentations}
            />
          )}
          {fields.send === 'yes' && (
            <input type="hidden" name="send" value="yes" />
          )}
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
          {!search && (
            <EmailField value={fields.email} optional={kind === 'feedback'} />
          )}
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
    fields.email || '登録なし',
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
  presentation?: string,
  needsHuman = false,
) {
  const title = '関連する記事'
  return {
    title,
    html: String(
      <ListPage title={title} description={question}>
        {needsHuman && (
          <ActionLink href="#contact-answer">担当者に問い合わせる</ActionLink>
        )}
        <PublicLinks
          newTab
          items={items.map((a) => ({
            label: a.title + '（新しいタブ）',
            path: a.url,
          }))}
        />
        {presentation && (
          <PublicForm>
            <IntakeKey policy={policy} />
            <input type="hidden" name="turn" value={presentation} />
            <input type="hidden" name="intent" value="resolve" />
            {items.length === 1 ? (
              <input type="hidden" name="article" value={items[0].id} />
            ) : (
              <Field label="解決に役立った記事">
                <NativeSelect name="article">
                  {items.map((a) => (
                    <option value={a.id}>{a.title}</option>
                  ))}
                </NativeSelect>
              </Field>
            )}
            <Verification policy={policy} />
            <Button type="submit">解決した</Button>
          </PublicForm>
        )}
        <details id="contact-answer" open={needsHuman}>
          <summary role="button">解決しなかったので問い合わせる</summary>
          <PublicForm>
            <IntakeKey policy={policy} />
            <input type="hidden" name="handoff" value="yes" />
            {presentation && (
              <>
                <input
                  type="hidden"
                  name="presentations"
                  value={presentation}
                />
                <input type="hidden" name="submissionId" value={presentation} />
              </>
            )}
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

export function formSuggestions(
  items: { title: string; url: string }[],
  policy: IntakePolicy,
  fields: Fields,
) {
  const title = 'この記事で解決しませんか'
  return {
    title,
    html: String(
      <DetailPage title={title}>
        <PublicLinks
          newTab
          items={items.map((a) => ({
            label: a.title + '（新しいタブ）',
            path: a.url,
          }))}
        />
        <PublicForm>
          <IntakeKey policy={policy} />
          {['subject', 'email', 'body', 'presentations', 'submissionId'].map(
            (name) => (
              <input type="hidden" name={name} value={fields[name]} />
            ),
          )}
          <input type="hidden" name="send" value="yes" />
          <ReceiptDetails
            entries={[
              ['件名', fields.subject],
              ['お問い合わせ内容', fields.body],
              ['返信先', fields.email],
            ]}
          />
          <Verification policy={policy} />
          <Button type="submit" variant="default">
            このまま送る
          </Button>
        </PublicForm>
      </DetailPage>,
    ),
  }
}
export function chatResolvedPage() {
  const title = '記事で解決したことを記録しました。'
  return {
    title,
    html: String(
      <DetailPage title="ヘルプチャット">
        <Notice kind="success">{title}</Notice>
        <ActionLink href="">別の質問をする</ActionLink>
      </DetailPage>,
    ),
  }
}
