export type AgentStatus = 'active' | 'paused' | 'error'

export interface MonitoringAgent {
  id: string
  name: string
  description: string
  status: AgentStatus
  cameras: string[]
  schedule: string
  ruleSummary: string
  lastTriggeredAt: string | null
  alertsLast7d: number
}
