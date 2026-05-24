import { useEffect, useState } from 'react'
import { Camera, Save, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchVapixConfig, saveVapixConfig } from '@/lib/vapix-config-api'
import {
  defaultVapixUser,
  loadLocalVapixSettings,
  saveLocalVapixSettings,
} from '@/lib/vapix-config-storage'
import { vapixSourceLabels, type VapixConfigStatus } from '@/types/vapix'

export function VapixConnectionSettingsPanel() {
  const { canWrite } = useAuth()
  const [status, setStatus] = useState<VapixConfigStatus | null>(null)
  const [user, setUser] = useState(defaultVapixUser)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchVapixConfig()
      .then((remote) => {
        if (cancelled) return
        setStatus(remote)
        setUser(remote.user || defaultVapixUser)
        const local = loadLocalVapixSettings()
        if (local?.password) setPassword(local.password)
      })
      .catch(() => {
        if (!cancelled) {
          const local = loadLocalVapixSettings()
          if (local) {
            setUser(local.user)
            setPassword(local.password)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    if (!canWrite) return
    setError(null)
    setSaving(true)
    try {
      const next = await saveVapixConfig({ user: user.trim(), password })
      saveLocalVapixSettings({ user: user.trim(), password })
      setStatus(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5 text-blue-400" />
        <h2 className="text-base font-semibold text-white">Kameror (VAPIX)</h2>
      </div>

      <p className="mb-4 text-sm text-slate-400">
        Ett gemensamt användarnamn och lösenord för alla Axis-kameror. Samma uppgifter används för
        live video och snapshots. Per kamera kan användarnamn skilja sig (t.ex. i onboarding) —
        lösenordet är alltid gemensamt.
      </p>

      {status?.configured && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Aktiv källa: {vapixSourceLabels[status.source]}
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Laddar…</p>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              VAPIX-användare (alla kameror)
            </span>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              disabled={!canWrite}
              placeholder="root"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              Gemensamt lösenord
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!canWrite}
              placeholder={status?.configured ? '•••••••• (oförändrat om tomt)' : 'Kamerans lösenord'}
              className={inputCls}
            />
          </label>

          {!canWrite && (
            <p className="text-xs text-amber-400/90">
              Endast administratör kan ändra kameruppgifter.
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canWrite || saving || !user.trim() || (!password && !status?.configured)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Sparar…' : saved ? 'Sparat' : 'Spara kameruppgifter'}
          </button>

          <p className="text-xs text-slate-600">
            Alternativ: sätt <code className="text-slate-500">AXIS_VAPIX_USER</code> och{' '}
            <code className="text-slate-500">AXIS_VAPIX_PASSWORD</code> i{' '}
            <code className="text-slate-500">web/.env</code>. Inställningar här har företräde.
          </p>
        </div>
      )}
    </section>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white disabled:opacity-60'
