import type { WorkspaceId } from '@/types/chat'
import { isCopilotWorkspaceId } from '@/lib/workspaces'

const ACTION_TAG = '@@ACTION@@'

export interface CopilotAction {
  workspace: Exclude<WorkspaceId, null>
  params?: Record<string, string>
}

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
    if (parsed.workspace && isCopilotWorkspaceId(parsed.workspace)) {
      return {
        content,
        action: {
          workspace: parsed.workspace,
          params: parsed.params,
        },
      }
    }
  } catch {
    /* ignore malformed action */
  }

  return { content: raw.replace(ACTION_TAG, '').trim(), action: null }
}
