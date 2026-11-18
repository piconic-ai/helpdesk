import type { z } from 'zod'
import type { Context, Scope } from '../operations/catalog-usecase'

export type Permission = 'read_body' | 'send' | 'external_fetch'
export type IntakeInput = {
  product: string
  name?: string
  email: string
  subject: string
  body: string
  origin: 'form' | 'chat'
  kind?: 'inquiry' | 'feedback'
}
export type ExtensionEvent = {
  id: number
  kind: string
  number: number | null
  actor: unknown
  payload: Record<string, unknown>
  at: number
}
export type ExtensionContext = {
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
  events: () => Promise<ExtensionEvent[]>
  snapshot: () => Promise<{
    conversations: Record<string, unknown>[]
    messages: Record<string, unknown>[]
    events: Record<string, unknown>[]
  }>
  unreviewFeedback: (number: number) => Promise<{ number: number }>
  reviewFeedback: (number: number) => Promise<{ number: number }>
  convertFeedback: (number: number) => Promise<{ number: number }>
  resource: (id: string, name: string, input: unknown) => Promise<unknown>
  judge: (
    question: string,
    articles: { id: string; title: string; body: string }[],
  ) => Promise<{ id: string; score: number }[]>
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
  slot: 'conversation' | 'settings' | 'list'
  title: string
  operations: string[]
  choiceLabels?: (
    ctx: ExtensionContext,
  ) => Promise<Record<string, Record<string, string>>>
  choices?: (ctx: ExtensionContext) => Promise<Record<string, string[]>>
  links?: (
    ctx: ExtensionContext,
    number?: number,
  ) => Promise<{ label: string; href: string }[]>
  content?: (ctx: ExtensionContext, number?: number) => Promise<string>
}
export type Extension = {
  replyLinks?: (
    ctx: ExtensionContext,
    product: string,
  ) => Promise<{ title: string; path: string }[]>
  requiresAI?: boolean
  secrets?: string[]
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
