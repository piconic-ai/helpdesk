import type { Child, JSX } from 'hono/jsx'
import { ActionLink, Button } from './controls'
import { ActionBar } from './patterns'

export function SaveActions({
  verb,
  cancel,
  primary = false,
}: {
  verb: string
  cancel: string
  primary?: boolean
}) {
  return (
    <ActionBar>
      <Button variant={primary ? 'default' : 'outline'} type="submit">
        {verb}
      </Button>
      <ActionLink href={cancel} variant="ghost" data-discard-draft="">
        取り消し
      </ActionLink>
    </ActionBar>
  )
}
export function Disclosure({
  title,
  children,
}: {
  title: Child
  children: Child
}) {
  return (
    <details>
      <summary>{title}</summary>
      {children}
    </details>
  )
}
export function PanelForm(
  props: Omit<JSX.IntrinsicElements['form'], 'class' | 'className'>,
) {
  return <form {...props} className="extension-form" />
}
export function ContextPanel({
  title,
  extension,
  number,
  children,
}: {
  title: string
  extension: string
  number?: number
  children: Child
}) {
  return (
    <section
      className="settings-card extension-panel"
      data-number={number}
      data-extension={extension}
      id={'extension-' + extension}
    >
      <h2>{title}</h2>
      {children}
    </section>
  )
}
export function PanelSummary({ children }: { children: Child }) {
  return <p className="extension-content">{children}</p>
}
export function Definitions({ children }: { children: Child }) {
  return <dl className="result-fields">{children}</dl>
}
export function ArticlePreview({
  title,
  children,
}: {
  title: string
  children: Child
}) {
  return (
    <article className="help-article">
      <h2>{title}</h2>
      {children}
    </article>
  )
}
export function BodyText({ children }: { children: Child }) {
  return <pre className="message-body">{children}</pre>
}
