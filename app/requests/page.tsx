'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'

export default function RequestsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [loading, user, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}><div className="flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto p-6 max-w-2xl pb-24 md:pb-6">
        <h1 className="font-semibold mb-6">Requests</h1>

        <Section title="Follow requests" empty="No follow requests" />
        <Section title="Circle invites" empty="No circle invites" />
        <Section title="Message requests" empty="No message requests" />
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}

function Section({ title, empty }: { title: string; empty: string }) {
  return (
    <section className="mb-8">
      <h4 className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>{title}</h4>
      <div className="card p-4">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{empty}</p>
      </div>
    </section>
  )
}
