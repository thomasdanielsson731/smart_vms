import { describe, expect, it } from 'vitest'
import {
  isTimelineLive,
  LIVE_POSITION_THRESHOLD,
  positionFromIncident,
  timeAtPosition,
} from './timeline-unified'
import type { ForensicIncident } from '@/types/forensic'

describe('timeline-unified', () => {
  const start = new Date('2026-05-23T00:00:00Z')
  const end = new Date('2026-05-24T00:00:00Z')
  const incident: ForensicIncident = {
    id: 'inc-test',
    title: 'Test',
    cameraId: 'cam-1',
    cameraName: 'Cam',
    severity: 'low',
    status: 'open',
    occurredAt: '2026-05-23T12:00:00Z',
    clipStartAt: '2026-05-23T11:50:00Z',
    clipEndAt: '2026-05-23T12:10:00Z',
    durationSec: 1200,
  }

  it('treats far-right scrub as live', () => {
    expect(isTimelineLive(100)).toBe(true)
    expect(isTimelineLive(LIVE_POSITION_THRESHOLD)).toBe(true)
    expect(isTimelineLive(LIVE_POSITION_THRESHOLD - 1)).toBe(false)
  })

  it('maps incident time to timeline position', () => {
    const pos = positionFromIncident(incident, start, end)
    expect(pos).toBeGreaterThan(40)
    expect(pos).toBeLessThan(60)
    expect(pos).toBeLessThan(LIVE_POSITION_THRESHOLD)
  })

  it('maps position back to wall time within range', () => {
    const mid = timeAtPosition(50, start, end)
    expect(mid.getTime()).toBeGreaterThan(start.getTime())
    expect(mid.getTime()).toBeLessThan(end.getTime())
  })
})
