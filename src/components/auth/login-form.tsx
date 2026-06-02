'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { FormField } from '@/components/auth/form-field'
import { BracketLabel } from '@/components/brand/bracket-label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const router = useRouter()
  const [values, setValues] = useState({ email: '', password: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data?.error?.message ?? 'Sign in failed')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setFormError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ring-glow rounded-lg border border-border bg-surface p-6">
      <BracketLabel className="mb-2">login</BracketLabel>
      <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Resume the hunt.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <FormField label="email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            placeholder="you@domain.dev"
          />
        </FormField>
        <FormField label="password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={update('password')}
          />
        </FormField>

        {formError ? <p className="font-mono text-sm text-destructive">[ error ] {formError}</p> : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'signing in…' : 'sign in'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Need an account?{' '}
        <Link href="/register" className="text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
