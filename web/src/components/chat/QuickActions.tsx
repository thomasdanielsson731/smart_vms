import { suggestedPrompts } from '@/lib/chat-intents'

export function QuickActions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestedPrompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-slate-700/80 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-600/10 hover:text-blue-200"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
