export type AuthErrorCode =
  | 'EMAIL_TAKEN'
  | 'USERNAME_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'

/** A typed domain error the HTTP layer maps to a status + safe message. */
export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

const STATUS: Record<AuthErrorCode, number> = {
  EMAIL_TAKEN: 409,
  USERNAME_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  EMAIL_NOT_VERIFIED: 403,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
}

export function authErrorStatus(code: AuthErrorCode): number {
  return STATUS[code]
}
