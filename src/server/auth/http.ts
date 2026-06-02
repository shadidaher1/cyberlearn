import 'server-only'

import { fail } from '@/lib/api'

import { AuthError, authErrorStatus } from './errors'

/** Map a thrown error to a safe HTTP response — never leaks internals. */
export function authErrorResponse(err: unknown) {
  if (err instanceof AuthError) {
    return fail(authErrorStatus(err.code), err.code, err.message)
  }
  console.error('[auth] unexpected error:', err)
  return fail(500, 'INTERNAL', 'Something went wrong')
}

/** Best-effort client IP for rate-limit keys (Vercel sets `x-forwarded-for`). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}
