import type { CameraStatus } from '@/types/camera'
import type { IncidentSeverity, IncidentStatus } from '@/types/incident'

const cameraLabels: Record<CameraStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  degraded: 'Nedsatt',
  unknown: 'Okänd',
}

const cameraStyles: Record<CameraStatus, string> = {
  online: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  offline: 'bg-red-500/15 text-red-400 ring-red-500/30',
  degraded: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  unknown: 'bg-slate-500/15 text-slate-400 ring-slate-500/30',
}

export function CameraStatusBadge({ status }: { status: CameraStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cameraStyles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === 'online' ? 'bg-emerald-400' : status === 'offline' ? 'bg-red-400' : status === 'degraded' ? 'bg-amber-400' : 'bg-slate-400'}`}
      />
      {cameraLabels[status]}
    </span>
  )
}

const severityStyles: Record<IncidentSeverity, string> = {
  low: 'bg-slate-500/15 text-slate-300',
  medium: 'bg-amber-500/15 text-amber-300',
  high: 'bg-red-500/15 text-red-300',
}

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const labels = { low: 'Låg', medium: 'Medium', high: 'Hög' }
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${severityStyles[severity]}`}>
      {labels[severity]}
    </span>
  )
}

const incidentStatusLabels: Record<IncidentStatus, string> = {
  open: 'Öppen',
  acknowledged: 'Bekräftad',
  closed: 'Stängd',
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span className="rounded bg-slate-700/80 px-2 py-0.5 text-xs text-slate-300">
      {incidentStatusLabels[status]}
    </span>
  )
}
