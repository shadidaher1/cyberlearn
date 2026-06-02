import { describe, expect, it } from 'vitest'

import {
  constantTimeEqual,
  generateToken,
  hashPassword,
  sha256,
  verifyPassword,
} from '@/lib/crypto'

describe('password hashing (argon2id)', () => {
  it('hashes and verifies a correct password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    expect(hash).toMatch(/^\$argon2id\$/)
    expect(await verifyPassword(hash, 'correct horse battery staple')).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    expect(await verifyPassword(hash, 'wrong password')).toBe(false)
  })

  it('uses a random salt — same password hashes differently each time', async () => {
    const a = await hashPassword('same-password')
    const b = await hashPassword('same-password')
    expect(a).not.toBe(b)
  })

  it('returns false on a malformed hash instead of throwing', async () => {
    expect(await verifyPassword('not-a-valid-hash', 'whatever')).toBe(false)
  })
})

describe('token helpers', () => {
  it('sha256 is deterministic and 64 hex chars', () => {
    expect(sha256('abc')).toBe(sha256('abc'))
    expect(sha256('abc')).toMatch(/^[0-9a-f]{64}$/)
    expect(sha256('abc')).not.toBe(sha256('abd'))
  })

  it('generateToken returns unique, url-safe tokens', () => {
    const a = generateToken()
    const b = generateToken()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('constantTimeEqual matches equal and rejects unequal / different length', () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true)
    expect(constantTimeEqual('abc', 'abd')).toBe(false)
    expect(constantTimeEqual('abc', 'abcd')).toBe(false)
  })
})
