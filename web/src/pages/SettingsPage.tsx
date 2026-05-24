import { useAuth } from '@/context/AuthContext'
import { RecordingStorageSettingsPanel } from '@/components/settings/RecordingStorageSettings'
import { VapixConnectionSettingsPanel } from '@/components/settings/VapixConnectionSettings'

export function SettingsPage() {
  const { user, roleLabel } = useAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <VapixConnectionSettingsPanel />
      <RecordingStorageSettingsPanel />

      <section className="rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] p-6">
        <h2 className="mb-4 text-base font-semibold text-white">Konton</h2>
        <p className="mb-4 text-sm text-slate-400">
          Lokal autentisering med session-cookie. Administratör kan onboarda kameror och ändra
          inställningar; läsbehörighet kan se video och larm.
        </p>
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-500">Inloggad som</label>
          <input
            type="text"
            value={user ? `${user.displayName} (${user.username})` : '—'}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white"
            disabled
          />
          <label className="block text-xs font-medium text-slate-500">Roll</label>
          <input
            type="text"
            value={roleLabel}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white"
            disabled
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] p-6">
        <h2 className="mb-4 text-base font-semibold text-white">Integritet</h2>
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input type="checkbox" defaultChecked disabled className="rounded" />
          Ansikts-bbox av för inomhuskameror (standard)
        </label>
        <label className="mt-3 flex items-center gap-3 text-sm text-slate-300">
          <input type="checkbox" defaultChecked disabled className="rounded" />
          Ingen ansiktsidentifiering (v1)
        </label>
      </section>
    </div>
  )
}
