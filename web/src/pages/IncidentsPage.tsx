import { useState } from 'react'
import { mockIncidents } from '@/lib/mock-data'
import { mockForensicIncidents, cameraHostForIncident } from '@/lib/mock-forensic'
import { useAppConfig } from '@/context/AppConfigContext'
import { AlarmCardGrid } from '@/components/alarm/AlarmListRow'
import { AlarmBestPicturePanel } from '@/components/alarm/AlarmThumbnail'
import { SeverityBadge, IncidentStatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime, formatRelativeTime } from '@/lib/format'

export function IncidentsPage() {
  const { cameras } = useAppConfig()
  const [selectedId, setSelectedId] = useState<string | null>(mockIncidents[0]?.id ?? null)
  const all = mockForensicIncidents
  const selected = all.find((i) => i.id === selectedId) ?? all[0]
  const host = selected ? cameraHostForIncident(selected, cameras) : undefined

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Alarms with best picture — highest-scoring frame at trigger (bbox highlighted).
      </p>

      <AlarmCardGrid incidents={all} selectedId={selectedId} onSelect={setSelectedId} />

      {selected && (
        <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">{selected.title}</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <AlarmBestPicturePanel incident={selected} cameraHost={host} />
            <dl className="space-y-2 text-sm">
              <Row label="Camera" value={selected.cameraName} />
              <Row label="Time" value={formatDateTime(selected.occurredAt)} />
              <Row label="Rule" value={selected.ruleName ?? '—'} />
              <Row
                label="Best picture score"
                value={
                  selected.bestPicture
                    ? `${Math.round(selected.bestPicture.score * 100)} %`
                    : '—'
                }
              />
              <div className="flex gap-2 pt-2">
                <SeverityBadge severity={selected.severity} />
                <IncidentStatusBadge status={selected.status} />
                <span className="text-xs text-slate-500">{formatRelativeTime(selected.occurredAt)}</span>
              </div>
            </dl>
          </div>
        </section>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-600">{label}</dt>
      <dd className="text-slate-300">{value}</dd>
    </div>
  )
}
