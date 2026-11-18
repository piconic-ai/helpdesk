import { z } from 'zod'
export const operatorSchema = z.object({
  email: z.email(),
  role: z.enum(['admin', 'agent']),
})
export type Operator = z.infer<typeof operatorSchema>
export async function registerOperator(db: D1Database, email: string) {
  const [, row] = await db.batch([
    db
      .prepare(
        "INSERT INTO operators SELECT ?, CASE WHEN EXISTS(SELECT 1 FROM operators) THEN 'agent' ELSE 'admin' END ON CONFLICT(email) DO NOTHING",
      )
      .bind(email),
    db.prepare('SELECT email,role FROM operators WHERE email=?').bind(email),
  ])
  return operatorSchema.parse(row.results[0])
}
