import { UserRound, UserRoundX } from 'lucide-react'
import type { FaceMatch } from '@/types/face'

export function FaceMatchBadge({ match, compact }: { match: FaceMatch; compact?: boolean }) {
  const Icon = match.unknown ? UserRoundX : UserRound
  const tone = match.unknown
    ? 'border-amber-900/50 bg-amber-950/40 text-amber-200'
    : 'border-blue-900/50 bg-blue-950/40 text-blue-200'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${tone} ${
        compact ? 'text-[10px]' : 'text-xs'
      }`}
      title={`Face recognition ${Math.round(match.confidence * 100)} %`}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {match.displayName}
      <span className="opacity-70">{Math.round(match.confidence * 100)} %</span>
    </span>
  )
}
