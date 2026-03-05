'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { signOut } from '@/lib/auth'
import { getInitials, cn } from '@/lib/utils'

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2 border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="3" fill="currentColor" />
        </svg>
        <span className="font-semibold tracking-tight text-sm">Relay</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <NavItem href="/chats" label="Chats" icon="✉" active={pathname.startsWith('/chats')} />
        <NavItem href="/circles" label="Circles" icon="⬡" active={pathname.startsWith('/circles')} />
        <NavItem href="/explore" label="Explore" icon="◎" active={pathname.startsWith('/explore')} />
        <NavItem href="/requests" label="Requests" icon="⟡" active={pathname.startsWith('/requests')} />
      </nav>

      {/* Footer */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/profile/${profile?.username}`}
            className="flex items-center gap-2.5 flex-1 px-3 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <div className="avatar w-7 h-7 text-xs">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                : getInitials(profile?.display_name ?? profile?.username)
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{profile?.display_name ?? profile?.username}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>@{profile?.username}</p>
            </div>
          </Link>

          <button
            onClick={toggleTheme}
            className="btn btn-ghost p-2 !px-2"
            title="Toggle theme"
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>

        <button onClick={handleSignOut} className="nav-item text-xs w-full px-3 py-1.5" style={{ color: 'var(--text-faint)' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link href={href} className={cn('nav-item', active && 'active')}>
      <span className="w-4 text-center text-xs" style={{ color: 'var(--text-faint)' }}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}
