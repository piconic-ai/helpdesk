import { z } from 'zod'
import type { Audit } from '../conversations/conversations-store'

export async function savedHostedPolicy(
  db: D1Database,
  product: string,
  origin: string,
) {
  return z
    .string()
    .nullable()
    .parse(
      await db
        .prepare(
          'SELECT public_key FROM hosted_intakes WHERE product=? AND origin=?',
        )
        .bind(product, origin)
        .first('public_key'),
    )
}

export async function startHostedIntake(
  db: D1Database,
  product: string,
  origin: string,
  key: string,
  audit: Audit,
) {
  await db.batch([
    db
      .prepare(
        'INSERT INTO hosted_intakes (product,origin,public_key) VALUES (?,?,?) ON CONFLICT(product) DO NOTHING',
      )
      .bind(product, origin, key),
    db
      .prepare(
        "INSERT INTO events(kind,actor,payload,at) SELECT 'hosted_intake_started',?,?,? WHERE changes()=1",
      )
      .bind(audit.actor, JSON.stringify({ product, origin }), audit.now),
  ])
}
