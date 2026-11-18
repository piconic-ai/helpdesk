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
  config: unknown
  actor: Context['actor']
  now: number
  secret: (name: string) => string | undefined
  create: (key: string, value: unknown) => Promise<boolean>
  get: (key: string) => Promise<unknown>
  put: (key: string, value: unknown) => Promise<void>
  list: (prefix: string) => Promise<{ key: string; value: unknown }[]>
  remove: (key: string) => Promise<void>
  open: (input: IntakeInput) => Promise<{ number: number }>
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
  body: (number: number) => Promise<string[]>
  request: (url: string, options?: RequestInit) => Promise<Response>
  emit: (
    kind: string,
    number: number | null,
    payload: Record<string, unknown>,
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
  slot: 'conversation' | 'settings' | 'list'
  title: string
  operations: string[]
  choices?: (ctx: ExtensionContext) => Promise<Record<string, string[]>>
  links?: (
    ctx: ExtensionContext,
    number?: number,
  ) => Promise<{ label: string; href: string }[]>
  content?: (ctx: ExtensionContext, number?: number) => Promise<string>
}
export type Extension = {
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
  migrations?: string[]
}
