'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { FormField } from '@/components/auth/form-field'
import { BracketLabel } from '@/components/brand/bracket-label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { passwordSchema } from '@/schemas/auth'

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFormError(null)
    const parsed = passwordSchema.safeParse(password)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid password')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data?.error?.message ?? 'Reset failed')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/login'), 1500)
    } catch {
      setFormError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="ring-glow rounded-lg border border-border bg-surface p-6 text-center">
        <BracketLabel className="mb-2">reset // password</BracketLabel>
        <h1 className="font-display text-2xl font-bold tracking-tight">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">This reset link is missing or malformed.</p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="ring-glow rounded-lg border border-border bg-surface p-6 text-center">
        <BracketLabel className="mb-2">reset // done</BracketLabel>
        <h1 className="text-accent text-accent-glow font-display text-2xl font-bold tracking-tight">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting you to sign in…</p>
      </div>
    )
  }

  return (
    <div className="ring-glow rounded-lg border border-border bg-surface p-6">
      <BracketLabel className="mb-2">reset password</BracketLabel>
      <h1 className="font-display text-2xl font-bold tracking-tight">Set a new password</h1>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <FormField
          label="new password"
          htmlFor="password"
          error={error ?? undefined}
          hint="At least 10 characters"
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        {formError ? <p className="font-mono text-sm text-destructive">[ error ] {formError}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'updating…' : 'update password'}
        </Button>
      </form>
    </div>
  )
}
