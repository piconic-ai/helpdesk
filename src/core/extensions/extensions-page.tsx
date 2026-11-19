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
  ActionLink,
  Popover,
  Button,
  Input,
  NativeSelect,
  Textarea,
} from '../../ui/controls'
import {
  BodyText,
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
        aria-label={label + (entry.enabled ? 'を無効にする' : 'を有効にする')}
      >
        {entry.enabled ? '有効' : '無効'}
      </Button>
    </form>
  )
  return (
    <ExtensionCard
      title={label}
      description={guides[entry.id]?.description ?? label}
      toggle={toggle}
      id={'extension-' + entry.id}
      extension={entry.id}
      settings={
        <>
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
        <Notice kind={restored === 'yes' ? 'success' : 'error'}>
          {restored === 'yes'
            ? '設定を元に戻しました。'
            : '設定が更新されたため、元に戻せません。'}
        </Notice>
      )}
      {updated && (
        <Notice kind="success">
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
        <EmptyState>
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
  if (key === 'number' && number)
    return <input type="hidden" name={key} value={number} />
  const required = op.inputSchema.required?.includes(key)
  const options = panel.choices[key]
  const label = fieldLabel(key)
  if (options)
    return (
      <label>
        {label}
        <NativeSelect name={key}>
          {options.map((value) => (
            <option value={value}>
              {panel.choiceLabels[key]?.[value] ?? statuses[value] ?? value}
            </option>
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
          <option value="">伏せて書き出す</option>
          <option value="true">含めて書き出す</option>
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
        return (
          c.kind === 'inquiry' &&
          p.links.some((l) => l.href.startsWith('https://github.com/'))
        )
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
) {
  if (key === 'product' && data)
    return <input type="hidden" name={key} value={data.conversation.product} />
  if (key === 'target' && data)
    return (
      <label>
        統合先の問い合わせ
        <NativeSelect name="target" required>
          {mergeTargets(data).map((t) => (
            <option value={t.number}>
              {t.subject} (#{t.number})
            </option>
          ))}
        </NativeSelect>
      </label>
    )
  if (key === 'issue')
    return (
      <label>
        Issue
        <NativeSelect name="issue">
          {p.links
            .filter((l) => l.href.startsWith('https://github.com/'))
            .map((l) => (
              <option value={l.href.split('/').at(-1)}>{l.label}</option>
            ))}
        </NativeSelect>
      </label>
    )
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
function actionForm(op: Operation, p: Panel, number?: number, data?: Details) {
  return (
    <PanelForm method="post" action={'/actions/' + op.name}>
      {Object.keys(op.inputSchema.properties ?? {}).map((key) =>
        formField(op, key, p, number, data),
      )}
      <Button variant="outline">
        {operationLabel(op.name, op.description)}
      </Button>
    </PanelForm>
  )
}
function summaryFor(p: Panel, data?: Details) {
  if (p.content) return p.content
  switch (p.id) {
    case 'issues':
      return (
        '関連付けた Issue　' +
        p.links.filter((l) => l.href.startsWith('https://github.com/')).length +
        '件'
      )
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
function panel(p: Panel, number?: number, data?: Details) {
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
    <ContextPanel title={title} number={number} extension={p.id}>
      {p.script && <script defer src={p.script}></script>}
      {summary && <PanelSummary>{summary}</PanelSummary>}
      {p.links.map((l) => (
        <p>
          <ActionLink href={l.href} variant="ghost">
            {l.label}
          </ActionLink>
        </p>
      ))}
      {ops.map((op) => {
        if (
          op.name.startsWith('feedback.') ||
          op.name === 'snooze.resume' ||
          p.slot === 'settings'
        )
          return actionForm(op, p, number, data)
        const label =
          op.name === 'issues.preview'
            ? 'Issue を起票する'
            : operationLabel(op.name, op.description)
        return (
          <Popover
            id={'operation-' + p.id + '-' + op.name}
            label={label}
            variant={op === ops[0] ? 'outline' : 'ghost'}
          >
            {actionForm(op, p, number, data)}
          </Popover>
        )
      })}
      {ops.some((op) => op.name === 'issues.preview') && (
        <details data-issue-picker={number}>
          <summary>既存の Issue を選ぶ</summary>
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
            <Button disabled>既存の Issue と紐づける</Button>
          </PanelForm>
          <script defer src="/ui/issue-picker.js"></script>
        </details>
      )}
    </ContextPanel>
  )
}
export function extensionPanels(
  data: Panel[],
  number?: number,
  conversation?: Details,
) {
  return <>{data.map((p) => panel(p, number, conversation))}</>
}

export function conversationPanels(
  data: Panel[],
  number: number,
  conversation: Details,
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
    return (
      <div data-extension={id}>
        <Popover
          id={'operation-' + id}
          label={id === 'snooze' ? 'スヌーズ' : '定型文を選ぶ'}
        >
          <PanelSummary>{summaryFor(p, conversation)}</PanelSummary>
          {ops.map((op) => actionForm(op, p, number, conversation))}
        </Popover>
      </div>
    )
  }
  return {
    feedback: feedback && (
      <>
        {actionsFor(feedback, conversation).map((op) =>
          actionForm(op, feedback, number, conversation),
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
    related: extensionPanels(contextual, number, conversation),
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
  },
  frame: ConsoleFrame,
) {
  return shell(
    '起票内容を確認',
    <DetailPage
      title="起票内容を確認"
      back={{ href: '/conversation/' + result.number, label: '会話に戻る' }}
    >
      <FormSection title={result.title}>
        <p>{result.repository}</p>
        <BodyText>{result.body}</BodyText>
        <form action="/actions/issues.create" method="post">
          <Input
            name="confirmation"
            type="hidden"
            value={result.confirmation}
          />
          <Input name="number" type="hidden" value={result.number} />
          <Button variant="default">確認した内容で起票</Button>
        </form>
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
    if (['resolutionMs', 'operatorMs'].includes(key))
      return Math.round(value / 60000).toLocaleString('ja-JP') + '分'
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
) {
  const title = operationLabel(name)
  return shell(
    title,
    <DetailPage
      title={title}
      back={{
        href: number ? '/conversation/' + number : '/',
        label: number ? '会話に戻る' : '受信箱に戻る',
      }}
    >
      <FormSection title="結果">
        {name === 'export.jsonl' ? (
          <pre>{String(result)}</pre>
        ) : result === null ? (
          <Notice kind="success">操作が完了しました。</Notice>
        ) : (
          resultValue('', result)
        )}
      </FormSection>
    </DetailPage>,
    frame,
  )
}
