import { useEffect, useMemo, useState } from 'react'
import { Download, Film, Play } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { CameraFaceMemoryOverlay } from '@/components/face/CameraFaceMemoryOverlay'
import { LiveViewPanel } from '@/components/camera/LiveViewPanel'
import { LiveViewGrid } from '@/components/camera/LiveViewGrid'
import {
  LiveLayoutToggle,
  parseLiveLayout,
  type LiveLayoutMode,
} from '@/components/camera/LiveLayoutToggle'
import { UnifiedTimelineScrubber } from '@/components/timeline/TimelineScrubber'
import { AlarmListRow } from '@/components/alarm/AlarmListRow'
import { AlarmBestPicturePanel } from '@/components/alarm/AlarmThumbnail'
import { AlarmTier2Panel } from '@/components/alarm/AlarmTier2Panel'
import { profilesRememberedByCamera } from '@/lib/face-memory'
import {
  filterIncidentsInRange,
  recordingSegmentsForRange,
  rangeToMs,
  cameraHostForIncident,
} from '@/lib/forensic-utils'
import type { ForensicRange } from '@/types/forensic'
import { isTimelineLive, positionFromIncident } from '@/lib/timeline-unified'
import { formatDateTime } from '@/lib/format'
import { useAlarmTier2 } from '@/hooks/useAlarmTier2'

