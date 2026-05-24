import { describe, expect, it } from 'vitest'
import {
  cameraHostForIncident,
  filterIncidentsInRange,
  mockRecordingSegments,
  rangeToMs,
} from './mock-forensic'
import type { ForensicIncident } from '@/types/forensic'

const incidents: ForensicIncident[] = [
  {
    id: 'a',
    title: 'Recent',
    cameraId: 'cam-driveway',
    cameraName: 'Driveway',
    severity: 'medium',
    status: 'open',
    occurredAt: '2026-05-24T11:00:00Z',
    clipStartAt: '2026-05-24T10:50:00Z',
    clipEndAt: '2026-05-24T11:10:00Z',
    durationSec: 1200,
  },
  {
    id: 'b',
    title: 'Older entry',
    cameraId: 'cam-entry',
    cameraName: 'Entry',
    severity: 'low',
    status: 'closed',
    occurredAt: '2026-05-20T08:00:00Z',
    clipStartAt: '2026-05-20T07:50:00Z',
    clipEndAt: '2026-05-20T08:10:00Z',
    durationSec: 1200,
  },
]

describe('rangeToMs', () => {
  it('maps forensic ranges to milliseconds', () => {
    expect(rangeToMs('24h')).toBe(24 * 3600_000)
    expect(rangeToMs('48h')).toBe(48 * 3600_000)
    expect(rangeToMs('7d')).toBe(7 * 24 * 3600_000)
  })
})

describe('filterIncidentsInRange', () => {
  const start = new Date('2026-05-23T00:00:00Z')
  const end = new Date('2026-05-24T12:00:00Z')

  it('returns incidents within range sorted newest first', () => {
    const result = filterIncidentsInRange(incidents, start, end, null)
    expect(result.map((i) => i.id)).toEqual(['a'])
  })

  it('filters by camera when cameraId is set', () => {
    const all = filterIncidentsInRange(
      incidents,
      new Date('2026-05-19T00:00:00Z'),
      end,
      'cam-entry',
    )
    expect(all.map((i) => i.id)).toEqual(['b'])
  })

  it('excludes incidents outside time window', () => {
    const result = filterIncidentsInRange(
      incidents,
      new Date('2026-05-24T12:00:00Z'),
      new Date('2026-05-24T13:00:00Z'),
      null,
    )
    expect(result).toHaveLength(0)
  })
})

describe('mockRecordingSegments', () => {
  it('creates one segment per camera except garage', () => {
    const start = new Date('2026-05-23T00:00:00Z')
    const end = new Date('2026-05-24T00:00:00Z')
    const segments = mockRecordingSegments(start, end, [
      'cam-driveway',
      'cam-entry',
      'cam-garage',
    ])
    expect(segments).toHaveLength(2)
    expect(segments.every((s) => s.startAt === start.toISOString())).toBe(true)
    expect(segments.some((s) => s.cameraId === 'cam-garage')).toBe(false)
  })
})

describe('cameraHostForIncident', () => {
  it('returns host for matching camera id', () => {
    const host = cameraHostForIncident(
      { cameraId: 'cam-driveway' },
      [{ id: 'cam-driveway', host: '192.168.1.51' }],
    )
    expect(host).toBe('192.168.1.51')
  })

  it('returns undefined when camera is missing', () => {
    expect(cameraHostForIncident({ cameraId: 'cam-missing' }, [])).toBeUndefined()
  })
})
