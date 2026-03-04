import { supabase } from './supabase/client'
import type { Group, CreateGroupData } from '@/types'

export async function getGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('is_official', { ascending: false })
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data as Group[]
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (error) return null
  return data as Group
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('group:groups(*)')
    .eq('user_id', userId)

  if (error || !data) return []

  return data.map((gm: any) => gm.group).filter(Boolean) as Group[]
}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select('*, profile:profiles(*)')
    .eq('group_id', groupId)

  if (error || !data) return []
  return data
}

export async function createGroup(
  userId: string,
  groupData: CreateGroupData
): Promise<Group | null> {

  const insertRow = {
    name: groupData.name,
    description: groupData.description ?? null,
    created_by: userId,
  }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert(insertRow as any)   // ← important fix
    .select()
    .single()

  if (groupError || !group) return null

  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: userId,
    role: 'admin',
  })

  return group as Group
}

export async function joinGroup(groupId: string, userId: string) {
  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
      role: 'member',
    })

  return { error }
}

export async function leaveGroup(groupId: string, userId: string) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  return { error }
}

export async function isMember(groupId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  return !!data
}

export async function isAdmin(groupId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  return data?.role === 'admin'
}