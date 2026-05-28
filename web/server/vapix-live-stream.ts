import type DigestClient from 'digest-fetch'
import { parseAxisEventPayload, type ParsedAxisEvent } from './recorded-events'

const LIVE_EVENT_PATHS = ['/axis-cgi/event/event.cgi', '/axis-cgi/event/eventstream.cgi']

const EVENT_BLOCK_RE =
  /<(?:[^>:]+:)?(?:event|Event)[^>]*>([\s\S]*?)<\/(?:[^>:]+:)?(?:event|Event)>/gi

export function extractEventsFromBuffer(buffer: string): {
  events: ParsedAxisEvent[]
  remainder: string
} {
  const events: ParsedAxisEvent[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  EVENT_BLOCK_RE.lastIndex = 0
  while ((match = EVENT_BLOCK_RE.exec(buffer)) != null) {
    const block = match[0]
    const parsed = parseAxisEventPayload(block)
    if (parsed.length > 0) events.push(...parsed)
    lastIndex = EVENT_BLOCK_RE.lastIndex
  }
  const remainder = lastIndex > 0 ? buffer.slice(lastIndex) : buffer
  return { events, remainder: remainder.slice(-16_384) }
}

export async function pollAxisRecentEvents(
  client: DigestClient,
  host: string,
  lookbackMs = 120_000,
): Promise<ParsedAxisEvent[]> {
  const now = Date.now()
  const start = new Date(now - lookbackMs)
  const startParam = start.toISOString().replace(/[-:]/g, '').slice(0, 15)
  const endParam = new Date(now).toISOString().replace(/[-:]/g, '').slice(0, 15)
  const paths = [
    `/axis-cgi/event/event.cgi?starttime=${startParam}&endtime=${endParam}`,
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

export async function streamAxisLiveEvents(
  client: DigestClient,
  host: string,
  onEvent: (event: ParsedAxisEvent) => void,
  signal: AbortSignal,
): Promise<'completed' | 'aborted' | 'failed'> {
  for (const scheme of ['http', 'https'] as const) {
    for (const path of LIVE_EVENT_PATHS) {
      try {
        const response = await client.fetch(`${scheme}://${host}${path}`, {
          method: 'GET',
          signal,
          headers: { Accept: '*/*' },
        })
        if (!response.ok || !response.body) continue

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (!signal.aborted) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const { events, remainder } = extractEventsFromBuffer(buffer)
          buffer = remainder
          for (const event of events) onEvent(event)
        }

        return signal.aborted ? 'aborted' : 'completed'
      } catch (err) {
        if (signal.aborted) return 'aborted'
        void err
        continue
      }
    }
  }
  return 'failed'
}
