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
import {
  canAccessWorkspace,
  canWriteSettings,
  roleLabel,
} from '@/lib/auth-permissions'
import type { WorkspaceId } from '@/types/chat'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  canAccessWorkspace: (workspace: Exclude<WorkspaceId, null>) => boolean
  canWrite: boolean
  roleLabel: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u)
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
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      loading,
      login,
      logout,
      canAccessWorkspace: (workspace) =>
        user ? canAccessWorkspace(user.role, workspace) : false,
      canWrite: user ? canWriteSettings(user.role) : false,
      roleLabel: user ? roleLabel(user.role) : '',
    }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
