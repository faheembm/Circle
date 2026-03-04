'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getGroupMessages, getDMMessages, sendGroupMessage, sendDirectMessage } from '@/lib/messages'
import type { MessageWithSender } from '@/types'

interface UseMessagesOptions {
  type: 'group' | 'direct'
  groupId?: string
  userId?: string
  otherUserId?: string
}

export function useMessages({ type, groupId, userId, otherUserId }: UseMessagesOptions) {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchMessages = useCallback(
    async (p: number, append = false) => {
      if (type === 'group' && groupId) {
        const msgs = await getGroupMessages(groupId, p)

        if (append) {
          setMessages((prev) => [...msgs, ...prev])
        } else {
          setMessages(msgs)
        }

        setHasMore(msgs.length === 40)
      }

      if (type === 'direct' && userId && otherUserId) {
        const msgs = await getDMMessages(userId, otherUserId, p)

        if (append) {
          setMessages((prev) => [...msgs, ...prev])
        } else {
          setMessages(msgs)
        }

        setHasMore(msgs.length === 40)
      }
    },
    [type, groupId, userId, otherUserId]
  )

  useEffect(() => {
    setLoading(true)
    fetchMessages(0).then(() => setLoading(false))
    setPage(0)
  }, [fetchMessages])

  useEffect(() => {
    const channelName =
      type === 'group'
        ? `group-messages-${groupId}`
        : `dm-${[userId, otherUserId].sort().join('-')}`

    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          ...(type === 'group' ? { filter: `group_id=eq.${groupId}` } : {})
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(
              `
              *,
              sender:profiles!sender_id(
                id,
                username,
                display_name,
                avatar_url
              )
              `
            )
            .eq('id', payload.new.id)
            .single()

          if (!data) return

          const message = data as MessageWithSender

          setMessages((prev) => {
            if (prev.find((m) => m.id === message.id)) {
              return prev
            }

            return [...prev, message]
          })
        }
      )
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [type, groupId, userId, otherUserId])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    const nextPage = page + 1

    await fetchMessages(nextPage, true)

    setPage(nextPage)

    setLoadingMore(false)
  }

  const sendMessage = async (content: string) => {
    if (!userId || !content.trim()) return

    if (type === 'group' && groupId) {
      await sendGroupMessage(groupId, userId, content.trim())
    }

    if (type === 'direct' && otherUserId) {
      await sendDirectMessage(userId, otherUserId, content.trim())
    }
  }

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    sendMessage
  }
}