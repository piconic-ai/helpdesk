import { projectBack, projectPath } from '../settings/project-setting-links'
import { projectTerm } from '../settings/project-term'
import { extensionLabel } from '../extensions/extension-labels'
import { ProductIconForm } from '../settings/product-icon-page'
import { ProductMark } from '../../ui/product-mark'
import { ActionLink, Dialog } from '../../ui/controls'
import {
  EditPage,
  RowList,
  Notice,
  EmptyState,
  ActionBar,
  FormSection,
} from '../../ui/patterns'
import { Button, Field, Input, NativeSelect } from '../../ui/controls'
import { SaveActions, Disclosure } from '../../ui/admin'
import { replyDelayLabels } from '../settings/reply-delay'
import { field, select } from './console-page'
import type { Result } from './inbox-page'
import type { ConsoleFrame } from './console-usecase'

type Section = 'mailboxes' | 'operators' | 'labels' | 'retention' | 'deletion'
type Data = Pick<Result<'settings'>, 'mailboxes' | 'retentionDays'>
type Contact = { email: string; name: string | null; conversations: number }

function setupIssue(issue: string) {
  if (issue.startsWith('Register the first mailbox'))
    return '最初の窓口を登録してください。'
  const domain = issue.match(/^Enable (\S+) in Cloudflare/)
  if (domain)
    return (
      domain[1] +
      ' のメール送信を有効にし、SENDING_DOMAINS に追加してください。'
    )
  if (issue.includes('comma-separated'))
    return 'SENDING_DOMAINS に送信ドメインをカンマ区切りで指定してください。'
  if (issue.includes('SENDING_DOMAINS'))
    return 'Cloudflare で窓口ドメインのメール送信を有効にし、SENDING_DOMAINS に設定してください。'
  return issue
}
export function setupIssues(issues: string[]) {
  return (
    issues.length > 0 && (
      <Notice kind="error">
        <h2>初期設定が必要です</h2>
        <ul>
          {issues.map((i) => (
            <li>{setupIssue(i)}</li>
          ))}
        </ul>
      </Notice>
    )
  )
}

function addressFields(domains: string[]) {
  if (!domains.length)
    return field('address', '窓口のメールアドレス', '', 'email', true)
  return (
    <>
      <Field label="窓口アドレスの先頭">
        <Input
          name="local"
          required
          pattern="[^@\s]+"
          title="空白と @ を除き、アドレスの @ より前の部分を入力してください。"
          maxlength={64}
        />
      </Field>
      {select(
        'domain',
        '送信ドメイン',
        Object.fromEntries(domains.map((d) => [d, d])),
        domains[0],
      )}
    </>
  )
}
type PrefixError = { input: string; message: string }

