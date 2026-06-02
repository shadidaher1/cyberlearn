import { Prisma, type PrismaClient } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import { AuthError } from '@/server/auth/errors'
import { registerUser } from '@/server/auth/register'

type CreateArgs = { data: Record<string, unknown> }

function mockPrisma(create: (args: CreateArgs) => unknown): PrismaClient {
  return { user: { create: vi.fn(create) } } as unknown as PrismaClient
}

function p2002(target: string[]) {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target },
  })
}

const input = { email: 'a@b.com', username: 'shadi', password: 'supersecret12' }

describe('registerUser', () => {
  it('hashes the password (never stores plaintext) and persists the user', async () => {
    let captured: CreateArgs | undefined
    const prisma = mockPrisma((args) => {
      captured = args
      return { id: 'u1', email: input.email, username: input.username, role: 'USER', emailVerified: null }
    })

    const user = await registerUser(prisma, input)

    expect(user.id).toBe('u1')
    const hash = captured?.data.passwordHash as string
    expect(hash).toMatch(/^\$argon2id\$/)
    expect(hash).not.toContain(input.password)
  })

  it('maps a duplicate email to EMAIL_TAKEN', async () => {
    const prisma = mockPrisma(() => {
      throw p2002(['email'])
    })
    await expect(registerUser(prisma, input)).rejects.toMatchObject({ code: 'EMAIL_TAKEN' })
  })

  it('maps a duplicate username to USERNAME_TAKEN', async () => {
    const prisma = mockPrisma(() => {
      throw p2002(['username'])
    })
    await expect(registerUser(prisma, input)).rejects.toBeInstanceOf(AuthError)
  })
})
