import { projectTerm } from '../settings/project-term'
import { displayReference } from '../conversations/ticket-reference'
import { metricValue } from '../../ui/metric-value'
import { IssuePostFields } from '../../ui/issue-board'
import { glyph } from '../../ui/glyph'
import { Stack } from '../../ui/layout'
import {
  DetailPage,
  OverviewPage,
  EmptyState,
  MetricGrid,
  Notice,
  FormSection,
  ExtensionCard,
} from '../../ui/patterns'
import {
  SwitchTrack,
  ActionLink,
  Popover,
  Button,
  Input,
  NativeSelect,
  Textarea,
} from '../../ui/controls'
import {
  BodyText,
  ChoicePreviews,
  Disclosure,
  ContextPanel,
  PanelSummary,
  PanelForm,
  Definitions,
} from '../../ui/admin'
import { matchesSearch, ListFilters } from '../../ui/listing'
import { permissionText } from './extension-guides'
import type { Child } from 'hono/jsx'
import type { panels, management } from './registry-usecase'
import { shell } from '../conversations/conversations-page'
import type { ConsoleFrame } from '../conversations/console-usecase'
import { guides } from './extension-guides'
import type { coreOperations } from '../operations/catalog-usecase'
import { extensionLabel, fieldLabel, operationLabel } from './extension-labels'

const groups: Record<string, string[]> = {
  受け付ける: ['form', 'chat', 'feedback', 'auto-ack', 'spam'],
  答える: ['articles', 'canned', 'presence', 'snooze'],
  直す: ['issues', 'merge'],
  整える: ['rules', 'notify', 'metrics', 'survey', 'export'],
}
const publicIntakeIds = ['form', 'chat', 'feedback']
function extensionSettings(entry: ExtensionEntry) {
  const label = extensionLabel(entry.id)
  const required = [
    ...entry.configurationGaps,
    ...entry.missing,
    ...(entry.needsAI ? ['AI'] : []),
  ]
  const toggle = (
    <form
      method="post"
      action={'/extensions/' + entry.id}
      data-permissions={permissionText(entry.permissions)}
      data-public-intake={
        publicIntakeIds.includes(entry.id)
          ? `全${projectTerm}で機能が使えるようになります。受付は${projectTerm}ごとに開始します。`
          : undefined
      }
    >
      <input
        type="hidden"
        name="enabled"
        value={entry.enabled ? 'no' : 'yes'}
      />
      <Button
        role="switch"
        aria-checked={entry.enabled}
        variant="ghost"
        aria-label={
          (entry.enabled ? '有効' : '無効') +
          '、' +
          label +
          (entry.enabled ? 'を無効にする' : 'を有効にする')
        }
      >
        <SwitchTrack />
        {entry.enabled ? '有効' : '無効'}
      </Button>
    </form>
  )
  return (
    <ExtensionCard
      title={label}
      icon={entry.icon}
      description={guides[entry.id]?.description ?? label}
      toggle={toggle}
      id={'extension-' + entry.id}
      extension={entry.id}
      settings={
        <>
          {entry.summary && <p>{entry.summary}</p>}
          {required.length > 0 && (
            <small>設定が必要：{required.join('、')}</small>
          )}
          {entry.enabled && (
            <ActionLink variant="outline" href={'/extensions/' + entry.id}>
              設定
            </ActionLink>
          )}
        </>
      }
    />
  )
}
type ExtensionEntry = Awaited<ReturnType<typeof management>>['entries'][number]

function extensionGroups(
  entries: ExtensionEntry[],
  query: Record<string, string>,
) {
  const known = new Set(Object.values(groups).flat())
  return Object.entries(groups).flatMap(([group, ids]) => {
    const matches = entries.filter((entry) => {
      if (
        !ids.includes(entry.id) &&
        (group !== '整える' || known.has(entry.id))
      )
        return false
      if (
        query.filter &&
        query.filter !== (entry.enabled ? 'enabled' : 'disabled')
      )
        return false
      const text = [
        group,
        entry.id,
        extensionLabel(entry.id),
        guides[entry.id]?.description,
      ].join(' ')
      return matchesSearch(text, query.q)
    })
    return matches.length
      ? [
          <Stack as="section" gap="lg">
            <h2>{group}</h2>
            <MetricGrid>{matches.map(extensionSettings)}</MetricGrid>
          </Stack>,
        ]
      : []
  })
}

