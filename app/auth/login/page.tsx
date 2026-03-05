'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.replace('/chats')
    }
  }

  return (
    <div className="w-full max-w-sm animate-slide-up">
      <div className="card p-8">
        <div className="mb-8">
          <h2 className="font-semibold mb-1">Welcome back</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Sign in to continue to Relay
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-[var(--radius-sm)]"
               style={{ background: 'rgba(192,57,43,0.08)', color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn w-full py-2.5" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="divider my-6" />

        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link href="/auth/signup" className="font-medium" style={{ color: 'var(--text)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
