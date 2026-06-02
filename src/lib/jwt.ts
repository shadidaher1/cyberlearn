import 'server-only'

import { jwtVerify, SignJWT, type JWTPayload } from 'jose'

import { env } from '@/lib/env'

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET)
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)

const ISSUER = 'cyberlearn'
const ACCESS_TTL = '15m'
const REFRESH_TTL = '30d'

export type UserRole = 'USER' | 'ADMIN'

export interface AccessClaims extends JWTPayload {
  sub: string
  role: UserRole
}

export interface RefreshClaims extends JWTPayload {
  sub: string
  jti: string
  fam: string
}

/** Short-lived access token (carries identity + role). */
export function signAccessToken(input: { sub: string; role: UserRole }): Promise<string> {
  return new SignJWT({ role: input.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(input.sub)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(accessSecret)
}

/** Long-lived, rotating refresh token. `jti` maps to a RefreshToken row; `fam` is the rotation family. */
export function signRefreshToken(input: {
  sub: string
  jti: string
  fam: string
}): Promise<string> {
  return new SignJWT({ fam: input.fam })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(input.sub)
    .setJti(input.jti)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(refreshSecret)
}

export async function verifyAccessToken(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret, { issuer: ISSUER })
    if (typeof payload.sub !== 'string') return null
    if (payload.role !== 'USER' && payload.role !== 'ADMIN') return null
    return payload as AccessClaims
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshClaims | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret, { issuer: ISSUER })
    if (typeof payload.sub !== 'string') return null
    if (typeof payload.jti !== 'string') return null
    if (typeof payload.fam !== 'string') return null
    return payload as RefreshClaims
  } catch {
    return null
  }
}
