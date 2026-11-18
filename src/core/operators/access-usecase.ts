import { z } from 'zod'
import type { Bindings } from '../settings/bindings'
import { accessEmail } from './access-client'
import { registerOperator } from './operators-store'

export async function currentOperator(env: Bindings, token: string) {
  let email: string | null = null
  if (env.LOCAL_OPERATOR) {
    if (env.ENVIRONMENT !== 'local')
      throw new Error('LOCAL_OPERATOR requires ENVIRONMENT=local')
    email = z.email().parse(env.LOCAL_OPERATOR).toLowerCase()
  } else if (env.ACCESS_ISSUER && env.ACCESS_AUDIENCE) {
    email = await accessEmail(token, env.ACCESS_ISSUER, env.ACCESS_AUDIENCE)
  }
  return email ? registerOperator(env.DB, email) : null
}
