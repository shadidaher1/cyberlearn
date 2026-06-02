'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { FormField } from '@/components/auth/form-field'
import { BracketLabel } from '@/components/brand/bracket-label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerSchema } from '@/schemas/auth'

type Errors = Partial<Record<'email' | 'username' | 'password', string>>

export function RegisterForm() {
  const router = useRouter()
  const [values, setValues] = useState({ email: '', username: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setFormError(null)

    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors
      setErrors({ email: f.email?.[0], username: f.username?.[0], password: f.password?.[0] })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()
      if (!res.ok) {
        const details = data?.error?.details as Record<string, string[]> | undefined
        if (details) {
          setErrors({
            email: details.email?.[0],
            username: details.username?.[0],
            password: details.password?.[0],
          })
        }
        setFormError(data?.error?.message ?? 'Registration failed')
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
      <BracketLabel className="mb-2">register</BracketLabel>
      <h1 className="font-display text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Start capturing flags.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <FormField label="email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            placeholder="you@domain.dev"
          />
        </FormField>
        <FormField label="username" htmlFor="username" error={errors.username}>
          <Input
            id="username"
            autoComplete="username"
            value={values.username}
            onChange={update('username')}
            placeholder="h4ckerman"
          />
        </FormField>
        <FormField label="password" htmlFor="password" error={errors.password} hint="At least 10 characters">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={update('password')}
          />
        </FormField>

        {formError ? <p className="font-mono text-sm text-destructive">[ error ] {formError}</p> : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'creating…' : 'create account'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
