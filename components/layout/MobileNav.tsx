'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function MobileNav() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const items = [
    { href: '/chats', label: 'Chats', icon: HomeIcon },
    { href: '/circles', label: 'Circles', icon: GroupsIcon },
    { href: '/explore', label: 'Explore', icon: PeopleIcon },
    { href: '/requests', label: 'Reqs', icon: RequestsIcon },
    { href: `/profile/${profile?.username}`, label: 'Profile', icon: ProfileIcon }
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-[60px] flex items-center justify-around px-2 z-50"
      style={{ background: 'var(--bg)', borderTop: '1px solid var(--border-soft)' }}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-[var(--radius-sm)] transition-colors',
              active ? 'opacity-100' : 'opacity-40'
            )}
          >
            <item.icon />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
}
function PeopleIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 4a3 3 0 010 6M16 17c0-2.761-1.343-4.5-4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function GroupsIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
}
function ProfileIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function RequestsIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 5.5A1.5 1.5 0 015.5 4h9A1.5 1.5 0 0116 5.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 14.5v-9z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
