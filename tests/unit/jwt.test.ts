import { describe, expect, it } from 'vitest'

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/jwt'

describe('access tokens', () => {
  it('signs and verifies, preserving subject + role', async () => {
    const token = await signAccessToken({ sub: 'user_1', role: 'ADMIN' })
    const claims = await verifyAccessToken(token)
    expect(claims?.sub).toBe('user_1')
    expect(claims?.role).toBe('ADMIN')
  })

  it('rejects a tampered token', async () => {
    const token = await signAccessToken({ sub: 'user_1', role: 'USER' })
    expect(await verifyAccessToken(`${token}x`)).toBeNull()
  })

  it('rejects a refresh token presented as an access token (wrong secret)', async () => {
    const refresh = await signRefreshToken({ sub: 'u', jti: 'j', fam: 'f' })
    expect(await verifyAccessToken(refresh)).toBeNull()
  })

  it('rejects garbage', async () => {
    expect(await verifyAccessToken('not.a.jwt')).toBeNull()
  })
})

describe('refresh tokens', () => {
  it('signs and verifies, preserving subject, jti, and family', async () => {
    const token = await signRefreshToken({ sub: 'user_1', jti: 'tok_1', fam: 'fam_1' })
    const claims = await verifyRefreshToken(token)
    expect(claims?.sub).toBe('user_1')
    expect(claims?.jti).toBe('tok_1')
    expect(claims?.fam).toBe('fam_1')
  })

  it('does not verify under the access secret', async () => {
    const access = await signAccessToken({ sub: 'u', role: 'USER' })
    expect(await verifyRefreshToken(access)).toBeNull()
  })
})
