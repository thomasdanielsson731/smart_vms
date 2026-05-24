import type { WorkspaceId } from '@/types/chat'
import { isFaceRecognitionEnabled } from '@/lib/feature-flags'

export const WORKSPACE_IDS = [
  'video',
  'dashboard',
  'tracking',
  'agents',
  'config',
  'onboarding',
  'forensic',
  'map',
  'faces',
  'camera-web',
  'settings',
] as const satisfies readonly Exclude<WorkspaceId, null>[]

const workspaceIdSet = new Set<string>(WORKSPACE_IDS)

/** Legacy URL/intent aliases merged into canonical workspace ids. */
export function normalizeWorkspaceId(raw: string): Exclude<WorkspaceId, null> | null {
  if (raw === 'alarms') return 'agents'
  if (raw === 'forensic') return 'video'
  if (raw === 'onboarding') return 'config'
  if (!workspaceIdSet.has(raw)) return null
  if (raw === 'faces' && !isFaceRecognitionEnabled()) return null
  return raw as Exclude<WorkspaceId, null>
}

export function parseWorkspaceId(raw: string | null): WorkspaceId {
  if (!raw) return null
  return normalizeWorkspaceId(raw)
}

export function isCopilotWorkspaceId(raw: string): raw is Exclude<WorkspaceId, null> {
  return normalizeWorkspaceId(raw) != null
}

export function resolveCopilotWorkspace(raw: string): Exclude<WorkspaceId, null> | null {
  return normalizeWorkspaceId(raw)
}