export function managementPage(
  data: Awaited<ReturnType<typeof management>>,
  frame?: ConsoleFrame,
  changed?: string,
  undo?: string,
  restored?: string,
) {
  const updated = data.entries.find((e) => e.id === changed)
  const query = frame?.query ?? {}
  const sections = extensionGroups(data.entries, query)
  return shell(
    '拡張機能',
    <OverviewPage
      title="拡張機能"
      filters={
        <ListFilters
          title="拡張機能"
          path="/extensions"
          query={query}
          sortable={false}
          filterLabel="有効状態"
          options={[
            { value: 'enabled', label: '有効' },
            { value: 'disabled', label: '無効' },
          ]}
        />
      }
      description={
        '有効 ' + data.entries.filter((e) => e.enabled).length + '件'
      }
    >
      {restored && (
        <Notice toast kind={restored === 'yes' ? 'success' : 'error'}>
          {restored === 'yes'
            ? '設定を元に戻しました。'
            : '設定が更新されたため、元に戻せません。'}
        </Notice>
      )}
      {updated && (
        <Notice toast kind="success">
          {extensionLabel(updated.id)}を{updated.enabled ? '有効' : '無効'}
          にしました。
          {undo && (
            <form action="/extensions/undo-activation" method="post">
              <input type="hidden" name="changeId" value={undo} />
              <Button variant="ghost">元に戻す</Button>
            </form>
          )}
        </Notice>
      )}
      {data.failures.length > 0 && (
        <Notice kind="error">
          <strong>拡張への配信に失敗しました</strong>
          {data.failures.map((f) => (
            <p>
              {extensionLabel(String(f.extension))} · イベント {String(f.event)}{' '}
              · {String(f.error)}
            </p>
          ))}
        </Notice>
      )}
      {sections.length ? (
        sections
      ) : (
        <EmptyState icon="search">
          条件に合う拡張機能はありません。検索条件や有効状態を変更してください。
        </EmptyState>
      )}
    </OverviewPage>,
    frame,
  )
}

