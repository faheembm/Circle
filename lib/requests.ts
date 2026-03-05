import { supabase } from './supabase/client'
import { getFollowing } from './profiles'
import type { FollowRequest, FollowRequestWithRequester, MessageRequest, Profile } from '@/types'
import { getIncomingCircleInvites } from './circles'

export async function getIncomingFollowRequests(userId: string): Promise<FollowRequestWithRequester[]> {
  const { data, error } = await supabase
    .from('follow_requests')
    .select('*, requester:profiles!requester_id(*)')
    .eq('target_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as FollowRequestWithRequester[]
}

export async function respondToFollowRequest(requestId: string, accept: boolean) {
  const status = accept ? 'accepted' : 'declined'

  const { data, error } = await (supabase as any)
    .from('follow_requests')
    .update({ status } as any)
    .eq('id', requestId)
    .select('*')
    .single()

  if (error || !data) return { error }

  const row = data as FollowRequest

  if (accept) {
    await supabase.from('follows').insert({
      follower_id: row.requester_id,
      following_id: row.target_id,
    } as any)
  }

  return { error: null }
}

export async function getMessageRequests(userId: string): Promise<MessageRequest[]> {
  const following = await getFollowing(userId)
  const followingSet = new Set(following.map((p) => p.id))

  const { data, error } = await supabase
    .from('messages')
    .select('sender_id, content, created_at, sender:profiles!sender_id(*)')
    .eq('type', 'direct')
    .eq('receiver_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error || !data) return []

  const bySender = new Map<string, MessageRequest>()

  for (const row of data as any[]) {
    const senderId = row.sender_id as string
    if (senderId === userId) continue
    if (followingSet.has(senderId)) continue
    if (bySender.has(senderId)) continue

    bySender.set(senderId, {
      sender_id: senderId,
      sender: row.sender as Profile,
      preview: row.content,
      created_at: row.created_at,
    })
  }

  return [...bySender.values()]
}

export async function getRequestsFeed(userId: string) {
  const [followRequests, circleInvites, messageRequests] = await Promise.all([
    getIncomingFollowRequests(userId),
    getIncomingCircleInvites(userId),
    getMessageRequests(userId),
  ])

  return {
    followRequests,
    circleInvites,
    messageRequests,
  }
}
