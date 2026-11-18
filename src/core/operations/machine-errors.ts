import { z } from 'zod'
import { PermissionDenied } from './catalog'

export function machineError(err: unknown) {
  if (err instanceof PermissionDenied)
    return { status: 403 as const, message: 'Permission denied' }
  if (err instanceof z.ZodError)
    return {
      status: 400 as const,
      message: err.issues
        .map((i) => i.path.join('.') + ' ' + i.message)
        .join('; '),
    }
  if (err instanceof SyntaxError)
    return { status: 400 as const, message: 'Invalid JSON' }
  if (err instanceof Error && /unknown operation|not found/i.test(err.message))
    return { status: 404 as const, message: 'Operation or resource not found' }
  return { status: 409 as const, message: 'Operation could not be completed' }
}
