'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { getGroup, isMember, joinGroup } from '@/lib/groups'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import type { Group } from '@/types'

export default function GroupChatPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [member, setMember] = useState(false)
  const [loading, setLoading] = useState(true)

  const { messages, loading: msgsLoading, loadingMore, hasMore, loadMore, sendMessage } =
    useMessages({ type: 'group', groupId: id, userId: user?.id })

  useEffect(() => {
    if (authLoading) return
    if (!id || !user) {
      setLoading(false)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const [g, m] = await Promise.all([getGroup(id), isMember(id, user.id)])
        if (!mounted) return
        if (!g) {
          router.push('/chats')
          return
        }
        setGroup(g)
        setMember(m)
      } catch {
        if (mounted) router.push('/chats')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [id, user, authLoading, router])

  const handleJoin = async () => {
    if (!user || !id) return
    await joinGroup(id, user.id)
    setMember(true)
  }

  if (authLoading || loading || !group) return <LoadingState />

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg)' }}>
        <div className="flex items-center gap-3">
          <Link href="/chats" className="md:hidden btn btn-ghost p-1.5 !px-1.5">←</Link>
          <div>
            <div className="flex items-center gap-1.5"><h3 className="font-medium">{group.name}</h3>{group.is_official && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>official</span>}</div>
            {group.description && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{group.description}</p>}
          </div>
        </div>
        <Link href={`/chat/${id}/members`} className="btn btn-ghost text-xs px-3 py-1.5">Members</Link>
      </header>

      {member ? (
        <>
          <MessageList messages={messages} currentUserId={user?.id ?? ''} loading={msgsLoading} loadingMore={loadingMore} hasMore={hasMore} onLoadMore={loadMore} />
          <MessageInput onSend={sendMessage} placeholder={`Message #${group.name}`} />
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Join <strong>{group.name}</strong> to see messages</p>
          <button className="btn px-6" onClick={handleJoin}>Join group</button>
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return <div className="flex-1 flex items-center justify-center"><div className="flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>
}
