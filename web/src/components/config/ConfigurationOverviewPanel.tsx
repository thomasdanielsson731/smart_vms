import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { fetchVapixConfig } from '@/lib/vapix-config-api'
import { buildSystemFeatures } from '@/lib/system-config'
import type { ConfigurationTab } from '@/types/config'

export function ConfigurationOverviewPanel() {
  const { cameras, alarms, storageSettings, faceSettings } = useAppConfig()
  const { openWorkspace } = useWorkspace()
  const [vapixConfigured, setVapixConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    fetchVapixConfig()
      .then((cfg) => setVapixConfigured(cfg.configured))
      .catch(() => setVapixConfigured(false))
  }, [])

  const features = useMemo(
    () =>
      buildSystemFeatures({
        storageSettings,
        faceSettings,
        vapixConfigured,
        cameraCount: cameras.length,
        agentCount: alarms.length,
      }),
    [storageSettings, faceSettings, vapixConfigured, cameras.length, alarms.length],
  )

  const enabledCount = features.filter((f) => f.enabled).length

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Cameras" value={String(cameras.length)} />
        <SummaryCard label="Features active" value={`${enabledCount}/${features.length}`} />
        <SummaryCard
          label="VAPIX"
          value={vapixConfigured == null ? '…' : vapixConfigured ? 'Ready' : 'Missing'}
          variant={vapixConfigured === false ? 'warn' : 'default'}
        />
      </div>

      <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">System features</h3>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li
              key={feature.id}
              className="flex items-start gap-3 rounded-lg bg-slate-800/40 px-3 py-2.5 text-sm"
            >
              {feature.enabled ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-200">{feature.label}</p>
                <p className="text-xs text-slate-500">{feature.description}</p>
                {feature.configureHint && (
                  <p className="mt-1 text-[11px] text-slate-600">{feature.configureHint}</p>
                )}
              </div>
              <span className="shrink-0 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                {feature.source}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openWorkspace('config', { tab: 'cameras' })}
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
        >
          View cameras
        </button>
        <button
          type="button"
          onClick={() => openWorkspace('config', { tab: 'onboard' })}
          className="rounded-lg bg-blue-600/20 px-3 py-2 text-sm text-blue-300 hover:bg-blue-600/30"
        >
          Onboard cameras
        </button>
        <button
          type="button"
          onClick={() => openWorkspace('settings')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
        >
          Settings
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  variant = 'default',
}: {
  label: string
  value: string
  variant?: 'default' | 'warn'
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        variant === 'warn'
          ? 'border-amber-500/30 bg-amber-500/10'
          : 'border-slate-800/80 bg-slate-900/40'
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}

export function ConfigurationTabBar({
  tab,
  onChange,
  showOnboard,
}: {
  tab: ConfigurationTab
  onChange: (tab: ConfigurationTab) => void
  showOnboard: boolean
}) {
  const tabs: { id: ConfigurationTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'cameras', label: 'Cameras' },
    ...(showOnboard ? [{ id: 'onboard' as const, label: 'Onboard' }] : []),
  ]

  return (
    <div className="flex gap-1 rounded-lg bg-slate-800/60 p-0.5">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium ${
            tab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