type Panel = Awaited<ReturnType<typeof panels>>[number]
type Operation = Panel['operations'][number]
const statuses: Record<string, string> = { draft: '下書き', published: '公開' }
function operationField(
  op: Operation,
  key: string,
  panel: Panel,
  number?: number,
) {
  if (key === 'changeId' && op.name.startsWith('snooze.')) return null
  if (key === 'includeHistory' && op.name === 'metrics.report') return null
  if (key === 'number' && number)
    return <input type="hidden" name={key} value={number} />
  const required = op.inputSchema.required?.includes(key)
  const options = panel.choices[key]
  const label = fieldLabel(key)
  const choices = options?.map((value) => {
    const entry = panel.choiceLabels[key]?.[value] ?? statuses[value] ?? value
    return typeof entry === 'string'
      ? { value, label: entry }
      : { value, ...entry }
  })
  if (choices?.some((choice) => 'description' in choice))
    return (
      <ChoicePreviews
        name={key}
        label={label}
        required={required}
        choices={choices}
      />
    )
  if (choices)
    return (
      <label>
        {label}
        <NativeSelect name={key}>
          {choices.map(({ value, label }) => (
            <option value={value}>{label}</option>
          ))}
        </NativeSelect>
      </label>
    )
  if (['body', 'markdown', 'summary'].includes(key))
    return (
      <label>
        {label}
        <Textarea name={key} rows={3} required={required} />
      </label>
    )
  if (key === 'unmask')
    return (
      <label>
        {label}
        <NativeSelect name={key}>
          <option value="">名前とメールアドレスを伏せる</option>
          <option value="true">名前とメールアドレスを含める</option>
        </NativeSelect>
      </label>
    )
  return (
    <label>
      {label}
      <Input name={key} required={required} />
    </label>
  )
}
type Details = Awaited<ReturnType<typeof coreOperations.get.execute>>
function mergeTargets(data: Details) {
  return data.history.filter(
    (item) =>
      item.mailbox === data.conversation.mailbox && item.kind === 'inquiry',
  )
}
function issueLink(link: { href: string }) {
  return (
    link.href.startsWith('https://github.com/') ||
    link.href.startsWith('/issues/')
  )
}
function actionsFor(p: Panel, data?: Details) {
  if (!data) return p.operations
  const c = data.conversation
  return p.operations.filter((op) => {
    switch (op.name) {
      case 'feedback.review':
        return c.kind === 'feedback' && c.status.kind === 'received'
      case 'feedback.convert':
        return (
          c.kind === 'feedback' &&
          c.status.kind !== 'spam' &&
          Boolean(c.contact)
        )
      case 'articles.attach':
      case 'issues.link':
      case 'issues.create':
        return false
      case 'issues.impact':
        return c.kind === 'inquiry' && p.links.some(issueLink)
      case 'merge.combine':
        return c.kind === 'inquiry' && mergeTargets(data).length > 0
      case 'snooze.resume':
        return c.kind === 'inquiry' && !!p.content
      case 'snooze.defer':
        return c.kind === 'inquiry' && !p.content
      case 'issues.preview':
        return c.status.kind !== 'spam'
      case 'canned.apply':
        return (
          c.kind === 'inquiry' && ['open', 'pending'].includes(c.status.kind)
        )
      default:
        return true
    }
  })
}
function formField(
  op: Operation,
  key: string,
  p: Panel,
  number?: number,
  data?: Details,
  frame?: ConsoleFrame,
) {
  if (key === 'product' && data)
    return <input type="hidden" name={key} value={data.conversation.product} />
  if (key === 'target' && data && frame)
    return (
      <label>
        統合先の問い合わせ
        <NativeSelect name="target" required>
          {mergeTargets(data).map((t) => (
            <option value={t.number}>
              {displayReference(frame, t)} {t.subject}
            </option>
          ))}
        </NativeSelect>
      </label>
    )
  if (key === 'issue') {
    const fixed = (link: Panel['links'][number]) =>
      link.icon?.name === 'issue_fixed' || link.icon?.name === 'issue_notify'
    const choices = p.links
      .filter(issueLink)
      .sort((a, b) => Number(fixed(b)) - Number(fixed(a)))
      .map((link) => {
        const value = link.href.split('/').at(-1)!
        return {
          value,
          label: '#' + value + ' ' + link.label,
          description: fixed(link)
            ? '直した課題 · 修正前後を比較できます。'
            : '修正前の件数のみ確認できます。',
        }
      })
    return <ChoicePreviews name="issue" label="課題" choices={choices} />
  }
  if (key === 'days')
    return (
      <label>
        期間
        <NativeSelect name="days">
          <option value="7">7日間</option>
          <option value="30" selected>
            30日間
          </option>
          <option value="90">90日間</option>
        </NativeSelect>
      </label>
    )
  if (key === 'until')
    return (
      <label>
        再表示日時（日本時間）
        <Input required type="datetime-local" name="untilLocal" />
      </label>
    )
  return operationField(op, key, p, number)
}
function actionForm(
  op: Operation,
  p: Panel,
  number?: number,
  data?: Details,
  frame?: ConsoleFrame,
) {
  return (
    <PanelForm
      method="post"
      action={'/actions/' + op.name}
      data-merge-contact={
        op.name === 'merge.combine' ? data?.conversation.contact : undefined
      }
      data-source={
        op.name === 'merge.combine' && data && frame
          ? displayReference(frame, data.conversation) +
            ' ' +
            data.conversation.subject
          : undefined
      }
    >
      {op.name === 'issues.preview' && <h3>GitHub に公開する課題</h3>}
      {data &&
        frame &&
        ['merge.combine', 'issues.preview', 'articles.suggest'].includes(
          op.name,
        ) && (
          <PanelSummary>
            {op.name === 'merge.combine'
              ? '統合元：'
              : data.conversation.kind === 'feedback'
                ? '元のフィードバック：'
                : '元の問い合わせ：'}
            {displayReference(frame, data.conversation)}{' '}
            {data.conversation.subject}
          </PanelSummary>
        )}
      {op.name === 'issues.preview' && p.content && (
        <PanelSummary>{p.content}</PanelSummary>
      )}
      {Object.keys(op.inputSchema.properties ?? {}).map((key) =>
        formField(op, key, p, number, data, frame),
      )}
      <Button variant={op.name === 'feedback.review' ? 'default' : 'outline'}>
        {op.name === 'merge.combine'
          ? 'この会話を統合する内容を確認'
          : operationLabel(op.name, op.description)}
      </Button>
    </PanelForm>
  )
}
function summaryFor(p: Panel, data?: Details) {
  if (p.content && (p.id !== 'issues' || !p.operations.length)) return p.content
  switch (p.id) {
    case 'presence':
      return '閲覧状況を確認中…'
    case 'issues':
      return '関連付けた課題　' + p.links.filter(issueLink).length + '件'
    case 'snooze':
      return 'この会話は保留されていません。'
    case 'merge':
      return data
        ? '統合できる問い合わせ　' + mergeTargets(data).length + '件'
        : ''
    case 'canned':
      return '利用できる定型文　' + (p.choices.template?.length ?? 0) + '件'
    case 'feedback':
      return data?.conversation.status.kind === 'received'
        ? '未確認のフィードバックです。'
        : '確認済みのフィードバックです。'
    default:
      return ''
  }
}
const panelTriggers: Record<string, string> = {
  'issues.preview': '課題を起票する',
  'articles.suggest': '記事候補を書く',
  'issues.impact': '比較する期間を選ぶ',
  'snooze.defer': '保留する日時を選ぶ',
}
function panel(
  p: Panel,
  number?: number,
  data?: Details,
  frame?: ConsoleFrame,
) {
  const ops = actionsFor(p, data)
  if (!ops.length && !p.content && !p.links.length && !p.script) return null
  if (
    data &&
    data.conversation.kind === 'feedback' &&
    ['articles', 'snooze', 'merge', 'canned'].includes(p.id)
  )
    return null
  const summary = summaryFor(p, data)
  const title = extensionLabel(p.id) === p.id ? p.title : extensionLabel(p.id)
  return (
    <ContextPanel
      icon={p.icon}
      title={p.id === 'export' ? '対象と個人情報の扱い' : title}
      number={number}
      extension={p.id}
    >
      {p.script && (
        <script
          type={p.scriptType}
          data-classic-panel={p.scriptType ? undefined : ''}
          defer
          src={p.script}
        ></script>
      )}
      {summary && <PanelSummary>{summary}</PanelSummary>}
      {p.links.map((l) => (
        <p>
          {l.icon && glyph(l.icon.name, l.icon.label)}
          <a href={l.href} data-context-link="">
            {l.label}
          </a>
        </p>
      ))}
      {ops.map((op) => {
        if (
          op.name.startsWith('feedback.') ||
          op.name === 'snooze.resume' ||
          p.slot === 'settings'
        )
          return actionForm(op, p, number, data, frame)
        const label =
          panelTriggers[op.name] ?? operationLabel(op.name, op.description)
        return (
          <Popover
            id={'operation-' + p.id + '-' + op.name}
            label={label}
            variant={op === ops[0] ? 'outline' : 'ghost'}
          >
            {actionForm(op, p, number, data, frame)}
            {op.name === 'issues.preview' && (
              <Button
                type="button"
                variant="ghost"
                popovertarget={'operation-' + p.id + '-' + op.name}
                popovertargetaction="hide"
              >
                入力を閉じる
              </Button>
            )}
          </Popover>
        )
      })}
      {ops.some((op) => op.name === 'issues.preview') && (
        <details data-issue-picker={number}>
          <summary>既存の課題を選ぶ</summary>
          <PanelForm method="post" action="/actions/issues.link">
            <input type="hidden" name="number" value={number} />
            <label>
              題で探す
              <Input type="search" placeholder="課題の題を入力" />
            </label>
            <label>
              課題
              <NativeSelect required name="issue" disabled />
            </label>
            <p role="status" aria-live="polite"></p>
            <Button disabled>既存の課題と紐づける</Button>
          </PanelForm>
          <script type="module" src="/ui/issue-picker.js"></script>
        </details>
      )}
    </ContextPanel>
  )
}
export function extensionPanels(
  data: Panel[],
  number?: number,
  conversation?: Details,
  frame?: ConsoleFrame,
) {
  return <>{data.map((p) => panel(p, number, conversation, frame))}</>
}

