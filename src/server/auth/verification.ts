import 'server-only'

import type { PrismaClient, VerificationKind } from '@prisma/client'

import { generateToken, sha256 } from '@/lib/crypto'

const TTL_MS: Record<VerificationKind, number> = {
  EMAIL_VERIFY: 1000 * 60 * 60 * 24, // 24 hours
  PASSWORD_RESET: 1000 * 60 * 60, // 1 hour
}

/**
 * Create a single-use verification token. Returns the **raw** token (the only
 * time it exists in cleartext) — only its SHA-256 hash is stored.
 */
export async function createVerificationToken(
  prisma: PrismaClient,
  userId: string,
  kind: VerificationKind,
): Promise<string> {
  const raw = generateToken(32)
  await prisma.verificationToken.create({
    data: {
      userId,
      tokenHash: sha256(raw),
      kind,
      expiresAt: new Date(Date.now() + TTL_MS[kind]),
    },
  })
  return raw
}

/**
 * Consume a token. Returns the `userId` if the token is valid, unexpired, the
 * right kind, and not already used — otherwise `null`. The consume is atomic
 * (`updateMany ... WHERE consumedAt IS NULL`) so a token can't be used twice
 * even under a race.
 */
export async function consumeVerificationToken(
  prisma: PrismaClient,
  rawToken: string,
  kind: VerificationKind,
): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
  })
  if (!record) return null
  if (record.kind !== kind) return null
  if (record.consumedAt) return null
  if (record.expiresAt.getTime() < Date.now()) return null

  const result = await prisma.verificationToken.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  })
  if (result.count !== 1) return null // lost the race — already consumed

  return record.userId
}
