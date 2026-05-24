import { useState, useEffect, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Lock, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchAuthStatus } from '@/lib/auth-api'

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [authConfigured, setAuthConfigured] = useState(true)

  useEffect(() => {
    fetchAuthStatus()
      .then((s) => setAuthConfigured(s.configured))
      .catch(() => setAuthConfigured(false))
  }, [])

  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggning misslyckades')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-950)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold text-white">Smart VMS</h1>
          <p className="mt-1 text-sm text-slate-500">Logga in för att komma åt kameror och larm</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800/80 bg-[var(--color-surface-800)] p-6 shadow-xl"
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!authConfigured && (
            <div className="mb-4 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2.5 text-xs text-amber-200">
              Autentisering ej konfigurerad. Sätt{' '}
              <code className="text-amber-100">SMARTVMS_ADMIN_PASSWORD</code> i{' '}
              <code className="text-amber-100">web/.env</code> och starta om{' '}
              <code className="text-amber-100">npm run dev</code>.
            </div>
          )}

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Användarnamn</span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none ring-blue-500/0 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Lösenord</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting || loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {submitting ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Session via säker cookie · Lokal autentisering (Phase 1)
        </p>
      </div>
    </div>
  )
}
