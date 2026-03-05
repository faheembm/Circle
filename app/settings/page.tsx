'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { getProfile, updateProfile } from '@/lib/profiles'
import { signOut } from '@/lib/auth'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ display_name: '', bio: '', is_private: false })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/auth/login')
      return
    }

    getProfile(user.id)
      .then((p) => {
        setProfile(p)
        if (p) setForm({ display_name: p.display_name ?? '', bio: p.bio ?? '', is_private: p.is_private })
      })
      .catch(() => setProfile(null))
  }, [loading, user, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')

    const { error } = await updateProfile(user.id, form)
    if (error) {
      setError(error.message)
    } else {
      const updated = await getProfile(user.id)
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading || !profile) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 pb-24 md:pb-8 animate-slide-up">
          <h1 className="font-semibold mb-8">Settings</h1>
          <Section title="Profile">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Username</label><input className="input" value={profile.username} disabled /></div>
              <div className="space-y-1"><label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Display name</label><input className="input" value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} maxLength={50} /></div>
              <div className="space-y-1"><label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Bio</label><textarea className="input resize-none" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} maxLength={200} /></div>
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-secondary)' }}><div><p className="text-sm font-medium">Private profile</p></div><Toggle checked={form.is_private} onChange={(v) => setForm((f) => ({ ...f, is_private: v }))} /></label>
              {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
              <button type="submit" className="btn w-full" disabled={saving}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}</button>
            </form>
          </Section>
          <Section title="Appearance"><button className="btn btn-ghost px-4 py-1.5 text-sm" onClick={toggleTheme}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button></Section>
          <Section title="Account"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p><button className="btn btn-danger w-full mt-3 py-2.5" onClick={handleSignOut}>Sign out</button></Section>
        </div>
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-8"><h4 className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>{title}</h4><div className="card p-4 space-y-3">{children}</div></section>
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!checked)} className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0" style={{ background: checked ? 'var(--accent)' : 'var(--border)' }} role="switch" aria-checked={checked}><span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} /></button>
}
