'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import FullScreenLoader from '@/components/ui/FullScreenLoader'
import { useAuth } from '@/hooks/useAuth'
import { getPublicCircles } from '@/lib/circles'
import { searchProfiles } from '@/lib/profiles'
import type { Circle, Profile } from '@/types'

export default function ExplorePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [circles, setCircles] = useState<Circle[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [loading, user, router])

  useEffect(() => {
    if (loading || !user) return

    Promise.all([
      getPublicCircles(query),
      query.length >= 2 ? searchProfiles(query) : Promise.resolve([]),
    ])
      .then(([foundCircles, foundProfiles]) => {
        setCircles(foundCircles)
        setProfiles(foundProfiles)
      })
      .finally(() => setPageLoading(false))
  }, [loading, user, query])

  if (loading || !user || pageLoading) return <FullScreenLoader label="Loading explore…" />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 max-w-3xl">
        <h1 className="font-semibold mb-6">Explore</h1>

        <input
          className="input mb-6"
          placeholder="Search public circles or people"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <section className="mb-8">
          <h2 className="text-sm font-medium mb-3">Public circles</h2>
          <div className="space-y-2">
            {circles.map((circle) => (
              <div key={circle.id} className="card p-3">
                <p className="text-sm font-medium">{circle.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{circle.description ?? 'Public circle'}</p>
              </div>
            ))}
            {circles.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No public circles match this query.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium mb-3">People</h2>
          <div className="space-y-2">
            {profiles.map((p) => (
              <Link key={p.id} href={`/profile/${p.username}`} className="card p-3 block hover:bg-[var(--bg-secondary)] transition-colors">
                <p className="text-sm font-medium">{p.display_name ?? p.username}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{p.username}</p>
              </Link>
            ))}
            {profiles.length === 0 && query.length >= 2 && (
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No people found.</p>
            )}
          </div>
        </section>
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}
