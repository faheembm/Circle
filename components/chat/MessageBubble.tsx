import { getInitials, formatMessageTime } from '@/lib/utils'
import Link from 'next/link'
import type { MessageWithSender } from '@/types'

interface MessageBubbleProps {
  message: MessageWithSender
  isSelf: boolean
  showAvatar?: boolean
  showName?: boolean
}

export default function MessageBubble({ message, isSelf, showAvatar = true, showName = true }: MessageBubbleProps) {
  if (message.is_deleted) {
    return (
      <div className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''}`}>
        {showAvatar && <div className="w-7 h-7 flex-shrink-0" />}
        <p className="text-xs px-3 py-1.5 rounded-[var(--radius)] italic" style={{ color: 'var(--text-faint)', background: 'var(--bg-secondary)' }}>
          Message deleted
        </p>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 group ${isSelf ? 'flex-row-reverse' : ''}`}>
      {showAvatar && (
        <Link href={`/profile/${message.sender.username}`}>
          <div className="avatar w-7 h-7 text-xs flex-shrink-0 hover:opacity-80 transition-opacity">
            {message.sender.avatar_url
              ? <img src={message.sender.avatar_url} alt={message.sender.username} className="w-full h-full object-cover" />
              : getInitials(message.sender.display_name ?? message.sender.username)
            }
          </div>
        </Link>
      )}
      {!showAvatar && <div className="w-7 flex-shrink-0" />}

      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
        {showName && !isSelf && (
          <Link
            href={`/profile/${message.sender.username}`}
            className="text-xs font-medium hover:underline ml-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {message.sender.display_name ?? message.sender.username}
          </Link>
        )}

        <div className="flex items-end gap-1.5">
          {isSelf && (
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-faint)' }}>
              {formatMessageTime(message.created_at)}
            </span>
          )}
          <div
            className={`px-3.5 py-2 text-sm leading-relaxed ${
              isSelf ? 'message-bubble-self' : 'message-bubble-other'
            }`}
          >
            {message.content}
          </div>
          {!isSelf && (
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-faint)' }}>
              {formatMessageTime(message.created_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
