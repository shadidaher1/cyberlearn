import 'server-only'

import type { PrismaClient } from '@prisma/client'

import { generateToken, sha256 } from '@/lib/crypto'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type UserRole,
} from '@/lib/jwt'

const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

export interface SessionTokens {
  accessToken: string
  refreshToken: string
}

interface TokenUser {
  id: string
  role: UserRole
}

/** Start a new session: a fresh refresh-token family + an access token. */
export async function issueSession(prisma: PrismaClient, user: TokenUser): Promise<SessionTokens> {
  const jti = generateToken(18)
  const fam = generateToken(18)
  const refreshToken = await signRefreshToken({ sub: user.id, jti, fam })

  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      tokenHash: sha256(refreshToken),
      familyId: fam,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  })

  const accessToken = await signAccessToken({ sub: user.id, role: user.role })
  return { accessToken, refreshToken }
}

/**
 * Rotate a refresh token. Returns new tokens on success, or `null` if the token
 * is invalid/expired. If an already-rotated (revoked) token is replayed, that
 * signals theft — the whole family is revoked.
 */
export async function rotateSession(
  prisma: PrismaClient,
  rawRefresh: string,
): Promise<SessionTokens | null> {
  const claims = await verifyRefreshToken(rawRefresh)
  if (!claims) return null

  const record = await prisma.refreshToken.findUnique({ where: { id: claims.jti } })
  if (!record) return null

  if (record.revokedAt) {
    // Reuse of a rotated token ⇒ likely theft. Burn the family.
    await prisma.refreshToken.updateMany({
      where: { familyId: record.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return null
  }

  if (record.expiresAt.getTime() < Date.now()) return null
  if (record.tokenHash !== sha256(rawRefresh)) return null

  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: { id: true, role: true },
  })
  if (!user) return null

  const newJti = generateToken(18)
  const refreshToken = await signRefreshToken({
    sub: user.id,
    jti: newJti,
    fam: record.familyId,
  })

  // Revoke the old token and mint the next one in the same family, atomically.
  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({
      data: {
        id: newJti,
        userId: user.id,
        tokenHash: sha256(refreshToken),
        familyId: record.familyId,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    }),
  ])

  const accessToken = await signAccessToken({ sub: user.id, role: user.role })
  return { accessToken, refreshToken }
}

/** Revoke the refresh token behind a logout (best-effort; never throws). */
export async function revokeSession(
  prisma: PrismaClient,
  rawRefresh: string | null,
): Promise<void> {
  if (!rawRefresh) return
  const claims = await verifyRefreshToken(rawRefresh)
  if (!claims) return
  await prisma.refreshToken.updateMany({
    where: { id: claims.jti, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