export function conversationPanels(
  data: Panel[],
  number: number,
  conversation: Details,
  frame: ConsoleFrame,
) {
  const contextual = data.filter(
    (p) => !['snooze', 'canned', 'feedback'].includes(p.id),
  )
  const feedback = data.find(
    (p) => p.id === 'feedback' && conversation.conversation.kind === 'feedback',
  )
  const command = (id: string) => {
    const p = data.find((entry) => entry.id === id)
    if (!p || conversation.conversation.kind !== 'inquiry') return null
    const ops = actionsFor(p, conversation)
    if (!ops.length) return null
    if (id === 'canned')
      return (
        <section
          data-extension="canned"
          popover="auto"
          id="reply-templates"
          data-slot="popover-content"
        >
          {ops.map((op) => actionForm(op, p, number, conversation, frame))}
        </section>
      )
    return (
      <div data-extension={id}>
        <Disclosure
          command
          title={id === 'snooze' ? 'スヌーズ' : '定型文を選ぶ'}
        >
          {id === 'snooze' && (
            <PanelSummary>{summaryFor(p, conversation)}</PanelSummary>
          )}
          {ops.map((op) => actionForm(op, p, number, conversation, frame))}
        </Disclosure>
      </div>
    )
  }
  return {
    feedback: feedback && (
      <>
        {actionsFor(feedback, conversation).map((op) =>
          actionForm(op, feedback, number, conversation, frame),
        )}
        {!conversation.conversation.contact && (
          <>
            <Button
              type="button"
              variant="ghost"
              disabled
              aria-describedby="feedback-no-contact"
            >
              問い合わせに変更
            </Button>
            <small id="feedback-no-contact">
              連絡先が登録されていないため、返信はできません。
            </small>
          </>
        )}
      </>
    ),
    issueSuggestion: contextual.some((p) =>
      actionsFor(p, conversation).some((op) => op.name === 'issues.preview'),
    ) && (
      <Button
        type="button"
        variant="ghost"
        data-issue-suggestion=""
        hidden
      ></Button>
    ),
    related: extensionPanels(contextual, number, conversation, frame),
    snooze: command('snooze'),
    canned: command('canned'),
  }
}

