import { useMemo, useState } from 'react'
import { Download, Play, Film } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import {
  filterIncidentsInRange,
  mockForensicIncidents,
  mockRecordingSegments,
  rangeToMs,
} from '@/lib/mock-forensic'
import type { ForensicRange } from '@/types/forensic'
import { ForensicTimeline } from '@/components/forensic/ForensicTimeline'
import { AlarmListRow } from '@/components/alarm/AlarmListRow'
import { AlarmBestPicturePanel } from '@/components/alarm/AlarmThumbnail'
import { AlarmTier2Panel } from '@/components/alarm/AlarmTier2Panel'
import { cameraHostForIncident } from '@/lib/mock-forensic'
import { formatDateTime } from '@/lib/format'
import { useAlarmTier2 } from '@/hooks/useAlarmTier2'

export function ForensicWorkspace() {
  const { cameras } = useAppConfig()
  const { params, setParam } = useWorkspace()

  const [range, setRange] = useState<ForensicRange>(
    (params.range as ForensicRange) || '48h',
  )
  const cameraFilter = params.camera ?? ''
  const selectedId = params.incident ?? mockForensicIncidents[0]?.id ?? null

  const rangeEnd = useMemo(() => new Date(), [])
  const rangeStart = useMemo(
    () => new Date(rangeEnd.getTime() - rangeToMs(range)),
    [range, rangeEnd],
  )

  const incidents = useMemo(
    () =>
      filterIncidentsInRange(
        mockForensicIncidents,
        rangeStart,
        rangeEnd,
        cameraFilter || null,
      ),
    [rangeStart, rangeEnd, cameraFilter],
  )

  const segments = useMemo(
    () =>
      mockRecordingSegments(
        rangeStart,
        rangeEnd,
        cameraFilter ? [cameraFilter] : cameras.map((c) => c.id),
      ),
    [rangeStart, rangeEnd, cameraFilter, cameras],
  )

  const selected =
    incidents.find((i) => i.id === selectedId) ?? incidents[0] ?? null

  const tier2 = useAlarmTier2(selected)

  const selectIncident = (id: string) => setParam('incident', id)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <p className="text-sm text-slate-400">
        Forensic — review recorded footage and all alarms on a shared timeline. Click a marker or
        list item to view clips (mock).
      </p>

      {/* Filters */}
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
        <select
          value={cameraFilter}
          onChange={(e) => setParam('camera', e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-white"
        >
          <option value="">All cameras</option>
          {cameras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">
          <Film className="mr-1 inline h-3.5 w-3.5" />
          {segments.length} recording segments (mock)
        </span>
      </div>

      <ForensicTimeline
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        incidents={incidents}
        selectedId={selected?.id ?? null}
        onSelect={selectIncident}
      />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(240px,32%)_1fr]">
        {/* Alarm list */}
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/30">
          <h3 className="shrink-0 border-b border-slate-800/80 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Alarms in period
          </h3>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {incidents.length === 0 && (
              <li className="p-4 text-sm text-slate-500">No alarms in selected period.</li>
            )}
            {incidents.map((inc) => (
              <li key={inc.id}>
                <AlarmListRow
                  incident={inc}
                  selected={selected?.id === inc.id}
                  onClick={() => selectIncident(inc.id)}
                />
              </li>
            ))}
          </ul>
        </aside>

        {/* Playback + metadata */}
        <div className="flex min-h-0 flex-col gap-3">
          {selected ? (
            <>
              <AlarmBestPicturePanel
                incident={selected}
                cameraHost={cameraHostForIncident(selected, cameras)}
              />

              {tier2 && <AlarmTier2Panel analysis={tier2} />}

              <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/50">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Play className="h-10 w-10 text-slate-600" />
                  <p className="text-sm text-slate-400">Clip playback</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(selected.clipStartAt)} — {formatDateTime(selected.clipEndAt)} (
                    {selected.durationSec}s)
                  </p>
                </div>
              </div>

              <dl className="grid gap-2 rounded-xl border border-slate-800/80 bg-slate-800/30 p-4 text-sm sm:grid-cols-2">
                <Item label="Timestamp" value={formatDateTime(selected.occurredAt)} />
                <Item label="Camera" value={selected.cameraName} />
                <Item label="Rule" value={selected.ruleName ?? '—'} />
                <Item
                  label="Best picture"
                  value={
                    selected.bestPicture
                      ? `${Math.round(selected.bestPicture.score * 100)} %`
                      : '—'
                  }
                />
                <Item label="Status" value={selected.status} />
                <Item label="Clip ID" value={selected.id} mono />
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
                  Export evidence package
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500">
              Select an alarm on the timeline
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Item({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-xs text-slate-600">{label}</dt>
      <dd className={`text-slate-300 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  )
}
