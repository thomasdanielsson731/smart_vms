import type { IncomingMessage, ServerResponse } from 'node:http'
import { URL } from 'node:url'
import type { IncidentRepository } from '../incidents/repository.js'
import type { MqttEventBus } from '../event-bus/mqtt.js'
import { pingDatabase } from '../db/pool.js'
import type { IncidentDto, SmartVmsEvent, SystemHealthDto } from '../types.js'
import { notifyWebhook } from '../notifications/webhook.js'

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T
}

export function createRouter(deps: {
  incidents: IncidentRepository
  bus: MqttEventBus
  onIncident?: (incident: IncidentDto) => Promise<void>
}) {
  return async function route(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const path = url.pathname

    if (path === '/health' && req.method === 'GET') {
      sendJson(res, 200, { ok: true, service: 'smart-vms-server', version: '0.2.0' })
      return true
    }

    if (path === '/api/health/system' && req.method === 'GET') {
      const stats = await deps.incidents.getPipelineStats()
      const health: SystemHealthDto = {
        ok: deps.bus.isConnected() || stats.eventsIngestedTotal > 0,
        mqttConnected: deps.bus.isConnected(),
        databaseConnected: await pingDatabase(),
        eventsIngestedTotal: stats.eventsIngestedTotal,
        eventsDroppedTotal: stats.eventsDroppedTotal,
        openIncidents: await deps.incidents.countOpen(),
        avgPipelineLagMs: stats.avgPipelineLagMs,
        lastEventAt: stats.lastEventAt,
      }
      sendJson(res, 200, health)
      return true
    }

    if (path === '/api/incidents' && req.method === 'GET') {
      const from = url.searchParams.get('from')
      const to = url.searchParams.get('to')
      const list = await deps.incidents.listIncidents({
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        cameraId: url.searchParams.get('cameraId') ?? undefined,
        q: url.searchParams.get('q') ?? undefined,
        limit: Number(url.searchParams.get('limit') ?? 200),
      })
      sendJson(res, 200, { incidents: list })
      return true
    }

    if (path === '/api/events/search' && req.method === 'GET') {
      const q = url.searchParams.get('q') ?? ''
      const days = Number(url.searchParams.get('days') ?? 7)
      if (!q.trim()) {
        sendJson(res, 400, { error: 'missing_query', message: 'Query parameter q is required' })
        return true
      }
      const events = await deps.incidents.searchEvents(q, days)
      sendJson(res, 200, { events, query: q, days })
      return true
    }

    if (path === '/api/events/ingest' && req.method === 'POST') {
      try {
        const event = await readJson<SmartVmsEvent>(req)
        const incident = await deps.incidents.ingestEvent(event)
        if (incident) {
          await notifyWebhook(incident)
          await deps.onIncident?.(incident)
        }
        sendJson(res, 202, { ok: true, incident })
      } catch {
        sendJson(res, 400, { error: 'invalid_body', message: 'Expected SmartVmsEvent JSON' })
      }
      return true
    }

    return false
  }
}

export async function handleEventIngest(
  incidents: IncidentRepository,
  event: SmartVmsEvent,
  onIncident?: (incident: IncidentDto) => Promise<void>,
): Promise<void> {
  const incident = await incidents.ingestEvent(event)
  if (incident) {
    await notifyWebhook(incident)
    await onIncident?.(incident)
  }
}
