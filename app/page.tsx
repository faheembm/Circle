import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="flex items-center gap-2">
          <RelayLogo />
          <span className="font-semibold tracking-tight text-base">Relay</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn btn-ghost text-sm px-4 py-1.5">
            Sign in
          </Link>
          <Link href="/auth/signup" className="btn text-sm px-4 py-1.5">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center max-w-3xl mx-auto w-full">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 animate-fade-in"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
          Real-time messaging, always on
        </div>

        <h1 className="font-semibold tracking-tighter mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          Communication,<br />
          <span style={{ color: 'var(--text-muted)' }}>without the clutter.</span>
        </h1>

        <p
          className="text-lg mb-10 max-w-lg mx-auto animate-fade-in"
          style={{ color: 'var(--text-muted)', animationDelay: '0.1s' }}
        >
          Relay is a minimal real-time chat platform for people who value clarity.
          Private messages, group channels, and nothing else.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <Link href="/auth/signup" className="btn px-8 py-2.5 text-base">
            Create free account
          </Link>
          <Link href="/auth/login" className="btn btn-ghost px-8 py-2.5 text-base">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section
        className="px-6 py-20 border-t"
        style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-secondary)' }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card p-6 animate-slide-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center mb-4 text-base"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                {f.icon}
              </div>
              <h3 className="font-medium mb-1 text-sm">{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-6 border-t flex items-center justify-between text-xs"
        style={{ borderColor: 'var(--border-soft)', color: 'var(--text-faint)' }}
      >
        <span>© 2024 Relay</span>
        <span>Built with Supabase + Next.js</span>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: '⚡',
    title: 'Real-time',
    desc: 'Messages arrive instantly with no page refreshes. Always in sync.',
  },
  {
    icon: '🔒',
    title: 'Private by default',
    desc: 'Direct messages are just between you and the other person.',
  },
  {
    icon: '◉',
    title: 'Group channels',
    desc: 'Create topic channels or join communities. Simple and organized.',
  },
]

function RelayLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" fill="currentColor" />
    </svg>
  )
}
