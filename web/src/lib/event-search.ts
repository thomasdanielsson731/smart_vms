import type { Camera } from '@/types/camera'
import type { ForensicIncident, ForensicRange } from '@/types/forensic'
import { fetchIncidents } from '@/lib/incidents-api'
import { fetchRecordedEvents } from '@/lib/recorded-events-api'
import { rangeToMs } from '@/lib/forensic-utils'

export interface EventSearchOptions {
  query: string
  range?: ForensicRange
  cameras: Camera[]
  cameraId?: string
}

export interface EventSearchResult {
  incidents: ForensicIncident[]
  source: 'server' | 'vapix' | 'local'
  serverAvailable: boolean
}

/** Multi-token AND match on incident metadata (keyword search v1). */
export function matchIncidentQuery(incident: ForensicIncident, query: string): boolean {
  const tokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (tokens.length === 0) return true

  const haystack = [
    incident.title,
    incident.ruleName,
    incident.cameraName,
    incident.cameraId,
    incident.severity,
    incident.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return tokens.every((token) => haystack.includes(token))
}

export function filterIncidentsByQuery(
  incidents: ForensicIncident[],
  query: string,
): ForensicIncident[] {
  const trimmed = query.trim()
  if (!trimmed) return incidents
  return incidents.filter((inc) => matchIncidentQuery(inc, trimmed))
}

function mergeIncidents(lists: ForensicIncident[][]): ForensicIncident[] {
  const byId = new Map<string, ForensicIncident>()
  for (const list of lists) {
    for (const inc of list) {
      if (!byId.has(inc.id)) byId.set(inc.id, inc)
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )
}

function rangeToDays(range: ForensicRange): number {
  switch (range) {
    case '24h':
      return 1
    case '48h':
      return 2
    case '7d':
      return 7
  }
}

function backtestRangeFromForensic(range: ForensicRange): '24h' | '48h' | '7d' {
  return range
}

async function searchServerIncidents(
  query: string,
  range: ForensicRange,
  cameraId?: string,
): Promise<{ incidents: ForensicIncident[]; available: boolean }> {
  const health = await fetch(`/api/vms/health/system`, { credentials: 'same-origin' })
  if (!health.ok) {
    return { incidents: [], available: false }
  }

  const [incidents, eventsRes] = await Promise.all([
    fetchIncidents({ range, q: query, cameraId }),
    fetch(
      `/api/vms/events/search?${new URLSearchParams({
        q: query,
        days: String(rangeToDays(range)),
      })}`,
      { credentials: 'same-origin' },
    ),
  ])

  let fromEvents: ForensicIncident[] = []
  if (eventsRes.ok) {
    const data = (await eventsRes.json()) as {
      events?: Array<{
        event_id: string
        event_type: string
        occurred_at: string
        source: { camera_id: string }
        payload?: Record<string, unknown>
      }>
    }
    fromEvents = (data.events ?? []).map((event) => {
      const occurredMs = new Date(event.occurred_at).getTime()
      const title = String(
        event.payload?.title ?? event.payload?.rule_name ?? event.event_type.replace(/\./g, ' '),
      )
      const cameraName = String(event.payload?.camera_name ?? event.source.camera_id)
      const ruleName = event.payload?.rule_name
        ? String(event.payload.rule_name)
        : event.event_type
      const severityRaw = String(event.payload?.severity ?? 'medium')
      const severity =
        severityRaw === 'low' || severityRaw === 'high' ? severityRaw : ('medium' as const)

      return {
        id: event.event_id,
        title,
        cameraId: event.source.camera_id,
        cameraName,
        severity,
        status: 'closed' as const,
        occurredAt: event.occurred_at,
        ruleName,
        clipStartAt: new Date(occurredMs - 10_000).toISOString(),
        clipEndAt: new Date(occurredMs + 20_000).toISOString(),
        durationSec: 30,
      }
    })
  }

  return { incidents: mergeIncidents([incidents, fromEvents]), available: true }
}

async function searchVapixRecordedEvents(
  query: string,
  range: ForensicRange,
  cameras: Camera[],
  cameraId?: string,
): Promise<ForensicIncident[]> {
  const targets = cameras
    .filter((c) => c.host && (!cameraId || c.id === cameraId))
    .map((c) => ({ cameraId: c.id, cameraName: c.name, host: c.host! }))

  if (targets.length === 0) return []

  try {
    const events = await fetchRecordedEvents(targets, backtestRangeFromForensic(range))
    return filterIncidentsByQuery(events, query)
  } catch {
    return []
  }
}

/** Search incidents across server index (when up) and VAPIX recorded events fallback. */
export async function searchForensicEvents(
  options: EventSearchOptions,
): Promise<EventSearchResult> {
  const query = options.query.trim()
  const range = options.range ?? '7d'
  if (!query) {
    return { incidents: [], source: 'local', serverAvailable: false }
  }

  const { incidents: serverHits, available } = await searchServerIncidents(
    query,
    range,
    options.cameraId,
  )
  if (serverHits.length > 0) {
    return { incidents: serverHits, source: 'server', serverAvailable: available }
  }

  const vapixHits = await searchVapixRecordedEvents(
    query,
    range,
    options.cameras,
    options.cameraId,
  )
  if (vapixHits.length > 0) {
    return { incidents: vapixHits, source: 'vapix', serverAvailable: available }
  }

  if (available) {
    return { incidents: [], source: 'server', serverAvailable: true }
  }

  return { incidents: [], source: 'local', serverAvailable: false }
}

export function parseEventSearchIntent(input: string): {
  query: string
  range?: ForensicRange
  cameraId?: string
} | null {
  const raw = input.trim()
  if (!raw) return null

  const q = raw.toLowerCase()

  const searchLead =
    /(?:search(?:\s+for)?|find|look(?:ing)?\s+for|show\s+me|list\s+(?:events|alarms|motion|recordings)|when\s+did|who\s+was|any\s+)(.+)/i.exec(
      raw,
    )
  const alarmWhy = /why\s+did\s+i\s+get\s+(?:an\s+)?alarm/i.test(q)
  if (!searchLead && !alarmWhy && !/\b(?:vehicle|person|motion|package|intrusion|line\s+cross)\b/i.test(q)) {
    return null
  }

  let range: ForensicRange | undefined
  if (/last\s+week|7\s*days?|past\s+week|senaste\s+veck/i.test(q)) range = '7d'
  else if (/48\s*h|last\s+2\s+days?|senaste\s+2\s+dag/i.test(q)) range = '48h'
  else if (/24\s*h|yesterday|last\s+night|igår|igar|senaste\s+dag/i.test(q)) range = '24h'
  else if (/last\s+48\s+hours|48\s+hours/i.test(q)) range = '48h'

  let cameraId: string | undefined
  if (/entr|entry/.test(q)) cameraId = 'cam-entry'
  else if (/trädgård|tradgard|garden|yard/.test(q)) cameraId = 'cam-garden'
  else if (/garage/.test(q)) cameraId = 'cam-garage'
  else if (/driveway|uppfart|uppför/i.test(q)) cameraId = 'cam-driveway'

  let query = searchLead?.[1]?.trim() ?? raw
  query = query
    .replace(/\b(?:from|on|at|in|during|last|past|the|my|our)\b/gi, ' ')
    .replace(/\b(?:24h|48h|7d|hours?|days?|week)\b/gi, ' ')
    .replace(/\b(?:driveway|entry|entrance|garage|garden|yard|uppfart)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (alarmWhy) {
    const timeMatch = raw.match(/\b(\d{1,2}:\d{2})\b/)
    query = timeMatch ? timeMatch[1] : 'alarm'
  }

  if (!query) query = raw.slice(0, 80)

  return { query, range, cameraId }
}

export function rangeEndFromNow(): Date {
  return new Date()
}

export function rangeStartFromRange(range: ForensicRange, end = rangeEndFromNow()): Date {
  return new Date(end.getTime() - rangeToMs(range))
}
