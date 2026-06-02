import 'server-only'

import { Prisma, type PrismaClient } from '@prisma/client'

import { hashPassword } from '@/lib/crypto'
import type { RegisterInput } from '@/schemas/auth'

import { AuthError } from './errors'

export interface PublicUser {
  id: string
  email: string
  username: string
  role: 'USER' | 'ADMIN'
  emailVerified: Date | null
}

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  username: true,
  role: true,
  emailVerified: true,
} as const

/**
 * Create a user with an argon2id-hashed password. Uniqueness is enforced by DB
 * constraints (not a racy pre-check): we attempt the insert and map the
 * P2002 unique violation to a typed error.
 */
export async function registerUser(
  prisma: PrismaClient,
  input: RegisterInput,
): Promise<PublicUser> {
  const passwordHash = await hashPassword(input.password)

  try {
    return await prisma.user.create({
      data: { email: input.email, username: input.username, passwordHash },
      select: PUBLIC_FIELDS,
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined) ?? []
      if (target.includes('email')) {
        throw new AuthError('EMAIL_TAKEN', 'That email is already registered')
      }
      if (target.includes('username')) {
        throw new AuthError('USERNAME_TAKEN', 'That username is taken')
      }
    }
    throw err
  }
}
