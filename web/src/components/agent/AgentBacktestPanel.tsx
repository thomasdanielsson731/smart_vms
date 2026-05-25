import { useMemo, useState } from 'react'
import { Film, Loader2, PlayCircle } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import {
  alarmToRuleInput,
  draftToRuleInput,
  runAgentBacktest,
  type AgentBacktestRange,
} from '@/lib/agent-backtest'
import type { AlarmDefinition, AlarmDraft } from '@/types/alarm'
import { formatRelativeTime } from '@/lib/format'
import { fetchRecordedEvents } from '@/lib/recorded-events-api'
import type { ForensicIncident } from '@/types/forensic'
import { SeverityBadge } from '@/components/ui/StatusBadge'

type RuleSource =
  | { kind: 'draft'; draft: AlarmDraft }
  | { kind: 'alarm'; alarm: AlarmDefinition }

interface AgentBacktestPanelProps {
  rule: RuleSource
  disabled?: boolean
}

export function AgentBacktestPanel({ rule, disabled }: AgentBacktestPanelProps) {
  const { incidents, cameras } = useAppConfig()
  const { openWorkspace } = useWorkspace()
  const [range, setRange] = useState<AgentBacktestRange>('7d')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedEvents, setFetchedEvents] = useState<ForensicIncident[] | null>(null)

  const ruleInput =
    rule.kind === 'draft' ? draftToRuleInput(rule.draft) : alarmToRuleInput(rule.alarm)

  const cameraIds = rule.kind === 'draft' ? rule.draft.cameraIds : rule.alarm.cameraIds

  const canRun = cameraIds.length > 0 && !disabled

  const recordedPool = useMemo(() => {
    const byId = new Map<string, ForensicIncident>()
    for (const item of [...incidents, ...(fetchedEvents ?? [])]) {
      byId.set(item.id, item)
    }
    return [...byId.values()]
  }, [incidents, fetchedEvents])

  const result = useMemo(() => {
    if (fetchedEvents == null && incidents.length === 0) return null
    return runAgentBacktest(ruleInput, recordedPool, range)
  }, [ruleInput, recordedPool, range, fetchedEvents, incidents.length])

  const runBacktest = async () => {
    if (!canRun) return
    setLoading(true)
    setError(null)
    try {
      const hosts = cameraIds
        .map((id) => cameras.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => !!c)
        .map((c) => ({ cameraId: c.id, cameraName: c.name, host: c.host }))

      const events = await fetchRecordedEvents(hosts, range)
      setFetchedEvents(events)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backtest failed')
      setFetchedEvents([])
    } finally {
      setLoading(false)
    }
  }

  const openHitInTimeline = (hit: { incidentId: string; cameraId: string }) => {
    openWorkspace('video', {
      camera: hit.cameraId,
      incident: hit.incidentId,
      range: range === '24h' ? '24h' : '7d',
      mode: 'playback',
      t: '50',
    })
  }

  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Test on recorded data</h3>
          <p className="mt-1 text-xs text-slate-500">
            Test this agent against recorded events — without enabling live monitoring.
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => {
            setRange(e.target.value as AgentBacktestRange)
            setFetchedEvents(null)
          }}
          className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-xs text-white"
          disabled={loading}
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      <button
        type="button"
        onClick={runBacktest}
        disabled={!canRun || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600/90 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading recorded events…
          </>
        ) : (
          <>
            <PlayCircle className="h-4 w-4" />
            Run backtest
          </>
        )}
      </button>

      {!canRun && (
        <p className="mt-2 text-xs text-amber-400/90">Select at least one camera to run a backtest.</p>
      )}

      {error && (
        <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{result.matchedCount}</span> simulated alarm
            {result.matchedCount === 1 ? '' : 's'} from{' '}
            <span className="text-slate-400">{result.totalRecordedEvents}</span> recorded events in
            period.
          </p>

          {result.matchedCount === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-center text-xs text-slate-500">
              No matches — try a longer period, adjust trigger/zone, or verify recordings exist for
              the selected cameras.
            </p>
          ) : (
            <ul className="max-h-56 space-y-2 overflow-y-auto">
              {result.hits.map((hit) => (
                <li
                  key={`${hit.incidentId}-${hit.occurredAt}`}
                  className="rounded-lg bg-slate-800/50 px-3 py-2 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-200">{hit.title}</p>
                      <p className="text-xs text-slate-500">
                        {hit.cameraName} · {formatRelativeTime(hit.occurredAt)}
                      </p>
                      <p className="mt-1 text-[11px] text-violet-300/80">{hit.matchedBecause}</p>
                    </div>
                    <SeverityBadge severity={hit.severity} />
                  </div>
                  <button
                    type="button"
                    onClick={() => openHitInTimeline(hit)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Film className="h-3.5 w-3.5" />
                    Open clip in timeline
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[11px] text-slate-600">
            Backtest uses VAPIX event history and stored incidents. Does not enable the live agent.
          </p>
        </div>
      )}

      {result == null && fetchedEvents == null && !loading && (
        <p className="mt-3 text-xs text-slate-600">
          Click Run backtest to load recorded events from the selected cameras.
        </p>
      )}
    </section>
  )
}
