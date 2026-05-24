export type WorkspaceId =
  | 'video'
  | 'dashboard'
  | 'tracking'
  | 'agents'
  | 'onboarding'
  | 'alarms'
  | 'forensic'
  | 'map'
  | 'faces'
  | 'camera-web'
  | 'settings'
  | null

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  workspaceHint?: WorkspaceId
  actionLabel?: string
}

export interface ChatAction {
  workspace: Exclude<WorkspaceId, null>
  params?: Record<string, string>
  reply: string
}
