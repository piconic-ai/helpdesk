import type {
  CandidateSummary,
  Judgment,
  JudgmentModel,
} from '../extensions/article-judgment'
import type { Registry } from '../extensions/registry'
export interface Bindings {
  SENDING_DOMAINS?: string
  EXTENSIONS?: Registry
  NOTIFY_WEBHOOK_URL?: string
  GITHUB_TOKEN?: string
  PUBLIC_INTAKES?: Record<string, unknown>
  AI?: Ai
  candidateSources?: Record<
    string,
    (
      db: D1Database,
      product: string,
      text: string,
    ) => Promise<CandidateSummary[]>
  >
  judgeArticles?: (
    binding: Ai,
    model: JudgmentModel,
    question: string,
    articles: CandidateSummary[],
    name?: string,
  ) => Promise<Judgment>
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
