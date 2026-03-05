'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import FullScreenLoader from '@/components/ui/FullScreenLoader'
import { useAuth } from '@/hooks/useAuth'
import { respondToCircleInvite } from '@/lib/circles'
import { getRequestsFeed, respondToFollowRequest } from '@/lib/requests'
import type { CircleInviteWithDetails, FollowRequestWithRequester, MessageRequest } from '@/types'

export default function RequestsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [followRequests, setFollowRequests] = useState<FollowRequestWithRequester[]>([])
  const [circleInvites, setCircleInvites] = useState<CircleInviteWithDetails[]>([])
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [loading, user, router])

  useEffect(() => {
    if (loading || !user) return

    getRequestsFeed(user.id)
      .then((feed) => {
        setFollowRequests(feed.followRequests)
        setCircleInvites(feed.circleInvites)
        setMessageRequests(feed.messageRequests)
      })
      .finally(() => setPageLoading(false))
  }, [loading, user])

  const handleFollowResponse = async (requestId: string, accept: boolean) => {
    const { error } = await respondToFollowRequest(requestId, accept)
    if (!error) {
      setFollowRequests((prev) => prev.filter((r) => r.id !== requestId))
    }
  }

  const handleInviteResponse = async (inviteId: string, accept: boolean) => {
    const { error } = await respondToCircleInvite(inviteId, accept)
    if (!error) {
      setCircleInvites((prev) => prev.filter((r) => r.id !== inviteId))
    }
  }

  if (loading || !user || pageLoading) return <FullScreenLoader label="Loading requests…" />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:flex"><AppSidebar /></div>
      <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 max-w-3xl">
        <h1 className="font-semibold mb-6">Requests</h1>

        <Section title="Follow requests">
          {followRequests.map((req) => (
            <Row
              key={req.id}
              title={req.requester?.display_name ?? req.requester?.username ?? 'Unknown user'}
              subtitle="wants to follow you"
              onAccept={() => handleFollowResponse(req.id, true)}
              onDecline={() => handleFollowResponse(req.id, false)}
            />
          ))}
          {followRequests.length === 0 && <Empty label="No follow requests" />}
        </Section>

        <Section title="Circle invites">
          {circleInvites.map((invite) => (
            <Row
              key={invite.id}
              title={invite.circle?.name ?? 'Circle invite'}
              subtitle={`Invited by ${invite.inviter?.display_name ?? invite.inviter?.username ?? 'someone'}`}
              onAccept={() => handleInviteResponse(invite.id, true)}
              onDecline={() => handleInviteResponse(invite.id, false)}
            />
          ))}
          {circleInvites.length === 0 && <Empty label="No circle invites" />}
        </Section>

        <Section title="Message requests">
          {messageRequests.map((req) => (
            <div key={req.sender_id} className="card p-3">
              <p className="text-sm font-medium">{req.sender.display_name ?? req.sender.username}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{req.preview}</p>
            </div>
          ))}
          {messageRequests.length === 0 && <Empty label="No message requests" />}
        </Section>
      </main>
      <div className="md:hidden"><MobileNav /></div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Row({
  title,
  subtitle,
  onAccept,
  onDecline,
}: {
  title: string
  subtitle: string
  onAccept: () => void
  onDecline: () => void
}) {
  return (
    <div className="card p-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-ghost text-xs px-3 py-1.5" onClick={onDecline}>Decline</button>
        <button className="btn text-xs px-3 py-1.5" onClick={onAccept}>Accept</button>
      </div>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{label}</p>
}
