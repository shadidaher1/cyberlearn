'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { FormField } from '@/components/auth/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'INSANE'] as const

export interface ChallengeFormInitial {
  id: string
  slug: string
  title: string
  description: string
  owaspRef: string | null
  difficulty: string
  points: number
  published: boolean
  categorySlug: string
}

const fieldClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm text-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent'

export function ChallengeForm({
  initial,
  categories,
}: {
  initial?: ChallengeFormInitial
  categories: { slug: string; name: string }[]
}) {
  const router = useRouter()
  const editing = Boolean(initial)
  const [v, setV] = useState({
    slug: initial?.slug ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    owaspRef: initial?.owaspRef ?? '',
    categorySlug: initial?.categorySlug ?? categories[0]?.slug ?? '',
    difficulty: initial?.difficulty ?? 'EASY',
    points: String(initial?.points ?? 50),
    flag: '',
    published: initial?.published ?? false,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function upd<K extends keyof typeof v>(key: K, value: (typeof v)[K]) {
    setV((s) => ({ ...s, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!editing && !v.flag.trim()) {
      setError('A flag is required to create a challenge')
      return
    }
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        title: v.title,
        description: v.description,
        owaspRef: v.owaspRef || undefined,
        categorySlug: v.categorySlug,
        difficulty: v.difficulty,
        points: Number(v.points),
        published: v.published,
      }
      if (v.flag.trim()) payload.flag = v.flag.trim()
      if (!editing) payload.slug = v.slug

      const res = await fetch(
        editing ? `/api/admin/challenges/${initial!.id}` : '/api/admin/challenges',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error?.message ?? 'Save failed')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {!editing && (
        <FormField label="slug" htmlFor="slug" hint="lowercase + hyphens — the URL id">
          <Input
            id="slug"
            value={v.slug}
            onChange={(e) => upd('slug', e.target.value)}
            placeholder="web-a01-broken-access-control"
          />
        </FormField>
      )}

      <FormField label="title" htmlFor="title">
        <Input id="title" value={v.title} onChange={(e) => upd('title', e.target.value)} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="category" htmlFor="category">
          <select
            id="category"
            value={v.categorySlug}
            onChange={(e) => upd('categorySlug', e.target.value)}
            className={fieldClass}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="difficulty" htmlFor="difficulty">
          <select
            id="difficulty"
            value={v.difficulty}
            onChange={(e) => upd('difficulty', e.target.value)}
            className={fieldClass}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.toLowerCase()}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="points" htmlFor="points">
          <Input
            id="points"
            type="number"
            value={v.points}
            onChange={(e) => upd('points', e.target.value)}
          />
        </FormField>
        <FormField label="owasp ref (optional)" htmlFor="owaspRef">
          <Input
            id="owaspRef"
            value={v.owaspRef}
            onChange={(e) => upd('owaspRef', e.target.value)}
            placeholder="A01:2021 — …"
          />
        </FormField>
      </div>

      <FormField label="lesson (markdown)" htmlFor="description">
        <textarea
          id="description"
          value={v.description}
          onChange={(e) => upd('description', e.target.value)}
          rows={10}
          className={cn(fieldClass, 'h-auto resize-y py-2 leading-relaxed')}
          placeholder="Markdown lesson + the task…"
        />
      </FormField>

      <FormField
        label={editing ? 'flag (leave blank to keep current)' : 'flag'}
        htmlFor="flag"
        hint="stored as an HMAC hash — never shown again"
      >
        <Input
          id="flag"
          value={v.flag}
          onChange={(e) => upd('flag', e.target.value)}
          placeholder="flag{...}"
        />
      </FormField>

      <label className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={v.published}
          onChange={(e) => upd('published', e.target.checked)}
          className="size-4 [accent-color:var(--accent)]"
        />
        published
      </label>

      {error && <p className="font-mono text-sm text-destructive">[ error ] {error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'saving…' : editing ? 'save changes' : 'create challenge'}
      </Button>
    </form>
  )
}