function parseTimelinePosition(raw: string | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n)) return 100
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function VideoWorkspace() {
  const { cameras, faceProfiles, faceSettings, incidents: allIncidents } = useAppConfig()
  const { params, setParam, setParams } = useWorkspace()

  const cameraId = params.camera ?? cameras[0]?.id
  const layout = parseLiveLayout(params.layout)
  const showFaces = params.faces === '1' || faceSettings.enabled
  const camera = cameras.find((c) => c.id === cameraId) ?? cameras[0]

  const [range, setRange] = useState<ForensicRange>(
    (params.range as ForensicRange) || '48h',
  )
  const [position, setPosition] = useState(() => {
    if (params.t != null) return parseTimelinePosition(params.t)
    if (params.mode === 'playback') return 50
    return 100
  })

  useEffect(() => {
    if (params.range) setRange(params.range as ForensicRange)
    if (params.t != null) setPosition(parseTimelinePosition(params.t))
    else if (params.mode === 'playback') setPosition(50)
  }, [params.range, params.t, params.mode])

  const rangeEnd = useMemo(() => new Date(), [])
  const rangeStart = useMemo(
    () => new Date(rangeEnd.getTime() - rangeToMs(range)),
    [range, rangeEnd],
  )

  const isLive = isTimelineLive(position)
  const remembered = camera ? profilesRememberedByCamera(faceProfiles, camera.id) : []

  const incidents = useMemo(
    () =>
      filterIncidentsInRange(
        allIncidents,
        rangeStart,
        rangeEnd,
        camera?.id ?? null,
      ),
    [allIncidents, rangeStart, rangeEnd, camera?.id],
  )

  const segments = useMemo(
    () =>
      recordingSegmentsForRange(
        rangeStart,
        rangeEnd,
        camera ? [camera.id] : cameras.map((c) => c.id),
      ),
    [rangeStart, rangeEnd, camera, cameras],
  )

  const selectedIncidentId = params.incident ?? null
  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) ??
    (incidents.length > 0 && !isLive ? incidents[0] : null)

  const tier2 = useAlarmTier2(selectedIncident)

  const setLayout = (next: LiveLayoutMode) => {
    if (next === 'grid') setParam('layout', 'grid')
    else setParams({ layout: undefined })
  }

  const selectCamera = (id: string) => {
    setParams({ camera: id, layout: undefined })
  }

  const updatePosition = (next: number) => {
    setPosition(next)
    setParam('t', String(next))
    if (isTimelineLive(next)) {
      setParams({ incident: undefined, mode: undefined })
    } else {
      setParam('mode', 'playback')
    }
  }

  const selectIncident = (id: string) => {
    const inc = incidents.find((i) => i.id === id)
    setParam('incident', id)
    if (inc) {
      const next = positionFromIncident(inc, rangeStart, rangeEnd)
      setPosition(next)
      setParams({ t: String(next), mode: 'playback' })
    }
  }

  const liveSingleView =
    camera && showFaces && remembered.length > 0 ? (
      <CameraFaceMemoryOverlay camera={camera} profiles={faceProfiles} autoScanMs={3000} />
    ) : camera ? (
      <LiveViewPanel camera={camera} />
    ) : null

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <p className="text-sm text-slate-400">
        Live and recorded video on one timeline — scrub left for playback and alarms, drag all the
        way right for live.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-slate-800/60 p-0.5">
          {(['24h', '48h', '7d'] as ForensicRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRange(r)
                setParam('range', r)
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                range === r ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        {isLive && (
          <LiveLayoutToggle layout={layout} onChange={setLayout} cameraCount={cameras.length} />
        )}
        {segments.length > 0 && (
          <span className="text-xs text-slate-500">
            <Film className="mr-1 inline h-3.5 w-3.5" />
            {segments.length} segments
          </span>
        )}
      </div>

      {(!isLive || layout === 'single') && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500">Camera:</span>
          {cameras.map((cam) => (
            <button
              key={cam.id}
              type="button"
              onClick={() => selectCamera(cam.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                cam.id === camera?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cam.name}
            </button>
          ))}
        </div>
      )}

      {isLive && layout === 'grid' ? (
        <LiveViewGrid cameras={cameras} />
      ) : (
        camera && (
          <UnifiedTimelineScrubber
            camera={camera}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            position={position}
            onPositionChange={updatePosition}
            incidents={incidents}
            selectedIncidentId={selectedIncident?.id ?? null}
            onSelectIncident={selectIncident}
            liveVideo={liveSingleView}
            playbackLabel={
              selectedIncident
                ? `${selectedIncident.title} · ${camera.name}`
                : undefined
            }
          />
        )
      )}

      {isLive && layout === 'grid' && camera && (
        <UnifiedTimelineScrubber
          camera={camera}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          position={position}
          onPositionChange={updatePosition}
          incidents={incidents}
          selectedIncidentId={selectedIncident?.id ?? null}
          onSelectIncident={selectIncident}
          liveVideo={
            <div className="flex aspect-video items-center justify-center text-xs text-slate-500">
              All cameras live above — select one camera for single view
            </div>
          }
        />
      )}

      {!isLive && selectedIncident && camera && (
        <div className="grid gap-4 lg:grid-cols-[minmax(220px,28%)_1fr]">
          <aside className="max-h-64 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-900/30 lg:max-h-none">
            <h3 className="border-b border-slate-800/80 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Alarms in period
            </h3>
            <ul>
              {incidents.map((inc) => (
                <li key={inc.id}>
                  <AlarmListRow
                    incident={inc}
                    selected={selectedIncident.id === inc.id}
                    onClick={() => selectIncident(inc.id)}
                  />
                </li>
              ))}
            </ul>
          </aside>

          <div className="space-y-3">
            <AlarmBestPicturePanel
              incident={selectedIncident}
              cameraHost={cameraHostForIncident(selectedIncident, cameras)}
            />
            {tier2 && <AlarmTier2Panel analysis={tier2} />}
            <dl className="grid gap-2 rounded-xl border border-slate-800/80 bg-slate-800/30 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-600">Time</dt>
                <dd className="text-slate-300">{formatDateTime(selectedIncident.occurredAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Camera</dt>
                <dd className="text-slate-300">{selectedIncident.cameraName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Rule</dt>
                <dd className="text-slate-300">{selectedIncident.ruleName ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Clip</dt>
                <dd className="text-slate-300">{selectedIncident.durationSec}s</dd>
              </div>
            </dl>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600/20 px-4 py-2 text-sm text-blue-300 hover:bg-blue-600/30"
              >
                <Play className="h-4 w-4" />
                Play clip
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {isLive && layout === 'single' && remembered.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setParam('faces', showFaces ? '0' : '1')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              showFaces ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {showFaces ? 'Faces on' : 'Show remembered faces'}
          </button>
        </div>
      )}

      {camera && layout === 'single' && remembered.length > 0 && isLive && (
        <p className="text-xs text-emerald-400/80">
          {camera.name} remembers: {remembered.map((p) => p.name).join(', ')}
        </p>
      )}
    </div>
  )
}
