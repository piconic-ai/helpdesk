import type { MailLanguage } from '../settings/mail-language'
import type {
  CandidateSummary,
  Judgment,
  JudgmentModel,
} from './article-judgment'
import type {
  PreviousInput,
  PreviousSuggestion,
  SuggestionPresentation,
  SuggestionReaction,
} from '../suggestions/suggestion'
import type { GlyphName } from '../../ui/glyph'
import type { z } from 'zod'
import type { Context, Scope } from '../operations/catalog-usecase'

export type Permission = 'read_body' | 'send' | 'external_fetch'
export type IntakeInput = {
  product: string
  name?: string
  subject: string
  body: string
  origin: 'form' | 'chat'
  submissionId?: string
  suggestionIds?: string[]
  sourcePage?: string
} & ({ kind?: 'inquiry'; email: string } | { kind: 'feedback'; email?: string })
export type ExtensionEvent = {
  id: number
  kind: string
  number: number | null
  actor: unknown
  payload: Record<string, unknown>
  at: number
}
export type Voice = {
  number: number
  product: string
  createdAt: number
  status: string
  kind: 'inquiry' | 'feedback'
}
export type ExtensionContext = {
  local?: boolean
  demoGithub?: boolean
  previousSuggestion: (
    input: PreviousInput,
  ) => Promise<PreviousSuggestion | null>
  presentSuggestion: (input: SuggestionPresentation) => Promise<string>
  reactToSuggestion: (input: SuggestionReaction) => Promise<boolean>
  suggestionResolution: (
    product: string,
    from: number,
    to: number,
  ) => Promise<{
    shownSuggestions: number
    solvedSuggestions: number
    selfResolutionRate: number | null
  }>
  voices: () => Promise<Voice[]>
  enabledBy: string | null
  standing: (
    number: number,
    body: string,
    key: string,
  ) => Promise<{ id: string }>
  notifyEmail: (
    number: number,
    to: string,
    body: string,
    key: string,
  ) => Promise<{ id: string }>
  change: (
    number: number,
    event: 'marked_spam' | 'unmarked_spam',
  ) => Promise<void>
  events: (kind?: string) => Promise<ExtensionEvent[]>
  snapshotCounts: () => Promise<{
    conversations: number
    messages: number
    events: number
  }>
  snapshot: () => Promise<{
    conversations: Record<string, unknown>[]
    messages: Record<string, unknown>[]
    events: Record<string, unknown>[]
  }>
  unreviewFeedback: (number: number) => Promise<{ number: number }>
  reviewFeedback: (number: number) => Promise<{ number: number }>
  convertFeedback: (number: number) => Promise<{ number: number }>
  resource: (id: string, name: string, input: unknown) => Promise<unknown>
  articleCandidates: (
    product: string,
    text: string,
  ) => Promise<CandidateSummary[]>
  judge: (
    model: JudgmentModel,
    question: string,
    articles: CandidateSummary[],
    name?: string,
  ) => Promise<Judgment>
  assign: (number: number, email: string) => Promise<void>
  label: (number: number, label: string) => Promise<void>
  compareSwap: (
    key: string,
    expected: unknown,
    value: unknown,
  ) => Promise<boolean>
  config: unknown
  actor: Context['actor']
  now: number
  secret: (name: string) => string | undefined
  create: (key: string, value: unknown) => Promise<boolean>
  get: (key: string) => Promise<unknown>
  put: (key: string, value: unknown) => Promise<void>
  list: (
    prefix: string,
    order?: 'key' | 'created',
  ) => Promise<{ key: string; value: unknown }[]>
  remove: (key: string) => Promise<void>
  open: (input: IntakeInput) => Promise<{ number: number }>
  addInboundMessage: (number: number, body: string) => Promise<{ id: string }>
  draft: (number: number, body: string, key?: string) => Promise<{ id: string }>
  contact: (number: number) => Promise<{
    name: string
    productName: string
    language: MailLanguage
    product: string
    subject: string
    mailbox: string
    email: string
    status: string
  }>
  inboundBody: (number: number, messageId?: string) => Promise<string>
  body: (number: number) => Promise<string[]>
  request: (url: string, options?: RequestInit) => Promise<Response>
  emit: (
    kind: string,
    number: number | null,
    payload: Record<string, unknown>,
    key?: string,
  ) => Promise<void>
}
export type ExtensionOperation = {
  name: string
  description: string
  permission: Scope
  input: z.ZodType
  output: z.ZodType
  humanOnly?: boolean
  run: (ctx: ExtensionContext, input: unknown) => Promise<unknown>
}
export type Panel = {
  available?: (ctx: ExtensionContext, number?: number) => Promise<boolean>
  script?: string
  scriptType?: 'module'
  slot: 'conversation' | 'settings' | 'list'
  title: string
  operations: string[]
  choiceLabels?: (
    ctx: ExtensionContext,
    number?: number,
  ) => Promise<
    Record<
      string,
      Record<string, string | { label: string; description: string }>
    >
  >
  choices?: (ctx: ExtensionContext) => Promise<Record<string, string[]>>
  links?: (
    ctx: ExtensionContext,
    number?: number,
  ) => Promise<
    { label: string; href: string; icon?: { name: GlyphName; label: string } }[]
  >
  content?: (ctx: ExtensionContext, number?: number) => Promise<string>
}
export type ReplyLink = { title: string; path: string; excerpt?: string }
export type Extension = {
  icon?: GlyphName
  navigationCount?: (ctx: ExtensionContext) => Promise<number>
  settingsSummary?: (ctx: ExtensionContext) => Promise<string>
  configurationGaps?: (
    ctx: ExtensionContext,
    products: { id: string; name: string }[],
  ) => Promise<string[]>
  replyLinks?: (
    ctx: ExtensionContext,
    product: string,
    inbound?: { number: number; id: string },
  ) => Promise<ReplyLink[] | { links: ReplyLink[]; offerToWrite: boolean }>
  requiresAI?: boolean
  secrets?: string[]
  requiredSecrets?: string[]
  id: string
  permissions: Permission[]
  config: z.ZodType
  operations?: ExtensionOperation[]
  panels?: Panel[]
  intakes?: {
    path: string
    run: (
      ctx: ExtensionContext,
      product: string,
      input: unknown,
    ) => Promise<unknown>
  }[]
  subscribers?: {
    kind: string
    run: (ctx: ExtensionContext, event: ExtensionEvent) => Promise<void>
  }[]
  publicPage?: (
    ctx: ExtensionContext,
    product: string,
    path: string,
    query: URLSearchParams,
  ) => Promise<{ title: string; html: string; status?: 409 } | null>
  publicAction?: (
    ctx: ExtensionContext,
    product: string,
    path: string,
    request: Request,
  ) => Promise<{ title: string; html: string; status?: 409 } | null>
  resources?: {
    name: string
    run: (ctx: ExtensionContext, input: unknown) => Promise<unknown>
  }[]
  hidden?: (
    storage: Pick<ExtensionContext, 'get' | 'list'>,
    now: number,
  ) => Promise<number[]>
  aliases?: (
    storage: Pick<ExtensionContext, 'get' | 'list'>,
  ) => Promise<Record<number, number>>
  migrations?: string[]
}
