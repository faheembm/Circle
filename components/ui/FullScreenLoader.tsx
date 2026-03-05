'use client'

export default function FullScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'var(--bg)' }}>
      <div className="flex gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</p>
    </div>
  )
}
