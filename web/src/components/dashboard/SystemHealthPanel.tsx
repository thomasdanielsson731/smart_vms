import { Activity, Database, Radio, Video } from 'lucide-react'
import { useSystemHealth } from '@/hooks/useSystemHealth'
import { useVapixEventIngestStatus } from '@/hooks/useVapixEventIngestStatus'
import { formatRelativeTime } from '@/lib/format'
import type { VapixEventIngestStatus } from '@/lib/vapix-events-api'

export function SystemHealthPanel() {
  const health = useSystemHealth()
  const vapixIngest = useVapixEventIngestStatus()

  if (!health) {
    return (
      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-4">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          System health
        </h3>
        <p className="text-sm text-slate-500">
          Phase 3 server not connected. Run{' '}
          <code className="text-slate-400">cd server && npm run dev</code> (and optional{' '}
          <code className="text-slate-400">docker compose up</code> in deploy/).
        </p>
        {vapixIngest && <VapixIngestSummary status={vapixIngest} />}
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
        System health
      </h3>
      <div className="grid gap-2 sm:grid-cols-3">
        <HealthItem
          icon={Radio}
          label="MQTT"
          value={health.mqttConnected ? 'Connected' : 'Offline'}
          ok={health.mqttConnected}
        />
        <HealthItem
          icon={Database}
          label="Database"
          value={health.databaseConnected ? 'Postgres' : 'In-memory'}
          ok={health.databaseConnected}
        />
        <HealthItem
          icon={Activity}
          label="Pipeline lag"
          value={`${health.avgPipelineLagMs} ms`}
          ok={health.avgPipelineLagMs < 2000}
        />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {health.eventsIngestedTotal} events ingested
        {health.eventsDroppedTotal > 0 && ` · ${health.eventsDroppedTotal} dropped (backpressure)`}
        {health.lastEventAt && ` · last ${formatRelativeTime(health.lastEventAt)}`}
      </p>
      {vapixIngest && <VapixIngestSummary status={vapixIngest} />}
    </section>
  )
}

function VapixIngestSummary({ status }: { status: VapixEventIngestStatus }) {
  return (
    <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-800/30 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Video className="h-3.5 w-3.5" />
        <span>
          VAPIX ingest: {status.cameras.filter((c) => c.connected).length}/{status.cameras.length}{' '}
          cameras · {status.ingestedTotal} forwarded
          {status.serverReachable ? ' · server OK' : ' · server offline'}
        </span>
      </div>
    </div>
  )
}

function HealthItem({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof Activity
  label: string
  value: string
  ok: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-2">
      <Icon className={`h-4 w-4 ${ok ? 'text-emerald-400' : 'text-amber-400'}`} />
      <div>
        <p className="text-[10px] uppercase text-slate-500">{label}</p>
        <p className="text-sm text-slate-200">{value}</p>
      </div>
    </div>
  )
}
