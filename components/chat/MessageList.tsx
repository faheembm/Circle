'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { MessageWithSender } from '@/types'

interface MessageListProps {
  messages: MessageWithSender[]
  currentUserId: string
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export default function MessageList({
  messages,
  currentUserId,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevScrollHeight = useRef<number>(0)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (loading) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, loading])

  // Preserve scroll position when loading more (older) messages
  useEffect(() => {
    if (!loadingMore && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight
      containerRef.current.scrollTop = newScrollHeight - prevScrollHeight.current
    }
  }, [loadingMore])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el || loadingMore || !hasMore) return
    if (el.scrollTop < 80) {
      prevScrollHeight.current = el.scrollHeight
      onLoadMore()
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    )
  }

  // Group consecutive messages from same sender
  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1]
    const showAvatar = !prev || prev.sender_id !== msg.sender_id
    const showName = showAvatar
    return { msg, showAvatar, showName }
  })

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5"
    >
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="flex gap-1">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-2 py-20">
          <p className="text-sm font-medium">No messages yet</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Be the first to say something</p>
        </div>
      )}

      {grouped.map(({ msg, showAvatar, showName }) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isSelf={msg.sender_id === currentUserId}
          showAvatar={showAvatar}
          showName={showName}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
