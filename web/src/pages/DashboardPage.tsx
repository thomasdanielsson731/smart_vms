import { Link } from 'react-router-dom'
import { HardDrive, Server, Cpu, AlertCircle, ArrowRight } from 'lucide-react'
import { mockCameras, mockIncidents, systemHealth } from '@/lib/mock-data'
import { CameraCard } from '@/components/camera/CameraCard'
import { SeverityBadge, IncidentStatusBadge } from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/lib/format'

function HealthCard({
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
  variant?: 'default' | 'warn' | 'ok'
}) {
  const ring =
    variant === 'warn'
      ? 'border-amber-500/30'
      : variant === 'ok'
        ? 'border-emerald-500/30'
        : 'border-slate-800/80'
  return (
    <div className={`rounded-xl border bg-[var(--color-surface-800)] p-4 ${ring}`}>
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export function DashboardPage() {
  const recentIncidents = mockIncidents.slice(0, 3)
  const featuredCameras = mockCameras.slice(0, 3)

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
          Systemstatus
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HealthCard
            icon={Server}
            label="Server"
            value="Online"
            sub="API ej startad — UI mock"
            variant="ok"
          />
          <HealthCard
            icon={Cpu}
            label="Edge"
            value="Online"
            sub="Analys Phase 2"
            variant="ok"
          />
          <HealthCard
            icon={HardDrive}
            label="Lagring"
            value={`${systemHealth.diskUsedPercent}%`}
            sub="Tröskel varning: 85%"
            variant={systemHealth.diskUsedPercent > 80 ? 'warn' : 'default'}
          />
          <HealthCard
            icon={AlertCircle}
            label="Kameror"
            value={`${systemHealth.camerasOnline}/${systemHealth.camerasTotal}`}
            sub="online"
            variant={systemHealth.camerasOnline < systemHealth.camerasTotal ? 'warn' : 'ok'}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Senaste händelser
            </h2>
            <Link
              to="/incidents"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              Alla
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2">
            {recentIncidents.map((inc) => (
              <li
                key={inc.id}
                className="rounded-lg border border-slate-800/80 bg-[var(--color-surface-800)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-200">{inc.title}</p>
                    <p className="text-xs text-slate-500">
                      {inc.cameraName} · {formatRelativeTime(inc.occurredAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <SeverityBadge severity={inc.severity} />
                    <IncidentStatusBadge status={inc.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Kameror
            </h2>
            <Link
              to="/cameras"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              Hantera
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-1">
            {featuredCameras.map((cam) => (
              <CameraCard key={cam.id} camera={cam} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
