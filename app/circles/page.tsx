'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getGroups, getUserGroups, joinGroup, leaveGroup, createGroup } from '@/lib/groups'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import { getInitials } from '@/lib/utils'
import type { Group } from '@/types'

export default function CirclesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login')
      return
    }
    ;(async () => {
      try {
        const [all, mine] = await Promise.all([getGroups(), getUserGroups(user.id)])
        setGroups(all)
        setMyGroupIds(new Set(mine.map((g) => g.id)))
      } catch {
        setGroups([])
        setMyGroupIds(new Set())
      } finally {
        setLoading(false)
      }
    })()
  }, [authLoading, user, router])

  const handleJoin = async (groupId: string) => {
    if (!user) return
    await joinGroup(groupId, user.id)
    setMyGroupIds((s) => new Set([...s, groupId]))
  }

  const handleLeave = async (groupId: string) => {
    if (!user) return
    await leaveGroup(groupId, user.id)
    setMyGroupIds((s) => { const n = new Set(s); n.delete(groupId); return n })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newGroup.name.trim()) return
    setCreating(true)
    const g = await createGroup(user.id, newGroup)
    if (g) {
      setGroups((prev) => [...prev, g])
      setMyGroupIds((s) => new Set([...s, g.id]))
      setShowCreate(false)
      setNewGroup({ name: '', description: '' })
    }
    setCreating(false)
  }

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}><div className="flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto p-6 max-w-2xl pb-24 md:pb-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-semibold">Circles</h1>
          <button className="btn text-sm px-4 py-1.5" onClick={() => setShowCreate(true)}>+ New circle</button>
        </div>

        {showCreate && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h3 className="font-medium mb-4">Create circle</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="input" placeholder="Circle name" value={newGroup.name} onChange={(e) => setNewGroup((n) => ({ ...n, name: e.target.value }))} required autoFocus />
              <input className="input" placeholder="Description (optional)" value={newGroup.description} onChange={(e) => setNewGroup((n) => ({ ...n, description: e.target.value }))} />
              <div className="flex gap-2">
                <button type="submit" className="btn flex-1" disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>
                <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-2">
          {groups.map((g) => {
            const joined = myGroupIds.has(g.id)
            return (
              <div key={g.id} className="card p-4 flex items-center gap-4">
                <div className="avatar w-10 h-10 text-sm font-semibold flex-shrink-0">{g.avatar_url ? <img src={g.avatar_url} alt={g.name} className="w-full h-full object-cover" /> : getInitials(g.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/chat/${g.id}`} className="text-sm font-medium hover:underline truncate">{g.name}</Link>
                    {g.is_official && <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>official</span>}
                  </div>
                  {g.description && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{g.description}</p>}
                </div>
                {!g.is_official && <button className={joined ? 'btn btn-ghost text-xs px-3 py-1.5' : 'btn text-xs px-3 py-1.5'} onClick={() => joined ? handleLeave(g.id) : handleJoin(g.id)}>{joined ? 'Leave' : 'Join'}</button>}
                {g.is_official && joined && <Link href={`/chat/${g.id}`} className="btn btn-ghost text-xs px-3 py-1.5">Open</Link>}
              </div>
            )
          })}
        </div>
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}
