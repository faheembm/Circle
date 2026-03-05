import { supabase } from './supabase/client'
import type { Circle, CircleInvite, CircleInviteWithDetails, CircleMember } from '@/types'

interface CreateCircleInput {
  name: string
  description?: string
  is_private?: boolean
}

export async function getUserCircles(userId: string): Promise<Circle[]> {
  const { data, error } = await supabase
    .from('circle_members')
    .select('circle:circles(*)')
    .eq('user_id', userId)

  if (error || !data) return []
  return data.map((row: any) => row.circle).filter(Boolean) as Circle[]
}

export async function getPublicCircles(query?: string): Promise<Circle[]> {
  let request = supabase
    .from('circles')
    .select('*')
    .eq('is_private', false)
    .order('created_at', { ascending: false })

  if (query?.trim()) {
    request = request.ilike('name', `%${query.trim()}%`)
  }

  const { data, error } = await request

  if (error || !data) return []
  return data as Circle[]
}

export async function createCircle(userId: string, input: CreateCircleInput) {
  const { data, error } = await supabase
    .from('circles')
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      created_by: userId,
      is_private: Boolean(input.is_private),
    } as any)
    .select('*')
    .single()

  if (error || !data) return null

  await supabase
    .from('circle_members')
    .insert({
      circle_id: (data as Circle).id,
      user_id: userId,
      role: 'admin',
    } as any)

  return data as Circle
}

export async function joinCircle(circleId: string, userId: string) {
  return supabase
    .from('circle_members')
    .insert({ circle_id: circleId, user_id: userId, role: 'member' } as any)
}

export async function getCircle(circleId: string): Promise<Circle | null> {
  const { data, error } = await supabase
    .from('circles')
    .select('*')
    .eq('id', circleId)
    .single()

  if (error || !data) return null
  return data as Circle
}

export async function isCircleMember(circleId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('circle_members')
    .select('id')
    .eq('circle_id', circleId)
    .eq('user_id', userId)
    .single()

  return !!data
}

export async function getIncomingCircleInvites(userId: string): Promise<CircleInviteWithDetails[]> {
  const { data, error } = await supabase
    .from('circle_invites')
    .select('*, circle:circles(*), inviter:profiles!inviter_id(*)')
    .eq('invitee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as CircleInviteWithDetails[]
}

export async function respondToCircleInvite(inviteId: string, accept: boolean) {
  const status = accept ? 'accepted' : 'declined'

  const { data, error } = await (supabase as any)
    .from('circle_invites')
    .update({ status } as any)
    .eq('id', inviteId)
    .select('*')
    .single()

  if (error || !data) return { error }

  const invite = data as CircleInvite

  if (accept) {
    await joinCircle(invite.circle_id, invite.invitee_id)
  }

  return { error: null }
}

export async function getCircleMembers(circleId: string): Promise<(CircleMember & { profile: any })[]> {
  const { data, error } = await supabase
    .from('circle_members')
    .select('*, profile:profiles(*)')
    .eq('circle_id', circleId)

  if (error || !data) return []
  return data as (CircleMember & { profile: any })[]
}
