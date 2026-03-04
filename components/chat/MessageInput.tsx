'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  placeholder?: string
  disabled?: boolean
}

export default function MessageInput({ onSend, placeholder = 'Message…', disabled }: MessageInputProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed || sending || disabled) return

    setSending(true)
    await onSend(trimmed)
    setValue('')
    setSending(false)

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  return (
    <div
      className="flex items-end gap-2 p-4 border-t"
      style={{ borderColor: 'var(--border-soft)', background: 'var(--bg)' }}
    >
      <textarea
        ref={textareaRef}
        className="input flex-1 resize-none overflow-hidden leading-relaxed py-2"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        rows={1}
        disabled={disabled || sending}
        style={{ minHeight: '38px', maxHeight: '140px' }}
      />
      <button
        className="btn px-3 py-2 flex-shrink-0"
        onClick={handleSend}
        disabled={!value.trim() || sending || disabled}
        aria-label="Send message"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 8L2 2l3 6-3 6 12-6z" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}
