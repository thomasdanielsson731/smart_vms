import { createHash } from 'node:crypto'
import type { ParsedAxisEvent } from './recorded-events'

export interface SmartVmsEventPayload {
  schema_version: string
  event_id: string
  event_type: string
  occurred_at: string
  source: {
    camera_id: string
    edge_node_id?: string
    software_version?: string
  }
  trace_id?: string
  payload: Record<string, unknown>
}

export function vapixEventKey(cameraId: string, topic: string, occurredAt: string): string {
  return `${cameraId}|${topic}|${occurredAt}`
}

/** Deterministic id so retries and duplicate Axis deliveries are idempotent at ingest. */
export function stableEventId(vapixKey: string): string {
  const hash = createHash('sha256').update(vapixKey).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-8${hash.slice(15, 18)}-${hash.slice(18, 30)}`
}

export function axisEventToSmartVmsEvent(
  event: ParsedAxisEvent,
  camera: { id: string; name: string },
): SmartVmsEventPayload {
  const key = vapixEventKey(camera.id, event.topic, event.occurredAt)
  return {
    schema_version: '1.0',
    event_id: stableEventId(key),
    event_type: 'vapix.received',
    occurred_at: event.occurredAt,
    source: {
      camera_id: camera.id,
      software_version: 'web-vapix-ingest/0.1.0',
    },
    payload: {
      title: event.title,
      rule_name: event.topic,
      camera_name: camera.name,
      vapix_event_key: key,
      topic: event.topic,
      severity: inferSeverity(event.topic),
    },
  }
}

function inferSeverity(topic: string): 'low' | 'medium' | 'high' {
  const lower = topic.toLowerCase()
  if (lower.includes('tamper') || lower.includes('intrusion')) return 'high'
  if (lower.includes('human') || lower.includes('person') || lower.includes('linecross')) {
    return 'medium'
  }
  return 'low'
}
