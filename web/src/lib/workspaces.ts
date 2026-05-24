import type { WorkspaceId } from '@/types/chat'
import { isFaceRecognitionEnabled } from '@/lib/feature-flags'

export const WORKSPACE_IDS = [
  'video',
  'dashboard',
  'tracking',
  'agents',
  'onboarding',
  'alarms',
  'forensic',
  'map',
  'faces',
  'camera-web',
  'settings',
] as const satisfies readonly Exclude<WorkspaceId, null>[]

const workspaceIdSet = new Set<string>(WORKSPACE_IDS)

export function parseWorkspaceId(raw: string | null): WorkspaceId {
  if (!raw || !workspaceIdSet.has(raw)) return null
  if (raw === 'faces' && !isFaceRecognitionEnabled()) return null
  return raw as Exclude<WorkspaceId, null>
}

export function isCopilotWorkspaceId(raw: string): raw is Exclude<WorkspaceId, null> {
  if (!workspaceIdSet.has(raw)) return false
  if (raw === 'faces' && !isFaceRecognitionEnabled()) return false
  return true
}
