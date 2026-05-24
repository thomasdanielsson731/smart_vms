import type { WorkspaceId } from '@/types/chat'

const ACTION_TAG = '@@ACTION@@'

export interface CopilotAction {
  workspace: Exclude<WorkspaceId, null>
  params?: Record<string, string>
}

const validWorkspaces = new Set<string>([
  'video',
  'dashboard',
  'tracking',
  'agents',
  'onboarding',
  'alarms',
  'forensic',
  'faces',
  'map',
  'settings',
])

export function parseCopilotResponse(raw: string): {
  content: string
  action: CopilotAction | null
} {
  const idx = raw.indexOf(ACTION_TAG)
  if (idx === -1) {
    return { content: raw.trim(), action: null }
  }

  const content = raw.slice(0, idx).trim()
  const jsonPart = raw.slice(idx + ACTION_TAG.length).trim()

  try {
    const parsed = JSON.parse(jsonPart) as { workspace?: string; params?: Record<string, string> }
    if (parsed.workspace && validWorkspaces.has(parsed.workspace)) {
      return {
        content,
        action: {
          workspace: parsed.workspace as CopilotAction['workspace'],
          params: parsed.params,
        },
      }
    }
  } catch {
    /* ignore malformed action */
  }

  return { content: raw.replace(ACTION_TAG, '').trim(), action: null }
}
