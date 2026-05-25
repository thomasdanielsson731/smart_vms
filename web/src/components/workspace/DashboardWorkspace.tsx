import { HardDrive, Server, AlertCircle, TrendingUp } from 'lucide-react'
import { cameraHostForIncident } from '@/lib/forensic-utils'
import { useAppConfig } from '@/context/AppConfigContext'
import { AlarmThumbnail } from '@/components/alarm/AlarmThumbnail'
import { AlarmTier2Panel } from '@/components/alarm/AlarmTier2Panel'
import { SeverityBadge } from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/lib/format'
import { generateAlarmTier2Analysis } from '@/lib/alarm-tier2-analytics'
import { SystemHealthPanel } from '@/components/dashboard/SystemHealthPanel'
import { useMemo } from 'react'

export function DashboardWorkspace() {
  const { cameras, alarms, incidents, storageUsage, storageSettings, faceProfiles, faceSettings } =
    useAppConfig()
  const openCount = incidents.filter((i) => i.status === 'open').length
  const weekTotal = incidents.length + alarms.length
  const camerasOnline = cameras.filter((c) => c.status === 'online').length

  const latestWithTier2 = useMemo(() => {
    const latest = incidents[0]
    if (!latest) return null
    const analysis = generateAlarmTier2Analysis(latest, { faceProfiles, faceSettings })
    return { incident: latest, analysis }
  }, [incidents, faceProfiles, faceSettings])

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat icon={AlertCircle} label="Open alarms" value={String(openCount)} />
        <Stat icon={TrendingUp} label="Alarms last 7 d" value={String(weekTotal)} />
        <Stat icon={Server} label="Cameras online" value={`${camerasOnline}/${cameras.length}`} />
        <Stat
          icon={HardDrive}
          label="Recording"
          value={`${storageUsage.recordingPercent}%`}
          sub={`max ${storageSettings.maxRecordingGiB} GiB`}
          variant={storageUsage.isOverQuota ? 'warn' : storageUsage.isWarning ? 'warn' : 'default'}
        />
        <Stat icon={Server} label="Active agents" value={String(alarms.filter((a) => a.enabled).length)} />
      </div>

      <SystemHealthPanel />

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Recent alarms
        </h3>
        {incidents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
            No alarms yet. Agents and the recording service will populate this when connected.
          </p>
        ) : (
          <ul className="space-y-2">
            {incidents.map((inc) => {
              const tier2 = generateAlarmTier2Analysis(inc, { faceProfiles, faceSettings })
              return (
                <li
                  key={inc.id}
                  className="rounded-lg bg-slate-800/50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
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
                  </div>
                  <div className="mt-2 pl-11">
                    <AlarmTier2Panel analysis={tier2} compact />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {latestWithTier2 && (
          <p className="mt-2 text-xs text-slate-600">
            Latest analysis: {latestWithTier2.analysis.headline}
          </p>
        )}
      </section>

      <div className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-xs text-slate-500">
        Charts (detections/hour, false alarms) will connect to metrics in Phase 3
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
  icon: typeof Server
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
