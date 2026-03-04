'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { updateProfile } from '@/lib/profiles'
import { signOut } from '@/lib/auth'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    is_private: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? '',
        bio: profile.bio ?? '',
        is_private: profile.is_private,
      })
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')

    const { error } = await updateProfile(user.id, form)
    if (error) {
      setError(error.message)
    } else {
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!profile) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 pb-24 md:pb-8 animate-slide-up">
          <h1 className="font-semibold mb-8">Settings</h1>

          {/* Profile */}
          <Section title="Profile">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Username
                </label>
                <input className="input" value={profile.username} disabled />
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Username cannot be changed</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Display name
                </label>
                <input
                  className="input"
                  value={form.display_name}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                  placeholder="Your display name"
                  maxLength={50}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Bio
                </label>
                <textarea
                  className="input resize-none"
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell people about yourself…"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-secondary)' }}>
                <div>
                  <p className="text-sm font-medium">Private profile</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Only followers can see your profile
                  </p>
                </div>
                <Toggle checked={form.is_private} onChange={(v) => setForm((f) => ({ ...f, is_private: v }))} />
              </label>

              {error && (
                <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
              )}

              <button type="submit" className="btn w-full" disabled={saving}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
              </button>
            </form>
          </Section>

          {/* Appearance */}
          <Section title="Appearance">
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-secondary)' }}>
              <div>
                <p className="text-sm font-medium">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Switch between dark and light</p>
              </div>
              <button className="btn btn-ghost px-4 py-1.5 text-sm" onClick={toggleTheme}>
                {theme === 'dark' ? '☀ Light' : '☾ Dark'}
              </button>
            </div>
          </Section>

          {/* Account */}
          <Section title="Account">
            <div className="p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <button
              className="btn btn-danger w-full mt-3 py-2.5"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </Section>
        </div>
      </main>

      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h4 className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
        {title}
      </h4>
      <div className="card p-4 space-y-3">{children}</div>
    </section>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? 'var(--accent)' : 'var(--border)' }}
      role="switch"
      aria-checked={checked}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
      />
    </button>
  )
}
