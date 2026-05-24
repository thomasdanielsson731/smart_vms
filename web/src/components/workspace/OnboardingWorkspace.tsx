import { useEffect, useState } from 'react'
import { Check, Loader2, Radar, ChevronRight } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { fetchVapixConfig } from '@/lib/vapix-config-api'
import { defaultVapixUser } from '@/lib/vapix-config-storage'
import type { OnboardingBatch } from '@/types/onboarding'

type Step = 'scan' | 'select' | 'configure' | 'done'

const defaultBatch: OnboardingBatch = {
  vapixUser: defaultVapixUser,
  vapixPassword: '',
  recordingEnabled: true,
  namePrefix: 'Camera',
}

export function OnboardingWorkspace() {
  const {
    discovered,
    discoveryStatus,
    scanNetwork,
    setDiscoveredSelected,
    selectAllDiscovered,
    onboardSelected,
  } = useAppConfig()

  const [step, setStep] = useState<Step>('scan')
  const [batch, setBatch] = useState<OnboardingBatch>(defaultBatch)
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null)
  const [vapixReady, setVapixReady] = useState<boolean | null>(null)

  useEffect(() => {
    fetchVapixConfig()
      .then((cfg) => {
        setVapixReady(cfg.configured)
        if (cfg.user) setBatch((b) => ({ ...b, vapixUser: cfg.user }))
      })
      .catch(() => setVapixReady(false))
  }, [])

  const selectedCount = discovered.filter((d) => d.selected).length
  const newCount = discovered.filter((d) => !d.alreadyRegistered).length

  const handleScan = async () => {
    await scanNetwork()
    setStep('select')
  }

  const handleOnboard = () => {
    const res = onboardSelected(batch)
    setResult(res)
    setStep('done')
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Multi-config: discover Axis devices on the network (mDNS/ONVIF mock) and onboard several at once
        with the same VAPIX credentials.
      </p>

      <StepIndicator current={step} />

      {step === 'scan' && (
        <section className="space-y-4">
          <button
            type="button"
            onClick={handleScan}
            disabled={discoveryStatus === 'scanning'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {discoveryStatus === 'scanning' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Radar className="h-4 w-4" />
            )}
            {discoveryStatus === 'scanning' ? 'Searching LAN…' : 'Search for cameras on network'}
          </button>
          <p className="text-xs text-slate-500">
            Phase 1: real discovery via backend (mDNS, WS-Discovery, known subnets).
          </p>
        </section>
      )}

      {step === 'select' && (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectAllDiscovered(true)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => selectAllDiscovered(true, true)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              New only ({newCount})
            </button>
            <button
              type="button"
              onClick={() => selectAllDiscovered(false)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-700"
            >
              Deselect all
            </button>
          </div>

          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {discovered.map((d) => (
              <li
                key={d.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                  d.selected ? 'border-blue-500/40 bg-blue-600/10' : 'border-slate-800 bg-slate-800/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={d.selected}
                  onChange={(e) => setDiscoveredSelected(d.id, e.target.checked)}
                  className="rounded border-slate-600"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {d.model}
                    {d.alreadyRegistered && (
                      <span className="ml-2 text-xs font-normal text-emerald-500">registered</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {d.host} · {d.serial}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => setStep('configure')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          >
            Next: configure {selectedCount} selected
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>
      )}

      {step === 'configure' && (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-white">Shared configuration (bulk)</h3>
          <Field label="VAPIX user (per camera if different)">
            <input
              value={batch.vapixUser}
              onChange={(e) => setBatch((b) => ({ ...b, vapixUser: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <p className="text-xs text-slate-500">
            Shared password for all cameras is set under{' '}
            <strong className="text-slate-400">Settings → Cameras (VAPIX)</strong>.
            {vapixReady === false && (
              <span className="mt-1 block text-amber-400">Camera password missing — live video will not work yet.</span>
            )}
            {vapixReady === true && (
              <span className="mt-1 block text-emerald-500">Shared password is configured.</span>
            )}
          </p>
          <Field label="Name prefix">
            <input
              value={batch.namePrefix}
              onChange={(e) => setBatch((b) => ({ ...b, namePrefix: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={batch.recordingEnabled}
              onChange={(e) => setBatch((b) => ({ ...b, recordingEnabled: e.target.checked }))}
              className="rounded"
            />
            Enable recording on all
          </label>
          <button
            type="button"
            onClick={handleOnboard}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Onboard {selectedCount} cameras
          </button>
        </section>
      )}

      {step === 'done' && result && (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <Check className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
          <p className="font-medium text-white">
            {result.added} cameras added
            {result.skipped > 0 && ` · ${result.skipped} already registered were skipped`}
          </p>
          <button
            type="button"
            onClick={() => {
              setStep('scan')
              setResult(null)
            }}
            className="mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            New search
          </button>
        </section>
      )}
    </div>
  )
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'scan', label: 'Search' },
    { id: 'select', label: 'Select' },
    { id: 'configure', label: 'Config' },
    { id: 'done', label: 'Done' },
  ]
  const order: Step[] = ['scan', 'select', 'configure', 'done']
  const idx = order.indexOf(current)

  return (
    <div className="flex gap-1">
      {steps.map((s, i) => (
        <div
          key={s.id}
          className={`flex-1 rounded py-1 text-center text-xs ${
            i <= idx ? 'bg-blue-600/20 text-blue-300' : 'bg-slate-800/50 text-slate-600'
          }`}
        >
          {s.label}
        </div>
      ))}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none'
