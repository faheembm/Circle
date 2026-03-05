import { supabase } from './supabase/client'
import type { Database, MessageWithSender } from '@/types'

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

  if (error || !data) return []

  return (data as MessageWithSender[]).reverse()
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

  if (error || !data) return []

  return (data as MessageWithSender[]).reverse()
}

export async function sendGroupMessage(
  groupId: string,
  senderId: string,
  content: string
) {

  const insertRow: Database['public']['Tables']['messages']['Insert'] = {
    type: 'group',
    group_id: groupId,
    sender_id: senderId,
    receiver_id: null,
    content,
    is_deleted: false,
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(insertRow as any)
    .select(MESSAGE_SELECT)
    .single()

  return {
    data: data as MessageWithSender | null,
    error
  }
}

export async function sendDirectMessage(
  senderId: string,
  receiverId: string,
  content: string
) {

  const insertRow: Database['public']['Tables']['messages']['Insert'] = {
    type: 'direct',
    group_id: null,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    is_deleted: false,
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(insertRow as any)
    .select(MESSAGE_SELECT)
    .single()

  return {
    data: data as MessageWithSender | null,
    error
  }
}

export async function deleteMessage(messageId: string) {

  const updates: Database['public']['Tables']['messages']['Update'] = {
    is_deleted: true,
    content: '',
  }

  const { error } = await (supabase.from('messages') as any)
    .update(updates)
    .eq('id', messageId)

  return { error }
}

export async function getDMConversations(userId: string) {

  const { data, error } = await (supabase as any).rpc(
    'get_dm_conversations',
    { user_id: userId }
  )

  if (error || !data) return []

  return data as Array<Record<string, unknown>>
}
