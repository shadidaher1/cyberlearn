import type { Metadata } from 'next'

import { VerifyEmail } from '@/components/auth/verify-email'

export const metadata: Metadata = { title: 'Verify email' }

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return <VerifyEmail token={token ?? null} />
}
