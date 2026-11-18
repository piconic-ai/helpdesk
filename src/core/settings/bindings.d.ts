import type { Registry } from '../extensions/registry'
export interface Bindings {
  SENDING_DOMAINS?: string
  EXTENSIONS?: Registry
  NOTIFY_WEBHOOK_URL?: string
  GITHUB_TOKEN?: string
  PUBLIC_INTAKES?: Record<string, unknown>
  AI?: Ai
  judgeArticles?: (
    binding: Ai,
    question: string,
    articles: { id: string; title: string; body: string }[],
  ) => Promise<{ id: string; score: number }[]>
  DB: D1Database
  RAW: R2Bucket
  JOBS: Queue
  EMAIL: SendEmail
  ASSETS: Fetcher
  ENVIRONMENT?: string
  LOCAL_OPERATOR?: string
  ACCESS_ISSUER?: string
  ACCESS_AUDIENCE?: string
}
