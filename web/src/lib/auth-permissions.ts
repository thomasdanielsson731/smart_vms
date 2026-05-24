import type { WorkspaceId } from '@/types/chat'
import type { UserRole } from '@/types/auth'

const adminOnlyWorkspaces: Exclude<WorkspaceId, null>[] = ['onboarding', 'alarms']

export function canAccessWorkspace(role: UserRole, workspace: Exclude<WorkspaceId, null>): boolean {
  if (role === 'admin') return true
  return !adminOnlyWorkspaces.includes(workspace)
}

export function canWriteSettings(role: UserRole): boolean {
  return role === 'admin'
}

export function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Administratör' : 'Läsbehörighet'
}
