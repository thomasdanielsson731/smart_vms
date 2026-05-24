import { describe, expect, it } from 'vitest'
import {
  buildChatActivitySummary,
  resolveSummaryPeriodRange,
  summaryPeriodLabel,
} from './chat-activity-summary'
import type { ForensicIncident } from '@/types/forensic'
import type { Camera } from '@/types/camera'

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

const cameras: Camera[] = [
  {
    id: 'cam-offline',
    name: 'Garden',
    host: '192.168.1.52',
    model: 'P1465',
    firmware: '10.0',
    location: 'Garden',
    status: 'offline',
    streamProfile: 'main',
    recordingEnabled: true,
    lastSeenAt: null,
  },
]

function summary(periodDays: 1 | 7 | 30, sinceLastLogin: string | null = '2026-05-23T12:00:00Z') {
  return buildChatActivitySummary({
    displayName: 'Admin',
    sinceLastLogin,
    periodDays,
    incidents,
    cameras: periodDays === 1 ? [] : cameras,
    ...faceCtx,
    now,
  })
}

describe('buildChatActivitySummary — period tags', () => {
  it('shows since last sign-in for 1-day period', () => {
    const text = summary(1)
    expect(text).toContain('Since last sign-in')
    expect(text).toContain('Person on driveway')
    expect(text).not.toContain('Vehicle at entry')
  })

  it('shows 7-day window', () => {
    const text = summary(7)
    expect(text).toContain('Last 7 days')
    expect(text).toContain('Person — garage')
  })

  it('shows 30-day window', () => {
    const text = summary(30)
    expect(text).toContain('Last 30 days')
    expect(text).toContain('Person — garage')
  })

  it('uses 24h fallback on first visit', () => {
    const text = summary(1, null)
    expect(text).toContain('Last 24 hours (first visit)')
  })

  it('reports empty period when nothing notable', () => {
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

  it('includes offline camera infrastructure note', () => {
    const text = buildChatActivitySummary({
      displayName: 'Admin',
      sinceLastLogin: '2026-05-23T12:00:00Z',
      periodDays: 7,
      incidents: [],
      cameras,
      ...faceCtx,
      now,
    })
    expect(text).toContain('Infrastructure')
    expect(text).toContain('Garden')
    expect(text).toContain('offline')
  })
})

describe('resolveSummaryPeriodRange', () => {
  it('uses since last login for 1-day period when available', () => {
    const { start, end } = resolveSummaryPeriodRange(1, '2026-05-23T12:00:00Z', now)
    expect(start.toISOString()).toBe('2026-05-23T12:00:00.000Z')
    expect(end).toEqual(now)
  })

  it('uses rolling 24h when no previous login', () => {
    const { start } = resolveSummaryPeriodRange(1, null, now)
    expect(start.getTime()).toBe(now.getTime() - 24 * 3600_000)
  })

  it('uses rolling windows for 7 and 30 days', () => {
    const week = resolveSummaryPeriodRange(7, '2026-05-23T12:00:00Z', now)
    const month = resolveSummaryPeriodRange(30, '2026-05-23T12:00:00Z', now)
    expect(week.start.getTime()).toBe(now.getTime() - 7 * 24 * 3600_000)
    expect(month.start.getTime()).toBe(now.getTime() - 30 * 24 * 3600_000)
  })
})

describe('summaryPeriodLabel', () => {
  it('labels all normal periods', () => {
    expect(summaryPeriodLabel(1, '2026-05-23T12:00:00Z')).toContain('Since last sign-in')
    expect(summaryPeriodLabel(1, null)).toBe('Last 24 hours (first visit)')
    expect(summaryPeriodLabel(7, null)).toBe('Last 7 days')
    expect(summaryPeriodLabel(30, null)).toBe('Last 30 days')
  })
})
