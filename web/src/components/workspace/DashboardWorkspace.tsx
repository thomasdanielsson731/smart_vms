import { HardDrive, Server, Cpu, AlertCircle, TrendingUp } from 'lucide-react'
import { mockIncidents } from '@/lib/mock-data'
import { cameraHostForIncident } from '@/lib/mock-forensic'
import { useAppConfig } from '@/context/AppConfigContext'
import { AlarmThumbnail } from '@/components/alarm/AlarmThumbnail'
import { SeverityBadge } from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/lib/format'

export function DashboardWorkspace() {
  const { cameras, alarms, storageUsage, storageSettings } = useAppConfig()
  const openCount = mockIncidents.filter((i) => i.status === 'open').length
  const weekTotal = mockIncidents.length + alarms.length
  const camerasOnline = cameras.filter((c) => c.status === 'online').length

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat icon={AlertCircle} label="Öppna larm" value={String(openCount)} />
        <Stat icon={TrendingUp} label="Larm senaste 7 d" value={String(weekTotal)} />
        <Stat icon={Server} label="Kameror online" value={`${camerasOnline}/${cameras.length}`} />
        <Stat
          icon={HardDrive}
          label="Inspelning"
          value={`${storageUsage.recordingPercent}%`}
          sub={`max ${storageSettings.maxRecordingGiB} GiB`}
          variant={storageUsage.isOverQuota ? 'warn' : storageUsage.isWarning ? 'warn' : 'default'}
        />
        <Stat icon={Server} label="Aktiva larm" value={String(alarms.filter((a) => a.enabled).length)} />
      </div>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Senaste larm
        </h3>
        <ul className="space-y-2">
          {mockIncidents.map((inc) => (
            <li
              key={inc.id}
              className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2 text-sm"
            >
              <AlarmThumbnail
                incident={inc}
                cameraHost={cameraHostForIncident(inc, cameras)}
                size="sm"
                showBbox={false}
              />
              <span className="min-w-0 flex-1 truncate text-slate-300">{inc.title}</span>
              <div className="flex shrink-0 items-center gap-2">
                <SeverityBadge severity={inc.severity} />
                <span className="text-xs text-slate-500">{formatRelativeTime(inc.occurredAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-xs text-slate-500">
        Diagram (detektioner/timme, falsklarm) kopplas till metrics i Phase 3
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  variant = 'default',
}: {
  icon: typeof Cpu
  label: string
  value: string
  sub?: string
  variant?: 'default' | 'warn'
}) {
  return (
    <div
      className={`rounded-lg p-3 ${variant === 'warn' ? 'bg-amber-500/10 ring-1 ring-amber-500/20' : 'bg-slate-800/50'}`}
    >
      <div className="mb-1 flex items-center gap-2 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}
