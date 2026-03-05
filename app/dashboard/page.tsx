'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getUserGroups } from '@/lib/groups'
import { getFollowing } from '@/lib/profiles'
import { formatTime, getInitials } from '@/lib/utils'
import type { Group, Profile } from '@/types'

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [following, setFollowing] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    let active = true

    Promise.all([
      getUserGroups(user.id),
      getFollowing(user.id),
    ])
      .then(([g, f]) => {
        if (!active) return
        setGroups(g)
        setFollowing(f)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user, authLoading])

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-semibold">
            Hey, {profile?.display_name ?? profile?.username ?? '—'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {groups.length} channels · {following.length} following
          </p>
        </div>
        <Link href="/dashboard/search" className="btn btn-ghost px-3 py-1.5 text-xs">
          Search
        </Link>
      </div>

      {/* Groups */}
      <Section title="Channels">
        {groups.length === 0 ? (
          <EmptyState label="No channels yet" action={{ label: 'Browse groups', href: '/dashboard/groups' }} />
        ) : (
          <div className="space-y-1">
            {groups.map((g) => (
              <Link key={g.id} href={`/chat/${g.id}`} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="avatar w-9 h-9 text-xs font-semibold">
                  {g.avatar_url
                    ? <img src={g.avatar_url} alt={g.name} className="w-full h-full object-cover" />
                    : getInitials(g.name)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{g.name}</span>
                    {g.is_official && (
                      <span className="badge text-xs px-1.5 py-0 !bg-[var(--bg-secondary)] !text-[var(--text-muted)] border border-[var(--border)]">
                        official
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {g.description ?? 'Group channel'}
                  </p>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {formatTime(g.updated_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Direct Messages */}
      <Section title="Direct messages">
        {following.length === 0 ? (
          <EmptyState label="No DMs yet" action={{ label: 'Find people', href: '/dashboard/people' }} />
        ) : (
          <div className="space-y-1">
            {following.map((p) => (
              <Link key={p.id} href={`/dm/${p.id}`} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="avatar w-9 h-9 text-xs">
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                    : getInitials(p.display_name ?? p.username)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.display_name ?? p.username}</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>@{p.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h4 className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
        {title}
      </h4>
      <div className="card overflow-hidden">
        <div className="p-1">{children}</div>
      </div>
    </section>
  )
}

function EmptyState({ label, action }: { label: string; action: { label: string; href: string } }) {
  return (
    <div className="flex flex-col items-center py-8 gap-3">
      <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{label}</p>
      <Link href={action.href} className="btn btn-ghost text-xs px-4 py-1.5">{action.label}</Link>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full" style={{ background: 'var(--bg-secondary)' }} />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded w-1/3" style={{ background: 'var(--bg-secondary)' }} />
            <div className="h-2.5 rounded w-1/2" style={{ background: 'var(--bg-secondary)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
