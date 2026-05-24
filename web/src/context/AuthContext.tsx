import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '@/types/auth'
import { fetchCurrentUser, login as apiLogin, logout as apiLogout } from '@/lib/auth-api'
import { loadLastLoginAt, saveLastLoginAt } from '@/lib/last-login-storage'
import {
  canAccessWorkspace,
  canWriteSettings,
  roleLabel,
} from '@/lib/auth-permissions'
import type { WorkspaceId } from '@/types/chat'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /** ISO timestamp for activity summary — previous login on fresh sign-in, current session start on restore. */
  activitySince: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  canAccessWorkspace: (workspace: Exclude<WorkspaceId, null>) => boolean
  canWrite: boolean
  roleLabel: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activitySince, setActivitySince] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchCurrentUser()
      .then((u) => {
        if (cancelled) return
        setUser(u)
        if (u) setActivitySince(loadLastLoginAt(u.username))
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const u = await apiLogin(username, password)
    const previous = saveLastLoginAt(u.username, new Date().toISOString())
    setActivitySince(previous)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    setActivitySince(null)
  }, [])

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      loading,
      activitySince,
      login,
      logout,
      canAccessWorkspace: (workspace) =>
        user ? canAccessWorkspace(user.role, workspace) : false,
      canWrite: user ? canWriteSettings(user.role) : false,
      roleLabel: user ? roleLabel(user.role) : '',
    }),
    [user, loading, activitySince, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
