import { useCallback, useState } from 'react'
import {
  ExternalLink,
  Globe,
  Home,
  Monitor,
  RefreshCw,
  Server,
} from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { CameraStatusBadge } from '@/components/ui/StatusBadge'
import { useCameraDeviceInfo } from '@/hooks/useCameraDeviceInfo'
import {
  axisWebPages,
  cameraDirectWebUrl,
  cameraProxiedWebUrl,
} from '@/lib/camera-web'
import { formatRelativeTime } from '@/lib/format'
import type { Camera } from '@/types/camera'

export function CameraWebWorkspace() {
  const { cameras } = useAppConfig()
  const { params, setParam } = useWorkspace()
  const cameraId = params.camera ?? cameras[0]?.id
  const webPath = params.path ?? '/'
  const camera = cameras.find((c) => c.id === cameraId) ?? cameras[0]
  const [iframeKey, setIframeKey] = useState(0)

  const { info, loading: infoLoading, error: infoError } = useCameraDeviceInfo(camera?.host)

  const reloadFrame = useCallback(() => setIframeKey((k) => k + 1), [])

  const navigatePath = (path: string) => {
    setParam('path', path)
    setIframeKey((k) => k + 1)
  }

  if (!camera) {
    return <p className="text-sm text-slate-500">No cameras registered.</p>
  }

  const proxiedUrl = cameraProxiedWebUrl(camera.host, webPath)

  return (
    <div className="-mx-4 -mb-4 flex h-[calc(100vh-7.5rem)] min-h-[420px] gap-4">
      {/* Camera list */}
      <aside className="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-800/20 p-2">
        <div className="flex items-center gap-2 px-2 py-1">
          <Globe className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Camera web
          </span>
        </div>
        {cameras.map((cam) => (
          <CameraWebListItem
            key={cam.id}
            camera={cam}
            selected={cam.id === camera.id}
            onSelect={() => {
              setParam('camera', cam.id)
              setParam('path', '/')
              setIframeKey((k) => k + 1)
            }}
          />
        ))}
      </aside>

      {/* Main browser panel */}
      <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-slate-800/80 bg-slate-900/40">
        <header className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 px-3 py-2">
          <Monitor className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{camera.name}</p>
            <p className="truncate font-mono text-xs text-slate-500">{camera.host}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            <ToolbarButton
              icon={Home}
              label="Home"
              onClick={() => navigatePath('/')}
            />
            <ToolbarButton icon={RefreshCw} label="Reload" onClick={reloadFrame} />
            <a
              href={cameraDirectWebUrl(camera.host, webPath)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-2.5 py-1.5 text-xs text-blue-300 hover:bg-blue-600/30"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in tab
            </a>
          </div>
        </header>

        {/* Quick links to common Axis pages */}
        <div className="flex flex-wrap gap-1 border-b border-slate-800/60 px-3 py-2">
          {axisWebPages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => navigatePath(page.path)}
              className={`rounded-md px-2 py-1 text-xs ${
                webPath === page.path
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>

        {/* Device info from VAPIX */}
        <div className="border-b border-slate-800/60 px-3 py-2 text-xs text-slate-500">
          {infoLoading && 'Loading device info…'}
          {infoError && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-200">
              <p className="font-medium">Could not authenticate to camera web UI</p>
              <p className="mt-1 text-amber-200/90">{infoError}</p>
              <p className="mt-2 text-amber-200/70">
                Re-save VAPIX credentials under Settings → Cameras, or set{' '}
                <code className="text-amber-100">AXIS_VAPIX_USER</code> /{' '}
                <code className="text-amber-100">AXIS_VAPIX_PASSWORD</code> in{' '}
                <code className="text-amber-100">web/.env</code> and restart{' '}
                <code className="text-amber-100">npm run dev</code>.
              </p>
            </div>
          )}
          {info && !infoLoading && (
            <>
              <p className="mb-1 text-emerald-400/90">
                Authenticated via VAPIX — the embedded UI should load without a login form.
              </p>
              <span className="flex flex-wrap gap-x-3 gap-y-0.5">
                {info.model && <span>Model: {info.model}</span>}
                {info.firmware && <span>Firmware: {info.firmware}</span>}
                {info.serial && <span>Serial: {info.serial}</span>}
                {info.ip && <span>IP: {info.ip}</span>}
              </span>
            </>
          )}
          {!infoLoading && !infoError && !info?.model && (
            <span>Each Axis camera runs a web server at its IP address.</span>
          )}
        </div>

        {/* Embedded proxied UI */}
        <div className="relative min-h-0 flex-1 bg-black">
          <iframe
            key={`${camera.id}-${iframeKey}-${webPath}`}
            title={`${camera.name} web interface`}
            src={proxiedUrl}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          />
        </div>

        <footer className="border-t border-slate-800/60 px-3 py-1.5 text-[10px] text-slate-600">
          Proxied with saved VAPIX credentials · If the embedded UI fails, use{' '}
          <strong className="text-slate-500">Open in tab</strong> and sign in with the same
          username/password as in Settings
        </footer>
      </div>
    </div>
  )
}

function CameraWebListItem({
  camera,
  selected,
  onSelect,
}: {
  camera: Camera
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg px-2 py-2 text-left transition ${
        selected ? 'bg-blue-600/20 ring-1 ring-blue-500/30' : 'hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-slate-200">{camera.name}</span>
        <CameraStatusBadge status={camera.status} />
      </div>
      <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-slate-500">
        <Server className="h-3 w-3 shrink-0" />
        {camera.host}
      </p>
      {camera.lastSeenAt && (
        <p className="mt-0.5 text-[10px] text-slate-600">
          Last seen {formatRelativeTime(camera.lastSeenAt)}
        </p>
      )}
    </button>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Home
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
