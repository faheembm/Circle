'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { isValidUsername } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    display_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidUsername(form.username)) {
      setError('Username must be 3–20 characters: letters, numbers, underscores.')
      return
    }

    setLoading(true)
    const { error } = await signUp(form)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="w-full max-w-sm animate-slide-up">
      <div className="card p-8">
        <div className="mb-8">
          <h2 className="font-semibold mb-1">Create account</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Start chatting in seconds
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Username
              </label>
              <input
                type="text"
                className="input"
                placeholder="alice"
                value={form.username}
                onChange={(e) => update('username', e.target.value.toLowerCase())}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Display name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Alice"
                value={form.display_name}
                onChange={(e) => update('display_name', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-[var(--radius-sm)]"
               style={{ background: 'rgba(192,57,43,0.08)', color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn w-full py-2.5" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="divider my-6" />

        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium" style={{ color: 'var(--text)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
