import { useAppConfig } from '@/context/AppConfigContext'
import { cameraHostForIncident } from '@/lib/mock-forensic'
import { AlarmThumbnail, AlarmBestPicturePanel } from '@/components/alarm/AlarmThumbnail'
import { FaceMatchBadge } from '@/components/face/FaceMatchBadge'
import { SeverityBadge, IncidentStatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { useAlarmTier2 } from '@/hooks/useAlarmTier2'
import type { Incident } from '@/types/incident'

interface AlarmListRowProps {
  incident: Incident
  selected?: boolean
  onClick?: () => void
}

/** Rad med thumbnail + larmtext */
export function AlarmListRow({ incident, selected, onClick }: AlarmListRowProps) {
  const { cameras } = useAppConfig()
  const host = cameraHostForIncident(incident, cameras)
  const tier2 = useAlarmTier2(incident)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-3 border-b border-slate-800/60 p-3 text-left transition ${
        selected ? 'bg-blue-600/15' : 'hover:bg-slate-800/40'
      }`}
    >
      <AlarmThumbnail incident={incident} cameraHost={host} size="md" showLabel />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-200">{incident.title}</p>
        {tier2 && (
          <p className="truncate text-xs text-violet-300/90">{tier2.headline}</p>
        )}
        <p className="text-xs text-slate-500">
          {incident.cameraName} · {formatRelativeTime(incident.occurredAt)}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <SeverityBadge severity={incident.severity} />
          <IncidentStatusBadge status={incident.status} />
          {incident.faceMatch && <FaceMatchBadge match={incident.faceMatch} compact />}
        </div>
      </div>
    </button>
  )
}

export function AlarmCardGrid({
  incidents,
  selectedId,
  onSelect,
}: {
  incidents: Incident[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}) {
  const { cameras } = useAppConfig()
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {incidents.map((inc) => {
        const host = cameraHostForIncident(inc, cameras)
        const selected = inc.id === selectedId
        return (
          <button
            key={inc.id}
            type="button"
            onClick={() => onSelect?.(inc.id)}
            className={`overflow-hidden rounded-xl border text-left transition ${
              selected
                ? 'border-blue-500/50 bg-blue-600/10'
                : 'border-slate-800/80 bg-slate-800/30 hover:border-slate-700'
            }`}
          >
            <AlarmBestPicturePanel incident={inc} cameraHost={host} />
            <div className="space-y-1 p-3 pt-0">
              <p className="text-sm font-medium text-slate-200">{inc.title}</p>
              <p className="text-xs text-slate-500">{formatDateTime(inc.occurredAt)}</p>
              <div className="flex gap-1.5">
                <SeverityBadge severity={inc.severity} />
                <IncidentStatusBadge status={inc.status} />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
