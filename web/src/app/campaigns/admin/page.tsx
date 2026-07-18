'use client'

import { useEffect, useState } from 'react'
import { createCampaign, type CreateCampaignInput } from '@/lib/api'

const TYPES = ['trading', 'lp-incentive', 'quest', 'airdrop']
const KEY_STORAGE = 'adjacent_admin_key'

const EMPTY = {
  title: '',
  protocols: '',
  type: TYPES[0],
  description: '',
  rewardSummary: '',
  startsAt: '',
  endsAt: '',
  url: '',
  imageUrl: '',
}

export default function AdminCampaignsPage() {
  const [adminKey, setAdminKey] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  )

  useEffect(() => {
    const stored = localStorage.getItem(KEY_STORAGE)
    if (stored) setAdminKey(stored)
  }, [])

  function saveKey(value: string) {
    setAdminKey(value)
    localStorage.setItem(KEY_STORAGE, value)
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    try {
      const input: CreateCampaignInput = {
        title: form.title,
        protocols: form.protocols
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        type: form.type,
        description: form.description,
        rewardSummary: form.rewardSummary,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        url: form.url,
        imageUrl: form.imageUrl || undefined,
        chainId: 143,
      }
      const created = await createCampaign(input, adminKey)
      setResult({ ok: true, message: `Created “${created.title}”` })
      setForm({ ...EMPTY })
    } catch (err) {
      setResult({ ok: false, message: (err as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 lg:px-8 lg:py-12">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-tight text-bone">
        New campaign
      </h1>
      <p className="mt-2 text-sm text-steel">Admin only — requires your key.</p>

      <label className="mt-6 block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          Admin key
        </span>
        <input
          type="password"
          value={adminKey}
          onChange={(e) => saveKey(e.target.value)}
          placeholder="x-admin-key"
          className="mt-1 w-full rounded-md border border-hairline bg-panel px-3 py-2.5 font-mono text-sm text-bone outline-none focus:border-brand"
        />
      </label>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Title">
          <TextInput
            value={form.title}
            onChange={(v) => set('title', v)}
            required
          />
        </Field>
        <Field label="Protocols (comma-separated)">
          <TextInput
            value={form.protocols}
            onChange={(v) => set('protocols', v)}
            placeholder="kuru, perpl"
            required
          />
        </Field>
        <Field label="Type">
          <select
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
            className="w-full rounded-md border border-hairline bg-panel px-3 py-2.5 font-mono text-sm text-bone outline-none focus:border-brand"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            required
            rows={3}
            className="w-full rounded-md border border-hairline bg-panel px-3 py-2.5 text-sm text-bone outline-none focus:border-brand"
          />
        </Field>
        <Field label="Reward summary">
          <TextInput
            value={form.rewardSummary}
            onChange={(v) => set('rewardSummary', v)}
            placeholder="$50,000 prize pool"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts at">
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => set('startsAt', e.target.value)}
              required
              className="w-full rounded-md border border-hairline bg-panel px-3 py-2.5 font-mono text-sm text-bone outline-none focus:border-brand"
            />
          </Field>
          <Field label="Ends at">
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => set('endsAt', e.target.value)}
              required
              className="w-full rounded-md border border-hairline bg-panel px-3 py-2.5 font-mono text-sm text-bone outline-none focus:border-brand"
            />
          </Field>
        </div>
        <Field label="URL">
          <TextInput
            value={form.url}
            onChange={(v) => set('url', v)}
            placeholder="https://…"
            required
          />
        </Field>
        <Field label="Image URL (optional)">
          <TextInput
            value={form.imageUrl}
            onChange={(v) => set('imageUrl', v)}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting || !adminKey}
          className="rounded-md bg-brand px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Creating…' : 'Create campaign'}
        </button>

        {result && <p className={cnResult(result.ok)}>{result.message}</p>}
      </form>
    </main>
  )
}

function cnResult(ok: boolean): string {
  return ok
    ? 'font-mono text-[11px] text-safe'
    : 'font-mono text-[11px] text-danger'
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-md border border-hairline bg-panel px-3 py-2.5 text-sm text-bone outline-none focus:border-brand"
    />
  )
}
