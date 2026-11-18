import { z } from 'zod'
import { coreOperations, type Context, type Scope } from './catalog-usecase'
import { authorize, PermissionDenied } from './catalog'
import { extensionContext } from '../extensions/context-usecase'
import { eventStatement } from '../conversations/conversations-store'

import { results as outputs } from './results-schema'
function available(ctx: Context) {
  const core = Object.entries(coreOperations).map(([name, op]) => ({
    name,
    description: 'Helpdesk ' + name,
    permission: op.permission,
    input: op.input,
    output: outputs[name as keyof typeof coreOperations],
    humanOnly: false,
    run: (i: unknown) => op.execute(ctx, i),
  }))
  const extra = (ctx.env.EXTENSIONS?.active ?? []).flatMap((item) =>
    (item.extension.operations ?? []).map((op) => ({
      ...op,
      name: item.extension.id + '.' + op.name,
      humanOnly: op.humanOnly ?? false,
      run: (i: unknown) =>
        op.run(extensionContext(ctx, item), op.input.parse(i)),
    })),
  )
  return [...core, ...extra]
}
function permitted(
  ctx: Context,
  op: { permission: Scope; humanOnly: boolean },
  scopes: ReadonlySet<Scope>,
) {
  if (op.humanOnly && ctx.actor.kind !== 'operator') return false
  try {
    authorize(ctx, op.permission, scopes)
    return true
  } catch {
    return false
  }
}
export function describe(ctx: Context, scopes: ReadonlySet<Scope>) {
  return available(ctx)
    .filter((op) => permitted(ctx, op, scopes))
    .map((op) => ({
      name: op.name,
      description: op.description,
      inputSchema: z.toJSONSchema(op.input, {
        io: 'input',
        unrepresentable: 'any',
      }),
      outputSchema: z.toJSONSchema(op.output, { unrepresentable: 'any' }),
    }))
}
export async function invoke(
  ctx: Context,
  scopes: ReadonlySet<Scope>,
  name: string,
  input: unknown,
) {
  const op = available(ctx).find((o) => o.name === name)
  if (!op) throw new Error('Unknown operation')
  if (!permitted(ctx, op, scopes))
    throw new PermissionDenied('Permission denied')
  const result = await op.run(input)
  if (ctx.actor.kind === 'agent') {
    await eventStatement(
      ctx.env.DB,
      { actor: JSON.stringify(ctx.actor), now: ctx.now },
      null,
      'operation_invoked',
      { operation: name },
    ).run()
  }
  return op.output.parse(result ?? null)
}
