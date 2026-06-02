import 'server-only'

import { cookies } from 'next/headers'

export const ACCESS_COOKIE = 'cl_access'
export const REFRESH_COOKIE = 'cl_refresh'

const ACCESS_MAX_AGE = 60 * 15 // 15 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function baseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const jar = await cookies()
  jar.set(ACCESS_COOKIE, accessToken, { ...baseOptions(), maxAge: ACCESS_MAX_AGE })
  jar.set(REFRESH_COOKIE, refreshToken, { ...baseOptions(), maxAge: REFRESH_MAX_AGE })
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies()
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
}

export async function readAuthCookies(): Promise<{
  accessToken: string | null
  refreshToken: string | null
}> {
  const jar = await cookies()
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: jar.get(REFRESH_COOKIE)?.value ?? null,
  }
}
