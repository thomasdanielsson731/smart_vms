export interface SmartVmsEvent {
  schema_version: string
  event_id: string
  event_type: string
  occurred_at: string
  ingested_at?: string
  source: { camera_id: string; edge_node_id?: string; software_version?: string }
  trace_id?: string
  payload: Record<string, unknown>
}

export interface IncidentDto {
  id: string
  title: string
  cameraId: string
  cameraName: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'acknowledged' | 'closed'
  occurredAt: string
  ruleName?: string
  clipStartAt: string
  clipEndAt: string
  durationSec: number
}

export interface SystemHealthDto {
  ok: boolean
  mqttConnected: boolean
  databaseConnected: boolean
  eventsIngestedTotal: number
  eventsDroppedTotal: number
  openIncidents: number
  avgPipelineLagMs: number
  lastEventAt: string | null
}

export interface IncidentQuery {
  from?: Date
  to?: Date
  cameraId?: string
  q?: string
  limit?: number
}
