'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import FullScreenLoader from '@/components/ui/FullScreenLoader'
import { getUserCircles } from '@/lib/circles'
import { getFollowing } from '@/lib/profiles'
import type { Circle, Profile } from '@/types'

export default function ChatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [circles, setCircles] = useState<Circle[]>([])
  const [people, setPeople] = useState<Profile[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) return

    Promise.all([getUserCircles(user.id), getFollowing(user.id)])
      .then(([c, p]) => {
        setCircles(c)
        setPeople(p)
      })
      .finally(() => setPageLoading(false))
  }, [loading, user])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [loading, user, router])

  if (loading || !user || pageLoading) return <FullScreenLoader label="Loading chats…" />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 max-w-3xl">
        <h1 className="font-semibold mb-6">Chats</h1>

        <section className="mb-8">
          <h2 className="text-sm font-medium mb-3">Circle chats</h2>
          <div className="space-y-2">
            {circles.map((c) => (
              <Link key={c.id} href={`/chat/${c.id}`} className="card p-3 block hover:bg-[var(--bg-secondary)] transition-colors">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {c.is_private ? 'Private circle' : 'Public circle'}
                </p>
              </Link>
            ))}
            {circles.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No circle chats yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium mb-3">Direct messages</h2>
          <div className="space-y-2">
            {people.map((p) => (
              <Link key={p.id} href={`/dm/${p.id}`} className="card p-3 block hover:bg-[var(--bg-secondary)] transition-colors">
                <p className="text-sm font-medium">{p.display_name ?? p.username}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{p.username}</p>
              </Link>
            ))}
            {people.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No direct messages yet.</p>
            )}
          </div>
        </section>
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}
