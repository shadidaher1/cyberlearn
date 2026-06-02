'use client'

import Link from 'next/link'
import { useState } from 'react'

import { FormField } from '@/components/auth/form-field'
import { BracketLabel } from '@/components/brand/bracket-label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { emailRequestSchema } from '@/schemas/auth'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = emailRequestSchema.safeParse({ email })
    if (!parsed.success) {
      setError('Enter a valid email')
      return
    }
    setLoading(true)
    try {
      // Response is intentionally generic — we always show the same confirmation.
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      setSent(true)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="ring-glow rounded-lg border border-border bg-surface p-6 text-center">
        <BracketLabel className="mb-2">reset // sent</BracketLabel>
        <h1 className="font-display text-2xl font-bold tracking-tight">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for that email, a reset link is on its way.
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="ring-glow rounded-lg border border-border bg-surface p-6">
      <BracketLabel className="mb-2">reset password</BracketLabel>
      <h1 className="font-display text-2xl font-bold tracking-tight">Forgot your password?</h1>
      <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a reset link.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <FormField label="email" htmlFor="email" error={error ?? undefined}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.dev"
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'sending…' : 'send reset link'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