export function mailboxPage(
  data: Data,
  domains: string[],
  frame: ConsoleFrame,
  notice: ReturnType<typeof Notice> | false,
  prefixError?: PrefixError,
) {
  const path = '/settings/mailboxes'
  const back = frame.query.edit
    ? projectBack(frame.query.edit)
    : { href: path, label: projectTerm + 'と窓口に戻る' }
  if (frame.query.new === 'yes')
    return (
      <EditPage title={'新しい' + projectTerm + 'と窓口'} back={back}>
        <FormSection title="窓口を登録" id="mailboxes">
          <form method="post" action={path}>
            {field('name', projectTerm + '名', '', 'text', true)}
            {addressFields(domains)}
            <MailboxPolicies extensions={frame.extensions} />
            <SaveActions
              verb={
                frame.extensions.some((e) => e.permitsMail)
                  ? '自動送信を承認して窓口を登録'
                  : '窓口を登録'
              }
              cancel={path}
              primary
            />
          </form>
        </FormSection>
      </EditPage>
    )
  const product = frame.products.find((p) => p.id === frame.query.edit)
  if (!product)
    return <EmptyState icon="search">窓口が見つかりません。</EmptyState>
  return (
    <EditPage
      title={<ProductMark product={product} size="heading" />}
      back={back}
    >
      {notice}
      <FormSection title="問い合わせ番号">
        <form
          method="post"
          action={'/settings/ticket-prefix/' + encodeURIComponent(product.id)}
        >
          <Field
            label="問い合わせ番号の接頭辞"
            description="重複しない英大文字2〜5字を入力してください。"
          >
            <Input
              name="prefix"
              value={prefixError?.input ?? product.ticketPrefix}
              required
              pattern="[A-Z]{2,5}"
              aria-invalid={prefixError ? 'true' : undefined}
              aria-describedby={prefixError ? 'ticket-prefix-error' : undefined}
            />
          </Field>
          {prefixError && (
            <p id="ticket-prefix-error" role="alert">
              {prefixError.message}
            </p>
          )}
          <Button>接頭辞を保存</Button>
        </form>
      </FormSection>
      <FormSection title="アイコンとメール差出人">
        <Disclosure title={projectTerm + 'のアイコンを変更'}>
          <ProductIconForm product={product} />
        </Disclosure>
        <form
          method="post"
          action={'/settings/senders/' + encodeURIComponent(product.id)}
        >
          <h3>メール差出人</h3>
          {field(
            'senderName',
            '差出人名',
            product.senderName ?? product.name,
            'text',
            true,
          )}
          <label>
            <Input
              type="checkbox"
              name="showOperator"
              checked={product.showOperator}
            />{' '}
            返信した運営者の表示名を差出人に含める
          </label>
          {select(
            'language',
            '窓口の言語',
            { ja: '日本語', en: '英語' },
            product.language,
          )}
          {select(
            'minimumReplyDelay',
            '返信を取り消せる時間の下限',
            replyDelayLabels,
            String(product.minimumReplyDelay),
          )}
          <small>
            この窓口からの返信は、少なくとも選んだ時間だけ待ってから送ります。長くすると相手に届くのが遅くなります。
          </small>
          <SaveActions verb="差出人を保存" cancel={projectPath(product.id)} />
        </form>
      </FormSection>
      <FormSection title="登録済みの窓口">
        {data.mailboxes
          .filter((m) => m.product === product.id)
          .map((m) => (
            <p>{m.address}</p>
          ))}
        <Disclosure title={'この' + projectTerm + 'に窓口を追加'}>
          <form method="post" action={path}>
            <Input type="hidden" name="product" value={product.id} />
            {addressFields(domains)}
            <SaveActions verb="窓口を追加" cancel={projectPath(product.id)} />
          </form>
        </Disclosure>
      </FormSection>
    </EditPage>
  )
}
function MailboxPolicies({ extensions }: Pick<ConsoleFrame, 'extensions'>) {
  const sending = extensions.filter((item) => item.permitsMail)
  const policies: Record<string, string> = {
    'auto-ack':
      '相手から最初の問い合わせを受け付けたとき、受付メールを返します。',
    survey: '問い合わせを完了すると、対象の相手に回答を依頼します。',
    notify:
      'メール通知先が設定されている場合、新着と担当者の割り当てをその通知先に知らせます。',
  }
  if (!sending.length)
    return <small>この窓口で自動送信する拡張はありません。</small>
  return (
    <div>
      <p>窓口を登録すると、次の自動送信を承認します。</p>
      <RowList>
        {sending.map((item) => (
          <li data-layout="stack" data-gap="xs">
            <span>
              {extensionLabel(item.id)}
              {policies[item.id] && '：' + policies[item.id]}
            </span>
            <ActionLink
              href={'/extensions/' + item.id}
              variant="ghost"
              target="_blank"
              rel="noopener"
            >
              {item.id === 'notify'
                ? '通知先を確認'
                : extensionLabel(item.id) + 'の文面を確認'}
              （新しいタブ）
            </ActionLink>
          </li>
        ))}
      </RowList>
    </div>
  )
}
export function retention(data: Data, product: string) {
  return (
    <FormSection title="完了した会話の保存期間" id="retention">
      <form action="/actions/retention" method="post">
        <Input type="hidden" name="product" value={product} />
        <fieldset data-retention-mode="">
          <legend>保持する期間</legend>
          <label>
            <Input
              type="radio"
              name="retentionMode"
              value="unlimited"
              checked={!data.retentionDays}
            />
            無期限
          </label>
          <label>
            <Input
              type="radio"
              name="retentionMode"
              value="limited"
              checked={!!data.retentionDays}
            />
            日数を指定
          </label>
        </fieldset>
        <Field label="完了後に本文を保持する日数">
          <Input
            name="days"
            type="number"
            min="1"
            max="36500"
            required
            value={data.retentionDays || 30}
          />
        </Field>
        <SaveActions
          verb="保存期間を変更"
          cancel={projectPath(product)}
          primary
        />
      </form>
    </FormSection>
  )
}
export function deletion(contacts: Contact[], product: string) {
  return (
    <FormSection id="forget" title="相手を選んでデータを削除">
      <p>指定した相手の会話、メール原文、添付ファイルを削除します。</p>
      {!contacts.length ? (
        <EmptyState icon="mine">削除できる連絡先はありません。</EmptyState>
      ) : (
        <form action="/actions/forget" method="post" data-forget="">
          <Input type="hidden" name="product" value={product} />
          <Field label="削除する相手">
            <NativeSelect name="contact" required>
              <option value="">相手を選んでください</option>
              {contacts.map((c) => (
                <option value={c.email} data-conversations={c.conversations}>
                  {c.name ? c.name + ' · ' : ''}
                  {c.email}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Button variant="destructive" type="button" data-confirm-forget="">
            削除内容を確認
          </Button>
          <Dialog
            id="delete-contact"
            title="連絡先のデータを削除しますか？"
            description={
              <>
                <strong data-delete-contact=""></strong> の会話{' '}
                <strong data-delete-count=""></strong>{' '}
                件と、保存されたメール原文・添付ファイルが削除されます。この操作は取り消せません。
              </>
            }
          >
            <ActionBar>
              <Button
                variant="outline"
                type="button"
                data-cancel-forget=""
                autofocus
              >
                キャンセル
              </Button>
              <Button variant="destructive" type="submit">
                すべて削除
              </Button>
            </ActionBar>
          </Dialog>
        </form>
      )}
    </FormSection>
  )
}
const notices: Record<Section, string> = {
  mailboxes: '窓口を登録しました。',
  operators: '運営者の情報を保存しました。',
  labels: 'ラベルを更新しました。',
  retention: '保存期間を変更しました。',
  deletion: '選択した相手のデータを削除しました。',
}
export function settingsNotice(section: Section, saved?: string) {
  return (
    (saved === 'yes' ||
      (section === 'mailboxes' &&
        (saved === 'sender' || saved === 'icon' || saved === 'prefix'))) && (
      <Notice toast kind="success">
        {saved === 'icon'
          ? projectTerm + 'のアイコンを保存しました。'
          : saved === 'sender'
            ? 'メールの差出人を保存しました。'
            : saved === 'prefix'
              ? '問い合わせ番号の接頭辞を保存しました。'
              : notices[section]}
      </Notice>
    )
  )
}
