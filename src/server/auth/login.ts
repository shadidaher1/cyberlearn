import 'server-only'

import type { PrismaClient } from '@prisma/client'

import { hashPassword, verifyPassword } from '@/lib/crypto'
import type { LoginInput } from '@/schemas/auth'

import type { PublicUser } from './register'

/**
 * A dummy argon2id hash, computed once, used to keep login timing constant for
 * unknown emails — so response time can't be used to enumerate accounts.
 */
let dummyHashPromise: Promise<string> | null = null
function dummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword('cl-timing-equalizer-not-a-real-password')
  return dummyHashPromise
}

/**
 * Verify credentials. Returns the public user on success, otherwise `null`.
 * Always runs a password verify (real or dummy) so timing doesn't reveal
 * whether the email exists. Never distinguishes "no such user" from "wrong
 * password" to the caller.
 */
export async function loginUser(
  prisma: PrismaClient,
  input: LoginInput,
): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  const hash = user?.passwordHash ?? (await dummyHash())
  const passwordOk = await verifyPassword(hash, input.password)

  if (!user || !user.passwordHash || !passwordOk) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    emailVerified: user.emailVerified,
  }
}
