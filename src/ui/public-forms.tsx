import type { Child } from 'hono/jsx'
import { ActionLink, Button, Field, Input } from './controls'
import { FilterBar, ListRow, Notice, RowList } from './patterns'

export function PublicSearch(props: { label: string; query: string }) {
  return (
    <FilterBar
      chips={
        props.query && (
          <ActionLink
            variant="ghost"
            href="?"
            aria-label={props.query + ' × 検索条件を外す'}
          >
            {props.query} ×
          </ActionLink>
        )
      }
    >
      <form method="get" className="article-search" data-live-filters="">
        <Field label={props.label}>
          <Input type="search" name="q" value={props.query} maxlength={200} />
        </Field>
      </form>
    </FilterBar>
  )
}

export function PublicLinks(props: {
  items: { label: string; path: string; description?: Child }[]
  newTab?: boolean
}) {
  return (
    <RowList>
      {props.items.map((link) => (
        <ListRow
          description={link.description}
          title={link.label}
          href={link.path}
          newTab={props.newTab}
        />
      ))}
    </RowList>
  )
}

export function PublicForm(props: { children: Child; action?: string }) {
  return (
    <form method="post" action={props.action} className="public-form">
      {props.children}
    </form>
  )
}

export function Challenge(props: { siteKey?: string }) {
  return props.siteKey ? (
    <div className="cf-turnstile" data-sitekey={props.siteKey} />
  ) : null
}

export function AnswerChoices(props: {
  name: string
  question: string
  action?: string
  children?: Child
}) {
  return (
    <PublicForm action={props.action}>
      {props.children}
      <fieldset>
        <legend>{props.question}</legend>
        <div className="public-actions">
          <Button variant="outline" type="submit" name={props.name} value="yes">
            はい
          </Button>
          <Button variant="outline" type="submit" name={props.name} value="no">
            いいえ
          </Button>
        </div>
      </fieldset>
    </PublicForm>
  )
}

export function ReceiptDetails(props: {
  entries: [string, string | undefined][]
}) {
  return (
    <dl className="receipt-details">
      {props.entries.map(([key, value]) => (
        <>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </>
      ))}
    </dl>
  )
}

export function IntakeError({ error }: { error: string | { retry: string } }) {
  if (!error) return null
  if (typeof error === 'string') return <Notice kind="error">{error}</Notice>
  return (
    <details open className="public-retry-notice banner-error" data-toast="">
      <summary role="button">閉じる</summary>
      <p role="alert">{error.retry}</p>
    </details>
  )
}
