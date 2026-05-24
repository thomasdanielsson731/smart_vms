import { Brain, User, UserX, Users } from 'lucide-react'
import { faceRoleLabels } from '@/types/face'
import type { AlarmTier2Analysis, Tier2PersonInsight } from '@/types/alarm-analytics'
import { formatRelativeTime } from '@/lib/format'

const priorityStyles = {
  routine: 'bg-slate-700/60 text-slate-300',
  review: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25',
  urgent: 'bg-red-500/15 text-red-200 ring-1 ring-red-500/25',
} as const

const priorityLabels = {
  routine: 'Routine',
  review: 'Review',
  urgent: 'Prioritize',
} as const

interface AlarmTier2PanelProps {
  analysis: AlarmTier2Analysis
  compact?: boolean
}

export function AlarmTier2Panel({ analysis, compact = false }: AlarmTier2PanelProps) {
  if (compact) {
    return (
      <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
        <p className="text-xs font-medium text-violet-200">{analysis.headline}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{analysis.summary}</p>
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-slate-900/40 p-4">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 shrink-0 text-violet-300" />
          <div>
            <h3 className="text-sm font-medium text-violet-100">Analysis (tier 2)</h3>
            <p className="text-xs text-slate-500">
              Post-alarm enrichment · {formatRelativeTime(analysis.generatedAt)}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles[analysis.assessedPriority]}`}
        >
          {priorityLabels[analysis.assessedPriority]}
        </span>
      </header>

      <p className="text-sm font-medium text-slate-100">{analysis.headline}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{analysis.summary}</p>
      <p className="mt-2 text-xs text-slate-500">{analysis.triggerExplanation}</p>

      {analysis.persons.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            <Users className="h-3.5 w-3.5" />
            People
          </div>
          <ul className="space-y-2">
            {analysis.persons.map((person, i) => (
              <PersonRow key={`${person.name}-${i}`} person={person} />
            ))}
          </ul>
        </div>
      )}

      {analysis.insights.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-slate-700/50 pt-3 text-xs text-slate-400">
          {analysis.insights.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-violet-400">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-3 flex flex-wrap gap-1.5">
        {analysis.sources.map((src) => (
          <span
            key={src}
            className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500"
          >
            {sourceLabel(src)}
          </span>
        ))}
      </footer>
    </section>
  )
}

function PersonRow({ person }: { person: Tier2PersonInsight }) {
  const Icon = person.kind === 'known' ? User : UserX
  const iconClass =
    person.kind === 'known'
      ? 'text-emerald-400'
      : person.kind === 'unknown'
        ? 'text-amber-400'
        : 'text-slate-400'

  return (
    <li className="flex gap-3 rounded-lg bg-slate-800/40 px-3 py-2">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-200">
          {person.name}
          {person.role && (
            <span className="ml-1.5 text-xs text-slate-500">
              ({faceRoleLabels[person.role]})
            </span>
          )}
        </p>
        {person.confidence != null && (
          <p className="text-xs text-slate-500">
            Confidence {Math.round(person.confidence * 100)} %
          </p>
        )}
        {person.notes && <p className="mt-0.5 text-xs text-slate-500">{person.notes}</p>}
      </div>
    </li>
  )
}

function sourceLabel(src: AlarmTier2Analysis['sources'][number]): string {
  switch (src) {
    case 'rule':
      return 'Rule'
    case 'object_detection':
      return 'Detection'
    case 'face_recognition':
      return 'Face'
    case 'vapix':
      return 'VAPIX'
  }
}
