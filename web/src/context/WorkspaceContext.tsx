import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { WorkspaceId } from '@/types/chat'
import { parseWorkspaceId } from '@/lib/workspaces'
interface WorkspaceState {
  workspace: WorkspaceId
  params: Record<string, string>
}

interface WorkspaceContextValue extends WorkspaceState {
  openWorkspace: (id: Exclude<WorkspaceId, null>, params?: Record<string, string>) => void
  closeWorkspace: () => void
  setParam: (key: string, value: string) => void
  setParams: (updates: Record<string, string | undefined>) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const workspace = parseWorkspaceId(searchParams.get('w'))
  const params = useMemo(() => {
    const p: Record<string, string> = {}
    searchParams.forEach((v, k) => {
      if (k !== 'w') p[k] = v
    })
    return p
  }, [searchParams])

  const openWorkspace = useCallback(
    (id: Exclude<WorkspaceId, null>, nextParams?: Record<string, string>) => {
      const next = new URLSearchParams()
      next.set('w', id)
      if (nextParams) {
        Object.entries(nextParams).forEach(([k, v]) => next.set(k, v))
      }
      setSearchParams(next, { replace: false })
      navigate({ pathname: '/', search: next.toString() })
    },
    [navigate, setSearchParams],
  )

  const closeWorkspace = useCallback(() => {
    setSearchParams({}, { replace: true })
    navigate('/', { replace: true })
  }, [navigate, setSearchParams])

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams)
      next.set(key, value)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) next.delete(key)
        else next.set(key, value)
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const value = useMemo(
    () => ({
      workspace,
      params,
      openWorkspace,
      closeWorkspace,
      setParam,
      setParams,
    }),
    [workspace, params, openWorkspace, closeWorkspace, setParam, setParams],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
