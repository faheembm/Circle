'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getProfile, getProfileByUsername, getFollowCounts, isFollowing, followUser, unfollowUser } from '@/lib/profiles'
import { getInitials, formatFullDate } from '@/lib/utils'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import type { Profile } from '@/types'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  const isOwn = myProfile?.username === username

  useEffect(() => {
    if (!username) return
    ;(async () => {
      try {
        const [p, me] = await Promise.all([
          getProfileByUsername(username),
          user ? getProfile(user.id) : Promise.resolve(null),
        ])
        if (!p) {
          router.push('/chats')
          return
        }
        setProfile(p)
        setMyProfile(me)
        const [c, f] = await Promise.all([
          getFollowCounts(p.id),
          user ? isFollowing(user.id, p.id) : Promise.resolve(false),
        ])
        setCounts(c)
        setFollowing(f)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [username, user, router])

  const handleFollow = async () => {
    if (!user || !profile) return
    if (following) {
      await unfollowUser(user.id, profile.id)
      setFollowing(false)
      setCounts((c) => ({ ...c, followers: c.followers - 1 }))
    } else {
      await followUser(user.id, profile.id)
      setFollowing(true)
      setCounts((c) => ({ ...c, followers: c.followers + 1 }))
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-slide-up">
          {/* Profile header */}
          <div className="card p-6 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="avatar w-16 h-16 text-lg font-semibold flex-shrink-0">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  : getInitials(profile.display_name ?? profile.username)
                }
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {isOwn ? (
                  <Link href="/settings" className="btn btn-ghost text-sm px-4 py-1.5">
                    Edit profile
                  </Link>
                ) : (
                  <>
                    <Link href={`/dm/${profile.id}`} className="btn btn-ghost text-sm px-4 py-1.5">
                      Message
                    </Link>
                    <button
                      className={following ? 'btn btn-ghost text-sm px-4 py-1.5' : 'btn text-sm px-4 py-1.5'}
                      onClick={handleFollow}
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h2 className="font-semibold">{profile.display_name ?? profile.username}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm mt-3 leading-relaxed">{profile.bio}</p>
              )}
            </div>

            <div className="flex gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
              <Stat count={counts.followers} label="followers" />
              <Stat count={counts.following} label="following" />
            </div>

            <p className="text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
              Joined {formatFullDate(profile.created_at)}
            </p>
          </div>

          {profile.is_private && !isOwn && (
            <div className="card p-8 text-center">
              <p className="text-sm font-medium">This account is private</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Follow to see their activity
              </p>
            </div>
          )}
        </div>
      </main>

      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  )
}

function Stat({ count, label }: { count: number; label: string }) {
  return (
    <div>
      <span className="font-semibold text-sm">{count.toLocaleString()}</span>
      <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
