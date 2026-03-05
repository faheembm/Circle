const FALLBACK_SUPABASE_URL = 'http://127.0.0.1:54321'
const FALLBACK_SUPABASE_ANON_KEY = 'missing-supabase-anon-key'

let hasWarned = false

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const configured = Boolean(url && anonKey)

  if (!configured && !hasWarned) {
    hasWarned = true
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Using safe fallback values so the app can render an error state instead of crashing.'
    )
  }

  return {
    configured,
    url: url ?? FALLBACK_SUPABASE_URL,
    anonKey: anonKey ?? FALLBACK_SUPABASE_ANON_KEY,
  }
}

