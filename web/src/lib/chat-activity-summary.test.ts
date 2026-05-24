import { describe, expect, it } from 'vitest'
import {
  buildChatActivitySummary,
  resolveSummaryPeriodRange,
  summaryPeriodLabel,
} from './chat-activity-summary'
import type { ForensicIncident } from '@/types/forensic'

const now = new Date('2026-05-24T12:00:00Z')
const faceCtx = {
  faceProfiles: [],
  faceSettings: {
    enabled: false,
    minConfidence: 0.7,
    alertOnUnknown: false,
    cameraIds: [],
    consentAcknowledgedAt: null,
  },
}

const incidents: ForensicIncident[] = [
  {
    id: 'a',
    title: 'Person on driveway (after quiet hours)',
    cameraId: 'cam-1',
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
    id: 'b',
    title: 'Vehicle at entry',
    cameraId: 'cam-2',
    cameraName: 'Entry',
    severity: 'low',
    status: 'closed',
    occurredAt: '2026-05-18T08:00:00Z',
    ruleName: 'Vehicle — daytime',
    clipStartAt: '2026-05-18T07:50:00Z',
    clipEndAt: '2026-05-18T08:10:00Z',
    durationSec: 1200,
  },
  {
    id: 'c',
    title: 'Person — garage (no response)',
    cameraId: 'cam-garage',
    cameraName: 'Garage',
    severity: 'high',
    status: 'open',
    occurredAt: '2026-05-20T02:00:00Z',
    ruleName: 'Night — garage',
    clipStartAt: '2026-05-20T01:45:00Z',
    clipEndAt: '2026-05-20T02:15:00Z',
    durationSec: 1800,
  },
]

describe('buildChatActivitySummary', () => {
  it('includes only anomalies and serious alarms for selected period', () => {
    const text = buildChatActivitySummary({
      displayName: 'Admin',
      sinceLastLogin: '2026-05-23T12:00:00Z',
      periodDays: 1,
      incidents,
      cameras: [],
      ...faceCtx,
      now,
    })

    expect(text).toContain('Welcome back, Admin')
    expect(text).toContain('Since last sign-in')
    expect(text).toContain('Person on driveway')
    expect(text).not.toContain('Vehicle at entry')
    expect(text).not.toContain('Last 7 days')
  })

  it('shows 7-day window when period is 7', () => {
    const text = buildChatActivitySummary({
      displayName: 'Admin',
      sinceLastLogin: '2026-05-23T12:00:00Z',
      periodDays: 7,
      incidents,
      cameras: [],
      ...faceCtx,
      now,
    })

    expect(text).toContain('Last 7 days')
    expect(text).toContain('Person — garage')
    expect(text).not.toContain('Vehicle at entry')
  })

  it('uses 24h fallback on first visit for 1-day period', () => {
    const text = buildChatActivitySummary({
      displayName: 'Admin',
      sinceLastLogin: null,
      periodDays: 1,
      incidents,
      cameras: [],
      ...faceCtx,
      now,
    })

    expect(text).toContain('Last 24 hours (first visit)')
  })

  it('reports empty period text', () => {
    const text = buildChatActivitySummary({
      displayName: 'Admin',
      sinceLastLogin: '2026-05-23T12:00:00Z',
      periodDays: 1,
      incidents: [incidents[1]],
      cameras: [],
      ...faceCtx,
      now,
    })

    expect(text).toContain('No anomalies or serious alarms since your last sign-in')
  })
})

describe('resolveSummaryPeriodRange', () => {
  it('uses since last login for 1-day period when available', () => {
    const { start } = resolveSummaryPeriodRange(1, '2026-05-23T12:00:00Z', now)
    expect(start.toISOString()).toBe('2026-05-23T12:00:00.000Z')
  })

  it('uses rolling days for 7 and 30', () => {
    const { start: weekStart } = resolveSummaryPeriodRange(7, '2026-05-23T12:00:00Z', now)
    expect(weekStart.getTime()).toBe(now.getTime() - 7 * 24 * 3600_000)
    expect(summaryPeriodLabel(30, null)).toBe('Last 30 days')
  })
})
