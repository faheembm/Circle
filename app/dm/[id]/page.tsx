'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { getProfile } from '@/lib/profiles'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import FullScreenLoader from '@/components/ui/FullScreenLoader'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/types'

export default function DMPage() {
  const { id: otherId } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [other, setOther] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const { messages, loading: msgsLoading, loadingMore, hasMore, loadMore, sendMessage } =
    useMessages({ type: 'direct', userId: user?.id, otherUserId: otherId })

  useEffect(() => {
    if (authLoading) return

    if (!otherId) {
      setLoading(false)
      router.replace('/dashboard')
      return
    }

    let active = true

    getProfile(otherId)
      .then((p) => {
        if (!active) return
        if (!p) {
          router.replace('/dashboard')
          return
        }
        setOther(p)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [otherId, authLoading, router])

  if (loading || authLoading) return <FullScreenLoader label="Loading conversation…" />

  if (!other) return <FullScreenLoader label="Redirecting…" />

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border-soft)', background: 'var(--bg)' }}
      >
        <Link href="/dashboard" className="md:hidden btn btn-ghost p-1.5 !px-1.5">
          ←
        </Link>

        <div className="avatar w-8 h-8 text-xs">
          {other.avatar_url
            ? <img src={other.avatar_url} alt={other.username} className="w-full h-full object-cover" />
            : getInitials(other.display_name ?? other.username)
          }
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium leading-none">{other.display_name ?? other.username}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>@{other.username}</p>
        </div>

        <Link href={`/profile/${other.username}`} className="btn btn-ghost text-xs px-3 py-1.5">
          Profile
        </Link>
      </header>

      <MessageList
        messages={messages}
        currentUserId={user?.id ?? ''}
        loading={msgsLoading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />

      <MessageInput
        onSend={sendMessage}
        placeholder={`Message ${other.display_name ?? other.username}`}
      />
    </div>
  )
}
