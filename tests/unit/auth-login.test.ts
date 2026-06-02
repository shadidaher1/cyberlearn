import type { PrismaClient } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import { hashPassword } from '@/lib/crypto'
import { loginUser } from '@/server/auth/login'

function prismaWithUser(user: unknown): PrismaClient {
  return { user: { findUnique: vi.fn(async () => user) } } as unknown as PrismaClient
}

describe('loginUser', () => {
  it('returns null for an unknown email', async () => {
    const result = await loginUser(prismaWithUser(null), {
      email: 'nope@x.com',
      password: 'whatever123',
    })
    expect(result).toBeNull()
  })

  it('returns null for a wrong password', async () => {
    const passwordHash = await hashPassword('the-right-password')
    const record = { id: 'u1', email: 'a@b.com', username: 'shadi', role: 'USER', emailVerified: null, passwordHash }
    expect(
      await loginUser(prismaWithUser(record), { email: 'a@b.com', password: 'the-wrong-password' }),
    ).toBeNull()
  })

  it('returns the public user (no passwordHash) for correct credentials', async () => {
    const passwordHash = await hashPassword('the-right-password')
    const record = { id: 'u1', email: 'a@b.com', username: 'shadi', role: 'USER', emailVerified: new Date(), passwordHash }
    const user = await loginUser(prismaWithUser(record), {
      email: 'a@b.com',
      password: 'the-right-password',
    })
    expect(user?.id).toBe('u1')
    expect(user).not.toHaveProperty('passwordHash')
  })

  it('rejects password login for an OAuth-only account (no passwordHash)', async () => {
    const record = { id: 'u1', email: 'a@b.com', username: 'shadi', role: 'USER', emailVerified: null, passwordHash: null }
    expect(
      await loginUser(prismaWithUser(record), { email: 'a@b.com', password: 'anything12345' }),
    ).toBeNull()
  })
})
