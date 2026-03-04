import { supabase } from './supabase/client'
import type { MessageWithSender } from '@/types'

const MESSAGE_SELECT = `
  *,
  sender:profiles!sender_id(id, username, display_name, avatar_url)
`

const PAGE_SIZE = 40

export async function getGroupMessages(
  groupId: string,
  page = 0
): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('group_id', groupId)
    .eq('type', 'group')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (error) return []
  return (data as unknown as MessageWithSender[]).reverse()
}

export async function getDMMessages(
  userA: string,
  userB: string,
  page = 0
): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('type', 'direct')
    .eq('is_deleted', false)
    .or(
      `and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`
    )
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (error) return []
  return (data as unknown as MessageWithSender[]).reverse()
}

export async function sendGroupMessage(groupId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ type: 'group', group_id: groupId, sender_id: senderId, content })
    .select(MESSAGE_SELECT)
    .single()
  return { data: data as unknown as MessageWithSender | null, error }
}

export async function sendDirectMessage(senderId: string, receiverId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ type: 'direct', sender_id: senderId, receiver_id: receiverId, content })
    .select(MESSAGE_SELECT)
    .single()
  return { data: data as unknown as MessageWithSender | null, error }
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_deleted: true })
    .eq('id', messageId)
  return { error }
}

export async function getDMConversations(userId: string) {
  const { data, error } = await supabase.rpc('get_dm_conversations', { user_id: userId })
  if (error) return []
  return data
}
