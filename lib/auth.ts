import { supabase } from './supabase/client'
import type { LoginFormData, SignupFormData } from '@/types'

export async function signUp({ email, password, username, display_name }: SignupFormData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name },
    },
  })
  return { data, error }
}

export async function signIn({ email, password }: LoginFormData) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}
