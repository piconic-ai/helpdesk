import type { Registry } from '../extensions/registry'
export interface Bindings {
  EXTENSIONS?: Registry
  GITHUB_TOKEN?: string
  PUBLIC_INTAKES?: Record<string, unknown>
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
