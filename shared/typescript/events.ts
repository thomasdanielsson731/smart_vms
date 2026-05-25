/** Hand-maintained mirror of shared/schemas — keep in sync with JSON Schema. */

export const SCHEMA_VERSION = '1.0' as const

export type EventType =
  | 'vapix.received'
  | 'detection.created'
  | 'rule.matched'
  | 'incident.opened'
  | 'incident.updated'
  | 'incident.closed'
  | 'clip.available'
  | 'camera.health.changed'
  | 'config.rules.applied'

export interface EventSource {
  camera_id: string
  edge_node_id?: string
  software_version?: string
}

export interface SmartVmsEventEnvelope<TPayload = Record<string, unknown>> {
  schema_version: typeof SCHEMA_VERSION
  event_id: string
  event_type: EventType
  occurred_at: string
  ingested_at?: string
  source: EventSource
  trace_id?: string
  payload: TPayload
}

export interface DetectionObject {
  class: string
  confidence: number
  bbox_norm: [number, number, number, number]
  track_id?: string
}

export interface DetectionPayload {
  frame_ts: string
  model?: { name: string; version: string }
  objects: DetectionObject[]
  zone_ids?: string[]
}
