import type { SmartVmsEvent } from '../event-bus/mqtt.js'

export interface IncidentRecord {
  id: string
  title: string
  camera_id: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'closed'
  occurred_at: string
  linked_event_ids: string[]
}

/** Phase 3 in-memory store — replace with Postgres implementation. */
export class InMemoryIncidentStore {
  private items = new Map<string, IncidentRecord>()

  list(): IncidentRecord[] {
    return [...this.items.values()].sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
    )
  }

  upsertFromEvent(event: SmartVmsEvent): IncidentRecord {
    const existing = this.items.get(event.event_id)
    if (existing) return existing

    const record: IncidentRecord = {
      id: event.event_id,
      title: String(event.payload.title ?? event.event_type),
      camera_id: event.source.camera_id,
      severity: 'medium',
      status: 'open',
      occurred_at: event.occurred_at,
      linked_event_ids: [event.event_id],
    }
    this.items.set(record.id, record)
    return record
  }
}
