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
          getProfile(user.id)
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

      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <main className="flex-1 overflow-y-auto p-6 max-w-2xl pb-24 md:pb-6">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="font-semibold">
              Hey, {profile?.display_name ?? profile?.username ?? '—'}
            </h1>

            <p
              className="text-sm mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {groups.length} channels · {following.length} following
            </p>
          </div>

          <Link
            href="/explore"
            className="btn btn-ghost px-3 py-1.5 text-xs"
          >
            Explore
          </Link>

        </div>

        {dataLoading &&
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--text-faint)' }}
          >
            Syncing chats…
          </p>
        }

      </main>

      <div className="md:hidden">
        <MobileNav />
      </div>

    </div>
  )
}