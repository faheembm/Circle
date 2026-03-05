'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { searchProfiles, followUser, unfollowUser, isFollowing } from '@/lib/profiles'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/types'

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [followState, setFollowState] = useState<Record<string, boolean>>({})
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login')
  }, [authLoading, user, router])

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const profiles = await searchProfiles(q)
      setResults(profiles.filter((p) => p.id !== user?.id))
      if (user) {
        const states: Record<string, boolean> = {}
        await Promise.all(profiles.map(async (p) => { states[p.id] = await isFollowing(user.id, p.id) }))
        setFollowState(states)
      }
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleFollow = async (profileId: string) => {
    if (!user) return
    if (followState[profileId]) {
      await unfollowUser(user.id, profileId)
      setFollowState((s) => ({ ...s, [profileId]: false }))
    } else {
      await followUser(user.id, profileId)
      setFollowState((s) => ({ ...s, [profileId]: true }))
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}><div className="flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>
  }
  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto p-6 max-w-xl pb-24 md:pb-6">
        <h1 className="font-semibold mb-6">Explore</h1>
        <input className="input mb-6" placeholder="Search by username or name…" value={query} onChange={(e) => handleSearch(e.target.value)} autoFocus />

        {searching && <div className="flex justify-center py-8"><div className="flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>}
        {!searching && results.length === 0 && query.length >= 2 && <div className="text-center py-12"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results for "{query}"</p></div>}

        {results.length > 0 && (
          <div className="card overflow-hidden"><div className="p-1 space-y-0.5">{results.map((profile) => (
            <div key={profile.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors">
              <Link href={`/profile/${profile.username}`}><div className="avatar w-9 h-9 text-xs">{profile.avatar_url ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" /> : getInitials(profile.display_name ?? profile.username)}</div></Link>
              <div className="flex-1 min-w-0"><Link href={`/profile/${profile.username}`} className="block"><p className="text-sm font-medium truncate hover:underline">{profile.display_name ?? profile.username}</p><p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{profile.username}</p></Link></div>
              <div className="flex gap-2 flex-shrink-0"><Link href={`/dm/${profile.id}`} className="btn btn-ghost text-xs px-3 py-1.5">DM</Link><button className={followState[profile.id] ? 'btn btn-ghost text-xs px-3 py-1.5' : 'btn text-xs px-3 py-1.5'} onClick={() => handleFollow(profile.id)}>{followState[profile.id] ? 'Following' : 'Follow'}</button></div>
            </div>
          ))}</div></div>
        )}

        {query.length === 0 && <div className="text-center py-12"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>Search for someone by username or display name</p></div>}
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}
