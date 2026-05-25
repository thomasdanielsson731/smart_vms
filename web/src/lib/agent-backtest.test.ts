import { describe, expect, it } from 'vitest'
import {
  incidentMatchesAgentRule,
  isWithinQuietHours,
  runAgentBacktest,
} from './agent-backtest'
import type { ForensicIncident } from '@/types/forensic'

const now = new Date('2026-05-24T12:00:00Z')

const incidents: ForensicIncident[] = [
  {
    id: '1',
    title: 'Person on driveway',
    cameraId: 'cam-a',
    cameraName: 'Driveway',
    severity: 'medium',
    status: 'open',
    occurredAt: '2026-05-24T11:00:00Z',
    ruleName: 'Zone — driveway night',
    clipStartAt: '2026-05-24T10:50:00Z',
    clipEndAt: '2026-05-24T11:10:00Z',
    durationSec: 1200,
  },
  {
    id: '2',
    title: 'Vehicle at entry',
    cameraId: 'cam-b',
    cameraName: 'Entry',
    severity: 'low',
    status: 'closed',
    occurredAt: '2026-05-23T08:00:00Z',
    ruleName: 'Vehicle — daytime',
    clipStartAt: '2026-05-23T07:50:00Z',
    clipEndAt: '2026-05-23T08:10:00Z',
    durationSec: 1200,
  },
  {
    id: '3',
    title: 'VAPIX: motion (pre-filter)',
    cameraId: 'cam-a',
    cameraName: 'Driveway',
    severity: 'low',
    status: 'closed',
    occurredAt: '2026-05-24T03:00:00Z',
    ruleName: 'Axis motion',
    clipStartAt: '2026-05-24T02:55:00Z',
    clipEndAt: '2026-05-24T03:05:00Z',
    durationSec: 600,
  },
]

describe('isWithinQuietHours', () => {
  it('detects overnight quiet window in local time', () => {
    const late = new Date()
    late.setHours(23, 30, 0, 0)
    const afternoon = new Date()
    afternoon.setHours(14, 0, 0, 0)
    expect(isWithinQuietHours(late.toISOString(), '22:00–06:00')).toBe(true)
    expect(isWithinQuietHours(afternoon.toISOString(), '22:00–06:00')).toBe(false)
  })
})

describe('incidentMatchesAgentRule', () => {
  it('matches person trigger on driveway camera', () => {
    const result = incidentMatchesAgentRule(incidents[0], {
      cameraIds: ['cam-a'],
      trigger: 'person',
      zoneName: 'driveway',
      severity: 'medium',
    })
    expect(result.matched).toBe(true)
  })

  it('rejects wrong camera', () => {
    const result = incidentMatchesAgentRule(incidents[0], {
      cameraIds: ['cam-b'],
      trigger: 'person',
      severity: 'medium',
    })
    expect(result.matched).toBe(false)
  })
})

describe('runAgentBacktest', () => {
  it('returns hits for matching person rule in 24h window', () => {
    const result = runAgentBacktest(
      {
        cameraIds: ['cam-a'],
        trigger: 'person',
        zoneName: 'driveway',
        severity: 'medium',
      },
      incidents,
      '24h',
      now,
    )
    expect(result.matchedCount).toBe(1)
    expect(result.hits[0].incidentId).toBe('1')
  })

  it('includes motion events for vapix_motion trigger', () => {
    const result = runAgentBacktest(
      { cameraIds: ['cam-a'], trigger: 'vapix_motion', severity: 'low' },
      incidents,
      '24h',
      now,
    )
    expect(result.matchedCount).toBe(1)
    expect(result.hits[0].incidentId).toBe('3')
  })
})
