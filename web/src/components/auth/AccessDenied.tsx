import { ShieldAlert } from 'lucide-react'

export function AccessDenied({ workspace }: { workspace: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-900/40 bg-amber-950/20 p-10 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" />
      <h2 className="text-base font-semibold text-white">Access denied</h2>
      <p className="max-w-sm text-sm text-slate-400">
        Your account does not have permission to access{' '}
        <strong className="text-slate-300">{workspace}</strong>. Contact an administrator if you
        need expanded access.
      </p>
    </div>
  )
}
