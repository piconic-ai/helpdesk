import { glyph, type GlyphName } from './glyph'
import type { Child } from 'hono/jsx'
import { PageBody, Stack, Grid, Cluster } from './layout'
import { ActionLink } from './controls'

type Content = { children?: Child }
type Heading = { title: Child; description?: Child; action?: Child }
type Page = Heading &
  Content & {
    back?: { href: string; label: string }
    toolbar?: Child
    filters?: Child
    attributes?: Child
    aside?: Child
    footer?: Child
    contact?: string
  }

export function PageHeading({ title, description, action }: Heading) {
  return (
    <header className="page-header pattern-heading" data-ui="heading">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && (
          <div className="heading-description">{description}</div>
        )}
      </div>
      {action && <div className="heading-actions">{action}</div>}
    </header>
  )
}
function Template({
  kind,
  toolbar,
  title,
  description,
  action,
  back,
  filters,
  attributes,
  aside,
  footer,
  contact,
  children,
}: Page & { kind: 'list' | 'detail' | 'edit' | 'overview' }) {
  return (
    <PageBody data-ui-page={kind} data-contact={contact}>
      {toolbar}
      <Stack
        gap="sm"
        className={contact !== undefined ? 'thread-header' : 'pattern-intro'}
        data-contact={contact}
      >
        {back && (
          <ActionLink href={back.href} variant="ghost">
            ← {back.label}
          </ActionLink>
        )}
        <PageHeading title={title} description={description} action={action} />
        {attributes}
      </Stack>
      {filters}
      <div data-ui="columns">
        <Stack data-ui="body" gap="lg">
          {children}
        </Stack>
        {aside && <aside data-ui="panel">{aside}</aside>}
      </div>
      {footer && <footer data-ui="footer">{footer}</footer>}
    </PageBody>
  )
}
export const ListPage = (props: Page) => <Template kind="list" {...props} />
export const DetailPage = (props: Page) => <Template kind="detail" {...props} />
export const EditPage = (props: Page) => <Template kind="edit" {...props} />
export const OverviewPage = (props: Page) => (
  <Template kind="overview" {...props} />
)
export function FilterBar({ children, chips }: Content & { chips?: Child }) {
  return (
    <Stack data-ui="filters" gap="xs">
      <div data-ui="filter-line">{children}</div>
      {chips && (
        <Cluster data-ui="chips" gap="xs">
          {chips}
        </Cluster>
      )}
    </Stack>
  )
}
export function ListRow({
  title,
  href,
  newTab,
  backdrop,
  description,
  status,
  action,
}: Heading & {
  href?: string
  newTab?: boolean
  status?: Child
  backdrop?: Child
}) {
  const caption = (
    <>
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </>
  )
  return (
    <li data-ui="list-row">
      {href ? (
        <a
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
        >
          {caption}
        </a>
      ) : (
        <div>{caption}</div>
      )}
      {status && <small>{status}</small>}
      {action}
      {backdrop}
    </li>
  )
}
export function ConversationRow({
  contact,
  headline,
  preview,
  time,
  assignee,
  owner,
  selection,
  actions,
  href,
  read,
  number,
}: {
  contact?: Child
  headline: Child
  preview: Child
  time: Child
  assignee?: Child
  owner?: Child
  selection?: Child
  actions?: Child
  href: string
  read?: boolean
  number?: number
}) {
  return (
    <li data-ui="conversation-row" className="inbox-item" data-number={number}>
      {selection && <label className="row-select">{selection}</label>}
      <a className={'conversation-row' + (read ? '' : ' unread')} href={href}>
        {contact && (
          <span className="row-identity">
            <span className="read-marker">
              {!read && (
                <span
                  className="unread-dot"
                  role="img"
                  aria-label="未読"
                  title="未読"
                />
              )}
            </span>
            {contact}
          </span>
        )}
        <span className="row-top">
          {headline}
          {!owner && <span className="row-time">{time}</span>}
        </span>
        <span className="row-bottom">
          {preview}
          <span className="row-assignee">{assignee}</span>
        </span>
        {owner && (
          <span className="row-owner">
            <span className="row-time">{time}</span>
            {owner}
          </span>
        )}
      </a>
      {actions}
    </li>
  )
}
export function SettingRow({
  title,
  description,
  href,
  value,
}: {
  title: Child
  description: Child
  href: string
  value?: Child
}) {
  return (
    <a data-ui="setting-row" href={href}>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span>
        {value} <span aria-hidden="true">›</span>
      </span>
    </a>
  )
}
export function MetricCard({
  title,
  value,
  change,
  definition,
  trend,
}: {
  title: Child
  value: Child
  change: Child
  definition: Child
  trend?: Child
}) {
  return (
    <Stack as="article" data-ui="metric-card">
      <h2>{title}</h2>
      {trend ? (
        <div className="metric-value">
          <strong>{value}</strong>
          {trend}
        </div>
      ) : (
        <strong>{value}</strong>
      )}
      <small>{change}</small>
      <p>{definition}</p>
    </Stack>
  )
}
export function FormSection({
  id,
  title,
  description,
  children,
}: Content & { id?: string; title: Child; description?: Child }) {
  return (
    <Stack
      as="section"
      id={id}
      data-ui="form-section"
      className="settings-card"
    >
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </Stack>
  )
}
export const AttributeRow = ({ children }: Content) => (
  <Cluster data-ui="attributes" gap="xs">
    {children}
  </Cluster>
)
export const ActionBar = ({ children }: Content) => (
  <Cluster data-ui="actions">{children}</Cluster>
)
export const CandidateList = ({ children }: Content) => (
  <div data-ui="candidates">{children}</div>
)
export const RowList = ({
  children,
  className,
}: Content & { className?: string }) => (
  <ul data-ui="row-list" className={className}>
    {children}
  </ul>
)
export const MetricGrid = ({ children }: Content) => (
  <Grid data-ui="metrics">{children}</Grid>
)
export function Candidate({
  icon,
  label,
  selected,
  children,
}: Content & { icon: Child; label: Child; selected?: boolean }) {
  return (
    <span data-ui="candidate">
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
      {selected && <span aria-label="選択中">✓</span>}
      {children}
    </span>
  )
}
export function ExtensionCard({
  id,
  icon,
  extension,
  title,
  description,
  toggle,
  settings,
}: {
  id?: string
  extension?: string
  icon?: GlyphName
  title: Child
  description: Child
  toggle: Child
  settings?: Child
}) {
  return (
    <Stack
      as="article"
      id={id}
      data-extension={extension}
      data-ui="extension-card"
    >
      <header>
        <h3 title={typeof title === 'string' ? title : undefined}>
          {glyph(icon ?? 'extension')}
          {title}
        </h3>
        {toggle}
      </header>
      <p>{description}</p>
      {settings && <footer>{settings}</footer>}
    </Stack>
  )
}
export function Notice({
  kind,
  children,
  toast = false,
}: Content & { kind: 'success' | 'error' | 'info'; toast?: boolean }) {
  return (
    <div
      data-ui="notice"
      data-toast={toast ? '' : undefined}
      className={'banner-' + kind}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}
export const EmptyState = ({
  children,
  icon = 'open',
}: Content & { icon?: GlyphName }) => (
  <div data-ui="empty" className="empty-state">
    {glyph(icon)}
    <div>{children}</div>
  </div>
)
export const LoadingState = ({ label = '読み込み中' }: { label?: string }) => (
  <div data-ui="loading" role="status" aria-label={label}>
    <span></span>
    <span></span>
    <span></span>
  </div>
)
export function Message({
  entry,
  revision,
  kind,
  header,
  children,
}: Content & {
  entry?: string
  revision?: string
  kind: 'inbound' | 'outbound' | 'note' | 'record'
  header?: Child
}) {
  return (
    <article
      data-thread-entry={entry}
      data-thread-revision={revision}
      data-ui="message"
      className={'message-' + kind}
    >
      {header && <header>{header}</header>}
      {children}
    </article>
  )
}
