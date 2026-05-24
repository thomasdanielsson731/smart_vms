import { useEffect, useState } from 'react'
import { HardDrive, Save } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { formatGiB, policyLabels } from '@/lib/storage-utils'
import type { RecordingStorageSettings, StorageLimitPolicy } from '@/types/storage'

export function RecordingStorageSettingsPanel() {
  const { storageSettings, storageUsage, updateStorageSettings } = useAppConfig()
  const { canWrite } = useAuth()
  const [draft, setDraft] = useState<RecordingStorageSettings>(storageSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setDraft(storageSettings)
  }, [storageSettings])

  const update = <K extends keyof RecordingStorageSettings>(
    key: K,
    value: RecordingStorageSettings[K],
  ) => {
    if (!canWrite) return
    setDraft((d) => ({ ...d, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    if (!canWrite) return
    updateStorageSettings(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const usage = storageUsage
  const barColor = usage.isOverQuota
    ? 'bg-red-500'
    : usage.isWarning
      ? 'bg-amber-500'
      : 'bg-emerald-500'

  return (
    <section className="rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-blue-400" />
        <h2 className="text-base font-semibold text-white">Recording & storage</h2>
      </div>

      <p className="mb-4 text-sm text-slate-400">
        Limit how much disk space recordings and clips can use. Saved locally in the browser
        (mock until server is connected).
        {!canWrite && (
          <span className="mt-2 block text-amber-400/90">
            Only administrators can change storage settings.
          </span>
        )}
      </p>

      {/* Usage bar */}
      <div className="mb-6 rounded-lg bg-slate-900/50 p-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-slate-400">Recordings</span>
          <span className={usage.isWarning ? 'text-amber-400' : 'text-slate-300'}>
            {formatGiB(usage.recordingUsedGiB)} / {formatGiB(draft.maxRecordingGiB)} (
            {usage.recordingPercent}%)
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full transition-all ${barColor}`}
            style={{ width: `${Math.min(usage.recordingPercent, 100)}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs">
          <span className="text-slate-500">Event clips</span>
          <span className="text-slate-400">
            {formatGiB(usage.clipsUsedGiB)} /{' '}
            {formatGiB(draft.maxClipsGiB > 0 ? draft.maxClipsGiB : draft.maxRecordingGiB * 0.1)}
          </span>
        </div>
        {usage.isOverQuota && (
          <p className="mt-2 text-xs text-red-400">Quota reached — policy per setting below.</p>
        )}
        {usage.isWarning && !usage.isOverQuota && (
          <p className="mt-2 text-xs text-amber-400">
            Warning threshold ({draft.warnAtPercent}%) exceeded.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Field label={`Max recordings: ${draft.maxRecordingGiB} GiB`}>
          <input
            type="range"
            min={10}
            max={2000}
            step={10}
            value={draft.maxRecordingGiB}
            onChange={(e) => update('maxRecordingGiB', Number(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min={1}
            max={10000}
            value={draft.maxRecordingGiB}
            onChange={(e) => update('maxRecordingGiB', Math.max(1, Number(e.target.value)))}
            className={inputCls}
          />
        </Field>

        <Field label={`Max event clips: ${draft.maxClipsGiB} GiB (0 = auto 10% of recordings)`}>
          <input
            type="range"
            min={0}
            max={500}
            step={5}
            value={draft.maxClipsGiB}
            onChange={(e) => update('maxClipsGiB', Number(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min={0}
            max={2000}
            value={draft.maxClipsGiB}
            onChange={(e) => update('maxClipsGiB', Math.max(0, Number(e.target.value)))}
            className={inputCls}
          />
        </Field>

        <Field label={`Max retention: ${draft.maxRetentionDays} days`}>
          <input
            type="range"
            min={1}
            max={365}
            value={draft.maxRetentionDays}
            onChange={(e) => update('maxRetentionDays', Number(e.target.value))}
            className="w-full"
          />
        </Field>

        <Field label={`Warn at ${draft.warnAtPercent}% of recording quota`}>
          <input
            type="range"
            min={50}
            max={99}
            value={draft.warnAtPercent}
            onChange={(e) => update('warnAtPercent', Number(e.target.value))}
            className="w-full"
          />
        </Field>

        <fieldset>
          <legend className="mb-2 text-xs text-slate-500">When recording quota is full</legend>
          <div className="space-y-2">
            {(Object.keys(policyLabels) as StorageLimitPolicy[]).map((policy) => (
              <label
                key={policy}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/40"
              >
                <input
                  type="radio"
                  name="onLimitReached"
                  checked={draft.onLimitReached === policy}
                  onChange={() => update('onLimitReached', policy)}
                  className="mt-1"
                />
                {policyLabels[policy]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!canWrite}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saved ? 'Saved' : 'Save storage settings'}
      </button>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-500">{label}</span>
      <div className="space-y-2">{children}</div>
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white'
