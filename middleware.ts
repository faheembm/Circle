import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseEnv } from '@/lib/supabase/env'

export async function middleware(request: NextRequest) {
  const { configured, url, anonKey } = getSupabaseEnv()

  if (!configured) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — important for SSR auth
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  const protectedPrefixes = [
    '/dashboard',
    '/chat',
    '/dm',
    '/settings',
    '/profile',
    '/chats',
    '/circles',
    '/explore',
    '/requests',
  ]
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if ((pathname.startsWith('/auth/')) && user) {
    return NextResponse.redirect(new URL('/chats', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
}
