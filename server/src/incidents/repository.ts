import type { IncidentDto, IncidentQuery, SmartVmsEvent } from '../types.js'

export interface IncidentRepository {
  ingestEvent(event: SmartVmsEvent): Promise<IncidentDto | null>
  listIncidents(query: IncidentQuery): Promise<IncidentDto[]>
  countOpen(): Promise<number>
  searchEvents(q: string, days: number): Promise<SmartVmsEvent[]>
  getPipelineStats(): Promise<{
    eventsIngestedTotal: number
    eventsDroppedTotal: number
    avgPipelineLagMs: number
    lastEventAt: string | null
  }>
  recordDropped(count: number): Promise<void>
}

export function buildSearchText(event: SmartVmsEvent): string {
  const parts = [
    event.event_type,
    event.source.camera_id,
    JSON.stringify(event.payload),
  ]
  return parts.join(' ').toLowerCase()
}

export function incidentFromEvent(event: SmartVmsEvent): IncidentDto {
  const occurredMs = new Date(event.occurred_at).getTime()
  const title = String(
    event.payload.title ?? event.payload.rule_name ?? event.event_type.replace(/\./g, ' '),
  )
  const cameraName = String(event.payload.camera_name ?? event.source.camera_id)
  const ruleName = event.payload.rule_name ? String(event.payload.rule_name) : event.event_type
  const severityRaw = String(event.payload.severity ?? 'medium')
  const severity =
    severityRaw === 'low' || severityRaw === 'high' ? severityRaw : ('medium' as const)

  return {
    id: event.event_id,
    title,
    cameraId: event.source.camera_id,
    cameraName,
    severity,
    status: 'open',
    occurredAt: event.occurred_at,
    ruleName,
    clipStartAt: new Date(occurredMs - 10_000).toISOString(),
    clipEndAt: new Date(occurredMs + 20_000).toISOString(),
    durationSec: 30,
  }
}

export function shouldOpenIncident(event: SmartVmsEvent): boolean {
  return (
    event.event_type === 'rule.matched' ||
    event.event_type === 'detection.created' ||
    event.event_type === 'incident.opened' ||
    event.event_type === 'vapix.received'
  )
}
