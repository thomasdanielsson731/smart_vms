import { Bot, User } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'

export function ChatMessageBubble({
  message,
  onOpenWorkspace,
}: {
  message: ChatMessage
  onOpenWorkspace?: () => void
}) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser ? 'bg-slate-700' : 'bg-blue-600/25 text-blue-400'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--color-surface-700)] text-slate-200 whitespace-pre-line'
          }`}
        >
          {message.content}
        </div>
        {message.actionLabel && onOpenWorkspace && (
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="mt-2 block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            {message.actionLabel} →
          </button>
        )}
      </div>
    </div>
  )
}
