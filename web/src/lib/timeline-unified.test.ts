import { describe, expect, it } from 'vitest'
import {
  isTimelineLive,
  LIVE_POSITION_THRESHOLD,
  positionFromIncident,
  timeAtPosition,
} from './timeline-unified'
import type { ForensicIncident } from '@/types/forensic'

describe('timeline-unified — live threshold', () => {
  it('treats far-right scrub as live', () => {
    expect(isTimelineLive(100)).toBe(true)
    expect(isTimelineLive(LIVE_POSITION_THRESHOLD)).toBe(true)
    expect(isTimelineLive(LIVE_POSITION_THRESHOLD - 1)).toBe(false)
    expect(isTimelineLive(0)).toBe(false)
  })
})

describe('timeline-unified — incident positioning', () => {
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

  it('maps midday incident to middle of recorded range', () => {
    const pos = positionFromIncident(incident, start, end)
    expect(pos).toBeGreaterThan(40)
    expect(pos).toBeLessThan(60)
    expect(pos).toBeLessThan(LIVE_POSITION_THRESHOLD)
  })

  it('maps start-of-range incident near zero', () => {
    const early = { ...incident, occurredAt: start.toISOString() }
    expect(positionFromIncident(early, start, end)).toBe(0)
  })

  it('clamps end-of-range incident below live threshold', () => {
    const late = { ...incident, occurredAt: end.toISOString() }
    expect(positionFromIncident(late, start, end)).toBe(LIVE_POSITION_THRESHOLD - 1)
  })
})

describe('timeline-unified — time at position', () => {
  const start = new Date('2026-05-23T00:00:00Z')
  const end = new Date('2026-05-24T00:00:00Z')

  it('maps scrub positions to wall time within range', () => {
    const mid = timeAtPosition(50, start, end)
    expect(mid.getTime()).toBeGreaterThan(start.getTime())
    expect(mid.getTime()).toBeLessThan(end.getTime())
  })

  it('maps position zero to range start', () => {
    expect(timeAtPosition(0, start, end).getTime()).toBe(start.getTime())
  })
})
