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

        <h2 className="mb-4 text-base font-semibold text-white">Accounts</h2>

        <p className="mb-4 text-sm text-slate-400">

          Local authentication with session cookie. Administrators can onboard cameras and change

          settings; read-only users can view video and alarms.

        </p>

        <div className="space-y-3">

          <label className="block text-xs font-medium text-slate-500">Signed in as</label>

          <input

            type="text"

            value={user ? `${user.displayName} (${user.username})` : '—'}

            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white"

            disabled

          />

          <label className="block text-xs font-medium text-slate-500">Role</label>

          <input

            type="text"

            value={roleLabel}

            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white"

            disabled

          />

        </div>

      </section>



      <section className="rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] p-6">

        <h2 className="mb-4 text-base font-semibold text-white">Privacy</h2>

        <label className="flex items-center gap-3 text-sm text-slate-300">

          <input type="checkbox" defaultChecked disabled className="rounded" />

          Face bounding box off for indoor cameras (default)

        </label>

        <label className="mt-3 flex items-center gap-3 text-sm text-slate-300">

          <input type="checkbox" defaultChecked disabled className="rounded" />

          Face recognition requires explicit enablement and consent (Faces workspace)

        </label>

      </section>

    </div>

  )

}

