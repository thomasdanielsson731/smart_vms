import type { ForensicIncident, ForensicRange } from '@/types/forensic'
import { rangeToMs } from '@/lib/forensic-utils'

interface ServerIncident {
  id: string
  title: string
  cameraId: string
  cameraName: string
  severity: ForensicIncident['severity']
  status: ForensicIncident['status']
  occurredAt: string
  ruleName?: string
  clipStartAt: string
  clipEndAt: string
  durationSec: number
}

function mapIncident(raw: ServerIncident): ForensicIncident {
  return {
    id: raw.id,
    title: raw.title,
    cameraId: raw.cameraId,
    cameraName: raw.cameraName,
    severity: raw.severity,
    status: raw.status,
    occurredAt: raw.occurredAt,
    ruleName: raw.ruleName,
    clipStartAt: raw.clipStartAt,
    clipEndAt: raw.clipEndAt,
    durationSec: raw.durationSec,
  }
}

export async function fetchIncidents(options: {
  range?: ForensicRange
  cameraId?: string
  q?: string
} = {}): Promise<ForensicIncident[]> {
  const range = options.range ?? '7d'
  const to = new Date()
  const from = new Date(to.getTime() - rangeToMs(range))
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  })
  if (options.cameraId) params.set('cameraId', options.cameraId)
  if (options.q) params.set('q', options.q)

  const res = await fetch(`/api/vms/incidents?${params}`, { credentials: 'same-origin' })
  if (!res.ok) return []
  const data = (await res.json()) as { incidents?: ServerIncident[] }
  return (data.incidents ?? []).map(mapIncident)
}

export async function searchEventMetadata(q: string, days = 7): Promise<number> {
  const params = new URLSearchParams({ q, days: String(days) })
  const res = await fetch(`/api/vms/events/search?${params}`, { credentials: 'same-origin' })
  if (!res.ok) return 0
  const data = (await res.json()) as { events?: unknown[] }
  return data.events?.length ?? 0
}

export async function ingestEvent(event: Record<string, unknown>): Promise<boolean> {
  const res = await fetch('/api/vms/events/ingest', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  return res.ok
}
