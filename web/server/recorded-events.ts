import type DigestClient from 'digest-fetch'
import type { ForensicIncident } from '../src/types/forensic'
import { backtestRangeToMs, type AgentBacktestRange } from '../src/lib/agent-backtest'

export interface ParsedAxisEvent {
  occurredAt: string
  topic: string
  title: string
}

function inferTitleFromTopic(topic: string): { title: string; triggerHint: string } {
  const lower = topic.toLowerCase()
  if (lower.includes('motion')) {
    return { title: 'VAPIX motion event', triggerHint: 'motion' }
  }
  if (lower.includes('linecross') || lower.includes('line_cross')) {
    return { title: 'Line crossing detected', triggerHint: 'line_cross' }
  }
  if (lower.includes('human') || lower.includes('person')) {
    return { title: 'Person detected', triggerHint: 'person' }
  }
  if (lower.includes('vehicle') || lower.includes('car')) {
    return { title: 'Vehicle detected', triggerHint: 'vehicle' }
  }
  const short = topic.split('/').pop() ?? topic
  return { title: short.replace(/([A-Z])/g, ' $1').trim(), triggerHint: 'motion' }
}

/** Parse Axis event XML or JSON payloads into normalized events. */
export function parseAxisEventPayload(text: string): ParsedAxisEvent[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const json = JSON.parse(trimmed) as Record<string, unknown>
      const list = (json.events ?? json.data ?? json) as unknown
      if (!Array.isArray(list)) return []
      return list
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item) => {
          const topic = String(item.topic ?? item.Topic ?? item.event ?? 'event')
          const occurredAt = String(
            item.timestamp ?? item.utcTime ?? item.time ?? new Date().toISOString(),
          )
          const { title } = inferTitleFromTopic(topic)
          return { occurredAt, topic, title }
        })
    } catch {
      return []
    }
  }

  const events: ParsedAxisEvent[] = []
  const tagRegex =
    /<(?:[^>:]+:)?(?:event|Event)[^>]*>([\s\S]*?)<\/(?:[^>:]+:)?(?:event|Event)>/gi
  let match: RegExpExecArray | null
  while ((match = tagRegex.exec(trimmed)) != null) {
    const block = match[1]
    const topic =
      block.match(/<(?:[^>:]+:)?topic[^>]*>([^<]+)<\/(?:[^>:]+:)?topic>/i)?.[1]?.trim() ??
      block.match(/<(?:[^>:]+:)?Topic[^>]*>([^<]+)<\/(?:[^>:]+:)?Topic>/i)?.[1]?.trim() ??
      'event'
    const occurredAt =
      block.match(/<(?:[^>:]+:)?(?:utcTime|timestamp|time)[^>]*>([^<]+)<\//i)?.[1]?.trim() ??
      new Date().toISOString()
    const { title } = inferTitleFromTopic(topic)
    events.push({ occurredAt, topic, title })
  }

  if (events.length > 0) return events

  for (const line of trimmed.split('\n')) {
    if (!line.includes('=')) continue
    const [key, value] = line.split('=')
    if (!/event|topic/i.test(key) || !value) continue
    const { title } = inferTitleFromTopic(value)
    events.push({
      occurredAt: new Date().toISOString(),
      topic: value,
      title,
    })
  }

  return events
}

export function toForensicIncidents(
  events: ParsedAxisEvent[],
  cameraId: string,
  cameraName: string,
  rangeStart: Date,
  rangeEnd: Date,
): ForensicIncident[] {
  const out: ForensicIncident[] = []
  for (const [index, event] of events.entries()) {
    const occurredAt = new Date(event.occurredAt)
    if (Number.isNaN(occurredAt.getTime())) continue
    if (occurredAt < rangeStart || occurredAt > rangeEnd) continue

    const t = occurredAt.getTime()
    out.push({
      id: `rec-${cameraId}-${t}-${index}`,
      title: event.title,
      cameraId,
      cameraName,
      severity: 'low',
      status: 'closed',
      occurredAt: occurredAt.toISOString(),
      ruleName: event.topic,
      clipStartAt: new Date(t - 10_000).toISOString(),
      clipEndAt: new Date(t + 20_000).toISOString(),
      durationSec: 30,
    })
  }
  return out
}

export async function fetchAxisRecordedEvents(
  client: DigestClient,
  host: string,
  range: AgentBacktestRange,
): Promise<ParsedAxisEvent[]> {
  const now = Date.now()
  const start = new Date(now - backtestRangeToMs(range))
  const startParam = start.toISOString().replace(/[-:]/g, '').slice(0, 15)
  const endParam = new Date(now).toISOString().replace(/[-:]/g, '').slice(0, 15)

  const paths = [
    `/axis-cgi/event/event.cgi?starttime=${startParam}&endtime=${endParam}`,
    `/axis-cgi/event/export.cgi?starttime=${startParam}&endtime=${endParam}`,
    '/axis-cgi/event/list.cgi',
  ]

  for (const scheme of ['http', 'https'] as const) {
    for (const path of paths) {
      try {
        const response = await client.fetch(`${scheme}://${host}${path}`, {
          method: 'GET',
          signal: AbortSignal.timeout(12_000),
        })
        if (!response.ok) continue
        const text = await response.text()
        const parsed = parseAxisEventPayload(text)
        if (parsed.length > 0) return parsed
      } catch {
        continue
      }
    }
  }

  return []
}
