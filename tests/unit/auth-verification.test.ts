import type { PrismaClient } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import { sha256 } from '@/lib/crypto'
import { consumeVerificationToken, createVerificationToken } from '@/server/auth/verification'

describe('createVerificationToken', () => {
  it('stores only the hash and returns the raw token', async () => {
    let captured: { data: Record<string, unknown> } | undefined
    const prisma = {
      verificationToken: {
        create: vi.fn(async (args: { data: Record<string, unknown> }) => {
          captured = args
          return {}
        }),
      },
    } as unknown as PrismaClient

    const raw = await createVerificationToken(prisma, 'user_1', 'EMAIL_VERIFY')

    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(captured?.data.tokenHash).toBe(sha256(raw))
    expect(captured?.data.tokenHash).not.toBe(raw)
    expect(captured?.data.userId).toBe('user_1')
    expect(captured?.data.kind).toBe('EMAIL_VERIFY')
  })
})

describe('consumeVerificationToken', () => {
  const valid = {
    id: 'vt1',
    userId: 'user_1',
    kind: 'EMAIL_VERIFY',
    consumedAt: null,
    expiresAt: new Date(Date.now() + 10_000),
  }

  function prismaWith(record: unknown, updateCount = 1): PrismaClient {
    return {
      verificationToken: {
        findUnique: vi.fn(async () => record),
        updateMany: vi.fn(async () => ({ count: updateCount })),
      },
    } as unknown as PrismaClient
  }

  it('returns the userId for a valid token', async () => {
    expect(await consumeVerificationToken(prismaWith(valid), 'raw', 'EMAIL_VERIFY')).toBe('user_1')
  })

  it('returns null for an unknown token', async () => {
    expect(await consumeVerificationToken(prismaWith(null), 'raw', 'EMAIL_VERIFY')).toBeNull()
  })

  it('returns null when the kind does not match', async () => {
    expect(await consumeVerificationToken(prismaWith(valid), 'raw', 'PASSWORD_RESET')).toBeNull()
  })

  it('returns null for an expired token', async () => {
    const expired = { ...valid, expiresAt: new Date(Date.now() - 1) }
    expect(await consumeVerificationToken(prismaWith(expired), 'raw', 'EMAIL_VERIFY')).toBeNull()
  })

  it('returns null for an already-consumed token', async () => {
    const used = { ...valid, consumedAt: new Date() }
    expect(await consumeVerificationToken(prismaWith(used), 'raw', 'EMAIL_VERIFY')).toBeNull()
  })

  it('returns null if it loses the consume race (update affects 0 rows)', async () => {
    expect(await consumeVerificationToken(prismaWith(valid, 0), 'raw', 'EMAIL_VERIFY')).toBeNull()
  })
})
