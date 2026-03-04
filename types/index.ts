// ============================================================
// RELAY CHAT — TypeScript Types
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Domain Models ─────────────────────────────────────────

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  is_official: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type GroupRole = 'admin' | 'member'

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: GroupRole
  joined_at: string
}

export type MessageType = 'group' | 'direct'

export interface Message {
  id: string
  type: MessageType
  group_id: string | null
  sender_id: string
  receiver_id: string | null
  content: string
  created_at: string
  updated_at: string
  is_deleted: boolean
}

// ─── Enriched / Joined Types ───────────────────────────────

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

export interface GroupWithMembers extends Group {
  group_members: Array<GroupMember & { profile: Profile }>
  member_count: number
}

export interface ConversationPreview {
  id: string
  type: MessageType
  name: string
  avatar_url: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  is_official?: boolean
}

// ─── Auth ──────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string | undefined
  profile: Profile | null
}

// ─── Form Types ────────────────────────────────────────────

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  username: string
  display_name: string
}

export interface ProfileUpdateData {
  display_name?: string
  bio?: string
  avatar_url?: string
  is_private?: boolean
}

export interface CreateGroupData {
  name: string
  description?: string
}

// ─── UI State ──────────────────────────────────────────────

export type Theme = 'light' | 'dark'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// ─── Supabase Database Types ───────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      follows: {
        Row: Follow
        Insert: Omit<Follow, 'id' | 'created_at'>
        Update: never
      }
      groups: {
        Row: Group
        Insert: Omit<Group, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Group, 'id' | 'created_at'>>
      }
      group_members: {
        Row: GroupMember
        Insert: Omit<GroupMember, 'id' | 'joined_at'>
        Update: Pick<GroupMember, 'role'>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at' | 'updated_at'>
        Update: Pick<Message, 'content' | 'is_deleted'>
      }
    }
  }
}
