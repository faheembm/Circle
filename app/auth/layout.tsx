import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg)' }}
    >
      <Link href="/" className="flex items-center gap-2 mb-10 group">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="3" fill="currentColor" />
        </svg>
        <span className="font-semibold tracking-tight">Circle</span>
      </Link>
      {children}
    </div>
  )
}
