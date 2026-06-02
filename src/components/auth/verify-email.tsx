'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { BracketLabel } from '@/components/brand/bracket-label'
import { Button } from '@/components/ui/button'

type State = 'verifying' | 'success' | 'error'

export function VerifyEmail({ token }: { token: string | null }) {
  const [state, setState] = useState<State>(token ? 'verifying' : 'error')
  const ran = useRef(false)

  useEffect(() => {
    if (!token || ran.current) return
    ran.current = true // guard against React strict-mode double-invoke
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => setState(res.ok ? 'success' : 'error'))
      .catch(() => setState('error'))
  }, [token])

  return (
    <div className="ring-glow rounded-lg border border-border bg-surface p-6 text-center">
      <BracketLabel className="mb-2">verify // email</BracketLabel>

      {state === 'verifying' && (
        <>
          <h1 className="font-display text-2xl font-bold tracking-tight">Verifying…</h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            confirming your link<span className="cursor-blink" aria-hidden />
          </p>
        </>
      )}

      {state === 'success' && (
        <>
          <h1 className="text-accent text-accent-glow font-display text-2xl font-bold tracking-tight">
            Email verified
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">You&apos;re all set.</p>
          <Button asChild className="mt-6 w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </>
      )}

      {state === 'error' && (
        <>
          <h1 className="font-display text-2xl font-bold tracking-tight">Link invalid or expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Request a fresh verification email from your dashboard.
          </p>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </>
      )}
    </div>
  )
}
