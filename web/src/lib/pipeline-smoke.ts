import { fetchIncidents, ingestEvent } from '@/lib/incidents-api'
import { fetchSystemHealth } from '@/lib/system-health-api'

export interface PipelineSmokeStep {
  name: string
  ok: boolean
  detail?: string
}

export interface PipelineSmokeResult {
  ok: boolean
  marker: string
  steps: PipelineSmokeStep[]
  incidentId?: string
}

function stableSmokeId(marker: string): string {
  return `smoke-ui-${marker.slice(-24)}`
}

export async function runPipelineSmokeTest(): Promise<PipelineSmokeResult> {
  const marker = `ui-smoke-${Date.now()}`
  const steps: PipelineSmokeStep[] = []
  const now = new Date().toISOString()

  const health = await fetchSystemHealth()
  if (!health) {
    steps.push({
      name: 'server_health',
      ok: false,
      detail: 'Phase 3 server unreachable — set SMARTVMS_SERVER_URL and start compose',
    })
    return { ok: false, marker, steps }
  }
  steps.push({
    name: 'server_health',
    ok: true,
    detail: `mqtt=${health.mqttConnected} events=${health.eventsIngestedTotal}`,
  })

  const event = {
    schema_version: '1.0',
    event_id: stableSmokeId(marker),
    event_type: 'vapix.received',
    occurred_at: now,
    source: {
      camera_id: 'cam-pipeline-smoke',
      software_version: 'web-pipeline-smoke/1.0',
    },
    payload: {
      title: `UI pipeline smoke ${marker}`,
      rule_name: 'pipeline.smoke.ui',
      camera_name: 'Pipeline Smoke Camera',
      vapix_event_key: marker,
      severity: 'medium',
      smoke_marker: marker,
    },
  }

  const ingested = await ingestEvent(event)
  if (!ingested) {
    steps.push({ name: 'http_ingest', ok: false, detail: 'POST /api/vms/events/ingest failed' })
    return { ok: false, marker, steps }
  }
  steps.push({ name: 'http_ingest', ok: true, detail: 'Event accepted' })

  await new Promise((r) => setTimeout(r, 400))

  const incidents = await fetchIncidents({ q: marker, range: '7d' })
  const hit = incidents.find((i) => i.title.includes(marker))
  if (!hit) {
    steps.push({ name: 'dashboard_incidents', ok: false, detail: 'Incident not visible in UI poll' })
    return { ok: false, marker, steps }
  }

  steps.push({ name: 'dashboard_incidents', ok: true, detail: hit.title })
  return { ok: true, marker, steps, incidentId: hit.id }
}
