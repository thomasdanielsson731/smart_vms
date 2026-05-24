import { LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function TopBar() {
  const { user, logout, roleLabel } = useAuth()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[var(--color-surface-900)] px-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Smart VMS</p>
          <p className="text-xs text-slate-500">AI-first · Axis hem</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-slate-300">{user.displayName}</p>
            <p className="text-[10px] text-slate-500">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
            title="Logga ut"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logga ut
          </button>
        </div>
      )}
    </header>
  )
}