export function issuePreview(
  result: {
    repository: string
    title: string
    body: string
    number: number
    confirmation: string
    summary: string
    reference: string
  },
  frame: ConsoleFrame,
) {
  return shell(
    '起票内容を確認',
    <DetailPage
      title="起票内容を確認"
      back={{ href: '/conversation/' + result.number, label: '会話に戻る' }}
    >
      <FormSection id="issue-post-review" title={result.title}>
        <p data-public-target="">
          {frame.demoGithub ? '模擬 GitHub の投稿先：' : '投稿先：'}
          {result.repository}
        </p>
        <BodyText>{result.summary}</BodyText>
        <p data-public-reference="">問い合わせ番号：{result.reference}</p>
        <form action="/actions/issues.create" method="post">
          <Input
            name="confirmation"
            type="hidden"
            value={result.confirmation}
          />
          <Input name="number" type="hidden" value={result.number} />
          <Button variant="default">確認した内容で起票</Button>
        </form>
        <Disclosure title="入力内容を修正する">
          <PanelForm method="post" action="/actions/issues.preview">
            <Input name="number" type="hidden" value={result.number} />
            <IssuePostFields title={result.title} summary={result.summary} />
            <Button>起票内容を確認</Button>
          </PanelForm>
        </Disclosure>
      </FormSection>
    </DetailPage>,
    frame,
  )
}
function resultText(key: string, value: unknown) {
  if (value === null) return 'データなし'
  if (typeof value === 'number') {
    if (['from', 'to', 'until', 'closedAt'].includes(key))
      return new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Asia/Tokyo',
      }).format(value)
    if (key.endsWith('Ms') || key.endsWith('Rate'))
      return metricValue(key, value)
    if (['firstContactRate', 'improvementRate', 'ratio'].includes(key))
      return new Intl.NumberFormat('ja-JP', {
        style: 'percent',
        maximumFractionDigits: 1,
      }).format(value)
  }
  if (key === 'status' && typeof value === 'string')
    return statuses[value] ?? value
  return String(value)
}
function resultValue(key: string, value: unknown): Child {
  if (Array.isArray(value))
    return (
      <ul>
        {value.map((v) => (
          <li>{resultValue(key, v)}</li>
        ))}
      </ul>
    )
  if (value && typeof value === 'object')
    return (
      <Definitions>
        {Object.entries(value).map(([k, v]) => (
          <div>
            <dt>{fieldLabel(k)}</dt>
            <dd>{resultValue(k, v)}</dd>
          </div>
        ))}
      </Definitions>
    )
  return <span>{resultText(key, value)}</span>
}
export function operationResult(
  name: string,
  result: unknown,
  number?: number,
  frame?: ConsoleFrame,
  input: Record<string, string | File> = {},
) {
  const report = name === 'metrics.report'
  const title = report ? '対応状況の集計' : operationLabel(name)
  const product =
    frame?.products.find((item) => item.id === input.product)?.name ??
    `すべての${projectTerm}`
  const period =
    report && input.from && input.to ? (
      <>
        {product} · <time>{resultText('from', Number(input.from))}</time> ～{' '}
        <time>{resultText('to', Number(input.to) - 1)}</time>
      </>
    ) : undefined
  return shell(
    title,
    <DetailPage
      title={title}
      back={{
        href: number ? '/conversation/' + number : '/',
        label: number ? '会話に戻る' : '受信箱に戻る',
      }}
    >
      <FormSection
        id={report ? 'metric-result' : undefined}
        title={report ? '集計結果' : '結果'}
        description={period}
      >
        {name === 'export.jsonl' ? (
          <pre>{String(result)}</pre>
        ) : result === null ? (
          <Notice toast kind="success">
            操作が完了しました。
          </Notice>
        ) : (
          resultValue('', result)
        )}
      </FormSection>
    </DetailPage>,
    frame,
  )
}
