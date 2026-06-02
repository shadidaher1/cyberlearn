import { NextResponse } from 'next/server'

/**
 * Uniform JSON response envelope for route handlers. Every response is shaped
 * `{ ok: true, ... }` or `{ ok: false, error: { code, message } }` so the
 * client can branch on `ok` without guessing. Internal error details are never
 * placed in the envelope — see docs/SECURITY.md.
 */
type JsonObject = Record<string, unknown>

export function ok<T extends JsonObject>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init)
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status },
  )
}
