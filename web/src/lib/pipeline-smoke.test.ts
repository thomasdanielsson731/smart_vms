import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runPipelineSmokeTest } from '@/lib/pipeline-smoke'

describe('runPipelineSmokeTest', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fails fast when server health is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 503 }),
    )
    const result = await runPipelineSmokeTest()
    expect(result.ok).toBe(false)
    expect(result.steps[0]?.name).toBe('server_health')
  })

  it('passes when ingest and incidents query succeed', async () => {
    let smokeMarker = ''
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
      if (url.includes('/api/vms/health/system')) {
        return Response.json({
          ok: true,
          mqttConnected: true,
          eventsIngestedTotal: 1,
        })
      }
      if (url.includes('/api/vms/events/ingest') && init?.method === 'POST') {
        const body = JSON.parse(String(init.body)) as { payload?: { smoke_marker?: string; title?: string } }
        smokeMarker = body.payload?.smoke_marker ?? body.payload?.title?.split(' ').pop() ?? ''
        return new Response('', { status: 202 })
      }
      if (url.includes('/api/vms/incidents')) {
        return Response.json({
          incidents: [
            {
              id: 'inc-1',
              title: `UI pipeline smoke ${smokeMarker}`,
              cameraId: 'cam-pipeline-smoke',
              cameraName: 'Pipeline Smoke Camera',
              severity: 'medium',
              status: 'open',
              occurredAt: new Date().toISOString(),
              clipStartAt: new Date().toISOString(),
              clipEndAt: new Date().toISOString(),
              durationSec: 30,
            },
          ],
        })
      }
      return new Response('', { status: 404 })
    })

    const result = await runPipelineSmokeTest()
    expect(result.ok).toBe(true)
    expect(result.steps.map((s) => s.name)).toEqual([
      'server_health',
      'http_ingest',
      'dashboard_incidents',
    ])
  })
})
