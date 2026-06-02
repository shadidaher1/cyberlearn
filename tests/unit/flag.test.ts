import { describe, expect, it } from 'vitest'

import { hashFlag, verifyFlag } from '@/lib/flag'

describe('flag hashing (HMAC-SHA256)', () => {
  it('produces a 64-char hex hash, never the plaintext', () => {
    const h = hashFlag('flag{owasp_a01_broken_access}')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
    expect(h).not.toContain('owasp')
    expect(h).not.toContain('flag{')
  })

  it('is deterministic for the same flag', () => {
    expect(hashFlag('flag{x}')).toBe(hashFlag('flag{x}'))
  })

  it('normalizes surrounding whitespace', () => {
    expect(hashFlag('   flag{x}  ')).toBe(hashFlag('flag{x}'))
  })

  it('differs for different flags', () => {
    expect(hashFlag('flag{a}')).not.toBe(hashFlag('flag{b}'))
  })
})

describe('verifyFlag (constant-time)', () => {
  const stored = hashFlag('flag{c0rrect_horse}')

  it('accepts the correct flag, tolerating surrounding whitespace', () => {
    expect(verifyFlag('flag{c0rrect_horse}', stored)).toBe(true)
    expect(verifyFlag('  flag{c0rrect_horse} ', stored)).toBe(true)
  })

  it('rejects a wrong flag', () => {
    expect(verifyFlag('flag{wr0ng}', stored)).toBe(false)
  })

  it('rejects a malformed or empty stored hash without throwing', () => {
    expect(verifyFlag('flag{x}', 'not-hex')).toBe(false)
    expect(verifyFlag('flag{x}', '')).toBe(false)
  })
})
