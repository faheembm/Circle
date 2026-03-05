'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import FullScreenLoader from '@/components/ui/FullScreenLoader'
import { useAuth } from '@/hooks/useAuth'
import { createCircle, getPublicCircles, getUserCircles, joinCircle } from '@/lib/circles'
import type { Circle } from '@/types'

export default function CirclesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [myCircles, setMyCircles] = useState<Circle[]>([])
  const [publicCircles, setPublicCircles] = useState<Circle[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [loading, user, router])

  useEffect(() => {
    if (loading || !user) return

    Promise.all([getUserCircles(user.id), getPublicCircles()])
      .then(([mine, pub]) => {
        setMyCircles(mine)
        setPublicCircles(pub)
      })
      .finally(() => setPageLoading(false))
  }, [loading, user])

  const myIds = useMemo(() => new Set(myCircles.map((c) => c.id)), [myCircles])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name.trim()) return

    const created = await createCircle(user.id, {
      name,
      description,
      is_private: isPrivate,
    })

    if (!created) return

    setMyCircles((prev) => [created, ...prev])
    if (!created.is_private) {
      setPublicCircles((prev) => [created, ...prev])
    }
    setName('')
    setDescription('')
    setIsPrivate(false)
  }

  const handleJoinPublic = async (circleId: string) => {
    if (!user) return
    await joinCircle(circleId, user.id)
    const joined = publicCircles.find((c) => c.id === circleId)
    if (joined) {
      setMyCircles((prev) => [joined, ...prev])
    }
  }

  if (loading || !user || pageLoading) return <FullScreenLoader label="Loading circles…" />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 max-w-3xl">
        <h1 className="font-semibold mb-6">Circles</h1>

        <form className="card p-4 mb-6 space-y-3" onSubmit={handleCreate}>
          <h2 className="text-sm font-medium">Create a circle</h2>
          <input className="input" placeholder="Circle name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            Private (invite only)
          </label>
          <button className="btn" type="submit">Create circle</button>
        </form>

        <section className="mb-8">
          <h2 className="text-sm font-medium mb-3">Your circles</h2>
          <div className="space-y-2">
            {myCircles.map((circle) => (
              <div key={circle.id} className="card p-3">
                <p className="text-sm font-medium">{circle.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {circle.is_private ? 'Private · invite only' : 'Public'}
                </p>
              </div>
            ))}
            {myCircles.length === 0 && <p className="text-sm" style={{ color: 'var(--text-faint)' }}>You are not in any circles yet.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium mb-3">Public circles</h2>
          <div className="space-y-2">
            {publicCircles.map((circle) => (
              <div key={circle.id} className="card p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{circle.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{circle.description ?? 'Public circle'}</p>
                </div>
                {!myIds.has(circle.id) && (
                  <button className="btn btn-ghost text-xs px-3 py-1.5" onClick={() => handleJoinPublic(circle.id)}>
                    Join
                  </button>
                )}
              </div>
            ))}
            {publicCircles.length === 0 && <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No public circles yet.</p>}
          </div>
        </section>
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}
