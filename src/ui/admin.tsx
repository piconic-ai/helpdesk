import { glyph, type GlyphName } from './glyph'
import type { Child, JSX } from 'hono/jsx'
import { ActionLink, Button, Input } from './controls'
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
  command = false,
  accessibleName,
}: {
  title: Child
  children: Child
  command?: boolean
  accessibleName?: string
}) {
  return (
    <details className={command ? 'thread-command' : undefined}>
      <summary
        aria-label={accessibleName}
        role={command ? 'button' : undefined}
      >
        {title}
      </summary>
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
  icon,
  extension,
  number,
  children,
}: {
  title: string
  extension: string
  icon?: GlyphName
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
      <h2>
        {glyph(icon ?? 'extension')}
        {title}
      </h2>
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
    <section className="help-article" data-article-preview="">
      <h2>{title}</h2>
      <article>{children}</article>
    </section>
  )
}
export function BodyText({ children }: { children: Child }) {
  return <pre className="message-body">{children}</pre>
}

export function ChoicePreviews({
  name,
  label,
  required,
  choices,
}: {
  name: string
  label: string
  required?: boolean
  choices: { value: string; label: string; description?: string }[]
}) {
  return (
    <fieldset className="template-choices">
      <legend>{label}</legend>
      {choices.map((choice, index) => (
        <label>
          <Input
            type="radio"
            name={name}
            value={choice.value}
            required={required}
            checked={index === 0}
          />
          <span>
            <strong>{choice.label}</strong>
            {choice.description && <small>{choice.description}</small>}
          </span>
        </label>
      ))}
    </fieldset>
  )
}
