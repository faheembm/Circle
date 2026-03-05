'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import FullScreenLoader from '@/components/ui/FullScreenLoader'
import { getUserGroups } from '@/lib/groups'
import { getFollowing, getProfile } from '@/lib/profiles'
import { formatTime, getInitials } from '@/lib/utils'
import type { Group, Profile } from '@/types'

export default function ChatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [following, setFollowing] = useState<Profile[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/auth/login')
      return
    }

    let mounted = true
    setDataLoading(true)

    ;(async () => {
      try {
        const [g, f, p] = await Promise.all([
          getUserGroups(user.id),
          getFollowing(user.id),
          getProfile(user.id),
        ])
        if (!mounted) return
        setGroups(g)
        setFollowing(f)
        setProfile(p)
      } catch {
        if (!mounted) return
        setGroups([])
        setFollowing([])
        setProfile(null)
      } finally {
        if (mounted) setDataLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [loading, user, router])

  if (loading) {
    return <FullScreenLoader label="Loading session..." />
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto p-6 max-w-2xl pb-24 md:pb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-semibold">Hey, {profile?.display_name ?? profile?.username ?? '—'}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {groups.length} channels · {following.length} following
            </p>
          </div>
          <Link href="/explore" className="btn btn-ghost px-3 py-1.5 text-xs">Explore</Link>
        </div>

        {dataLoading && <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>Syncing chats…</p>}

        <Section title="Channels">
          {groups.length === 0 ? (
            <EmptyState label="No channels yet" action={{ label: 'Browse circles', href: '/circles' }} />
          ) : (
            <div className="space-y-1">
              {groups.map((g) => (
                <Link key={g.id} href={`/chat/${g.id}`} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors">
                  <div className="avatar w-9 h-9 text-xs font-semibold">{g.avatar_url ? <img src={g.avatar_url} alt={g.name} className="w-full h-full object-cover" /> : getInitials(g.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5"><span className="text-sm font-medium truncate">{g.name}</span></div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-faint)' }}>{g.description ?? 'Group channel'}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{formatTime(g.updated_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Direct messages">
          {following.length === 0 ? (
            <EmptyState label="No DMs yet" action={{ label: 'Find people', href: '/explore' }} />
          ) : (
            <div className="space-y-1">
              {following.map((p) => (
                <Link key={p.id} href={`/dm/${p.id}`} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors">
                  <div className="avatar w-9 h-9 text-xs">{p.avatar_url ? <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" /> : getInitials(p.display_name ?? p.username)}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.display_name ?? p.username}</p><p className="text-xs" style={{ color: 'var(--text-faint)' }}>@{p.username}</p></div>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-8"><h4 className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>{title}</h4><div className="card overflow-hidden"><div className="p-1">{children}</div></div></section>
}

function EmptyState({ label, action }: { label: string; action: { label: string; href: string } }) {
  return <div className="flex flex-col items-center py-8 gap-3"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>{label}</p><Link href={action.href} className="btn btn-ghost text-xs px-4 py-1.5">{action.label}</Link></div>
}
