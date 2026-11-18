export interface Bindings {
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
