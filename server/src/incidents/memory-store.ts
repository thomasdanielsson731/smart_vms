import type { IncidentDto, IncidentQuery, SmartVmsEvent } from '../types.js'
import {
  buildSearchText,
  incidentFromEvent,
  shouldOpenIncident,
  type IncidentRepository,
} from './repository.js'

/** In-memory fallback when DATABASE_URL is unset (tests, local dev without Docker). */
export class InMemoryIncidentRepository implements IncidentRepository {
  private events = new Map<string, SmartVmsEvent>()
  private incidents = new Map<string, IncidentDto>()
  private stats = {
    eventsIngestedTotal: 0,
    eventsDroppedTotal: 0,
    avgPipelineLagMs: 0,
    lastEventAt: null as string | null,
  }

  async ingestEvent(event: SmartVmsEvent): Promise<IncidentDto | null> {
    if (this.events.has(event.event_id)) return this.incidents.get(event.event_id) ?? null

    const ingestedAt = new Date().toISOString()
    const enriched = { ...event, ingested_at: ingestedAt }
    this.events.set(event.event_id, enriched)

    const lag = Math.max(0, Date.parse(ingestedAt) - Date.parse(event.occurred_at))
    this.stats.eventsIngestedTotal += 1
    this.stats.lastEventAt = ingestedAt
    this.stats.avgPipelineLagMs = Math.round(
      (this.stats.avgPipelineLagMs * (this.stats.eventsIngestedTotal - 1) + lag) /
        this.stats.eventsIngestedTotal,
    )

    if (!shouldOpenIncident(event)) return null

    const incident = incidentFromEvent(event)
    this.incidents.set(incident.id, incident)
    return incident
  }

  async listIncidents(query: IncidentQuery): Promise<IncidentDto[]> {
    let rows = [...this.incidents.values()]
    if (query.from) {
      rows = rows.filter((i) => new Date(i.occurredAt) >= query.from!)
    }
    if (query.to) {
      rows = rows.filter((i) => new Date(i.occurredAt) <= query.to!)
    }
    if (query.cameraId) {
      rows = rows.filter((i) => i.cameraId === query.cameraId)
    }
    if (query.q) {
      const q = query.q.toLowerCase()
      rows = rows.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.ruleName?.toLowerCase().includes(q) ?? false) ||
          i.cameraName.toLowerCase().includes(q),
      )
    }
    rows.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    return rows.slice(0, query.limit ?? 200)
  }

  async countOpen(): Promise<number> {
    return [...this.incidents.values()].filter((i) => i.status === 'open').length
  }

  async searchEvents(q: string, days: number): Promise<SmartVmsEvent[]> {
    const since = Date.now() - days * 24 * 3600_000
    const needle = q.toLowerCase()
    return [...this.events.values()].filter((e) => {
      if (Date.parse(e.occurred_at) < since) return false
      return buildSearchText(e).includes(needle)
    })
  }

  async getPipelineStats() {
    return { ...this.stats }
  }

  async recordDropped(count: number): Promise<void> {
    this.stats.eventsDroppedTotal += count
  }
}
