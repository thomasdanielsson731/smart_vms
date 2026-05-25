import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Camera } from '@/types/camera'
import { useAppConfig } from '@/context/AppConfigContext'
import { CameraStatusBadge } from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/lib/format'
import { useCameraAcaps } from '@/hooks/useCameraAcaps'
import { useCameraDeviceInfo } from '@/hooks/useCameraDeviceInfo'
import { CameraRenameSection } from '@/components/config/CameraRenameSection'
import { CameraAoaSection } from '@/components/config/CameraAoaSection'

export function ConfigurationCamerasPanel() {
  const { cameras } = useAppConfig()
  const [expandedId, setExpandedId] = useState<string | null>(cameras[0]?.id ?? null)

  if (cameras.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">
        No cameras registered. Use the Onboard tab to discover Axis devices on your LAN.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {cameras.map((camera) => (
        <CameraConfigRow
          key={camera.id}
          camera={camera}
          expanded={expandedId === camera.id}
          onToggle={() => setExpandedId((id) => (id === camera.id ? null : camera.id))}
        />
      ))}
    </ul>
  )
}

function CameraConfigRow({
  camera,
  expanded,
  onToggle,
}: {
  camera: Camera
  expanded: boolean
  onToggle: () => void
}) {
  const { applications, loading, error } = useCameraAcaps(expanded ? camera.host : undefined)
  const { info, loading: infoLoading } = useCameraDeviceInfo(expanded ? camera.host : undefined)

  return (
    <li className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/40"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white">{camera.name}</p>
          <p className="text-xs text-slate-500">
            {camera.host} · {camera.model !== '—' ? camera.model : 'Model pending probe'}
          </p>
        </div>
        <CameraStatusBadge status={camera.status} />
      </button>

      {expanded && (
        <div className="border-t border-slate-800/80 px-4 py-3 text-sm">
          <dl className="grid gap-2 sm:grid-cols-2">
            <Detail label="Location" value={camera.location} />
            <Detail label="Firmware" value={info?.firmware ?? camera.firmware} />
            <Detail label="Serial" value={info?.serial ?? camera.serial ?? '—'} />
            <Detail label="Stream" value={info?.streamProfile ?? camera.streamProfile} />
            <Detail label="Recording" value={camera.recordingEnabled ? 'Enabled' : 'Disabled'} />
            <Detail
              label="Last seen"
              value={camera.lastSeenAt ? formatRelativeTime(camera.lastSeenAt) : '—'}
            />
          </dl>

          <CameraRenameSection camera={camera} />

          <CameraAoaSection camera={camera} />

          <div className="mt-4">
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              ACAP applications
            </h4>
            {loading || infoLoading ? (
              <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading from camera…
              </p>
            ) : error ? (
              <p className="text-xs text-amber-400">{error}</p>
            ) : applications.length === 0 ? (
              <p className="text-xs text-slate-500">
                No ACAP applications reported (camera may not expose the applications API).
              </p>
            ) : (
              <ul className="space-y-1.5">
                {applications.map((app) => (
                  <li
                    key={app.name}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-800/50 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-slate-200">{app.niceName ?? app.name}</span>
                    <span className="flex flex-wrap gap-2 text-slate-500">
                      {app.status && <span>{app.status}</span>}
                      {app.version && <span>v{app.version}</span>}
                      {app.vendor && <span>{app.vendor}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-slate-600">{label}</dt>
      <dd className="text-slate-300">{value}</dd>
    </div>
  )
}
