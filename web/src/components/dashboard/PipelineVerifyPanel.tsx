import { useState } from 'react'
import { Activity, Loader2, PlayCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { runPipelineSmokeTest, type PipelineSmokeResult } from '@/lib/pipeline-smoke'

export function PipelineVerifyPanel() {
  const { user } = useAuth()
  const { incidents } = useAppConfig()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PipelineSmokeResult | null>(null)

  if (user?.role !== 'admin') return null

  const run = async () => {
    setLoading(true)
    try {
      const next = await runPipelineSmokeTest()
      setResult(next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Event pipeline
          </h3>
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
          Run smoke test
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Verifies Phase 3 path: HTTP ingest → incident store → dashboard list ({incidents.length}{' '}
        incidents loaded).
      </p>

      {result && (
        <ul className="mt-3 space-y-1.5">
          {result.steps.map((step) => (
            <li
              key={step.name}
              className={`rounded-md px-2 py-1 text-xs ${step.ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}
            >
              {step.ok ? 'PASS' : 'FAIL'} · {step.name}
              {step.detail ? ` — ${step.detail}` : ''}
            </li>
          ))}
          <li className="pt-1 text-xs text-slate-500">
            Marker: <code className="text-slate-400">{result.marker}</code>
          </li>
        </ul>
      )}
    </section>
  )
}
